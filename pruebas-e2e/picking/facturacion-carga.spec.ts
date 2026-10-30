import { capturaEvidencia } from "../comunes/evidencia";
import { comprobarEncabezadoModulo } from "../comunes/encabezado";
import { expect, test as base } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";
import { Client } from "pg";

const test = base.extend<{ datosDeCarga: void }>({
  datosDeCarga: [
    async ({}, usar) => {
      expect(process.env.DATABASE_URL, "Se requiere una base local de demostración").toBeTruthy();
      const bloqueo = new Client({ connectionString: process.env.DATABASE_URL });
      await bloqueo.connect();
      try {
        // Comparte exclusión con facturacion-envio; la espera no consume los 30 s del flujo.
        await bloqueo.query("SELECT pg_advisory_lock(hashtext($1))", ["e2e:facturacion-envio"]);
        const anterior = await bloqueo.query<{ ultimo: number }>(
          "SELECT COALESCE(MAX(id), 0) AS ultimo FROM pedido_facturado",
        );
        try {
          await usar();
        } finally {
          // Solo pedidos nuevos de este importador de demostración; los detalles tienen CASCADE.
          await bloqueo.query(
            `DELETE FROM pedido_facturado WHERE id > $1 AND envio_id IS NULL
             AND cargado_por = (SELECT id FROM usuario WHERE username = $2)`,
            [anterior.rows[0].ultimo, "picking.ejemplo.03"],
          );
        }
      } finally {
        // Cerrar la conexión libera también el bloqueo si falla la preparación o la limpieza.
        await bloqueo.end();
      }
    },
    { auto: true, timeout: 180_000 },
  ],
});

test("RF-SL-50 / RF-SL-67 / RF-SL-69: carga, muestra y selecciona pedidos facturados", async ({
  page,
  context,
}, info) => {
  const width = page.viewportSize()!.width;
  expect(process.env.CLAVE_DEMO, "Se requiere la semilla de demostración").toBeTruthy();
  async function capturar(nombre: string) {
    const imagen = await page.screenshot();
    await info.attach(nombre, { body: imagen, contentType: "image/png" });
    await writeFile(info.outputPath(`${nombre}.png`), imagen);
  }
  const respuesta = await context.request.post("/api/auth/picking/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario: "ejemplo.03", clave: process.env.CLAVE_DEMO },
  });
  expect(respuesta.ok()).toBe(true);
  await page.goto("/picking/facturacion");
  await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
  // RF-SL-61 / H-81
  await comprobarEncabezadoModulo(page);
  await expect(page.getByRole("heading", { name: "Pedidos facturados", exact: true })).toBeVisible();

  await expect(page.getByTestId("tablero-pedidos").locator("article")).toHaveCount(0);
  await capturar(`facturacion-vacio-${width}`);

  let liberarCarga = () => {};
  const cargaPendiente = new Promise<void>((resolver) => {
    liberarCarga = resolver;
  });
  await page.route("**/picking/facturacion", async (ruta) => {
    if (ruta.request().method() === "POST" && ruta.request().headers()["next-action"]) await cargaPendiente;
    await ruta.continue();
  });
  try {
    await page.getByLabel("Cargar archivo .xlsx").setInputFiles("pruebas/fixtures/odoo/odoo-ejemplo-anonimizado.xlsx");
    const cargar = page.getByRole("button", { name: "Cargar archivo .xlsx", exact: true });
    await expect(cargar).toBeDisabled();
    await expect(cargar).toHaveText("Cargar archivo .xlsx");
  } finally {
    liberarCarga();
  }
  await expect(page.getByRole("dialog")).toContainText(
    "33 pedido(s) facturado(s) de Quetzaltenango se agregaron al tablero",
  );
  await expect(page.getByRole("dialog")).toContainText(
    "46 pedido(s) facturado(s) no se cargaron porque tienen líneas con el Peso de Conversión en 0 o vacío (RN-50): 03539, 03540, 03541, 03545, 03547, 03549, 03550, 03551, 03552, 03542, 03557, 03554, 03555, 03565, 03567, 03568, 03570, 03594, 03595, 03597, 03572, 03576, 03577, 03578, 03581, 03582, 03583, 03585, 03610, 03590, 03592, 03611, 03600, 03601, 03603, 03608, 03609, 03627, 03612, 03613, 03614, 03615, 03616, 03623, 03624, 03625.",
  );
  await expect(page.getByRole("dialog")).toContainText("Se ignoraron 1 referencia(s) que no están en estado «Hecho».");
  await expect(page.getByRole("dialog")).toContainText(
    "Los datos de esos pedidos facturados deben corregirse en Odoo y volver a exportarse (P-91).",
  );
  await capturar(`facturacion-resumen-${width}`);
  await page.getByRole("button", { name: "Listo" }).click();

  const segundaSesion = await context.request.post("/api/auth/picking/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario: "ejemplo.04", clave: process.env.CLAVE_DEMO },
  });
  expect(segundaSesion.ok()).toBe(true);
  await page.goto("/picking/facturacion");
  await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");

  const tablero = page.locator("[data-testid='tablero-pedidos']");
  const tarjetas = tablero.getByRole("button");
  await expect(tarjetas).toHaveCount(33);
  // RF-SL-07 / H-80: rejilla de D-06 y tarjeta sin controles extra.
  const rejilla = tarjetas.first().locator("..");
  await expect(rejilla).toHaveCSS("display", "grid");
  const medidas = await rejilla.evaluate((el) => {
    const estilo = getComputedStyle(el);
    return {
      ancho: el.clientWidth - parseFloat(estilo.paddingLeft) - parseFloat(estilo.paddingRight),
      columnas: estilo.gridTemplateColumns.split(" ").map(Number.parseFloat),
      gap: parseFloat(estilo.columnGap),
    };
  });
  expect(medidas.gap).toBe(10);
  expect(medidas.columnas.length).toBe(Math.max(1, Math.floor((medidas.ancho + 10) / 220)));
  expect(medidas.columnas.every((ancho) => ancho >= 210)).toBe(true);
  await expect(tarjetas.first().getByRole("button")).toHaveCount(0);
  await expect(tarjetas.first().getByText("×", { exact: true })).toHaveCount(0);
  await expect(tarjetas.first().locator("svg")).toHaveCount(1); // Solo la marca de selección; sin asa ni x.

  await expect(tarjetas.first()).toContainText("03543");
  await expect(tarjetas.first()).toHaveAttribute(
    "title",
    "Clic para seleccionar; arrastre para llevarlo a una opción de envío",
  );
  await expect(page.getByRole("button", { name: "Cargar archivo .xlsx", exact: true })).toBeVisible();
  await expect(tarjetas.first()).toContainText("Cliente de ejemplo 003");
  await expect(tarjetas.first()).toContainText("San Fransisco el Alto, Totonicapan");
  await expect(tarjetas.first()).toContainText("495 kg");
  await expect(tarjetas.first()).toContainText("SODA ASH (CHI-SAC/0040KG)");
  await expect(tarjetas.first().getByText("120 kg", { exact: true })).toBeVisible();
  await expect(page.getByText("Seleccionar todos")).toBeVisible();

  {
    expect(
      (await new AxeBuilder({ page }).analyze()).violations.filter((v) =>
        ["serious", "critical"].includes(v.impact ?? ""),
      ),
    ).toEqual([]);
    await capturar(`facturacion-${width}`);
    await capturaEvidencia(
      page,
      `pruebas-e2e/picking/evidencias/jc-09/aplicacion-facturacion-${info.project.name}.png`,
    );
  }

  const lista = page.locator("[data-testid='tablero-pedidos']");
  await lista.evaluate((element) => {
    element.scrollTop = 360;
  });
  const scrollAntes = await lista.evaluate((element) => element.scrollTop);
  expect(scrollAntes).toBeGreaterThan(0);
  const indiceVisible = await lista.evaluate((element) => {
    const marco = element.getBoundingClientRect();
    return [...element.querySelectorAll<HTMLElement>("[role='button']")].findIndex((tarjeta) => {
      const posicion = tarjeta.getBoundingClientRect();
      return posicion.top >= marco.top && posicion.bottom <= marco.bottom;
    });
  });
  expect(indiceVisible).toBeGreaterThanOrEqual(0);
  const tarjetaVisible = tarjetas.nth(indiceVisible);
  await tarjetaVisible.click();
  await expect(tarjetaVisible).toHaveAttribute("aria-pressed", "true");
  expect(await lista.evaluate((element) => element.scrollTop)).toBe(scrollAntes);
  await page.getByRole("button", { name: "Eliminar", exact: true }).click();
  const confirmacionIndividual = page.getByRole("dialog");
  await expect(confirmacionIndividual).toContainText(/pedido facturado \d{5} de Cliente de ejemplo \d{3} \(.* kg\)/);
  await confirmacionIndividual.getByRole("button", { name: "Volver" }).click();
  await page.getByLabel("Seleccionar todos").check();
  await expect(page.getByRole("button", { name: "Eliminar" })).toBeVisible();
  await expect(tarjetas).toHaveCount(33);
  await expect(tarjetas.first()).toHaveAttribute("aria-pressed", "true");
  await expect(tarjetas.first().getByText("Cliente de ejemplo 003", { exact: true })).toBeHidden();
  expect(
    (await new AxeBuilder({ page }).analyze()).violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  expect(await lista.evaluate((element) => element.scrollTop)).toBe(scrollAntes);
  {
    expect(
      (await new AxeBuilder({ page }).analyze()).violations.filter((v) =>
        ["serious", "critical"].includes(v.impact ?? ""),
      ),
    ).toEqual([]);
    await capturar(`facturacion-seleccionado-${width}`);
  }
  await page.getByRole("button", { name: "Eliminar", exact: true }).click();
  const confirmacionMultiple = page.getByRole("dialog");
  await expect(confirmacionMultiple).toContainText("33 pedidos facturados seleccionados (10,920 kg)");
  await capturar(`facturacion-confirmacion-eliminar-${width}`);
  await page.getByRole("dialog").getByRole("button", { name: "Eliminar", exact: true }).click();
  await expect(tarjetas).toHaveCount(0);
});
