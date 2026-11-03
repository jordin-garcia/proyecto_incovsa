import { z } from "zod";
import { esquemaResultadoLecturaOdoo } from "@/modulos/odoo/esquemas";

const esquemaSedeId = z.number().int().positive();
export const esquemaEstadoPedidos = z
  .array(
    z.object({
      id: z.number().int().positive(),
      posicion: z.number().int().positive(),
      actualizadoEn: z.iso.datetime(),
    }),
  )
  .refine((pedidos) => new Set(pedidos.map((p) => p.id)).size === pedidos.length);
export type EstadoPedidos = z.infer<typeof esquemaEstadoPedidos>;

export const esquemaEntradaTablero = esquemaSedeId;

export const esquemaEntradaCargaDeOdoo = z.object({
  sedeId: esquemaSedeId,
  usuarioId: z.string().min(1),
  nombreArchivo: z.string().min(1).max(255),
  lectura: esquemaResultadoLecturaOdoo,
});
export type EntradaCargaDeOdoo = z.infer<typeof esquemaEntradaCargaDeOdoo>;

export const esquemaEntradaEliminarDelTablero = z.object({
  sedeId: esquemaSedeId,
  usuarioId: z.string().min(1),
  estadoEsperado: esquemaEstadoPedidos,
  ids: z
    .array(z.number().int().positive())
    .min(1)
    .refine((ids) => new Set(ids).size === ids.length),
});
export type EntradaEliminarDelTablero = z.infer<typeof esquemaEntradaEliminarDelTablero>;

export const esquemaFormularioCarga = z.object({
  sedeId: z.string().regex(/^\d+$/).transform(Number).pipe(esquemaSedeId),
  archivo: z.file().max(3 * 1024 * 1024),
});

export const esquemaFormularioEliminar = z.object({
  estadoEsperado: esquemaEstadoPedidos,
  sedeId: z.number().int().positive(),
  ids: z
    .array(z.number().int().positive())
    .min(1)
    .refine((ids) => new Set(ids).size === ids.length),
});

export const esquemaTipoOpcion = z.enum(["camion", "recoge"]);
export type TipoOpcion = z.infer<typeof esquemaTipoOpcion>;
export const esquemaOpcion = z.object({ sedeId: esquemaSedeId, tipo: esquemaTipoOpcion });
export const esquemaConfirmacionOpcion = esquemaOpcion.extend({ estadoEsperado: esquemaEstadoPedidos });
export const esquemaCampoOpcion = z.discriminatedUnion("campo", [
  esquemaOpcion.extend({ campo: z.literal("fecha"), valor: z.iso.date().nullable() }),
  esquemaOpcion.extend({ campo: z.literal("hora"), valor: z.iso.time({ precision: -1 }).nullable() }),
  esquemaOpcion.extend({ campo: z.literal("camion"), valor: z.number().int().positive().nullable() }),
  esquemaOpcion.extend({ campo: z.literal("piloto"), valor: z.string().min(1).max(255).nullable() }),
]);
export const esquemaMovimiento = z.object({
  estadoOrigen: esquemaEstadoPedidos,
  estadoDestino: esquemaEstadoPedidos,
  sedeId: esquemaSedeId,
  ids: z
    .array(z.number().int().positive())
    .min(1)
    .refine((ids) => new Set(ids).size === ids.length),
  origen: esquemaTipoOpcion.nullable(),
  destino: esquemaTipoOpcion.nullable(),
  antesDe: z.number().int().positive().nullable(),
});
