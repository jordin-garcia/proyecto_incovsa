import { notFound, redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/sesion";
import { obtenerSedeDeTrabajo } from "@/modulos/permisos/sede";
import {
  exigirAccesoPantalla,
  opcionesPermitidas,
  SECCIONES_PANEL,
  MODULOS_PICKING,
} from "@/modulos/permisos/navegacion";
import { ErrorAcceso } from "@/modulos/permisos/servicio";
import { SinAcceso } from "./SinAcceso";
import { esquemaRutaModulo } from "@/modulos/permisos/esquemas";

/** Solo conecta el armazón. Las tareas de módulos aportan las pantallas y sus operaciones. */
export async function PantallaModulo({ sistema, seccion }: { sistema: "sitio" | "picking"; seccion: string[] }) {
  const sesion = await obtenerSesion(sistema);
  if (!sesion) redirect("/acceso");
  const ruta = esquemaRutaModulo.safeParse(seccion);
  if (!ruta.success) notFound();
  const modulo = ruta.data[0]!;
  const opciones = sistema === "sitio" ? SECCIONES_PANEL : MODULOS_PICKING;
  const definicion = opciones.find((o) => o.href.split("/")[2] === modulo);
  if (!definicion) notFound();
  const destino = opcionesPermitidas(sesion)[0]?.href;
  const sede = sistema === "picking" ? await obtenerSedeDeTrabajo(sesion) : null;
  try {
    exigirAccesoPantalla(sesion, modulo, sede?.id);
  } catch (error) {
    if (!(error instanceof ErrorAcceso)) throw error;
    return (
      <SinAcceso
        destino={destino}
        texto={
          sistema === "picking"
            ? `Sus permisos no incluyen ${definicion.texto}. Los asignan Gerencia o Soporte.`
            : modulo === "usuarios"
              ? "Solo Gerencia y Soporte administran los usuarios del sitio."
              : "Sus permisos no incluyen esta sección. Los asignan Gerencia o Soporte."
        }
      />
    );
  }
  if (sistema === "picking" && ["facturacion", "bodega", "ruta", "reportes"].includes(modulo) && !sede)
    return (
      <SinAcceso
        destino={destino}
        texto="Su cuenta no tiene sedes asignadas. Gerencia o Soporte las asignan en Configuración."
      />
    );
  return <h1>{modulo === "resumen" ? `Hola, ${sesion.usuario.nombre}` : definicion.texto}</h1>;
}
