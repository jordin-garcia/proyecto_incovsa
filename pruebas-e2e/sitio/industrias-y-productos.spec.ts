import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { Client } from "pg";

try {
  process.loadEnvFile();
} catch {
  /* La CI proporciona el entorno. */
}

async function conCatalogo(
  comprobar: (datos: { conexion: Client; ids: number[]; cuero: number; textil: number }) => Promise<void>,
) {
  const conexion = new Client({ connectionString: process.env.DATABASE_URL });
  await conexion.connect();
  const ids: number[] = [];
  try {
    await conexion.query("SELECT pg_advisory_lock($1)", [2026102103]);
    const industrias = await conexion.query("SELECT id, nombre FROM industria WHERE nombre IN ('Cuero', 'Textil')");
    const cuero = industrias.rows.find((i) => i.nombre === "Cuero").id as number;
    const textil = industrias.rows.find((i) => i.nombre === "Textil").id as number;
    for (const nombre of ["DM03 Ácido", "DM03 Bórax", "DM03 Cal", "DM03 Soda", "DM03 Zinc"]) {
      const resultado = await conexion.query(
        "INSERT INTO producto_sitio (nombre, descripcion, presentacion, paises_origen, actualizado_en) VALUES ($1, $2, $3, $4, now()) RETURNING id",
        [nombre, "Descripción de prueba", "Saco de prueba", "Guatemala"],
      );
      ids.push(resultado.rows[0].id);
    }
    await conexion.query("INSERT INTO producto_industria (producto_sitio_id, industria_id) VALUES ($1, $2), ($3, $2)", [
      ids[0],
      cuero,
      ids[1],
    ]);
    await conexion.query(
      "INSERT INTO imagen (area, producto_sitio_id, posicion, url) VALUES ('producto', $1, 1, '/marca/foto-equipo.webp')",
      [ids[0]],
    );
    await comprobar({ conexion, ids, cuero, textil });
  } finally {
    await conexion.query("DELETE FROM producto_industria WHERE producto_sitio_id = ANY($1::int[])", [ids]);
    await conexion.query("DELETE FROM producto_sitio WHERE id = ANY($1::int[])", [ids]);
    await conexion.end();
  }
}

async function accesible(page: Page) {
  // axe mide el estado visible final, después de las transiciones de aparición.
  await page.locator("main").evaluate(async (elemento) => {
    await Promise.all(
      elemento.getAnimations({ subtree: true }).map((animacion) => animacion.finished.catch(() => undefined)),
    );
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(axe.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
  await expect(page.getByRole("contentinfo")).toHaveCount(0);
}

test("RF-SW-03 / P-97 / RF-SW-15: industrias con íconos, foco, desplazamiento y relaciones actuales", async ({
  page,
}) => {
  await conCatalogo(async ({ conexion, ids, cuero, textil }) => {
    await page.goto("/industrias");
    const barra = page.getByRole("navigation", { name: "Industrias", exact: true });
    await expect(barra.getByRole("link")).toHaveCount(9);
    const enlace = barra.getByRole("link", { name: "Textil", exact: true });
    await expect(enlace.locator(".ind-nombre")).toHaveCSS("opacity", "0");
    await enlace.hover();
    await expect(enlace.locator(".ind-nombre")).toHaveCSS("opacity", "1");
    await page.mouse.move(0, 0);
    await enlace.focus();
    await expect(enlace.locator(".ind-nombre")).toHaveCSS("opacity", "1");
    await expect(page.locator(".lista-prod")).toContainText("DM03 Ácido");
    await expect(page.locator(".lista-prod a")).toHaveCount(0);
    const nombres = await page.locator(".lista-prod span").allTextContents();
    expect(nombres).toEqual([...nombres].sort((a, b) => a.localeCompare(b, "es")));
    await page.evaluate(() => window.scrollTo(0, 200));
    const desplazamiento = await page.evaluate(() => window.scrollY);
    await enlace.press("Enter");
    await expect(page.locator(".ind-det h2")).toHaveText("Textil");
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - desplazamiento)).toBeLessThan(5);
    await conexion.query("DELETE FROM producto_industria WHERE producto_sitio_id = $1 AND industria_id = $2", [
      ids[0],
      cuero,
    ]);
    await conexion.query("INSERT INTO producto_industria (producto_sitio_id, industria_id) VALUES ($1, $2)", [
      ids[0],
      textil,
    ]);
    await page.reload();
    await expect(page.locator(".lista-prod")).toContainText("DM03 Ácido");
    await page.goto("/industrias/cuero");
    await expect(page.locator(".lista-prod")).not.toContainText("DM03 Ácido");
    await expect(page.locator(".ind-img-vacia")).toContainText("Imagen de la industria");
    await accesible(page);
  });
});

test("RF-SW-04 / RF-SW-16 / RF-SW-15: búsqueda sin acentos, filtros, recuentos, vacío y tarjetas sin lote", async ({
  page,
}) => {
  await conCatalogo(async () => {
    await page.goto("/productos?industria=cuero");
    await expect(page.locator(".cat-lay")).toHaveAttribute("data-hidratado", "true");
    const buscar = page.getByRole("textbox", { name: "Buscar producto" });
    await buscar.fill("dm03 acido");
    await expect(page.locator(".prod-t")).toHaveCount(1);
    await expect(page.locator(".prod-t")).toContainText("Guatemala · Saco de prueba");
    await expect(page.locator(".prod-t")).not.toContainText(/lote/i);
    await expect(page.locator(".prod-t")).toHaveClass(/visible/);
    await page.getByRole("button", { name: /^Textil/ }).click();
    await expect(page.getByText("Ningún producto coincide", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: /^Todas las industrias/ }).click();
    await expect(page.locator(".prod-t")).toHaveCount(1);
    await buscar.fill("DM03");
    await page.getByRole("button", { name: /^Industria por confirmar/ }).click();
    await expect(page.locator(".prod-t")).toHaveCount(3);
    await accesible(page);
  });
});

test("RF-SW-05 / RF-SW-17 / RF-SW-15: detalle público, galería, recomendados y enlaces", async ({ page }) => {
  await conCatalogo(async ({ ids }) => {
    await page.goto(`/productos/${ids[0]}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("DM03 Ácido");
    await expect(page.locator(".fichas")).toContainText("Descripción de prueba");
    await expect(page.locator(".fichas")).toContainText("Saco de prueba");
    await expect(page.locator(".fichas")).toContainText("Guatemala");
    await expect(page.locator(".det-foto img")).toHaveAttribute("src", "/marca/foto-equipo.webp");
    await expect(page.getByRole("heading", { name: "Productos Recomendados", exact: true })).toBeVisible();
    await expect(page.locator(".recomendados .prod-t")).toHaveCount(4);
    await expect(page.locator(`.recomendados a[href='/productos/${ids[0]}']`)).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText(/Ficha técnica|MSDS|COA/);
    await accesible(page);
    await page.getByRole("link", { name: "Volver al catálogo", exact: true }).click();
    await expect(page.getByRole("textbox", { name: "Buscar producto" })).toBeVisible();
  });
});
