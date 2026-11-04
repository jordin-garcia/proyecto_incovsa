import { expect, test } from "@playwright/test";
import { irA } from "../comunes/navegacion";

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

test("RNF-05: al salir del texto de noticia rechaza más de 10 000 caracteres", async ({ page }) => {
  await irA(page, "/panel/noticias");
  await page.getByRole("button", { name: "Nueva noticia", exact: true }).click();
  const dialogo = page.getByRole("dialog", { name: "Nueva noticia" });
  const campo = dialogo.getByLabel("Texto", { exact: true });
  await campo.fill("a".repeat(10_001));
  await campo.blur();
  await expect(dialogo.getByText("El texto admite hasta 10 000 caracteres.", { exact: true })).toBeVisible();
  await dialogo.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(dialogo).toBeVisible();
});
