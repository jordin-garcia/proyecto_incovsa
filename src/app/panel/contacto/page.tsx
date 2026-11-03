import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/sesion";
import { ErrorAcceso } from "@/modulos/permisos/servicio";
import { SinAcceso } from "@/componentes/comunes/armazon/SinAcceso";
import { leerContactoPanel } from "@/modulos/contenido/contacto";
import { EditorContacto } from "@/componentes/panel/EditorContacto";
import { opcionesPermitidas } from "@/modulos/permisos/navegacion";
export default async function ContactoPanel() {
  const sesion = await obtenerSesion("sitio");
  if (!sesion) redirect("/acceso");
  const sedes = await leerContactoPanel(sesion).catch((error: unknown) => {
    if (!(error instanceof ErrorAcceso)) throw error;
    return null;
  });
  return sedes ? (
    <EditorContacto sedes={sedes} />
  ) : (
    <SinAcceso
      destino={opcionesPermitidas(sesion)[0]?.href}
      texto="Sus permisos no incluyen esta sección. Los asignan Gerencia o Soporte."
    />
  );
}
