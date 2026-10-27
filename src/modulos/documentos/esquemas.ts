import { z } from "zod";

/** Se valida el origen y se extrae un identificador completo, nunca una dirección arbitraria. */
export function idDrive(enlace: string): string | null {
  try {
    const url = new URL(enlace);
    if (
      url.protocol !== "https:" ||
      !["drive.google.com", "docs.google.com"].includes(url.hostname) ||
      url.username ||
      url.password ||
      url.port
    )
      return null;
    const ruta = url.pathname.match(/^\/(?:file|document|spreadsheets|presentation)\/d\/([\w-]{10,})(?:\/|$)/);
    const id = ruta?.[1] ?? (["/open", "/uc"].includes(url.pathname) ? url.searchParams.get("id") : null);
    return id && /^[\w-]{10,}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}
const enlace = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => !v || !!idDrive(v), "El enlace debe ser de Google Drive (https://drive.google.com/…).");
export const esquemaProducto = z
  .object({
    id: z.number().int().positive().optional(),
    producto: z.string().trim().min(1, "Escriba el nombre del producto.").max(150),
    paisId: z.number().int().positive("Elija el país de origen."),
    lote: z
      .string()
      .trim()
      .min(1, "Escriba el lote: es obligatorio.")
      .max(40)
      .regex(/^[\p{L}\p{N}]+$/u, "El lote solo admite letras y números."),
    enlaceFt: enlace,
    enlaceHs: enlace,
    enlaceCoa: enlace,
  })
  .strict();
export const esquemaId = z.object({ id: z.number().int().positive() }).strict();
export const esquemaBusqueda = z.string().trim().max(200);
