// JG-28 (pedido del Ing. Manuel Rojas, 02/11): el banner de Quiénes somos, Industrias, Productos, Noticias y Contacto
// mide lo mismo en cada tamaño de pantalla, con el contenido centrado y sin recortarse. Corre en teléfono, tableta y
// escritorio (proyectos de playwright.config.ts).
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { irA } from "../comunes/navegacion";

const SECCIONES = ["/nosotros", "/industrias", "/productos", "/noticias", "/contacto"];

test("JG-28 / RF-SW-02 / RNF-08: los cinco banners del sitio miden lo mismo, con el contenido centrado", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const medidas: { ruta: string; alto: number }[] = [];
  for (const ruta of SECCIONES) {
    await irA(page, ruta);
    const banner = page.locator(".pag-cab");
    await expect(banner).toHaveCount(1);
    const medida = await banner.evaluate((elemento) => {
      const caja = elemento.getBoundingClientRect();
      const contenido = elemento.querySelector(":scope > .wrap")!.getBoundingClientRect();
      return {
        alto: caja.height,
        arriba: contenido.top - caja.top,
        abajo: caja.bottom - contenido.bottom,
      };
    });
    // Centrado y sin recortarse: el mismo espacio arriba y abajo, nunca negativo.
    expect(medida.arriba, ruta).toBeGreaterThanOrEqual(0);
    expect(Math.abs(medida.arriba - medida.abajo), ruta).toBeLessThanOrEqual(1);
    medidas.push({ ruta, alto: medida.alto });
    // Quiénes somos conserva sus logotipos dentro del banner.
    if (ruta === "/nosotros") await expect(banner.locator(".banner-logos")).toBeVisible();
    const axe = await new AxeBuilder({ page }).include(".pag-cab").analyze();
    expect(
      axe.violations.filter((v) => v.impact === "serious" || v.impact === "critical"),
      ruta,
    ).toEqual([]);
  }
  const altos = medidas.map((m) => m.alto);
  expect(Math.max(...altos) - Math.min(...altos), JSON.stringify(medidas)).toBeLessThanOrEqual(1);
});
