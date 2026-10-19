import { afterEach, expect, it } from "vitest";
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { guardarImagen, borrarImagen } from "./servicio";

const direcciones: string[] = [];
afterEach(async () => {
  await Promise.all(direcciones.splice(0).map(borrarImagen));
});

it("RNF-05: rechaza SVG, GIF, texto renombrado e imágenes mayores de 5 MB", async () => {
  for (const bytes of [
    Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
    Buffer.from("GIF89a"),
    Buffer.from("foto.jpg: esto es texto"),
    Buffer.alloc(5 * 1024 * 1024 + 1),
  ])
    await expect(guardarImagen(bytes)).rejects.toThrow();
});

it("RNF-05: recodifica JPG con GPS a WebP de hasta 2000 px sin metadatos", async () => {
  const foto = await sharp({ create: { width: 2400, height: 1200, channels: 3, background: "white" } })
    .withExif({ IFD0: { Artist: "Prueba" }, IFD3: { GPSLatitudeRef: "N", GPSLatitude: "14/1 0/1 0/1" } })
    .jpeg()
    .toBuffer();
  expect((await sharp(foto).metadata()).exif).toBeDefined();
  const direccion = await guardarImagen(foto);
  direcciones.push(direccion);
  const archivo = await readFile(`almacenamiento-local/imagenes/${direccion.split("/").at(-1)}`);
  const datos = await sharp(archivo).metadata();
  expect(datos.format).toBe("webp");
  expect(datos.width).toBe(2000);
  expect(datos.exif).toBeUndefined();
  expect(datos.xmp).toBeUndefined();
});

it("RNF-05: conserva transparencia y borra únicamente claves del almacenamiento", async () => {
  const foto = await sharp({
    create: { width: 10, height: 10, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .png()
    .toBuffer();
  const direccion = await guardarImagen(foto);
  direcciones.push(direccion);
  const archivo = `almacenamiento-local/imagenes/${direccion.split("/").at(-1)}`;
  expect((await sharp(await readFile(archivo)).metadata()).hasAlpha).toBe(true);
  await expect(borrarImagen("/api/imagenes/../../package.json")).rejects.toThrow();
  await borrarImagen("/marca/incovsa-quimicos.webp");
  await borrarImagen(direccion);
  await expect(readFile(archivo)).rejects.toThrow();
});
