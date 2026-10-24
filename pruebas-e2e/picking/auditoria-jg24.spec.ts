import { expect, test as base } from "@playwright/test";
import { Client } from "pg";
import AxeBuilder from "@axe-core/playwright";

try {
  process.loadEnvFile();
} catch {
  /* La CI proporciona las variables. */
}

const test = base.extend<{ clientesDePrueba: void }>({
  clientesDePrueba: [
    async ({}, usar) => {
      const db = new Client({ connectionString: process.env.DATABASE_URL });
      await db.connect();
      const ids: number[] = [];
      let anterior: { id: number; fecha: string | null; hora: string | null } | undefined;
      try {
        await db.query("SELECT pg_advisory_lock(hashtext($1))", ["e2e:facturacion-envio"]);
        anterior = (
          await db.query<{ id: number; fecha: string | null; hora: string | null }>(
            "SELECT id, fecha_programada::text AS fecha, hora_programada::text AS hora FROM opcion_envio WHERE sede_id=1 AND tipo='recoge'",
          )
        ).rows[0];
        expect(anterior).toBeTruthy();
        expect(
          (await db.query("SELECT id FROM pedido_facturado WHERE opcion_envio_id=$1", [anterior!.id])).rowCount,
        ).toBe(0);
        for (const [i, cliente, sector] of [
          [1, " José Álvarez ", " ZÓNA 1 "],
          [2, "jose alvarez", "zona 1"],
        ] as const) {
          const fila = await db.query<{ id: number }>(
            "INSERT INTO pedido_facturado(sede_id,numero_odoo,referencia,cliente,sector,opcion_envio_id,posicion,cargado_por) SELECT 1,$1,$2,$3,$4,$5,$6,id FROM usuario WHERE username='picking.ejemplo.03' RETURNING id",
            [`JG24-${i}`, `XE-IN/SALIDA/JG24-${i}`, cliente, sector, anterior!.id, i],
          );
          ids.push(fila.rows[0].id);
          await db.query(
            "INSERT INTO detalle_pedido_facturado(pedido_facturado_id,producto,lote,peso_conversion_kg,cantidad_kg,orden) VALUES($1,'Producto de prueba','JG24',25,25,1)",
            [fila.rows[0].id],
          );
        }
        await db.query(
          "UPDATE opcion_envio SET fecha_programada='2026-10-24',hora_programada='13:30',actualizado_en=now() WHERE id=$1",
          [anterior!.id],
        );
        await usar();
      } finally {
        try {
          await db.query("DELETE FROM pedido_facturado WHERE id=ANY($1::int[]) AND envio_id IS NULL", [ids]);
          if (anterior)
            await db.query(
              "UPDATE opcion_envio SET fecha_programada=$2::date,hora_programada=$3::time,actualizado_en=now() WHERE id=$1",
              [anterior.id, anterior.fecha, anterior.hora],
            );
        } finally {
          await db.end();
        }
      }
    },
    { auto: true, timeout: 180_000 },
  ],
});

test("RN-49 / D-01: la confirmación de Facturación cuenta un cliente aunque varíen mayúsculas, tildes y espacios exteriores", async ({
  page,
  context,
}) => {
  const respuesta = await context.request.post("/api/auth/picking/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario: "ejemplo.03", clave: process.env.CLAVE_DEMO },
  });
  expect(respuesta.ok()).toBe(true);
  await page.goto("/picking/facturacion");
  await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
  await page
    .getByRole("region", { name: "Cliente recoge en bodega", exact: true })
    .getByRole("button", { name: "Enviar a Bodega", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("2 pedido(s) facturado(s) de 1 cliente(s) y 50 kg");
  const resumen = page.getByRole("dialog").locator(".confirmacion-texto > div");
  await expect(resumen).toHaveCSS("color", "rgb(43, 44, 43)");
  await expect(resumen).toHaveCSS("font-size", "16px");
  await expect(page.getByRole("dialog").locator(".confirmacion-texto")).toHaveCSS("color", "rgb(84, 85, 84)");
  expect(
    (await new AxeBuilder({ page }).analyze()).violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  await page.screenshot({
    path: `plan/evidencias/JG-24/aplicacion-un-cliente-${page.viewportSize()!.width}.png`,
    fullPage: false,
  });
});
