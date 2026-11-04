import type { ReactNode } from "react";
import { ArmazonServidor } from "@/componentes/comunes/armazon/ArmazonServidor";
import { obtenerSesion } from "@/lib/sesion";
import { tienePermiso } from "@/modulos/permisos/servicio";
import { contarSolicitudesNuevas } from "@/modulos/solicitudes/bandeja";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const sesion = await obtenerSesion("sitio");
  const nuevas = tienePermiso(sesion, "sit.sol.ver") ? await contarSolicitudesNuevas(sesion) : 0;
  return (
    <ArmazonServidor sistema="sitio" contadores={{ "/panel/solicitudes": nuevas }}>
      {children}
    </ArmazonServidor>
  );
}
