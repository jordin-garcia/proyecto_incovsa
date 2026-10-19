import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/sesion";
import { esAccesoTotal } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { exigirPermiso, tienePermiso, sedesDelUsuario, ErrorAcceso } from "@/modulos/permisos/servicio";
import { opcionesPermitidas } from "@/modulos/permisos/navegacion";
import { SinAcceso } from "@/componentes/comunes/armazon/SinAcceso";
import { listarUsuarios } from "@/modulos/usuarios/servicio";
import { Configuracion } from "./Configuracion";

export const metadata: Metadata = { title: "Configuración · INCOVSA" };

function kilos(valor: { toFixed: (n: number) => string }) {
  const [entero, decimal] = valor.toFixed(3).split(".");
  const dec = (decimal ?? "").replace(/0+$/, "");
  return `${(entero ?? "0").replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${dec ? `.${dec}` : ""} kg`;
}

export default async function PaginaConfiguracion({ searchParams }: { searchParams: Promise<{ pestana?: string }> }) {
  const sesion = await obtenerSesion("picking");
  if (!sesion) redirect("/acceso");
  const puedeUsuarios = esAccesoTotal(sesion.usuario.rol);
  const puedeCamiones = tienePermiso(sesion, "pk.cfg.camiones");
  try {
    exigirPermiso(sesion, "pk.cfg.camiones");
  } catch (error) {
    if (!(error instanceof ErrorAcceso)) throw error;
    return (
      <SinAcceso
        destino={opcionesPermitidas(sesion)[0]?.href}
        texto="Sus permisos no incluyen Configuración. Los asignan Gerencia o Soporte."
      />
    );
  }
  const sedes = await sedesDelUsuario(sesion);
  const ids = sedes.map((s) => s.id);
  const camiones = puedeCamiones
    ? await prisma.camion.findMany({
        where: { eliminadoEn: null, sedeId: { in: ids } },
        include: { sede: true },
        orderBy: { id: "asc" },
      })
    : [];
  const usuarios = puedeUsuarios
    ? await listarUsuarios("picking", { id: sesion.usuario.id, rol: sesion.usuario.rol, sistema: "picking" })
    : [];
  const permisos = puedeUsuarios
    ? await prisma.permiso.findMany({ where: { sistema: "picking" }, orderBy: { id: "asc" } })
    : [];
  const grupos = [
    ...new Map(permisos.map((p) => [p.modulo, [] as { codigo: string; descripcion: string }[]])).entries(),
  ].map(([modulo]) => ({
    modulo,
    permisos: permisos
      .filter((p) => p.modulo === modulo)
      .map((p) => ({ codigo: p.codigo, descripcion: p.descripcion })),
  }));
  const { pestana } = await searchParams;

  return (
    <Configuracion
      puedeUsuarios={puedeUsuarios}
      puedeCamiones={puedeCamiones}
      pestanaInicial={pestana === "usuarios" && puedeUsuarios ? "usuarios" : "camiones"}
      actorId={sesion.usuario.id}
      usuarios={usuarios}
      grupos={grupos}
      sedes={sedes.map((s) => ({ id: s.id, nombre: s.nombre }))}
      camiones={camiones.map((c) => ({
        id: c.id,
        identificacion: c.identificacion,
        capacidad: kilos(c.capacidadKg),
        sede: c.sede.nombre,
      }))}
    />
  );
}
