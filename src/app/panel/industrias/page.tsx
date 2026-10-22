import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/sesion";
import { ErrorAcceso } from "@/modulos/permisos/servicio";
import { SinAcceso } from "@/componentes/comunes/armazon/SinAcceso";
import { leerIndustriasPanel } from "@/modulos/contenido/servicio-catalogo";
import { EditorIndustrias } from "@/componentes/panel/EditorIndustrias";
export default async function IndustriasPanel() {
  const sesion = await obtenerSesion("sitio");
  if (!sesion) redirect("/acceso");
  const datos = await leerIndustriasPanel(sesion).catch((error: unknown) => {
    if (!(error instanceof ErrorAcceso)) throw error;
    return null;
  });
  return datos ? (
    <EditorIndustrias datos={datos} />
  ) : (
    <SinAcceso texto="Sus permisos no incluyen esta sección. Los asignan Gerencia o Soporte." />
  );
}
