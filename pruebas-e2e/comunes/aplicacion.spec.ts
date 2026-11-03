import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { irA } from "../comunes/navegacion";

// Prueba básica de la aplicación (JG-02). Sigue siendo válida cuando DM-02 reemplaza la página de inicio.
test("RNF-07: la aplicación responde en / con el título de INCOVSA y en español", async ({ page }) => {
  const respuesta = await irA(page, "/");
  expect(respuesta?.ok()).toBe(true);
  await expect(page).toHaveTitle(/INCOVSA/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});

test("RNF-08: la página de inicio no tiene violaciones serias ni críticas de accesibilidad", async ({ page }) => {
  await irA(page, "/");
  const resultado = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const graves = resultado.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(graves).toEqual([]);
});
