import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ErrorNegocio } from "@/lib/errores";
import { esAccesoTotal } from "@/lib/roles";
import { esquemaSistema } from "@/app/acceso/esquemas";
import { obtenerSesion, type SesionActual } from "@/lib/sesion";

const esquemaRegistro = z.object({
  sistema: esquemaSistema,
  operacion: z.string().min(1).max(80),
  entidad: z.string().max(40).nullable().optional(),
  registroId: z.string().max(40).nullable().optional(),
  usuarioId: z.string().nullable().optional(),
  usuarioEscrito: z.string().max(60).nullable().optional(),
  ip: z.string().max(45).nullable().optional(),
});
type Registro = z.input<typeof esquemaRegistro> & { detalle: Prisma.InputJsonValue };

/** Solo recibe un cliente transaccional; el llamador autentica y autoriza la operación de negocio. */
export async function registrarBitacora(tx: Prisma.TransactionClient, registro: Registro) {
  const { detalle, ...campos } = registro;
  return tx.bitacora.create({ data: { ...esquemaRegistro.parse(campos), detalle } });
}

// Hasta JG-07 este control local protege la única lectura nueva de bitácora. Allí se sustituirá por exigirPermiso.
export function exigirConsultaBitacora(sesion: SesionActual | null) {
  if (
    !sesion ||
    sesion.sistema !== "picking" ||
    (!esAccesoTotal(sesion.usuario.rol) && !sesion.permisos.includes("pk.reportes"))
  ) {
    throw new ErrorNegocio("No tiene permisos para acceder a este módulo.");
  }
}
export async function consultarBitacora(entrada: { desde: Date; hasta: Date }, cabeceras?: Headers) {
  exigirConsultaBitacora(await obtenerSesion("picking", cabeceras));
  const rango = z
    .object({ desde: z.date(), hasta: z.date() })
    .refine((r) => r.desde <= r.hasta)
    .parse(entrada);
  return prisma.bitacora.findMany({
    where: { creadoEn: { gte: rango.desde, lte: rango.hasta } },
    orderBy: [{ creadoEn: "desc" }, { id: "desc" }],
    select: {
      id: true,
      sistema: true,
      operacion: true,
      entidad: true,
      registroId: true,
      detalle: true,
      usuarioEscrito: true,
      ip: true,
      creadoEn: true,
      usuario: { select: { name: true } },
    },
  });
}
