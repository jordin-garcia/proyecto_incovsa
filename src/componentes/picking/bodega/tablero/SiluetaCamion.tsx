import { fmt } from "@/modulos/conversion/servicio";

// Medidas de siluetaCamion() en base.js del prototipo: caja de 196 de largo que empieza en x = 76.
const LARGO = 196;
const X0 = 76;
const ANCHO = X0 + LARGO + 14;

function Rueda({ cx }: { cx: number }) {
  return (
    <>
      <circle className="cam-llanta" cx={cx} cy="92" r="13" />
      <circle className="cam-rin" cx={cx} cy="92" r="5.5" />
    </>
  );
}

/**
 * Silueta del camión grande, la misma para todos los camiones cualquiera que sea su capacidad (specs/07, CAM-94).
 * Los colores de cada modo están en tablero.css (verdes en el modo claro, grises en el oscuro).
 */
export function SiluetaCamion({ capacidadKg }: { capacidadKg: string }) {
  return (
    <svg
      className="silueta"
      data-modelo="grande"
      viewBox={`0 0 ${ANCHO + 6} 116`}
      role="img"
      aria-label={`Camión de ${fmt(capacidadKg)} kg`}
    >
      <ellipse className="cam-sombra" cx={ANCHO / 2 + 4} cy="107" rx={ANCHO / 2 - 6} ry="4.5" />
      <rect className="cam-caja" x={X0} y="14" width={LARGO} height="66" rx="4" />
      <rect className="cam-franja" x={X0} y="62" width={LARGO} height="7" />
      <rect className="cam-lima" x={X0} y="69" width={LARGO} height="2.5" />
      <text className="cam-marca" x={X0 + LARGO / 2} y="46" textAnchor="middle">
        INCOVSA
      </text>
      <path className="cam-caja" d="M16 82V46c0-6 3-10 9-12l16-7h28v55z" />
      <path className="cam-ventana" d="M24 49l19-14h20v17H24z" />
      <rect className="cam-franja" x="16" y="66" width="53" height="5" />
      <rect className="cam-chasis" x="10" y="80" width={X0 + LARGO - 4} height="8" rx="2" />
      <rect className="cam-lima" x="12" y="60" width="7" height="5" rx="1" />
      <Rueda cx={42} />
      <Rueda cx={X0 + LARGO - 34} />
      <Rueda cx={X0 + LARGO - 62} />
    </svg>
  );
}
