import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SinAcceso } from "@/componentes/comunes/armazon/SinAcceso";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/sesion";
import { esAccesoTotal } from "@/lib/roles";
import { listarCamiones } from "@/modulos/camiones/servicio";
import { ErrorAcceso, exigirPermiso, sedesDelUsuario } from "@/modulos/permisos/servicio";
import { opcionesPermitidas } from "@/modulos/permisos/navegacion";
import { Configuracion } from "./Configuracion";

export const metadata: Metadata = { title: "Configuración · INCOVSA" };

export default async function PaginaConfiguracion({ searchParams }: { searchParams: Promise<{ pestana?: string }> }) {
  const sesion = await obtenerSesion("picking");
  if (!sesion) redirect("/acceso");
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
  const puedeUsuarios = esAccesoTotal(sesion.usuario.rol);
  const sedes = await sedesDelUsuario(sesion);
  const camiones = await listarCamiones(sesion);
  const totalUsuarios = puedeUsuarios
    ? await prisma.usuario.count({ where: { eliminadoEn: null, sistema: { in: ["picking", "ambos"] } } })
    : 0;
  const { pestana } = await searchParams;

  return (
    <Configuracion
      puedeUsuarios={puedeUsuarios}
      pestanaInicial={pestana === "usuarios" && puedeUsuarios ? "usuarios" : "camiones"}
      totalUsuarios={totalUsuarios}
      sedes={sedes.map((s) => ({ id: s.id, nombre: s.nombre }))}
      camiones={camiones}
    />
  );
}
