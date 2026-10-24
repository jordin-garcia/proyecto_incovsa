import { describe, expect, it } from "vitest";
import { calcularDisposicion } from "./disposicion";

// Mismas reglas que `ajustar()` de tablero.js en el prototipo aprobado.
describe("RF-SL-25 / RF-SL-77: disposición de las líneas del tablero", () => {
  it("RF-SL-25: con pocas líneas usa una columna y reparte el alto disponible, hasta 132 px por línea", () => {
    expect(calcularDisposicion({ alto: 700, ancho: 1200, separacion: 8, lineas: 9, anchoVentana: 1920 })).toEqual({
      columnas: 1,
      filas: 9,
      altoLinea: (700 - 8 * 8) / 9,
      letra: Math.min(((700 - 64) / 9) * 0.2, 1200 / 44),
    });
    expect(
      calcularDisposicion({ alto: 700, ancho: 1200, separacion: 8, lineas: 2, anchoVentana: 1920 }).altoLinea,
    ).toBe(132);
  });

  it("RF-SL-77: si una línea quedaría de menos de 50 px y hay más de 900 px de ancho, usa dos columnas", () => {
    const d = calcularDisposicion({ alto: 700, ancho: 1200, separacion: 8, lineas: 25, anchoVentana: 1920 });
    expect(d.columnas).toBe(2);
    expect(d.filas).toBe(13);
    expect(d.altoLinea).toBeCloseTo((700 - 8 * 12) / 13, 6);
    expect(d.letra).toBeCloseTo(Math.min(d.altoLinea! * 0.2, (1200 - 8) / 2 / 29), 6);
  });

  it("RF-SL-77: con 900 px de ancho o menos sigue en una columna aunque las líneas queden de 44 px", () => {
    const d = calcularDisposicion({ alto: 700, ancho: 900, separacion: 8, lineas: 25, anchoVentana: 1024 });
    expect(d.columnas).toBe(1);
    expect(d.filas).toBe(25);
    expect(d.altoLinea).toBe(44);
  });

  it("RF-SL-77: exactamente 50 px por línea todavía cabe en una columna", () => {
    // (H - 8·9) / 10 = 50
    const d = calcularDisposicion({ alto: 572, ancho: 1200, separacion: 8, lineas: 10, anchoVentana: 1920 });
    expect(d.columnas).toBe(1);
    expect(d.altoLinea).toBe(50);
  });

  it("RNF-02: en un teléfono (720 px o menos) las líneas toman su alto natural y la página se desplaza", () => {
    expect(calcularDisposicion({ alto: 300, ancho: 380, separacion: 8, lineas: 30, anchoVentana: 720 })).toEqual({
      columnas: 1,
      filas: 30,
      altoLinea: null,
      letra: null,
    });
  });

  it("RF-SL-25: sin líneas no fija alturas", () => {
    expect(calcularDisposicion({ alto: 700, ancho: 1200, separacion: 8, lineas: 0, anchoVentana: 1920 })).toEqual({
      columnas: 1,
      filas: 0,
      altoLinea: null,
      letra: null,
    });
  });
});
