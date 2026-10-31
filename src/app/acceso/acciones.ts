"use server";

import { cookies, headers } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { ErrorNegocio, MENSAJE_ERROR_GENERAL, describirError } from "@/lib/errores";
import { registrarEnServidor } from "@/lib/registro";
import { aplicarCookiesAuth } from "@/lib/cookies-auth";
import { atributosCookie, cookieAccesoUsuario } from "@/lib/cookies";
import { esquemaUsuario } from "./esquemas";
import { consultarSistemas, iniciarSesion } from "./servicio";

function errorSeguro(error: unknown, operacion: string) {
  unstable_rethrow(error);
  if (error instanceof ErrorNegocio) return { ok: false as const, error: error.message };
  // Un error de Prisma o validación puede contener datos de entrada: se registra su tipo y ubicación, nunca su
  // mensaje ni el objeto recibido (V16.3.4, JG-26).
  registrarEnServidor("error", "error_inesperado", { operacion, ...describirError(error) });
  return { ok: false as const, error: MENSAJE_ERROR_GENERAL };
}

// Excepción pública de autenticación: todavía no hay una sesión a la que exigir permisos.
export async function consultarUsuario(entrada: unknown) {
  try {
    const r = await consultarSistemas(entrada, await headers());
    if (r.ok) {
      const { usuario } = esquemaUsuario.parse(entrada);
      // __Host- en producción (V3.3.3, JG-26): por eso path=/ en lugar de /acceso.
      (await cookies()).set(cookieAccesoUsuario(), usuario, atributosCookie(900));
    }
    return r;
  } catch (error) {
    return errorSeguro(error, "acceso.consultar_usuario");
  }
}

export async function ingresar(entrada: unknown) {
  try {
    const r = await iniciarSesion(entrada, await headers());
    if (!r.ok) return r;
    await aplicarCookiesAuth(r.cabeceras);
    (await cookies()).set(cookieAccesoUsuario(), "", atributosCookie(0));
    redirect(r.destino);
  } catch (error) {
    return errorSeguro(error, "acceso.iniciar_sesion");
  }
}
