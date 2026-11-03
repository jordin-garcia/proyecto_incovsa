"use server";
import { revalidatePath } from "next/cache";
import { obtenerSesion } from "@/lib/sesion";
import { exigirPermiso } from "@/modulos/permisos/servicio";
import { aResultadoDeError } from "@/lib/errores";
import { guardarContacto } from "./contacto";
export async function publicarContacto(entrada: unknown) {
  try {
    const sesion = await obtenerSesion("sitio");
    exigirPermiso(sesion, "sit.contacto");
    const datos = await guardarContacto(entrada, sesion);
    revalidatePath("/", "layout");
    return { ok: true as const, datos };
  } catch (error) {
    return aResultadoDeError(error);
  }
}
