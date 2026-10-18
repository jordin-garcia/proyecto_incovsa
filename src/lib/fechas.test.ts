import { describe, expect, it } from "vitest";
import {
  fechaGuatemala,
  finDelDiaGuatemala,
  formatoFecha,
  formatoHora,
  inicioDelDiaGuatemala,
  leerFecha,
  leerHora,
  semanaLunesADomingo,
} from "./fechas";

// Guatemala está siempre en UTC-6 (sin horario de verano).
describe("fechaGuatemala", () => {
  it("Decisión 6: a las 05:30 UTC del 18/10 en Guatemala todavía es el 17/10", () => {
    expect(fechaGuatemala("2026-10-18T05:30:00Z")).toBe("2026-10-17");
  });

  it("Decisión 6: el día cambia a la medianoche de Guatemala (06:00 UTC)", () => {
    expect(fechaGuatemala("2026-10-18T05:59:59.999Z")).toBe("2026-10-17");
    expect(fechaGuatemala("2026-10-18T06:00:00Z")).toBe("2026-10-18");
    expect(fechaGuatemala(new Date("2026-10-18T06:00:00Z"))).toBe("2026-10-18");
    expect(fechaGuatemala(Date.parse("2026-10-18T06:00:00Z"))).toBe("2026-10-18");
  });

  it("Decisión 6: cambia de año en la medianoche de Guatemala", () => {
    expect(fechaGuatemala("2027-01-01T05:00:00Z")).toBe("2026-12-31");
    expect(fechaGuatemala("2027-01-01T06:00:00Z")).toBe("2027-01-01");
  });

  it("Decisión 6: un día AAAA-MM-DD se toma como ese día de Guatemala, no como medianoche UTC", () => {
    expect(fechaGuatemala("2026-10-17")).toBe("2026-10-17");
  });
});

describe("inicioDelDiaGuatemala y finDelDiaGuatemala", () => {
  it("Decisión 6: el día 17/10 de Guatemala va de las 06:00 UTC del 17 a las 05:59:59.999 UTC del 18", () => {
    expect(inicioDelDiaGuatemala("2026-10-17").toISOString()).toBe("2026-10-17T06:00:00.000Z");
    expect(finDelDiaGuatemala("2026-10-17").toISOString()).toBe("2026-10-18T05:59:59.999Z");
  });

  it("Decisión 6: con un instante, usa el día de Guatemala de ese instante", () => {
    const instante = new Date("2026-10-18T05:30:00Z");
    expect(inicioDelDiaGuatemala(instante).toISOString()).toBe("2026-10-17T06:00:00.000Z");
    expect(finDelDiaGuatemala(instante).toISOString()).toBe("2026-10-18T05:59:59.999Z");
  });

  it("Decisión 6: devuelve un Date normal, listo para guardar en timestamptz", () => {
    expect(inicioDelDiaGuatemala("2026-10-17").constructor).toBe(Date);
    expect(finDelDiaGuatemala("2026-10-17").constructor).toBe(Date);
  });

  it("Decisión 6: rechaza un día que no existe", () => {
    expect(() => inicioDelDiaGuatemala("2026-02-31")).toThrow(RangeError);
    expect(() => finDelDiaGuatemala("17/10/2026")).toThrow(RangeError);
  });
});

describe("textos que no son un día ni un instante con zona", () => {
  // new Date() los leería según la zona del equipo (UTC en producción, Guatemala en desarrollo).
  const ambiguos = ["05/10/2026", "10/02/2026", "2026-10-17T03:00", "2026-10-17 03:00:00", "Oct 17 2026", ""];

  it("Decisión 6: se rechazan en lugar de leerse con la zona del equipo", () => {
    for (const texto of ambiguos) {
      expect(() => fechaGuatemala(texto), texto).toThrow(RangeError);
      expect(() => formatoFecha(texto), texto).toThrow(RangeError);
      expect(() => formatoHora(texto), texto).toThrow(RangeError);
      expect(() => inicioDelDiaGuatemala(texto), texto).toThrow(RangeError);
      expect(() => finDelDiaGuatemala(texto), texto).toThrow(RangeError);
      expect(() => semanaLunesADomingo(texto), texto).toThrow(RangeError);
    }
  });

  it("Decisión 6: los instantes ISO con Z o con desfase sí se aceptan", () => {
    expect(fechaGuatemala("2026-10-18T05:30Z")).toBe("2026-10-17");
    expect(fechaGuatemala("2026-10-17T23:30:00-06:00")).toBe("2026-10-17");
    expect(fechaGuatemala("2026-10-18T00:30:00.000+01:00")).toBe("2026-10-17");
  });

  it("Decisión 6: un instante ISO con una fecha u hora que no existe se rechaza en lugar de pasar al día siguiente", () => {
    expect(() => fechaGuatemala("2026-02-31T10:00:00Z")).toThrow(RangeError);
    expect(() => fechaGuatemala("2026-10-17T24:00:00Z")).toThrow(RangeError);
    expect(() => fechaGuatemala("2026-10-17T10:60:00Z")).toThrow(RangeError);
    expect(() => fechaGuatemala("2026-10-17T10:00:00+25:00")).toThrow(RangeError);
  });

  it("Decisión 6: un Date inválido se rechaza", () => {
    expect(() => fechaGuatemala(new Date(Number.NaN))).toThrow(RangeError);
  });
});

describe("semanaLunesADomingo", () => {
  it("Decisión 6: la semana del miércoles 21/10/2026 va del lunes 19/10 al domingo 25/10", () => {
    expect(semanaLunesADomingo("2026-10-21")).toEqual({ inicio: "2026-10-19", fin: "2026-10-25" });
  });

  it("Decisión 6: el lunes y el domingo pertenecen a su propia semana", () => {
    expect(semanaLunesADomingo("2026-10-19")).toEqual({ inicio: "2026-10-19", fin: "2026-10-25" });
    expect(semanaLunesADomingo("2026-10-25")).toEqual({ inicio: "2026-10-19", fin: "2026-10-25" });
    expect(semanaLunesADomingo("2026-10-26")).toEqual({ inicio: "2026-10-26", fin: "2026-11-01" });
  });

  it("Decisión 6: con un instante, usa el día de Guatemala (domingo 25/10 a las 23:30 en Guatemala)", () => {
    expect(semanaLunesADomingo(new Date("2026-10-26T05:30:00Z"))).toEqual({ inicio: "2026-10-19", fin: "2026-10-25" });
  });

  it("Decisión 6: una semana que cruza el cambio de mes y de año", () => {
    expect(semanaLunesADomingo("2027-01-01")).toEqual({ inicio: "2026-12-28", fin: "2027-01-03" });
  });
});

describe("formatoFecha y formatoHora", () => {
  it("Decisión 6: muestran dd/mm/aaaa y HH:MM (24 horas) en la hora de Guatemala", () => {
    expect(formatoFecha("2026-10-18T05:30:00Z")).toBe("17/10/2026");
    expect(formatoHora("2026-10-18T05:30:00Z")).toBe("23:30");
    expect(formatoFecha(new Date("2026-01-05T15:07:00Z"))).toBe("05/01/2026");
    expect(formatoHora(new Date("2026-01-05T15:07:00Z"))).toBe("09:07");
  });

  it("Decisión 6: un día AAAA-MM-DD se muestra como ese mismo día", () => {
    expect(formatoFecha("2026-10-17")).toBe("17/10/2026");
  });
});

describe("leerFecha", () => {
  it("Decisión 6: lee dd/mm/aaaa y devuelve el día AAAA-MM-DD", () => {
    expect(leerFecha("17/10/2026")).toBe("2026-10-17");
    expect(leerFecha(" 29/02/2028 ")).toBe("2028-02-29");
  });

  it("Decisión 6: acepta lo mismo que el campo de fecha del prototipo (d/m/aaaa y ddmmaaaa)", () => {
    expect(leerFecha("5/1/2026")).toBe("2026-01-05");
    expect(leerFecha("05012026")).toBe("2026-01-05");
  });

  it("Decisión 6: devuelve null si la fecha no existe o no tiene el formato", () => {
    expect(leerFecha("31/02/2026")).toBeNull();
    expect(leerFecha("29/02/2026")).toBeNull();
    expect(leerFecha("31/04/2026")).toBeNull();
    expect(leerFecha("00/10/2026")).toBeNull();
    expect(leerFecha("10/13/2026")).toBeNull();
    expect(leerFecha("2026-10-17")).toBeNull();
    expect(leerFecha("17/10/26")).toBeNull();
    expect(leerFecha("")).toBeNull();
  });
});

describe("leerHora", () => {
  it("Decisión 6: lee HH:MM y devuelve la hora con dos dígitos", () => {
    expect(leerHora("08:30")).toBe("08:30");
    expect(leerHora("8:30")).toBe("08:30");
    expect(leerHora("0830")).toBe("08:30");
    expect(leerHora("00:00")).toBe("00:00");
    expect(leerHora(" 23:59 ")).toBe("23:59");
  });

  it("Decisión 6: devuelve null si la hora no existe o no tiene el formato", () => {
    expect(leerHora("25:90")).toBeNull();
    expect(leerHora("24:00")).toBeNull();
    expect(leerHora("12:60")).toBeNull();
    expect(leerHora("12:5")).toBeNull();
    expect(leerHora("doce")).toBeNull();
    expect(leerHora("")).toBeNull();
  });
});
