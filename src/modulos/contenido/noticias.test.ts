import { afterEach, beforeEach, expect, it, vi } from "vitest";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import type { SesionActual } from "@/lib/sesion";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { leerImagenLocal } from "@/modulos/almacenamiento/servicio";
const estado = vi.hoisted(() => ({ sesion: null as SesionActual | null }));
vi.mock("@/lib/sesion", () => ({ obtenerSesion: async () => estado.sesion }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
import { publicarNoticia, eliminarNoticia } from "./acciones-noticias";
import { leerNoticiasSitio, leerNoticiasPanel } from "./noticias";
import { recibirNoticia } from "./multipart-noticias";
import { POST } from "@/app/panel/noticias/publicar/route";
const sesion: SesionActual = {
  sistema: "sitio",
  usuario: { id: "noticias-prueba", usuario: "noticias", nombre: "Prueba", rol: "Editor" },
  permisos: ["sit.noticias"],
  sedes: [],
};
function formulario(datos: unknown, archivos: File[] = []) {
  const f = new FormData();
  f.set("datos", JSON.stringify(datos));
  for (const archivo of archivos) f.append("imagenes", archivo);
  return f;
}
async function imagen() {
  const bytes = await sharp({ create: { width: 10, height: 10, channels: 4, background: "transparent" } })
    .png()
    .toBuffer();
  return new File([new Uint8Array(bytes)], "noticia.png");
}
const campos = { titulo: "Noticia de prueba", texto: "Primera línea\nSegunda línea", imagenes: [0] };
afterEach(() => vi.unstubAllEnvs());
beforeEach(async () => {
  await limpiarTablasDeNegocio();
  await prisma.usuario.create({
    data: {
      id: sesion.usuario.id,
      name: "Prueba",
      username: "noticias.prueba",
      displayUsername: "noticias.prueba",
      email: "noticias@prueba.invalid",
      sistema: "sitio",
      rol: "Editor",
    },
  });
  estado.sesion = sesion;
});
it("RF-SW-18 / RN-39: publica, conserva fecha al editar y elimina noticia, imágenes y registra las tres operaciones", async () => {
  const creada = await publicarNoticia(formulario(campos, [await imagen()]));
  expect(creada.ok).toBe(true);
  if (!creada.ok) throw new Error("No creada");
  const id = creada.datos.id;
  const original = (await leerNoticiasSitio()).find((n) => n.id === id)!;
  expect(original.texto).toBe(campos.texto);
  expect(Object.keys(original).sort()).toEqual(["fechaPublicacion", "id", "imagenes", "texto", "titulo"]);
  expect(
    (await publicarNoticia(formulario({ ...campos, id, titulo: "Editada", imagenes: original.imagenes }))).ok,
  ).toBe(true);
  const editada = (await leerNoticiasPanel(sesion)).find((n) => n.id === id)!;
  expect(editada.fechaPublicacion).toEqual(original.fechaPublicacion);
  expect(editada.titulo).toBe("Editada");
  expect((await eliminarNoticia(id)).ok).toBe(true);
  expect(await leerNoticiasSitio()).toEqual([]);
  expect(await prisma.imagen.count({ where: { noticiaId: id } })).toBe(0);
  expect(await leerImagenLocal(original.imagenes[0]!.replace("/api/imagenes/", ""))).toBeNull();
  expect((await prisma.bitacora.findMany({ orderBy: { id: "asc" } })).map((b) => b.operacion)).toEqual([
    "Creación de noticia",
    "Edición de noticia",
    "Eliminación de noticia",
  ]);
});
it("RN-56 / RF-SW-18: rechaza cero, seis, referencias ajenas, índices repetidos y textos vacíos sin publicar", async () => {
  for (const datos of [
    { ...campos, imagenes: [] },
    { ...campos, imagenes: [0, 1, 2, 3, 4, 5] },
    { ...campos, imagenes: ["/marca/ajena.webp"] },
    { ...campos, imagenes: [0, 0] },
    { ...campos, titulo: " " },
    { ...campos, texto: " " },
  ]) {
    expect((await publicarNoticia(formulario(datos))).ok).toBe(false);
  }
  expect(
    (
      await publicarNoticia(
        formulario(
          campos,
          Array.from({ length: 6 }, () => new File(["no"], "a.png")),
        ),
      )
    ).ok,
  ).toBe(false);
  expect(await prisma.noticia.count()).toBe(0);
  expect(await prisma.bitacora.count()).toBe(0);
});
it("RF-SW-25: acciones y lectura privada rechazan sin sesión, sin permiso y otro sistema antes de validar", async () => {
  for (const actual of [null, { ...sesion, permisos: ["sit.catalogo"] }, { ...sesion, sistema: "picking" as const }]) {
    estado.sesion = actual;
    for (const r of [await publicarNoticia(formulario({})), await eliminarNoticia(1)])
      expect(r).toEqual({ ok: false, error: "No tiene permisos para acceder a este módulo." });
    await expect(leerNoticiasPanel(actual)).rejects.toThrow("No tiene permisos");
  }
  expect(await prisma.bitacora.count()).toBe(0);
});
it("RF-SW-18 / RN-56: ordena por publicación, conserva cinco imágenes propias y revierte una referencia ajena", async () => {
  const primera = await prisma.noticia.create({
    data: {
      titulo: "Anterior",
      texto: "Texto",
      autorId: sesion.usuario.id,
      fechaPublicacion: new Date("2026-10-01T12:00:00Z"),
    },
  });
  const segunda = await prisma.noticia.create({
    data: {
      titulo: "Reciente",
      texto: "Texto",
      autorId: sesion.usuario.id,
      fechaPublicacion: new Date("2026-10-02T12:00:00Z"),
    },
  });
  const urls = Array.from({ length: 5 }, (_, i) => `/api/imagenes/demo/0${i + 1}.webp`);
  await prisma.imagen.createMany({
    data: urls.map((url, i) => ({ area: "noticia", noticiaId: primera.id, posicion: i + 1, url })),
  });
  expect((await publicarNoticia(formulario({ ...campos, id: primera.id, imagenes: [...urls].reverse() }))).ok).toBe(
    true,
  );
  expect((await leerNoticiasSitio()).map((n) => n.id)).toEqual([segunda.id, primera.id]);
  expect((await leerNoticiasSitio())[1]!.imagenes).toEqual([...urls].reverse());
  expect(
    (await publicarNoticia(formulario({ ...campos, id: primera.id, titulo: "No guardar", imagenes: ["/ajena.webp"] })))
      .ok,
  ).toBe(false);
  expect((await prisma.noticia.findUniqueOrThrow({ where: { id: primera.id } })).titulo).toBe(campos.titulo);
});

it("RN-56 / RNF-05: carga cinco archivos reales, sustituye su galería y borra las imágenes retiradas", async () => {
  const creada = await publicarNoticia(
    formulario({ ...campos, imagenes: [0, 1, 2, 3, 4] }, await Promise.all(Array.from({ length: 5 }, imagen))),
  );
  expect(creada.ok).toBe(true);
  if (!creada.ok) throw new Error("No creada");
  const original = (await leerNoticiasSitio())[0]!;
  expect(original.imagenes).toHaveLength(5);
  expect((await publicarNoticia(formulario({ ...campos, id: creada.datos.id }, [await imagen()]))).ok).toBe(true);
  const sustituida = (await leerNoticiasSitio())[0]!;
  expect(sustituida.imagenes).toHaveLength(1);
  for (const url of original.imagenes) expect(await leerImagenLocal(url.replace("/api/imagenes/", ""))).toBeNull();
  expect(await leerImagenLocal(sustituida.imagenes[0]!.replace("/api/imagenes/", ""))).not.toBeNull();
  expect((await eliminarNoticia(creada.datos.id)).ok).toBe(true);
});

it("RF-SW-25 / RNF-05: la ruta multipart exige permiso y origen propio antes de aceptar archivos", async () => {
  vi.stubEnv("BETTER_AUTH_URL", "http://localhost");
  const request = (origin: string, body: FormData = formulario(campos)) =>
    new Request("http://localhost/panel/noticias/publicar", { method: "POST", headers: { origin }, body });
  for (const actual of [null, { ...sesion, permisos: [] }, { ...sesion, sistema: "picking" as const }]) {
    estado.sesion = actual;
    expect((await POST(request("http://localhost"))).status).toBe(403);
  }
  estado.sesion = sesion;
  expect((await recibirNoticia(request("http://ajena.invalid"))).status).toBe(403);
  expect(
    (
      await recibirNoticia(
        new Request("http://localhost/panel/noticias/publicar", {
          method: "POST",
          headers: { origin: "http://localhost" },
          body: "no multipart",
        }),
      )
    ).status,
  ).toBe(400);
  expect(await prisma.noticia.count()).toBe(0);
  const respuesta = await POST(request("http://localhost", formulario(campos, [await imagen()])));
  expect(respuesta.status).toBe(200);
  const datos = (await respuesta.json()) as { datos: { id: number } };
  expect((await eliminarNoticia(datos.datos.id)).ok).toBe(true);
});

it("RNF-05 / RF-SW-18: detrás del proxy acepta el origen público configurado y rechaza el interno", async () => {
  vi.stubEnv("BETTER_AUTH_URL", "https://incovsa.prueba.invalid");
  const request = async (origin: string) =>
    new Request("http://localhost:3000/panel/noticias/publicar", {
      method: "POST",
      headers: { origin },
      body: formulario(campos, [await imagen()]),
    });
  for (const origen of ["http://localhost:3000", "https://otro.prueba.invalid"])
    expect((await POST(await request(origen))).status).toBe(403);
  expect(await prisma.noticia.count()).toBe(0);
  const respuesta = await POST(await request("https://incovsa.prueba.invalid"));
  expect(respuesta.status).toBe(200);
  const datos = (await respuesta.json()) as { datos: { id: number } };
  expect((await eliminarNoticia(datos.datos.id)).ok).toBe(true);
});
