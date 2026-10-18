"use server";

import { cookies } from "next/headers";
import { obtenerSesion } from "@/lib/sesion";
import { aResultadoDeError, type Resultado } from "@/lib/errores";
import { exigirPermiso, permisoDelModulo, ErrorAcceso } from "./servicio";
import { esquemaCambioSede } from "./esquemas";
import { COOKIE_SEDE } from "./sede";

export async function cambiarSede(entrada: unknown): Promise<Resultado<{ sede: number }>> {
  try {
    const sesion = await obtenerSesion("picking");
    const campos = entrada && typeof entrada === "object" ? (entrada as Record<string, unknown>) : {};
    const permiso = permisoDelModulo(sesion, typeof campos.modulo === "string" ? campos.modulo : "");
    exigirPermiso(sesion, permiso, typeof campos.sede === "number" ? campos.sede : undefined);
    const datos = esquemaCambioSede.safeParse(entrada);
    if (!datos.success) throw new ErrorAcceso();
    (await cookies()).set(COOKIE_SEDE, String(datos.data.sede), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/picking",
    });
    return { ok: true, datos: { sede: datos.data.sede } };
  } catch (error) {
    return aResultadoDeError(error);
  }
}
