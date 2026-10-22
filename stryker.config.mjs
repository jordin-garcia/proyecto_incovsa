import { tmpdir } from "node:os";
import { join } from "node:path";

/** JG-11: el umbral definitivo se fija con la primera ejecución completa documentada. */
const configuracion = {
  tempDirName: join(tmpdir(), "incovsa-jg11-stryker"),
  testRunner: "vitest-incovsa",
  plugins: ["@stryker-mutator/vitest-runner", "./scripts/stryker-vitest.mjs"],
  vitest: { configFile: "vitest.mutacion.config.mts" },
  mutate: ["src/modulos/{conversion,permisos,envios,bodega}/**/*.ts", "!src/**/*.test.ts"],
  concurrency: 1, // Una sola base de pruebas real; los mutantes no deben competir entre sí.
  reporters: ["clear-text", "progress", "html", "json"],
  thresholds: { high: 80, low: 60, break: null },
  timeoutMS: 10000,
  timeoutFactor: 2,
  ignorePatterns: [
    ".next",
    ".stryker-tmp",
    ".cache-mutacion",
    "entregable-*",
    "plan",
    "public",
    "almacenamiento-local",
    "test-results",
    "playwright-report",
    ".env*",
    "!.env.example",
    "!src/generated/**",
  ],
};
export default configuracion;
