import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // El mismo alias de tsconfig.json
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    // Las pruebas scripts/*.test.mjs del plan y de la CI usan node:test: las ejecuta `node --test` (trabajo `plan`).
    include: ["src/**/*.test.ts", "scripts/**/*.test.ts"],
  },
});
