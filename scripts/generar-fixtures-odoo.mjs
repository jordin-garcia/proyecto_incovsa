#!/usr/bin/env node
// Genera los archivos de Odoo inválidos para las pruebas de la lectura del archivo (JC-02).
//
// Cada archivo parte de la copia anonimizada (pruebas/fixtures/odoo/odoo-ejemplo-anonimizado.xlsx) y
// tiene solo el defecto que dice su nombre:
//   otra-bodega-gt.xlsx       todas las Referencias con prefijo GT-
//   bodegas-mezcladas.xlsx    las Referencias de la 41 a la 80 con prefijo GT-; las demás, XE-
//   prefijo-desconocido.xlsx  la última Referencia con prefijo ZZ-
//   sin-columna-peso.xlsx     sin la columna `Movimientos de stock/Producto/Peso`
//   cantidad-invalida.xlsx    en tres referencias "Hecho" que sí se cargarían (todos sus pesos y
//                             cantidades mayores que 0), la primera línea con cantidad vacía, con
//                             texto ("diez") y en 0
//   no-es-xlsx.xlsx           un texto con extensión .xlsx
// El archivo de más de 2 MB no se sube: JC-02 lo genera en memoria en su prueba.
//
// Uso: node scripts/generar-fixtures-odoo.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { escribirXlsx, indices, leerFilas } from "./anonimizar-odoo.mjs";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const CARPETA = join(RAIZ, "pruebas/fixtures/odoo");
export const ANONIMIZADO = "odoo-ejemplo-anonimizado.xlsx";

export const TEXTO_NO_XLSX = "Este archivo es un texto y no una hoja de cálculo de Excel.\n";
export const CANTIDADES_INVALIDAS = [null, "diez", 0];

const tieneValor = (v) => v !== null && v !== undefined && String(v).trim() !== "";

/**
 * Agrupa las filas de datos por referencia, como las lee el sistema (specs/06, "Cómo se lee").
 * Devuelve cada referencia con la fila donde aparece y las filas de sus líneas (índices sobre `filas`).
 */
export function referencias(filas) {
  const col = indices(filas[0]);
  const lista = [];
  let actual = null;
  for (let r = 1; r < filas.length; r++) {
    const f = filas[r];
    const conReferencia = tieneValor(f[col.referencia]);
    const conContacto = tieneValor(f[col.contacto]);
    if (conReferencia && !conContacto && !tieneValor(f[col.producto])) {
      actual = null; // fila de agrupación de Odoo
      continue;
    }
    if (conReferencia || conContacto) {
      actual = { fila: r, referencia: f[col.referencia], estado: f[col.estado], lineas: [] };
      lista.push(actual);
    }
    if (actual && tieneValor(f[col.producto])) actual.lineas.push(r);
  }
  return lista;
}

const cambiarPrefijo = (referencia, prefijo) => referencia.replace(/^[^-]+-/, `${prefijo}-`);

/** Devuelve un mapa nombre → bytes con los archivos inválidos, a partir de los bytes del anonimizado. */
export function generarFixtures(bytesAnonimizado) {
  const base = leerFilas(bytesAnonimizado);
  const col = indices(base[0]);
  const refs = referencias(base);
  const copia = () => base.map((f) => [...f]);
  const archivos = new Map();

  const prefijos = (elegir) => {
    const filas = copia();
    refs.forEach((ref, i) => {
      const prefijo = elegir(i);
      if (prefijo) filas[ref.fila][col.referencia] = cambiarPrefijo(ref.referencia, prefijo);
    });
    return escribirXlsx(filas);
  };
  archivos.set(
    "otra-bodega-gt.xlsx",
    prefijos(() => "GT"),
  );
  archivos.set(
    "bodegas-mezcladas.xlsx",
    prefijos((i) => (i >= refs.length / 2 ? "GT" : null)),
  );
  archivos.set(
    "prefijo-desconocido.xlsx",
    prefijos((i) => (i === refs.length - 1 ? "ZZ" : null)),
  );

  const sinPeso = copia().map((f) => f.filter((_, c) => c !== col.peso));
  archivos.set("sin-columna-peso.xlsx", escribirXlsx(sinPeso));

  const cargables = refs.filter(
    (ref) => ref.estado === "Hecho" && ref.lineas.every((r) => base[r][col.peso] > 0 && base[r][col.cantidad] > 0),
  );
  if (cargables.length < CANTIDADES_INVALIDAS.length) {
    throw new Error("No hay suficientes referencias que se carguen para cantidad-invalida.xlsx");
  }
  const conCantidades = copia();
  CANTIDADES_INVALIDAS.forEach((cantidad, i) => {
    conCantidades[cargables[i].lineas[0]][col.cantidad] = cantidad;
  });
  archivos.set("cantidad-invalida.xlsx", escribirXlsx(conCantidades));

  archivos.set("no-es-xlsx.xlsx", Buffer.from(TEXTO_NO_XLSX, "utf8"));
  return archivos;
}

function principal() {
  const archivos = generarFixtures(readFileSync(join(CARPETA, ANONIMIZADO)));
  for (const [nombre, bytes] of archivos) {
    writeFileSync(join(CARPETA, nombre), bytes);
    console.log(`pruebas/fixtures/odoo/${nombre} · ${(bytes.length / 1024).toFixed(1)} KB`);
  }
  console.log(`Listo: ${archivos.size} archivos`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) principal();
