"use client";

import { useTransition } from "react";
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
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Icono } from "@/componentes/comunes/iconos";
import { VentanaConfirmacion } from "@/componentes/comunes/VentanaConfirmacion";
import { useMensajes } from "@/componentes/comunes/Mensajes";
import { MENSAJE_ERROR_GENERAL } from "@/lib/errores";
import { formatoFecha, formatoHora } from "@/lib/fechas";
import { fmt } from "@/modulos/conversion/servicio";
import { Unidades } from "./Unidades";
import { despacharAccion } from "@/modulos/bodega/acciones";

export interface EnvioBodegaItem {
  id: number;
  tipo: string;
  numero: number;
  fechaEnvio: Date | string;
  programadoPara: Date | string;
  camion: { id: number; identificacion: string } | null;
  piloto: { id: string; name: string } | null;
  totalKg: number;
  clientesContador: number;
  lineasContador: number;
  lineasListas: number;
  todoListo: boolean;
  lineas: Array<{
    id: number;
    producto: string;
    lote: string;
    /** Texto exacto del Decimal: la conversión no admite Number (RN-01, auditoría H-16). */
    pesoConversionKg: string;
    cantidadKg: string;
    marcado: boolean;
    posicion: number;
  }>;
}

interface TarjetaEnvioProps {
  envio: EnvioBodegaItem;
  prioridad: number;
  alVerDetalle: (envioId: number) => void;
  alActualizar: () => void;
  alMarcarLinea: (envioId: number, lineaId: number, marcado: boolean) => void;
  alMarcarTodo: (envioId: number, marcado: boolean) => void;
  alOrdenarPorPeso: (envioId: number) => void;
  alReordenarLineas: (envioId: number, lineaIds: number[]) => void;
}

function FilaPreparacion({
  linea,
  pendiente,
  alMarcar,
}: {
  linea: EnvioBodegaItem["lineas"][number];
  pendiente: boolean;
  alMarcar: (lineaId: number, estadoActual: boolean) => void;
}) {
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: linea.id,
  });

  const estiloFila = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 3 : undefined,
    position: isDragging ? ("relative" as const) : undefined,
  };

  return (
    <tr
      ref={setNodeRef}
      style={estiloFila}
      data-id={linea.id}
      className={`${linea.marcado ? "lista" : ""} ${isDragging ? "arrastrando" : ""}`}
    >
      <td>
        <span
          ref={setActivatorNodeRef}
          className="asa"
          aria-label={`Arrastre para cambiar orden de ${linea.producto}`}
          {...attributes}
          {...listeners}
        >
          <Icono nombre="asa" className="ico-s" />
        </span>
      </td>
      <td className="cod">{linea.producto}</td>
      <td>
        <span className={`lote ${linea.lote ? "" : "sin"}`}>{linea.lote ? `Lote ${linea.lote}` : "Sin lote"}</span>
      </td>
      <td className="der kg">{fmt(linea.cantidadKg)}</td>
      <td>
        <Unidades cantidadKg={linea.cantidadKg} pesoConversionKg={linea.pesoConversionKg} />
        <span className="muted mono" style={{ fontSize: "11.5px", marginLeft: "4px" }}>
          ÷ {fmt(linea.pesoConversionKg)}
        </span>
      </td>
      <td className="cen">
        <button
          type="button"
          className={`marca ${linea.marcado ? "on" : ""}`}
          aria-pressed={linea.marcado}
          aria-label="Marcar como listo"
          onClick={() => alMarcar(linea.id, linea.marcado)}
          disabled={pendiente}
        >
          <Icono nombre="check" />
        </button>
      </td>
    </tr>
  );
}

export function TarjetaEnvio({
  envio,
  prioridad,
  alVerDetalle,
  alActualizar,
  alMarcarLinea,
  alMarcarTodo,
  alOrdenarPorPeso,
  alReordenarLineas,
}: TarjetaEnvioProps) {
  const mostrarMensaje = useMensajes();
  const [pendiente, startTransition] = useTransition();

  const {
    setNodeRef: setTarjetaRef,
    setActivatorNodeRef: setActivatorTarjetaRef,
    attributes: atributosTarjeta,
    listeners: escuchadoresTarjeta,
    transform: transformTarjeta,
    transition: transitionTarjeta,
    isDragging: estaArrastrandoTarjeta,
  } = useSortable({ id: envio.id });

  const sensoresLineas = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 380, tolerance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: { start: ["Space"], end: ["Space"], cancel: ["Escape"] },
    }),
  );

  const esRuta = envio.tipo === "ruta";
  const etiqueta = (esRuta ? "Ruta " : "Pedido ") + envio.numero;
  const destino = esRuta ? "En Ruta" : "Despachado";
  const todasMarcadas = envio.lineas.length > 0 && envio.lineas.every((l) => l.marcado);

  const despachar = async () => {
    startTransition(async () => {
      // Una falla de red se informa con un mensaje y la pantalla sigue en uso (auditoría H-24).
      try {
        const res = await despacharAccion({ envioId: envio.id });
        if (!res.ok) {
          mostrarMensaje(res.error, "error");
        } else {
          mostrarMensaje(`${etiqueta} → ${destino}.`, "exito");
          alActualizar();
        }
      } catch {
        mostrarMensaje(MENSAJE_ERROR_GENERAL, "error");
      }
    });
  };

  const alTerminarArrastreLineas = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const viejosIds = envio.lineas.map((l) => l.id);
    const viejoIndice = viejosIds.indexOf(Number(active.id));
    const nuevoIndice = viejosIds.indexOf(Number(over.id));
    if (viejoIndice === -1 || nuevoIndice === -1) return;

    const nuevosIds = arrayMove(viejosIds, viejoIndice, nuevoIndice);
    alReordenarLineas(envio.id, nuevosIds);
  };

  const porcentajeAvance = envio.lineasContador > 0 ? (envio.lineasListas / envio.lineasContador) * 100 : 0;

  const estiloTarjeta = {
    transform: CSS.Transform.toString(transformTarjeta),
    transition: transitionTarjeta,
    zIndex: estaArrastrandoTarjeta ? 2 : undefined,
  };

  return (
    <article
      ref={setTarjetaRef}
      style={estiloTarjeta}
      className={`tarjeta ped ${estaArrastrandoTarjeta ? "arrastrando" : ""}`}
      data-id={envio.id}
    >
      <div className="ped-cab">
        <span
          ref={setActivatorTarjetaRef}
          className="asa asa-ped"
          title="Arrastre para cambiar la prioridad"
          aria-label={`Arrastre para cambiar la prioridad de ${etiqueta}`}
          {...atributosTarjeta}
          {...escuchadoresTarjeta}
        >
          <Icono nombre="asa" />
        </span>

        <div className={`ped-num ${esRuta ? "" : "recoge"}`}>
          <div style={{ textAlign: "center" }}>
            <small>{esRuta ? "RUTA" : "PEDIDO"}</small>
            <br />
            {envio.numero}
          </div>
        </div>

        <div>
          <h3>
            Prioridad {prioridad} · {esRuta ? "Envío en camión" : "Cliente recoge en bodega"}
          </h3>
          <div className="ped-meta">
            <span className="prog">
              <Icono nombre="calendario" className="ico-s" />
              Programada {formatoFecha(envio.programadoPara)} · {formatoHora(envio.programadoPara)}
            </span>
            {esRuta ? (
              <>
                <span>
                  <Icono nombre="camion" className="ico-s" />
                  {envio.camion?.identificacion ?? "—"}
                </span>
                <span>
                  <Icono nombre="usuario" className="ico-s" />
                  {envio.piloto?.name ?? "—"}
                </span>
              </>
            ) : (
              <span>
                <Icono nombre="edificio" className="ico-s" />
                El cliente recoge
              </span>
            )}
            <span>
              <Icono nombre="usuarios" className="ico-s" />
              {envio.clientesContador} cliente(s)
            </span>
            <span>
              <Icono nombre="caja" className="ico-s" />
              {fmt(envio.totalKg)} kg
            </span>
          </div>
        </div>

        <div className="ped-avance">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Preparadas</span>
            <span className="mono">
              {envio.lineasListas} de {envio.lineasContador}
            </span>
          </div>
          <div className="medidor">
            <i style={{ width: `${porcentajeAvance}%` }} />
          </div>
        </div>
      </div>

      <div className="ped-herr">
        <button type="button" className="btn btn-s btn-sm" onClick={() => alVerDetalle(envio.id)} disabled={pendiente}>
          <Icono nombre="lista" className="ico-s" /> Detalle de {esRuta ? "Ruta" : "Pedido"}
        </button>

        <button
          type="button"
          className="btn btn-s btn-sm"
          onClick={() => alOrdenarPorPeso(envio.id)}
          title="Ordenar las filas de mayor a menor peso"
          disabled={pendiente}
        >
          <Icono nombre="grafica" className="ico-s" /> Ordenar por peso
        </button>

        <button
          type="button"
          className="btn btn-s btn-sm"
          onClick={() => alMarcarTodo(envio.id, !todasMarcadas)}
          disabled={pendiente}
        >
          <Icono nombre={todasMarcadas ? "x" : "check"} className="ico-s" />
          {todasMarcadas ? "Desmarcar todo" : "Marcar todo"}
        </button>
      </div>

      <div className="tabla-caja">
        <DndContext
          id={`dnd-lineas-${envio.id}`}
          sensors={sensoresLineas}
          collisionDetection={closestCenter}
          onDragEnd={alTerminarArrastreLineas}
        >
          <table className="tabla">
            <thead>
              <tr>
                <th style={{ width: "34px" }} />
                <th>Producto</th>
                <th>Lote</th>
                <th className="der">Cantidad (kg)</th>
                <th>Unidades</th>
                <th className="cen" style={{ width: "70px" }}>
                  Listo
                </th>
              </tr>
            </thead>
            <SortableContext items={envio.lineas.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              <tbody data-ped={envio.id}>
                {envio.lineas.map((linea) => (
                  <FilaPreparacion
                    key={linea.id}
                    linea={linea}
                    pendiente={pendiente}
                    alMarcar={(lineaId, estadoActual) => alMarcarLinea(envio.id, lineaId, !estadoActual)}
                  />
                ))}
              </tbody>
            </SortableContext>
          </table>
        </DndContext>
      </div>

      <div className="ped-pie">
        <span className="muted" style={{ fontSize: "14px" }}>
          {todasMarcadas ? (
            <>
              Todo listo. Al despachar pasa a <b>{destino}</b>.
            </>
          ) : (
            `El botón se habilita cuando las ${envio.lineasContador} líneas estén marcadas.`
          )}
        </span>

        <VentanaConfirmacion
          titulo={`Despachar ${etiqueta}`}
          texto={
            <>
              {esRuta ? "La ruta" : "El pedido"} pasa a <b>{destino}</b>
              {esRuta && envio.piloto?.name ? ` y aparece en el módulo de Ruta de ${envio.piloto.name}` : ""}. No se
              requiere confirmar la carga en el camión.
            </>
          }
          textoConfirmar={esRuta ? "Ruta Despachada" : "Pedido Despachado"}
          alConfirmar={despachar}
        >
          <button type="button" className="btn btn-p" disabled={!todasMarcadas || pendiente}>
            <Icono nombre="check" /> {esRuta ? "Ruta Despachada" : "Pedido Despachado"}
          </button>
        </VentanaConfirmacion>
      </div>
    </article>
  );
}
