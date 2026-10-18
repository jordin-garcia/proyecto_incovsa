// Pruebas de los archivos de Odoo inválidos para JC-02 (JG-04, criterio 3): cada uno tiene el defecto que
// dice su nombre y nada más, comparado celda por celda con la copia anonimizada.
// Se ejecutan con: node --test "scripts/*.test.mjs"
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { read } from "xlsx";
import { indices, leerFilas } from "./anonimizar-odoo.mjs";
import {
  ANONIMIZADO,
  CANTIDADES_INVALIDAS,
  CARPETA,
  TEXTO_NO_XLSX,
  generarFixtures,
  referencias,
} from "./generar-fixtures-odoo.mjs";

const leer = (nombre) => readFileSync(join(CARPETA, nombre));
const base = leerFilas(leer(ANONIMIZADO));
const col = indices(base[0]);
const refs = referencias(base);

/** Celdas que cambian respecto de la copia anonimizada: "fila,columna" → [antes, después]. */
function diferencias(filas) {
  assert.equal(filas.length, base.length, "mismo número de filas");
  const r = new Map();
  for (let i = 0; i < base.length; i++) {
    assert.equal(filas[i].length, base[i].length, `mismo número de columnas en la fila ${i}`);
    for (let c = 0; c < base[i].length; c++) {
      if (filas[i][c] !== base[i][c]) r.set(`${i},${c}`, [base[i][c], filas[i][c]]);
    }
  }
  return r;
}

/** Referencias esperadas con el prefijo cambiado según `elegir(i)`. */
function conPrefijos(elegir) {
  const r = new Map();
  refs.forEach((ref, i) => {
    const prefijo = elegir(i);
    if (prefijo)
      r.set(`${ref.fila},${col.referencia}`, [ref.referencia, ref.referencia.replace(/^XE-/, `${prefijo}-`)]);
  });
  return r;
}

test("RN-36: otra-bodega-gt.xlsx tiene todas las referencias con prefijo GT- y nada más", () => {
  const filas = leerFilas(leer("otra-bodega-gt.xlsx"));
  assert.deepEqual(
    diferencias(filas),
    conPrefijos(() => "GT"),
  );
  assert.equal(refs.length, 80);
});

test("RN-36: bodegas-mezcladas.xlsx tiene referencias XE- y GT- y nada más", () => {
  const filas = leerFilas(leer("bodegas-mezcladas.xlsx"));
  assert.deepEqual(
    diferencias(filas),
    conPrefijos((i) => (i >= 40 ? "GT" : null)),
  );
  const prefijos = new Set(refs.map((ref) => filas[ref.fila][col.referencia].split("-")[0]));
  assert.deepEqual([...prefijos].sort(), ["GT", "XE"]);
});

test("RN-36: prefijo-desconocido.xlsx tiene una sola referencia con prefijo ZZ- y nada más", () => {
  const filas = leerFilas(leer("prefijo-desconocido.xlsx"));
  const d = diferencias(filas);
  assert.equal(d.size, 1);
  assert.deepEqual(
    d,
    conPrefijos((i) => (i === refs.length - 1 ? "ZZ" : null)),
  );
});

test("RN-37: sin-columna-peso.xlsx no tiene la columna de peso y todo lo demás es igual", () => {
  const filas = leerFilas(leer("sin-columna-peso.xlsx"));
  assert.ok(!filas[0].includes("Movimientos de stock/Producto/Peso"));
  assert.deepEqual(
    filas,
    base.map((f) => f.filter((_, c) => c !== col.peso)),
  );
});

test("RN-50: cantidad-invalida.xlsx tiene una cantidad vacía, una con texto y una en 0, en tres referencias Hecho que sí se cargarían", () => {
  const filas = leerFilas(leer("cantidad-invalida.xlsx"));
  const d = diferencias(filas);
  assert.equal(d.size, 3);
  const cambiadas = [...d.keys()].map((k) => k.split(",").map(Number));
  for (const [, c] of cambiadas) assert.equal(c, col.cantidad);
  assert.deepEqual(
    [...d.values()].map(([, despues]) => despues),
    CANTIDADES_INVALIDAS,
  );
  // Cada línea es de una referencia Hecho distinta cuyas líneas tienen peso y cantidad mayores que 0
  const dueñas = cambiadas.map(([fila]) => refs.find((ref) => ref.lineas.includes(fila)));
  assert.equal(new Set(dueñas).size, 3);
  for (const ref of dueñas) {
    assert.equal(ref.estado, "Hecho");
    for (const i of ref.lineas) {
      assert.ok(base[i][col.peso] > 0);
      assert.ok(base[i][col.cantidad] > 0);
    }
  }
});

test("RF-SL-50: no-es-xlsx.xlsx es un texto con extensión .xlsx", () => {
  const bytes = leer("no-es-xlsx.xlsx");
  assert.equal(bytes.toString("utf8"), TEXTO_NO_XLSX);
  assert.notEqual(bytes.toString("latin1", 0, 2), "PK"); // no es un ZIP, como sí lo es un .xlsx
  // SheetJS lo abre como texto, no como libro de Excel
  assert.notEqual(read(bytes).Sheets.Sheet1?.A1?.v, "Referencia");
});

test("JG-04: los archivos inválidos subidos son los que genera el script (reproducibles)", () => {
  const generados = generarFixtures(leer(ANONIMIZADO));
  assert.deepEqual([...generados.keys()].sort(), [
    "bodegas-mezcladas.xlsx",
    "cantidad-invalida.xlsx",
    "no-es-xlsx.xlsx",
    "otra-bodega-gt.xlsx",
    "prefijo-desconocido.xlsx",
    "sin-columna-peso.xlsx",
  ]);
  for (const [nombre, bytes] of generados) assert.ok(bytes.equals(leer(nombre)), nombre);
});
