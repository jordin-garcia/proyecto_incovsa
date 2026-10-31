import { obtenerSesion } from "@/lib/sesion";
import { exigirPermiso, ErrorAcceso, rechazarAcceso } from "@/modulos/permisos/servicio";
import { esMismoOrigen } from "@/lib/origen";
import { MAXIMO_BYTES } from "@/modulos/almacenamiento/servicio";
import { ErrorNegocio, aResultadoDeError } from "@/lib/errores";
import { publicarNoticia } from "./acciones-noticias";
export async function recibirNoticia(request: Request) {
  try {
    exigirPermiso(await obtenerSesion("sitio", request.headers), "sit.noticias");
    // V16.3.3 (JG-26): el rechazo por origen queda en el registro del servidor.
    if (!esMismoOrigen(request)) rechazarAcceso("origen_ajeno");
    const contenido = request.headers.get("content-type") ?? "";
    if (!contenido.startsWith("multipart/form-data;")) throw new ErrorNegocio("El contenido enviado no es válido.");
    const lector = request.body?.getReader();
    if (!lector) throw new ErrorNegocio("El contenido enviado no es válido.");
    const partes: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await lector.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAXIMO_BYTES * 5 + 65536) {
        await lector.cancel();
        throw new ErrorNegocio("Las imágenes exceden el tamaño permitido.");
      }
      partes.push(value);
    }
    const formulario = await new Response(Buffer.concat(partes), { headers: { "content-type": contenido } }).formData();
    const resultado = await publicarNoticia(formulario);
    return Response.json(resultado, { status: resultado.ok ? 200 : 400 });
  } catch (error) {
    return Response.json(aResultadoDeError(error), { status: error instanceof ErrorAcceso ? 403 : 400 });
  }
}
