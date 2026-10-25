import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/sesion";
import { ErrorAcceso, tienePermiso } from "@/modulos/permisos/servicio";
import { opcionesPermitidas } from "@/modulos/permisos/navegacion";
import { SinAcceso } from "@/componentes/comunes/armazon/SinAcceso";
import { leerBandeja } from "@/modulos/solicitudes/bandeja";
import { BandejaSolicitudes } from "@/componentes/panel/BandejaSolicitudes";
export default async function SolicitudesPanel() {
  const sesion = await obtenerSesion("sitio");
  if (!sesion) redirect("/acceso");
  const datos = await leerBandeja(sesion).catch((error: unknown) => {
    if (!(error instanceof ErrorAcceso)) throw error;
    return null;
  });
  return datos ? (
    <BandejaSolicitudes {...datos} gestiona={tienePermiso(sesion, "sit.sol.gestionar")} />
  ) : (
    <SinAcceso
      destino={opcionesPermitidas(sesion)[0]?.href}
      texto="Sus permisos no incluyen esta sección. Los asignan Gerencia o Soporte."
    />
  );
}
