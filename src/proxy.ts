import { NextResponse, type NextRequest } from "next/server";
import { leerSesion } from "@/lib/sesion";

/** Primera barrera y renovación. Cada operación vuelve a autorizar en su módulo. */
export async function proxy(peticion: NextRequest) {
  const sistema = peticion.nextUrl.pathname.startsWith("/panel") ? "sitio" : "picking";
  const nombre = `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}incovsa-${sistema}.session_token`;
  if (!peticion.cookies.get(nombre)?.value) return NextResponse.redirect(new URL("/acceso", peticion.url));
  const { sesion, cabeceras } = await leerSesion(sistema, peticion.headers);
  const respuesta = sesion ? NextResponse.next() : NextResponse.redirect(new URL("/acceso", peticion.url));
  for (const cookie of cabeceras.getSetCookie()) respuesta.headers.append("set-cookie", cookie);
  return respuesta;
}
export const config = { matcher: ["/panel/:path*", "/picking/:path*"] };
