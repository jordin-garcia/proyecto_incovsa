"use client";

import { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  arrayMove,
} from "@dnd-kit/sortable";
import { EncabezadoModulo } from "@/componentes/comunes/EncabezadoModulo";
import { Icono } from "@/componentes/comunes/iconos";
import { useMensajes } from "@/componentes/comunes/Mensajes";
import { MENSAJE_ERROR_GENERAL } from "@/lib/errores";
import { TarjetaEnvio, type EnvioBodegaItem } from "./TarjetaEnvio";
import { ModalDetalle, type DetalleEnvioData } from "./ModalDetalle";
import {
  obtenerDetalleEnvioAccion,
  marcarLineaAccion,
  marcarTodoAccion,
  ordenarPorPesoAccion,
  reordenarColaAccion,
  reordenarLineasAccion,
} from "@/modulos/bodega/acciones";

interface BodegaClienteProps {
  sede: { id: number; nombre: string; prefijoOdoo: string };
  enviosIniciales: EnvioBodegaItem[];
}

export type AccionOptimistaBodega =
  | { tipo: "reordenar-envios"; envioIds: number[] }
  | { tipo: "marcar-linea"; envioId: number; lineaId: number; marcado: boolean }
  | { tipo: "marcar-todo"; envioId: number; marcado: boolean }
  | { tipo: "reordenar-lineas"; envioId: number; lineaIds: number[] }
  | { tipo: "ordenar-por-peso"; envioId: number };

/** También la usa el tablero en pantalla completa (JM-05): conserva los demás datos de cada envío. */
export function reducirEnviosOptimistas<T extends EnvioBodegaItem>(envios: T[], accion: AccionOptimistaBodega): T[] {
  switch (accion.tipo) {
    case "reordenar-envios": {
      const mapa = new Map(envios.map((e) => [e.id, e]));
      return accion.envioIds.map((id) => mapa.get(id)).filter((e): e is T => Boolean(e));
    }
    case "marcar-linea": {
      return envios.map((e) => {
        if (e.id !== accion.envioId) return e;
        const lineas = e.lineas.map((l) => (l.id === accion.lineaId ? { ...l, marcado: accion.marcado } : l));
        const lineasListas = lineas.filter((l) => l.marcado).length;
        return {
          ...e,
          lineas,
          lineasListas,
          todoListo: lineas.length > 0 && lineasListas === lineas.length,
        };
      });
    }
    case "marcar-todo": {
      return envios.map((e) => {
        if (e.id !== accion.envioId) return e;
        const lineas = e.lineas.map((l) => ({ ...l, marcado: accion.marcado }));
        const lineasListas = accion.marcado ? lineas.length : 0;
        return {
          ...e,
          lineas,
          lineasListas,
          todoListo: accion.marcado && lineas.length > 0,
        };
      });
    }
    case "reordenar-lineas": {
      return envios.map((e) => {
        if (e.id !== accion.envioId) return e;
        const mapa = new Map(e.lineas.map((l) => [l.id, l]));
        const lineas = accion.lineaIds
          .map((id, idx) => {
            const linea = mapa.get(id);
            return linea ? { ...linea, posicion: idx + 1 } : null;
          })
          .filter((l): l is EnvioBodegaItem["lineas"][number] => Boolean(l));
        return { ...e, lineas };
      });
    }
    case "ordenar-por-peso": {
      return envios.map((e) => {
        if (e.id !== accion.envioId) return e;
        const lineas = [...e.lineas]
          .sort((a, b) => Number(b.cantidadKg) - Number(a.cantidadKg) || a.id - b.id)
          .map((l, idx) => ({ ...l, posicion: idx + 1 }));
        return { ...e, lineas };
      });
    }
    default:
      return envios;
  }
}

export function BodegaCliente({ sede, enviosIniciales }: BodegaClienteProps) {
  const router = useRouter();
  const mostrarMensaje = useMensajes();
  const [, startTransition] = useTransition();
  const [prevEnviosIniciales, setPrevEnviosIniciales] = useState(enviosIniciales);
  const [envios, setEnvios] = useState(enviosIniciales);

  if (enviosIniciales !== prevEnviosIniciales) {
    setPrevEnviosIniciales(enviosIniciales);
    setEnvios(enviosIniciales);
  }

  const [enviosOptimistas, aplicarOptimista] = useOptimistic(envios, reducirEnviosOptimistas<EnvioBodegaItem>);
  const [detalleEnvio, setDetalleEnvio] = useState<DetalleEnvioData | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  const sensoresEnvios = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 380, tolerance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const alVerDetalle = async (envioId: number) => {
    try {
      const res = await obtenerDetalleEnvioAccion({ envioId });
      if (!res.ok) {
        mostrarMensaje(res.error, "error");
        return;
      }
      setDetalleEnvio(res.datos);
      setModalAbierto(true);
    } catch {
      mostrarMensaje(MENSAJE_ERROR_GENERAL, "error");
    }
  };

  const alActualizar = () => {
    router.refresh();
  };

  /**
   * Aplica el cambio al instante y lo confirma con el servidor. Si el servidor lo rechaza o falla la red (una tableta
   * pierde el wifi), el cambio optimista vuelve atrás con un mensaje y la pantalla sigue en uso (auditoría H-24).
   */
  const operar = (
    accion: AccionOptimistaBodega,
    ejecutar: () => Promise<{ ok: boolean; error?: string }>,
    mensajeExito?: string,
  ) => {
    startTransition(async () => {
      aplicarOptimista(accion);
      try {
        const res = await ejecutar();
        if (!res.ok) {
          mostrarMensaje(res.error ?? MENSAJE_ERROR_GENERAL, "error");
        } else {
          if (mensajeExito) mostrarMensaje(mensajeExito, "exito");
          setEnvios((actuales) => reducirEnviosOptimistas(actuales, accion));
        }
      } catch {
        mostrarMensaje(MENSAJE_ERROR_GENERAL, "error");
      }
      router.refresh();
    });
  };

  const alMarcarLinea = (envioId: number, lineaId: number, marcado: boolean) =>
    operar({ tipo: "marcar-linea", envioId, lineaId, marcado }, () => marcarLineaAccion({ envioId, lineaId, marcado }));

  const alMarcarTodo = (envioId: number, marcado: boolean) =>
    operar({ tipo: "marcar-todo", envioId, marcado }, () => marcarTodoAccion({ envioId, marcado }));

  const alOrdenarPorPeso = (envioId: number) =>
    operar(
      { tipo: "ordenar-por-peso", envioId },
      () => ordenarPorPesoAccion({ envioId }),
      "Filas ordenadas de mayor a menor peso.",
    );

  const alReordenarLineas = (envioId: number, lineaIds: number[]) =>
    operar({ tipo: "reordenar-lineas", envioId, lineaIds }, () => reordenarLineasAccion({ envioId, lineaIds }));

  const alTerminarArrastreEnvios = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const viejosIds = enviosOptimistas.map((e) => e.id);
    const viejoIndice = viejosIds.indexOf(Number(active.id));
    const nuevoIndice = viejosIds.indexOf(Number(over.id));
    if (viejoIndice === -1 || nuevoIndice === -1) return;

    const nuevosIds = arrayMove(viejosIds, viejoIndice, nuevoIndice);
    operar({ tipo: "reordenar-envios", envioIds: nuevosIds }, () => reordenarColaAccion({ envioIds: nuevosIds }));
  };

  return (
    <>
      {/* Mismo encabezado que `cab()` del prototipo, con la instrucción a la par del título (RF-SL-61, H-17). */}
      <EncabezadoModulo
        eyebrow="Módulo de bodega · tablero de preparación"
        titulo="Rutas y pedidos por preparar"
        instruccion="Arrastre una ruta, un pedido o una fila para cambiar la prioridad; se ve al instante en todas las pantallas de la sede."
        acciones={
          <Link className="btn btn-p" href="/picking/tablero">
            <Icono nombre="tv" /> Abrir tablero en pantalla completa
          </Link>
        }
      />

      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap" }}>
        <span className="chip chip-o">{enviosOptimistas.length} en cola</span>
        <span className="muted" style={{ fontSize: "14px", color: "var(--g600)" }}>
          {sede.nombre} · la prioridad y las marcas no quedan en el historial
        </span>
      </div>

      {enviosOptimistas.length > 0 ? (
        <DndContext
          id="dnd-bodega-envios"
          sensors={sensoresEnvios}
          collisionDetection={closestCenter}
          onDragEnd={alTerminarArrastreEnvios}
        >
          <SortableContext items={enviosOptimistas.map((e) => e.id)} strategy={verticalListSortingStrategy}>
            <div className="ped-lista" data-pedidos>
              {enviosOptimistas.map((envio, i) => (
                <TarjetaEnvio
                  key={envio.id}
                  envio={envio}
                  prioridad={i + 1}
                  alVerDetalle={alVerDetalle}
                  alActualizar={alActualizar}
                  alMarcarLinea={alMarcarLinea}
                  alMarcarTodo={alMarcarTodo}
                  alOrdenarPorPeso={alOrdenarPorPeso}
                  alReordenarLineas={alReordenarLineas}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="tarjeta vacio" style={{ padding: "60px" }}>
          <Icono nombre="check" />
          <h4>No hay rutas ni pedidos por preparar</h4>
          <p>Cuando Facturación envíe una ruta o un pedido aparecerá aquí al instante.</p>
        </div>
      )}

      <ModalDetalle abierto={modalAbierto} alCerrar={() => setModalAbierto(false)} datos={detalleEnvio} />
    </>
  );
}
