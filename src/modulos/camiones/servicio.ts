import { Prisma } from "@/generated/prisma/client";
import { formatoKg } from "@/componentes/comunes/formato";
import { prisma } from "@/lib/prisma";
import { ErrorAcceso } from "@/modulos/permisos/servicio";
import { registrarBitacora } from "@/modulos/bitacora/servicio";
import type { EntradaCamion, EntradaEditarCamion, EntradaEliminarCamion } from "./esquemas";

export type ContextoCamion = {
  usuarioId: string;
  sedesIds: readonly number[];
};

export type CamionActivo = {
  id: number;
  identificacion: string;
  capacidadKg: string;
  sedeId: number;
};

export type CamionDeLista = CamionActivo & { sedeNombre: string };

const seleccion = { id: true, identificacion: true, capacidadKg: true, sedeId: true } as const;

function presentar(camion: {
  id: number;
  identificacion: string;
  capacidadKg: Prisma.Decimal;
  sedeId: number;
}): CamionActivo {
  return {
    id: camion.id,
    identificacion: camion.identificacion,
    capacidadKg: camion.capacidadKg.toFixed(3),
    sedeId: camion.sedeId,
  };
}

function exigirSede(contexto: ContextoCamion, sedeId: number) {
  if (!contexto.sedesIds.includes(sedeId)) throw new ErrorAcceso();
}

function detalleCamion(identificacion: string, capacidadKg: string, sedeNombre: string, resumen: string) {
  return { identificacion, capacidadKg, sede: sedeNombre, resumen };
}

async function nombreDeSede(tx: Prisma.TransactionClient, sedeId: number) {
  const sede = await tx.sede.findUnique({ where: { id: sedeId }, select: { nombre: true } });
  if (!sede) throw new ErrorAcceso();
  return sede.nombre;
}

/** Camiones activos de una sede. Quien llama ya autorizó esa sede (Facturación, JC-04). */
export async function camionesActivosDeSede(sedeId: number): Promise<CamionActivo[]> {
  const camiones = await prisma.camion.findMany({
    where: { sedeId, eliminadoEn: null },
    orderBy: { id: "asc" },
    select: seleccion,
  });
  return camiones.map(presentar);
}

export async function listarCamionesDeSedes(sedesIds: readonly number[]): Promise<CamionDeLista[]> {
  if (sedesIds.length === 0) return [];
  const camiones = await prisma.camion.findMany({
    where: { eliminadoEn: null, sedeId: { in: [...sedesIds] } },
    orderBy: [{ sedeId: "asc" }, { id: "asc" }],
    select: { ...seleccion, sede: { select: { nombre: true } } },
  });
  return camiones.map((camion) => ({ ...presentar(camion), sedeNombre: camion.sede.nombre }));
}

export async function contarUsuariosDelPicking(): Promise<number> {
  return prisma.usuario.count({
    where: { eliminadoEn: null, sistema: { in: ["picking", "ambos"] } },
  });
}

export async function crearCamion(entrada: EntradaCamion, contexto: ContextoCamion): Promise<CamionActivo> {
  exigirSede(contexto, entrada.sedeId);
  return prisma.$transaction(async (tx) => {
    const sedeNombre = await nombreDeSede(tx, entrada.sedeId);
    const camion = await tx.camion.create({
      data: {
        identificacion: entrada.identificacion,
        capacidadKg: entrada.capacidadKg,
        sedeId: entrada.sedeId,
      },
      select: seleccion,
    });
    const presentado = presentar(camion);
    await registrarBitacora(tx, {
      sistema: "picking",
      operacion: "Creación de camión",
      entidad: "camion",
      registroId: String(camion.id),
      usuarioId: contexto.usuarioId,
      detalle: detalleCamion(
        presentado.identificacion,
        presentado.capacidadKg,
        sedeNombre,
        `${presentado.identificacion} · ${formatoKg(presentado.capacidadKg)} · ${sedeNombre}`,
      ),
    });
    return presentado;
  });
}

export async function editarCamion(
  entrada: EntradaEditarCamion,
  contexto: ContextoCamion,
): Promise<CamionActivo & { sedeAnteriorId: number }> {
  exigirSede(contexto, entrada.sedeId);
  return prisma.$transaction(async (tx) => {
    const actual = await tx.camion.findFirst({
      where: { id: entrada.id, eliminadoEn: null, sedeId: { in: [...contexto.sedesIds] } },
      select: { id: true, sedeId: true },
    });
    if (!actual) throw new ErrorAcceso();
    const sedeNombre = await nombreDeSede(tx, entrada.sedeId);
    const cambio = await tx.camion.updateMany({
      where: { id: actual.id, eliminadoEn: null, sedeId: { in: [...contexto.sedesIds] } },
      data: {
        identificacion: entrada.identificacion,
        capacidadKg: entrada.capacidadKg,
        sedeId: entrada.sedeId,
      },
    });
    if (cambio.count !== 1) throw new ErrorAcceso();
    const camion = await tx.camion.findFirstOrThrow({ where: { id: actual.id }, select: seleccion });
    const presentado = presentar(camion);
    await registrarBitacora(tx, {
      sistema: "picking",
      operacion: "Edición de camión",
      entidad: "camion",
      registroId: String(camion.id),
      usuarioId: contexto.usuarioId,
      detalle: detalleCamion(
        presentado.identificacion,
        presentado.capacidadKg,
        sedeNombre,
        `${presentado.identificacion} · ${formatoKg(presentado.capacidadKg)} · ${sedeNombre}`,
      ),
    });
    return { ...presentado, sedeAnteriorId: actual.sedeId };
  });
}

export async function eliminarCamion(
  entrada: EntradaEliminarCamion,
  contexto: ContextoCamion,
): Promise<{ id: number; sedeId: number }> {
  return prisma.$transaction(async (tx) => {
    const actual = await tx.camion.findFirst({
      where: { id: entrada.id, eliminadoEn: null, sedeId: { in: [...contexto.sedesIds] } },
      select: { id: true, identificacion: true, capacidadKg: true, sedeId: true, sede: { select: { nombre: true } } },
    });
    if (!actual) throw new ErrorAcceso();
    const cambio = await tx.camion.updateMany({
      where: { id: actual.id, eliminadoEn: null, sedeId: actual.sedeId },
      data: { eliminadoEn: new Date() },
    });
    if (cambio.count !== 1) throw new ErrorAcceso();
    const presentado = presentar(actual);
    await registrarBitacora(tx, {
      sistema: "picking",
      operacion: "Eliminación de camión",
      entidad: "camion",
      registroId: String(actual.id),
      usuarioId: contexto.usuarioId,
      detalle: detalleCamion(
        presentado.identificacion,
        presentado.capacidadKg,
        actual.sede.nombre,
        presentado.identificacion,
      ),
    });
    return { id: actual.id, sedeId: actual.sedeId };
  });
}
