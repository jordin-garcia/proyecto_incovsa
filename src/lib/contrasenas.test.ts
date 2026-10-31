import { describe, expect, it } from "vitest";
import { hashPassword } from "better-auth/crypto";
import { PARAMETROS_SCRYPT, cifrarContrasena, verificarContrasena } from "./contrasenas";

describe("RNF-03 (ASVS V11.4.2): contraseñas con scrypt", () => {
  it("RNF-03: las contraseñas nuevas usan los parámetros mínimos de OWASP y quedan escritos en el hash", async () => {
    expect(PARAMETROS_SCRYPT).toEqual({ N: 16384, r: 8, p: 5 });
    // Costo N·r·p igual o mayor que el de N=2^17, r=8, p=1 dividido entre su memoria (equivalencias de OWASP).
    const hash = await cifrarContrasena("Clave-de-prueba-26");
    expect(hash).toMatch(/^\$scrypt\$N=16384,r=8,p=5\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
    expect(hash).not.toContain("Clave-de-prueba-26");
    expect(await verificarContrasena({ hash, password: "Clave-de-prueba-26" })).toBe(true);
    expect(await verificarContrasena({ hash, password: "Clave-de-prueba-27" })).toBe(false);
    // Cada hash lleva su propia sal.
    expect(await cifrarContrasena("Clave-de-prueba-26")).not.toBe(hash);
  });

  it("RNF-03: las contraseñas cifradas con el formato anterior de Better Auth siguen sirviendo", async () => {
    const anterior = await hashPassword("Clave-anterior-1");
    expect(anterior).toMatch(/^[0-9a-f]{32}:[0-9a-f]{128}$/);
    expect(await verificarContrasena({ hash: anterior, password: "Clave-anterior-1" })).toBe(true);
    expect(await verificarContrasena({ hash: anterior, password: "Clave-anterior-2" })).toBe(false);
  });

  it("RNF-03: la misma contraseña escrita con otra composición de Unicode coincide (NFKC)", async () => {
    const hash = await cifrarContrasena("Contraseña-1");
    // La misma ñ, escrita como n seguida de la tilde combinada.
    expect(await verificarContrasena({ hash, password: "Contraseña-1" })).toBe(true);
  });

  it("RNF-03: un hash alterado o con parámetros débiles se rechaza sin lanzar error", async () => {
    const hash = await cifrarContrasena("Clave-de-prueba-26");
    const [, , , sal, clave] = hash.split("$");
    for (const alterado of [
      `$scrypt$N=1024,r=8,p=5$${sal}$${clave}`,
      `$scrypt$N=16384,r=1,p=1$${sal}$${clave}`,
      `$scrypt$N=16385,r=8,p=5$${sal}$${clave}`,
      `$scrypt$N=2097152,r=8,p=5$${sal}$${clave}`,
      // Más memoria de la permitida, o un costo menor que el actual.
      `$scrypt$N=262144,r=8,p=1$${sal}$${clave}`,
      `$scrypt$N=16384,r=32,p=5$${sal}$${clave}`,
      `$scrypt$N=16384,r=8,p=1$${sal}$${clave}`,
      `$scrypt$N=16384,r=8,p=5$${sal}$${clave!.slice(2)}`,
      `$scrypt$N=16384,r=8,p=5$${sal}`,
      "texto",
      "a:b:c",
      "",
    ])
      expect(await verificarContrasena({ hash: alterado, password: "Clave-de-prueba-26" })).toBe(false);
  });
});
