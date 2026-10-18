import { esquemaSistema } from "@/app/acceso/esquemas";
import { iniciarSesion, cerrarSesion } from "@/app/acceso/servicio";
import { leerSesion } from "@/lib/sesion";
import { MENSAJE_ERROR_GENERAL } from "@/lib/errores";

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
  if (peticion.method === "POST") {
    const origen = peticion.headers.get("origin");
    const esperado = new URL(process.env.BETTER_AUTH_URL ?? peticion.url).origin;
    if (origen !== esperado) return json(null, 403);
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
      return respuesta;
    }
    let datos: unknown;
    try {
      datos = await peticion.json();
    } catch {
      return json({ ok: false, error: "Usuario o contraseña incorrectos" }, 400);
    }
    const r = await iniciarSesion(
      typeof datos === "object" && datos !== null ? { ...datos, sistema: sistema.data } : datos,
      peticion.headers,
    );
    if (!r.ok) return json(r, 401);
    const respuesta = json({ ok: true, destino: r.destino });
    for (const cookie of r.cabeceras.getSetCookie()) respuesta.headers.append("set-cookie", cookie);
    return respuesta;
  } catch {
    // Evitar que las entradas de autenticación o los objetos del adaptador terminen en los registros.
    return json({ ok: false, error: MENSAJE_ERROR_GENERAL }, 500);
  }
}

export const GET = atender;
export const POST = atender;
