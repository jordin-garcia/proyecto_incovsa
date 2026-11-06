import { Galeria } from "./Galeria";

type Seccion = { texto: string; imagenes: string[] };

/**
 * Una fila de misión o de visión (JG-34, pedido del Ing. William del 06/11): sin imágenes queda de una columna, solo
 * con el texto; sin texto conserva la etiqueta, el título y la galería; sin ninguno de los dos no se muestra.
 */
function Fila({
  seccion,
  etiqueta,
  titulo,
  inversa = false,
}: {
  seccion: Seccion;
  etiqueta: string;
  titulo: string;
  inversa?: boolean;
}) {
  if (!seccion.texto && !seccion.imagenes.length) return null;
  const texto = (
    <div className="mv-txt">
      <p className="eyebrow">{etiqueta}</p>
      <h3>{titulo}</h3>
      {seccion.texto && <p className="mv-parrafo">{seccion.texto}</p>}
    </div>
  );
  const galeria = seccion.imagenes.length ? (
    <Galeria imagenes={seccion.imagenes} alt={`${etiqueta} de INCOVSA`} className="mv-gal" />
  ) : null;
  return (
    <div className={`mv-fila${inversa ? " inversa" : ""}${galeria ? "" : " una-col"}`}>
      {inversa ? galeria : texto}
      {inversa ? texto : galeria}
    </div>
  );
}

export function MisionVision({ mision, vision }: { mision: Seccion; vision: Seccion }) {
  return (
    <div className="mv">
      <Fila seccion={mision} etiqueta="Misión" titulo="Nuestra misión" />
      <Fila seccion={vision} etiqueta="Visión" titulo="Nuestra visión" inversa />
    </div>
  );
}
