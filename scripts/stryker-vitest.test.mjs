import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, symlinkSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

test("RNF-16: Stryker ejecuta y mata mutantes con pruebas de Vitest 5 en describe anidados", () => {
  const carpeta = mkdtempSync(join(tmpdir(), "incovsa-mutacion-regresion-"));
  try {
    symlinkSync(resolve("node_modules"), join(carpeta, "node_modules"), "junction");
    writeFileSync(join(carpeta, "package.json"), '{"type":"module"}');
    writeFileSync(join(carpeta, "calculo.js"), "export function doble(valor) { return valor * 2; }");
    writeFileSync(
      join(carpeta, "calculo.test.js"),
      `
      import { describe, it, expect } from 'vitest';
      import { doble } from './calculo.js';
      describe('RN-01: módulo', () => {
        describe('con espacios y (paréntesis)', () => {
          it('RN-01: duplica sin alterar cantidades', () => expect(doble(3)).toBe(6));
        });
      });
    `,
    );
    writeFileSync(
      join(carpeta, "vitest.config.mjs"),
      "export default { test: { include: ['calculo.test.js'], fsModuleCache: false } };",
    );
    const adaptador = fileURLToPath(new URL("./stryker-vitest.mjs", import.meta.url)).replaceAll("\\", "/");
    writeFileSync(
      join(carpeta, "stryker.config.mjs"),
      `export default {
      testRunner: 'vitest-incovsa',
      plugins: ['@stryker-mutator/vitest-runner', ${JSON.stringify(adaptador)}],
      vitest: { configFile: 'vitest.config.mjs' },
      mutate: ['calculo.js'], concurrency: 1, reporters: ['json'],
      thresholds: { high: 80, low: 60, break: 60 }
    };`,
    );
    const resultado = spawnSync(
      process.execPath,
      [resolve("node_modules/@stryker-mutator/core/bin/stryker.js"), "run"],
      {
        cwd: carpeta,
        encoding: "utf8",
        timeout: 180000,
        maxBuffer: 2 * 1024 * 1024,
        windowsHide: true,
      },
    );
    assert.equal(resultado.status, 0, `${resultado.error ?? ""}\n${resultado.stdout}\n${resultado.stderr}`);
    const informe = JSON.parse(readFileSync(join(carpeta, "reports/mutation/mutation.json"), "utf8"));
    const mutantes = Object.values(informe.files).flatMap((archivo) => archivo.mutants);
    assert.ok(mutantes.length > 0);
    assert.ok(mutantes.some((mutante) => mutante.status === "Killed" && mutante.killedBy.length > 0));
    assert.ok(mutantes.every((mutante) => mutante.status === "Killed"));
  } finally {
    rmSync(carpeta, { recursive: true, force: true });
  }
});
