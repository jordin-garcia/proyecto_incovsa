import { execSync } from "node:child_process";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { comprobarEncabezadoModulo } from "../comunes/encabezado";

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

/** Entra con Gerencia, que trabaja en todas las sedes, y fija la sede de trabajo con su cookie. */
async function entrarEnSede(context: BrowserContext, baseURL: string | undefined, sedeId: number) {
  await entrar(context, "ejemplo.01");
  await context.addCookies([{ name: "incovsa-sede", value: String(sedeId), url: baseURL ?? "" }]);
}

/** Violaciones serias o críticas de axe con todas sus reglas, incluido el contraste (RNF-08, JM-08). */
async function violacionesGraves(page: Page) {
  // Las animaciones de entrada (tarjetas, ventanas) cambian la opacidad: se mide al terminar. Las infinitas
  // (indicadores que pulsan) no terminan nunca y no se esperan; una animación cancelada rechaza `finished`.
  await page.evaluate(async () => {
    const enCurso = document
      .getAnimations()
      .filter(
        (animacion) =>
          animacion.playState === "running" && animacion.effect?.getComputedTiming().iterations !== Infinity,
      );
    await Promise.allSettled(enCurso.map((animacion) => animacion.finished));
  });
  // Única exclusión: la etiqueta del cuadro lima conserva los colores del prototipo por decisión del coordinador,
  // excepción documentada a RNF-08 (specs/18, 19/10). El resto de la tarjeta del pedido sí se analiza.
  const resultado = await new AxeBuilder({ page }).exclude(".ped-num.recoge small").analyze();
  return resultado.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => ({ regla: v.id, nodos: v.nodes.map((n) => `${n.target.join(" ")} · ${n.failureSummary ?? ""}`) }));
}

const NUMEROS_POR_PROYECTO: Record<string, number> = {
  telefono: 1,
  tableta: 2,
  escritorio: 3,
};

test.describe("Módulo de Bodega E2E", () => {
  test.describe.configure({ mode: "serial" });

  let datosEnvio: { envioId: number; numero: number };
  let datosPedido: { envioId: number; numero: number };

  test.beforeAll(async ({}, testInfo) => {
    const numero = NUMEROS_POR_PROYECTO[testInfo.project.name] ?? 1;
    const crear = (tipo: "ruta" | "pedido", sedeId: number) =>
      JSON.parse(
        execSync(`npx tsx pruebas-e2e/picking/preparar-envio.ts crear ${numero} ${tipo} ${sedeId}`, {
          encoding: "utf-8",
        }).trim(),
      );
    datosEnvio = crear("ruta", 1);
    // El pedido va a Guatemala: la Bodega de Quetzaltenango la analiza sin exclusiones RN-38 (permisos.spec.ts), y el
    // cuadro lima conserva los colores del prototipo por decisión del coordinador (specs/18, 19/10).
    datosPedido = crear("pedido", 2);
  });

  test.afterAll(async () => {
    for (const datos of [datosEnvio, datosPedido]) {
      if (datos?.envioId) {
        execSync(`npx tsx pruebas-e2e/picking/preparar-envio.ts limpiar ${datos.envioId}`, { stdio: "inherit" });
      }
    }
  });

  test("Criterio 8 / RNF-08: Bodega con datos sin violaciones serias de axe, contraste incluido", async ({
    page,
    context,
  }) => {
    await entrar(context);
    await page.goto("/picking/bodega");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");

    await expect(page.locator(`article.ped[data-id="${datosEnvio.envioId}"]`)).toBeVisible();

    expect(await violacionesGraves(page)).toEqual([]);
  });

  test("RNF-08: pedido que recoge el cliente, con «Sin lote», y su Detalle sin violaciones serias de axe", async ({
    page,
    context,
    baseURL,
  }) => {
    await entrarEnSede(context, baseURL, 2);
    await page.goto("/picking/bodega");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");

    const tarjeta = page.locator(`article.ped[data-id="${datosPedido.envioId}"]`);
    await expect(tarjeta.locator(".ped-num.recoge")).toBeVisible();
    await expect(tarjeta.locator(".lote.sin")).toHaveText("Sin lote");
    expect(await violacionesGraves(page)).toEqual([]);

    await tarjeta.getByRole("button", { name: "Detalle de Pedido" }).click();
    const detalle = page.locator("[role=dialog]");
    await expect(detalle).toBeVisible();
    await expect(detalle.locator(".lote.sin")).toHaveText("Sin lote");
    expect(await violacionesGraves(page)).toEqual([]);
  });

  test("RNF-08: líneas marcadas sin violaciones serias de axe, contraste incluido", async ({ page, context }) => {
    await entrar(context);
    await page.goto("/picking/bodega");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");

    const tarjeta = page.locator(`article.ped[data-id="${datosEnvio.envioId}"]`);
    // Marcar todo pasa por una acción del servidor y un refresco: se espera más que el valor por omisión.
    const respuestaMarcarTodo = page.waitForResponse(
      (r) => r.request().method() === "POST" && !!r.request().headers()["next-action"],
    );
    await tarjeta.getByRole("button", { name: "Marcar todo" }).click();
    await expect(tarjeta.locator("tr.lista")).toHaveCount(2, { timeout: 15_000 });
    expect((await respuestaMarcarTodo).ok()).toBe(true);

    expect(await violacionesGraves(page)).toEqual([]);

    // Deja el envío sin marcar para las pruebas siguientes.
    const respuestaDesmarcarTodo = page.waitForResponse(
      (r) => r.request().method() === "POST" && !!r.request().headers()["next-action"],
    );
    await tarjeta.getByRole("button", { name: "Desmarcar todo" }).click();
    await expect(tarjeta.locator("tr.lista")).toHaveCount(0, { timeout: 15_000 });
    expect((await respuestaDesmarcarTodo).ok()).toBe(true);
    await page.reload();
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
    await expect(tarjeta.locator("tr.lista")).toHaveCount(0);
  });

  test("RNF-08: Detalle de Ruta sin violaciones serias de axe, contraste incluido", async ({ page, context }) => {
    await entrar(context);
    await page.goto("/picking/bodega");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");

    await page
      .locator(`article.ped[data-id="${datosEnvio.envioId}"]`)
      .getByRole("button", { name: "Detalle de Ruta" })
      .click();
    await expect(page.locator("[role=dialog]")).toBeVisible();

    expect(await violacionesGraves(page)).toEqual([]);
  });

  test("RNF-08: Bodega vacía sin violaciones serias de axe, contraste incluido", async ({ page, context, baseURL }) => {
    // Gerencia trabaja en todas las sedes; en Escuintla las pruebas no crean envíos.
    await entrarEnSede(context, baseURL, 3);
    await page.goto("/picking/bodega");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
    await expect(page.locator(".tarjeta.vacio")).toBeVisible();

    expect(await violacionesGraves(page)).toEqual([]);
  });

  test("RF-SL-21 / RN-51 (CP-19): el envío muestra dos filas con lote resaltado y unidades correctas", async ({
    page,
    context,
  }) => {
    await entrar(context);
    await page.goto("/picking/bodega");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");

    const tarjeta = page.locator(`article.ped[data-id="${datosEnvio.envioId}"]`);
    await expect(tarjeta).toBeVisible();

    // Ver cuadro RUTA {numero}
    await expect(tarjeta.locator(".ped-num")).toContainText("RUTA");
    await expect(tarjeta.locator(".ped-num")).toContainText(String(datosEnvio.numero));

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

    const tarjeta = page.locator(`article.ped[data-id="${datosEnvio.envioId}"]`);
    await expect(tarjeta.locator(".ped-meta .prog")).toContainText("Programada 18/10/2026 · 13:30");

    // Abrir detalle
    await tarjeta.getByRole("button", { name: "Detalle de Ruta" }).click();

    const modal = page.locator("[role=dialog]");
    await expect(modal).toBeVisible();
    await expect(modal.locator(".modal-cab")).toContainText(`Detalle de Ruta ${datosEnvio.numero}`);

    // Verificar fecha del envío y pedidos facturados del archivo
    await expect(modal.locator(".det-env")).toContainText("Fecha");
    await expect(modal.locator(".det-env")).toContainText("18/10/2026");
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

    const tarjeta = page.locator(`article.ped[data-id="${datosEnvio.envioId}"]`);
    const fila5287 = tarjeta.locator("tr", { hasText: "Lote 5287" });
    const botonMarca = fila5287.locator("button.marca");

    // Marcar línea 1
    const respuestaMarcado = page.waitForResponse(
      (r) => r.request().method() === "POST" && !!r.request().headers()["next-action"],
    );
    await botonMarca.click();
    await expect(botonMarca).toHaveClass(/on/);
    await expect(fila5287).toHaveClass(/lista/);

    // Recargar y confirmar persistencia
    expect((await respuestaMarcado).ok()).toBe(true);
    await page.reload();
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
    const tarjetaRecargada = page.locator(`article.ped[data-id="${datosEnvio.envioId}"]`);
    const filaRecargada = tarjetaRecargada.locator("tr", { hasText: "Lote 5287" });
    await expect(filaRecargada.locator("button.marca")).toHaveClass(/on/);

    // Botón Marcar todo
    const botonMarcarTodo = tarjetaRecargada.getByRole("button", { name: "Marcar todo" });
    const respuestaMarcarTodo = page.waitForResponse(
      (r) => r.request().method() === "POST" && !!r.request().headers()["next-action"],
    );
    await botonMarcarTodo.click();

    await expect(tarjetaRecargada.locator("tr.lista")).toHaveCount(2);
    await expect(tarjetaRecargada.locator(".ped-avance")).toContainText("2 de 2");
    expect((await respuestaMarcarTodo).ok()).toBe(true);

    // Desmarcar todo
    const botonDesmarcarTodo = tarjetaRecargada.getByRole("button", { name: "Desmarcar todo" });
    const respuestaDesmarcarTodo = page.waitForResponse(
      (r) => r.request().method() === "POST" && !!r.request().headers()["next-action"],
    );
    await botonDesmarcarTodo.click();
    await expect(tarjetaRecargada.locator("tr.lista")).toHaveCount(0);
    expect((await respuestaDesmarcarTodo).ok()).toBe(true);
    await page.reload();
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
    await expect(tarjetaRecargada.locator("tr.lista")).toHaveCount(0);
  });

  test("RF-SL-61 (auditoría H-17): el encabezado de Bodega tiene la estructura de cab() con la instrucción a la par del título", async ({
    page,
    context,
  }) => {
    await entrar(context);
    await page.goto("/picking/bodega");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
    await comprobarEncabezadoModulo(page, {
      eyebrow: "Módulo de bodega · tablero de preparación",
      titulo: "Rutas y pedidos por preparar",
      instruccion:
        "Arrastre una ruta, un pedido o una fila para cambiar la prioridad; se ve al instante en todas las pantallas de la sede.",
      accion: "Abrir tablero en pantalla completa",
    });
    await expect(page.locator(".cab-fx .acc a")).toHaveAttribute("href", "/picking/tablero");
  });

  test("RF-SL-75 / RNF-01 (auditoría H-18, H-19 y H-20): «Programada» en verde y negrita, avance y herramientas como el prototipo", async ({
    page,
    context,
  }) => {
    await entrar(context);
    await page.goto("/picking/bodega");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
    const tarjeta = page.locator(`article.ped[data-id="${datosEnvio.envioId}"]`);

    // H-18: `.ped-meta .prog` en --v700 y negrita (estilos.css:959); los demás datos siguen en gris.
    const verde700 = await page.evaluate(() => {
      const muestra = document.createElement("span");
      muestra.style.color = "var(--v700)";
      document.body.append(muestra);
      const color = getComputedStyle(muestra).color;
      muestra.remove();
      return color;
    });
    const programada = tarjeta.locator(".ped-meta .prog");
    await expect(programada).toHaveCSS("color", verde700);
    await expect(programada).toHaveCSS("font-weight", "700");
    await expect(tarjeta.locator(".ped-meta span:not(.prog)").first()).not.toHaveCSS("color", verde700);

    // H-20: `.ped-herr` con separación de 8 px, relleno 12px 22px y fondo blanco (estilos.css:960).
    const herramientas = tarjeta.locator(".ped-herr");
    await expect(herramientas).toHaveCSS("column-gap", "8px");
    await expect(herramientas).toHaveCSS("padding", "12px 22px");
    await expect(herramientas).toHaveCSS("background-color", "rgb(255, 255, 255)");

    // H-19: hasta 720 px, el avance ocupa todo el ancho de la cabecera de la tarjeta (estilos.css:659).
    const medidas = await tarjeta.locator(".ped-cab").evaluate((cab) => {
      const estilo = getComputedStyle(cab);
      const interior = cab.clientWidth - parseFloat(estilo.paddingLeft) - parseFloat(estilo.paddingRight);
      const avance = cab.querySelector(".ped-avance")!;
      return { interior, avance: avance.getBoundingClientRect().width, margen: getComputedStyle(avance).marginLeft };
    });
    if (page.viewportSize()!.width <= 720) {
      expect(Math.abs(medidas.avance - medidas.interior)).toBeLessThanOrEqual(1);
      expect(medidas.margen).toBe("0px");
    } else {
      expect(medidas.avance).toBeLessThan(medidas.interior);
    }
  });

  test("RF-SL-74 (auditoría H-21): en el Detalle se desplaza la ventana, no una zona interna", async ({
    page,
    context,
  }) => {
    await entrar(context);
    // Una ventana baja obliga a desplazar el Detalle de Ruta, que tiene tres pedidos facturados.
    await page.setViewportSize({ width: page.viewportSize()!.width, height: 560 });
    await page.goto("/picking/bodega");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
    await page
      .locator(`article.ped[data-id="${datosEnvio.envioId}"]`)
      .getByRole("button", { name: "Detalle de Ruta" })
      .click();
    const ventana = page.locator("[role=dialog]");
    await expect(ventana).toBeVisible();
    const grupos = ventana.locator(".det-grupos");
    await expect(grupos.locator(".det-g")).toHaveCount(3);
    await expect(grupos).toHaveCSS("max-height", "none");
    await expect(grupos).toHaveCSS("overflow-y", "visible");
    await expect(grupos).not.toHaveAttribute("role", "region");
    const desplazamiento = await ventana.evaluate((el) => {
      const zona = el.querySelector(".det-grupos")!;
      return {
        ventana: el.scrollHeight > el.clientHeight,
        grupos: zona.scrollHeight > zona.clientHeight + 1,
      };
    });
    expect(desplazamiento).toEqual({ ventana: true, grupos: false });
    // El último pedido facturado se alcanza desplazando la ventana.
    await grupos.locator(".det-g").last().scrollIntoViewIfNeeded();
    await expect(grupos.locator(".det-g").last()).toBeInViewport();
    expect(await violacionesGraves(page)).toEqual([]);
  });

  test("RF-SL-23 (auditoría H-24): sin red, la marca vuelve atrás con un mensaje y la pantalla sigue en uso", async ({
    page,
    context,
  }) => {
    await entrar(context);
    await page.goto("/picking/bodega");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
    const tarjeta = page.locator(`article.ped[data-id="${datosEnvio.envioId}"]`);
    const fila = tarjeta.locator("tbody tr").first();
    const marca = fila.locator("button.marca");
    await expect(fila).not.toHaveClass(/lista/);

    // Las acciones del servidor se cortan como si la tableta perdiera el wifi.
    const sinRed = (url: URL) => url.pathname === "/picking/bodega";
    await page.route(sinRed, (r) => (r.request().headers()["next-action"] ? r.abort("connectionreset") : r.continue()));
    await marca.click();
    await expect(page.locator(".toast.t-error")).toContainText(
      "No se pudo completar la operación. Inténtelo de nuevo.",
    );
    await expect(fila).not.toHaveClass(/lista/);
    await expect(marca).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByRole("heading", { level: 1, name: "Rutas y pedidos por preparar" })).toBeVisible();

    // Abrir el Detalle sin red tampoco pierde la pantalla.
    await tarjeta.getByRole("button", { name: "Detalle de Ruta" }).click();
    await expect(page.locator(".toast.t-error").last()).toContainText("No se pudo completar la operación");
    await expect(page.locator("[role=dialog]")).toHaveCount(0);
    await page.unroute(sinRed);

    // Al volver la red, la misma pantalla sigue funcionando.
    let respuesta = page.waitForResponse(
      (r) => r.request().method() === "POST" && !!r.request().headers()["next-action"],
    );
    await marca.click();
    expect((await respuesta).ok()).toBe(true);
    await expect(fila).toHaveClass(/lista/);
    respuesta = page.waitForResponse((r) => r.request().method() === "POST" && !!r.request().headers()["next-action"]);
    await marca.click();
    expect((await respuesta).ok()).toBe(true);
    await expect(fila).not.toHaveClass(/lista/);
  });

  test("RF-SL-24 / RN-11 (CP-38): despacho solo habilitado con todo marcado y pasa a En Ruta", async ({
    page,
    context,
  }) => {
    await entrar(context);
    await page.goto("/picking/bodega");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");

    const tarjeta = page.locator(`article.ped[data-id="${datosEnvio.envioId}"]`);
    const botonDespacho = tarjeta.getByRole("button", { name: "Ruta Despachada" });

    // Deshabilitado inicialmente
    await expect(botonDespacho).toBeDisabled();

    // Marcar todo
    const respuestaMarcarTodo = page.waitForResponse(
      (r) => r.request().method() === "POST" && !!r.request().headers()["next-action"],
    );
    await tarjeta.getByRole("button", { name: "Marcar todo" }).click();
    await expect(botonDespacho).toBeEnabled();
    expect((await respuestaMarcarTodo).ok()).toBe(true);

    // Pulsar botón de despacho
    await botonDespacho.click();

    // Modal de confirmación
    const modalConfirmacion = page.locator("[role=dialog]");
    await expect(modalConfirmacion).toBeVisible();
    await expect(modalConfirmacion.locator(".modal-cab")).toContainText(`Despachar Ruta ${datosEnvio.numero}`);
    await expect(modalConfirmacion).toContainText("La ruta pasa a En Ruta");

    // Confirmar
    const respuestaDespacho = page.waitForResponse(
      (r) => r.request().method() === "POST" && !!r.request().headers()["next-action"],
    );
    await modalConfirmacion.getByRole("button", { name: "Ruta Despachada" }).click();
    expect((await respuestaDespacho).ok()).toBe(true);

    // Ya no aparece en Bodega
    await expect(page.locator(`article.ped[data-id="${datosEnvio.envioId}"]`)).toHaveCount(0);
    await page.reload();
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
    await expect(page.locator(`article.ped[data-id="${datosEnvio.envioId}"]`)).toHaveCount(0);
  });

  test("Criterio 7: usuario sin pk.bodega ve pantalla sin acceso con textos del prototipo", async ({
    page,
    context,
  }) => {
    await entrar(context, "ejemplo.04");
    await page.goto("/picking/bodega");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");

    const sinAcceso = page.locator(".sin-acceso");
    await expect(sinAcceso).toBeVisible();
    await expect(sinAcceso).toContainText("Sus permisos no incluyen Bodega. Los asignan Gerencia o Soporte.");
    await expect(sinAcceso.getByRole("link", { name: "Ir a mi módulo" })).toBeVisible();
  });
});
