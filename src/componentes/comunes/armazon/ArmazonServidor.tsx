import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/sesion";
import { sedesDelUsuario } from "@/modulos/permisos/servicio";
import { obtenerSedeDeTrabajo } from "@/modulos/permisos/sede";
import { opcionesPermitidas, SECCIONES_PANEL, MODULOS_PICKING } from "@/modulos/permisos/navegacion";
import { esAccesoTotal } from "@/lib/roles";
import { ArmazonConSesion } from "./ArmazonConSesion";

export async function ArmazonServidor({ sistema, children }: { sistema: "sitio" | "picking"; children: ReactNode }) {
  const sesion = await obtenerSesion(sistema);
  if (!sesion) redirect("/acceso");
  const sedes = sistema === "picking" ? await sedesDelUsuario(sesion) : [];
  const sede = sistema === "picking" ? await obtenerSedeDeTrabajo(sesion) : null;
  return (
    <ArmazonConSesion
      sistema={sistema}
      opciones={opcionesPermitidas(sesion)}
      catalogo={
        sistema === "sitio"
          ? SECCIONES_PANEL.map(({ href, texto, icono }) => ({ href, texto, icono }))
          : MODULOS_PICKING
      }
      usuario={{
        nombre: sesion.usuario.nombre,
        rol: sesion.usuario.rol,
        sede:
          sistema === "sitio"
            ? "Sitio web"
            : esAccesoTotal(sesion.usuario.rol)
              ? "Todas las sedes"
              : sedes.map((s) => s.nombre).join(", ") || "Sin sede",
      }}
      sedes={sedes.map((s) => ({ id: String(s.id), nombre: s.nombre }))}
      sede={sede?.id ?? null}
    >
      {children}
    </ArmazonConSesion>
  );
}
