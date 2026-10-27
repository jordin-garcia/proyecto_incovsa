import { z } from "zod";
export const esquemaContacto = z.strictObject({
  sedeId: z.number().int().positive(),
  direccion: z.string().trim().max(250),
  telefono: z.string().trim().max(60),
  correo: z.string().trim().max(120),
  whatsapp: z.string().trim().max(30),
  horario: z.string().trim().max(120),
  mapaUrl: z
    .string()
    .trim()
    .refine((v) => {
      if (!v) return true;
      try {
        const u = new URL(v);
        return (
          u.protocol === "https:" &&
          u.host === "www.google.com" &&
          !u.username &&
          !u.password &&
          u.pathname === "/maps/embed" &&
          !!u.search &&
          !u.hash
        );
      } catch {
        return false;
      }
    }, "El mapa debe ser la dirección del mapa insertado de Google Maps (https://www.google.com/maps/embed?…)."),
});
export type Contacto = z.output<typeof esquemaContacto>;
