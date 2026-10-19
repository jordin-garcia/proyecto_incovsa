import { describe, expect, it } from "vitest";
import {
  MENSAJE_CAPACIDAD,
  MENSAJE_CAPACIDAD_MAX,
  MENSAJE_DECIMALES,
  MENSAJE_IDENTIFICACION,
  MENSAJE_IDENTIFICACION_MAX,
  esquemaCamion,
  interpretarCapacidadKg,
} from "./esquemas";

describe("esquema de camión", () => {
  it("RF-SL-04: rechaza capacidad 0, negativa o no numérica", () => {
    for (const capacidadKg of ["0", "0.000", "-1", "-0.5", "abc", "", "  ", "1e3", "3400."]) {
      expect(interpretarCapacidadKg(capacidadKg), capacidadKg).toEqual({ ok: false, error: MENSAJE_CAPACIDAD });
      expect(esquemaCamion.safeParse({ identificacion: "Camión X", capacidadKg, sedeId: 1 }).success).toBe(false);
    }
  });

  it("RF-SL-04: rechaza más de 3 decimales y acepta miles con coma", () => {
    expect(interpretarCapacidadKg("1.2345")).toEqual({ ok: false, error: MENSAJE_DECIMALES });
    expect(interpretarCapacidadKg("1.2300")).toEqual({ ok: false, error: MENSAJE_DECIMALES });
    expect(interpretarCapacidadKg("1000000000")).toEqual({ ok: false, error: MENSAJE_CAPACIDAD_MAX });
    expect(interpretarCapacidadKg("3,400.5")).toEqual({ ok: true, capacidadKg: "3400.500" });
    expect(interpretarCapacidadKg("0.001")).toEqual({ ok: true, capacidadKg: "0.001" });
    expect(esquemaCamion.parse({ identificacion: "  Camión 4  ", capacidadKg: "3,400", sedeId: "1" })).toEqual({
      identificacion: "Camión 4",
      capacidadKg: "3400.000",
      sedeId: 1,
    });
  });

  it("RF-SL-04: la identificación es obligatoria y cabe en 40 caracteres", () => {
    expect(esquemaCamion.safeParse({ identificacion: "   ", capacidadKg: "10", sedeId: 1 }).success).toBe(false);
    const vacia = esquemaCamion.safeParse({ identificacion: "   ", capacidadKg: "10", sedeId: 1 });
    expect(vacia.success).toBe(false);
    if (!vacia.success) expect(vacia.error.issues[0]?.message).toBe(MENSAJE_IDENTIFICACION);
    const larga = esquemaCamion.safeParse({ identificacion: "C".repeat(41), capacidadKg: "10", sedeId: 1 });
    expect(larga.success).toBe(false);
    if (!larga.success) expect(larga.error.issues[0]?.message).toBe(MENSAJE_IDENTIFICACION_MAX);
  });
});
