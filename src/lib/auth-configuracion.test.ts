import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { afterEach, expect, it, vi } from "vitest";
import { crearAuth } from "./auth-configuracion";

const ejemplo = Object.fromEntries(
  readFileSync(".env.produccion.example", "utf8")
    .split(/\r?\n/)
    .filter((linea) => /^BETTER_AUTH_SECRET_[A-Z]+=/.test(linea))
    .map((linea) => linea.split("=") as [string, string]),
);

afterEach(() => {
  vi.unstubAllEnvs();
});

it("RNF-10 (H-37): en producción rechaza las claves de ejemplo de .env.produccion.example", () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("BETTER_AUTH_SECRET_SITIO", ejemplo.BETTER_AUTH_SECRET_SITIO);
  vi.stubEnv("BETTER_AUTH_SECRET_PICKING", ejemplo.BETTER_AUTH_SECRET_PICKING);
  expect(ejemplo.BETTER_AUTH_SECRET_SITIO!.length).toBeGreaterThanOrEqual(32);
  expect(() => crearAuth("sitio")).toThrow("La clave de autenticación es la de ejemplo: cámbiela.");
  expect(() => crearAuth("picking")).toThrow("La clave de autenticación es la de ejemplo: cámbiela.");
  // Una clave propia de 32 caracteres o más sí se acepta.
  vi.stubEnv("BETTER_AUTH_SECRET_SITIO", randomBytes(32).toString("base64"));
  expect(() => crearAuth("sitio")).not.toThrow();
});

it("RNF-10: fuera de producción las claves de ejemplo siguen sirviendo para trabajar en local", () => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("BETTER_AUTH_SECRET_SITIO", ejemplo.BETTER_AUTH_SECRET_SITIO);
  vi.stubEnv("BETTER_AUTH_SECRET_PICKING", ejemplo.BETTER_AUTH_SECRET_PICKING);
  expect(() => crearAuth("sitio")).not.toThrow();
});
