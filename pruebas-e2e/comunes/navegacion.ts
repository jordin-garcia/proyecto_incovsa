import type { Page } from "@playwright/test";

// Después de guardar, las pantallas llaman a router.refresh() y Next.js actualiza la dirección con
// history.replaceState. Si la prueba navega en ese mismo instante, Firefox («NS_BINDING_ABORTED») y WebKit
// («interrupted by another navigation») cancelan la navegación de la prueba; Chromium no (JG-16). No es algo que vea
// una persona: solo se repite la navegación. Cualquier otro error falla igual que con page.goto y page.reload.
const INTERRUMPIDA = /NS_BINDING_ABORTED|is interrupted by another navigation/;
const INTENTOS = 3;

async function repetirSiSeInterrumpe<T>(navegar: () => Promise<T>): Promise<T> {
  for (let intento = 1; ; intento++) {
    try {
      return await navegar();
    } catch (error) {
      if (intento >= INTENTOS || !INTERRUMPIDA.test(String(error))) throw error;
    }
  }
}

/** page.goto, repetido si la propia aplicación interrumpe la navegación. */
export function irA(page: Page, url: string, opciones?: Parameters<Page["goto"]>[1]) {
  return repetirSiSeInterrumpe(() => page.goto(url, opciones));
}

/** page.reload, repetido si la propia aplicación interrumpe la recarga. */
export function recargar(page: Page, opciones?: Parameters<Page["reload"]>[0]) {
  return repetirSiSeInterrumpe(() => page.reload(opciones));
}
