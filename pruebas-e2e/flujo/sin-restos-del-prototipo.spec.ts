// JG-28 (pedido del Ing. Manuel Rojas, 02/11): ninguna pantalla del sitio, del panel ni del picking muestra textos del
// prototipo que no van en la aplicación final: avisos de datos pendientes, «por confirmar», el recuadro «Imagen de la
// industria» ni los códigos internos de pendientes (P-xx).
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { Client } from "pg";
import { irA } from "../comunes/navegacion";

try {
  process.loadEnvFile();
} catch {
  /* La CI entrega las variables. */
}

const PROHIBIDOS = /pendiente de INCOVSA|por confirmar|Imagen de la industria|\bP-\d{2,3}\b/i;

const SITIO = [
  "/",
  "/nosotros",
  "/industrias",
  "/industrias/textil",
  "/productos",
  "/noticias",
  "/contacto",
  "/acceso",
  "/acceso/sitio",
  "/acceso/picking",
];
const PANEL = [
  "/panel/resumen",
  "/panel/contenido",
  "/panel/industrias",
  "/panel/catalogo",
  "/panel/noticias",
  "/panel/contacto",
  "/panel/solicitudes",
  "/panel/documentos",
  "/panel/usuarios",
];
const PICKING = [
  "/picking/facturacion",
  "/picking/bodega",
  "/picking/tablero",
  "/picking/reportes",
  "/picking/configuracion",
  "/picking/usuarios",
];

async function entrar(context: BrowserContext, sistema: "sitio" | "picking", usuario: string) {
  const respuesta = await context.request.post(`/api/auth/${sistema}/sign-in/username`, {
    headers: { origin: "http://localhost:3000" },
    data: { usuario, clave: process.env.CLAVE_DEMO },
  });
  expect(respuesta.ok()).toBe(true);
}

/** Texto visible de la página más los textos de ayuda, títulos y nombres accesibles, que también se muestran. */
async function textosDe(page: Page) {
  return page.evaluate(() => {
    const atributos = [...document.querySelectorAll("[placeholder], [title], [aria-label], img[alt]")].flatMap((e) =>
      ["placeholder", "title", "aria-label", "alt"].map((a) => e.getAttribute(a) ?? ""),
    );
    return [document.body.innerText, document.title, ...atributos].join("\n");
  });
}

async function recorrer(page: Page, rutas: string[]) {
  for (const ruta of rutas) {
    await irA(page, ruta);
    // El panel y el picking marcan cuándo terminaron de hidratarse; el tablero de Bodega es de pantalla completa.
    if (ruta === "/picking/tablero") await expect(page.getByRole("banner")).toBeVisible();
    else if (ruta.startsWith("/panel") || ruta.startsWith("/picking"))
      await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
    else await expect(page.locator("main").first()).toBeVisible();
    const texto = await textosDe(page);
    expect(texto.match(PROHIBIDOS)?.[0], `texto del prototipo en ${ruta}`).toBeUndefined();
  }
}

/** Producto público sin industria, presentación ni países de origen: el caso en que el prototipo mostraba avisos. */
async function conProductoSinDatos(comprobar: (id: number) => Promise<void>) {
  const conexion = new Client({ connectionString: process.env.DATABASE_URL });
  await conexion.connect();
  let id: number | undefined;
  try {
    // El mismo candado que las pruebas del catálogo, para no pisarse con ellas.
    await conexion.query("SELECT pg_advisory_lock($1)", [2026102103]);
    const resultado = await conexion.query(
      "INSERT INTO producto_sitio (nombre, actualizado_en) VALUES ('JG28 Producto sin datos', now()) RETURNING id",
    );
    id = resultado.rows[0].id as number;
    await comprobar(id);
  } finally {
    if (id) await conexion.query("DELETE FROM producto_sitio WHERE id = $1", [id]);
    await conexion.end();
  }
}

// Recorre muchas páginas; en desarrollo, cada una se compila la primera vez.
test.describe.configure({ timeout: 240_000 });

test.beforeEach(async ({ page }, info) => {
  // Una IP por proyecto y trabajador, para no compartir el límite de intentos de inicio de sesión.
  const red = ["telefono", "tableta", "escritorio"].indexOf(info.project.name) + 1;
  await page.setExtraHTTPHeaders({ "X-Real-IP": `198.28.${red}.${info.workerIndex + 1}` });
});

test("JG-28 / RF-SW-02 / RF-SW-03 / RF-SW-04: el sitio público no muestra textos del prototipo", async ({ page }) => {
  await conProductoSinDatos(async (id) => {
    await recorrer(page, SITIO);
    // El detalle de varios productos del catálogo, incluido el que no tiene industria ni datos.
    await irA(page, "/productos");
    const enlaces = await page
      .locator(".prod-t")
      .evaluateAll((tarjetas) => tarjetas.map((t) => t.getAttribute("href") ?? ""));
    expect(enlaces).toContain(`/productos/${id}`);
    await recorrer(page, [`/productos/${id}`, ...enlaces.slice(0, 4)]);
  });
});

test("JG-28: el panel del sitio no muestra textos del prototipo", async ({ page, context }) => {
  await entrar(context, "sitio", "ejemplo.01");
  await conProductoSinDatos(async () => {
    await recorrer(page, PANEL);
    // En el Catálogo del panel, la fila del producto sin datos deja vacías sus celdas.
    await irA(page, "/panel/catalogo");
    const fila = page.getByRole("row", { name: /JG28 Producto sin datos/ });
    await expect(fila).toBeVisible();
    await expect(fila.locator("td").nth(2)).toHaveText("");
    await expect(fila.locator("td").nth(3)).toHaveText("");
    await expect(fila.locator("td").nth(4)).toHaveText("");
  });
});

test("JG-28: el picking no muestra textos del prototipo", async ({ page, context }) => {
  await entrar(context, "picking", "ejemplo.01");
  await recorrer(page, PICKING);
  await context.clearCookies();
  await entrar(context, "picking", "ejemplo.06");
  await recorrer(page, ["/picking/ruta"]);
});
