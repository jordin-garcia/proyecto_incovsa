// Cierre de sesión (V14.3.1, JG-26). La ruta de Better Auth borra la sesión y su cookie, y responde con
// `Clear-Site-Data: "cache"`. Después la página se recarga por completo: así no queda en la memoria del navegador
// la caché del enrutador con las páginas autenticadas. Solo se cierra el sistema indicado (una sesión por sistema).
export async function cerrarSesionDelSistema(sistema: "sitio" | "picking") {
  const respuesta = await fetch(`/api/auth/${sistema}/sign-out`, {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!respuesta.ok) return false;
  window.location.replace("/?sesion=cerrada");
  return true;
}

/** Si el navegador restaura una página autenticada desde su caché de páginas (Atrás), la vuelve a pedir. */
export function recargarAlRestaurar(evento: PageTransitionEvent) {
  if (evento.persisted) window.location.reload();
}
