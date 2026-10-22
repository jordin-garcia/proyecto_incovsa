import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

try {
  process.loadEnvFile();
} catch {
  // Sin .env el arranque de la prueba lo indica abajo.
}

const CLAVE_NUEVA = "Sitio-e2e-1";

async function entrar(context: BrowserContext, usuario: string, clave = process.env.CLAVE_DEMO) {
  expect(clave, "Se requiere la clave").toBeTruthy();
  const respuesta = await context.request.post("/api/auth/sitio/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario, clave },
  });
  expect(respuesta.ok(), await respuesta.text()).toBe(true);
}

async function abrirUsuarios(page: Page) {
  await page.goto("/panel/usuarios");
  await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
}

test.describe("Panel: usuarios del sitio", () => {
  test.describe.configure({ mode: "serial" });
  test.setTimeout(90_000);

  test("RF-SW-13: Gerencia crea un usuario con solo sit.doc.ver y ese usuario solo ve la documentación", async ({
    page,
    context,
  }, prueba) => {
    const usuario = `doc.${prueba.project.name}.${Date.now().toString(36)}`;
    const nombre = `Lector ${prueba.project.name} ${Date.now().toString(36)}`;
    await entrar(context, "ejemplo.01");
    await abrirUsuarios(page);
    await expect(page.getByRole("heading", { name: "Usuarios del sitio" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Permisos del sitio" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Correo" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Sedes" })).toHaveCount(0);
    await page.getByRole("button", { name: "Nuevo usuario" }).click();

    const dialogo = page.getByRole("dialog");
    await expect(dialogo.getByRole("heading", { name: "Nuevo usuario del sitio" })).toBeVisible();
    await expect(dialogo.getByText("Permisos del sitio web")).toBeVisible();
    await expect(dialogo.getByText("Sedes a las que tiene acceso")).toHaveCount(0);
    await dialogo.getByLabel("Nombre completo").fill(nombre);
    await dialogo.getByLabel("Usuario", { exact: true }).fill(usuario);
    await dialogo.getByLabel("Contraseña", { exact: true }).fill(CLAVE_NUEVA);
    await dialogo.getByLabel("Repita la contraseña").fill(CLAVE_NUEVA);
    await dialogo.getByLabel("Rol").fill("Operativo");
    await dialogo.getByRole("checkbox", { name: "Ver documentos en el navegador" }).check();
    await dialogo.getByRole("button", { name: "Guardar" }).click();
    await expect(page.locator(".toast").filter({ hasText: "Usuario guardado." })).toBeVisible();

    const fila = page.getByRole("row", { name: new RegExp(usuario) });
    await expect(fila).toContainText(nombre);
    await expect(fila).toContainText("Operativo");
    await expect(fila).toContainText("1 permiso(s)");
    await expect(fila).toContainText("Sin correo");
    await expect(fila).toContainText("Activo");

    await context.clearCookies();
    await entrar(context, usuario, CLAVE_NUEVA);
    await page.goto("/panel/documentos");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
    await expect(page.getByRole("heading", { name: "Documentación interna" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Documentación interna" })).toHaveCount(1);
    await expect(page.getByRole("link", { name: "Usuarios del sitio" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Contenido institucional" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Resumen" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Descargar/ })).toHaveCount(0);

    await page.goto("/panel/usuarios");
    await expect(page.getByRole("heading", { name: "Sin acceso a este módulo" })).toBeVisible();
    await expect(page.getByText("Solo Gerencia y Soporte administran los usuarios del sitio.")).toBeVisible();
  });

  test("RF-SW-11 / RN-47: restablecer la contraseña no ofrece correo y la nueva clave entra", async ({
    page,
    context,
  }, prueba) => {
    const usuario = `clave.${prueba.project.name}.${Date.now().toString(36)}`;
    const claveInicial = "Sitio-inicial-1";
    const claveNueva = "Sitio-nueva-22";
    await entrar(context, "ejemplo.01");
    await abrirUsuarios(page);
    await page.getByRole("button", { name: "Nuevo usuario" }).click();
    const alta = page.getByRole("dialog");
    await alta.getByLabel("Nombre completo").fill(`Clave ${prueba.project.name}`);
    await alta.getByLabel("Usuario", { exact: true }).fill(usuario);
    await alta.getByLabel("Contraseña", { exact: true }).fill(claveInicial);
    await alta.getByLabel("Repita la contraseña").fill(claveInicial);
    await alta.getByLabel("Rol").fill("Operativo");
    await alta.getByRole("checkbox", { name: "Ver documentos en el navegador" }).check();
    await alta.getByRole("button", { name: "Guardar" }).click();
    await expect(page.locator(".toast").filter({ hasText: "Usuario guardado." })).toBeVisible();

    const fila = page.getByRole("row", { name: new RegExp(usuario) });
    await fila.getByRole("button", { name: "Contraseña" }).click();
    const dialogo = page.getByRole("dialog");
    await expect(dialogo.getByRole("heading", { name: "Restablecer contraseña" })).toBeVisible();
    await expect(dialogo).toContainText("No se envía nada por correo.");
    await dialogo.getByLabel("Nueva contraseña").fill(claveNueva);
    await dialogo.getByLabel("Repita la contraseña").fill(claveNueva);
    await dialogo.getByRole("button", { name: "Restablecer" }).click();
    await expect(page.locator(".toast").filter({ hasText: "Contraseña restablecida." })).toBeVisible();

    await context.clearCookies();
    await entrar(context, usuario, claveNueva);
    await page.goto("/panel/documentos");
    await expect(page.getByRole("heading", { name: "Documentación interna" })).toBeVisible();
  });

  test("RF-SW-11: ¿Olvidó su contraseña? del sitio pide a Gerencia o a Soporte", async ({ page }) => {
    await page.goto("/acceso");
    await expect(page.locator(".acc-lay")).toHaveAttribute("data-hidratado", "true");
    const otro = page.getByRole("button", { name: "Usar otro usuario" });
    if (await otro.isVisible()) await otro.click();
    await page.getByLabel("Usuario", { exact: true }).fill("ejemplo.01");
    await page.getByRole("button", { name: "Continuar" }).click();
    await page.getByRole("link", { name: /Administración del sitio/ }).click();
    await expect(page.locator(".acc-lay")).toHaveAttribute("data-hidratado", "true");
    await page.getByRole("button", { name: "¿Olvidó su contraseña?" }).click();
    const dialogo = page.getByRole("dialog");
    await expect(dialogo).toContainText("Pídale a Gerencia o a Soporte que la restablezcan.");
    await expect(dialogo.getByLabel("Correo")).toHaveCount(0);
  });

  test("criterio 5: la lista y el alta no tienen violaciones serias de axe", async ({ page, context }) => {
    await entrar(context, "ejemplo.01");
    await abrirUsuarios(page);
    await expect(page.getByRole("button", { name: "Nuevo usuario" })).toBeVisible();
    const lista = await new AxeBuilder({ page }).analyze();
    expect(lista.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);

    await page.getByRole("button", { name: "Nuevo usuario" }).click();
    await expect(page.getByRole("heading", { name: "Nuevo usuario del sitio" })).toBeVisible();
    await page.getByRole("dialog").evaluate(async (elemento) => {
      await Promise.all(elemento.getAnimations().map((animacion) => animacion.finished));
    });
    const dialogo = await new AxeBuilder({ page }).include(".modal").analyze();
    expect(dialogo.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
  });
});
