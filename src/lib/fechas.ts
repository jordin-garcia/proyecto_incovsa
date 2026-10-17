// Fechas en la hora de Guatemala (specs/16, decisiones 6 y 50). En la base de datos todo es UTC (timestamptz); los días,
// las semanas de lunes a domingo y los rangos se calculan aquí. En pantalla: dd/mm/aaaa y HH:MM de 24 horas.
//
// Un "día" es un texto AAAA-MM-DD que representa ese día del calendario de Guatemala. Un "instante" es un Date, una
// marca de tiempo en milisegundos o un texto ISO con zona. Las funciones que reciben un instante también aceptan un día.
import { TZDate, tz } from "@date-fns/tz";
import { endOfDay, endOfWeek, format, startOfDay, startOfWeek } from "date-fns";

export const ZONA_GUATEMALA = "America/Guatemala";

/** Día del calendario de Guatemala, como AAAA-MM-DD. */
export type Dia = string;
export type Instante = Date | number | string;

const enGuatemala = { in: tz(ZONA_GUATEMALA) };
const PATRON_DIA = /^(\d{4})-(\d{2})-(\d{2})$/;
const dosDigitos = (n: number) => String(n).padStart(2, "0");

/** Devuelve el año, el mes y el día si existen en el calendario; si no, null. */
function partesDeDia(anio: number, mes: number, dia: number): { anio: number; mes: number; dia: number } | null {
  if (anio < 1 || mes < 1 || mes > 12 || dia < 1) return null;
  const diasDelMes = new Date(Date.UTC(anio, mes, 0)).getUTCDate();
  return dia <= diasDelMes ? { anio, mes, dia } : null;
}

/** Medianoche de Guatemala del día AAAA-MM-DD. Lanza RangeError si el día no existe. */
function inicioDeDia(dia: Dia): TZDate {
  const m = PATRON_DIA.exec(dia);
  const partes = m && partesDeDia(Number(m[1]), Number(m[2]), Number(m[3]));
  if (!partes) throw new RangeError(`Día inválido: "${dia}" (se espera AAAA-MM-DD)`);
  return new TZDate(partes.anio, partes.mes - 1, partes.dia, ZONA_GUATEMALA);
}

/**
 * Un texto AAAA-MM-DD es un día de Guatemala (su medianoche), no la medianoche UTC que daría new Date(). Lanza
 * RangeError si el valor no es un instante válido.
 */
function aInstante(valor: Instante): Date {
  if (typeof valor === "string" && PATRON_DIA.test(valor)) return inicioDeDia(valor);
  const instante = new Date(valor);
  if (Number.isNaN(+instante)) throw new RangeError(`Instante inválido: "${String(valor)}"`);
  return instante;
}

/** Día de Guatemala de un instante, como AAAA-MM-DD. Ejemplo: 2026-10-18T05:30:00Z → "2026-10-17". */
export function fechaGuatemala(instante: Instante): Dia {
  return format(aInstante(instante), "yyyy-MM-dd", enGuatemala);
}

/** Primer milisegundo (00:00:00.000 en Guatemala) del día o del día de Guatemala del instante. */
export function inicioDelDiaGuatemala(diaOInstante: Dia | Date): Date {
  return new Date(+startOfDay(aInstante(diaOInstante), enGuatemala));
}

/** Último milisegundo (23:59:59.999 en Guatemala) del día o del día de Guatemala del instante. */
export function finDelDiaGuatemala(diaOInstante: Dia | Date): Date {
  return new Date(+endOfDay(aInstante(diaOInstante), enGuatemala));
}

/** Semana de lunes a domingo que contiene el día. Ejemplo: "2026-10-21" → { inicio: "2026-10-19", fin: "2026-10-25" }. */
export function semanaLunesADomingo(diaOInstante: Dia | Date): { inicio: Dia; fin: Dia } {
  const instante = aInstante(diaOInstante);
  const opciones = { ...enGuatemala, weekStartsOn: 1 } as const;
  return {
    inicio: fechaGuatemala(startOfWeek(instante, opciones)),
    fin: fechaGuatemala(endOfWeek(instante, opciones)),
  };
}

/** Fecha para mostrar: dd/mm/aaaa en la hora de Guatemala. */
export function formatoFecha(instante: Instante): string {
  return format(aInstante(instante), "dd/MM/yyyy", enGuatemala);
}

/** Hora para mostrar: HH:MM de 24 horas en la hora de Guatemala. */
export function formatoHora(instante: Instante): string {
  return format(aInstante(instante), "HH:mm", enGuatemala);
}

/**
 * Lee una fecha escrita como dd/mm/aaaa (también d/m/aaaa o ddmmaaaa, como el campo de fecha del prototipo) y
 * devuelve el día AAAA-MM-DD, o null si no tiene ese formato o no existe (por ejemplo 31/02/2026).
 */
export function leerFecha(texto: string): Dia | null {
  const t = texto.trim();
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t) ?? /^(\d{2})(\d{2})(\d{4})$/.exec(t);
  const partes = m && partesDeDia(Number(m[3]), Number(m[2]), Number(m[1]));
  return partes ? `${partes.anio}-${dosDigitos(partes.mes)}-${dosDigitos(partes.dia)}` : null;
}

/**
 * Lee una hora escrita como HH:MM (también H:MM o HHMM, como el prototipo) y la devuelve como HH:MM, o null si no
 * tiene ese formato o no existe (por ejemplo 25:90).
 */
export function leerHora(texto: string): string | null {
  const m = /^(\d{1,2}):?(\d{2})$/.exec(texto.trim());
  if (!m) return null;
  const horas = Number(m[1]);
  const minutos = Number(m[2]);
  return horas < 24 && minutos < 60 ? `${dosDigitos(horas)}:${dosDigitos(minutos)}` : null;
}
