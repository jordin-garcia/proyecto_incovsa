import { mkdir, unlink, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { Page } from "@playwright/test";

/** D-08: la evidencia versionada solo se escribe con EVIDENCIA=1. */
export function evidenciaPedida() {
  return process.env.EVIDENCIA === "1";
}

async function reemplazar(ruta: string) {
  await mkdir(dirname(ruta), { recursive: true });
  await unlink(ruta).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  });
}

export async function capturaEvidencia(
  page: Page,
  ruta: string,
  opciones: { fullPage?: boolean; animations?: "allow" | "disabled" } = {},
) {
  if (!evidenciaPedida()) return;
  const imagen = await page.screenshot({ fullPage: opciones.fullPage ?? true, animations: opciones.animations });
  await reemplazar(ruta);
  await writeFile(ruta, imagen);
}

export async function archivoEvidencia(ruta: string, contenido: string | Uint8Array) {
  if (!evidenciaPedida()) return;
  await reemplazar(ruta);
  await writeFile(ruta, contenido);
}
