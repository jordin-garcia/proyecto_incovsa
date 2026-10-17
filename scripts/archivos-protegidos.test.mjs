// Pruebas de la verificación de archivos protegidos (JG-08, specs/16 decisión 80, plan/convenciones.md §3).
// Se ejecutan con: node --test "scripts/*.test.mjs"
import { test } from "node:test";
import assert from "node:assert/strict";
import { archivosNoPermitidos, esProtegido, archivosDelPr } from "./archivos-protegidos.mjs";

test("decisión 80: los archivos de plan/convenciones.md §3 son protegidos", () => {
  const protegidos = [
    "AGENTS.md",
    "CLAUDE.md",
    ".claude/settings.json",
    ".claude/agents/revisor.md",
    ".codex/config.toml",
    ".cursor/mcp.json",
    ".agents/skills/algo.md",
    ".mcp.json",
    ".github/workflows/ci.yml",
    ".github/pull_request_template.md",
    ".github/dependabot.yml",
    "prisma/schema.prisma",
    "prisma/migrations/20261017000000_inicial/migration.sql",
    "package.json",
    "package-lock.json",
    ".npmrc",
    "vendor/fuentes/poppins.woff2",
    "plan/protocolo.md",
    "plan/convenciones.md",
    "plan/prompts/revision.md",
    "scripts/tareas.mjs",
    "scripts/archivos-protegidos.mjs",
    "scripts/archivos-protegidos.test.mjs",
    "scripts/veredicto-revision.mjs",
    "scripts/tablero.mjs",
    "scripts/flujos.test.mjs",
    "specs/16-arquitectura-y-tecnologia.md",
    "specs/19-pendientes.md",
  ];
  for (const ruta of protegidos) assert.ok(esProtegido(ruta), `debería ser protegido: ${ruta}`);
});

test("decisión 80: los archivos de las tareas no son protegidos", () => {
  const libres = [
    "plan/tareas/JM-03-bodega-preparacion.md",
    "plan/bitacora/josue.md",
    "plan/calendario.md",
    "specs/07-modulo-bodega.md",
    "specs/18-historial-de-decisiones.md",
    "src/app/(panel)/panel/bodega/page.tsx",
    "prisma/semillas/base.ts",
    "scripts/respaldo.sh",
    "scripts/verificar-entorno.mjs",
    "pruebas/conversion.test.ts",
    "README.md",
    // Que se parezca no basta: la ruta debe coincidir completa.
    "docs/AGENTS.md",
    "src/package.json.ts",
    ".github-notas.md",
  ];
  for (const ruta of libres) assert.ok(!esProtegido(ruta), `no debería ser protegido: ${ruta}`);
});

test("decisión 80: un PR de otra cuenta que cambia prisma/schema.prisma o AGENTS.md no se permite", () => {
  assert.deepEqual(archivosNoPermitidos("Josh-JM", ["src/lib/conversion.ts", "prisma/schema.prisma"]), ["prisma/schema.prisma"]);
  assert.deepEqual(archivosNoPermitidos("InAlexa", ["AGENTS.md", "plan/bitacora/daniela.md"]), ["AGENTS.md"]);
});

test("decisión 80: el coordinador puede cambiar cualquier archivo protegido", () => {
  assert.deepEqual(archivosNoPermitidos("jordin-garcia", ["prisma/schema.prisma", "AGENTS.md", ".github/workflows/ci.yml"]), []);
});

test("decisión 80: Carlos puede cambiar los flujos de despliegue y producción, y nada más de .github", () => {
  const archivos = [
    ".github/workflows/despliegue.yml",
    ".github/workflows/produccion-respaldo.yml",
    ".github/workflows/ci.yml",
    "package.json",
  ];
  assert.deepEqual(archivosNoPermitidos("carloshugoeg", archivos), [".github/workflows/ci.yml", "package.json"]);
  // La excepción es solo de Carlos.
  assert.deepEqual(archivosNoPermitidos("JDaniC", [".github/workflows/despliegue.yml"]), [".github/workflows/despliegue.yml"]);
  // Y solo para archivos directos de .github/workflows/, no en subcarpetas.
  assert.deepEqual(archivosNoPermitidos("carloshugoeg", [".github/workflows/produccion-x/otro.yml"]), [".github/workflows/produccion-x/otro.yml"]);
});

test("decisión 80: un bot (por ejemplo Dependabot) tampoco puede cambiar archivos protegidos", () => {
  assert.deepEqual(archivosNoPermitidos("dependabot[bot]", ["package.json", "package-lock.json"]), ["package.json", "package-lock.json"]);
});

test("decisión 80: el usuario de GitHub se compara sin distinguir mayúsculas", () => {
  assert.deepEqual(archivosNoPermitidos("Jordin-Garcia", ["AGENTS.md"]), []);
  assert.deepEqual(archivosNoPermitidos("CarlosHugoEG", [".github/workflows/despliegue.yml"]), []);
});

test("decisión 80: en la CI, los archivos del PR son el commit de integración contra su primer padre", () => {
  const llamadas = [];
  const git = (args) => {
    llamadas.push(args.join(" "));
    if (args[0] === "diff") return "AGENTS.md\nsrc/app/page.tsx\n";
    return "";
  };
  assert.deepEqual(archivosDelPr(git, { GITHUB_EVENT_NAME: "pull_request" }), ["AGENTS.md", "src/app/page.tsx"]);
  assert.ok(llamadas.includes("diff --name-only --no-renames HEAD^1 HEAD"), llamadas.join("\n"));
});

test("decisión 80: si no se puede leer el diff, devuelve null (la verificación falla)", () => {
  const git = () => {
    throw new Error("sin historia");
  };
  assert.equal(archivosDelPr(git, { GITHUB_EVENT_NAME: "pull_request" }), null);
});
