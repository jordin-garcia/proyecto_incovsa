import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { expect, type BrowserContext, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { Client } from "pg";
import { test } from "../flujo/servidor-produccion";

try {
  process.loadEnvFile();
} catch {
  // Ignorar si no existe
}

/** Llama a tsx sin npx, como flujo/tiempo-real.spec.ts: npx tarda varios segundos en un equipo de 8 GB (H-26). */
function preparar(...argumentos: string[]) {
  return execFileSync(
    process.execPath,
    ["node_modules/tsx/dist/cli.mjs", "pruebas-e2e/picking/preparar-envio.ts", ...argumentos],
    { encoding: "utf8" },
  ).trim();
}

/** Cambia el estado del envío en este mismo proceso, como si otra pantalla lo despachara (H-26). */
async function cambiarEstado(envioId: number, estado: string) {
  const bd = new Client({ connectionString: process.env.DATABASE_URL });
  await bd.connect();
  try {
    await bd.query("UPDATE envio SET estado_id = (SELECT id FROM estado_envio WHERE nombre = $1) WHERE id = $2", [
      estado,
      envioId,
    ]);
  } finally {
    await bd.end();
  }
}

async function entrar(context: BrowserContext, urlBase: string, usuario = "ejemplo.05") {
  expect(process.env.CLAVE_DEMO, "Se requiere la clave demo").toBeTruthy();
  // Sin Caddy, reproduce la IP de confianza igual que las pruebas de producción de JG-10.
  await context.setExtraHTTPHeaders({ "x-real-ip": "127.0.0.1" });
  const r = await context.request.post(`${urlBase}/api/auth/picking/sign-in/username`, {
    headers: { origin: urlBase },
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
      JSON.parse(preparar("crear", String(numero), tipo, String(sedeId)));

    envioA = crear(base + 1, "ruta", 1);
    envioB = crear(base + 2, "pedido", 1);
  });

  test.afterAll(async () => {
    const ids = [envioA, envioB].filter((datos) => datos?.envioId).map((datos) => String(datos.envioId));
    if (ids.length) preparar("limpiar", ...ids);
  });

  test("RNF-13 / RF-SL-23 (CP-37): el marcado aparece de inmediato en quien marca (optimista), revierte ante fallo y sincroniza en < 2s", async ({
    browser,
    context,
    page: page1,
    produccion,
    esperarPublicacion,
  }, testInfo) => {
    await entrar(context, produccion.url);

    const context2 = await browser.newContext({ baseURL: produccion.url });
    await entrar(context2, produccion.url);
    const page2 = await context2.newPage();

    const rutaBodega = (url: URL) => url.pathname.includes("/picking/bodega");
    let estadoCambiado = false;

    try {
      await abrirBodega(page1);
      await abrirBodega(page2);

      const tarjeta1 = page1.locator(`article.ped[data-id="${envioA.envioId}"]`);
      await expect(tarjeta1).toBeVisible();
      await expect(page2.locator(`article.ped[data-id="${envioA.envioId}"]`)).toBeVisible();

      const fila1 = tarjeta1.locator("tbody tr").first();
      const botonMarca1 = fila1.locator("button.marca");
      const lineaId = await fila1.getAttribute("data-id");

      // Criterio 3: El marcado aparece de inmediato en la pantalla de quien marca (useOptimistic)
      // Retenemos la petición de la acción para demostrar que la UI cambia ANTES de que responda el servidor
      let interceptado = false;
      let liberarAccion: (() => void) | null = null;
      const accionRetenida = new Promise<void>((resolve) => {
        liberarAccion = resolve;
      });

      await page1.route(rutaBodega, async (route) => {
        if (!interceptado && route.request().headers()["next-action"]) {
          interceptado = true;
          await accionRetenida;
        }
        await route.continue();
      });

      const respuestaMarcado = page1.waitForResponse(
        (r) => r.request().method() === "POST" && !!r.request().headers()["next-action"],
      );
      // Criterio 2 (RNF-13 / CP-37), medido como JG-10 (H-25): el reloj empieza cuando el servidor publica el aviso
      // (avisarCambio), no cuando llega la respuesta de la acción. Se escucha antes del clic.
      const propagacion = esperarPublicacion(1).then(async (inicio) => {
        const actualizado = await page2.waitForFunction(
          (id) => document.querySelector(`tr[data-id="${id}"]`)?.classList.contains("lista") ?? false,
          lineaId,
          { timeout: Math.max(1, 1999 - (Date.now() - inicio)), polling: "raf" },
        );
        const transcurrido = Date.now() - inicio;
        await actualizado.dispose();
        console.log(`[${testInfo.project.name}] TIEMPO REAL SSE: ${transcurrido} ms`);
        expect(transcurrido).toBeLessThan(2000);
        const archivo = testInfo.outputPath("latencia-bodega.json");
        await writeFile(archivo, JSON.stringify({ sede: 1, ms: transcurrido, limite: 1999 }));
        await testInfo.attach("latencia-publicacion", { path: archivo, contentType: "application/json" });
      });

      await botonMarca1.click();

      // 1. En pantalla 1 debe estar marcada de inmediato (useOptimistic) MIENTRAS la respuesta sigue retenida
      await expect(fila1).toHaveClass(/lista/);
      await expect(botonMarca1).toHaveAttribute("aria-pressed", "true");

      // 2. Se libera la petición retenida; el aviso llega a la pantalla 2 en menos de 2 s desde su publicación.
      liberarAccion!();
      const [resultado] = await Promise.all([respuestaMarcado, propagacion]);
      expect(resultado.ok()).toBe(true);
      await page1.unroute(rutaBodega);

      // 3. Reversión si la acción falla: otra pantalla ya despachó la ruta (H-22). El operario ve un mensaje de
      // negocio, no «No tiene permisos»; la marca no se guarda y la ruta sale de la pantalla al refrescarse.
      await cambiarEstado(envioA.envioId, "En Ruta");
      estadoCambiado = true;

      const fila1B = tarjeta1.locator("tbody tr").nth(1);
      const lineaB = await fila1B.getAttribute("data-id");
      await fila1B.locator("button.marca").click();
      const aviso = page1.locator(".toast.t-error");
      await expect(aviso).toContainText("El pedido ya no está en preparación.", { timeout: 3000 });
      await expect(aviso).not.toContainText("No tiene permisos");
      await expect(tarjeta1).toHaveCount(0, { timeout: 3000 });
      await expect(page1.getByRole("heading", { level: 1, name: "Rutas y pedidos por preparar" })).toBeVisible();
      const bd = new Client({ connectionString: process.env.DATABASE_URL });
      await bd.connect();
      try {
        const { rows } = await bd.query("SELECT marcado FROM linea_preparacion WHERE id = $1", [Number(lineaB)]);
        expect(rows[0]?.marcado).toBe(false);
      } finally {
        await bd.end();
      }
    } finally {
      await page1.unroute(rutaBodega).catch(() => undefined);
      // Solo se restaura si la prueba llegó a cambiar el estado.
      if (estadoCambiado) await cambiarEstado(envioA.envioId, "En Preparación");
      await context2.close();
    }
  });

  test("RF-SL-20 / RN-28 / RNF-13: reordenar filas y cola se refleja en tiempo real en otra pantalla en < 2s sin historial", async ({
    browser,
    context,
    page: page1,
    produccion,
  }) => {
    await entrar(context, produccion.url);

    const context2 = await browser.newContext({ baseURL: produccion.url });
    await entrar(context2, produccion.url);
    const page2 = await context2.newPage();

    try {
      await abrirBodega(page1);
      await abrirBodega(page2);

      const tarjeta1 = page1.locator(`article.ped[data-id="${envioA.envioId}"]`);
      const tarjeta2 = page2.locator(`article.ped[data-id="${envioA.envioId}"]`);

      // 1. Reordenar filas partiendo de un orden distinto al orden por peso
      // Inicialmente fila 0 = 40 kg, fila 1 = 10 kg.
      // Movemos la fila 0 (40 kg) hacia la posición de fila 1 con arrastre de mouse
      const asaFila1 = tarjeta1.locator("tbody tr .asa").first();
      const asaFila2 = tarjeta1.locator("tbody tr .asa").nth(1);
      // El mouse solo actúa dentro de la pantalla: en el teléfono, las filas quedan debajo del encabezado.
      await asaFila2.scrollIntoViewIfNeeded();
      await asaFila1.scrollIntoViewIfNeeded();
      const boxFila1 = (await asaFila1.boundingBox())!;
      const boxFila2 = (await asaFila2.boundingBox())!;

      const respReorden = page1.waitForResponse(
        (r) => r.request().method() === "POST" && !!r.request().headers()["next-action"],
      );
      await page1.mouse.move(boxFila1.x + boxFila1.width / 2, boxFila1.y + boxFila1.height / 2);
      await page1.mouse.down();
      await page1.mouse.move(boxFila2.x + boxFila2.width / 2, boxFila2.y + boxFila2.height / 2 + 10, { steps: 10 });
      await page1.mouse.up();
      await respReorden;

      // En pantalla 1 ahora fila 0 = 10 kg, fila 1 = 40 kg
      const filas1 = tarjeta1.locator("tbody tr");
      await expect(filas1.nth(0).locator(".kg")).toHaveText(/10/);
      await expect(filas1.nth(1).locator(".kg")).toHaveText(/40/);

      // Criterio 2: En pantalla 2 se refleja el reordenamiento de filas en tiempo real (< 2s)
      const filas2 = tarjeta2.locator("tbody tr");
      const tFilas = Date.now();
      await expect(filas2.nth(0).locator(".kg")).toHaveText(/10/, { timeout: 2000 });
      await expect(filas2.nth(1).locator(".kg")).toHaveText(/40/, { timeout: 2000 });
      expect(Date.now() - tFilas).toBeLessThan(2000);

      // 2. Ahora pulsamos "Ordenar por peso" en pantalla 1: restaura 40 kg primero
      const botonPeso = tarjeta1.getByRole("button", { name: "Ordenar por peso" });
      const respPeso = page1.waitForResponse(
        (r) => r.request().method() === "POST" && !!r.request().headers()["next-action"],
      );
      await botonPeso.click();
      await respPeso;

      await expect(filas1.nth(0).locator(".kg")).toHaveText(/40/);
      await expect(filas1.nth(1).locator(".kg")).toHaveText(/10/);

      // En pantalla 2 se actualiza en tiempo real (< 2s)
      const tPeso = Date.now();
      await expect(filas2.nth(0).locator(".kg")).toHaveText(/40/, { timeout: 2000 });
      await expect(filas2.nth(1).locator(".kg")).toHaveText(/10/, { timeout: 2000 });
      expect(Date.now() - tPeso).toBeLessThan(2000);

      // 3. Reordenar las tarjetas de la cola (prioridad) en pantalla 1
      const primeraTarjeta1 = page1.locator(`article.ped[data-id="${envioA.envioId}"]`);
      const segundaTarjeta1 = page1.locator(`article.ped[data-id="${envioB.envioId}"]`);

      const asaCard1 = primeraTarjeta1.locator(".asa-ped");
      const asaCard2 = segundaTarjeta1.locator(".asa-ped");
      // Deja las dos asas dentro de la pantalla antes de arrastrar con el mouse.
      await asaCard2.scrollIntoViewIfNeeded();
      await asaCard1.scrollIntoViewIfNeeded();
      const boxCard1 = (await asaCard1.boundingBox())!;
      const boxCard2 = (await asaCard2.boundingBox())!;

      const respCola = page1.waitForResponse(
        (r) => r.request().method() === "POST" && !!r.request().headers()["next-action"],
      );
      if (boxCard2.y + boxCard2.height <= page1.viewportSize()!.height) {
        await page1.mouse.move(boxCard1.x + boxCard1.width / 2, boxCard1.y + boxCard1.height / 2);
        await page1.mouse.down();
        await page1.mouse.move(boxCard2.x + boxCard2.width / 2, boxCard2.y + boxCard2.height / 2 + 30, {
          steps: 10,
        });
        await page1.mouse.up();
      } else {
        // En el teléfono la tarjeta mide más que la pantalla y el mouse no alcanza las dos asas: se arrastra con el
        // teclado, con pausas entre teclas como en la prueba de teclado de este archivo.
        await asaCard1.focus();
        await page1.keyboard.press("Space", { delay: 80 });
        await page1.waitForTimeout(150);
        await page1.keyboard.press("ArrowDown", { delay: 80 });
        await page1.waitForTimeout(150);
        await page1.keyboard.press("Space", { delay: 80 });
      }
      await respCola;

      // En pantalla 1: envioB ahora está antes que envioA
      await expect
        .poll(async () => {
          const idxA = await primeraTarjeta1.evaluate((el) => Array.from(el.parentElement?.children ?? []).indexOf(el));
          const idxB = await segundaTarjeta1.evaluate((el) => Array.from(el.parentElement?.children ?? []).indexOf(el));
          return idxB < idxA;
        })
        .toBe(true);

      // En pantalla 2 se refleja en tiempo real (< 2s)
      const tarjeta2A = page2.locator(`article.ped[data-id="${envioA.envioId}"]`);
      const tarjeta2B = page2.locator(`article.ped[data-id="${envioB.envioId}"]`);
      const tCola = Date.now();
      await expect
        .poll(
          async () => {
            const idxA = await tarjeta2A.evaluate((el) => Array.from(el.parentElement?.children ?? []).indexOf(el));
            const idxB = await tarjeta2B.evaluate((el) => Array.from(el.parentElement?.children ?? []).indexOf(el));
            return idxB < idxA;
          },
          { timeout: 2000 },
        )
        .toBe(true);
      expect(Date.now() - tCola).toBeLessThan(2000);
    } finally {
      await context2.close();
    }
  });

  test("RF-SL-20: el arrastre funciona con teclado, mouse y touch (dedo con pulsación de 380 ms)", async ({
    browser,
    browserName,
    context,
    page,
    produccion,
  }, testInfo) => {
    test.setTimeout(60_000);
    await entrar(context, produccion.url);
    await abrirBodega(page);

    // 1. Arrastre con TECLADO en tarjetas de envío (verificar nuevo orden en DOM y persistencia en recarga)
    const tarjetaInicioA = page.locator(`article.ped[data-id="${envioA.envioId}"]`);
    const tarjetaInicioB = page.locator(`article.ped[data-id="${envioB.envioId}"]`);

    const idxAInicial = await tarjetaInicioA.evaluate((el) => Array.from(el.parentElement?.children ?? []).indexOf(el));
    const idxBInicial = await tarjetaInicioB.evaluate((el) => Array.from(el.parentElement?.children ?? []).indexOf(el));
    const primeraTarjeta = idxAInicial < idxBInicial ? tarjetaInicioA : tarjetaInicioB;
    const segundaTarjeta = idxAInicial < idxBInicial ? tarjetaInicioB : tarjetaInicioA;
    const idPrimera = await primeraTarjeta.getAttribute("data-id");
    const idSegunda = await segundaTarjeta.getAttribute("data-id");

    const respTeclado = page.waitForResponse(
      (r) => r.request().method() === "POST" && !!r.request().headers()["next-action"],
    );
    await primeraTarjeta.scrollIntoViewIfNeeded();
    await primeraTarjeta.locator(".asa-ped").scrollIntoViewIfNeeded();
    await primeraTarjeta.locator(".asa-ped").focus();
    await page.keyboard.press("Space", { delay: 80 });
    await page.waitForTimeout(150);
    await page.keyboard.press("ArrowDown", { delay: 80 });
    await page.waitForTimeout(150);
    await page.keyboard.press("Space", { delay: 80 });
    await respTeclado;

    // Comprobar que en pantalla cambió el orden relativo (la primera ahora quedó después de la segunda)
    await expect
      .poll(async () => {
        const i1 = await primeraTarjeta.evaluate((el) => Array.from(el.parentElement?.children ?? []).indexOf(el));
        const i2 = await segundaTarjeta.evaluate((el) => Array.from(el.parentElement?.children ?? []).indexOf(el));
        return i2 < i1;
      })
      .toBe(true);

    // Comprobar que persiste al recargar
    await page.reload();
    await expect(page.locator(".vivo")).toHaveAttribute("data-conectado", "true", { timeout: 15_000 });
    const tarjetaRecargada1 = page.locator(`article.ped[data-id="${idPrimera}"]`);
    const tarjetaRecargada2 = page.locator(`article.ped[data-id="${idSegunda}"]`);
    await expect
      .poll(async () => {
        const i1 = await tarjetaRecargada1.evaluate((el) => Array.from(el.parentElement?.children ?? []).indexOf(el));
        const i2 = await tarjetaRecargada2.evaluate((el) => Array.from(el.parentElement?.children ?? []).indexOf(el));
        return i2 < i1;
      })
      .toBe(true);

    // 2. Arrastre con MOUSE en filas de la tarjeta (verificar nuevo orden en DOM y persistencia en recarga)
    const tarjetaActual = page.locator(`article.ped[data-id="${envioA.envioId}"]`);
    await tarjetaActual.scrollIntoViewIfNeeded();
    const asaFila1 = tarjetaActual.locator("tbody tr .asa").first();
    const asaFila2 = tarjetaActual.locator("tbody tr .asa").nth(1);
    await asaFila1.scrollIntoViewIfNeeded();

    const fila1TextAntes = await tarjetaActual.locator("tbody tr").first().locator(".kg").innerText();
    const fila2TextAntes = await tarjetaActual.locator("tbody tr").nth(1).locator(".kg").innerText();

    const boxFila1 = (await asaFila1.boundingBox())!;
    const boxFila2 = (await asaFila2.boundingBox())!;

    const respMouse = page.waitForResponse(
      (r) => r.request().method() === "POST" && !!r.request().headers()["next-action"],
    );
    await page.mouse.move(boxFila1.x + boxFila1.width / 2, boxFila1.y + boxFila1.height / 2);
    await page.mouse.down();
    await page.mouse.move(boxFila2.x + boxFila2.width / 2, boxFila2.y + boxFila2.height / 2 + 10, { steps: 10 });
    await page.mouse.up();
    await respMouse;

    // Comprobar intercambio de filas en DOM
    await expect(tarjetaActual.locator("tbody tr").first().locator(".kg")).toHaveText(fila2TextAntes);
    await expect(tarjetaActual.locator("tbody tr").nth(1).locator(".kg")).toHaveText(fila1TextAntes);

    // Comprobar persistencia al recargar
    await page.reload();
    await expect(page.locator(".vivo")).toHaveAttribute("data-conectado", "true", { timeout: 15_000 });
    const tarjetaRecargada = page.locator(`article.ped[data-id="${envioA.envioId}"]`);
    await expect(tarjetaRecargada.locator("tbody tr").first().locator(".kg")).toHaveText(fila2TextAntes);
    await expect(tarjetaRecargada.locator("tbody tr").nth(1).locator(".kg")).toHaveText(fila1TextAntes);

    // 3. Arrastre TÁCTIL con DEDO (touch) con pulsación >= 380 ms (umbral del sensor táctil en RN)
    // Usar context con hasTouch: true (si no lo tiene el proyecto actual, crear uno)
    let ctxTouch = context;
    let pageTouch = page;
    let cerrarCtxTouch = false;

    if (!testInfo.project.use.hasTouch) {
      ctxTouch = await browser.newContext({
        baseURL: produccion.url,
        hasTouch: true,
        viewport: { width: 390, height: 844 },
      });
      await entrar(ctxTouch, produccion.url);
      pageTouch = await ctxTouch.newPage();
      await abrirBodega(pageTouch);
      cerrarCtxTouch = true;
    }

    try {
      const tarjetaTouch = pageTouch.locator(`article.ped[data-id="${envioA.envioId}"]`);
      await tarjetaTouch.scrollIntoViewIfNeeded();
      const asaTouch1 = tarjetaTouch.locator("tbody tr .asa").first();
      const asaTouch2 = tarjetaTouch.locator("tbody tr .asa").nth(1);
      await asaTouch1.scrollIntoViewIfNeeded();

      const filaTouch1Antes = await tarjetaTouch.locator("tbody tr").first().locator(".kg").innerText();
      const filaTouch2Antes = await tarjetaTouch.locator("tbody tr").nth(1).locator(".kg").innerText();

      const boxTouch1 = (await asaTouch1.boundingBox())!;
      const boxTouch2 = (await asaTouch2.boundingBox())!;

      const respTouch = pageTouch.waitForResponse(
        (r) => r.request().method() === "POST" && !!r.request().headers()["next-action"],
      );

      const inicio = { x: boxTouch1.x + boxTouch1.width / 2, y: boxTouch1.y + boxTouch1.height / 2 };
      const destino = { x: boxTouch2.x + boxTouch2.width / 2, y: boxTouch2.y + boxTouch2.height / 2 + 10 };
      if (browserName === "chromium") {
        const sesionCdp = await ctxTouch.newCDPSession(pageTouch);
        await sesionCdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [inicio] });
        // Esperar 420 ms para superar el umbral de 380 ms de pulsación larga del sensor táctil
        await pageTouch.waitForTimeout(420);
        await sesionCdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [destino] });
        await pageTouch.waitForTimeout(100);
        await sesionCdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        await sesionCdp.detach();
      } else {
        // Firefox y WebKit no tienen CDP (JG-16): el mismo gesto con TouchEvent sobre el asa, que es donde el sensor
        // táctil escucha (https://playwright.dev/docs/touch-events).
        const toque = (punto: { x: number; y: number }) => [{ identifier: 0, clientX: punto.x, clientY: punto.y }];
        const enInicio = toque(inicio);
        await asaTouch1.dispatchEvent("touchstart", {
          touches: enInicio,
          changedTouches: enInicio,
          targetTouches: enInicio,
        });
        await pageTouch.waitForTimeout(420);
        const enDestino = toque(destino);
        await asaTouch1.dispatchEvent("touchmove", {
          touches: enDestino,
          changedTouches: enDestino,
          targetTouches: enDestino,
        });
        await pageTouch.waitForTimeout(100);
        await asaTouch1.dispatchEvent("touchend", { touches: [], changedTouches: enDestino, targetTouches: [] });
      }
      await respTouch;

      // Comprobar que cambió en pantalla
      await expect(tarjetaTouch.locator("tbody tr").first().locator(".kg")).toHaveText(filaTouch2Antes);
      await expect(tarjetaTouch.locator("tbody tr").nth(1).locator(".kg")).toHaveText(filaTouch1Antes);

      // Comprobar persistencia al recargar
      await pageTouch.reload();
      await expect(pageTouch.locator(".vivo")).toHaveAttribute("data-conectado", "true", { timeout: 15_000 });
      const tarjetaTouchRecargada = pageTouch.locator(`article.ped[data-id="${envioA.envioId}"]`);
      await expect(tarjetaTouchRecargada.locator("tbody tr").first().locator(".kg")).toHaveText(filaTouch2Antes);
      await expect(tarjetaTouchRecargada.locator("tbody tr").nth(1).locator(".kg")).toHaveText(filaTouch1Antes);
    } finally {
      if (cerrarCtxTouch) {
        await ctxTouch.close();
      }
    }

    // Asegurar que no quede ningún elemento en estado de arrastre activo
    await page.keyboard.press("Escape");
    await expect(page.locator(".arrastrando")).toHaveCount(0);

    // 4. Accesibilidad axe: sin violaciones graves ni críticas
    const violaciones = await violacionesGraves(page);
    expect(violaciones).toEqual([]);
  });
});
