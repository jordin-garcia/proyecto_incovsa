import { NextResponse, type NextRequest } from "next/server";
import { leerSesion } from "@/lib/sesion";
import { crearCsp } from "@/lib/cabeceras";
import { cookieSesion } from "@/lib/cookies";

/** Primera barrera y renovación. Cada operación vuelve a autorizar en su módulo. */
export async function proxy(peticion: NextRequest) {
  // V11.5.1 (JG-26): 128 bits del generador criptográfico, no un UUID (que solo tiene 122 aleatorios).
  const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("base64");
  const csp = crearCsp({
    produccion: process.env.NODE_ENV === "production",
    urlImagenes: process.env.URL_IMAGENES,
    nonce,
  });
  const cabecerasPeticion = new Headers(peticion.headers);
  // Sobrescribir siempre los valores del cliente: Next aplica este nonce a sus scripts de hidratación.
  cabecerasPeticion.set("content-security-policy", csp);
  cabecerasPeticion.set("x-nonce", nonce);
  const continuar = () => NextResponse.next({ request: { headers: cabecerasPeticion } });
  const finalizar = (respuesta: NextResponse) => {
    respuesta.headers.set("Content-Security-Policy", csp);
    return respuesta;
  };
  if (!/^\/(panel|picking)(\/|$)/.test(peticion.nextUrl.pathname)) return finalizar(continuar());
  const sistema = peticion.nextUrl.pathname.startsWith("/panel") ? "sitio" : "picking";
  if (!peticion.cookies.get(cookieSesion(sistema))?.value)
    return finalizar(NextResponse.redirect(new URL("/acceso", peticion.url)));
  const { sesion, cabeceras } = await leerSesion(sistema, peticion.headers);
  const respuesta = sesion ? continuar() : NextResponse.redirect(new URL("/acceso", peticion.url));
  for (const cookie of cabeceras.getSetCookie()) respuesta.headers.append("set-cookie", cookie);
  return finalizar(respuesta);
}
export const config = { matcher: ["/((?!_next/static|_next/image).*)"] };
