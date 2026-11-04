import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const leer = (archivo) => readFileSync(new URL(`../${archivo}`, import.meta.url), "utf8");

test("RNF-16: los seis controles corren siempre en PR a develop y main", () => {
  const seguridad = leer(".github/workflows/seguridad.yml");
  assert.match(seguridad, /pull_request:\s*\n\s*branches: \[develop, main\]/);
  for (const nombre of ["semgrep", "secretos", "cadena-suministro", "workflows", "integridad-pruebas"]) {
    assert.match(seguridad, new RegExp(`^  ${nombre}:\\n    name: ${nombre}\\n`, "m"));
  }
  const mutacion = leer(".github/workflows/mutacion.yml");
  assert.match(mutacion, /pull_request:\s*\n\s*branches: \[develop, main\]/);
  assert.match(mutacion, /schedule:/);
  assert.match(mutacion, /name: mutacion/);
  assert.match(mutacion, /DATABASE_URL_PRUEBAS:/);
  assert.match(mutacion, /npm run test:mutacion/);
});

test("RNF-04/RNF-05: Semgrep ejecuta reglas propias, públicas y casos de regresión", () => {
  const texto = leer(".github/workflows/seguridad.yml");
  for (const patron of [
    /--config .semgrep\/seguridad.yml/,
    /--config p\/typescript/,
    /--config p\/nextjs/,
    /node scripts\/probar-semgrep.mjs/,
  ])
    assert.match(texto, patron);
});

test("RNF-10/RNF-16: secretos y dependencias fallan en vez de ignorar los resultados", () => {
  const texto = leer(".github/workflows/seguridad.yml");
  assert.match(texto, /gitleaks git --redact/);
  assert.match(texto, /osv-scanner scan source --lockfile=package-lock.json/);
  assert.match(texto, /node scripts\/cadena-suministro.mjs/);
  assert.doesNotMatch(texto, /continue-on-error/);
  assert.match(leer(".husky/pre-commit"), /gitleaks git --staged --redact/);
});

test("RNF-16: la integridad compara contra la base del PR con historial completo", () => {
  const texto = leer(".github/workflows/seguridad.yml");
  assert.match(texto, /fetch-depth: 0/);
  assert.match(texto, /git show "\$BASE:scripts\/integridad-pruebas.mjs"/);
  assert.match(texto, /BASE: \$\{\{ github.event.pull_request.base.sha \}\}/);
});
