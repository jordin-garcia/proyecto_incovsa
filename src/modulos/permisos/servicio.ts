import type { SesionActual } from "@/lib/sesion";
import { ErrorNegocio } from "@/lib/errores";
import { esAccesoTotal, normalizarRol } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { fijarContextoRegistro, registrarEnServidor } from "@/lib/registro";

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

type MotivoRechazo = "sin_sesion" | "sin_permiso" | "sede_ajena" | "origen_ajeno" | "entrada_invalida";

/**
 * Rechazo de autorización (ASVS V16.3.2 y V16.3.3): deja una línea en el registro del servidor con el motivo, la
 * operación, el sistema y el usuario, sin datos personales, y lanza ErrorAcceso. La bitácora de Reportes no lo guarda.
 */
export function rechazarAcceso(
  motivo: MotivoRechazo,
  datos: { sistema?: string; usuarioId?: string; operacion?: string; sede?: number } = {},
): never {
  registrarEnServidor("aviso", "autorizacion_rechazada", { motivo, ...datos });
  throw new ErrorAcceso();
}

const sistemaDelPermiso = (permiso: string) =>
  permiso.startsWith("pk.") ? "picking" : permiso.startsWith("sit.") ? "sitio" : undefined;

/**
 * Recibe exclusivamente una sesión obtenida en el servidor, nunca datos del navegador. Fija además el contexto del
 * registro del servidor (sistema, usuario y operación) para el resto de la operación (`src/lib/registro.ts`).
 */
export function exigirPermiso(
  sesion: SesionActual | null,
  permiso: string,
  sede?: number,
): asserts sesion is SesionActual {
  const contexto = {
    sistema: sesion?.sistema ?? sistemaDelPermiso(permiso),
    usuarioId: sesion?.usuario.id,
    operacion: permiso,
  };
  fijarContextoRegistro(contexto);
  if (!sesion) rechazarAcceso("sin_sesion", contexto);
  if (!tienePermiso(sesion, permiso)) rechazarAcceso("sin_permiso", contexto);
  if (
    sede !== undefined &&
    (!Number.isSafeInteger(sede) ||
      sede < 1 ||
      (!esAccesoTotal(sesion.usuario.rol) && !sesion.sedes.some((s) => s.id === sede)))
  )
    rechazarAcceso("sede_ajena", { ...contexto, sede: Number.isSafeInteger(sede) ? sede : undefined });
}

/**
 * Administración de usuarios (specs/03): solo Gerencia y Soporte, con la sesión de ese sistema. No depende de
 * ninguna casilla de permisos. La regla `incovsa-usuarios-acceso-total` de Semgrep la exige en esas acciones.
 */
export function exigirAccesoTotal(
  sesion: SesionActual | null,
  sistema: SesionActual["sistema"],
): asserts sesion is SesionActual {
  const contexto = { sistema, usuarioId: sesion?.usuario.id, operacion: "acceso_total" };
  fijarContextoRegistro(contexto);
  if (!sesion) rechazarAcceso("sin_sesion", contexto);
  if (sesion.sistema !== sistema || !esAccesoTotal(sesion.usuario.rol)) rechazarAcceso("sin_permiso", contexto);
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
