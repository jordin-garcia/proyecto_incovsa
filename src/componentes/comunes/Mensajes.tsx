"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Toast } from "radix-ui";
import { Icono } from "./iconos";

type TipoMensaje = "exito" | "aviso" | "error";
type MostrarMensaje = (texto: string, tipo?: TipoMensaje) => void;
const Contexto = createContext<MostrarMensaje | null>(null);

export function ProveedorMensajes({ children }: { children: ReactNode }) {
  const [mensajes, poner] = useState<{ id: number; texto: string; tipo: TipoMensaje }[]>([]);
  const secuencia = useRef(0);
  const mostrar = useCallback<MostrarMensaje>((texto, tipo = "exito") => {
    poner((m) => [...m, { id: ++secuencia.current, texto, tipo }]);
  }, []);
  return (
    <Contexto.Provider value={mostrar}>
      <Toast.Provider duration={4000} label="Aviso">
        {children}
        {mensajes.map((m) => (
          <Toast.Root
            key={m.id}
            className={`toast t-${m.tipo}`}
            onOpenChange={(abierto) => {
              if (!abierto) poner((lista) => lista.filter((x) => x.id !== m.id));
            }}
          >
            <Icono nombre={m.tipo === "error" ? "alerta" : m.tipo === "aviso" ? "info" : "check"} />
            <Toast.Title>{m.texto}</Toast.Title>
          </Toast.Root>
        ))}
        <Toast.Viewport className="avisos" label="Avisos ({hotkey})" />
      </Toast.Provider>
    </Contexto.Provider>
  );
}

export function useMensajes(): MostrarMensaje {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useMensajes necesita ProveedorMensajes");
  return contexto;
}
