#!/usr/bin/env node
// Verificación obligatoria `archivos-protegidos` (JG-08, specs/16 decisión 80). Falla si un PR cuyo autor no es el
// coordinador modifica un archivo protegido de plan/convenciones.md §3. Excepción: Carlos también puede modificar
// .github/workflows/despliegue.yml y .github/workflows/produccion-*.yml.
//
// No importa nada del repositorio: archivos-protegidos.yml ejecuta la versión de develop de este archivo, para que
// un PR no pueda cambiarlo y aprobarse solo.
//
// Uso:
//   AUTOR_PR=<usuario de GitHub> node scripts/archivos-protegidos.mjs      en la CI (lee el diff del PR)
//   node scripts/archivos-protegidos.mjs <usuario>                         en local, contra origin/develop
import { execFileSync } from "node:child_process";
import { realpathSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const COORDINADOR = "jordin-garcia";

// plan/convenciones.md §3. `**` es cualquier ruta dentro de la carpeta; `*`, cualquier texto sin "/".
// "Los scripts de la CI" son los que ejecutan los flujos de .github/workflows/ y sus pruebas.
const PROTEGIDOS = [
  "AGENTS.md",
  "CLAUDE.md",
  ".claude/**",
  ".codex/**",
  ".cursor/**",
  ".agents/**",
  ".mcp.json",
  ".github/**",
  "prisma/schema.prisma",
  "prisma/migrations/**",
  "package.json",
  "package-lock.json",
  ".npmrc",
  "vendor/**",
  "plan/protocolo.md",
  "plan/convenciones.md",
  "plan/prompts/**",
  "scripts/tareas.mjs",
  "scripts/archivos-protegidos.mjs",
  "scripts/archivos-protegidos.test.mjs",
  "scripts/veredicto-revision.mjs",
  "scripts/veredicto-revision.test.mjs",
  "scripts/tablero.mjs",
  "scripts/tablero.test.mjs",
  "scripts/flujos.test.mjs",
  "specs/16-arquitectura-y-tecnologia.md",
  "specs/19-pendientes.md",
];

// Archivos protegidos que, además del coordinador, puede modificar otra persona (usuario de GitHub en minúsculas).
const EXCEPCIONES = {
  carloshugoeg: [".github/workflows/despliegue.yml", ".github/workflows/produccion-*.yml"],
};

function aExpresion(patron) {
  const cuerpo = patron
    .split("**")
    .map((parte) => parte.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*"))
    .join(".*");
  return new RegExp(`^${cuerpo}$`);
}

const RE_PROTEGIDOS = PROTEGIDOS.map(aExpresion);
const RE_EXCEPCIONES = Object.fromEntries(Object.entries(EXCEPCIONES).map(([u, ps]) => [u, ps.map(aExpresion)]));

export function esProtegido(ruta) {
  return RE_PROTEGIDOS.some((re) => re.test(ruta));
}

/** Los archivos protegidos del PR que su autor no puede modificar. */
export function archivosNoPermitidos(autor, archivos) {
  const usuario = String(autor ?? "").toLowerCase();
  if (usuario === COORDINADOR) return [];
  const permitidos = RE_EXCEPCIONES[usuario] ?? [];
  return archivos.filter((a) => esProtegido(a) && !permitidos.some((re) => re.test(a)));
}

const gitPorDefecto = (args) => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });

// Como en scripts/tareas.mjs: en la CI de un pull_request, actions/checkout deja el commit de prueba de la
// integración, cuyo primer padre es la punta de la rama base (hace falta fetch-depth: 2). En local se compara contra
// origin/develop. Con --no-renames, un archivo movido aparece con su ruta de origen y con la de destino.
// Devuelve null si no se puede leer el diff.
export function archivosDelPr(git = gitPorDefecto, entorno = process.env) {
  try {
    let rango;
    if (entorno.GITHUB_EVENT_NAME === "pull_request") {
      git(["rev-parse", "--verify", "--quiet", "HEAD^2"]);
      rango = ["HEAD^1", "HEAD"];
    } else {
      git(["rev-parse", "--verify", "--quiet", "origin/develop"]);
      rango = ["origin/develop...HEAD"];
    }
    return git(["diff", "--name-only", "--no-renames", ...rango])
      .split(/\r?\n/)
      .filter(Boolean);
  } catch {
    return null;
  }
}

const esPrincipal =
  import.meta.main ??
  (process.argv[1] && pathToFileURL(realpathSync(resolve(process.argv[1]))).href === import.meta.url);

if (esPrincipal) {
  const autor = process.argv[2] ?? process.env.AUTOR_PR;
  if (!autor) {
    console.error(
      "Uso: AUTOR_PR=<usuario> node scripts/archivos-protegidos.mjs  (o: node scripts/archivos-protegidos.mjs <usuario>)",
    );
    process.exit(2);
  }
  const archivos = archivosDelPr();
  if (archivos === null) {
    console.error(
      "No se pudo leer el diff del PR (¿falta fetch-depth: 2 en actions/checkout?): no se puede comprobar.",
    );
    process.exit(1);
  }
  const prohibidos = archivosNoPermitidos(autor, archivos);
  if (prohibidos.length) {
    console.error(
      `El PR de ${autor} modifica archivos protegidos (plan/convenciones.md §3), que solo cambia el coordinador:\n` +
        prohibidos.map((a) => `- ${a}`).join("\n") +
        "\nQuita esos cambios del PR y pídeselos al coordinador (plan/protocolo.md §C).",
    );
    process.exit(1);
  }
  console.log(`Sin archivos protegidos no permitidos para ${autor} (${archivos.length} archivos revisados).`);
}
