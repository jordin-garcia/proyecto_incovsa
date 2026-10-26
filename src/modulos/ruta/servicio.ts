import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ErrorNegocio } from "@/lib/errores";
import { ErrorAcceso, tienePermiso, esPiloto } from "@/modulos/permisos/servicio";
import { esAccesoTotal, normalizarRol } from "@/lib/roles";
import { formatoFecha } from "@/lib/fechas";
import { registrarBitacora } from "@/modulos/bitacora/servicio";
import type { SesionActual } from "@/lib/sesion";
import type { EntradaReordenarRecorrido, EntradaEntregarRuta } from "./esquemas";

export interface ContextoOperacionRuta {
  usuarioId: string;
  rol: string;
  sedeId: number;
}

export interface EntregaRutaItem {
  id: number;
  cliente: string;
  sector: string;
  totalKg: number;
  orden: number;
}

export interface RutaEnCursoItem {
  id: number;
  sedeId: number;
  tipo: string;
  numero: number;
  fechaEnvio: Date;
  programadoPara: Date | null;
  camion: { id: number; identificacion: string } | null;
  piloto: { id: string; name: string } | null;
  totalKg: number;
  clientesContador: number;
  entregas: EntregaRutaItem[];
}

export async function listarRutasEnRuta(sesion: SesionActual | null, sedeId: number): Promise<RutaEnCursoItem[]> {
  if (!sesion) throw new ErrorAcceso();

  const tienePropias = tienePermiso(sesion, "pk.ruta.propias");
  const tieneTodas = tienePermiso(sesion, "pk.ruta.todas");
  const accesoTotal = esAccesoTotal(sesion.usuario.rol);

  if (!tienePropias && !tieneTodas && !accesoTotal) {
    throw new ErrorAcceso();
  }

  if (!Number.isSafeInteger(sedeId) || sedeId < 1 || (!accesoTotal && !sesion.sedes.some((s) => s.id === sedeId))) {
    throw new ErrorAcceso();
  }

  const soloPropias = esPiloto(sesion) || (!tieneTodas && !accesoTotal);

  const rutas = await prisma.envio.findMany({
    where: {
      sedeId,
      tipo: "ruta",
      estado: { nombre: "En Ruta" },
      ...(soloPropias ? { pilotoId: sesion.usuario.id } : {}),
    },
    orderBy: [{ fechaEnvio: "desc" }, { numero: "desc" }],
    select: {
      id: true,
      sedeId: true,
      tipo: true,
      numero: true,
      fechaEnvio: true,
      programadoPara: true,
      camion: { select: { id: true, identificacion: true } },
      piloto: { select: { id: true, name: true } },
      entregas: {
        orderBy: { orden: "asc" },
        select: {
          id: true,
          cliente: true,
          sector: true,
          totalKg: true,
          orden: true,
        },
      },
    },
  });

  return rutas.map((r) => {
    const totalDecimal = r.entregas.reduce(
      (acum, e) => acum.plus(new Prisma.Decimal(e.totalKg)),
      new Prisma.Decimal(0),
    );

    return {
      ...r,
      totalKg: totalDecimal.toNumber(),
      clientesContador: r.entregas.length,
      entregas: r.entregas.map((e) => ({
        ...e,
        totalKg: new Prisma.Decimal(e.totalKg).toNumber(),
      })),
    };
  });
}

export async function reordenarRecorridoRuta(entrada: EntradaReordenarRecorrido, contexto: ContextoOperacionRuta) {
  const ruta = await prisma.envio.findFirst({
    where: {
      id: entrada.envioId,
      sedeId: contexto.sedeId,
      tipo: "ruta",
    },
    include: {
      estado: true,
      entregas: true,
    },
  });

  if (!ruta) {
    throw new ErrorAcceso();
  }

  if (normalizarRol(contexto.rol) === "piloto" && ruta.pilotoId !== contexto.usuarioId) {
    throw new ErrorAcceso();
  }

  if (ruta.estado.nombre !== "En Ruta") {
    throw new ErrorNegocio("La ruta no está en curso.");
  }

  if (ruta.entregas.length !== entrada.entregaIds.length) {
    throw new ErrorAcceso();
  }

  const idsExistentes = new Set(ruta.entregas.map((e) => e.id));
  for (const id of entrada.entregaIds) {
    if (!idsExistentes.has(id)) {
      throw new ErrorAcceso();
    }
  }

  // RN-28, RN-29: se guarda solo el orden actual, sin bitácora ni historial
  await prisma.$transaction(
    entrada.entregaIds.map((id, index) =>
      prisma.entregaRuta.update({
        where: { id },
        data: { orden: index + 1 },
      }),
    ),
  );

  return {
    envioId: entrada.envioId,
    orden: entrada.entregaIds,
  };
}

export async function entregarRuta(entrada: EntradaEntregarRuta, contexto: ContextoOperacionRuta) {
  return prisma.$transaction(async (tx) => {
    // Bloqueo exclusivo de fila (specs/16, decisión 41)
    const bloqueados = await tx.$queryRaw<{ id: number }[]>`
      SELECT id FROM envio WHERE id = ${entrada.envioId} AND sede_id = ${contexto.sedeId} FOR UPDATE
    `;

    if (!bloqueados || bloqueados.length === 0) {
      throw new ErrorAcceso();
    }

    const ruta = await tx.envio.findFirst({
      where: {
        id: entrada.envioId,
        sedeId: contexto.sedeId,
        tipo: "ruta",
      },
      include: {
        estado: true,
        sede: true,
      },
    });

    if (!ruta) {
      throw new ErrorAcceso();
    }

    if (normalizarRol(contexto.rol) === "piloto" && ruta.pilotoId !== contexto.usuarioId) {
      throw new ErrorAcceso();
    }

    if (ruta.estado.nombre !== "En Ruta") {
      throw new ErrorNegocio("La ruta no está en curso.");
    }

    const estadoEntregado = await tx.estadoEnvio.findUniqueOrThrow({
      where: { nombre: "Entregado" },
    });

    await tx.envio.update({
      where: { id: ruta.id },
      data: {
        estadoId: estadoEntregado.id,
      },
    });

    await tx.historialEstado.create({
      data: {
        envioId: ruta.id,
        estadoId: estadoEntregado.id,
        usuarioId: contexto.usuarioId,
      },
    });

    const fechaDia =
      ruta.fechaEnvio instanceof Date
        ? ruta.fechaEnvio.toISOString().slice(0, 10)
        : String(ruta.fechaEnvio).slice(0, 10);
    const detalleBitacora = `${ruta.sede.nombre} · Ruta ${ruta.numero} del ${formatoFecha(fechaDia)} entregada`;

    await registrarBitacora(tx, {
      sistema: "picking",
      operacion: "Cierre de ruta",
      entidad: "envio",
      registroId: String(ruta.id),
      usuarioId: contexto.usuarioId,
      detalle: detalleBitacora,
    });

    return {
      id: ruta.id,
      numero: ruta.numero,
      nuevoEstado: "Entregado",
    };
  });
}
