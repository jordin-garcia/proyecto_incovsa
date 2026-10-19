import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ErrorNegocio } from "@/lib/errores";
import type { SesionActual } from "@/lib/sesion";
import { registrarBitacora } from "@/modulos/bitacora/servicio";
import { exigirPermiso } from "@/modulos/permisos/servicio";
import { esquemaEntradaCargaDeOdoo, esquemaEntradaEliminarDelTablero, esquemaEntradaTablero } from "./esquemas";

export type PedidoEnTablero = {
  id: number;
  numero: string;
  cliente: string;
  sector: string;
  totalKg: string;
  lineas: { producto: string; lote: string; cantidadKg: string }[];
};

export async function consultarTableroFacturacion(
  sesion: SesionActual | null,
  sedeId: number,
): Promise<PedidoEnTablero[]> {
  exigirPermiso(sesion, "pk.facturacion", sedeId);
  const sedeAutorizada = esquemaEntradaTablero.parse(sedeId);
  const pedidos = await prisma.pedidoFacturado.findMany({
    where: { sedeId: sedeAutorizada, opcionEnvioId: null, envioId: null },
    include: { detalles: { orderBy: { orden: "asc" } } },
    orderBy: [{ posicion: "asc" }, { id: "asc" }],
  });

  return pedidos.map((pedido) => ({
    id: pedido.id,
    numero: pedido.numeroOdoo,
    cliente: pedido.cliente || "Sin nombre",
    sector: pedido.sector || "Sin sector",
    totalKg: pedido.detalles.reduce((total, linea) => total.add(linea.cantidadKg), new Prisma.Decimal(0)).toFixed(3),
    lineas: pedido.detalles.map((linea) => ({
      producto: linea.producto,
      lote: linea.lote,
      cantidadKg: linea.cantidadKg.toFixed(3),
    })),
  }));
}

export async function guardarCargaDeOdoo(
  entradaSinValidar: unknown,
): Promise<{ pedidosCargados: number; noCargados: number; otrosEstados: number }> {
  const entrada = esquemaEntradaCargaDeOdoo.parse(entradaSinValidar);
  const { lectura, sedeId, usuarioId, nombreArchivo } = entrada;
  const gruposNoCargados = [
    {
      motivo: "sin cargar por Peso de Conversión en 0 o vacío",
      pedidos: lectura.noCargados.filter((pedido) => pedido.motivo.includes("Peso de Conversión")),
    },
    {
      motivo: "sin cargar por cantidad en 0 o vacía",
      pedidos: lectura.noCargados.filter((pedido) => pedido.motivo.includes("cantidad")),
    },
    {
      motivo: "sin productos",
      pedidos: lectura.noCargados.filter((pedido) => pedido.motivo === "no traen productos"),
    },
  ];
  const detalleResumen = [
    nombreArchivo,
    `${lectura.pedidos.length} pedido(s) facturado(s) cargado(s)`,
    ...gruposNoCargados.flatMap(({ motivo, pedidos }) =>
      pedidos.length ? [`${pedidos.length} ${motivo} (${pedidos.map((pedido) => pedido.numero).join(", ")})`] : [],
    ),
    lectura.otrosEstados ? `${lectura.otrosEstados} referencia(s) que no están en estado Hecho` : "",
  ].filter(Boolean);

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`facturacion:sede:${sedeId}`}, 0))`;
    const sede = await tx.sede.findUniqueOrThrow({ where: { id: sedeId }, select: { nombre: true } });
    const ultimaPosicion = await tx.pedidoFacturado.aggregate({
      where: { sedeId, opcionEnvioId: null, envioId: null },
      _max: { posicion: true },
    });
    let posicion = ultimaPosicion._max.posicion ?? 0;
    const creados: { id: number }[] = [];
    for (const pedido of lectura.pedidos) {
      const creado = await tx.pedidoFacturado.create({
        data: {
          sedeId,
          numeroOdoo: pedido.numero,
          referencia: pedido.referencia,
          cliente: pedido.cliente,
          sector: pedido.sector,
          posicion: ++posicion,
          cargadoPorId: usuarioId,
          detalles: {
            create: pedido.lineas.map((linea, orden) => ({
              producto: linea.producto,
              lote: linea.lote,
              pesoConversionKg: new Prisma.Decimal(linea.pesoConversionKg),
              cantidadKg: new Prisma.Decimal(linea.cantidadKg),
              orden,
            })),
          },
        },
        select: { id: true },
      });
      creados.push(creado);
    }

    await registrarBitacora(tx, {
      sistema: "picking",
      operacion: "Carga de archivo de Odoo",
      entidad: "pedido_facturado",
      registroId: creados[0] ? String(creados[0].id) : null,
      usuarioId,
      detalle: {
        sede: sede.nombre,
        nombreArchivo,
        pedidosCargados: lectura.pedidos.length,
        noCargados: lectura.noCargados,
        otrosEstados: lectura.otrosEstados,
        filasDeAgrupacion: lectura.filasDeAgrupacion,
        resumen: detalleResumen,
      },
    });
  });

  return {
    pedidosCargados: lectura.pedidos.length,
    noCargados: lectura.noCargados.length,
    otrosEstados: lectura.otrosEstados,
  };
}

export async function eliminarDelTablero(
  idsSinValidar: unknown,
  datos: { sedeId: number; usuarioId: string },
): Promise<number> {
  const { ids, sedeId, usuarioId } = esquemaEntradaEliminarDelTablero.parse({ ...datos, ids: idsSinValidar });
  return prisma.$transaction(async (tx) => {
    const pedidos = await tx.pedidoFacturado.findMany({
      where: { id: { in: ids }, sedeId, opcionEnvioId: null, envioId: null },
      include: { detalles: true },
      orderBy: [{ posicion: "asc" }, { id: "asc" }],
    });
    if (pedidos.length !== ids.length) throw new ErrorNegocio("Esos pedidos facturados ya no están disponibles.");

    const bitacoraPedidos = pedidos.map((pedido) => ({
      numero: pedido.numeroOdoo,
      cliente: pedido.cliente,
      totalKg: pedido.detalles.reduce((total, linea) => total.add(linea.cantidadKg), new Prisma.Decimal(0)).toFixed(3),
    }));
    const sede = await tx.sede.findUniqueOrThrow({ where: { id: sedeId }, select: { nombre: true } });
    await registrarBitacora(tx, {
      sistema: "picking",
      operacion: "Eliminación de pedidos facturados",
      entidad: "pedido_facturado",
      registroId: pedidos.length === 1 ? String(pedidos[0]!.id) : null,
      usuarioId,
      detalle: {
        sede: sede.nombre,
        pedidos: bitacoraPedidos,
      },
    });
    const eliminacion = await tx.pedidoFacturado.deleteMany({
      where: { id: { in: ids }, sedeId, opcionEnvioId: null, envioId: null },
    });
    if (eliminacion.count !== ids.length) throw new ErrorNegocio("Esos pedidos facturados ya no están disponibles.");
    return pedidos.length;
  });
}
