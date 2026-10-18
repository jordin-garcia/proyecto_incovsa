import type { ComponentProps } from "react";
import { FlechaSeleccion } from "@/componentes/comunes/iconos";
import { cn } from "@/lib/utils";

export function SelectNativo({ className, ...props }: ComponentProps<"select">) {
  return (
    <span className="sel-caja">
      <select className={cn("sel", className)} {...props} />
      <FlechaSeleccion />
    </span>
  );
}
