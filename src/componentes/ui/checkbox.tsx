"use client";

import type { ComponentProps } from "react";
import { Checkbox as Primitive } from "radix-ui";
import { Icono } from "@/componentes/comunes/iconos";
import { cn } from "@/lib/utils";

export function Checkbox({ className, ...props }: ComponentProps<typeof Primitive.Root>) {
  return (
    <Primitive.Root className={cn("casilla", className)} {...props}>
      <Primitive.Indicator>
        <Icono nombre="check" />
      </Primitive.Indicator>
    </Primitive.Root>
  );
}
