import { beforeEach, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import type { SesionActual } from "@/lib/sesion";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { crearSolicitud, leerOpcionesContacto } from "./servicio";
import { leerBandeja, contarSolicitudesNuevas, abrirSolicitud, gestionarSolicitud } from "./bandeja";
const contexto = vi.hoisted(() => ({ sesion: null as SesionActual | null }));
vi.mock("@/lib/sesion", () => ({ obtenerSesion: async () => contexto.sesion }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
import { abrir, gestionar } from "./acciones";
const sesion: SesionActual = {
  sistema: "sitio",
  usuario: { id: "dm09", usuario: "dm09", nombre: "Prueba", rol: "Editor" },
  permisos: ["sit.sol.ver", "sit.sol.gestionar"],
  sedes: [],
};
beforeEach(async () => {
  await limpiarTablasDeNegocio();
  await prisma.usuario.create({
    data: {
      id: "dm09",
      name: "Prueba",
      username: "dm09",
      displayUsername: "dm09",
      email: "dm09@prueba.invalid",
      sistema: "sitio",
      rol: "Editor",
    },
  });
  contexto.sesion = sesion;
});
async function nueva() {
  const { sedes } = await leerOpcionesContacto();
  const { folio } = await crearSolicitud({
    motivo: "solicitud",
    nombre: "Prueba bandeja",
    empresa: "",
    correo: "dm09@prueba.invalid",
    telefonoPais: "GT",
    telefono: "",
    pais: "MX",
    departamentoId: "",
    municipioId: "",
    sedeId: String(sedes[0].id),
    mensaje: "Mensaje completo\ncon saltos",
  });
  return prisma.solicitudContacto.findUniqueOrThrow({ where: { folio } });
}
it("RF-SW-20 / RN-42: llega sin estado, permite cualquier orden y registra cada cambio", async () => {
  const s = await nueva();
  expect(s.estado).toBeNull();
  for (const estado of ["solucionado", "asignado", "en_proceso", "solucionado"] as const) {
    await gestionarSolicitud({ id: s.id, tipo: "estado", estado }, sesion);
    expect((await prisma.solicitudContacto.findUniqueOrThrow({ where: { id: s.id } })).estado).toBe(estado);
  }
  expect(await prisma.bitacora.count({ where: { operacion: "Cambio de estado de solicitud" } })).toBe(4);
  await gestionarSolicitud({ id: s.id, tipo: "estado", estado: "solucionado" }, sesion);
  expect(await prisma.bitacora.count({ where: { operacion: "Cambio de estado de solicitud" } })).toBe(4);
});
it("RF-SW-31 / CP-59: abrir marca como leída una sola vez y reduce el indicador", async () => {
  const s = await nueva();
  expect(await contarSolicitudesNuevas(sesion)).toBe(1);
  await abrirSolicitud({ id: s.id }, sesion);
  await abrirSolicitud({ id: s.id }, sesion);
  expect(await contarSolicitudesNuevas(sesion)).toBe(0);
  expect((await leerBandeja(sesion)).solicitudes[0].mensaje).toBe("Mensaje completo\ncon saltos");
});
it("RF-SW-20 / RN-39: responsable activo del sitio y comentario único con bitácora transaccional", async () => {
  const s = await nueva();
  await gestionarSolicitud({ id: s.id, tipo: "responsable", responsableId: "dm09" }, sesion);
  await gestionarSolicitud({ id: s.id, tipo: "comentario", comentario: "Primero" }, sesion);
  await gestionarSolicitud({ id: s.id, tipo: "comentario", comentario: "Editado" }, sesion);
  expect(await prisma.solicitudContacto.findUniqueOrThrow({ where: { id: s.id } })).toMatchObject({
    responsableId: "dm09",
    comentario: "Editado",
  });
  expect(await prisma.bitacora.count()).toBe(3);
  await prisma.usuario.update({ where: { id: "dm09" }, data: { activo: false } });
  await expect(gestionarSolicitud({ id: s.id, tipo: "responsable", responsableId: "dm09" }, sesion)).rejects.toThrow();
  expect(await prisma.bitacora.count()).toBe(3);
});
it("RNF-04 / RF-SW-20: acciones rechazan sin sesión, sin permiso y otro sistema antes de validar", async () => {
  const s = await nueva();
  for (const actual of [null, { ...sesion, permisos: [] }, { ...sesion, sistema: "picking" as const }]) {
    contexto.sesion = actual;
    for (const accion of [abrir, gestionar])
      expect(await accion({})).toEqual({ ok: false, error: "No tiene permisos para acceder a este módulo." });
    await expect(leerBandeja(actual)).rejects.toThrow();
    await expect(contarSolicitudesNuevas(actual)).rejects.toThrow();
  }
  contexto.sesion = { ...sesion, permisos: ["sit.sol.ver"] };
  expect((await abrir({ id: s.id })).ok).toBe(true);
  for (const datos of [
    { tipo: "estado", estado: "asignado" },
    { tipo: "comentario", comentario: "No" },
    { tipo: "responsable", responsableId: null },
  ]) {
    expect((await gestionar({ id: s.id, ...datos })).ok).toBe(false);
  }
  expect(await prisma.bitacora.count()).toBe(0);
});
it("RNF-05: rechaza entradas manipuladas y responsables inexistentes sin modificar datos", async () => {
  const s = await nueva();
  for (const entrada of [
    { id: s.id, tipo: "estado", estado: "otro" },
    { id: s.id, tipo: "responsable", responsableId: "inexistente" },
    { id: s.id, tipo: "comentario", comentario: "x", leida: true },
    { id: -1, tipo: "estado", estado: "asignado" },
  ])
    expect((await gestionar(entrada)).ok).toBe(false);
  expect(await prisma.bitacora.count()).toBe(0);
});
