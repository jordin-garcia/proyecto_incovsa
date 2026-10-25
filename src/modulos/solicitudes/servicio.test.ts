import { beforeEach, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { crearSolicitud, leerOpcionesContacto } from "./servicio";
import { esquemaSolicitud } from "./esquemas";
import { enviarSolicitud } from "./recepcion-publica";

beforeEach(() => limpiarTablasDeNegocio());
it("RF-SW-06 / RNF-05: la acción pública no requiere sesión, solo devuelve folio y rechaza campos internos", async () => {
  const datos = await entrada();
  const recibido = await enviarSolicitud(datos);
  expect(recibido).toEqual({ ok: true, datos: { folio: expect.stringMatching(/^SOL-\d{4}-\d{4,}$/) } });
  expect(await enviarSolicitud({ ...datos, estado: "solucionado" })).toEqual({
    ok: false,
    error: "Revise los datos del formulario.",
  });
  expect(await prisma.solicitudContacto.count()).toBe(1);
});
async function entrada() {
  const opciones = await leerOpcionesContacto();
  return {
    motivo: "solicitud" as const,
    nombre: "Persona de prueba",
    empresa: "",
    correo: "prueba@example.com",
    telefonoPais: "GT",
    telefono: "",
    pais: "MX",
    departamentoId: "",
    municipioId: "",
    sedeId: String(opciones.sedes[0].id),
    mensaje: "Consulta de prueba",
  };
}
it("RF-SW-19: exige país, territorios de Guatemala y estructura válida de correo y teléfono", async () => {
  const datos = await entrada();
  for (const cambio of [
    { pais: "" },
    { pais: "GT" },
    { correo: "incorrecto" },
    { telefono: "123" },
    { motivo: "otro" },
  ])
    expect(esquemaSolicitud.safeParse({ ...datos, ...cambio }).success).toBe(false);
  expect(esquemaSolicitud.safeParse(datos).success).toBe(true);
});
it("RF-SW-06: guarda sin estado ni lectura y solo devuelve el folio", async () => {
  const resultado = await crearSolicitud(await entrada());
  expect(Object.keys(resultado)).toEqual(["folio"]);
  expect(resultado.folio).toMatch(/^SOL-\d{4}-\d{4,}$/);
  expect(await prisma.solicitudContacto.findUnique({ where: { folio: resultado.folio } })).toMatchObject({
    estado: null,
    leida: false,
    responsableId: null,
    comentario: null,
  });
  expect(await prisma.bitacora.count()).toBe(0);
});
it("RF-SW-06: dos envíos simultáneos reciben folios distintos y consecutivos", async () => {
  const datos = await entrada();
  const resultados = await Promise.all([crearSolicitud(datos), crearSolicitud(datos)]);
  const numeros = resultados.map((r) => Number(r.folio.split("-")[2])).sort((a, b) => a - b);
  expect(numeros[1]).toBe(numeros[0] + 1);
  expect(await prisma.solicitudContacto.count()).toBe(2);
});
it("RF-SW-19: el servidor rechaza entradas manipuladas, Escuintla y territorios incongruentes", async () => {
  const datos = await entrada();
  const escuintla = await prisma.sede.findUniqueOrThrow({ where: { nombre: "Escuintla" } });
  const departamentos = await prisma.departamento.findMany({ take: 2, include: { municipios: { take: 1 } } });
  for (const cambio of [
    { correo: "mal" },
    { pais: "XX" },
    { sedeId: String(escuintla.id) },
    { pais: "GT", departamentoId: String(departamentos[0].id), municipioId: String(departamentos[1].municipios[0].id) },
    { leida: true },
  ])
    await expect(crearSolicitud({ ...datos, ...cambio })).rejects.toThrow();
  expect(await prisma.solicitudContacto.count()).toBe(0);
});
