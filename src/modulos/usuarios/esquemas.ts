import { z } from "zod";
import { esAccesoTotal } from "@/lib/roles";
import type { SistemaPestana } from "./tipos";

export const MIN_CLAVE = 8;
export const MAX_CLAVE = 128;

export const MENSAJE_NOMBRE_USUARIO = "Nombre y usuario son obligatorios.";
export const MENSAJE_NOMBRE_MAX = "El nombre admite hasta 150 caracteres.";
export const MENSAJE_USUARIO_MAX = "El nombre de usuario admite hasta 60 caracteres.";
export const MENSAJE_ROL = "Escriba el rol del usuario.";
export const MENSAJE_ROL_MAX = "El rol admite hasta 60 caracteres.";
export const MENSAJE_CORREO_MAX = "El correo admite hasta 120 caracteres.";
export const MENSAJE_CLAVE_CORTA = `La contraseña debe tener al menos ${MIN_CLAVE} caracteres.`;
export const MENSAJE_CLAVE_LARGA = `La contraseña admite hasta ${MAX_CLAVE} caracteres.`;
export const MENSAJE_CLAVE_DISTINTA = "Las dos contraseñas no coinciden.";
export const MENSAJE_SEDE = "Marque al menos una sede.";

/** Misma comprobación que `errClave` del prototipo: primero el largo, después la coincidencia. */
export function mensajeClave(clave: string, confirmar: string): string | null {
  if (clave.length < MIN_CLAVE) return MENSAJE_CLAVE_CORTA;
  if (clave.length > MAX_CLAVE) return MENSAJE_CLAVE_LARGA;
  if (clave !== confirmar) return MENSAJE_CLAVE_DISTINTA;
  return null;
}

const esquemaNombre = z
  .string({ error: MENSAJE_NOMBRE_USUARIO })
  .transform((valor) => valor.trim())
  .pipe(z.string().min(1, MENSAJE_NOMBRE_USUARIO).max(150, MENSAJE_NOMBRE_MAX));

const esquemaNombreUsuario = z
  .string({ error: MENSAJE_NOMBRE_USUARIO })
  .transform((valor) => valor.trim().toLowerCase())
  .pipe(z.string().min(1, MENSAJE_NOMBRE_USUARIO).max(60, MENSAJE_USUARIO_MAX));

const esquemaRol = z
  .string({ error: MENSAJE_ROL })
  .transform((valor) => valor.trim())
  .pipe(z.string().min(1, MENSAJE_ROL).max(60, MENSAJE_ROL_MAX));

const esquemaCorreo = z
  .union([z.string().trim().max(120, MENSAJE_CORREO_MAX), z.null()])
  .optional()
  .transform((valor) => (valor ? valor : null));

const esquemaIdSede = z
  .union([z.number().int().positive(), z.string().regex(/^\d+$/)])
  .transform((valor) => (typeof valor === "number" ? valor : Number(valor)))
  .pipe(z.number().int().positive());

const esquemaSedes = z.array(esquemaIdSede).default([]);
const esquemaPermisos = z.array(z.string()).default([]);

const campos = {
  nombre: esquemaNombre,
  rol: esquemaRol,
  correo: esquemaCorreo,
  sedesIds: esquemaSedes,
  permisosCodigos: esquemaPermisos,
};

function revisarClave(valor: { clave?: string; confirmarClave?: string }, ctx: z.RefinementCtx) {
  const mensaje = mensajeClave(valor.clave ?? "", valor.confirmarClave ?? "");
  if (!mensaje) return;
  ctx.addIssue({
    code: "custom",
    message: mensaje,
    path: [mensaje === MENSAJE_CLAVE_DISTINTA ? "confirmarClave" : "clave"],
  });
}

function revisarSedes(sistema: SistemaPestana, valor: { rol: string; sedesIds: number[] }, ctx: z.RefinementCtx) {
  if (sistema === "picking" && !esAccesoTotal(valor.rol) && valor.sedesIds.length === 0) {
    ctx.addIssue({ code: "custom", message: MENSAJE_SEDE, path: ["sedesIds"] });
  }
}

export const esquemaCrearUsuarioPicking = z
  .object({
    ...campos,
    usuario: esquemaNombreUsuario,
    clave: z.string({ error: MENSAJE_CLAVE_CORTA }),
    confirmarClave: z.string({ error: MENSAJE_CLAVE_DISTINTA }),
  })
  .superRefine((valor, ctx) => {
    revisarClave(valor, ctx);
    revisarSedes("picking", valor, ctx);
  });

export const esquemaEditarUsuarioPicking = z
  .object({
    ...campos,
    id: z.string().min(1),
    activo: z.boolean(),
  })
  .superRefine((valor, ctx) => {
    revisarSedes("picking", valor, ctx);
  });

export const esquemaEliminarUsuario = z.object({
  id: z.string().min(1),
});

export const esquemaRestablecerClave = z
  .object({
    id: z.string().min(1),
    clave: z.string({ error: MENSAJE_CLAVE_CORTA }),
    confirmarClave: z.string({ error: MENSAJE_CLAVE_DISTINTA }),
  })
  .superRefine((valor, ctx) => {
    revisarClave(valor, ctx);
  });

export type EntradaCrearUsuario = z.output<typeof esquemaCrearUsuarioPicking>;
export type EntradaEditarUsuario = z.output<typeof esquemaEditarUsuarioPicking>;
export type EntradaEliminarUsuario = z.output<typeof esquemaEliminarUsuario>;
export type EntradaRestablecerClave = z.output<typeof esquemaRestablecerClave>;
