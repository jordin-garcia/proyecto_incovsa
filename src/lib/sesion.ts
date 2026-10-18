import { headers } from "next/headers";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "./prisma";
import { authSitio } from "./auth-sitio";
import { authPicking } from "./auth-picking";
import { esAccesoTotal } from "./roles";
import { esquemaSistema, type Sistema } from "@/app/acceso/esquemas";

export type SesionActual = {
  sistema: Sistema;
  usuario: { id: string; nombre: string; usuario: string; rol: string };
  permisos: string[];
  sedes: { id: number; nombre: string; prefijoOdoo: string }[];
};

/** Lee la sesión real en CADA petición; sin caché de cookie ni de permisos. No envía tokens al cliente. */
export async function obtenerSesion(sistema: Sistema, cabeceras?: Headers): Promise<SesionActual | null> {
  return (await leerSesion(sistema, cabeceras, false)).sesion;
}

/** Para rutas y el proxy de JG-07: reenviar Set-Cookie conserva la renovación también en el navegador. */
export async function leerSesion(
  sistema: Sistema,
  cabeceras?: Headers,
  renovar = true,
): Promise<{ sesion: SesionActual | null; cabeceras: Headers }> {
  esquemaSistema.parse(sistema);
  const auth = sistema === "sitio" ? authSitio() : authPicking();
  const { response: sesion, headers: respuesta } = await auth.api.getSession({
    headers: cabeceras ?? (await headers()),
    query: { disableRefresh: !renovar },
    returnHeaders: true,
  });
  const vacia = { sesion: null, cabeceras: respuesta };
  if (!sesion) return vacia;
  const u = await prisma.usuario.findUnique({
    where: { id: sesion.user.id },
    include: { permisos: { include: { permiso: true } }, sedes: { include: { sede: true } } },
  });
  if (!u?.activo || u.eliminadoEn || ![sistema, "ambos"].includes(u.sistema)) return vacia;
  const total = esAccesoTotal(u.rol);
  return {
    cabeceras: respuesta,
    sesion: {
      sistema,
      usuario: { id: u.id, nombre: u.name, usuario: u.displayUsername, rol: u.rol },
      permisos: total
        ? (await prisma.permiso.findMany({ where: { sistema }, select: { codigo: true } })).map((p) => p.codigo)
        : u.permisos.filter((p) => p.permiso.sistema === sistema).map((p) => p.permiso.codigo),
      sedes: (total ? await prisma.sede.findMany({ orderBy: { id: "asc" } }) : u.sedes.map((s) => s.sede)).map((s) => ({
        id: s.id,
        nombre: s.nombre,
        prefijoOdoo: s.prefijoOdoo,
      })),
    },
  };
}

/** Función interna: la operación que la llama debe verificar sus permisos (CE-03). */
export async function revocarSesiones(usuarioId: string, tx: Prisma.TransactionClient = prisma) {
  return tx.sesion.deleteMany({ where: { userId: z.string().min(1).parse(usuarioId) } });
}
