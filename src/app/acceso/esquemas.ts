import { z } from "zod";

export const esquemaSistema = z.enum(["sitio", "picking"]);
export type Sistema = z.infer<typeof esquemaSistema>;
export const esquemaUsuario = z.object({
  usuario: z
    .string({ error: "Escriba su nombre de usuario." })
    .trim()
    .min(1, "Escriba su nombre de usuario.")
    .max(60, "Escriba su nombre de usuario.")
    .toLowerCase(),
});
export const esquemaIngreso = esquemaUsuario.extend({
  sistema: esquemaSistema,
  clave: z.string().min(1, "Usuario o contraseña incorrectos.").max(128, "Usuario o contraseña incorrectos."),
});
export type DatosIngreso = z.infer<typeof esquemaIngreso>;
