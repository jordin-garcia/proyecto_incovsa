import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { abrirMuestra } from "./preparar";

test.beforeEach(async ({ page }) => {
  await abrirMuestra(page, "/picking");
});

test("RNF-08: pestañas, botones segmentados y lista desplegable con teclado", async ({ page }) => {
  await page.getByRole("tab", { name: "Despacho", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Rutas realizadas" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("heading", { name: "No hay rutas en este periodo" })).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("heading", { name: "No hay registros en este periodo" })).toBeVisible();
  await page.getByRole("radio", { name: "Día", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: "Semana", exact: true })).toBeFocused();
  await page.keyboard.press("Space");
  await expect(page.getByRole("radio", { name: "Semana", exact: true })).toHaveAttribute("aria-checked", "true");
  const envio = page.getByRole("combobox", { name: "Opción de envío", exact: true });
  await envio.focus();
  await page.keyboard.press("Space");
  await page.getByRole("option", { name: "Cliente recoge en bodega" }).click();
  await expect(envio).toContainText("Cliente recoge en bodega");
});

test("RNF-08: la ventana de confirmación no tiene violaciones serias ni críticas", async ({ page }) => {
  await page.getByRole("button", { name: "Eliminar", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Eliminar pedidos facturados" })).toBeVisible();
  const resultado = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(resultado.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
});

test("RNF-08: Escape, volver, confirmar y retorno del foco", async ({ page }) => {
  const eliminar = page.getByRole("button", { name: "Eliminar", exact: true });
  await eliminar.click();
  const ventana = page.getByRole("dialog", { name: "Eliminar pedidos facturados" });
  await expect(ventana).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(ventana).toHaveCount(0);
  await expect(eliminar).toBeFocused();
  await eliminar.click();
  await ventana.getByRole("button", { name: "Volver" }).click();
  await expect(ventana).toHaveCount(0);
  await eliminar.click();
  await ventana.getByRole("button", { name: "Eliminar", exact: true }).click();
  await expect(page.getByText("Pedidos facturados eliminados.", { exact: true })).toBeVisible();
  await expect(ventana).toHaveCount(0);
});

for (const [boton, texto] of [
  ["Guardar", "Usuario guardado."],
  ["Enviar a Bodega", "Faltan pedidos facturados, fecha u hora"],
  ["Volver", "No se pudo completar la operación. Inténtelo de nuevo."],
]) {
  test(`RNF-08: mensaje de ${boton} desaparece a los cuatro segundos`, async ({ page }) => {
    await page.getByRole("button", { name: boton, exact: true }).click();
    const mensaje = page.getByText(texto, { exact: true });
    await expect(mensaje).toBeVisible();
    await expect(mensaje).toHaveCount(0, { timeout: 6000 });
  });
}
