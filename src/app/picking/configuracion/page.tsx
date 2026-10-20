import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/sesion";
import { esAccesoTotal } from "@/lib/roles";
import { exigirPermiso, ErrorAcceso, sedesDelUsuario } from "@/modulos/permisos/servicio";
import { opcionesPermitidas } from "@/modulos/permisos/navegacion";
import { SinAcceso } from "@/componentes/comunes/armazon/SinAcceso";
import { listarCamionesDeSedes } from "@/modulos/camiones/servicio";
import { listarPermisos, listarUsuariosDelPicking } from "@/modulos/usuarios/servicio";
import { ConfiguracionCliente } from "@/componentes/picking/configuracion/ConfiguracionCliente";
import "./configuracion.css";

export const metadata: Metadata = { title: "Configuración · INCOVSA" };

export default async function PaginaConfiguracion() {
  const sesion = await obtenerSesion("picking");
  if (!sesion) redirect("/acceso");

  const destino = opcionesPermitidas(sesion)[0]?.href;
  try {
    exigirPermiso(sesion, "pk.cfg.camiones");
  } catch (error) {
    if (!(error instanceof ErrorAcceso)) throw error;
    return (
      <SinAcceso destino={destino} texto="Sus permisos no incluyen Configuración. Los asignan Gerencia o Soporte." />
    );
  }

  const sedes = await sedesDelUsuario(sesion);
  if (sedes.length === 0) {
    return (
      <SinAcceso
        destino={destino}
        texto="Su cuenta no tiene sedes asignadas. Gerencia o Soporte las asignan en Configuración."
      />
    );
  }

  const mostrarUsuarios = esAccesoTotal(sesion.usuario.rol);
  const [camiones, usuarios, permisos] = await Promise.all([
    listarCamionesDeSedes(sedes.map((sede) => sede.id)),
    mostrarUsuarios ? listarUsuariosDelPicking() : Promise.resolve(null),
    mostrarUsuarios ? listarPermisos("picking") : Promise.resolve([]),
  ]);

  return (
    <ConfiguracionCliente
      camiones={camiones}
      sedes={sedes.map((sede) => ({ id: sede.id, nombre: sede.nombre }))}
      usuarios={usuarios}
      permisos={permisos}
      usuarioActualId={sesion.usuario.id}
    />
  );
}
