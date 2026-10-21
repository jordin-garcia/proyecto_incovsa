"use client";

import { useLayoutEffect, useRef, useState, useTransition } from "react";
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

export function FacturacionTablero({
  pedidos,
  sedeId,
  sedeNombre,
  opciones,
  puedeVerBodega,
}: {
  pedidos: PedidoEnTablero[];
  sedeId: number;
  sedeNombre: string;
  opciones: OpcionesFacturacion;
  puedeVerBodega: boolean;
}) {
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
  const router = useRouter();
  const mensaje = useMensajes();
  const [seleccionados, seleccionar] = useState<Set<number>>(() => new Set());
  const [resumen, mostrarResumen] = useState<ResumenCarga | null>(null);
  const [ocupado, iniciarTransicion] = useTransition();
  const lista = useRef<HTMLDivElement>(null);
  const archivo = useRef<HTMLInputElement>(null);
  const restaurarDesplazamiento = useRef<number | null>(null);
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
      if (!seleccionados.size) elemento.style.paddingBottom = "";
      return;
    }
    if (!seleccionados.size) {
      elemento.style.paddingBottom = "";
    } else {
      const rellenoActual = Number.parseFloat(getComputedStyle(elemento).paddingBottom) || 0;
      const espacioNecesario = Math.max(0, scrollTop + elemento.clientHeight - elemento.scrollHeight);
      elemento.style.paddingBottom = `${rellenoActual + espacioNecesario}px`;
    }
    elemento.scrollTop = scrollTop;
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
    const resultado = await eliminarPedidosFacturados({ sedeId, ids: idsSeleccionados });
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
    iniciarTransicion(async () => {
      const resultado = await moverPedidosFacturados({
        sedeId,
        ids,
        origen: origen === "tablero" ? null : (origen as TipoOpcion),
        destino: destino === "tablero" ? null : (destino as TipoOpcion),
        antesDe,
      });
      if (!resultado.ok) mensaje(resultado.error, "error");
      else seleccionar(new Set());
      router.refresh();
    });
  }

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
        fijarActivo({ id: Number(active.id), zona: String(active.data.current?.zona ?? "tablero") });
        arrastrar(
          active.data.current?.zona === "tablero" && seleccionados.has(Number(active.id))
            ? idsSeleccionados
            : [Number(active.id)],
        );
      }}
      onDragCancel={() => arrastrar([])}
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
            <Icono nombre="subir" aria-hidden="true" /> {ocupado ? "Cargando archivo…" : "Cargar archivo .xlsx"}
          </Button>
        }
      />
      <div className={estilos.disposicion}>
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
                    <Button variant="peligro" size="pequeno" disabled={ocupado}>
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
                      title="Clic para seleccionar"
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
              ocupado={ocupado}
              puedeVerBodega={puedeVerBodega}
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
                  <p>Los datos de esos pedidos facturados deben corregirse en Odoo y volver a exportarse (P-91).</p>
                )}
              </div>
            </DialogDescription>
          </div>
          <div className="modal-pie">
            <Button onClick={() => mostrarResumen(null)}>Listo</Button>
          </div>
        </DialogContent>
      </Dialog>
      <DragOverlay>{arrastrados.length > 0 && activo ? fantasma(activo, arrastrados.length) : null}</DragOverlay>
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
