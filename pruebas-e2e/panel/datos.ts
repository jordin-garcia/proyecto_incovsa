import { test as base } from "@playwright/test";
import { Client } from "pg";
import { unlink } from "node:fs/promises";
import { join } from "node:path";

try {
  process.loadEnvFile();
} catch {
  /* La CI proporciona las variables. */
}

// Textos aprobados de specs/05 y de la semilla base; no dependen del estado previo del equipo.
export const MISION =
  "Ser el aliado estratégico para nuestros clientes y proveedores en la distribución de productos químicos, atendiendo la región CA-4, marcando la diferencia en servicio, con una completa gama de productos para brindar soluciones a las necesidades del mercado, apoyando a cumplir los objetivos de nuestros grupos de interés.";
const VISION =
  "Ser referentes y acercar soluciones en la distribución de productos químicos satisfaciendo las necesidades de los mercados atendidos, creando valor integral a nuestros grupos de interés a través del crecimiento y mejora continua, con una administración responsable y transparente enfocada en la solidez y el largo plazo.";
const AREAS = ["portada", "mision", "vision", "historia"];

/** Aísla únicamente el contenido institucional y siempre restaura las filas originales, incluso si falla la prueba. */
async function conContenidoDePrueba(comprobar: () => Promise<void>) {
  if (process.env.ALMACENAMIENTO && process.env.ALMACENAMIENTO !== "disco")
    throw new Error("Las pruebas de panel requieren almacenamiento local de desarrollo.");
  const conexion = new Client({ connectionString: process.env.DATABASE_URL });
  await conexion.connect();
  try {
    // El mismo candado que las galerías de DM-02: los preparadores no se pisan entre procesos.
    await conexion.query("SELECT pg_advisory_lock($1)", [2026101902]);
    const configuracion = await conexion.query("SELECT * FROM configuracion_sitio");
    const textos = await conexion.query("SELECT * FROM contenido_institucional");
    const valores = await conexion.query("SELECT * FROM valor");
    const imagenes = await conexion.query(
      "SELECT * FROM imagen WHERE area = ANY($1) AND industria_id IS NULL AND producto_sitio_id IS NULL AND noticia_id IS NULL",
      [AREAS],
    );
    try {
      await conexion.query("BEGIN");
      await conexion.query(
        "DELETE FROM imagen WHERE area = ANY($1) AND industria_id IS NULL AND producto_sitio_id IS NULL AND noticia_id IS NULL",
        [AREAS],
      );
      await conexion.query("DELETE FROM contenido_institucional");
      await conexion.query(
        "INSERT INTO contenido_institucional (seccion, texto) VALUES ('mision', $1), ('vision', $2), ('historia', '')",
        [MISION, VISION],
      );
      await conexion.query(
        "UPDATE configuracion_sitio SET logotipo_incovsa_url = NULL, logotipo_inquiserca_url = $1 WHERE id = 1",
        ["/marca/inquiserca.webp"],
      );
      await conexion.query("UPDATE valor SET imagen_url = NULL");
      await conexion.query("COMMIT");
      await comprobar();
    } finally {
      // Las imágenes anteriores nunca se presentan al editor de prueba y por eso no se sustituyen ni se borran.
      const nuevas = await conexion.query<{ url: string }>(
        "SELECT url FROM imagen WHERE area = ANY($1) AND industria_id IS NULL AND producto_sitio_id IS NULL AND noticia_id IS NULL UNION SELECT imagen_url FROM valor WHERE imagen_url IS NOT NULL UNION SELECT logotipo_incovsa_url FROM configuracion_sitio WHERE logotipo_incovsa_url IS NOT NULL UNION SELECT logotipo_inquiserca_url FROM configuracion_sitio WHERE logotipo_inquiserca_url IS NOT NULL",
        [AREAS],
      );
      await conexion.query("BEGIN");
      try {
        await conexion.query(
          "DELETE FROM imagen WHERE area = ANY($1) AND industria_id IS NULL AND producto_sitio_id IS NULL AND noticia_id IS NULL",
          [AREAS],
        );
        await conexion.query("INSERT INTO imagen SELECT * FROM json_populate_recordset(NULL::imagen, $1::json)", [
          JSON.stringify(imagenes.rows),
        ]);
        await conexion.query("DELETE FROM contenido_institucional");
        await conexion.query(
          "INSERT INTO contenido_institucional SELECT * FROM json_populate_recordset(NULL::contenido_institucional, $1::json)",
          [JSON.stringify(textos.rows)],
        );
        await conexion.query("DELETE FROM valor");
        await conexion.query("INSERT INTO valor SELECT * FROM json_populate_recordset(NULL::valor, $1::json)", [
          JSON.stringify(valores.rows),
        ]);
        await conexion.query("DELETE FROM configuracion_sitio");
        await conexion.query(
          "INSERT INTO configuracion_sitio SELECT * FROM json_populate_recordset(NULL::configuracion_sitio, $1::json)",
          [JSON.stringify(configuracion.rows)],
        );
        await conexion.query("COMMIT");
      } catch (error) {
        await conexion.query("ROLLBACK");
        throw error;
      }
      for (const { url } of nuevas.rows) {
        if (!/^\/api\/imagenes\/[a-f0-9-]{36}\.webp$/.test(url)) continue;
        await unlink(join(process.cwd(), "almacenamiento-local", "imagenes", url.slice("/api/imagenes/".length))).catch(
          (error: NodeJS.ErrnoException) => {
            if (error.code !== "ENOENT") throw error;
          },
        );
      }
    }
  } finally {
    await conexion.end();
  }
}

export const test = base.extend<{ contenidoDePrueba: void }>({
  contenidoDePrueba: [
    async ({ baseURL }, use) => {
      if (!baseURL || !["localhost", "127.0.0.1"].includes(new URL(baseURL).hostname))
        throw new Error("Las pruebas del panel requieren una aplicación local de desarrollo.");
      await conContenidoDePrueba(() => use());
    },
    { auto: true, timeout: 60_000 },
  ],
});
