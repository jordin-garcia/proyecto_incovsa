import { expect, test, type BrowserContext } from "@playwright/test";
import { execFileSync } from "node:child_process";

function preparar(...argumentos: string[]) {
  return execFileSync(
    process.execPath,
    ["node_modules/tsx/dist/cli.mjs", "pruebas-e2e/picking/preparar-envio.ts", ...argumentos],
    { encoding: "utf8" },
  ).trim();
}

async function entrar(contexto: BrowserContext) {
  expect(process.env.CLAVE_DEMO, "Se requiere CLAVE_DEMO").toBeTruthy();
  const respuesta = await contexto.request.post("/api/auth/picking/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario: "ejemplo.05", clave: process.env.CLAVE_DEMO },
  });
  expect(respuesta.ok()).toBe(true);
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
  }) => {
    const segundo = await browser.newContext({ baseURL });
    try {
      await entrar(context);
      await entrar(segundo);
      const otra = await segundo.newPage();
      let conexiones = 0;
      otra.on("request", (peticion) => {
        if (peticion.url().includes("/api/tiempo-real?")) conexiones++;
      });
      await page.goto("/picking/bodega");
      await otra.goto("/picking/bodega");
      await expect(page.locator(".vivo")).toHaveAttribute("data-conectado", "true");
      await expect(otra.locator(".vivo")).toHaveAttribute("data-conectado", "true");
      const tarjeta = page.locator(`article.ped[data-id="${envioId}"]`);
      const remota = otra.locator(`article.ped[data-id="${envioId}"]`);
      await expect(remota.locator("tr.lista")).toHaveCount(0);
      // El límite se mide desde la respuesta de la mutación, cuando la transacción ya confirmó y publicó el aviso.
      const respuesta = page.waitForResponse(
        (r) => r.request().method() === "POST" && !!r.request().headers()["next-action"],
      );
      await tarjeta.getByRole("button", { name: "Marcar todo", exact: true }).click();
      await respuesta;
      await expect(remota.locator("tr.lista")).toHaveCount(3, { timeout: 1999 });
      expect(conexiones).toBe(1);
      await tarjeta.getByRole("button", { name: "Desmarcar todo", exact: true }).click();
      await expect(remota.locator("tr.lista")).toHaveCount(0, { timeout: 1999 });
    } finally {
      await segundo.close();
    }
  });

  test("RNF-13: al cortar SSE consulta cada 5 segundos, apaga En vivo y se reconecta sola", async ({
    browser,
    context,
    page,
    baseURL,
  }) => {
    const segundo = await browser.newContext({ baseURL });
    try {
      await entrar(context);
      await entrar(segundo);
      const otra = await segundo.newPage();
      await page.goto("/picking/bodega");
      await otra.goto("/picking/bodega");
      await expect(otra.locator(".vivo")).toHaveAttribute("data-conectado", "true");
      await segundo.route("**/api/tiempo-real?**", (ruta) => ruta.abort("connectionreset"));
      await segundo.setOffline(true);
      await expect(otra.locator(".vivo")).toHaveAttribute("data-conectado", "false");
      await segundo.setOffline(false);
      const remota = otra.locator(`article.ped[data-id="${envioId}"]`);
      const tarjeta = page.locator(`article.ped[data-id="${envioId}"]`);
      await tarjeta.getByRole("button", { name: "Marcar todo", exact: true }).click();
      await expect(remota.locator("tr.lista")).toHaveCount(3, { timeout: 10000 });
      await expect(otra.locator(".vivo")).toHaveAttribute("data-conectado", "false");
      await segundo.unroute("**/api/tiempo-real?**");
      await expect(otra.locator(".vivo")).toHaveAttribute("data-conectado", "true", { timeout: 10000 });
      await tarjeta.getByRole("button", { name: "Desmarcar todo", exact: true }).click();
      await expect(remota.locator("tr.lista")).toHaveCount(0, { timeout: 1999 });
    } finally {
      await segundo.close();
    }
  });

  test("RNF-04 / RN-17: la ruta rechaza peticiones sin sesión, sin permiso y de otra sede", async ({
    playwright,
    context,
  }) => {
    const anonimo = await playwright.request.newContext();
    try {
      expect((await anonimo.get("http://localhost:3000/api/tiempo-real?sede=1&modulo=bodega")).status()).toBe(403);
      await entrar(context);
      expect((await context.request.get("/api/tiempo-real?sede=2&modulo=bodega")).status()).toBe(403);
      expect((await context.request.get("/api/tiempo-real?sede=1&modulo=facturacion")).status()).toBe(403);
    } finally {
      await anonimo.dispose();
    }
  });
});
