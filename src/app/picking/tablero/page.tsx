import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/sesion";
import { exigirPermiso, ErrorAcceso } from "@/modulos/permisos/servicio";
import { obtenerSedeDeTrabajo } from "@/modulos/permisos/sede";
import { opcionesPermitidas } from "@/modulos/permisos/navegacion";
import { listarTableroBodega } from "@/modulos/bodega/tablero";
import { TableroCliente } from "@/componentes/picking/bodega/tablero/TableroCliente";
import "./tablero.css";

export const metadata: Metadata = {
  title: "Tablero de Bodega",
  description: "Tablero de preparación de Bodega en pantalla completa, para la TV o la tableta.",
};

/** Tablero en pantalla completa (specs/07, RF-SL-25): sin el armazón, con el permiso de Bodega y su sede de trabajo. */
export default async function PaginaTablero() {
  const sesion = await obtenerSesion("picking");
  if (!sesion) redirect("/acceso");
  const sede = await obtenerSedeDeTrabajo(sesion);
  try {
    exigirPermiso(sesion, "pk.bodega", sede?.id);
  } catch (error) {
    if (!(error instanceof ErrorAcceso)) throw error;
    sinAcceso();
  }
  // Como el prototipo: sin el permiso o sin sede, vuelve al módulo inicial de la cuenta.
  if (!sede) sinAcceso();

  function sinAcceso(): never {
    redirect(opcionesPermitidas(sesion!).find((o) => o.href !== "/picking/tablero")?.href ?? "/picking");
  }

  const envios = await listarTableroBodega(sede.id);
  return <TableroCliente sede={{ id: sede.id, nombre: sede.nombre }} enviosIniciales={envios} />;
}
