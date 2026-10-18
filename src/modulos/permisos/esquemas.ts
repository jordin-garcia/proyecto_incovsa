import { z } from "zod";
export const esquemaCambioSede = z.object({
  sede: z.number().int().positive(),
  modulo: z.enum(["facturacion", "bodega", "ruta", "reportes"]),
});
