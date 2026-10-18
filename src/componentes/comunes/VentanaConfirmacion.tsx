"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Button, type VarianteBoton } from "@/componentes/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/componentes/ui/dialog";
import { ErrorNegocio, MENSAJE_ERROR_GENERAL } from "@/lib/errores";
import { useMensajes } from "./Mensajes";

export function VentanaConfirmacion({
  titulo,
  texto,
  textoConfirmar,
  alConfirmar,
  children,
  variante = "primario",
}: {
  titulo: string;
  texto: ReactNode;
  textoConfirmar: string;
  alConfirmar: () => void | Promise<void>;
  children: ReactNode;
  variante?: VarianteBoton;
}) {
  const [abierta, abrir] = useState(false);
  const [ocupada, ocupar] = useState(false);
  const mensaje = useMensajes();
  return (
    <Dialog
      open={abierta}
      onOpenChange={(v) => {
        if (!ocupada) abrir(v);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        onEscapeKeyDown={(e) => {
          if (ocupada) e.preventDefault();
        }}
      >
        <div className="modal-cab">
          <DialogTitle>{titulo}</DialogTitle>
        </div>
        <div className="modal-cuerpo">
          <DialogDescription className="confirmacion-texto" asChild>
            <div>{texto}</div>
          </DialogDescription>
        </div>
        <div className="modal-pie">
          <DialogClose asChild>
            <Button variant="secundario" disabled={ocupada}>
              Volver
            </Button>
          </DialogClose>
          <Button
            variant={variante}
            disabled={ocupada}
            onClick={async () => {
              ocupar(true);
              try {
                await alConfirmar();
                abrir(false);
              } catch (error) {
                mensaje(error instanceof ErrorNegocio ? error.message : MENSAJE_ERROR_GENERAL, "error");
              } finally {
                ocupar(false);
              }
            }}
          >
            {textoConfirmar}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
