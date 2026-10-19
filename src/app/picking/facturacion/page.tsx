import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/sesion";
import { consultarOpciones } from "@/modulos/envios/opciones";
import { tienePermiso } from "@/modulos/permisos/servicio";
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
  const opciones = await consultarOpciones(sesion, sede.id);
  return (
    <FacturacionTablero
      key={sede.id}
      pedidos={pedidos}
      opciones={opciones}
      sedeId={sede.id}
      sedeNombre={sede.nombre}
      puedeVerBodega={tienePermiso(sesion, "pk.bodega")}
    />
  );
}
