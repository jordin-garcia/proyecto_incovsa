import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { expect, type BrowserContext, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { test } from "../flujo/servidor-produccion";
import { irA, recargar } from "../comunes/navegacion";

try {
  process.loadEnvFile();
} catch {
  // En la CI las variables ya vienen del entorno.
}

// JM-05: tablero de Bodega en pantalla completa (specs/07, RF-SL-25, RF-SL-58, RF-SL-77, RNF-02, RNF-13).

function preparar(...argumentos: string[]) {
  return execFileSync(
    process.execPath,
    ["node_modules/tsx/dist/cli.mjs", "pruebas-e2e/picking/preparar-envio.ts", ...argumentos],
    { encoding: "utf8" },
  ).trim();
}

async function entrar(contexto: BrowserContext, url: string | undefined) {
  expect(process.env.CLAVE_DEMO, "Se requiere CLAVE_DEMO").toBeTruthy();
  // El servidor de producción se prueba sin Caddy: simula su cabecera de IP de confianza (JG-10).
  await contexto.setExtraHTTPHeaders({ "x-real-ip": "127.0.0.1" });
  const respuesta = await contexto.request.post("/api/auth/picking/sign-in/username", {
    headers: { origin: url! },
    data: { usuario: "ejemplo.05", clave: process.env.CLAVE_DEMO },
  });
  expect(respuesta.ok()).toBe(true);
}

/** Abre el tablero y muestra la ruta o el pedido indicado, que se elige en la cola como en el prototipo. */
async function abrirTablero(page: Page, envioId: number) {
  await irA(page, "/picking/tablero");
  await expect(page.locator(".tb")).toHaveAttribute("data-hidratado", "true");
  await expect(page.locator(".tb-pill[data-vivo]")).toHaveAttribute("data-conectado", "true", { timeout: 15_000 });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await verEnvio(page, envioId);
}

async function verEnvio(page: Page, envioId: number) {
  await page.locator(`.tb-sig[data-id="${envioId}"] .tb-sig-ver`).click();
  await expect(page.locator(".tb-actual")).toHaveAttribute("data-id", String(envioId));
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
  // H-72: Única excepción aprobada por el coordinador (specs/18, JM-08): el cuadro lima del pedido conserva los colores del prototipo solo en el modo claro.
  const builder = new AxeBuilder({ page });
  const esModoOscuro = (await page.locator(".tb[data-tema='oscuro']").count()) > 0;
  if (!esModoOscuro) {
    builder.exclude(".tb-num.recoge small");
  }
  const resultado = await builder.analyze();
  return resultado.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => ({ regla: v.id, nodos: v.nodes.map((n) => `${n.target.join(" ")} · ${n.failureSummary ?? ""}`) }));
}

const estilo = (page: Page, selector: string, propiedad: "backgroundColor" | "color") =>
  page
    .locator(selector)
    .first()
    .evaluate((el, p) => getComputedStyle(el)[p], propiedad);

const BASE: Record<string, number> = { telefono: 210, tableta: 220, escritorio: 230, tv: 240 };

test.describe("Tablero de Bodega en pantalla completa (JM-05)", () => {
  test.describe.configure({ mode: "serial" });

  let ruta: { envioId: number; numero: number };
  let pedido: { envioId: number; numero: number };
  let larga: { envioId: number; numero: number };
  let despacho: { envioId: number; numero: number };
  let muyLarga: { envioId: number; numero: number };
  let sinCamion: { envioId: number; numero: number };

  test.beforeAll(async ({}, informacion) => {
    ({ ruta, pedido, larga, despacho, muyLarga, sinCamion } = JSON.parse(
      preparar("crear-tablero", String(BASE[informacion.project.name] ?? 250)),
    ));
  });

  test.afterAll(async () => {
    const ids = [ruta, pedido, larga, despacho, muyLarga, sinCamion].filter(Boolean).map((d) => String(d.envioId));
    if (ids.length) preparar("limpiar", ...ids);
  });

  test("RF-SL-58: cambia entre modo claro y modo oscuro y el modo se conserva al recargar esa pantalla sin afectar a otras", async ({
    browser,
    context,
    page,
    baseURL,
  }) => {
    await entrar(context, baseURL);
    await abrirTablero(page, ruta.envioId);
    const tablero = page.locator(".tb");
    const claro = page.getByRole("button", { name: "Modo claro" });
    const oscuro = page.getByRole("button", { name: "Modo oscuro" });

    // Sin elección previa, el tablero abre en modo claro (decisión de Jordin del 24/10; el prototipo abre en oscuro).
    await expect(tablero).toHaveAttribute("data-tema", "claro");
    await expect(claro).toHaveAttribute("aria-pressed", "true");
    await expect(oscuro).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator(".tb-sup img")).toHaveAttribute("src", /incovsa-quimicos\.webp/);

    await oscuro.click();
    await expect(tablero).toHaveAttribute("data-tema", "oscuro");
    await expect(oscuro).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".tb-sup img")).toHaveAttribute("src", /incovsa-quimicos-blanco\.webp/);

    await recargar(page);
    await expect(page.locator(".tb")).toHaveAttribute("data-hidratado", "true");
    await expect(page.locator(".tb")).toHaveAttribute("data-tema", "oscuro");

    // Otra pantalla del mismo navegador no hereda el modo y su cambio no altera la primera.
    const otra = await context.newPage();
    try {
      await abrirTablero(otra, ruta.envioId);
      await expect(otra.locator(".tb")).toHaveAttribute("data-tema", "claro");
      await otra.getByRole("button", { name: "Modo oscuro" }).click();
      await otra.getByRole("button", { name: "Modo claro" }).click();
      await expect(otra.locator(".tb")).toHaveAttribute("data-tema", "claro");
    } finally {
      await otra.close();
    }
    await recargar(page);
    await expect(page.locator(".tb")).toHaveAttribute("data-hidratado", "true");
    await expect(page.locator(".tb")).toHaveAttribute("data-tema", "oscuro");

    // Al reiniciar el navegador (un contexto nuevo, sin la sesión del navegador anterior) vuelve al modo claro.
    const reiniciado = await browser.newContext({ ignoreHTTPSErrors: true, baseURL });
    try {
      await entrar(reiniciado, baseURL);
      const nueva = await reiniciado.newPage();
      await abrirTablero(nueva, ruta.envioId);
      await expect(nueva.locator(".tb")).toHaveAttribute("data-tema", "claro");
    } finally {
      await reiniciado.close();
    }
  });

  test("CAM-93 / CAM-94: colores del lote y del cuadro del pedido en cada modo, y la silueta del camión grande en todas las rutas", async ({
    context,
    page,
    baseURL,
  }) => {
    await entrar(context, baseURL);
    await abrirTablero(page, pedido.envioId);

    // Modo oscuro: lote y cuadro de «PEDIDO» en gris (fondo #3A3A3E, texto #EDEDED).
    await page.getByRole("button", { name: "Modo oscuro" }).click();
    await expect(page.locator(".tb")).toHaveAttribute("data-tema", "oscuro");
    await expect(page.locator(".tb-num")).toHaveClass(/recoge/);
    expect(await estilo(page, ".tb-num.recoge", "backgroundColor")).toBe("rgb(58, 58, 62)");
    expect(await estilo(page, ".tb-num.recoge", "color")).toBe("rgb(237, 237, 237)");
    expect(await estilo(page, ".lote-tb:not(.sin)", "backgroundColor")).toBe("rgb(58, 58, 62)");
    expect(await estilo(page, ".lote-tb:not(.sin)", "color")).toBe("rgb(237, 237, 237)");
    await expect(page.locator(".lote-tb.sin")).toHaveText("Sin lote");

    // Modo claro: cuadro del pedido en verde lima (--lima) y lote en verde (--v100 con texto --v800).
    await page.getByRole("button", { name: "Modo claro" }).click();
    expect(await estilo(page, ".tb-num.recoge", "backgroundColor")).toBe("rgb(100, 147, 42)");
    expect(await estilo(page, ".lote-tb:not(.sin)", "backgroundColor")).toBe("rgb(227, 242, 231)");
    expect(await estilo(page, ".lote-tb:not(.sin)", "color")).toBe("rgb(10, 70, 31)");

    // La ruta conserva el verde principal y no lleva la clase del pedido.
    await verEnvio(page, ruta.envioId);
    await expect(page.locator(".tb-num")).not.toHaveClass(/recoge/);
    expect(await estilo(page, ".tb-num", "backgroundColor")).toBe("rgb(18, 108, 42)");

    // Camiones de 3,400 kg y de 6,000 kg: la misma silueta grande, con su nombre y capacidad arriba.
    const silueta = page.locator(".tb-camion svg.silueta");
    await expect(silueta).toHaveAttribute("data-modelo", "grande");
    const forma = await silueta.getAttribute("viewBox");
    await expect(page.locator(".tb-camion .tt")).toContainText(/Capacidad 3,400 kg/i);
    await verEnvio(page, larga.envioId);
    await expect(page.locator(".tb-camion .tt")).toContainText("Camión 3");
    await expect(page.locator(".tb-camion .tt")).toContainText(/Capacidad 6,000 kg/i);
    await expect(silueta).toHaveAttribute("data-modelo", "grande");
    await expect(silueta).toHaveAttribute("viewBox", forma!);
    await expect(silueta).toHaveAttribute("aria-label", "Camión de 6,000 kg");

    // El pedido que recoge el cliente no muestra camión.
    await verEnvio(page, pedido.envioId);
    await expect(page.locator(".tb-camion svg.silueta")).toHaveCount(0);
    await expect(page.locator(".tb-recoge")).toContainText("El cliente recoge en bodega");
  });

  test("RF-SL-77 (CP-40): con más líneas de las que caben en una columna, se numeran de arriba hacia abajo, primero la izquierda", async ({
    context,
    page,
    baseURL,
  }, informacion) => {
    await entrar(context, baseURL);
    await abrirTablero(page, larga.envioId);
    const lineas = page.locator(".tb-linea");
    await expect(lineas).toHaveCount(25);
    const contenedor = page.locator(".tb-lineas");

    // En la TV y en escritorio las 25 líneas no caben en una columna; en tableta y teléfono hay menos de 900 px.
    const dos = ["tv", "escritorio"].includes(informacion.project.name);
    if (dos) await expect(contenedor).toHaveClass(/\bdos\b/);
    else await expect(contenedor).not.toHaveClass(/\bdos\b/);

    const cajas = await lineas.evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { n: Number(el.querySelector(".ord")?.textContent), x: Math.round(r.left), y: Math.round(r.top) };
      }),
    );
    expect(cajas.map((c) => c.n)).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
    const columnas = dos ? [cajas.slice(0, 13), cajas.slice(13)] : [cajas];
    for (const columna of columnas) {
      expect(new Set(columna.map((c) => c.x)).size).toBe(1);
      for (let i = 1; i < columna.length; i++) expect(columna[i]!.y).toBeGreaterThan(columna[i - 1]!.y);
    }
    if (dos) {
      expect(columnas[1]![0]!.x).toBeGreaterThan(columnas[0]![0]!.x);
      expect(columnas[1]![0]!.y).toBe(columnas[0]![0]!.y);
      // Toda la ruta cabe en la pantalla, sin desplazamiento, como el prototipo.
      const ultima = await lineas.nth(12).boundingBox();
      expect(ultima!.y + ultima!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
    }
  });

  test("RNF-02: en una ruta que no cabe en la pantalla se pueden ver y tocar todas las líneas", async ({
    context,
    page,
    baseURL,
  }) => {
    await entrar(context, baseURL);
    await abrirTablero(page, muyLarga.envioId);
    const lineas = page.locator(".tb-linea");
    await expect(lineas).toHaveCount(60);
    // Cada línea, llevada a la vista, queda dentro de la pantalla y es lo que hay en su centro (nada la tapa).
    const tapadas = await lineas.evaluateAll((els) =>
      els.flatMap((el) => {
        el.scrollIntoView({ block: "nearest" });
        const r = el.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;
        const dentro = r.left >= 0 && r.right <= innerWidth + 0.5 && r.top >= 0 && r.bottom <= innerHeight + 0.5;
        const visible = document.elementFromPoint(x, y)?.closest(".tb-linea") === el;
        const casilla = el.querySelector(".chk-tb")!.getBoundingClientRect();
        const casillaVisible = casilla.right <= innerWidth + 0.5 && casilla.width > 0;
        return dentro && visible && casillaVisible ? [] : [el.querySelector(".ord")?.textContent];
      }),
    );
    expect(tapadas).toEqual([]);
    // La última se marca con un toque.
    const ultima = lineas.last();
    const respuesta = page.waitForResponse(
      (r) => r.request().method() === "POST" && !!r.request().headers()["next-action"],
    );
    await ultima.locator(".prod").click();
    await respuesta;
    await expect(ultima).toHaveClass(/\blista\b/);
    const ancho = page.viewportSize()!.width;
    if (ancho > 720) {
      // En tableta, escritorio y TV solo se desplaza el área de las líneas: la pantalla y la tarjeta no se mueven,
      // y la cabecera, las opciones y el despacho siguen a la vista. (En el teléfono se desplaza toda la pantalla.)
      expect(await page.locator(".tb-lineas").evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
      expect(await page.locator(".tb-actual").evaluate((el) => el.scrollTop)).toBe(0);
      expect(await page.locator(".tb").evaluate((el) => el.scrollTop)).toBe(0);
      // 0.99 y no 1: en 768 px, WebKit deja la cabecera a menos de un píxel del borde por redondeo (0.9994, JG-16).
      await expect(page.locator(".tb-cab")).toBeInViewport({ ratio: 0.99 });
      await expect(page.locator(".tb-herr")).toBeInViewport({ ratio: 0.99 });
      await expect(page.getByRole("button", { name: "Ruta Despachada" })).toBeInViewport({ ratio: 0.99 });
    } else {
      await expect(page.getByRole("button", { name: "Ruta Despachada" })).toBeVisible();
    }
    // Nada se sale de la pantalla a lo ancho, ni el panel del camión.
    expect(await page.locator(".tb").evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
    const lado = await page.locator(".tb-lado").boundingBox();
    expect(lado!.x + lado!.width).toBeLessThanOrEqual(ancho);
    if (ancho > 720 && ancho <= 1024) {
      // En tableta, el camión y la cola se reparten el ancho por igual: las líneas no ensanchan el camión.
      const camion = (await page.locator(".tb-camion").boundingBox())!.width;
      const cola = (await page.locator(".tb-cola").boundingBox())!.width;
      expect(Math.abs(camion - cola)).toBeLessThanOrEqual(2);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      page.viewportSize()!.width,
    );
  });

  test("RNF-13 / RF-SL-23: marcar una línea en Bodega se ve en el tablero en menos de 2 segundos, resaltada", async ({
    browser,
    context,
    page,
    baseURL,
    esperarPublicacion,
  }) => {
    const segundo = await browser.newContext({ ignoreHTTPSErrors: true, baseURL });
    try {
      await entrar(context, baseURL);
      await entrar(segundo, baseURL);
      const tablero = await segundo.newPage();
      await abrirTablero(tablero, ruta.envioId);
      await irA(page, "/picking/bodega");
      await expect(page.locator(".vivo")).toHaveAttribute("data-conectado", "true", { timeout: 15_000 });

      const fila = page.locator(`article.ped[data-id="${ruta.envioId}"] tbody tr`).first();
      const lineaId = await fila.getAttribute("data-id");
      const remota = tablero.locator(`.tb-linea[data-id="${lineaId}"]`);
      await expect(remota).not.toHaveClass(/\blista\b/);
      await expect(tablero.locator(".tb-anillo span")).toHaveText("0/2");

      const respuesta = page.waitForResponse(
        (r) => r.request().method() === "POST" && !!r.request().headers()["next-action"],
      );
      // El reloj empieza en avisarCambio del servidor (JG-10); escucha antes del clic.
      const propagacion = esperarPublicacion(1).then(async (inicio) => {
        const actualizado = await tablero.waitForFunction(
          (id) => document.querySelector(`.tb-linea[data-id="${id}"]`)?.classList.contains("lista") ?? false,
          lineaId,
          { timeout: Math.max(1, 1999 - (Date.now() - inicio)), polling: "raf" },
        );
        const transcurrido = Date.now() - inicio;
        expect(transcurrido).toBeLessThan(1999);
        await actualizado.dispose();
        const archivo = test.info().outputPath("latencia-tablero.json");
        await writeFile(archivo, JSON.stringify({ sede: 1, ms: transcurrido, limite: 1999 }));
        await test.info().attach("latencia-publicacion", { path: archivo, contentType: "application/json" });
      });
      const [, resultado] = await Promise.all([fila.locator("button.marca").click(), respuesta, propagacion]);
      expect(resultado.ok()).toBe(true);

      // Se resalta lo que cambió en otra pantalla, y el avance se actualiza.
      await expect(remota).toHaveClass(/\brecien\b/);
      await expect(remota.locator(".chk-tb")).toHaveAttribute("aria-pressed", "true");
      await expect(tablero.locator(".tb-anillo span")).toHaveText("1/2");
      await expect(tablero.locator(`.tb-sig[data-id="${ruta.envioId}"] .p`)).toHaveText("1/2");

      // Si la misma línea vuelve a cambiar, se resalta otra vez (el prototipo vuelve a pintar cada cambio).
      const segunda = tablero.waitForFunction(
        (id) => {
          const el = document.querySelector(`.tb-linea[data-id="${id}"]`);
          return !!el && el.classList.contains("recien-2") && el.getAnimations().length > 0;
        },
        lineaId,
        { polling: "raf" },
      );
      const desmarcado = page.waitForResponse(
        (r) => r.request().method() === "POST" && !!r.request().headers()["next-action"],
      );
      await fila.locator("button.marca").click();
      await desmarcado;
      await segunda;
      await expect(remota).not.toHaveClass(/\blista\b/);
    } finally {
      await segundo.close();
    }
  });

  test("RF-SL-23 / RF-SL-20 / RF-SL-74: en el tablero se marca con un toque, se marca todo, se ordena por peso y se ve el detalle", async ({
    context,
    page,
    baseURL,
  }) => {
    await entrar(context, baseURL);
    await abrirTablero(page, pedido.envioId);
    const lineas = page.locator(".tb-linea");
    await expect(lineas).toHaveCount(3);

    // Tocar la línea la marca, y queda guardado.
    const accion = () =>
      page.waitForResponse((r) => r.request().method() === "POST" && !!r.request().headers()["next-action"]);
    let respuesta = accion();
    await lineas.nth(1).click();
    await respuesta;
    await expect(lineas.nth(1)).toHaveClass(/\blista\b/);
    await expect(page.locator(".tb-pie .txt")).toContainText("Faltan 2.");
    await recargar(page);
    await verEnvio(page, pedido.envioId);
    await expect(lineas.nth(1)).toHaveClass(/\blista\b/);

    // Con el teclado, la casilla de cada línea también marca.
    respuesta = accion();
    await page.getByRole("button", { name: /Marcar como listo.*Lote 5287/ }).press("Enter");
    await respuesta;
    await expect(lineas.nth(0)).toHaveClass(/\blista\b/);

    // Ordenar por peso: de mayor a menor kg (40, 10, 5).
    respuesta = accion();
    await page.getByRole("button", { name: "Ordenar por peso" }).click();
    await respuesta;
    await expect(lineas.locator(".kg .num")).toHaveText(["40 kg", "10 kg", "5 kg"]);

    // Marcar todo habilita el despacho y cambia a «Desmarcar todo».
    respuesta = accion();
    await page.getByRole("button", { name: "Marcar todo" }).click();
    await respuesta;
    await expect(page.locator(".tb-linea.lista")).toHaveCount(3);
    await expect(page.getByRole("button", { name: "Pedido Despachado" })).toBeEnabled();
    await expect(page.locator(".tb-pie .txt")).toContainText("Todo listo. Al despachar, el pedido pasa a Despachado.");
    respuesta = accion();
    await page.getByRole("button", { name: "Desmarcar todo" }).click();
    await respuesta;
    await expect(page.locator(".tb-linea.lista")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Pedido Despachado" })).toBeDisabled();

    // Si falla la red, la marca vuelve atrás con un mensaje y la pantalla sigue funcionando (auditoría, H-24).
    const sinRed = (url: URL) => url.pathname === "/picking/tablero";
    await page.route(sinRed, (r) => (r.request().headers()["next-action"] ? r.abort("connectionreset") : r.continue()));
    await lineas.nth(0).click();
    await expect(page.locator(".toast.t-error")).toContainText("No se pudo completar la operación");
    await expect(lineas.nth(0)).not.toHaveClass(/\blista\b/);
    await page.unroute(sinRed);

    // Detalle de Pedido: solo muestra lo que se armó en Facturación.
    await page.getByRole("button", { name: "Detalle de Pedido" }).click();
    const ventana = page.getByRole("dialog");
    await expect(ventana.getByRole("heading", { name: `Detalle de Pedido ${pedido.numero}` })).toBeVisible();
    await expect(ventana).toContainText("Cliente A");
    await ventana.getByRole("button", { name: "Cerrar" }).first().click();
    await expect(ventana).toHaveCount(0);
  });

  test("RF-SL-25: la pantalla se queda en la ruta que muestra aunque cambie la prioridad de la cola", async ({
    context,
    page,
    baseURL,
  }) => {
    await entrar(context, baseURL);
    await irA(page, "/picking/tablero");
    await expect(page.locator(".tb")).toHaveAttribute("data-hidratado", "true");
    await expect(page.locator(".tb-pill[data-vivo]")).toHaveAttribute("data-conectado", "true", { timeout: 15_000 });
    // Sin tocar la cola, muestra la primera; al bajarla con el teclado en la cola, la sigue mostrando.
    const primera = (await page.locator(".tb-actual").getAttribute("data-id"))!;
    const asa = page.locator(`.tb-sig[data-id="${primera}"] .asa-tb`);
    const reordenar = async (tecla: "ArrowDown" | "ArrowUp") => {
      const respuesta = page.waitForResponse(
        (r) => r.request().method() === "POST" && !!r.request().headers()["next-action"],
      );
      // Con pausas, como bodega-tiempo-real.spec.ts: el sensor de teclado de dnd-kit mide entre teclas.
      await asa.scrollIntoViewIfNeeded();
      await asa.focus();
      await page.keyboard.press("Space", { delay: 80 });
      await page.waitForTimeout(150);
      await page.keyboard.press(tecla, { delay: 80 });
      await page.waitForTimeout(150);
      await page.keyboard.press("Space", { delay: 80 });
      await respuesta;
    };
    await reordenar("ArrowDown");
    await expect(page.locator(".tb-sig").nth(1)).toHaveAttribute("data-id", primera);
    await expect(page.locator(".tb-actual")).toHaveAttribute("data-id", primera);
    await expect(page.locator(".tb-cab h2")).toContainText(/Prioridad 2 de \d+/);
    await recargar(page);
    await expect(page.locator(".tb")).toHaveAttribute("data-hidratado", "true");
    await reordenar("ArrowUp");
    await expect(page.locator(".tb-sig").first()).toHaveAttribute("data-id", primera);
  });

  test("RF-SL-24: con todo marcado, Pedido Despachado confirma, avisa y saca el pedido del tablero", async ({
    context,
    page,
    baseURL,
  }) => {
    await entrar(context, baseURL);
    await abrirTablero(page, despacho.envioId);
    const accion = page.waitForResponse(
      (r) => r.request().method() === "POST" && !!r.request().headers()["next-action"],
    );
    await page.getByRole("button", { name: "Marcar todo" }).click();
    await accion;
    await page.getByRole("button", { name: "Pedido Despachado" }).click();
    const ventana = page.getByRole("dialog");
    await expect(ventana).toContainText(`Despachar Pedido ${despacho.numero}`);
    await expect(ventana).toContainText("El pedido pasa a Despachado. No se requiere confirmar la carga en el camión.");
    await ventana.getByRole("button", { name: "Pedido Despachado" }).click();
    await expect(page.locator(".tb-hecho")).toContainText(`Pedido ${despacho.numero} despachado`);
    await expect(page.locator(".tb-hecho")).toContainText("Pasa a Despachado");
    await expect(page.locator(`.tb-sig[data-id="${despacho.envioId}"]`)).toHaveCount(0);
    await expect(page.locator(".tb-hecho")).toHaveCount(0, { timeout: 5000 });
  });

  test("RNF-02 / RNF-08: coincide con el prototipo en los dos modos y no tiene violaciones serias de accesibilidad", async ({
    context,
    page,
    baseURL,
  }, informacion) => {
    await entrar(context, baseURL);
    await abrirTablero(page, ruta.envioId);
    for (const modo of ["Modo oscuro", "Modo claro"] as const) {
      await page.getByRole("button", { name: modo }).click();
      // Como el prototipo, en el teléfono (720 px o menos) se oculta el título de la barra superior.
      const titulo = page.locator(".tb-tit");
      await expect(titulo).toContainText("Tablero de preparación");
      await expect(titulo).toContainText("Bodega Quetzaltenango");
      if (page.viewportSize()!.width <= 720) await expect(titulo).toBeHidden();
      else await expect(titulo).toBeVisible();
      await expect(page.locator(".tb-pill").nth(1)).toContainText("en cola");
      await expect(page.locator(".tb-reloj")).toHaveText(/^\d{2}:\d{2}$/);
      await expect(page.locator(".tb-cab h2")).toContainText(/Prioridad \d+ de \d+/);
      await expect(page.locator(".tb-tipo")).toHaveText("Envío en camión");
      await expect(page.locator(".tb-programada")).toHaveText("Programada 18/10/2026 · 13:30");
      await expect(page.locator(".tb-prog .tot small")).toHaveText("kg en 2 línea(s)");
      await expect(page.locator(".tb-pie .txt")).toContainText(
        "Toque cada línea cuando el producto esté fuera de la bodega.",
      );
      await expect(page.locator(".tb-plano .lbl")).toContainText("Ocupación por peso, en el orden del tablero");
      await expect(page.locator(".tb-cola .tt")).toContainText("Cola de pedidos");
      await expect(page.locator(".tb-cola .tt")).toContainText("Arrastre para priorizar");
      await expect(page.getByRole("link", { name: "Volver al módulo" })).toHaveAttribute("href", "/picking/bodega");
      await expect(page.getByRole("button", { name: "Pantalla completa" })).toBeVisible();
      // RNF-02: nada se sale de la pantalla a lo ancho.
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        page.viewportSize()!.width,
      );
      expect(await violacionesGraves(page)).toEqual([]);
      await test.info().attach(`tablero-${informacion.project.name}-${modo === "Modo claro" ? "claro" : "oscuro"}`, {
        body: await page.screenshot(),
        contentType: "image/png",
      });
    }

    // El pedido, con el cuadro lima de «PEDIDO» y sin camión, en los dos modos.
    await verEnvio(page, pedido.envioId);
    for (const modo of ["Modo oscuro", "Modo claro"] as const) {
      await page.getByRole("button", { name: modo }).click();
      await expect(page.locator(".tb-num.recoge small")).toHaveText("Pedido");
      await expect(page.locator(".tb-tipo")).toHaveText("Recoge en bodega");
      await expect(page.locator(".tb-recoge")).toContainText(
        "No pasa por Ruta. Al despachar, el pedido termina como Despachado.",
      );
      await expect(page.locator(".tb-camion .tb-carga")).toContainText("3 producto(s)");
      expect(await violacionesGraves(page)).toEqual([]);
      const nombre = `tablero-pedido-${informacion.project.name}-${modo === "Modo claro" ? "claro" : "oscuro"}`;
      await test.info().attach(nombre, { body: await page.screenshot(), contentType: "image/png" });
    }
  });

  test("H-71: si la ruta no tiene camión asignado se muestra con camión «—» y no como recogida en bodega", async ({
    page,
    context,
    baseURL,
  }) => {
    await entrar(context, baseURL);
    await abrirTablero(page, sinCamion.envioId);
    await expect(page.locator(".tb-tipo")).toHaveText("Envío en camión");
    await expect(page.locator(".tb-camion .tt b")).toHaveText("—");
    await expect(page.locator(".tb-camion .tt small")).toHaveText("Capacidad 1 kg");
    await expect(page.locator(".tb-recoge")).toHaveCount(0);
    await expect(page.locator(`.tb-sig[data-id="${sinCamion.envioId}"] b`)).toContainText("—");
  });

  test("H-73: un usuario sin permiso de Bodega (ejemplo.06) es redirigido a su módulo inicial (/picking/ruta)", async ({
    context,
    page,
    baseURL,
  }) => {
    await context.setExtraHTTPHeaders({ "x-real-ip": "127.0.0.1" });
    const respuesta = await context.request.post("/api/auth/picking/sign-in/username", {
      headers: { origin: baseURL! },
      data: { usuario: "ejemplo.06", clave: process.env.CLAVE_DEMO },
    });
    expect(respuesta.ok()).toBe(true);

    await irA(page, "/picking/tablero");
    await expect(page).toHaveURL(/\/picking\/ruta/);
  });
});
