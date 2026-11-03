import { randomUUID } from "node:crypto";
import { z } from "zod";
import { cifrarContrasena } from "../src/lib/contrasenas";
import { prisma } from "../src/lib/prisma";
import { claveAccesoInterna, correoInterno } from "../src/lib/cuentas";
import { ErrorNegocio } from "../src/lib/errores";
import { normalizarRol } from "../src/lib/roles";
import { registrarBitacora } from "../src/modulos/bitacora/servicio";
import {
  MENSAJE_NOMBRE_MAX,
  MENSAJE_NOMBRE_USUARIO,
  MENSAJE_USUARIO_MAX,
  mensajeClave,
} from "../src/modulos/usuarios/esquemas";

export const MENSAJE_ROL_ADMIN = "El rol debe ser Gerencia o Soporte.";
export const MENSAJE_USUARIO_RESERVADO = "El nombre de usuario ya está reservado.";
export const MENSAJE_ERROR_CREAR_ADMIN =
  "No se pudo crear la cuenta. Revise los datos, la conexión y que el usuario no exista.";

// El rol se compara como en el resto de la aplicación (decisión 8) y se guarda con su nombre.
const ROLES_ADMIN: Record<string, "Gerencia" | "Soporte"> = { gerencia: "Gerencia", soporte: "Soporte" };

const esquema = z
  .object({
    nombre: z.string().trim().min(1, MENSAJE_NOMBRE_USUARIO).max(150, MENSAJE_NOMBRE_MAX),
    usuario: z.string().trim().min(1, MENSAJE_NOMBRE_USUARIO).max(60, MENSAJE_USUARIO_MAX).toLowerCase(),
    rol: z
      .string()
      .transform((rol) => ROLES_ADMIN[normalizarRol(rol)])
      .pipe(z.enum(["Gerencia", "Soporte"], { error: MENSAJE_ROL_ADMIN })),
    clave: z.string(),
    confirmarClave: z.string(),
  })
  .superRefine((d, ctx) => {
    const mensaje = mensajeClave(d.clave, d.confirmarClave);
    if (mensaje) ctx.addIssue({ code: "custom", message: mensaje, path: ["clave"] });
  });

/**
 * Lo que crear-admin muestra en la terminal: solo los mensajes propios de la validación y de la regla del nombre
 * reservado. Cualquier otro error (conexión, base de datos) da el mensaje general, sin su texto técnico.
 */
export function mensajeDeError(error: unknown): string {
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? MENSAJE_ERROR_CREAR_ADMIN;
  if (error instanceof ErrorNegocio) return error.message;
  return MENSAJE_ERROR_CREAR_ADMIN;
}

export async function crearAdministrador(entrada: unknown) {
  const datos = esquema.parse(entrada);
  const password = await cifrarContrasena(datos.clave);
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${"crear-admin:" + datos.usuario}, 0))`;
    if (await tx.usuario.findFirst({ where: { displayUsername: { equals: datos.usuario, mode: "insensitive" } } }))
      throw new ErrorNegocio(MENSAJE_USUARIO_RESERVADO);
    const id = randomUUID();
    const username = claveAccesoInterna("ambos", datos.usuario);
    await tx.usuario.create({
      data: {
        id,
        name: datos.nombre,
        username,
        displayUsername: datos.usuario,
        email: correoInterno(username),
        sistema: "ambos",
        rol: datos.rol,
        cuentas: { create: { id: randomUUID(), accountId: id, providerId: "credential", password } },
      },
    });
    await registrarBitacora(tx, {
      sistema: "sitio",
      operacion: "Creación de usuario",
      entidad: "usuario",
      registroId: id,
      usuarioId: id,
      detalle: { origen: "crear-admin" },
    });
    return { id };
  });
}
