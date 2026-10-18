import React from "react";
import { convertir, fmt, textoUnidades, type DecimalExacto } from "@/modulos/conversion/servicio";

export interface UnidadesProps {
  /** Cantidad en kilogramos. Si se provee junto a pesoConversionKg, calcula la conversión. */
  cantidadKg?: DecimalExacto;
  /** Peso de Conversión en kilogramos. */
  pesoConversionKg?: DecimalExacto;
  /** Unidades completas ya calculadas (opcional si se pasa cantidadKg y pesoConversionKg). */
  unidades?: number;
  /** Resto en kilogramos ya calculado (opcional si se pasa cantidadKg y pesoConversionKg). */
  restoKg?: number;
  /** Clases adicionales CSS para el contenedor. */
  className?: string;
}

/**
 * Componente visual que muestra la conversión de kilogramos a unidades físicas,
 * con unidades destacadas y el resto aparte, idéntico a `htmlConversion()` del prototipo.
 */
export function Unidades({
  cantidadKg,
  pesoConversionKg,
  unidades: unidadesProp,
  restoKg: restoKgProp,
  className = "",
}: UnidadesProps) {
  let u = unidadesProp ?? 0;
  let r = restoKgProp ?? 0;

  if (unidadesProp === undefined && cantidadKg !== undefined && pesoConversionKg !== undefined) {
    const res = convertir(cantidadKg, pesoConversionKg);
    u = res.unidades;
    r = res.restoKg;
  }

  const resto = r > 0 ? r : null;

  return (
    <span className={`unid font-bold font-mono text-[#1b2a1a] ${className}`.trim()}>
      {textoUnidades(u)}
      {resto !== null && (
        <span className="resto ml-1.5 inline-block rounded-md bg-[#EEF6E2] px-1.5 py-0.5 text-xs font-semibold text-[#45691A]">
          {`+ ${fmt(resto)} kg`}
        </span>
      )}
    </span>
  );
}

export default Unidades;
