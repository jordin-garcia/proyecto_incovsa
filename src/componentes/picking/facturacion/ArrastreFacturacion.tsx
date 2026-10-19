"use client";
import type { HTMLAttributes, ReactNode } from "react";
import { useDroppable, type KeyboardCoordinateGetter } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import estilos from "./FacturacionTablero.module.css";

export const coordenadasTeclado: KeyboardCoordinateGetter = (evento, { context }) => {
  const { active, collisionRect, droppableContainers, droppableRects } = context;
  if (!active || !collisionRect || !evento.code.startsWith("Arrow")) return;
  evento.preventDefault();
  const zonaActual = context.over?.data.current?.zona ?? active.data.current?.zona ?? "tablero";
  const zonas = ["tablero", "camion", "recoge"];
  let destino;
  if (evento.code === "ArrowRight" || evento.code === "ArrowLeft") {
    const indice = zonas.indexOf(zonaActual);
    const zona = zonas[(indice + (evento.code === "ArrowRight" ? 1 : 2)) % 3];
    destino = droppableContainers.get(`zona-${zona}`);
  } else {
    const elementos = droppableContainers
      .getEnabled()
      .filter((c) => c.data.current?.zona === zonaActual && typeof c.id === "number");
    const indice = elementos.findIndex((c) => c.id === (context.over?.id ?? active.id));
    destino = elementos[indice + (evento.code === "ArrowDown" ? 1 : -1)];
  }
  const rect = destino && droppableRects.get(destino.id);
  if (rect)
    return {
      x: rect.left + rect.width / 2 - collisionRect.width / 2,
      y: rect.top + rect.height / 2 - collisionRect.height / 2,
    };
};

export function ZonaArrastre({
  zona,
  children,
  className,
  referencia,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  zona: string;
  children: ReactNode;
  referencia?: (n: HTMLDivElement | null) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `zona-${zona}`, data: { zona } });
  return (
    <div
      {...props}
      ref={(n) => {
        setNodeRef(n);
        referencia?.(n);
      }}
      className={`${className ?? ""} ${isOver ? estilos.zonaSobre : ""}`}
      data-testid={zona === "tablero" ? "tablero-pedidos" : `zona-${zona}`}
    >
      {children}
    </div>
  );
}

export function PedidoArrastrable({
  idPedido,
  zona,
  children,
  className,
  onKeyDown,
  ...props
}: HTMLAttributes<HTMLElement> & { idPedido: number; zona: string; children: ReactNode }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging, isOver } = useSortable({
    id: idPedido,
    data: { zona },
  });
  return (
    <article
      {...attributes}
      {...listeners}
      {...props}
      data-pedido-id={idPedido}
      data-arrastrando={isDragging}
      data-sobre={isOver}
      ref={setNodeRef}
      tabIndex={0}
      className={`${className ?? ""} ${isDragging ? estilos.arrastrando : ""}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onKeyDown={(evento) => {
        if (evento.key === "Enter") {
          onKeyDown?.(evento);
          return;
        }
        listeners?.onKeyDown?.(evento);
      }}
    >
      {children}
    </article>
  );
}
