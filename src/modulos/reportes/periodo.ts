import { z } from "zod";
import {
  fechaGuatemala,
  formatoFecha,
  inicioDelDiaGuatemala,
  finDelDiaGuatemala,
  semanaLunesADomingo,
} from "@/lib/fechas";

export const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
export const esquemaFiltro = z.object({
  tipo: z.enum(["dia", "semana", "mes", "anio", "rango"]).default("dia"),
  referencia: z.iso.date().optional(),
  mes: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
    .optional(),
  anio: z
    .string()
    .regex(/^[1-9]\d{3}$/)
    .optional(),
  desde: z.iso.date().optional(),
  hasta: z.iso.date().optional(),
});
export type FiltroPeriodo = z.output<typeof esquemaFiltro>;
export function resolverPeriodo(entrada: unknown, hoy = fechaGuatemala(new Date())) {
  const filtro = esquemaFiltro.parse(entrada);
  const referencia = filtro.referencia ?? hoy;
  const mes = filtro.mes ?? hoy.slice(0, 7);
  const anio = filtro.anio ?? hoy.slice(0, 4);
  const desde = filtro.desde ?? hoy;
  const hasta = filtro.hasta ?? hoy;
  let inicio = referencia,
    fin = referencia,
    texto = formatoFecha(referencia),
    nombre = "Despacho diario";
  if (filtro.tipo === "semana") {
    ({ inicio, fin } = semanaLunesADomingo(referencia));
    texto = `Semana del ${formatoFecha(inicio)} al ${formatoFecha(fin)}`;
    nombre = "Despacho semanal";
  } else if (filtro.tipo === "mes") {
    const [y, m] = mes.split("-").map(Number);
    inicio = `${mes}-01`;
    fin = `${mes}-${new Date(Date.UTC(y!, m!, 0)).getUTCDate()}`;
    texto = `${MESES[m! - 1]} de ${y}`;
    nombre = "Despacho mensual";
  } else if (filtro.tipo === "anio") {
    inicio = `${anio}-01-01`;
    fin = `${anio}-12-31`;
    texto = `Año ${anio}`;
    nombre = "Despacho anual";
  } else if (filtro.tipo === "rango") {
    [inicio, fin] = desde <= hasta ? [desde, hasta] : [hasta, desde];
    texto = `Del ${formatoFecha(inicio)} al ${formatoFecha(fin)}`;
    nombre = "Despacho del periodo";
  }
  return {
    filtro: { tipo: filtro.tipo, referencia, mes, anio, desde, hasta },
    inicio,
    fin,
    texto,
    nombre,
    desde: inicioDelDiaGuatemala(inicio),
    hasta: finDelDiaGuatemala(fin),
  };
}
export type Periodo = ReturnType<typeof resolverPeriodo>;
