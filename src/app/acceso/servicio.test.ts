import { beforeEach, expect, it, vi } from "vitest";
import { hashPassword } from "better-auth/crypto";
import { verificarContrasena } from "@/lib/contrasenas";
import { parseSetCookieHeader } from "better-auth/cookies";
import { prisma } from "@/lib/prisma";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { sembrarDemo } from "../../../prisma/semillas/demo";
import { consultarSistemasSoloLectura, consultarSistemas, iniciarSesion, cerrarSesion, reautenticar } from "./servicio";
import { obtenerSesion, leerSesion, revocarSesiones } from "@/lib/sesion";
import { crearAdministrador } from "../../../scripts/administrador";
import { registrarBitacora } from "@/modulos/bitacora/servicio";
import { GET, POST } from "../api/auth/[sistema]/[...ruta]/route";
import { obtenerIp } from "@/lib/ip";

const clave = "Clave-de-prueba-06";
const cabeceras = (ip = "192.0.2.6") => new Headers({ "x-real-ip": ip, origin: "http://localhost:3000" });
function conCookies(respuesta: Headers) {
  return new Headers({
    cookie: [...parseSetCookieHeader(respuesta.get("set-cookie") ?? "")].map(([n, c]) => `${n}=${c.value}`).join("; "),
  });
}
beforeEach(async () => {
  await limpiarTablasDeNegocio();
  await sembrarDemo(prisma, { claveDemo: clave });
});

it("RF-SW-09: devuelve solo los sistemas activos y registra el usuario inexistente con su IP", async () => {
  expect(await consultarSistemas({ usuario: " EJEMPLO.03 " }, cabeceras())).toEqual({
    ok: true,
    datos: { sitio: true, picking: true },
  });
  expect(await consultarSistemas({ usuario: "ejemplo.08" }, cabeceras())).toEqual({
    ok: true,
    datos: { sitio: true, picking: false },
  });
  expect(await consultarSistemas({ usuario: "ejemplo.05" }, cabeceras())).toEqual({
    ok: true,
    datos: { sitio: false, picking: true },
  });
  expect((await consultarSistemas({ usuario: "no.existe" }, cabeceras())).ok).toBe(false);
  expect(await prisma.bitacora.findFirst()).toMatchObject({
    operacion: "Intento de acceso fallido",
    usuarioEscrito: "no.existe",
    ip: "192.0.2.6",
    usuarioId: null,
    detalle: { resumen: "Acceso personal · el usuario no existe en ningún sistema" },
  });
});

it("RN-54: contraseñas y cookies independientes; cerrar sitio conserva picking y no deja bitácora", async () => {
  const u = await prisma.usuario.findUniqueOrThrow({ where: { username: "sitio.ejemplo.03" } });
  await prisma.cuenta.updateMany({
    where: { userId: u.id },
    data: { password: await hashPassword("Otra-clave-sitio") },
  });
  expect((await iniciarSesion({ sistema: "sitio", usuario: "ejemplo.03", clave }, cabeceras())).ok).toBe(false);
  const sitio = await iniciarSesion(
    { sistema: "sitio", usuario: "ejemplo.03", clave: "Otra-clave-sitio" },
    cabeceras(),
  );
  const picking = await iniciarSesion({ sistema: "picking", usuario: "ejemplo.03", clave }, cabeceras());
  expect(sitio.ok && picking.ok).toBe(true);
  if (!sitio.ok || !picking.ok) throw new Error("No se iniciaron las sesiones");
  expect(sitio.destino).toBe("/panel/documentos");
  expect(picking.destino).toBe("/picking/facturacion");
  const h = conCookies(
    new Headers({ "set-cookie": `${sitio.cabeceras.get("set-cookie")}, ${picking.cabeceras.get("set-cookie")}` }),
  );
  expect(await obtenerSesion("sitio", h)).toMatchObject({ usuario: { id: u.id } });
  expect(await obtenerSesion("picking", h)).not.toBeNull();
  const registros = await prisma.bitacora.count();
  await cerrarSesion("sitio", h);
  expect(await obtenerSesion("sitio", h)).toBeNull();
  expect(await obtenerSesion("picking", h)).not.toBeNull();
  expect(await prisma.bitacora.count()).toBe(registros);
});

it.each(["ejemplo.01", "ejemplo.02"])(
  "RN-18: %s entra a ambos sistemas con sesiones firmadas por separado",
  async (usuario) => {
    for (const sistema of ["sitio", "picking"] as const) {
      const r = await iniciarSesion({ sistema, usuario, clave }, cabeceras());
      expect(r.ok).toBe(true);
      if (!r.ok) throw new Error("Sin sesión");
      expect(await obtenerSesion(sistema, conCookies(r.cabeceras))).not.toBeNull();
      const otra = sistema === "sitio" ? "picking" : "sitio";
      const intercambiada = new Headers({
        cookie: conCookies(r.cabeceras).get("cookie")!.replace(`incovsa-${sistema}`, `incovsa-${otra}`),
      });
      expect(await obtenerSesion(otra, intercambiada)).toBeNull();
    }
  },
);

it("RNF-15: el quinto fallo bloquea incluso con clave correcta; no emite cookie y registra el bloqueo", async () => {
  for (let n = 0; n < 5; n++)
    expect(
      (await iniciarSesion({ sistema: "picking", usuario: "ejemplo.05", clave: "incorrecta" }, cabeceras())).ok,
    ).toBe(false);
  expect((await iniciarSesion({ sistema: "picking", usuario: "ejemplo.05", clave }, cabeceras("192.0.2.7"))).ok).toBe(
    false,
  );
  expect(await prisma.sesion.count()).toBe(0);
  expect(await prisma.bitacora.count({ where: { operacion: "Bloqueo de usuario" } })).toBe(1);
  expect((await prisma.bitacora.findFirstOrThrow({ where: { operacion: "Bloqueo de usuario" } })).detalle).toEqual({
    resumen: "Sistema de picking · Bloqueo de usuario · ejemplo.05",
  });
  expect(
    (await prisma.bitacora.findFirstOrThrow({ where: { operacion: "Intento fallido de inicio de sesión" } })).detalle,
  ).toEqual({ resumen: "Sistema de picking · contraseña incorrecta" });
});

it("RNF-15: el inicio correcto reinicia la secuencia de fallos", async () => {
  for (let n = 0; n < 4; n++)
    await iniciarSesion({ sistema: "picking", usuario: "ejemplo.05", clave: "incorrecta" }, cabeceras());
  expect((await iniciarSesion({ sistema: "picking", usuario: "ejemplo.05", clave }, cabeceras())).ok).toBe(true);
  for (let n = 0; n < 4; n++)
    await iniciarSesion({ sistema: "picking", usuario: "ejemplo.05", clave: "incorrecta" }, cabeceras());
  expect((await iniciarSesion({ sistema: "picking", usuario: "ejemplo.05", clave }, cabeceras())).ok).toBe(true);
});

it("RNF-15: veinte usuarios inexistentes bloquean la IP para consultas y contraseñas", async () => {
  for (let n = 0; n < 20; n++) await consultarSistemas({ usuario: `inexistente.${n}` }, cabeceras());
  expect((await consultarSistemas({ usuario: "ejemplo.01" }, cabeceras())).ok).toBe(false);
  expect((await iniciarSesion({ sistema: "sitio", usuario: "ejemplo.01", clave }, cabeceras())).ok).toBe(false);
  expect((await iniciarSesion({ sistema: "sitio", usuario: "ejemplo.01", clave }, cabeceras("192.0.2.7"))).ok).toBe(
    true,
  );
  expect(await prisma.bitacora.count({ where: { operacion: "Bloqueo de IP" } })).toBe(1);
  expect((await prisma.bitacora.findFirstOrThrow({ where: { operacion: "Bloqueo de IP" } })).detalle).toEqual({
    resumen: "Acceso personal · Bloqueo de IP · 192.0.2.6",
  });
});

it("RNF-15: los intentos concurrentes no evaden el límite persistente", async () => {
  await Promise.all(
    Array.from({ length: 6 }, () =>
      iniciarSesion({ sistema: "picking", usuario: "ejemplo.05", clave: "incorrecta" }, cabeceras()),
    ),
  );
  expect(await prisma.bitacora.count({ where: { operacion: "Intento fallido de inicio de sesión" } })).toBe(5);
  expect(await prisma.bitacora.count({ where: { operacion: "Bloqueo de usuario" } })).toBe(1);
});

it("RN-39: la bitácora y la sesión se confirman juntas; los registros se revierten con su transacción", async () => {
  const r = await iniciarSesion({ sistema: "picking", usuario: "ejemplo.05", clave }, cabeceras());
  expect(r.ok).toBe(true);
  const bit = await prisma.bitacora.findFirstOrThrow({ where: { operacion: "Inicio de sesión" } });
  expect(bit).toMatchObject({ sistema: "picking", usuarioEscrito: "ejemplo.05", ip: "192.0.2.6" });
  expect(await prisma.sesion.count({ where: { userId: bit.usuarioId! } })).toBe(1);
  await expect(
    prisma.$transaction(async (tx) => {
      await registrarBitacora(tx, { sistema: "sitio", operacion: "Prueba de reversión", detalle: {} });
      throw new Error("Revertir");
    }),
  ).rejects.toThrow("Revertir");
  expect(await prisma.bitacora.count({ where: { operacion: "Prueba de reversión" } })).toBe(0);
});

it("RNF-03 / decisión 36: revocar invalida en la petición siguiente; cuentas eliminadas e inactivas no entran", async () => {
  const r = await iniciarSesion({ sistema: "picking", usuario: "ejemplo.05", clave }, cabeceras());
  if (!r.ok) throw new Error("Sin sesión");
  const h = conCookies(r.cabeceras);
  const sesion = await obtenerSesion("picking", h);
  expect(sesion?.permisos).toContain("pk.bodega");
  expect(sesion?.sedes).toHaveLength(1);
  await revocarSesiones(sesion!.usuario.id);
  expect(await obtenerSesion("picking", h)).toBeNull();
  await prisma.usuario.update({ where: { id: sesion!.usuario.id }, data: { eliminadoEn: new Date() } });
  expect((await iniciarSesion({ sistema: "picking", usuario: "ejemplo.05", clave }, cabeceras())).ok).toBe(false);
  await prisma.usuario.update({ where: { id: sesion!.usuario.id }, data: { eliminadoEn: null, activo: false } });
  expect((await iniciarSesion({ sistema: "picking", usuario: "ejemplo.05", clave }, cabeceras())).ok).toBe(false);
  const cuenta = await prisma.cuenta.findFirstOrThrow({ where: { userId: sesion!.usuario.id } });
  expect(cuenta.password).not.toContain(clave);
  expect(await verificarContrasena({ hash: cuenta.password!, password: clave })).toBe(true);
});

it("Decisión 37: crear-admin crea ambos y rechaza contraseñas cortas o distintas sin escribir datos", async () => {
  const datos = {
    nombre: "Administrador de prueba",
    usuario: "admin.prueba",
    rol: "Soporte",
    clave,
    confirmarClave: clave,
  };
  await expect(crearAdministrador({ ...datos, clave: "corta", confirmarClave: "corta" })).rejects.toThrow();
  await expect(crearAdministrador({ ...datos, confirmarClave: "distinta" })).rejects.toThrow();
  expect(await prisma.usuario.count({ where: { displayUsername: "admin.prueba" } })).toBe(0);
  await crearAdministrador(datos);
  for (const sistema of ["sitio", "picking"] as const)
    expect((await iniciarSesion({ sistema, usuario: datos.usuario, clave }, cabeceras())).ok).toBe(true);
});

it("RNF-05: entradas inválidas y claves internas no permiten iniciar sesión ni consultar cuentas", async () => {
  expect((await consultarSistemas({ usuario: "" }, cabeceras())).ok).toBe(false);
  expect(await consultarSistemas({ usuario: "a".repeat(61) }, cabeceras())).toEqual({
    ok: false,
    error: "Escriba su nombre de usuario.",
  });
  expect((await iniciarSesion({ sistema: "ambos", usuario: "ejemplo.01", clave }, cabeceras())).ok).toBe(false);
  expect((await iniciarSesion({ sistema: "sitio", usuario: "ambos.ejemplo.01", clave }, cabeceras())).ok).toBe(false);
});

it("Decisión 36: siete días, renovación diaria con cookie, y expiración real por falta de uso", async () => {
  const r = await iniciarSesion({ sistema: "picking", usuario: "ejemplo.05", clave }, cabeceras());
  if (!r.ok) throw new Error("Sin sesión");
  const h = conCookies(r.cabeceras);
  const sesion = await prisma.sesion.findFirstOrThrow();
  expect(sesion.expiresAt.getTime() - Date.now()).toBeGreaterThan(6.99 * 86400000);
  expect((await leerSesion("picking", h)).cabeceras.get("set-cookie")).toBeNull();
  // La fecha de vencimiento reproduce una sesión usada por última vez hace más de un día.
  await prisma.sesion.update({
    where: { id: sesion.id },
    data: { expiresAt: new Date(Date.now() + 5 * 86400000), updatedAt: new Date(Date.now() - 2 * 86400000) },
  });
  const respuesta = await GET(new Request("http://localhost:3000/api/auth/picking/get-session", { headers: h }), {
    params: Promise.resolve({ sistema: "picking", ruta: ["get-session"] }),
  });
  expect(respuesta.headers.get("set-cookie")).toContain("Max-Age=604800");
  expect((await prisma.sesion.findFirstOrThrow()).expiresAt.getTime() - Date.now()).toBeGreaterThan(6.99 * 86400000);
  await prisma.sesion.update({ where: { id: sesion.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
  expect(await obtenerSesion("picking", h)).toBeNull();
});

it("RNF-15: los bloqueos vencen a los quince minutos y no se reutilizan los fallos previos", async () => {
  const desde = new Date(Date.now() - 16 * 60_000);
  await prisma.$transaction(async (tx) => {
    const u = await tx.usuario.findUniqueOrThrow({ where: { username: "picking.ejemplo.05" } });
    for (let n = 0; n < 5; n++)
      await tx.bitacora.create({
        data: {
          sistema: "picking",
          operacion: "Intento fallido de inicio de sesión",
          usuarioId: u.id,
          usuarioEscrito: "ejemplo.05",
          ip: "192.0.2.6",
          detalle: {},
          creadoEn: desde,
        },
      });
    for (const operacion of ["Bloqueo de usuario", "Bloqueo de IP"])
      await tx.bitacora.create({
        data: {
          sistema: "picking",
          operacion,
          usuarioId: u.id,
          usuarioEscrito: "ejemplo.05",
          ip: "192.0.2.6",
          detalle: {},
          creadoEn: desde,
        },
      });
  });
  expect(
    (await iniciarSesion({ sistema: "picking", usuario: "ejemplo.05", clave: "incorrecta" }, cabeceras())).ok,
  ).toBe(false);
  expect((await iniciarSesion({ sistema: "picking", usuario: "ejemplo.05", clave }, cabeceras())).ok).toBe(true);
});

it("RNF-15 / RNF-03: la API aplica los mismos límites, omite secretos y valida origen", async () => {
  const contexto = { params: Promise.resolve({ sistema: "picking", ruta: ["sign-in", "username"] }) };
  const pedir = (origen = "http://localhost:3000") =>
    POST(
      new Request("http://localhost:3000/api/auth/picking/sign-in/username", {
        method: "POST",
        headers: { ...Object.fromEntries(cabeceras()), origin: origen, "content-type": "application/json" },
        body: JSON.stringify({ usuario: "ejemplo.05", clave: "incorrecta" }),
      }),
      contexto,
    );
  expect((await pedir("https://ajeno.invalid")).status).toBe(403);
  for (let n = 0; n < 5; n++) {
    const respuesta = await pedir();
    expect(respuesta.status).toBe(401);
    expect(respuesta.headers.get("set-cookie")).toBeNull();
    expect(await respuesta.json()).toEqual({ ok: false, error: "Usuario o contraseña incorrectos." });
  }
  expect(await prisma.bitacora.count({ where: { operacion: "Bloqueo de usuario" } })).toBe(1);
  expect(obtenerIp(new Headers({ "x-forwarded-for": "203.0.113.99" }))).toBe("127.0.0.1");
  expect(obtenerIp(new Headers({ "x-real-ip": "192.0.2.44", "x-forwarded-for": "203.0.113.99" }))).toBe("192.0.2.44");
});

it("RN-39 / H-78: consultar sistemas al cargar acceso no registra fallos de cuentas desactivadas o eliminadas", async () => {
  for (const cambio of [{ activo: false }, { activo: true, eliminadoEn: new Date() }]) {
    await prisma.usuario.updateMany({ where: { displayUsername: "ejemplo.03" }, data: cambio });
    const antes = await prisma.bitacora.count();
    for (let i = 0; i < 21; i++) {
      expect(await consultarSistemasSoloLectura({ usuario: "ejemplo.03" }, cabeceras())).toEqual({
        ok: false,
        error:
          "No tiene permisos para acceder a los sistemas de INCOVSA. Si cree que es un error, comuníquese con Gerencia o con Soporte.",
      });
    }
    expect(await prisma.bitacora.count()).toBe(antes);
  }
});

it("RF-SL-01 (ASVS V7.2.4): volver a iniciar sesión en el mismo navegador cierra la sesión anterior de ese sistema", async () => {
  const primera = await iniciarSesion({ sistema: "picking", usuario: "ejemplo.01", clave }, cabeceras());
  const sitio = await iniciarSesion({ sistema: "sitio", usuario: "ejemplo.01", clave }, cabeceras());
  if (!primera.ok || !sitio.ok) throw new Error("No se iniciaron las sesiones");
  // El navegador envía las cookies de los dos sistemas al volver a entrar al picking.
  const navegador = conCookies(
    new Headers({ "set-cookie": `${primera.cabeceras.get("set-cookie")}, ${sitio.cabeceras.get("set-cookie")}` }),
  );
  expect(await obtenerSesion("picking", navegador)).not.toBeNull();
  const segunda = await iniciarSesion(
    { sistema: "picking", usuario: "ejemplo.02", clave },
    new Headers({ ...Object.fromEntries(cabeceras()), cookie: navegador.get("cookie")! }),
  );
  if (!segunda.ok) throw new Error("No se inició la segunda sesión");
  // La sesión anterior del picking ya no sirve; la nueva sí, y la del sitio sigue abierta.
  expect(await obtenerSesion("picking", navegador)).toBeNull();
  expect(await obtenerSesion("picking", conCookies(segunda.cabeceras))).toMatchObject({
    usuario: { usuario: "ejemplo.02" },
  });
  expect(await obtenerSesion("sitio", navegador)).not.toBeNull();
  // Un intento fallido no cierra la sesión que el navegador ya tenía.
  const otra = await iniciarSesion({ sistema: "picking", usuario: "ejemplo.03", clave }, cabeceras());
  if (!otra.ok) throw new Error("Sin sesión");
  const conOtra = conCookies(otra.cabeceras);
  const fallido = await iniciarSesion(
    { sistema: "picking", usuario: "ejemplo.03", clave: "incorrecta" },
    new Headers({ ...Object.fromEntries(cabeceras()), cookie: conOtra.get("cookie")! }),
  );
  expect(fallido.ok).toBe(false);
  expect(await obtenerSesion("picking", conOtra)).not.toBeNull();
});

it("RNF-15 (CE-14): la reautenticación cuenta cada fallo en el límite, lo registra y rechaza la clave correcta bloqueada", async () => {
  const r = await iniciarSesion({ sistema: "picking", usuario: "ejemplo.01", clave }, cabeceras());
  if (!r.ok) throw new Error("Sin sesión");
  const sesion = (await obtenerSesion("picking", conCookies(r.cabeceras)))!;
  expect(await reautenticar(sesion, clave, cabeceras())).toBe(true);
  for (const incorrecta of ["incorrecta", "", 123, "x".repeat(129)])
    expect(await reautenticar(sesion, incorrecta, cabeceras())).toBe(false);
  expect(
    await prisma.bitacora.count({
      where: {
        operacion: "Intento fallido de inicio de sesión",
        usuarioEscrito: "ejemplo.01",
        usuarioId: sesion.usuario.id,
      },
    }),
  ).toBe(4);
  // El quinto fallo bloquea al usuario 15 minutos: la contraseña correcta deja de aceptarse, desde cualquier IP.
  expect(await reautenticar(sesion, "incorrecta", cabeceras())).toBe(false);
  expect(
    await prisma.bitacora.count({ where: { operacion: "Bloqueo de usuario", usuarioEscrito: "ejemplo.01" } }),
  ).toBe(1);
  expect(await reautenticar(sesion, clave, cabeceras("192.0.2.9"))).toBe(false);
  expect((await iniciarSesion({ sistema: "picking", usuario: "ejemplo.01", clave }, cabeceras())).ok).toBe(false);
});

it("ASVS V14.3.1: cerrar sesión por la API borra la caché del navegador y conserva la cookie del otro sistema", async () => {
  const picking = await iniciarSesion({ sistema: "picking", usuario: "ejemplo.01", clave }, cabeceras());
  if (!picking.ok) throw new Error("Sin sesión");
  const contexto = { params: Promise.resolve({ sistema: "picking", ruta: ["sign-out"] }) };
  const respuesta = await POST(
    new Request("http://localhost:3000/api/auth/picking/sign-out", {
      method: "POST",
      headers: { ...Object.fromEntries(conCookies(picking.cabeceras)), origin: "http://localhost:3000" },
    }),
    contexto,
  );
  expect(respuesta.status).toBe(200);
  expect(respuesta.headers.get("clear-site-data")).toBe('"cache"');
  const borradas = respuesta.headers.getSetCookie();
  expect(borradas.some((c) => c.startsWith("incovsa-picking.session_token=;"))).toBe(true);
  expect(borradas.some((c) => c.includes("incovsa-sitio"))).toBe(false);
  expect(await obtenerSesion("picking", conCookies(picking.cabeceras))).toBeNull();
});

it("ASVS V16.3.3 / V16.3.4: la ruta de autenticación registra los rechazos por origen y sus errores sin datos", async () => {
  const aviso = vi.spyOn(console, "warn").mockImplementation(() => {});
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  try {
    const contexto = { params: Promise.resolve({ sistema: "sitio", ruta: ["sign-in", "username"] }) };
    const respuesta = await POST(
      new Request("http://localhost:3000/api/auth/sitio/sign-in/username", {
        method: "POST",
        headers: { origin: "https://ajeno.invalid", "content-type": "application/json" },
        body: JSON.stringify({ usuario: "ejemplo.01", clave: "Secreta-26" }),
      }),
      contexto,
    );
    expect(respuesta.status).toBe(403);
    expect(JSON.parse(aviso.mock.calls[0]![0] as string)).toMatchObject({
      evento: "autorizacion_rechazada",
      motivo: "origen_ajeno",
      sistema: "sitio",
      operacion: "auth.sign-in/username",
    });
    // Sin X-Real-IP fuera de desarrollo, iniciarSesion falla: el error se registra sin la contraseña.
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3000");
    const fallida = await POST(
      new Request("http://localhost:3000/api/auth/sitio/sign-in/username", {
        method: "POST",
        headers: { origin: "http://localhost:3000", "content-type": "application/json" },
        body: JSON.stringify({ usuario: "ejemplo.01", clave: "Secreta-26" }),
      }),
      contexto,
    );
    expect(fallida.status).toBe(500);
    const linea = error.mock.calls[0]![0] as string;
    expect(JSON.parse(linea)).toMatchObject({ evento: "error_inesperado", sistema: "sitio", tipo: "Error" });
    expect(linea).not.toContain("Secreta-26");
    expect(linea).not.toContain("ejemplo.01");
  } finally {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  }
});

it("ASVS V16.3.3: una entrada que la pantalla no habría enviado queda en el registro del servidor, sin lo escrito", async () => {
  const aviso = vi.spyOn(console, "warn").mockImplementation(() => {});
  try {
    expect((await iniciarSesion({ sistema: "picking", usuario: "ejemplo.01", clave: "" }, cabeceras())).ok).toBe(false);
    expect((await consultarSistemas({ usuario: "x".repeat(61) }, cabeceras())).ok).toBe(false);
    const lineas = aviso.mock.calls.map((llamada) => JSON.parse(llamada[0] as string));
    expect(lineas).toEqual([
      expect.objectContaining({ evento: "entrada_rechazada", operacion: "acceso.iniciar_sesion" }),
      expect.objectContaining({ evento: "entrada_rechazada", operacion: "acceso.consultar_usuario" }),
    ]);
    expect(JSON.stringify(lineas)).not.toContain("ejemplo.01");
  } finally {
    vi.restoreAllMocks();
  }
});
