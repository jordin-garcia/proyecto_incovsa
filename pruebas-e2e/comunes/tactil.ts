import type { Locator, Page } from "@playwright/test";

export type Punto = { x: number; y: number };

const toque = (punto: Punto) => [{ identifier: 0, clientX: punto.x, clientY: punto.y }];

/**
 * Arrastre con el dedo (JG-16): pulsación larga de 420 ms, que supera el umbral de 380 ms del sensor táctil del
 * prototipo, movimiento hasta `hasta` y suelta. Chromium envía toques nativos por CDP. Firefox y WebKit no tienen CDP:
 * reciben el mismo gesto como TouchEvent sobre `tocado`, el elemento que está bajo el dedo, que es donde escucha el
 * sensor (https://playwright.dev/docs/touch-events). `antesDeSoltar` comprueba algo con el dedo todavía apoyado.
 */
export async function arrastrarConDedo(
  page: Page,
  tocado: Locator,
  desde: Punto,
  hasta: Punto,
  antesDeSoltar?: () => Promise<void>,
) {
  if (page.context().browser()?.browserType().name() === "chromium") {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [desde] });
    await page.waitForTimeout(420);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [hasta] });
    await page.waitForTimeout(100);
    await antesDeSoltar?.();
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await cdp.detach();
    return;
  }
  const inicio = toque(desde);
  await tocado.dispatchEvent("touchstart", { touches: inicio, changedTouches: inicio, targetTouches: inicio });
  await page.waitForTimeout(420);
  const fin = toque(hasta);
  await tocado.dispatchEvent("touchmove", { touches: fin, changedTouches: fin, targetTouches: fin });
  await page.waitForTimeout(100);
  await antesDeSoltar?.();
  await tocado.dispatchEvent("touchend", { touches: [], changedTouches: fin, targetTouches: [] });
}
