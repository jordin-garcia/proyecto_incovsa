"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { obtenerSesion } from "@/lib/sesion";
import { exigirPermiso } from "@/modulos/permisos/servicio";
import { aResultadoDeError, ErrorNegocio } from "@/lib/errores";
import { MAXIMO_BYTES } from "@/modulos/almacenamiento/servicio";
import { esquemaIndustriaPanel, esquemaProductoPanel, esquemaIdCatalogo } from "./esquemas-catalogo";
import { guardarIndustriaPanel, guardarProductoPanel, borrarProductoPanel } from "./servicio-catalogo";
function leerFormulario(entrada: FormData) {
  z.instanceof(FormData).parse(entrada);
  const archivos = z.array(z.file().min(1).max(MAXIMO_BYTES)).max(5).parse(entrada.getAll("imagenes"));
  return { datos: JSON.parse(z.string().parse(entrada.get("datos"))) as unknown, archivos };
}
export async function publicarIndustria(entrada: FormData) {
  try {
    const sesion = await obtenerSesion("sitio");
    exigirPermiso(sesion, "sit.industrias");
    const { datos, archivos } = leerFormulario(entrada);
    const validado = esquemaIndustriaPanel.safeParse(datos);
    if (!validado.success) throw new ErrorNegocio("El contenido o la cantidad de imágenes no es válido.");
    const resultado = await guardarIndustriaPanel(validado.data, archivos, sesion);
    revalidatePath("/", "layout");
    return { ok: true as const, datos: resultado };
  } catch (error) {
    return aResultadoDeError(error);
  }
}
export async function publicarProducto(entrada: FormData) {
  try {
    const sesion = await obtenerSesion("sitio");
    exigirPermiso(sesion, "sit.catalogo");
    const { datos, archivos } = leerFormulario(entrada);
    const validado = esquemaProductoPanel.safeParse(datos);
    if (!validado.success)
      throw new ErrorNegocio(
        validado.error.issues[0]?.message === "Escriba el nombre."
          ? "Escriba el nombre."
          : "El producto o la cantidad de imágenes no es válido.",
      );
    const resultado = await guardarProductoPanel(validado.data, archivos, sesion);
    revalidatePath("/", "layout");
    return { ok: true as const, datos: resultado };
  } catch (error) {
    return aResultadoDeError(error);
  }
}
export async function eliminarProducto(entrada: number) {
  try {
    const sesion = await obtenerSesion("sitio");
    exigirPermiso(sesion, "sit.catalogo");
    const resultado = await borrarProductoPanel(esquemaIdCatalogo.parse(entrada), sesion);
    revalidatePath("/", "layout");
    return { ok: true as const, datos: resultado };
  } catch (error) {
    return aResultadoDeError(error);
  }
}
