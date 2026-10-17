// Comparación de roles (specs/16, decisiones 7 y 8). Es la función `norm` del prototipo (base.js).

/** El rol sin mayúsculas, sin acentos y sin espacios al inicio o al final. */
export function normalizarRol(texto: string): string {
  // NFD separa cada letra de su acento (é → e + ´) y \p{M} quita los acentos.
  return texto.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

const ROLES_CON_ACCESO_TOTAL = new Set(["gerencia", "soporte"]);

/** Gerencia y Soporte tienen todos los permisos y todas las sedes por su rol (RN-38). */
export function esAccesoTotal(rol: string): boolean {
  return ROLES_CON_ACCESO_TOTAL.has(normalizarRol(rol));
}
