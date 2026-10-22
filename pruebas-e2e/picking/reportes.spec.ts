import { execFileSync } from "node:child_process";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { fechaGuatemala, formatoFecha, semanaLunesADomingo } from "../../src/lib/fechas";

function fechaFixture(proyecto: string) {
  const aniosAtras: Record<string, number> = { telefono: 2, tableta: 1, escritorio: 0 };
  const fecha = new Date(fechaGuatemala(new Date()) + "T00:00:00Z");
  fecha.setUTCFullYear(fecha.getUTCFullYear() - (aniosAtras[proyecto] ?? 0));
  fecha.setUTCMonth(9, 7);
  return fecha.toISOString().slice(0, 10);
}

function ipFixture(proyecto: string) {
  const ips: Record<string, string> = {
    telefono: "192.0.2.31",
    tableta: "192.0.2.32",
    escritorio: "192.0.2.33",
  };
  return ips[proyecto] ?? "192.0.2.34";
}

test("RF-SL-59 / CP-64 / RNF-08: periodos, pestañas y fechas inválidas en Reportes", async ({
  page,
  context,
}, info) => {
  const respuesta = await context.request.post("/api/auth/picking/sign-in/username", {
    headers: { origin: "http://localhost:3000", "x-real-ip": ipFixture(info.project.name) },
    data: { usuario: "ejemplo.02", clave: process.env.CLAVE_DEMO },
  });
  expect(respuesta.ok()).toBe(true);
  await page.goto("/picking/reportes");
  await expect(page.getByRole("heading", { name: "Reportes y bitácora" })).toBeVisible();
  const hoy = fechaGuatemala(new Date());
  const campo = page.getByRole("textbox", { name: "Fecha del periodo", exact: true });
  const controlPeriodo = page.locator(".periodo");
  await expect(campo).toHaveValue(formatoFecha(hoy));
  await page.screenshot({
    path: `test-results/reportes-evidencias/app-despacho-${info.project.name}.png`,
    fullPage: true,
  });
  await page.locator('input[type="date"]').fill("2026-10-25");
  await expect(page.getByText("Quetzaltenango · 25/10/2026", { exact: true })).toBeVisible();
  await expect(controlPeriodo).toHaveAttribute("aria-busy", "false");
  await page.locator('input[type="date"]').fill(hoy);
  await expect(page.getByText(`Quetzaltenango · ${formatoFecha(hoy)}`, { exact: true })).toBeVisible();
  await expect(controlPeriodo).toHaveAttribute("aria-busy", "false");
  await campo.fill("31/02/2026");
  await campo.press("Enter");
  await expect(campo).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("heading", { name: "Despacho diario por producto" })).toBeVisible();
  await expect(page.getByText(`Quetzaltenango · ${formatoFecha(hoy)}`, { exact: true })).toBeVisible();
  await expect(controlPeriodo).toHaveAttribute("aria-busy", "false");
  await page.screenshot({
    path: `test-results/reportes-evidencias/app-fecha-invalida-${info.project.name}.png`,
    fullPage: true,
  });
  await campo.fill("25/10/2026");
  await campo.press("Enter");
  await expect(page.getByText("Quetzaltenango · 25/10/2026", { exact: true })).toBeVisible();
  await expect(controlPeriodo).toHaveAttribute("aria-busy", "false");
  await page.getByRole("radio", { name: "Semanal", exact: true }).click();
  const semana = semanaLunesADomingo("2026-10-25");
  const textoSemana = `Semana del ${formatoFecha(semana.inicio)} al ${formatoFecha(semana.fin)}`;
  await expect(page.getByRole("tab", { name: "Despacho semanal", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByText(`Quetzaltenango · ${textoSemana}`, { exact: true })).toBeVisible();
  await expect(controlPeriodo).toHaveAttribute("aria-busy", "false");
  await page.screenshot({
    path: `test-results/reportes-evidencias/app-semanal-${info.project.name}.png`,
    fullPage: true,
  });
  await expect(controlPeriodo).toHaveAttribute("aria-busy", "false");
  await campo.fill("26/10/2026");
  await expect(campo).toHaveValue("26/10/2026");
  await campo.press("Tab");
  await expect(page).toHaveURL(/referencia=2026-10-26/);
  await expect(page.getByText("Quetzaltenango · Semana del 26/10/2026 al 01/11/2026", { exact: true })).toBeVisible();
  await expect(controlPeriodo).toHaveAttribute("aria-busy", "false");
  await page.getByRole("radio", { name: "Mensual", exact: true }).click();
  await expect(page.getByRole("radio", { name: "Mensual", exact: true })).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("combobox", { name: "Mes", exact: true })).toBeVisible();
  await page.getByRole("combobox", { name: "Mes", exact: true }).selectOption("02");
  await expect(page.getByText("Quetzaltenango · Febrero de 2026", { exact: true })).toBeVisible();
  await expect(controlPeriodo).toHaveAttribute("aria-busy", "false");
  await page.screenshot({
    path: `test-results/reportes-evidencias/app-mensual-${info.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("radio", { name: "Anual", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Año", exact: true })).toBeVisible();
  await expect(page.getByText("Quetzaltenango · Año 2026", { exact: true })).toBeVisible();
  await expect(controlPeriodo).toHaveAttribute("aria-busy", "false");
  await page.getByRole("radio", { name: "Rango", exact: true }).click();
  await expect(
    page.getByText(`Quetzaltenango · Del ${formatoFecha(hoy)} al ${formatoFecha(hoy)}`, { exact: true }),
  ).toBeVisible();
  await expect(controlPeriodo).toHaveAttribute("aria-busy", "false");
  await page.getByRole("textbox", { name: "Fecha inicial" }).fill("19/10/2026");
  await page.getByRole("textbox", { name: "Fecha inicial" }).press("Tab");
  await expect(
    page.getByText(`Quetzaltenango · Del 19/10/2026 al ${formatoFecha(hoy)}`, { exact: true }),
  ).toBeVisible();
  await expect(controlPeriodo).toHaveAttribute("aria-busy", "false");
  await page.getByRole("textbox", { name: "Fecha final" }).fill("25/10/2026");
  await page.getByRole("textbox", { name: "Fecha final" }).press("Enter");
  await expect(page.getByText("Quetzaltenango · Del 19/10/2026 al 25/10/2026", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/desde=2026-10-19.*hasta=2026-10-25/);
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
      path: `test-results/reportes-evidencias/app-${tab.startsWith("Despacho") ? "rango" : tab === "Bitácora" ? "bitacora" : "rutas"}-${info.project.name}.png`,
      fullPage: true,
    });
  }
});

test("RF-SL-38 / RF-SL-37 / RN-39: datos de demostración, conversiones y recorrido en las tres pestañas", async ({
  page,
  context,
}, info) => {
  const ejecutar = (...args: string[]) =>
    execFileSync(process.execPath, ["--import", "tsx", "pruebas-e2e/picking/reportes-datos.ts", ...args], {
      encoding: "utf8",
    });
  const referencia = fechaFixture(info.project.name);
  const ids = JSON.parse(ejecutar("crear", referencia)) as number[];
  try {
    expect(
      (
        await context.request.post("/api/auth/picking/sign-in/username", {
          headers: { origin: "http://localhost:3000", "x-real-ip": ipFixture(info.project.name) },
          data: { usuario: "ejemplo.02", clave: process.env.CLAVE_DEMO },
        })
      ).ok(),
    ).toBe(true);
    const anio = referencia.slice(0, 4);
    await page.goto(`/picking/reportes?tipo=anio&anio=${anio}`);
    await expect(page.getByRole("heading", { name: "Reportes y bitácora" })).toBeVisible();
    await expect(page.getByText(`Quetzaltenango · Año ${anio}`, { exact: true })).toBeVisible();
    const nombres = await page.locator("tbody tr td:first-child").allTextContents();
    expect(nombres).toEqual([
      "SULFURO DE SODIO (TUR-SAC/0025KG)",
      "SODA CAUSTICA (POL-SAC/0025KG)",
      "SODA CAUSTICA (CHI-SAC/0025KG)",
      "EXTRACTO DE MIMOSA (BRA-SAC/0025KG)",
      "EXTRACTO DE MIMOSA ME (SUD-SAC/0020KG)",
      "HIDROSULFITO DE SODIO (IND-TON/0050KG)",
      "NEGRO SULFUROSO EXTRA HIGH QUALITY (CHI-SAC/0025KG)",
      "SODA ASH (CHI-SAC/0025KG)",
      "CLARIFICANTE (CHI-GAR/0020KG)",
      "SULFATO DE MAGNESIO (CHI-SAC/0025KG)",
      "DESENGOMANTE (GUA-GAR/0030KG)",
    ]);
    const primeraFila = page.getByRole("row").filter({ hasText: "SULFURO DE SODIO (TUR-SAC/0025KG)" });
    await expect(primeraFila).toContainText("1,250");
    await expect(primeraFila).toContainText("50 unidades");
    await expect(page.getByText("5,670", { exact: true })).toHaveCount(2);
    await expect(page.getByText("225 unidades + 10 kg", { exact: false })).toBeVisible();
    const accesibilidadDespacho = await new AxeBuilder({ page }).analyze();
    expect(accesibilidadDespacho.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual(
      [],
    );
    await page.screenshot({
      path: `test-results/reportes-evidencias/app-despacho-datos-${info.project.name}.png`,
      fullPage: true,
    });
    await page.screenshot({
      path: `test-results/reportes-evidencias/app-anual-${info.project.name}.png`,
      fullPage: true,
    });
    await page.getByRole("tab", { name: "Rutas realizadas", exact: true }).click();
    const filaRuta = page.getByRole("row").filter({ has: page.getByRole("cell", { name: "2", exact: true }) });
    await expect(filaRuta).toContainText("En Ruta");
    await expect(filaRuta).toContainText("10:00");
    await expect(filaRuta).toContainText("2,520");
    const filaEntrega = page.getByRole("row").filter({ has: page.getByRole("cell", { name: "1", exact: true }) });
    await expect(filaEntrega).toContainText("Entregado");
    await expect(filaEntrega).toContainText("2,900");
    await expect(filaEntrega).toContainText("1. Cliente uno → 2. Cliente dos → 3. Cliente tres → 4. Cliente cuatro");
    for (const tab of ["Rutas realizadas", "Bitácora"]) {
      if (tab === "Bitácora") {
        await page.getByRole("radio", { name: "Rango", exact: true }).click();
        const fechaInicial = page.getByRole("textbox", { name: "Fecha inicial" });
        const fechaFinal = page.getByRole("textbox", { name: "Fecha final" });
        await fechaInicial.fill(formatoFecha(referencia));
        await fechaInicial.press("Tab");
        await fechaFinal.fill(formatoFecha(referencia));
        await fechaFinal.press("Enter");
        await expect(
          page.getByText(`Quetzaltenango · Del ${formatoFecha(referencia)} al ${formatoFecha(referencia)}`, {
            exact: false,
          }),
        ).toBeVisible();
      }
      await page.getByRole("tab", { name: tab, exact: true }).click();
      if (tab === "Bitácora") {
        const filaCambio = page.getByRole("row").filter({
          hasText: `Quetzaltenango · Ruta 2 del ${formatoFecha(referencia)} pasa a En Ruta`,
        });
        await expect(filaCambio).toContainText("Cambio de estado");
        await expect(page.getByRole("row").filter({ hasText: "Inicio de sesión" }).first()).toBeVisible();
      }
      const analisis = await new AxeBuilder({ page }).analyze();
      expect(analisis.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
      await page.screenshot({
        path: `test-results/reportes-evidencias/app-${tab === "Bitácora" ? "bitacora" : "rutas"}-datos-${info.project.name}.png`,
        fullPage: true,
      });
    }
  } finally {
    ejecutar("limpiar", JSON.stringify(ids));
  }
});
