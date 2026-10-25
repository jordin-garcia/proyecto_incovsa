import { test as base, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { Client } from "pg";
import { mkdir, unlink } from "node:fs/promises";
try {
  process.loadEnvFile();
} catch {
  /* Variables proporcionadas por CI. */
}
const test = base.extend<{ contactoDePrueba: Client }>({
  contactoDePrueba: [
    async ({ baseURL }, usar) => {
      if (!baseURL || !["localhost", "127.0.0.1"].includes(new URL(baseURL).hostname))
        throw new Error("Las pruebas requieren una aplicación local.");
      const bd = new Client({ connectionString: process.env.DATABASE_URL });
      await bd.connect();
      try {
        await bd.query("SELECT pg_advisory_lock($1)", [2026102408]);
        const contactos = (await bd.query("SELECT * FROM informacion_contacto")).rows;
        try {
          await usar(bd);
        } finally {
          await bd.query(
            "UPDATE informacion_contacto c SET direccion=o.direccion, telefono=o.telefono, correo=o.correo, whatsapp=o.whatsapp, horario=o.horario, mapa_url=o.mapa_url FROM json_populate_recordset(NULL::informacion_contacto,$1::json) o WHERE c.id=o.id",
            [JSON.stringify(contactos)],
          );
          await bd.query("DELETE FROM solicitud_contacto WHERE correo LIKE 'dm08-e2e-%@prueba.invalid'");
        }
      } finally {
        await bd.end();
      }
    },
    { auto: true, timeout: 60000 },
  ],
});
async function captura(page: Page, estado: string) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.locator("img").evaluateAll(async (elementos) => {
    await Promise.all(
      elementos.map(async (e) => {
        if (!(e instanceof HTMLImageElement)) return;
        e.loading = "eager";
        await e.decode().catch(() => undefined);
      }),
    );
  });
  await page.evaluate(() => document.fonts.ready);
  await mkdir("pruebas-e2e/sitio/evidencias/DM-08", { recursive: true });
  const archivo = `pruebas-e2e/sitio/evidencias/DM-08/${estado}-${page.viewportSize()!.width}.png`;
  await unlink(archivo).catch((e: NodeJS.ErrnoException) => {
    if (e.code !== "ENOENT") throw e;
  });
  await page.screenshot({ path: archivo, fullPage: true });
}
async function axe(page: Page) {
  expect(
    (await new AxeBuilder({ page }).analyze()).violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
}

test("RF-SW-19 / RNF-08: valida país, territorios, correo y teléfono y conserva el diseño accesible", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/contacto");
  await expect(page.getByRole("heading", { name: "Envíenos su mensaje" })).toBeVisible();
  await captura(page, "aplicacion-contacto");
  await page.getByRole("button", { name: "Enviar mensaje", exact: true }).click();
  await expect(page.getByText("Elija el país.", { exact: true }).first()).toBeVisible();
  await page.getByLabel("Correo electrónico *", { exact: true }).fill("incorrecto");
  await page.getByLabel("Correo electrónico *", { exact: true }).blur();
  await expect(
    page.getByText("Indique un correo con una estructura válida (nombre@dominio.com).", { exact: true }).first(),
  ).toBeVisible();
  await page.getByLabel("Número de teléfono", { exact: true }).fill("123");
  await page.getByLabel("Número de teléfono", { exact: true }).blur();
  await expect(page.getByText("El teléfono no es válido para Guatemala.", { exact: true }).first()).toBeVisible();
  await page.getByLabel("País *", { exact: true }).selectOption("GT");
  await expect(page.getByLabel("Departamento *", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Municipio *", { exact: true })).toBeVisible();
  await captura(page, "aplicacion-guatemala");
  await page.getByRole("button", { name: "Enviar mensaje", exact: true }).click();
  await expect(page.getByText("Elija el departamento.", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Elija el municipio.", { exact: true }).first()).toBeVisible();
  await captura(page, "aplicacion-error");
  await page.getByLabel("País *", { exact: true }).selectOption("MX");
  await expect(page.getByLabel("Departamento *", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Municipio *", { exact: true })).toHaveCount(0);
  expect(
    (await new AxeBuilder({ page }).analyze()).violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  await expect(page.locator("footer")).toBeVisible();
  await expect(page.locator("main")).not.toContainText("Escuintla");
});

test("RF-SW-06 / CAM-82: guarda el envío público y desplaza el aviso de éxito", async ({ page, contactoDePrueba }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/contacto");
  const correo = `dm08-e2e-${Date.now()}@prueba.invalid`;
  await page.getByLabel("Nombre completo *", { exact: true }).fill("Persona de prueba");
  await page.getByLabel("Correo electrónico *", { exact: true }).fill(correo);
  await page.getByLabel("País *", { exact: true }).selectOption("MX");
  await page.getByLabel("Sede a la que dirige su mensaje *", { exact: true }).selectOption({ label: "Quetzaltenango" });
  await page.getByLabel("Mensaje *", { exact: true }).fill("Solicitud de información de prueba");
  await page.getByRole("button", { name: "Enviar mensaje", exact: true }).click();
  const aviso = page.getByRole("heading", { name: "Solicitud recibida", exact: true });
  await expect(aviso).toBeInViewport();
  const folio = await page.locator(".contacto-exito b").innerText();
  expect(folio).toMatch(/^SOL-\d{4}-\d{4,}$/);
  await expect
    .poll(() =>
      aviso.evaluate((e) => {
        const r = e.getBoundingClientRect();
        const cab = document.querySelector(".sh")!.getBoundingClientRect();
        return r.top >= cab.bottom && r.bottom <= innerHeight;
      }),
    )
    .toBe(true);
  const fila = (
    await contactoDePrueba.query("SELECT folio, estado, leida FROM solicitud_contacto WHERE correo=$1", [correo])
  ).rows;
  expect(fila).toEqual([{ folio, estado: null, leida: false }]);
  await axe(page);
  await captura(page, "aplicacion-exito");
  await page.getByRole("button", { name: "Enviar otro mensaje" }).click();
  await expect(page.getByLabel("Nombre completo *", { exact: true })).toHaveValue("");
});

test("RF-SW-22 / RNF-08: publica contacto en panel, Inicio y pie y rechaza mapas externos", async ({
  page,
  context,
}) => {
  const respuesta = await context.request.post("/api/auth/sitio/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario: "ejemplo.08", clave: process.env.CLAVE_DEMO },
  });
  expect(respuesta.ok()).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/panel/contacto");
  await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
  const sede = page.getByRole("region", { name: "Quetzaltenango", exact: true });
  await captura(page, "aplicacion-panel");
  await axe(page);
  const mapa = sede.getByLabel("Mapa (dirección del mapa insertado de Google Maps)", { exact: true });
  const original = await mapa.inputValue();
  await mapa.fill("https://example.com/mapa");
  await mapa.blur();
  await expect(
    sede.getByText(
      "El mapa debe ser la dirección del mapa insertado de Google Maps (https://www.google.com/maps/embed?…).",
      { exact: true },
    ),
  ).toBeVisible();
  await sede.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(
    sede.getByText(
      "El mapa debe ser la dirección del mapa insertado de Google Maps (https://www.google.com/maps/embed?…).",
      { exact: true },
    ),
  ).toBeVisible();
  await captura(page, "aplicacion-panel-error");
  await mapa.fill(original);
  await sede.getByLabel("Dirección", { exact: true }).fill("Dirección de prueba DM-08");
  await sede.getByLabel("Correo", { exact: true }).fill("dm08-e2e-contacto@prueba.invalid");
  await sede.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(page.getByText("Datos de Quetzaltenango publicados.", { exact: true })).toBeVisible();
  for (const ruta of ["/contacto", "/"]) {
    await page.goto(ruta);
    await expect(page.locator("main")).toContainText("Dirección de prueba DM-08");
    await expect(page.locator("footer")).toContainText("dm08-e2e-contacto@prueba.invalid");
  }
  await page.goto("/panel/contacto");
  await expect(sede.getByLabel("Dirección", { exact: true })).toHaveValue("Dirección de prueba DM-08");
});
