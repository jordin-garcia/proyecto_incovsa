import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { comprobarEncabezadoModulo } from "./encabezado";
import { abrirMuestra } from "./preparar";

for (const sistema of ["panel", "picking"]) {
  test(`RF-SW-26 / RF-SL-60: armazón de ${sistema}, navegación y preferencia`, async ({ page }, info) => {
    await abrirMuestra(page, `/${sistema}`);
    const lado = page.getByRole("complementary", { includeHidden: true });
    const movil = (page.viewportSize()?.width ?? 0) <= 1024;
    if (movil) {
      await expect(lado).not.toBeInViewport();
      await page.getByRole("button", { name: "Menú", exact: true }).click();
      await expect(lado).toBeInViewport();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        page.viewportSize()!.width,
      );
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
      ).toBe(true);
      await page.keyboard.press("Escape");
      await expect(lado).not.toBeInViewport();
      await page.getByRole("button", { name: "Menú", exact: true }).focus();
      await page.keyboard.press("Enter");
      await expect(lado).toBeInViewport();
      await expect(lado.getByRole("link").first()).toBeFocused();
      await info.attach(`${sistema}-menu-abierto`, { body: await page.screenshot(), contentType: "image/png" });
      await page.keyboard.press("Escape");
      await expect(page.getByRole("button", { name: "Menú", exact: true })).toBeFocused();
    } else {
      await expect(lado).toHaveCSS("width", "264px");
      await info.attach(`${sistema}-expandido`, { body: await page.screenshot(), contentType: "image/png" });
      await expect(page.getByRole("button", { name: "Reducir el menú a íconos" })).toHaveAttribute(
        "title",
        "Reducir el menú a íconos",
      );
      await page.getByRole("button", { name: "Reducir el menú a íconos" }).click();
      await expect(page.getByRole("button", { name: "Expandir el menú" })).toHaveAttribute("title", "Expandir el menú");
      await expect(lado).toHaveCSS("width", "76px");
      await expect(lado.getByRole("link", { name: "Solicitudes", exact: false })).toHaveCount(
        sistema === "panel" ? 1 : 0,
      );
      await info.attach(`${sistema}-reducido`, { body: await page.screenshot(), contentType: "image/png" });
      await page.reload();
      await expect(lado).toHaveCSS("width", "76px");
      await page.getByRole("button", { name: "Expandir el menú" }).click();
      await expect(lado).toHaveCSS("width", "264px");
    }
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // RF-SL-61 (auditoría H-29): la instrucción breve va a la par del título de EncabezadoModulo.
    await comprobarEncabezadoModulo(page);
    await expect(page.getByRole("link", { name: "INCOVSA Químicos", includeHidden: true })).toHaveAttribute(
      "href",
      "/",
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      page.viewportSize()!.width,
    );
  });

  test(`RNF-08: ${sistema} accesible con menú abierto y cerrado`, async ({ page }) => {
    await abrirMuestra(page, `/${sistema}`);
    for (const abrir of [false, true]) {
      if (abrir && (page.viewportSize()?.width ?? 0) <= 1024)
        await page.getByRole("button", { name: "Menú", exact: true }).click();
      const resultado = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      expect(resultado.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
    }
  });
}

test("RF-SL-60: sede solo en módulos aplicables y con varias sedes", async ({ page }) => {
  await abrirMuestra(page, "/picking");
  const sede = page.getByRole("combobox", { name: "Sede", exact: true });
  await expect(sede).toBeVisible();
  await sede.selectOption("GT");
  await expect(sede).toHaveValue("GT");
  for (const modulo of ["bodega", "ruta", "reportes", "facturacion"]) {
    await page.getByRole("combobox", { name: "Módulo" }).selectOption(modulo);
    await expect(sede).toBeVisible();
  }
  for (const modulo of ["configuracion", "tablero"]) {
    await page.getByRole("combobox", { name: "Módulo" }).selectOption(modulo);
    await expect(sede).toHaveCount(0);
  }
  await page.getByRole("combobox", { name: "Módulo" }).selectOption("facturacion");
  await page.getByRole("checkbox", { name: "Quetzaltenango" }).uncheck();
  await page.getByRole("checkbox", { name: "Escuintla" }).uncheck();
  await expect(sede).toHaveCount(0);
  await expect(page.getByRole("banner")).toContainText("Guatemala");
  await abrirMuestra(page, "/panel");
  await expect(sede).toHaveCount(0);
});

test("RNF-01: tipografías locales y paleta exclusiva del prototipo", async ({ page }) => {
  const externas: string[] = [];
  page.on("request", (r) => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(r.url())) externas.push(r.url());
  });
  await abrirMuestra(page, "/picking");
  await page.evaluate(() => document.fonts.ready);
  expect(externas).toEqual([]);
  const estilos = await page.evaluate(() => {
    const raiz = getComputedStyle(document.documentElement);
    return {
      rojoTailwind: raiz.getPropertyValue("--color-red-500"),
      verde: raiz.getPropertyValue("--color-v600").trim(),
      texto: getComputedStyle(document.body).fontFamily,
      titulo: getComputedStyle(document.querySelector("h1")!).fontFamily,
      cifras: getComputedStyle(document.querySelector(".mono")!).fontFamily,
      fuentes: [...document.fonts].map((f) => ({ familia: f.family, estado: f.status })),
      sombraPulso: raiz.getPropertyValue("--shadow-pulso-inicial"),
      sombraContador: raiz.getPropertyValue("--shadow-contador"),
    };
  });
  expect(estilos.rojoTailwind).toBe("");
  expect(estilos.verde.toLowerCase()).toBe("#126c2a");
  expect(estilos.sombraPulso.trim()).not.toBe("");
  expect(estilos.sombraContador.trim()).not.toBe("");
  await expect(page.locator(".sel-flecha")).toHaveCount(3);
  for (const flecha of await page.locator(".sel-flecha").all()) {
    await expect(flecha).toBeVisible();
    await expect(flecha).toHaveAttribute("viewBox", "0 0 12 8");
    await expect(flecha.locator("path")).toHaveAttribute("d", "M1 1.5l5 5 5-5");
    await expect(flecha).toHaveCSS("color", "rgb(84, 85, 84)");
  }
  expect(estilos.texto).toMatch(/Figtree/i);
  expect(estilos.titulo).toMatch(/Poppins/i);
  expect(estilos.cifras).toMatch(/JetBrains/i);
  for (const fuente of [/Figtree/i, /Poppins/i, /JetBrains/i])
    expect(estilos.fuentes.some((f) => fuente.test(f.familia) && f.estado === "loaded")).toBe(true);
});
