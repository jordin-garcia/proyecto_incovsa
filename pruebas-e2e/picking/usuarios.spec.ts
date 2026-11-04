import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { irA } from "../comunes/navegacion";

try {
  process.loadEnvFile();
} catch {
  // Sin .env el arranque de la prueba lo indica abajo.
}

const CLAVE_NUEVA = "Bodega-e2e-1";

async function entrar(context: BrowserContext, usuario: string, clave = process.env.CLAVE_DEMO) {
  expect(clave, "Se requiere la clave").toBeTruthy();
  const respuesta = await context.request.post("/api/auth/picking/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario, clave },
  });
  expect(respuesta.ok(), await respuesta.text()).toBe(true);
}

async function abrirConfiguracion(page: Page) {
  await irA(page, "/picking/configuracion");
  await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
}

test.describe("Configuración: usuarios del picking", () => {
  test.describe.configure({ mode: "serial" });
  test.setTimeout(90_000);

  test("RF-SL-03: Gerencia crea un usuario de Bodega que solo ve Quetzaltenango", async ({ page, context }, prueba) => {
    const usuario = `e2e.${prueba.project.name}.${Date.now().toString(36)}`;
    const nombre = `Bodega ${prueba.project.name} ${Date.now().toString(36)}`;
    await entrar(context, "ejemplo.01");
    await abrirConfiguracion(page);
    await page.getByRole("tab", { name: /Usuarios/ }).click();
    await expect(page.getByRole("columnheader", { name: "Permisos del picking" })).toBeVisible();
    await page.getByRole("button", { name: "Nuevo usuario" }).click();

    const dialogo = page.getByRole("dialog");
    await expect(dialogo.getByRole("heading", { name: "Nuevo usuario del picking" })).toBeVisible();
    await dialogo.getByLabel("Nombre completo").fill(nombre);
    await dialogo.getByLabel("Usuario", { exact: true }).fill(usuario);
    await dialogo.getByLabel("Contraseña", { exact: true }).fill(CLAVE_NUEVA);
    await dialogo.getByLabel("Repita la contraseña").fill(CLAVE_NUEVA);
    await dialogo.getByLabel("Rol").fill("Bodega");
    await dialogo.getByRole("checkbox", { name: "Quetzaltenango" }).check();
    await dialogo.getByRole("checkbox", { name: /Preparar, priorizar y despachar/ }).check();
    await dialogo.getByRole("button", { name: "Guardar" }).click();
    await expect(page.locator(".toast").filter({ hasText: "Usuario guardado." })).toBeVisible();

    const fila = page.getByRole("row", { name: new RegExp(usuario) });
    await expect(fila).toBeVisible();
    await expect(fila).toContainText(nombre);
    await expect(fila).toContainText("Bodega");
    await expect(fila).toContainText("Quetzaltenango");
    await expect(fila).toContainText("1 permiso(s)");
    await expect(fila).toContainText("Activo");

    await context.clearCookies();
    await entrar(context, usuario, CLAVE_NUEVA);
    await irA(page, "/picking/bodega");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
    await expect(page.getByRole("heading", { name: "Rutas y pedidos por preparar" })).toBeVisible();
    await expect(page.getByText("Quetzaltenango", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Bodega" })).toHaveCount(1);
    await expect(page.getByRole("link", { name: "Facturación" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Ruta" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Reportes" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Configuración" })).toHaveCount(0);
    await expect(page.getByRole("combobox", { name: "Sede" })).toHaveCount(0);

    await irA(page, "/picking/facturacion");
    await expect(page.getByRole("heading", { name: "Sin acceso a este módulo" })).toBeVisible();
  });

  test("criterio 6: con pk.cfg.camiones sin Gerencia no ve la pestaña Usuarios", async ({ page, context }, prueba) => {
    const usuario = `cfg.${prueba.project.name}.${Date.now().toString(36)}`;
    const clave = "Camiones-e2e-1";
    await entrar(context, "ejemplo.01");
    await abrirConfiguracion(page);
    await page.getByRole("tab", { name: /Usuarios/ }).click();
    await page.getByRole("button", { name: "Nuevo usuario" }).click();

    const dialogo = page.getByRole("dialog");
    await dialogo.getByLabel("Nombre completo").fill(`Camiones ${prueba.project.name}`);
    await dialogo.getByLabel("Usuario", { exact: true }).fill(usuario);
    await dialogo.getByLabel("Contraseña", { exact: true }).fill(clave);
    await dialogo.getByLabel("Repita la contraseña").fill(clave);
    await dialogo.getByLabel("Rol").fill("Bodega");
    await dialogo.getByRole("checkbox", { name: "Quetzaltenango" }).check();
    await dialogo.getByRole("checkbox", { name: "Administrar camiones" }).check();
    await dialogo.getByRole("button", { name: "Guardar" }).click();
    await expect(page.locator(".toast").filter({ hasText: "Usuario guardado." })).toBeVisible();

    await context.clearCookies();
    await entrar(context, usuario, clave);
    await abrirConfiguracion(page);
    await expect(page.getByRole("heading", { name: "Camiones y usuarios" })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Camiones/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Nuevo camión" })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Usuarios/ })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Nuevo usuario" })).toHaveCount(0);
  });

  test("criterio 8: la pestaña Usuarios no tiene violaciones serias de axe", async ({ page, context }) => {
    await entrar(context, "ejemplo.01");
    await abrirConfiguracion(page);
    await page.getByRole("tab", { name: /Usuarios/ }).click();
    await expect(page.getByRole("button", { name: "Nuevo usuario" })).toBeVisible();
    const lista = await new AxeBuilder({ page }).analyze();
    expect(lista.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);

    await page.getByRole("button", { name: "Nuevo usuario" }).click();
    await expect(page.getByRole("heading", { name: "Nuevo usuario del picking" })).toBeVisible();
    await page.getByRole("dialog").evaluate(async (elemento) => {
      await Promise.all(elemento.getAnimations().map((animacion) => animacion.finished));
    });
    const dialogo = await new AxeBuilder({ page }).include(".modal").analyze();
    expect(dialogo.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
  });
});
