import { z } from "zod";
import { MENSAJE_ERROR_GENERAL } from "@/lib/errores";

export const MENSAJE_IDENTIFICACION = "La identificación es obligatoria.";
export const MENSAJE_IDENTIFICACION_MAX = "La identificación admite hasta 40 caracteres.";
export const MENSAJE_CAPACIDAD = "La capacidad debe ser mayor que cero.";
export const MENSAJE_DECIMALES = "La capacidad admite como máximo 3 decimales.";
export const MENSAJE_CAPACIDAD_MAX = "La capacidad excede el máximo de 999,999,999.999 kg.";
export const MENSAJE_SEDE = "Elija la sede.";

export type CapacidadLeida = { ok: true; capacidadKg: string } | { ok: false; error: string };

function canonica(limpio: string): string {
  const [entero = "0", decimales = ""] = limpio.split(".");
  return `${entero.replace(/^0+/, "") || "0"}.${(decimales + "000").slice(0, 3)}`;
}

function excedeMaximo(capacidadKg: string): boolean {
  const [entero = "0", decimales = "000"] = capacidadKg.split(".");
  if (entero.length > 9) return true;
  if (entero.length < 9) return false;
  return entero > "999999999" || (entero === "999999999" && decimales > "999");
}

/** Lee la capacidad como el prototipo (`leerNumero`): quita comas de miles y exige un número mayor que cero. */
export function interpretarCapacidadKg(valor: unknown): CapacidadLeida {
  const texto = typeof valor === "number" && Number.isFinite(valor) ? String(valor) : String(valor ?? "").trim();
  const limpio = texto.replace(/,/g, "").replace(/\s/g, "");
  if (!/^\d+(\.\d+)?$/.test(limpio)) return { ok: false, error: MENSAJE_CAPACIDAD };
  const decimales = limpio.split(".")[1];
  if (decimales && decimales.length > 3) return { ok: false, error: MENSAJE_DECIMALES };
  if (/^0+(\.0+)?$/.test(limpio)) return { ok: false, error: MENSAJE_CAPACIDAD };
  const capacidadKg = canonica(limpio);
  if (excedeMaximo(capacidadKg)) return { ok: false, error: MENSAJE_CAPACIDAD_MAX };
  return { ok: true, capacidadKg };
}

const esquemaCapacidadKg = z.string({ error: MENSAJE_CAPACIDAD }).superRefine((valor, ctx) => {
  const leida = interpretarCapacidadKg(valor);
  if (!leida.ok) ctx.addIssue({ code: "custom", message: leida.error });
});

const esquemaSedeId = z
  .union([z.number().int().positive(), z.string().regex(/^\d+$/)])
  .transform((valor) => (typeof valor === "number" ? valor : Number(valor)))
  .pipe(z.number().int().positive({ error: MENSAJE_SEDE }));

export const esquemaCamion = z.object({
  identificacion: z
    .string({ error: MENSAJE_IDENTIFICACION })
    .transform((valor) => valor.trim())
    .pipe(z.string().min(1, MENSAJE_IDENTIFICACION).max(40, MENSAJE_IDENTIFICACION_MAX)),
  capacidadKg: esquemaCapacidadKg.transform((valor) => {
    const leida = interpretarCapacidadKg(valor);
    return leida.ok ? leida.capacidadKg : valor;
  }),
  sedeId: esquemaSedeId,
});

const esquemaId = z.number({ error: MENSAJE_ERROR_GENERAL }).int().positive();

export const esquemaEditarCamion = esquemaCamion.extend({ id: esquemaId });

export const esquemaEliminarCamion = z.object({ id: esquemaId });

export type EntradaCamion = z.output<typeof esquemaCamion>;
export type EntradaEditarCamion = z.output<typeof esquemaEditarCamion>;
export type EntradaEliminarCamion = z.output<typeof esquemaEliminarCamion>;
