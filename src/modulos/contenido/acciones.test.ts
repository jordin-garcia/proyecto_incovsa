import { beforeEach, expect, it, vi } from "vitest";
import type { SesionActual } from "@/lib/sesion";
import { prisma } from "@/lib/prisma";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import sharp from "sharp";
import { leerImagenLocal } from "@/modulos/almacenamiento/servicio";
import { leerResumen } from "./resumen";
import { leerEstructuraSitio } from "./servicio";
const estado = vi.hoisted(() => ({ sesion: null as SesionActual | null }));
vi.mock("@/lib/sesion", () => ({ obtenerSesion: async () => estado.sesion }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
import { publicarContenido } from "./acciones";
import { POST } from "@/app/api/imagenes/publicar/route";

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
it("RF-SW-23 (06/11): el bloque de valores ya no se publica y la tabla no cambia", async () => {
  const antes = await prisma.valor.findMany({ orderBy: { posicion: "asc" } });
  expect((await publicarContenido(formulario("valores", [null, null, null, null, null]))).ok).toBe(false);
  expect(await prisma.valor.findMany({ orderBy: { posicion: "asc" } })).toEqual(antes);
  expect(await prisma.bitacora.count()).toBe(0);
});
it("RNF-05: impide asociar imágenes ajenas o direcciones proporcionadas por el navegador", async () => {
  expect((await publicarContenido(formulario("mision", ["https://ejemplo.invalid/imagen.webp"]))).ok).toBe(false);
  expect(await prisma.bitacora.count()).toBe(0);
});

it("RNF-05 / H-05: la publicación institucional acepta el origen público y no el origen interno del proxy", async () => {
  vi.stubEnv("BETTER_AUTH_URL", "https://incovsa.test");
  try {
    for (const origin of ["http://localhost:3000", "https://ajeno.invalid"]) {
      expect(
        (
          await POST(
            new Request("http://localhost:3000/api/imagenes/publicar", {
              method: "POST",
              headers: { origin },
              body: formulario("mision", [], "No publicar"),
            }),
          )
        ).status,
      ).toBe(403);
    }
    const respuesta = await POST(
      new Request("http://localhost:3000/api/imagenes/publicar", {
        method: "POST",
        headers: { origin: "https://incovsa.test" },
        body: formulario("mision", [], "Misión detrás del proxy"),
      }),
    );
    expect(respuesta.status).toBe(200);
    expect((await prisma.contenidoInstitucional.findUniqueOrThrow({ where: { seccion: "mision" } })).texto).toBe(
      "Misión detrás del proxy",
    );
  } finally {
    vi.unstubAllEnvs();
  }
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
  // JG-34 (06/11): sin valores, la tarjeta solo depende de la historia.
  await prisma.contenidoInstitucional.deleteMany({ where: { seccion: "historia" } });
  expect((await leerResumen(sesion))[0]).toMatchObject({
    detalle: "Portada, logotipos, historia, misión y visión",
    estado: "Falta la historia",
    color: "a",
  });
  await prisma.contenidoInstitucional.create({ data: { seccion: "historia", texto: "Historia de prueba" } });
  expect((await leerResumen(sesion))[0]).toMatchObject({ estado: "Completo", color: "v" });
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
