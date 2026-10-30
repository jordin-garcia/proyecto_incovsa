// Resumen de la matriz de navegadores y tamaños (JG-16, specs/16 decisión 46).
// Lee los reportes JSON de Playwright de cada combinación y escribe una tabla en Markdown por navegador y tamaño,
// la evidencia del Documento 6 §6 (responsive) y §7 (compatibilidad).
//
// Uso: node scripts/resumen-matriz.mjs <carpeta con los resultados*.json>
// La salida va a la consola; en GitHub Actions se agrega también al resumen de la ejecución.
import { appendFileSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const NAVEGADORES = { chromium: "Chromium", firefox: "Firefox", webkit: "WebKit" };
const TAMANOS = {
  telefono: "Teléfono (390 × 844)",
  tableta: "Tableta (768 × 1024)",
  escritorio: "Escritorio (1440 × 900)",
  tv: "TV (1920 × 1080)",
};
const ESTADOS = { unexpected: "fallida", flaky: "inestable" };

// Recorre las suites anidadas del reporte y devuelve cada caso con su archivo, línea, título y estado.
// El primer nivel de suites es el archivo (describe = null); los siguientes son los describe.
function casos(suites, describe = null) {
  const lista = [];
  for (const suite of suites ?? []) {
    const ruta = describe === null ? [] : [...describe, suite.title];
    for (const spec of suite.specs ?? []) {
      for (const prueba of spec.tests ?? []) {
        lista.push({
          prueba: `${spec.file}:${spec.line} › ${[...ruta, spec.title].join(" › ")}`,
          proyecto: prueba.projectName,
          estado: prueba.status,
        });
      }
    }
    lista.push(...casos(suite.suites, ruta));
  }
  return lista;
}

export function resumirReporte(reporte) {
  const todos = casos(reporte.suites);
  const proyectos = [...new Set(todos.map((c) => c.proyecto))];
  const contar = (estado) => todos.filter((c) => c.estado === estado).length;
  const lista = (estado) =>
    todos.filter((c) => c.estado === estado).map((c) => ({ prueba: c.prueba, estado: ESTADOS[estado] }));
  return {
    navegador: reporte.config?.metadata?.navegador ?? "desconocido",
    proyecto: proyectos.length === 1 ? proyectos[0] : proyectos.join(", ") || "sin pruebas",
    aprobadas: contar("expected"),
    fallidas: contar("unexpected"),
    inestables: contar("flaky"),
    omitidas: contar("skipped"),
    minutos: Math.round((reporte.stats?.duration ?? 0) / 60_000),
    // Errores fuera de las pruebas: el servidor no arrancó o un archivo de pruebas no cargó.
    errores: (reporte.errors ?? []).length,
    fallos: lista("unexpected"),
    repetidas: lista("flaky"),
  };
}

export function informeMatriz(resumenes) {
  const lineas = [
    "| Navegador | Tamaño | Aprobadas | Fallidas | Inestables | Omitidas | Minutos |",
    "|---|---|---|---|---|---|---|",
  ];
  for (const [navegador, nombreNavegador] of Object.entries(NAVEGADORES)) {
    for (const [proyecto, nombreTamano] of Object.entries(TAMANOS)) {
      const r = resumenes.find((x) => x.navegador === navegador && x.proyecto === proyecto);
      lineas.push(
        r
          ? `| ${nombreNavegador} | ${nombreTamano} | ${r.aprobadas} | ${r.fallidas} | ${r.inestables} | ${r.omitidas} | ${r.minutos} |`
          : `| ${nombreNavegador} | ${nombreTamano} | sin resultado | | | | |`,
      );
    }
  }
  const detalle = (titulo, clave) => {
    const filas = resumenes.flatMap((r) =>
      r[clave].map((f) => `| ${NAVEGADORES[r.navegador] ?? r.navegador} | ${r.proyecto} | ${f.prueba} |`),
    );
    if (filas.length === 0) return [];
    return ["", `### ${titulo}`, "", "| Navegador | Tamaño | Prueba |", "|---|---|---|", ...filas];
  };
  lineas.push(...detalle("Fallidas", "fallos"), ...detalle("Pasaron al repetirse", "repetidas"));
  return lineas.join("\n") + "\n";
}

/** Hay problemas si falta alguna combinación, alguna prueba falló o Playwright reportó errores fuera de las pruebas. */
export function hayProblemas(resumenes) {
  const completas = Object.keys(NAVEGADORES).every((navegador) =>
    Object.keys(TAMANOS).every((proyecto) =>
      resumenes.some((r) => r.navegador === navegador && r.proyecto === proyecto),
    ),
  );
  return !completas || resumenes.some((r) => r.fallidas > 0 || r.errores > 0);
}

// Busca los resultados*.json dentro de la carpeta (las descargas de artefactos crean una subcarpeta por artefacto).
function reportesEn(carpeta) {
  const archivos = [];
  for (const nombre of readdirSync(carpeta)) {
    const ruta = join(carpeta, nombre);
    if (statSync(ruta).isDirectory()) archivos.push(...reportesEn(ruta));
    else if (/^resultados.*\.json$/.test(nombre)) archivos.push(ruta);
  }
  return archivos;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const carpeta = process.argv[2];
  if (!carpeta) {
    console.error("Uso: node scripts/resumen-matriz.mjs <carpeta con los resultados*.json>");
    process.exit(2);
  }
  const resumenes = reportesEn(carpeta).map((ruta) => resumirReporte(JSON.parse(readFileSync(ruta, "utf8"))));
  const texto = informeMatriz(resumenes);
  process.stdout.write(texto);
  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Matriz de navegadores\n\n${texto}`);
  // Falla si hay problemas, para que la ejecución se vea en rojo.
  if (hayProblemas(resumenes)) process.exit(1);
}
