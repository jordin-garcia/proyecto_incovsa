"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Icono } from "@/componentes/comunes/iconos";
import { fmt } from "@/modulos/conversion/servicio";
import type { EntregaRutaItem } from "@/modulos/ruta/servicio";

export function FilaEntregaRuta({
  entrega,
  indice,
  deshabilitado,
}: {
  entrega: EntregaRutaItem;
  indice: number;
  deshabilitado?: boolean;
}) {
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: entrega.id,
    disabled: deshabilitado,
  });

  const estiloFila = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 3 : undefined,
    position: isDragging ? ("relative" as const) : undefined,
  };

  return (
    <tr ref={setNodeRef} style={estiloFila} data-id={entrega.id} className={isDragging ? "arrastrando" : ""}>
      <td>
        <span
          ref={setActivatorNodeRef}
          className="asa"
          aria-label={`Arrastre para cambiar orden de ${entrega.cliente}`}
          {...attributes}
          {...listeners}
        >
          <Icono nombre="asa" className="ico-s" />
        </span>
      </td>
      <td>
        <span className="parada-n">{indice + 1}</span>
      </td>
      <td>
        <b>{entrega.cliente}</b>
      </td>
      <td className="muted">{entrega.sector}</td>
      <td className="der kg">{fmt(entrega.totalKg)}</td>
    </tr>
  );
}
