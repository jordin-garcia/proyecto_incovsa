import { defineConfig, devices } from "@playwright/test";

const URL_BASE = "http://localhost:3000";

// Navegador de la corrida (specs/16 decisión 46, JG-16). Sin NAVEGADOR se usa Chromium; la matriz de GitHub Actions
// (.github/workflows/matriz-navegadores.yml) corre también Firefox y WebKit. Los proyectos conservan el mismo nombre
// en los tres navegadores porque varias pruebas separan sus datos por proyecto: un navegador por corrida y por base.
const NAVEGADORES = {
  chromium: devices["Desktop Chrome"],
  firefox: devices["Desktop Firefox"],
  webkit: devices["Desktop Safari"],
} as const;
type Navegador = keyof typeof NAVEGADORES;

const navegador = (process.env.NAVEGADOR || "chromium") as Navegador;
if (!Object.hasOwn(NAVEGADORES, navegador)) {
  throw new Error(`NAVEGADOR debe ser chromium, firefox o webkit (se recibió «${process.env.NAVEGADOR}»).`);
}
const base = { ...NAVEGADORES[navegador], browserName: navegador };
// Firefox no admite isMobile; el teléfono y la tableta conservan la pantalla táctil en los tres navegadores.
const tactil = navegador === "firefox" ? { hasTouch: true } : { isMobile: true, hasTouch: true };

export default defineConfig({
  testDir: "./pruebas-e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  // El reporte JSON de la matriz lo usa para saber de qué navegador es cada resultado.
  metadata: { navegador },
  use: {
    baseURL: URL_BASE,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  // Tamaños de plan/convenciones.md §6. El viewport va después de `devices`, que también define uno.
  projects: [
    {
      name: "telefono",
      use: { ...base, viewport: { width: 390, height: 844 }, ...tactil },
    },
    {
      name: "tableta",
      use: { ...base, viewport: { width: 768, height: 1024 }, ...tactil },
    },
    {
      name: "escritorio",
      use: { ...base, viewport: { width: 1440, height: 900 } },
    },
    {
      // Solo el tablero de Bodega se prueba en televisor: sus pruebas se ubican en pruebas-e2e/**/tablero*.
      name: "tv",
      testMatch: /tablero.*\.spec\.ts$/,
      use: { ...base, viewport: { width: 1920, height: 1080 } },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: URL_BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
