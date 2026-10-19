import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

try {
  process.loadEnvFile();
} catch {
  // Ignorar si no existe
}

if (!process.env.CLAVE_DEMO) throw new Error("Falta CLAVE_DEMO en el entorno de demostración.");

// Preparar datos de prueba
execSync("npx tsx pruebas-e2e/picking/preparar-envio.ts", { stdio: "inherit" });

const carpeta = fileURLToPath(new URL("./capturas/", import.meta.url));
await mkdir(carpeta, { recursive: true });

const navegador = await chromium.launch();

try {
  for (const ancho of [390, 768, 1440]) {
    const alto = ancho === 390 ? 844 : ancho === 768 ? 1024 : 900;
    const contexto = await navegador.newContext({
      viewport: { width: ancho, height: alto },
    });
    const pagina = await contexto.newPage();

    // 1. Iniciar sesión en la app
    const acceso = await contexto.request.post("http://localhost:3000/api/auth/picking/sign-in/username", {
      headers: { origin: "http://localhost:3000" },
      data: { usuario: "ejemplo.05", clave: process.env.CLAVE_DEMO },
    });
    if (!acceso.ok()) throw new Error("No se pudo iniciar sesión en la aplicación");

    // Captura aplicación - Bodega
    await pagina.goto("http://localhost:3000/picking/bodega");
    await pagina.locator('.app[data-hidratado="true"]').waitFor();
    await pagina.evaluate(() => document.fonts.ready);
    await pagina.screenshot({
      path: `${carpeta}/aplicacion-bodega-${ancho}.png`,
      animations: "disabled",
    });

    // Captura aplicación - Detalle Modal
    await pagina.getByRole("button", { name: "Detalle de Ruta" }).click();
    await pagina.locator("[role=dialog]").waitFor();
    await pagina.screenshot({
      path: `${carpeta}/aplicacion-bodega-modal-${ancho}.png`,
      animations: "disabled",
    });

    // Captura prototipo - Bodega
    await pagina.goto("http://127.0.0.1:4173/#/picking/bodega?cuenta=ejemplo.05");
    await pagina.evaluate(() => document.fonts.ready);
    await pagina.screenshot({
      path: `${carpeta}/prototipo-bodega-${ancho}.png`,
      animations: "disabled",
    });

    // Captura prototipo - Detalle Modal
    const botonDetalleProto = pagina.locator("button:has-text('Detalle de Ruta')").first();
    if (await botonDetalleProto.isVisible()) {
      await botonDetalleProto.click();
      await pagina.waitForTimeout(400);
      await pagina.screenshot({
        path: `${carpeta}/prototipo-bodega-modal-${ancho}.png`,
        animations: "disabled",
      });
    }

    await contexto.close();
    process.stdout.write(`Capturado ancho: ${ancho}px\n`);
  }
} finally {
  await navegador.close();
}
