import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { conGaleriasDePrueba } from "./galerias";

test("RF-SW-01 / RF-SW-27: Inicio informativo conserva secciones, cifras y textos aprobados", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Química que sostiene a la industria guatemalteca");
  await expect(
    page.getByText(
      "Compra, venta y distribución de productos químicos para nueve industrias del país. Más de treinta años abasteciendo al sector industrial y artesanal, con presencia en todo el territorio.",
    ),
  ).toBeVisible();
  await expect(page.locator("main h2")).toHaveText([
    "Cada industria tiene su propio conjunto de productos",
    "Misión y visión",
    "Visítenos",
    "¿Necesita un producto que no aparece en el catálogo?",
  ]);
  await expect(page.locator(".ind-rejilla > a")).toHaveCount(9);
  await expect(page.getByText("sedes con bodega de distribución")).toBeVisible();
  await expect(page.locator("main")).not.toContainText(/Escuintla|Catálogo informativo|inventario|Gerencia|Soporte/);
  await expect(page.getByRole("link", { name: "Acceso personal" })).toHaveAttribute("href", "/acceso");
  await expect(page.getByRole("link", { name: "Enviar una solicitud" })).toHaveAttribute("href", "/contacto");
});

test("RF-SW-15 / RF-SW-22 / RF-SW-24: pie público y mapas solo de las dos oficinas", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("contentinfo")).toBeAttached();
  // Sin logotipo subido: a color en la cabecera y blanco, sin placa, sobre el verde del pie (sitio.js › logoOscuro()).
  await expect(page.locator("header img")).toHaveAttribute("src", "/marca/incovsa-quimicos.webp");
  await expect(page.locator("footer img")).toHaveCount(1);
  await expect(page.locator("footer img")).toHaveAttribute("src", "/marca/incovsa-quimicos-blanco.webp");
  await expect(page.locator("footer .logo-placa")).toHaveCount(0);
  const enlacesContacto = page.locator("footer .pie-rej > div").last().locator("a");
  await expect(enlacesContacto).toHaveCount(4);
  await expect(enlacesContacto.nth(0)).toContainText("@");
  await expect(enlacesContacto.nth(1)).toContainText("@");
  await expect(enlacesContacto.nth(2)).toContainText("WhatsApp Quetzaltenango");
  await expect(enlacesContacto.nth(3)).toContainText("WhatsApp Guatemala");
  await expect(page.locator("iframe")).toHaveCount(2);
  // Mapas responsivos con la proporción 4:3 del prototipo (estilos.css › .mapa).
  for (const caja of await page
    .locator("iframe.mapa")
    .evaluateAll((mapas) => mapas.map((mapa) => mapa.getBoundingClientRect())))
    expect(Math.abs(caja.height - (caja.width * 3) / 4)).toBeLessThan(2);
  // Teléfono y correo de cada sede en letra monoespaciada, como el prototipo (sitio.js › sedes()).
  for (const tarjeta of await page.locator(".sede-t").all()) {
    await expect(tarjeta.locator(".dato .mono")).toHaveCount(2);
  }
  for (const nombre of ["Quetzaltenango", "Guatemala"]) {
    const mapa = page.getByTitle(`Mapa de la sede de ${nombre}`, { exact: true });
    await expect(mapa).toHaveAttribute("src", /^https:\/\/www.google.com\/maps\/embed\?pb=/);
    await expect(mapa).toHaveAttribute("loading", "lazy");
    await expect(mapa).toHaveAttribute("allowfullscreen", "");
    await expect(mapa).toHaveAttribute("referrerpolicy", "strict-origin-when-cross-origin");
  }
  await expect(page.locator("body")).not.toContainText("Escuintla");
});

test("RF-SW-08 / RNF-08: menú responsivo, ausencia de desbordamiento y accesibilidad", async ({ page }) => {
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Abrir menú" });
  if (await menu.isVisible()) {
    await menu.click();
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("navigation", { name: "Menú", exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toHaveAttribute("aria-expanded", "false");
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
  const resultado = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(resultado.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
});

test("RF-SW-16: tarjetas aparecen al entrar en pantalla y desaparecen al salir", async ({ page }) => {
  await page.goto("/");
  const portada = page.locator(".hero-foto");
  await expect(portada).toHaveClass(/visible/);
  const tarjeta = page.locator(".ind-rejilla > a").first();
  await tarjeta.scrollIntoViewIfNeeded();
  await expect(tarjeta).toHaveClass(/visible/);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(portada).not.toHaveClass(/visible/);
  await expect(tarjeta).not.toHaveClass(/visible/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(tarjeta).toHaveCSS("opacity", "1");
  await expect(portada).toHaveCSS("opacity", "1");
});

test("RN-56 / RNF-17: cinco imágenes rotan cada 5 s, una queda fija y las secundarias cargan después", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await conGaleriasDePrueba(async () => {
    // Retener la primera imagen impide window.load: ninguna secundaria debe pedirse todavía.
    let liberar!: () => void;
    const bloqueo = new Promise<void>((resolver) => {
      liberar = resolver;
    });
    const peticiones: string[] = [];
    page.on("request", (peticion) => {
      if (peticion.url().includes("dm02=")) peticiones.push(peticion.url());
    });
    await page.route("**/marca/foto-equipo.webp?dm02=1", async (ruta) => {
      await bloqueo;
      await ruta.continue();
    });
    try {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await expect(page.locator("header button")).toBeAttached();
      await expect.poll(() => peticiones.some((url) => url.endsWith("dm02=1"))).toBe(true);
      expect(peticiones.filter((url) => /dm02=[2-5]$/.test(url))).toEqual([]);
      await expect(page.locator(".hero [data-galeria] img")).toHaveCount(1);
    } finally {
      liberar();
    }
    await page.waitForLoadState("load");
    const portada = page.locator(".hero [data-galeria]");
    const mision = page.locator(".mv [data-galeria]");
    await expect(portada.locator("img")).toHaveCount(5);
    await expect(portada.locator("img").first()).toHaveAttribute("fetchpriority", "high");
    for (let indice = 1; indice < 5; indice++)
      await expect(portada.locator("img").nth(indice)).toHaveAttribute("loading", "lazy");
    await expect.poll(() => peticiones.filter((url) => /dm02=[2-5]$/.test(url)).length).toBe(4);
    await expect(mision.locator("img")).toHaveCount(1);
    await expect(page.locator(".mv-sin")).toHaveCount(1);
    // Un reloj controlado elimina esperas de 25 segundos para recorrer el ciclo completo.
    await page.clock.install();
    await page.reload();
    await expect(portada.locator("img")).toHaveCount(5);
    await page.clock.pauseAt(new Date(Date.now() + 1000));
    const inicial = Number(await portada.getAttribute("data-actual"));
    for (let paso = 1; paso <= 5; paso++) {
      await page.clock.runFor(5000);
      await expect(portada).toHaveAttribute("data-actual", String((inicial + paso) % 5));
      await expect(mision).toHaveAttribute("data-actual", "0");
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    const detenida = await portada.getAttribute("data-actual");
    await page.clock.runFor(10_000);
    await expect(portada).toHaveAttribute("data-actual", detenida!);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.clock.runFor(5000);
    await expect(portada).not.toHaveAttribute("data-actual", detenida!);
  });
});
