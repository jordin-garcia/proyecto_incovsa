"use client";

import type { ComponentProps } from "react";
import { Dialog as Primitive } from "radix-ui";
import { Icono } from "@/componentes/comunes/iconos";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export const Dialog = Primitive.Root;
export const DialogTrigger = Primitive.Trigger;
export const DialogClose = Primitive.Close;
export const DialogTitle = Primitive.Title;
export const DialogDescription = Primitive.Description;

export function DialogContent({
  children,
  className,
  grande = false,
  ...props
}: ComponentProps<typeof Primitive.Content> & { grande?: boolean }) {
  return (
    <Primitive.Portal>
      <Primitive.Overlay className="modal-fondo" />
      <Primitive.Content className={cn("modal", grande && "modal-g", className)} {...props}>
        {children}
        <Primitive.Close asChild>
          <Button variant="fantasma" size="icono" className="modal-cerrar" aria-label="Cerrar">
            <Icono nombre="x" />
          </Button>
        </Primitive.Close>
      </Primitive.Content>
    </Primitive.Portal>
  );
}
