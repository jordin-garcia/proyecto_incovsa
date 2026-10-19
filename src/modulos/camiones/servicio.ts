import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { SesionActual } from "@/lib/sesion";
import { ErrorNegocio } from "@/lib/errores";
import { registrarBitacora } from "@/modulos/bitacora/servicio";
import { ErrorAcceso, exigirPermiso, sedesDelUsuario } from "@/modulos/permisos/servicio";
import { esquemaEliminarCamion, esquemaGuardarCamion } from "./esquemas";

export function formatoKg(valor: Prisma.Decimal | string, conUnidad = true) {
  const decimal = valor instanceof Prisma.Decimal ? valor : new Prisma.Decimal(valor);
  const [entero, fraccion] = decimal.toFixed(3).split(".");
  const decimales = (fraccion ?? "").replace(/0+$/, "");
  const texto = `${(entero ?? "0").replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${decimales ? `.${decimales}` : ""}`;
  return conUnidad ? `${texto} kg` : texto;
}

function leer<T>(
  esquema: {
    safeParse: (
      v: unknown,
    ) => { success: true; data: T } | { success: false; error: { issues: { message: string }[] } };
  },
  entrada: unknown,
): T {
  const resultado = esquema.safeParse(entrada);
  if (!resultado.success) throw new ErrorNegocio(resultado.error.issues[0]?.message ?? "Revise los datos.");
  return resultado.data;
}

async function sedesAutorizadas(sesion: SesionActual) {
  exigirPermiso(sesion, "pk.cfg.camiones");
  return sedesDelUsuario(sesion);
}

async function sedeAutorizada(sesion: SesionActual, sedeId: number) {
  exigirPermiso(sesion, "pk.cfg.camiones", sedeId);
  const sede = (await sedesDelUsuario(sesion)).find((s) => s.id === sedeId);
  if (!sede) throw new ErrorAcceso();
  return sede;
}

export async function camionesActivosDeSede(sedeId: number) {
  return prisma.camion.findMany({
    where: { sedeId, eliminadoEn: null },
    orderBy: { id: "asc" },
    select: { id: true, identificacion: true, capacidadKg: true },
  });
}

export type CamionLista = {
  id: number;
  identificacion: string;
  capacidad: string;
  capacidadEditable: string;
  sedeId: number;
  sede: string;
};

export async function listarCamiones(sesion: SesionActual): Promise<CamionLista[]> {
  const sedes = await sedesAutorizadas(sesion);
  const filas = await prisma.camion.findMany({
    where: { eliminadoEn: null, sedeId: { in: sedes.map((s) => s.id) } },
    include: { sede: { select: { nombre: true } } },
    orderBy: { id: "asc" },
  });
  return filas.map((c) => ({
    id: c.id,
    identificacion: c.identificacion,
    capacidad: formatoKg(c.capacidadKg),
    capacidadEditable: formatoKg(c.capacidadKg, false),
    sedeId: c.sedeId,
    sede: c.sede.nombre,
  }));
}

export async function guardarCamion(entrada: unknown, sesion: SesionActual) {
  const datos = leer(esquemaGuardarCamion, entrada);
  const sede = await sedeAutorizada(sesion, datos.sedeId);
  const permitidas = (await sedesDelUsuario(sesion)).map((s) => s.id);
  return prisma.$transaction(async (tx) => {
    const resumen = `${datos.identificacion} · ${formatoKg(datos.capacidad)} · ${sede.nombre}`;
    if (datos.id) {
      const actual = await tx.camion.findFirst({
        where: { id: datos.id, eliminadoEn: null, sedeId: { in: permitidas } },
      });
      if (!actual) throw new ErrorAcceso();
      await tx.camion.update({
        where: { id: actual.id },
        data: { identificacion: datos.identificacion, capacidadKg: datos.capacidad, sedeId: sede.id },
      });
      await registrarBitacora(tx, {
        sistema: "picking",
        operacion: "Edición de camión",
        entidad: "camion",
        registroId: String(actual.id),
        usuarioId: sesion.usuario.id,
        detalle: { resumen },
      });
      return { id: actual.id };
    }
    const creado = await tx.camion.create({
      data: { identificacion: datos.identificacion, capacidadKg: datos.capacidad, sedeId: sede.id },
    });
    await registrarBitacora(tx, {
      sistema: "picking",
      operacion: "Creación de camión",
      entidad: "camion",
      registroId: String(creado.id),
      usuarioId: sesion.usuario.id,
      detalle: { resumen },
    });
    return { id: creado.id };
  });
}

export async function eliminarCamion(entrada: unknown, sesion: SesionActual) {
  const datos = leer(esquemaEliminarCamion, entrada);
  const permitidas = (await sedesAutorizadas(sesion)).map((s) => s.id);
  return prisma.$transaction(async (tx) => {
    const actual = await tx.camion.findFirst({
      where: { id: datos.id, eliminadoEn: null, sedeId: { in: permitidas } },
    });
    if (!actual) throw new ErrorAcceso();
    await tx.camion.update({ where: { id: actual.id }, data: { eliminadoEn: new Date() } });
    await registrarBitacora(tx, {
      sistema: "picking",
      operacion: "Eliminación de camión",
      entidad: "camion",
      registroId: String(actual.id),
      usuarioId: sesion.usuario.id,
      detalle: { resumen: actual.identificacion },
    });
    return { id: actual.id };
  });
}
