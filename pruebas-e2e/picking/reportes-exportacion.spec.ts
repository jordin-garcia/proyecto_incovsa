import { execFileSync } from "node:child_process";
import { expect, test } from "@playwright/test";
import { fechaGuatemala, formatoFecha } from "../../src/lib/fechas";

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
    await page.goto(`/picking/reportes?tipo=dia&referencia=${referencia}`);
    await expect(page.getByRole("heading", { name: "Reportes y bitácora" })).toBeVisible();

    const fechaNombre = formatoFecha(referencia).replaceAll("/", "-");
    const descargas = [
      { pestana: "Despacho diario", prefijo: "despacho" },
      { pestana: "Rutas realizadas", prefijo: "rutas-realizadas" },
      { pestana: "Bitácora", prefijo: "bitacora" },
    ];
    for (const { pestana, prefijo } of descargas) {
      await page.getByRole("tab", { name: pestana, exact: true }).click();
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
