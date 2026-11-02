import { z } from "zod";
export const esquemaContacto = z.strictObject({
  sedeId: z.number({ error: "Elija la sede." }).int("Elija la sede.").positive("Elija la sede."),
  direccion: z.string().trim().max(250, "La dirección admite hasta 250 caracteres."),
  telefono: z.string().trim().max(60, "El teléfono admite hasta 60 caracteres."),
  correo: z
    .string()
    .trim()
    .max(120, "El correo admite hasta 120 caracteres.")
    .refine((v) => !v || z.email().safeParse(v).success, "Indique un correo válido."),
  whatsapp: z.string().trim().max(30, "WhatsApp admite hasta 30 caracteres."),
  horario: z.string().trim().max(120, "El horario admite hasta 120 caracteres."),
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
