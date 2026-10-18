"use client";

import { ToggleGroup } from "radix-ui";

export function BotonesSegmentados({
  opciones,
  valor,
  alCambiar,
  etiqueta,
}: {
  opciones: { valor: string; texto: string }[];
  valor: string;
  alCambiar: (valor: string) => void;
  etiqueta: string;
}) {
  return (
    <ToggleGroup.Root
      type="single"
      value={valor}
      onValueChange={(v) => {
        if (v) alCambiar(v);
      }}
      className="seg"
      aria-label={etiqueta}
    >
      {opciones.map((o) => (
        <ToggleGroup.Item key={o.valor} value={o.valor}>
          {o.texto}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
