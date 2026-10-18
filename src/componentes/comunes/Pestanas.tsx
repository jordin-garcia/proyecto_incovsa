"use client";

import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/componentes/ui/tabs";

export function Pestanas({
  opciones,
  valor,
  alCambiar,
  etiqueta,
}: {
  opciones: { valor: string; texto: string; contador?: number; contenido: ReactNode }[];
  valor: string;
  alCambiar: (valor: string) => void;
  etiqueta: string;
}) {
  return (
    <Tabs value={valor} onValueChange={alCambiar}>
      <TabsList aria-label={etiqueta}>
        {opciones.map((o) => (
          <TabsTrigger key={o.valor} value={o.valor}>
            {o.texto}
            {o.contador !== undefined && <span className="cont">{o.contador}</span>}
          </TabsTrigger>
        ))}
      </TabsList>
      {opciones.map((o) => (
        <TabsContent key={o.valor} value={o.valor}>
          {o.contenido}
        </TabsContent>
      ))}
    </Tabs>
  );
}
