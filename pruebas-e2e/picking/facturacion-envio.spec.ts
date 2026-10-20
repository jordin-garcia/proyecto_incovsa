import { expect, test } from "@playwright/test";
import { Client } from "pg";
import AxeBuilder from "@axe-core/playwright";

let primerPedidoCreado: number | null = null;
let bloqueo: Client | null = null;
test.beforeEach(async () => {
  const inicio = Date.now();
  test.setTimeout(180_000);
  expect(process.env.DATABASE_URL, "Se requiere una base local de demostración").toBeTruthy();
  bloqueo = new Client({ connectionString: process.env.DATABASE_URL });
  await bloqueo.connect();
  // Los tres proyectos comparten tablero; cada uno verifica el flujo completo en su turno.
  await bloqueo.query("SELECT pg_advisory_lock(hashtext($1))", ["e2e:facturacion-envio"]);
  test.setTimeout(Date.now() - inicio + 60_000);
});
test.afterEach(async () => {
  if (!bloqueo) return;
  try {
    if (primerPedidoCreado !== null) {
      const resultado = await bloqueo.query<{ envio_id: number | null }>(
        "SELECT envio_id FROM pedido_facturado WHERE id = $1",
        [primerPedidoCreado],
      );
      const envioId = resultado.rows[0]?.envio_id;
      if (envioId) {
        await bloqueo.query("BEGIN");
        try {
          await bloqueo.query("DELETE FROM historial_estado WHERE envio_id = $1", [envioId]);
          await bloqueo.query("DELETE FROM entrega_ruta WHERE envio_id = $1", [envioId]);
          await bloqueo.query("DELETE FROM linea_preparacion WHERE envio_id = $1", [envioId]);
          await bloqueo.query("DELETE FROM pedido_facturado WHERE envio_id = $1", [envioId]);
          await bloqueo.query("DELETE FROM envio WHERE id = $1", [envioId]);
          await bloqueo.query("COMMIT");
        } catch (error) {
          await bloqueo.query("ROLLBACK");
          throw error;
        }
      }
    }
  } finally {
    primerPedidoCreado = null;
    await bloqueo.end();
    bloqueo = null;
  }
});

// Se recorre el flujo en cada viewport del proyecto, también con emulación táctil.
test("RF-SL-63 / RF-SL-70 / RN-13 / RNF-08: arrastre, persistencia y envío a Bodega", async ({
  page,
  context,
}, info) => {
  const respuesta = await context.request.post("/api/auth/picking/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario: "ejemplo.03", clave: process.env.CLAVE_DEMO },
  });
  expect(respuesta.ok()).toBe(true);
  await page.goto("/picking/facturacion");
  const tablero = page.getByTestId("tablero-pedidos");
  const camion = page.getByRole("region", { name: "Envío por camión", exact: true });
  const recoge = page.getByRole("region", { name: "Cliente recoge en bodega", exact: true });
  for (const opcion of [camion, recoge]) {
    if (await opcion.locator("article").count()) {
      await opcion.getByRole("button", { name: "Cancelar", exact: true }).click();
      await page.getByRole("dialog").getByRole("button", { name: "Regresar al tablero", exact: true }).click();
      await expect(opcion.locator("article")).toHaveCount(0);
      await page.reload();
    }
  }
  await page.reload();
  if (await tablero.locator("article").count()) {
    await page.getByLabel("Seleccionar todos").check();
    await page.getByRole("button", { name: "Eliminar", exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Eliminar", exact: true }).click();
    await expect(tablero.locator("article")).toHaveCount(0);
  }
  await page.getByLabel("Cargar archivo .xlsx").setInputFiles("pruebas/fixtures/odoo/odoo-ejemplo-anonimizado.xlsx");
  await page.getByRole("dialog").getByRole("button", { name: "Listo", exact: true }).click();
  await camion.getByLabel("Fecha programada de envío *", { exact: true }).fill("");
  await camion.getByLabel("Hora programada *", { exact: true }).fill("");
  await camion.getByLabel("Camión *", { exact: true }).selectOption("");
  await camion.getByLabel("Piloto *", { exact: true }).selectOption("");
  const tarjetas = tablero.locator("article");
  primerPedidoCreado = Number(await tarjetas.first().getAttribute("data-pedido-id"));
  if (info.project.name === "escritorio") {
    await tarjetas.first().click();
    await tarjetas.nth(1).click();
  } else {
    await tarjetas.first().tap();
    await tarjetas.nth(1).tap();
  }
  const arrastrar = async (origen: ReturnType<typeof page.locator>, destino: ReturnType<typeof page.locator>) => {
    await origen.scrollIntoViewIfNeeded();
    const desde = await origen.boundingBox();
    await destino.scrollIntoViewIfNeeded();
    // Los destinos están en la misma página; el sensor mantiene el arrastre al desplazar.
    if (info.project.name === "escritorio") {
      await origen.scrollIntoViewIfNeeded();
      const inicio = await origen.boundingBox();
      await page.mouse.move(inicio!.x + 20, inicio!.y + 20);
      await page.mouse.down();
      await page.mouse.move(inicio!.x + 30, inicio!.y + 25, { steps: 4 });
      await destino.scrollIntoViewIfNeeded();
      const fin = await destino.boundingBox();
      await page.mouse.move(fin!.x + fin!.width / 2, fin!.y + fin!.height / 2, { steps: 20 });
      await page.mouse.up();
    } else {
      // El teclado atraviesa contenedores sin depender del desplazamiento del teléfono.
      await origen.focus();
      await page.keyboard.press("Space", { delay: 50 });
      await expect(origen).toHaveAttribute("data-arrastrando", "true");
      await page.keyboard.press("ArrowRight", { delay: 50 });
      await expect(page.getByRole("status").filter({ hasText: "Destino: Envío por camión." })).toBeAttached();
      await page.keyboard.press("Space", { delay: 50 });
    }
    expect(desde).toBeTruthy();
  };
  if (info.project.name === "escritorio") {
    const caja = await tarjetas.first().boundingBox();
    const encabezado = await page.getByRole("heading", { name: "Envío por camión", exact: true }).boundingBox();
    await page.mouse.move(caja!.x + 15, caja!.y + 15);
    await page.mouse.down();
    await page.mouse.move(encabezado!.x + 20, encabezado!.y + 10, { steps: 15 });
    await page.mouse.up();
    await expect(tarjetas).toHaveCount(33);
    await expect(camion.locator("article")).toHaveCount(0);
    await page.reload();
    await expect(tarjetas).toHaveCount(33);
    await tarjetas.first().click();
    await tarjetas.nth(1).click();
  }
  await arrastrar(tarjetas.first(), camion.getByTestId("zona-camion"));
  await expect(camion.locator("article")).toHaveCount(2);
  await expect(camion.getByRole("button", { name: "Enviar a Bodega", exact: true })).toBeDisabled();
  const filas = camion.locator("article");
  async function teclado(fila: ReturnType<typeof page.locator>, tecla: string, destino: string) {
    await fila.focus();
    await page.keyboard.press("Space", { delay: 50 });
    await expect(fila).toHaveAttribute("data-arrastrando", "true");
    await page.keyboard.press(tecla, { delay: 50 });
    if (tecla === "ArrowDown") await expect(camion.locator("article").last()).toHaveAttribute("data-sobre", "true");
    await expect(page.getByRole("status").filter({ hasText: `Destino: ${destino}.` })).toBeAttached();
    await page.keyboard.press("Space", { delay: 50 });
    await expect(page.locator('[data-arrastrando="true"]')).toHaveCount(0);
  }
  await teclado(filas.first(), "ArrowDown", "Envío por camión");
  await expect(filas.first()).toContainText("03546");
  await page.reload();
  await expect(filas.first()).toContainText("03546");
  if (info.project.name !== "escritorio") {
    await filas.last().scrollIntoViewIfNeeded();
    const desde = await filas.last().boundingBox(),
      hasta = await filas.first().boundingBox();
    const tactil = await context.newCDPSession(page);
    await tactil.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: desde!.x + 30, y: desde!.y + desde!.height / 2 }],
    });
    // La espera corresponde al umbral de 380 ms de pulsación larga (prototipo) del sensor.
    await page.waitForTimeout(420);
    await tactil.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: hasta!.x + 30, y: hasta!.y + hasta!.height / 2 }],
    });
    await expect(page.getByRole("status").filter({ hasText: "Destino: Envío por camión." })).toBeAttached();
    await tactil.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await tactil.detach();
    await expect(filas.first()).toContainText("03543");
  }
  await teclado(filas.first(), "ArrowRight", "Cliente recoge en bodega");
  await expect(recoge.locator("article")).toHaveCount(1);
  await teclado(recoge.locator("article"), "ArrowLeft", "Envío por camión");
  await expect(filas).toHaveCount(2);
  await teclado(filas.first(), "ArrowLeft", "Tablero de pedidos facturados");
  await expect(filas).toHaveCount(1);
  await page.reload();
  await expect(tablero.locator("article")).toHaveCount(32);
  await arrastrar(tablero.locator("article").last(), camion.getByTestId("zona-camion"));
  await expect(filas).toHaveCount(2);

  await camion.getByLabel("Camión *", { exact: true }).selectOption({ label: "Camión 1 · 3,400 kg" });
  await camion.getByLabel("Piloto *", { exact: true }).selectOption({ label: "Usuario de ejemplo 06" });
  await camion.getByLabel("Fecha programada de envío *", { exact: true }).fill("20102026");
  await camion.getByLabel("Hora programada *", { exact: true }).fill("1330");
  await expect(camion.getByRole("button", { name: "Enviar a Bodega", exact: true })).toBeEnabled();
  await page.reload();
  await expect(camion.locator("article")).toHaveCount(2);
  await expect(camion.getByLabel("Fecha programada de envío *", { exact: true })).toHaveValue("20/10/2026");
  await expect(camion.getByLabel("Hora programada *", { exact: true })).toHaveValue("13:30");
  // Carga suficiente para verificar que el sobrepeso informa y permite enviar.
  await page.getByLabel("Seleccionar todos").check();
  await arrastrar(tablero.locator("article").first(), camion.getByTestId("zona-camion"));
  await expect(camion.getByText("Sobrepeso.", { exact: true })).toBeVisible();
  expect(
    (await new AxeBuilder({ page }).analyze()).violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  await info.attach(`opciones-${info.project.name}`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
  await camion.getByRole("button", { name: "Enviar a Bodega", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(/Ruta \d+/);
  await expect(page.getByRole("dialog")).toContainText("Se puede enviar igual.");
  await info.attach(`confirmacion-${info.project.name}`, { body: await page.screenshot(), contentType: "image/png" });
  await page.getByRole("dialog").getByRole("button", { name: "Enviar a Bodega", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("ya aparece en Bodega");
  await page.getByRole("button", { name: "Seguir en Facturación", exact: true }).click();
  await expect(camion.locator("article")).toHaveCount(0);
  await expect(recoge.getByRole("button", { name: "Enviar a Bodega", exact: true })).toBeDisabled();
});
