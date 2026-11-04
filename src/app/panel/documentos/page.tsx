import { obtenerSesion } from "@/lib/sesion";
import { ErrorAcceso, tienePermiso } from "@/modulos/permisos/servicio";
import { SinAcceso } from "@/componentes/comunes/armazon/SinAcceso";
import { leerDocumentos } from "@/modulos/documentos/servicio";
import { Documentos } from "@/componentes/panel/Documentos";
export default async function DocumentosPanel() {
  const sesion = await obtenerSesion("sitio");
  const datos = await leerDocumentos(sesion).catch((error: unknown) => {
    if (!(error instanceof ErrorAcceso)) throw error;
    return null;
  });
  return datos ? (
    <Documentos
      {...datos}
      gestiona={tienePermiso(sesion, "sit.doc.gestionar")}
      ve={tienePermiso(sesion, "sit.doc.ver")}
      descarga={tienePermiso(sesion, "sit.doc.descargar")}
    />
  ) : (
    <SinAcceso texto="Sus permisos no incluyen esta sección. Los asignan Gerencia o Soporte." />
  );
}
