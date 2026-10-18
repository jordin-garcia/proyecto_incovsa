import { z } from "zod";
export const esquemaSedeCookie = z
  .string()
  .regex(/^[1-9]\d*$/)
  .transform(Number)
  .pipe(z.number().int().positive());
export const esquemaRutaModulo = z.array(z.string().min(1).max(40)).length(1);
export const esquemaCambioSede = z.object({
  sede: z.number().int().positive(),
  modulo: z.enum(["facturacion", "bodega", "ruta", "reportes"]),
});
