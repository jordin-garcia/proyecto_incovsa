import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { Client } from "pg";
import { capturaEvidencia } from "../comunes/evidencia";
try {
  process.loadEnvFile();
} catch {
  /* CI */
}
async function entrar(page: Page, usuario: string) {
  const r = await page.request.post("/api/auth/sitio/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario, clave: process.env.CLAVE_DEMO },
  });
  expect(r.ok()).toBe(true);
}
async function captura(page: Page, nombre: string) {
  await capturaEvidencia(
    page,
    `pruebas-e2e/panel/evidencias/DM-10/aplicacion-${nombre}-${page.viewportSize()!.width}.png`,
    {
      animations: "disabled",
    },
  );
}
async function axe(page: Page) {
  expect(
    (await new AxeBuilder({ page }).analyze()).violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
}
test("RF-SW-14 / RN-41 / RNF-08: crear, buscar, editar y eliminar productos documentados", async ({ page }, info) => {
  const nombre = `Prueba DM10 ${info.project.name}`;
  const bd = new Client({ connectionString: process.env.DATABASE_URL });
  await bd.connect();
  try {
    await entrar(page, "ejemplo.08");
    await page.goto("/panel/documentos");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
    await captura(page, "tabla");
    await page.getByRole("button", { name: "Nuevo producto documentado" }).click();
    await captura(page, "nuevo");
    await page.getByLabel("Nombre del producto *", { exact: true }).fill(nombre);
    await page.getByRole("combobox", { name: "País de origen *", exact: true }).selectOption({ label: "México" });
    await page.getByRole("button", { name: "Guardar", exact: true }).click();
    await expect(page.getByText("Escriba el lote: es obligatorio.", { exact: true })).toBeVisible();
    await page.getByLabel("Lote *", { exact: true }).fill("ABC123");
    await page.getByLabel("Enlace de Google Drive · Ficha técnica (FT)").fill("https://evil.invalid/documento");
    await page.getByRole("button", { name: "Guardar", exact: true }).click();
    await expect(
      page.getByText("El enlace debe ser de Google Drive (https://drive.google.com/…).", { exact: true }),
    ).toBeVisible();
    await page
      .getByLabel("Enlace de Google Drive · Ficha técnica (FT)")
      .fill("https://drive.google.com/file/d/archivo_Prueba123/view");
    await axe(page);
    await page.getByRole("button", { name: "Guardar", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const buscar = page.getByPlaceholder("Buscar por lote, producto o país de origen");
    for (const q of [nombre, "ABC123", "México"]) {
      await buscar.fill(q);
      await expect(page.getByRole("cell", { name: nombre, exact: true })).toBeVisible();
    }
    await buscar.fill(nombre);
    await page.getByRole("button", { name: "Editar", exact: true }).click();
    await page.getByLabel("Lote *", { exact: true }).fill("EDITADO123");
    await captura(page, "editar");
    await page.getByRole("button", { name: "Guardar", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("cell", { name: "EDITADO123" })).toBeVisible();
    await axe(page);
    await page.getByRole("button", { name: "Eliminar", exact: true }).click();
    await captura(page, "eliminar");
    await axe(page);
    await page.getByRole("dialog").getByRole("button", { name: "Eliminar", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Sin productos documentados" })).toBeVisible();
    await captura(page, "vacio");
  } finally {
    await bd.query("DELETE FROM producto_documentado WHERE producto=$1", [nombre]);
    await bd.end();
  }
});
test("RN-19 / RF-SW-21 / RNF-08: solo ver y ver-descargar reciben opciones y direcciones autorizadas; CSP permite Drive", async ({
  page,
}, info) => {
  const nombre = `Permisos DM10 ${info.project.name}`;
  const bd = new Client({ connectionString: process.env.DATABASE_URL });
  await bd.connect();
  try {
    await bd.query(
      "INSERT INTO producto_documentado(producto,pais_id,lote,enlace_ft,creado_por,actualizado_en) SELECT $1,p.id,'DM10ABC','https://drive.google.com/file/d/archivo_Prueba123/view',u.id,now() FROM pais p CROSS JOIN usuario u WHERE p.codigo='MX' AND u.display_username='ejemplo.08'",
      [nombre],
    );
    for (const usuario of ["ejemplo.10", "ejemplo.09"]) {
      await page.context().clearCookies();
      await entrar(page, usuario);
      const respuesta = await page.goto("/panel/documentos");
      const html = await respuesta!.text();
      expect(html.includes("export=download")).toBe(usuario === "ejemplo.09");
      const marcos = respuesta!
        .headers()
        ["content-security-policy"].split(";")
        .find((d) => d.trim().startsWith("frame-src "));
      expect(marcos?.trim().split(/\s+/)).toContain("https://drive.google.com/file/d/");
      await expect(page.getByRole("button", { name: "Nuevo producto documentado" })).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Editar", exact: true })).toHaveCount(0);
      await page.getByPlaceholder("Buscar por lote, producto o país de origen").fill(nombre);
      await page.getByRole("cell", { name: nombre, exact: true }).click();
      await expect(page.getByRole("button", { name: "Ver", exact: true })).toBeVisible();
      await expect(page.getByRole("link", { name: "Descargar" })).toHaveCount(usuario === "ejemplo.09" ? 1 : 0);
      await captura(page, `${usuario}-documentos`);
      await axe(page);
      await page.route("https://drive.google.com/**", (route) =>
        route.fulfill({
          contentType: "text/html",
          body: "<html lang='es'><title>Documento de prueba</title><body>Vista previa de prueba</body></html>",
        }),
      );
      await page.getByRole("button", { name: "Ver", exact: true }).click();
      await expect(page.locator("iframe")).toHaveAttribute(
        "src",
        "https://drive.google.com/file/d/archivo_Prueba123/preview",
      );
      await expect(page.frameLocator("iframe").getByText("Vista previa de prueba", { exact: true })).toBeVisible();
      await captura(page, `${usuario}-vista-previa`);
      await page.getByRole("dialog").getByRole("button", { name: "Cerrar", exact: true }).last().click();
    }
  } finally {
    await bd.query("DELETE FROM producto_documentado WHERE producto=$1", [nombre]);
    await bd.end();
  }
});
