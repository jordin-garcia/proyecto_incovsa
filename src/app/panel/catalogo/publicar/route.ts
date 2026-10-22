import { recibirGaleria } from "@/modulos/contenido/multipart-catalogo";
export async function POST(request: Request) {
  return recibirGaleria(request, "producto");
}
