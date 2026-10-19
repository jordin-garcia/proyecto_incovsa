import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/sesion";
import { exigirPermiso, ErrorAcceso } from "@/modulos/permisos/servicio";
import { obtenerSedeDeTrabajo } from "@/modulos/permisos/sede";
import { opcionesPermitidas } from "@/modulos/permisos/navegacion";
import { SinAcceso } from "@/componentes/comunes/armazon/SinAcceso";
import { listarEnviosEnPreparacion } from "@/modulos/bodega/servicio";
import { BodegaCliente } from "@/componentes/picking/bodega/BodegaCliente";
import "./bodega.css";

export const metadata: Metadata = {
  title: "Bodega · INCOVSA",
  description: "Módulo de bodega y tablero de preparación para control logístico de rutas y pedidos de INCOVSA.",
};

export default async function PaginaBodega() {
  const sesion = await obtenerSesion("picking");
  if (!sesion) redirect("/acceso");

  const destino = opcionesPermitidas(sesion)[0]?.href;
  const sede = await obtenerSedeDeTrabajo(sesion);

  try {
    exigirPermiso(sesion, "pk.bodega", sede?.id);
  } catch (error) {
    if (!(error instanceof ErrorAcceso)) throw error;
    return <SinAcceso destino={destino} texto="Sus permisos no incluyen Bodega. Los asignan Gerencia o Soporte." />;
  }

  if (!sede) {
    return (
      <SinAcceso
        destino={destino}
        texto="Su cuenta no tiene sedes asignadas. Gerencia o Soporte las asignan en Configuración."
      />
    );
  }

  const envios = await listarEnviosEnPreparacion(sede.id);

  // Mapear Decimales a tipos serializables para el componente cliente
  const enviosSerializables = envios.map((e) => ({
    ...e,
    lineas: e.lineas.map((l) => ({
      ...l,
      pesoConversionKg: Number(l.pesoConversionKg),
      cantidadKg: Number(l.cantidadKg),
    })),
  }));

  return <BodegaCliente sede={sede} enviosIniciales={enviosSerializables} />;
}
