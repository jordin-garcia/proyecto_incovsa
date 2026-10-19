import { execSync } from "node:child_process";
import { expect, test, type BrowserContext } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

try {
  process.loadEnvFile();
} catch {
  // Ignorar si no existe
}

async function entrar(context: BrowserContext, usuario = "ejemplo.05") {
  expect(process.env.CLAVE_DEMO, "Se requiere la clave demo").toBeTruthy();
  const r = await context.request.post("/api/auth/picking/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario, clave: process.env.CLAVE_DEMO },
  });
  expect(r.ok()).toBe(true);
}

test.describe("Módulo de Bodega E2E", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    execSync("npx tsx pruebas-e2e/picking/preparar-envio.ts", { stdio: "inherit" });
  });

  test.afterAll(() => {
    execSync("npx tsx pruebas-e2e/picking/preparar-envio.ts limpiar", { stdio: "inherit" });
  });

  test("Criterio 8: sin violaciones serias de accesibilidad (axe)", async ({ page, context }) => {
    await entrar(context);
    await page.goto("/picking/bodega");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");

    const resultadosAxe = await new AxeBuilder({ page })
      .disableRules(["color-contrast"]) // los contrastes los controla el design system
      .analyze();

    const fallosGraves = resultadosAxe.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(fallosGraves).toEqual([]);
  });

  test("RF-SL-21 / RN-51 (CP-19): el envío muestra dos filas con lote resaltado y unidades correctas", async ({
    page,
    context,
  }) => {
    await entrar(context);
    await page.goto("/picking/bodega");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");

    const tarjeta = page.locator("article.ped").first();
    await expect(tarjeta).toBeVisible();

    // Ver cuadro RUTA 1
    await expect(tarjeta.locator(".ped-num")).toContainText("RUTA");
    await expect(tarjeta.locator(".ped-num")).toContainText("1");

    // Verificar filas
    const fila5287 = tarjeta.locator("tr", { hasText: "Lote 5287" });
    await expect(fila5287).toBeVisible();
    await expect(fila5287.locator(".lote")).toHaveText("Lote 5287");
    await expect(fila5287.locator(".kg")).toHaveText("40");
    await expect(fila5287.locator(".unid")).toContainText("1 unidad");
    await expect(fila5287.locator(".resto")).toHaveText("+ 15 kg");

    const fila9221 = tarjeta.locator("tr", { hasText: "Lote 9221" });
    await expect(fila9221).toBeVisible();
    await expect(fila9221.locator(".lote")).toHaveText("Lote 9221");
    await expect(fila9221.locator(".kg")).toHaveText("10");
    await expect(fila9221.locator(".unid")).toContainText("0 unidades");
    await expect(fila9221.locator(".resto")).toHaveText("+ 10 kg");
  });

  test("RF-SL-74 / RF-SL-75 (CP-36): fecha y hora programadas y Detalle de Ruta completo", async ({
    page,
    context,
  }) => {
    await entrar(context);
    await page.goto("/picking/bodega");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");

    const tarjeta = page.locator("article.ped").first();
    await expect(tarjeta.locator(".ped-meta .prog")).toContainText("Programada 18/10/2026 · 13:30");

    // Abrir detalle
    await tarjeta.getByRole("button", { name: "Detalle de Ruta" }).click();

    const modal = page.locator("[role=dialog]");
    await expect(modal).toBeVisible();
    await expect(modal.locator(".modal-cab")).toContainText("Detalle de Ruta 1");

    // Verificar pedidos facturados del archivo
    await expect(modal).toContainText("3 pedido(s) facturado(s)");
    await expect(modal).toContainText("90001 · Cliente A");
    await expect(modal).toContainText("90002 · Cliente B");
    await expect(modal).toContainText("90003 · Cliente C");

    // Cerrar detalle
    await modal.locator(".modal-cerrar").click();
    await expect(modal).not.toBeVisible();
  });

  test("RF-SL-23 / RN-20: marcar línea persiste al recargar y marcar todo marca todas", async ({ page, context }) => {
    await entrar(context);
    await page.goto("/picking/bodega");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");

    const tarjeta = page.locator("article.ped").first();
    const fila5287 = tarjeta.locator("tr", { hasText: "Lote 5287" });
    const botonMarca = fila5287.locator("button.marca");

    // Marcar línea 1
    await botonMarca.click();
    await expect(botonMarca).toHaveClass(/on/);
    await expect(fila5287).toHaveClass(/lista/);

    // Recargar y confirmar persistencia
    await page.reload();
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
    const tarjetaRecargada = page.locator("article.ped").first();
    const filaRecargada = tarjetaRecargada.locator("tr", { hasText: "Lote 5287" });
    await expect(filaRecargada.locator("button.marca")).toHaveClass(/on/);

    // Botón Marcar todo
    const botonMarcarTodo = tarjetaRecargada.getByRole("button", { name: "Marcar todo" });
    await botonMarcarTodo.click();

    await expect(tarjetaRecargada.locator("tr.lista")).toHaveCount(2);
    await expect(tarjetaRecargada.locator(".ped-avance")).toContainText("2 de 2");

    // Desmarcar todo
    const botonDesmarcarTodo = tarjetaRecargada.getByRole("button", { name: "Desmarcar todo" });
    await botonDesmarcarTodo.click();
    await expect(tarjetaRecargada.locator("tr.lista")).toHaveCount(0);
  });

  test("RF-SL-24 / RN-11 (CP-38): despacho solo habilitado con todo marcado y pasa a En Ruta", async ({
    page,
    context,
  }) => {
    await entrar(context);
    await page.goto("/picking/bodega");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");

    const tarjeta = page.locator("article.ped").first();
    const botonDespacho = tarjeta.getByRole("button", { name: "Ruta Despachada" });

    // Deshabilitado inicialmente
    await expect(botonDespacho).toBeDisabled();

    // Marcar todo
    await tarjeta.getByRole("button", { name: "Marcar todo" }).click();
    await expect(botonDespacho).toBeEnabled();

    // Pulsar botón de despacho
    await botonDespacho.click();

    // Modal de confirmación
    const modalConfirmacion = page.locator("[role=dialog]");
    await expect(modalConfirmacion).toBeVisible();
    await expect(modalConfirmacion.locator(".modal-cab")).toContainText("Despachar Ruta 1");
    await expect(modalConfirmacion).toContainText("La ruta pasa a En Ruta");

    // Confirmar
    await modalConfirmacion.getByRole("button", { name: "Ruta Despachada" }).click();

    // Ya no aparece en Bodega
    await expect(page.locator("article.ped")).toHaveCount(0);
    await expect(page.locator(".vacio")).toContainText("No hay rutas ni pedidos por preparar");
  });
});
