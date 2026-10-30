import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { irA, recargar } from "../comunes/navegacion";

async function entrar(context: BrowserContext, usuario: string, sistema: "sitio" | "picking") {
  expect(process.env.CLAVE_DEMO, "Se requiere la semilla de demostración").toBeTruthy();
  const r = await context.request.post(`/api/auth/${sistema}/sign-in/username`, {
    headers: { origin: "http://localhost:3000" },
    data: { usuario, clave: process.env.CLAVE_DEMO },
  });
  expect(r.ok()).toBe(true);
}
async function abrirMenu(page: Page) {
  if ((page.viewportSize()?.width ?? 0) <= 1024) await page.getByRole("button", { name: "Menú", exact: true }).click();
}
for (const caso of [
  { usuario: "ejemplo.03", sistema: "picking", opciones: ["Facturación"] },
  { usuario: "ejemplo.03", sistema: "sitio", opciones: ["Documentación interna"] },
  { usuario: "ejemplo.05", sistema: "picking", opciones: ["Bodega", "Tablero"] },
  { usuario: "ejemplo.06", sistema: "picking", opciones: ["Ruta"] },
  {
    usuario: "ejemplo.08",
    sistema: "sitio",
    opciones: [
      "Resumen",
      "Contenido institucional",
      "Industrias",
      "Catálogo",
      "Noticias",
      "Información de contacto",
      "Solicitudes",
      "Documentación interna",
    ],
  },
  { usuario: "ejemplo.09", sistema: "sitio", opciones: ["Documentación interna"] },
  {
    usuario: "ejemplo.01",
    sistema: "picking",
    opciones: ["Facturación", "Bodega", "Ruta", "Reportes", "Configuración", "Tablero"],
  },
  {
    usuario: "ejemplo.01",
    sistema: "sitio",
    opciones: [
      "Resumen",
      "Contenido institucional",
      "Industrias",
      "Catálogo",
      "Noticias",
      "Información de contacto",
      "Solicitudes",
      "Documentación interna",
      "Usuarios del sitio",
    ],
  },
] as const) {
  test(`RN-38: ${caso.usuario} en ${caso.sistema} solo ve sus módulos`, async ({ page, context }, info) => {
    await entrar(context, caso.usuario, caso.sistema);
    await irA(page, caso.sistema === "sitio" ? "/panel" : "/picking");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
    await abrirMenu(page);
    await expect(page.getByRole("navigation", { name: "Módulos" }).getByRole("link")).toHaveText([...caso.opciones]);
    await expect(page.locator(".lado-usuario")).toContainText(`Usuario de ejemplo ${caso.usuario.slice(-2)}`);
    // La entrada redirige al primer módulo; axe debe auditar también su metadata ya aplicada.
    await expect(page).toHaveTitle(/INCOVSA/);
    expect(
      (await new AxeBuilder({ page }).analyze()).violations.filter((v) =>
        ["serious", "critical"].includes(v.impact ?? ""),
      ),
    ).toEqual([]);
    await info.attach("armazon-permisos", { body: await page.screenshot(), contentType: "image/png" });
  });
}
test("RNF-04: primera barrera por sistema y rechazo de acceso directo en el servidor", async ({ page, context }) => {
  await irA(page, "/picking/bodega");
  await expect(page).toHaveURL(/\/acceso$/);
  await entrar(context, "ejemplo.03", "sitio");
  await irA(page, "/picking/bodega");
  await expect(page).toHaveURL(/\/acceso$/);
  await entrar(context, "ejemplo.03", "picking");
  await irA(page, "/picking/bodega");
  await expect(page.getByRole("heading", { name: "Sin acceso a este módulo" })).toBeVisible();
  await expect(page.getByText("Sus permisos no incluyen Bodega. Los asignan Gerencia o Soporte.")).toBeVisible();
  await page.getByRole("link", { name: "Ir a mi módulo" }).click();
  await expect(page).toHaveURL(/\/picking\/facturacion$/);
});
test("RN-17 / RF-SL-66: cookie ajena se ignora y la sede autorizada persiste", async ({ page, context }) => {
  await entrar(context, "ejemplo.03", "picking");
  await context.addCookies([{ name: "incovsa-sede", value: "2", domain: "localhost", path: "/picking" }]);
  await irA(page, "/picking/facturacion");
  await expect(page.getByRole("banner")).toContainText("Quetzaltenango");
  await expect(page.getByRole("combobox", { name: "Sede", exact: true })).toHaveCount(0);
  await entrar(context, "ejemplo.01", "picking");
  await irA(page, "/picking/facturacion");
  await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
  const sede = page.getByRole("combobox", { name: "Sede", exact: true });
  await expect(sede.getByRole("option")).toHaveText(["Quetzaltenango", "Guatemala", "Escuintla"]);
  let liberar = () => {};
  const pendiente = new Promise<void>((resolver) => {
    liberar = resolver;
  });
  await page.route("**/picking/facturacion", async (ruta) => {
    if (ruta.request().method() === "POST" && ruta.request().headers()["next-action"]) await pendiente;
    await ruta.continue();
  });
  try {
    await sede.selectOption({ label: "Escuintla" });
    await expect(sede).toBeDisabled();
  } finally {
    liberar();
  }
  await expect(sede).toHaveValue("3");
  await expect(sede).toBeEnabled();
  await recargar(page);
  await expect(sede).toHaveValue("3");
  await irA(page, "/picking/bodega");
  await expect(sede).toHaveValue("3");
});
