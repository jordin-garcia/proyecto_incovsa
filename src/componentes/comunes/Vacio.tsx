import type { ReactNode } from "react";
import { Icono, type NombreIcono } from "./iconos";

export function Vacio({
  titulo,
  children,
  icono = "archivo",
}: {
  titulo: string;
  children?: ReactNode;
  icono?: NombreIcono;
}) {
  return (
    <div className="vacio">
      <Icono nombre={icono} />
      <h2>{titulo}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}
