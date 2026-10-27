import { beforeEach, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import type { SesionActual } from "@/lib/sesion";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { guardarProducto, eliminarProducto, leerDocumentos } from "./servicio";
const contexto = vi.hoisted(() => ({ sesion: null as SesionActual | null }));
vi.mock("@/lib/sesion", () => ({ obtenerSesion: async () => contexto.sesion }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
import { guardar, eliminar } from "./acciones";
const sesion: SesionActual = {
  sistema: "sitio",
  usuario: { id: "dm10", nombre: "Prueba", usuario: "dm10", rol: "Editor" },
  permisos: ["sit.doc.ver", "sit.doc.descargar", "sit.doc.gestionar"],
  sedes: [],
};
let paisId: number;
const enlace = "https://drive.google.com/file/d/archivo_Prueba123/view";
const datos = () => ({
  producto: "Soda Cáustica",
  paisId,
  lote: "ABC123",
  enlaceFt: enlace,
  enlaceHs: "",
  enlaceCoa: "",
});
beforeEach(async () => {
  await limpiarTablasDeNegocio();
  await prisma.usuario.create({
    data: {
      id: "dm10",
      name: "Prueba",
      username: "dm10",
      displayUsername: "dm10",
      email: "dm10@prueba.invalid",
      sistema: "sitio",
      rol: "Editor",
    },
  });
  paisId = (await prisma.pais.findUniqueOrThrow({ where: { codigo: "MX" } })).id;
  contexto.sesion = sesion;
});
it("RN-41 / RF-SW-14: exige lote alfanumérico, país y enlaces válidos de Drive", async () => {
  for (const cambio of [
    { lote: "" },
    { lote: "ABC-1" },
    { paisId: 0 },
    { enlaceFt: "https://evil.invalid/a" },
    { enlaceFt: "https://drive.google.com.evil.invalid/file/d/archivo_Prueba123" },
    { enlaceFt: "https://drive.google.com/file/d/archivo_Prueba123.evil" },
    { enlaceFt: "https://drive.google.com/" },
  ]) {
    await expect(guardarProducto({ ...datos(), ...cambio }, sesion)).rejects.toThrow();
  }
  expect(await prisma.productoDocumentado.count()).toBe(0);
  await guardarProducto(datos(), sesion);
  expect(await prisma.productoDocumentado.count()).toBe(1);
});
it("RN-55 / RN-39: crea, edita, evita duplicados y elimina con bitácora", async () => {
  const { id } = await guardarProducto(datos(), sesion);
  await expect(guardarProducto(datos(), sesion)).rejects.toThrow("Ya existe");
  await expect(guardarProducto({ ...datos(), producto: "soda caustica" }, sesion)).rejects.toThrow("Ya existe");
  await guardarProducto({ ...datos(), id, lote: "Otro123" }, sesion);
  expect((await prisma.productoDocumentado.findUniqueOrThrow({ where: { id } })).lote).toBe("Otro123");
  await eliminarProducto({ id }, sesion);
  expect(await prisma.productoDocumentado.count()).toBe(0);
  expect((await prisma.bitacora.findMany({ orderBy: { id: "asc" } })).map((x) => x.operacion)).toEqual([
    "Creación de producto documentado",
    "Edición de producto documentado",
    "Eliminación de producto documentado",
  ]);
});
it("RN-55: dos creaciones concurrentes normalizadas no duplican el producto", async () => {
  const resultados = await Promise.allSettled([
    guardarProducto(datos(), sesion),
    guardarProducto({ ...datos(), producto: "soda caustica" }, sesion),
  ]);
  expect(resultados.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  expect(await prisma.productoDocumentado.count()).toBe(1);
  expect(await prisma.bitacora.count()).toBe(1);
});
it("RN-19 / RF-SW-21: el servidor entrega únicamente las direcciones autorizadas", async () => {
  await guardarProducto(datos(), sesion);
  for (const permisos of [
    ["sit.doc.ver"],
    ["sit.doc.descargar"],
    ["sit.doc.gestionar"],
    ["sit.doc.ver", "sit.doc.descargar"],
  ]) {
    const resultado = await leerDocumentos({ ...sesion, permisos });
    const texto = JSON.stringify(resultado);
    expect(texto.includes("/preview")).toBe(permisos.includes("sit.doc.ver"));
    expect(texto.includes("export=download")).toBe(permisos.includes("sit.doc.descargar"));
    expect(texto.includes(enlace)).toBe(permisos.includes("sit.doc.gestionar"));
  }
  await expect(leerDocumentos(null)).rejects.toThrow("permisos");
  await expect(leerDocumentos({ ...sesion, permisos: [] })).rejects.toThrow("permisos");
});
it("RF-SW-21: busca por lote, nombre y país", async () => {
  await guardarProducto(datos(), sesion);
  for (const busqueda of ["ABC123", "Soda", "México"])
    expect((await leerDocumentos(sesion, busqueda)).productos).toHaveLength(1);
  expect((await leerDocumentos(sesion, "inexistente")).productos).toHaveLength(0);
});
it.each([null, { ...sesion, permisos: ["sit.doc.ver"] }, { ...sesion, sistema: "picking" as const }])(
  "RF-SW-25: acciones rechazan sesión sin autorización %j",
  async (s) => {
    contexto.sesion = s;
    expect(await guardar(datos())).toMatchObject({ ok: false, error: "No tiene permisos para acceder a este módulo." });
    expect(await eliminar({ id: 1 })).toMatchObject({
      ok: false,
      error: "No tiene permisos para acceder a este módulo.",
    });
    expect(await prisma.productoDocumentado.count()).toBe(0);
  },
);
