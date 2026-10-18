import { cookies } from "next/headers";
import type { SesionActual } from "@/lib/sesion";
import { sedesDelUsuario } from "./servicio";

export const COOKIE_SEDE = "incovsa-sede";
type Sede = SesionActual["sedes"][number];
export function seleccionarSedeDeTrabajo(sedes: Sede[], cookie?: string): Sede | null {
  return sedes.find((s) => String(s.id) === cookie) ?? sedes[0] ?? null;
}
/** Revalida también después de cambios de permisos o de usuario en el mismo navegador. */
export async function obtenerSedeDeTrabajo(sesion: SesionActual | null) {
  return seleccionarSedeDeTrabajo(await sedesDelUsuario(sesion), (await cookies()).get(COOKIE_SEDE)?.value);
}
