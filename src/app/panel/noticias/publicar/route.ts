import { recibirNoticia } from "@/modulos/contenido/multipart-noticias";
import { obtenerSesion } from "@/lib/sesion";
import { aResultadoDeError } from "@/lib/errores";
import { exigirPermiso, ErrorAcceso } from "@/modulos/permisos/servicio";
export async function POST(request: Request) {
  try {
    exigirPermiso(await obtenerSesion("sitio", request.headers), "sit.noticias");
    return await recibirNoticia(request);
  } catch (error) {
    return Response.json(aResultadoDeError(error), { status: error instanceof ErrorAcceso ? 403 : 400 });
  }
}
