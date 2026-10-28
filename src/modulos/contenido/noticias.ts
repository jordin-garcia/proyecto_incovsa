import { prisma } from "@/lib/prisma";
import type { SesionActual } from "@/lib/sesion";
import { exigirPermiso } from "@/modulos/permisos/servicio";
import { registrarBitacora } from "@/modulos/bitacora/servicio";
import { guardarImagen, borrarImagen, MAXIMO_BYTES } from "@/modulos/almacenamiento/servicio";
import { ErrorNegocio } from "@/lib/errores";
import { z } from "zod";
import { esquemaNoticia, esquemaIdNoticia, type NoticiaEntrada } from "./esquemas-noticias";

export async function leerNoticiasSitio() {
  const noticias = await prisma.noticia.findMany({
    orderBy: [{ fechaPublicacion: "desc" }, { id: "desc" }],
    select: {
      id: true,
      titulo: true,
      texto: true,
      fechaPublicacion: true,
      imagenes: { orderBy: { posicion: "asc" }, select: { url: true } },
    },
  });
  return noticias.map((n) => ({
    ...n,
    fechaPublicacion: n.fechaPublicacion.toISOString(),
    imagenes: n.imagenes.map((i) => i.url),
  }));
}
export type NoticiaPublica = Awaited<ReturnType<typeof leerNoticiasSitio>>[number];
export async function leerNoticiasPanel(sesion: SesionActual | null) {
  exigirPermiso(sesion, "sit.noticias");
  return leerNoticiasSitio();
}
async function limpiarImagenes(urls: string[]) {
  for (const url of urls)
    try {
      await borrarImagen(url);
    } catch {
      console.error("No se pudo eliminar una imagen de noticia del almacenamiento.");
    }
}
export async function guardarNoticia(entrada: NoticiaEntrada, archivos: File[], sesion: SesionActual | null) {
  exigirPermiso(sesion, "sit.noticias");
  const datos = esquemaNoticia.parse(entrada);
  z.array(z.file().min(1).max(MAXIMO_BYTES)).max(5).parse(archivos);
  const indices = datos.imagenes.filter((i): i is number => typeof i === "number");
  if (indices.length !== archivos.length || indices.some((i) => !archivos[i]))
    throw new ErrorNegocio("Las imágenes enviadas no son válidas.");
  const nuevas: string[] = [];
  let resultado: { id: number; antiguas: string[] };
  try {
    for (const archivo of archivos) nuevas.push(await guardarImagen(new Uint8Array(await archivo.arrayBuffer())));
    resultado = await prisma.$transaction(async (tx) => {
      const campos = { titulo: datos.titulo, texto: datos.texto };
      // Actualizar primero bloquea el registro y serializa su edición y eliminación.
      const noticia = datos.id
        ? await tx.noticia.update({ where: { id: datos.id }, data: campos })
        : await tx.noticia.create({ data: { ...campos, autorId: sesion!.usuario.id, fechaPublicacion: new Date() } });
      const actuales = (await tx.imagen.findMany({ where: { noticiaId: noticia.id } })).map((i) => i.url);
      if (datos.imagenes.some((i) => typeof i === "string" && !actuales.includes(i)))
        throw new ErrorNegocio("El contenido cambió. Recargue la página antes de publicar.");
      const urls = datos.imagenes.map((i) => (typeof i === "number" ? nuevas[i]! : i));
      await tx.imagen.deleteMany({ where: { noticiaId: noticia.id } });
      await tx.imagen.createMany({
        data: urls.map((url, i) => ({ area: "noticia", noticiaId: noticia.id, posicion: i + 1, url })),
      });
      await registrarBitacora(tx, {
        sistema: "sitio",
        usuarioId: sesion!.usuario.id,
        operacion: datos.id ? "Edición de noticia" : "Creación de noticia",
        entidad: "noticia",
        detalle: { resumen: datos.titulo },
      });
      return { id: noticia.id, antiguas: actuales.filter((url) => !urls.includes(url)) };
    });
  } catch (error) {
    await limpiarImagenes(nuevas);
    throw error;
  }
  await limpiarImagenes(resultado.antiguas);
  return { id: resultado.id };
}
export async function borrarNoticia(entrada: number, sesion: SesionActual | null) {
  exigirPermiso(sesion, "sit.noticias");
  const id = esquemaIdNoticia.parse(entrada);
  const urls = await prisma.$transaction(async (tx) => {
    const noticia = await tx.noticia.update({ where: { id }, data: { actualizadoEn: new Date() } });
    const imagenes = await tx.imagen.findMany({ where: { noticiaId: id }, select: { url: true } });
    await tx.noticia.delete({ where: { id } });
    await registrarBitacora(tx, {
      sistema: "sitio",
      usuarioId: sesion!.usuario.id,
      operacion: "Eliminación de noticia",
      entidad: "noticia",
      detalle: { resumen: noticia.titulo },
    });
    return imagenes.map((i) => i.url);
  });
  await limpiarImagenes(urls);
  return { id };
}
