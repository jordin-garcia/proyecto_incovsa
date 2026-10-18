/** Sistema de una cuenta: "ambos" solo en las cuentas de Gerencia y Soporte (decisión 26). */
export type SistemaCuenta = "sitio" | "picking" | "ambos";

/**
 * Clave de acceso interna que recibe Better Auth: sistema + "." + nombre de usuario, en minúsculas
 * (por ejemplo, `picking.maria.argueta`). Es única en toda la tabla `usuario` (decisión 26, RN-54).
 */
export function claveAccesoInterna(sistema: SistemaCuenta, nombreUsuario: string): string {
  return `${sistema}.${nombreUsuario.trim().toLowerCase()}`;
}

/**
 * Correo interno único que exige Better Auth, derivado de la clave de acceso interna. Usa el dominio reservado
 * `.invalid` (RFC 2606): nunca se muestra ni puede recibir correos. El correo real va en `usuario.correo`.
 */
export function correoInterno(clave: string): string {
  return `${clave}@incovsa.invalid`;
}
