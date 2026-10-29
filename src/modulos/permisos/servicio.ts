import type { SesionActual } from "@/lib/sesion";
import { ErrorNegocio } from "@/lib/errores";
import { esAccesoTotal, normalizarRol } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

export class ErrorAcceso extends ErrorNegocio {
  constructor() {
    super("No tiene permisos para acceder a este módulo.");
  }
}

/** Solo presentación; la operación del servidor siempre debe llamar a exigirPermiso. */
export function tienePermiso(sesion: SesionActual | null, permiso: string): boolean {
  if (!sesion || !(sesion.sistema === "sitio" ? permiso.startsWith("sit.") : permiso.startsWith("pk."))) return false;
  return esAccesoTotal(sesion.usuario.rol) || sesion.permisos.includes(permiso);
}

/** Recibe exclusivamente una sesión obtenida en el servidor, nunca datos del navegador. */
export function exigirPermiso(
  sesion: SesionActual | null,
  permiso: string,
  sede?: number,
): asserts sesion is SesionActual {
  if (!sesion || !tienePermiso(sesion, permiso)) throw new ErrorAcceso();
  if (
    sede !== undefined &&
    (!Number.isSafeInteger(sede) ||
      sede < 1 ||
      (!esAccesoTotal(sesion.usuario.rol) && !sesion.sedes.some((s) => s.id === sede)))
  )
    throw new ErrorAcceso();
}

/**
 * Administración de usuarios (specs/03): solo Gerencia y Soporte, con la sesión de ese sistema. No depende de
 * ninguna casilla de permisos. La regla `incovsa-usuarios-acceso-total` de Semgrep la exige en esas acciones.
 */
export function exigirAccesoTotal(
  sesion: SesionActual | null,
  sistema: SesionActual["sistema"],
): asserts sesion is SesionActual {
  if (!sesion || sesion.sistema !== sistema || !esAccesoTotal(sesion.usuario.rol)) throw new ErrorAcceso();
}

export async function sedesDelUsuario(sesion: SesionActual | null) {
  if (!sesion) return [];
  return esAccesoTotal(sesion.usuario.rol)
    ? prisma.sede.findMany({ orderBy: { id: "asc" }, select: { id: true, nombre: true, prefijoOdoo: true } })
    : sesion.sedes;
}

export function esPiloto(sesion: SesionActual | null): boolean {
  return !!sesion && sesion.sistema === "picking" && normalizarRol(sesion.usuario.rol) === "piloto";
}

const PERMISOS_MODULO: Record<string, readonly string[]> = {
  facturacion: ["pk.facturacion"],
  bodega: ["pk.bodega"],
  tablero: ["pk.bodega"],
  ruta: ["pk.ruta.propias", "pk.ruta.todas"],
  reportes: ["pk.reportes"],
  configuracion: ["pk.cfg.camiones"],
};
export function permisoDelModulo(sesion: SesionActual | null, modulo: string): string {
  const permisos = Object.hasOwn(PERMISOS_MODULO, modulo) ? PERMISOS_MODULO[modulo]! : [];
  return permisos.find((p) => tienePermiso(sesion, p)) ?? permisos[0] ?? "";
}
export function accesoModulo(sesion: SesionActual | null, modulo: string): boolean {
  return tienePermiso(sesion, permisoDelModulo(sesion, modulo));
}
