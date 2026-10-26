import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/sesion";
import { exigirPermiso, tienePermiso, esPiloto, ErrorAcceso } from "@/modulos/permisos/servicio";
import { obtenerSedeDeTrabajo } from "@/modulos/permisos/sede";
import { opcionesPermitidas } from "@/modulos/permisos/navegacion";
import { SinAcceso } from "@/componentes/comunes/armazon/SinAcceso";
import { listarRutasEnRuta } from "@/modulos/ruta/servicio";
import { RutaCliente } from "@/componentes/picking/ruta/RutaCliente";
import "./ruta.css";

export const metadata: Metadata = {
  title: "Ruta · INCOVSA",
  description: "Módulo de ruta y entrega de pedidos para pilotos del sistema logístico de INCOVSA.",
};

export default async function PaginaRuta() {
  const sesion = await obtenerSesion("picking");
  if (!sesion) redirect("/acceso");

  const destino = opcionesPermitidas(sesion)[0]?.href;
  const sede = await obtenerSedeDeTrabajo(sesion);

  try {
    const permiso = tienePermiso(sesion, "pk.ruta.todas") ? "pk.ruta.todas" : "pk.ruta.propias";
    exigirPermiso(sesion, permiso, sede?.id);
  } catch (error) {
    if (!(error instanceof ErrorAcceso)) throw error;
    return <SinAcceso destino={destino} texto="Sus permisos no incluyen Ruta. Los asignan Gerencia o Soporte." />;
  }

  if (!sede) {
    return (
      <SinAcceso
        destino={destino}
        texto="Su cuenta no tiene sedes asignadas. Gerencia o Soporte las asignan en Configuración."
      />
    );
  }

  const rutas = await listarRutasEnRuta(sesion, sede.id);
  const propias = esPiloto(sesion) || !tienePermiso(sesion, "pk.ruta.todas");

  return <RutaCliente rutasIniciales={rutas} propias={propias} sedeId={sede.id} />;
}
