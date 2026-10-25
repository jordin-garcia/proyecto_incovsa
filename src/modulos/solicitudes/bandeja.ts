import { prisma } from "@/lib/prisma";
import type { SesionActual } from "@/lib/sesion";
import { ErrorNegocio } from "@/lib/errores";
import { exigirPermiso } from "@/modulos/permisos/servicio";
import { registrarBitacora } from "@/modulos/bitacora/servicio";
import { esquemaAbrir, esquemaGestion } from "./esquemas-bandeja";

// La bandeja pertenece al sitio. La restricción por sedes de RN-17 corresponde al picking (specs/03).
export async function contarSolicitudesNuevas(sesion: SesionActual | null) {
  exigirPermiso(sesion, "sit.sol.ver");
  return prisma.solicitudContacto.count({ where: { leida: false } });
}
export async function leerBandeja(sesion: SesionActual | null) {
  exigirPermiso(sesion, "sit.sol.ver");
  const [solicitudes, responsables] = await Promise.all([
    prisma.solicitudContacto.findMany({
      orderBy: [{ creadoEn: "desc" }, { id: "desc" }],
      select: {
        id: true,
        folio: true,
        motivo: true,
        nombre: true,
        empresa: true,
        correo: true,
        telefonoCodigo: true,
        telefono: true,
        mensaje: true,
        leida: true,
        estado: true,
        responsableId: true,
        comentario: true,
        creadoEn: true,
        sede: { select: { nombre: true } },
        pais: { select: { nombre: true } },
        departamento: { select: { nombre: true } },
        municipio: { select: { nombre: true } },
        responsable: { select: { id: true, name: true, rol: true } },
      },
    }),
    prisma.usuario.findMany({
      where: { activo: true, eliminadoEn: null, sistema: { in: ["sitio", "ambos"] } },
      select: { id: true, name: true, rol: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    }),
  ]);
  return { solicitudes, responsables };
}
export async function abrirSolicitud(entrada: unknown, sesion: SesionActual | null) {
  exigirPermiso(sesion, "sit.sol.ver");
  const r = esquemaAbrir.safeParse(entrada);
  if (!r.success) throw new ErrorNegocio("Revise los datos del formulario.");
  const resultado = await prisma.solicitudContacto.updateMany({ where: { id: r.data.id }, data: { leida: true } });
  if (!resultado.count) throw new ErrorNegocio("No se encontró la solicitud.");
  return { id: r.data.id };
}
export async function gestionarSolicitud(entrada: unknown, sesion: SesionActual | null) {
  exigirPermiso(sesion, "sit.sol.gestionar");
  const r = esquemaGestion.safeParse(entrada);
  if (!r.success) throw new ErrorNegocio("Revise los datos del formulario.");
  const d = r.data;
  return prisma.$transaction(async (tx) => {
    const solicitud = await tx.solicitudContacto.findUnique({
      where: { id: d.id },
      select: { folio: true, estado: true },
    });
    if (!solicitud) throw new ErrorNegocio("No se encontró la solicitud.");
    if (d.tipo === "estado" && solicitud.estado === d.estado) return { id: d.id };
    if (
      d.tipo === "responsable" &&
      d.responsableId &&
      !(await tx.usuario.findFirst({
        where: { id: d.responsableId, activo: true, eliminadoEn: null, sistema: { in: ["sitio", "ambos"] } },
        select: { id: true },
      }))
    )
      throw new ErrorNegocio("Elija un usuario activo del sitio.");
    const datos =
      d.tipo === "estado"
        ? { estado: d.estado }
        : d.tipo === "responsable"
          ? { responsableId: d.responsableId }
          : { comentario: d.comentario || null };
    await tx.solicitudContacto.update({ where: { id: d.id }, data: datos });
    await registrarBitacora(tx, {
      sistema: "sitio",
      usuarioId: sesion.usuario.id,
      entidad: "solicitud",
      registroId: String(d.id),
      operacion:
        d.tipo === "estado"
          ? "Cambio de estado de solicitud"
          : d.tipo === "responsable"
            ? "Responsable de solicitud"
            : "Comentario de solicitud",
      detalle: { folio: solicitud.folio, ...datos },
    });
    return { id: d.id };
  });
}
