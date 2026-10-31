// Cookies propias de la aplicación (specs/16, "Autenticación y sesiones"; ASVS V3.3.1 y V3.3.3, JG-26).
// En producción todas llevan el prefijo __Host-: el navegador solo las acepta con Secure, path=/ y sin Domain, así
// que no se comparten con otros hosts ni se pueden sobrescribir desde un subdominio. En desarrollo y en las pruebas,
// por HTTP, conservan el nombre sin prefijo.

export const PREFIJO_HOST = "__Host-";

const esProduccion = () => process.env.NODE_ENV === "production";

/** Nombre real de una cookie propia: `__Host-<base>` en producción, `<base>` en desarrollo y pruebas. */
export function nombreCookie(base: string): string {
  return `${esProduccion() ? PREFIJO_HOST : ""}${base}`;
}

/** Atributos de toda cookie propia: los que exige el prefijo __Host- (Secure, path=/ y sin Domain). */
export function atributosCookie(maxAge?: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: esProduccion(),
    path: "/",
    ...(maxAge === undefined ? {} : { maxAge }),
  };
}

/** Nombre base de la cookie de sesión de cada sistema (una sesión por sistema, specs/03). */
export const cookieSesion = (sistema: "sitio" | "picking") => nombreCookie(`incovsa-${sistema}.session_token`);

/** Usuario escrito en el primer paso del acceso personal, hasta que inicia sesión (15 minutos). */
export const cookieAccesoUsuario = () => nombreCookie("incovsa-acceso-usuario");
