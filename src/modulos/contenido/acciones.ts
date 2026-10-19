"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { obtenerSesion } from "@/lib/sesion";
import { exigirPermiso } from "@/modulos/permisos/servicio";
import { aResultadoDeError, ErrorNegocio } from "@/lib/errores";
import { esquemaPublicacion } from "./esquemas";
import { guardarPublicacion } from "./servicio";
import { MAXIMO_BYTES } from "@/modulos/almacenamiento/servicio";

export async function publicarContenido(entrada: FormData) {
  try {
    const sesion = await obtenerSesion("sitio");
    exigirPermiso(sesion, "sit.contenido");
    z.instanceof(FormData).parse(entrada);
    const datos = esquemaPublicacion.safeParse(JSON.parse(z.string().parse(entrada.get("datos"))));
    if (!datos.success) throw new ErrorNegocio("El contenido o la cantidad de imágenes no es válido.");
    const archivos = z
      .array(z.instanceof(File).refine((f) => f.size > 0 && f.size <= MAXIMO_BYTES))
      .max(5)
      .parse(entrada.getAll("imagenes"));
    const resultado = await guardarPublicacion(datos.data, archivos, sesion);
    revalidatePath("/", "layout");
    return { ok: true as const, datos: resultado };
  } catch (error) {
    return aResultadoDeError(error);
  }
}
