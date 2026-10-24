"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { obtenerSesion } from "@/lib/sesion";
import { exigirPermiso } from "@/modulos/permisos/servicio";
import { aResultadoDeError, ErrorNegocio } from "@/lib/errores";
import { MAXIMO_BYTES } from "@/modulos/almacenamiento/servicio";
import { esquemaNoticia, esquemaIdNoticia } from "./esquemas-noticias";
import { guardarNoticia, borrarNoticia } from "./noticias";
export async function publicarNoticia(entrada: FormData) {
  try {
    const sesion = await obtenerSesion("sitio");
    exigirPermiso(sesion, "sit.noticias");
    z.instanceof(FormData).parse(entrada);
    const archivos = z.array(z.file().min(1).max(MAXIMO_BYTES)).max(5).parse(entrada.getAll("imagenes"));
    const validado = esquemaNoticia.safeParse(JSON.parse(z.string().parse(entrada.get("datos"))) as unknown);
    if (!validado.success) {
      const mensaje = validado.error.issues[0]?.message;
      throw new ErrorNegocio(
        ["Escriba el título.", "Escriba el texto.", "Agregue al menos una imagen."].includes(mensaje ?? "")
          ? mensaje!
          : "La noticia o la cantidad de imágenes no es válida.",
      );
    }
    const resultado = await guardarNoticia(validado.data, archivos, sesion);
    revalidatePath("/", "layout");
    return { ok: true as const, datos: resultado };
  } catch (error) {
    return aResultadoDeError(error);
  }
}
export async function eliminarNoticia(entrada: number) {
  try {
    const sesion = await obtenerSesion("sitio");
    exigirPermiso(sesion, "sit.noticias");
    const resultado = await borrarNoticia(esquemaIdNoticia.parse(entrada), sesion);
    revalidatePath("/", "layout");
    return { ok: true as const, datos: resultado };
  } catch (error) {
    return aResultadoDeError(error);
  }
}
