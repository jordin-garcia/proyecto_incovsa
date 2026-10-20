import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import { z } from "zod";
import { ErrorNegocio } from "@/lib/errores";

export const MAXIMO_BYTES = 5 * 1024 * 1024;
const esquemaBytes = z.instanceof(Uint8Array).refine((b) => b.byteLength > 0 && b.byteLength <= MAXIMO_BYTES);
const esquemaClave = z
  .string()
  .regex(/^(?:demo\/\d{2}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\.webp$/);
const carpeta = join(process.cwd(), "almacenamiento-local", "imagenes");

function configuracion() {
  const modo = z.enum(["disco", "r2"]).parse(process.env.ALMACENAMIENTO ?? "disco");
  if (modo === "disco" && process.env.NODE_ENV === "production")
    throw new Error("El almacenamiento local no está disponible en producción.");
  return modo;
}
function r2() {
  const datos = z
    .object({
      R2_CUENTA: z.string().regex(/^[a-f0-9]{32}$/),
      R2_LLAVE: z.string().min(1),
      R2_SECRETO: z.string().min(1),
      R2_BUCKET_IMAGENES: z.string().min(1),
      URL_IMAGENES: z.url(),
    })
    .parse(process.env);
  return {
    cliente: new S3Client({
      region: "auto",
      endpoint: `https://${datos.R2_CUENTA}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: datos.R2_LLAVE, secretAccessKey: datos.R2_SECRETO },
    }),
    bucket: datos.R2_BUCKET_IMAGENES,
    base: datos.URL_IMAGENES.replace(/\/$/, ""),
  };
}

/** Interna: el módulo que publica la imagen debe autorizar primero al usuario. */
export async function guardarImagen(entrada: Uint8Array): Promise<string> {
  const validacion = esquemaBytes.safeParse(entrada);
  if (!validacion.success) throw new ErrorNegocio("La imagen debe pesar hasta 5 MB.");
  let salida: Buffer;
  try {
    const tipo = await fileTypeFromBuffer(validacion.data);
    if (!tipo || !["image/jpeg", "image/png", "image/webp"].includes(tipo.mime)) throw new Error("Formato inválido");
    salida = await sharp(validacion.data, { limitInputPixels: 40000000 })
      .autoOrient()
      .resize({ width: 2000, withoutEnlargement: true })
      .webp()
      .toBuffer();
  } catch {
    throw new ErrorNegocio("Seleccione una imagen JPG, PNG o WebP válida.");
  }
  const clave = `${randomUUID()}.webp`;
  if (configuracion() === "disco") {
    await mkdir(carpeta, { recursive: true });
    await writeFile(join(carpeta, clave), salida, { flag: "wx" });
    return `/api/imagenes/${clave}`;
  }
  const { cliente, bucket, base } = r2();
  await cliente.send(new PutObjectCommand({ Bucket: bucket, Key: clave, Body: salida, ContentType: "image/webp" }));
  return `${base}/${clave}`;
}

/** Nunca borra las imágenes originales recibidas de la empresa. */
export async function borrarImagen(direccion: string): Promise<void> {
  const url = z.string().parse(direccion);
  if (url.startsWith("/marca/")) return;
  const modo = configuracion();
  const remoto = modo === "r2" ? r2() : null;
  const prefijo = remoto ? `${remoto.base}/` : "/api/imagenes/";
  if (!url.startsWith(prefijo)) throw new ErrorNegocio("La dirección de imagen no es válida.");
  const clave = esquemaClave.parse(url.slice(prefijo.length));
  if (remoto) {
    await remoto.cliente.send(new DeleteObjectCommand({ Bucket: remoto.bucket, Key: clave }));
  } else {
    await unlink(join(carpeta, clave)).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
    });
  }
}

export async function leerImagenLocal(entrada: unknown) {
  if (process.env.NODE_ENV === "production" || configuracion() !== "disco") return null;
  const clave = esquemaClave.safeParse(entrada);
  if (!clave.success) return null;
  try {
    return await readFile(join(carpeta, clave.data));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
