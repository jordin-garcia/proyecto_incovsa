"use client";

import type { ComponentProps } from "react";
import { Select as Primitive } from "radix-ui";
import { FlechaSeleccion, Icono } from "@/componentes/comunes/iconos";
import { cn } from "@/lib/utils";

export const Select = Primitive.Root;
export const SelectValue = Primitive.Value;
export function SelectTrigger({ children, className, ...props }: ComponentProps<typeof Primitive.Trigger>) {
  return (
    <Primitive.Trigger className={cn("sel select-trigger", className)} {...props}>
      {children}
      <Primitive.Icon>
        <FlechaSeleccion />
      </Primitive.Icon>
    </Primitive.Trigger>
  );
}
export function SelectContent({ children, className, ...props }: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Content position="popper" sideOffset={4} className={cn("select-contenido", className)} {...props}>
        <Primitive.ScrollUpButton className="select-desplazar">▲</Primitive.ScrollUpButton>
        <Primitive.Viewport>{children}</Primitive.Viewport>
        <Primitive.ScrollDownButton className="select-desplazar">▼</Primitive.ScrollDownButton>
      </Primitive.Content>
    </Primitive.Portal>
  );
}
export function SelectItem({ children, className, ...props }: ComponentProps<typeof Primitive.Item>) {
  return (
    <Primitive.Item className={cn("select-opcion", className)} {...props}>
      <Primitive.ItemText>{children}</Primitive.ItemText>
      <Primitive.ItemIndicator>
        <Icono nombre="check" className="ico-s" />
      </Primitive.ItemIndicator>
    </Primitive.Item>
  );
}
