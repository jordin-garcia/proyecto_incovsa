import { execFileSync } from "node:child_process";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { fechaGuatemala, formatoFecha, semanaLunesADomingo } from "../../src/lib/fechas";

test("RF-SL-59 / CP-64 / RNF-08: periodos, pestañas y fechas inválidas en Reportes", async ({
  page,
  context,
}, info) => {
  const respuesta = await context.request.post("/api/auth/picking/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario: "ejemplo.01", clave: process.env.CLAVE_DEMO },
  });
  expect(respuesta.ok()).toBe(true);
  await page.goto("/picking/reportes");
  await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
  await expect(page.getByRole("heading", { name: "Reportes y bitácora" })).toBeVisible();
  const hoy = fechaGuatemala(new Date());
  const campo = page.getByRole("textbox", { name: "Fecha del periodo", exact: true });
  await expect(campo).toHaveValue(formatoFecha(hoy));
  await page.locator('input[type="date"]').fill("2026-10-25");
  await expect(page.getByText("Quetzaltenango · 25/10/2026", { exact: true })).toBeVisible();
  await page.locator('input[type="date"]').fill(hoy);
  await expect(page.getByText(`Quetzaltenango · ${formatoFecha(hoy)}`, { exact: true })).toBeVisible();
  await campo.fill("31/02/2026");
  await campo.press("Enter");
  await expect(campo).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("heading", { name: "Despacho diario por producto" })).toBeVisible();
  await expect(page.getByText(`Quetzaltenango · ${formatoFecha(hoy)}`, { exact: true })).toBeVisible();
  await page.screenshot({
    path: `src/modulos/reportes/evidencias/app-fecha-invalida-${info.project.name}.png`,
    fullPage: true,
  });
  await campo.fill("25/10/2026");
  await campo.press("Enter");
  await expect(page.getByText("Quetzaltenango · 25/10/2026", { exact: true })).toBeVisible();
  await page.getByRole("radio", { name: "Semanal", exact: true }).click();
  const semana = semanaLunesADomingo("2026-10-25");
  const textoSemana = `Semana del ${formatoFecha(semana.inicio)} al ${formatoFecha(semana.fin)}`;
  await expect(page.getByRole("tab", { name: "Despacho semanal", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByText(`Quetzaltenango · ${textoSemana}`, { exact: true })).toBeVisible();
  await page.screenshot({
    path: `src/modulos/reportes/evidencias/app-semanal-${info.project.name}.png`,
    fullPage: true,
  });
  await campo.fill("26/10/2026");
  await campo.blur();
  await expect(page.getByText("Quetzaltenango · Semana del 26/10/2026 al 01/11/2026", { exact: true })).toBeVisible();
  await page.getByRole("radio", { name: "Mensual", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Mes", exact: true })).toBeVisible();
  await page.getByRole("combobox", { name: "Mes", exact: true }).selectOption("02");
  await expect(page.getByText("Quetzaltenango · Febrero de 2026", { exact: true })).toBeVisible();
  await page.screenshot({
    path: `src/modulos/reportes/evidencias/app-mensual-${info.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("radio", { name: "Anual", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Año", exact: true })).toBeVisible();
  await expect(page.getByText("Quetzaltenango · Año 2026", { exact: true })).toBeVisible();
  await page.screenshot({ path: `src/modulos/reportes/evidencias/app-anual-${info.project.name}.png`, fullPage: true });
  await page.getByRole("radio", { name: "Rango", exact: true }).click();
  await page.getByRole("textbox", { name: "Fecha inicial" }).fill("19/10/2026");
  await page.getByRole("textbox", { name: "Fecha inicial" }).blur();
  await page.getByRole("textbox", { name: "Fecha final" }).fill("25/10/2026");
  await page.getByRole("textbox", { name: "Fecha final" }).press("Enter");
  await expect(page.getByText("Quetzaltenango · Del 19/10/2026 al 25/10/2026", { exact: true })).toBeVisible();
  for (const [tab, titulo] of [
    ["Despacho del periodo", "Despacho del periodo por producto"],
    ["Rutas realizadas", "Registro histórico de rutas"],
    ["Bitácora", "Bitácora de operaciones"],
  ]) {
    await page.getByRole("tab", { name: tab, exact: true }).click();
    await expect(page.getByRole("heading", { name: titulo, exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Excel", exact: true })).toBeDisabled();
    await expect(page.getByRole("button", { name: "PDF", exact: true })).toBeDisabled();
    const analisis = await new AxeBuilder({ page }).analyze();
    expect(analisis.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({
      path: `src/modulos/reportes/evidencias/app-${tab.startsWith("Despacho") ? "despacho" : tab === "Bitácora" ? "bitacora" : "rutas"}-${info.project.name}.png`,
      fullPage: true,
    });
  }
});

test("RF-SL-38 / RF-SL-37 / RN-39: datos reales, conversiones y recorrido en las tres pestañas", async ({
  page,
  context,
}, info) => {
  const numeroBase = 9600 + ["telefono", "tableta", "escritorio"].indexOf(info.project.name) * 10;
  const producto = `PRODUCTO REPORTES ${info.project.name}`;
  const ejecutar = (...args: string[]) =>
    execFileSync(process.execPath, ["--import", "tsx", "pruebas-e2e/picking/reportes-datos.ts", ...args], {
      encoding: "utf8",
    });
  const ids = JSON.parse(ejecutar("crear", String(numeroBase), producto)) as number[];
  try {
    expect(
      (
        await context.request.post("/api/auth/picking/sign-in/username", {
          headers: { origin: "http://localhost:3000" },
          data: { usuario: "ejemplo.01", clave: process.env.CLAVE_DEMO },
        })
      ).ok(),
    ).toBe(true);
    await page.goto("/picking/reportes?tipo=semana&referencia=2026-10-25");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
    const filas = page.getByRole("row").filter({ hasText: producto });
    await expect(filas).toHaveCount(2);
    await expect(filas.first()).toContainText("75.25");
    await expect(filas.first()).toContainText("3 unidades");
    await expect(filas.first()).toContainText("0.25 kg");
    await expect(filas.last()).toContainText("0 unidades");
    await expect(filas.last()).toContainText("0.25 kg");
    const accesibilidadDespacho = await new AxeBuilder({ page }).analyze();
    expect(accesibilidadDespacho.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual(
      [],
    );
    await page.screenshot({
      path: `src/modulos/reportes/evidencias/app-despacho-datos-${info.project.name}.png`,
      fullPage: true,
    });
    await page.getByRole("tab", { name: "Rutas realizadas", exact: true }).click();
    const filaRuta = page
      .getByRole("row")
      .filter({ has: page.getByRole("cell", { name: String(numeroBase), exact: true }) });
    await expect(filaRuta).toContainText("Se guarda al entregar");
    await expect(filaRuta).toContainText("24/10/2026");
    await expect(filaRuta).toContainText("13:30");
    const filaEntrega = page
      .getByRole("row")
      .filter({ has: page.getByRole("cell", { name: String(numeroBase + 1), exact: true }) });
    await expect(filaEntrega).toContainText("1. Cliente primero → 2. Cliente segundo");
    for (const tab of ["Rutas realizadas", "Bitácora"]) {
      await page.getByRole("tab", { name: tab, exact: true }).click();
      const analisis = await new AxeBuilder({ page }).analyze();
      expect(analisis.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
      await page.screenshot({
        path: `src/modulos/reportes/evidencias/app-${tab === "Bitácora" ? "bitacora" : "rutas"}-datos-${info.project.name}.png`,
        fullPage: true,
      });
    }
  } finally {
    ejecutar("limpiar", JSON.stringify(ids));
  }
});
