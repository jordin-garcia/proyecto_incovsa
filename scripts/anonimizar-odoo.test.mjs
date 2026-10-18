// Pruebas de la copia anonimizada del archivo de Odoo (JG-04, specs/13 "Cifras del archivo de ejemplo").
// Leen solo pruebas/fixtures/odoo/odoo-ejemplo-anonimizado.xlsx: ninguna depende del archivo real.
// Se ejecutan con: node --test "scripts/*.test.mjs"
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { read } from "xlsx";
import { anonimizar, escribirXlsx, indices, leerFilas } from "./anonimizar-odoo.mjs";
import { referencias } from "./generar-fixtures-odoo.mjs";

const ARCHIVO = new URL("../pruebas/fixtures/odoo/odoo-ejemplo-anonimizado.xlsx", import.meta.url);
const bytes = readFileSync(ARCHIVO);
const filas = leerFilas(bytes);
const col = indices(filas[0]);
const refs = referencias(filas);
const hechas = refs.filter((r) => r.estado === "Hecho");
const lineasHechas = hechas.flatMap((r) => r.lineas.map((i) => filas[i]));
const datos = filas.slice(1);
const vacia = (v) => v === null || v === undefined || String(v).trim() === "";

test("RF-SL-50: el archivo tiene una sola hoja Sheet1 con las 16 columnas de Odoo", () => {
  const libro = read(bytes);
  assert.deepEqual(libro.SheetNames, ["Sheet1"]);
  assert.deepEqual(filas[0], [
    "Referencia",
    "Contacto",
    "Contacto/Calle",
    "Contacto/Calle2",
    "Contacto/Ciudad",
    "Contacto/Estado",
    "Contacto/País",
    "Documento origen",
    "Tipo de Compra",
    "Bodega de Ingreso/Salida",
    "Estado",
    "Movimientos de stock/Producto",
    "Movimientos de stock/Producto/Peso",
    "Movimientos de stock/Números de serie",
    "Movimientos de stock/Cantidad hecha",
    "Ubicación de origen/Nombre mostrado",
  ]);
});

test("RF-SL-50: hay 1 fila de agrupación de Odoo y es la primera", () => {
  const agrupacion = datos.filter((f) => !vacia(f[col.referencia]) && vacia(f[col.contacto]) && vacia(f[col.producto]));
  assert.equal(agrupacion.length, 1);
  assert.equal(datos[0], agrupacion[0]);
});

test("RN-36: 80 referencias XE-IN, del 03539 al 03627, sin repetidos", () => {
  assert.equal(refs.length, 80);
  for (const r of refs) assert.match(r.referencia, /^XE-IN\/SALIDA\/\d{5}$/);
  const numeros = refs.map((r) => r.referencia.split("/")[2]).sort();
  assert.equal(new Set(numeros).size, 80);
  assert.equal(numeros[0], "03539");
  assert.equal(numeros.at(-1), "03627");
});

test("RN-35: 1 referencia Cancelado y 79 Hecho con 205 líneas", () => {
  assert.equal(refs.filter((r) => r.estado === "Cancelado").length, 1);
  assert.equal(hechas.length, 79);
  assert.equal(lineasHechas.length, 205);
});

test("RN-50: 82 líneas con Peso de Conversión 0 en 46 referencias; se cargarían 33", () => {
  assert.equal(lineasHechas.filter((f) => f[col.peso] === 0).length, 82);
  const conCero = hechas.filter((r) => r.lineas.some((i) => filas[i][col.peso] === 0));
  assert.equal(conCero.length, 46);
  assert.equal(hechas.length - conCero.length, 33);
});

test("RN-37: Pesos de Conversión 25, 30, 35, 45, 50, 120, 180 y 200, y ningún producto con dos pesos", () => {
  const pesos = [...new Set(lineasHechas.map((f) => f[col.peso]).filter((p) => p !== 0))];
  assert.deepEqual(
    pesos.sort((a, b) => a - b),
    [25, 30, 35, 45, 50, 120, 180, 200],
  );
  const porProducto = new Map();
  for (const f of lineasHechas) {
    if (f[col.peso] === 0) continue;
    const p = porProducto.get(f[col.producto]) ?? new Set();
    p.add(f[col.peso]);
    porProducto.set(f[col.producto], p);
  }
  assert.equal([...porProducto.values()].filter((p) => p.size > 1).length, 0);
});

test("RF-SL-51: ninguna línea de una referencia Hecho sin lote, y el lote se conserva como texto", () => {
  assert.equal(lineasHechas.filter((f) => vacia(f[col.lote])).length, 0);
  for (const f of lineasHechas) assert.equal(typeof f[col.lote], "string");
});

test("RF-SL-53: 4 líneas con cantidad decimal y todas las cantidades son números", () => {
  for (const f of lineasHechas) assert.equal(typeof f[col.cantidad], "number");
  assert.equal(lineasHechas.filter((f) => !Number.isInteger(f[col.cantidad])).length, 4);
});

test("RN-37: SODA ASH (CHI-SAC/0040KG) tiene peso 25 en sus 12 líneas (P-90)", () => {
  const soda = lineasHechas.filter((f) => f[col.producto] === "SODA ASH (CHI-SAC/0040KG)");
  assert.equal(soda.length, 12);
  for (const f of soda) assert.equal(f[col.peso], 25);
});

test("RNF-10: 52 contactos distintos con el formato Cliente de ejemplo NNN, numerados en orden de aparición", () => {
  const contactos = datos.map((f) => f[col.contacto]).filter((v) => !vacia(v));
  assert.equal(contactos.length, 80);
  const distintos = [...new Set(contactos)];
  assert.equal(distintos.length, 52);
  distintos.forEach((c, i) => assert.equal(c, `Cliente de ejemplo ${String(i + 1).padStart(3, "0")}`));
  // Un mismo contacto aparece en hasta 4 referencias (specs/13)
  const veces = new Map();
  for (const c of contactos) veces.set(c, (veces.get(c) ?? 0) + 1);
  assert.equal(Math.max(...veces.values()), 4);
});

test("RNF-10: Calle, Calle2 y Estado del contacto vacíos y Documento origen S9NNNN consecutivo", () => {
  for (const f of datos) {
    assert.ok(vacia(f[col.calle]));
    assert.ok(vacia(f[col.calle2]));
    assert.ok(vacia(f[col.estadoContacto]));
  }
  const documentos = datos.map((f) => f[col.documentoOrigen]).filter((v) => !vacia(v));
  assert.equal(documentos.length, 80);
  documentos.forEach((d, i) => assert.equal(d, `S9${String(i + 1).padStart(4, "0")}`));
});

test("RNF-10: el libro no lleva las propiedades del archivo real (autor ni fechas)", () => {
  const props = read(bytes).Props ?? {};
  assert.equal(props.Author, undefined);
  assert.equal(props.LastAuthor, undefined);
  assert.equal(props.CreatedDate, undefined);
  assert.equal(props.ModifiedDate, undefined);
});

// Archivo sintético con la forma del de Odoo, para probar el script sin el archivo real.
const ENCABEZADO = filas[0];
function sintetico() {
  const fila = (valores) => ENCABEZADO.map((n) => valores[n] ?? null);
  return escribirXlsx([
    ENCABEZADO,
    fila({ Referencia: "agosto 2026 (3)" }),
    fila({
      Referencia: "XE-IN/SALIDA/00001",
      Contacto: "Ana Pérez",
      "Contacto/Calle": "Calle 1",
      "Contacto/Calle2": "Zona 3",
      "Contacto/Ciudad": "Cantel",
      "Contacto/Estado": "Quetzaltenango",
      "Contacto/País": "Guatemala",
      "Documento origen": "S12345",
      Estado: "Hecho",
      "Movimientos de stock/Producto": "SODA ASH (CHI-SAC/0040KG)",
      "Movimientos de stock/Producto/Peso": 25,
      "Movimientos de stock/Números de serie": "0169",
      "Movimientos de stock/Cantidad hecha": 12.5,
    }),
    fila({
      "Movimientos de stock/Producto": "CLARIFICANTE (CHI-GAR/0020KG)",
      "Movimientos de stock/Producto/Peso": 0,
      "Movimientos de stock/Números de serie": "5287",
      "Movimientos de stock/Cantidad hecha": 40,
    }),
    fila({
      Referencia: "XE-IN/SALIDA/00002",
      Contacto: "Luis Gómez",
      "Documento origen": "S12346",
      Estado: "Cancelado",
    }),
    fila({ Referencia: "XE-IN/SALIDA/00003", Contacto: "Ana Pérez", "Documento origen": "S12347", Estado: "Hecho" }),
  ]);
}

test("JG-04: anonimizar reemplaza solo los datos personales y conserva todo lo demás", () => {
  const original = leerFilas(sintetico());
  const copia = leerFilas(anonimizar(sintetico()));
  const c = indices(original[0]);
  const anonimizadas = new Set([c.contacto, c.calle, c.calle2, c.estadoContacto, c.documentoOrigen]);
  assert.equal(copia.length, original.length);
  original.forEach((f, r) =>
    f.forEach((v, k) => {
      if (r === 0 || !anonimizadas.has(k)) assert.equal(copia[r][k], v, `fila ${r}, columna ${k}`);
    }),
  );
  assert.deepEqual(
    copia.slice(1).map((f) => f[c.contacto]),
    [null, "Cliente de ejemplo 001", null, "Cliente de ejemplo 002", "Cliente de ejemplo 001"],
  );
  assert.deepEqual(
    copia.slice(1).map((f) => f[c.documentoOrigen]),
    [null, "S90001", null, "S90002", "S90003"],
  );
  for (const f of copia.slice(1)) {
    assert.equal(f[c.calle], null);
    assert.equal(f[c.calle2], null);
    assert.equal(f[c.estadoContacto], null);
  }
});

test("JG-04: ejecutar el script dos veces sobre el mismo archivo produce los mismos bytes", () => {
  const entrada = sintetico();
  assert.ok(anonimizar(entrada).equals(anonimizar(entrada)));
  assert.ok(anonimizar(entrada).equals(anonimizar(sintetico())));
});

test("JG-04: rechaza un archivo al que le falta una columna que se anonimiza", () => {
  const sinContacto = escribirXlsx([
    ["Referencia", "Estado"],
    ["XE-IN/SALIDA/00001", "Hecho"],
  ]);
  assert.throws(() => anonimizar(sinContacto), /Contacto/);
});
