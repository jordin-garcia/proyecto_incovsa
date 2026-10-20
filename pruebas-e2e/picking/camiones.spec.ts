import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

try {
  process.loadEnvFile();
} catch {
  // Sin .env el arranque de la prueba lo indica abajo.
}

async function entrar(context: BrowserContext, usuario: string) {
  expect(process.env.CLAVE_DEMO, "Se requiere la clave demo").toBeTruthy();
  const respuesta = await context.request.post("/api/auth/picking/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario, clave: process.env.CLAVE_DEMO },
  });
  expect(respuesta.ok()).toBe(true);
}

async function abrirConfiguracion(page: Page) {
  await page.goto("/picking/configuracion");
  await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
}

test.describe("Configuración: camiones", () => {
  test.describe.configure({ mode: "serial" });

  test("RF-SL-04: se crea, edita y elimina un camión", async ({ page, context }, prueba) => {
    const identificacion = `CE02 ${prueba.project.name} ${Date.now()}`;
    await entrar(context, "ejemplo.01");
    await abrirConfiguracion(page);

    await expect(page.getByRole("heading", { name: "Camiones y usuarios" })).toBeVisible();
    await expect(page.getByText("Módulo de configuración")).toBeVisible();
    await expect(page.getByRole("row", { name: /Camión 1/ })).toContainText("3,400 kg");
    await expect(page.getByRole("row", { name: /Camión 1/ })).toContainText("Quetzaltenango");
    await expect(page.getByRole("row", { name: /Camión 3/ })).toContainText("6,000 kg");
    await expect(page.getByRole("tab", { name: /Usuarios/ })).toBeVisible();

    await page.getByRole("button", { name: "Nuevo camión" }).click();
    const dialogo = page.getByRole("dialog");
    await expect(dialogo.getByRole("heading", { name: "Nuevo camión" })).toBeVisible();
    await dialogo.getByLabel("Identificación").fill(identificacion);
    await dialogo.getByLabel("Capacidad máxima (kg)").fill("0");
    await dialogo.getByRole("button", { name: "Guardar" }).click();
    await expect(dialogo.getByText("La capacidad debe ser mayor que cero.")).toBeVisible();

    await dialogo.getByLabel("Capacidad máxima (kg)").fill("1500");
    await dialogo.getByLabel("Sede").selectOption({ label: "Quetzaltenango" });
    await dialogo.getByRole("button", { name: "Guardar" }).click();
    await expect(page.locator(".toast").filter({ hasText: "Cambios guardados." })).toBeVisible();
    const fila = page.getByRole("row", { name: new RegExp(identificacion) });
    await expect(fila).toContainText("1,500 kg");
    await expect(fila).toContainText("Quetzaltenango");

    await fila.getByRole("button", { name: "Editar" }).click();
    await expect(dialogo.getByRole("heading", { name: "Editar camión" })).toBeVisible();
    await dialogo.getByLabel("Capacidad máxima (kg)").fill("1800.5");
    await dialogo.getByRole("button", { name: "Guardar" }).click();
    await expect(fila).toContainText("1,800.5 kg");

    await fila.getByRole("button", { name: "Eliminar" }).click();
    await expect(dialogo).toContainText(`¿Eliminar ${identificacion}?`);
    await dialogo.getByRole("button", { name: "Eliminar" }).click();
    await expect(page.locator(".toast").filter({ hasText: "Camión eliminado." })).toBeVisible();
    await expect(page.getByRole("row", { name: new RegExp(identificacion) })).toHaveCount(0);

    await page.getByRole("tab", { name: /Usuarios/ }).click();
    await expect(page.getByRole("columnheader", { name: "Nombre" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Nuevo usuario" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Nuevo camión" })).toHaveCount(0);
  });

  test("criterio 6: sin violaciones serias de axe", async ({ page, context }) => {
    await entrar(context, "ejemplo.01");
    await abrirConfiguracion(page);
    await expect(page.getByRole("heading", { name: "Camiones y usuarios" })).toBeVisible();
    const resultados = await new AxeBuilder({ page }).analyze();
    const graves = resultados.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(graves).toEqual([]);
  });

  test("RNF-04: sin pk.cfg.camiones la pantalla rechaza el acceso", async ({ page, context }) => {
    await entrar(context, "ejemplo.05");
    await abrirConfiguracion(page);
    await expect(page.getByRole("heading", { name: "Sin acceso a este módulo" })).toBeVisible();
    await expect(
      page.getByText("Sus permisos no incluyen Configuración. Los asignan Gerencia o Soporte."),
    ).toBeVisible();
  });
});
