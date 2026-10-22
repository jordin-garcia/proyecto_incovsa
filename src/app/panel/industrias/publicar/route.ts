import { recibirGaleria } from "@/modulos/contenido/multipart-catalogo";
import { obtenerSesion } from "@/lib/sesion";
import { aResultadoDeError } from "@/lib/errores";
import { exigirPermiso, ErrorAcceso } from "@/modulos/permisos/servicio";
export async function POST(request: Request) {
  try {
    exigirPermiso(await obtenerSesion("sitio", request.headers), "sit.industrias");
    return await recibirGaleria(request, "industria");
  } catch (error) {
    return Response.json(aResultadoDeError(error), { status: error instanceof ErrorAcceso ? 403 : 400 });
  }
}
