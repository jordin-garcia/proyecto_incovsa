import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { verifyPassword } from "better-auth/crypto";
import { prisma } from "@/lib/prisma";
import { claveAccesoInterna, correoInterno } from "@/lib/cuentas";
import { ErrorNegocio } from "@/lib/errores";
import { ErrorAcceso } from "@/modulos/permisos/servicio";
import { iniciarSesion } from "@/app/acceso/servicio";
import { consultarOpciones } from "@/modulos/envios/opciones";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import type { SesionActual } from "@/lib/sesion";
import { esquemaCrearUsuarioPicking, esquemaEditarUsuarioPicking, type EntradaCrearUsuario } from "./esquemas";
import {
  MENSAJE_CUENTA_TOTAL,
  MENSAJE_NOMBRE_COMPARTIDO,
  MENSAJE_PROPIA_CUENTA,
  crearUsuario,
  editarUsuario,
  eliminarUsuario,
  listarUsuariosDelPicking,
  mensajeYaExiste,
  restablecerClave,
  type ContextoUsuario,
} from "./servicio";

const CLAVE = "Clave-prueba-1";
const CLAVE_NUEVA = "Clave-nueva-99";

describe("usuarios del picking", () => {
  let actorId: string;
  let quetzaltenango: number;
  let guatemala: number;
  let contexto: ContextoUsuario;

  beforeEach(async () => {
    await limpiarTablasDeNegocio();
    actorId = randomUUID();
    const username = claveAccesoInterna("ambos", "actor.prueba");
    await prisma.usuario.create({
      data: {
        id: actorId,
        name: "Gerencia de prueba",
        email: correoInterno(username),
        username,
        displayUsername: "actor.prueba",
        sistema: "ambos",
        rol: "Gerencia",
        cuentas: {
          create: {
            id: randomUUID(),
            accountId: actorId,
            providerId: "credential",
            password: "hash-no-usado",
          },
        },
      },
    });
    quetzaltenango = (await prisma.sede.findUniqueOrThrow({ where: { prefijoOdoo: "XE" } })).id;
    guatemala = (await prisma.sede.findUniqueOrThrow({ where: { prefijoOdoo: "GT" } })).id;
    contexto = { actorId, actorRol: "Gerencia", sistema: "picking" };
  });

  function entrada(parcial: Partial<EntradaCrearUsuario> = {}): EntradaCrearUsuario {
    return esquemaCrearUsuarioPicking.parse({
      nombre: "Ana Bodega",
      usuario: "ana.bodega",
      clave: CLAVE,
      confirmarClave: CLAVE,
      rol: "Bodega",
      correo: "",
      sedesIds: [quetzaltenango],
      permisosCodigos: ["pk.bodega"],
      ...parcial,
    });
  }

  function edicion(id: string, parcial: Record<string, unknown> = {}) {
    return esquemaEditarUsuarioPicking.parse({
      id,
      nombre: "Ana Bodega",
      rol: "Bodega",
      correo: "",
      sedesIds: [quetzaltenango],
      permisosCodigos: ["pk.bodega"],
      activo: true,
      ...parcial,
    });
  }

  async function bitacora(operacion: string) {
    return prisma.bitacora.findFirstOrThrow({ where: { operacion, usuarioId: actorId }, orderBy: { id: "desc" } });
  }

  function cabeceras() {
    return new Headers({ "x-real-ip": "203.0.113.40" });
  }

  it("RF-SL-03 / RF-SL-56 / RF-SL-66: crea un usuario de Bodega con Quetzaltenango y pk.bodega", async () => {
    const creado = await crearUsuario(entrada(), contexto);
    expect(creado).toMatchObject({
      nombre: "Ana Bodega",
      usuario: "ana.bodega",
      rol: "Bodega",
      sistema: "picking",
      activo: true,
      accesoTotal: false,
      sedesIds: [quetzaltenango],
      sedesNombres: ["Quetzaltenango"],
      permisosCodigos: ["pk.bodega"],
      correo: null,
    });
    expect(JSON.stringify(creado)).not.toContain(CLAVE);

    const fila = await prisma.usuario.findUniqueOrThrow({
      where: { id: creado.id },
      include: { cuentas: true, permisos: { include: { permiso: true } }, sedes: true },
    });
    expect(fila.username).toBe("picking.ana.bodega");
    expect(fila.email).toBe(correoInterno("picking.ana.bodega"));
    expect(fila.cuentas[0]?.password).not.toBe(CLAVE);
    expect(await verifyPassword({ hash: fila.cuentas[0]!.password!, password: CLAVE })).toBe(true);
    expect(fila.permisos.map((permiso) => permiso.permiso.codigo)).toEqual(["pk.bodega"]);
    expect(fila.sedes.map((sede) => sede.sedeId)).toEqual([quetzaltenango]);

    const lista = await listarUsuariosDelPicking();
    expect(lista.map((usuario) => usuario.usuario)).toContain("ana.bodega");
    expect((await bitacora("Creación de usuario")).detalle).toMatchObject({
      resumen: "Picking · ana.bodega · rol Bodega · con contraseña · permisos: pk.bodega · sedes: Quetzaltenango",
    });
    expect(JSON.stringify((await bitacora("Creación de usuario")).detalle)).not.toContain(CLAVE);

    const ingreso = await iniciarSesion({ sistema: "picking", usuario: "ana.bodega", clave: CLAVE }, cabeceras());
    expect(ingreso.ok).toBe(true);
    if (ingreso.ok) expect(ingreso.destino).toBe("/picking/bodega");
  });

  it("RN-54: repite el nombre del sitio, rechaza el de Gerencia y reserva el del picking eliminado", async () => {
    const sitio = randomUUID();
    const claveSitio = claveAccesoInterna("sitio", "maria.argueta");
    await prisma.usuario.create({
      data: {
        id: sitio,
        name: "María Sitio",
        email: correoInterno(claveSitio),
        username: claveSitio,
        displayUsername: "maria.argueta",
        sistema: "sitio",
        rol: "Administrativo",
      },
    });
    const picking = await crearUsuario(entrada({ usuario: "maria.argueta", nombre: "María Picking" }), contexto);
    expect(picking.sistema).toBe("picking");
    expect(
      (await prisma.usuario.findMany({ where: { displayUsername: "maria.argueta" } }))
        .map((fila) => fila.sistema)
        .sort(),
    ).toEqual(["picking", "sitio"]);

    await expect(
      editarUsuario(edicion(picking.id, { rol: "Gerencia", sedesIds: [], permisosCodigos: [] }), contexto),
    ).rejects.toThrow(MENSAJE_NOMBRE_COMPARTIDO);

    const jefe = await crearUsuario(
      entrada({ usuario: "jefe.nuevo", nombre: "Jefe", rol: "Gerencia", sedesIds: [], permisosCodigos: ["pk.bodega"] }),
      contexto,
    );
    expect(jefe).toMatchObject({ sistema: "ambos", accesoTotal: true, sedesIds: [], permisosCodigos: [] });
    expect((await prisma.usuario.findUniqueOrThrow({ where: { id: jefe.id } })).username).toBe("ambos.jefe.nuevo");
    await expect(crearUsuario(entrada({ usuario: "jefe.nuevo", nombre: "Otro" }), contexto)).rejects.toThrow(
      mensajeYaExiste("picking"),
    );

    await expect(
      crearUsuario(entrada({ usuario: "maria.sitio", nombre: "Otra", rol: "Soporte", sedesIds: [] }), {
        ...contexto,
        actorRol: "Soporte",
      }),
    ).resolves.toMatchObject({ sistema: "ambos" });
    const sitioTotal = randomUUID();
    const claveAna = claveAccesoInterna("sitio", "ana.sitio");
    await prisma.usuario.create({
      data: {
        id: sitioTotal,
        name: "Ana Sitio",
        email: correoInterno(claveAna),
        username: claveAna,
        displayUsername: "ana.sitio",
        sistema: "sitio",
        rol: "Administrativo",
      },
    });
    await expect(
      crearUsuario(entrada({ usuario: "ana.sitio", rol: "Gerencia", sedesIds: [], permisosCodigos: [] }), contexto),
    ).rejects.toThrow(MENSAJE_CUENTA_TOTAL);

    await expect(crearUsuario(entrada({ usuario: "ana.bodega" }), contexto)).resolves.toMatchObject({
      usuario: "ana.bodega",
    });
    await expect(crearUsuario(entrada({ usuario: "ANA.BODEGA" }), contexto)).rejects.toThrow(
      mensajeYaExiste("picking"),
    );

    const borrado = await crearUsuario(entrada({ usuario: "reservado.pk", nombre: "Reservado" }), contexto);
    await eliminarUsuario({ id: borrado.id }, contexto);
    await expect(crearUsuario(entrada({ usuario: "reservado.pk", nombre: "Otro" }), contexto)).rejects.toThrow(
      mensajeYaExiste("picking"),
    );
  });

  it("RF-SL-48: restablecer rechaza claves inválidas, aplica la nueva y cierra las sesiones", async () => {
    const creado = await crearUsuario(entrada(), contexto);
    await prisma.sesion.create({
      data: {
        id: randomUUID(),
        token: randomUUID(),
        expiresAt: new Date(Date.now() + 86_400_000),
        userId: creado.id,
      },
    });
    const hashAntes = (await prisma.cuenta.findFirstOrThrow({ where: { userId: creado.id } })).password;

    await expect(
      restablecerClave({ id: creado.id, clave: "corta", confirmarClave: "corta" }, contexto),
    ).rejects.toThrow("La contraseña debe tener al menos 8 caracteres.");
    await expect(
      restablecerClave({ id: creado.id, clave: CLAVE_NUEVA, confirmarClave: "Otra-clave-1" }, contexto),
    ).rejects.toThrow("Las dos contraseñas no coinciden.");
    expect((await prisma.cuenta.findFirstOrThrow({ where: { userId: creado.id } })).password).toBe(hashAntes);
    expect(await prisma.sesion.count({ where: { userId: creado.id } })).toBe(1);

    await restablecerClave({ id: creado.id, clave: CLAVE_NUEVA, confirmarClave: CLAVE_NUEVA }, contexto);
    expect(await prisma.sesion.count({ where: { userId: creado.id } })).toBe(0);
    const hash = (await prisma.cuenta.findFirstOrThrow({ where: { userId: creado.id } })).password!;
    expect(hash).not.toBe(CLAVE_NUEVA);
    expect(await verifyPassword({ hash, password: CLAVE_NUEVA })).toBe(true);
    expect(JSON.stringify((await bitacora("Restablecimiento de contraseña")).detalle)).not.toContain(CLAVE_NUEVA);
    expect((await bitacora("Restablecimiento de contraseña")).operacion).toBe("Restablecimiento de contraseña");

    expect((await iniciarSesion({ sistema: "picking", usuario: "ana.bodega", clave: CLAVE }, cabeceras())).ok).toBe(
      false,
    );
    expect(
      (await iniciarSesion({ sistema: "picking", usuario: "ana.bodega", clave: CLAVE_NUEVA }, cabeceras())).ok,
    ).toBe(true);
  });

  it("RF-SL-57: la eliminación es lógica, cierra la sesión, reserva el nombre y conserva la bitácora", async () => {
    const creado = await crearUsuario(entrada({ usuario: "borrar.pk", nombre: "Para borrar" }), contexto);
    await prisma.sesion.create({
      data: {
        id: randomUUID(),
        token: randomUUID(),
        expiresAt: new Date(Date.now() + 86_400_000),
        userId: creado.id,
      },
    });
    await prisma.$transaction(async (tx) => {
      const { registrarBitacora } = await import("@/modulos/bitacora/servicio");
      await registrarBitacora(tx, {
        sistema: "picking",
        operacion: "Inicio de sesión",
        entidad: "usuario",
        registroId: creado.id,
        usuarioId: creado.id,
        detalle: { resumen: "sigue en la bitácora" },
      });
    });

    await expect(eliminarUsuario({ id: actorId }, contexto)).rejects.toThrow(MENSAJE_PROPIA_CUENTA);
    expect((await prisma.usuario.findUniqueOrThrow({ where: { id: actorId } })).eliminadoEn).toBeNull();

    await eliminarUsuario({ id: creado.id }, contexto);
    const fila = await prisma.usuario.findUniqueOrThrow({ where: { id: creado.id } });
    expect(fila.eliminadoEn).not.toBeNull();
    expect(fila.activo).toBe(false);
    expect(fila.name).toBe("Para borrar");
    expect(await prisma.sesion.count({ where: { userId: creado.id } })).toBe(0);
    expect(await prisma.bitacora.count({ where: { registroId: creado.id, operacion: "Inicio de sesión" } })).toBe(1);
    expect((await bitacora("Eliminación de usuario")).detalle).toMatchObject({
      resumen: "Picking · borrar.pk · Para borrar",
    });
    expect((await listarUsuariosDelPicking()).map((usuario) => usuario.id)).not.toContain(creado.id);
    expect((await iniciarSesion({ sistema: "picking", usuario: "borrar.pk", clave: CLAVE }, cabeceras())).ok).toBe(
      false,
    );
  });

  it("RN-46: el rol piloto con espacios aparece en Facturación de su sede", async () => {
    const piloto = await crearUsuario(
      entrada({
        usuario: "piloto.espacio",
        nombre: "Piloto Espacio",
        rol: "piloto ",
        permisosCodigos: ["pk.ruta.propias"],
      }),
      contexto,
    );
    expect(piloto.rol).toBe("piloto");
    await prisma.usuario.update({ where: { id: piloto.id }, data: { rol: "piloto " } });
    const bodega = await crearUsuario(entrada({ usuario: "no.piloto", nombre: "No Piloto", rol: "Bodega" }), contexto);
    const enGuatemala = await crearUsuario(
      entrada({
        usuario: "piloto.gt",
        nombre: "Piloto GT",
        rol: "Piloto",
        sedesIds: [guatemala],
        permisosCodigos: ["pk.ruta.propias"],
      }),
      contexto,
    );
    const sesion: SesionActual = {
      sistema: "picking",
      usuario: { id: actorId, usuario: "actor.prueba", nombre: "Gerencia de prueba", rol: "Facturador" },
      permisos: ["pk.facturacion"],
      sedes: [{ id: quetzaltenango, nombre: "Quetzaltenango", prefijoOdoo: "XE" }],
    };
    const ids = (await consultarOpciones(sesion, quetzaltenango)).pilotos.map((item) => item.id);
    expect(ids).toContain(piloto.id);
    expect(ids).not.toContain(bodega.id);
    expect(ids).not.toContain(enGuatemala.id);
  });

  it("criterio 6: un rol sin acceso total no crea, edita, restablece ni elimina", async () => {
    const ajeno = { ...contexto, actorRol: "Bodega" };
    await expect(crearUsuario(entrada(), ajeno)).rejects.toBeInstanceOf(ErrorAcceso);
    expect(await prisma.usuario.count({ where: { displayUsername: "ana.bodega" } })).toBe(0);
    const creado = await crearUsuario(entrada(), contexto);
    await expect(editarUsuario(edicion(creado.id, { nombre: "Hack" }), ajeno)).rejects.toBeInstanceOf(ErrorAcceso);
    await expect(
      restablecerClave({ id: creado.id, clave: CLAVE_NUEVA, confirmarClave: CLAVE_NUEVA }, ajeno),
    ).rejects.toBeInstanceOf(ErrorAcceso);
    await expect(eliminarUsuario({ id: creado.id }, ajeno)).rejects.toBeInstanceOf(ErrorAcceso);
    expect((await prisma.usuario.findUniqueOrThrow({ where: { id: creado.id } })).name).toBe("Ana Bodega");
    expect((await prisma.usuario.findUniqueOrThrow({ where: { id: creado.id } })).eliminadoEn).toBeNull();
  });

  it("RF-SL-56: editar registra permisos y sedes, desactivar cierra la sesión y Gerencia pasa a ambos", async () => {
    const creado = await crearUsuario(entrada(), contexto);
    await prisma.sesion.create({
      data: {
        id: randomUUID(),
        token: randomUUID(),
        expiresAt: new Date(Date.now() + 86_400_000),
        userId: creado.id,
      },
    });
    await editarUsuario(
      edicion(creado.id, { nombre: "Ana Editada", permisosCodigos: ["pk.bodega", "pk.facturacion", "sit.contenido"] }),
      contexto,
    );
    expect(await prisma.sesion.count({ where: { userId: creado.id } })).toBe(1);
    const detalle = (await bitacora("Edición de usuario")).detalle;
    expect(JSON.stringify(detalle)).toContain("Permisos asignados: pk.facturacion");
    expect(JSON.stringify(detalle)).not.toContain(CLAVE);
    expect(JSON.stringify(detalle)).not.toContain("sit.contenido");

    await editarUsuario(
      edicion(creado.id, { nombre: "Ana Editada", activo: false, sedesIds: [quetzaltenango, guatemala] }),
      contexto,
    );
    expect(await prisma.sesion.count({ where: { userId: creado.id } })).toBe(0);
    expect(JSON.stringify((await bitacora("Edición de usuario")).detalle)).toContain("Sedes asignados: Guatemala");
    expect((await iniciarSesion({ sistema: "picking", usuario: "ana.bodega", clave: CLAVE }, cabeceras())).ok).toBe(
      false,
    );

    const jefe = await crearUsuario(entrada({ usuario: "promovido", nombre: "Promovido", rol: "Bodega" }), contexto);
    const promovido = await editarUsuario(
      edicion(jefe.id, { nombre: "Promovido", rol: "Soporte", sedesIds: [], permisosCodigos: [], activo: true }),
      contexto,
    );
    expect(promovido).toMatchObject({ sistema: "ambos", accesoTotal: true, sedesIds: [], permisosCodigos: [] });
    expect((await prisma.usuario.findUniqueOrThrow({ where: { id: jefe.id } })).username).toBe("ambos.promovido");

    const devuelto = await editarUsuario(
      edicion(jefe.id, { nombre: "Promovido", rol: "Bodega", sedesIds: [guatemala], permisosCodigos: ["pk.bodega"] }),
      contexto,
    );
    expect(devuelto).toMatchObject({
      sistema: "picking",
      accesoTotal: false,
      sedesIds: [guatemala],
      permisosCodigos: ["pk.bodega"],
    });
    expect((await prisma.usuario.findUniqueOrThrow({ where: { id: jefe.id } })).username).toBe("picking.promovido");
  });

  it("RF-SL-66: una sede inexistente no se asigna y el correo opcional se guarda", async () => {
    await expect(crearUsuario({ ...entrada(), sedesIds: [quetzaltenango, 999_999] }, contexto)).rejects.toBeInstanceOf(
      ErrorAcceso,
    );
    await expect(crearUsuario({ ...entrada(), sedesIds: [] }, contexto)).rejects.toBeInstanceOf(ErrorNegocio);
    const creado = await crearUsuario(entrada({ correo: "ana@correo.com", permisosCodigos: ["no.existe"] }), contexto);
    expect(creado.correo).toBe("ana@correo.com");
    expect(creado.permisosCodigos).toEqual([]);
  });
});
