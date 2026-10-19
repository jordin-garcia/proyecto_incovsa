import { z } from "zod";

const identificacion = z
  .string()
  .trim()
  .min(1, "La identificación es obligatoria.")
  .max(40, "La identificación admite como máximo 40 caracteres.");

export const esquemaCapacidad = z
  .string()
  .trim()
  .refine((valor) => /^(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,3})?$/.test(valor) && Number(valor.replace(/,/g, "")) > 0, {
    message: "La capacidad debe ser mayor que cero.",
  })
  .transform((valor) => valor.replace(/,/g, ""));

export const esquemaGuardarCamion = z.object({
  id: z.number().int().positive().optional(),
  identificacion,
  capacidad: esquemaCapacidad,
  sedeId: z.number().int().positive(),
});

export const esquemaEliminarCamion = z.object({
  id: z.number().int().positive(),
});
