import { capturaEvidencia } from "../comunes/evidencia";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import * as XLSX from "xlsx";
import { expect, test } from "@playwright/test";
import { fechaGuatemala, formatoFecha } from "../../src/lib/fechas";
import { irA } from "../comunes/navegacion";

function fechaFixture(proyecto: string) {
  const aniosAtras: Record<string, number> = { telefono: 2, tableta: 1, escritorio: 0 };
  const fecha = new Date(`${fechaGuatemala(new Date())}T00:00:00Z`);
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

test("RF-SL-38 / CAM-96: descarga Excel y PDF desde las tres pestañas de Reportes", async ({ page, context }, info) => {
  const ejecutar = (...args: string[]) =>
    execFileSync(process.execPath, ["--import", "tsx", "pruebas-e2e/picking/reportes-datos.ts", ...args], {
      encoding: "utf8",
    });
  const referencia = fechaFixture(info.project.name);
  const ids = JSON.parse(ejecutar("crear", referencia)) as number[];
  try {
    const inicio = await context.request.post("/api/auth/picking/sign-in/username", {
      headers: { origin: "http://localhost:3000", "x-real-ip": ipFixture(info.project.name) },
      data: { usuario: "ejemplo.02", clave: process.env.CLAVE_DEMO },
    });
    expect(inicio.ok()).toBe(true);
    await irA(page, `/picking/reportes?tipo=dia&referencia=${referencia}`);
    await expect(page.getByRole("heading", { name: "Reportes y bitácora" })).toBeVisible();

    const fechaNombre = formatoFecha(referencia).replaceAll("/", "-");
    const descargas = [
      { pestana: "Despacho diario", prefijo: "despacho" },
      { pestana: "Rutas realizadas", prefijo: "rutas-realizadas" },
      { pestana: "Bitácora", prefijo: "bitacora" },
    ];
    for (const { pestana, prefijo } of descargas) {
      await page.getByRole("tab", { name: pestana, exact: true }).click();
      await capturaEvidencia(
        page,
        `pruebas-e2e/picking/evidencias/jc-09/aplicacion-${prefijo}-${info.project.name}.png`,
      );
      for (const extension of ["xlsx", "pdf"]) {
        const descargaLista = page.waitForEvent("download");
        await page.getByRole("button", { name: extension === "xlsx" ? "Excel" : "PDF", exact: true }).click();
        const descarga = await descargaLista;
        const sede = pestana === "Bitácora" ? "" : "-quetzaltenango";
        expect(descarga.suggestedFilename()).toBe(`${prefijo}${sede}-${fechaNombre}.${extension}`);
        expect(await descarga.failure()).toBeNull();
      }
    }
  } finally {
    ejecutar("limpiar", JSON.stringify(ids));
  }
});

for (const estado of [400, 403, 500]) {
  test(`RF-SL-38 / H-77: avisa cuando la exportación responde ${estado}`, async ({ page, context }, info) => {
    const inicio = await context.request.post("/api/auth/picking/sign-in/username", {
      headers: { origin: "http://localhost:3000", "x-real-ip": ipFixture(info.project.name) },
      data: { usuario: "ejemplo.02", clave: process.env.CLAVE_DEMO },
    });
    expect(inicio.ok()).toBe(true);
    await irA(page, "/picking/reportes");
    await expect(page.locator(".reportes")).toHaveAttribute("data-hidratado", "true");
    await page.route("**/api/reportes/exportar?**", (ruta) =>
      ruta.fulfill({ status: estado, body: "Error interno que no debe mostrarse" }),
    );
    await page.getByRole("button", { name: "Excel", exact: true }).click();
    await expect(page.getByRole("tabpanel").getByRole("alert")).toHaveText(
      "No se pudo completar la operación. Inténtelo de nuevo.",
    );
    await capturaEvidencia(
      page,
      `pruebas-e2e/picking/evidencias/jc-09/aplicacion-error-${estado}-${info.project.name}.png`,
    );
  });
}

test("RNF-04 (R-P01): al elegir la segunda sede en Reportes, Excel y PDF traen sus datos y su nombre", async ({
  page,
  context,
}, info) => {
  const ejecutar = (...args: string[]) =>
    execFileSync(process.execPath, ["--import", "tsx", "pruebas-e2e/picking/reportes-datos.ts", ...args], {
      encoding: "utf8",
    });
  // Los datos de prueba son de la primera sede (Quetzaltenango); Guatemala no tiene envíos ese día. Un día después
  // que la otra prueba, para que las dos puedan correr a la vez.
  const referencia = fechaFixture(info.project.name).replace(/-07$/, "-08");
  const ids = JSON.parse(ejecutar("crear", referencia)) as number[];
  try {
    const inicio = await context.request.post("/api/auth/picking/sign-in/username", {
      headers: { origin: "http://localhost:3000", "x-real-ip": `198.51.100.${30 + info.workerIndex}` },
      data: { usuario: "ejemplo.01", clave: process.env.CLAVE_DEMO },
    });
    expect(inicio.ok()).toBe(true);
    await irA(page, `/picking/reportes?tipo=dia&referencia=${referencia}`);
    await expect(page.locator(".reportes")).toHaveAttribute("data-hidratado", "true");
    const fechaNombre = formatoFecha(referencia).replaceAll("/", "-");
    const exportar = async (extension: "xlsx" | "pdf") => {
      const descargaLista = page.waitForEvent("download");
      await page.getByRole("button", { name: extension === "xlsx" ? "Excel" : "PDF", exact: true }).click();
      const descarga = await descargaLista;
      expect(await descarga.failure()).toBeNull();
      return descarga;
    };
    const filasDe = async (ruta: string) => {
      const libro = XLSX.read(readFileSync(ruta), { type: "buffer" });
      return XLSX.utils.sheet_to_json<unknown[]>(libro.Sheets[libro.SheetNames[0]!]!, {
        header: 1,
        raw: false,
        defval: "",
      });
    };

    // Primera sede: el despacho trae los productos de prueba.
    const primera = await exportar("xlsx");
    expect(primera.suggestedFilename()).toBe(`despacho-quetzaltenango-${fechaNombre}.xlsx`);
    const filasPrimera = await filasDe((await primera.path())!);
    expect(filasPrimera).toContainEqual(expect.arrayContaining(["Sede", "Quetzaltenango"]));
    expect(JSON.stringify(filasPrimera)).toContain("SODA CAUSTICA");

    // Segunda sede, elegida desde la pantalla: la exportación usa la sede que se ve, no la primera del usuario.
    await page.getByRole("combobox", { name: "Sede", exact: true }).selectOption({ label: "Guatemala" });
    await expect(page.getByRole("combobox", { name: "Sede", exact: true })).toBeEnabled();
    await expect(page.locator(".reportes")).toHaveAttribute("data-hidratado", "true");
    const segunda = await exportar("xlsx");
    expect(segunda.suggestedFilename()).toBe(`despacho-guatemala-${fechaNombre}.xlsx`);
    const filasSegunda = await filasDe((await segunda.path())!);
    expect(filasSegunda).toContainEqual(expect.arrayContaining(["Sede", "Guatemala"]));
    expect(JSON.stringify(filasSegunda)).not.toContain("SODA CAUSTICA");
    const pdf = await exportar("pdf");
    expect(pdf.suggestedFilename()).toBe(`despacho-guatemala-${fechaNombre}.pdf`);
    expect(
      readFileSync((await pdf.path())!)
        .subarray(0, 5)
        .toString(),
    ).toBe("%PDF-");
  } finally {
    ejecutar("limpiar", JSON.stringify(ids));
  }
});
