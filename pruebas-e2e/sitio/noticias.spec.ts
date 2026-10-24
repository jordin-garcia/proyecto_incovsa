import { test as base, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { Client } from "pg";
import { readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
try {
  process.loadEnvFile();
} catch {
  /* Variables de CI. */
}
const test = base.extend<{ noticiasDePrueba: void }>({
  noticiasDePrueba: [
    async ({ baseURL }, ejecutar) => {
      if (
        !baseURL ||
        !["localhost", "127.0.0.1"].includes(new URL(baseURL).hostname) ||
        (process.env.ALMACENAMIENTO && process.env.ALMACENAMIENTO !== "disco")
      )
        throw new Error("Esta prueba requiere aplicación y almacenamiento locales.");
      const bd = new Client({ connectionString: process.env.DATABASE_URL });
      await bd.connect();
      try {
        await bd.query("SELECT pg_advisory_lock($1)", [2026102207]);
        const noticias = (await bd.query("SELECT * FROM noticia")).rows;
        const imagenes = (await bd.query("SELECT * FROM imagen WHERE noticia_id IS NOT NULL")).rows;
        await bd.query("DELETE FROM noticia");
        try {
          await ejecutar();
        } finally {
          const nuevas = (await bd.query<{ url: string }>("SELECT url FROM imagen WHERE noticia_id IS NOT NULL")).rows;
          await bd.query("BEGIN");
          try {
            await bd.query("DELETE FROM noticia");
            await bd.query("INSERT INTO noticia SELECT * FROM json_populate_recordset(NULL::noticia, $1::json)", [
              JSON.stringify(noticias),
            ]);
            await bd.query("INSERT INTO imagen SELECT * FROM json_populate_recordset(NULL::imagen, $1::json)", [
              JSON.stringify(imagenes),
            ]);
            await bd.query("COMMIT");
          } catch (error) {
            await bd.query("ROLLBACK");
            throw error;
          }
          for (const { url } of nuevas)
            if (/^\/api\/imagenes\/[a-f0-9-]{36}\.webp$/.test(url))
              await unlink(
                join(process.cwd(), "almacenamiento-local", "imagenes", url.slice("/api/imagenes/".length)),
              ).catch((e: NodeJS.ErrnoException) => {
                if (e.code !== "ENOENT") throw e;
              });
        }
      } finally {
        await bd.end();
      }
    },
    { auto: true, timeout: 60000 },
  ],
});
async function comprobarAxe(page: import("@playwright/test").Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const dialogo of await page.getByRole("dialog").all())
    await dialogo.evaluate((e) => e.getAnimations().forEach((a) => a.finish()));
  expect(
    (await new AxeBuilder({ page }).analyze()).violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
}
async function captura(page: import("@playwright/test").Page, estado: string) {
  const archivo = `pruebas-e2e/sitio/evidencias/DM-07/${estado}-${page.viewportSize()!.width}.png`;
  const imagen = await page.screenshot({ fullPage: true });
  // OneDrive puede impedir truncar un PNG existente; se reemplaza después de capturarlo.
  await unlink(archivo).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  });
  await writeFile(archivo, imagen);
}
async function entrar(context: import("@playwright/test").BrowserContext) {
  const respuesta = await context.request.post("/api/auth/sitio/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario: "ejemplo.08", clave: process.env.CLAVE_DEMO },
  });
  expect(respuesta.ok()).toBe(true);
}
test("RF-SW-18 / RF-SW-15 / RNF-08: estados vacíos y formulario accesibles sin opción de ocultar", async ({
  page,
  context,
}) => {
  await page.goto("/noticias");
  await expect(page.getByRole("heading", { name: "Novedades de la empresa", exact: true })).toBeVisible();
  await expect(page.getByText("Todavía no hay noticias publicadas", { exact: true })).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeAttached();
  await comprobarAxe(page);
  await captura(page, "publico-vacio");
  await entrar(context);
  await page.goto("/panel/noticias");
  await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
  await expect(page.getByText("No hay noticias", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Ocultar/ })).toHaveCount(0);
  await comprobarAxe(page);
  await captura(page, "panel-vacio");
  await page.getByRole("button", { name: "Nueva noticia", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const subida = page.getByRole("dialog").getByRole("button", { name: /Arrastre aquí/ });
  await expect(subida).toHaveCSS("padding", "16px");
  await expect(subida).toHaveCSS("font-size", "13.5px");
  await comprobarAxe(page);
  await captura(page, "nueva");
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(page.getByText("Escriba el título.", { exact: true })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Escriba el título.");
  await expect(page.getByRole("dialog").locator('[role="alert"]')).toHaveCount(0);
  await captura(page, "error");
});
test("RF-SW-18 / RN-56 / RN-39: crea, edita y elimina con confirmación; texto completo y sin desbordamiento", async ({
  page,
  context,
}, info) => {
  await entrar(context);
  const titulo = `Noticia de prueba DM-07 ${info.project.name} ${Date.now()}`;
  const texto = `Primera línea de la noticia.\nSegunda línea completa.\n${"a".repeat(80)}`;
  await page.goto("/panel/noticias");
  await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
  await page.getByRole("button", { name: "Nueva noticia", exact: true }).click();
  const dialogo = page.getByRole("dialog");
  await dialogo.getByLabel("Título", { exact: true }).fill(titulo);
  await dialogo.getByLabel("Texto", { exact: true }).fill(texto);
  await dialogo.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(page.getByText("Agregue al menos una imagen.", { exact: true })).toBeVisible();
  const buffer = await readFile("public/marca/foto-equipo.webp");
  await dialogo.locator('input[type="file"]').setInputFiles({ name: "equipo.webp", mimeType: "image/webp", buffer });
  const miniatura = dialogo.locator('[data-galeria="Noticia"] figure');
  await expect(miniatura).toHaveCSS("aspect-ratio", "4 / 3");
  await expect(miniatura.locator("img")).toHaveCSS("display", "block");
  await dialogo.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(dialogo).toHaveCount(0);
  const fila = page.getByRole("row").filter({ hasText: titulo });
  await expect(fila).toBeVisible();
  await comprobarAxe(page);
  await captura(page, "panel-publicada");
  await fila.getByRole("button", { name: "Editar", exact: true }).click();
  await expect(dialogo.getByLabel("Texto", { exact: true })).toHaveValue(texto);
  await comprobarAxe(page);
  await captura(page, "editar");
  await dialogo.getByLabel("Título", { exact: true }).fill(`${titulo} editada`);
  await dialogo.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(dialogo).toHaveCount(0);
  await page.goto("/noticias");
  const articulo = page.getByRole("article").filter({ hasText: titulo });
  await expect(articulo.getByRole("heading")).toHaveText(`${titulo} editada`);
  await expect(articulo.locator("p")).toHaveText(texto);
  await expect(articulo.locator("p")).toHaveCSS("white-space", "pre-line");
  await expect(articulo.locator("p")).toHaveCSS("overflow-wrap", "anywhere");
  expect(await articulo.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
  const foto = await articulo.locator(".not-foto").boundingBox();
  const contenido = await articulo.locator(".not-txt").boundingBox();
  expect(foto).not.toBeNull();
  expect(contenido).not.toBeNull();
  if (page.viewportSize()!.width <= 860) expect(contenido!.y).toBeGreaterThanOrEqual(foto!.y + foto!.height - 1);
  else expect(contenido!.x).toBeGreaterThanOrEqual(foto!.x + foto!.width - 1);
  await comprobarAxe(page);
  await captura(page, "publico-publicada");
  await page.goto("/panel/noticias");
  await fila.getByRole("button", { name: "Eliminar", exact: true }).click();
  await expect(dialogo).toContainText("Deja de mostrarse en el sitio.");
  await comprobarAxe(page);
  await captura(page, "eliminar");
  await dialogo.getByRole("button", { name: "Volver", exact: true }).click();
  await expect(fila).toBeVisible();
  await fila.getByRole("button", { name: "Eliminar", exact: true }).click();
  await dialogo.getByRole("button", { name: "Eliminar", exact: true }).click();
  await expect(dialogo).toHaveCount(0);
  await expect(page.getByText("Noticia eliminada.", { exact: true })).toBeVisible();
  await expect(fila).toHaveCount(0);
  await page.goto("/noticias");
  await expect(page.getByRole("heading", { name: `${titulo} editada`, exact: true })).toHaveCount(0);
  const bd = new Client({ connectionString: process.env.DATABASE_URL });
  await bd.connect();
  try {
    expect(
      (
        await bd.query("SELECT operacion FROM bitacora WHERE detalle->>'noticia' IN ($1,$2) ORDER BY id", [
          titulo,
          `${titulo} editada`,
        ])
      ).rows.map((r) => r.operacion),
    ).toEqual(["Creación de noticia", "Edición de noticia", "Eliminación de noticia"]);
  } finally {
    await bd.end();
  }
});
