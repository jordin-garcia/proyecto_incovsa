import type { Page } from "@playwright/test";

type VentanaConAvisos = Window & { __avisosE2E?: string[] };

/**
 * Empieza a anotar los avisos que muestra la pantalla (región «status» y lista «Avisos»). Radix deja el texto en la
 * región «status» solo un segundo, y en WebKit el clic termina después de que la página se actualiza, así que una
 * comprobación posterior puede llegar tarde (JG-16). Se llama antes de la acción y se consulta con avisosMostrados.
 */
export async function anotarAvisos(page: Page) {
  await page.evaluate(() => {
    const ventana = window as VentanaConAvisos;
    // Si ya se anotaban en esta página, se empieza de cero para no aceptar un aviso anterior.
    if (ventana.__avisosE2E) {
      ventana.__avisosE2E.length = 0;
      return;
    }
    const avisos: string[] = [];
    ventana.__avisosE2E = avisos;
    const anotar = () => {
      for (const elemento of document.querySelectorAll('[role="status"], .avisos li')) {
        const texto = elemento.textContent?.trim();
        if (texto && !avisos.includes(texto)) avisos.push(texto);
      }
    };
    new MutationObserver(anotar).observe(document.body, { childList: true, subtree: true, characterData: true });
  });
}

/** Textos de los avisos mostrados desde anotarAvisos, aunque ya se hayan ocultado. */
export function avisosMostrados(page: Page) {
  return page.evaluate(() => (window as VentanaConAvisos).__avisosE2E ?? []);
}
