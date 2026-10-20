import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/sesion";
import { ErrorAcceso } from "@/modulos/permisos/servicio";
import { opcionesPermitidas } from "@/modulos/permisos/navegacion";
import { leerContenidoPanel } from "@/modulos/contenido/servicio";
import { EditorContenido } from "@/componentes/panel/EditorContenido";
import { EncabezadoModulo } from "@/componentes/comunes/EncabezadoModulo";
import { SinAcceso } from "@/componentes/comunes/armazon/SinAcceso";

export default async function Contenido() {
  const sesion = await obtenerSesion("sitio");
  if (!sesion) redirect("/acceso");
  const datos = await leerContenidoPanel(sesion).catch((error: unknown) => {
    if (!(error instanceof ErrorAcceso)) throw error;
    return null;
  });
  if (datos) {
    return (
      <>
        <EncabezadoModulo
          eyebrow="Contenido institucional"
          titulo="Inicio y Quiénes somos"
          instruccion="Se publica en Inicio, en los encabezados de las páginas y en «Quiénes somos»."
        />
        <EditorContenido datos={datos} />
      </>
    );
  } else {
    return (
      <SinAcceso
        destino={opcionesPermitidas(sesion)[0]?.href}
        texto="Sus permisos no incluyen esta sección. Los asignan Gerencia o Soporte."
      />
    );
  }
}
