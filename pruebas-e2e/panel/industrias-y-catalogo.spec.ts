import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { Client } from "pg";
import sharp from "sharp";
try {
  process.loadEnvFile();
} catch {
  /* La CI proporciona las variables. */
}
test.beforeEach(async ({ context }) => {
  expect(
    (
      await context.request.post("/api/auth/sitio/sign-in/username", {
        headers: { origin: "http://localhost:3000" },
        data: { usuario: "ejemplo.08", clave: process.env.CLAVE_DEMO },
      })
    ).ok(),
  ).toBe(true);
});

test("RF-SW-07 / RN-56: guardar descripción y galería publica la industria sin perder los datos anteriores", async ({
  page,
}) => {
  const conexion = new Client({ connectionString: process.env.DATABASE_URL });
  await conexion.connect();
  try {
    await conexion.query("SELECT pg_advisory_lock($1)", [2026102103]);
    const original = (await conexion.query("SELECT * FROM industria WHERE nombre = 'Cuero'")).rows[0];
    const imagenes = (await conexion.query("SELECT * FROM imagen WHERE industria_id = $1", [original.id])).rows;
    // Las imágenes originales se retiran de la vista de prueba para que el editor no las borre físicamente.
    await conexion.query("DELETE FROM imagen WHERE industria_id = $1", [original.id]);
    try {
      await page.goto("/panel/industrias");
      await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
      const tarjeta = page.getByRole("region", { name: "Cuero", exact: true });
      const texto = "Descripción publicada desde el panel DM-05";
      await tarjeta.getByLabel("Descripción de Cuero").fill(texto);
      const png = await sharp({ create: { width: 16, height: 16, channels: 4, background: "transparent" } })
        .png()
        .toBuffer();
      await tarjeta
        .locator('input[type="file"]')
        .setInputFiles({ name: "industria.png", mimeType: "image/png", buffer: png });
      await tarjeta.getByRole("button", { name: "Guardar", exact: true }).click();
      await expect(page.getByRole("status")).toContainText("Cuero publicada.");
      await page.goto("/industrias/cuero");
      await expect(page.getByText(texto, { exact: true })).toBeVisible();
      const guardadas = await conexion.query("SELECT url FROM imagen WHERE industria_id = $1", [original.id]);
      expect(guardadas.rows).toHaveLength(1);
      expect(await page.locator(`img[src="${guardadas.rows[0].url}"]`).count()).toBeGreaterThan(0);
      expect(
        (
          await conexion.query(
            "SELECT operacion FROM bitacora WHERE detalle->>'industria' = 'Cuero' AND operacion = 'Cambio de contenido del sitio'",
          )
        ).rowCount,
      ).toBeGreaterThan(0);
      // Retirar por la interfaz también verifica la limpieza del almacenamiento.
      await page.goto("/panel/industrias");
      await tarjeta.getByRole("button", { name: /Quitar/ }).click();
      await tarjeta.getByRole("button", { name: "Guardar", exact: true }).click();
      await expect(page.getByRole("status")).toContainText("Cuero publicada.");
    } finally {
      await conexion.query("UPDATE industria SET descripcion=$1, actualizado_en=$2 WHERE id=$3", [
        original.descripcion,
        original.actualizado_en,
        original.id,
      ]);
      await conexion.query("DELETE FROM imagen WHERE industria_id=$1", [original.id]);
      await conexion.query("INSERT INTO imagen SELECT * FROM json_populate_recordset(NULL::imagen, $1::json)", [
        JSON.stringify(imagenes),
      ]);
    }
  } finally {
    await conexion.end();
  }
});
test("RF-SW-07 / RNF-08: industrias y catálogo conservan estructura y accesibilidad", async ({ page }, info) => {
  for (const [ruta, titulo] of [
    ["industrias", "Industrias atendidas"],
    ["catalogo", "Catálogo de productos públicos"],
  ]) {
    await page.goto(`/panel/${ruta}`);
    await expect(page.getByRole("heading", { name: titulo, exact: true })).toBeVisible();
    if (ruta === "industrias") await expect(page.getByRole("button", { name: "Guardar", exact: true })).toHaveCount(9);
    expect(
      (await new AxeBuilder({ page }).analyze()).violations.filter((v) =>
        ["serious", "critical"].includes(v.impact ?? ""),
      ),
    ).toEqual([]);
    await page.screenshot({
      path: `pruebas-e2e/panel/evidencias/DM-05/aplicacion-${ruta}-${page.viewportSize()!.width}.png`,
      fullPage: true,
    });
  }
  await page.getByRole("button", { name: "Nuevo producto", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("dialog").evaluate((e) => e.getAnimations().forEach((a) => a.finish()));
  expect(
    (await new AxeBuilder({ page }).analyze()).violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  await info.attach("producto", { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
  await page.screenshot({
    path: `pruebas-e2e/panel/evidencias/DM-05/aplicacion-producto-${page.viewportSize()!.width}.png`,
    fullPage: true,
  });
});
test("RF-SW-23 / RN-39: crea, edita, filtra por dos industrias y confirma antes de eliminar", async ({
  page,
}, info) => {
  const nombre = `Prueba DM-05 ${info.project.name} ${Date.now()}`;
  await page.goto("/panel/catalogo");
  await page.getByRole("button", { name: "Nuevo producto", exact: true }).click();
  const ventana = page.getByRole("dialog");
  await ventana.getByLabel("Nombre", { exact: true }).fill(nombre);
  await ventana.getByLabel("Cuero", { exact: true }).check();
  await ventana.getByLabel("Textil", { exact: true }).check();
  await ventana.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(ventana).toHaveCount(0);
  let fila = page.getByRole("row").filter({ hasText: nombre });
  await expect(fila).toBeVisible();
  await fila.getByRole("button", { name: "Editar", exact: true }).click();
  await ventana.getByLabel("Presentación", { exact: true }).fill("Saco de prueba");
  await ventana.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(ventana).toHaveCount(0);
  for (const industria of ["cuero", "textil"]) {
    await page.goto(`/productos?industria=${industria}`);
    await expect(page.getByRole("heading", { name: nombre, exact: true })).toBeVisible();
  }
  await page.goto("/panel/catalogo");
  fila = page.getByRole("row").filter({ hasText: nombre });
  await expect(fila).toContainText("Saco de prueba");
  await fila.getByRole("button", { name: "Eliminar", exact: true }).click();
  await expect(ventana).toContainText("Deja de mostrarse en el sitio.");
  await ventana.getByRole("button", { name: "Volver", exact: true }).click();
  await expect(fila).toBeVisible();
  await fila.getByRole("button", { name: "Eliminar", exact: true }).click();
  await ventana.getByRole("button", { name: "Eliminar", exact: true }).click();
  await expect(fila).toHaveCount(0);
});

test("RF-SW-23: impide cerrar el editor mientras se publica y conserva el borrador si falla", async ({ page }) => {
  await page.goto("/panel/catalogo");
  await page.getByRole("button", { name: "Nuevo producto", exact: true }).click();
  const ventana = page.getByRole("dialog");
  await ventana.getByLabel("Nombre", { exact: true }).fill("Borrador pendiente");
  let liberar!: () => void;
  const espera = new Promise<void>((resolver) => {
    liberar = resolver;
  });
  let avisar!: () => void;
  const recibida = new Promise<void>((resolver) => {
    avisar = resolver;
  });
  await page.route("**/panel/catalogo/publicar", async (ruta) => {
    avisar();
    await espera;
    await ruta.fulfill({
      status: 400,
      json: { ok: false, error: "No se pudo completar la operación. Inténtelo de nuevo." },
    });
  });
  try {
    await ventana.getByRole("button", { name: "Guardar", exact: true }).click();
    await recibida;
    await page.keyboard.press("Escape");
    await expect(ventana).toBeVisible();
    await ventana.getByRole("button", { name: "Cerrar", exact: true }).click();
    await expect(ventana).toBeVisible();
    await expect(ventana.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  } finally {
    liberar();
  }
  await expect(ventana.getByRole("button", { name: "Guardar", exact: true })).toBeEnabled();
  await expect(ventana.getByLabel("Nombre", { exact: true })).toHaveValue("Borrador pendiente");
});
