import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Node 24 lee el .env sin dependencias. En la CI las variables ya vienen del entorno.
try {
  process.loadEnvFile();
} catch {
  // Sin .env
}

export default defineConfig({
  resolve: {
    // El mismo alias de tsconfig.json
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    // Las pruebas scripts/*.test.mjs del plan y de la CI usan node:test: las ejecuta `node --test` (trabajo `plan`).
    include: ["src/**/*.test.ts", "scripts/**/*.test.ts", "prisma/**/*.test.ts"],
    // Aplica las migraciones a la base de pruebas y carga la semilla base (JG-03).
    globalSetup: ["pruebas/configuracion-vitest.ts"],
    // Las pruebas se conectan a DATABASE_URL_PRUEBAS, nunca a la base de desarrollo (plan/convenciones.md §6).
    env: {
      DATABASE_URL: process.env.DATABASE_URL_PRUEBAS ?? "",
      DATABASE_URL_PRUEBAS: process.env.DATABASE_URL_PRUEBAS ?? "",
    },
    // Todos los archivos comparten la base de pruebas: se ejecutan uno tras otro para que no se pisen.
    fileParallelism: false,
  },
});
