import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/sesion";
import { exigirAccesoPantalla, opcionesPermitidas } from "@/modulos/permisos/navegacion";
import { ErrorAcceso } from "@/modulos/permisos/servicio";
import { SinAcceso } from "@/componentes/comunes/armazon/SinAcceso";
import { listarPermisos, listarUsuarios } from "@/modulos/usuarios/servicio";
import { UsuariosSitioCliente } from "./UsuariosSitioCliente";
import "./usuarios.css";

export const metadata: Metadata = { title: "Usuarios del sitio" };

export default async function PaginaUsuariosSitio() {
  const sesion = await obtenerSesion("sitio");
  if (!sesion) redirect("/acceso");

  const destino = opcionesPermitidas(sesion)[0]?.href;
  try {
    exigirAccesoPantalla(sesion, "usuarios");
  } catch (error) {
    if (!(error instanceof ErrorAcceso)) throw error;
    return <SinAcceso destino={destino} texto="Solo Gerencia y Soporte administran los usuarios del sitio." />;
  }

  const [usuarios, permisos] = await Promise.all([listarUsuarios("sitio"), listarPermisos("sitio")]);

  return <UsuariosSitioCliente usuarios={usuarios} permisos={permisos} usuarioActualId={sesion.usuario.id} />;
}
