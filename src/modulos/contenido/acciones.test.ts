import { beforeEach, expect, it, vi } from "vitest";
import type { SesionActual } from "@/lib/sesion";
import { prisma } from "@/lib/prisma";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import sharp from "sharp";
import { leerImagenLocal, borrarImagen } from "@/modulos/almacenamiento/servicio";
import { leerResumen } from "./resumen";
import { leerEstructuraSitio } from "./servicio";
const estado = vi.hoisted(() => ({ sesion: null as SesionActual | null }));
vi.mock("@/lib/sesion", () => ({ obtenerSesion: async () => estado.sesion }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
import { publicarContenido } from "./acciones";

const sesion: SesionActual = {
  sistema: "sitio",
  usuario: { id: "contenido-prueba", usuario: "contenido", nombre: "Prueba", rol: "Editor" },
  permisos: ["sit.contenido"],
  sedes: [],
};
function formulario(bloque: string, imagenes: (string | number | null)[], texto = "") {
  const datos = new FormData();
  datos.set("datos", JSON.stringify({ bloque, imagenes, texto }));
  return datos;
}
beforeEach(async () => {
  await limpiarTablasDeNegocio();
  await prisma.usuario.create({
    data: {
      id: sesion.usuario.id,
      name: "Prueba",
      username: "sitio.contenido",
      displayUsername: "contenido",
      email: "contenido@prueba.invalid",
      sistema: "sitio",
      rol: "Editor",
    },
  });
  estado.sesion = sesion;
});
it("RN-56: rechaza la sexta imagen sin publicar ni registrar cambios", async () => {
  const r = await publicarContenido(formulario("mision", Array(6).fill("/api/imagenes/demo/01.webp"), "No publicar"));
  expect(r).toEqual({ ok: false, error: "El contenido o la cantidad de imágenes no es válido." });
  expect(await prisma.bitacora.count()).toBe(0);
  expect((await prisma.contenidoInstitucional.findUniqueOrThrow({ where: { seccion: "mision" } })).texto).not.toBe(
    "No publicar",
  );
});
it("RF-SW-25: rechaza sin sesión, sin permiso y una sesión del otro sistema", async () => {
  for (const actual of [null, { ...sesion, permisos: [] }, { ...sesion, sistema: "picking" as const }]) {
    estado.sesion = actual;
    expect(await publicarContenido(formulario("mision", [], "No publicar"))).toEqual({
      ok: false,
      error: "No tiene permisos para acceder a este módulo.",
    });
  }
  expect(await prisma.bitacora.count()).toBe(0);
});
it("RF-SW-23 / RN-39: publica el texto y registra el bloque en la misma operación", async () => {
  expect((await publicarContenido(formulario("mision", [], "Misión de prueba"))).ok).toBe(true);
  expect((await prisma.contenidoInstitucional.findUniqueOrThrow({ where: { seccion: "mision" } })).texto).toBe(
    "Misión de prueba",
  );
  const registro = await prisma.bitacora.findFirstOrThrow();
  expect(registro.operacion).toBe("Cambio de contenido del sitio");
  expect(registro.detalle).toEqual({ bloque: "Misión" });
});
it("RF-SW-29: conserva las cinco posiciones de los valores, incluidos los espacios vacíos", async () => {
  expect((await publicarContenido(formulario("valores", [null, null, null, null, null]))).ok).toBe(true);
  expect((await prisma.valor.findMany({ orderBy: { posicion: "asc" } })).map((v) => [v.posicion, v.imagenUrl])).toEqual(
    [1, 2, 3, 4, 5].map((p) => [p, null]),
  );
  expect((await publicarContenido(formulario("valores", [null]))).ok).toBe(false);
});
it("RNF-05: impide asociar imágenes ajenas o direcciones proporcionadas por el navegador", async () => {
  expect((await publicarContenido(formulario("mision", ["https://ejemplo.invalid/imagen.webp"]))).ok).toBe(false);
  expect(await prisma.bitacora.count()).toBe(0);
});

it("RF-SW-29 / RN-39: publica cinco imágenes en sus posiciones y elimina la sustituida", async () => {
  const png = await sharp({ create: { width: 10, height: 10, channels: 4, background: "transparent" } })
    .png()
    .toBuffer();
  const datos = formulario("valores", [0, 1, 2, 3, 4]);
  for (let i = 0; i < 5; i++)
    datos.append("imagenes", new File([new Uint8Array(png)], `${i}.png`, { type: "image/png" }));
  const resultado = await publicarContenido(datos);
  expect(resultado.ok).toBe(true);
  if (!resultado.ok) throw new Error("No se publicaron los valores");
  const valores = await prisma.valor.findMany({ orderBy: { posicion: "asc" } });
  expect(valores.map((v) => v.imagenUrl)).toEqual(resultado.datos.imagenes);
  const sustituida = valores[2]!.imagenUrl!;
  const siguientes = valores.map((v) => (v.posicion === 3 ? null : v.imagenUrl));
  expect((await publicarContenido(formulario("valores", siguientes))).ok).toBe(true);
  expect(await leerImagenLocal(sustituida.replace("/api/imagenes/", ""))).toBeNull();
  expect(await prisma.bitacora.count()).toBe(2);
  await Promise.all(siguientes.filter((v): v is string => v !== null).map(borrarImagen));
});

it("RN-56: conserva el orden al intercambiar las cinco posiciones de una galería", async () => {
  const urls = Array.from({ length: 5 }, (_, i) => `/api/imagenes/demo/0${i + 1}.webp`);
  await prisma.imagen.createMany({ data: urls.map((url, i) => ({ area: "mision", posicion: i + 1, url })) });
  expect((await publicarContenido(formulario("mision", [...urls].reverse(), "Misión"))).ok).toBe(true);
  expect(
    (await prisma.imagen.findMany({ where: { area: "mision" }, orderBy: { posicion: "asc" } })).map((i) => i.url),
  ).toEqual([...urls].reverse());
});

it("RF-SW-23: quitar Inquiserca guarda null y permite recuperar el logotipo recibido", async () => {
  expect((await leerEstructuraSitio()).logotipoInquiserca).toBe("/marca/inquiserca.webp");
  expect((await publicarContenido(formulario("inquiserca", []))).ok).toBe(true);
  expect((await prisma.configuracionSitio.findUniqueOrThrow({ where: { id: 1 } })).logotipoInquisercaUrl).toBeNull();
  expect((await leerEstructuraSitio()).logotipoInquiserca).toBeNull();
  expect((await publicarContenido(formulario("inquiserca", ["/marca/inquiserca.webp"]))).ok).toBe(true);
  expect((await leerEstructuraSitio()).logotipoInquiserca).toBe("/marca/inquiserca.webp");
});

it("RF-SW-07 / RF-SW-25: el resumen consulta solo las tarjetas permitidas", async () => {
  expect((await leerResumen(sesion)).map((t) => t.ruta)).toEqual(["contenido"]);
  await expect(leerResumen({ ...sesion, permisos: [] })).rejects.toThrow("No tiene permisos");
});

it("RF-SW-23: reemplaza INCOVSA, elimina la imagen anterior y recupera el logotipo recibido", async () => {
  const png = await sharp({ create: { width: 10, height: 10, channels: 4, background: "transparent" } })
    .png()
    .toBuffer();
  const publicarLogo = () => {
    const datos = formulario("logo", [0]);
    datos.append("imagenes", new File([new Uint8Array(png)], "logo.png", { type: "image/png" }));
    return publicarContenido(datos);
  };
  const primera = await publicarLogo();
  expect(primera.ok).toBe(true);
  if (!primera.ok) throw new Error("No se publicó el logotipo");
  const anterior = primera.datos.imagenes[0]!;
  expect((await publicarLogo()).ok).toBe(true);
  expect(await leerImagenLocal(anterior.replace("/api/imagenes/", ""))).toBeNull();
  expect((await publicarContenido(formulario("logo", []))).ok).toBe(true);
  expect((await prisma.configuracionSitio.findUniqueOrThrow({ where: { id: 1 } })).logotipoIncovsaUrl).toBeNull();
});
