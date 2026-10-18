import type { ComponentProps } from "react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

export type VarianteBoton = "primario" | "secundario" | "fantasma" | "peligro" | "lima";
const variantes = { primario: "btn-p", secundario: "btn-s", fantasma: "btn-g", peligro: "btn-d", lima: "btn-lima" };
const tamanos = { normal: "", pequeno: "btn-sm", grande: "btn-lg", icono: "btn-ico" };

// Composición asChild de shadcn/Radix: un enlace puede conservar el aspecto de botón.
export function Button({
  variant = "primario",
  size = "normal",
  asChild = false,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & {
  variant?: VarianteBoton;
  size?: keyof typeof tamanos;
  asChild?: boolean;
}) {
  const Componente = asChild ? Slot.Root : "button";
  return (
    <Componente
      {...(!asChild ? { type } : {})}
      className={cn("btn", variantes[variant], tamanos[size], className)}
      {...props}
    />
  );
}
