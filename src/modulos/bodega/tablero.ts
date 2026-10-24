import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { listarEnviosEnPreparacion } from "./servicio";

/** Ocupación del camión por peso, como `lateral()` de tablero.js en el prototipo (specs/07, RF-SL-25). */
export interface OcupacionCamion {
  /** Suma exacta de las líneas, en kg. */
  totalKg: string;
  /** Porcentaje de la capacidad, redondeado al entero («92 % de la capacidad»). */
  porcentaje: number;
  /** Ancho de la barra, de 0 a 100. */
  porcentajeBarra: number;
  /** La carga llega o supera la capacidad. */
  lleno: boolean;
  /** Ancho de cada línea en la cama del camión (por id de línea) y si cabe su número. */
  segmentos: Record<number, { ancho: number; numerado: boolean }>;
}

const CIEN = new Prisma.Decimal(100);
// En el prototipo, un segmento lleva su número si ocupa más del 3.5 % del camión.
const MINIMO_NUMERADO = new Prisma.Decimal("0.035");

export function calcularOcupacion(
  lineas: ReadonlyArray<{ id: number; cantidadKg: string }>,
  capacidadKg: string,
): OcupacionCamion {
  const capacidad = new Prisma.Decimal(capacidadKg);
  const total = lineas.reduce((suma, l) => suma.plus(l.cantidadKg), new Prisma.Decimal(0));
  const hayCapacidad = capacidad.greaterThan(0);
  const porcentaje = hayCapacidad
    ? total.times(CIEN).dividedBy(capacidad).toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP).toNumber()
    : 0;
  // Los segmentos se miden sobre la capacidad o, si la carga la supera, sobre la carga.
  const base = Prisma.Decimal.max(capacidad, total);
  const segmentos: OcupacionCamion["segmentos"] = {};
  for (const l of lineas) {
    const fraccion = base.greaterThan(0) ? new Prisma.Decimal(l.cantidadKg).dividedBy(base) : new Prisma.Decimal(0);
    segmentos[l.id] = { ancho: fraccion.times(CIEN).toNumber(), numerado: fraccion.greaterThan(MINIMO_NUMERADO) };
  }
  return {
    totalKg: total.toString(),
    porcentaje,
    porcentajeBarra: hayCapacidad ? Prisma.Decimal.min(CIEN, total.times(CIEN).dividedBy(capacidad)).toNumber() : 0,
    lleno: total.greaterThan(0) && total.greaterThanOrEqualTo(capacidad),
    segmentos,
  };
}

/**
 * Rutas y pedidos En Preparación de la sede para el tablero en pantalla completa, en el orden de la cola.
 * Las cantidades van como texto exacto para el navegador; la ruta lleva la capacidad y la ocupación del camión.
 */
export async function listarTableroBodega(sedeId: number) {
  const envios = await listarEnviosEnPreparacion(sedeId);
  const idsCamion = [...new Set(envios.flatMap((e) => (e.camion ? [e.camion.id] : [])))];
  const capacidades = new Map(
    (
      await prisma.camion.findMany({
        where: { id: { in: idsCamion }, sedeId },
        select: { id: true, capacidadKg: true },
      })
    ).map((c) => [c.id, c.capacidadKg.toString()]),
  );
  // Los clientes de cada pedido facturado no se envían al navegador: el tablero no los muestra.
  return envios.map(({ pedidosFacturados, ...envio }) => {
    void pedidosFacturados;
    const lineas = envio.lineas.map((l) => ({
      ...l,
      cantidadKg: l.cantidadKg.toString(),
      pesoConversionKg: l.pesoConversionKg.toString(),
    }));
    const capacidadKg = envio.camion ? capacidades.get(envio.camion.id) : undefined;
    return {
      ...envio,
      lineas,
      camion: envio.camion && capacidadKg !== undefined ? { ...envio.camion, capacidadKg } : null,
      ocupacion: capacidadKg !== undefined ? calcularOcupacion(lineas, capacidadKg) : null,
    };
  });
}

export type EnvioTablero = Awaited<ReturnType<typeof listarTableroBodega>>[number];
