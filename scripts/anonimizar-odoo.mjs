#!/usr/bin/env node
// Genera una copia del archivo de pedidos de Odoo sin datos personales (specs/16, decisión 77; RNF-10).
//
// Conserva la estructura y las cifras de specs/13 ("Archivo de pedidos de Odoo"):
//   - cada `Contacto` distinto → `Cliente de ejemplo NNN`, numerados en orden de aparición;
//   - `Contacto/Calle`, `Contacto/Calle2` y `Contacto/Estado` quedan vacíos;
//   - `Documento origen` → `S9NNNN` consecutivo;
//   - todo lo demás queda igual: el orden de las filas, la fila de agrupación, las líneas sin Referencia
//     ni Contacto, la Referencia, el sector (`Contacto/Ciudad`), el estado, los productos, los Pesos de
//     Conversión (incluidos los 0), los lotes y las cantidades.
// El libro de salida no copia las propiedades del archivo real (autor, fechas), y el mismo archivo real
// produce siempre los mismos bytes.
//
// Uso: node scripts/anonimizar-odoo.mjs <archivo real .xlsx> <archivo de salida .xlsx>

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { read, utils, write } from "xlsx";

export const HOJA = "Sheet1";

export const COLUMNAS = Object.freeze({
  referencia: "Referencia",
  contacto: "Contacto",
  calle: "Contacto/Calle",
  calle2: "Contacto/Calle2",
  ciudad: "Contacto/Ciudad",
  estadoContacto: "Contacto/Estado",
  documentoOrigen: "Documento origen",
  estado: "Estado",
  producto: "Movimientos de stock/Producto",
  peso: "Movimientos de stock/Producto/Peso",
  lote: "Movimientos de stock/Números de serie",
  cantidad: "Movimientos de stock/Cantidad hecha",
});

/** Lee la primera hoja de un .xlsx como filas (la primera es el encabezado). Las celdas vacías son `null`. */
export function leerFilas(bytes) {
  const libro = read(bytes, { type: "buffer" });
  const hoja = libro.Sheets[libro.SheetNames[0]];
  return utils.sheet_to_json(hoja, { header: 1, defval: null, raw: true, blankrows: true });
}

/**
 * Escribe filas como un .xlsx de una sola hoja `Sheet1`. Las celdas `null` quedan vacías.
 * La salida es determinista: el libro nuevo no lleva propiedades (autor ni fechas) y SheetJS escribe
 * las entradas del ZIP sin fecha.
 */
export function escribirXlsx(filas) {
  const libro = utils.book_new();
  utils.book_append_sheet(libro, utils.aoa_to_sheet(filas), HOJA);
  return write(libro, { type: "buffer", bookType: "xlsx", compression: true });
}

/** Índice de cada columna por su nombre en el encabezado. */
export function indices(encabezado) {
  const r = {};
  for (const [clave, nombre] of Object.entries(COLUMNAS)) r[clave] = encabezado.indexOf(nombre);
  return r;
}

const tieneValor = (v) => v !== null && v !== undefined && String(v).trim() !== "";

/** Devuelve una copia anonimizada de las filas (la primera es el encabezado). */
export function anonimizarFilas(filas) {
  const [encabezado, ...datos] = filas;
  const col = indices(encabezado);
  for (const clave of ["contacto", "calle", "calle2", "estadoContacto", "documentoOrigen"]) {
    if (col[clave] < 0) throw new Error(`Falta la columna "${COLUMNAS[clave]}"`);
  }

  const clientes = new Map();
  let documentos = 0;
  const salida = datos.map((fila) => {
    const nueva = [...fila];
    const contacto = fila[col.contacto];
    if (tieneValor(contacto)) {
      if (!clientes.has(contacto)) {
        clientes.set(contacto, `Cliente de ejemplo ${String(clientes.size + 1).padStart(3, "0")}`);
      }
      nueva[col.contacto] = clientes.get(contacto);
    }
    nueva[col.calle] = null;
    nueva[col.calle2] = null;
    nueva[col.estadoContacto] = null;
    if (tieneValor(fila[col.documentoOrigen])) {
      documentos++;
      nueva[col.documentoOrigen] = `S9${String(documentos).padStart(4, "0")}`;
    }
    return nueva;
  });
  if (clientes.size > 999 || documentos > 9999) throw new Error("El archivo tiene demasiados contactos o documentos");
  return [[...encabezado], ...salida];
}

/** Anonimiza los bytes de un .xlsx de Odoo y devuelve los bytes del .xlsx anonimizado. */
export function anonimizar(bytes) {
  return escribirXlsx(anonimizarFilas(leerFilas(bytes)));
}

function principal() {
  const [entrada, salida] = process.argv.slice(2);
  if (!entrada || !salida) {
    console.error("Uso: node scripts/anonimizar-odoo.mjs <archivo real .xlsx> <archivo de salida .xlsx>");
    process.exit(1);
  }
  const bytes = anonimizar(readFileSync(entrada));
  mkdirSync(dirname(resolve(salida)), { recursive: true });
  writeFileSync(salida, bytes);
  console.log(`Listo: ${salida} · ${(bytes.length / 1024).toFixed(1)} KB`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) principal();
