"use client";

import { useTransition } from "react";
import { Icono } from "@/componentes/comunes/iconos";
import { VentanaConfirmacion } from "@/componentes/comunes/VentanaConfirmacion";
import { useMensajes } from "@/componentes/comunes/Mensajes";
import { formatoFecha, formatoHora } from "@/lib/fechas";
import { fmt } from "@/modulos/conversion/servicio";
import { Unidades } from "./Unidades";
import { marcarLineaAccion, marcarTodoAccion, ordenarPorPesoAccion, despacharAccion } from "@/modulos/bodega/acciones";

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
    pesoConversionKg: number | string;
    cantidadKg: number | string;
    marcado: boolean;
    posicion: number;
  }>;
}

interface TarjetaEnvioProps {
  envio: EnvioBodegaItem;
  prioridad: number;
  alVerDetalle: (envioId: number) => void;
  alActualizar: () => void;
}

export function TarjetaEnvio({ envio, prioridad, alVerDetalle, alActualizar }: TarjetaEnvioProps) {
  const mostrarMensaje = useMensajes();
  const [pendiente, startTransition] = useTransition();

  const esRuta = envio.tipo === "ruta" || envio.tipo === "camion";
  const etiqueta = (esRuta ? "Ruta " : "Pedido ") + envio.numero;
  const destino = esRuta ? "En Ruta" : "Despachado";
  const todasMarcadas = envio.lineas.length > 0 && envio.lineas.every((l) => l.marcado);

  const alternarMarcaLinea = (lineaId: number, estadoActual: boolean) => {
    startTransition(async () => {
      const res = await marcarLineaAccion({
        envioId: envio.id,
        lineaId,
        marcado: !estadoActual,
      });
      if (!res.ok) {
        mostrarMensaje(res.error, "error");
      } else {
        alActualizar();
      }
    });
  };

  const alternarMarcarTodo = () => {
    const nuevoValor = !todasMarcadas;
    startTransition(async () => {
      const res = await marcarTodoAccion({
        envioId: envio.id,
        marcado: nuevoValor,
      });
      if (!res.ok) {
        mostrarMensaje(res.error, "error");
      } else {
        alActualizar();
      }
    });
  };

  const ordenarPorPeso = () => {
    startTransition(async () => {
      const res = await ordenarPorPesoAccion({ envioId: envio.id });
      if (!res.ok) {
        mostrarMensaje(res.error, "error");
      } else {
        mostrarMensaje("Filas ordenadas de mayor a menor peso.", "exito");
        alActualizar();
      }
    });
  };

  const despachar = async () => {
    const res = await despacharAccion({ envioId: envio.id });
    if (!res.ok) {
      mostrarMensaje(res.error, "error");
    } else {
      mostrarMensaje(`${etiqueta} → ${destino}.`, "exito");
      alActualizar();
    }
  };

  const porcentajeAvance = envio.lineasContador > 0 ? (envio.lineasListas / envio.lineasContador) * 100 : 0;

  return (
    <article className="tarjeta ped" data-id={envio.id}>
      <div className="ped-cab">
        <span className="asa asa-ped" title="Arrastre para cambiar la prioridad">
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
          onClick={ordenarPorPeso}
          title="Ordenar las filas de mayor a menor peso"
          disabled={pendiente}
        >
          <Icono nombre="grafica" className="ico-s" /> Ordenar por peso
        </button>

        <button type="button" className="btn btn-s btn-sm" onClick={alternarMarcarTodo} disabled={pendiente}>
          <Icono nombre={todasMarcadas ? "x" : "check"} className="ico-s" />
          {todasMarcadas ? "Desmarcar todo" : "Marcar todo"}
        </button>
      </div>

      <div className="tabla-caja">
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
          <tbody>
            {envio.lineas.map((linea) => {
              const cantNum = Number(linea.cantidadKg);
              const pesoNum = Number(linea.pesoConversionKg);
              return (
                <tr key={linea.id} className={linea.marcado ? "lista" : ""}>
                  <td>
                    <span className="asa">
                      <Icono nombre="asa" className="ico-s" />
                    </span>
                  </td>
                  <td className="cod">{linea.producto}</td>
                  <td>
                    <span className={`lote ${linea.lote ? "" : "sin"}`}>
                      {linea.lote ? `Lote ${linea.lote}` : "Sin lote"}
                    </span>
                  </td>
                  <td className="der kg">{fmt(cantNum)}</td>
                  <td>
                    <Unidades cantidadKg={linea.cantidadKg} pesoConversionKg={linea.pesoConversionKg} />
                    <span className="muted mono" style={{ fontSize: "11.5px", marginLeft: "4px" }}>
                      ÷ {fmt(pesoNum)}
                    </span>
                  </td>
                  <td className="cen">
                    <button
                      type="button"
                      className={`marca ${linea.marcado ? "on" : ""}`}
                      aria-pressed={linea.marcado}
                      aria-label="Marcar como listo"
                      onClick={() => alternarMarcaLinea(linea.id, linea.marcado)}
                      disabled={pendiente}
                    >
                      <Icono nombre="check" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
