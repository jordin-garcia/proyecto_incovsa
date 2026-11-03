import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { test } from "node:test";
import ts from "typescript";
import { archivoEvidencia, capturaEvidencia } from "../pruebas-e2e/comunes/evidencia.ts";

// D-08 / H-65: una corrida normal de `npm run e2e` no escribe dentro del repositorio.
// Se permite escribir en test-results/ (ignorado por git), en `outputPath`, en la compilación (.next/)
// o dentro de un `if (process.env.EVIDENCIA === "1")`. La ayuda compartida es la única excepción.
const DESTINOS_PERMITIDOS = [/outputPath\(/, /test-results\//, /\.next\//];
const ESCRITURAS = {
  writeFile: 0,
  writeFileSync: 0,
  appendFile: 0,
  appendFileSync: 0,
  createWriteStream: 0,
  copyFile: 1,
  copyFileSync: 1,
  cp: 1,
  cpSync: 1,
};

function nombreLlamada(llamada) {
  const e = llamada.expression;
  if (ts.isIdentifier(e)) return e.text;
  if (ts.isPropertyAccessExpression(e)) return e.name.text;
  return "";
}

/** Texto del destino, sustituyendo los identificadores por su declaración en el mismo archivo. */
function textoDestino(nodo, fuente, profundidad = 0) {
  let texto = nodo.getText(fuente);
  if (profundidad > 4) return texto;
  const nombres = new Set();
  const recoger = (n) => {
    if (ts.isIdentifier(n)) nombres.add(n.text);
    ts.forEachChild(n, recoger);
  };
  recoger(nodo);
  const buscar = (n) => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && nombres.has(n.name.text) && n.initializer)
      texto += ` ${textoDestino(n.initializer, fuente, profundidad + 1)}`;
    ts.forEachChild(n, buscar);
  };
  buscar(fuente);
  return texto;
}

function dentroDeEvidencia(nodo, fuente) {
  for (let n = nodo; n.parent; n = n.parent) {
    const padre = n.parent;
    if (
      ts.isIfStatement(padre) &&
      padre.thenStatement === n &&
      /process\.env\.EVIDENCIA\s*===\s*["']1["']/.test(padre.expression.getText(fuente))
    )
      return true;
  }
  return false;
}

/** Escrituras de un archivo de pruebas que caerían dentro del repositorio sin EVIDENCIA=1. */
export function escriturasEnRepositorio(texto, archivo = "prueba.spec.ts") {
  const fuente = ts.createSourceFile(archivo, texto, ts.ScriptTarget.Latest, true);
  const hallazgos = [];
  const visitar = (nodo) => {
    if (ts.isCallExpression(nodo)) {
      const nombre = nombreLlamada(nodo);
      let destino;
      if (nombre in ESCRITURAS) destino = nodo.arguments[ESCRITURAS[nombre]];
      if (nombre === "screenshot") {
        const opciones = nodo.arguments[0];
        if (opciones && ts.isObjectLiteralExpression(opciones))
          destino = opciones.properties.find((p) => p.name?.getText(fuente) === "path")?.initializer;
      }
      if (destino) {
        const texto = textoDestino(destino, fuente);
        if (!DESTINOS_PERMITIDOS.some((r) => r.test(texto)) && !dentroDeEvidencia(nodo, fuente)) {
          const { line } = fuente.getLineAndCharacterOfPosition(nodo.getStart(fuente));
          hallazgos.push(`${archivo}:${line + 1}: ${nombre}`);
        }
      }
    }
    ts.forEachChild(nodo, visitar);
  };
  visitar(fuente);
  return hallazgos;
}

test("D-08 / H-65: ninguna prueba de navegador escribe en el repositorio sin EVIDENCIA=1", () => {
  const raiz = new URL("../pruebas-e2e/", import.meta.url);
  const archivos = readdirSync(raiz, { recursive: true })
    .map((nombre) => nombre.replaceAll("\\", "/"))
    .filter((nombre) => nombre.endsWith(".ts") && nombre !== "comunes/evidencia.ts");
  assert.ok(archivos.length > 20);
  const hallazgos = archivos.flatMap((nombre) =>
    escriturasEnRepositorio(readFileSync(new URL(nombre, raiz), "utf8"), `pruebas-e2e/${nombre}`),
  );
  assert.deepEqual(hallazgos, []);
});

test("D-08 / H-65: el detector reconoce las escrituras prohibidas y las permitidas", () => {
  const prohibidas = [
    'await page.screenshot({ path: "pruebas-e2e/sitio/evidencias/a.png" });',
    'await writeFile("plan/evidencias/X/a.json", "{}");',
    "const archivo = `pruebas-e2e/x/${n}.png`; await fs.writeFile(archivo, imagen);",
    'cpSync("a", "evidencia/X/a.png");',
    'if (otra) await writeFile("plan/a.txt", "x");',
  ];
  for (const codigo of prohibidas) assert.equal(escriturasEnRepositorio(codigo).length, 1, codigo);
  const permitidas = [
    "await page.screenshot({ path: `test-results/r/${n}.png`, fullPage: true });",
    'const archivo = test.info().outputPath("a.json"); await writeFile(archivo, "{}");',
    'if (process.env.EVIDENCIA === "1") { await writeFile("plan/evidencias/X/a.png", imagen); }',
    'const destino = resolve(".next/standalone"); const listo = `${destino}/x`; writeFileSync(listo, "1");',
    "await info.attach('a', { body: await page.screenshot({ fullPage: true }) });",
  ];
  for (const codigo of permitidas) assert.deepEqual(escriturasEnRepositorio(codigo), [], codigo);
});

test("D-08 / H-65: la ayuda de evidencia solo escribe con EVIDENCIA=1", async () => {
  const carpeta = mkdtempSync(join(tmpdir(), "ce13-evidencia-"));
  const anterior = process.env.EVIDENCIA;
  const pagina = { screenshot: async () => Buffer.from("png") };
  try {
    delete process.env.EVIDENCIA;
    await capturaEvidencia(pagina, join(carpeta, "sin", "captura.png"));
    await archivoEvidencia(join(carpeta, "sin", "datos.json"), "{}");
    assert.equal(existsSync(join(carpeta, "sin")), false);

    process.env.EVIDENCIA = "1";
    await capturaEvidencia(pagina, join(carpeta, "con", "captura.png"));
    await archivoEvidencia(join(carpeta, "con", "datos.json"), "{}");
    assert.equal(readFileSync(join(carpeta, "con", "captura.png"), "utf8"), "png");
    assert.equal(readFileSync(join(carpeta, "con", "datos.json"), "utf8"), "{}");
  } finally {
    if (anterior === undefined) delete process.env.EVIDENCIA;
    else process.env.EVIDENCIA = anterior;
    rmSync(carpeta, { recursive: true, force: true });
  }
});
