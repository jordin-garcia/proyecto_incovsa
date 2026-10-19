import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

try {
  process.loadEnvFile();
} catch {
  // Sin .env la prueba lo dice al entrar.
}

async function entrar(context: BrowserContext, usuario: string) {
  expect(process.env.CLAVE_DEMO, "Se requiere la semilla de demostración").toBeTruthy();
  const r = await context.request.post("/api/auth/picking/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario, clave: process.env.CLAVE_DEMO },
  });
  expect(r.ok(), await r.text()).toBe(true);
}

async function abrirMenu(page: Page) {
  if ((page.viewportSize()?.width ?? 0) <= 1024) await page.getByRole("button", { name: "Menú", exact: true }).click();
}

test("RF-SL-03 / RF-SL-56: Gerencia crea un usuario de Bodega y ese usuario solo ve Quetzaltenango", async ({
  page,
  context,
}, testInfo) => {
  const usuario = `e2e.bodega.${testInfo.project.name}.${Date.now()}`;
  await entrar(context, "ejemplo.01");
  await page.goto("/picking/configuracion?pestana=usuarios");
  await expect(page.getByRole("heading", { name: "Camiones y usuarios" })).toBeVisible();
  await page.getByRole("button", { name: "Nuevo usuario" }).click();
  const dialogo = page.getByRole("dialog");
  await dialogo.getByLabel("Nombre completo").fill(`Bodega ${testInfo.project.name}`);
  await dialogo.getByLabel("Usuario").fill(usuario);
  await dialogo.getByLabel("Contraseña", { exact: true }).fill("Clave-e2e-bodega");
  await dialogo.getByLabel("Repita la contraseña").fill("Clave-e2e-bodega");
  await dialogo.getByLabel("Rol").fill("Bodega");
  await dialogo.getByRole("checkbox", { name: "Quetzaltenango" }).check();
  await dialogo
    .getByRole("checkbox", { name: "Preparar, priorizar y despachar rutas y pedidos (incluye el tablero)" })
    .check();
  await dialogo.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByText("Usuario guardado.", { exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: usuario, exact: true })).toBeVisible();

  await context.clearCookies();
  const r = await context.request.post("/api/auth/picking/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario, clave: "Clave-e2e-bodega" },
  });
  expect(r.ok(), await r.text()).toBe(true);
  await page.goto("/picking/bodega");
  await abrirMenu(page);
  await expect(page.getByRole("link", { name: "Bodega" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Facturación" })).toHaveCount(0);
  await expect(page.getByText("Bodega · Quetzaltenango")).toBeVisible();
  await expect(page.getByText(/Bodega · .*Guatemala/)).toHaveCount(0);

  await context.clearCookies();
  await entrar(context, "ejemplo.01");
  await page.goto("/picking/configuracion?pestana=usuarios");
  const fila = page.getByRole("row", { name: new RegExp(usuario) });
  await fila.getByRole("button", { name: "Eliminar" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Eliminar" }).click();
  await expect(page.getByText("Usuario eliminado.", { exact: true })).toBeVisible();
});

test("criterio 8: la pestaña Usuarios no tiene violaciones serias de axe", async ({ page, context }) => {
  await entrar(context, "ejemplo.01");
  await page.goto("/picking/configuracion?pestana=usuarios");
  await expect(page.getByRole("heading", { name: "Camiones y usuarios" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Permisos del picking" })).toBeVisible();
  const resultados = await new AxeBuilder({ page }).disableRules(["color-contrast"]).analyze();
  expect(resultados.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
});
