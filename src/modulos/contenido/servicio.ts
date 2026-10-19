import { prisma } from "@/lib/prisma";
import type { SesionActual } from "@/lib/sesion";
import { ErrorNegocio } from "@/lib/errores";
import { exigirPermiso } from "@/modulos/permisos/servicio";
import { registrarBitacora } from "@/modulos/bitacora/servicio";
import { borrarImagen, guardarImagen } from "@/modulos/almacenamiento/servicio";
import { esquemaPublicacion, nombresBloques, type Bloque, type Publicacion } from "./esquemas";
import type { Prisma } from "@/generated/prisma/client";

async function leerBloque(tx: Prisma.TransactionClient, bloque: Bloque): Promise<(string | null)[]> {
  if (bloque === "valores") {
    const valores = await tx.valor.findMany({ orderBy: { posicion: "asc" } });
    return Array.from({ length: 5 }, (_, i) => valores.find((v) => v.posicion === i + 1)?.imagenUrl ?? null);
  }
  if (bloque === "logo" || bloque === "inquiserca") {
    const configuracion = await tx.configuracionSitio.findUniqueOrThrow({ where: { id: 1 } });
    return [bloque === "logo" ? configuracion.logotipoIncovsaUrl : configuracion.logotipoInquisercaUrl];
  }
  return (
    await tx.imagen.findMany({
      where: { area: bloque, industriaId: null, productoSitioId: null, noticiaId: null },
      orderBy: { posicion: "asc" },
    })
  ).map((i) => i.url);
}

export async function leerContenidoPanel(sesion: SesionActual | null) {
  exigirPermiso(sesion, "sit.contenido");
  return {
    configuracion: await prisma.configuracionSitio.findUniqueOrThrow({ where: { id: 1 } }),
    textos: await prisma.contenidoInstitucional.findMany(),
    valores: await prisma.valor.findMany({ orderBy: { posicion: "asc" } }),
    imagenes: await prisma.imagen.findMany({
      where: { area: { in: ["portada", "mision", "vision", "historia"] } },
      orderBy: { posicion: "asc" },
    }),
  };
}

export async function guardarPublicacion(entrada: Publicacion, archivos: File[], sesion: SesionActual | null) {
  exigirPermiso(sesion, "sit.contenido");
  const datos = esquemaPublicacion.parse(entrada);
  const nuevas: string[] = [];
  let antiguas: string[];
  try {
    const indices = datos.imagenes.filter((i): i is number => typeof i === "number");
    if (
      new Set(indices).size !== indices.length ||
      indices.some((i) => !archivos[i]) ||
      archivos.length !== indices.length
    )
      throw new ErrorNegocio("Las imágenes enviadas no son válidas.");
    for (const archivo of archivos) nuevas.push(await guardarImagen(new Uint8Array(await archivo.arrayBuffer())));
    antiguas = await prisma.$transaction(async (tx) => {
      // Serializa la publicación y la limpieza para no conservar direcciones borradas por otro editor.
      await tx.configuracionSitio.update({ where: { id: 1 }, data: { actualizadoEn: new Date() } });
      const actuales = await leerBloque(tx, datos.bloque);
      if (
        datos.imagenes.some(
          (i) =>
            typeof i === "string" &&
            !actuales.includes(i) &&
            !(datos.bloque === "inquiserca" && i === "/marca/inquiserca.webp"),
        )
      )
        throw new ErrorNegocio("El contenido cambió. Recargue la página antes de publicar.");
      const urls = datos.imagenes.map((i) => (typeof i === "number" ? nuevas[i]! : i));
      if (datos.bloque === "logo" || datos.bloque === "inquiserca") {
        await tx.configuracionSitio.update({
          where: { id: 1 },
          data:
            datos.bloque === "logo"
              ? { logotipoIncovsaUrl: urls[0] ?? null }
              : { logotipoInquisercaUrl: urls[0] ?? null },
        });
      } else if (datos.bloque === "valores") {
        for (let i = 0; i < 5; i++)
          await tx.valor.upsert({
            where: { posicion: i + 1 },
            create: { posicion: i + 1, imagenUrl: urls[i] },
            update: { imagenUrl: urls[i] },
          });
      } else {
        await tx.imagen.deleteMany({
          where: { area: datos.bloque, industriaId: null, productoSitioId: null, noticiaId: null },
        });
        if (urls.length)
          await tx.imagen.createMany({
            data: urls.map((url, i) => ({ area: datos.bloque, posicion: i + 1, url: url! })),
          });
        if (datos.bloque !== "portada")
          await tx.contenidoInstitucional.upsert({
            where: { seccion: datos.bloque },
            create: { seccion: datos.bloque, texto: datos.texto },
            update: { texto: datos.texto },
          });
      }
      await registrarBitacora(tx, {
        sistema: "sitio",
        operacion: "Cambio de contenido del sitio",
        entidad: "contenido",
        usuarioId: sesion!.usuario.id,
        detalle: { bloque: nombresBloques[datos.bloque] },
      });
      return actuales.filter((url): url is string => !!url && !urls.includes(url));
    });
  } catch (error) {
    await Promise.allSettled(nuevas.map(borrarImagen));
    throw error;
  }
  // Una falla de limpieza no convierte una publicación confirmada en un error reintentable.
  for (const url of antiguas) {
    try {
      await borrarImagen(url);
    } catch {
      console.error("No se pudo eliminar una imagen sustituida del almacenamiento.");
    }
  }
  return { bloque: datos.bloque, imagenes: datos.imagenes.map((i) => (typeof i === "number" ? nuevas[i]! : i)) };
}
