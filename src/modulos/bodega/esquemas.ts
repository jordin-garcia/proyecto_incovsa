import { z } from "zod";

export const esquemaMarcarLinea = z.object({
  envioId: z.number().int().positive(),
  lineaId: z.number().int().positive(),
  marcado: z.boolean().optional(),
});

export const esquemaMarcarTodo = z.object({
  envioId: z.number().int().positive(),
  marcado: z.boolean(),
});

export const esquemaOrdenarPorPeso = z.object({
  envioId: z.number().int().positive(),
});

export const esquemaDespachar = z.object({
  envioId: z.number().int().positive(),
});

export const esquemaDetalleEnvio = z.object({
  envioId: z.number().int().positive(),
});

export const esquemaReordenarCola = z.object({
  envioIds: z
    .array(z.number().int().positive())
    .min(1)
    .max(1000)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Los IDs de envío no deben contener duplicados",
    }),
});

export const esquemaReordenarLineas = z.object({
  envioId: z.number().int().positive(),
  lineaIds: z
    .array(z.number().int().positive())
    .min(1)
    .max(1000)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Los IDs de línea no deben contener duplicados",
    }),
});

export type EntradaMarcarLinea = z.infer<typeof esquemaMarcarLinea>;
export type EntradaMarcarTodo = z.infer<typeof esquemaMarcarTodo>;
export type EntradaOrdenarPorPeso = z.infer<typeof esquemaOrdenarPorPeso>;
export type EntradaDespachar = z.infer<typeof esquemaDespachar>;
export type EntradaDetalleEnvio = z.infer<typeof esquemaDetalleEnvio>;
export type EntradaReordenarCola = z.infer<typeof esquemaReordenarCola>;
export type EntradaReordenarLineas = z.infer<typeof esquemaReordenarLineas>;
