// Lógica central de conversión de kilogramos a unidades (RN-01, RN-02, RN-05, RN-21, RF-SL-22).
// Calcula en gramos enteros para evitar errores de redondeo de punto flotante (specs/16, decisión 1).
import { ErrorNegocio } from "@/lib/errores";

/** Tipo aceptado para cantidades en kg y Peso de Conversión exactos (texto o Decimal de Prisma, nunca Number). */
export type DecimalExacto = string | { toFixed: (dp?: number) => string; toString: () => string };

/** Resultado del cálculo de conversión. */
export interface ResultadoConversion {
  /** Cantidad de unidades físicas completas. */
  unidades: number;
  /** Resto en kilogramos que no completa una unidad física. */
  restoKg: number;
}

/**
 * Convierte un valor en kg (texto o Decimal de Prisma) a gramos enteros exactos.
 * Maneja hasta 3 decimales sin perder precisión por coma flotante IEEE 754.
 */
function aGramos(valor: DecimalExacto, nombreCampo: string): bigint {
  if (valor === null || valor === undefined) {
    throw new ErrorNegocio(`${nombreCampo} es requerido.`);
  }

  let texto: string;
  if (typeof valor === "string") {
    const s = valor.trim();
    if (s.includes(",")) {
      // Si incluye comas, solo se admiten separadores de miles válidos (ej: 1,000 o 1,000.500)
      if (!/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) {
        throw new ErrorNegocio(`${nombreCampo} no es un número válido.`);
      }
    }
    texto = s.replace(/,/g, "");
  } else if (typeof valor === "object" && valor !== null && "toFixed" in valor) {
    texto = (valor as { toFixed: (dp: number) => string }).toFixed(3);
  } else {
    texto = String(valor).trim().replace(/,/g, "");
  }

  if (texto === "" || !/^-?\d+(\.\d+)?$/.test(texto)) {
    throw new ErrorNegocio(`${nombreCampo} no es un número válido.`);
  }

  const esNegativo = texto.startsWith("-");
  const limpio = esNegativo ? texto.slice(1) : texto;
  const [enteroStr, decimalStr = ""] = limpio.split(".");

  if (decimalStr.length > 3) {
    throw new ErrorNegocio(`${nombreCampo} no puede tener más de 3 decimales.`);
  }

  const dec = (decimalStr + "000").slice(0, 3);
  const gramosEnteros = BigInt(enteroStr) * 1000n + BigInt(dec);

  return esNegativo ? -gramosEnteros : gramosEnteros;
}

/**
 * Formatea un número con separador de miles y hasta 3 decimales exactos,
 * eliminando ceros redundantes a la derecha, idéntico a `fmt()` de base.js.
 */
export function fmt(n: number | string | { toString: () => string } | null | undefined): string {
  if (n === null || n === undefined) return "—";
  let num: number;
  if (typeof n === "number") {
    num = n;
  } else if (typeof n === "string") {
    const s = n.trim().replace(/,/g, "");
    if (s === "") return "—";
    num = Number(s);
  } else if (typeof n === "object" && "toString" in n) {
    num = Number(n.toString().replace(/,/g, ""));
  } else {
    return "—";
  }

  if (isNaN(num)) return "—";

  const neg = num < 0;
  const r3 = Math.round(num * 1000) / 1000;
  const [e, d = ""] = Math.abs(r3).toFixed(3).split(".");
  const dec = d.replace(/0+$/, "");
  return (neg ? "−" : "") + e.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (dec ? "." + dec : "");
}

/**
 * Devuelve el texto en singular o plural para las unidades (ej: "1 unidad", "2 unidades").
 */
export function textoUnidades(u: number): string {
  return u === 1 ? "1 unidad" : `${fmt(u)} unidades`;
}

/**
 * Convierte una cantidad en kg a unidades completas y resto en kg dado el Peso de Conversión.
 *
 * @param cantidadKg Cantidad total en kilogramos (texto o Decimal de Prisma).
 * @param pesoConversionKg Peso en kg de una unidad física completa del producto (texto o Decimal de Prisma).
 * @returns { unidades, restoKg } con unidades = parte entera (cantidad ÷ peso) y resto = cantidad − unidades × peso.
 * @throws ErrorNegocio si el Peso de Conversión no es mayor que cero (RN-50) o si la cantidad es negativa.
 */
export function convertir(cantidadKg: DecimalExacto, pesoConversionKg: DecimalExacto): ResultadoConversion {
  const pesoGramos = aGramos(pesoConversionKg, "Peso de Conversión");
  if (pesoGramos <= 0n) {
    throw new ErrorNegocio("El Peso de Conversión debe ser mayor que cero.");
  }

  const cantidadGramos = aGramos(cantidadKg, "Cantidad");
  if (cantidadGramos < 0n) {
    throw new ErrorNegocio("La cantidad no puede ser negativa.");
  }

  const unidadesBigInt = cantidadGramos / pesoGramos;
  const restoGramos = cantidadGramos % pesoGramos;

  const unidades = Number(unidadesBigInt);
  const restoKg = Number(restoGramos) / 1000;

  return {
    unidades,
    restoKg,
  };
}

/**
 * Devuelve el texto descriptivo de la conversión (ej: "2 unidades + 10 kg" o "2 unidades" si es exacta).
 */
export function textoConversion(cantidadKg: DecimalExacto, pesoConversionKg: DecimalExacto): string {
  const { unidades, restoKg } = convertir(cantidadKg, pesoConversionKg);
  return restoKg > 0 ? `${textoUnidades(unidades)} + ${fmt(restoKg)} kg` : textoUnidades(unidades);
}

function esc(s: string): string {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c] || c,
  );
}

/**
 * Devuelve el fragmento HTML de la conversión como `htmlConversion()` del prototipo.
 */
export function htmlConversion(cantidadKg: DecimalExacto, pesoConversionKg: DecimalExacto): string {
  const { unidades, restoKg } = convertir(cantidadKg, pesoConversionKg);
  const resto = restoKg > 0 ? restoKg : null;
  return `<span class="unid">${esc(textoUnidades(unidades))}${resto !== null ? `<span class="resto">+ ${fmt(resto)} kg</span>` : ""}</span>`;
}
