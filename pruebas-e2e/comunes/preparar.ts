import { expect, type Page } from "@playwright/test";

/** Espera la hidratación antes de interactuar o de que una captura oculte el cursor. */
export async function abrirMuestra(page: Page, ruta: string) {
  await page.goto(ruta === "/panel" || ruta === "/picking" ? `/muestras${ruta}` : ruta);
  await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
}
