import { defineConfig } from "vitest/config";
import configuracion from "./vitest.config.mjs";

// Se conservan base real, migraciones y semilla; solo se acota la suite a los módulos de la decisión 66.
export default defineConfig({
  ...configuracion,
  cacheDir: ".cache-mutacion/vite",
  test: {
    ...configuracion.test,
    // Los módulos instrumentados cambian de activación en cada mutante. El caché persistente de Vitest 5
    // comparte node_modules con Next y no debe reutilizar esos módulos ni invalidar el servidor de desarrollo.
    fsModuleCache: false,
    include: ["src/modulos/{conversion,permisos,envios,bodega}/**/*.test.ts"],
  },
});
