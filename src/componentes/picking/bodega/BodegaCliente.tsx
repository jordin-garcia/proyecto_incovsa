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
import { Icono } from "@/componentes/comunes/iconos";
import { useMensajes } from "@/componentes/comunes/Mensajes";
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

type AccionOptimistaBodega =
  | { tipo: "reordenar-envios"; envioIds: number[] }
  | { tipo: "marcar-linea"; envioId: number; lineaId: number; marcado: boolean }
  | { tipo: "marcar-todo"; envioId: number; marcado: boolean }
  | { tipo: "reordenar-lineas"; envioId: number; lineaIds: number[] }
  | { tipo: "ordenar-por-peso"; envioId: number };

function reducirEnviosOptimistas(envios: EnvioBodegaItem[], accion: AccionOptimistaBodega): EnvioBodegaItem[] {
  switch (accion.tipo) {
    case "reordenar-envios": {
      const mapa = new Map(envios.map((e) => [e.id, e]));
      return accion.envioIds.map((id) => mapa.get(id)).filter((e): e is EnvioBodegaItem => Boolean(e));
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

  const [enviosOptimistas, aplicarOptimista] = useOptimistic(envios, reducirEnviosOptimistas);
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
    const res = await obtenerDetalleEnvioAccion({ envioId });
    if (!res.ok) {
      mostrarMensaje(res.error, "error");
      return;
    }
    setDetalleEnvio(res.datos);
    setModalAbierto(true);
  };

  const alActualizar = () => {
    router.refresh();
  };

  const alMarcarLinea = (envioId: number, lineaId: number, nuevoMarcado: boolean) => {
    startTransition(async () => {
      aplicarOptimista({ tipo: "marcar-linea", envioId, lineaId, marcado: nuevoMarcado });
      const res = await marcarLineaAccion({ envioId, lineaId, marcado: nuevoMarcado });
      if (!res.ok) {
        mostrarMensaje(res.error, "error");
        aplicarOptimista({ tipo: "marcar-linea", envioId, lineaId, marcado: !nuevoMarcado });
      } else {
        setEnvios((actuales) =>
          reducirEnviosOptimistas(actuales, { tipo: "marcar-linea", envioId, lineaId, marcado: nuevoMarcado }),
        );
      }
      router.refresh();
    });
  };

  const alMarcarTodo = (envioId: number, nuevoValor: boolean) => {
    startTransition(async () => {
      aplicarOptimista({ tipo: "marcar-todo", envioId, marcado: nuevoValor });
      const res = await marcarTodoAccion({ envioId, marcado: nuevoValor });
      if (!res.ok) {
        mostrarMensaje(res.error, "error");
        aplicarOptimista({ tipo: "marcar-todo", envioId, marcado: !nuevoValor });
      } else {
        setEnvios((actuales) =>
          reducirEnviosOptimistas(actuales, { tipo: "marcar-todo", envioId, marcado: nuevoValor }),
        );
      }
      router.refresh();
    });
  };

  const alOrdenarPorPeso = (envioId: number) => {
    startTransition(async () => {
      aplicarOptimista({ tipo: "ordenar-por-peso", envioId });
      const res = await ordenarPorPesoAccion({ envioId });
      if (!res.ok) {
        mostrarMensaje(res.error, "error");
      } else {
        mostrarMensaje("Filas ordenadas de mayor a menor peso.", "exito");
        setEnvios((actuales) => reducirEnviosOptimistas(actuales, { tipo: "ordenar-por-peso", envioId }));
      }
      router.refresh();
    });
  };

  const alReordenarLineas = (envioId: number, lineaIds: number[]) => {
    startTransition(async () => {
      aplicarOptimista({ tipo: "reordenar-lineas", envioId, lineaIds });
      const res = await reordenarLineasAccion({ envioId, lineaIds });
      if (!res.ok) {
        mostrarMensaje(res.error, "error");
      } else {
        setEnvios((actuales) => reducirEnviosOptimistas(actuales, { tipo: "reordenar-lineas", envioId, lineaIds }));
      }
      router.refresh();
    });
  };

  const alTerminarArrastreEnvios = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const viejosIds = enviosOptimistas.map((e) => e.id);
    const viejoIndice = viejosIds.indexOf(Number(active.id));
    const nuevoIndice = viejosIds.indexOf(Number(over.id));
    if (viejoIndice === -1 || nuevoIndice === -1) return;

    const nuevosIds = arrayMove(viejosIds, viejoIndice, nuevoIndice);

    startTransition(async () => {
      aplicarOptimista({ tipo: "reordenar-envios", envioIds: nuevosIds });
      const res = await reordenarColaAccion({ envioIds: nuevosIds });
      if (!res.ok) {
        mostrarMensaje(res.error, "error");
      } else {
        setEnvios((actuales) => reducirEnviosOptimistas(actuales, { tipo: "reordenar-envios", envioIds: nuevosIds }));
      }
      router.refresh();
    });
  };

  return (
    <>
      <div className="encabezado-modulo">
        <div>
          <p className="encabezado-subtitulo">Módulo de bodega · tablero de preparación</p>
          <h1 className="encabezado-titulo">Rutas y pedidos por preparar</h1>
          <p className="encabezado-descripcion">
            Arrastre una ruta, un pedido o una fila para cambiar la prioridad; se ve al instante en todas las pantallas
            de la sede.
          </p>
        </div>

        <Link className="btn btn-p" href="/picking/tablero">
          <Icono nombre="tv" /> Abrir tablero en pantalla completa
        </Link>
      </div>

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
