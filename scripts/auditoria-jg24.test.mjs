import { readFileSync, readdirSync } from "node:fs";
import assert from "node:assert/strict";
import { test } from "node:test";

test("H-03: el avance previo de DM-04 se identifica como histórico después del cierre", () => {
  const tarea = readFileSync(new URL("../plan/tareas/DM-04-panel-contenido-institucional.md", import.meta.url), "utf8");
  assert.match(tarea, /## Avance histórico/);
  assert.doesNotMatch(tarea, /La tarea permanece pendiente y no se declara terminada/);
});

test("H-15: las evidencias de Reportes se conservan fuera del código de la aplicación", () => {
  const origen = new URL("../src/modulos/reportes/", import.meta.url);
  assert.equal(
    readdirSync(origen, { recursive: true }).some((nombre) => /\.(png|jpe?g|webp)$/i.test(nombre)),
    false,
  );
  assert.ok(readdirSync(new URL("../evidencia/JC-06/", import.meta.url)).some((nombre) => nombre.endsWith(".png")));
  assert.match(
    readFileSync(new URL("../evidencia/JC-06/verificacion.md", import.meta.url), "utf8"),
    /Verificación de JC-06/,
  );
});
