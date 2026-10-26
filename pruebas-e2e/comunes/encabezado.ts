import { expect, type Page } from "@playwright/test";

/**
 * RF-SL-61: el encabezado del módulo tiene la estructura de `cab()` del prototipo (eyebrow, título, instrucción breve y
 * acciones) y la instrucción va a la par del título siempre que quepa. Como en `.cab-fx-t` del prototipo, solo pasa
 * debajo cuando no queda el mínimo de 240 px a la derecha del título (auditoría del 22/10, H-17 y H-29).
 */
export async function comprobarEncabezadoModulo(
  page: Page,
  textos: { eyebrow?: string; titulo?: string; instruccion?: string; accion?: string } = {},
) {
  const cab = page.locator(".contenido .cab-pag.cab-fx").first();
  await expect(cab).toBeVisible();
  const titulo = cab.locator(".cab-fx-t h1");
  const instruccion = cab.locator(".cab-fx-t > .cab-fx-txt");
  await expect(cab.locator(".cab-fx-t .eyebrow")).toBeVisible();
  await expect(titulo).toBeVisible();
  await expect(instruccion).toBeVisible();
  if (textos.eyebrow) await expect(cab.locator(".eyebrow")).toHaveText(textos.eyebrow);
  if (textos.titulo) await expect(titulo).toHaveText(textos.titulo);
  if (textos.instruccion) await expect(instruccion).toHaveText(textos.instruccion);
  if (textos.accion) await expect(cab.locator(".acc").getByRole("link", { name: textos.accion })).toBeVisible();
  await expect(titulo).toHaveCSS("font-size", "26px");

  const medidas = await cab.evaluate((el) => {
    const caja = (selector: string) => el.querySelector(selector)!.getBoundingClientRect();
    const fila = el.querySelector(".cab-fx-t")!;
    const separacion = parseFloat(getComputedStyle(fila).columnGap) || 0;
    const bloqueTitulo = caja(".cab-fx-t > div");
    return {
      cabeza: caja(".cab-fx-t"),
      bloqueTitulo,
      titulo: caja(".cab-fx-t h1"),
      instruccion: caja(".cab-fx-t > .cab-fx-txt"),
      cabecera: el.getBoundingClientRect(),
      acciones: el.querySelector(".acc")?.getBoundingClientRect() ?? null,
      cabeDerecha: fila.getBoundingClientRect().width - bloqueTitulo.width - separacion >= 240,
    };
  });

  if (medidas.cabeDerecha) {
    // A la par: a la derecha del título y en la misma franja vertical.
    expect(medidas.instruccion.left).toBeGreaterThanOrEqual(medidas.titulo.right);
    expect(medidas.instruccion.top).toBeLessThan(medidas.titulo.bottom);
    expect(medidas.instruccion.bottom).toBeGreaterThan(medidas.titulo.top);
  } else {
    expect(medidas.instruccion.top).toBeGreaterThanOrEqual(medidas.bloqueTitulo.bottom - 1);
  }

  if (medidas.acciones) {
    const ancho = page.viewportSize()!.width;
    if (ancho <= 720) {
      // Teléfono: las acciones bajan y ocupan todo el ancho (`@media (max-width: 720px)` de `.cab-fx`).
      expect(medidas.acciones.top).toBeGreaterThanOrEqual(medidas.cabeza.bottom - 1);
      expect(Math.abs(medidas.acciones.width - medidas.cabecera.width)).toBeLessThanOrEqual(1);
    } else {
      // Tableta y escritorio: el botón queda a la derecha del bloque del título.
      expect(medidas.acciones.left).toBeGreaterThanOrEqual(medidas.cabeza.right - 1);
    }
  }
}
