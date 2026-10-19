import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";

/** Prefijos del archivo y de la semilla de sedes; ESC corresponde a Escuintla (RN-36). */
export const esquemaBodegaOdoo = z.enum(["XE", "GT", "ESC"]);
export type BodegaOdoo = z.infer<typeof esquemaBodegaOdoo>;

export const esquemaEntradaLecturaOdoo = z.object({
  bytes: z.instanceof(Uint8Array),
  sedeDeTrabajo: esquemaBodegaOdoo,
});

const textoOdoo = z.preprocess((valor) => String(valor ?? "").trim(), z.string());

/** RN-37: normaliza sin aritmética de punto flotante; null conserva el defecto de la línea para RN-50. */
function decimalDeCelda(valor: unknown): string | null {
  let texto: string;
  if (typeof valor === "number") {
    if (!Number.isFinite(valor)) return null;
    texto = String(valor);
  } else if (typeof valor === "string") {
    // Los mismos separadores que leerNumero() del prototipo: coma de miles y punto decimal.
    texto = valor.replace(/,/g, "").replace(/\s/g, "");
    if (!/^\d+(\.\d+)?$/.test(texto)) return null;
  } else {
    return null;
  }

  const decimal = new Prisma.Decimal(texto);
  if (!decimal.isFinite() || !decimal.greaterThan(0)) return null;
  const exacto = decimal.toFixed(3, Prisma.Decimal.ROUND_HALF_UP);
  return exacto === "0.000" ? null : exacto;
}

/** Una fila puede tener un defecto numérico: se rechaza su pedido completo, no el archivo. */
export const esquemaFilaOdoo = z.object({
  referencia: textoOdoo,
  cliente: textoOdoo,
  sector: textoOdoo,
  estado: textoOdoo,
  producto: textoOdoo,
  lote: textoOdoo,
  pesoConversionKg: z.unknown().transform(decimalDeCelda),
  cantidadKg: z.unknown().transform(decimalDeCelda),
});
export type FilaOdoo = z.infer<typeof esquemaFilaOdoo>;

const decimalPositivoExacto = z
  .string()
  .regex(/^\d+\.\d{3}$/)
  .refine((valor) => /[1-9]/.test(valor));

export const esquemaLineaPedidoFacturadoLeido = z.object({
  producto: z.string().min(1),
  lote: z.string(),
  pesoConversionKg: decimalPositivoExacto,
  cantidadKg: decimalPositivoExacto,
});
export type LineaPedidoFacturadoLeida = z.infer<typeof esquemaLineaPedidoFacturadoLeido>;

export const esquemaPedidoFacturadoLeido = z.object({
  numero: z.string().min(1),
  referencia: z.string().min(1),
  bodega: esquemaBodegaOdoo,
  cliente: z.string(),
  sector: z.string(),
  lineas: z.array(esquemaLineaPedidoFacturadoLeido).min(1),
});
export type PedidoFacturadoLeido = z.infer<typeof esquemaPedidoFacturadoLeido>;

/** Fragmentos literales de preparar() que utiliza el resumen de JC-03. */
export const motivosNoCargados = {
  sinProductos: "no traen productos",
  cantidad: "tienen líneas con la cantidad en 0 o vacía",
  peso: "tienen líneas con el Peso de Conversión en 0 o vacío (RN-50)",
} as const;

export const esquemaPedidoNoCargado = z.object({
  numero: z.string().min(1),
  cliente: z.string(),
  motivo: z.enum([motivosNoCargados.sinProductos, motivosNoCargados.cantidad, motivosNoCargados.peso]),
});
export type PedidoNoCargado = z.infer<typeof esquemaPedidoNoCargado>;

export const esquemaResultadoLecturaOdoo = z.object({
  pedidos: z.array(esquemaPedidoFacturadoLeido),
  noCargados: z.array(esquemaPedidoNoCargado),
  otrosEstados: z.number().int().nonnegative(),
  filasDeAgrupacion: z.number().int().nonnegative(),
});
export type ResultadoLecturaOdoo = z.infer<typeof esquemaResultadoLecturaOdoo>;
