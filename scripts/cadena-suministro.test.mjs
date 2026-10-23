import { test } from "node:test";
import assert from "node:assert/strict";
import { validarCadena } from "./cadena-suministro.mjs";

const integridad = `sha512-${Buffer.alloc(64, 1).toString("base64")}`;
const candado = (resolved) => ({
  packages: { "": {}, "node_modules/ejemplo": { version: "1.0.0", resolved, integrity: integridad } },
});

test("RNF-16: acepta únicamente el registro HTTPS oficial", () => {
  assert.deepEqual(validarCadena(candado("https://registry.npmjs.org/ejemplo/-/ejemplo-1.0.0.tgz")), []);
});
for (const origen of [
  "https://otro.example/ejemplo.tgz",
  "http://registry.npmjs.org/ejemplo.tgz",
  "https://registry.npmjs.org.evil.example/ejemplo.tgz",
  "file:../otro.tgz",
  "file:vendor/otro.tgz",
  "git+https://github.com/otro/repo",
  "https://usuario:clave@registry.npmjs.org/ejemplo.tgz",
]) {
  test(`RNF-16: rechaza origen de dependencia no permitido: ${origen}`, () =>
    assert.ok(validarCadena(candado(origen)).length));
}
test("RNF-16: exige la huella SHA-512 completa", () => {
  const lock = candado("https://registry.npmjs.org/ejemplo/-/ejemplo-1.0.0.tgz");
  lock.packages["node_modules/ejemplo"].integrity = "sha512-incompleta";
  assert.match(validarCadena(lock).join("\n"), /integridad/);
});
test("RNF-16: rechaza dependencias enlazadas o sin origen", () => {
  assert.ok(validarCadena({ packages: { "": {}, "node_modules/otro": { link: true } } }).length);
});

test("RNF-16: un paquete incluido en un tarball se verifica mediante su contenedor npm íntegro", () => {
  const lock = candado("https://registry.npmjs.org/ejemplo/-/ejemplo-1.0.0.tgz");
  lock.packages["node_modules/ejemplo"].bundleDependencies = ["incluido"];
  lock.packages["node_modules/ejemplo/node_modules/incluido"] = { version: "1.0.0", inBundle: true };
  assert.deepEqual(validarCadena(lock), []);
  delete lock.packages["node_modules/ejemplo"].bundleDependencies;
  assert.ok(validarCadena(lock).length);
});

test("RNF-16: marcar inBundle no permite ocultar un origen remoto ajeno", () => {
  const lock = candado("https://otro.example/ejemplo.tgz");
  lock.packages["node_modules/ejemplo"].inBundle = true;
  assert.ok(validarCadena(lock).length);
});
