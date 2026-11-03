import { expect, it } from "vitest";
import { claveCliente } from "./cliente";

it("RN-49: compara nombre y sector sin mayúsculas, tildes ni espacios exteriores", () => {
  expect(claveCliente({ cliente: "  José Álvarez  ", sector: " ZÓNA 1 " })).toBe(
    claveCliente({ cliente: "jose alvarez", sector: "zona 1" }),
  );
  expect(claveCliente({ cliente: "", sector: "" })).toBe(claveCliente({ cliente: "Sin nombre", sector: "Sin sector" }));
  expect(claveCliente({ cliente: "José  Álvarez", sector: "Zona 1" })).not.toBe(
    claveCliente({ cliente: "José Álvarez", sector: "Zona 1" }),
  );
  expect(claveCliente({ cliente: "José Álvarez", sector: "Zona 2" })).not.toBe(
    claveCliente({ cliente: "José Álvarez", sector: "Zona 1" }),
  );
});
