import { describe, expect, it } from "vitest";
import { esAccesoTotal, normalizarRol } from "./roles";

describe("normalizarRol", () => {
  it("Decisión 8: compara sin mayúsculas, acentos ni espacios al inicio o al final", () => {
    expect(normalizarRol(" Gérencia ")).toBe(normalizarRol("gerencia"));
    expect(normalizarRol("PILOTO")).toBe("piloto");
    expect(normalizarRol("\tSoporte\n")).toBe("soporte");
  });

  it("Decisión 8: conserva los espacios internos y las demás letras", () => {
    expect(normalizarRol("  Jefe  de Bodega ")).toBe("jefe  de bodega");
    expect(normalizarRol("Diseño")).toBe("diseno");
  });
});

describe("esAccesoTotal", () => {
  it("RN-38: Gerencia y Soporte tienen acceso total en cualquier escritura", () => {
    for (const rol of ["Gerencia", "gerencia", " GERENCIA ", "Gérencia", "Soporte", "soporte", " SÓPORTE"]) {
      expect(esAccesoTotal(rol), rol).toBe(true);
    }
  });

  it("RN-38: los demás roles no tienen acceso total", () => {
    for (const rol of ["Piloto", "Facturación", "Bodega", "Gerencia general", "", "   "]) {
      expect(esAccesoTotal(rol), rol).toBe(false);
    }
  });
});
