// Errores de las acciones del servidor (specs/16, "Cabeceras y transporte"; plan/convenciones.md §4.2). Las reglas de
// negocio lanzan ErrorNegocio con un mensaje para el usuario. Cualquier otro error muestra un mensaje general y su
// detalle va solo al registro del servidor.
// Este archivo también lo importan componentes del navegador: no importa módulos de Node.js.
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

// ---------- Registro del servidor (ASVS V16.2.1 y V16.3.2 a V16.3.4, JG-26) ----------

/** Quién y qué: lo fija `exigirPermiso` al empezar cada operación (`src/lib/registro.ts`). */
export type ContextoRegistro = { sistema?: string; usuarioId?: string; operacion?: string };
type DatoRegistro = string | number | boolean | null | undefined | string[];
let leerContexto: () => ContextoRegistro | undefined = () => undefined;

/** Solo la llama `src/lib/registro.ts`, en el servidor, al cargarse. */
export function configurarContextoRegistro(lector: () => ContextoRegistro | undefined) {
  leerContexto = lector;
}

/**
 * Escribe una línea JSON en el registro del servidor (no en la bitácora de Reportes): la fecha, el nivel, el evento,
 * el sistema, el usuario y la operación en curso, más los datos indicados. Nunca recibe datos personales, entradas
 * del usuario, contraseñas ni secretos: solo identificadores y códigos.
 */
export function registrarEnServidor(
  nivel: "error" | "aviso",
  evento: string,
  datos: Record<string, DatoRegistro> = {},
) {
  const linea = JSON.stringify({ fecha: new Date().toISOString(), nivel, evento, ...leerContexto(), ...datos });
  if (nivel === "error") console.error(linea);
  else console.warn(linea);
}

/** Tipo, código y ubicación de un error inesperado, sin su mensaje: puede contener datos de la entrada. */
export function describirError(error: unknown): Record<string, DatoRegistro> {
  if (!(error instanceof Error)) return { tipo: typeof error };
  const codigo = (error as { code?: unknown }).code;
  return {
    tipo: error.name,
    codigo: typeof codigo === "string" || typeof codigo === "number" ? codigo : undefined,
    ubicacion: (error.stack ?? "")
      .split("\n")
      .filter((linea) => /^\s+at /.test(linea))
      .slice(0, 5)
      .map((linea) => linea.trim()),
  };
}

/**
 * Convierte cualquier error en `{ ok: false, error }` sin revelar detalles técnicos. Se usa en el catch de las
 * acciones. Vuelve a lanzar los errores internos de Next.js (redirect, notFound) para que Next los atienda.
 * Los rechazos de autorización ya quedaron registrados en `exigirPermiso`.
 */
export function aResultadoDeError(error: unknown): ResultadoError {
  unstable_rethrow(error);
  if (error instanceof ErrorNegocio) return { ok: false, error: error.message };
  registrarEnServidor("error", "error_inesperado", describirError(error));
  return { ok: false, error: MENSAJE_ERROR_GENERAL };
}
