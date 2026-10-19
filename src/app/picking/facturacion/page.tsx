import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/sesion";
import { consultarTableroFacturacion } from "@/modulos/envios/servicio";
import { obtenerSedeDeTrabajo } from "@/modulos/permisos/sede";
import { exigirPermiso } from "@/modulos/permisos/servicio";
import { SinAcceso } from "@/componentes/comunes/armazon/SinAcceso";
import { FacturacionTablero } from "@/componentes/picking/facturacion/FacturacionTablero";

export const dynamic = "force-dynamic";

export default async function FacturacionPage() {
  const sesion = await obtenerSesion("picking");
  if (!sesion) redirect("/acceso");
  const sede = await obtenerSedeDeTrabajo(sesion);
  try {
    exigirPermiso(sesion, "pk.facturacion", sede?.id);
  } catch {
    return (
      <SinAcceso destino="/picking" texto="Sus permisos no incluyen Facturación. Los asignan Gerencia o Soporte." />
    );
  }
  if (!sede) {
    return (
      <SinAcceso
        destino="/picking"
        texto="Su cuenta no tiene sedes asignadas. Gerencia o Soporte las asignan en Configuración."
      />
    );
  }

  const pedidos = await consultarTableroFacturacion(sesion, sede.id);
  return <FacturacionTablero pedidos={pedidos} sedeId={sede.id} sedeNombre={sede.nombre} />;
}
