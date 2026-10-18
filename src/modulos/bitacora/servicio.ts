import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { exigirPermiso } from "@/modulos/permisos/servicio";
import { esquemaSistema } from "@/app/acceso/esquemas";
import { obtenerSesion } from "@/lib/sesion";

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

export async function consultarBitacora(entrada: { desde: Date; hasta: Date }, cabeceras?: Headers) {
  exigirPermiso(await obtenerSesion("picking", cabeceras), "pk.reportes");
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
