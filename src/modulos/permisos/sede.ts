import { cookies } from "next/headers";
import type { SesionActual } from "@/lib/sesion";
import { nombreCookie } from "@/lib/cookies";
import { registrarEnServidor } from "@/lib/registro";
import { sedesDelUsuario } from "./servicio";
import { esquemaSedeCookie } from "./esquemas";

/**
 * Sede de trabajo elegida (RN-17). Se envía en todo el sitio (`path=/`) para que la exportación de Reportes
 * (`/api/reportes/exportar`) use la misma sede que se ve en pantalla (R-P01, JG-26). Lleva `__Host-` en producción.
 */
export const COOKIE_SEDE = nombreCookie("incovsa-sede");
type Sede = SesionActual["sedes"][number];
export function seleccionarSedeDeTrabajo(sedes: Sede[], cookie?: string): Sede | null {
  const validada = esquemaSedeCookie.safeParse(cookie);
  return (validada.success ? sedes.find((s) => s.id === validada.data) : undefined) ?? sedes[0] ?? null;
}
/** Revalida también después de cambios de permisos o de usuario en el mismo navegador. */
export async function obtenerSedeDeTrabajo(sesion: SesionActual | null) {
  const sedes = await sedesDelUsuario(sesion);
  const cookie = (await cookies()).get(COOKIE_SEDE)?.value;
  const sede = seleccionarSedeDeTrabajo(sedes, cookie);
  // V16.3.3: una cookie con una sede que no es del usuario se ignora y queda en el registro del servidor. Una cookie
  // que se queda atrás tras un cambio de permisos es legítima, por eso no se rechaza la operación.
  if (sesion && cookie !== undefined && sede && String(sede.id) !== cookie)
    registrarEnServidor("aviso", "sede_ignorada", { sistema: sesion.sistema, usuarioId: sesion.usuario.id });
  return sede;
}
