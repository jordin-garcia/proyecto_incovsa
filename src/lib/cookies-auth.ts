import { cookies } from "next/headers";
import { parseSetCookieHeader, toCookieOptions } from "better-auth/cookies";

/** Se llama DESPUÉS de confirmar la transacción. Nunca publica cookies de una sesión revertida. */
export async function aplicarCookiesAuth(cabeceras: Headers) {
  const almacen = await cookies();
  for (const [nombre, valor] of parseSetCookieHeader(cabeceras.get("set-cookie") ?? "")) {
    almacen.set(nombre, valor.value, toCookieOptions(valor));
  }
}
