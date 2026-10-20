import type { ReactNode } from "react";
import { Galeria } from "./Galeria";

export function EncabezadoPagina({
  eyebrow,
  titulo,
  texto,
  imagenes,
  miga,
}: {
  eyebrow: string;
  titulo: string;
  texto?: string;
  imagenes: string[];
  miga?: ReactNode;
}) {
  return (
    <section className="pag-cab">
      <div className="foto">
        <Galeria imagenes={imagenes} className="gal-fondo" />
      </div>
      <div className="velo" />
      <div className="wrap">
        {miga}
        <p className="eyebrow">{eyebrow}</p>
        <h1>{titulo}</h1>
        {texto && <p>{texto}</p>}
      </div>
    </section>
  );
}
