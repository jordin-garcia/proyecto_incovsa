import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

try {
  process.loadEnvFile();
} catch {
  /* Variables de CI. */
}

test("RF-SW-06 / H-60: el formulario recorta los topes y no muestra mensajes de Zod en inglés", async ({
  page,
}, info) => {
  test.setTimeout(60_000);
  await page.goto("/contacto");
  // Antes de hidratar, React repite tarde el foco y la salida de los campos: se espera a que tome el formulario.
  await expect(page.locator("form.contacto-form")).toHaveAttribute("data-hidratado", "true");
  await expect(page.getByRole("heading", { name: "Envíenos su mensaje" })).toBeVisible();
  const nombre = page.getByLabel("Nombre completo *", { exact: true });
  const empresa = page.getByLabel("Empresa", { exact: true });
  const correo = page.getByLabel("Correo electrónico *", { exact: true });
  const telefono = page.getByLabel("Número de teléfono", { exact: true });
  await expect(nombre).toHaveAttribute("maxLength", "150");
  await expect(empresa).toHaveAttribute("maxLength", "150");
  await expect(correo).toHaveAttribute("maxLength", "150");
  await expect(telefono).toHaveAttribute("maxLength", "20");
  async function alTope(campo: typeof nombre, valor: string) {
    await campo.click();
    await campo.fill("");
    await page.keyboard.type(`${valor}x`, { delay: 0 });
    await expect(campo).toHaveValue(valor);
  }
  await alTope(nombre, "n".repeat(150));
  await alTope(empresa, "e".repeat(150));
  await alTope(correo, "c".repeat(150));
  await alTope(telefono, "5".repeat(20));
  await expect(nombre).toHaveValue("n".repeat(150));
  await expect(empresa).toHaveValue("e".repeat(150));
  await expect(correo).toHaveValue("c".repeat(150));
  await expect(telefono).toHaveValue("5".repeat(20));
  await nombre.evaluate((el) => {
    const campo = el as HTMLInputElement;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(campo, "n".repeat(151));
    campo.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.getByRole("button", { name: "Enviar mensaje", exact: true }).click();
  const resumen = page.getByRole("alert").first();
  await expect(resumen).toContainText("El nombre admite hasta 150 caracteres.");
  await expect(resumen).not.toContainText(/Too big|expected string|Invalid input/i);
  expect(
    (await new AxeBuilder({ page }).include(".contacto-form").analyze()).violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  await info.attach(`h60-contacto-${info.project.name}`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
});

test("RF-SW-06 / H-61: al salir del campo solo se validan el correo y el teléfono", async ({ page }, info) => {
  await page.goto("/contacto");
  // Antes de hidratar, React repite tarde el foco y la salida de los campos: se espera a que tome el formulario.
  await expect(page.locator("form.contacto-form")).toHaveAttribute("data-hidratado", "true");
  const nombre = page.getByLabel("Nombre completo *", { exact: true });
  const correo = page.getByLabel("Correo electrónico *", { exact: true });
  const pais = page.getByLabel("País *", { exact: true });
  await nombre.focus();
  await nombre.blur();
  await expect(nombre).not.toHaveAttribute("aria-invalid", "true");
  await pais.focus();
  await pais.blur();
  await expect(pais).not.toHaveAttribute("aria-invalid", "true");
  await correo.fill("incorrecto");
  await expect(correo).not.toHaveAttribute("aria-invalid", "true");
  await correo.blur();
  await expect(correo).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#error-correo")).toHaveText(
    "Indique un correo con una estructura válida (nombre@dominio.com).",
  );
  const telefono = page.getByLabel("Número de teléfono", { exact: true });
  await telefono.fill("123");
  await telefono.blur();
  await expect(telefono).toHaveAttribute("aria-invalid", "true");
  await page.getByRole("button", { name: "Enviar mensaje", exact: true }).click();
  await expect(nombre).toHaveAttribute("aria-invalid", "true");
  await expect(pais).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Indique su nombre.", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Elija el país.", { exact: true }).first()).toBeVisible();
  await info.attach(`h61-contacto-${info.project.name}`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
});
