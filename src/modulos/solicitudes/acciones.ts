"use server";
import { revalidatePath } from "next/cache";
import { obtenerSesion } from "@/lib/sesion";
import { aResultadoDeError } from "@/lib/errores";
import { exigirPermiso } from "@/modulos/permisos/servicio";
import { abrirSolicitud, gestionarSolicitud } from "./bandeja";
export async function abrir(entrada: unknown) {
  try {
    const sesion = await obtenerSesion("sitio");
    exigirPermiso(sesion, "sit.sol.ver");
    const datos = await abrirSolicitud(entrada, sesion);
    revalidatePath("/panel", "layout");
    return { ok: true as const, datos };
  } catch (error) {
    return aResultadoDeError(error);
  }
}
export async function gestionar(entrada: unknown) {
  try {
    const sesion = await obtenerSesion("sitio");
    exigirPermiso(sesion, "sit.sol.gestionar");
    const datos = await gestionarSolicitud(entrada, sesion);
    revalidatePath("/panel", "layout");
    return { ok: true as const, datos };
  } catch (error) {
    return aResultadoDeError(error);
  }
}
