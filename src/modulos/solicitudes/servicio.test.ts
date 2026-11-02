import { beforeEach, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { crearSolicitud, leerOpcionesContacto } from "./servicio";
import { esquemaSolicitud } from "./esquemas";
import { enviarSolicitud } from "./recepcion-publica";

const ipPrueba = vi.hoisted(() => ({ valor: "198.51.100.10" }));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-real-ip": ipPrueba.valor }) }));

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
it("RF-SW-06 / H-60: los topes de 150 y 20 caracteres avisan en español", async () => {
  const datos = await entrada();
  const casos = [
    { campo: "nombre", valor: "a".repeat(151), mensaje: "El nombre admite hasta 150 caracteres." },
    { campo: "empresa", valor: "a".repeat(151), mensaje: "La empresa admite hasta 150 caracteres." },
    {
      campo: "correo",
      valor: `${"a".repeat(139)}@ejemplo.com`,
      mensaje: "El correo admite hasta 150 caracteres.",
    },
    { campo: "telefono", valor: "1".repeat(21), mensaje: "El teléfono admite hasta 20 caracteres." },
  ] as const;
  for (const caso of casos) {
    const resultado = esquemaSolicitud.safeParse({ ...datos, [caso.campo]: caso.valor });
    expect(resultado.success).toBe(false);
    if (resultado.success) throw new Error(caso.campo);
    expect(resultado.error.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: [caso.campo], message: caso.mensaje })]),
    );
    expect(resultado.error.issues.map((issue) => issue.message).join(" ")).not.toMatch(/Too big|expected string/i);
  }
});
it("RF-SW-19: exige país, territorios de Guatemala y estructura válida de correo y teléfono", async () => {
  const datos = await entrada();
  for (const cambio of [
    { pais: "" },
    { pais: "GT" },
    { correo: "incorrecto" },
    { telefono: "123" },
    { motivo: "otro" },
    { mensaje: "a".repeat(2001) },
  ])
    expect(esquemaSolicitud.safeParse({ ...datos, ...cambio }).success).toBe(false);
  expect(esquemaSolicitud.safeParse(datos).success).toBe(true);
  expect(esquemaSolicitud.safeParse({ ...datos, mensaje: "a".repeat(2000) }).success).toBe(true);
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
it("RF-SW-06 / P-98: limita a cinco solicitudes por IP en 60 minutos y libera la IP al vencer el plazo", async () => {
  const datos = await entrada();
  ipPrueba.valor = "198.51.100.10";
  for (let i = 0; i < 5; i++) await crearSolicitud(datos);
  await expect(crearSolicitud(datos)).rejects.toThrow(
    "Recibimos varias solicitudes desde su conexión. Inténtelo de nuevo en una hora.",
  );
  expect(await prisma.solicitudContacto.count({ where: { ip: ipPrueba.valor } })).toBe(5);

  ipPrueba.valor = "198.51.100.11";
  await crearSolicitud(datos);
  expect(await prisma.solicitudContacto.count({ where: { ip: ipPrueba.valor } })).toBe(1);

  await prisma.$executeRaw`UPDATE solicitud_contacto SET creado_en = now() - interval '61 minutes' WHERE ip = '198.51.100.10'`;
  ipPrueba.valor = "198.51.100.10";
  await crearSolicitud(datos);
  expect(
    await prisma.solicitudContacto.count({
      where: { ip: ipPrueba.valor, creadoEn: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
    }),
  ).toBe(1);
});
it("RF-SW-06 / P-98: dos envíos simultáneos no exceden el límite de una misma IP", async () => {
  const datos = await entrada();
  ipPrueba.valor = "198.51.100.12";
  for (let i = 0; i < 4; i++) await crearSolicitud(datos);
  const resultados = await Promise.allSettled([crearSolicitud(datos), crearSolicitud(datos)]);
  expect(resultados.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  expect(resultados.filter((r) => r.status === "rejected")).toHaveLength(1);
  expect(await prisma.solicitudContacto.count({ where: { ip: ipPrueba.valor } })).toBe(5);
});
it("RF-SW-06 / P-98: el campo trampa responde con folio y no guarda ni consume el consecutivo", async () => {
  const datos = await entrada();
  ipPrueba.valor = "198.51.100.13";
  const primero = await enviarSolicitud(datos);
  expect(primero).toEqual({ ok: true, datos: { folio: expect.stringMatching(/^SOL-\d{4}-\d{4,}$/) } });
  const trampa = await enviarSolicitud({ ...datos, sitioWeb: "https://robot.invalid" });
  expect(trampa).toEqual({ ok: true, datos: { folio: expect.stringMatching(/^SOL-\d{4}-\d{4,}$/) } });
  expect(await prisma.solicitudContacto.count({ where: { ip: ipPrueba.valor } })).toBe(1);
  const segundo = await crearSolicitud(datos);
  if (!primero.ok) throw new Error("No se guardó la solicitud de control");
  expect(Number(segundo.folio.split("-")[2])).toBe(Number(primero.datos.folio.split("-")[2]) + 1);
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
    { mensaje: "a".repeat(2001) },
  ])
    await expect(crearSolicitud({ ...datos, ...cambio })).rejects.toThrow();
  expect(await prisma.solicitudContacto.count()).toBe(0);
});
