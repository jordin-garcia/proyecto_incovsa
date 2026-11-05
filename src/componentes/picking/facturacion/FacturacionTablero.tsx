"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  pointerWithin,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { OpcionEnvio } from "./OpcionEnvio";
import { PedidoArrastrable, ZonaArrastre, coordenadasTeclado } from "./ArrastreFacturacion";
import type { OpcionesFacturacion } from "@/modulos/envios/opciones";
import { estadoDePedidos } from "@/modulos/envios/estado-pedidos";
import type { EstadoPedidos } from "@/modulos/envios/esquemas";
import type { TipoOpcion } from "@/modulos/envios/esquemas";
import { useRouter } from "next/navigation";
import { Button } from "@/componentes/ui/button";
import { Checkbox } from "@/componentes/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/componentes/ui/dialog";
import { EncabezadoModulo } from "@/componentes/comunes/EncabezadoModulo";
import { Icono } from "@/componentes/comunes/iconos";
import { VentanaConfirmacion } from "@/componentes/comunes/VentanaConfirmacion";
import { formatoKg } from "@/componentes/comunes/formato";
import { useMensajes } from "@/componentes/comunes/Mensajes";
import { ErrorNegocio } from "@/lib/errores";
import { cargarArchivo, eliminarPedidosFacturados, moverPedidosFacturados } from "@/modulos/envios/acciones";
import type { PedidoEnTablero } from "@/modulos/envios/servicio";
import estilos from "./FacturacionTablero.module.css";

type ResumenCarga = {
  pedidosCargados: number;
  noCargados: { numero: string; cliente: string; motivo: string }[];
  otrosEstados: number;
};

const motivos = [
  "tienen líneas con el Peso de Conversión en 0 o vacío (RN-50)",
  "tienen líneas con la cantidad en 0 o vacía",
  "no traen productos",
] as const;

/** Lo que pide el facturador al soltar o al pulsar el botón de una opción. */
type PedidoDeMovimiento = { ids: number[]; origen: string; destino: string; antesDe: number | null };

/** Movimiento ya soltado: la vista lo aplica de inmediato, como el prototipo, mientras se guarda (JG-33). */
type Movimiento = PedidoDeMovimiento & {
  /** Lo que el facturador veía en las dos zonas al soltar: con eso el servidor busca conflictos (RN-48). */
  vistos: { origen: EstadoPedidos; destino: EstadoPedidos };
  /** Fecha de modificación que dejó el servidor en cada pedido movido, una vez guardado. */
  guardado?: Record<number, string>;
};

/**
 * Aplica los movimientos con la misma regla que `moverPedidos()` del servidor: se insertan antes de `antesDe` o al
 * final. Los pedidos se buscan en todas las listas, así que un movimiento que los datos ya incluyen casi no cambia
 * nada, y se deja de aplicar en cuanto llegan esos datos (`incluido()`).
 */
function aplicarMovimientos(pedidos: PedidoEnTablero[], opciones: OpcionesFacturacion, movimientos: Movimiento[]) {
  if (!movimientos.length) return { pedidos, opciones };
  const listas = new Map<string, PedidoEnTablero[]>([
    ["tablero", pedidos],
    ...opciones.opciones.map((opcion) => [opcion.tipo, opcion.pedidos] as const),
  ]);
  for (const { ids, destino, antesDe } of movimientos) {
    if (!listas.has(destino)) continue;
    const movidos: PedidoEnTablero[] = [];
    for (const [zona, lista] of listas) {
      movidos.push(...lista.filter((pedido) => ids.includes(pedido.id)));
      listas.set(
        zona,
        lista.filter((pedido) => !ids.includes(pedido.id)),
      );
    }
    const resto = listas.get(destino)!;
    const indice = antesDe === null ? -1 : resto.findIndex((pedido) => pedido.id === antesDe);
    resto.splice(indice < 0 ? resto.length : indice, 0, ...movidos);
  }
  return {
    pedidos: listas.get("tablero")!,
    opciones: {
      ...opciones,
      opciones: opciones.opciones.map((opcion) => ({ ...opcion, pedidos: listas.get(opcion.tipo)! })),
    },
  };
}

/**
 * Un movimiento guardado está en los datos del servidor cuando cada pedido movido trae esa fecha de modificación o una
 * posterior (o ya no está, porque se envió o se eliminó). Datos anteriores, como los que retuvo una pausa, no cuentan.
 */
function incluido(movimiento: Movimiento, pedidos: PedidoEnTablero[], opciones: OpcionesFacturacion) {
  const guardado = movimiento.guardado;
  if (!guardado) return false;
  const fechas = new Map(
    [...pedidos, ...opciones.opciones.flatMap((opcion) => opcion.pedidos)].map((p) => [p.id, p.actualizadoEn]),
  );
  return movimiento.ids.every((id) => {
    const fecha = fechas.get(id);
    return fecha === undefined || fecha >= (guardado[id] ?? "");
  });
}

type PropsFacturacion = {
  pedidos: PedidoEnTablero[];
  sedeId: number;
  sedeNombre: string;
  opciones: OpcionesFacturacion;
  puedeVerBodega: boolean;
};

/** El armazón comparte SSE. Conserva la vista durante una interacción y aplica el último contenido al terminar. */
export function FacturacionTablero(props: PropsFacturacion) {
  const [pausas, cambiarPausas] = useState<Set<string>>(() => new Set());
  const [mostrado, mostrar] = useState(props);
  if (!pausas.size && mostrado !== props) mostrar(props);
  const alInteraccion = useCallback((clave: string, activa: boolean) => {
    cambiarPausas((actuales) => {
      const siguientes = new Set(actuales);
      if (activa) siguientes.add(clave);
      else siguientes.delete(clave);
      return siguientes;
    });
  }, []);
  return <TableroInteractivo {...mostrado} alInteraccion={alInteraccion} />;
}

function TableroInteractivo({
  pedidos: pedidosServidor,
  sedeId,
  sedeNombre,
  opciones: opcionesServidor,
  puedeVerBodega,
  alInteraccion,
}: PropsFacturacion & {
  alInteraccion: (clave: string, activa: boolean) => void;
}) {
  // Cola de movimientos: la vista los muestra al soltar y se guardan uno a la vez, en orden. La comprobación de
  // conflictos (RN-48) compara posiciones y fechas, así que cada zona se compara con lo que el facturador vio al soltar
  // o, si un movimiento anterior de la cola ya la cambió, con lo que devolvió el servidor (`conocidos`).
  const [cola, fijarCola] = useState({
    pedidos: pedidosServidor,
    opciones: opcionesServidor,
    movimientos: [] as Movimiento[],
  });
  let vigente = cola;
  if (cola.pedidos !== pedidosServidor || cola.opciones !== opcionesServidor) {
    vigente = {
      pedidos: pedidosServidor,
      opciones: opcionesServidor,
      movimientos: cola.movimientos.filter((m) => !incluido(m, pedidosServidor, opcionesServidor)),
    };
    fijarCola(vigente);
  }
  // Memorizado: cada opción conserva su identidad entre renders y OpcionEnvio no vuelve a tomar sus campos de ella.
  const { pedidos, opciones } = useMemo(
    () => aplicarMovimientos(pedidosServidor, opcionesServidor, vigente.movimientos),
    [pedidosServidor, opcionesServidor, vigente.movimientos],
  );
  const enVuelo = useRef(false);
  const conocidos = useRef(new Map<string, EstadoPedidos>());
  const sinGuardar = vigente.movimientos.some((m) => !m.guardado);
  const [arrastrados, arrastrar] = useState<number[]>([]);
  const [activo, fijarActivo] = useState<{ id: number; zona: string } | null>(null);
  const sensores = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 380, tolerance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: coordenadasTeclado,
      keyboardCodes: { start: ["Space"], end: ["Space"], cancel: ["Escape"] },
    }),
  );
  const confirmacionEliminar = useRef<{ ids: number[]; estadoEsperado: EstadoPedidos } | null>(null);
  const router = useRouter();
  const mensaje = useMensajes();
  const [seleccionados, seleccionar] = useState<Set<number>>(() => new Set());
  const [resumen, mostrarResumen] = useState<ResumenCarga | null>(null);
  const [enTransicion, iniciarTransicion] = useTransition();
  // Hasta que los datos del servidor incluyan los movimientos, la vista no sirve para comprobar conflictos: esperan
  // «Eliminar», «Cancelar» y «Enviar a Bodega», que los comprueban con lo que se ve.
  const esperandoMovimientos = vigente.movimientos.length > 0;
  const ocupado = enTransicion || esperandoMovimientos;
  const lista = useRef<HTMLDivElement>(null);
  const archivo = useRef<HTMLInputElement>(null);
  const restaurarDesplazamiento = useRef<number | null>(null);
  const tarjetaAncla = useRef<{ elemento: HTMLElement; arriba: number } | null>(null);
  const seleccionadosEnTablero = pedidos.filter((pedido) => seleccionados.has(pedido.id));
  const idsSeleccionados = seleccionadosEnTablero.map((pedido) => pedido.id);
  const todos = pedidos.length > 0 && seleccionadosEnTablero.length === pedidos.length;
  const totalGramos = pedidos.reduce((total, pedido) => {
    const [entero = "0", fraccion = "000"] = pedido.totalKg.split(".");
    return total + BigInt(entero) * 1000n + BigInt(fraccion.padEnd(3, "0").slice(0, 3));
  }, 0n);
  const totalKg = `${totalGramos / 1000n}.${String(totalGramos % 1000n).padStart(3, "0")}`;
  const totalSeleccionadoGramos = seleccionadosEnTablero.reduce((total, pedido) => {
    const [entero = "0", fraccion = "000"] = pedido.totalKg.split(".");
    return total + BigInt(entero) * 1000n + BigInt(fraccion.padEnd(3, "0").slice(0, 3));
  }, 0n);
  const totalSeleccionadoKg = `${totalSeleccionadoGramos / 1000n}.${String(totalSeleccionadoGramos % 1000n).padStart(3, "0")}`;

  useLayoutEffect(() => {
    const elemento = lista.current;
    const scrollTop = restaurarDesplazamiento.current;
    if (!elemento) return;
    if (scrollTop === null) {
      if (!seleccionados.size) {
        elemento.style.paddingBottom = "";
        elemento.style.paddingTop = "";
      }
      return;
    }
    if (!seleccionados.size) {
      elemento.style.paddingBottom = "";
      elemento.style.paddingTop = "";
    } else {
      const rellenoActual = Number.parseFloat(getComputedStyle(elemento).paddingBottom) || 0;
      const espacioNecesario = Math.max(0, scrollTop + elemento.clientHeight - elemento.scrollHeight);
      elemento.style.paddingBottom = `${rellenoActual + espacioNecesario}px`;
    }
    const ancla = tarjetaAncla.current;
    if (ancla?.elemento.isConnected) {
      // Las filas anteriores cambian de altura. Conservar el mismo scrollTop no conserva
      // el pedido que se estaba leyendo; corregimos su posición antes del repintado.
      elemento.style.paddingTop = "";
      const destino = elemento.scrollTop + ancla.elemento.getBoundingClientRect().top - ancla.arriba;
      if (destino < 0) {
        const relleno = Number.parseFloat(getComputedStyle(elemento).paddingTop) || 0;
        elemento.style.paddingTop = `${relleno - destino}px`;
      }
      const desplazamiento = Math.max(0, destino);
      const faltante = Math.max(0, desplazamiento + elemento.clientHeight - elemento.scrollHeight);
      if (faltante) {
        const relleno = Number.parseFloat(getComputedStyle(elemento).paddingBottom) || 0;
        elemento.style.paddingBottom = `${relleno + faltante}px`;
      }
      elemento.scrollTop = desplazamiento;
      tarjetaAncla.current = null;
    } else {
      elemento.scrollTop = scrollTop;
    }
    restaurarDesplazamiento.current = null;
  }, [seleccionados]);

  function alternarSeleccion(id: number) {
    restaurarDesplazamiento.current = lista.current?.scrollTop ?? 0;
    seleccionar((actuales) => {
      const nuevos = new Set(actuales);
      if (nuevos.has(id)) nuevos.delete(id);
      else nuevos.add(id);
      return nuevos;
    });
  }

  function seleccionarTodos(marcada: boolean) {
    const elemento = lista.current;
    if (elemento) {
      const marco = elemento.getBoundingClientRect();
      const tarjetas = [...elemento.querySelectorAll<HTMLElement>("[role='button']")];
      const visible =
        tarjetas.find((tarjeta) => {
          const posicion = tarjeta.getBoundingClientRect();
          return posicion.top >= marco.top && posicion.bottom <= marco.bottom;
        }) ??
        tarjetas.find((tarjeta) => {
          const posicion = tarjeta.getBoundingClientRect();
          return posicion.top >= marco.top && posicion.top < marco.bottom;
        }) ??
        tarjetas.find((tarjeta) => {
          const posicion = tarjeta.getBoundingClientRect();
          return posicion.bottom > marco.top && posicion.top < marco.bottom;
        });
      tarjetaAncla.current = visible ? { elemento: visible, arriba: visible.getBoundingClientRect().top } : null;
    }
    restaurarDesplazamiento.current = lista.current?.scrollTop ?? 0;
    seleccionar(marcada ? new Set(pedidos.map((pedido) => pedido.id)) : new Set());
  }

  function elegirArchivo(archivoElegido: File | undefined) {
    if (!archivoElegido) return;
    const formData = new FormData();
    formData.set("sedeId", String(sedeId));
    formData.set("archivo", archivoElegido);
    if (archivo.current) archivo.current.value = "";
    iniciarTransicion(async () => {
      const resultado = await cargarArchivo(formData);
      if (!resultado.ok) {
        mensaje(resultado.error, "error");
        return;
      }
      mostrarResumen(resultado.datos);
      seleccionar(new Set());
      router.refresh();
    });
  }

  async function confirmarEliminacion() {
    const confirmacion = confirmacionEliminar.current;
    if (!confirmacion) return;
    const resultado = await eliminarPedidosFacturados({ sedeId, ...confirmacion });
    if (!resultado.ok) {
      router.refresh();
      throw new ErrorNegocio(resultado.error);
    }
    mensaje("Pedidos facturados eliminados.");
    seleccionar(new Set());
    router.refresh();
  }

  function soltar(evento: DragEndEvent) {
    const ids = arrastrados;
    arrastrar([]);
    alInteraccion("arrastre", false);
    if (!evento.over || evento.active.id === evento.over.id) return;
    const origen = evento.active.data.current?.zona;
    const destino = evento.over.data.current?.zona;
    if (!origen || !destino) return;
    let antesDe = typeof evento.over.id === "number" ? evento.over.id : null;
    if (origen === destino && antesDe !== null) {
      const orden = origen === "tablero" ? pedidos : (opciones.opciones.find((o) => o.tipo === origen)?.pedidos ?? []);
      const desde = orden.findIndex((p) => p.id === evento.active.id);
      const hasta = orden.findIndex((p) => p.id === antesDe);
      if (desde < hasta) antesDe = orden.slice(hasta + 1).find((p) => !ids.includes(p.id))?.id ?? null;
    }
    if (antesDe !== null && ids.includes(antesDe)) return;
    mover({ ids, origen, destino, antesDe });
  }

  /** Mueve en pantalla de inmediato y anota lo que se veía; el efecto de abajo lo guarda cuando le toca. */
  function mover({ ids, origen, destino, antesDe }: PedidoDeMovimiento) {
    const listaDe = (zona: string) =>
      zona === "tablero" ? pedidos : (opciones.opciones.find((o) => o.tipo === zona)?.pedidos ?? []);
    // Sin nada en la cola, lo que se ve es lo del servidor: lo que se supo de movimientos anteriores ya no sirve.
    if (!vigente.movimientos.length) conocidos.current.clear();
    const vistos = { origen: estadoDePedidos(listaDe(origen)), destino: estadoDePedidos(listaDe(destino)) };
    fijarCola((actual) => ({
      ...actual,
      movimientos: [...actual.movimientos, { ids, origen, destino, antesDe, vistos }],
    }));
    seleccionar(new Set());
  }

  // Guarda el primer movimiento sin guardar. Si el servidor lo rechaza, se descarta la cola y la vista vuelve a los
  // datos guardados, con el aviso.
  useEffect(() => {
    const siguiente = cola.movimientos.find((m) => !m.guardado);
    if (enVuelo.current || !siguiente) return;
    enVuelo.current = true;
    const zonaOpcion = (zona: string) => (zona === "tablero" ? null : (zona as TipoOpcion));
    const estado = (zona: string, visto: EstadoPedidos) => conocidos.current.get(zona) ?? visto;
    iniciarTransicion(async () => {
      const resultado = await moverPedidosFacturados({
        sedeId,
        ids: siguiente.ids,
        origen: zonaOpcion(siguiente.origen),
        destino: zonaOpcion(siguiente.destino),
        antesDe: siguiente.antesDe,
        estadoOrigen: estado(siguiente.origen, siguiente.vistos.origen),
        estadoDestino: estado(siguiente.destino, siguiente.vistos.destino),
      });
      enVuelo.current = false;
      if (resultado.ok) {
        const { estadoOrigen, estadoDestino } = resultado.datos;
        conocidos.current.set(siguiente.origen, estadoOrigen);
        conocidos.current.set(siguiente.destino, estadoDestino);
        const guardado = Object.fromEntries(
          estadoDestino.filter((p) => siguiente.ids.includes(p.id)).map((p) => [p.id, p.actualizadoEn]),
        );
        fijarCola((actual) => ({
          ...actual,
          movimientos: actual.movimientos.map((m) => (m === siguiente ? { ...m, guardado } : m)),
        }));
      } else {
        // `conocidos` se conserva: sigue siendo lo que el servidor guardó de los movimientos anteriores.
        mensaje(resultado.error, "error");
        // Los ya guardados se siguen mostrando hasta que lleguen los datos; los demás se descartan.
        fijarCola((actual) => ({ ...actual, movimientos: actual.movimientos.filter((m) => m.guardado) }));
      }
      router.refresh();
    });
  }, [cola, sedeId, mensaje, router]);

  // Recargar o cerrar con movimientos sin guardar los perdería: el navegador pregunta antes.
  useEffect(() => {
    if (!sinGuardar) return;
    const avisar = (evento: BeforeUnloadEvent) => evento.preventDefault();
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [sinGuardar]);

  return (
    <DndContext
      id={`facturacion-sede-${sedeId}`}
      sensors={sensores}
      collisionDetection={(contexto) => {
        // Primero la zona visible: las tarjetas recortadas por el scroll del tablero
        // no pueden interceptar el puntero sobre las opciones que están debajo.
        const zonas = contexto.droppableContainers.filter((c) => typeof c.id === "string");
        const zonasDebajo = contexto.pointerCoordinates
          ? pointerWithin({ ...contexto, droppableContainers: zonas })
          : closestCenter({ ...contexto, droppableContainers: zonas });
        const zona = zonas.find((c) => c.id === zonasDebajo[0]?.id)?.data.current?.zona;
        if (!zona) return [];
        const dentro = {
          ...contexto,
          droppableContainers: contexto.droppableContainers.filter((c) => c.data.current?.zona === zona),
        };
        if (contexto.pointerCoordinates)
          return pointerWithin(dentro).sort(
            (a, b) => Number(typeof b.id === "number") - Number(typeof a.id === "number"),
          );
        return closestCenter(dentro);
      }}
      onDragStart={({ active }) => {
        alInteraccion("arrastre", true);
        fijarActivo({ id: Number(active.id), zona: String(active.data.current?.zona ?? "tablero") });
        arrastrar(
          active.data.current?.zona === "tablero" && seleccionados.has(Number(active.id))
            ? idsSeleccionados
            : [Number(active.id)],
        );
      }}
      onDragCancel={() => {
        arrastrar([]);
        alInteraccion("arrastre", false);
      }}
      onDragEnd={soltar}
      accessibility={{
        screenReaderInstructions: {
          draggable:
            "Pulse espacio para arrastrar. Use las flechas arriba y abajo para ordenar; derecha e izquierda para cambiar de opción o regresar al tablero. Pulse espacio para soltar o Escape para cancelar. Enter selecciona una tarjeta del tablero.",
        },
        announcements: {
          onDragStart: () => "Arrastre iniciado.",
          onDragOver: ({ over }) =>
            over
              ? `Destino: ${over.data.current?.zona === "tablero" ? "Tablero de pedidos facturados" : over.data.current?.zona === "camion" ? "Envío por camión" : "Cliente recoge en bodega"}.`
              : "Fuera de una opción de envío.",
          onDragEnd: () => "Arrastre terminado.",
          onDragCancel: () => "Arrastre cancelado.",
        },
      }}
    >
      <EncabezadoModulo
        eyebrow="Módulo de facturación"
        titulo="Pedidos facturados"
        instruccion="Cargue el .xlsx de Odoo, seleccione los pedidos facturados, arrástrelos a una opción de envío y envíela a Bodega."
        acciones={
          <Button onClick={() => archivo.current?.click()} disabled={ocupado}>
            <Icono nombre="subir" aria-hidden="true" /> Cargar archivo .xlsx
          </Button>
        }
      />
      <div className={estilos.disposicion} aria-busy={ocupado}>
        <section className={`tarjeta ${estilos.tablero}`} aria-labelledby="titulo-tablero">
          <div className={`bloque-cab ${estilos.encabezadoTablero}`}>
            <div>
              <h2 id="titulo-tablero">Tablero de pedidos facturados</h2>
              <p>
                {pedidos.length} pedido(s) facturado(s) · {formatoKg(totalKg)} · {sedeNombre}
              </p>
            </div>
            <div className={estilos.controles}>
              <label className="chk">
                <Checkbox
                  aria-label="Seleccionar todos"
                  checked={todos}
                  disabled={!pedidos.length || ocupado}
                  onCheckedChange={(marcada) => seleccionarTodos(marcada === true)}
                />
                Seleccionar todos
              </label>
              {seleccionadosEnTablero.length > 0 && (
                <>
                  <span className="chip chip-v" aria-live="polite">
                    {seleccionadosEnTablero.length} seleccionado(s)
                  </span>
                  {opciones.opciones.map((opcion) => {
                    const nombre = opcion.tipo === "camion" ? "Envío por camión" : "Cliente recoge en bodega";
                    return (
                      <Button
                        key={opcion.tipo}
                        variant="secundario"
                        size="pequeno"
                        disabled={ocupado}
                        aria-label={nombre}
                        title={`Agregar los pedidos facturados seleccionados a ${nombre}`}
                        onClick={() =>
                          mover({ ids: idsSeleccionados, origen: "tablero", destino: opcion.tipo, antesDe: null })
                        }
                      >
                        <Icono nombre={opcion.tipo === "camion" ? "camion" : "edificio"} aria-hidden="true" />
                        {/* Hasta 1024 px solo el ícono: la barra no crece más que con «Eliminar», y el tablero conserva
                            la tarjeta que se estaba viendo al seleccionar (specs/06, 15/10). */}
                        <span className={estilos.textoOpcion}>{nombre}</span>
                      </Button>
                    );
                  })}
                  <VentanaConfirmacion
                    titulo="Eliminar pedidos facturados"
                    texto={
                      seleccionadosEnTablero.length === 1 ? (
                        <>
                          ¿Eliminar del tablero el pedido facturado <strong>{seleccionadosEnTablero[0]!.numero}</strong>{" "}
                          de {seleccionadosEnTablero[0]!.cliente} ({formatoKg(seleccionadosEnTablero[0]!.totalKg)})? La
                          eliminación queda en la bitácora.
                        </>
                      ) : (
                        <>
                          ¿Eliminar del tablero los <strong>{seleccionadosEnTablero.length}</strong> pedidos facturados
                          seleccionados ({formatoKg(totalSeleccionadoKg)})? La eliminación queda en la bitácora.
                        </>
                      )
                    }
                    textoConfirmar="Eliminar"
                    variante="peligro"
                    alConfirmar={confirmarEliminacion}
                  >
                    <Button
                      variant="peligro"
                      size="pequeno"
                      disabled={ocupado}
                      onClick={() => {
                        confirmacionEliminar.current = {
                          ids: idsSeleccionados,
                          estadoEsperado: estadoDePedidos(seleccionadosEnTablero),
                        };
                      }}
                    >
                      <Icono nombre="borrar" aria-hidden="true" /> Eliminar
                    </Button>
                  </VentanaConfirmacion>
                </>
              )}
            </div>
          </div>
          <ZonaArrastre
            zona="tablero"
            className={estilos.lista}
            referencia={(n) => {
              lista.current = n;
            }}
          >
            <SortableContext items={pedidos.map((p) => p.id)} strategy={rectSortingStrategy}>
              {pedidos.length ? (
                pedidos.map((pedido) => {
                  const seleccionado = seleccionados.has(pedido.id);
                  return (
                    <PedidoArrastrable
                      idPedido={pedido.id}
                      zona="tablero"
                      key={pedido.id}
                      className={`${estilos.tarjetaPedido} ${seleccionado ? estilos.seleccionada : ""}`}
                      role="button"
                      tabIndex={0}
                      aria-pressed={seleccionado}
                      title="Clic para seleccionar; arrastre para llevarlo a una opción de envío"
                      onClick={() => alternarSeleccion(pedido.id)}
                      onKeyDown={(evento) => {
                        if (evento.key === "Enter") {
                          evento.preventDefault();
                          alternarSeleccion(pedido.id);
                        }
                      }}
                    >
                      <span className={estilos.marcaSeleccion} aria-hidden="true">
                        <Icono nombre="check" />
                      </span>
                      <div className={estilos.filaNumero}>
                        <b className="mono">{pedido.numero}</b>
                        <span className={`mono ${estilos.peso}`}>{formatoKg(pedido.totalKg)}</span>
                      </div>
                      <div className={estilos.cliente}>{pedido.cliente}</div>
                      <div className={estilos.sector}>{pedido.sector}</div>
                      <ul className={estilos.productos} aria-label="Productos del pedido facturado">
                        {pedido.lineas.map((linea, indice) => (
                          <li key={`${linea.producto}-${linea.lote}-${indice}`}>
                            <span>{linea.producto}</span>
                            <span className={`mono ${estilos.cantidad}`}>{formatoKg(linea.cantidadKg)}</span>
                          </li>
                        ))}
                      </ul>
                    </PedidoArrastrable>
                  );
                })
              ) : (
                <div className={estilos.vacio}>
                  <Icono nombre="archivo" aria-hidden="true" />
                  <h3>No hay pedidos facturados en el tablero</h3>
                  <p>
                    Cargue el archivo de Odoo, o arrastre aquí un pedido facturado para regresarlo de una opción de
                    envío.
                  </p>
                </div>
              )}
            </SortableContext>
          </ZonaArrastre>
        </section>

        <aside className={estilos.opciones} aria-labelledby="titulo-opciones">
          <h2 id="titulo-opciones">Opciones de envío</h2>
          {opciones.opciones.map((opcion) => (
            <OpcionEnvio
              key={opcion.tipo}
              opcion={opcion}
              camiones={opciones.camiones}
              pilotos={opciones.pilotos}
              sedeId={sedeId}
              sedeNombre={sedeNombre}
              ocupado={enTransicion}
              esperandoMovimientos={esperandoMovimientos}
              puedeVerBodega={puedeVerBodega}
              alInteraccion={alInteraccion}
            />
          ))}
        </aside>
      </div>
      <p className={estilos.ayuda}>
        Clic o toque en una tarjeta para seleccionarla. Arrastre con el mouse, o con el dedo después de mantenerlo
        presionado sobre la tarjeta. Dentro de una opción, arrastre para cambiar el orden: con ese orden se envía a
        Bodega. Lo que está en el tablero y en cada opción se guarda.
      </p>

      <div className={estilos.entradaArchivo}>
        <input
          ref={archivo}
          type="file"
          accept=".xlsx"
          aria-label="Cargar archivo .xlsx"
          onChange={(evento) => elegirArchivo(evento.currentTarget.files?.[0])}
        />
      </div>

      <Dialog open={resumen !== null} onOpenChange={(abierto) => !abierto && mostrarResumen(null)}>
        <DialogContent>
          <div className="modal-cab">
            <DialogTitle>Resumen de la carga</DialogTitle>
          </div>
          <div className="modal-cuerpo">
            <DialogDescription asChild>
              <div className={estilos.resumen}>
                <div className={`aviso ${resumen?.pedidosCargados ? "aviso-v" : "aviso-r"}`}>
                  <Icono nombre={resumen?.pedidosCargados ? "check" : "alerta"} aria-hidden="true" />
                  <div>
                    <b>{resumen?.pedidosCargados ?? 0} pedido(s) facturado(s)</b> de {sedeNombre} se agregaron al
                    tablero, con los datos tal como vienen en el archivo.
                  </div>
                </div>
                {motivos.map((motivo) => {
                  const pedidosNoCargados = resumen?.noCargados.filter((pedido) => pedido.motivo === motivo) ?? [];
                  if (!pedidosNoCargados.length) return null;
                  return (
                    <div className="aviso aviso-a" key={motivo}>
                      <Icono nombre="alerta" aria-hidden="true" />
                      <div>
                        <b>{pedidosNoCargados.length} pedido(s) facturado(s) no se cargaron</b> porque {motivo}:{" "}
                        <span className="mono">{pedidosNoCargados.map((pedido) => pedido.numero).join(", ")}</span>.
                      </div>
                    </div>
                  );
                })}
                {!!resumen?.otrosEstados && (
                  <p>Se ignoraron {resumen.otrosEstados} referencia(s) que no están en estado «Hecho».</p>
                )}
                {!!resumen?.noCargados.length && (
                  <p>Los datos de esos pedidos facturados deben corregirse en Odoo y volver a exportarse.</p>
                )}
              </div>
            </DialogDescription>
          </div>
          <div className="modal-pie">
            <Button onClick={() => mostrarResumen(null)}>Listo</Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Sin animación al soltar: la de dnd-kit regresaba la copia a su lugar de origen antes de moverla. */}
      <DragOverlay dropAnimation={null}>
        {arrastrados.length > 0 && activo ? fantasma(activo, arrastrados.length) : null}
      </DragOverlay>
    </DndContext>
  );

  /** Copia de la tarjeta o fila que se arrastra, con el número de pedidos si son varios (prototipo: `arrastrable()`). */
  function fantasma({ id, zona }: { id: number; zona: string }, cantidad: number) {
    const contador = cantidad > 1 ? <span className={estilos.fantasmaN}>{cantidad}</span> : null;
    if (zona === "tablero") {
      const pedido = pedidos.find((p) => p.id === id);
      if (!pedido) return null;
      return (
        <div
          className={`${estilos.tarjetaPedido} ${seleccionados.has(id) ? estilos.seleccionada : ""} ${estilos.fantasma}`}
        >
          <span className={estilos.marcaSeleccion} aria-hidden="true">
            <Icono nombre="check" />
          </span>
          <div className={estilos.filaNumero}>
            <b className="mono">{pedido.numero}</b>
            <span className={`mono ${estilos.peso}`}>{formatoKg(pedido.totalKg)}</span>
          </div>
          <div className={estilos.cliente}>{pedido.cliente}</div>
          <div className={estilos.sector}>{pedido.sector}</div>
          <ul className={estilos.productos}>
            {pedido.lineas.map((linea, indice) => (
              <li key={`${linea.producto}-${linea.lote}-${indice}`}>
                <span>{linea.producto}</span>
                <span className={`mono ${estilos.cantidad}`}>{formatoKg(linea.cantidadKg)}</span>
              </li>
            ))}
          </ul>
          {contador}
        </div>
      );
    }
    const lista = opciones.opciones.find((o) => o.tipo === zona)?.pedidos ?? [];
    const indice = lista.findIndex((p) => p.id === id);
    const pedido = lista[indice];
    if (!pedido) return null;
    return (
      <div className={`${estilos.filaOpcion} ${estilos.fantasma}`}>
        <span className={estilos.orden}>{indice + 1}</span>
        <b className="mono">{pedido.numero}</b>
        <span className={estilos.nombreCliente}>{pedido.cliente}</span>
        <span className={`mono ${estilos.kgOpcion}`}>{formatoKg(pedido.totalKg)}</span>
        {contador}
      </div>
    );
  }
}
