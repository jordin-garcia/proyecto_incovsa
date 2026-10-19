import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { sembrarDemo } from "../../../prisma/semillas/demo";
import {
  listarEnviosEnPreparacion,
  obtenerDetalleEnvio,
  marcarLinea,
  marcarTodasLineas,
  ordenarLineasPorPeso,
  despacharEnvio,
} from "./servicio";

describe("Módulo de Bodega - Servicio", () => {
  const clave = "Demo-12345";
  let usuarioBodegaId: string;
  let usuarioPilotoId: string;
  let camionId: number;

  beforeEach(async () => {
    await limpiarTablasDeNegocio();
    await sembrarDemo(prisma, { claveDemo: clave });

    const uBodega = await prisma.usuario.findFirstOrThrow({ where: { displayUsername: "ejemplo.05" } });
    const uPiloto = await prisma.usuario.findFirstOrThrow({ where: { displayUsername: "ejemplo.06" } });
    const c1 = await prisma.camion.findFirstOrThrow({ where: { sedeId: 1 } });

    usuarioBodegaId = uBodega.id;
    usuarioPilotoId = uPiloto.id;
    camionId = c1.id;
  });

  async function crearEnvioDePrueba(opciones: {
    sedeId?: number;
    tipo?: "ruta" | "pedido";
    numero?: number;
    posicionCola?: number;
    estadoNombre?: "En Preparación" | "Despachado" | "En Ruta";
    lineas?: Array<{
      producto: string;
      lote: string;
      pesoConversionKg: number;
      cantidadKg: number;
      marcado?: boolean;
      posicion: number;
    }>;
    pedidosFacturados?: Array<{
      numeroOdoo: string;
      cliente: string;
      sector: string;
      posicion: number;
      detalles: Array<{
        producto: string;
        lote: string;
        pesoConversionKg: number;
        cantidadKg: number;
        orden: number;
      }>;
    }>;
  }) {
    const estado = await prisma.estadoEnvio.findUniqueOrThrow({
      where: { nombre: opciones.estadoNombre ?? "En Preparación" },
    });

    const sedeId = opciones.sedeId ?? 1;
    const tipo = opciones.tipo ?? "ruta";
    const numero = opciones.numero ?? 1;

    return prisma.envio.create({
      data: {
        sedeId,
        tipo,
        numero,
        fechaEnvio: new Date("2026-10-18T00:00:00Z"),
        programadoPara: new Date("2026-10-18T13:30:00-06:00"),
        estadoId: estado.id,
        enviadoPorId: usuarioBodegaId,
        camionId: tipo === "ruta" ? camionId : null,
        pilotoId: tipo === "ruta" ? usuarioPilotoId : null,
        posicionCola: opciones.posicionCola ?? 1,
        lineas: {
          create:
            opciones.lineas?.map((l) => ({
              producto: l.producto,
              lote: l.lote,
              pesoConversionKg: l.pesoConversionKg,
              cantidadKg: l.cantidadKg,
              marcado: l.marcado ?? false,
              posicion: l.posicion,
            })) ?? [],
        },
        pedidosFacturados: {
          create:
            opciones.pedidosFacturados?.map((pf) => ({
              sedeId,
              numeroOdoo: pf.numeroOdoo,
              referencia: `XE-IN/SALIDA/${pf.numeroOdoo}`,
              cliente: pf.cliente,
              sector: pf.sector,
              posicion: pf.posicion,
              cargadoPorId: usuarioBodegaId,
              detalles: {
                create: pf.detalles.map((d) => ({
                  producto: d.producto,
                  lote: d.lote,
                  pesoConversionKg: d.pesoConversionKg,
                  cantidadKg: d.cantidadKg,
                  orden: d.orden,
                })),
              },
            })) ?? [],
        },
      },
      include: {
        lineas: true,
        pedidosFacturados: { include: { detalles: true } },
      },
    });
  }

  it("RF-SL-19: Bodega muestra solo los envíos En Preparación de la sede de trabajo, en el orden de la cola", async () => {
    // Envíos en sede 1 (Quetzaltenango): 2 en preparación y 1 despachado
    const envio1 = await crearEnvioDePrueba({
      sedeId: 1,
      tipo: "ruta",
      numero: 1,
      posicionCola: 2,
      estadoNombre: "En Preparación",
    });
    const envio2 = await crearEnvioDePrueba({
      sedeId: 1,
      tipo: "pedido",
      numero: 2,
      posicionCola: 1,
      estadoNombre: "En Preparación",
    });
    await crearEnvioDePrueba({
      sedeId: 1,
      tipo: "pedido",
      numero: 3,
      posicionCola: 3,
      estadoNombre: "Despachado",
    });

    // Envío en sede 2 (Guatemala) en preparación
    await crearEnvioDePrueba({
      sedeId: 2,
      tipo: "ruta",
      numero: 1,
      posicionCola: 1,
      estadoNombre: "En Preparación",
    });

    const listaSede1 = await listarEnviosEnPreparacion(1);
    expect(listaSede1).toHaveLength(2);
    // Ordenado por posicionCola: envio2 (posicionCola 1) antes de envio1 (posicionCola 2)
    expect(listaSede1[0].id).toBe(envio2.id);
    expect(listaSede1[1].id).toBe(envio1.id);
  });

  it("RF-SL-21 / RN-51 (CP-19): el envío del ejemplo de los tres clientes de specs/07 muestra dos filas", async () => {
    // Ejemplo specs/07:
    // Cliente A: 25 kg lote 5287 (peso 25)
    // Cliente B: 15 kg lote 5287 (peso 25)
    // Cliente C: 10 kg lote 9221 (peso 25)
    // Agrupación en bodega:
    // Fila 1: lote 5287 con 40 kg ("1 unidad + 15 kg")
    // Fila 2: lote 9221 con 10 kg ("0 unidades + 10 kg")
    const envio = await crearEnvioDePrueba({
      sedeId: 1,
      tipo: "ruta",
      numero: 1,
      lineas: [
        {
          producto: "SULFATO DE SODIO",
          lote: "5287",
          pesoConversionKg: 25,
          cantidadKg: 40,
          posicion: 1,
        },
        {
          producto: "SULFATO DE SODIO",
          lote: "9221",
          pesoConversionKg: 25,
          cantidadKg: 10,
          posicion: 2,
        },
      ],
      pedidosFacturados: [
        {
          numeroOdoo: "90001",
          cliente: "Cliente A",
          sector: "Zona 1",
          posicion: 1,
          detalles: [{ producto: "SULFATO DE SODIO", lote: "5287", pesoConversionKg: 25, cantidadKg: 25, orden: 1 }],
        },
        {
          numeroOdoo: "90002",
          cliente: "Cliente B",
          sector: "Zona 2",
          posicion: 2,
          detalles: [{ producto: "SULFATO DE SODIO", lote: "5287", pesoConversionKg: 25, cantidadKg: 15, orden: 1 }],
        },
        {
          numeroOdoo: "90003",
          cliente: "Cliente C",
          sector: "Zona 3",
          posicion: 3,
          detalles: [{ producto: "SULFATO DE SODIO", lote: "9221", pesoConversionKg: 25, cantidadKg: 10, orden: 1 }],
        },
      ],
    });

    const lista = await listarEnviosEnPreparacion(1);
    const encontrado = lista.find((e) => e.id === envio.id);
    expect(encontrado).toBeDefined();
    expect(encontrado!.lineas).toHaveLength(2);

    const fila1 = encontrado!.lineas.find((l) => l.lote === "5287");
    expect(fila1).toBeDefined();
    expect(Number(fila1!.cantidadKg)).toBe(40);
    expect(Number(fila1!.pesoConversionKg)).toBe(25);

    const fila2 = encontrado!.lineas.find((l) => l.lote === "9221");
    expect(fila2).toBeDefined();
    expect(Number(fila2!.cantidadKg)).toBe(10);
    expect(Number(fila2!.pesoConversionKg)).toBe(25);
  });

  it("RF-SL-23 / RN-20: marcar una fila se guarda, no registra quién marcó y no va a la bitácora; marcar todo marca todas", async () => {
    const envio = await crearEnvioDePrueba({
      sedeId: 1,
      tipo: "pedido",
      numero: 1,
      lineas: [
        { producto: "P1", lote: "L1", pesoConversionKg: 25, cantidadKg: 50, posicion: 1, marcado: false },
        { producto: "P2", lote: "L2", pesoConversionKg: 25, cantidadKg: 25, posicion: 2, marcado: false },
      ],
    });

    const contexto = { usuarioId: usuarioBodegaId, sedeId: 1 };
    const linea1 = envio.lineas[0];

    // Marcar línea 1
    await marcarLinea({ envioId: envio.id, lineaId: linea1.id, marcado: true }, contexto);

    const linea1Bd = await prisma.lineaPreparacion.findUniqueOrThrow({ where: { id: linea1.id } });
    expect(linea1Bd.marcado).toBe(true);

    // Verificar que NO fue a la bitácora (RN-20)
    const registrosBitacora = await prisma.bitacora.findMany();
    expect(registrosBitacora).toHaveLength(0);

    // Marcar todo
    await marcarTodasLineas({ envioId: envio.id, marcado: true }, contexto);

    const lineasTodasBd = await prisma.lineaPreparacion.findMany({ where: { envioId: envio.id } });
    expect(lineasTodasBd.every((l) => l.marcado)).toBe(true);
    expect(await prisma.bitacora.findMany()).toHaveLength(0);

    // Desmarcar todo
    await marcarTodasLineas({ envioId: envio.id, marcado: false }, contexto);
    const lineasNingunaBd = await prisma.lineaPreparacion.findMany({ where: { envioId: envio.id } });
    expect(lineasNingunaBd.every((l) => !l.marcado)).toBe(true);
  });

  it("RF-SL-20 / RN-28 (CP-39): ordenar por peso ordena las filas de mayor a menor kg, se guarda y no va a bitácora", async () => {
    const envio = await crearEnvioDePrueba({
      sedeId: 1,
      tipo: "ruta",
      numero: 1,
      lineas: [
        { producto: "P1", lote: "L1", pesoConversionKg: 25, cantidadKg: 10, posicion: 1 },
        { producto: "P2", lote: "L2", pesoConversionKg: 25, cantidadKg: 50, posicion: 2 },
        { producto: "P3", lote: "L3", pesoConversionKg: 25, cantidadKg: 25, posicion: 3 },
      ],
    });

    const contexto = { usuarioId: usuarioBodegaId, sedeId: 1 };
    await ordenarLineasPorPeso({ envioId: envio.id }, contexto);

    const lineasOrdenadas = await prisma.lineaPreparacion.findMany({
      where: { envioId: envio.id },
      orderBy: { posicion: "asc" },
    });

    expect(Number(lineasOrdenadas[0].cantidadKg)).toBe(50);
    expect(Number(lineasOrdenadas[1].cantidadKg)).toBe(25);
    expect(Number(lineasOrdenadas[2].cantidadKg)).toBe(10);

    // No va a bitácora (RN-28)
    expect(await prisma.bitacora.findMany()).toHaveLength(0);
  });

  it("RF-SL-24 / RN-11 (CP-38): despacho solo se habilita con todo marcado; pasa a Despachado / En Ruta y sale de Bodega", async () => {
    // Caso 1: pedido (cliente recoge)
    const pedido = await crearEnvioDePrueba({
      sedeId: 1,
      tipo: "pedido",
      numero: 1,
      lineas: [
        { producto: "P1", lote: "L1", pesoConversionKg: 25, cantidadKg: 50, posicion: 1, marcado: false },
        { producto: "P2", lote: "L2", pesoConversionKg: 25, cantidadKg: 25, posicion: 2, marcado: true },
      ],
    });

    const contexto = { usuarioId: usuarioBodegaId, sedeId: 1 };

    // Intento con líneas pendientes de marcar -> ErrorNegocio
    await expect(despacharEnvio({ envioId: pedido.id }, contexto)).rejects.toThrow("Faltan líneas por marcar.");

    // Marcamos todas
    await marcarTodasLineas({ envioId: pedido.id, marcado: true }, contexto);

    // Despachar pedido -> pasa a Despachado
    const resultadoDespacho = await despacharEnvio({ envioId: pedido.id }, contexto);
    expect(resultadoDespacho.nuevoEstado).toBe("Despachado");

    const pedidoBd = await prisma.envio.findUniqueOrThrow({
      where: { id: pedido.id },
      include: { estado: true, historial: true },
    });
    expect(pedidoBd.estado.nombre).toBe("Despachado");
    expect(pedidoBd.historial).toHaveLength(1);
    expect(pedidoBd.historial[0].usuarioId).toBe(usuarioBodegaId);

    // Bitácora registrada
    const bitacoraPedido = await prisma.bitacora.findFirstOrThrow({
      where: { operacion: "Cambio de estado", registroId: String(pedido.id) },
    });
    expect(bitacoraPedido.sistema).toBe("picking");
    expect(bitacoraPedido.usuarioId).toBe(usuarioBodegaId);
    expect(bitacoraPedido.detalle).toContain("Pedido 1");
    expect(bitacoraPedido.detalle).toContain("Despachado");

    // Ya no aparece en Bodega
    const listaDespues = await listarEnviosEnPreparacion(1);
    expect(listaDespues.some((e) => e.id === pedido.id)).toBe(false);

    // Reintentar despachar cuando ya no está En Preparación se rechaza
    await expect(despacharEnvio({ envioId: pedido.id }, contexto)).rejects.toThrow(
      "El pedido ya no está en preparación.",
    );

    // Caso 2: ruta (envío por camión) -> pasa a En Ruta
    const ruta = await crearEnvioDePrueba({
      sedeId: 1,
      tipo: "ruta",
      numero: 2,
      lineas: [{ producto: "P1", lote: "L1", pesoConversionKg: 25, cantidadKg: 50, posicion: 1, marcado: true }],
    });

    const resultadoRuta = await despacharEnvio({ envioId: ruta.id }, contexto);
    expect(resultadoRuta.nuevoEstado).toBe("En Ruta");

    const rutaBd = await prisma.envio.findUniqueOrThrow({
      where: { id: ruta.id },
      include: { estado: true },
    });
    expect(rutaBd.estado.nombre).toBe("En Ruta");

    const bitacoraRuta = await prisma.bitacora.findFirstOrThrow({
      where: { operacion: "Cambio de estado", registroId: String(ruta.id) },
    });
    expect(bitacoraRuta.detalle).toContain("Ruta 2");
    expect(bitacoraRuta.detalle).toContain("En Ruta");
  });

  it("RF-SL-74 / RF-SL-75 (CP-36): detalle muestra completos todos los pedidos facturados y sus líneas con fecha/hora programadas", async () => {
    const envio = await crearEnvioDePrueba({
      sedeId: 1,
      tipo: "ruta",
      numero: 5,
      pedidosFacturados: [
        {
          numeroOdoo: "90010",
          cliente: "Cliente 1",
          sector: "Quetzaltenango",
          posicion: 1,
          detalles: [
            { producto: "SODA CAUSTICA", lote: "L1", pesoConversionKg: 25, cantidadKg: 50, orden: 1 },
            { producto: "SULFATO DE SODIO", lote: "L2", pesoConversionKg: 50, cantidadKg: 100, orden: 2 },
          ],
        },
        {
          numeroOdoo: "90011",
          cliente: "Cliente 2",
          sector: "Salcajá",
          posicion: 2,
          detalles: [{ producto: "ACIDO FORMICO", lote: "L3", pesoConversionKg: 35, cantidadKg: 70, orden: 1 }],
        },
      ],
    });

    const detalle = await obtenerDetalleEnvio(envio.id, 1);
    expect(detalle).toBeDefined();
    expect(detalle.numero).toBe(5);
    expect(detalle.tipo).toBe("ruta");
    expect(detalle.programadoPara).toBeDefined();
    expect(detalle.pedidosFacturados).toHaveLength(2);

    expect(detalle.pedidosFacturados[0].numeroOdoo).toBe("90010");
    expect(detalle.pedidosFacturados[0].cliente).toBe("Cliente 1");
    expect(detalle.pedidosFacturados[0].lineas).toHaveLength(2);
    expect(Number(detalle.pedidosFacturados[0].totalKg)).toBe(150);

    expect(detalle.pedidosFacturados[1].numeroOdoo).toBe("90011");
    expect(detalle.pedidosFacturados[1].cliente).toBe("Cliente 2");
    expect(detalle.pedidosFacturados[1].lineas).toHaveLength(1);
    expect(Number(detalle.pedidosFacturados[1].totalKg)).toBe(70);
  });

  it("RN-17 / RNF-04: las operaciones de bodega rechazan envíos de otra sede", async () => {
    const envioSede2 = await crearEnvioDePrueba({
      sedeId: 2,
      tipo: "ruta",
      numero: 1,
      lineas: [{ producto: "P1", lote: "L1", pesoConversionKg: 25, cantidadKg: 50, posicion: 1, marcado: false }],
    });

    const contextoSede1 = { usuarioId: usuarioBodegaId, sedeId: 1 };

    await expect(
      marcarLinea({ envioId: envioSede2.id, lineaId: envioSede2.lineas[0].id, marcado: true }, contextoSede1),
    ).rejects.toThrow();

    await expect(marcarTodasLineas({ envioId: envioSede2.id, marcado: true }, contextoSede1)).rejects.toThrow();

    await expect(ordenarLineasPorPeso({ envioId: envioSede2.id }, contextoSede1)).rejects.toThrow();

    await expect(despacharEnvio({ envioId: envioSede2.id }, contextoSede1)).rejects.toThrow();

    await expect(obtenerDetalleEnvio(envioSede2.id, 1)).rejects.toThrow();
  });
});
