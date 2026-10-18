import { expect, test } from "@playwright/test";
import { abrirMuestra } from "./preparar";

test.beforeEach(async ({ page }) => {
  await abrirMuestra(page, "/picking");
});

test("RF-SL-70: fecha con teclado, normalización, inexistente y valor ISO", async ({ page }) => {
  const fecha = page.getByRole("textbox", { name: "Fecha programada", exact: true });
  await expect(fecha).toHaveCSS("background-color", "rgb(241, 248, 242)");
  await fecha.fill("20102026");
  await expect(fecha).toHaveValue("20/10/2026");
  await expect(page.locator('input[name="fechaProgramada"]')).toHaveValue("2026-10-20");
  await fecha.fill("5/1/2027");
  await fecha.press("Tab");
  await expect(fecha).toHaveValue("05/01/2027");
  await fecha.fill("31/02/2026");
  await fecha.press("Tab");
  await expect(fecha).toHaveAttribute("aria-invalid", "true");
  expect(await fecha.evaluate((n: HTMLInputElement) => n.checkValidity())).toBe(false);
  await expect(fecha).toHaveCSS("border-color", "rgb(229, 132, 123)");
  await expect(page.locator('input[name="fechaProgramada"]')).toHaveValue("");
  await expect(page.getByText("Escriba la fecha como dd/mm/aaaa, por ejemplo 15/10/2026")).toBeVisible();
  await fecha.fill("29/02/2028");
  await fecha.press("Tab");
  await expect(fecha).toHaveAttribute("aria-invalid", "false");
  await fecha.fill("");
  await expect(page.locator('input[name="fechaProgramada"]')).toHaveValue("");
});

test("RF-SL-70: hora de 24 horas, normalización y rechazo de hora inválida", async ({ page }) => {
  const hora = page.getByRole("textbox", { name: "Hora programada", exact: true });
  await hora.fill("1330");
  await expect(hora).toHaveValue("13:30");
  await expect(page.locator('input[name="horaProgramada"]')).toHaveValue("13:30");
  await hora.fill("9:05");
  await hora.press("Tab");
  await expect(hora).toHaveValue("09:05");
  await hora.fill("25:90");
  await hora.press("Tab");
  await expect(hora).toHaveAttribute("aria-invalid", "true");
  expect(await hora.evaluate((n: HTMLInputElement) => n.checkValidity())).toBe(false);
  await expect(page.locator('input[name="horaProgramada"]')).toHaveValue("");
  await expect(page.getByText("Escriba la hora en formato de 24 horas, por ejemplo 13:30")).toBeVisible();
});

test("RF-SL-70: selectores nativos anclados al campo y elección sincronizada", async ({ page }) => {
  await page.evaluate(() => {
    HTMLInputElement.prototype.showPicker = function () {
      this.dataset.abierto = "true";
    };
  });
  for (const [tipo, boton, valor, visible] of [
    ["date", "Elegir la fecha", "2027-01-05", "05/01/2027"],
    ["time", "Elegir la hora", "09:05", "09:05"],
  ]) {
    await page.getByRole("button", { name: boton, exact: true }).click();
    const nativo = page.locator(`input[type="${tipo}"]`);
    await expect(nativo).toHaveAttribute("data-abierto", "true");
    const campo = nativo.locator("..").getByRole("textbox");
    const [a, b] = await Promise.all([nativo.boundingBox(), campo.boundingBox()]);
    expect(a?.x).toBe(b?.x);
    expect(a?.y).toBe(b?.y);
    expect(a?.width).toBe(b?.width);
    expect(a?.height).toBe(b?.height);
    await nativo.fill(valor);
    await expect(campo).toHaveValue(visible);
  }
});
