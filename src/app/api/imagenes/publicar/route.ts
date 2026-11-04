import { obtenerSesion } from "@/lib/sesion";
import { exigirPermiso, ErrorAcceso, rechazarAcceso } from "@/modulos/permisos/servicio";
import { esMismoOrigen } from "@/lib/origen";
import { MAXIMO_BYTES } from "@/modulos/almacenamiento/servicio";
import { publicarContenido } from "@/modulos/contenido/acciones";
import { ErrorNegocio, aResultadoDeError } from "@/lib/errores";

// La ruta multipart permite imágenes de 5 MB sin cambiar el límite de las acciones de Odoo.
export async function POST(request: Request) {
  try {
    exigirPermiso(await obtenerSesion("sitio", request.headers), "sit.contenido");
    // V16.3.3 (JG-26): el rechazo por origen queda en el registro del servidor.
    if (!esMismoOrigen(request)) rechazarAcceso("origen_ajeno");
    const tipo = request.headers.get("content-type") ?? "";
    if (!tipo.startsWith("multipart/form-data;")) throw new ErrorNegocio("El contenido enviado no es válido.");
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
    const bytes = Buffer.concat(partes);
    const datos = await new Response(bytes, { headers: { "content-type": tipo } }).formData();
    const resultado = await publicarContenido(datos);
    return Response.json(resultado, { status: resultado.ok ? 200 : 400 });
  } catch (error) {
    return Response.json(aResultadoDeError(error), { status: error instanceof ErrorAcceso ? 403 : 400 });
  }
}
