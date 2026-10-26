import { Prisma } from "@/generated/prisma/client";
import { claveCliente } from "@/modulos/envios/cliente";
import { prisma } from "@/lib/prisma";
import { ErrorNegocio } from "@/lib/errores";
import { ErrorAcceso } from "@/modulos/permisos/servicio";
import { formatoFecha } from "@/lib/fechas";
import { registrarBitacora } from "@/modulos/bitacora/servicio";
import type {
  EntradaMarcarLinea,
  EntradaMarcarTodo,
  EntradaOrdenarPorPeso,
  EntradaDespachar,
  EntradaReordenarCola,
  EntradaReordenarLineas,
} from "./esquemas";

export interface ContextoOperacion {
  usuarioId: string;
  sedeId: number;
}

function esTipoRuta(tipo: string): boolean {
  return tipo === "ruta";
}

function etiquetaEnvio(tipo: string, numero: number): string {
  return (esTipoRuta(tipo) ? "Ruta " : "Pedido ") + numero;
}

const EN_PREPARACION = "En Preparación";
const MENSAJE_FUERA_DE_PREPARACION = "El pedido ya no está en preparación.";

/**
 * Comprueba que el envío es de la sede de trabajo y sigue En Preparación. Otra sede o un envío inexistente se
 * rechazan como sin permiso, sin revelar nada (RN-17); uno de la sede que otra pantalla ya despachó da un error de
 * negocio con un mensaje claro (auditoría del 22/10, H-22).
 */
async function exigirEnvioEnPreparacion(envioId: number, sedeId: number) {
  const envio = await prisma.envio.findFirst({
    where: { id: envioId, sedeId },
    select: { id: true, estado: { select: { nombre: true } } },
  });
  if (!envio) throw new ErrorAcceso();
  if (envio.estado.nombre !== EN_PREPARACION) throw new ErrorNegocio(MENSAJE_FUERA_DE_PREPARACION);
}

/** Si el envío salió de preparación entre la comprobación y el cambio, ningún `updateMany` encuentra la fila. */
function exigirCambios(resultados: { count: number }[]) {
  if (resultados.some((r) => r.count === 0)) throw new ErrorNegocio(MENSAJE_FUERA_DE_PREPARACION);
}

export async function listarEnviosEnPreparacion(sedeId: number) {
  const envios = await prisma.envio.findMany({
    where: {
      sedeId,
      estado: { nombre: EN_PREPARACION },
    },
    orderBy: [{ posicionCola: "asc" }, { creadoEn: "asc" }, { id: "asc" }],
    select: {
      id: true,
      sedeId: true,
      tipo: true,
      numero: true,
      fechaEnvio: true,
      programadoPara: true,
      posicionCola: true,
      camion: { select: { id: true, identificacion: true } },
      piloto: { select: { id: true, name: true } },
      lineas: {
        orderBy: { posicion: "asc" },
        select: {
          id: true,
          producto: true,
          lote: true,
          pesoConversionKg: true,
          cantidadKg: true,
          marcado: true,
          posicion: true,
        },
      },
      pedidosFacturados: {
        select: {
          cliente: true,
          sector: true,
        },
      },
    },
  });

  return envios.map((envio) => {
    const totalDecimal = envio.lineas.reduce(
      (acum, l) => acum.plus(new Prisma.Decimal(l.cantidadKg)),
      new Prisma.Decimal(0),
    );
    const clientesSet = new Set(envio.pedidosFacturados.map(claveCliente));
    const lineasPreparadas = envio.lineas.filter((l) => l.marcado).length;

    return {
      ...envio,
      totalKg: totalDecimal.toNumber(),
      clientesContador: clientesSet.size,
      lineasContador: envio.lineas.length,
      lineasListas: lineasPreparadas,
      todoListo: envio.lineas.length > 0 && lineasPreparadas === envio.lineas.length,
    };
  });
}

export async function obtenerDetalleEnvio(envioId: number, sedeId: number) {
  const envio = await prisma.envio.findFirst({
    where: { id: envioId, sedeId },
    include: {
      sede: { select: { id: true, nombre: true } },
      estado: { select: { nombre: true } },
      camion: { select: { id: true, identificacion: true } },
      piloto: { select: { id: true, name: true } },
      pedidosFacturados: {
        orderBy: { posicion: "asc" },
        include: {
          detalles: {
            orderBy: { orden: "asc" },
          },
        },
      },
    },
  });

  if (!envio) {
    throw new ErrorAcceso();
  }

  let totalGeneralDecimal = new Prisma.Decimal(0);

  const pedidosFacturados = envio.pedidosFacturados.map((pf) => {
    const totalPfDecimal = pf.detalles.reduce(
      (acum, d) => acum.plus(new Prisma.Decimal(d.cantidadKg)),
      new Prisma.Decimal(0),
    );
    totalGeneralDecimal = totalGeneralDecimal.plus(totalPfDecimal);

    return {
      id: pf.id,
      numeroOdoo: pf.numeroOdoo,
      referencia: pf.referencia,
      cliente: pf.cliente,
      sector: pf.sector,
      posicion: pf.posicion,
      totalKg: totalPfDecimal.toNumber(),
      lineas: pf.detalles.map((d) => ({
        id: d.id,
        producto: d.producto,
        lote: d.lote,
        // Texto exacto para la conversión, nunca Number (RN-01, auditoría H-16).
        pesoConversionKg: d.pesoConversionKg.toString(),
        cantidadKg: d.cantidadKg.toString(),
        orden: d.orden,
      })),
    };
  });

  return {
    id: envio.id,
    tipo: envio.tipo,
    numero: envio.numero,
    etiqueta: etiquetaEnvio(envio.tipo, envio.numero),
    fechaEnvio:
      envio.fechaEnvio instanceof Date
        ? envio.fechaEnvio.toISOString().slice(0, 10)
        : String(envio.fechaEnvio).slice(0, 10),
    programadoPara: envio.programadoPara,
    sede: envio.sede,
    camion: envio.camion,
    piloto: envio.piloto,
    totalKg: totalGeneralDecimal.toNumber(),
    pedidosFacturados,
  };
}

export async function marcarLinea(entrada: EntradaMarcarLinea, contexto: ContextoOperacion) {
  await exigirEnvioEnPreparacion(entrada.envioId, contexto.sedeId);

  const linea = await prisma.lineaPreparacion.findFirst({
    where: { id: entrada.lineaId, envioId: entrada.envioId },
  });

  if (!linea) {
    throw new ErrorAcceso();
  }

  const nuevoMarcado = entrada.marcado !== undefined ? entrada.marcado : !linea.marcado;

  // RN-20: no registra quién marcó y no va a la bitácora
  const resultado = await prisma.lineaPreparacion.updateMany({
    where: {
      id: entrada.lineaId,
      envioId: entrada.envioId,
      envio: {
        sedeId: contexto.sedeId,
        estado: { nombre: EN_PREPARACION },
      },
    },
    data: { marcado: nuevoMarcado },
  });

  // El envío salió de preparación entre la comprobación y el cambio.
  if (resultado.count === 0) {
    throw new ErrorNegocio(MENSAJE_FUERA_DE_PREPARACION);
  }

  return {
    lineaId: entrada.lineaId,
    marcado: nuevoMarcado,
  };
}

export async function marcarTodasLineas(entrada: EntradaMarcarTodo, contexto: ContextoOperacion) {
  await exigirEnvioEnPreparacion(entrada.envioId, contexto.sedeId);

  // RN-20: marcar todo no va a la bitácora
  const resultado = await prisma.lineaPreparacion.updateMany({
    where: {
      envioId: entrada.envioId,
      envio: {
        sedeId: contexto.sedeId,
        estado: { nombre: EN_PREPARACION },
      },
    },
    data: { marcado: entrada.marcado },
  });
  exigirCambios([resultado]);

  return {
    envioId: entrada.envioId,
    marcado: entrada.marcado,
  };
}

export async function ordenarLineasPorPeso(entrada: EntradaOrdenarPorPeso, contexto: ContextoOperacion) {
  await exigirEnvioEnPreparacion(entrada.envioId, contexto.sedeId);
  const envio = await prisma.envio.findFirstOrThrow({
    where: { id: entrada.envioId, sedeId: contexto.sedeId },
    include: { lineas: true },
  });

  // Ordenar de mayor a menor kg (RN-28: es un orden más, se guarda, no va a la bitácora)
  const lineasOrdenadas = [...envio.lineas].sort((a, b) => {
    const diff = new Prisma.Decimal(b.cantidadKg).minus(new Prisma.Decimal(a.cantidadKg)).toNumber();
    if (diff !== 0) return diff;
    return a.id - b.id;
  });

  const resultados = await prisma.$transaction(
    lineasOrdenadas.map((l, index) =>
      prisma.lineaPreparacion.updateMany({
        where: {
          id: l.id,
          envioId: entrada.envioId,
          envio: {
            sedeId: contexto.sedeId,
            estado: { nombre: EN_PREPARACION },
          },
        },
        data: { posicion: index + 1 },
      }),
    ),
  );
  exigirCambios(resultados);

  return {
    envioId: entrada.envioId,
    orden: lineasOrdenadas.map((l) => l.id),
  };
}

export async function despacharEnvio(entrada: EntradaDespachar, contexto: ContextoOperacion) {
  return prisma.$transaction(async (tx) => {
    // Bloqueo exclusivo de fila para evitar condiciones de carrera (specs/16, decisión 41)
    const bloqueados = await tx.$queryRaw<{ id: number }[]>`
      SELECT id FROM envio WHERE id = ${entrada.envioId} AND sede_id = ${contexto.sedeId} FOR UPDATE
    `;

    if (!bloqueados || bloqueados.length === 0) {
      throw new ErrorAcceso();
    }

    const envio = await tx.envio.findFirst({
      where: {
        id: entrada.envioId,
        sedeId: contexto.sedeId,
      },
      include: {
        estado: true,
        sede: true,
        lineas: true,
      },
    });

    if (!envio) {
      throw new ErrorAcceso();
    }

    if (envio.estado.nombre !== EN_PREPARACION) {
      throw new ErrorNegocio(MENSAJE_FUERA_DE_PREPARACION);
    }

    if (envio.lineas.some((l) => !l.marcado)) {
      throw new ErrorNegocio("Faltan líneas por marcar.");
    }

    const estadoDestinoNombre = esTipoRuta(envio.tipo) ? "En Ruta" : "Despachado";
    const estadoDestino = await tx.estadoEnvio.findUniqueOrThrow({
      where: { nombre: estadoDestinoNombre },
    });

    await tx.envio.update({
      where: { id: envio.id },
      data: {
        estadoId: estadoDestino.id,
        posicionCola: null,
      },
    });

    await tx.historialEstado.create({
      data: {
        envioId: envio.id,
        estadoId: estadoDestino.id,
        usuarioId: contexto.usuarioId,
      },
    });

    const etiqueta = etiquetaEnvio(envio.tipo, envio.numero);
    const fechaDia =
      envio.fechaEnvio instanceof Date
        ? envio.fechaEnvio.toISOString().slice(0, 10)
        : String(envio.fechaEnvio).slice(0, 10);
    const detalleBitacora = `${envio.sede.nombre} · ${etiqueta} del ${formatoFecha(fechaDia)} pasa a ${estadoDestinoNombre}`;

    await registrarBitacora(tx, {
      sistema: "picking",
      operacion: "Cambio de estado",
      entidad: "envio",
      registroId: String(envio.id),
      usuarioId: contexto.usuarioId,
      detalle: detalleBitacora,
    });

    return {
      id: envio.id,
      tipo: envio.tipo,
      numero: envio.numero,
      etiqueta,
      nuevoEstado: estadoDestinoNombre,
    };
  });
}

export async function reordenarColaBodega(entrada: EntradaReordenarCola, contexto: ContextoOperacion) {
  // Todos los envíos deben ser de la sede (RN-17) y seguir En Preparación (H-22).
  const envios = await prisma.envio.findMany({
    where: { id: { in: entrada.envioIds }, sedeId: contexto.sedeId },
    select: { id: true, estado: { select: { nombre: true } } },
  });

  if (envios.length !== entrada.envioIds.length) {
    throw new ErrorAcceso();
  }
  if (envios.some((e) => e.estado.nombre !== EN_PREPARACION)) {
    throw new ErrorNegocio(MENSAJE_FUERA_DE_PREPARACION);
  }

  // Actualizar posiciones enteras (decisión 57)
  // RN-28: no va al historial ni a la bitácora
  const resultados = await prisma.$transaction(
    entrada.envioIds.map((id, index) =>
      prisma.envio.updateMany({
        where: {
          id,
          sedeId: contexto.sedeId,
          estado: { nombre: EN_PREPARACION },
        },
        data: { posicionCola: index + 1 },
      }),
    ),
  );
  exigirCambios(resultados);

  return {
    envioIds: entrada.envioIds,
  };
}

export async function reordenarLineasPreparacion(entrada: EntradaReordenarLineas, contexto: ContextoOperacion) {
  await exigirEnvioEnPreparacion(entrada.envioId, contexto.sedeId);
  const envio = await prisma.envio.findFirstOrThrow({
    where: { id: entrada.envioId, sedeId: contexto.sedeId },
    include: { lineas: { select: { id: true } } },
  });

  const idsExistentes = new Set(envio.lineas.map((l) => l.id));
  const todosPertenecen =
    entrada.lineaIds.length === envio.lineas.length && entrada.lineaIds.every((id) => idsExistentes.has(id));
  if (!todosPertenecen) {
    throw new ErrorAcceso();
  }

  // Actualizar posiciones enteras (decisión 57)
  // RN-28: no va al historial ni a la bitácora
  const resultados = await prisma.$transaction(
    entrada.lineaIds.map((id, index) =>
      prisma.lineaPreparacion.updateMany({
        where: {
          id,
          envioId: entrada.envioId,
          envio: {
            sedeId: contexto.sedeId,
            estado: { nombre: EN_PREPARACION },
          },
        },
        data: { posicion: index + 1 },
      }),
    ),
  );
  exigirCambios(resultados);

  return {
    envioId: entrada.envioId,
    lineaIds: entrada.lineaIds,
  };
}
