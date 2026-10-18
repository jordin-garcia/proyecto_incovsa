// Errores de las acciones del servidor (specs/16, "Cabeceras y transporte"; plan/convenciones.md §4.2). Las reglas de
// negocio lanzan ErrorNegocio con un mensaje para el usuario. Cualquier otro error muestra un mensaje general y su
// detalle va solo al registro del servidor.
import { unstable_rethrow } from "next/navigation";

export const MENSAJE_ERROR_GENERAL = "No se pudo completar la operación. Inténtelo de nuevo.";

/** Error de una regla de negocio. Su mensaje, en español, se muestra tal cual al usuario. */
export class ErrorNegocio extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "ErrorNegocio";
  }
}

export type ResultadoError = { ok: false; error: string };
/** Resultado de una acción del servidor: `{ ok: true, datos }` o `{ ok: false, error }`. */
export type Resultado<T> = { ok: true; datos: T } | ResultadoError;

/**
 * Convierte cualquier error en `{ ok: false, error }` sin revelar detalles técnicos. Se usa en el catch de las
 * acciones. Vuelve a lanzar los errores internos de Next.js (redirect, notFound) para que Next los atienda.
 */
export function aResultadoDeError(error: unknown): ResultadoError {
  unstable_rethrow(error);
  if (error instanceof ErrorNegocio) return { ok: false, error: error.message };
  console.error("Error inesperado en una acción del servidor:", error);
  return { ok: false, error: MENSAJE_ERROR_GENERAL };
}
