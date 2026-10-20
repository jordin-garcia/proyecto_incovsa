import { Client } from "pg";

try {
  process.loadEnvFile();
} catch {
  /* La CI proporciona las variables del entorno. */
}

/** El candado entre procesos evita que los tres proyectos de Playwright se pisen. */
export async function conGaleriasDePrueba(comprobar: () => Promise<void>) {
  const conexion = new Client({ connectionString: process.env.DATABASE_URL });
  await conexion.connect();
  try {
    await conexion.query("SELECT pg_advisory_lock($1)", [2026101902]);
    const areas = ["portada", "mision", "vision"];
    const anteriores = await conexion.query(
      "SELECT * FROM imagen WHERE area = ANY($1) AND industria_id IS NULL AND producto_sitio_id IS NULL AND noticia_id IS NULL",
      [areas],
    );
    try {
      await conexion.query(
        "DELETE FROM imagen WHERE area = ANY($1) AND industria_id IS NULL AND producto_sitio_id IS NULL AND noticia_id IS NULL",
        [areas],
      );
      await conexion.query(
        "INSERT INTO imagen (area, posicion, url) SELECT area, posicion, url FROM json_to_recordset($1::json) AS x(area text, posicion smallint, url text)",
        [
          JSON.stringify([
            ...[1, 2, 3, 4, 5].map((posicion) => ({
              area: "portada",
              posicion,
              url: `/marca/foto-equipo.webp?dm02=${posicion}`,
            })),
            { area: "mision", posicion: 1, url: "/marca/foto-reunion.webp?dm02=mision" },
          ]),
        ],
      );
      await comprobar();
    } finally {
      await conexion.query("BEGIN");
      try {
        await conexion.query(
          "DELETE FROM imagen WHERE area = ANY($1) AND industria_id IS NULL AND producto_sitio_id IS NULL AND noticia_id IS NULL",
          [areas],
        );
        await conexion.query("INSERT INTO imagen SELECT * FROM json_populate_recordset(NULL::imagen, $1::json)", [
          JSON.stringify(anteriores.rows),
        ]);
        await conexion.query("COMMIT");
      } catch (error) {
        await conexion.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    await conexion.end();
  }
}
