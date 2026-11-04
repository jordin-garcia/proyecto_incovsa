import { beforeEach, expect, it } from "vitest";
import { parseSetCookieHeader } from "better-auth/cookies";
import { prisma } from "@/lib/prisma";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { sembrarDemo } from "../../../prisma/semillas/demo";
import { iniciarSesion } from "@/app/acceso/servicio";
import { consultarBitacora } from "./servicio";

const clave = "Clave-de-prueba-bitacora";
const rango = { desde: new Date("2020-01-01T00:00:00Z"), hasta: new Date("2040-01-01T00:00:00Z") };
beforeEach(async () => {
  await limpiarTablasDeNegocio();
  await sembrarDemo(prisma, { claveDemo: clave });
});

async function entrar(usuario: string, sistema: "sitio" | "picking" = "picking") {
  const r = await iniciarSesion({ usuario, sistema, clave }, new Headers({ "x-real-ip": "192.0.2.10" }));
  if (!r.ok) throw new Error("Sin sesión");
  return new Headers({
    cookie: [...parseSetCookieHeader(r.cabeceras.get("set-cookie")!)].map(([n, c]) => `${n}=${c.value}`).join("; "),
  });
}

it("RN-39 / RNF-04: consultar exige sesión y reportes del picking antes de leer; devuelve la más reciente primero", async () => {
  await expect(consultarBitacora(rango, new Headers())).rejects.toThrow("No tiene permisos");
  const bodega = await entrar("ejemplo.05");
  await expect(consultarBitacora(rango, bodega)).rejects.toThrow("No tiene permisos");
  const sitio = await entrar("ejemplo.01", "sitio");
  await expect(consultarBitacora(rango, sitio)).rejects.toThrow("No tiene permisos");
  const gerencia = await entrar("ejemplo.01");
  const filas = await consultarBitacora(rango, gerencia);
  expect(filas).toHaveLength(3);
  expect(filas[0]?.sistema).toBe("picking");
  expect(filas[1]?.sistema).toBe("sitio");
  expect(filas[0]!.creadoEn.getTime()).toBeGreaterThanOrEqual(filas[1]!.creadoEn.getTime());
  await expect(consultarBitacora({ desde: rango.hasta, hasta: rango.desde }, gerencia)).rejects.toThrow();
  const u = await prisma.usuario.findUniqueOrThrow({ where: { username: "picking.ejemplo.05" } });
  const permiso = await prisma.permiso.findUniqueOrThrow({ where: { codigo: "pk.reportes" } });
  await prisma.usuarioPermiso.create({ data: { usuarioId: u.id, permisoId: permiso.id } });
  expect(await consultarBitacora(rango, bodega)).toHaveLength(3);
  await prisma.usuarioPermiso.deleteMany({ where: { usuarioId: u.id, permisoId: permiso.id } });
  await expect(consultarBitacora(rango, bodega)).rejects.toThrow("No tiene permisos");
});

it("RF-SL-36 / H-14: cada consulta limita a 250 filas y ordena los empates por id", async () => {
  const gerencia = await entrar("ejemplo.01");
  await prisma.bitacora.createMany({
    data: Array.from({ length: 260 }, (_, i) => ({
      sistema: "sitio",
      operacion: "Cambio de contenido del sitio",
      detalle: { resumen: `Registro ${i}` },
      creadoEn: new Date("2030-01-01T00:00:00Z"),
    })),
  });
  const filas = await consultarBitacora(rango, gerencia);
  expect(filas).toHaveLength(250);
  expect(filas[0]?.detalle).toEqual({ resumen: "Registro 259" });
  expect(filas.at(-1)?.detalle).toEqual({ resumen: "Registro 10" });
});
