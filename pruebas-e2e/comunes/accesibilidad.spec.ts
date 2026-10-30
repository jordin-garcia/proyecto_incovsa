// Pantallas que no tenían su propia revisión de axe (JG-16, RNF-08). Las demás páginas ya la tienen en las pruebas
// de su módulo; esta completa las que faltaban sin repetirlas.
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

try {
  process.loadEnvFile();
} catch {
  /* La CI entrega las variables. */
}

async function violacionesGraves(page: Page) {
  return (await new AxeBuilder({ page }).analyze()).violations.filter((v) =>
    ["serious", "critical"].includes(v.impact ?? ""),
  );
}

async function entrar(context: BrowserContext, usuario: string) {
  const respuesta = await context.request.post("/api/auth/picking/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario, clave: process.env.CLAVE_DEMO },
  });
  expect(respuesta.ok()).toBe(true);
}

test.beforeEach(async ({ page }, info) => {
  // Una IP por proyecto y trabajador, como en acceso-personal.spec.ts, para no compartir el límite de intentos.
  const red = ["telefono", "tableta", "escritorio"].indexOf(info.project.name) + 1;
  await page.setExtraHTTPHeaders({ "X-Real-IP": `198.20.${red}.${info.workerIndex + 1}` });
});

test("RNF-08: el paso de la contraseña de Administración del sitio no tiene violaciones serias ni críticas", async ({
  page,
}) => {
  await page.goto("/acceso");
  await expect(page.locator(".acc-lay")).toHaveAttribute("data-hidratado", "true");
  const otro = page.getByRole("button", { name: "Usar otro usuario" });
  if (await otro.isVisible()) await otro.click();
  await page.getByLabel("Usuario", { exact: true }).fill("ejemplo.08");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("link", { name: /Administración del sitio/ }).click();
  await expect(page).toHaveURL(/\/acceso\/sitio$/);
  await expect(page.getByRole("heading", { name: "Administración del sitio", level: 2 })).toBeVisible();
  await expect(page.locator(".acc-lay")).toHaveAttribute("data-hidratado", "true");
  expect(await violacionesGraves(page)).toEqual([]);
});

test("RNF-08: Reportes con el periodo por defecto no tiene violaciones serias ni críticas", async ({
  page,
  context,
}) => {
  await entrar(context, "ejemplo.01");
  await page.goto("/picking/reportes");
  await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
  await expect(page.getByRole("heading", { name: "Reportes y bitácora" })).toBeVisible();
  expect(await violacionesGraves(page)).toEqual([]);
});

test("RNF-08: Facturación al entrar no tiene violaciones serias ni críticas", async ({ page, context }) => {
  await entrar(context, "ejemplo.03");
  await page.goto("/picking/facturacion");
  await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
  await expect(page.getByRole("heading", { name: "Pedidos facturados", exact: true })).toBeVisible();
  expect(await violacionesGraves(page)).toEqual([]);
});
