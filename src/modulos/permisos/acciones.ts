"use server";

import { cookies } from "next/headers";
import { obtenerSesion } from "@/lib/sesion";
import { aResultadoDeError, type Resultado } from "@/lib/errores";
import { atributosCookie } from "@/lib/cookies";
import { exigirPermiso, permisoDelModulo, rechazarAcceso } from "./servicio";
import { esquemaCambioSede } from "./esquemas";
import { COOKIE_SEDE } from "./sede";

export async function cambiarSede(entrada: unknown): Promise<Resultado<{ sede: number }>> {
  try {
    const sesion = await obtenerSesion("picking");
    const campos = entrada && typeof entrada === "object" ? (entrada as Record<string, unknown>) : {};
    const permiso = permisoDelModulo(sesion, typeof campos.modulo === "string" ? campos.modulo : "");
    exigirPermiso(sesion, permiso, typeof campos.sede === "number" ? campos.sede : undefined);
    const datos = esquemaCambioSede.safeParse(entrada);
    if (!datos.success)
      rechazarAcceso("entrada_invalida", { sistema: "picking", usuarioId: sesion.usuario.id, operacion: permiso });
    // R-P01: path=/ para que la exportación de Reportes reciba la sede elegida (atributos de __Host-).
    (await cookies()).set(COOKIE_SEDE, String(datos.data.sede), atributosCookie());
    return { ok: true, datos: { sede: datos.data.sede } };
  } catch (error) {
    return aResultadoDeError(error);
  }
}
