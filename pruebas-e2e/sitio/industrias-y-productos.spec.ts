import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { Client } from "pg";
import { irA, recargar } from "../comunes/navegacion";

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

/** Nombre, ícono y texto visible de cada opción de una barra de solo íconos, en el orden en que se muestran. */
async function opcionesDe(barra: import("@playwright/test").Locator) {
  return barra.locator(":scope > a, :scope > button").evaluateAll((opciones) =>
    opciones.map((o) => ({
      nombre: o.getAttribute("aria-label"),
      icono: [...o.querySelectorAll(":scope > svg")].map((s) => s.innerHTML),
      globo: o.querySelector('.ind-nombre[role="tooltip"]')?.textContent,
      // Sin el globo, la opción no muestra texto: ni nombre ni número de productos.
      texto: [...o.childNodes]
        .filter((n) => !(n instanceof Element && n.classList.contains("ind-nombre")))
        .map((n) => n.textContent)
        .join("")
        .trim(),
    })),
  );
}

/** Tamaño y colores (normal y activa) de una barra de solo íconos. */
async function estiloDe(barra: import("@playwright/test").Locator) {
  return barra.evaluate((e) => {
    const caja = (h: Element) => ({
      ancho: Math.round(h.getBoundingClientRect().width),
      alto: Math.round(h.getBoundingClientRect().height),
    });
    const colores = (h: Element) => [
      getComputedStyle(h).backgroundColor,
      getComputedStyle(h).color,
      getComputedStyle(h).boxShadow,
    ];
    const activa = e.querySelector(":scope > .on")!;
    const normal = [...e.children].find((h) => !h.classList.contains("on"))!;
    return {
      // El alto no se compara: Productos tiene una opción más («Todas las industrias»).
      barra: {
        ancho: caja(e).ancho,
        fondo: getComputedStyle(e).backgroundImage,
        radio: getComputedStyle(e).borderRadius,
      },
      opcion: caja(normal),
      normal: colores(normal),
      activa: colores(activa),
    };
  });
}

test("JG-28 / RF-SW-03 / RF-SW-04: Productos usa la barra de solo íconos de Industrias, con «Todas las industrias» primero", async ({
  page,
}) => {
  await conCatalogo(async () => {
    await irA(page, "/industrias/textil");
    const barra = page.getByRole("navigation", { name: "Industrias", exact: true });
    await expect(barra.getByRole("link")).toHaveCount(9);
    const deIndustrias = await opcionesDe(barra);
    for (const opcion of deIndustrias) {
      expect(opcion.icono).toHaveLength(1);
      expect(opcion.globo).toBe(opcion.nombre);
      expect(opcion.texto).toBe("");
    }
    await expect(barra.getByRole("link", { name: "Textil", exact: true })).toHaveAttribute("aria-current", "page");
    await expect(barra.locator("[aria-current]")).toHaveCount(1);
    const estiloIndustrias = await estiloDe(barra);

    await irA(page, "/productos?industria=textil");
    await expect(page.locator(".sec-catalogo .ind-lay2")).toHaveAttribute("data-hidratado", "true");
    const filtros = page.getByRole("complementary", { name: "Filtrar por industria" });
    const deProductos = await opcionesDe(filtros);
    expect(deProductos).toHaveLength(10);
    // Mismas industrias, en el mismo orden y con los mismos íconos que Industrias, más «Todas las industrias» primero.
    expect(deProductos.slice(1)).toEqual(deIndustrias);
    expect(deProductos[0]).toMatchObject({ nombre: "Todas las industrias", globo: "Todas las industrias", texto: "" });
    expect(deProductos[0]!.icono).toHaveLength(1);
    expect(deIndustrias.map((o) => o.icono[0])).not.toContain(deProductos[0]!.icono[0]);
    await expect(filtros).not.toContainText("Industria por confirmar");
    // Mismo ancho, tamaño de cada opción, fondo y colores (normal y activa) que la barra de Industrias.
    expect(await estiloDe(filtros)).toEqual(estiloIndustrias);
    const textil = filtros.getByRole("button", { name: "Textil", exact: true });
    await expect(textil).toHaveAttribute("aria-pressed", "true");
    await expect(filtros.locator('[aria-pressed="true"]')).toHaveCount(1);
    // El nombre aparece en un globo al llegar a la opción.
    const todas = filtros.getByRole("button", { name: "Todas las industrias", exact: true });
    await todas.focus();
    await expect(todas.locator(".ind-nombre")).toHaveCSS("opacity", "1");
    // Junto a la barra, la rejilla tiene dos columnas en teléfono y tres en tableta y escritorio.
    const columnas = await page
      .locator(".catalogo-rejilla")
      .evaluate((e) => getComputedStyle(e).gridTemplateColumns.split(" ").length);
    expect(columnas).toBe(page.viewportSize()!.width <= 720 ? 2 : 3);
    await todas.click();
    await expect(todas).toHaveAttribute("aria-pressed", "true");
    await expect(textil).toHaveAttribute("aria-pressed", "false");
  });
});

test("RF-SW-03 / P-97 / RF-SW-15: industrias con íconos, foco, desplazamiento y relaciones actuales", async ({
  page,
}) => {
  await conCatalogo(async ({ conexion, ids, cuero, textil }) => {
    await irA(page, "/industrias");
    const barra = page.getByRole("navigation", { name: "Industrias", exact: true });
    await expect(barra.getByRole("link")).toHaveCount(9);
    await expect(barra.getByRole("link", { name: /^Cuero/ })).toHaveAttribute("aria-current", "page");
    const enlace = barra.getByRole("link", { name: /^Textil/ });
    await expect(enlace).toHaveAttribute("href", "/industrias/textil");
    await expect(enlace).not.toHaveAttribute("aria-current");
    await enlace.focus();
    await expect(enlace).toBeFocused();
    await expect(page.locator(".lista-prod")).toContainText("DM03 Ácido");
    await expect(page.locator(".lista-prod a")).toHaveCount(0);
    const nombres = await page.locator(".lista-prod span").allTextContents();
    // La tarjeta aparece al entrar en la pantalla (RF-SW-16); en teléfono queda debajo del banner (JG-28).
    await page.locator(".ind-det").scrollIntoViewIfNeeded();
    await expect(
      page.getByRole("heading", { name: `Productos para esta industria · ${nombres.length}`, exact: true }),
    ).toBeVisible();
    expect(nombres).toEqual([...nombres].sort((a, b) => a.localeCompare(b, "es")));
    await page.evaluate(() => window.scrollTo(0, 200));
    const desplazamiento = await page.evaluate(() => window.scrollY);
    await enlace.press("Enter");
    await expect(page.locator(".ind-det h2")).toHaveText("Textil");
    await expect(page).toHaveURL(/\/industrias\/textil$/);
    await expect(enlace).toHaveAttribute("aria-current", "page");
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - desplazamiento)).toBeLessThan(5);
    await conexion.query("DELETE FROM producto_industria WHERE producto_sitio_id = $1 AND industria_id = $2", [
      ids[0],
      cuero,
    ]);
    await conexion.query("INSERT INTO producto_industria (producto_sitio_id, industria_id) VALUES ($1, $2)", [
      ids[0],
      textil,
    ]);
    await recargar(page);
    await expect(page.locator(".lista-prod")).toContainText("DM03 Ácido");
    await irA(page, "/industrias/cuero");
    await expect(page.locator(".lista-prod")).not.toContainText("DM03 Ácido");
    // JG-28: sin imágenes, la industria no muestra recuadro ni texto en su lugar.
    await expect(page.locator(".ind-img")).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText("Imagen de la industria");
    // IntersectionObserver inicia la transición después de montar la página.
    // Exige el estado final antes de medir contraste, sin desactivar animaciones ni reglas de axe.
    await page.locator(".ind-det").scrollIntoViewIfNeeded();
    await expect(page.locator(".ind-det")).toHaveClass(/\bvisible\b/);
    await expect(page.locator(".ind-det")).toHaveCSS("opacity", "1");
    await accesible(page);
  });
});

test("RF-SW-04 / RF-SW-16 / RF-SW-15: búsqueda sin acentos, filtros, recuentos, vacío y tarjetas sin lote", async ({
  page,
}) => {
  await conCatalogo(async () => {
    await irA(page, "/productos?industria=cuero");
    await expect(page.locator(".sec-catalogo .ind-lay2")).toHaveAttribute("data-hidratado", "true");
    const buscar = page.getByRole("textbox", { name: "Buscar producto" });
    await buscar.fill("dm03 acido");
    await expect(page.locator(".prod-t")).toHaveCount(1);
    await expect(page.locator(".prod-t")).toContainText("Guatemala · Saco de prueba");
    await expect(page.locator(".prod-t")).not.toContainText(/lote/i);
    // La tarjeta aparece al entrar en la pantalla (RF-SW-16); en teléfono queda debajo del banner (JG-28).
    await page.locator(".prod-t").scrollIntoViewIfNeeded();
    await expect(page.locator(".prod-t")).toHaveClass(/visible/);
    await page.getByRole("button", { name: /^Textil/ }).click();
    await expect(page.getByText("Ningún producto coincide", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: /^Todas las industrias/ }).click();
    await expect(page.locator(".prod-t")).toHaveCount(1);
    // JG-28: los productos sin industria solo aparecen en «Todas las industrias», sin aviso.
    await buscar.fill("DM03");
    await expect(page.locator(".prod-t")).toHaveCount(5);
    await expect(page.getByRole("button", { name: /Industria por confirmar/ })).toHaveCount(0);
    await expect(page.locator(".catalogo-rejilla")).not.toContainText(/por confirmar/i);
    for (const nombre of ["DM03 Cal", "DM03 Soda", "DM03 Zinc"])
      await expect(page.locator(".prod-t", { hasText: nombre }).locator(".etiquetas")).toHaveCount(0);
    await accesible(page);
    // El filtro «sin» ya no existe: la dirección vieja muestra todas las industrias.
    await irA(page, "/productos?industria=sin");
    await expect(page.locator(".sec-catalogo .ind-lay2")).toHaveAttribute("data-hidratado", "true");
    await expect(page.getByRole("button", { name: /^Todas las industrias/ })).toHaveAttribute("aria-pressed", "true");
  });
});

test("JG-28 / RF-SW-05: el detalle de un producto sin industria ni datos no muestra avisos ni espacios vacíos", async ({
  page,
}) => {
  await conCatalogo(async ({ conexion, ids }) => {
    await conexion.query("UPDATE producto_sitio SET presentacion = NULL, paises_origen = '' WHERE id = $1", [ids[2]]);
    await irA(page, `/productos/${ids[2]}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("DM03 Cal");
    await expect(page.locator(".industrias-producto")).toHaveCount(0);
    await expect(page.locator(".fichas dt")).toHaveText(["Descripción"]);
    await expect(page.locator("main")).not.toContainText(/por confirmar/i);
    await expect(page.locator(".miga-producto")).toHaveText("Productos / DM03 Cal");
    await accesible(page);
  });
});

test("RF-SW-05 / RF-SW-17 / RF-SW-15: detalle público, galería, recomendados y enlaces", async ({ page }) => {
  await conCatalogo(async ({ ids }) => {
    await irA(page, `/productos/${ids[0]}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("DM03 Ácido");
    await expect(page.locator(".fichas")).toContainText("Descripción de prueba");
    await expect(page.locator(".fichas")).toContainText("Saco de prueba");
    await expect(page.locator(".fichas")).toContainText("Guatemala");
    await expect(page.locator(".det-foto img")).toHaveAttribute("src", "/marca/foto-equipo.webp");
    await expect
      .poll(() => page.locator(".det-foto img").evaluate((imagen) => (imagen as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    await expect(page.getByRole("heading", { name: "Productos Recomendados", exact: true })).toBeVisible();
    await expect(page.locator(".recomendados .prod-t")).toHaveCount(4);
    await expect(page.locator(`.recomendados a[href='/productos/${ids[0]}']`)).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText(/Ficha técnica|MSDS|COA/);
    await accesible(page);
    await page.getByRole("link", { name: "Volver al catálogo", exact: true }).click();
    await expect(page.getByRole("textbox", { name: "Buscar producto" })).toBeVisible();
  });
});
