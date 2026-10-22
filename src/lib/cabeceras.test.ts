import { describe, expect, it } from "vitest";
import { crearCsp, cabecerasDeSeguridad } from "./cabeceras";

describe("RNF-16: cabeceras de seguridad", () => {
  it("RNF-16: limita las fuentes, protege marcos y habilita solamente los marcos aprobados", () => {
    const csp = crearCsp({ produccion: true, urlImagenes: "https://imagenes.incovsa.com/", nonce: "unico" });
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self' 'nonce-unico'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("https://www.google.com/maps/embed");
    expect(csp).toContain("https://drive.google.com/file/d/");
    expect(csp).toContain("https://imagenes.incovsa.com");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");
  });
  it("RNF-16: HSTS solo se envía en producción y el desarrollo permite depuración local", () => {
    expect(cabecerasDeSeguridad(true).find((c) => c.key === "Strict-Transport-Security")?.value).toContain(
      "max-age=31536000",
    );
    expect(cabecerasDeSeguridad(false).some((c) => c.key === "Strict-Transport-Security")).toBe(false);
    expect(crearCsp({ produccion: false })).toContain("'unsafe-eval'");
    expect(cabecerasDeSeguridad(true)).toEqual(
      expect.arrayContaining([
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ]),
    );
  });
  for (const urlImagenes of [
    "http://imagenes.incovsa.com",
    "https://usuario:clave@imagenes.incovsa.com",
    "https://imagenes.incovsa.com; script-src *",
    "javascript:alert(1)",
  ]) {
    it(`RNF-16: rechaza un origen de imágenes inseguro: ${urlImagenes}`, () => {
      expect(() => crearCsp({ produccion: true, urlImagenes })).toThrow();
    });
  }
});
