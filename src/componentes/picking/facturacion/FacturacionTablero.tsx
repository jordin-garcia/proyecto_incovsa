"use client";

import { useLayoutEffect, useRef, useState, useTransition } from "react";
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
import { cargarArchivo, eliminarPedidosFacturados } from "@/modulos/envios/acciones";
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
}: {
  pedidos: PedidoEnTablero[];
  sedeId: number;
  sedeNombre: string;
}) {
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

  return (
    <>
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
                          de {seleccionadosEnTablero[0]!.cliente || "Sin nombre"} (
                          {formatoKg(seleccionadosEnTablero[0]!.totalKg)})? La eliminación queda en la bitácora.
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
          <div className={estilos.lista} data-testid="tablero-pedidos" ref={lista}>
            {pedidos.length ? (
              pedidos.map((pedido) => {
                const seleccionado = seleccionados.has(pedido.id);
                return (
                  <article
                    key={pedido.id}
                    className={`${estilos.tarjetaPedido} ${seleccionado ? estilos.seleccionada : ""}`}
                    role="button"
                    tabIndex={0}
                    aria-pressed={seleccionado}
                    title="Clic para seleccionar"
                    onClick={() => alternarSeleccion(pedido.id)}
                    onKeyDown={(evento) => {
                      if (evento.key === " " || evento.key === "Enter") {
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
                    <div className={estilos.cliente}>{pedido.cliente || "Sin nombre"}</div>
                    <div className={estilos.sector}>{pedido.sector || "Sin sector"}</div>
                    <ul className={estilos.productos} aria-label="Productos del pedido facturado">
                      {pedido.lineas.map((linea, indice) => (
                        <li key={`${linea.producto}-${linea.lote}-${indice}`}>
                          <span>{linea.producto}</span>
                          <span className={`mono ${estilos.cantidad}`}>{formatoKg(linea.cantidadKg)}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })
            ) : (
              <div className={estilos.vacio}>
                <Icono nombre="archivo" aria-hidden="true" />
                <h3>No hay pedidos facturados en el tablero</h3>
                <p>
                  Cargue el archivo de Odoo, o arrastre aquí un pedido facturado para regresarlo de una opción de envío.
                </p>
              </div>
            )}
          </div>
        </section>

        <aside className={estilos.opciones} aria-labelledby="titulo-opciones">
          <h2 id="titulo-opciones">Opciones de envío</h2>
          <section className={`tarjeta ${estilos.opcion}`}>
            <div className={estilos.cabeceraOpcion}>
              <span className={estilos.iconoOpcion}>
                <Icono nombre="camion" aria-hidden="true" />
              </span>
              <div>
                <h3>Envío por camión</h3>
                <small>
                  Al enviarse se crea una <b>ruta</b>
                </small>
              </div>
              <span className="chip">0 pedido(s) facturado(s)</span>
            </div>
            <div className={estilos.zonaVacia}>Arrastre aquí pedidos facturados</div>
          </section>
          <section className={`tarjeta ${estilos.opcion}`}>
            <div className={estilos.cabeceraOpcion}>
              <span className={estilos.iconoOpcion}>
                <Icono nombre="edificio" aria-hidden="true" />
              </span>
              <div>
                <h3>Cliente recoge en bodega</h3>
                <small>
                  Al enviarse se crea un <b>pedido</b>; no pasa por Ruta
                </small>
              </div>
              <span className="chip">0 pedido(s) facturado(s)</span>
            </div>
            <div className={estilos.zonaVacia}>Arrastre aquí pedidos facturados</div>
          </section>
        </aside>
      </div>
      <p className={estilos.ayuda}>
        Clic o toque en una tarjeta para seleccionarla. Lo que está en el tablero se guarda.
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
    </>
  );
}
