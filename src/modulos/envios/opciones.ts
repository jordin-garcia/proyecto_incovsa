import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ErrorNegocio } from "@/lib/errores";
import { fechaGuatemala, formatoFecha, inicioDelDiaGuatemala } from "@/lib/fechas";
import { formatoKg } from "@/componentes/comunes/formato";
import type { SesionActual } from "@/lib/sesion";
import { normalizarRol } from "@/lib/roles";
import { exigirPermiso } from "@/modulos/permisos/servicio";
import { registrarBitacora } from "@/modulos/bitacora/servicio";
import {
  esquemaCampoOpcion,
  esquemaConfirmacionOpcion,
  esquemaMovimiento,
  esquemaOpcion,
  esquemaEntradaTablero,
  type TipoOpcion,
} from "./esquemas";
import { bloquearSede, exigirEstadoPedidos, AVISO_CONFLICTO } from "./concurrencia";
import type { PedidoEnTablero } from "./servicio";

type Tx = Prisma.TransactionClient;
export type OpcionFacturacion = {
  tipo: TipoOpcion;
  camionId: number | null;
  pilotoId: string | null;
  fecha: string;
  hora: string;
  siguienteNumero: number;
  pedidos: PedidoEnTablero[];
};
export type OpcionesFacturacion = {
  opciones: OpcionFacturacion[];
  camiones: { id: number; nombre: string; capacidadKg: string }[];
  pilotos: { id: string; nombre: string }[];
};
export type EnvioCreado = { id: number; numero: number; tipo: "ruta" | "pedido"; fecha: string };
const nombreOpcion = (tipo: TipoOpcion) => (tipo === "camion" ? "Envío por camión" : "Cliente recoge en bodega");
const fechaColumna = (dia: string) => new Date(`${dia}T00:00:00.000Z`);

function autorizar(sesion: SesionActual | null, entrada: unknown): asserts sesion is SesionActual {
  exigirPermiso(sesion, "pk.facturacion");
  const { sedeId } = esquemaOpcion.pick({ sedeId: true }).parse(entrada);
  exigirPermiso(sesion, "pk.facturacion", sedeId);
}
async function bloquearOpcion(tx: Tx, sedeId: number, tipo: TipoOpcion) {
  const filas = await tx.$queryRaw<
    { id: number }[]
  >`SELECT id FROM opcion_envio WHERE sede_id = ${sedeId} AND tipo = ${tipo} FOR UPDATE`;
  if (!filas[0]) throw new ErrorNegocio("Esa opción de envío ya no está disponible.");
  return tx.opcionEnvio.findFirstOrThrow({ where: { id: filas[0].id, sedeId } });
}
async function validarCamion(tx: Tx, sedeId: number, id: number) {
  const camion = await tx.camion.findFirst({ where: { id, sedeId, eliminadoEn: null } });
  if (!camion) throw new ErrorNegocio("Elija el camión.");
  return camion;
}
async function validarPiloto(tx: Tx, sedeId: number, id: string) {
  const piloto = await tx.usuario.findFirst({
    where: { id, activo: true, eliminadoEn: null, sistema: "picking", sedes: { some: { sedeId } } },
  });
  if (!piloto || normalizarRol(piloto.rol) !== "piloto") throw new ErrorNegocio("Elija el piloto.");
  return piloto;
}
async function siguienteNumero(tx: Tx, sedeId: number, tipo: "ruta" | "pedido", fecha: string) {
  const maximo = await tx.envio.aggregate({
    where: { sedeId, tipo, fechaEnvio: fechaColumna(fecha) },
    _max: { numero: true },
  });
  return (maximo._max.numero ?? 0) + 1;
}

export async function consultarOpciones(
  sesion: SesionActual | null,
  sedeSinValidar: number,
): Promise<OpcionesFacturacion> {
  exigirPermiso(sesion, "pk.facturacion", sedeSinValidar);
  const sedeId = esquemaEntradaTablero.parse(sedeSinValidar);
  return prisma.$transaction(async (tx) => {
    const opciones = await tx.opcionEnvio.findMany({
      where: { sedeId },
      include: {
        pedidosFacturados: {
          where: { sedeId, envioId: null },
          orderBy: [{ posicion: "asc" }, { id: "asc" }],
          include: { detalles: { orderBy: { orden: "asc" } } },
        },
      },
    });
    const camiones = await tx.camion.findMany({ where: { sedeId, eliminadoEn: null }, orderBy: { id: "asc" } });
    const pilotos = await tx.usuario.findMany({
      where: { activo: true, eliminadoEn: null, sistema: "picking", sedes: { some: { sedeId } } },
      orderBy: { name: "asc" },
    });
    return {
      camiones: camiones.map((c) => ({ id: c.id, nombre: c.identificacion, capacidadKg: c.capacidadKg.toFixed(3) })),
      pilotos: pilotos.filter((p) => normalizarRol(p.rol) === "piloto").map((p) => ({ id: p.id, nombre: p.name })),
      opciones: await Promise.all(
        (["camion", "recoge"] as const).map(async (tipo) => {
          const o = opciones.find((o) => o.tipo === tipo);
          if (!o) throw new ErrorNegocio("Esa opción de envío ya no está disponible.");
          return {
            tipo,
            camionId: o.camionId,
            pilotoId: o.pilotoId,
            fecha: o.fechaProgramada?.toISOString().slice(0, 10) ?? "",
            hora: o.horaProgramada?.toISOString().slice(11, 16) ?? "",
            siguienteNumero: await siguienteNumero(
              tx,
              sedeId,
              tipo === "camion" ? "ruta" : "pedido",
              fechaGuatemala(new Date()),
            ),
            pedidos: o.pedidosFacturados.map((p) => ({
              id: p.id,
              posicion: p.posicion,
              actualizadoEn: p.actualizadoEn.toISOString(),
              numero: p.numeroOdoo,
              cliente: p.cliente || "Sin nombre",
              sector: p.sector || "Sin sector",
              totalKg: p.detalles.reduce((t, l) => t.add(l.cantidadKg), new Prisma.Decimal(0)).toFixed(3),
              lineas: p.detalles.map((l) => ({
                producto: l.producto,
                lote: l.lote,
                cantidadKg: l.cantidadKg.toFixed(3),
              })),
            })),
          };
        }),
      ),
    };
  });
}

export async function guardarCampoOpcion(sesion: SesionActual | null, entrada: unknown): Promise<void> {
  autorizar(sesion, entrada);
  const { sedeId, tipo, campo, valor } = esquemaCampoOpcion.parse(entrada);
  await prisma.$transaction(async (tx) => {
    await bloquearSede(tx, sedeId);
    const opcion = await bloquearOpcion(tx, sedeId, tipo);
    if (tipo === "recoge" && (campo === "camion" || campo === "piloto"))
      throw new ErrorNegocio("El cliente recoge en bodega.");
    let cambio: Prisma.OpcionEnvioUpdateInput;
    switch (campo) {
      case "fecha":
        cambio = { fechaProgramada: valor ? fechaColumna(valor) : null };
        break;
      case "hora":
        cambio = { horaProgramada: valor ? new Date(`1970-01-01T${valor}:00Z`) : null };
        break;
      case "camion":
        if (valor) await validarCamion(tx, sedeId, valor);
        cambio = { camion: valor ? { connect: { id: valor } } : { disconnect: true } };
        break;
      case "piloto":
        if (valor) await validarPiloto(tx, sedeId, valor);
        cambio = { piloto: valor ? { connect: { id: valor } } : { disconnect: true } };
        break;
    }
    await tx.opcionEnvio.update({ where: { id: opcion.id, sedeId }, data: cambio });
  });
}

export async function moverPedidos(sesion: SesionActual | null, entrada: unknown): Promise<void> {
  autorizar(sesion, entrada);
  const { sedeId, ids, origen, destino, antesDe, estadoOrigen, estadoDestino } = esquemaMovimiento.parse(entrada);
  await prisma.$transaction(async (tx) => {
    await bloquearSede(tx, sedeId);
    const opciones = await tx.opcionEnvio.findMany({ where: { sedeId } });
    const idDe = (tipo: TipoOpcion | null) => {
      if (tipo === null) return null;
      const id = opciones.find((o) => o.tipo === tipo)?.id;
      if (!id) throw new ErrorNegocio("Esa opción de envío ya no está disponible.");
      return id;
    };
    const origenId = idDe(origen),
      destinoId = idDe(destino);
    for (const [opcionEnvioId, estado] of [
      [origenId, estadoOrigen],
      [destinoId, estadoDestino],
    ] as const) {
      const actuales = await tx.pedidoFacturado.findMany({
        where: { sedeId, opcionEnvioId, envioId: null },
        orderBy: [{ posicion: "asc" }, { id: "asc" }],
      });
      exigirEstadoPedidos(actuales, estado);
    }
    const pedidos = await tx.pedidoFacturado.findMany({
      where: { id: { in: ids }, sedeId, opcionEnvioId: origenId, envioId: null },
      orderBy: [{ posicion: "asc" }, { id: "asc" }],
    });
    if (pedidos.length !== ids.length) throw new ErrorNegocio(AVISO_CONFLICTO);
    const otros = await tx.pedidoFacturado.findMany({
      where: { sedeId, opcionEnvioId: destinoId, envioId: null, id: { notIn: ids } },
      orderBy: [{ posicion: "asc" }, { id: "asc" }],
    });
    const indice = antesDe === null ? otros.length : otros.findIndex((p) => p.id === antesDe);
    if (indice < 0) throw new ErrorNegocio(AVISO_CONFLICTO);
    otros.splice(indice, 0, ...pedidos);
    for (const [posicion, pedido] of otros.entries()) {
      const actualizado = await tx.pedidoFacturado.updateMany({
        where: { id: pedido.id, sedeId, envioId: null, opcionEnvioId: ids.includes(pedido.id) ? origenId : destinoId },
        data: { opcionEnvioId: destinoId, posicion: posicion + 1 },
      });
      if (actualizado.count !== 1) throw new ErrorNegocio(AVISO_CONFLICTO);
    }
  });
}

export async function cancelarOpcion(sesion: SesionActual | null, entrada: unknown): Promise<number> {
  autorizar(sesion, entrada);
  const { sedeId, tipo, estadoEsperado } = esquemaConfirmacionOpcion.parse(entrada);
  return prisma.$transaction(async (tx) => {
    await bloquearSede(tx, sedeId);
    const opcion = await bloquearOpcion(tx, sedeId, tipo);
    const pedidos = await tx.pedidoFacturado.findMany({
      where: { sedeId, opcionEnvioId: opcion.id, envioId: null },
      orderBy: [{ posicion: "asc" }, { id: "asc" }],
    });
    exigirEstadoPedidos(pedidos, estadoEsperado);
    if (!pedidos.length) return 0;
    const maximo = await tx.pedidoFacturado.aggregate({
      where: { sedeId, opcionEnvioId: null, envioId: null },
      _max: { posicion: true },
    });
    for (const [i, p] of pedidos.entries())
      await tx.pedidoFacturado.update({
        where: { id: p.id, sedeId, envioId: null, opcionEnvioId: opcion.id },
        data: { opcionEnvioId: null, posicion: (maximo._max.posicion ?? 0) + i + 1 },
      });
    const sede = await tx.sede.findUniqueOrThrow({ where: { id: sedeId } });
    await registrarBitacora(tx, {
      sistema: "picking",
      usuarioId: sesion.usuario.id,
      operacion: "Cancelación de opción de envío",
      entidad: "opcion_envio",
      registroId: String(opcion.id),
      detalle: {
        sede: sede.nombre,
        opcion: nombreOpcion(tipo),
        numeros: pedidos.map((p) => p.numeroOdoo),
        resumen: `${sede.nombre} · ${nombreOpcion(tipo)} · ${pedidos.length} pedido(s) facturado(s) regresan al tablero: ${pedidos.map((p) => p.numeroOdoo).join(", ")}`,
      },
    });
    return pedidos.length;
  });
}

export async function enviarOpcion(sesion: SesionActual | null, entrada: unknown): Promise<EnvioCreado | null> {
  autorizar(sesion, entrada);
  const { sedeId, tipo: opcionTipo, estadoEsperado } = esquemaConfirmacionOpcion.parse(entrada);
  return prisma.$transaction(async (tx) => {
    await bloquearSede(tx, sedeId);
    const opcion = await bloquearOpcion(tx, sedeId, opcionTipo);
    const pedidos = await tx.pedidoFacturado.findMany({
      where: { sedeId, opcionEnvioId: opcion.id, envioId: null },
      include: { detalles: { orderBy: { orden: "asc" } } },
      orderBy: [{ posicion: "asc" }, { id: "asc" }],
    });
    if (!pedidos.length) return null;
    exigirEstadoPedidos(pedidos, estadoEsperado);
    const tipo = opcionTipo === "camion" ? "ruta" : "pedido";
    const camion = tipo === "ruta" && opcion.camionId ? await validarCamion(tx, sedeId, opcion.camionId) : null;
    const piloto = tipo === "ruta" && opcion.pilotoId ? await validarPiloto(tx, sedeId, opcion.pilotoId) : null;
    if (tipo === "ruta" && !camion) throw new ErrorNegocio("Elija el camión.");
    if (tipo === "ruta" && !piloto) throw new ErrorNegocio("Elija el piloto.");
    if (!opcion.fechaProgramada || !opcion.horaProgramada)
      throw new ErrorNegocio(
        `Escriba la fecha y la hora programadas de ${tipo === "ruta" ? "envío" : "despacho"} (RN-53).`,
      );
    const diaProgramado = opcion.fechaProgramada.toISOString().slice(0, 10);
    const hora = opcion.horaProgramada.toISOString().slice(11, 16);
    const programadoPara = new Date(
      +inicioDelDiaGuatemala(diaProgramado) + (Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3))) * 60_000,
    );
    const fecha = fechaGuatemala(new Date());
    const numero = await siguienteNumero(tx, sedeId, tipo, fecha);
    const estado = await tx.estadoEnvio.findUniqueOrThrow({ where: { nombre: "En Preparación" } });
    const cola = await tx.envio.aggregate({ where: { sedeId, estadoId: estado.id }, _max: { posicionCola: true } });
    const envio = await tx.envio.create({
      data: {
        sedeId,
        tipo,
        numero,
        fechaEnvio: fechaColumna(fecha),
        programadoPara,
        estadoId: estado.id,
        enviadoPorId: sesion.usuario.id,
        camionId: camion?.id,
        pilotoId: piloto?.id,
        posicionCola: (cola._max.posicionCola ?? 0) + 1,
      },
    });
    const lineas = new Map<
      string,
      { producto: string; lote: string; pesoConversionKg: Prisma.Decimal; cantidadKg: Prisma.Decimal }
    >();
    const clientes = new Map<string, { cliente: string; sector: string; totalKg: Prisma.Decimal }>();
    let totalKg = new Prisma.Decimal(0);
    for (const pedido of pedidos) {
      const claveCliente = JSON.stringify([pedido.cliente, pedido.sector]);
      let cliente = clientes.get(claveCliente);
      if (!cliente) {
        cliente = { cliente: pedido.cliente, sector: pedido.sector, totalKg: new Prisma.Decimal(0) };
        clientes.set(claveCliente, cliente);
      }
      for (const detalle of pedido.detalles) {
        const clave = JSON.stringify([detalle.producto, detalle.lote, detalle.pesoConversionKg.toFixed(3)]);
        const previa = lineas.get(clave);
        if (previa) previa.cantidadKg = previa.cantidadKg.add(detalle.cantidadKg);
        else
          lineas.set(clave, {
            producto: detalle.producto,
            lote: detalle.lote,
            pesoConversionKg: detalle.pesoConversionKg,
            cantidadKg: detalle.cantidadKg,
          });
        cliente.totalKg = cliente.totalKg.add(detalle.cantidadKg);
        totalKg = totalKg.add(detalle.cantidadKg);
      }
    }
    await tx.lineaPreparacion.createMany({
      data: [...lineas.values()].map((l, i) => ({ ...l, envioId: envio.id, posicion: i + 1 })),
    });
    if (tipo === "ruta")
      await tx.entregaRuta.createMany({
        data: [...clientes.values()].map((c, i) => ({ ...c, envioId: envio.id, orden: i + 1 })),
      });
    await tx.historialEstado.create({ data: { envioId: envio.id, estadoId: estado.id, usuarioId: sesion.usuario.id } });
    await tx.pedidoFacturado.updateMany({
      where: { sedeId, opcionEnvioId: opcion.id, envioId: null },
      data: { envioId: envio.id, opcionEnvioId: null },
    });
    await tx.opcionEnvio.update({
      where: { id: opcion.id, sedeId },
      data: { camionId: null, pilotoId: null, fechaProgramada: null, horaProgramada: null },
    });
    const sede = await tx.sede.findUniqueOrThrow({ where: { id: sedeId } });
    const etiqueta = `${tipo === "ruta" ? "Ruta" : "Pedido"} ${numero}`;
    await registrarBitacora(tx, {
      sistema: "picking",
      usuarioId: sesion.usuario.id,
      operacion: tipo === "ruta" ? "Envío de ruta a bodega" : "Envío de pedido a bodega",
      entidad: "envio",
      registroId: String(envio.id),
      detalle: {
        sede: sede.nombre,
        tipo,
        numero,
        fecha,
        programada: `${diaProgramado}T${hora}`,
        numeros: pedidos.map((p) => p.numeroOdoo),
        totalKg: totalKg.toFixed(3),
        camion: camion?.identificacion ?? null,
        piloto: piloto?.name ?? null,
        resumen: `${sede.nombre} · ${etiqueta} del ${formatoFecha(fecha)} · programada ${formatoFecha(diaProgramado)} · ${hora} · ${camion ? `${camion.identificacion}, ${piloto!.name}` : "cliente recoge en bodega"} · pedidos facturados ${pedidos.map((p) => p.numeroOdoo).join(", ")} · ${formatoKg(totalKg.toString())}`,
      },
    });
    return { id: envio.id, numero, tipo, fecha };
  });
}
