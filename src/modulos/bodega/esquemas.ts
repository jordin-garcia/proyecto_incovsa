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

export type EntradaMarcarLinea = z.infer<typeof esquemaMarcarLinea>;
export type EntradaMarcarTodo = z.infer<typeof esquemaMarcarTodo>;
export type EntradaOrdenarPorPeso = z.infer<typeof esquemaOrdenarPorPeso>;
export type EntradaDespachar = z.infer<typeof esquemaDespachar>;
