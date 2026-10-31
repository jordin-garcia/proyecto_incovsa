// Prueba integral del Documento 6 §10 (JG-14, specs/16 decisiones 46 y 67): pedido facturado → conversión → picking →
// preparación → carga → despacho → estado → reporte, con el servidor de producción. La actualización de inventario no
// aplica (P-58). GitHub Actions la recorre cada día sobre develop (.github/workflows/recorrido-diario.yml).
import { expect, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { Client } from "pg";
import { fechaGuatemala, formatoFecha, inicioDelDiaGuatemala } from "../../src/lib/fechas";
import { test } from "./servidor-produccion";
import { cookieDeSede } from "../comunes/cookies";
import { irA } from "../comunes/navegacion";

try {
  process.loadEnvFile();
} catch {
  // En GitHub Actions las variables llegan del flujo, sin .env.
}

const ARCHIVO = "pruebas/fixtures/odoo/odoo-ejemplo-anonimizado.xlsx";
const HORA = "14:30";

// ---------- Conversión esperada (RN-01), calculada aparte de la aplicación, en gramos enteros ----------

function aGramos(kg: string): bigint {
  const [entero, decimales = ""] = kg.trim().split(".");
  return BigInt(entero) * 1000n + BigInt((decimales + "000").slice(0, 3));
}

/** Mismo formato que la aplicación: separador de miles y hasta 3 decimales, sin ceros a la derecha. */
function kg(gramos: bigint): string {
  const entero = (gramos / 1000n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const decimales = (gramos % 1000n).toString().padStart(3, "0").replace(/0+$/, "");
  return decimales ? `${entero}.${decimales}` : entero;
}

function convertir(cantidadKg: string, pesoKg: string) {
  const cantidad = aGramos(cantidadKg),
    peso = aGramos(pesoKg);
  return { unidades: cantidad / peso, resto: cantidad % peso };
}

const unidades = (n: bigint) => (n === 1n ? "1 unidad" : `${kg(n * 1000n)} unidades`);
const normalizar = (texto: string) => (texto.trim() || "-").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// ---------- Base de datos ----------

type Linea = { producto: string; lote: string; peso: string; cantidad: string };

let bd: Client | null = null;
let sedeId = 0;
let facturadorId = "";
let ultimoPedidoAnterior = 0;

async function consultar<T extends Record<string, unknown>>(sql: string, valores: unknown[] = []) {
  return (await bd!.query<T>(sql, valores)).rows;
}

async function estadoEnvio(envioId: number) {
  const [fila] = await consultar<{ estado: string; numero: number; tipo: string }>(
    `SELECT ee.nombre AS estado, e.numero, e.tipo FROM envio e JOIN estado_envio ee ON ee.id = e.estado_id
     WHERE e.id = $1`,
    [envioId],
  );
  return fila;
}

async function historial(envioId: number) {
  return (
    await consultar<{ estado: string }>(
      `SELECT ee.nombre AS estado FROM historial_estado h JOIN estado_envio ee ON ee.id = h.estado_id
       WHERE h.envio_id = $1 ORDER BY h.creado_en, h.id`,
      [envioId],
    )
  ).map((fila) => fila.estado);
}

async function lineas(envioId: number) {
  return consultar<Linea>(
    `SELECT producto, lote, peso_conversion_kg::text AS peso, cantidad_kg::text AS cantidad
     FROM linea_preparacion WHERE envio_id = $1 ORDER BY posicion, id`,
    [envioId],
  );
}

async function recorridoGuardado(envioId: number) {
  return (
    await consultar<{ cliente: string }>("SELECT cliente FROM entrega_ruta WHERE envio_id = $1 ORDER BY orden", [
      envioId,
    ])
  ).map((fila) => fila.cliente);
}

/** Borra solo lo que creó esta corrida: los envíos de sus pedidos facturados y esos pedidos. La bitácora no se borra. */
async function limpiar() {
  const envios = (
    await consultar<{ envio_id: number }>(
      `SELECT DISTINCT envio_id FROM pedido_facturado
       WHERE id > $1 AND cargado_por = $2 AND sede_id = $3 AND envio_id IS NOT NULL`,
      [ultimoPedidoAnterior, facturadorId, sedeId],
    )
  ).map((fila) => fila.envio_id);
  await bd!.query("BEGIN");
  try {
    await bd!.query("DELETE FROM historial_estado WHERE envio_id = ANY($1::int[])", [envios]);
    // Los detalles de los pedidos facturados, las líneas de preparación y las entregas se borran en cascada.
    await bd!.query("DELETE FROM pedido_facturado WHERE envio_id = ANY($1::int[])", [envios]);
    await bd!.query("DELETE FROM envio WHERE id = ANY($1::int[])", [envios]);
    await bd!.query("DELETE FROM pedido_facturado WHERE id > $1 AND cargado_por = $2 AND sede_id = $3", [
      ultimoPedidoAnterior,
      facturadorId,
      sedeId,
    ]);
    await bd!.query("COMMIT");
  } catch (error) {
    await bd!.query("ROLLBACK");
    throw error;
  }
}

test.beforeEach(async () => {
  const inicio = Date.now();
  test.setTimeout(600_000);
  expect(process.env.DATABASE_URL, "Se requiere la base con la semilla de demostración").toBeTruthy();
  expect(process.env.CLAVE_DEMO, "Se requiere CLAVE_DEMO").toBeTruthy();
  bd = new Client({ connectionString: process.env.DATABASE_URL });
  await bd.connect();
  // Comparte el tablero de Facturación de Quetzaltenango con facturacion-carga y facturacion-envio: una prueba a la vez.
  await bd.query("SELECT pg_advisory_lock(hashtext($1))", ["e2e:facturacion-envio"]);
  [{ id: sedeId }] = await consultar<{ id: number }>("SELECT id FROM sede WHERE nombre = 'Quetzaltenango'");
  [{ id: facturadorId }] = await consultar<{ id: string }>(
    "SELECT id FROM usuario WHERE username = 'picking.ejemplo.03'",
  );
  [{ ultimo: ultimoPedidoAnterior }] = await consultar<{ ultimo: number }>(
    "SELECT COALESCE(MAX(id), 0)::int AS ultimo FROM pedido_facturado",
  );
  // La espera del bloqueo no consume el tiempo del flujo.
  test.setTimeout(Date.now() - inicio + 300_000);
});

test.afterEach(async () => {
  if (!bd) return;
  try {
    await limpiar();
  } finally {
    await bd.end();
    bd = null;
  }
});

// ---------- Pantallas ----------

async function entrar(page: Page, baseURL: string, usuario: string) {
  // El servidor de producción se prueba sin Caddy: simula su cabecera de IP de confianza (decisión 29).
  await page.context().setExtraHTTPHeaders({ "x-real-ip": "127.0.0.1" });
  const respuesta = await page.context().request.post("/api/auth/picking/sign-in/username", {
    headers: { origin: baseURL },
    data: { usuario, clave: process.env.CLAVE_DEMO },
  });
  expect(respuesta.ok(), `Inicio de sesión de ${usuario}`).toBe(true);
}

async function abrir(page: Page, ruta: string, hidratado = ".app") {
  await irA(page, ruta);
  await expect(page.locator(hidratado).first()).toHaveAttribute("data-hidratado", "true");
}

/**
 * Mueve una tarjeta con el teclado: desde el tablero, → lleva a "Envío por camión" y ← a "Cliente recoge en bodega".
 * Espera a que el servidor guarde el movimiento y a que la pantalla lo muestre: el siguiente movimiento compara con
 * el estado que ve el facturador (decisión 39) y se rechazaría si la pantalla todavía no se actualizó.
 */
async function mover(page: Page, id: number, tecla: "ArrowRight" | "ArrowLeft", destino: string) {
  const tarjeta = page.locator(`article[data-pedido-id="${id}"]`);
  await conAccion(page, async () => {
    await tarjeta.focus();
    await page.keyboard.press("Space", { delay: 50 });
    await expect(tarjeta).toHaveAttribute("data-arrastrando", "true");
    await page.keyboard.press(tecla, { delay: 50 });
    await expect(page.getByRole("status").filter({ hasText: `Destino: ${destino}.` })).toBeAttached();
    await page.keyboard.press("Space", { delay: 50 });
    await expect(page.locator('[data-arrastrando="true"]')).toHaveCount(0);
  });
  await expect(page.getByRole("region", { name: destino, exact: true }).locator(tarjeta)).toHaveCount(1);
}

/** Espera la respuesta de la acción del servidor que dispara `accion`, con un tiempo propio para fallar pronto. */
async function conAccion(page: Page, accion: () => Promise<void>) {
  const respuesta = page.waitForResponse(
    (r) => r.request().method() === "POST" && !!r.request().headers()["next-action"],
    { timeout: 30_000 },
  );
  await accion();
  expect((await respuesta).ok()).toBe(true);
}

test("RN-11 / RN-52 / RN-29 / RF-SL-16 / RF-SL-24 / RF-SL-29 / RF-SL-37 / RF-SL-38 / RNF-06: flujo completo de un pedido facturado hasta el reporte", async ({
  page,
  baseURL,
}, info) => {
  const proyecto = info.project.name;
  const hoy = fechaGuatemala(new Date());
  const hoyTexto = formatoFecha(hoy);
  const inicioCorrida = new Date();
  let paso = 0;

  async function capturar(nombre: string) {
    const imagen = await page.screenshot({ fullPage: true });
    const archivo = `${String(++paso).padStart(2, "0")}-${nombre}-${proyecto}.png`;
    await info.attach(archivo, { body: imagen, contentType: "image/png" });
    // Evidencia del Documento 6 dentro del repositorio solo con EVIDENCIA=1 (plan/convenciones.md §6).
    if (process.env.EVIDENCIA === "1") {
      await mkdir("plan/evidencias/JG-14", { recursive: true });
      await writeFile(`plan/evidencias/JG-14/${archivo}`, imagen);
    }
  }

  // RN-52: la numeración diaria solo empieza en 1 si la sede no tiene rutas ni pedidos de hoy.
  const [previos] = await consultar<{ envios: number; cambios: number }>(
    `SELECT (SELECT COUNT(*) FROM envio WHERE sede_id = $1 AND fecha_envio = $2::date)::int AS envios,
            (SELECT COUNT(*) FROM historial_estado h JOIN envio e ON e.id = h.envio_id
             WHERE e.sede_id = $1 AND h.creado_en >= $3)::int AS cambios`,
    [sedeId, hoy, inicioDelDiaGuatemala(hoy)],
  );
  expect(
    previos,
    "La prueba integral necesita una base sin rutas, pedidos ni cambios de estado de hoy en Quetzaltenango (RN-52)",
  ).toEqual({ envios: 0, cambios: 0 });

  // ---------- 1. Facturación: carga del archivo de Odoo ----------
  await entrar(page, baseURL!, "ejemplo.03");
  await abrir(page, "/picking/facturacion");
  const camion = page.getByRole("region", { name: "Envío por camión", exact: true });
  const recoge = page.getByRole("region", { name: "Cliente recoge en bodega", exact: true });
  // Una corrida interrumpida pudo dejar pedidos facturados en una opción de envío: regresan al tablero.
  for (const opcion of [camion, recoge]) {
    if (await opcion.locator("article").count()) {
      await opcion.getByRole("button", { name: "Cancelar", exact: true }).click();
      await page.getByRole("dialog").getByRole("button", { name: "Regresar al tablero", exact: true }).click();
      await expect(opcion.locator("article")).toHaveCount(0);
    }
  }

  await test.step("RF-SL-16: el facturador carga el archivo y ve el resumen", async () => {
    await page.getByLabel("Cargar archivo .xlsx").setInputFiles(ARCHIVO);
    const resumen = page.getByRole("dialog");
    await expect(resumen).toContainText("33 pedido(s) facturado(s) de Quetzaltenango se agregaron al tablero");
    await expect(resumen).toContainText(
      "46 pedido(s) facturado(s) no se cargaron porque tienen líneas con el Peso de Conversión en 0 o vacío (RN-50)",
    );
    await capturar("facturacion-resumen-carga");
    await resumen.getByRole("button", { name: "Listo", exact: true }).click();
    const [{ cargados }] = await consultar<{ cargados: number }>(
      `SELECT COUNT(*)::int AS cargados FROM pedido_facturado
       WHERE id > $1 AND cargado_por = $2 AND sede_id = $3 AND envio_id IS NULL`,
      [ultimoPedidoAnterior, facturadorId, sedeId],
    );
    expect(cargados).toBe(33);
  });

  // Tres pedidos facturados de clientes distintos para la ruta (RN-49: una fila por cliente) y otro para el pedido.
  const cargados = await consultar<{ id: number; numero_odoo: string; cliente: string; sector: string }>(
    `SELECT id, numero_odoo, cliente, sector FROM pedido_facturado
     WHERE id > $1 AND cargado_por = $2 AND sede_id = $3 ORDER BY posicion, id`,
    [ultimoPedidoAnterior, facturadorId, sedeId],
  );
  const clientes = new Set<string>();
  const distintos = cargados.filter((p) => {
    const clave = `${normalizar(p.cliente)}|${normalizar(p.sector)}`;
    if (clientes.has(clave)) return false;
    clientes.add(clave);
    return true;
  });
  expect(distintos.length, "El archivo de prueba debe tener al menos 4 clientes distintos").toBeGreaterThanOrEqual(4);
  const deRuta = distintos.slice(0, 3);
  const dePedido = distintos[3];

  let rutaId = 0;
  await test.step("RF-SL-24 / RN-52: tres pedidos facturados al camión crean la Ruta 1 del día", async () => {
    for (const pedido of deRuta) await mover(page, pedido.id, "ArrowRight", "Envío por camión");
    await expect(camion.locator("article")).toHaveCount(3);
    await camion.getByLabel("Camión *", { exact: true }).selectOption({ label: "Camión 1 · 3,400 kg" });
    await camion.getByLabel("Piloto *", { exact: true }).selectOption({ label: "Usuario de ejemplo 06" });
    await camion.getByLabel("Fecha programada de envío *", { exact: true }).fill(hoyTexto.replaceAll("/", ""));
    const hora = camion.getByLabel("Hora programada *", { exact: true });
    await hora.fill(HORA.replace(":", ""));
    await hora.blur();
    await capturar("facturacion-envio-por-camion");
    await camion.getByRole("button", { name: "Enviar a Bodega", exact: true }).click();
    const confirmacion = page.getByRole("dialog");
    await expect(confirmacion).toContainText("Se crea la Ruta 1 de hoy en Quetzaltenango con 3 pedido(s) facturado(s)");
    await expect(confirmacion).toContainText(`Programada para el ${hoyTexto} a las ${HORA}. Pasa a En Preparación`);
    await expect(confirmacion).toContainText("Camión 1 · Usuario de ejemplo 06.");
    await capturar("facturacion-confirmar-ruta");
    await confirmacion.getByRole("button", { name: "Enviar a Bodega", exact: true }).click();
    const enviada = page.getByRole("dialog");
    await expect(enviada).toContainText("Ruta 1 enviada a Bodega");
    await expect(enviada).toContainText("quedó En Preparación y ya aparece en Bodega");
    await capturar("facturacion-ruta-enviada");
    await enviada.getByRole("button", { name: "Seguir en Facturación", exact: true }).click();
    await expect(camion.locator("article")).toHaveCount(0);

    [{ envio_id: rutaId }] = await consultar<{ envio_id: number }>(
      "SELECT DISTINCT envio_id FROM pedido_facturado WHERE id = ANY($1::int[])",
      [deRuta.map((p) => p.id)],
    );
    expect(await estadoEnvio(rutaId)).toEqual({ estado: "En Preparación", numero: 1, tipo: "ruta" });
    expect(await historial(rutaId)).toEqual(["En Preparación"]);
    // RNF-06: la ruta se guardó completa, con sus líneas de preparación, sus clientes y su registro de bitácora.
    expect((await lineas(rutaId)).length).toBeGreaterThan(0);
    expect(await recorridoGuardado(rutaId)).toHaveLength(3);
    const [{ registros }] = await consultar<{ registros: number }>(
      "SELECT COUNT(*)::int AS registros FROM bitacora WHERE operacion = 'Envío de ruta a bodega' AND registro_id = $1",
      [String(rutaId)],
    );
    expect(registros).toBe(1);
  });

  let pedidoId = 0;
  await test.step("RF-SL-24 / RN-52: un pedido facturado que el cliente recoge crea el Pedido 1 del día", async () => {
    await mover(page, dePedido.id, "ArrowLeft", "Cliente recoge en bodega");
    await expect(recoge.locator("article")).toHaveCount(1);
    await recoge.getByLabel("Fecha programada de despacho *", { exact: true }).fill(hoyTexto.replaceAll("/", ""));
    const hora = recoge.getByLabel("Hora programada *", { exact: true });
    await hora.fill(HORA.replace(":", ""));
    await hora.blur();
    await recoge.getByRole("button", { name: "Enviar a Bodega", exact: true }).click();
    const confirmacion = page.getByRole("dialog");
    await expect(confirmacion).toContainText(
      "Se crea el Pedido 1 de hoy en Quetzaltenango con 1 pedido(s) facturado(s)",
    );
    await expect(confirmacion).toContainText("El cliente recoge en bodega: no pasa por Ruta.");
    await capturar("facturacion-confirmar-pedido");
    await confirmacion.getByRole("button", { name: "Enviar a Bodega", exact: true }).click();
    const enviado = page.getByRole("dialog");
    await expect(enviado).toContainText("Pedido 1 enviado a Bodega");
    await expect(enviado).toContainText("quedó En Preparación y ya aparece en Bodega");
    await enviado.getByRole("button", { name: "Seguir en Facturación", exact: true }).click();
    await expect(recoge.locator("article")).toHaveCount(0);

    [{ envio_id: pedidoId }] = await consultar<{ envio_id: number }>(
      "SELECT envio_id FROM pedido_facturado WHERE id = $1",
      [dePedido.id],
    );
    expect(await estadoEnvio(pedidoId)).toEqual({ estado: "En Preparación", numero: 1, tipo: "pedido" });
    expect(await historial(pedidoId)).toEqual(["En Preparación"]);
  });

  // ---------- 2. Bodega: conversión, preparación y despacho ----------
  const lineasRuta = await lineas(rutaId);
  const lineasPedido = await lineas(pedidoId);
  await entrar(page, baseURL!, "ejemplo.05");
  await abrir(page, "/picking/bodega");
  const tarjetaRuta = page.locator(`article.ped[data-id="${rutaId}"]`);
  const tarjetaPedido = page.locator(`article.ped[data-id="${pedidoId}"]`);

  await test.step("RF-SL-29 / RN-01 / RN-53: Bodega ve la ruta y el pedido con su programación y su conversión", async () => {
    for (const [tarjetaEnvio, tipo] of [
      [tarjetaRuta, "RUTA"],
      [tarjetaPedido, "PEDIDO"],
    ] as const) {
      await expect(tarjetaEnvio.locator(".ped-num")).toHaveText(new RegExp(`^${tipo}\\s*1$`));
      await expect(tarjetaEnvio.locator(".ped-meta .prog")).toContainText(`Programada ${hoyTexto} · ${HORA}`);
    }
    // Una fila con lote y, si hay, con resto, para comprobar "N unidades + R kg".
    const todas = [
      ...lineasRuta.map((l) => ({ ...l, tarjeta: tarjetaRuta })),
      ...lineasPedido.map((l) => ({ ...l, tarjeta: tarjetaPedido })),
    ].filter((l) => l.lote !== "");
    expect(todas.length, "Debe haber al menos una línea con lote").toBeGreaterThan(0);
    const linea = todas.find((l) => convertir(l.cantidad, l.peso).resto > 0n) ?? todas[0];
    const { unidades: n, resto } = convertir(linea.cantidad, linea.peso);
    const fila = linea.tarjeta
      .locator("tr")
      .filter({ hasText: linea.producto })
      .filter({ hasText: `Lote ${linea.lote}` })
      .filter({ hasText: `÷ ${kg(aGramos(linea.peso))}` });
    await expect(fila).toHaveCount(1);
    await expect(fila.locator(".kg")).toHaveText(kg(aGramos(linea.cantidad)));
    await expect(fila.locator(".unid")).toContainText(unidades(n));
    if (resto > 0n) await expect(fila.locator(".resto")).toHaveText(`+ ${kg(resto)} kg`);
    else await expect(fila.locator(".resto")).toHaveCount(0);
    await fila.scrollIntoViewIfNeeded();
    await capturar("bodega-ruta-y-pedido");
  });

  await test.step("RF-SL-37 / RN-11: Bodega prepara y despacha la ruta (En Ruta) y el pedido (Despachado)", async () => {
    for (const [tarjetaEnvio, envioId, total, boton, estado] of [
      [tarjetaRuta, rutaId, lineasRuta.length, "Ruta Despachada", "En Ruta"],
      [tarjetaPedido, pedidoId, lineasPedido.length, "Pedido Despachado", "Despachado"],
    ] as const) {
      const nombre = boton.startsWith("Ruta") ? "Ruta 1" : "Pedido 1";
      await conAccion(page, () => tarjetaEnvio.getByRole("button", { name: "Marcar todo", exact: true }).click());
      await expect(tarjetaEnvio.locator("tr.lista")).toHaveCount(total);
      await expect(tarjetaEnvio.locator(".ped-avance")).toContainText(`${total} de ${total}`);
      await expect(tarjetaEnvio).toContainText(`Todo listo. Al despachar pasa a ${estado}.`);
      await capturar(`bodega-${boton.startsWith("Ruta") ? "ruta" : "pedido"}-lista`);
      await tarjetaEnvio.getByRole("button", { name: boton, exact: true }).click();
      const confirmacion = page.getByRole("dialog");
      await expect(confirmacion).toContainText(`Despachar ${nombre}`);
      await confirmacion.getByRole("button", { name: boton, exact: true }).click();
      await expect(page.locator(".toast.t-exito").filter({ hasText: `${nombre} → ${estado}.` })).toBeVisible();
      await expect(tarjetaEnvio).toHaveCount(0);
      expect((await estadoEnvio(envioId)).estado).toBe(estado);
      expect(await historial(envioId)).toEqual(["En Preparación", estado]);
    }
    await capturar("bodega-despachados");
  });

  // ---------- 3. Ruta: el piloto reordena el recorrido y entrega ----------
  let recorrido: string[] = [];
  await test.step("RF-SL-38 / RN-29 / RN-11: el piloto reordena dos clientes y entrega la ruta", async () => {
    await entrar(page, baseURL!, "ejemplo.06");
    await abrir(page, "/picking/ruta");
    const opcionRuta = page.locator(`button.ruta-op[data-r="${rutaId}"]`);
    await expect(opcionRuta).toContainText("Ruta 1");
    await expect(opcionRuta.locator(".estado-ruta")).toHaveText("En Ruta");
    await opcionRuta.click();
    const paradas = page.locator("tbody[data-paradas] tr");
    const inicial = await recorridoGuardado(rutaId);
    expect(inicial).toHaveLength(3);
    for (const [i, cliente] of inicial.entries()) await expect(paradas.nth(i)).toContainText(cliente);
    await capturar("ruta-antes-de-reordenar");

    // Mueve el primer cliente al segundo lugar con el teclado (dnd-kit).
    recorrido = [inicial[1], inicial[0], inicial[2]];
    await conAccion(page, async () => {
      await page.locator(".asa").first().focus();
      await page.keyboard.press("Space");
      await page.waitForTimeout(300);
      await page.keyboard.press("ArrowDown");
      await page.waitForTimeout(300);
      await page.keyboard.press("Space");
    });
    for (const [i, cliente] of recorrido.entries()) await expect(paradas.nth(i)).toContainText(cliente);
    expect(await recorridoGuardado(rutaId)).toEqual(recorrido);
    await capturar("ruta-reordenada");

    await page.getByRole("button", { name: "Ruta Entregada", exact: true }).click();
    const confirmacion = page.getByRole("dialog");
    await expect(confirmacion).toContainText("Entregar Ruta 1");
    await expect(confirmacion).toContainText(
      `Se guarda este recorrido: ${recorrido.map((c, i) => `${i + 1}. ${c}`).join(" · ")}.`,
    );
    await capturar("ruta-confirmar-entrega");
    await confirmacion.getByRole("button", { name: "Ruta Entregada", exact: true }).click();
    await expect(
      page
        .locator(".toast.t-exito")
        .filter({ hasText: "Ruta 1 entregada. Quedó en el registro histórico de Reportes." }),
    ).toBeVisible();
    await expect(opcionRuta).toHaveCount(0);
    expect((await estadoEnvio(rutaId)).estado).toBe("Entregado");
    expect(await historial(rutaId)).toEqual(["En Preparación", "En Ruta", "Entregado"]);
    // RN-29: el recorrido guardado es el orden de las filas al pulsar "Ruta Entregada".
    expect(await recorridoGuardado(rutaId)).toEqual(recorrido);
  });

  // ---------- 4. Reportes: despacho, rutas realizadas y bitácora del día ----------
  await test.step("RF-SL-37 / RN-11 / RN-39: Gerencia ve el despacho, la ruta entregada y la bitácora de hoy", async () => {
    await entrar(page, baseURL!, "ejemplo.01");
    await page.context().addCookies([cookieDeSede(sedeId, baseURL!, { produccion: true })]);
    await abrir(page, "/picking/reportes", ".reportes");
    await expect(page.locator(".periodo")).toHaveAttribute("aria-busy", "false");
    await expect(page.getByRole("textbox", { name: "Fecha del periodo", exact: true })).toHaveValue(hoyTexto);

    // Despacho: las líneas de la ruta y del pedido, agrupadas por producto y Peso de Conversión.
    const grupos = new Map<string, { cantidad: bigint; peso: string }>();
    for (const l of [...lineasRuta, ...lineasPedido]) {
      const clave = `${l.producto}|${aGramos(l.peso)}`;
      grupos.set(clave, { peso: l.peso, cantidad: (grupos.get(clave)?.cantidad ?? 0n) + aGramos(l.cantidad) });
    }
    let totalKg = 0n,
      totalUnidades = 0n,
      totalResto = 0n;
    for (const { cantidad, peso } of grupos.values()) {
      totalKg += cantidad;
      totalUnidades += cantidad / aGramos(peso);
      totalResto += cantidad % aGramos(peso);
    }
    await page.getByRole("tab", { name: "Despacho diario", exact: true }).click();
    const kpi = (etiqueta: string) => page.locator(".kpi").filter({ has: page.getByText(etiqueta, { exact: true }) });
    await expect(kpi("Kilogramos despachados").locator("b")).toHaveText(kg(totalKg));
    await expect(kpi("Unidades completas").locator("b")).toHaveText(kg(totalUnidades * 1000n));
    await expect(kpi("Unidades completas").locator("small")).toHaveText(`más ${kg(totalResto)} kg sueltos`);
    await expect(kpi("Rutas y pedidos cerrados").locator("small")).toHaveText("1 rutas · 1 pedidos");
    await expect(kpi("Rutas entregadas").locator("b")).toHaveText("1");
    const pie = page.getByRole("row").filter({ hasText: "Total del periodo" });
    await expect(pie).toContainText(kg(totalKg));
    await expect(pie).toContainText(`${kg(totalUnidades * 1000n)} unidades + ${kg(totalResto)} kg`);
    await capturar("reportes-despacho");

    // Rutas realizadas: la Ruta 1 Entregada con el recorrido del paso 3.
    await page.getByRole("tab", { name: "Rutas realizadas", exact: true }).click();
    const filaRuta = page
      .getByRole("row")
      .filter({ has: page.getByRole("cell", { name: "1", exact: true }) })
      .filter({ hasText: "Camión 1" });
    await expect(filaRuta).toHaveCount(1);
    await expect(filaRuta).toContainText("Usuario de ejemplo 06");
    await expect(filaRuta).toContainText("Entregado");
    await expect(filaRuta).toContainText(recorrido.map((c, i) => `${i + 1}. ${c}`).join(" → "));
    await capturar("reportes-rutas-realizadas");

    // Bitácora: la carga, los envíos, los cambios de estado y el cierre de ruta.
    await page.getByRole("tab", { name: "Bitácora", exact: true }).click();
    const bitacora = page.getByRole("row");
    for (const [operacion, detalle] of [
      ["Carga de archivo de Odoo", "odoo-ejemplo-anonimizado.xlsx · 33 pedido(s) facturado(s) cargado(s)"],
      ["Envío de ruta a bodega", `Ruta 1 del ${hoyTexto} · programada ${hoyTexto} · ${HORA} · Camión 1`],
      ["Envío de pedido a bodega", `Pedido 1 del ${hoyTexto} · programada ${hoyTexto} · ${HORA} · cliente recoge`],
      ["Cambio de estado", `Ruta 1 del ${hoyTexto} pasa a En Ruta`],
      ["Cambio de estado", `Pedido 1 del ${hoyTexto} pasa a Despachado`],
      ["Cierre de ruta", `Ruta 1 del ${hoyTexto} entregada`],
    ]) {
      await expect(bitacora.filter({ hasText: operacion }).filter({ hasText: detalle }).first()).toBeVisible();
    }
    await capturar("reportes-bitacora");

    // La bitácora no se borra: en la base se comprueban los registros de esta corrida.
    const registros = await consultar<{ operacion: string; registro_id: string | null }>(
      `SELECT operacion, registro_id FROM bitacora
       WHERE creado_en >= $1 AND operacion = ANY($2::text[]) AND (registro_id = ANY($3::text[]) OR operacion = $4)
         AND usuario_id IN (SELECT id FROM usuario WHERE username = ANY($5::text[]))
       ORDER BY creado_en, id`,
      [
        inicioCorrida,
        [
          "Carga de archivo de Odoo",
          "Envío de ruta a bodega",
          "Envío de pedido a bodega",
          "Cambio de estado",
          "Cierre de ruta",
        ],
        [String(rutaId), String(pedidoId)],
        "Carga de archivo de Odoo",
        ["picking.ejemplo.03", "picking.ejemplo.05", "picking.ejemplo.06"],
      ],
    );
    expect(registros.map((r) => r.operacion)).toEqual([
      "Carga de archivo de Odoo",
      "Envío de ruta a bodega",
      "Envío de pedido a bodega",
      "Cambio de estado",
      "Cambio de estado",
      "Cierre de ruta",
    ]);
  });
});
