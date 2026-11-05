import { expect, test, type Page } from "@playwright/test";
import { Client } from "pg";
import { irA, recargar } from "../comunes/navegacion";

// JG-33: al soltar, el pedido facturado aparece de inmediato en su destino, sin regresar antes a su lugar (como en el
// prototipo), y con pedidos seleccionados el tablero ofrece un botón por opción de envío.

const tarjeta = (page: Page, id: number) => page.locator(`article[data-pedido-id="${id}"]`);
const opcion = (page: Page, nombre: string) => page.getByRole("region", { name: nombre, exact: true });
const aviso =
  "Otro facturador modificó estos pedidos. La pantalla se actualizará; revisa los cambios e inténtalo de nuevo";

/** Levanta la tarjeta con el teclado y la lleva a la zona de la derecha, sin soltarla. */
async function levantar(page: Page, id: number, destino: string) {
  const fila = tarjeta(page, id);
  await fila.focus();
  await page.keyboard.press("Space", { delay: 50 });
  await expect(fila).toHaveAttribute("data-arrastrando", "true");
  await page.keyboard.press("ArrowRight", { delay: 50 });
  await expect(page.getByRole("status").filter({ hasText: `Destino: ${destino}.` })).toBeAttached();
}

let bd: Client;
const ids: number[] = [];

test.beforeEach(async ({ context, baseURL }) => {
  test.setTimeout(180_000);
  expect(process.env.DATABASE_URL, "Se requiere una base local de demostración").toBeTruthy();
  bd = new Client({ connectionString: process.env.DATABASE_URL });
  await bd.connect();
  // Comparte el tablero de Facturación de Quetzaltenango con las demás pruebas de Facturación: una a la vez.
  await bd.query("SELECT pg_advisory_lock(hashtext($1))", ["e2e:facturacion-envio"]);
  const {
    rows: [usuario],
  } = await bd.query<{ id: string }>("SELECT id FROM usuario WHERE username = 'picking.ejemplo.03'");
  const {
    rows: [sede],
  } = await bd.query<{ id: number }>("SELECT id FROM sede WHERE prefijo_odoo = 'XE'");
  for (let i = 0; i < 3; i++) {
    const {
      rows: [pedido],
    } = await bd.query<{ id: number }>(
      "INSERT INTO pedido_facturado(sede_id, numero_odoo, referencia, cliente, sector, posicion, cargado_por) VALUES ($1, $2, $3, $4, 'Zona 1', $5, $6) RETURNING id",
      [sede!.id, `JG33-${i}`, `XE-IN/SALIDA/JG33-${i}`, `Cliente de prueba JG33 ${i}`, 95000 + i, usuario!.id],
    );
    ids.push(pedido!.id);
    await bd.query(
      "INSERT INTO detalle_pedido_facturado(pedido_facturado_id, producto, lote, peso_conversion_kg, cantidad_kg, orden) VALUES ($1, 'Producto de prueba', '', 25, 25, 1)",
      [pedido!.id],
    );
  }
  await context.setExtraHTTPHeaders({ "x-real-ip": "127.0.0.1" });
  const respuesta = await context.request.post("/api/auth/picking/sign-in/username", {
    headers: { origin: baseURL! },
    data: { usuario: "ejemplo.03", clave: process.env.CLAVE_DEMO },
  });
  expect(respuesta.ok()).toBe(true);
});

test.afterEach(async () => {
  try {
    await bd.query("DELETE FROM pedido_facturado WHERE id = ANY($1::int[]) AND envio_id IS NULL", [ids]);
  } finally {
    ids.length = 0;
    await bd.end();
  }
});

async function abrir(page: Page) {
  await irA(page, "/picking/facturacion");
  await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
  await expect(tarjeta(page, ids[0]!)).toBeVisible();
}

/** Anota en cada cuadro si la tarjeta se está arrastrando y en qué zona está, hasta que se pida el resultado. */
async function grabar(page: Page, id: number) {
  await page.evaluate((id) => {
    const ventana = window as unknown as { __cuadros: string[]; __grabando: boolean };
    ventana.__cuadros = [];
    ventana.__grabando = true;
    const paso = () => {
      const elemento = document.querySelector(`article[data-pedido-id="${id}"]`);
      const zona = elemento?.closest("[data-testid]")?.getAttribute("data-testid") ?? "ninguna";
      ventana.__cuadros.push(`${elemento?.getAttribute("data-arrastrando")}|${zona}`);
      if (ventana.__grabando) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  }, id);
}

/** Lugar de la tarjeta dentro de una zona en cada cuadro, hasta que se pida el resultado. */
async function grabarLugar(page: Page, id: number, zona: string) {
  await page.evaluate(
    ([id, zona]) => {
      const ventana = window as unknown as { __cuadros: string[]; __grabando: boolean };
      ventana.__cuadros = [];
      ventana.__grabando = true;
      const paso = () => {
        const filas = [...document.querySelectorAll(`[data-testid="${zona}"] article`)];
        const elemento = document.querySelector(`article[data-pedido-id="${id}"]`);
        const lugar = filas.findIndex((fila) => fila.getAttribute("data-pedido-id") === String(id));
        ventana.__cuadros.push(`${elemento?.getAttribute("data-arrastrando")}|${lugar}`);
        if (ventana.__grabando) requestAnimationFrame(paso);
      };
      requestAnimationFrame(paso);
    },
    [id, zona] as const,
  );
}

/** Zonas en que se vio la tarjeta desde el primer cuadro después de soltarla. */
async function zonasDespuesDeSoltar(page: Page) {
  const cuadros = await page.evaluate(() => {
    const ventana = window as unknown as { __cuadros: string[]; __grabando: boolean };
    ventana.__grabando = false;
    return ventana.__cuadros;
  });
  const levantada = cuadros.findIndex((cuadro) => cuadro.startsWith("true|"));
  expect(levantada, "La tarjeta no llegó a levantarse").toBeGreaterThanOrEqual(0);
  const soltada = cuadros.findIndex((cuadro, i) => i > levantada && !cuadro.startsWith("true|"));
  expect(soltada, "La tarjeta no llegó a soltarse").toBeGreaterThan(levantada);
  return [...new Set(cuadros.slice(soltada).map((cuadro) => cuadro.split("|")[1]))];
}

/** Arrastra con el teclado (funciona igual en los tres proyectos) y espera a que se guarde. */
async function moverConTeclado(page: Page, id: number, destino: string) {
  const fila = tarjeta(page, id);
  await fila.focus();
  await grabar(page, id);
  await page.keyboard.press("Space", { delay: 50 });
  await expect(fila).toHaveAttribute("data-arrastrando", "true");
  await page.keyboard.press("ArrowRight", { delay: 50 });
  await expect(page.getByRole("status").filter({ hasText: `Destino: ${destino}.` })).toBeAttached();
  await page.keyboard.press("Space", { delay: 50 });
  // Se sigue grabando hasta que el servidor confirma, para notar también un regreso al llegar sus datos.
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 15_000 });
}

test("RF-SL-63: al soltar, el pedido facturado aparece en su destino sin regresar a su lugar", async ({ page }) => {
  await abrir(page);
  const id = ids[0]!;

  await moverConTeclado(page, id, "Envío por camión");
  expect(await zonasDespuesDeSoltar(page)).toEqual(["zona-camion"]);

  await moverConTeclado(page, id, "Cliente recoge en bodega");
  expect(await zonasDespuesDeSoltar(page)).toEqual(["zona-recoge"]);

  await moverConTeclado(page, id, "Tablero de pedidos facturados");
  expect(await zonasDespuesDeSoltar(page)).toEqual(["tablero-pedidos"]);

  await recargar(page);
  await expect(page.getByTestId("tablero-pedidos").locator(`[data-pedido-id="${id}"]`)).toHaveCount(1);
});

test("RF-SL-63 (04/11): con pedidos seleccionados, un botón por opción de envío los agrega al final de esa opción", async ({
  page,
}, info) => {
  await abrir(page);
  const [primero, segundo, tercero] = ids as [number, number, number];
  const tocar = (id: number) =>
    info.project.name === "escritorio" ? tarjeta(page, id).click() : tarjeta(page, id).tap();
  const botonCamion = page.getByRole("button", { name: "Envío por camión", exact: true });
  const botonRecoge = page.getByRole("button", { name: "Cliente recoge en bodega", exact: true });

  // Sin selección no hay botones; con selección aparecen junto a «Eliminar».
  await expect(botonCamion).toHaveCount(0);
  await expect(botonRecoge).toHaveCount(0);
  await tocar(primero);
  await tocar(segundo);
  await expect(page.getByText("2 seleccionado(s)", { exact: true })).toBeVisible();
  await expect(botonCamion).toBeVisible();
  await expect(botonRecoge).toBeVisible();
  await expect(page.getByRole("button", { name: "Eliminar", exact: true })).toBeVisible();

  await botonCamion.click();
  const filasCamion = opcion(page, "Envío por camión").locator("article");
  // Se agregan de inmediato, al final y en el orden del tablero; la selección se limpia.
  await expect(filasCamion.nth(-2)).toHaveAttribute("data-pedido-id", String(primero));
  await expect(filasCamion.last()).toHaveAttribute("data-pedido-id", String(segundo));
  await expect(page.getByTestId("tablero-pedidos").locator(`[data-pedido-id="${primero}"]`)).toHaveCount(0);
  await expect(botonCamion).toHaveCount(0);

  await tocar(tercero);
  await botonRecoge.click();
  await expect(opcion(page, "Cliente recoge en bodega").locator("article").last()).toHaveAttribute(
    "data-pedido-id",
    String(tercero),
  );

  // Lo que se agregó con los botones se guarda.
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 15_000 });
  await recargar(page);
  await expect(filasCamion.nth(-2)).toHaveAttribute("data-pedido-id", String(primero));
  await expect(filasCamion.last()).toHaveAttribute("data-pedido-id", String(segundo));
  await expect(opcion(page, "Cliente recoge en bodega").locator("article").last()).toHaveAttribute(
    "data-pedido-id",
    String(tercero),
  );
});

test("RN-48 / JG-33: dos movimientos seguidos, sin esperar a que se guarde el primero, se guardan sin conflicto", async ({
  page,
}) => {
  await abrir(page);
  const [primero, segundo] = ids as [number, number];
  for (const id of [primero, segundo]) {
    await levantar(page, id, "Envío por camión");
    await page.keyboard.press("Space", { delay: 50 });
    await expect(tarjeta(page, id)).toHaveAttribute("data-arrastrando", "false");
  }
  const filas = opcion(page, "Envío por camión").locator("article");
  await expect(filas.nth(-2)).toHaveAttribute("data-pedido-id", String(primero));
  await expect(filas.last()).toHaveAttribute("data-pedido-id", String(segundo));
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 15_000 });
  await expect(page.getByText(aviso, { exact: true })).toHaveCount(0);
  await recargar(page);
  await expect(filas.nth(-2)).toHaveAttribute("data-pedido-id", String(primero));
  await expect(filas.last()).toHaveAttribute("data-pedido-id", String(segundo));
});

test("RN-48 / JG-33: si otro facturador cambia la opción mientras se arrastra, al soltar sale el aviso", async ({
  page,
  browser,
  baseURL,
}, info) => {
  await abrir(page);
  const otro = await browser.newContext({
    baseURL,
    viewport: info.project.use.viewport,
    extraHTTPHeaders: { "x-real-ip": "127.0.0.1" },
  });
  try {
    const respuesta = await otro.request.post("/api/auth/picking/sign-in/username", {
      headers: { origin: baseURL! },
      data: { usuario: "ejemplo.04", clave: process.env.CLAVE_DEMO },
    });
    expect(respuesta.ok()).toBe(true);
    const segunda = await otro.newPage();
    await abrir(segunda);
    // El primer facturador levanta un pedido hacia «Envío por camión» mientras el otro agrega otro a esa opción.
    await levantar(page, ids[0]!, "Envío por camión");
    await levantar(segunda, ids[1]!, "Envío por camión");
    await segunda.keyboard.press("Space", { delay: 50 });
    await expect(segunda.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 15_000 });
    await page.keyboard.press("Space", { delay: 50 });
    await expect(page.getByText(aviso, { exact: true })).toBeVisible();
    // La pantalla vuelve a lo guardado: el pedido sigue en el tablero y la opción trae el del otro facturador.
    await expect(page.getByTestId("tablero-pedidos").locator(`[data-pedido-id="${ids[0]}"]`)).toHaveCount(1);
    await expect(opcion(page, "Envío por camión").locator(`[data-pedido-id="${ids[1]}"]`)).toHaveCount(1);
  } finally {
    await otro.close();
  }
});

test("RF-SL-63: al reordenar dentro de una opción, el pedido queda en su nuevo lugar sin regresar", async ({
  page,
}) => {
  await abrir(page);
  const [primero, segundo] = ids as [number, number];
  await moverConTeclado(page, primero, "Envío por camión");
  await zonasDespuesDeSoltar(page);
  await moverConTeclado(page, segundo, "Envío por camión");
  await zonasDespuesDeSoltar(page);
  const filas = opcion(page, "Envío por camión").locator("article");
  const lugarDelPrimero = await filas.evaluateAll(
    (articulos, id) => articulos.findIndex((a) => a.getAttribute("data-pedido-id") === String(id)),
    primero,
  );
  // El segundo sube un lugar, antes del primero.
  const fila = tarjeta(page, segundo);
  await fila.focus();
  await grabarLugar(page, segundo, "zona-camion");
  await page.keyboard.press("Space", { delay: 50 });
  await expect(fila).toHaveAttribute("data-arrastrando", "true");
  await page.keyboard.press("ArrowUp", { delay: 50 });
  // El aviso «Destino: …» ya está en la página por los movimientos anteriores: se espera a que el primero sea el destino.
  await expect(tarjeta(page, primero)).toHaveAttribute("data-sobre", "true");
  await page.keyboard.press("Space", { delay: 50 });
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 15_000 });
  expect(await zonasDespuesDeSoltar(page)).toEqual([String(lugarDelPrimero)]);
  await recargar(page);
  await expect(filas.nth(lugarDelPrimero)).toHaveAttribute("data-pedido-id", String(segundo));
});
