import { expect, type Browser, type Request } from "@playwright/test";
import { test } from "../flujo/servidor-produccion";
import { Client } from "pg";
import { mkdir, writeFile } from "node:fs/promises";

try {
  process.loadEnvFile();
} catch {
  /* La CI proporciona las variables. */
}

async function medir(browser: Browser, viewport: { width: number; height: number }, baseURL: string) {
  // Cada muestra usa caché vacía; las imágenes se descargan del servidor real.
  const contexto = await browser.newContext({ viewport, baseURL });
  try {
    const page = await contexto.newPage();
    const solicitudes: Request[] = [];
    page.on("request", (solicitud) => {
      if (solicitud.resourceType() === "image") solicitudes.push(solicitud);
    });
    // Los mapas externos no forman parte de las galerías ni de esta medición local.
    await page.route("https://www.google.com/maps/**", (ruta) => ruta.fulfill({ status: 204 }));
    await page.addInitScript(() => {
      window.addEventListener(
        "load",
        () => {
          const recursos = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
          // next/image puede precargar la primera con <link>; también cuenta sus bytes.
          const imagenes = recursos.filter((r) => /\.(?:webp|png|jpe?g)(?:\?|$)/.test(r.name));
          const portada = imagenes.find((r) => r.name.includes("dm11=portada-1"));
          Object.assign(window, {
            medicionDM11: {
              bytes: imagenes.reduce((total, r) => total + r.transferSize, 0),
              imagenes: imagenes.map((r) => new URL(r.name).pathname + new URL(r.name).search).sort(),
              primeraPortadaMs: portada?.responseEnd ?? 0,
              cargaMs: performance.now(),
              cargaEpoch: performance.timeOrigin + performance.now(),
            },
          });
        },
        { once: true },
      );
    });
    await page.goto("/", { waitUntil: "load" });
    const medicion = await page.evaluate(
      () =>
        (
          window as unknown as {
            medicionDM11: {
              bytes: number;
              imagenes: string[];
              primeraPortadaMs: number;
              cargaMs: number;
              cargaEpoch: number;
            };
          }
        ).medicionDM11,
    );
    expect(medicion.bytes).toBeGreaterThan(0);
    expect(medicion.primeraPortadaMs).toBeGreaterThan(0);
    expect(medicion.imagenes.some((url) => /dm11=.+-[2-5]/.test(url))).toBe(false);
    const iniciadasAntesDeLoad = solicitudes
      .filter((solicitud) => solicitud.timing().startTime < medicion.cargaEpoch)
      .map((solicitud) => solicitud.url());
    expect(iniciadasAntesDeLoad.some((url) => /dm11=.+-[2-5]/.test(url))).toBe(false);
    await expect(page.locator(".hero [data-galeria] img").first()).toBeVisible();
    return { ...medicion, iniciadasAntesDeLoad };
  } finally {
    await contexto.close();
  }
}

test("RNF-17 / CP-52: cinco imágenes no aumentan bytes ni tiempo inicial respecto de una", async ({
  browser,
  page,
  produccion,
}, info) => {
  test.setTimeout(180_000);
  const bd = new Client({ connectionString: process.env.DATABASE_URL });
  await bd.connect();
  try {
    await bd.query("SELECT pg_advisory_lock($1)", [2026101902]);
    const areas = ["portada", "mision", "vision"];
    const condicion = "area = ANY($1) AND industria_id IS NULL AND producto_sitio_id IS NULL AND noticia_id IS NULL";
    const anteriores = await bd.query(`SELECT * FROM imagen WHERE ${condicion}`, [areas]);
    try {
      const una: Awaited<ReturnType<typeof medir>>[] = [];
      const cinco: typeof una = [];
      // La primera pareja calienta ambas configuraciones y no entra en las estadísticas.
      for (let ronda = 0; ronda < 13; ronda++) {
        // Alternar el orden evita favorecer siempre a la segunda configuración.
        for (const cantidad of ronda % 2 ? [5, 1] : [1, 5]) {
          await bd.query("BEGIN");
          try {
            await bd.query(`DELETE FROM imagen WHERE ${condicion}`, [areas]);
            await bd.query(
              "INSERT INTO imagen (area, posicion, url) SELECT area, posicion, url FROM json_to_recordset($1::json) AS x(area text, posicion smallint, url text)",
              [
                JSON.stringify(
                  areas.flatMap((area) =>
                    Array.from({ length: cantidad }, (_, i) => ({
                      area,
                      posicion: i + 1,
                      url: `/marca/foto-equipo.webp?dm11=${area}-${i + 1}`,
                    })),
                  ),
                ),
              ],
            );
            await bd.query("COMMIT");
          } catch (error) {
            await bd.query("ROLLBACK");
            throw error;
          }
          const muestra = await medir(browser, page.viewportSize()!, produccion.url);
          if (ronda > 0) (cantidad === 1 ? una : cinco).push(muestra);
        }
      }
      await info.attach("RNF-17-mediciones", {
        body: JSON.stringify({ una, cinco }, null, 2),
        contentType: "application/json",
      });
      await mkdir("pruebas-e2e/sitio/evidencias/DM-11", { recursive: true });
      await writeFile(
        `pruebas-e2e/sitio/evidencias/DM-11/rendimiento-${page.viewportSize()!.width}.json`,
        JSON.stringify({ una, cinco }, null, 2),
      );
      for (const muestra of [...una, ...cinco]) {
        expect(muestra.imagenes.filter((url) => url.includes("dm11="))).toHaveLength(3);
        expect(muestra.imagenes).toEqual(una[0].imagenes);
        expect(muestra.bytes).toBe(una[0].bytes);
      }
      // Comparación estricta de medianas, sin márgenes ni valores atípicos como umbral.
      const mediana = (valores: number[]) => {
        const ordenados = valores.toSorted((a, b) => a - b);
        return (ordenados[5] + ordenados[6]) / 2;
      };
      for (const metrica of ["primeraPortadaMs", "cargaMs"] as const) {
        expect(mediana(cinco.map((m) => m[metrica])), metrica).toBeLessThanOrEqual(mediana(una.map((m) => m[metrica])));
      }
    } finally {
      await bd.query("BEGIN");
      try {
        await bd.query(`DELETE FROM imagen WHERE ${condicion}`, [areas]);
        await bd.query("INSERT INTO imagen SELECT * FROM json_populate_recordset(NULL::imagen, $1::json)", [
          JSON.stringify(anteriores.rows),
        ]);
        await bd.query("COMMIT");
      } catch (error) {
        await bd.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    await bd.end();
  }
});
