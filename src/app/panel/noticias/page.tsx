import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/sesion";
import { ErrorAcceso } from "@/modulos/permisos/servicio";
import { SinAcceso } from "@/componentes/comunes/armazon/SinAcceso";
import { leerNoticiasPanel } from "@/modulos/contenido/noticias";
import { EditorNoticias } from "@/componentes/panel/EditorNoticias";
import { opcionesPermitidas } from "@/modulos/permisos/navegacion";
export default async function NoticiasPanel() {
  const sesion = await obtenerSesion("sitio");
  if (!sesion) redirect("/acceso");
  const noticias = await leerNoticiasPanel(sesion).catch((error: unknown) => {
    if (!(error instanceof ErrorAcceso)) throw error;
    return null;
  });
  return noticias ? (
    <EditorNoticias noticias={noticias} />
  ) : (
    <SinAcceso
      destino={opcionesPermitidas(sesion)[0]?.href}
      texto="Sus permisos no incluyen esta sección. Los asignan Gerencia o Soporte."
    />
  );
}
