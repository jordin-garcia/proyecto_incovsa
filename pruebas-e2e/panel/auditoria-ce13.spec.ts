import { expect, test, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { Client } from "pg";
import sharp from "sharp";

try {
  process.loadEnvFile();
} catch {
  /* Variables de CI. */
}

const MENSAJE_MAPA =
  "El mapa debe ser la dirección del mapa insertado de Google Maps (https://www.google.com/maps/embed?…).";

async function entrar(page: Page, sistema: "sitio" | "picking", usuario: string) {
  const respuesta = await page.request.post(`/api/auth/${sistema}/sign-in/username`, {
    headers: { origin: "http://localhost:3000" },
    data: { usuario, clave: process.env.CLAVE_DEMO },
  });
  expect(respuesta.ok()).toBe(true);
}

async function png() {
  return sharp({ create: { width: 16, height: 12, channels: 4, background: { r: 12, g: 90, b: 40, alpha: 1 } } })
    .png()
    .toBuffer();
}

async function asegurarImagen(galeria: Locator, archivo: Buffer) {
  if ((await galeria.locator("figure").count()) === 0) {
    await galeria
      .locator('input[type="file"]')
      .setInputFiles({ name: "ce13.png", mimeType: "image/png", buffer: archivo });
  }
  await expect(galeria.locator("figure").first()).toBeVisible();
}

async function medirGaleria(galeria: Locator) {
  const figura = galeria.locator("figure").first();
  const medidas = await figura.evaluate((el) => {
    const lista = el.parentElement!;
    const estiloLista = getComputedStyle(lista);
    const estilo = getComputedStyle(el);
    const caja = el.getBoundingClientRect();
    const numero = el.querySelector("span");
    const boton = el.querySelector("button");
    const estiloNumero = numero ? getComputedStyle(numero) : null;
    const estiloBoton = boton ? getComputedStyle(boton) : null;
    return {
      display: estiloLista.display,
      columnas: estiloLista.gridTemplateColumns.split(" ").map((columna) => parseFloat(columna)),
      ancho: caja.width,
      alto: caja.height,
      radio: estilo.borderRadius,
      radioNumero: estiloNumero?.borderRadius ?? "",
      altoNumero: estiloNumero ? parseFloat(estiloNumero.height) : 0,
      anchoBoton: estiloBoton ? parseFloat(estiloBoton.width) : 0,
      altoBoton: estiloBoton ? parseFloat(estiloBoton.height) : 0,
    };
  });
  expect(medidas.display).toBe("grid");
  expect(medidas.columnas.length).toBeGreaterThan(0);
  expect(medidas.columnas.every((columna) => columna >= 103)).toBe(true);
  expect(medidas.ancho / medidas.alto).toBeCloseTo(4 / 3, 1);
  expect(medidas.radio).toBe("10px");
  expect(parseFloat(medidas.radioNumero)).toBeGreaterThanOrEqual(medidas.altoNumero / 2 - 1);
  expect(medidas.anchoBoton).toBeCloseTo(28, 0);
  expect(medidas.altoBoton).toBeCloseTo(28, 0);
}

async function axe(page: Page, nombre: string) {
  expect(
    (
      await new AxeBuilder({ page })
        .include(`[data-galeria="${nombre}"]`)
        .exclude(`[data-galeria="${nombre}"] .muted`)
        .analyze()
    ).violations.filter((v) => ["serious", "critical"].includes(v.impact ?? "")),
  ).toEqual([]);
}

test("RF-SW-07 / RF-SW-23 / H-58: la galería compartida mide como el prototipo", async ({ page }, info) => {
  test.setTimeout(90_000);
  await entrar(page, "sitio", "ejemplo.08");
  const archivo = await png();
  await page.goto("/panel/catalogo");
  await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
  await page.getByRole("button", { name: "Editar", exact: true }).first().click();
  const producto = page.getByRole("dialog");
  await expect(producto.getByRole("heading", { name: "Editar producto público" })).toBeVisible();
  const galeriaProducto = producto.locator('[data-galeria="Producto"]');
  await asegurarImagen(galeriaProducto, archivo);
  await medirGaleria(galeriaProducto);
  await axe(page, "Producto");
  await info.attach(`h58-catalogo-${info.project.name}`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
  await producto.getByRole("button", { name: "Cancelar", exact: true }).click();

  await page.goto("/panel/contenido");
  await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
  const portada = page.getByRole("region", { name: "Portada", exact: true }).locator("[data-galeria]");
  await asegurarImagen(portada, archivo);
  await medirGaleria(portada);
  await axe(page, "Portada");
  await info.attach(`h58-contenido-${info.project.name}`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });

  await page.goto("/panel/industrias");
  const cuero = page.getByRole("region", { name: "Cuero", exact: true }).locator("[data-galeria]");
  await asegurarImagen(cuero, archivo);
  await medirGaleria(cuero);
  await axe(page, "Cuero");
  await info.attach(`h58-industrias-${info.project.name}`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });

  await page.goto("/panel/noticias");
  await page.getByRole("button", { name: "Nueva noticia", exact: true }).click();
  const noticia = page.getByRole("dialog");
  const galeriaNoticia = noticia.locator('[data-galeria="Noticia"]');
  await asegurarImagen(galeriaNoticia, archivo);
  await medirGaleria(galeriaNoticia);
  await axe(page, "Noticia");
  await info.attach(`h58-noticias-${info.project.name}`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
});

test("RF-SL-36 / RN-39 / H-56: Reportes › Bitácora muestra el título de la noticia", async ({ page }, info) => {
  test.setTimeout(90_000);
  const titulo = `CE13 ${info.project.name} ${Date.now()}`;
  const editado = `${titulo} editada`;
  await entrar(page, "sitio", "ejemplo.08");
  await page.goto("/panel/noticias");
  await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
  await page.getByRole("button", { name: "Nueva noticia", exact: true }).click();
  const dialogo = page.getByRole("dialog");
  await dialogo.locator('input[type="file"]').setInputFiles({
    name: "ce13.png",
    mimeType: "image/png",
    buffer: await png(),
  });
  await expect(dialogo.getByRole("img", { name: "Noticia: imagen 1" })).toBeVisible();
  await dialogo.getByLabel("Título", { exact: true }).fill(titulo);
  await dialogo.getByLabel("Texto", { exact: true }).fill("Texto de la corrección H-56.");
  await dialogo.getByRole("button", { name: "Guardar", exact: true }).click();
  const fila = page.getByRole("row").filter({ hasText: titulo });
  await expect(fila).toBeVisible();

  await entrar(page, "picking", "ejemplo.02");
  await page.goto("/picking/reportes");
  await expect(page.getByRole("heading", { name: "Reportes y bitácora" })).toBeVisible();
  await page.getByRole("tab", { name: "Bitácora", exact: true }).click();
  const creacion = page.getByRole("row").filter({ hasText: "Creación de noticia" }).filter({ hasText: titulo });
  await expect(creacion.getByRole("cell", { name: titulo, exact: true })).toBeVisible();
  await expect(creacion).not.toContainText("—");

  await page.goto("/panel/noticias");
  await fila.getByRole("button", { name: "Editar", exact: true }).click();
  await dialogo.getByLabel("Título", { exact: true }).fill(editado);
  await dialogo.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(page.getByRole("row").filter({ hasText: editado })).toBeVisible();
  await page.goto("/picking/reportes");
  await page.getByRole("tab", { name: "Bitácora", exact: true }).click();
  const edicion = page.getByRole("row").filter({ hasText: "Edición de noticia" }).filter({ hasText: editado });
  await expect(edicion.getByRole("cell", { name: editado, exact: true })).toBeVisible();

  await page.goto("/panel/noticias");
  await page
    .getByRole("row")
    .filter({ hasText: editado })
    .getByRole("button", { name: "Eliminar", exact: true })
    .click();
  await page.getByRole("dialog").getByRole("button", { name: "Eliminar", exact: true }).click();
  await expect(page.getByRole("row").filter({ hasText: editado })).toHaveCount(0);
  await page.goto("/picking/reportes");
  await page.getByRole("tab", { name: "Bitácora", exact: true }).click();
  const baja = page.getByRole("row").filter({ hasText: "Eliminación de noticia" }).filter({ hasText: editado });
  await expect(baja.getByRole("cell", { name: editado, exact: true })).toBeVisible();
  await expect(baja).not.toContainText("—");
  await info.attach(`h56-bitacora-${info.project.name}`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
});

test("RF-SL-36 / RN-39 / H-57 / RNF-05 / H-63: la bitácora de solicitudes usa los textos del prototipo y el comentario tiene tope", async ({
  page,
}, info) => {
  test.setTimeout(90_000);
  const indice = ["telefono", "tableta", "escritorio"].indexOf(info.project.name) + 1;
  const folio = `SOL-9${indice}${Date.now().toString().slice(-7)}`;
  const correo = `ce13-e2e-${info.project.name}@prueba.invalid`;
  const bd = new Client({ connectionString: process.env.DATABASE_URL });
  await bd.connect();
  try {
    await bd.query("DELETE FROM solicitud_contacto WHERE folio = $1 OR correo = $2", [folio, correo]);
    await bd.query(
      "INSERT INTO solicitud_contacto (folio,motivo,nombre,correo,pais_id,sede_id,mensaje,actualizado_en) SELECT $1,'solicitud',$2,$3,p.id,s.id,'Mensaje de la corrección H-57',now() FROM pais p CROSS JOIN sede s WHERE p.codigo='MX' AND s.nombre='Quetzaltenango'",
      [folio, `Persona CE13 ${info.project.name}`, correo],
    );
    await entrar(page, "sitio", "ejemplo.08");
    await page.goto("/panel/solicitudes");
    await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
    await page.getByRole("button", { name: new RegExp(`Persona CE13 ${info.project.name}`) }).click();
    const comentario = page.getByLabel("Comentario del responsable", { exact: true });
    await expect(comentario).toHaveAttribute("maxLength", "2000");
    await page.getByRole("button", { name: "En proceso", exact: true }).click();
    await expect(page.getByRole("button", { name: "En proceso", exact: true })).toHaveAttribute("aria-pressed", "true");
    await page
      .getByLabel("Responsable", { exact: true })
      .selectOption({ label: "Usuario de ejemplo 08 · Administrativo" });
    await page.getByLabel("Responsable", { exact: true }).selectOption({ label: "Sin responsable" });
    await comentario.fill("Nota de la bandeja");
    await page.getByRole("button", { name: "Guardar comentario", exact: true }).click();
    await expect(comentario).toHaveValue("Nota de la bandeja");

    await entrar(page, "picking", "ejemplo.02");
    await page.goto("/picking/reportes");
    await page.getByRole("tab", { name: "Bitácora", exact: true }).click();
    for (const texto of [`${folio} · En proceso`, `${folio} · Usuario de ejemplo 08`, `${folio} · sin responsable`]) {
      const fila = page.getByRole("row").filter({ hasText: texto });
      await expect(fila.getByRole("cell", { name: texto, exact: true })).toBeVisible();
      await expect(fila).not.toContainText("—");
    }
    const comentarioFila = page
      .getByRole("row")
      .filter({ hasText: "Comentario de solicitud" })
      .filter({ hasText: folio });
    await expect(comentarioFila.getByRole("cell", { name: folio, exact: true })).toBeVisible();
    await info.attach(`h57-bitacora-${info.project.name}`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
  } finally {
    await bd.query("DELETE FROM solicitud_contacto WHERE folio = $1 OR correo = $2", [folio, correo]);
    await bd.end();
  }
});

test("H-62: el mapa inválido avisa con el texto del prototipo", async ({ page }, info) => {
  await entrar(page, "sitio", "ejemplo.08");
  await page.goto("/panel/contacto");
  await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
  const sede = page.getByRole("region", { name: "Guatemala", exact: true });
  const mapa = sede.getByLabel("Mapa (dirección del mapa insertado de Google Maps)", { exact: true });
  const mapaOriginal = await mapa.inputValue();
  await mapa.fill("https://example.com/mapa");
  await mapa.blur();
  await expect(sede.getByText(MENSAJE_MAPA, { exact: true })).toHaveCount(0);
  await sede.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(page.locator(".toast").getByText(MENSAJE_MAPA, { exact: true })).toBeVisible();
  await expect(sede.getByText(MENSAJE_MAPA, { exact: true })).toHaveCount(0);
  await mapa.fill(mapaOriginal);
  await info.attach(`h62-mapa-${info.project.name}`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
});

const MENSAJE_CORREO = "Indique un correo válido.";

async function correoDeGuatemala(page: Page) {
  await page.goto("/panel/contacto");
  await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
  const sede = page.getByRole("region", { name: "Guatemala", exact: true });
  const correo = sede.getByLabel("Correo", { exact: true });
  return { sede, correo };
}

async function restaurarCorreo(correo: string) {
  const bd = new Client({ connectionString: process.env.DATABASE_URL });
  await bd.connect();
  try {
    await bd.query(
      "UPDATE informacion_contacto SET correo = $1 WHERE sede_id = (SELECT id FROM sede WHERE nombre = 'Guatemala')",
      [correo],
    );
  } finally {
    await bd.end();
  }
}

test("H-62 / CE-13b: un correo mal formado se rechaza al salir del campo y no se guarda", async ({ page }, info) => {
  test.skip(info.project.name !== "escritorio", "Guatemala se comparte entre proyectos; basta escritorio.");
  await entrar(page, "sitio", "ejemplo.08");
  const { sede, correo } = await correoDeGuatemala(page);
  const original = await correo.inputValue();
  await correo.fill("no-es-correo");
  await correo.blur();
  await expect(sede.getByText(MENSAJE_CORREO, { exact: true })).toBeVisible();
  await expect(correo).toHaveAttribute("aria-invalid", "true");
  await sede.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(page.locator(".toast")).toHaveCount(0);
  await page.reload();
  const otraVez = await correoDeGuatemala(page);
  await expect(otraVez.correo).toHaveValue(original);
});

test("H-62 / CE-13b: un correo con formato válido se guarda", async ({ page }, info) => {
  test.skip(info.project.name !== "escritorio", "Guatemala se comparte entre proyectos; basta escritorio.");
  await entrar(page, "sitio", "ejemplo.08");
  const { sede, correo } = await correoDeGuatemala(page);
  const original = await correo.inputValue();
  try {
    await correo.fill("oficina@ejemplo.com");
    await correo.blur();
    await expect(sede.getByText(MENSAJE_CORREO, { exact: true })).toHaveCount(0);
    await sede.getByRole("button", { name: "Guardar", exact: true }).click();
    await expect(page.locator(".toast").getByText("Datos de Guatemala publicados.", { exact: true })).toBeVisible();
    const guardado = await correoDeGuatemala(page);
    await expect(guardado.correo).toHaveValue("oficina@ejemplo.com");
  } finally {
    await restaurarCorreo(original);
  }
});
