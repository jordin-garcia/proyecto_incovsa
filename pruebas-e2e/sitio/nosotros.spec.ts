import { expect, type BrowserContext } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { test } from "../panel/datos";
import { readFile } from "node:fs/promises";
import { capturaEvidencia } from "../comunes/evidencia";
import { irA } from "../comunes/navegacion";

async function publicarBloque(contexto: BrowserContext, bloque: string, texto: string, total: number) {
  const imagen = await readFile("public/marca/foto-equipo.webp");
  const formulario = new FormData();
  formulario.set("datos", JSON.stringify({ bloque, texto, imagenes: Array.from({ length: total }, (_, i) => i) }));
  for (let i = 0; i < total; i++)
    formulario.append("imagenes", new File([new Uint8Array(imagen)], `imagen-${i}.webp`, { type: "image/webp" }));
  return contexto.request.post("/api/imagenes/publicar", {
    headers: { origin: "http://localhost:3000" },
    multipart: formulario,
  });
}

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
  await irA(page, "/nosotros");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Más de treinta años abasteciendo de químicos a la industria del país",
  );
  await expect(page.locator("main h2")).toHaveText([
    "De tenería a distribuidor de productos químicos",
    "Misión y visión",
    "Dos mercados, la misma calidad de producto",
    "Dos empresas del mismo grupo, una sola identidad",
  ]);
  // JG-34 (06/11, pedido del Ing. William): sin la sección de valores.
  await expect(page.getByText("Lo que nos guía")).toHaveCount(0);
  await expect(page.locator(".valores-fila, .valor-t")).toHaveCount(0);
  await expect(page.locator("main")).not.toContainText(/P-19|La historia la redacta|Faltan las imágenes/);
  await expect(page.getByRole("contentinfo")).toBeAttached();
  // JG-34: los fondos siguen alternándose: Historia claro, Misión y visión verde, A quién servimos claro e
  // INCOVSA e Inquiserca verde.
  const seccion = (titulo: string) =>
    page.locator("main > section").filter({ has: page.getByRole("heading", { level: 2, name: titulo, exact: true }) });
  for (const titulo of ["Misión y visión", "Dos empresas del mismo grupo, una sola identidad"])
    await expect(seccion(titulo)).toHaveCSS("background-color", "rgb(3, 31, 11)");
  for (const titulo of [
    "De tenería a distribuidor de productos químicos",
    "Dos mercados, la misma calidad de producto",
  ])
    expect(await seccion(titulo).evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe("rgb(3, 31, 11)");
  // JG-34: el título del grupo sigue legible sobre el verde.
  await expect(seccion("Dos empresas del mismo grupo, una sola identidad").locator("h2")).toHaveCSS(
    "color",
    "rgb(255, 255, 255)",
  );
  // JG-34: los párrafos van justificados; los títulos no.
  for (const parrafo of [
    page.locator(".banner-nos p:not(.eyebrow)"),
    page.locator(".mv-txt p:not(.eyebrow)").first(),
    page.locator(".mercado p").first(),
    page.locator(".grupo p:not(.eyebrow)"),
  ])
    await expect(parrafo).toHaveCSS("text-align", "justify");
  await expect(page.locator("main h2").first()).not.toHaveCSS("text-align", "justify");
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
  await capturaEvidencia(page, `pruebas-e2e/sitio/evidencias/DM-06/aplicacion-vacio-${info.project.name}.png`);
});

test("RF-SW-02 / CAM-80: ambos bloques alternan y quitar Inquiserca desde el panel deja solo INCOVSA", async ({
  page,
  context,
}, info) => {
  await irA(page, "/nosotros");
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
  await irA(page, "/panel/contenido");
  await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
  const inquiserca = page.getByRole("region", { name: "Logotipo de Inquiserca", exact: true });
  await inquiserca.getByRole("button", { name: /Quitar/ }).click();
  await expect(inquiserca.getByRole("img")).toHaveCount(0);
  await irA(page, "/nosotros");
  for (const bloque of await page.locator(".banner-logos").all()) {
    await expect(bloque.locator("img")).toHaveCount(1);
    await expect(bloque.locator("img")).toHaveAttribute("alt", "INCOVSA Químicos");
    await expect(bloque).not.toHaveClass(/alterna/);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await cargarImagenes(page);
  await capturaEvidencia(page, `pruebas-e2e/sitio/evidencias/DM-06/aplicacion-sin-inquiserca-${info.project.name}.png`);
});

test("RF-SW-16: presentación dinámica de las tarjetas de Quiénes somos", async ({ page }) => {
  await irA(page, "/nosotros");
  const mercado = page.locator(".mercado").first();
  await mercado.scrollIntoViewIfNeeded();
  await expect(mercado).toHaveClass(/visible/);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(mercado).not.toHaveClass(/visible/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(mercado).toHaveCSS("opacity", "1");
  await expect(page.locator(".banner-logos img").first()).toHaveCSS("animation-name", "none");
});

test("RF-SW-02 / RN-56 (06/11): la historia publicada se muestra y los valores ya no se publican ni se muestran", async ({
  page,
  context,
}, info) => {
  const acceso = await context.request.post("/api/auth/sitio/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario: "ejemplo.08", clave: process.env.CLAVE_DEMO },
  });
  expect(acceso.ok()).toBe(true);
  expect((await publicarBloque(context, "valores", "", 5)).ok()).toBe(false);
  const historia = "Historia de prueba DM-06\nSegunda línea <script>texto escapado</script>";
  expect((await publicarBloque(context, "historia", historia, 2)).ok()).toBe(true);
  await irA(page, "/nosotros");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".historia-texto")).toHaveText(historia);
  await expect(page.locator(".historia-texto")).toHaveCSS("text-align", "justify");
  await expect(page.locator(".hist-gal img")).toHaveCount(2);
  await expect(page.locator(".valor-t, .valores-fila")).toHaveCount(0);
  await expect(page.getByRole("img", { name: /^Valor \d de INCOVSA$/ })).toHaveCount(0);
  expect(
    (await new AxeBuilder({ page }).analyze()).violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  await cargarImagenes(page);
  await capturaEvidencia(page, `pruebas-e2e/sitio/evidencias/DM-06/aplicacion-contenido-${info.project.name}.png`);
});

test("RF-SW-01 / RF-SW-02 (06/11): misión y visión solo con texto, solo con imagen o sin nada, en Inicio y Quiénes somos", async ({
  page,
  context,
}, info) => {
  const acceso = await context.request.post("/api/auth/sitio/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario: "ejemplo.08", clave: process.env.CLAVE_DEMO },
  });
  expect(acceso.ok()).toBe(true);
  const fila = (titulo: string) =>
    page.locator(".mv-fila").filter({ has: page.getByRole("heading", { name: titulo }) });
  // Solo texto (los textos aprobados, sin imágenes): una columna, sin recuadro vacío.
  for (const ruta of ["/", "/nosotros"]) {
    await irA(page, ruta);
    await expect(page.locator(".mv-fila")).toHaveCount(2);
    await expect(page.locator(".mv-sin, .mv [data-galeria]")).toHaveCount(0);
    for (const titulo of ["Nuestra misión", "Nuestra visión"]) {
      await expect(fila(titulo)).toHaveClass(/una-col/);
      await expect(fila(titulo).locator(".mv-txt p:not(.eyebrow)")).toHaveCSS("text-align", "justify");
      const [texto, ancho] = await Promise.all([
        fila(titulo)
          .locator(".mv-txt")
          .evaluate((el) => el.getBoundingClientRect().width),
        fila(titulo).evaluate((el) => el.getBoundingClientRect().width),
      ]);
      expect(texto).toBe(ancho);
    }
  }
  // Solo imagen en la misión y nada en la visión.
  expect((await publicarBloque(context, "mision", "", 1)).ok()).toBe(true);
  expect((await publicarBloque(context, "vision", "", 0)).ok()).toBe(true);
  for (const ruta of ["/", "/nosotros"]) {
    await irA(page, ruta);
    await expect(page.locator(".mv-fila")).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "Nuestra visión" })).toHaveCount(0);
    await expect(page.locator(".mv").getByText("Visión", { exact: true })).toHaveCount(0);
    const mision = fila("Nuestra misión");
    await expect(mision).not.toHaveClass(/una-col/);
    await expect(mision.locator(".eyebrow")).toHaveText("Misión");
    await expect(mision.locator(".mv-txt p:not(.eyebrow)")).toHaveCount(0);
    await expect(mision.locator("[data-galeria] img")).toHaveCount(1);
    await expect(page.locator(".mv-sin")).toHaveCount(0);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await cargarImagenes(page);
    await capturaEvidencia(
      page,
      `pruebas-e2e/sitio/evidencias/JG-34/mision-solo-imagen-${ruta === "/" ? "inicio" : "nosotros"}-${info.project.name}.png`,
    );
  }
});
