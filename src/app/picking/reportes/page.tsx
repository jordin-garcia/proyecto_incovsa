import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/sesion";
import { obtenerSedeDeTrabajo } from "@/modulos/permisos/sede";
import { exigirPermiso } from "@/modulos/permisos/servicio";
import { SinAcceso } from "@/componentes/comunes/armazon/SinAcceso";
import { Reportes } from "@/componentes/picking/reportes/Reportes";
import { consultarDespacho, consultarRutas, consultarOperaciones, consultarAnios } from "@/modulos/reportes/servicio";
import { esquemaFiltro, resolverPeriodo } from "@/modulos/reportes/periodo";
import "./reportes.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reportes · INCOVSA" };
export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sesion = await obtenerSesion("picking");
  if (!sesion) redirect("/acceso");
  const sede = await obtenerSedeDeTrabajo(sesion);
  try {
    exigirPermiso(sesion, "pk.reportes", sede?.id);
  } catch {
    return <SinAcceso destino="/picking" texto="No tiene permisos para acceder a este módulo." />;
  }
  if (!sede)
    return (
      <SinAcceso
        destino="/picking"
        texto="Su cuenta no tiene sedes asignadas. Gerencia o Soporte las asignan en Configuración."
      />
    );
  const entrada = esquemaFiltro.safeParse(await searchParams);
  const periodo = resolverPeriodo(entrada.success ? entrada.data : {});
  const [despacho, rutas, operaciones, anios] = await Promise.all([
    consultarDespacho(sesion, sede.id, periodo.filtro),
    consultarRutas(sesion, sede.id, periodo.filtro),
    consultarOperaciones(sesion, sede.id, periodo.filtro),
    consultarAnios(sesion, sede.id),
  ]);
  const presentacion = {
    filtro: periodo.filtro,
    inicio: periodo.inicio,
    fin: periodo.fin,
    texto: periodo.texto,
    nombre: periodo.nombre,
  };
  return (
    <Reportes
      key={sede.id}
      sedeNombre={sede.nombre}
      periodo={presentacion}
      despacho={despacho}
      rutas={rutas}
      operaciones={operaciones}
      anios={anios}
    />
  );
}
