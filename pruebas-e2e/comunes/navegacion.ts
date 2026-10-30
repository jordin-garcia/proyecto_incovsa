import type { Page } from "@playwright/test";

// Después de guardar, las pantallas llaman a router.refresh(). Si la prueba navega mientras esa petición está en
// curso, Firefox («NS_BINDING_ABORTED») y WebKit («interrupted by another navigation») cancelan la navegación de la
// prueba: Next.js actualiza la dirección o, si se cancela su petición, recarga la página por su cuenta. Chromium no la
// cancela (JG-16). No es algo que vea una persona: se espera a que termine la carga que inició la aplicación y a que
// la página quede quieta, y se repite. Cualquier otro error falla igual que con page.goto y page.reload.
const INTERRUMPIDA = /NS_BINDING_ABORTED|is interrupted by another navigation/;
const INTENTOS = 3;

async function repetirSiSeInterrumpe<T>(page: Page, navegar: () => Promise<T>): Promise<T> {
  for (let intento = 1; ; intento++) {
    try {
      return await navegar();
    } catch (error) {
      if (intento >= INTENTOS || !INTERRUMPIDA.test(String(error))) throw error;
      await page.waitForLoadState("load");
      await page.waitForTimeout(1000 * intento);
    }
  }
}

/** page.goto, repetido si la propia aplicación interrumpe la navegación. */
export function irA(page: Page, url: string, opciones?: Parameters<Page["goto"]>[1]) {
  return repetirSiSeInterrumpe(page, () => page.goto(url, opciones));
}

/** page.reload, repetido si la propia aplicación interrumpe la recarga. */
export function recargar(page: Page, opciones?: Parameters<Page["reload"]>[0]) {
  return repetirSiSeInterrumpe(page, () => page.reload(opciones));
}
