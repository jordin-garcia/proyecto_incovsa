import { z } from "zod";
export const esquemaIdCatalogo = z.int().positive().max(2147483647);
const imagenes = z
  .array(z.union([z.string().max(2048), z.int().min(0).max(4)]))
  .max(5)
  .refine((v) => new Set(v).size === v.length, "Las imágenes no se pueden repetir.");
export const esquemaIndustriaPanel = z.object({ id: esquemaIdCatalogo, descripcion: z.string().trim(), imagenes });
export const esquemaCamposProducto = z.object({
  nombre: z.string().trim().min(1, "Escriba el nombre.").max(150),
  descripcion: z.string().trim(),
  presentacion: z.string().trim().max(150),
  paisesOrigen: z.string().trim().max(200),
});
export const esquemaProductoPanel = esquemaCamposProducto.extend({
  id: esquemaIdCatalogo.optional(),
  industrias: z
    .array(esquemaIdCatalogo)
    .max(9)
    .refine((v) => new Set(v).size === v.length),
  imagenes,
});
export type IndustriaPanelEntrada = z.output<typeof esquemaIndustriaPanel>;
export type ProductoPanelEntrada = z.output<typeof esquemaProductoPanel>;
