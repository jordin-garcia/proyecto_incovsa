import { expect } from "@playwright/test";
import { test, MISION } from "./datos";
import AxeBuilder from "@axe-core/playwright";
import sharp from "sharp";

try {
  process.loadEnvFile();
} catch {
  /* La CI proporciona las variables. */
}

test.beforeEach(async ({ context }) => {
  const respuesta = await context.request.post("/api/auth/sitio/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario: "ejemplo.08", clave: process.env.CLAVE_DEMO },
  });
  expect(respuesta.ok()).toBe(true);
});
test("RF-SW-23 / RNF-08: contenido institucional conserva bloques, borradores y accesibilidad", async ({
  page,
}, info) => {
  await page.goto("/panel/contenido");
  await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
  await expect(page.getByRole("heading", { name: "Inicio y Quiénes somos" })).toBeVisible();
  for (const bloque of [
    "Portada",
    "Logotipo de INCOVSA",
    "Misión",
    "Visión",
    "Historia",
    "Valores",
    "Logotipo de Inquiserca",
  ])
    await expect(page.getByRole("heading", { name: bloque, exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Imágenes del sitio", exact: true })).toHaveCount(0);
  const mision = page.getByRole("region", { name: "Misión", exact: true });
  const original = await mision.getByLabel("Texto", { exact: true }).inputValue();
  expect(original).toBe(MISION);
  await mision.getByLabel("Texto", { exact: true }).fill("Borrador sin publicar");
  await page.waitForTimeout(5500);
  await expect(mision.getByLabel("Texto", { exact: true })).toHaveValue("Borrador sin publicar");
  await mision.getByLabel("Texto", { exact: true }).fill(original);
  const logotipo = page.getByRole("region", { name: "Logotipo de INCOVSA", exact: true });
  const imagenAnterior = await logotipo.getByRole("img").getAttribute("src");
  let publicaciones = 0;
  page.on("request", (r) => {
    if (r.url().endsWith("/api/imagenes/publicar")) publicaciones++;
  });
  const arrastre = await page.evaluateHandle(() => new DataTransfer());
  await logotipo.locator("[data-galeria]").dispatchEvent("drop", { dataTransfer: arrastre });
  await arrastre.dispose();
  await expect(logotipo.getByRole("img")).toHaveAttribute("src", imagenAnterior!);
  for (const nombre of ["Logotipo de INCOVSA", "Logotipo de Inquiserca"]) {
    const campo = page.getByRole("region", { name: nombre, exact: true }).locator("[data-galeria]");
    const limites = await campo.boundingBox();
    const imagen = campo.getByRole("img");
    const vista = await imagen.boundingBox();
    expect(vista!.x).toBeGreaterThanOrEqual(limites!.x);
    expect(vista!.x + vista!.width).toBeLessThanOrEqual(limites!.x + limites!.width);
    const aviso = await campo.locator("[data-aviso]").boundingBox();
    expect(vista!.y + vista!.height).toBeLessThanOrEqual(aviso!.y);
    await expect(campo.locator("[data-aviso]")).toHaveCSS("font-size", "13px");
    await expect(campo.locator("[data-aviso]")).toHaveCSS("border-radius", "10px");
  }
  expect(publicaciones).toBe(0);
  expect(
    (await new AxeBuilder({ page }).analyze()).violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  await mision.getByLabel("Texto", { exact: true }).evaluate((elemento) => {
    elemento.scrollTop = 0;
    elemento.blur();
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await info.attach("contenido-institucional", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
  await page.screenshot({
    fullPage: true,
    path: `pruebas-e2e/panel/evidencias/aplicacion-contenido-${page.viewportSize()!.width}.png`,
  });
});
test("RF-SW-25: el permiso se exige también al abrir la sección directamente", async ({ page, context }) => {
  await context.clearCookies();
  const respuesta = await context.request.post("/api/auth/sitio/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario: "ejemplo.09", clave: process.env.CLAVE_DEMO },
  });
  expect(respuesta.ok()).toBe(true);
  await page.goto("/panel/contenido");
  await expect(page.getByRole("heading", { name: "Sin acceso a este módulo" })).toBeVisible();
  if (await page.getByRole("button", { name: "Menú", exact: true }).isVisible())
    await page.getByRole("button", { name: "Menú", exact: true }).click();
  await expect(
    page
      .getByRole("navigation", { name: "Módulos" })
      .getByRole("link", { name: "Contenido institucional", exact: true }),
  ).toHaveCount(0);
  expect(
    (
      await context.request.post("/api/imagenes/publicar", {
        headers: { origin: "http://localhost:3000" },
        multipart: { datos: JSON.stringify({ bloque: "mision", texto: "No publicar", imagenes: [] }) },
      })
    ).status(),
  ).toBe(403);
});

test("RF-SW-23 / RNF-05: publica una imagen de 5 MB y limpia la imagen retirada", async ({ page }, info) => {
  const bloques = { telefono: "Misión", tableta: "Visión", escritorio: "Historia" };
  const nombre = bloques[info.project.name as keyof typeof bloques];
  await page.goto("/panel/contenido");
  const bloque = page.getByRole("region", { name: nombre, exact: true });
  const original = await bloque.getByLabel("Texto", { exact: true }).inputValue();
  const total = await bloque.getByRole("img").count();
  const png = await sharp({ create: { width: 16, height: 16, channels: 4, background: "transparent" } })
    .png()
    .toBuffer();
  const archivo = Buffer.alloc(5 * 1024 * 1024);
  png.copy(archivo);
  await bloque
    .getByLabel(`${nombre}: elegir imágenes`)
    .setInputFiles({ name: "foto.png", mimeType: "image/png", buffer: archivo });
  await bloque.getByLabel("Texto", { exact: true }).fill(`${original}\nPrueba de publicación DM-04`);
  const respuesta = page.waitForResponse(
    (r) => r.url().endsWith("/api/imagenes/publicar") && r.request().method() === "POST",
  );
  await bloque.getByRole("button", { name: "Guardar y publicar", exact: true }).click();
  expect((await respuesta).ok()).toBe(true);
  await expect(bloque).toHaveAttribute("aria-busy", "false");
  await page.reload();
  await expect(bloque.getByLabel("Texto", { exact: true })).toHaveValue(
    `${original}\nPrueba de publicación DM-04`.trim(),
  );
  const url = await bloque.getByRole("img").last().getAttribute("src");
  expect(url).toMatch(/^\/api\/imagenes\/[a-f0-9-]+\.webp$/);
  expect((await page.request.get(url!)).ok()).toBe(true);
  await bloque.getByRole("button", { name: `Quitar la imagen ${total + 1}`, exact: true }).click();
  await bloque.getByLabel("Texto", { exact: true }).fill(original);
  const limpieza = page.waitForResponse(
    (r) => r.url().endsWith("/api/imagenes/publicar") && r.request().method() === "POST",
  );
  await bloque.getByRole("button", { name: "Guardar y publicar", exact: true }).click();
  expect((await limpieza).ok()).toBe(true);
  expect((await page.request.get(url!)).status()).toBe(404);
});

test("RF-SW-07: el resumen muestra estados y enlaces de las secciones permitidas", async ({ page }, info) => {
  await page.goto("/panel/resumen");
  await expect(page.getByRole("heading", { name: "Hola, Usuario de ejemplo 08" })).toBeVisible();
  const tarjetas = page.locator("main .mod-t");
  await expect(tarjetas).toHaveCount(6);
  await expect(tarjetas.first()).toContainText("Contenido institucional");
  await expect(tarjetas.first().locator(".ic")).toHaveCSS("width", "44px");
  await expect(tarjetas.first().locator(".ic")).toHaveCSS("border-radius", "12px");
  expect(
    (await new AxeBuilder({ page }).analyze()).violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  await info.attach("resumen-panel", { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
  await page.screenshot({
    fullPage: true,
    path: `pruebas-e2e/panel/evidencias/aplicacion-resumen-${page.viewportSize()!.width}.png`,
  });
});

test("RF-SW-23: un borrador de portada o historia no cambia la etiqueta publicada", async ({ page }) => {
  await page.goto("/panel/contenido");
  for (const [nombre, inicial] of [
    ["Portada", "Fotografía de la empresa"],
    ["Historia", "Sin contenido"],
  ]) {
    const bloque = page.getByRole("region", { name: nombre, exact: true });
    await expect(bloque.locator(".chip")).toHaveText(inicial!);
    const color = await bloque.locator(".chip").getAttribute("class");
    await bloque.getByLabel(`${nombre}: elegir imágenes`).setInputFiles("public/marca/foto-reunion.webp");
    await expect(bloque.getByRole("img")).toHaveCount(1);
    await expect(bloque.locator(".chip")).toHaveText(inicial!);
    await expect(bloque.locator(".chip")).toHaveAttribute("class", color!);
  }
});

test("RF-SW-23 / CU-07: publicar misión e imagen actualiza Inicio para una visita sin sesión", async ({
  page,
  browser,
}, info) => {
  // Hasta cinco imágenes a intervalos de 5 s: se permite recorrer el ciclo para ver la recién publicada.
  test.setTimeout(60_000);
  await page.goto("/panel/contenido");
  const bloque = page.getByRole("region", { name: "Misión", exact: true });
  const textoAnterior = await bloque.getByLabel("Texto", { exact: true }).inputValue();
  const imagenesAnteriores = await bloque
    .getByRole("img")
    .evaluateAll((imgs) => imgs.map((img) => img.getAttribute("src")!));
  const contextoPublico = await browser.newContext({ viewport: page.viewportSize()! });
  try {
    await bloque.getByLabel("Texto", { exact: true }).fill("Misión publicada desde el panel · DM-04");
    await bloque.getByLabel("Misión: elegir imágenes").setInputFiles("public/marca/foto-reunion.webp");
    const respuesta = page.waitForResponse(
      (r) => r.url().endsWith("/api/imagenes/publicar") && r.request().method() === "POST",
    );
    await bloque.getByRole("button", { name: "Guardar y publicar", exact: true }).click();
    expect((await respuesta).ok()).toBe(true);
    await expect(bloque).toHaveAttribute("aria-busy", "false");
    const imagen = await bloque.getByRole("img").last().getAttribute("src");
    const publico = await contextoPublico.newPage();
    const errores: string[] = [];
    publico.on("pageerror", (error) => errores.push(error.message));
    await publico.goto("/");
    const mision = publico.locator(".mv-fila").first();
    await expect(mision.locator(".mv-txt")).toContainText("Misión publicada desde el panel · DM-04");
    await expect(mision.locator(`img[src="${imagen}"]`)).toBeAttached();
    await mision.scrollIntoViewIfNeeded();
    await expect(mision.locator(`img[src="${imagen}"]`)).toHaveClass(/on/, { timeout: 25_000 });
    await expect
      .poll(() =>
        mision
          .locator(`img[src="${imagen}"]`)
          .evaluate((img) => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0),
      )
      .toBe(true);
    const texto = (await mision.locator(".mv-txt").boundingBox())!;
    const galeria = (await mision.locator(".mv-gal").boundingBox())!;
    if (page.viewportSize()!.width > 900) expect(texto.x + texto.width).toBeLessThanOrEqual(galeria.x);
    else expect(texto.y + texto.height).toBeLessThanOrEqual(galeria.y);
    expect(errores).toEqual([]);
    await publico.screenshot({
      fullPage: false,
      path: `pruebas-e2e/panel/evidencias/publicacion-inicio-${page.viewportSize()!.width}.png`,
    });
    await info.attach("publicacion-en-inicio", { body: await publico.screenshot(), contentType: "image/png" });
  } finally {
    await contextoPublico.close();
    const restauracion = await page.request.post("/api/imagenes/publicar", {
      headers: { origin: "http://localhost:3000" },
      multipart: { datos: JSON.stringify({ bloque: "mision", texto: textoAnterior, imagenes: imagenesAnteriores }) },
    });
    expect(restauracion.ok()).toBe(true);
  }
});

test("RF-SW-23 / RF-SW-24: reemplazar INCOVSA actualiza cabecera y pie públicos", async ({ page, browser }, info) => {
  await page.goto("/panel/contenido");
  const bloque = page.getByRole("region", { name: "Logotipo de INCOVSA", exact: true });
  const original = (await bloque.getByRole("img").getAttribute("src"))!;
  const copiaAnterior = original.startsWith("/marca/") ? null : await (await page.request.get(original)).body();
  const contextoPublico = await browser.newContext({ viewport: page.viewportSize()! });
  try {
    const respuesta = page.waitForResponse(
      (r) => r.url().endsWith("/api/imagenes/publicar") && r.request().method() === "POST",
    );
    await bloque.getByLabel("Logotipo de INCOVSA: elegir imágenes").setInputFiles("public/marca/incovsa-quimicos.webp");
    expect((await respuesta).ok()).toBe(true);
    await expect(bloque).toHaveAttribute("aria-busy", "false");
    const imagen = await bloque.getByRole("img").getAttribute("src");
    expect(imagen).toMatch(/^\/api\/imagenes\/[a-f0-9-]+\.webp$/);
    const publico = await contextoPublico.newPage();
    await publico.goto("/");
    await expect(publico.locator("header img")).toHaveAttribute("src", imagen!);
    await expect(publico.locator("footer img")).toHaveAttribute("src", imagen!);
    await expect(publico.locator("footer .logo-placa")).toHaveCount(1);
    expect((await publico.request.get(imagen!)).ok()).toBe(true);
    await publico.screenshot({
      fullPage: true,
      path: `pruebas-e2e/panel/evidencias/logotipo-publico-${page.viewportSize()!.width}.png`,
    });
    await info.attach("logotipo-publico", { body: await publico.screenshot(), contentType: "image/png" });
  } finally {
    await contextoPublico.close();
    const formulario = new FormData();
    formulario.set("datos", JSON.stringify({ bloque: "logo", texto: "", imagenes: copiaAnterior ? [0] : [] }));
    if (copiaAnterior)
      formulario.append("imagenes", new File([new Uint8Array(copiaAnterior)], "logo.webp", { type: "image/webp" }));
    expect(
      (
        await page.request.post("/api/imagenes/publicar", {
          headers: { origin: "http://localhost:3000" },
          multipart: formulario,
        })
      ).ok(),
    ).toBe(true);
  }
});
