import { z } from "zod";

export const esquemaSistemaAdministrado = z.enum(["picking", "sitio"]);
export type SistemaAdministrado = z.infer<typeof esquemaSistemaAdministrado>;

const nombre = z.string().trim().max(150);
const usuario = z.string().trim().toLowerCase().max(60);
const rol = z.string().trim().max(60);
const correo = z.string().trim().max(120);
const permisos = z.array(z.string().trim().min(1).max(40)).max(40);
const sedes = z.array(z.number().int().positive()).max(20);

export const esquemaClave = z
  .object({
    clave: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .max(128, "La contraseña debe tener al menos 8 caracteres."),
    confirmarClave: z.string(),
  })
  .refine((d) => d.clave === d.confirmarClave, { message: "Las dos contraseñas no coinciden." });

export const esquemaCrearUsuario = z
  .object({
    sistema: esquemaSistemaAdministrado,
    nombre,
    usuario,
    rol,
    correo,
    permisos,
    sedes,
  })
  .and(esquemaClave)
  .superRefine((d, ctx) => {
    if (!d.nombre || !d.usuario) ctx.addIssue({ code: "custom", message: "Nombre y usuario son obligatorios." });
    if (!d.rol) ctx.addIssue({ code: "custom", message: "Escriba el rol del usuario." });
  });

export const esquemaEditarUsuario = z
  .object({
    id: z.string().min(1),
    sistema: esquemaSistemaAdministrado,
    nombre,
    rol,
    correo,
    activo: z.boolean(),
    permisos,
    sedes,
  })
  .superRefine((d, ctx) => {
    if (!d.nombre) ctx.addIssue({ code: "custom", message: "Nombre y usuario son obligatorios." });
    if (!d.rol) ctx.addIssue({ code: "custom", message: "Escriba el rol del usuario." });
  });

export const esquemaEliminarUsuario = z.object({
  id: z.string().min(1),
  sistema: esquemaSistemaAdministrado,
});

export const esquemaRestablecer = z
  .object({ id: z.string().min(1), sistema: esquemaSistemaAdministrado })
  .and(esquemaClave);
