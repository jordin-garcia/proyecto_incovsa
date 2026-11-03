import { describe, expect, it } from "vitest";
import * as fc from "fast-check";
import { Prisma } from "@/generated/prisma/client";
import { ErrorNegocio } from "@/lib/errores";
import { convertir, fmt, htmlConversion, textoConversion, textoUnidades } from "./servicio";

describe("Módulo de conversión de kilogramos a unidades (JM-02)", () => {
  describe("Criterio 1: RN-01 (CP-01 a CP-15 validados por INCOVSA)", () => {
    it("RN-01 CP-01: 25 kg con 25 kg son 1 unidad", () => {
      const res = convertir("25", "25");
      expect(res.unidades).toBe(1);
      expect(res.restoKg).toBe(0);
      expect(textoConversion("25", "25")).toBe("1 unidad");
    });

    it("RN-01 CP-02: 25 kg con 25 kg (otro lote) son 1 unidad", () => {
      const res = convertir("25", "25");
      expect(res.unidades).toBe(1);
      expect(res.restoKg).toBe(0);
      expect(textoConversion("25", "25")).toBe("1 unidad");
    });

    it("RN-01 CP-03: 50 kg con 50 kg son 1 unidad", () => {
      const res = convertir("50", "50");
      expect(res.unidades).toBe(1);
      expect(res.restoKg).toBe(0);
      expect(textoConversion("50", "50")).toBe("1 unidad");
    });

    it("RN-01 CP-04: 55 kg con 55 kg son 1 unidad", () => {
      const res = convertir("55", "55");
      expect(res.unidades).toBe(1);
      expect(res.restoKg).toBe(0);
      expect(textoConversion("55", "55")).toBe("1 unidad");
    });

    it("RN-01 CP-05: 50 kg con 25 kg son 2 unidades", () => {
      const res = convertir("50", "25");
      expect(res.unidades).toBe(2);
      expect(res.restoKg).toBe(0);
      expect(textoConversion("50", "25")).toBe("2 unidades");
    });

    it("RN-01 CP-06: 50 kg con 25 kg son 2 unidades", () => {
      const res = convertir("50", "25");
      expect(res.unidades).toBe(2);
      expect(res.restoKg).toBe(0);
      expect(textoConversion("50", "25")).toBe("2 unidades");
    });

    it("RN-01 CP-07: 50 kg con 25 kg son 2 unidades", () => {
      const res = convertir("50", "25");
      expect(res.unidades).toBe(2);
      expect(res.restoKg).toBe(0);
      expect(textoConversion("50", "25")).toBe("2 unidades");
    });

    it("RN-01 CP-08: 50 kg con 25 kg son 2 unidades", () => {
      const res = convertir("50", "25");
      expect(res.unidades).toBe(2);
      expect(res.restoKg).toBe(0);
      expect(textoConversion("50", "25")).toBe("2 unidades");
    });

    it("RN-01 CP-09: 50 kg con 25 kg son 2 unidades", () => {
      const res = convertir("50", "25");
      expect(res.unidades).toBe(2);
      expect(res.restoKg).toBe(0);
      expect(textoConversion("50", "25")).toBe("2 unidades");
    });

    it("RN-01 CP-10: 75 kg con 25 kg son 3 unidades", () => {
      const res = convertir("75", "25");
      expect(res.unidades).toBe(3);
      expect(res.restoKg).toBe(0);
      expect(textoConversion("75", "25")).toBe("3 unidades");
    });

    it("RN-01 CP-11: 90 kg con 30 kg son 3 unidades", () => {
      const res = convertir("90", "30");
      expect(res.unidades).toBe(3);
      expect(res.restoKg).toBe(0);
      expect(textoConversion("90", "30")).toBe("3 unidades");
    });

    it("RN-01 CP-12: 500 kg con 25 kg son 20 unidades", () => {
      const res = convertir("500", "25");
      expect(res.unidades).toBe(20);
      expect(res.restoKg).toBe(0);
      expect(textoConversion("500", "25")).toBe("20 unidades");
    });

    it("RN-01 CP-13: 500 kg con 25 kg son 20 unidades", () => {
      const res = convertir("500", "25");
      expect(res.unidades).toBe(20);
      expect(res.restoKg).toBe(0);
      expect(textoConversion("500", "25")).toBe("20 unidades");
    });

    it("RN-01 CP-14: 800 kg con 25 kg son 32 unidades", () => {
      const res = convertir("800", "25");
      expect(res.unidades).toBe(32);
      expect(res.restoKg).toBe(0);
      expect(textoConversion("800", "25")).toBe("32 unidades");
    });

    it("RN-01 CP-15: 1,000 kg con 25 kg son 40 unidades", () => {
      const res = convertir("1,000", "25");
      expect(res.unidades).toBe(40);
      expect(res.restoKg).toBe(0);
      expect(textoConversion("1,000", "25")).toBe("40 unidades");
    });
  });

  describe("Criterio 2: RN-21 / RN-05 (CP-16 a CP-18 ventas fraccionadas)", () => {
    it("RN-21 / RN-05 CP-16: 60 kg con 25 kg da '2 unidades + 10 kg'", () => {
      const res = convertir("60", "25");
      expect(res.unidades).toBe(2);
      expect(res.restoKg).toBe(10);
      expect(textoConversion("60", "25")).toBe("2 unidades + 10 kg");
    });

    it("RN-21 / RN-05 CP-17: 10 kg con 25 kg da '0 unidades + 10 kg'", () => {
      const res = convertir("10", "25");
      expect(res.unidades).toBe(0);
      expect(res.restoKg).toBe(10);
      expect(textoConversion("10", "25")).toBe("0 unidades + 10 kg");
    });

    it("RN-05 CP-18: 37.5 kg con 25 kg da '1 unidad + 12.5 kg' sin errores de redondeo", () => {
      const res = convertir("37.5", "25");
      expect(res.unidades).toBe(1);
      expect(res.restoKg).toBe(12.5);
      expect(textoConversion("37.5", "25")).toBe("1 unidad + 12.5 kg");
    });
  });

  describe("Criterio 3: RN-01 (conversiones exactas sin resto)", () => {
    it("RN-01 (exacta): 50 kg con 25 kg da '2 unidades'", () => {
      expect(textoConversion("50", "25")).toBe("2 unidades");
    });

    it("RN-01 (exacta): 55 kg con 55 kg da '1 unidad'", () => {
      expect(textoConversion("55", "55")).toBe("1 unidad");
    });

    it("RN-01 (exacta): 110 kg con 55 kg da '2 unidades'", () => {
      expect(textoConversion("110", "55")).toBe("2 unidades");
    });
  });

  describe("Criterio 4: Propiedades con fast-check (hasta 4,536 kg y pesos hasta 2,500 kg con 3 decimales)", () => {
    it("RN-01 / RN-05 criterio 4 (propiedades fast-check): unidades * peso + resto = cantidad exactamente, 0 <= resto < peso, unidades >= 0", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 4_536_000 }), // gramos de cantidad (hasta 4,536 kg)
          fc.integer({ min: 1, max: 2_500_000 }), // gramos de peso (hasta 2,500 kg)
          (cantidadGramos, pesoGramos) => {
            const cantidadKgStr = (cantidadGramos / 1000).toFixed(3);
            const pesoKgStr = (pesoGramos / 1000).toFixed(3);

            const res = convertir(cantidadKgStr, pesoKgStr);

            // unidades es un entero >= 0
            expect(res.unidades).toBeGreaterThanOrEqual(0);
            expect(Number.isInteger(res.unidades)).toBe(true);

            // 0 <= resto < peso (en kg)
            expect(res.restoKg).toBeGreaterThanOrEqual(0);
            expect(res.restoKg).toBeLessThan(pesoGramos / 1000);

            // unidades * peso + resto = cantidad exactamente
            const restoGramosCalculado = Math.round(res.restoKg * 1000);
            const reconstruidoGramos = res.unidades * pesoGramos + restoGramosCalculado;
            expect(reconstruidoGramos).toBe(cantidadGramos);
          },
        ),
        { numRuns: 1000 },
      );
    });

    it("RN-01 criterio 4: propiedades con Decimal de Prisma", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 4_536_000 }),
          fc.integer({ min: 1, max: 2_500_000 }),
          (cantidadGramos, pesoGramos) => {
            const cantidadDecimal = new Prisma.Decimal((cantidadGramos / 1000).toFixed(3));
            const pesoDecimal = new Prisma.Decimal((pesoGramos / 1000).toFixed(3));

            const res = convertir(cantidadDecimal, pesoDecimal);

            expect(res.unidades).toBeGreaterThanOrEqual(0);
            const restoGramosCalculado = Math.round(res.restoKg * 1000);
            expect(res.unidades * pesoGramos + restoGramosCalculado).toBe(cantidadGramos);
          },
        ),
        { numRuns: 200 },
      );
    });
  });

  describe("Criterio 5: RN-50 (Peso de Conversión cero o negativo lanza ErrorNegocio y validaciones de entrada)", () => {
    it("RN-50 criterio 5: Peso de Conversión en 0 lanza ErrorNegocio", () => {
      expect(() => convertir("50", "0")).toThrow(ErrorNegocio);
      expect(() => convertir("50", "0.000")).toThrow(ErrorNegocio);
      expect(() => textoConversion("50", "0")).toThrow(ErrorNegocio);
    });

    it("RN-50 criterio 5: Peso de Conversión negativo lanza ErrorNegocio", () => {
      expect(() => convertir("50", "-25")).toThrow(ErrorNegocio);
      expect(() => textoConversion("50", "-25")).toThrow(ErrorNegocio);
    });

    it("RN-01: cantidad negativa lanza ErrorNegocio", () => {
      expect(() => convertir("-10", "25")).toThrow(ErrorNegocio);
      expect(() => textoConversion("-10", "25")).toThrow(ErrorNegocio);
    });

    it("RN-05: valores con más de 3 decimales lanzan ErrorNegocio", () => {
      expect(() => convertir("10.1234", "25")).toThrow(ErrorNegocio);
      expect(() => convertir("10", "25.1234")).toThrow(ErrorNegocio);
    });

    it("RN-01: texto no numérico o uso erróneo de comas lanza ErrorNegocio", () => {
      expect(() => convertir("abc", "25")).toThrow(ErrorNegocio);
      expect(() => convertir("37,5", "25")).toThrow(ErrorNegocio);
      expect(() => convertir("50", "xyz")).toThrow(ErrorNegocio);
    });
  });

  describe("Utilidades de formato y HTML (fmt, textoUnidades, htmlConversion)", () => {
    it("fmt: formatea enteros y decimales según el prototipo", () => {
      expect(fmt(null)).toBe("—");
      expect(fmt(undefined)).toBe("—");
      expect(fmt(NaN)).toBe("—");
      expect(fmt(0)).toBe("0");
      expect(fmt(1)).toBe("1");
      expect(fmt(25)).toBe("25");
      expect(fmt(37.5)).toBe("37.5");
      expect(fmt(1000)).toBe("1,000");
      expect(fmt(1234.56)).toBe("1,234.56");
      expect(fmt("1,000")).toBe("1,000");
    });

    it("textoUnidades: singular y plural con formato", () => {
      expect(textoUnidades(0)).toBe("0 unidades");
      expect(textoUnidades(1)).toBe("1 unidad");
      expect(textoUnidades(2)).toBe("2 unidades");
      expect(textoUnidades(1000)).toBe("1,000 unidades");
    });

    it("htmlConversion: genera HTML con etiquetas unid y resto", () => {
      expect(htmlConversion("50", "25")).toBe('<span class="unid">2 unidades</span>');
      expect(htmlConversion("60", "25")).toBe('<span class="unid">2 unidades<span class="resto">+ 10 kg</span></span>');
      expect(htmlConversion("37.5", "25")).toBe(
        '<span class="unid">1 unidad<span class="resto">+ 12.5 kg</span></span>',
      );
    });
  });

  describe("Componente React Unidades (src/componentes/picking/bodega/Unidades.tsx)", () => {
    it("renderiza conversión exacta sin resto", async () => {
      const React = await import("react");
      const { renderToString } = await import("react-dom/server");
      const { Unidades } = await import("@/componentes/picking/bodega/Unidades");
      const html = renderToString(React.createElement(Unidades, { cantidadKg: "50", pesoConversionKg: "25" }));
      expect(html).toContain("2 unidades");
      expect(html).not.toContain("resto");
    });

    it("renderiza conversión con resto", async () => {
      const React = await import("react");
      const { renderToString } = await import("react-dom/server");
      const { Unidades } = await import("@/componentes/picking/bodega/Unidades");
      const html = renderToString(React.createElement(Unidades, { cantidadKg: "60", pesoConversionKg: "25" }));
      expect(html).toContain("2 unidades");
      expect(html).toContain("+ 10 kg");
    });

    it("renderiza con unidades y restoKg precalculados", async () => {
      const React = await import("react");
      const { renderToString } = await import("react-dom/server");
      const { Unidades } = await import("@/componentes/picking/bodega/Unidades");
      const html = renderToString(React.createElement(Unidades, { unidades: 1, restoKg: 12.5 }));
      expect(html).toContain("1 unidad");
      expect(html).toContain("+ 12.5 kg");
    });
  });
  describe("RN-01 (auditoría H-16): la conversión no admite Number", () => {
    it("RN-01: el tipo DecimalExacto rechaza number y admite texto y Decimal de Prisma", () => {
      // Si DecimalExacto volviera a admitir number, `npm run tipos` fallaría por las directivas sin uso.
      // @ts-expect-error: una cantidad en Number puede perder precisión (specs/16, decisión 1).
      const conNumber = () => convertir(60, "25");
      // @ts-expect-error: el Peso de Conversión tampoco se admite en Number.
      const pesoNumber = () => textoConversion("60", 25);
      expect(typeof conNumber).toBe("function");
      expect(typeof pesoNumber).toBe("function");
      expect(textoConversion(new Prisma.Decimal("60.000"), "25")).toBe("2 unidades + 10 kg");
    });
  });
});
