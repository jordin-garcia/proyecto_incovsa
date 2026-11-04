import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { irA } from "../comunes/navegacion";

const clave = process.env.CLAVE_DEMO;
test.beforeEach(async ({ page }, info) => {
  const red = ["telefono", "tableta", "escritorio"].indexOf(info.project.name) + 1;
  // Navegadores independientes: sus consultas inválidas no deben compartir el límite de una IP real.
  await page.setExtraHTTPHeaders({ "X-Real-IP": `198.18.${red}.${info.workerIndex + 1}` });
});
async function abrirAcceso(page: Page) {
  await irA(page, "/acceso");
  await expect(page.locator(".acc-lay")).toHaveAttribute("data-hidratado", "true");
  const otro = page.getByRole("button", { name: "Usar otro usuario" });
  if (await otro.isVisible()) await otro.click();
}

test("RF-SW-09 / CAM-83: los tres pasos, sistemas habilitados, ayuda, contraseña y accesibilidad", async ({ page }) => {
  await abrirAcceso(page);
  await expect(page.getByRole("heading", { name: "¿Quién es usted?" })).toBeVisible();
  await expect(page.locator(".acc-centro")).toHaveText(
    "Acceso personalEscriba su nombre de usuario. Después elija a qué sistema desea ingresar y escriba su contraseña.",
  );
  await page.getByLabel("Usuario", { exact: true }).fill("ejemplo.03");
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByRole("heading", { name: "¿A dónde desea ingresar?" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Administración del sitio/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Sistema de picking/ })).toBeVisible();
  await expect(
    new AxeBuilder({ page })
      .analyze()
      .then((r) => r.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))),
  ).resolves.toEqual([]);
  await page.getByRole("button", { name: /^Odoo/ }).click();
  await expect(page.getByRole("dialog")).toContainText("No hay intercambio de datos con Odoo.");
  await expect(page.getByRole("dialog")).not.toContainText("P-06");
  await page.getByRole("button", { name: "Entendido" }).click();
  await page.getByRole("link", { name: /Sistema de picking/ }).click();
  await expect(page.getByRole("heading", { name: "Sistema de picking", level: 2 })).toBeVisible();
  await expect(page.getByRole("combobox")).toHaveCount(0);
  await expect(page.getByLabel("Sede", { exact: true })).toHaveCount(0);
  await expect(page.locator(".acc-lay")).toHaveAttribute("data-hidratado", "true");
  await page.getByRole("button", { name: "¿Olvidó su contraseña?" }).click();
  await expect(page.getByRole("dialog")).toContainText("Pídale a Gerencia o a Soporte que la restablezcan.");
  await page.getByRole("button", { name: "Entendido" }).click();
  await page.getByLabel("Contraseña", { exact: true }).fill("incorrecta");
  await page.getByRole("button", { name: "Mostrar contraseña" }).click();
  await expect(page.getByLabel("Contraseña", { exact: true })).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page.getByRole("region", { name: "Acceso para personal" }).getByRole("alert")).toContainText(
    "Usuario o contraseña incorrectos.",
  );
  expect(
    (await new AxeBuilder({ page }).analyze()).violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
});

test("RF-SW-09: restringe opciones según la cuenta y rechaza usuarios inexistentes", async ({ page }) => {
  for (const [usuario, habilitada, deshabilitada] of [
    ["ejemplo.08", "Administración del sitio", "Sistema de picking"],
    ["ejemplo.05", "Sistema de picking", "Administración del sitio"],
  ]) {
    await abrirAcceso(page);
    await page.getByLabel("Usuario", { exact: true }).fill(usuario!);
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page.getByRole("link", { name: new RegExp(habilitada!) })).toBeVisible();
    await expect(page.locator('[aria-disabled="true"]').filter({ hasText: deshabilitada! })).toBeVisible();
  }
  await abrirAcceso(page);
  await page.getByLabel("Usuario", { exact: true }).fill("no.existe.e2e");
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByRole("region", { name: "Acceso para personal" }).getByRole("alert")).toContainText(
    "No tiene permisos para acceder a los sistemas de INCOVSA.",
  );
  expect(
    (await new AxeBuilder({ page }).analyze()).violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
});

test("RN-54 / RF-SW-30: dos sesiones simultáneas; salir de una lleva al inicio y conserva la otra", async ({
  page,
  context,
}) => {
  expect(clave, "Las pruebas de acceso requieren CLAVE_DEMO y semilla:demo").toBeTruthy();
  for (const sistema of ["sitio", "picking"]) {
    await abrirAcceso(page);
    await page.getByLabel("Usuario", { exact: true }).fill("ejemplo.03");
    await page.getByRole("button", { name: "Continuar" }).click();
    await page
      .getByRole("link", { name: sistema === "sitio" ? /Administración del sitio/ : /Sistema de picking/ })
      .click();
    await expect(page.locator(".acc-lay")).toHaveAttribute("data-hidratado", "true");
    await page.getByLabel("Contraseña", { exact: true }).fill(clave!);
    await page.getByRole("button", { name: "Ingresar" }).click();
    await expect(page).toHaveURL(sistema === "sitio" ? /\/panel\/documentos$/ : /\/picking\/facturacion$/);
  }
  for (const sistema of ["sitio", "picking"]) {
    const r = await context.request.get(`/api/auth/${sistema}/get-session`);
    expect((await r.json()).usuario.usuario).toBe("ejemplo.03");
  }
  const cookies = (await context.cookies()).filter((c) => c.name.includes("session_token"));
  expect(cookies).toHaveLength(2);
  for (const cookie of cookies) {
    expect(cookie.httpOnly).toBe(true);
    expect(cookie.sameSite).toBe("Lax");
  }
  const r = await context.request.post("/api/auth/sitio/sign-out", { headers: { origin: "http://localhost:3000" } });
  expect(r.status()).toBe(200);
  expect(await (await context.request.get("/api/auth/sitio/get-session")).json()).toBeNull();
  expect(await (await context.request.get("/api/auth/picking/get-session")).json()).not.toBeNull();
  // El resto de la conexión del armazón a sesión/permisos/sedes corresponde a JG-07.
  await irA(page, "/picking");
  if (await page.getByRole("button", { name: "Menú", exact: true }).isVisible())
    await page.getByRole("button", { name: "Menú", exact: true }).click();
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL("/");
  expect(await (await context.request.get("/api/auth/picking/get-session")).json()).toBeNull();
});

test("RNF-05: no expone altas, cambios de contraseña ni accesos que evadan límites; verifica origen", async ({
  request,
}) => {
  for (const ruta of ["sign-up/email", "sign-in/email", "change-password", "is-username-available"]) {
    expect((await request.post(`/api/auth/sitio/${ruta}`, { data: {} })).status()).toBe(404);
  }
  expect(
    (
      await request.post("/api/auth/sitio/sign-in/username", { headers: { origin: "https://ajeno.invalid" }, data: {} })
    ).status(),
  ).toBe(403);
});
