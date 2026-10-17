import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Al final: desactiva las reglas de estilo que se contradicen con Prettier.
  prettier,
  globalIgnores([
    // Los de eslint-config-next
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Documentación, prototipo y archivos generados o de terceros
    "entregable-*/**",
    "specs/**",
    "plan/**",
    "docs/**",
    "docs_incovsa/**",
    "research_notes/**",
    "vendor/**",
    "playwright-report/**",
    "test-results/**",
    "coverage/**",
  ]),
]);

export default eslintConfig;
