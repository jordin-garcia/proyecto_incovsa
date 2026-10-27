import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

// Requiere node scripts/servir-prototipo.mjs. No cambia la semilla ni la aplicación.
const carpeta = "pruebas-e2e/sitio/evidencias/DM-11";
await mkdir(carpeta, { recursive: true });
const browser = await chromium.launch();
const registro = [];
try {
  for (const [width, height] of [
    [390, 844],
    [768, 1024],
    [1440, 900],
  ]) {
    const contexto = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
    const page = await contexto.newPage();
    const rutas = [
      ...["/", "/nosotros", "/industrias", "/productos", "/noticias", "/contacto", "/acceso"].map((ruta) => [
        ruta.slice(1) || "inicio",
        ruta,
      ]),
      ...["resumen", "contenido", "industrias", "catalogo", "noticias", "contacto", "solicitudes", "documentos"].map(
        (seccion) => [`ejemplo.08-${seccion}`, `/panel${seccion === "resumen" ? "" : `/${seccion}`}?cuenta=ejemplo.08`],
      ),
      ...["ejemplo.09", "ejemplo.10"].map((cuenta) => [`${cuenta}-documentos`, `/panel/documentos?cuenta=${cuenta}`]),
      ["usuarios", "/panel/usuarios?cuenta=ejemplo.01"],
    ];
    for (const [nombre, ruta] of rutas) {
      await page.goto(`http://127.0.0.1:4173/#${ruta}`);
      await page.locator("h1").waitFor({ state: "visible" });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: `${carpeta}/prototipo-${nombre}-${width}.png`,
        fullPage: true,
        animations: "disabled",
      });
      registro.push({ nombre, width, ruta, titulos: await page.locator("h1, h2, h3").allTextContents() });
      console.log(`${width} ${nombre}`);
      if (nombre === "productos") {
        await page.locator(".prod-t").first().click();
        await page.locator(".det-lay").waitFor();
        await page.screenshot({
          path: `${carpeta}/prototipo-detalle-${width}.png`,
          fullPage: true,
          animations: "disabled",
        });
      }
    }
    await contexto.close();
  }
  await writeFile(`${carpeta}/prototipo-pantallas.json`, JSON.stringify(registro, null, 2));
} finally {
  await browser.close();
}
