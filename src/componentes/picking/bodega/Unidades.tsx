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
    <span className={`unid ${className}`.trim()}>
      {textoUnidades(u)}
      {resto !== null && <span className="resto">{`+ ${fmt(resto)} kg`}</span>}
    </span>
  );
}

export default Unidades;
