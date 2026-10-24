// JG-24 / H-05. Solo contra la aplicación local y Caddyfile.pruebas; no imprime credenciales.
import assert from "node:assert/strict";
import { readFile, writeFile, unlink } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { spawn, execFileSync } from "node:child_process";
import { createWriteStream } from "node:fs";
import { createServer } from "node:net";
import { setTimeout as esperar } from "node:timers/promises";
import { request } from "@playwright/test";
import { Client } from "pg";

process.loadEnvFile();
const origen = "http://localhost:3080";
assert.equal(process.env.ALMACENAMIENTO, "disco", "Esta prueba exige almacenamiento local");
const caddy = process.argv[2];
assert.ok(caddy, "Indique la ruta del ejecutable de Caddy verificado");
async function exigirPuertoLibre(puerto) {
  const servidor = createServer();
  await new Promise((resolver, rechazar) => {
    servidor.once("error", rechazar);
    servidor.listen(puerto, "127.0.0.1", resolver);
  });
  await new Promise((resolver) => servidor.close(resolver));
}
await exigirPuertoLibre(3080);
await exigirPuertoLibre(3100);
const db = new Client({ connectionString: process.env.DATABASE_URL });
assert.ok(
  ["localhost", "127.0.0.1"].includes(new URL(process.env.DATABASE_URL).hostname),
  "Solo se permite una base local",
);
const api = await request.newContext({ baseURL: origen });
const resultado = [];
let contenido, industria, productoId;
const hijos = [];
const registros = [];
function iniciar(binario, argumentos, nombre) {
  const registro = createWriteStream(new URL(`../plan/evidencias/JG-24/${nombre}.txt`, import.meta.url));
  registros.push(registro);
  const hijo = spawn(binario, argumentos, {
    cwd: resolve("."),
    env: { ...process.env, ALMACENAMIENTO: "disco", BETTER_AUTH_URL: origen },
    windowsHide: true,
  });
  hijo.stdout.pipe(registro, { end: false });
  hijo.stderr.pipe(registro, { end: false });
  hijos.push(hijo);
  return hijo;
}
await db.connect();
async function publicar(ruta, datos, archivo, origin = origen) {
  const r = await api.post(ruta, {
    headers: { origin },
    multipart: {
      datos: JSON.stringify(datos),
      ...(archivo ? { imagenes: { name: "prueba.webp", mimeType: "image/webp", buffer: archivo } } : {}),
    },
  });
  return { status: r.status(), datos: await r.json() };
}
try {
  // Ambos procesos reciben exactamente la configuración local validada arriba.
  iniciar(
    process.execPath,
    ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", "3100"],
    "caddy-aplicacion",
  );
  iniciar(
    caddy,
    ["run", "--config", resolve("plan/evidencias/JG-24/Caddyfile.pruebas"), "--adapter", "caddyfile"],
    "caddy-servidor",
  );
  let listo = false;
  for (let intento = 0; intento < 45; intento++) {
    try {
      if ((await api.get("/api/auth/sitio/get-session", { timeout: 1000 })).status() === 200) {
        listo = true;
        break;
      }
    } catch {
      /* Arranque local. */
    }
    await esperar(1000);
  }
  assert.ok(listo, "No inició la aplicación local a través de Caddy");
  await db.query("SELECT pg_advisory_lock($1)", [2026101902]);
  await db.query("SELECT pg_advisory_lock($1)", [2026102103]);
  const login = await api.post("/api/auth/sitio/sign-in/username", {
    headers: { origin: origen },
    data: { usuario: "ejemplo.01", clave: process.env.CLAVE_DEMO },
  });
  assert.equal(login.status(), 200, "Acceso de demostración a través de Caddy");
  const imagen = await readFile(new URL("../public/marca/foto-reunion.webp", import.meta.url));
  contenido = {
    bloque: "historia",
    texto: (await db.query("SELECT texto FROM contenido_institucional WHERE seccion='historia'")).rows[0]?.texto ?? "",
    imagenes: (
      await db.query(
        "SELECT url FROM imagen WHERE area='historia' AND industria_id IS NULL AND producto_sitio_id IS NULL AND noticia_id IS NULL ORDER BY posicion",
      )
    ).rows.map((r) => r.url),
  };
  assert.ok(contenido.imagenes.length < 5, "Se necesita un lugar libre en Historia para esta prueba local");
  industria = (await db.query("SELECT id,descripcion FROM industria ORDER BY orden LIMIT 1")).rows[0];
  industria.imagenes = (
    await db.query("SELECT url FROM imagen WHERE industria_id=$1 ORDER BY posicion", [industria.id])
  ).rows.map((r) => r.url);
  assert.ok(industria.imagenes.length < 5, "Se necesita un lugar libre en la primera industria");
  const producto = {
    nombre: "Producto de prueba JG-24 Caddy",
    descripcion: "Prueba local",
    presentacion: "",
    paisesOrigen: "",
    industrias: [],
    imagenes: [0],
  };
  for (const [ruta, datos] of [
    ["/api/imagenes/publicar", { ...contenido, imagenes: [...contenido.imagenes, 0] }],
    ["/panel/industrias/publicar", { ...industria, imagenes: [...industria.imagenes, 0] }],
    ["/panel/catalogo/publicar", producto],
  ]) {
    const rechazo = await publicar(ruta, datos, imagen, "http://localhost:3100");
    assert.equal(rechazo.status, 403, `${ruta}: rechazar origen interno`);
    const publicacion = await publicar(ruta, datos, imagen);
    assert.equal(publicacion.status, 200, `${ruta}: aceptar origen público`);
    assert.equal(publicacion.datos.ok, true);
    if (ruta === "/panel/catalogo/publicar") productoId = publicacion.datos.datos.id;
    resultado.push({ ruta, origenPublico: publicacion.status, origenInterno: rechazo.status });
  }
} finally {
  const errores = [];
  async function limpiar(operacion) {
    try {
      await operacion();
    } catch (error) {
      errores.push(error);
    }
  }
  try {
    if (contenido)
      await limpiar(async () =>
        assert.equal((await publicar("/api/imagenes/publicar", contenido)).status, 200, "Restaurar Historia"),
      );
    if (industria)
      await limpiar(async () =>
        assert.equal((await publicar("/panel/industrias/publicar", industria)).status, 200, "Restaurar industria"),
      );
    if (productoId) {
      await limpiar(async () => {
        const imagenes = (await db.query("SELECT url FROM imagen WHERE producto_sitio_id=$1", [productoId])).rows;
        const carpeta = resolve("almacenamiento-local/imagenes");
        for (const { url } of imagenes) {
          assert.ok(url.startsWith("/api/imagenes/"));
          const archivo = resolve(carpeta, url.slice("/api/imagenes/".length));
          assert.ok(archivo.startsWith(carpeta + sep));
          await limpiar(() => unlink(archivo));
        }
        await db.query("DELETE FROM imagen WHERE producto_sitio_id=$1", [productoId]);
        await db.query("DELETE FROM producto_sitio WHERE id=$1 AND nombre=$2", [
          productoId,
          "Producto de prueba JG-24 Caddy",
        ]);
      });
    }
  } finally {
    await api.dispose();
    await db.end();
    for (const hijo of hijos.reverse()) {
      if (hijo.exitCode !== null) continue;
      if (process.platform === "win32") {
        try {
          execFileSync("taskkill.exe", ["/PID", String(hijo.pid), "/T", "/F"], { stdio: "ignore" });
        } catch {
          /* Ya terminó. */
        }
      } else hijo.kill("SIGTERM");
    }
    for (const registro of registros) registro.end();
  }
  if (errores.length) throw new AggregateError(errores, "No se completó la restauración de los datos de prueba");
}
await writeFile(
  new URL("../plan/evidencias/JG-24/caddy.json", import.meta.url),
  JSON.stringify({ caddy: "2.11.7", aplicacion: "3100", origenPublico: origen, resultados: resultado }, null, 2) + "\n",
);
console.log(
  "H-05: las tres publicaciones multipart pasan a través de Caddy; origen interno rechazado y datos de prueba restaurados.",
);
