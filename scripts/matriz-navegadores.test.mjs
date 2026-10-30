// Pruebas de la matriz de navegadores y tamaños (JG-16, specs/16 decisión 46, RNF-01, RNF-02, RNF-11 y RNF-14).
// Se ejecutan con: node --test "scripts/*.test.mjs"
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resumirReporte, informeMatriz } from "./resumen-matriz.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const leer = (...ruta) => readFileSync(join(RAIZ, ...ruta), "utf8").replace(/\r\n/g, "\n");

// Carga playwright.config.ts con el navegador indicado. El parámetro de la URL evita la caché de módulos.
let carga = 0;
async function configuracion(navegador) {
  const anterior = process.env.NAVEGADOR;
  if (navegador === undefined) delete process.env.NAVEGADOR;
  else process.env.NAVEGADOR = navegador;
  try {
    const url = pathToFileURL(join(RAIZ, "playwright.config.ts"));
    url.search = `?carga=${++carga}`;
    return (await import(url.href)).default;
  } finally {
    if (anterior === undefined) delete process.env.NAVEGADOR;
    else process.env.NAVEGADOR = anterior;
  }
}

const TAMANOS = {
  telefono: { width: 390, height: 844 },
  tableta: { width: 768, height: 1024 },
  escritorio: { width: 1440, height: 900 },
  tv: { width: 1920, height: 1080 },
};

test("RNF-11: sin NAVEGADOR, las pruebas corren en Chromium en los cuatro tamaños de plan/convenciones.md §6", async () => {
  const config = await configuracion(undefined);
  assert.deepEqual(
    config.projects.map((p) => p.name),
    Object.keys(TAMANOS),
  );
  for (const proyecto of config.projects) {
    assert.equal(proyecto.use.browserName, "chromium", proyecto.name);
    assert.deepEqual(proyecto.use.viewport, TAMANOS[proyecto.name], proyecto.name);
  }
  assert.match(String(config.projects.find((p) => p.name === "tv").testMatch), /tablero/);
});

for (const navegador of ["chromium", "firefox", "webkit"]) {
  test(`RNF-11: con NAVEGADOR=${navegador}, los mismos cuatro proyectos corren en ${navegador}`, async () => {
    const config = await configuracion(navegador);
    assert.deepEqual(
      config.projects.map((p) => p.name),
      Object.keys(TAMANOS),
    );
    for (const proyecto of config.projects) {
      assert.equal(proyecto.use.browserName, navegador, proyecto.name);
      assert.deepEqual(proyecto.use.viewport, TAMANOS[proyecto.name], proyecto.name);
    }
    // RNF-02 y RNF-14: el teléfono y la tableta tienen pantalla táctil en los tres navegadores.
    for (const nombre of ["telefono", "tableta"]) {
      const proyecto = config.projects.find((p) => p.name === nombre);
      assert.equal(proyecto.use.hasTouch, true, nombre);
      // Firefox no admite isMobile: Playwright rechaza el contexto si se le pasa.
      if (navegador === "firefox") assert.notEqual(proyecto.use.isMobile, true, nombre);
      else assert.equal(proyecto.use.isMobile, true, nombre);
    }
  });
}

test("RNF-11: un NAVEGADOR desconocido detiene la corrida con un mensaje claro", async () => {
  await assert.rejects(configuracion("edge"), /NAVEGADOR debe ser chromium, firefox o webkit/);
});

test("decisión 46: matriz-navegadores.yml corre todas las pruebas en los 3 navegadores y los 4 tamaños y guarda el reporte", () => {
  const flujo = leer(".github", "workflows", "matriz-navegadores.yml");
  // Ejecución manual (decisión 47: Playwright antes de cada versión, no en cada PR).
  assert.match(flujo, /^ {2}workflow_dispatch:/m);
  assert.doesNotMatch(flujo, /^ {2}push:/m);
  assert.match(flujo, /^ {8}navegador: \[chromium, firefox, webkit\]$/m);
  assert.match(flujo, /^ {8}proyecto: \[telefono, tableta, escritorio, tv\]$/m);
  assert.match(flujo, /^ {6}fail-fast: false$/m);
  assert.match(flujo, /image: postgres:18/);
  assert.match(flujo, /npx playwright install --with-deps "\$NAVEGADOR"/);
  assert.match(flujo, /NAVEGADOR: \$\{\{ matrix\.navegador \}\}/);
  // Todas las pruebas de pruebas-e2e/ del proyecto, sin filtrar archivos ni títulos.
  const corrida = flujo.match(/^ {10}npm run e2e -- (.+)$/m)?.[1];
  assert.ok(corrida, "falta la corrida de npm run e2e");
  assert.match(corrida, /--project="\$PROYECTO"/);
  assert.doesNotMatch(corrida, /pruebas-e2e\/|--grep|-g /);
  assert.match(flujo, /PLAYWRIGHT_JSON_OUTPUT_NAME/);
  assert.match(flujo, /actions\/upload-artifact@/);
  assert.match(flujo, /playwright-report\//);
  // El trabajo final junta los resultados en una tabla por navegador y tamaño.
  assert.match(flujo, /node scripts\/resumen-matriz\.mjs/);
});

// Reporte JSON mínimo de Playwright con la forma de su reportero "json".
function reporte({ navegador, proyecto, specs }) {
  return {
    config: { metadata: { navegador } },
    suites: [
      {
        title: "sitio/inicio.spec.ts",
        file: "sitio/inicio.spec.ts",
        specs: specs.map(([titulo, estado, linea]) => ({
          title: titulo,
          file: "sitio/inicio.spec.ts",
          line: linea,
          tests: [{ projectName: proyecto, status: estado }],
        })),
        suites: [],
      },
    ],
    stats: { duration: 61_000 },
  };
}

test("RNF-11: el resumen cuenta las pruebas por estado y lista las que fallaron o pasaron al repetirse", () => {
  const resumen = resumirReporte(
    reporte({
      navegador: "firefox",
      proyecto: "telefono",
      specs: [
        ["RF-SW-01: portada", "expected", 10],
        ["RF-SW-02: galería", "unexpected", 20],
        ["RF-SW-03: menú", "flaky", 30],
      ],
    }),
  );
  assert.deepEqual(resumen, {
    navegador: "firefox",
    proyecto: "telefono",
    aprobadas: 1,
    fallidas: 1,
    inestables: 1,
    omitidas: 0,
    minutos: 1,
    fallos: [{ prueba: "sitio/inicio.spec.ts:20 › RF-SW-02: galería", estado: "fallida" }],
    repetidas: [{ prueba: "sitio/inicio.spec.ts:30 › RF-SW-03: menú", estado: "inestable" }],
  });
});

test("RNF-11: el informe tiene una fila por navegador y tamaño, y marca los que faltan", () => {
  const resumenes = [
    resumirReporte(reporte({ navegador: "chromium", proyecto: "telefono", specs: [["A", "expected", 1]] })),
    resumirReporte(reporte({ navegador: "webkit", proyecto: "tv", specs: [["B", "unexpected", 2]] })),
  ];
  const texto = informeMatriz(resumenes);
  assert.match(texto, /\| Navegador \| Tamaño \| Aprobadas \| Fallidas \| Inestables \| Omitidas \| Minutos \|/);
  assert.match(texto, /\| Chromium \| Teléfono \(390 × 844\) \| 1 \| 0 \| 0 \| 0 \| 1 \|/);
  assert.match(texto, /\| WebKit \| TV \(1920 × 1080\) \| 0 \| 1 \| 0 \| 0 \| 1 \|/);
  // Las 10 combinaciones sin resultado aparecen como "sin resultado" para que no pasen desapercibidas.
  assert.equal(texto.match(/sin resultado/g)?.length, 10);
  assert.match(texto, /sitio\/inicio\.spec\.ts:2 › B/);
});
