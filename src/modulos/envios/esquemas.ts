import { z } from "zod";
import { esquemaResultadoLecturaOdoo } from "@/modulos/odoo/esquemas";

const esquemaSedeId = z.number().int().positive();
export const esquemaEntradaTablero = esquemaSedeId;

export const esquemaEntradaCargaDeOdoo = z.object({
  sedeId: esquemaSedeId,
  usuarioId: z.string().min(1),
  nombreArchivo: z.string().min(1).max(255),
  lectura: esquemaResultadoLecturaOdoo,
});
export type EntradaCargaDeOdoo = z.infer<typeof esquemaEntradaCargaDeOdoo>;

export const esquemaEntradaEliminarDelTablero = z.object({
  sedeId: esquemaSedeId,
  usuarioId: z.string().min(1),
  ids: z
    .array(z.number().int().positive())
    .min(1)
    .refine((ids) => new Set(ids).size === ids.length),
});
export type EntradaEliminarDelTablero = z.infer<typeof esquemaEntradaEliminarDelTablero>;

export const esquemaFormularioCarga = z.object({
  sedeId: z.string().regex(/^\d+$/).transform(Number).pipe(esquemaSedeId),
  archivo: z.file().max(3 * 1024 * 1024),
});

export const esquemaFormularioEliminar = z.object({
  sedeId: z.number().int().positive(),
  ids: z
    .array(z.number().int().positive())
    .min(1)
    .refine((ids) => new Set(ids).size === ids.length),
});
