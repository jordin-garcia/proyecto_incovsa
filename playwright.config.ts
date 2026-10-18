import { defineConfig, devices } from "@playwright/test";

const URL_BASE = "http://localhost:3000";

export default defineConfig({
  testDir: "./pruebas-e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: URL_BASE,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  // Tamaños de plan/convenciones.md §6. El viewport va después de `devices`, que también define uno.
  projects: [
    {
      name: "telefono",
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
    {
      name: "tableta",
      use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 }, isMobile: true, hasTouch: true },
    },
    {
      name: "escritorio",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      // Solo el tablero de Bodega se prueba en televisor: sus pruebas se ubican en pruebas-e2e/**/tablero*.
      name: "tv",
      testMatch: /tablero.*\.spec\.ts$/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1920, height: 1080 } },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: URL_BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
