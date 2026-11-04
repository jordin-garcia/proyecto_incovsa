// Cookies que crean las pruebas directamente en el navegador (JG-26). Con el servidor de producción
// (pruebas-e2e/flujo/servidor-produccion.ts) las cookies propias llevan __Host-, Secure y path=/; con el servidor de
// desarrollo, por HTTP, no llevan prefijo.

/** Sede de trabajo elegida (RN-17), como la guarda `cambiarSede`. */
export function cookieDeSede(sedeId: number, url: string, { produccion }: { produccion: boolean }) {
  return {
    name: `${produccion ? "__Host-" : ""}incovsa-sede`,
    value: String(sedeId),
    domain: new URL(url).hostname,
    path: "/",
    secure: produccion,
    httpOnly: true,
    sameSite: "Lax" as const,
  };
}
