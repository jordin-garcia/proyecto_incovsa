"use server";
import { aResultadoDeError } from "@/lib/errores";
import { crearSolicitud } from "./servicio";
/** Recepción pública expresamente autorizada por RF-SW-06; sin exigir sesión. */
export async function enviarSolicitud(entrada: unknown) {
  try {
    return { ok: true as const, datos: await crearSolicitud(entrada) };
  } catch (error) {
    return aResultadoDeError(error);
  }
}
