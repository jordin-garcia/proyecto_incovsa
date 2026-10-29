import { prisma } from "@/lib/prisma";
import { type SesionActual } from "@/lib/sesion";
import { tienePermiso, ErrorAcceso, esPiloto } from "@/modulos/permisos/servicio";
import { normalizarRol, esAccesoTotal } from "@/lib/roles";
import { formatoFecha } from "@/lib/fechas";
import { ErrorNegocio } from "@/lib/errores";
import { registrarBitacora } from "@/modulos/bitacora/servicio";
import { Prisma } from "@/generated/prisma/client";
import { type EntradaReordenarRecorrido, type EntradaEntregarRuta } from "./esquemas";

export interface ContextoOperacionRuta {
  usuarioId: string;
  rol: string;
  sedeId: number;
  soloPropias?: boolean;
}

export type EntregaRutaItem = {
  id: number;
  cliente: string;
  sector: string;
  totalKg: string;
  orden: number;
};

export type RutaEnCursoItem = {
  id: number;
  sedeId: number;
  tipo: string;
  numero: number;
  fechaEnvio: Date | string;
  programadoPara: Date | string | null;
  camion: { id: number; identificacion: string } | null;
  piloto: { id: string; name: string } | null;
  entregas: EntregaRutaItem[];
  totalKg: string;
  clientesContador: number;
};

export function requiereSoloPropias(sesion: SesionActual): boolean {
  if (esPiloto(sesion)) {
    return true;
  }
  const accesoTotal = esAccesoTotal(sesion.usuario.rol);
  const tieneTodas = tienePermiso(sesion, "pk.ruta.todas");
  const puedeOperarTodas = tieneTodas || accesoTotal;
  return !puedeOperarTodas;
}

export async function listarRutasEnRuta(sesion: SesionActual | null, sedeId: number) {
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

  const soloPropias = requiereSoloPropias(sesion);

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
      totalKg: totalDecimal.toString(),
      clientesContador: r.entregas.length,
      entregas: r.entregas.map((e) => ({
        ...e,
        totalKg: new Prisma.Decimal(e.totalKg).toString(),
      })),
    };
  });
}

export async function reordenarRecorridoRuta(entrada: EntradaReordenarRecorrido, contexto: ContextoOperacionRuta) {
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
        entregas: true,
      },
    });

    if (!ruta) {
      throw new ErrorAcceso();
    }

    const debeSerPropia = contexto.soloPropias ?? normalizarRol(contexto.rol) === "piloto";
    if (debeSerPropia && ruta.pilotoId !== contexto.usuarioId) {
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
    await Promise.all(
      entrada.entregaIds.map((id, index) =>
        tx.entregaRuta.update({
          where: { id },
          data: { orden: index + 1 },
        }),
      ),
    );

    return {
      envioId: entrada.envioId,
      orden: entrada.entregaIds,
    };
  });
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

    const debeSerPropia = contexto.soloPropias ?? normalizarRol(contexto.rol) === "piloto";
    if (debeSerPropia && ruta.pilotoId !== contexto.usuarioId) {
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
