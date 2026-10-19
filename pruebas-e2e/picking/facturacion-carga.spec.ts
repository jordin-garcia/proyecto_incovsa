import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";

test("RF-SL-50 / RF-SL-67 / RF-SL-69: carga, muestra y selecciona pedidos facturados", async ({
  page,
  context,
}, info) => {
  test.skip(
    info.project.name !== "escritorio",
    "Una ejecución controla los datos compartidos y recorre los tres tamaños.",
  );
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
  await expect(page.getByRole("heading", { name: "Pedidos facturados", exact: true })).toBeVisible();

  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : width === 768 ? 1024 : 900 });
    await capturar(`facturacion-vacio-${width}`);
  }

  await page.getByLabel("Cargar archivo .xlsx").setInputFiles("pruebas/fixtures/odoo/odoo-ejemplo-anonimizado.xlsx");
  await expect(page.getByRole("dialog")).toContainText("33 pedido(s) facturado(s)");
  await expect(page.getByRole("dialog")).toContainText("46 pedido(s) facturado(s) no se cargaron");
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : width === 768 ? 1024 : 900 });
    await capturar(`facturacion-resumen-${width}`);
  }
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
  await expect(tarjetas.first()).toContainText("03543");
  await expect(tarjetas.first()).toContainText("Cliente de ejemplo 003");
  await expect(tarjetas.first()).toContainText("San Fransisco el Alto, Totonicapan");
  await expect(tarjetas.first()).toContainText("495 kg");
  await expect(tarjetas.first()).toContainText("SODA ASH (CHI-SAC/0040KG)");
  await expect(tarjetas.first().getByText("120 kg", { exact: true })).toBeVisible();
  await expect(page.getByText("Seleccionar todos")).toBeVisible();

  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : width === 768 ? 1024 : 900 });
    expect(
      (await new AxeBuilder({ page }).analyze()).violations.filter((v) =>
        ["serious", "critical"].includes(v.impact ?? ""),
      ),
    ).toEqual([]);
    await capturar(`facturacion-${width}`);
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
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : width === 768 ? 1024 : 900 });
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
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : width === 768 ? 1024 : 900 });
    await capturar(`facturacion-confirmacion-eliminar-${width}`);
  }
  await page.getByRole("dialog").getByRole("button", { name: "Eliminar", exact: true }).click();
  await expect(tarjetas).toHaveCount(0);
});
