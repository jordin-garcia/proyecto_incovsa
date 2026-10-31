import { afterEach, expect, it, vi } from "vitest";
import { atributosCookie, cookieAccesoUsuario, cookieSesion, nombreCookie } from "./cookies";
import { crearAuth } from "./auth-configuracion";

afterEach(() => {
  vi.unstubAllEnvs();
});

it("RNF-16 (ASVS V3.3.1 y V3.3.3): en producción las cookies propias llevan __Host-, Secure, path=/ y sin Domain", () => {
  vi.stubEnv("NODE_ENV", "production");
  expect(nombreCookie("incovsa-sede")).toBe("__Host-incovsa-sede");
  expect(cookieSesion("picking")).toBe("__Host-incovsa-picking.session_token");
  expect(cookieSesion("sitio")).toBe("__Host-incovsa-sitio.session_token");
  expect(cookieAccesoUsuario()).toBe("__Host-incovsa-acceso-usuario");
  expect(atributosCookie(900)).toEqual({ httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 900 });
  expect(atributosCookie()).not.toHaveProperty("domain");
});

it("RNF-16: en desarrollo y en las pruebas, por HTTP, se conservan los nombres sin prefijo", () => {
  vi.stubEnv("NODE_ENV", "development");
  expect(nombreCookie("incovsa-sede")).toBe("incovsa-sede");
  expect(cookieSesion("picking")).toBe("incovsa-picking.session_token");
  expect(atributosCookie().secure).toBe(false);
});

it("RNF-16 (ASVS V3.3.3): en producción Better Auth escribe sus cookies con __Host- y no con __Secure-", async () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("BETTER_AUTH_SECRET_SITIO", "s".repeat(40));
  vi.stubEnv("BETTER_AUTH_SECRET_PICKING", "p".repeat(40));
  for (const sistema of ["sitio", "picking"] as const) {
    const { authCookies } = await crearAuth(sistema).$context;
    for (const cookie of Object.values(authCookies)) {
      expect(cookie.name).toMatch(new RegExp(`^__Host-incovsa-${sistema}\\.`));
      expect(cookie.attributes).toMatchObject({ secure: true, path: "/", httpOnly: true, sameSite: "lax" });
      expect(cookie.attributes).not.toHaveProperty("domain");
    }
    expect(authCookies.sessionToken.name).toBe(cookieSesion(sistema));
  }
});
