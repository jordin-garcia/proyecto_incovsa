"use server";
import { revalidatePath } from "next/cache";
import { obtenerSesion } from "@/lib/sesion";
import { aResultadoDeError } from "@/lib/errores";
import { exigirPermiso } from "@/modulos/permisos/servicio";
import { guardarProducto, eliminarProducto } from "./servicio";
export async function guardar(entrada: unknown) {
  try {
    const sesion = await obtenerSesion("sitio");
    exigirPermiso(sesion, "sit.doc.gestionar");
    const datos = await guardarProducto(entrada, sesion);
    revalidatePath("/panel", "layout");
    return { ok: true as const, datos };
  } catch (error) {
    return aResultadoDeError(error);
  }
}
export async function eliminar(entrada: unknown) {
  try {
    const sesion = await obtenerSesion("sitio");
    exigirPermiso(sesion, "sit.doc.gestionar");
    const datos = await eliminarProducto(entrada, sesion);
    revalidatePath("/panel", "layout");
    return { ok: true as const, datos };
  } catch (error) {
    return aResultadoDeError(error);
  }
}
