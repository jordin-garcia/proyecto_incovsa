import { expect, test, type APIRequestContext, type BrowserContext } from "@playwright/test";
import { irA } from "../comunes/navegacion";

try {
  process.loadEnvFile();
} catch {
  /* La CI entrega las variables. */
}

// JG-26: cierre de la sesión anterior al volver a entrar (ASVS V7.2.4) y limpieza al cerrar sesión (ASVS V14.3.1).
// Este archivo corre con el servidor de desarrollo, por HTTP: las cookies no llevan __Host- (eso se prueba en
// pruebas-e2e/seguridad/cabeceras.spec.ts, con el servidor de producción).

async function entrar(peticiones: APIRequestContext, sistema: "sitio" | "picking", usuario: string) {
  const r = await peticiones.post(`/api/auth/${sistema}/sign-in/username`, {
    headers: { origin: "http://localhost:3000" },
    data: { usuario, clave: process.env.CLAVE_DEMO },
  });
  expect(r.ok(), `Inicio de sesión de ${usuario} en ${sistema}`).toBe(true);
}
async function tokenDe(context: BrowserContext, sistema: "sitio" | "picking") {
  return (await context.cookies()).find((c) => c.name === `incovsa-${sistema}.session_token`)?.value;
}
async function sesionCon(peticiones: APIRequestContext, sistema: "sitio" | "picking", token: string) {
  const r = await peticiones.get(`/api/auth/${sistema}/get-session`, {
    headers: { cookie: `incovsa-${sistema}.session_token=${token}` },
  });
  return r.json();
}

test("RF-SL-01 (ASVS V7.2.4): volver a iniciar sesión en el mismo navegador invalida la sesión anterior", async ({
  context,
  playwright,
}) => {
  await entrar(context.request, "picking", "ejemplo.01");
  await entrar(context.request, "sitio", "ejemplo.01");
  const anterior = await tokenDe(context, "picking");
  const sitio = await tokenDe(context, "sitio");
  expect(anterior).toBeTruthy();
  await entrar(context.request, "picking", "ejemplo.02");
  const nueva = await tokenDe(context, "picking");
  expect(nueva).not.toBe(anterior);
  // Otro cliente, sin las cookies del navegador, prueba cada token por separado.
  const aparte = await playwright.request.newContext({ baseURL: "http://localhost:3000" });
  try {
    expect(await sesionCon(aparte, "picking", anterior!)).toBeNull();
    expect(await sesionCon(aparte, "picking", nueva!)).toMatchObject({ usuario: { usuario: "ejemplo.02" } });
    // La sesión del otro sistema sigue abierta (una sesión por sistema, specs/03).
    expect(await sesionCon(aparte, "sitio", sitio!)).toMatchObject({ usuario: { usuario: "ejemplo.01" } });
  } finally {
    await aparte.dispose();
  }
});

for (const sistema of ["sitio", "picking"] as const) {
  test(`ASVS V14.3.1: después de cerrar ${sistema}, Atrás no muestra contenido autenticado`, async ({
    page,
    context,
  }) => {
    const otro = sistema === "sitio" ? "picking" : "sitio";
    await entrar(context.request, sistema, "ejemplo.01");
    await entrar(context.request, otro, "ejemplo.01");
    const paginas =
      sistema === "sitio" ? ["/panel/documentos", "/panel/noticias"] : ["/picking/bodega", "/picking/ruta"];
    for (const ruta of paginas) {
      await irA(page, ruta);
      await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
    }
    const cierre = page.waitForResponse((r) => r.url().endsWith(`/api/auth/${sistema}/sign-out`));
    if (await page.getByRole("button", { name: "Menú", exact: true }).isVisible())
      await page.getByRole("button", { name: "Menú", exact: true }).click();
    await page.getByRole("button", { name: "Cerrar sesión", exact: true }).click();
    expect((await (await cierre).allHeaders())["clear-site-data"]).toBe('"cache"');
    await expect(page).toHaveURL("/");
    await expect(page.getByText("Sesión cerrada.", { exact: true })).toBeVisible();
    // Atrás vuelve a pedir la página al servidor, que ya no tiene sesión: termina en el acceso, sin el armazón.
    await page.goBack();
    // Si la página vuelve de la caché de páginas del navegador, el enrutador de Next.js pide sus datos y sigue la
    // redirección del servidor, que puede conservar su parámetro interno _rsc.
    await expect(page).toHaveURL(/\/acceso(\?_rsc=[^&]+)?$/);
    await expect(page.getByRole("region", { name: "Acceso para personal" })).toBeVisible();
    await expect(page.locator(".app")).toHaveCount(0);
    // La sesión del otro sistema sigue abierta.
    expect(await (await context.request.get(`/api/auth/${otro}/get-session`)).json()).toMatchObject({
      usuario: { usuario: "ejemplo.01" },
    });
  });
}
