import { test as base } from "@playwright/test";
import { fork, spawnSync } from "node:child_process";
import { EventEmitter, once } from "node:events";
import {
  closeSync,
  cpSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { request as pedirHttp } from "node:http";
import { createServer as crearServidorHttps, type Server } from "node:https";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { setTimeout as esperar } from "node:timers/promises";
import { pathToFileURL } from "node:url";

/** RNF-13 se mide con el artefacto desplegable, sin compilación ni instrumentación de desarrollo. */
async function prepararActivos() {
  const destino = resolve(".next/standalone");
  if (!existsSync(`${destino}/server.js`)) throw new Error("Ejecute npm run build antes de los E2E de JG-10.");
  const compilacion = readFileSync(".next/BUILD_ID", "utf8").trim();
  const listo = `${destino}/.activos-jg10-${compilacion}`;
  const bloqueo = `${listo}.lock`;
  const limite = Date.now() + 20000;
  // Los proyectos pueden iniciar a la vez: solo uno copia y los demás esperan los archivos completos.
  while (!existsSync(listo)) {
    let descriptor: number;
    try {
      descriptor = openSync(bloqueo, "wx");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      if (Date.now() >= limite) throw new Error("No terminó la preparación de activos de producción.");
      await esperar(50);
      continue;
    }
    try {
      if (existsSync(listo)) return;
      cpSync("public", `${destino}/public`, { recursive: true });
      cpSync(".next/static", `${destino}/.next/static`, { recursive: true });
      // El trazado standalone omite las DLL de sharp en Windows. Docker copia node_modules completo.
      if (process.platform === "win32") {
        const biblioteca = "node_modules/@img/sharp-win32-x64/lib";
        for (const archivo of readdirSync(biblioteca).filter((nombre) => nombre.endsWith(".dll"))) {
          cpSync(`${biblioteca}/${archivo}`, `${destino}/${biblioteca}/${archivo}`);
        }
      }
      writeFileSync(listo, "listo\n");
    } finally {
      closeSync(descriptor);
      unlinkSync(bloqueo);
    }
  }
}

// HTTPS de prueba para WebKit (JG-16, decisión de Jordin del 30/10). En producción, las cookies de sesión llevan
// Secure y el prefijo __Secure-, y el WebKit de Playwright no las guarda en http://localhost (Chromium y Firefox sí).
// Como Caddy en producción, un proxy HTTPS local con un certificado autofirmado de un día va delante del servidor.
// No cambia la aplicación. Necesita openssl, que traen Ubuntu (GitHub Actions), macOS y Git para Windows.
function certificadoDePrueba(carpeta: string) {
  mkdirSync(carpeta, { recursive: true });
  const clave = join(carpeta, "clave.pem");
  const certificado = join(carpeta, "certificado.pem");
  if (!existsSync(certificado)) {
    const resultado = spawnSync(
      "openssl",
      ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "1", "-keyout", clave, "-out", certificado].concat([
        "-subj",
        "/CN=localhost",
        "-addext",
        "subjectAltName=DNS:localhost",
      ]),
      { encoding: "utf8" },
    );
    if (resultado.status !== 0)
      throw new Error(
        `WebKit necesita openssl para el HTTPS de prueba: ${resultado.error?.message ?? resultado.stderr}`,
      );
  }
  return { key: readFileSync(clave), cert: readFileSync(certificado) };
}

async function proxyHttps(puerto: number, destino: number, tls: { key: Buffer; cert: Buffer }) {
  const servidor = crearServidorHttps(tls, (entrada, salida) => {
    const reenvio = pedirHttp(
      {
        host: "127.0.0.1",
        port: destino,
        method: entrada.method,
        path: entrada.url,
        headers: { ...entrada.headers, "x-forwarded-proto": "https" },
      },
      (respuesta) => {
        salida.writeHead(respuesta.statusCode ?? 502, respuesta.rawHeaders);
        respuesta.pipe(salida);
      },
    );
    reenvio.on("error", () => salida.destroy());
    // Al cerrarse la página, también se cierra la conexión de tiempo real con el servidor.
    salida.on("close", () => reenvio.destroy());
    entrada.pipe(reenvio);
  });
  await new Promise<void>((listo) => servidor.listen(puerto, "127.0.0.1", listo));
  return servidor;
}

export type EsperarPublicacion = (sede: number) => Promise<number>;
type Produccion = { url: string; avisos: EventEmitter };

export const test = base.extend<{ esperarPublicacion: EsperarPublicacion }, { produccion: Produccion }>({
  produccion: [
    async ({ browserName }, usar, informacion) => {
      await prepararActivos();
      const puerto = 3100 + informacion.workerIndex;
      const conHttps = browserName === "webkit";
      const puertoHttps = 3300 + informacion.workerIndex;
      const url = conHttps ? `https://localhost:${puertoHttps}` : `http://localhost:${puerto}`;
      const servidor = fork(resolve(".next/standalone/server.js"), [], {
        execArgv: ["--import", pathToFileURL(resolve("pruebas-e2e/flujo/observar-publicacion.mjs")).href],
        env: { ...process.env, PORT: String(puerto), HOSTNAME: "127.0.0.1", BETTER_AUTH_URL: url },
        windowsHide: true,
        stdio: ["ignore", "inherit", "inherit", "ipc"],
      });
      const avisos = new EventEmitter();
      servidor.on("message", (mensaje) => {
        const dato = mensaje as { tipo?: string; sede?: number; instante?: number };
        if (dato.tipo === "incovsa.tiempo-real.cambio") avisos.emit(`sede-${dato.sede}`, dato.instante);
      });
      const salida = once(servidor, "exit");
      try {
        // H-84 (auditoría del 26/10): el servidor escucha en 127.0.0.1 y en Windows `localhost` puede resolver
        // primero a ::1. La primera página en frío compila y conecta con la base: puede tardar más de 20 s.
        const limite = Date.now() + 90000;
        for (;;) {
          if (servidor.exitCode !== null) throw new Error("El servidor de producción terminó antes de iniciar.");
          const listo = await fetch(`http://127.0.0.1:${puerto}/acceso`, { signal: AbortSignal.timeout(10000) }).catch(
            () => null,
          );
          if (listo?.ok) break;
          if (Date.now() >= limite) throw new Error("No inició el servidor de producción de JG-10.");
          await esperar(100);
        }
        let proxy: Server | null = null;
        if (conHttps) {
          const tls = certificadoDePrueba(join(tmpdir(), `incovsa-e2e-tls-${informacion.workerIndex}`));
          proxy = await proxyHttps(puertoHttps, puerto, tls);
        }
        try {
          await usar({ url, avisos });
        } finally {
          proxy?.closeAllConnections();
          proxy?.close();
        }
      } finally {
        servidor.kill();
        await salida;
      }
    },
    // El arranque en frío tiene su propio límite, aparte del de cada prueba.
    { scope: "worker", timeout: 120000 },
  ],
  baseURL: async ({ produccion }, usar) => usar(produccion.url),
  // El certificado del HTTPS de prueba es autofirmado. Los contextos que una prueba crea aparte también lo indican.
  ignoreHTTPSErrors: true,
  esperarPublicacion: async ({ produccion }, usar) =>
    usar(async (sede) => {
      const [instante] = await once(produccion.avisos, `sede-${sede}`, { signal: AbortSignal.timeout(10000) });
      if (!Number.isFinite(instante)) throw new Error("No se recibió el instante real de publicación.");
      return instante as number;
    }),
});
