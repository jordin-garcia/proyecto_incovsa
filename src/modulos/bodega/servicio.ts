import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ErrorNegocio } from "@/lib/errores";
import { ErrorAcceso } from "@/modulos/permisos/servicio";
import { formatoFecha } from "@/lib/fechas";
import { registrarBitacora } from "@/modulos/bitacora/servicio";
import type { EntradaMarcarLinea, EntradaMarcarTodo, EntradaOrdenarPorPeso, EntradaDespachar } from "./esquemas";

export interface ContextoOperacion {
  usuarioId: string;
  sedeId: number;
}

function esTipoRuta(tipo: string): boolean {
  return tipo === "ruta" || tipo === "camion";
}

function etiquetaEnvio(tipo: string, numero: number): string {
  return (esTipoRuta(tipo) ? "Ruta " : "Pedido ") + numero;
}

export async function listarEnviosEnPreparacion(sedeId: number) {
  const envios = await prisma.envio.findMany({
    where: {
      sedeId,
      estado: { nombre: "En Preparación" },
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
    const clientesSet = new Set(
      envio.pedidosFacturados.map((pf) => `${pf.cliente.trim().toLowerCase()}|${pf.sector.trim().toLowerCase()}`),
    );
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
        pesoConversionKg: Number(d.pesoConversionKg),
        cantidadKg: Number(d.cantidadKg),
        orden: d.orden,
      })),
    };
  });

  return {
    id: envio.id,
    tipo: envio.tipo,
    numero: envio.numero,
    etiqueta: etiquetaEnvio(envio.tipo, envio.numero),
    fechaEnvio: envio.fechaEnvio,
    programadoPara: envio.programadoPara,
    sede: envio.sede,
    camion: envio.camion,
    piloto: envio.piloto,
    totalKg: totalGeneralDecimal.toNumber(),
    pedidosFacturados,
  };
}

export async function marcarLinea(entrada: EntradaMarcarLinea, contexto: ContextoOperacion) {
  const envio = await prisma.envio.findFirst({
    where: {
      id: entrada.envioId,
      sedeId: contexto.sedeId,
      estado: { nombre: "En Preparación" },
    },
  });

  if (!envio) {
    throw new ErrorAcceso();
  }

  const linea = await prisma.lineaPreparacion.findFirst({
    where: { id: entrada.lineaId, envioId: entrada.envioId },
  });

  if (!linea) {
    throw new ErrorAcceso();
  }

  const nuevoMarcado = entrada.marcado !== undefined ? entrada.marcado : !linea.marcado;

  // RN-20: no registra quién marcó y no va a la bitácora
  const lineaActualizada = await prisma.lineaPreparacion.update({
    where: { id: entrada.lineaId },
    data: { marcado: nuevoMarcado },
  });

  return {
    lineaId: lineaActualizada.id,
    marcado: lineaActualizada.marcado,
  };
}

export async function marcarTodasLineas(entrada: EntradaMarcarTodo, contexto: ContextoOperacion) {
  const envio = await prisma.envio.findFirst({
    where: {
      id: entrada.envioId,
      sedeId: contexto.sedeId,
      estado: { nombre: "En Preparación" },
    },
  });

  if (!envio) {
    throw new ErrorAcceso();
  }

  // RN-20: marcar todo no va a la bitácora
  await prisma.lineaPreparacion.updateMany({
    where: { envioId: entrada.envioId },
    data: { marcado: entrada.marcado },
  });

  return {
    envioId: entrada.envioId,
    marcado: entrada.marcado,
  };
}

export async function ordenarLineasPorPeso(entrada: EntradaOrdenarPorPeso, contexto: ContextoOperacion) {
  const envio = await prisma.envio.findFirst({
    where: {
      id: entrada.envioId,
      sedeId: contexto.sedeId,
      estado: { nombre: "En Preparación" },
    },
    include: {
      lineas: true,
    },
  });

  if (!envio) {
    throw new ErrorAcceso();
  }

  // Ordenar de mayor a menor kg (RN-28: es un orden más, se guarda, no va a la bitácora)
  const lineasOrdenadas = [...envio.lineas].sort((a, b) => {
    const diff = new Prisma.Decimal(b.cantidadKg).minus(new Prisma.Decimal(a.cantidadKg)).toNumber();
    if (diff !== 0) return diff;
    return a.id - b.id;
  });

  await prisma.$transaction(
    lineasOrdenadas.map((l, index) =>
      prisma.lineaPreparacion.update({
        where: { id: l.id },
        data: { posicion: index + 1 },
      }),
    ),
  );

  return {
    envioId: entrada.envioId,
    orden: lineasOrdenadas.map((l) => l.id),
  };
}

export async function despacharEnvio(entrada: EntradaDespachar, contexto: ContextoOperacion) {
  return prisma.$transaction(async (tx) => {
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

    if (envio.estado.nombre !== "En Preparación") {
      throw new ErrorNegocio("El pedido ya no está en preparación.");
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
    const detalleBitacora = `${envio.sede.nombre} · ${etiqueta} del ${formatoFecha(envio.fechaEnvio)} pasa a ${estadoDestinoNombre}`;

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
