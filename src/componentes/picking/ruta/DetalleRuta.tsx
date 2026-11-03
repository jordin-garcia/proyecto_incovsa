"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ChipEstado } from "@/componentes/comunes/ChipEstado";
import { Icono } from "@/componentes/comunes/iconos";
import { VentanaConfirmacion } from "@/componentes/comunes/VentanaConfirmacion";
import { formatoFecha, formatoHora } from "@/lib/fechas";
import { fmt } from "@/modulos/conversion/servicio";
import type { RutaEnCursoItem, EntregaRutaItem } from "@/modulos/ruta/servicio";
import { FilaEntregaRuta } from "./FilaEntregaRuta";

export function DetalleRuta({
  ruta,
  entregas,
  pendiente,
  alReordenar,
  alEntregar,
}: {
  ruta: RutaEnCursoItem;
  entregas: EntregaRutaItem[];
  pendiente: boolean;
  alReordenar: (nuevosIds: number[]) => void;
  alEntregar: () => Promise<void>;
}) {
  const sensores = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 380, tolerance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: { start: ["Space"], end: ["Space"], cancel: ["Escape"] },
    }),
  );

  const alTerminarArrastre = (evento: DragEndEvent) => {
    const { active, over } = evento;
    if (!over || active.id === over.id) return;

    const viejoIndice = entregas.findIndex((e) => e.id === active.id);
    const nuevoIndice = entregas.findIndex((e) => e.id === over.id);
    if (viejoIndice === -1 || nuevoIndice === -1) return;

    const copia = [...entregas];
    const [elemento] = copia.splice(viejoIndice, 1);
    copia.splice(nuevoIndice, 0, elemento);

    alReordenar(copia.map((e) => e.id));
  };

  const fechaDia =
    ruta.fechaEnvio instanceof Date ? ruta.fechaEnvio.toISOString().slice(0, 10) : String(ruta.fechaEnvio).slice(0, 10);

  const textoProgramada = ruta.programadoPara
    ? `${formatoFecha(ruta.programadoPara)} · ${formatoHora(ruta.programadoPara)}`
    : "—";

  return (
    <section className="tarjeta" style={{ overflow: "hidden" }}>
      <div className="bloque-cab">
        <div>
          <h3 style={{ fontSize: "20px" }}>
            Ruta {ruta.numero} · {formatoFecha(fechaDia)}
          </h3>
          <p>El número y la fecha se asignaron cuando Facturación la envió a Bodega.</p>
        </div>
        <ChipEstado estado="RUTA" />
      </div>

      <div className="ruta-datos">
        <div>
          <small>Ruta</small>
          <b>{ruta.numero}</b>
        </div>
        <div>
          <small>Programada</small>
          <b>{textoProgramada}</b>
        </div>
        <div>
          <small>Camión</small>
          <b>{ruta.camion?.identificacion || "—"}</b>
        </div>
        <div>
          <small>Piloto</small>
          <b>{ruta.piloto?.name || "—"}</b>
        </div>
      </div>

      <div className="tabla-caja">
        <DndContext
          id={`dnd-ruta-${ruta.id}`}
          sensors={sensores}
          collisionDetection={closestCenter}
          onDragEnd={alTerminarArrastre}
        >
          <table className="tabla">
            <thead>
              <tr>
                <th style={{ width: "34px" }} />
                <th style={{ width: "70px" }}>Orden</th>
                <th>Cliente</th>
                <th>Sector</th>
                <th className="der">Total (kg)</th>
              </tr>
            </thead>
            <SortableContext items={entregas.map((e) => e.id)} strategy={verticalListSortingStrategy}>
              <tbody data-paradas>
                {entregas.map((entrega, indice) => (
                  <FilaEntregaRuta key={entrega.id} entrega={entrega} indice={indice} deshabilitado={pendiente} />
                ))}
              </tbody>
            </SortableContext>
            <tfoot>
              <tr>
                <td />
                <td colSpan={3}>Total de la ruta</td>
                <td className="der kg">{fmt(ruta.totalKg)}</td>
              </tr>
            </tfoot>
          </table>
        </DndContext>
      </div>

      <div className="ped-pie" style={{ justifyContent: "flex-end" }}>
        <VentanaConfirmacion
          titulo={`Entregar Ruta ${ruta.numero}`}
          texto={
            <>
              Se registra la entrega completa a los {entregas.length} clientes y la ruta pasa a <b>Entregado</b>. Se
              guarda este recorrido:{" "}
              {entregas.map((c, i) => (
                <span key={c.id}>
                  <b>{i + 1}.</b> {c.cliente}
                  {i < entregas.length - 1 ? " · " : ""}
                </span>
              ))}
              .
            </>
          }
          textoConfirmar="Ruta Entregada"
          alConfirmar={alEntregar}
        >
          <button type="button" className="btn btn-p btn-lg" data-entregar disabled={pendiente}>
            <Icono nombre="check" /> Ruta Entregada
          </button>
        </VentanaConfirmacion>
      </div>
    </section>
  );
}
