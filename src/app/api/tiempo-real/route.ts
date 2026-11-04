import { obtenerSesion } from "@/lib/sesion";
import { aResultadoDeError } from "@/lib/errores";
import { ErrorAcceso, exigirPermiso, permisoDelModulo } from "@/modulos/permisos/servicio";
import { esquemaSuscripcion } from "@/modulos/tiempo-real/esquemas";
import { crearFlujoDeCambios } from "@/modulos/tiempo-real/servidor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const datos = esquemaSuscripcion.parse(Object.fromEntries(new URL(request.url).searchParams));
    const autorizar = async () => {
      const sesion = await obtenerSesion("picking", request.headers);
      exigirPermiso(sesion, permisoDelModulo(sesion, datos.modulo), datos.sede);
      // Gerencia y Soporte también deben suscribirse a una sede existente, obtenida del servidor.
      if (!sesion.sedes.some((sede) => sede.id === datos.sede)) throw new ErrorAcceso();
    };
    await autorizar();
    return new Response(crearFlujoDeCambios(datos.sede, request.signal, autorizar), {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "private, no-store, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    return Response.json(aResultadoDeError(error), {
      status: error instanceof ErrorAcceso ? 403 : 400,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
}
