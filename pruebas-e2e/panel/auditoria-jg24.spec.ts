import { expect } from "@playwright/test";
import { test } from "./datos";
import AxeBuilder from "@axe-core/playwright";
import { capturaEvidencia } from "../comunes/evidencia";
import { imagenWebp } from "../comunes/archivos";
import { irA } from "../comunes/navegacion";

try {
  process.loadEnvFile();
} catch {
  /* La CI proporciona las variables. */
}

test("RNF-08 / decisión 89: CampoGaleria conserva el contraste aprobado y recupera medidas y hover del prototipo", async ({
  page,
  context,
}) => {
  const respuesta = await context.request.post("/api/auth/sitio/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario: "ejemplo.08", clave: process.env.CLAVE_DEMO },
  });
  expect(respuesta.ok()).toBe(true);
  await irA(page, "/panel/contenido");
  await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
  for (const [nombre, individual] of [
    ["Portada", false],
    ["Logotipo de INCOVSA", true],
  ] as const) {
    const campo = page.getByRole("region", { name: nombre, exact: true }).locator("[data-galeria]");
    const subir = campo.getByRole("button").filter({ has: page.locator("[data-aviso]") });
    await expect(subir).toHaveCSS("color", "rgb(84, 85, 84)");
    if (!individual) {
      await expect(subir).toHaveCSS("padding", "16px");
      await expect(subir).toHaveCSS("font-size", "13.5px");
      // 13.5 px × 1.55. Firefox y WebKit redondean el subpíxel distinto que Chromium (20.9333 y 20.924999, JG-16).
      expect(Number.parseFloat(await subir.evaluate((e) => getComputedStyle(e).lineHeight))).toBeCloseTo(20.925, 1);
    }
    await subir.hover();
    await expect(subir).toHaveCSS("background-color", "rgb(241, 248, 242)");
    await expect(subir).toHaveCSS("color", "rgb(84, 85, 84)");
    expect(
      (await new AxeBuilder({ page }).analyze()).violations.filter((v) =>
        ["serious", "critical"].includes(v.impact ?? ""),
      ),
    ).toEqual([]);
    await capturaEvidencia(
      page,
      `plan/evidencias/JG-24/aplicacion-galeria-${individual ? "individual" : "multiple"}-${page.viewportSize()!.width}.png`,
    );
    await page.mouse.move(0, 0);
  }
});

// JG-34 (06/11): reemplaza la prueba del aviso de los valores, que se quitaron del sitio y del panel. Comprueba desde
// el panel el caso que el sitio muestra en una sección propia: la visión solo con imagen.
test("RF-SW-23 / RF-SW-02 (06/11): la visión publicada solo con imagen desde el panel queda en su sección clara", async ({
  page,
  context,
}, info) => {
  const respuesta = await context.request.post("/api/auth/sitio/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario: "ejemplo.08", clave: process.env.CLAVE_DEMO },
  });
  expect(respuesta.ok()).toBe(true);
  await irA(page, "/panel/contenido");
  await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
  const vision = page.getByRole("region", { name: "Visión", exact: true });
  await vision.getByLabel("Texto", { exact: true }).fill("");
  await vision.getByLabel("Visión: elegir imágenes").setInputFiles(imagenWebp("public/marca/foto-reunion.webp"));
  await vision.getByRole("button", { name: "Guardar y publicar", exact: true }).click();
  await expect(page.getByText("Visión publicado en el sitio.", { exact: true })).toBeVisible();
  await irA(page, "/nosotros");
  const seccion = page.locator("main > section").filter({ has: page.getByRole("heading", { name: "Nuestra visión" }) });
  expect(await seccion.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe("rgb(3, 31, 11)");
  const fila = seccion.locator(".mv-fila");
  await expect(fila).toHaveClass(/inversa/);
  await expect(fila).not.toHaveClass(/una-col/);
  await expect(fila.locator(".eyebrow")).toHaveText("Visión");
  await expect(fila.locator(".mv-parrafo")).toHaveCount(0);
  await expect(fila.locator("[data-galeria] img")).toHaveCount(1);
  // Fila invertida: la galería va primero y el texto después, como en el prototipo.
  expect(await fila.evaluate((el) => [...el.children].map((hijo) => hijo.className))).toEqual([
    expect.stringContaining("mv-gal"),
    "mv-txt",
  ]);
  await capturaEvidencia(page, `pruebas-e2e/sitio/evidencias/JG-34/vision-solo-imagen-${info.project.name}.png`);
});
