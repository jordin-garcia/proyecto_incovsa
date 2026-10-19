import { expect, test, type BrowserContext } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { prisma } from "../../src/lib/prisma";

async function entrar(context: BrowserContext, usuario = "ejemplo.05") {
  expect(process.env.CLAVE_DEMO, "Se requiere la clave demo").toBeTruthy();
  const r = await context.request.post("/api/auth/picking/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario, clave: process.env.CLAVE_DEMO },
  });
  expect(r.ok()).toBe(true);
}

test.describe("Módulo de Bodega E2E", () => {
  let envioIdEjemplo: number;

  test.beforeAll(async () => {
    // Asegurar que existe el estado y usuarios
    const estadoPrep = await prisma.estadoEnvio.findUniqueOrThrow({ where: { nombre: "En Preparación" } });
    const usuarioBodega = await prisma.usuario.findFirstOrThrow({ where: { displayUsername: "ejemplo.05" } });
    const usuarioPiloto = await prisma.usuario.findFirstOrThrow({ where: { displayUsername: "ejemplo.06" } });
    const camion = await prisma.camion.findFirstOrThrow({ where: { sedeId: 1 } });

    // Limpiar envíos de prueba previos en sede 1 para un estado predecible
    await prisma.lineaPreparacion.deleteMany({ where: { envio: { sedeId: 1 } } });
    await prisma.detallePedidoFacturado.deleteMany({ where: { pedidoFacturado: { sedeId: 1 } } });
    await prisma.pedidoFacturado.deleteMany({ where: { sedeId: 1 } });
    await prisma.envio.deleteMany({ where: { sedeId: 1 } });

    // Crear el envío del ejemplo de los tres clientes (specs/07)
    const envio = await prisma.envio.create({
      data: {
        sedeId: 1,
        tipo: "ruta",
        numero: 1,
        fechaEnvio: new Date("2026-10-18T00:00:00Z"),
        programadoPara: new Date("2026-10-18T13:30:00-06:00"),
        estadoId: estadoPrep.id,
        enviadoPorId: usuarioBodega.id,
        camionId: camion.id,
        pilotoId: usuarioPiloto.id,
        posicionCola: 1,
        lineas: {
          create: [
            {
              producto: "SULFATO DE SODIO",
              lote: "5287",
              pesoConversionKg: 25,
              cantidadKg: 40,
              marcado: false,
              posicion: 1,
            },
            {
              producto: "SULFATO DE SODIO",
              lote: "9221",
              pesoConversionKg: 25,
              cantidadKg: 10,
              marcado: false,
              posicion: 2,
            },
          ],
        },
        pedidosFacturados: {
          create: [
            {
              sedeId: 1,
              numeroOdoo: "90001",
              referencia: "XE-IN/SALIDA/90001",
              cliente: "Cliente A",
              sector: "Zona 1",
              posicion: 1,
              cargadoPorId: usuarioBodega.id,
              detalles: {
                create: [
                  { producto: "SULFATO DE SODIO", lote: "5287", pesoConversionKg: 25, cantidadKg: 25, orden: 1 },
                ],
              },
            },
            {
              sedeId: 1,
              numeroOdoo: "90002",
              referencia: "XE-IN/SALIDA/90002",
              cliente: "Cliente B",
              sector: "Zona 2",
              posicion: 2,
              cargadoPorId: usuarioBodega.id,
              detalles: {
                create: [
                  { producto: "SULFATO DE SODIO", lote: "5287", pesoConversionKg: 25, cantidadKg: 15, orden: 1 },
                ],
              },
            },
            {
              sedeId: 1,
              numeroOdoo: "90003",
              referencia: "XE-IN/SALIDA/90003",
              cliente: "Cliente C",
              sector: "Zona 3",
              posicion: 3,
              cargadoPorId: usuarioBodega.id,
              detalles: {
                create: [
                  { producto: "SULFATO DE SODIO", lote: "9221", pesoConversionKg: 25, cantidadKg: 10, orden: 1 },
                ],
              },
            },
          ],
        },
      },
    });

    envioIdEjemplo = envio.id;
  });

  test("RF-SL-21 / RN-51 (CP-19): el envío muestra dos filas con lote resaltado y unidades correctas", async ({
    page,
    context,
  }) => {
    await entrar(context);
    await page.goto("/picking/bodega");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");

    const tarjeta = page.locator(`article[data-id="${envioIdEjemplo}"]`);
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

    const tarjeta = page.locator(`article[data-id="${envioIdEjemplo}"]`);
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
    await modal.getByRole("button", { name: "Cerrar" }).click();
    await expect(modal).not.toBeVisible();
  });

  test("RF-SL-23 / RN-20: marcar línea persiste al recargar y marcar todo marca todas", async ({ page, context }) => {
    await entrar(context);
    await page.goto("/picking/bodega");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");

    const tarjeta = page.locator(`article[data-id="${envioIdEjemplo}"]`);
    const fila5287 = tarjeta.locator("tr", { hasText: "Lote 5287" });
    const botonMarca = fila5287.locator("button.marca");

    // Marcar línea 1
    await botonMarca.click();
    await expect(botonMarca).toHaveClass(/on/);
    await expect(fila5287).toHaveClass(/lista/);

    // Recargar y confirmar persistencia
    await page.reload();
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
    const tarjetaRecargada = page.locator(`article[data-id="${envioIdEjemplo}"]`);
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

    const tarjeta = page.locator(`article[data-id="${envioIdEjemplo}"]`);
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
    await expect(page.locator(`article[data-id="${envioIdEjemplo}"]`)).not.toBeVisible();
    await expect(page.locator(".vacio")).toContainText("No hay rutas ni pedidos por preparar");
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
});
