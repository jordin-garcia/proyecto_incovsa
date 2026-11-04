"use server";
// Única acción pública del sistema (RF-SW-06): la persona que visita Contacto no tiene sesión.
// Semgrep excluye solo este archivo de la regla de permisos y exige que no exporte nada más
// (`incovsa-recepcion-publica`, specs/16). Las acciones de la bandeja (DM-09) van en acciones.ts.
import { aResultadoDeError } from "@/lib/errores";
import { crearSolicitud } from "./servicio";

/** Valida la solicitud con el esquema estricto, la guarda y devuelve solo su folio. */
export async function enviarSolicitud(entrada: unknown) {
  try {
    return { ok: true as const, datos: await crearSolicitud(entrada) };
  } catch (error) {
    return aResultadoDeError(error);
  }
}
