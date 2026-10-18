import React from "react";
import { convertir, fmt, textoUnidades, type DecimalExacto } from "@/modulos/conversion/servicio";

export type UnidadesProps =
  | {
      /** Cantidad en kilogramos. Debe acompañarse de pesoConversionKg. */
      cantidadKg: DecimalExacto;
      /** Peso de Conversión en kilogramos. */
      pesoConversionKg: DecimalExacto;
      unidades?: never;
      restoKg?: never;
      className?: string;
    }
  | {
      cantidadKg?: never;
      pesoConversionKg?: never;
      /** Unidades completas ya calculadas. */
      unidades: number;
      /** Resto en kilogramos ya calculado. */
      restoKg?: number;
      className?: string;
    };

/**
 * Componente visual que muestra la conversión de kilogramos a unidades físicas,
 * con unidades destacadas y el resto aparte, fiel a `htmlConversion()` de base.js
 * y con los estilos del design system (`.unid` y `.unid .resto` de estilos.css:390-391).
 */
export function Unidades(props: UnidadesProps) {
  const { className = "" } = props;
  let u: number;
  let r: number;

  if (props.unidades !== undefined) {
    u = props.unidades;
    r = props.restoKg ?? 0;
  } else {
    const res = convertir(props.cantidadKg, props.pesoConversionKg);
    u = res.unidades;
    r = res.restoKg;
  }

  const resto = r > 0 ? r : null;

  return (
    <span
      className={`unid font-bold font-mono text-[15px] leading-none text-[#1C1D1C] ${className}`.trim()}
      style={{
        font: "700 15px/1 var(--f-mono, ui-monospace, monospace)",
        color: "var(--g900, #1C1D1C)",
      }}
    >
      {textoUnidades(u)}
      {resto !== null && (
        <span
          className="resto ml-[6px] inline-block rounded-[6px] bg-[#EEF6E2] px-[7px] py-[4px] text-[12.5px] text-[#45691A]"
          style={{
            background: "#EEF6E2",
            color: "#45691A",
          }}
        >
          {`+ ${fmt(resto)} kg`}
        </span>
      )}
    </span>
  );
}

export default Unidades;
