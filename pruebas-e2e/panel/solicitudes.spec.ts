import { test as base, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { Client } from "pg";
import { capturaEvidencia } from "../comunes/evidencia";
try {
  process.loadEnvFile();
} catch {
  /* Variables de CI. */
}
const test = base.extend<{ solicitudes: Client }>({
  solicitudes: [
    async ({ baseURL, page }, usar) => {
      if (!baseURL || !["localhost", "127.0.0.1"].includes(new URL(baseURL).hostname))
        throw new Error("Se requiere una aplicación local.");
      const bd = new Client({ connectionString: process.env.DATABASE_URL });
      const errores: string[] = [];
      page.on("pageerror", (error) => errores.push(error.message));
      await bd.connect();
      try {
        await bd.query("SELECT pg_advisory_lock($1)", [2026102509]);
        const originales = (await bd.query("SELECT id,leida FROM solicitud_contacto")).rows;
        try {
          await bd.query("UPDATE solicitud_contacto SET leida=true");
          for (const [i, motivo] of ["solicitud", "queja", "reclamo"].entries()) {
            await bd.query(
              "INSERT INTO solicitud_contacto (folio,motivo,nombre,correo,pais_id,sede_id,mensaje,actualizado_en) SELECT $1,$2,$3,$4,p.id,s.id,$5,now() FROM pais p CROSS JOIN sede s WHERE p.codigo='MX' AND s.nombre='Quetzaltenango'",
              [
                `SOL-2099-990${i}`,
                motivo,
                `Persona DM09 ${i}`,
                `dm09-e2e-${i}@prueba.invalid`,
                `Mensaje completo\n${"palabralarga".repeat(35)}`,
              ],
            );
          }
          await usar(bd);
          expect(errores).toEqual([]);
        } finally {
          await bd.query("DELETE FROM solicitud_contacto WHERE correo LIKE 'dm09-e2e-%@prueba.invalid'");
          await bd.query(
            "UPDATE solicitud_contacto s SET leida=o.leida FROM json_populate_recordset(NULL::solicitud_contacto,$1::json) o WHERE s.id=o.id",
            [JSON.stringify(originales)],
          );
        }
      } finally {
        await bd.end();
      }
    },
    { auto: true, timeout: 60000 },
  ],
});
async function captura(page: Page, estado: string) {
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
  await expect(page.locator(".toast")).toHaveCount(0);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await capturaEvidencia(
    page,
    `pruebas-e2e/panel/evidencias/DM-09/aplicacion-${estado}-${page.viewportSize()!.width}.png`,
  );
}
async function entrar(page: Page, usuario = "ejemplo.08") {
  const r = await page.request.post("/api/auth/sitio/sign-in/username", {
    headers: { origin: "http://localhost:3000" },
    data: { usuario, clave: process.env.CLAVE_DEMO },
  });
  expect(r.ok()).toBe(true);
}
test("RF-SW-20 / CP-63 / RNF-08: filtros, estados libres, responsable y edición del comentario accesibles", async ({
  page,
  solicitudes,
}) => {
  await entrar(page);
  await page.goto("/panel/solicitudes");
  await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
  await expect(page.getByRole("heading", { name: "Solicitudes recibidas" })).toBeVisible();
  await page.getByRole("tab", { name: /^Reclamos/ }).click();
  await expect(page.getByRole("heading", { name: "Persona DM09 2" })).toBeVisible();
  await expect(page.getByText("Sin estado: la solicitud acaba de llegar.")).toBeVisible();
  await captura(page, "sin-estado");
  for (const estado of ["Solucionado", "Asignado", "En proceso"]) {
    await page.getByRole("button", { name: estado, exact: true }).click();
    await expect(page.getByRole("button", { name: estado, exact: true })).toHaveAttribute("aria-pressed", "true");
  }
  await page
    .getByLabel("Responsable", { exact: true })
    .selectOption({ label: "Usuario de ejemplo 08 · Administrativo" });
  const comentario = page.getByLabel("Comentario del responsable", { exact: true });
  await comentario.fill("Atención de prueba");
  await page.getByRole("button", { name: "Guardar comentario", exact: true }).click();
  await expect(comentario).toHaveAttribute("readonly", "");
  await captura(page, "comentario-guardado");
  await page.getByRole("button", { name: "Editar comentario", exact: true }).click();
  await expect(comentario).not.toHaveAttribute("readonly", "");
  await expect(page.getByRole("button", { name: "Guardar comentario", exact: true })).toBeVisible();
  await comentario.fill("Comentario editado");
  await page.getByRole("button", { name: "Guardar comentario", exact: true }).click();
  await expect(comentario).toHaveValue("Comentario editado");
  await expect(comentario).toHaveAttribute("readonly", "");
  expect(
    (
      await solicitudes.query("SELECT comentario FROM solicitud_contacto WHERE correo=$1", [
        "dm09-e2e-2@prueba.invalid",
      ])
    ).rows[0].comentario,
  ).toBe("Comentario editado");
  expect(
    (await new AxeBuilder({ page }).analyze()).violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("tab", { name: /^Quejas/ }).click();
  await expect(page.getByRole("heading", { name: "Persona DM09 1" })).toBeVisible();
  await captura(page, "queja");
  await solicitudes.query("DELETE FROM solicitud_contacto WHERE correo=$1", ["dm09-e2e-1@prueba.invalid"]);
  await page.reload();
  await page.getByRole("tab", { name: /^Quejas/ }).click();
  await expect(page.getByRole("heading", { name: "Sin solicitudes", exact: true })).toBeVisible();
  await expect(page.getByText("Sin solicitudes de este motivo.", { exact: true })).toBeVisible();
  await captura(page, "vacio");
  expect(
    (await new AxeBuilder({ page }).analyze()).violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
});
test("RF-SW-31 / CP-59: indicador normal y reducido baja al abrir una solicitud", async ({ page }) => {
  await entrar(page);
  await page.goto("/panel/resumen");
  await expect(page.locator(".app")).toHaveAttribute("data-hidratado", "true");
  const enlace = page.getByRole("link", { name: "Solicitudes 3", exact: true });
  if (page.viewportSize()!.width <= 1024) await page.getByRole("button", { name: "Menú", exact: true }).click();
  await expect(enlace).toBeVisible();
  await captura(page, "indicador");
  if (page.viewportSize()!.width > 1024) {
    await page.getByRole("button", { name: "Reducir el menú a íconos", exact: true }).click();
    await expect(enlace).toBeVisible();
    await captura(page, "indicador-reducido");
  }
  await enlace.click();
  await expect(page.getByRole("heading", { name: "Solicitudes recibidas" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Solicitudes 2", exact: true })).toHaveCount(1);
});

test("RNF-04 / RF-SW-20: solo lectura sin gestionar y sección ausente sin permisos", async ({ page, solicitudes }) => {
  const usuario = (
    await solicitudes.query("SELECT id FROM usuario WHERE display_username='ejemplo.09' AND sistema='sitio'")
  ).rows[0].id;
  const originales = (
    await solicitudes.query(
      "SELECT up.permiso_id FROM usuario_permiso up JOIN permiso p ON p.id=up.permiso_id WHERE up.usuario_id=$1 AND p.codigo IN ('sit.sol.ver','sit.sol.gestionar')",
      [usuario],
    )
  ).rows;
  try {
    await solicitudes.query(
      "DELETE FROM usuario_permiso WHERE usuario_id=$1 AND permiso_id IN (SELECT id FROM permiso WHERE codigo IN ('sit.sol.ver','sit.sol.gestionar'))",
      [usuario],
    );
    await entrar(page, "ejemplo.09");
    await page.goto("/panel/solicitudes");
    await expect(page.getByRole("heading", { name: "Sin acceso a este módulo" })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Módulos" }).getByRole("link", { name: /^Solicitudes/ }),
    ).toHaveCount(0);
    await solicitudes.query(
      "INSERT INTO usuario_permiso (usuario_id,permiso_id) SELECT $1,id FROM permiso WHERE codigo='sit.sol.ver'",
      [usuario],
    );
    await page.reload();
    await expect(page.getByRole("heading", { name: "Solicitudes recibidas" })).toBeVisible();
    for (const estado of ["Asignado", "En proceso", "Solucionado"])
      await expect(page.getByRole("button", { name: estado, exact: true })).toBeDisabled();
    await expect(page.getByLabel("Responsable", { exact: true })).toBeDisabled();
    await expect(page.getByLabel("Comentario del responsable", { exact: true })).toHaveAttribute("readonly", "");
    await expect(page.getByRole("button", { name: "Guardar comentario", exact: true })).toHaveCount(0);
    await captura(page, "solo-lectura");
    expect(
      (await new AxeBuilder({ page }).analyze()).violations.filter((v) =>
        ["serious", "critical"].includes(v.impact ?? ""),
      ),
    ).toEqual([]);
  } finally {
    await solicitudes.query(
      "DELETE FROM usuario_permiso WHERE usuario_id=$1 AND permiso_id IN (SELECT id FROM permiso WHERE codigo IN ('sit.sol.ver','sit.sol.gestionar'))",
      [usuario],
    );
    for (const p of originales)
      await solicitudes.query("INSERT INTO usuario_permiso (usuario_id,permiso_id) VALUES ($1,$2)", [
        usuario,
        p.permiso_id,
      ]);
  }
});
