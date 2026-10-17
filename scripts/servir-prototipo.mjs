#!/usr/bin/env node
// Sirve el prototipo de simulación aprobado por http, para abrirlo en el navegador o con Playwright
// (Playwright no abre archivos file:). Solo requiere Node 24 y no usa dependencias.
//
// Uso:
//   node scripts/servir-prototipo.mjs            → http://127.0.0.1:4173/
//   node scripts/servir-prototipo.mjs 4300       → http://127.0.0.1:4300/
//
// La raíz es entregable-1/prototipos/; "/" abre prototipo-simulacion-incovsa.html. El prototipo guarda su estado en
// el localStorage del navegador: para empezar de cero, use el botón "Demostración" → reiniciar datos.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "entregable-1", "prototipos");
const PUERTO = Number(process.argv[2] || 4173);
const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};

createServer(async (req, res) => {
  const ruta = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  const relativa = ruta === "/" ? "prototipo-simulacion-incovsa.html" : ruta.slice(1);
  const archivo = normalize(join(RAIZ, relativa));
  if (!archivo.startsWith(RAIZ)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const datos = await readFile(archivo);
    res.writeHead(200, { "Content-Type": TIPOS[extname(archivo)] || "application/octet-stream" }).end(datos);
  } catch {
    res.writeHead(404).end("No encontrado");
  }
}).listen(PUERTO, "127.0.0.1", () => {
  console.log(`Prototipo aprobado en http://127.0.0.1:${PUERTO}/ (Ctrl+C para detener)`);
});
