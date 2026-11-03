import { esquemaSistema } from "@/app/acceso/esquemas";
import { iniciarSesion, cerrarSesion, ERROR_CREDENCIALES } from "@/app/acceso/servicio";
import { leerSesion } from "@/lib/sesion";
import { MENSAJE_ERROR_GENERAL, describirError } from "@/lib/errores";
import { registrarEnServidor } from "@/lib/registro";
import { esMismoOrigen } from "@/lib/origen";

type Contexto = { params: Promise<{ sistema: string; ruta: string[] }> };
const json = (datos: unknown, status = 200) =>
  Response.json(datos, { status, headers: { "cache-control": "no-store" } });

async function atender(peticion: Request, contexto: Contexto) {
  const { sistema: valor, ruta } = await contexto.params;
  const sistema = esquemaSistema.safeParse(valor);
  if (!sistema.success) return json(null, 404);
  const camino = ruta.join("/");
  if (!(
    (peticion.method === "GET" && camino === "get-session") ||
    (peticion.method === "POST" && ["sign-in/username", "sign-out"].includes(camino))
  ))
    return json(null, 404);
  const operacion = `auth.${camino}`;
  if (peticion.method === "POST" && !esMismoOrigen(peticion)) {
    // V16.3.3 (JG-26): un intento desde otro origen (CSRF) queda en el registro del servidor.
    registrarEnServidor("aviso", "autorizacion_rechazada", {
      motivo: "origen_ajeno",
      sistema: sistema.data,
      operacion,
    });
    return json(null, 403);
  }
  try {
    if (camino === "get-session") {
      // Solo información mínima; el token y el correo interno de Better Auth nunca salen de esta ruta.
      const { sesion, cabeceras } = await leerSesion(sistema.data, peticion.headers);
      const respuesta = json(sesion);
      for (const cookie of cabeceras.getSetCookie()) respuesta.headers.append("set-cookie", cookie);
      return respuesta;
    }
    if (camino === "sign-out") {
      const r = await cerrarSesion(sistema.data, peticion.headers);
      const respuesta = json({ ok: true });
      for (const cookie of r.headers.getSetCookie()) respuesta.headers.append("set-cookie", cookie);
      // V14.3.1 (JG-26): el navegador borra su caché de este sitio. No se borran las cookies: la sesión del otro
      // sistema sigue abierta (specs/03).
      respuesta.headers.set("Clear-Site-Data", '"cache"');
      return respuesta;
    }
    let datos: unknown;
    try {
      datos = await peticion.json();
    } catch {
      return json({ ok: false, error: ERROR_CREDENCIALES }, 400);
    }
    const r = await iniciarSesion(
      typeof datos === "object" && datos !== null ? { ...datos, sistema: sistema.data } : datos,
      peticion.headers,
    );
    if (!r.ok) return json(r, 401);
    const respuesta = json({ ok: true, destino: r.destino });
    for (const cookie of r.cabeceras.getSetCookie()) respuesta.headers.append("set-cookie", cookie);
    return respuesta;
  } catch (error) {
    // V16.3.4 (JG-26): se registra el tipo y la ubicación del error, nunca su mensaje ni las entradas de
    // autenticación, que pueden contener la contraseña.
    registrarEnServidor("error", "error_inesperado", { sistema: sistema.data, operacion, ...describirError(error) });
    return json({ ok: false, error: MENSAJE_ERROR_GENERAL }, 500);
  }
}

export const GET = atender;
export const POST = atender;
