import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/sesion";
import { opcionesPermitidas } from "@/modulos/permisos/navegacion";
import { SinAcceso } from "./SinAcceso";
export async function EntradaSistema({ sistema }: { sistema: "sitio" | "picking" }) {
  const sesion = await obtenerSesion(sistema);
  if (!sesion) redirect("/acceso");
  const destino = opcionesPermitidas(sesion)[0]?.href;
  if (destino) redirect(destino);
  return <SinAcceso texto="Sus permisos no incluyen esta sección. Los asignan Gerencia o Soporte." />;
}
