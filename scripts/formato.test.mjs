import assert from "node:assert/strict";
import test from "node:test";
import { formatoKg, formatoNumero } from "../src/componentes/comunes/formato.ts";

test("RNF-01: cifras con separador de miles, hasta tres decimales y signo del prototipo", () => {
  for (const [numero, esperado] of [
    [0, "0"],
    [2500, "2,500"],
    [1234567.125, "1,234,567.125"],
    ["4536.200", "4,536.2"],
    [-42.5, "−42.5"],
    [-1.2345, "−1.234"],
    [999.9999, "1,000"],
    [null, "—"],
    [undefined, "—"],
    [NaN, "—"],
  ]) {
    assert.equal(formatoNumero(numero), esperado);
    assert.equal(formatoKg(numero), esperado + " kg");
  }
});
