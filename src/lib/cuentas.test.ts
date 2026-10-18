import { describe, expect, it } from "vitest";
import { claveAccesoInterna, correoInterno } from "./cuentas";

describe("cuentas", () => {
  it("RN-54: la clave de acceso interna lleva el sistema delante del nombre de usuario", () => {
    expect(claveAccesoInterna("picking", "maria.argueta")).toBe("picking.maria.argueta");
    expect(claveAccesoInterna("sitio", "maria.argueta")).toBe("sitio.maria.argueta");
    expect(claveAccesoInterna("ambos", " Ejemplo.01 ")).toBe("ambos.ejemplo.01");
  });

  it("decisión 26: el correo interno se deriva de la clave y usa un dominio que no recibe correos", () => {
    expect(correoInterno("picking.maria.argueta")).toBe("picking.maria.argueta@incovsa.invalid");
  });
});
