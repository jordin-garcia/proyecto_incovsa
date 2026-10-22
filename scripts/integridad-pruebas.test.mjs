import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { comprobarIntegridad, analizarPruebas } from "./integridad-pruebas.mjs";

function comparar(antes, despues) {
  const carpeta = mkdtempSync(join(tmpdir(), "incovsa-integridad-"));
  const git = (...args) => execFileSync("git", args, { cwd: carpeta, encoding: "utf8" });
  try {
    git("init", "-q");
    git("config", "user.name", "Prueba");
    git("config", "user.email", "prueba@example.invalid");
    for (const [archivo, contenido] of Object.entries(antes)) {
      mkdirSync(join(carpeta, archivo, ".."), { recursive: true });
      writeFileSync(join(carpeta, archivo), contenido);
    }
    git("add", ".");
    git("commit", "-qm", "Base");
    const base = git("rev-parse", "HEAD").trim();
    for (const [archivo, contenido] of Object.entries(despues)) {
      if (contenido === null) rmSync(join(carpeta, archivo));
      else {
        mkdirSync(join(carpeta, archivo, ".."), { recursive: true });
        writeFileSync(join(carpeta, archivo), contenido);
      }
    }
    git("add", ".");
    git("commit", "--allow-empty", "-qm", "Cambio");
    return comprobarIntegridad({ base, cabeza: "HEAD", carpeta });
  } finally {
    rmSync(carpeta, { recursive: true, force: true });
  }
}

test("RNF-16: rechaza borrar un archivo de pruebas aunque se agregue otro", () => {
  assert.match(
    comparar(
      { "a.test.ts": 'it("RN-01", () => {});' },
      {
        "a.test.ts": null,
        "b.test.ts": 'it("RN-01", () => {});',
      },
    ).join("\n"),
    /borrado/,
  );
});

test("RNF-16: rechaza reducir pruebas en un archivo aunque crezca el total", () => {
  assert.match(
    comparar(
      { "a.test.ts": 'it("a", () => {}); it("b", () => {});' },
      {
        "a.test.ts": 'it("a", () => {});',
        "b.spec.ts": 'test("c", () => {}); test("d", () => {});',
      },
    ).join("\n"),
    /redujo/,
  );
});

for (const codigo of [
  'it.only("a", () => {});',
  'describe.skip("a", () => {});',
  'test["only"]("a", () => {});',
  'it.skip.each([1, 2])("a", () => {});',
  'test("a", { skip: true }, () => {});',
  'test.skip(true, "motivo");',
  'test.fixme("a", () => {});',
  'test.describe.fixme("grupo", () => { test("a", () => {}); });',
  'test("a", () => { test.fixme(); });',
  'test("a", () => { test.fixme(true, "motivo"); });',
  'import { test as caso } from "@playwright/test"; caso.fixme("a", () => {});',
  'import { test as caso } from "vitest"; caso.only("a", () => {});',
  'import { it as caso } from "vitest"; caso.skip("a", () => {});',
]) {
  test(`RNF-16: rechaza selección u omisión ejecutable: ${codigo}`, () => {
    assert.match(
      comparar({ "a.test.mjs": 'test("a", () => {});' }, { "a.test.mjs": codigo }).join("\n"),
      /omitida|exclusiva/,
    );
  });
}

test("RNF-16: no confunde textos, comentarios ni test.use con pruebas", () => {
  assert.equal(
    analizarPruebas('/* it.skip("a") */ const texto = "test.only"; test.use({}); test("RN-01", () => {});', "a.spec.ts")
      .cantidad,
    1,
  );
  assert.deepEqual(
    comparar(
      { "a.test.ts": 'it("a", () => {});' },
      {
        "a.test.ts": '// it.skip("texto")\nit("a", () => { const texto = "test.only"; });',
      },
    ),
    [],
  );
});

test("RNF-16: detecta reducción de casos de una prueba parametrizada", () => {
  assert.match(
    comparar(
      { "a.test.ts": 'it.each([1, 2, 3])("a", () => {});' },
      {
        "a.test.ts": 'it.each([1, 2])("a", () => {});',
      },
    ).join("\n"),
    /redujo/,
  );
});

for (const [antes, despues] of [
  ['it.each([1, 2, 3] as const)("a", () => {});', 'it.each([1] as const)("a", () => {});'],
  [
    "const casos = [1, 2, 3] as const; for (const caso of casos) it(`${caso}`, () => {});",
    "const casos = [1] as const; for (const caso of casos) it(`${caso}`, () => {});",
  ],
  ["[1, 2, 3].forEach(caso => test(`${caso}`, () => {}));", "[1].forEach(caso => test(`${caso}`, () => {}));"],
  [
    "comprobarRechazosDeAccion({ accion: primera }); comprobarRechazosDeAccion({ accion: segunda });",
    "comprobarRechazosDeAccion({ accion: primera });",
  ],
]) {
  test(`RNF-16: detecta reducción de generadores de pruebas: ${antes}`, () => {
    assert.match(comparar({ "a.test.ts": antes }, { "a.test.ts": despues }).join("\n"), /redujo/);
  });
}

test("RNF-16: los bucles de aserciones dentro de una prueba no multiplican su registro", () => {
  assert.equal(
    analizarPruebas('it("a", () => { for (const caso of [1,2,3]) expect(caso).toBeTruthy(); });', "a.test.ts").cantidad,
    1,
  );
});

for (const despues of ["export default { thresholds: { break: 65 } };", "export default {};"]) {
  test(`RNF-16: no permite bajar ni quitar el umbral de mutación: ${despues}`, () => {
    assert.match(
      comparar(
        { "stryker.config.mjs": "export default { thresholds: { break: 70 } };" },
        {
          "stryker.config.mjs": despues,
        },
      ).join("\n"),
      /umbral/,
    );
  });
}

test("RNF-16: no permite bajar umbrales de cobertura aunque use claves entre comillas", () => {
  assert.match(
    comparar(
      { "vitest.config.mts": 'export default { test: { coverage: { thresholds: { "lines": 80 } } } };' },
      {
        "vitest.config.mts": 'export default { test: { coverage: { thresholds: { "lines": 75 } } } };',
      },
    ).join("\n"),
    /umbral/,
  );
});

test("RNF-16: permite agregar pruebas y subir el umbral", () => {
  assert.deepEqual(
    comparar(
      { "a.test.ts": 'it("a", () => {});', "stryker.config.mjs": "export default { thresholds: { break: 70 } };" },
      {
        "a.test.ts": 'it("a", () => {}); it("b", () => {});',
        "stryker.config.mjs": "export default { thresholds: { break: 75 } };",
      },
    ),
    [],
  );
});
