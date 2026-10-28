"use client";

import { useEffect, useLayoutEffect, useOptimistic, useRef, useState, useTransition, type CSSProperties } from "react";
import Image from "next/image";
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
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Icono } from "@/componentes/comunes/iconos";
import { useMensajes } from "@/componentes/comunes/Mensajes";
import { VentanaConfirmacion } from "@/componentes/comunes/VentanaConfirmacion";
import { MENSAJE_ERROR_GENERAL } from "@/lib/errores";
import { formatoFecha, formatoHora } from "@/lib/fechas";
import { convertir, fmt } from "@/modulos/conversion/servicio";
import { useConexionEnVivo } from "@/modulos/tiempo-real/cliente";
import {
  despacharAccion,
  marcarLineaAccion,
  marcarTodoAccion,
  obtenerDetalleEnvioAccion,
  ordenarPorPesoAccion,
  reordenarColaAccion,
  reordenarLineasAccion,
} from "@/modulos/bodega/acciones";
import type { EnvioTablero } from "@/modulos/bodega/tablero";
import { reducirEnviosOptimistas, type AccionOptimistaBodega } from "../BodegaCliente";
import { ModalDetalle, type DetalleEnvioData } from "../ModalDetalle";
import { SiluetaCamion } from "./SiluetaCamion";
import { calcularDisposicion, type Disposicion } from "./disposicion";
import { fijarTema, useHidratado, useReloj, useTemaTablero } from "./preferencias";

type Linea = EnvioTablero["lineas"][number];
const CIRCUNFERENCIA = 2 * Math.PI * 42;
const esRuta = (e: EnvioTablero) => e.tipo === "ruta";
const etiqueta = (e: EnvioTablero) => (esRuta(e) ? "Ruta " : "Pedido ") + e.numero;
// Como el prototipo: el nombre grande va sin el código entre paréntesis del final.
const nombreBase = (producto: string) => producto.replace(/\s*\(.*\)\s*$/, "") || producto;

function useSensores() {
  return useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 380, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
}

/** Firma de las marcas para detectar lo que cambió desde la vista anterior (`marcasPrevias` del prototipo). */
function marcasDe(envios: EnvioTablero[]) {
  const marcas: Record<string, boolean> = {};
  for (const e of envios) for (const l of e.lineas) marcas[`${e.id}:${l.id}`] = l.marcado;
  return marcas;
}

export function TableroCliente({
  sede,
  enviosIniciales,
}: {
  sede: { id: number; nombre: string };
  enviosIniciales: EnvioTablero[];
}) {
  const router = useRouter();
  const mensaje = useMensajes();
  const [, iniciar] = useTransition();
  const tema = useTemaTablero();
  const reloj = useReloj();
  const hidratado = useHidratado();
  const enVivo = useConexionEnVivo(sede.id);

  // Los datos del servidor llegan de nuevo con cada aviso de tiempo real (router.refresh).
  const [previos, fijarPrevios] = useState(enviosIniciales);
  const [envios, fijarEnvios] = useState(enviosIniciales);
  if (enviosIniciales !== previos) {
    fijarPrevios(enviosIniciales);
    fijarEnvios(enviosIniciales);
  }
  const [lista, aplicarOptimista] = useOptimistic(envios, reducirEnviosOptimistas<EnvioTablero>);

  // Resalta las marcas que cambiaron, también las que llegan de otra pantalla.
  const actuales = marcasDe(lista);
  const firma = JSON.stringify(actuales);
  // Cada cambio de una línea suma uno a su contador, para repetir el resaltado aunque cambie dos veces seguidas.
  const [marcas, fijarMarcas] = useState({ firma, actuales, cambios: {} as Record<string, number> });
  if (marcas.firma !== firma) {
    const cambios = { ...marcas.cambios };
    for (const [clave, marcado] of Object.entries(actuales))
      if (clave in marcas.actuales && marcas.actuales[clave] !== marcado) cambios[clave] = (cambios[clave] ?? 0) + 1;
    fijarMarcas({ firma, actuales, cambios });
  }
  const recien = (clave: string) => marcas.cambios[clave] ?? 0;

  // La ruta o el pedido que mira esta pantalla (local, no se comparte); si no hay, el primero de la cola.
  // Se queda en la que está mostrando aunque cambie la prioridad, hasta que se despacha (`verPed` del prototipo).
  const [verId, ver] = useState<number | null>(null);
  const actual = lista.find((e) => e.id === verId) ?? lista[0] ?? null;
  if (actual && actual.id !== verId) ver(actual.id);
  const posicion = actual ? lista.indexOf(actual) : -1;

  const [detalle, fijarDetalle] = useState<DetalleEnvioData | null>(null);
  const [hecho, fijarHecho] = useState<{ titulo: string; texto: string } | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(temporizador.current), []);

  const operar = (accion: AccionOptimistaBodega, ejecutar: () => Promise<{ ok: boolean; error?: string }>) => {
    iniciar(async () => {
      aplicarOptimista(accion);
      // Si el servidor rechaza la acción o falla la red, el cambio optimista vuelve atrás con un mensaje (H-24).
      try {
        const resultado = await ejecutar();
        if (!resultado.ok) mensaje(resultado.error ?? MENSAJE_ERROR_GENERAL, "error");
        else fijarEnvios((anteriores) => reducirEnviosOptimistas(anteriores, accion));
      } catch {
        mensaje(MENSAJE_ERROR_GENERAL, "error");
      }
      router.refresh();
    });
  };

  const marcarLinea = (envioId: number, linea: Linea) =>
    operar({ tipo: "marcar-linea", envioId, lineaId: linea.id, marcado: !linea.marcado }, () =>
      marcarLineaAccion({ envioId, lineaId: linea.id, marcado: !linea.marcado }),
    );

  const verDetalle = async (envioId: number) => {
    try {
      const resultado = await obtenerDetalleEnvioAccion({ envioId });
      if (!resultado.ok) return mensaje(resultado.error, "error");
      fijarDetalle(resultado.datos);
    } catch {
      mensaje(MENSAJE_ERROR_GENERAL, "error");
    }
  };

  const despachar = async (envio: EnvioTablero) => {
    const resultado = await despacharAccion({ envioId: envio.id });
    if (!resultado.ok) return mensaje(resultado.error, "error");
    ver(null);
    fijarHecho({
      titulo: `${etiqueta(envio)} ${esRuta(envio) ? "despachada" : "despachado"}`,
      texto: esRuta(envio) ? `Pasa a En Ruta · ${envio.piloto?.name ?? "—"}` : "Pasa a Despachado",
    });
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => fijarHecho(null), 1900);
    router.refresh();
  };

  const sensores = useSensores();
  const alOrdenarCola = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const ids = lista.map((e) => e.id);
    const envioIds = arrayMove(ids, ids.indexOf(Number(active.id)), ids.indexOf(Number(over.id)));
    operar({ tipo: "reordenar-envios", envioIds }, () => reordenarColaAccion({ envioIds }));
  };

  const pantallaCompleta = () => {
    if (!document.fullscreenElement) void document.documentElement.requestFullscreen?.().catch(() => undefined);
    else void document.exitFullscreen();
  };

  return (
    <div className="tb" data-tema={tema} data-hidratado={hidratado}>
      <header className="tb-sup">
        <Image
          src={tema === "oscuro" ? "/marca/incovsa-quimicos-blanco.webp" : "/marca/incovsa-quimicos.webp"}
          alt="INCOVSA Químicos"
          width={453}
          height={172}
          priority
        />
        <div className="tb-tit">
          <small>Tablero de preparación</small>
          <b>Bodega {sede.nombre}</b>
        </div>
        <div className="der">
          <span className="tb-pill" data-vivo data-conectado={enVivo}>
            <i aria-hidden="true" />
            En vivo
          </span>
          <span className="tb-pill">
            <Icono nombre="lista" className="ico-s" /> {lista.length} en cola
          </span>
          <span className="tb-reloj">{reloj}</span>
          {(["claro", "oscuro"] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={`tb-btn ${tema === t ? "on" : ""}`}
              aria-pressed={tema === t}
              onClick={() => fijarTema(t)}
            >
              <Icono nombre={t === "claro" ? "sol" : "luna"} /> {t === "claro" ? "Modo claro" : "Modo oscuro"}
            </button>
          ))}
          <button
            type="button"
            className="tb-btn"
            title="Pantalla completa"
            aria-label="Pantalla completa"
            onClick={pantallaCompleta}
          >
            <Icono nombre="completa" />
          </button>
          <Link className="tb-btn" href="/picking/bodega" title="Volver al módulo" aria-label="Volver al módulo">
            <Icono nombre="salir" />
          </Link>
        </div>
      </header>

      <div className="tb-cuerpo">
        {actual ? (
          <>
            <Actual
              envio={actual}
              posicion={posicion}
              total={lista.length}
              recien={recien}
              alMarcar={(linea) => marcarLinea(actual.id, linea)}
              alMarcarTodo={(marcado) =>
                operar({ tipo: "marcar-todo", envioId: actual.id, marcado }, () =>
                  marcarTodoAccion({ envioId: actual.id, marcado }),
                )
              }
              alOrdenarPorPeso={() =>
                operar({ tipo: "ordenar-por-peso", envioId: actual.id }, () =>
                  ordenarPorPesoAccion({ envioId: actual.id }),
                )
              }
              alReordenar={(lineaIds) =>
                operar({ tipo: "reordenar-lineas", envioId: actual.id, lineaIds }, () =>
                  reordenarLineasAccion({ envioId: actual.id, lineaIds }),
                )
              }
              alVerDetalle={() => verDetalle(actual.id)}
              alDespachar={() => despachar(actual)}
            />
            <aside className="tb-lado">
              <Carga envio={actual} />
              <div className="tb-cola">
                <div className="tt">
                  <b>Cola de pedidos</b>
                  <small>Arrastre para priorizar</small>
                </div>
                <DndContext
                  id="dnd-tablero-cola"
                  sensors={sensores}
                  collisionDetection={closestCenter}
                  onDragEnd={alOrdenarCola}
                >
                  <SortableContext items={lista.map((e) => e.id)} strategy={verticalListSortingStrategy}>
                    <div className="tb-cola-lista">
                      {lista.map((e, i) => (
                        <EnCola
                          key={e.id}
                          envio={e}
                          prioridad={i + 1}
                          activo={e.id === actual.id}
                          alVer={() => ver(e.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </aside>
          </>
        ) : (
          <div className="tb-vacio">
            <Icono nombre="check" />
            <h2>No hay rutas ni pedidos por preparar</h2>
            <p>Cuando Facturación envíe una ruta o un pedido aparecerá aquí al instante.</p>
          </div>
        )}
      </div>

      <ModalDetalle abierto={detalle !== null} alCerrar={() => fijarDetalle(null)} datos={detalle} />

      {hecho && (
        <div className="tb-hecho" data-tema={tema} role="status">
          <div>
            <div className="ok">
              <Icono nombre="check" />
            </div>
            <h2>{hecho.titulo}</h2>
            <p>{hecho.texto}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Actual({
  envio,
  posicion,
  total,
  recien,
  alMarcar,
  alMarcarTodo,
  alOrdenarPorPeso,
  alReordenar,
  alVerDetalle,
  alDespachar,
}: {
  envio: EnvioTablero;
  posicion: number;
  total: number;
  recien: (clave: string) => number;
  alMarcar: (linea: Linea) => void;
  alMarcarTodo: (marcado: boolean) => void;
  alOrdenarPorPeso: () => void;
  alReordenar: (lineaIds: number[]) => void;
  alVerDetalle: () => void;
  alDespachar: () => Promise<void>;
}) {
  const ruta = esRuta(envio);
  const n = envio.lineas.length;
  const listas = envio.lineas.filter((l) => l.marcado).length;
  const todas = n > 0 && listas === n;
  const [disposicion, medirEn] = useDisposicion(n);
  const sensores = useSensores();

  const alOrdenar = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const ids = envio.lineas.map((l) => l.id);
    alReordenar(arrayMove(ids, ids.indexOf(Number(active.id)), ids.indexOf(Number(over.id))));
  };

  return (
    <section className="tb-actual" data-id={envio.id}>
      <div className="tb-cab">
        <div className={`tb-num ${ruta ? "" : "recoge"}`}>
          <small>{ruta ? "Ruta" : "Pedido"}</small>
          <b>{envio.numero}</b>
        </div>
        <div style={{ minWidth: 0 }}>
          <h2>
            Prioridad {posicion + 1} de {total}{" "}
            <span className="tb-tipo">{ruta ? "Envío en camión" : "Recoge en bodega"}</span>
          </h2>
          <div className="tb-meta">
            <span className="tb-programada">
              <Icono nombre="calendario" /> Programada{" "}
              <b>
                {formatoFecha(envio.programadoPara)} · {formatoHora(envio.programadoPara)}
              </b>
            </span>
            {ruta ? (
              <>
                <span>
                  <Icono nombre="camion" /> <b>{envio.camion?.identificacion ?? "—"}</b>
                </span>
                <span>
                  <Icono nombre="usuario" /> <b>{envio.piloto?.name ?? "—"}</b>
                </span>
              </>
            ) : (
              <span>
                <Icono nombre="edificio" /> <b>El cliente recoge en bodega</b>
              </span>
            )}
          </div>
        </div>
        <div className="tb-prog">
          <div className="tb-anillo">
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <circle className="fondo" cx="50" cy="50" r="42" fill="none" strokeWidth="9" />
              <circle
                className="avance"
                cx="50"
                cy="50"
                r="42"
                fill="none"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={CIRCUNFERENCIA}
                strokeDashoffset={CIRCUNFERENCIA * (1 - (n ? listas / n : 0))}
              />
            </svg>
            <span>
              {listas}/{n}
            </span>
          </div>
          <div className="tot">
            <b className="num">{fmt(envio.totalKg)}</b>
            <small>kg en {n} línea(s)</small>
          </div>
        </div>
      </div>

      <div className="tb-herr">
        <button type="button" className="tb-btn tb-btn-s" onClick={alVerDetalle}>
          <Icono nombre="lista" className="ico-s" /> Detalle de {ruta ? "Ruta" : "Pedido"}
        </button>
        <button
          type="button"
          className="tb-btn tb-btn-s"
          title="Ordenar las filas de mayor a menor peso"
          onClick={alOrdenarPorPeso}
        >
          <Icono nombre="grafica" className="ico-s" /> Ordenar por peso
        </button>
        <button type="button" className="tb-btn tb-btn-s" onClick={() => alMarcarTodo(!todas)}>
          <Icono nombre={todas ? "x" : "check"} className="ico-s" /> {todas ? "Desmarcar todo" : "Marcar todo"}
        </button>
      </div>

      <DndContext
        id={`dnd-tablero-lineas-${envio.id}`}
        sensors={sensores}
        collisionDetection={closestCenter}
        onDragEnd={alOrdenar}
      >
        <SortableContext
          items={envio.lineas.map((l) => l.id)}
          strategy={disposicion.columnas === 2 ? rectSortingStrategy : verticalListSortingStrategy}
        >
          <div
            ref={medirEn}
            className={`tb-lineas ${disposicion.columnas === 2 ? "dos" : ""}`}
            style={
              disposicion.columnas === 2
                ? { gridTemplateRows: `repeat(${disposicion.filas}, ${disposicion.altoLinea}px)` }
                : undefined
            }
          >
            {envio.lineas.map((linea, i) => (
              <LineaTablero
                key={linea.id}
                linea={linea}
                numero={i + 1}
                recien={recien(`${envio.id}:${linea.id}`)}
                disposicion={disposicion}
                alMarcar={() => alMarcar(linea)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="tb-pie">
        <div className="txt">
          {todas ? (
            <>
              <b>Todo listo.</b> Al despachar,{" "}
              {ruta ? (
                <>
                  la ruta pasa a <b>En Ruta</b>
                </>
              ) : (
                <>
                  el pedido pasa a <b>Despachado</b>
                </>
              )}
              .
            </>
          ) : (
            <>
              Toque cada línea cuando el producto esté fuera de la bodega. Faltan <b>{n - listas}</b>.
            </>
          )}
        </div>
        <VentanaConfirmacion
          titulo={`Despachar ${etiqueta(envio)}`}
          texto={
            <>
              {ruta ? "La ruta" : "El pedido"} pasa a <b>{ruta ? "En Ruta" : "Despachado"}</b>
              {ruta ? ` y aparece en el módulo de Ruta de ${envio.piloto?.name ?? "—"}` : ""}. No se requiere confirmar
              la carga en el camión.
            </>
          }
          textoConfirmar={ruta ? "Ruta Despachada" : "Pedido Despachado"}
          alConfirmar={alDespachar}
        >
          <button type="button" className="tb-despachar" disabled={!todas}>
            <Icono nombre="check" /> {ruta ? "Ruta Despachada" : "Pedido Despachado"}
          </button>
        </VentanaConfirmacion>
      </div>
    </section>
  );
}

/** Mide el espacio de las líneas y calcula su alto, como `ajustar()` del prototipo, al cambiar el tamaño. */
function useDisposicion(lineas: number): [Disposicion, (nodo: HTMLDivElement | null) => void] {
  const [nodo, fijarNodo] = useState<HTMLDivElement | null>(null);
  const [disposicion, fijarDisposicion] = useState<Disposicion>({
    columnas: 1,
    filas: lineas,
    altoLinea: null,
    letra: null,
  });
  const ultima = useRef("");
  useLayoutEffect(() => {
    if (!nodo) return;
    const medir = () => {
      const estilo = getComputedStyle(nodo);
      const nueva = calcularDisposicion({
        alto: nodo.clientHeight - parseFloat(estilo.paddingTop) - parseFloat(estilo.paddingBottom),
        ancho: nodo.clientWidth,
        separacion: parseFloat(estilo.rowGap) || 8,
        lineas,
        anchoVentana: window.innerWidth,
      });
      const clave = JSON.stringify(nueva);
      if (clave === ultima.current) return;
      ultima.current = clave;
      fijarDisposicion(nueva);
    };
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(nodo);
    void document.fonts?.ready.then(medir);
    return () => observador.disconnect();
  }, [nodo, lineas]);
  return [disposicion, fijarNodo];
}

function LineaTablero({
  linea,
  numero,
  recien,
  disposicion,
  alMarcar,
}: {
  linea: Linea;
  numero: number;
  /** Cuántas veces cambió la marca de la línea; alterna dos animaciones iguales para repetir el resaltado. */
  recien: number;
  disposicion: Disposicion;
  alMarcar: () => void;
}) {
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: linea.id,
  });
  const { unidades, restoKg } = convertir(linea.cantidadKg, linea.pesoConversionKg);
  const lote = linea.lote ? `Lote ${linea.lote}` : "Sin lote";
  const estilo: CSSProperties & Record<"--alto", string | undefined> = {
    transform: CSS.Transform.toString(transform),
    transition,
    "--alto": disposicion.altoLinea === null ? undefined : `${disposicion.altoLinea}px`,
    height: disposicion.altoLinea ?? undefined,
    fontSize: disposicion.letra ?? undefined,
  };
  return (
    <div
      ref={setNodeRef}
      style={estilo}
      className={`tb-linea ${linea.marcado ? "lista" : ""} ${recien ? (recien % 2 ? "recien" : "recien-2") : ""} ${isDragging ? "arrastrando" : ""}`}
      data-id={linea.id}
      onClick={(e) => {
        // Toda la línea se marca con un toque; la casilla también sirve con el teclado.
        if ((e.target as Element).closest(".asa-tb, .chk-tb")) return;
        alMarcar();
      }}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        className="asa-tb"
        title="Arrastre para cambiar el orden"
        {...attributes}
        {...listeners}
        aria-label={`Arrastre para cambiar el orden de ${linea.producto}`}
      >
        <Icono nombre="asa" />
      </button>
      <span className="ord">{numero}</span>
      <div className="prod">
        <b>{nombreBase(linea.producto)}</b>
        <small className="cod-l">
          <span className={`lote-tb ${linea.lote ? "" : "sin"}`}>{lote}</span>
          <span className="cod-n">{linea.producto}</span>
        </small>
      </div>
      <div className="kg">
        <span className="num">{fmt(linea.cantidadKg)} kg</span>
        <small>÷ {fmt(linea.pesoConversionKg)} kg</small>
      </div>
      <div className="un">
        <div className="un-n">
          <b className="num">{fmt(unidades)}</b>
          <small>{unidades === 1 ? "unidad" : "unidades"}</small>
          {restoKg > 0 && <span className="resto">+ {fmt(restoKg)} kg</span>}
        </div>
        <button
          type="button"
          className="chk-tb"
          aria-pressed={linea.marcado}
          aria-label={`Marcar como listo: ${linea.producto} · ${lote}`}
          onClick={alMarcar}
        >
          <Icono nombre="check" />
        </button>
      </div>
    </div>
  );
}

function calcularOcupacionFallback(lineas: EnvioTablero["lineas"]): NonNullable<EnvioTablero["ocupacion"]> {
  const tot = lineas.reduce((acc, l) => acc + Number(l.cantidadKg), 0);
  const base = Math.max(1, tot);
  const segmentos: Record<number, { ancho: number; numerado: boolean }> = {};
  for (const l of lineas) {
    const kg = Number(l.cantidadKg);
    const fraccion = base > 0 ? kg / base : 0;
    segmentos[l.id] = {
      ancho: fraccion * 100,
      numerado: fraccion > 0.035,
    };
  }
  return {
    totalKg: String(tot),
    porcentaje: Math.round(tot * 100),
    porcentajeBarra: Math.min(100, tot * 100),
    lleno: tot >= 1,
    segmentos,
  };
}

function Carga({ envio }: { envio: EnvioTablero }) {
  if (!esRuta(envio))
    return (
      <div className="tb-camion">
        <div className="tb-recoge">
          <Icono nombre="edificio" />
          <b>El cliente recoge en bodega</b>
          <span>No pasa por Ruta. Al despachar, el pedido termina como Despachado.</span>
        </div>
        <div className="tb-carga">
          <b className="num">{fmt(envio.totalKg)} kg</b>
          <span>{envio.lineas.length} producto(s)</span>
        </div>
      </div>
    );
  const camion = envio.camion ?? { identificacion: "—", capacidadKg: "1" };
  const ocupacion = envio.ocupacion ?? calcularOcupacionFallback(envio.lineas);
  return (
    <div className="tb-camion">
      <div className="tt">
        <b>{camion.identificacion}</b>
        <small>Capacidad {fmt(camion.capacidadKg)} kg</small>
      </div>
      <SiluetaCamion capacidadKg={camion.capacidadKg} />
      <div className="tb-carga">
        <b className="num">{fmt(ocupacion.totalKg)} kg</b>
        <span>{ocupacion.porcentaje} % de la capacidad</span>
      </div>
      <div className={`tb-barra ${ocupacion.lleno ? "lleno" : ""}`}>
        <i style={{ width: `${ocupacion.porcentajeBarra}%` }} />
      </div>
      <div className="tb-plano">
        <div className="lbl">
          <span>Ocupación por peso, en el orden del tablero</span>
          <span>Propuesta visual</span>
        </div>
        <div className="cama">
          <div className="cabina">CABINA</div>
          {envio.lineas.map((l, i) => {
            const segmento = ocupacion.segmentos[l.id];
            return (
              <div
                key={l.id}
                className={`seg ${l.marcado ? "lista" : ""}`}
                style={{ width: `${segmento?.ancho ?? 0}%` }}
                title={`${l.producto} · lote ${l.lote || "—"} · ${fmt(l.cantidadKg)} kg`}
              >
                {segmento?.numerado ? i + 1 : ""}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EnCola({
  envio,
  prioridad,
  activo,
  alVer,
}: {
  envio: EnvioTablero;
  prioridad: number;
  activo: boolean;
  alVer: () => void;
}) {
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: envio.id,
  });
  const n = envio.lineas.length;
  const listas = envio.lineas.filter((l) => l.marcado).length;
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`tb-sig ${activo ? "on" : ""} ${isDragging ? "arrastrando" : ""}`}
      data-id={envio.id}
      onClick={(e) => {
        if (!(e.target as Element).closest(".asa-tb")) alVer();
      }}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        className="asa-tb"
        title="Arrastre para cambiar la prioridad"
        {...attributes}
        {...listeners}
        aria-label={`Arrastre para cambiar la prioridad de ${etiqueta(envio)}`}
      >
        <Icono nombre="asa" />
      </button>
      <button type="button" className="tb-sig-ver d" aria-current={activo ? "true" : undefined}>
        <span className="pos">Prioridad {prioridad}</span>
        <b>
          {etiqueta(envio)} · {esRuta(envio) ? (envio.camion?.identificacion ?? "—") : "Recoge en bodega"}
        </b>
        <small>
          {n} líneas · {fmt(envio.totalKg)} kg · programada {formatoHora(envio.programadoPara)}
        </small>
        <span className="mini">
          <i style={{ width: `${n ? (listas / n) * 100 : 0}%` }} />
        </span>
      </button>
      <span className="p">
        {listas}/{n}
      </span>
    </div>
  );
}
