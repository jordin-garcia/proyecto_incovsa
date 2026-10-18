"use server";

import { cookies, headers } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { ErrorNegocio, MENSAJE_ERROR_GENERAL } from "@/lib/errores";
import { aplicarCookiesAuth } from "@/lib/cookies-auth";
import { esquemaSistema, esquemaUsuario } from "./esquemas";
import { consultarSistemas, iniciarSesion, cerrarSesion } from "./servicio";

function errorSeguro(error: unknown) {
  unstable_rethrow(error);
  if (error instanceof ErrorNegocio) return { ok: false as const, error: error.message };
  // Un error de Prisma o validación puede contener datos de entrada: nunca registrar el objeto recibido.
  console.error("Error inesperado en una operación de autenticación.");
  return { ok: false as const, error: MENSAJE_ERROR_GENERAL };
}

// Excepción pública de autenticación: todavía no hay una sesión a la que exigir permisos.
export async function consultarUsuario(entrada: unknown) {
  try {
    const r = await consultarSistemas(entrada, await headers());
    if (r.ok) {
      const { usuario } = esquemaUsuario.parse(entrada);
      (await cookies()).set("incovsa-acceso-usuario", usuario, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/acceso",
        maxAge: 900,
      });
    }
    return r;
  } catch (error) {
    return errorSeguro(error);
  }
}

export async function ingresar(entrada: unknown) {
  try {
    const r = await iniciarSesion(entrada, await headers());
    if (!r.ok) return r;
    await aplicarCookiesAuth(r.cabeceras);
    (await cookies()).set("incovsa-acceso-usuario", "", { path: "/acceso", maxAge: 0 });
    redirect(r.destino);
  } catch (error) {
    return errorSeguro(error);
  }
}

export async function salir(sistema: unknown) {
  try {
    const respuesta = await cerrarSesion(esquemaSistema.parse(sistema), await headers());
    await aplicarCookiesAuth(respuesta.headers);
    redirect("/");
  } catch (error) {
    return errorSeguro(error);
  }
}
