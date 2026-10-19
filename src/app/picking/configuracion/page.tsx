import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ConfiguracionCliente } from "@/componentes/picking/configuracion/ConfiguracionCliente";
import { SinAcceso } from "@/componentes/comunes/armazon/SinAcceso";
import { prisma } from "@/lib/prisma";
import { esAccesoTotal } from "@/lib/roles";
import { obtenerSesion } from "@/lib/sesion";
import { listarCamionesDeSedes } from "@/modulos/camiones/servicio";
import { opcionesPermitidas } from "@/modulos/permisos/navegacion";
import { ErrorAcceso, exigirPermiso, sedesDelUsuario } from "@/modulos/permisos/servicio";
import { listarUsuarios } from "@/modulos/usuarios/servicio";
import "./configuracion.css";

export const metadata: Metadata = { title: "Configuración · INCOVSA" };

export default async function PaginaConfiguracion({ searchParams }: { searchParams: Promise<{ pestana?: string }> }) {
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
  const camiones = await listarCamionesDeSedes(sedes.map((sede) => sede.id));
  const usuarios = mostrarUsuarios
    ? await listarUsuarios("picking", { id: sesion.usuario.id, rol: sesion.usuario.rol, sistema: "picking" })
    : [];
  const permisos = mostrarUsuarios
    ? await prisma.permiso.findMany({ where: { sistema: "picking" }, orderBy: { id: "asc" } })
    : [];
  const grupos = [...new Set(permisos.map((p) => p.modulo))].map((modulo) => ({
    modulo,
    permisos: permisos
      .filter((p) => p.modulo === modulo)
      .map((p) => ({ codigo: p.codigo, descripcion: p.descripcion })),
  }));
  const { pestana } = await searchParams;

  return (
    <ConfiguracionCliente
      camiones={camiones}
      sedes={sedes.map((sede) => ({ id: sede.id, nombre: sede.nombre }))}
      pestanaInicial={pestana === "usuarios" && mostrarUsuarios ? "usuarios" : "camiones"}
      usuarios={mostrarUsuarios ? { filas: usuarios, grupos, actorId: sesion.usuario.id } : null}
    />
  );
}
