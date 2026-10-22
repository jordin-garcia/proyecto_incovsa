import { expect, type BrowserContext, type Page } from "@playwright/test";
import { Client } from "pg";
import { writeFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { test } from "../flujo/servidor-produccion";

const aviso =
  "Otro facturador modificó estos pedidos. La pantalla se actualizará; revisa los cambios e inténtalo de nuevo";
const tarjeta = (page: Page, id: number) => page.locator(`article[data-pedido-id="${id}"]`);
const opcion = (page: Page, nombre: string) => page.getByRole("region", { name: nombre, exact: true });
async function entrar(contexto: BrowserContext, baseURL: string, usuario: string) {
  await contexto.setExtraHTTPHeaders({ "x-real-ip": "127.0.0.1" });
  const respuesta = await contexto.request.post("/api/auth/picking/sign-in/username", {
    headers: { origin: baseURL },
    data: { usuario, clave: process.env.CLAVE_DEMO },
  });
  expect(respuesta.ok()).toBe(true);
}
async function abrir(page: Page) {
  await page.goto("/picking/facturacion");
  await expect(page.locator(".vivo")).toHaveAttribute("data-conectado", "true");
  await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
}
async function levantar(page: Page, id: number, tecla: string) {
  const fila = tarjeta(page, id);
  await fila.focus();
  await page.keyboard.press("Space", { delay: 50 });
  await expect(fila).toHaveAttribute("data-arrastrando", "true");
  await page.keyboard.press(tecla, { delay: 50 });
}
async function mover(page: Page, id: number, tecla: string) {
  await levantar(page, id, tecla);
  await page.keyboard.press("Space", { delay: 50 });
  await expect(tarjeta(page, id)).toHaveAttribute("data-arrastrando", "false");
}

test("RN-48 / RNF-13 / decisiones 39 y 41: dos facturadores, edición, arrastre y envío simultáneos", async ({
  browser,
  context,
  page,
  baseURL,
  esperarPublicacion,
}, info) => {
  test.setTimeout(240_000);
  const bd = new Client({ connectionString: process.env.DATABASE_URL });
  await bd.connect();
  await bd.query("SELECT pg_advisory_lock(hashtext($1))", ["e2e:facturacion-envio"]);
  const otro = await browser.newContext({ baseURL, viewport: info.project.use.viewport });
  const ids: number[] = [];
  try {
    const {
      rows: [usuario],
    } = await bd.query<{ id: string }>("SELECT id FROM usuario WHERE username = 'picking.ejemplo.03'");
    for (let i = 0; i < 3; i++) {
      const {
        rows: [pedido],
      } = await bd.query<{ id: number }>(
        "INSERT INTO pedido_facturado(sede_id, numero_odoo, referencia, cliente, sector, posicion, cargado_por) VALUES (1, $1, $2, $3, 'Zona 1', $4, $5) RETURNING id",
        [`JC05-${i}`, `XE-IN/SALIDA/JC05-${i}`, `Cliente de prueba JC05 ${i}`, 90000 + i, usuario!.id],
      );
      ids.push(pedido!.id);
      await bd.query(
        "INSERT INTO detalle_pedido_facturado(pedido_facturado_id, producto, lote, peso_conversion_kg, cantidad_kg, orden) VALUES ($1, 'Producto de prueba', '', 25, 25, 1)",
        [pedido!.id],
      );
    }
    await entrar(context, baseURL!, "ejemplo.03");
    await entrar(otro, baseURL!, "ejemplo.04");
    const segunda = await otro.newPage();
    await abrir(page);
    await abrir(segunda);
    await expect(tarjeta(segunda, ids[0]!)).toBeVisible();

    // El segundo mantiene levantado el pedido mientras el primero guarda el movimiento.
    await levantar(segunda, ids[0]!, "ArrowRight");
    await mover(page, ids[0]!, "ArrowRight");
    await expect(opcion(page, "Envío por camión").locator(`[data-pedido-id="${ids[0]}"]`)).toHaveCount(1);
    await expect(segunda.getByTestId("tablero-pedidos").locator(`[data-pedido-id="${ids[0]}"]`)).toHaveCount(1);
    await segunda.keyboard.press("Space", { delay: 50 });
    await expect(segunda.getByText(aviso, { exact: true })).toBeVisible();
    await expect(opcion(segunda, "Envío por camión").locator(`[data-pedido-id="${ids[0]}"]`)).toHaveCount(1);
    // Espera la animación de caída de dnd-kit antes de capturar el estado final.
    await segunda.waitForTimeout(350);
    await segunda.screenshot({
      path: `pruebas-e2e/picking/evidencias/jc-05/conflicto-${info.project.name}.png`,
      fullPage: true,
    });
    await info.attach("conflicto-de-movimiento", {
      body: await segunda.screenshot({ fullPage: true }),
      contentType: "image/png",
    });

    // Fecha/hora conservan incluso el borrador incompleto y aplican el aviso al salir.
    const hora = opcion(segunda, "Cliente recoge en bodega").getByLabel("Hora programada *", { exact: true });
    await hora.fill("1");
    await mover(page, ids[1]!, "ArrowRight");
    await expect(opcion(page, "Envío por camión").locator(`[data-pedido-id="${ids[1]}"]`)).toHaveCount(1);
    await expect(hora).toHaveValue("1");
    await expect(hora).toBeFocused();
    await expect(segunda.getByTestId("tablero-pedidos").locator(`[data-pedido-id="${ids[1]}"]`)).toHaveCount(1);
    await hora.blur();
    await expect(opcion(segunda, "Envío por camión").locator(`[data-pedido-id="${ids[1]}"]`)).toHaveCount(1);

    const fecha = opcion(segunda, "Cliente recoge en bodega").getByLabel("Fecha programada de despacho *", {
      exact: true,
    });
    await fecha.fill("21/");
    await mover(page, ids[0]!, "ArrowRight");
    await expect(opcion(page, "Cliente recoge en bodega").locator(`[data-pedido-id="${ids[0]}"]`)).toHaveCount(1);
    await expect(fecha).toHaveValue("21/");
    await expect(fecha).toBeFocused();
    await expect(opcion(segunda, "Envío por camión").locator(`[data-pedido-id="${ids[0]}"]`)).toHaveCount(1);
    await fecha.blur();
    await expect(opcion(segunda, "Cliente recoge en bodega").locator(`[data-pedido-id="${ids[0]}"]`)).toHaveCount(1);
    await mover(page, ids[0]!, "ArrowLeft");
    await expect(opcion(segunda, "Envío por camión").locator(`[data-pedido-id="${ids[0]}"]`)).toHaveCount(1);

    // Antes de cronometrar, el navegador que actúa también debe haber aplicado
    // su último movimiento; ver el cambio remoto no garantiza ese refresco local.
    await expect(opcion(page, "Envío por camión").locator(`[data-pedido-id="${ids[0]}"]`)).toHaveCount(1);

    // Mide desde avisarCambio hasta el DOM remoto, sin reiniciar el reloj tras el POST.
    const latencia = esperarPublicacion(1).then(async (inicio) => {
      await segunda.waitForFunction(
        (id) => !!document.querySelector(`[data-testid="zona-camion"] article[data-pedido-id="${id}"]`),
        ids[2]!,
        { polling: "raf", timeout: Math.max(1, 1999 - (Date.now() - inicio)) },
      );
      const ms = Date.now() - inicio;
      expect(ms).toBeLessThan(2000);
      await writeFile(
        `pruebas-e2e/picking/evidencias/jc-05/latencia-${info.project.name}.json`,
        JSON.stringify({ ms, sede: 1 }, null, 2) + "\n",
      );
      await info.attach("latencia-facturacion", {
        body: Buffer.from(JSON.stringify({ ms, sede: 1 })),
        contentType: "application/json",
      });
    });
    await Promise.all([mover(page, ids[2]!, "ArrowRight"), latencia]);

    // Pasa los tres pedidos a recoge, sin afectar otros datos de demostración.
    for (const id of ids) {
      await mover(page, id, "ArrowRight");
      await expect(opcion(page, "Cliente recoge en bodega").locator(`[data-pedido-id="${id}"]`)).toHaveCount(1);
    }
    const recoge = opcion(page, "Cliente recoge en bodega");
    await recoge.getByLabel("Fecha programada de despacho *", { exact: true }).fill("21102026");
    await recoge.getByLabel("Hora programada *", { exact: true }).fill("1330");
    await recoge.getByLabel("Hora programada *", { exact: true }).blur();
    await expect(recoge.getByRole("button", { name: "Enviar a Bodega", exact: true })).toBeEnabled();
    await expect(
      opcion(segunda, "Cliente recoge en bodega").getByLabel("Hora programada *", { exact: true }),
    ).toHaveValue("13:30");
    await expect(segunda.getByText(aviso, { exact: true })).toHaveCount(0, { timeout: 10000 });
    await levantar(segunda, ids[2]!, "ArrowUp");
    await recoge.getByRole("button", { name: "Enviar a Bodega", exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Enviar a Bodega", exact: true }).click();
    await expect(page.getByRole("dialog")).toContainText("ya aparece en Bodega");
    await segunda.keyboard.press("Space", { delay: 50 });
    await expect(segunda.getByText(aviso, { exact: true })).toBeVisible();
    await expect(opcion(segunda, "Cliente recoge en bodega").locator("article")).toHaveCount(0);
    const enviados = await bd.query<{ cantidad: number }>(
      "SELECT count(DISTINCT envio_id)::int AS cantidad FROM pedido_facturado WHERE id = ANY($1::int[])",
      [ids],
    );
    expect(enviados.rows[0]!.cantidad).toBe(1);
    expect(
      (await new AxeBuilder({ page: segunda }).analyze()).violations.filter((v) =>
        ["serious", "critical"].includes(v.impact ?? ""),
      ),
    ).toEqual([]);
    await segunda.screenshot({
      path: `pruebas-e2e/picking/evidencias/jc-05/final-${info.project.name}.png`,
      fullPage: true,
    });
    await info.attach("facturacion-final", {
      body: await segunda.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
  } finally {
    await otro.close();
    const { rows } = await bd.query<{ envio_id: number }>(
      "SELECT DISTINCT envio_id FROM pedido_facturado WHERE id = ANY($1::int[]) AND envio_id IS NOT NULL",
      [ids],
    );
    for (const { envio_id } of rows) {
      await bd.query("DELETE FROM historial_estado WHERE envio_id = $1", [envio_id]);
      await bd.query("DELETE FROM entrega_ruta WHERE envio_id = $1", [envio_id]);
      await bd.query("DELETE FROM linea_preparacion WHERE envio_id = $1", [envio_id]);
    }
    await bd.query("DELETE FROM pedido_facturado WHERE id = ANY($1::int[])", [ids]);
    for (const { envio_id } of rows) await bd.query("DELETE FROM envio WHERE id = $1", [envio_id]);
    await bd.end();
  }
});
