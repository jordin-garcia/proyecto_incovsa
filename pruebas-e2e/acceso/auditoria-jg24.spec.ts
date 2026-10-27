import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { Client } from "pg";
import { capturaEvidencia } from "../comunes/evidencia";

try {
  process.loadEnvFile();
} catch {
  /* La CI entrega las variables. */
}

async function entrar(context: BrowserContext, sistema: "sitio" | "picking", usuario: string) {
  const r = await context.request.post(`/api/auth/${sistema}/sign-in/username`, {
    headers: { origin: "http://localhost:3000" },
    data: { usuario, clave: process.env.CLAVE_DEMO },
  });
  expect(r.ok()).toBe(true);
}
async function evidencia(page: Page, nombre: string) {
  expect(
    (await new AxeBuilder({ page }).analyze()).violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  await capturaEvidencia(page, `plan/evidencias/JG-24/aplicacion-${nombre}-${page.viewportSize()!.width}.png`);
}

test("RF-SW-09 / RF-SL-02 / H-33: el sistema no autorizado vuelve al paso 2 sin registrar un fallo ni pedir sede", async ({
  page,
}, info) => {
  const ip = `198.19.${["telefono", "tableta", "escritorio"].indexOf(info.project.name) + 1}.${info.workerIndex + 1}`;
  await page.setExtraHTTPHeaders({ "X-Real-IP": ip });
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try {
    const contar = async () =>
      (
        await db.query(
          "SELECT count(*)::int AS n FROM bitacora WHERE ip = $1 AND operacion IN ('Intento de acceso fallido', 'Intento fallido de inicio de sesión')",
          [ip],
        )
      ).rows[0].n;
    const antes = await contar();
    await page.goto("/acceso");
    await expect(page.locator(".acc-lay")).toHaveAttribute("data-hidratado", "true");
    await expect(page.getByRole("combobox")).toHaveCount(0);
    await expect(page.getByLabel("Sede", { exact: true })).toHaveCount(0);
    await page.getByLabel("Usuario", { exact: true }).fill("ejemplo.08");
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page.getByRole("heading", { name: "¿A dónde desea ingresar?" })).toBeVisible();
    await expect(page.locator(".acc-op:not(.deshabilitada) p").first()).toHaveCSS("color", "rgb(114, 115, 114)");
    await expect(page.getByRole("combobox")).toHaveCount(0);
    await page.goto("/acceso/picking");
    await expect(page).toHaveURL(/\/acceso$/);
    await expect(page.getByRole("heading", { name: "¿A dónde desea ingresar?" })).toBeVisible();
    expect(await contar()).toBe(antes);
    await evidencia(page, "sistema-no-autorizado");
    await page.getByRole("link", { name: /Administración del sitio/ }).click();
    await expect(page.getByRole("heading", { name: "Administración del sitio", level: 2 })).toBeVisible();
    await expect(page.getByRole("combobox")).toHaveCount(0);
    await expect(page.getByLabel("Sede", { exact: true })).toHaveCount(0);
  } finally {
    await db.end();
  }
});

for (const sistema of ["sitio", "picking"] as const) {
  test(`RF-SW-30 / H-34: cerrar ${sistema} muestra Sesión cerrada en Inicio`, async ({ page, context }) => {
    await entrar(context, sistema, "ejemplo.01");
    await page.goto(sistema === "sitio" ? "/panel" : "/picking");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
    if (await page.getByRole("button", { name: "Menú", exact: true }).isVisible())
      await page.getByRole("button", { name: "Menú", exact: true }).click();
    await page.getByRole("button", { name: "Cerrar sesión", exact: true }).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByText("Sesión cerrada.", { exact: true })).toBeVisible();
    expect(await (await context.request.get(`/api/auth/${sistema}/get-session`)).json()).toBeNull();
    await evidencia(page, `salida-${sistema}`);
    await expect(page.getByText("Sesión cerrada.", { exact: true })).toHaveCount(0, { timeout: 6000 });
    await page.goto("/acceso");
    await page.goBack();
    await expect(page).toHaveURL("/");
    await expect(page.getByText("Sesión cerrada.", { exact: true })).toHaveCount(0);
  });
}

test("RF-SW-25 / H-07 / H-13 / H-39: acceso denegado ofrece el módulo propio y un módulo inexistente conserva el armazón", async ({
  page,
  context,
}) => {
  await entrar(context, "sitio", "ejemplo.09");
  for (const modulo of ["industrias", "catalogo"]) {
    await page.goto(`/panel/${modulo}`);
    await expect(page.getByRole("heading", { name: "Sin acceso a este módulo" })).toBeVisible();
    const volver = page.getByRole("link", { name: "Ir a mi módulo", exact: true });
    await expect(volver).toHaveAttribute("href", "/panel/documentos");
    await evidencia(page, `sin-acceso-${modulo}`);
  }
  // En el panel, el prototipo dice «Sección no encontrada» (panel.js › ruta); «Módulo» es solo del picking.
  await page.goto("/panel/no-existe");
  await expect(page.getByRole("heading", { name: "Sección no encontrada", exact: true })).toBeVisible();
  await expect(page.locator(".app")).toBeVisible();
  await evidencia(page, "seccion-inexistente");
  await entrar(context, "picking", "ejemplo.03");
  await page.goto("/picking/reportes");
  await expect(
    page.getByText("Sus permisos no incluyen Reportes. Los asignan Gerencia o Soporte.", { exact: true }),
  ).toBeVisible();
  await evidencia(page, "sin-acceso-reportes");
  await page.goto("/picking/no-existe");
  await expect(page.getByRole("heading", { name: "Módulo no encontrado", exact: true })).toBeVisible();
  await expect(page.locator(".app")).toBeVisible();
  await evidencia(page, "modulo-inexistente");
});
