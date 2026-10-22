import { expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { test } from "../panel/datos";
import { readFile } from "node:fs/promises";

async function cargarImagenes(page: import("@playwright/test").Page) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator("img").evaluateAll(async (elementos) => {
    await Promise.all(
      elementos.map(async (elemento) => {
        const imagen = elemento as HTMLImageElement;
        imagen.loading = "eager";
        await imagen.decode();
      }),
    );
  });
}

test("RF-SW-02 / CAM-79 / RNF-08: secciones, fondos, pie y accesibilidad de Quiénes somos", async ({ page }, info) => {
  await page.goto("/nosotros");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Más de treinta años abasteciendo de químicos a la industria del país",
  );
  await expect(page.locator("main h2")).toHaveText([
    "De tenería a distribuidor de productos químicos",
    "Misión y visión",
    "Lo que nos guía",
    "Dos mercados, la misma calidad de producto",
    "Dos empresas del mismo grupo, una sola identidad",
  ]);
  await expect(page.locator("main")).not.toContainText(/P-19|La historia la redacta|Faltan las imágenes/);
  await expect(page.getByRole("contentinfo")).toBeAttached();
  const secciones = page.locator("main > section");
  for (const indice of [2, 4]) await expect(secciones.nth(indice)).toHaveCSS("background-color", "rgb(3, 31, 11)");
  for (const indice of [1, 3, 5])
    expect(await secciones.nth(indice).evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(
      "rgb(3, 31, 11)",
    );
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    (await new AxeBuilder({ page }).analyze()).violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  await cargarImagenes(page);
  await page.screenshot({
    path: `pruebas-e2e/sitio/evidencias/DM-06/aplicacion-vacio-${info.project.name}.png`,
    fullPage: true,
  });
});

test("RF-SW-02 / CAM-80: ambos bloques alternan y quitar Inquiserca desde el panel deja solo INCOVSA", async ({
  page,
  context,
}, info) => {
  await page.goto("/nosotros");
  await expect(page.locator(".banner-logos")).toHaveCount(2);
  for (const bloque of await page.locator(".banner-logos").all()) {
    await expect(bloque.locator("img")).toHaveCount(2);
    await expect(bloque).toHaveClass(/alterna/);
    const imagenes = bloque.locator("img");
    // Muestrea el ciclo real, incluidos los dos logotipos en el mismo lugar.
    await bloque.scrollIntoViewIfNeeded();
    await expect
      .poll(() => imagenes.nth(0).evaluate((el) => Number(getComputedStyle(el).opacity)), { timeout: 10000 })
      .toBeGreaterThan(0.95);
    await expect
      .poll(() => imagenes.nth(1).evaluate((el) => Number(getComputedStyle(el).opacity)), { timeout: 10000 })
      .toBeGreaterThan(0.95);
    const cajas = await imagenes.evaluateAll((imgs) =>
      imgs.map((elemento) => {
        const img = elemento as HTMLImageElement;
        return { x: img.offsetLeft, y: img.offsetTop, ancho: img.offsetWidth, alto: img.offsetHeight };
      }),
    );
    expect(cajas[0]).toEqual(cajas[1]);
  }
  const acceso = await context.request.post("/api/auth/sitio/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario: "ejemplo.08", clave: process.env.CLAVE_DEMO },
  });
  expect(acceso.ok()).toBe(true);
  await page.goto("/panel/contenido");
  await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
  const inquiserca = page.getByRole("region", { name: "Logotipo de Inquiserca", exact: true });
  await inquiserca.getByRole("button", { name: /Quitar/ }).click();
  await expect(inquiserca.getByRole("img")).toHaveCount(0);
  await page.goto("/nosotros");
  for (const bloque of await page.locator(".banner-logos").all()) {
    await expect(bloque.locator("img")).toHaveCount(1);
    await expect(bloque.locator("img")).toHaveAttribute("alt", "INCOVSA Químicos");
    await expect(bloque).not.toHaveClass(/alterna/);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await cargarImagenes(page);
  await page.screenshot({
    path: `pruebas-e2e/sitio/evidencias/DM-06/aplicacion-sin-inquiserca-${info.project.name}.png`,
    fullPage: true,
  });
});

test("RF-SW-29 / RF-SW-16: cinco valores pendientes y presentación dinámica", async ({ page }) => {
  await page.goto("/nosotros");
  await expect(page.locator(".valor-t")).toHaveCount(5);
  await expect(page.locator(".valor-t.vacio-v")).toHaveCount(5);
  await expect(page.locator(".valores-fila")).toContainText("Imagen del valor pendiente de INCOVSA");
  const valor = page.locator(".valor-t").first();
  await valor.scrollIntoViewIfNeeded();
  await expect(valor).toHaveClass(/visible/);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(valor).not.toHaveClass(/visible/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(valor).toHaveCSS("opacity", "1");
  await expect(page.locator(".banner-logos img").first()).toHaveCSS("animation-name", "none");
});

test("RF-SW-02 / RF-SW-29 / RN-56: historia y cinco imágenes publicadas conservan orden, fila y ausencia de textos", async ({
  page,
  context,
}, info) => {
  const acceso = await context.request.post("/api/auth/sitio/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario: "ejemplo.08", clave: process.env.CLAVE_DEMO },
  });
  expect(acceso.ok()).toBe(true);
  const imagen = await readFile("public/marca/foto-equipo.webp");
  const publicar = async (bloque: string, texto: string, total: number) => {
    const formulario = new FormData();
    formulario.set("datos", JSON.stringify({ bloque, texto, imagenes: Array.from({ length: total }, (_, i) => i) }));
    for (let i = 0; i < total; i++)
      formulario.append("imagenes", new File([new Uint8Array(imagen)], `imagen-${i}.webp`, { type: "image/webp" }));
    const respuesta = await context.request.post("/api/imagenes/publicar", {
      headers: { origin: "http://localhost:3000" },
      multipart: formulario,
    });
    expect(respuesta.ok()).toBe(true);
    return (await respuesta.json()).datos.imagenes as string[];
  };
  const urls = await publicar("valores", "", 5);
  await publicar("historia", "Historia de prueba DM-06\nSegunda línea <script>texto escapado</script>", 2);
  await page.goto("/nosotros");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".historia-texto")).toHaveText(
    "Historia de prueba DM-06\nSegunda línea <script>texto escapado</script>",
  );
  await expect(page.locator(".hist-gal img")).toHaveCount(2);
  await expect(page.locator(".valor-t.vacio-v")).toHaveCount(0);
  await expect(page.locator(".valor-t img")).toHaveCount(5);
  await expect(page.locator(".valores-fila")).toHaveText("");
  for (let i = 0; i < 5; i++) {
    await expect(page.locator(".valor-t img").nth(i)).toHaveAttribute("src", urls[i]!);
    await expect(page.locator(".valor-t img").nth(i)).toHaveAttribute("alt", `Valor ${i + 1} de INCOVSA`);
  }
  const alturas = await page
    .locator(".valor-t")
    .evaluateAll((elementos) => elementos.map((el) => el.getBoundingClientRect().top));
  expect(new Set(alturas).size).toBe(1);
  const fila = page.getByRole("region", { name: "Valores", exact: true });
  await fila.focus();
  await page.keyboard.press("End");
  await expect(fila).toBeFocused();
  expect(
    (await new AxeBuilder({ page }).analyze()).violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  await cargarImagenes(page);
  await page.screenshot({
    path: `pruebas-e2e/sitio/evidencias/DM-06/aplicacion-contenido-${info.project.name}.png`,
    fullPage: true,
  });
});
