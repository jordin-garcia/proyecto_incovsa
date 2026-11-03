import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/sesion";
import { ErrorAcceso } from "@/modulos/permisos/servicio";
import { SinAcceso } from "@/componentes/comunes/armazon/SinAcceso";
import { leerCatalogoPanel } from "@/modulos/contenido/servicio-catalogo";
import { EditorCatalogo } from "@/componentes/panel/EditorCatalogo";
import { opcionesPermitidas } from "@/modulos/permisos/navegacion";
export default async function CatalogoPanel() {
  const sesion = await obtenerSesion("sitio");
  if (!sesion) redirect("/acceso");
  const datos = await leerCatalogoPanel(sesion).catch((error: unknown) => {
    if (!(error instanceof ErrorAcceso)) throw error;
    return null;
  });
  return datos ? (
    <EditorCatalogo datos={datos} />
  ) : (
    <SinAcceso
      destino={opcionesPermitidas(sesion)[0]?.href}
      texto="Sus permisos no incluyen esta sección. Los asignan Gerencia o Soporte."
    />
  );
}
