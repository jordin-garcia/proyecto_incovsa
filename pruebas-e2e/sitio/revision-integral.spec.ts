import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { Client } from "pg";

try {
  process.loadEnvFile();
} catch {
  /* La CI proporciona las variables. */
}

const CARPETA = "pruebas-e2e/sitio/evidencias/DM-11";
const PUBLICAS = ["/", "/nosotros", "/industrias", "/productos", "/noticias", "/contacto", "/acceso"];
const SECCIONES = [
  "resumen",
  "contenido",
  "industrias",
  "catalogo",
  "noticias",
  "contacto",
  "solicitudes",
  "documentos",
];

const errores = new WeakMap<Page, string[]>();
const conexiones = new WeakMap<Page, Client>();
test.beforeEach(async ({ page }) => {
  test.setTimeout(180_000);
  const bd = new Client({ connectionString: process.env.DATABASE_URL });
  conexiones.set(page, bd);
  await bd.connect();
  // Mismos candados que los preparadores que cambian contenido durante la suite.
  for (const clave of [2026101902, 2026102103, 2026102207, 2026102408, 2026102509, 2026102610]) {
    await bd.query("SELECT pg_advisory_lock($1)", [clave]);
  }
  const encontrados: string[] = [];
  errores.set(page, encontrados);
  page.on("pageerror", (error) => encontrados.push(error.message));
});
test.afterEach(async ({ page }) => {
  await conexiones.get(page)?.end();
  expect(errores.get(page)).toEqual([]);
});

async function revisar(page: Page, nombre: string) {
  await expect(page.locator("h1")).toBeVisible();
  // Next transmite los metadatos después del contenido en una navegación cliente.
  await expect(page).toHaveTitle(/\S/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
  const resultado = await new AxeBuilder({ page }).analyze();
  const graves = resultado.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  await mkdir(CARPETA, { recursive: true });
  await writeFile(
    `${CARPETA}/axe-${nombre}-${page.viewportSize()!.width}.json`,
    `${JSON.stringify(graves, null, 2)}\n`,
  );
  await page.screenshot({
    path: `${CARPETA}/aplicacion-${nombre}-${page.viewportSize()!.width}.png`,
    fullPage: true,
    animations: "disabled",
  });
  expect(graves).toEqual([]);
}

async function enfocarConTab(page: Page, selector: string) {
  if (await page.locator(selector).evaluate((elemento) => elemento === document.activeElement)) return;
  for (let intento = 0; intento < 200; intento++) {
    await page.keyboard.press("Tab");
    if (await page.locator(selector).evaluate((elemento) => elemento === document.activeElement)) return;
  }
  throw new Error(`No se puede alcanzar con Tab: ${selector}`);
}

for (const ruta of PUBLICAS) {
  test(`RNF-01 / RNF-08 / RF-SW-16: revisión integral pública ${ruta}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(ruta);
    await revisar(page, ruta.slice(1) || "inicio");
    if (ruta !== "/acceso") {
      const animadas = page.locator("main .revelar");
      await expect.poll(() => animadas.count()).toBeGreaterThan(0);
      for (const elemento of await animadas.all()) await expect(elemento).toHaveCSS("opacity", "1");
    }
    // El foco debe recorrer controles reales sin exigir ratón.
    await page.keyboard.press("Tab");
    await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).not.toBe("BODY");
  });
}

test("RF-SW-16 / RNF-08: aparición, desaparición y navegación pública completa con teclado", async ({ page }) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const ruta of PUBLICAS.filter((r) => r !== "/acceso")) {
    await page.goto(ruta);
    const primera = page.locator("main .revelar").first();
    await expect(primera).toBeAttached();
    await primera.scrollIntoViewIfNeeded();
    await expect(primera).toHaveClass(/visible/);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const fuera = await primera.evaluate((el) => el.getBoundingClientRect().bottom <= 0);
    if (fuera) await expect(primera).not.toHaveClass(/visible/);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(primera).toHaveCSS("opacity", "1");
    await page.emulateMedia({ reducedMotion: "no-preference" });
  }
  await page.goto("/");
  for (const ruta of PUBLICAS.slice(1)) {
    const menu = page.getByRole("button", { name: "Abrir menú" });
    if (await menu.isVisible()) {
      await enfocarConTab(page, 'button[aria-label="Abrir menú"]');
      await page.keyboard.press("Enter");
      await expect(menu).toHaveAttribute("aria-expanded", "true");
    }
    const selector =
      ruta === "/acceso"
        ? 'header a[href="/acceso"]'
        : `${(await menu.isVisible()) ? ".sh-movil" : ".sh-nav"} a[href="${ruta}"]`;
    await enfocarConTab(page, selector);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`${ruta}$`));
  }
});

test("RF-SW-05 / RNF-08: detalle del producto y regreso al catálogo con teclado", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/productos");
  await enfocarConTab(page, ".prod-t:first-child");
  await page.keyboard.press("Enter");
  await expect(page.locator(".det-lay")).toBeVisible();
  await revisar(page, "detalle");
  await expect(page.getByRole("heading", { name: "Productos Recomendados" })).toBeVisible();
  const volver = page.getByRole("link", { name: "Volver al catálogo" });
  // El enlace debe ser alcanzable desde el orden natural del documento.
  await enfocarConTab(page, 'a.btn[href="/productos"]');
  await expect(volver).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/productos$/);
});

for (const usuario of ["ejemplo.08", "ejemplo.09", "ejemplo.10"]) {
  test(`RF-SW-26 / RNF-08: revisión integral del panel con ${usuario}`, async ({ page }) => {
    test.setTimeout(180_000);
    const respuesta = await page.request.post("/api/auth/sitio/sign-in/username", {
      headers: { origin: "http://localhost:3000" },
      data: { usuario, clave: process.env.CLAVE_DEMO },
    });
    expect(respuesta.ok()).toBe(true);
    await page.goto(usuario === "ejemplo.08" ? "/panel/resumen" : "/panel/documentos");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
    for (const seccion of usuario === "ejemplo.08" ? SECCIONES : ["documentos"]) {
      if (new URL(page.url()).pathname !== `/panel/${seccion}`) {
        const menu = page.getByRole("button", { name: "Menú", exact: true });
        if (await menu.isVisible()) {
          await enfocarConTab(page, 'button[aria-label="Menú"]');
          await page.keyboard.press("Enter");
          await expect(menu).toHaveAttribute("aria-expanded", "true");
        }
        await enfocarConTab(page, `.lado-nav a[href="/panel/${seccion}"]`);
        await page.keyboard.press("Enter");
        await expect(page).toHaveURL(new RegExp(`/panel/${seccion}$`));
      }
      await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
      if (seccion === "contenido") {
        const cajas = await Promise.all(
          ["Misión", "Visión", "Historia"].map((nombre) =>
            page.getByRole("region", { name: nombre, exact: true }).boundingBox(),
          ),
        );
        expect(cajas.every(Boolean)).toBe(true);
        if (page.viewportSize()!.width > 720) {
          expect(cajas[1]!.y).toBe(cajas[0]!.y);
          expect(cajas[2]!.y).toBe(cajas[0]!.y);
        } else {
          expect(cajas[1]!.y).toBeGreaterThan(cajas[0]!.y);
          expect(cajas[2]!.y).toBeGreaterThan(cajas[1]!.y);
        }
      }
      await revisar(page, `${usuario}-${seccion}`);
    }
    const reducir = page.getByRole("button", { name: "Reducir el menú a íconos" });
    if (await reducir.isVisible()) {
      await enfocarConTab(page, 'button[aria-label="Reducir el menú a íconos"]');
      await page.keyboard.press("Enter");
      await expect(page.getByRole("button", { name: "Expandir el menú", exact: true })).toBeVisible();
      await revisar(page, `${usuario}-menu-reducido`);
    }
  });
}

test("RNF-01 / RNF-08: revisión de Usuarios del sitio con Gerencia", async ({ page }) => {
  const respuesta = await page.request.post("/api/auth/sitio/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario: "ejemplo.01", clave: process.env.CLAVE_DEMO },
  });
  expect(respuesta.ok()).toBe(true);
  await page.goto("/panel/usuarios");
  await revisar(page, "usuarios");
});
