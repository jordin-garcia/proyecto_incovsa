import { z } from "zod";
export const esquemaIdNoticia = z.int().positive().max(2147483647);
export const esquemaCamposNoticia = z.object({
  titulo: z.string().trim().min(1, "Escriba el título.").max(200),
  texto: z.string().trim().min(1, "Escriba el texto."),
});
export const esquemaNoticia = esquemaCamposNoticia.extend({
  id: esquemaIdNoticia.optional(),
  imagenes: z
    .array(z.union([z.string().max(2048), z.int().min(0).max(4)]))
    .min(1, "Agregue al menos una imagen.")
    .max(5)
    .refine((v) => new Set(v).size === v.length, "Las imágenes no se pueden repetir."),
});
export type NoticiaEntrada = z.output<typeof esquemaNoticia>;
