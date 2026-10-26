import { z } from "zod";

export const esquemaReordenarRecorrido = z.object({
  envioId: z.number().int().positive(),
  entregaIds: z.array(z.number().int().positive()).min(1),
});

export const esquemaEntregarRuta = z.object({
  envioId: z.number().int().positive(),
});

export type EntradaReordenarRecorrido = z.infer<typeof esquemaReordenarRecorrido>;
export type EntradaEntregarRuta = z.infer<typeof esquemaEntregarRuta>;
