import type { ReactNode } from "react";
import { Icono } from "./iconos";

export function Aviso({
  tipo = "verde",
  children,
}: {
  tipo?: "verde" | "ambar" | "rojo" | "azul";
  children: ReactNode;
}) {
  const clases = { verde: "v", ambar: "a", rojo: "r", azul: "z" };
  return (
    <div className={`aviso aviso-${clases[tipo]}`} role={tipo === "rojo" ? "alert" : "status"}>
      <Icono nombre={tipo === "rojo" || tipo === "ambar" ? "alerta" : "info"} />
      <div>{children}</div>
    </div>
  );
}
