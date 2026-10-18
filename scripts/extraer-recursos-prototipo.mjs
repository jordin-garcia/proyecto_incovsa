#!/usr/bin/env node
// Extrae los recursos gráficos del prototipo aprobado (specs/16, decisión 77).
//
// Lee `window.RECURSOS` del HTML armado del prototipo (lo arma `construir.py`) y escribe, en WebP:
//   public/marca/                 logotipos y fotografías que la aplicación sirve
//   pruebas/fixtures/catalogo/    las 28 imágenes del catálogo de prueba, en el orden de
//                                 base.js › PRODUCTOS_PUB_BASE (solo para la semilla de demostración y las pruebas)
//
// Las imágenes ya están en WebP dentro del HTML: se escriben los mismos bytes, sin volver a comprimir,
// para que se vean iguales y no pesen más que en el prototipo.
//
// Uso: node scripts/extraer-recursos-prototipo.mjs [prototipo.html]

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PROTOTIPO = join(RAIZ, "entregable-1/prototipos/prototipo-simulacion-incovsa.html");

/** Recurso de `window.RECURSOS` → archivo de `public/marca/`. */
export const MARCA = [
  ["logo", "incovsa-quimicos.webp"],
  ["logoBlanco", "incovsa-quimicos-blanco.webp"],
  ["inquiserca", "inquiserca.webp"],
  ["fotoEquipo", "foto-equipo.webp"],
  ["fotoReunion", "foto-reunion.webp"],
];

export const IMAGENES_CATALOGO = 28;

/** Devuelve el objeto `window.RECURSOS` del HTML armado del prototipo. */
export function leerRecursos(html) {
  const marcador = "window.RECURSOS=";
  const inicio = html.indexOf(marcador);
  if (inicio < 0) throw new Error("El prototipo no tiene window.RECURSOS");
  const desde = inicio + marcador.length;
  // Busca el cierre del objeto JSON, sin contar las llaves que van dentro de los textos.
  let profundidad = 0;
  let enTexto = false;
  for (let i = desde; i < html.length; i++) {
    const c = html[i];
    if (enTexto) {
      if (c === "\\") i++;
      else if (c === '"') enTexto = false;
    } else if (c === '"') enTexto = true;
    else if (c === "{" || c === "[") profundidad++;
    else if (c === "}" || c === "]") {
      profundidad--;
      if (profundidad === 0) return JSON.parse(html.slice(desde, i + 1));
    }
  }
  throw new Error("window.RECURSOS no termina");
}

/** Convierte un URI `data:image/webp;base64,…` en sus bytes. Rechaza cualquier otro formato. */
export function bytesWebp(uri, nombre) {
  const prefijo = "data:image/webp;base64,";
  if (typeof uri !== "string" || !uri.startsWith(prefijo)) {
    throw new Error(`${nombre} no es una imagen WebP`);
  }
  const bytes = Buffer.from(uri.slice(prefijo.length), "base64");
  if (bytes.toString("latin1", 0, 4) !== "RIFF" || bytes.toString("latin1", 8, 12) !== "WEBP") {
    throw new Error(`${nombre} no es un archivo WebP válido`);
  }
  return bytes;
}

/** Lista los archivos que se escriben: [ruta relativa a la raíz, bytes]. */
export function archivosDeRecursos(recursos) {
  const archivos = MARCA.map(([clave, archivo]) => [`public/marca/${archivo}`, bytesWebp(recursos[clave], clave)]);
  const catalogo = recursos.catalogo ?? [];
  if (catalogo.length !== IMAGENES_CATALOGO) {
    throw new Error(`Se esperaban ${IMAGENES_CATALOGO} imágenes de catálogo y hay ${catalogo.length}`);
  }
  catalogo.forEach((uri, i) => {
    const numero = String(i + 1).padStart(2, "0");
    archivos.push([`pruebas/fixtures/catalogo/${numero}.webp`, bytesWebp(uri, `catalogo[${i}]`)]);
  });
  return archivos;
}

function principal() {
  const origen = process.argv[2] ? resolve(process.argv[2]) : PROTOTIPO;
  const archivos = archivosDeRecursos(leerRecursos(readFileSync(origen, "utf8")));
  for (const [ruta, bytes] of archivos) {
    const destino = join(RAIZ, ruta);
    mkdirSync(dirname(destino), { recursive: true });
    writeFileSync(destino, bytes);
    console.log(`${ruta} · ${(bytes.length / 1024).toFixed(1)} KB`);
  }
  console.log(`Listo: ${archivos.length} imágenes`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) principal();
