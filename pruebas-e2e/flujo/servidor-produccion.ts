import { test as base } from "@playwright/test";
import { fork } from "node:child_process";
import { EventEmitter, once } from "node:events";
import { closeSync, cpSync, existsSync, openSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
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

export type EsperarPublicacion = (sede: number) => Promise<number>;
type Produccion = { url: string; avisos: EventEmitter };

export const test = base.extend<{ esperarPublicacion: EsperarPublicacion }, { produccion: Produccion }>({
  produccion: [
    async ({}, usar, informacion) => {
      await prepararActivos();
      const puerto = 3100 + informacion.workerIndex;
      const url = `http://localhost:${puerto}`;
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
        const limite = Date.now() + 20000;
        for (;;) {
          if (servidor.exitCode !== null) throw new Error("El servidor de producción terminó antes de iniciar.");
          const listo = await fetch(`${url}/acceso`, { signal: AbortSignal.timeout(1000) }).catch(() => null);
          if (listo?.ok) break;
          if (Date.now() >= limite) throw new Error("No inició el servidor de producción de JG-10.");
          await esperar(100);
        }
        await usar({ url, avisos });
      } finally {
        servidor.kill();
        await salida;
      }
    },
    { scope: "worker" },
  ],
  baseURL: async ({ produccion }, usar) => usar(produccion.url),
  esperarPublicacion: async ({ produccion }, usar) =>
    usar(async (sede) => {
      const [instante] = await once(produccion.avisos, `sede-${sede}`, { signal: AbortSignal.timeout(10000) });
      if (!Number.isFinite(instante)) throw new Error("No se recibió el instante real de publicación.");
      return instante as number;
    }),
});
