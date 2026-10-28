import { execFileSync } from "node:child_process";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { comprobarEncabezadoModulo } from "../comunes/encabezado";

try {
  process.loadEnvFile();
} catch {
  // Ignorar si no existe
}

function ejecutarRuta(...args: string[]) {
  return JSON.parse(
    execFileSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", "pruebas-e2e/picking/preparar-ruta.ts", ...args], {
      encoding: "utf8",
    }).trim(),
  );
}

async function entrar(context: BrowserContext, baseURL: string | undefined, usuario = "ejemplo.06") {
  expect(process.env.CLAVE_DEMO, "Se requiere la clave demo").toBeTruthy();
  await context.setExtraHTTPHeaders({ "x-real-ip": "127.0.0.1" });
  const r = await context.request.post("/api/auth/picking/sign-in/username", {
    headers: { origin: baseURL ?? "http://localhost:3000" },
    data: { usuario, clave: process.env.CLAVE_DEMO },
  });
  expect(r.ok()).toBe(true);
}

async function entrarEnSede(context: BrowserContext, baseURL: string | undefined, usuario: string, sedeId: number) {
  await entrar(context, baseURL, usuario);
  await context.addCookies([{ name: "incovsa-sede", value: String(sedeId), url: baseURL ?? "http://localhost:3000" }]);
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
  const resultado = await new AxeBuilder({ page }).analyze();
  return resultado.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => ({ regla: v.id, nodos: v.nodes.map((n) => `${n.target.join(" ")} · ${n.failureSummary ?? ""}`) }));
}

const NUMEROS_BASE: Record<string, number> = {
  telefono: 10,
  tableta: 20,
  escritorio: 30,
};

test.describe("Módulo de Ruta E2E (JM-06)", () => {
  test.describe.configure({ mode: "serial" });

  let rutaPiloto06: { id: number; numero: number };
  let rutaPiloto07: { id: number; numero: number };
  let rutaSecundaria: { id: number; numero: number };
  const enviosCreados: number[] = [];

  test.beforeAll(async ({}, testInfo) => {
    const base = NUMEROS_BASE[testInfo.project.name] ?? 40;
    const resultado = ejecutarRuta("crear", String(base));
    rutaPiloto06 = resultado.rutaPiloto06;
    rutaPiloto07 = resultado.rutaPiloto07;
    rutaSecundaria = resultado.rutaSecundaria;
    enviosCreados.push(rutaPiloto06.id, rutaPiloto07.id, rutaSecundaria.id);
  });

  test.afterAll(async () => {
    if (enviosCreados.length > 0) {
      try {
        ejecutarRuta("limpiar", ...enviosCreados.map(String));
      } catch {
        // Ignorar
      }
    }
  });

  test("Criterio 1: RF-SL-26 / RN-46 - Visibilidad de rutas por rol y permiso", async ({ page, context, baseURL }) => {
    // 1. ejemplo.06 solo ve sus rutas asignadas
    await entrarEnSede(context, baseURL, "ejemplo.06", 1);
    await page.goto("/picking/ruta");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");

    await expect(page.locator(`button[data-r="${rutaPiloto06.id}"]`)).toBeVisible();
    await expect(page.locator(`button[data-r="${rutaSecundaria.id}"]`)).toBeVisible();
    await expect(page.locator(`button[data-r="${rutaPiloto07.id}"]`)).toHaveCount(0);

    // H-70 (RF-SL-61): Encabezado para piloto comprobado con la ayuda común
    await comprobarEncabezadoModulo(page, {
      eyebrow: "Módulo de ruta",
      titulo: "Mis rutas",
      instruccion:
        "Sus rutas asignadas. Arrastre los clientes para acomodar el recorrido y pulse «Ruta Entregada» al terminar.",
    });

    // 2. ejemplo.07 solo ve su ruta asignada
    await entrarEnSede(context, baseURL, "ejemplo.07", 1);
    await page.goto("/picking/ruta");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");

    await expect(page.locator(`button[data-r="${rutaPiloto07.id}"]`)).toBeVisible();
    await expect(page.locator(`button[data-r="${rutaPiloto06.id}"]`)).toHaveCount(0);

    // 3. ejemplo.01 (Gerencia) ve todas las rutas de la sede
    await entrarEnSede(context, baseURL, "ejemplo.01", 1);
    await page.goto("/picking/ruta");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");

    await expect(page.locator(`button[data-r="${rutaPiloto06.id}"]`)).toBeVisible();
    await expect(page.locator(`button[data-r="${rutaPiloto07.id}"]`)).toBeVisible();
    await expect(page.locator(`button[data-r="${rutaSecundaria.id}"]`)).toBeVisible();
    // H-70 (RF-SL-61): Encabezado para gerencia comprobado con la ayuda común
    await comprobarEncabezadoModulo(page, {
      eyebrow: "Módulo de ruta",
      titulo: "Rutas en curso",
      instruccion:
        "Rutas en curso de la sede. Arrastre los clientes para acomodar el recorrido y pulse «Ruta Entregada» al terminar.",
    });

    // 4. ejemplo.05 (Bodega) no tiene permisos para el módulo de ruta -> SinAcceso
    await entrarEnSede(context, baseURL, "ejemplo.05", 1);
    await page.goto("/picking/ruta");
    await expect(page.getByText("Sus permisos no incluyen Ruta.")).toBeVisible();
  });

  test("Criterio 2: RF-SL-78 - Orden de la más reciente a la más antigua", async ({ page, context, baseURL }) => {
    await entrarEnSede(context, baseURL, "ejemplo.06", 1);
    await page.goto("/picking/ruta");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");

    // Los botones de ruta deben estar ordenados: r3 (2026-10-25) antes que r1 (2026-10-24)
    const bSecundaria = page.locator(`button[data-r="${rutaSecundaria.id}"]`);
    const bPiloto06 = page.locator(`button[data-r="${rutaPiloto06.id}"]`);
    await expect(bSecundaria).toBeVisible();
    await expect(bPiloto06).toBeVisible();

    const orden = await page
      .locator("button.ruta-op")
      .evaluateAll((elementos) => elementos.map((el) => el.getAttribute("data-r")));
    const idxSecundaria = orden.indexOf(String(rutaSecundaria.id));
    const idxPiloto06 = orden.indexOf(String(rutaPiloto06.id));
    expect(idxSecundaria).toBeGreaterThanOrEqual(0);
    expect(idxPiloto06).toBeGreaterThanOrEqual(0);
    expect(idxSecundaria).toBeLessThan(idxPiloto06);
  });

  test("Criterio 3: RF-SL-27 / RN-49 - Detalle de ruta con Cliente, Sector y Total (kg)", async ({
    page,
    context,
    baseURL,
  }) => {
    await entrarEnSede(context, baseURL, "ejemplo.06", 1);
    await page.goto("/picking/ruta");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");

    // Seleccionar ruta 1
    await page.locator(`button[data-r="${rutaPiloto06.id}"]`).click();

    // Comprobar datos de cabecera
    await expect(page.getByRole("heading", { level: 3 })).toContainText(`Ruta ${rutaPiloto06.numero}`);
    await expect(page.locator(".ruta-datos").getByText(`Ruta`).locator("..")).toContainText(
      String(rutaPiloto06.numero),
    );

    // Tabla de paradas/clientes
    const filas = page.locator("tbody[data-paradas] tr");
    await expect(filas).toHaveCount(3);

    // Fila 1: Textiles Modernos S.A. | Zona 12 | 250
    await expect(filas.nth(0)).toContainText("Textiles Modernos S.A.");
    await expect(filas.nth(0)).toContainText("Zona 12");
    await expect(filas.nth(0)).toContainText("250");

    // Total de la ruta: 700 kg
    await expect(page.locator("tfoot")).toContainText("700");
  });

  test("Criterio 4 y 5: RF-SL-28, RF-SL-29, RN-29, RN-11 - Cierre de ruta y entrega con recorrido reordenado", async ({
    page,
    context,
    baseURL,
  }) => {
    await entrarEnSede(context, baseURL, "ejemplo.06", 1);
    await page.goto("/picking/ruta");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");

    // Seleccionar ruta 1 (tiene 3 entregas)
    await page.locator(`button[data-r="${rutaPiloto06.id}"]`).click();

    // Reordenar paradas con teclado en el asa accesible: mover fila 1 abajo
    const primerAsa = page.locator(".asa").first();
    await primerAsa.focus();
    await page.keyboard.press("Space");
    await page.waitForTimeout(300);
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(300);
    await page.keyboard.press("Space");

    // Verificar que el orden visual cambió: Calzados El Águila pasa a ser la primera parada
    await expect(page.locator("tbody[data-paradas] tr").first()).toContainText("Calzados El Águila");

    // Botón "Ruta Entregada" sin texto de ayuda (CAM-95)
    const botonEntregar = page.getByRole("button", { name: "Ruta Entregada" });
    await expect(botonEntregar).toBeVisible();
    await expect(page.getByText("Al confirmar, la ruta se marca como entregada")).toHaveCount(0);

    // Click abre modal de confirmación con el nuevo recorrido reordenado
    await botonEntregar.click();
    const dialogo = page.getByRole("dialog");
    await expect(dialogo).toBeVisible();
    await expect(dialogo.getByText(`Entregar Ruta ${rutaPiloto06.numero}`)).toBeVisible();
    await expect(dialogo.getByText("Se registra la entrega completa")).toBeVisible();
    await expect(dialogo.getByText("Calzados El Águila")).toBeVisible();
    await expect(dialogo.getByText("Textiles Modernos S.A.")).toBeVisible();

    // Confirmar entrega
    await dialogo.getByRole("button", { name: "Ruta Entregada" }).click();

    // Toast de éxito
    await expect(
      page.getByText(`Ruta ${rutaPiloto06.numero} entregada. Quedó en el registro histórico de Reportes.`, {
        exact: true,
      }),
    ).toBeVisible();

    // La ruta deja de aparecer en el módulo
    await expect(page.locator(`button[data-r="${rutaPiloto06.id}"]`)).toHaveCount(0);

    // Verificar en BD que el estado sea Entregado
    const resultado = ejecutarRuta("consultar", String(rutaPiloto06.id));
    expect(resultado.estado).toBe("Entregado");

    // Verificar en BD que el recorrido guardado (orden) es el nuevo orden tras el reordenamiento (CP-41)
    const entregasDb: { cliente: string; orden: number }[] = ejecutarRuta(
      "consultar-entregas",
      String(rutaPiloto06.id),
    );
    expect(entregasDb[0].cliente).toBe("Calzados El Águila");
    expect(entregasDb[0].orden).toBe(1);
    expect(entregasDb[1].cliente).toBe("Textiles Modernos S.A.");
    expect(entregasDb[1].orden).toBe(2);
    expect(entregasDb[2].cliente).toBe("Distribuidora La Central");
    expect(entregasDb[2].orden).toBe(3);
  });

  test("Criterio 6 y 7 / RNF-08 / RNF-14: Accesibilidad con axe y responsividad", async ({
    page,
    context,
    baseURL,
  }) => {
    await entrarEnSede(context, baseURL, "ejemplo.06", 1);
    await page.goto("/picking/ruta");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");

    await expect(page.locator(`button[data-r="${rutaSecundaria.id}"]`)).toBeVisible();

    // Verificar que no hay desborde horizontal (RNF-14)
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

    // Seleccionar ruta secundaria y comprobar visibilidad del botón de entrega
    await page.locator(`button[data-r="${rutaSecundaria.id}"]`).click();
    const boton = page.getByRole("button", { name: "Ruta Entregada" });
    await expect(boton).toBeVisible();

    // Axe: sin violaciones serias ni críticas
    const violaciones = await violacionesGraves(page);
    expect(violaciones).toEqual([]);
  });

  test("H-69 / RNF-14: el piloto reordena los clientes con el arrastre táctil (hasTouch) en el teléfono", async ({
    browser,
    context,
    page,
    baseURL,
  }, testInfo) => {
    let ctxTouch = context;
    let pageTouch = page;
    let cerrarCtxTouch = false;

    if (!testInfo.project.use.hasTouch) {
      ctxTouch = await browser.newContext({
        baseURL: baseURL ?? "http://localhost:3000",
        hasTouch: true,
        viewport: { width: 390, height: 844 },
      });
      await entrarEnSede(ctxTouch, baseURL, "ejemplo.06", 1);
      pageTouch = await ctxTouch.newPage();
      cerrarCtxTouch = true;
    } else {
      await entrarEnSede(ctxTouch, baseURL, "ejemplo.06", 1);
    }

    try {
      await pageTouch.goto("/picking/ruta");
      await expect(pageTouch.locator(".app")).toHaveAttribute("data-hidratado", "true");

      // Seleccionar la ruta secundaria que tiene dos paradas
      await pageTouch.locator(`button[data-r="${rutaSecundaria.id}"]`).click();
      const tabla = pageTouch.locator("tbody[data-paradas]");
      await expect(tabla).toBeVisible();

      const filasAntes = tabla.locator("tr");
      await expect(filasAntes).toHaveCount(2);
      const cliente1Antes = await filasAntes.first().locator("b").innerText();
      const cliente2Antes = await filasAntes.nth(1).locator("b").innerText();
      expect(cliente1Antes).toBe("Química Industrial");
      expect(cliente2Antes).toBe("Curtidos del Norte");

      const asa1 = filasAntes.first().locator(".asa");
      const asa2 = filasAntes.nth(1).locator(".asa");
      await asa1.scrollIntoViewIfNeeded();

      const box1 = (await asa1.boundingBox())!;
      const box2 = (await asa2.boundingBox())!;

      const respTouch = pageTouch.waitForResponse(
        (r) => r.request().method() === "POST" && !!r.request().headers()["next-action"],
      );

      const sesionCdp = await ctxTouch.newCDPSession(pageTouch);
      await sesionCdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: box1.x + box1.width / 2, y: box1.y + box1.height / 2 }],
      });
      // Esperar 420 ms para superar el umbral de 380 ms de pulsación larga del sensor táctil
      await pageTouch.waitForTimeout(420);
      await sesionCdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: box2.x + box2.width / 2, y: box2.y + box2.height / 2 + 10 }],
      });
      await pageTouch.waitForTimeout(100);
      await sesionCdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await sesionCdp.detach();
      await respTouch;

      // Comprobar que en el DOM se reordenaron las paradas
      await expect(tabla.locator("tr").first().locator("b")).toHaveText("Curtidos del Norte");
      await expect(tabla.locator("tr").nth(1).locator("b")).toHaveText("Química Industrial");

      // Comprobar persistencia tras recargar
      await pageTouch.reload();
      await expect(pageTouch.locator(".app")).toHaveAttribute("data-hidratado", "true");
      await pageTouch.locator(`button[data-r="${rutaSecundaria.id}"]`).click();
      await expect(pageTouch.locator("tbody[data-paradas] tr").first().locator("b")).toHaveText("Curtidos del Norte");
      await expect(pageTouch.locator("tbody[data-paradas] tr").nth(1).locator("b")).toHaveText("Química Industrial");
    } finally {
      if (cerrarCtxTouch) {
        await ctxTouch.close();
      }
    }
  });
});
