/**
 * Alto de cada línea para que la ruta o el pedido completo quepa en pantalla, sin desplazamiento.
 * Mismas reglas que `ajustar()` de tablero.js en el prototipo aprobado (specs/07, RF-SL-25, RF-SL-77).
 */
export interface Disposicion {
  columnas: 1 | 2;
  filas: number;
  /** Alto de cada línea en px, o `null` para dejar su alto natural (teléfono o sin líneas). */
  altoLinea: number | null;
  /** Tamaño de letra de cada línea en px, que escala todo su contenido. */
  letra: number | null;
}

export function calcularDisposicion({
  alto,
  ancho,
  separacion,
  lineas,
  anchoVentana,
}: {
  /** Alto útil del contenedor de las líneas, sin su relleno. */
  alto: number;
  /** Ancho del contenedor de las líneas. */
  ancho: number;
  /** Separación entre filas y columnas. */
  separacion: number;
  lineas: number;
  anchoVentana: number;
}): Disposicion {
  if (lineas === 0 || anchoVentana <= 720) return { columnas: 1, filas: lineas, altoLinea: null, letra: null };
  let columnas: 1 | 2 = 1;
  let filas = lineas;
  if ((alto - separacion * (lineas - 1)) / lineas < 50 && ancho > 900) {
    columnas = 2;
    filas = Math.ceil(lineas / 2);
  }
  const altoLinea = Math.max(44, Math.min(132, (alto - separacion * (filas - 1)) / filas));
  const anchoColumna = (ancho - (columnas - 1) * separacion) / columnas;
  const letra = Math.min(altoLinea * 0.2, anchoColumna / (columnas === 2 ? 29 : 44));
  return { columnas, filas, altoLinea, letra };
}
