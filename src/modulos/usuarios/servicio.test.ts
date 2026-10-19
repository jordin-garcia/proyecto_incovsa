import { beforeEach, expect, it } from "vitest";
import { parseSetCookieHeader } from "better-auth/cookies";
import { prisma } from "@/lib/prisma";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { sembrarDemo } from "../../../prisma/semillas/demo";
import { iniciarSesion } from "@/app/acceso/servicio";
import { obtenerSesion } from "@/lib/sesion";
import { ErrorAcceso } from "@/modulos/permisos/servicio";
import { consultarOpciones } from "@/modulos/envios/opciones";
import type { SesionActual } from "@/lib/sesion";
import {
  crearUsuario,
  editarUsuario,
  eliminarUsuario,
  listarUsuarios,
  restablecerContrasena,
  type ActorUsuarios,
} from "./servicio";

const claveDemo = "Clave-de-prueba-06";
const claveNueva = "Clave-bodega-91";

function cabeceras(ip = "192.0.2.30") {
  return new Headers({ "x-real-ip": ip, origin: "http://localhost:3000" });
}
function conCookies(respuesta: Headers) {
  return new Headers({
    cookie: [...parseSetCookieHeader(respuesta.get("set-cookie") ?? "")].map(([n, c]) => `${n}=${c.value}`).join("; "),
  });
}

async function actor(sistema: ActorUsuarios["sistema"] = "picking"): Promise<ActorUsuarios> {
  const u = await prisma.usuario.findFirstOrThrow({ where: { displayUsername: "ejemplo.01" } });
  return { id: u.id, rol: u.rol, sistema };
}

async function sede(nombre: string) {
  return prisma.sede.findFirstOrThrow({ where: { nombre } });
}

beforeEach(async () => {
  await limpiarTablasDeNegocio();
  await sembrarDemo(prisma, { claveDemo });
});

it("RF-SL-03 / RF-SL-56: Gerencia crea un usuario de Bodega en Quetzaltenango y ese usuario solo entra ahí", async () => {
  const qx = await sede("Quetzaltenango");
  const creado = await crearUsuario(
    {
      sistema: "picking",
      nombre: "Ana Bodega",
      usuario: "ana.bodega",
      rol: "Bodega",
      correo: "",
      permisos: ["pk.bodega"],
      sedes: [qx.id],
      clave: claveNueva,
      confirmarClave: claveNueva,
    },
    await actor(),
  );
  const ingreso = await iniciarSesion(
    { usuario: "ana.bodega", sistema: "picking", clave: claveNueva },
    cabeceras("192.0.2.31"),
  );
  expect(ingreso.ok).toBe(true);
  if (!ingreso.ok) return;
  const sesion = await obtenerSesion("picking", conCookies(ingreso.cabeceras));
  expect(sesion?.usuario).toMatchObject({ usuario: "ana.bodega", rol: "Bodega" });
  expect(sesion?.permisos).toEqual(["pk.bodega"]);
  expect(sesion?.sedes.map((s) => s.nombre)).toEqual(["Quetzaltenango"]);
  expect(ingreso.destino).toBe("/picking/bodega");
  const bitacora = await prisma.bitacora.findFirstOrThrow({ where: { registroId: creado.id } });
  expect(bitacora.operacion).toBe("Creación de usuario");
  expect(JSON.stringify(bitacora.detalle)).not.toContain(claveNueva);
});

it("RN-54: el nombre se repite entre sistemas, no dentro del picking, y no contra Gerencia", async () => {
  const qx = await sede("Quetzaltenango");
  const base = {
    sistema: "picking" as const,
    nombre: "Cuenta de prueba",
    rol: "Bodega",
    correo: "",
    permisos: ["pk.bodega"],
    sedes: [qx.id],
    clave: claveNueva,
    confirmarClave: claveNueva,
  };
  const gerencia = await actor();
  await expect(crearUsuario({ ...base, usuario: "ejemplo.08" }, gerencia)).resolves.toMatchObject({
    id: expect.any(String),
  });
  await expect(crearUsuario({ ...base, usuario: "ejemplo.01" }, gerencia)).rejects.toThrow(/Gerencia o Soporte/);
  await expect(crearUsuario({ ...base, usuario: "ejemplo.08" }, gerencia)).rejects.toThrow(/ya existe en el picking/);
  await expect(
    crearUsuario({ ...base, usuario: "ana.bodega", rol: "Gerencia", permisos: [], sedes: [] }, gerencia),
  ).resolves.toBeTruthy();
  await expect(crearUsuario({ ...base, usuario: "ana.bodega" }, gerencia)).rejects.toThrow(/Gerencia o Soporte/);
});

it("RF-SL-48 / decisión 36: restablecer rechaza una clave corta o distinta, la nueva entra y cierra la sesión abierta", async () => {
  const qx = await sede("Quetzaltenango");
  const gerencia = await actor();
  const { id } = await crearUsuario(
    {
      sistema: "picking",
      nombre: "Ana Bodega",
      usuario: "ana.bodega",
      rol: "Bodega",
      correo: "",
      permisos: ["pk.bodega"],
      sedes: [qx.id],
      clave: claveNueva,
      confirmarClave: claveNueva,
    },
    gerencia,
  );
  await expect(
    restablecerContrasena({ id, sistema: "picking", clave: "corta", confirmarClave: "corta" }, gerencia),
  ).rejects.toThrow("La contraseña debe tener al menos 8 caracteres.");
  await expect(
    restablecerContrasena(
      { id, sistema: "picking", clave: "Clave-distinta-1", confirmarClave: "Clave-distinta-2" },
      gerencia,
    ),
  ).rejects.toThrow("Las dos contraseñas no coinciden.");

  const abierta = await iniciarSesion(
    { usuario: "ana.bodega", sistema: "picking", clave: claveNueva },
    cabeceras("192.0.2.32"),
  );
  expect(abierta.ok).toBe(true);
  if (!abierta.ok) return;
  const cookies = conCookies(abierta.cabeceras);
  expect(await obtenerSesion("picking", cookies)).not.toBeNull();

  const claveRestablecida = "Clave-nueva-48";
  await restablecerContrasena(
    { id, sistema: "picking", clave: claveRestablecida, confirmarClave: claveRestablecida },
    gerencia,
  );
  expect(await obtenerSesion("picking", cookies)).toBeNull();
  expect(
    (await iniciarSesion({ usuario: "ana.bodega", sistema: "picking", clave: claveNueva }, cabeceras("192.0.2.33"))).ok,
  ).toBe(false);
  expect(
    (
      await iniciarSesion(
        { usuario: "ana.bodega", sistema: "picking", clave: claveRestablecida },
        cabeceras("192.0.2.34"),
      )
    ).ok,
  ).toBe(true);
  const registro = await prisma.bitacora.findFirstOrThrow({ where: { operacion: "Restablecimiento de contraseña" } });
  expect(JSON.stringify(registro.detalle)).not.toContain(claveRestablecida);
});

it("RF-SL-57: un usuario eliminado no entra, su nombre queda reservado y la bitácora se conserva", async () => {
  const qx = await sede("Quetzaltenango");
  const gerencia = await actor();
  const { id } = await crearUsuario(
    {
      sistema: "picking",
      nombre: "Ana Bodega",
      usuario: "ana.bodega",
      rol: "Bodega",
      correo: "",
      permisos: ["pk.bodega"],
      sedes: [qx.id],
      clave: claveNueva,
      confirmarClave: claveNueva,
    },
    gerencia,
  );
  await eliminarUsuario({ id, sistema: "picking" }, gerencia);
  expect(
    (await iniciarSesion({ usuario: "ana.bodega", sistema: "picking", clave: claveNueva }, cabeceras("192.0.2.35"))).ok,
  ).toBe(false);
  await expect(
    crearUsuario(
      {
        sistema: "picking",
        nombre: "Otra Ana",
        usuario: "ana.bodega",
        rol: "Bodega",
        correo: "",
        permisos: ["pk.bodega"],
        sedes: [qx.id],
        clave: claveNueva,
        confirmarClave: claveNueva,
      },
      gerencia,
    ),
  ).rejects.toThrow(/ya existe en el picking/);
  expect(await prisma.usuario.findUnique({ where: { id } })).toMatchObject({
    activo: false,
    eliminadoEn: expect.any(Date),
  });
  expect(await prisma.bitacora.count({ where: { registroId: id, operacion: "Creación de usuario" } })).toBe(1);
  expect(await prisma.bitacora.count({ where: { registroId: id, operacion: "Eliminación de usuario" } })).toBe(1);
  expect(await listarUsuarios("picking", gerencia)).not.toEqual(
    expect.arrayContaining([expect.objectContaining({ id })]),
  );
});

it("RN-46: un rol piloto con espacios entra en la lista de Facturación de su sede", async () => {
  const qx = await sede("Quetzaltenango");
  const gerencia = await actor();
  await crearUsuario(
    {
      sistema: "picking",
      nombre: "Luis Piloto",
      usuario: "luis.piloto",
      rol: "piloto ",
      correo: "",
      permisos: ["pk.ruta.propias"],
      sedes: [qx.id],
      clave: claveNueva,
      confirmarClave: claveNueva,
    },
    gerencia,
  );
  const facturador = await prisma.usuario.findFirstOrThrow({
    where: { displayUsername: "ejemplo.03", sistema: "picking" },
    include: { permisos: { include: { permiso: true } }, sedes: { include: { sede: true } } },
  });
  const sesion: SesionActual = {
    sistema: "picking",
    usuario: { id: facturador.id, nombre: facturador.name, usuario: facturador.displayUsername, rol: facturador.rol },
    permisos: facturador.permisos.map((p) => p.permiso.codigo),
    sedes: facturador.sedes.map((s) => ({ id: s.sede.id, nombre: s.sede.nombre, prefijoOdoo: s.sede.prefijoOdoo })),
  };
  const opciones = await consultarOpciones(sesion, qx.id);
  expect(opciones.pilotos.map((p) => p.nombre)).toContain("Luis Piloto");
});

it("RN-38: quien no es Gerencia ni Soporte no administra usuarios, y la respuesta no lleva la contraseña", async () => {
  const bodega = await prisma.usuario.findFirstOrThrow({ where: { displayUsername: "ejemplo.05" } });
  const qx = await sede("Quetzaltenango");
  const entrada = {
    sistema: "picking" as const,
    nombre: "Intruso",
    usuario: "intruso.prueba",
    rol: "Bodega",
    correo: "",
    permisos: ["pk.bodega"],
    sedes: [qx.id],
    clave: claveNueva,
    confirmarClave: claveNueva,
  };
  await expect(crearUsuario(entrada, { id: bodega.id, rol: bodega.rol, sistema: "picking" })).rejects.toBeInstanceOf(
    ErrorAcceso,
  );
  await expect(
    listarUsuarios("picking", { id: bodega.id, rol: bodega.rol, sistema: "picking" }),
  ).rejects.toBeInstanceOf(ErrorAcceso);
  const gerencia = await actor();
  await expect(eliminarUsuario({ id: gerencia.id, sistema: "picking" }, gerencia)).rejects.toThrow(
    "No puede eliminar su propia cuenta.",
  );
  const { id } = await crearUsuario({ ...entrada, usuario: "ana.bodega", nombre: "Ana Bodega" }, gerencia);
  const editado = await editarUsuario(
    {
      id,
      sistema: "picking",
      nombre: "Ana de Bodega",
      rol: "Bodega",
      correo: "ana@correo.com",
      activo: true,
      permisos: ["pk.bodega", "pk.reportes"],
      sedes: [qx.id],
    },
    gerencia,
  );
  expect(editado.id).toBe(id);
  const edicion = await prisma.bitacora.findFirstOrThrow({
    where: { operacion: "Edición de usuario", registroId: id },
  });
  expect(JSON.stringify(edicion.detalle)).toContain("Permisos asignados: pk.reportes");
  expect(JSON.stringify(edicion.detalle)).not.toContain(claveNueva);
});
