import { Galeria } from "./Galeria";

type Seccion = { texto: string; imagenes: string[] };

export function MisionVision({ mision, vision }: { mision: Seccion; vision: Seccion }) {
  return (
    <div className="mv">
      <div className="mv-fila">
        <div className="mv-txt">
          <p className="eyebrow">Misión</p>
          <h3>Nuestra misión</h3>
          <p>{mision.texto}</p>
        </div>
        {mision.imagenes.length ? (
          <Galeria imagenes={mision.imagenes} alt="Misión de INCOVSA" className="mv-gal" />
        ) : (
          <div className="mv-sin" aria-hidden="true" />
        )}
      </div>
      <div className="mv-fila inversa">
        {vision.imagenes.length ? (
          <Galeria imagenes={vision.imagenes} alt="Visión de INCOVSA" className="mv-gal" />
        ) : (
          <div className="mv-sin" aria-hidden="true" />
        )}
        <div className="mv-txt">
          <p className="eyebrow">Visión</p>
          <h3>Nuestra visión</h3>
          <p>{vision.texto}</p>
        </div>
      </div>
    </div>
  );
}
