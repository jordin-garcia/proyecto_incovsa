import { readFileSync } from "node:fs";
import { basename } from "node:path";

/**
 * Imagen WebP con su tipo explícito. El WebKit de Playwright en Linux y Windows no reconoce la extensión .webp y
 * entrega el archivo sin tipo, que CampoGaleria rechaza; Chromium, Firefox y Safari sí la reconocen (JG-16).
 */
export function imagenWebp(ruta: string) {
  return { name: basename(ruta), mimeType: "image/webp", buffer: readFileSync(ruta) };
}
