import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

try {
  process.loadEnvFile();
} catch {
  // Sin .env la prueba lo dice al entrar.
}

test("RF-SL-04: Gerencia crea, edita y elimina un camión de Quetzaltenango", async ({ page, context }) => {
  expect(process.env.CLAVE_DEMO, "Se requiere la semilla de demostración").toBeTruthy();
  const identificacion = `Camión e2e ${Date.now()}`;
  const ingreso = await context.request.post("/api/auth/picking/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario: "ejemplo.01", clave: process.env.CLAVE_DEMO },
  });
  expect(ingreso.ok(), await ingreso.text()).toBe(true);

  await page.goto("/picking/configuracion");
  await expect(page.getByRole("heading", { name: "Camiones y usuarios" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Camión 1" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "3,400 kg" }).first()).toBeVisible();

  await page.getByRole("button", { name: "Nuevo camión" }).click();
  const dialogo = page.getByRole("dialog");
  await dialogo.getByLabel("Identificación").fill(identificacion);
  await dialogo.getByLabel("Capacidad máxima (kg)").fill("1500");
  await dialogo.getByLabel("Sede").selectOption({ label: "Quetzaltenango" });
  await dialogo.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByText("Cambios guardados.", { exact: true })).toBeVisible();
  const fila = page.getByRole("row", { name: new RegExp(identificacion) });
  await expect(fila.getByRole("cell", { name: "1,500 kg" })).toBeVisible();

  await fila.getByRole("button", { name: "Editar" }).click();
  await page.getByRole("dialog").getByLabel("Capacidad máxima (kg)").fill("1800");
  await page.getByRole("dialog").getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByText("Cambios guardados.", { exact: true })).toBeVisible();
  await expect(fila.getByRole("cell", { name: "1,800 kg" })).toBeVisible();

  await fila.getByRole("button", { name: "Eliminar" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Eliminar" }).click();
  await expect(page.getByText("Camión eliminado.", { exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: identificacion })).toHaveCount(0);
  await expect(page.getByRole("cell", { name: "Camión 1" })).toBeVisible();
});

test("criterio 6: la pestaña Camiones no tiene violaciones serias de axe", async ({ page, context }, testInfo) => {
  expect(process.env.CLAVE_DEMO, "Se requiere la semilla de demostración").toBeTruthy();
  const ingreso = await context.request.post("/api/auth/picking/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario: "ejemplo.01", clave: process.env.CLAVE_DEMO },
  });
  expect(ingreso.ok(), await ingreso.text()).toBe(true);
  await page.goto("/picking/configuracion");
  await expect(page.getByRole("heading", { name: "Camiones y usuarios" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Camión 3" })).toBeVisible();
  await page.screenshot({
    path: `/opt/cursor/artifacts/ce-02/camiones-${testInfo.project.name}.png`,
    fullPage: true,
  });
  const resultados = await new AxeBuilder({ page }).disableRules(["color-contrast"]).analyze();
  expect(resultados.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
});
