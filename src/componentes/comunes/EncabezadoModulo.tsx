import type { ReactNode } from "react";

export function EncabezadoModulo({
  eyebrow,
  titulo,
  instruccion,
  acciones,
}: {
  eyebrow: string;
  titulo: string;
  instruccion?: string;
  acciones?: ReactNode;
}) {
  return (
    <div className="cab-pag cab-fx">
      <div className="cab-fx-t">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{titulo}</h1>
        </div>
        {instruccion && <p className="cab-fx-txt">{instruccion}</p>}
      </div>
      {acciones && <div className="acc">{acciones}</div>}
    </div>
  );
}
