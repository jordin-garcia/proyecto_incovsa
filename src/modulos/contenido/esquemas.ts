import { z } from "zod";
export const esquemaTexto = z.object({ texto: z.string().trim() });
export const nombresBloques = {
  portada: "Portada",
  mision: "Misión",
  vision: "Visión",
  historia: "Historia",
  valores: "Valores",
  logo: "Logotipo de INCOVSA",
  inquiserca: "Logotipo de Inquiserca",
} as const;
export const esquemaPublicacion = z
  .object({
    bloque: z.enum(["portada", "mision", "vision", "historia", "valores", "logo", "inquiserca"]),
    texto: z.string().trim(),
    imagenes: z.array(z.union([z.string().max(2048), z.number().int().min(0).max(4), z.null()])).max(5),
  })
  .superRefine((d, ctx) => {
    if (
      d.bloque === "valores"
        ? d.imagenes.length !== 5
        : ["logo", "inquiserca"].includes(d.bloque) && d.imagenes.length > 1
    )
      ctx.addIssue({ code: "custom", message: "Cantidad de imágenes no válida." });
    if (!["valores", "logo", "inquiserca"].includes(d.bloque) && d.imagenes.includes(null))
      ctx.addIssue({ code: "custom", message: "La galería no admite posiciones vacías." });
  });
export type Publicacion = z.output<typeof esquemaPublicacion>;
export type Bloque = Publicacion["bloque"];
