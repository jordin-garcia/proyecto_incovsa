// Pruebas de los flujos de GitHub Actions y de Dependabot (JG-08, specs/16 decisiones 47, 60, 66, 80 y 87).
// Leen los archivos como texto, sin dependencias. Adaptadas de las reglas del repositorio shapi.
// Se ejecutan con: node --test "scripts/*.test.mjs"
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR_FLUJOS = join(RAIZ, ".github", "workflows");
const leer = (...ruta) => readFileSync(join(RAIZ, ...ruta), "utf8").replace(/\r\n/g, "\n");
const flujos = () => readdirSync(DIR_FLUJOS).filter((a) => a.endsWith(".yml")).map((a) => [a, leer(".github", "workflows", a)]);

// { nombreDelTrabajo: textoDelTrabajo }. Los trabajos van con 2 espacios bajo `jobs:`.
function trabajos(flujo) {
  const lineas = flujo.split("\n");
  const inicio = lineas.findIndex((l) => l === "jobs:");
  const resultado = {};
  let actual = null;
  for (const linea of lineas.slice(inicio + 1)) {
    const nombre = linea.match(/^ {2}([\w-]+):\s*$/);
    if (nombre) {
      actual = nombre[1];
      resultado[actual] = "";
    } else if (/^\S/.test(linea) && !linea.startsWith("#")) {
      break;
    } else if (actual) {
      resultado[actual] += linea + "\n";
    }
  }
  return resultado;
}

const pasos = (trabajo) => trabajo.split(/\n(?= {6}- )/).filter((p) => /^ {6}- /.test(p));
const nombreDelCheck = (trabajo) => trabajo.match(/^ {4}name: ([\w-]+)$/m)?.[1];

// Las ocho verificaciones obligatorias de develop y main (JG-08, paso 8), con el flujo que las define.
const OBLIGATORIAS = {
  plan: "ci.yml",
  calidad: "ci.yml",
  pruebas: "ci.yml",
  compilacion: "ci.yml",
  dependencias: "ci.yml",
  titulo: "titulo-pr.yml",
  "archivos-protegidos": "archivos-protegidos.yml",
  "revision-claude": "revision-claude.yml",
};

function trabajoDelCheck(check) {
  const flujo = leer(".github", "workflows", OBLIGATORIAS[check]);
  return Object.values(trabajos(flujo)).find((t) => nombreDelCheck(t) === check);
}

test("RNF-16: existen las ocho verificaciones obligatorias y ninguna tiene `if` a nivel de trabajo", () => {
  for (const check of Object.keys(OBLIGATORIAS)) {
    const trabajo = trabajoDelCheck(check);
    assert.ok(trabajo, `falta el trabajo ${check} en ${OBLIGATORIAS[check]}`);
    // Un trabajo omitido cuenta como aprobado en la protección de ramas.
    assert.doesNotMatch(trabajo, /^ {4}if:/m, `${check} no puede tener if a nivel de trabajo`);
  }
});

test("RNF-16: las verificaciones obligatorias corren en los PR a develop y main", () => {
  for (const archivo of new Set(Object.values(OBLIGATORIAS))) {
    const flujo = leer(".github", "workflows", archivo);
    assert.match(flujo, /^ {2}pull_request:\n/m, `${archivo} debe escuchar pull_request`);
    const ramas = flujo.match(/^ {2}pull_request:\n(?: {4}#.*\n)*(?: {4}.*\n)*? {4}branches: \[([^\]]*)\]/m)?.[1];
    assert.deepEqual(ramas?.split(",").map((r) => r.trim()), ["develop", "main"], `${archivo}: ramas de pull_request`);
  }
  assert.match(leer(".github", "workflows", "ci.yml"), /^ {2}push:\n {4}branches: \[develop\]$/m);
});

test("decisión 66: todas las acciones van fijadas por un SHA de 40 caracteres", () => {
  for (const [archivo, flujo] of flujos()) {
    for (const uso of flujo.match(/uses:\s*\S+/g) ?? []) {
      const accion = uso.replace(/^uses:\s*/, "");
      if (accion.startsWith("./")) continue;
      assert.match(accion, /^[\w.-]+\/[\w./-]+@[0-9a-f]{40}$/, `${archivo}: ${accion} no está fijada por SHA`);
    }
  }
});

test("decisión 66: ningún flujo usa pull_request_target y todos declaran permisos mínimos", () => {
  for (const [archivo, flujo] of flujos()) {
    const sinComentarios = flujo.split("\n").filter((l) => !/^\s*#/.test(l)).join("\n");
    assert.doesNotMatch(sinComentarios, /pull_request_target/, `${archivo} no puede usar pull_request_target`);
    assert.match(flujo, /^permissions:\n {2}contents: read$/m, `${archivo}: faltan los permisos mínimos del flujo`);
    assert.doesNotMatch(flujo.split("\njobs:\n")[0], /write/, `${archivo}: los permisos de escritura van por trabajo`);
  }
});

test("JG-08, criterio 9: el título, el cuerpo y la rama de un PR nunca se interpolan en un comando", () => {
  // Solo se aceptan como valor de una variable de entorno: `NOMBRE: ${{ github.event.pull_request.title }}`.
  const peligrosos = /\$\{\{\s*github\.(event\.(pull_request\.(title|body|head\.ref|head\.label)|issue\.(title|body)|comment\.body|review\.body)|head_ref)\b/;
  for (const [archivo, flujo] of flujos()) {
    for (const linea of flujo.split("\n")) {
      if (!peligrosos.test(linea)) continue;
      assert.match(linea, /^ +[A-Z_]+: \$\{\{ github\.[\w.]+ \}\}$/, `${archivo}: interpolación peligrosa:\n${linea}`);
    }
  }
});

test("RNF-16: todos los trabajos tienen timeout-minutes", () => {
  for (const [archivo, flujo] of flujos()) {
    const todos = Object.entries(trabajos(flujo));
    assert.ok(todos.length > 0, `${archivo}: no se encontró ningún trabajo`);
    for (const [nombre, texto] of todos) {
      assert.match(texto, /^ {4}timeout-minutes: \d+$/m, `${archivo}: el trabajo ${nombre} no tiene timeout-minutes`);
    }
  }
});

test("JG-08, criterio 8: antes de JG-02, los trabajos que necesitan la aplicación terminan bien sin ejecutar nada", () => {
  for (const check of ["calidad", "pruebas", "compilacion", "dependencias"]) {
    const lista = pasos(trabajoDelCheck(check));
    const decision = lista.findIndex((p) => /^ {8}id: proyecto$/m.test(p));
    assert.ok(decision > 0, `${check}: falta el paso que detecta el proyecto base (id: proyecto)`);
    assert.match(lista[decision], /\[ -f package\.json \]/, `${check}: la detección debe buscar package.json`);
    assert.doesNotMatch(lista[decision], /^ {8}(if|continue-on-error):/m, `${check}: la detección no se puede omitir`);
    // Todos los pasos posteriores dependen de la detección y ninguno puede fallar en silencio.
    for (const paso of lista.slice(decision + 1)) {
      assert.match(paso, /^(?: {6}- | {8})if: steps\.proyecto\.outputs\.\w+ != 'false'$/m, `${check}: paso sin la condición:\n${paso}`);
      assert.doesNotMatch(paso, /continue-on-error/, `${check}: paso con continue-on-error:\n${paso}`);
    }
  }
});

test("decisión 47: la CI ejecuta formato, lint, tipos, pruebas sobre PostgreSQL 18 con migraciones desde cero, compilación y npm audit", () => {
  const ci = trabajos(leer(".github", "workflows", "ci.yml"));
  assert.match(ci.plan, /node scripts\/tareas\.mjs --validar/);
  assert.match(ci.plan, /node --test "scripts\/\*\.test\.mjs"/);
  for (const comando of ["npm ci", "npm run formato", "npm run lint", "npm run tipos"]) assert.match(ci.calidad, new RegExp(comando));
  assert.match(ci.pruebas, /image: postgres:18\n/);
  assert.match(ci.pruebas, /\[ -f prisma\/schema\.prisma \]/);
  const lista = pasos(ci.pruebas);
  const aplicar = lista.findIndex((p) => p.includes("npm run db:aplicar"));
  const pruebas = lista.findIndex((p) => p.includes("npm test"));
  assert.ok(aplicar >= 0 && aplicar < pruebas, "las migraciones se aplican antes de las pruebas");
  assert.match(ci.compilacion, /npm run build/);
  assert.match(ci.dependencias, /npm audit --audit-level=high/);
});

test("JG-08, criterio 3: titulo valida el formato y el cierre de la tarea, con el título en una variable", () => {
  const titulo = trabajoDelCheck("titulo");
  assert.match(titulo, /fetch-depth: 2\n/);
  const lista = pasos(titulo);
  const indice = (texto) => lista.findIndex((p) => p.includes(texto));
  assert.ok(indice("--validar-titulo") >= 0 && indice("--validar-titulo") < indice("--validar-cierre"));
  for (const paso of [lista[indice("--validar-titulo")], lista[indice("--validar-cierre")]]) {
    assert.match(paso, /TITULO_PR: \$\{\{ github\.event\.pull_request\.title \}\}/);
    assert.doesNotMatch(paso, /^ {8}(if|continue-on-error):/m);
  }
  assert.deepEqual(
    leer(".github", "workflows", "titulo-pr.yml").match(/types: \[([^\]]*)\]/)[1].split(",").map((e) => e.trim()),
    ["opened", "synchronize", "reopened", "edited"],
  );
});

test("decisión 80: archivos-protegidos ejecuta la versión de develop del script, con el autor en una variable", () => {
  const trabajo = trabajoDelCheck("archivos-protegidos");
  assert.match(trabajo, /fetch-depth: 2\n/);
  assert.match(trabajo, /AUTOR_PR: \$\{\{ github\.event\.pull_request\.user\.login \}\}/);
  // Un PR no puede cambiar el script y aprobarse solo: se toma del primer padre del commit de integración.
  assert.match(trabajo, /git show HEAD\^1:scripts\/archivos-protegidos\.mjs/);
});

test("decisión 60: revision-claude siempre decide el veredicto y deja la revisión formal", () => {
  const trabajo = trabajoDelCheck("revision-claude");
  const lista = pasos(trabajo);
  const accion = lista.find((p) => p.includes("uses: anthropics/claude-code-action@"));
  const veredicto = lista.find((p) => p.includes("name: Veredicto de la revisión"));
  const formal = lista.find((p) => p.includes("name: Revisión formal"));
  assert.ok(accion && veredicto && formal, "faltan los pasos de la revisión, del veredicto o de la revisión formal");
  assert.match(accion, /claude_code_oauth_token: \$\{\{ secrets\.CLAUDE_CODE_OAUTH_TOKEN \}\}/);
  // Si la acción falla, el veredicto igual se ejecuta y el check falla porque no encuentra la revisión.
  assert.match(accion, /^ {8}continue-on-error: true$/m);
  assert.match(veredicto, /^ {8}if: \$\{\{ !cancelled\(\) \}\}$/m);
  assert.doesNotMatch(veredicto, /continue-on-error/);
  assert.match(veredicto, /node scripts\/veredicto-revision\.mjs "\$RUNNER_TEMP\/comentarios\.jsonl" "\$SHA" "\$TAREA"/);
  // Aprobar con LISTO y solicitar cambios con CORREGIR; el autor se menciona para que le llegue el correo.
  assert.match(formal, /gh pr review "\$PR" --approve/);
  assert.match(formal, /gh pr review "\$PR" --request-changes/);
  assert.match(formal, /@\$AUTOR/);
  // Las herramientas del bot son las mínimas.
  assert.match(accion, /--allowedTools "Read,Grep,Glob,Bash\(git diff:\*\),Bash\(gh pr view:\*\),Bash\(gh pr diff:\*\),Bash\(gh pr comment:\*\)"/);
  assert.match(trabajo, /^ {6}pull-requests: write$/m);
});

test("decisión 60: claude-interactivo responde a @claude y no genera un check revision-claude", () => {
  const flujo = leer(".github", "workflows", "claude-interactivo.yml");
  assert.match(flujo, /contains\(github\.event\.comment\.body, '@claude'\)/);
  assert.doesNotMatch(flujo, /name: revision-claude/);
  assert.doesNotMatch(flujo, /^ {2}pull_request:/m);
});

test("decisión 87: el tablero corre en cada integración a develop, cada día a las 07:00 de Guatemala y a mano", () => {
  const flujo = leer(".github", "workflows", "tablero-plan.yml");
  assert.match(flujo, /^ {2}push:\n {4}branches: \[develop\]$/m);
  assert.match(flujo, /cron: "0 13 \* \* \*"/);
  assert.match(flujo, /workflow_dispatch:/);
  assert.match(flujo, /TZ: America\/Guatemala/);
  assert.match(flujo, /node scripts\/tablero\.mjs/);
  assert.match(flujo, /gh issue pin/);
  assert.match(flujo, /FORZAR_RECORDATORIO: \$\{\{ inputs\.forzar_recordatorio \}\}/);
});

test("JG-08: Dependabot propone actualizaciones semanales de npm y de GitHub Actions a develop", () => {
  const dependabot = leer(".github", "dependabot.yml");
  for (const ecosistema of ["npm", "github-actions"]) {
    const bloque = dependabot.split(/\n(?= {2}- package-ecosystem:)/).find((b) => b.includes(`package-ecosystem: "${ecosistema}"`));
    assert.ok(bloque, `falta ${ecosistema}`);
    assert.match(bloque, /interval: "weekly"/);
    assert.match(bloque, /target-branch: "develop"/);
  }
});
