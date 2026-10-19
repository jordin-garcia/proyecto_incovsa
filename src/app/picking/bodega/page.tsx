import type { Metadata } from "next";
import { obtenerSesion } from "@/lib/sesion";
import { exigirPermiso } from "@/modulos/permisos/servicio";
import { obtenerSedeDeTrabajo } from "@/modulos/permisos/sede";
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
  const sede = await obtenerSedeDeTrabajo(sesion);

  try {
    exigirPermiso(sesion, "pk.bodega", sede?.id);
  } catch {
    return <SinAcceso texto="No tiene permisos para acceder a Bodega." />;
  }

  if (!sede) {
    return <SinAcceso texto="No tiene una sede asignada para acceder a Bodega." />;
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
