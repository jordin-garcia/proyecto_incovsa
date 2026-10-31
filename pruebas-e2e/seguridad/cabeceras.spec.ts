import { expect } from "@playwright/test";
import { test } from "../flujo/servidor-produccion";
import { irA } from "../comunes/navegacion";

try {
  process.loadEnvFile();
} catch {
  /* La CI entrega las variables. */
}

test("RNF-16: páginas, errores, redirecciones, API y recursos envían las cabeceras de seguridad", async ({
  request,
  produccion,
}) => {
  for (const ruta of ["/", "/acceso", "/panel", "/no-existe-jg11", "/api/tiempo-real", "/marca/incovsa-oscuro.svg"]) {
    const respuesta = await request.get(`${produccion.url}${ruta}`, { maxRedirects: 0 });
    const cabeceras = respuesta.headers();
    expect(cabeceras["x-content-type-options"], ruta).toBe("nosniff");
    expect(cabeceras["referrer-policy"], ruta).toBe("strict-origin-when-cross-origin");
    expect(cabeceras["strict-transport-security"], ruta).toContain("max-age=31536000");
    expect(cabeceras["content-security-policy"], ruta).toContain("frame-ancestors 'none'");
    expect(cabeceras["content-security-policy"], ruta).toContain("default-src 'self'");
    expect(cabeceras["content-security-policy"], ruta).not.toContain("'unsafe-eval'");
    // JG-26: V3.4.3 y alertas 10037, 10063 y 90004 de ZAP.
    expect(cabeceras["content-security-policy"].split("; "), ruta).toEqual(
      expect.arrayContaining(["base-uri 'none'", "object-src 'none'"]),
    );
    expect(cabeceras["permissions-policy"], ruta).toBe("camera=(), microphone=(), geolocation=(), payment=()");
    expect(cabeceras["cross-origin-opener-policy"], ruta).toBe("same-origin");
    expect(cabeceras["x-powered-by"], ruta).toBeUndefined();
  }
});

test("RNF-16 (ASVS V3.3.1 y V3.3.3): en producción todas las cookies propias llevan __Host-, Secure y path=/", async ({
  page,
  produccion,
}) => {
  // El servidor de producción se prueba sin Caddy: se simula su cabecera de IP de confianza (decisión 29).
  await page.context().setExtraHTTPHeaders({ "x-real-ip": "192.0.2.126" });
  const peticiones = page.context().request;
  const nombres = async () => (await page.context().cookies()).map((c) => c.name);
  await irA(page, `${produccion.url}/acceso`);
  await page.getByRole("textbox", { name: "Usuario" }).fill("ejemplo.01");
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect.poll(nombres).toContain("__Host-incovsa-acceso-usuario");
  for (const sistema of ["sitio", "picking"]) {
    const r = await peticiones.post(`${produccion.url}/api/auth/${sistema}/sign-in/username`, {
      headers: { origin: produccion.url },
      data: { usuario: "ejemplo.01", clave: process.env.CLAVE_DEMO },
    });
    expect(r.ok(), sistema).toBe(true);
  }
  await irA(page, `${produccion.url}/picking/reportes`);
  await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
  await page.getByRole("combobox", { name: "Sede", exact: true }).selectOption({ label: "Guatemala" });
  await expect.poll(nombres).toContain("__Host-incovsa-sede");
  const cookies = await page.context().cookies();
  expect(cookies.map((c) => c.name).sort()).toEqual(
    expect.arrayContaining([
      "__Host-incovsa-acceso-usuario",
      "__Host-incovsa-picking.session_token",
      "__Host-incovsa-sede",
      "__Host-incovsa-sitio.session_token",
    ]),
  );
  for (const cookie of cookies) {
    expect(cookie.name, cookie.name).toMatch(/^__Host-/);
    expect(cookie).toMatchObject({ secure: true, path: "/", httpOnly: true, sameSite: "Lax" });
  }
});

test("RNF-16 (ASVS V11.5.1): el nonce de la CSP tiene 128 bits", async ({ request, produccion }) => {
  for (let i = 0; i < 5; i++) {
    const respuesta = await request.get(`${produccion.url}/acceso`);
    const nonce = respuesta.headers()["content-security-policy"].match(/'nonce-([^']+)'/)?.[1] ?? "";
    expect(Buffer.from(nonce, "base64")).toHaveLength(16);
  }
});

test("RNF-16: el navegador admite Google Maps y Drive, y rechaza marcos de otros orígenes", async ({
  page,
  produccion,
}) => {
  await page.route("https://www.google.com/maps/embed**", (ruta) =>
    ruta.fulfill({ contentType: "text/html", body: "Mapa permitido" }),
  );
  await page.route("https://drive.google.com/file/d/jg11/preview", (ruta) =>
    ruta.fulfill({ contentType: "text/html", body: "Vista previa permitida" }),
  );
  await irA(page, `${produccion.url}/acceso`);
  await page.evaluate(() => {
    for (const direccion of [
      "https://www.google.com/maps/embed?pb=jg11",
      "https://drive.google.com/file/d/jg11/preview",
      "https://otro.example.invalid/marco",
    ]) {
      const marco = document.createElement("iframe");
      marco.src = direccion;
      document.body.append(marco);
    }
  });
  await expect(page.frameLocator('iframe[src*="google.com/maps"]').locator("body")).toHaveText("Mapa permitido");
  await expect(page.frameLocator('iframe[src*="drive.google.com"]').locator("body")).toHaveText(
    "Vista previa permitida",
  );
  expect(page.frames().some((marco) => marco.url() === "https://otro.example.invalid/marco")).toBe(false);
});

test("RNF-16: otro sitio no puede insertar la aplicación dentro de un marco", async ({ page, request, produccion }) => {
  const respuestaReal = await request.get(`${produccion.url}/acceso`);
  expect(respuestaReal.status()).toBe(200);
  // Se reproduce la respuesta REAL en otro origen: Chromium no llega a resolver la navegación de
  // marcos de loopback cruzados en este entorno. El navegador aplica la CSP recibida del servidor.
  const origenAjeno = "http://marco.example.invalid/jg11";
  const aplicacion = "http://aplicacion.example.invalid/acceso";
  await page.route(aplicacion, (ruta) => ruta.fulfill({ response: respuestaReal }));
  await page.route(origenAjeno, (ruta) =>
    ruta.fulfill({ contentType: "text/html", body: `<iframe src="${aplicacion}"></iframe>` }),
  );
  const rechazo = page.waitForEvent("console", { predicate: (mensaje) => mensaje.text().includes("frame-ancestors") });
  await irA(page, origenAjeno, { waitUntil: "domcontentloaded" });
  await rechazo;
  expect(page.frames().some((marco) => marco.url() === aplicacion)).toBe(false);
});

test("RNF-16: cada respuesta tiene su nonce y los scripts en línea ajenos quedan bloqueados", async ({
  page,
  request,
  produccion,
}) => {
  const primera = await request.get(`${produccion.url}/acceso`);
  const segunda = await request.get(`${produccion.url}/acceso`);
  const nonce = primera.headers()["content-security-policy"].match(/'nonce-([^']+)'/)?.[1];
  expect(nonce).toBeTruthy();
  expect(await primera.text()).toContain(`nonce="${nonce}"`);
  expect(segunda.headers()["content-security-policy"]).not.toContain(`'nonce-${nonce}'`);
  await irA(page, `${produccion.url}/acceso`);
  await expect(page.addScriptTag({ content: "window.__scriptAjenoJg11 = true;" })).rejects.toThrow();
  expect(await page.evaluate(() => "__scriptAjenoJg11" in window)).toBe(false);
});
