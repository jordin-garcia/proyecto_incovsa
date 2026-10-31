import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { verificarContrasena } from "@/lib/contrasenas";
import { prisma } from "@/lib/prisma";
import { claveAccesoInterna, correoInterno } from "@/lib/cuentas";
import { ErrorNegocio } from "@/lib/errores";
import { ErrorAcceso } from "@/modulos/permisos/servicio";
import { iniciarSesion } from "@/app/acceso/servicio";
import { consultarOpciones } from "@/modulos/envios/opciones";
import { consultarOperaciones, consultarRutas } from "@/modulos/reportes/servicio";
import { fechaGuatemala } from "@/lib/fechas";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import type { SesionActual } from "@/lib/sesion";

// Reportes lee la sesión de la petición (consultarBitacora); solo esa lectura se sustituye.
const estado = vi.hoisted(() => ({ sesion: null as import("@/lib/sesion").SesionActual | null }));
vi.mock("@/lib/sesion", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/sesion")>()),
  obtenerSesion: async () => estado.sesion,
}));
import {
  esquemaCrearUsuarioPicking,
  esquemaCrearUsuarioSitio,
  esquemaEditarUsuarioPicking,
  esquemaEditarUsuarioSitio,
  type EntradaCrearUsuario,
} from "./esquemas";
import {
  MENSAJE_CUENTA_TOTAL,
  MENSAJE_DESACTIVAR_PROPIA_CUENTA,
  MENSAJE_NOMBRE_COMPARTIDO,
  MENSAJE_PROPIA_CUENTA,
  crearUsuario,
  editarUsuario,
  eliminarUsuario,
  listarUsuarios,
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
    estado.sesion = null;
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
    // RNF-03 (V11.4.2): cifrada con la función común, no con el formato anterior de Better Auth.
    expect(fila.cuentas[0]!.password!).toMatch(/^\$scrypt\$N=16384,r=8,p=5\$/);
    expect(await verificarContrasena({ hash: fila.cuentas[0]!.password!, password: CLAVE })).toBe(true);
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
    // RNF-03 (V11.4.2): cifrada con la función común, no con el formato anterior de Better Auth.
    expect(hash).toMatch(/^\$scrypt\$N=16384,r=8,p=5\$/);
    expect(await verificarContrasena({ hash, password: CLAVE_NUEVA })).toBe(true);
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

  it("RF-SL-57 (H-43): al eliminar un piloto, su selección en «Envío por camión» se limpia", async () => {
    const piloto = await crearUsuario(
      entrada({ usuario: "piloto.elegido", nombre: "Piloto Elegido", rol: "Piloto", permisosCodigos: [] }),
      contexto,
    );
    await prisma.opcionEnvio.update({
      where: { sedeId_tipo: { sedeId: quetzaltenango, tipo: "camion" } },
      data: { pilotoId: piloto.id },
    });
    const facturacion: SesionActual = {
      sistema: "picking",
      usuario: { id: actorId, usuario: "actor.prueba", nombre: "Gerencia de prueba", rol: "Facturador" },
      permisos: ["pk.facturacion"],
      sedes: [{ id: quetzaltenango, nombre: "Quetzaltenango", prefijoOdoo: "XE" }],
    };
    const camion = async () =>
      (await consultarOpciones(facturacion, quetzaltenango)).opciones.find((o) => o.tipo === "camion")!;
    expect((await camion()).pilotoId).toBe(piloto.id);

    // La sede de la opción se avisa en tiempo real para que Facturación quite la selección.
    expect(await eliminarUsuario({ id: piloto.id }, contexto)).toEqual({
      id: piloto.id,
      sedesConCambios: [quetzaltenango],
    });

    expect((await camion()).pilotoId).toBeNull();
    expect((await consultarOpciones(facturacion, quetzaltenango)).pilotos.map((p) => p.id)).not.toContain(piloto.id);
  });

  it("RF-SL-57 (H-45): los registros de un usuario eliminado siguen en Reportes con su nombre", async () => {
    const piloto = await crearUsuario(
      entrada({ usuario: "piloto.reportes", nombre: "Piloto De Reportes", rol: "Piloto", permisosCodigos: [] }),
      contexto,
    );
    const hoy = fechaGuatemala(new Date());
    const enRuta = await prisma.estadoEnvio.findUniqueOrThrow({ where: { nombre: "En Ruta" } });
    await prisma.envio.create({
      data: {
        sedeId: quetzaltenango,
        tipo: "ruta",
        numero: 1,
        fechaEnvio: new Date(`${hoy}T00:00:00Z`),
        programadoPara: new Date(`${hoy}T13:30:00-06:00`),
        estadoId: enRuta.id,
        enviadoPorId: actorId,
        pilotoId: piloto.id,
      },
    });
    await prisma.$transaction(async (tx) => {
      const { registrarBitacora } = await import("@/modulos/bitacora/servicio");
      await registrarBitacora(tx, {
        sistema: "picking",
        operacion: "Inicio de sesión",
        entidad: "usuario",
        registroId: piloto.id,
        usuarioId: piloto.id,
        detalle: { resumen: "Sistema de picking" },
      });
    });

    await eliminarUsuario({ id: piloto.id }, contexto);

    const gerencia: SesionActual = {
      sistema: "picking",
      usuario: { id: actorId, usuario: "actor.prueba", nombre: "Gerencia de prueba", rol: "Gerencia" },
      permisos: [],
      sedes: [{ id: quetzaltenango, nombre: "Quetzaltenango", prefijoOdoo: "XE" }],
    };
    estado.sesion = gerencia;
    const periodo = { tipo: "dia", referencia: hoy };
    expect((await consultarRutas(gerencia, quetzaltenango, periodo)).map((r) => r.piloto)).toEqual([
      "Piloto De Reportes",
    ]);
    const operaciones = await consultarOperaciones(gerencia, quetzaltenango, periodo);
    expect(operaciones).toContainEqual(
      expect.objectContaining({ usuario: "Piloto De Reportes", operacion: "Inicio de sesión" }),
    );
  });

  it("D-04: Gerencia o Soporte no pueden desactivar su propia cuenta", async () => {
    await expect(
      editarUsuario(
        edicion(actorId, {
          nombre: "Gerencia de prueba",
          rol: "Gerencia",
          sedesIds: [],
          permisosCodigos: [],
          activo: false,
        }),
        contexto,
      ),
    ).rejects.toThrow(new ErrorNegocio(MENSAJE_DESACTIVAR_PROPIA_CUENTA));
    expect(MENSAJE_DESACTIVAR_PROPIA_CUENTA).toBe("No puede desactivar su propia cuenta.");
    expect((await prisma.usuario.findUniqueOrThrow({ where: { id: actorId } })).activo).toBe(true);
    expect(await prisma.bitacora.count({ where: { operacion: "Edición de usuario", registroId: actorId } })).toBe(0);

    // Sí puede desactivar a otra persona.
    const otra = await crearUsuario(entrada({ usuario: "otra.persona", nombre: "Otra Persona" }), contexto);
    expect((await editarUsuario(edicion(otra.id, { nombre: "Otra Persona", activo: false }), contexto)).activo).toBe(
      false,
    );
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

  function entradaSitio(parcial: Record<string, unknown> = {}) {
    return esquemaCrearUsuarioSitio.parse({
      nombre: "Lector Docs",
      usuario: "lector.docs",
      clave: CLAVE,
      confirmarClave: CLAVE,
      rol: "Operativo",
      correo: "",
      sedesIds: [],
      permisosCodigos: ["sit.doc.ver"],
      ...parcial,
    });
  }

  it("RF-SW-13: crea un usuario del sitio con solo sit.doc.ver, sin sedes ni descarga", async () => {
    const sitio = { ...contexto, sistema: "sitio" as const };
    const creado = await crearUsuario(
      entradaSitio({ permisosCodigos: ["sit.doc.ver", "sit.doc.descargar", "pk.bodega"] }),
      sitio,
    );
    expect(creado).toMatchObject({
      usuario: "lector.docs",
      sistema: "sitio",
      sedesIds: [],
      sedesNombres: [],
      permisosCodigos: ["sit.doc.descargar", "sit.doc.ver"],
    });
    expect(creado.permisosCodigos).not.toContain("pk.bodega");
    const soloVer = await crearUsuario(
      entradaSitio({ usuario: "solo.ver", nombre: "Solo ver", permisosCodigos: ["sit.doc.ver"] }),
      sitio,
    );
    expect(soloVer.permisosCodigos).toEqual(["sit.doc.ver"]);
    expect((await listarUsuarios("sitio")).map((usuario) => usuario.usuario)).toEqual(
      expect.arrayContaining(["lector.docs", "solo.ver"]),
    );
    expect((await listarUsuarios("picking")).map((usuario) => usuario.usuario)).not.toContain("solo.ver");
    const ingreso = await iniciarSesion({ sistema: "sitio", usuario: "solo.ver", clave: CLAVE }, cabeceras());
    expect(ingreso.ok).toBe(true);
    if (ingreso.ok) expect(ingreso.destino).toBe("/panel/documentos");
    expect(JSON.stringify((await bitacora("Creación de usuario")).detalle)).not.toContain(CLAVE);
    expect((await bitacora("Creación de usuario")).detalle).toMatchObject({
      resumen: expect.stringContaining("Sitio web · solo.ver"),
    });
  });

  it("RN-54: el sitio repite un nombre del picking y rechaza el de Gerencia", async () => {
    await crearUsuario(entrada({ usuario: "ana.bodega" }), contexto);
    const sitio = { ...contexto, sistema: "sitio" as const };
    const repetido = await crearUsuario(entradaSitio({ usuario: "ana.bodega", nombre: "Ana Sitio" }), sitio);
    expect(repetido).toMatchObject({ usuario: "ana.bodega", sistema: "sitio" });
    expect((await prisma.usuario.findUniqueOrThrow({ where: { id: repetido.id } })).username).toBe("sitio.ana.bodega");
    await expect(crearUsuario(entradaSitio({ usuario: "actor.prueba" }), sitio)).rejects.toThrow(
      mensajeYaExiste("sitio"),
    );
    await crearUsuario(entrada({ usuario: "pedro.ruta", nombre: "Pedro Ruta" }), contexto);
    await expect(crearUsuario(entradaSitio({ usuario: "pedro.ruta", rol: "Gerencia" }), sitio)).rejects.toThrow(
      MENSAJE_CUENTA_TOTAL,
    );
  });

  it("RF-SW-11 / RN-47: restablecer en el sitio cambia la clave, cierra la sesión y no guarda la contraseña", async () => {
    const sitio = { ...contexto, sistema: "sitio" as const };
    const creado = await crearUsuario(entradaSitio(), sitio);
    await prisma.sesion.create({
      data: { id: randomUUID(), userId: creado.id, token: "token-sitio", expiresAt: new Date(Date.now() + 60_000) },
    });
    await restablecerClave({ id: creado.id, clave: CLAVE_NUEVA, confirmarClave: CLAVE_NUEVA }, sitio);
    const fila = await prisma.usuario.findUniqueOrThrow({ where: { id: creado.id }, include: { cuentas: true } });
    // RNF-03 (V11.4.2): cifrada con la función común, no con el formato anterior de Better Auth.
    expect(fila.cuentas[0]!.password!).toMatch(/^\$scrypt\$N=16384,r=8,p=5\$/);
    expect(await verificarContrasena({ hash: fila.cuentas[0]!.password!, password: CLAVE_NUEVA })).toBe(true);
    expect(await prisma.sesion.count({ where: { userId: creado.id } })).toBe(0);
    const detalle = JSON.stringify((await bitacora("Restablecimiento de contraseña")).detalle);
    expect(detalle).not.toContain(CLAVE_NUEVA);
    expect(detalle).toContain("Sitio web");
    const editado = await editarUsuario(
      esquemaEditarUsuarioSitio.parse({
        id: creado.id,
        nombre: "Lector Docs",
        rol: "Operativo",
        correo: "lector@correo.com",
        sedesIds: [quetzaltenango],
        permisosCodigos: ["sit.doc.ver"],
        activo: false,
      }),
      sitio,
    );
    expect(editado.sedesIds).toEqual([]);
    expect(editado.correo).toBe("lector@correo.com");
    expect(editado.activo).toBe(false);

    const jefe = await crearUsuario(entradaSitio({ usuario: "jefe.sitio", nombre: "Jefe", rol: "Gerencia" }), sitio);
    expect(jefe).toMatchObject({ sistema: "ambos", accesoTotal: true });
    await prisma.usuarioSede.create({ data: { usuarioId: jefe.id, sedeId: quetzaltenango } });
    const degradado = await editarUsuario(
      esquemaEditarUsuarioSitio.parse({
        id: jefe.id,
        nombre: "Jefe",
        rol: "Operativo",
        correo: "",
        sedesIds: [],
        permisosCodigos: ["sit.doc.ver"],
        activo: true,
      }),
      sitio,
    );
    expect(degradado).toMatchObject({ sistema: "sitio", accesoTotal: false, sedesIds: [] });
    expect(await prisma.usuarioSede.count({ where: { usuarioId: jefe.id } })).toBe(0);
  });
});
