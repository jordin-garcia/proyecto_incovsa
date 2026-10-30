import { expect, type BrowserContext, type Locator, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { test, type EsperarPublicacion } from "./servidor-produccion";

function preparar(...argumentos: string[]) {
  return execFileSync(
    process.execPath,
    ["node_modules/tsx/dist/cli.mjs", "pruebas-e2e/picking/preparar-envio.ts", ...argumentos],
    { encoding: "utf8" },
  ).trim();
}

async function entrar(contexto: BrowserContext, url: string | undefined) {
  expect(process.env.CLAVE_DEMO, "Se requiere CLAVE_DEMO").toBeTruthy();
  // El servidor de producción se prueba sin Caddy: simula su cabecera de IP de confianza.
  await contexto.setExtraHTTPHeaders({ "x-real-ip": "127.0.0.1" });
  const respuesta = await contexto.request.post("/api/auth/picking/sign-in/username", {
    headers: { origin: url! },
    data: { usuario: "ejemplo.05", clave: process.env.CLAVE_DEMO },
  });
  expect(respuesta.ok()).toBe(true);
}

async function abrirBodega(page: Page) {
  await page.goto("/picking/bodega");
  await expect(page.locator(".vivo")).toHaveAttribute("data-conectado", "true");
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

async function cambiarMarca(
  page: Page,
  tarjeta: Locator,
  remota: Locator,
  marcado: boolean,
  esperarPublicacion: EsperarPublicacion,
  limite = 1999,
) {
  const id = await remota.getAttribute("data-id");
  const respuesta = page.waitForResponse(
    (r) => r.request().method() === "POST" && !!r.request().headers()["next-action"],
  );
  // Escucha antes del clic. El reloj empieza en avisarCambio, antes de autorizar/enviar SSE;
  // recibir el IPC o la respuesta POST no reinicia el presupuesto. Ambos procesos usan el reloj del mismo equipo.
  const propagacion = esperarPublicacion(1).then(async (inicio) => {
    // Observa cada frame, sin esperar la respuesta POST ni el retroceso de una aserción con reintentos.
    const actualizado = await remota.page().waitForFunction(
      ({ id, cantidad }) => {
        const envio = document.querySelector(`article.ped[data-id="${id}"]`);
        return !!envio && envio.querySelectorAll("tr.lista").length === cantidad;
      },
      { id, cantidad: marcado ? 3 : 0 },
      { timeout: Math.max(1, limite - (Date.now() - inicio)), polling: "raf" },
    );
    const transcurrido = Date.now() - inicio;
    expect(transcurrido).toBeGreaterThanOrEqual(0);
    expect(transcurrido).toBeLessThan(limite);
    await actualizado.dispose();
    const archivo = test.info().outputPath(`latencia-${marcado ? "marcar" : "desmarcar"}-${limite}.json`);
    await writeFile(archivo, JSON.stringify({ sede: 1, ms: transcurrido, limite }));
    await test.info().attach("latencia-publicacion", {
      path: archivo,
      contentType: "application/json",
    });
  });
  const [, resultado] = await Promise.all([
    tarjeta.getByRole("button", { name: marcado ? "Marcar todo" : "Desmarcar todo", exact: true }).click(),
    respuesta,
    propagacion,
  ]);
  expect(resultado.ok()).toBe(true);
}

test.describe("RNF-13: avisos de cambios por sede", () => {
  test.describe.configure({ mode: "serial" });
  let envioId: number;
  test.beforeAll(async ({}, informacion) => {
    const numero = 710 + ["telefono", "tableta", "escritorio"].indexOf(informacion.project.name);
    ({ envioId } = JSON.parse(preparar("crear", String(numero), "pedido", "1")));
  });
  test.afterAll(async () => {
    if (envioId) preparar("limpiar", String(envioId));
  });

  test("RNF-13 / RF-SL-23: el marcado aparece en otro navegador en menos de 2 segundos y usa una conexión", async ({
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
      const otra = await segundo.newPage();
      let conexiones = 0;
      otra.on("request", (peticion) => {
        if (peticion.url().includes("/api/tiempo-real?")) conexiones++;
      });
      await abrirBodega(page);
      await abrirBodega(otra);
      await expect(page.locator(".vivo")).toHaveAttribute("data-conectado", "true");
      await expect(otra.locator(".vivo")).toHaveAttribute("data-conectado", "true");
      const tarjeta = page.locator(`article.ped[data-id="${envioId}"]`);
      const remota = otra.locator(`article.ped[data-id="${envioId}"]`);
      await expect(remota.locator("tr.lista")).toHaveCount(0);
      await cambiarMarca(page, tarjeta, remota, true, esperarPublicacion);
      expect(conexiones).toBe(1);
      await cambiarMarca(page, tarjeta, remota, false, esperarPublicacion);
    } finally {
      await segundo.close();
    }
  });

  test("RNF-13: al cortar SSE consulta cada 5 segundos, apaga En vivo y se reconecta sola", async ({
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
      const otra = await segundo.newPage();
      await abrirBodega(page);
      await abrirBodega(otra);
      await expect(otra.locator(".vivo")).toHaveAttribute("data-conectado", "true");
      await segundo.route("**/api/tiempo-real?**", (ruta) => ruta.abort("connectionreset"));
      await segundo.setOffline(true);
      await expect(otra.locator(".vivo")).toHaveAttribute("data-conectado", "false");
      await segundo.setOffline(false);
      const remota = otra.locator(`article.ped[data-id="${envioId}"]`);
      const tarjeta = page.locator(`article.ped[data-id="${envioId}"]`);
      await cambiarMarca(page, tarjeta, remota, true, esperarPublicacion, 10000);
      await expect(otra.locator(".vivo")).toHaveAttribute("data-conectado", "false");
      await segundo.unroute("**/api/tiempo-real?**");
      await expect(otra.locator(".vivo")).toHaveAttribute("data-conectado", "true", { timeout: 10000 });
      await cambiarMarca(page, tarjeta, remota, false, esperarPublicacion);
    } finally {
      await segundo.close();
    }
  });

  test("RNF-04 / RN-17: la ruta rechaza peticiones sin sesión, sin permiso y de otra sede", async ({
    playwright,
    context,
    baseURL,
  }) => {
    const anonimo = await playwright.request.newContext({ ignoreHTTPSErrors: true, baseURL });
    try {
      expect((await anonimo.get("/api/tiempo-real?sede=1&modulo=bodega")).status()).toBe(403);
      await entrar(context, baseURL);
      expect((await context.request.get("/api/tiempo-real?sede=2&modulo=bodega")).status()).toBe(403);
      expect((await context.request.get("/api/tiempo-real?sede=1&modulo=facturacion")).status()).toBe(403);
    } finally {
      await anonimo.dispose();
    }
  });
});
