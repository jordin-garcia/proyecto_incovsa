import { z } from "zod";
const id = z.number().int().positive();
export const esquemaAbrir = z.strictObject({ id });
export const esquemaGestion = z.discriminatedUnion("tipo", [
  z.strictObject({ id, tipo: z.literal("estado"), estado: z.enum(["asignado", "en_proceso", "solucionado"]) }),
  z.strictObject({ id, tipo: z.literal("responsable"), responsableId: z.string().min(1).nullable() }),
  z.strictObject({ id, tipo: z.literal("comentario"), comentario: z.string().trim() }),
]);
export type GestionSolicitud = z.output<typeof esquemaGestion>;
