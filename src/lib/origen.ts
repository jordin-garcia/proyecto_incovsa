// Origen de las rutas de la API que cambian datos (specs/16, "Peticiones falsificadas (CSRF)"). Solo servidor.

/** La petición viene de la propia aplicación: su cabecera Origin coincide con la dirección pública configurada. */
export function esMismoOrigen(peticion: Request): boolean {
  return peticion.headers.get("origin") === new URL(process.env.BETTER_AUTH_URL ?? peticion.url).origin;
}
