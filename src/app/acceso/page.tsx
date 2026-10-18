import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { AccesoPersonal } from "./AccesoPersonal";
import { consultarSistemas } from "./servicio";

export const metadata: Metadata = { title: "Acceso personal" };
export default async function PaginaAcceso() {
  const valor = process.env.URL_ODOO;
  // Una URL configurada nunca puede ejecutar código en el navegador.
  let urlOdoo: string | undefined;
  if (valor) {
    const url = new URL(valor);
    if (url.protocol === "https:") urlOdoo = url.href;
  }
  const usuario = (await cookies()).get("incovsa-acceso-usuario")?.value;
  const sistemas = usuario ? await consultarSistemas({ usuario }, await headers()) : null;
  return (
    <AccesoPersonal
      urlOdoo={urlOdoo}
      usuarioInicial={sistemas?.ok ? usuario : undefined}
      sistemasIniciales={sistemas?.ok ? sistemas.datos : undefined}
    />
  );
}
