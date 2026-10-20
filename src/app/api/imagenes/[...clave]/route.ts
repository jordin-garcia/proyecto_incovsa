import { leerImagenLocal } from "@/modulos/almacenamiento/servicio";

// Son imágenes públicas; esta ruta de disco nunca sirve archivos en producción.
export async function GET(_request: Request, { params }: { params: Promise<{ clave: string[] }> }) {
  if (process.env.NODE_ENV === "production") return new Response(null, { status: 404 });
  const bytes = await leerImagenLocal((await params).clave.join("/"));
  return bytes
    ? new Response(new Uint8Array(bytes), {
        headers: {
          "Content-Type": "image/webp",
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      })
    : new Response(null, { status: 404 });
}
