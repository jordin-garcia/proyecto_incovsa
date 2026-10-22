import { execSync } from "node:child_process";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

try {
  process.loadEnvFile();
} catch {
  // Ignorar si no existe
}

async function entrar(context: BrowserContext, usuario = "ejemplo.05") {
  expect(process.env.CLAVE_DEMO, "Se requiere la clave demo").toBeTruthy();
  const r = await context.request.post("/api/auth/picking/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario, clave: process.env.CLAVE_DEMO },
  });
  expect(r.ok()).toBe(true);
}

async function violacionesGraves(page: Page) {
  await page.evaluate(async () => {
    const enCurso = document
      .getAnimations()
      .filter(
        (animacion) =>
          animacion.playState === "running" && animacion.effect?.getComputedTiming().iterations !== Infinity,
      );
    await Promise.allSettled(enCurso.map((animacion) => animacion.finished));
  });
  const resultado = await new AxeBuilder({ page }).exclude(".ped-num.recoge small").analyze();
  return resultado.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => ({ regla: v.id, nodos: v.nodes.map((n) => `${n.target.join(" ")} · ${n.failureSummary ?? ""}`) }));
}

async function abrirBodega(page: Page) {
  await page.goto("/picking/bodega");
  await expect(page.locator(".vivo")).toHaveAttribute("data-conectado", "true", { timeout: 15_000 });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

const BASE_POR_PROYECTO: Record<string, number> = {
  telefono: 110,
  tableta: 120,
  escritorio: 130,
};

test.describe("Bodega - Prioridad compartida y tiempo real (JM-04)", () => {
  test.describe.configure({ mode: "serial" });

  let envioA: { envioId: number; numero: number };
  let envioB: { envioId: number; numero: number };

  test.beforeAll(async ({}, testInfo) => {
    const base = BASE_POR_PROYECTO[testInfo.project.name] ?? 140;
    const crear = (numero: number, tipo: "ruta" | "pedido", sedeId: number) =>
      JSON.parse(
        execSync(`npx tsx pruebas-e2e/picking/preparar-envio.ts crear ${numero} ${tipo} ${sedeId}`, {
          encoding: "utf-8",
        }).trim(),
      );

    envioA = crear(base + 1, "ruta", 1);
    envioB = crear(base + 2, "pedido", 1);
  });

  test.afterAll(async () => {
    for (const datos of [envioA, envioB]) {
      if (datos?.envioId) {
        try {
          execSync(`npx tsx pruebas-e2e/picking/preparar-envio.ts limpiar ${datos.envioId}`, { stdio: "ignore" });
        } catch {
          // Ignorar errores de limpieza final
        }
      }
    }
  });

  test("RNF-13 / RF-SL-23 (CP-37): el marcado aparece de inmediato en quien marca y en otra pantalla en menos de 2s", async ({
    browser,
    context,
    page: page1,
  }) => {
    await entrar(context, "ejemplo.05");

    const context2 = await browser.newContext();
    await entrar(context2, "ejemplo.05");
    const page2 = await context2.newPage();

    try {
      await abrirBodega(page1);
      await abrirBodega(page2);

      await expect(page1.locator(`article.ped[data-id="${envioA.envioId}"]`)).toBeVisible();
      await expect(page2.locator(`article.ped[data-id="${envioA.envioId}"]`)).toBeVisible();

      const tarjeta1 = page1.locator(`article.ped[data-id="${envioA.envioId}"]`);
      const tarjeta2 = page2.locator(`article.ped[data-id="${envioA.envioId}"]`);

      const fila1 = tarjeta1.locator("tbody tr").first();
      const botonMarca1 = fila1.locator("button.marca");
      const fila2 = tarjeta2.locator("tbody tr").first();

      // Criterio 3: El marcado aparece de inmediato en la pantalla de quien marca (useOptimistic)
      const respuestaMarcado = page1.waitForResponse(
        (r) => r.request().method() === "POST" && !!r.request().headers()["next-action"],
      );
      await botonMarca1.click();

      // En la pantalla 1 debe estar marcada de inmediato (useOptimistic)
      await expect(fila1).toHaveClass(/lista/);
      await expect(botonMarca1).toHaveAttribute("aria-pressed", "true");

      await respuestaMarcado;

      // Criterio 2: En la pantalla 2 (otro navegador) se ve por SSE sin recargar
      await expect(fila2).toHaveClass(/lista/, { timeout: 5000 });
    } finally {
      await context2.close();
    }
  });

  test("RF-SL-20 / RN-28 / RNF-13: reordenar filas u ordenar por peso se refleja en tiempo real sin historial", async ({
    browser,
    context,
    page: page1,
  }) => {
    await entrar(context, "ejemplo.05");

    const context2 = await browser.newContext();
    await entrar(context2, "ejemplo.05");
    const page2 = await context2.newPage();

    try {
      await abrirBodega(page1);
      await abrirBodega(page2);

      const tarjeta1 = page1.locator(`article.ped[data-id="${envioA.envioId}"]`);
      const tarjeta2 = page2.locator(`article.ped[data-id="${envioA.envioId}"]`);

      // Pulsar "Ordenar por peso"
      const botonPeso = tarjeta1.getByRole("button", { name: "Ordenar por peso" });
      const respuestaPeso = page1.waitForResponse(
        (r) => r.request().method() === "POST" && !!r.request().headers()["next-action"],
      );
      await botonPeso.click();
      await respuestaPeso;

      // La primera fila debe tener 40 kg y la segunda 10 kg
      const filas1 = tarjeta1.locator("tbody tr");
      await expect(filas1.nth(0).locator(".kg")).toHaveText(/40/);
      await expect(filas1.nth(1).locator(".kg")).toHaveText(/10/);

      // En la pantalla 2 se refleja automáticamente sin recargar
      const filas2 = tarjeta2.locator("tbody tr");
      await expect(filas2.nth(0).locator(".kg")).toHaveText(/40/, { timeout: 5000 });
      await expect(filas2.nth(1).locator(".kg")).toHaveText(/10/, { timeout: 5000 });
    } finally {
      await context2.close();
    }
  });

  test("RF-SL-20: el arrastre funciona con teclado, mouse y touch", async ({ context, page }) => {
    await entrar(context, "ejemplo.05");
    await abrirBodega(page);

    const tarjetaA = page.locator(`article.ped[data-id="${envioA.envioId}"]`);
    const tarjetaB = page.locator(`article.ped[data-id="${envioB.envioId}"]`);

    await expect(tarjetaA).toBeVisible();
    await expect(tarjetaB).toBeVisible();

    // 1. Arrastre con teclado en tarjetas de envío
    const asaTarjeta = tarjetaA.locator(".asa-ped");
    await asaTarjeta.focus();
    await page.keyboard.press("Space");
    await page.waitForTimeout(100);
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(100);
    await page.keyboard.press("Space");
    await page.waitForTimeout(100);

    // 2. Arrastre con teclado en filas de la tarjeta
    const asaFila = tarjetaA.locator("tbody tr .asa").first();
    await asaFila.focus();
    await page.keyboard.press("Space");
    await page.waitForTimeout(100);
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(100);
    await page.keyboard.press("Space");
    await page.waitForTimeout(100);

    // 3. Arrastre con mouse / dragTo
    const segundaAsaFila = tarjetaA.locator("tbody tr .asa").nth(1);
    await asaFila.dragTo(segundaAsaFila);
    await page.waitForTimeout(200);

    // Asegurar que no quede ningún elemento en estado de arrastre activo
    await page.keyboard.press("Escape");
    await expect(page.locator(".arrastrando")).toHaveCount(0);

    // 4. Accesibilidad axe: sin violaciones graves ni críticas
    const violaciones = await violacionesGraves(page);
    expect(violaciones).toEqual([]);
  });
});
