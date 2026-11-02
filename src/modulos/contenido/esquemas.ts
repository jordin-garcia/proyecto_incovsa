import { z } from "zod";
const textoLargo = z.string().trim().max(10_000, "El texto admite hasta 10 000 caracteres.");
export const esquemaTexto = z.object({ texto: textoLargo });
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
    if (["mision", "vision", "historia"].includes(d.bloque) && d.texto.length > 10_000)
      ctx.addIssue({
        code: "too_big",
        origin: "string",
        maximum: 10_000,
        inclusive: true,
        path: ["texto"],
        message: "El texto admite hasta 10 000 caracteres.",
      });
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
