"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CampoFecha } from "@/componentes/comunes/CampoFecha";
import { CampoHora } from "@/componentes/comunes/CampoHora";
import { Medidor } from "@/componentes/comunes/Medidor";
import { Icono } from "@/componentes/comunes/iconos";
import { formatoKg } from "@/componentes/comunes/formato";
import { claveCliente } from "@/modulos/envios/cliente";
import { formatoFecha } from "@/lib/fechas";
import { ErrorNegocio } from "@/lib/errores";
import { Button } from "@/componentes/ui/button";
import { SelectNativo } from "@/componentes/ui/select-nativo";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/componentes/ui/dialog";
import { VentanaConfirmacion } from "@/componentes/comunes/VentanaConfirmacion";
import { useMensajes } from "@/componentes/comunes/Mensajes";
import { guardarCampoDeOpcion, cancelarOpcionDeEnvio, enviarOpcionABodega } from "@/modulos/envios/acciones";
import { estadoDePedidos } from "@/modulos/envios/estado-pedidos";
import type { EstadoPedidos } from "@/modulos/envios/esquemas";
import type { OpcionFacturacion, OpcionesFacturacion, EnvioCreado } from "@/modulos/envios/opciones";
import { PedidoArrastrable, ZonaArrastre } from "./ArrastreFacturacion";
import estilos from "./FacturacionTablero.module.css";

export function gramos(texto: string): bigint {
  const [entero = "0", fraccion = ""] = texto.split(".");
  return BigInt(entero) * 1000n + BigInt(fraccion.padEnd(3, "0").slice(0, 3));
}
export function kg(gramos: bigint): string {
  return `${gramos / 1000n}.${String(gramos % 1000n).padStart(3, "0")}`;
}

export function OpcionEnvio({
  opcion,
  camiones,
  pilotos,
  sedeId,
  sedeNombre,
  ocupado,
  puedeVerBodega,
  alInteraccion,
}: Omit<OpcionesFacturacion, "opciones"> & {
  opcion: OpcionFacturacion;
  sedeId: number;
  sedeNombre: string;
  ocupado: boolean;
  puedeVerBodega: boolean;
  alInteraccion: (clave: string, activa: boolean) => void;
}) {
  const router = useRouter(),
    mensaje = useMensajes();
  const [local, cambiarLocal] = useState(opcion);
  const [anterior, recordar] = useState(opcion);
  const confirmacion = useRef<EstadoPedidos>([]);
  const [editando, editar] = useState(false);
  const pendientes = useRef(0);
  const cola = useRef<Promise<void>>(Promise.resolve());
  const [guardando, guardar] = useState(false);
  const [fallo, fallar] = useState(false);
  const [enviado, mostrarEnviado] = useState<{
    envio: EnvioCreado;
    fecha: string;
    hora: string;
    camion?: string;
    piloto?: string;
  } | null>(null);
  if (!guardando && !editando && anterior !== opcion) {
    recordar(opcion);
    cambiarLocal(opcion);
  }
  useEffect(() => {
    const clave = `opcion-${opcion.tipo}`;
    alInteraccion(clave, editando || guardando);
    return () => alInteraccion(clave, false);
  }, [alInteraccion, opcion.tipo, editando, guardando]);
  const esRuta = opcion.tipo === "camion",
    nombre = esRuta ? "Envío por camión" : "Cliente recoge en bodega";
  const camion = camiones.find((c) => c.id === local.camionId),
    piloto = pilotos.find((p) => p.id === local.pilotoId);
  const total = opcion.pedidos.reduce((t, p) => t + gramos(p.totalKg), 0n);
  const exceso = !!camion && total > gramos(camion.capacidadKg);
  const listo = !!(
    opcion.pedidos.length &&
    local.fecha &&
    local.hora &&
    (!esRuta || (camion && piloto)) &&
    !guardando &&
    !fallo &&
    !ocupado
  );
  const etiqueta = `${esRuta ? "Ruta" : "Pedido"} ${opcion.siguienteNumero}`;
  const clientes = new Set(opcion.pedidos.map(claveCliente)).size;

  function cambiar(campo: "fecha" | "hora" | "camion" | "piloto", valor: string | number | null) {
    const atributo = campo === "camion" ? "camionId" : campo === "piloto" ? "pilotoId" : campo;
    cambiarLocal((actual) => ({ ...actual, [atributo]: valor ?? (campo === "fecha" || campo === "hora" ? "" : null) }));
    pendientes.current += 1;
    guardar(true);
    cola.current = cola.current.then(async () => {
      try {
        const resultado = await guardarCampoDeOpcion({
          sedeId,
          tipo: opcion.tipo,
          campo,
          valor: valor === "" ? null : valor,
        });
        if (!resultado.ok) throw new ErrorNegocio(resultado.error);
        fallar(false);
      } catch (error) {
        fallar(true);
        mensaje(error instanceof ErrorNegocio ? error.message : "No se pudo guardar la opción de envío.", "error");
      } finally {
        pendientes.current -= 1;
        if (!pendientes.current) {
          guardar(false);
          router.refresh();
        }
      }
    });
  }
  async function enviar() {
    await cola.current;
    const resultado = await enviarOpcionABodega({ sedeId, tipo: opcion.tipo, estadoEsperado: confirmacion.current });
    if (!resultado.ok) {
      router.refresh();
      throw new ErrorNegocio(resultado.error);
    }
    if (resultado.datos)
      mostrarEnviado({
        envio: resultado.datos,
        fecha: local.fecha,
        hora: local.hora,
        camion: camion?.nombre,
        piloto: piloto?.nombre,
      });
    router.refresh();
  }
  return (
    <section
      className={`tarjeta ${estilos.opcion} ${exceso ? estilos.exceso : ""}`}
      aria-labelledby={`opcion-${opcion.tipo}`}
    >
      <div className={estilos.cabeceraOpcion}>
        <span className={estilos.iconoOpcion}>
          <Icono nombre={esRuta ? "camion" : "edificio"} aria-hidden="true" />
        </span>
        <div>
          <h3 id={`opcion-${opcion.tipo}`}>{nombre}</h3>
          <small>
            Al enviarse se crea{" "}
            {esRuta ? (
              <>
                una <b>ruta</b>
              </>
            ) : (
              <>
                un <b>pedido</b>; no pasa por Ruta
              </>
            )}
          </small>
        </div>
        <span className="chip">{opcion.pedidos.length} pedido(s) facturado(s)</span>
      </div>
      {esRuta && (
        <div className={`rejilla r2 ${estilos.campos}`}>
          <label className="campo">
            <span>Camión *</span>
            <SelectNativo
              aria-label="Camión *"
              value={local.camionId ?? ""}
              onChange={(e) => cambiar("camion", e.target.value ? Number(e.target.value) : null)}
              disabled={ocupado}
            >
              <option value="">{camiones.length ? "Elija el camión" : "Sin camiones en la sede"}</option>
              {camiones.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} · {formatoKg(c.capacidadKg)}
                </option>
              ))}
            </SelectNativo>
          </label>
          <label className="campo">
            <span>Piloto *</span>
            <SelectNativo
              aria-label="Piloto *"
              value={local.pilotoId ?? ""}
              onChange={(e) => cambiar("piloto", e.target.value || null)}
              disabled={ocupado}
            >
              <option value="">{pilotos.length ? "Elija el piloto" : "Sin pilotos en la sede"}</option>
              {pilotos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </SelectNativo>
          </label>
        </div>
      )}
      <div
        className={`rejilla r2 ${estilos.campos}`}
        onFocusCapture={() => editar(true)}
        onBlurCapture={(evento) => {
          if (!evento.currentTarget.contains(evento.relatedTarget as Node | null)) editar(false);
        }}
      >
        <CampoFecha
          etiqueta={`Fecha programada de ${esRuta ? "envío" : "despacho"} *`}
          valor={local.fecha}
          alCambiar={(v) => cambiar("fecha", v)}
          disabled={ocupado}
          required
        />
        <CampoHora
          etiqueta="Hora programada *"
          valor={local.hora}
          alCambiar={(v) => cambiar("hora", v)}
          disabled={ocupado}
          required
        />
      </div>
      <ZonaArrastre zona={opcion.tipo} className={estilos.zonaOpcion}>
        <SortableContext items={opcion.pedidos.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          {opcion.pedidos.length ? (
            opcion.pedidos.map((p, i) => (
              <PedidoArrastrable
                key={p.id}
                idPedido={p.id}
                zona={opcion.tipo}
                className={estilos.filaOpcion}
                title="Arrastre para cambiar el orden, llevarlo a la otra opción o regresarlo al tablero"
              >
                <span className={estilos.orden}>{i + 1}</span>
                <b className="mono">{p.numero}</b>
                <span className={estilos.nombreCliente}>{p.cliente}</span>
                <span className={`mono ${estilos.kgOpcion}`}>{formatoKg(p.totalKg)}</span>
              </PedidoArrastrable>
            ))
          ) : (
            <div className={estilos.vacioOpcion}>Arrastre aquí pedidos facturados</div>
          )}
        </SortableContext>
      </ZonaArrastre>
      <div>
        <div className={estilos.pesoOpcion}>
          <span>
            {esRuta ? (camion ? "Peso acumulado" : "Elija el camión para comparar con su capacidad") : "Total"}
          </span>
          <span className="mono">
            {camion
              ? `${formatoKg(kg(total)).replace(" kg", "")} / ${formatoKg(camion.capacidadKg)}`
              : formatoKg(kg(total))}
          </span>
        </div>
        {camion && (
          <Medidor
            valor={Number(total)}
            maximo={Number(gramos(camion.capacidadKg))}
            etiqueta="Peso acumulado frente a capacidad del camión"
          />
        )}
      </div>
      {exceso && camion && (
        <div className="aviso aviso-a">
          <Icono nombre="alerta" aria-hidden="true" />
          <div>
            <strong>Sobrepeso.</strong> El total ({formatoKg(kg(total))}) excede la capacidad de {camion.nombre} en{" "}
            {formatoKg(kg(total - gramos(camion.capacidadKg)))}. La alerta solo informa: se puede enviar igual (RN-13).
          </div>
        </div>
      )}
      <div className={estilos.accionesOpcion}>
        <VentanaConfirmacion
          titulo={`Cancelar · ${nombre}`}
          texto={
            <>
              Los <b>{opcion.pedidos.length}</b> pedidos facturados de esta opción regresan al tablero. No se crea nada
              y no se pierde nada. La cancelación queda en la bitácora.
            </>
          }
          textoConfirmar="Regresar al tablero"
          alConfirmar={async () => {
            await cola.current;
            const resultado = await cancelarOpcionDeEnvio({
              sedeId,
              tipo: opcion.tipo,
              estadoEsperado: confirmacion.current,
            });
            if (!resultado.ok) {
              router.refresh();
              throw new ErrorNegocio(resultado.error);
            }
            mensaje("Los pedidos facturados regresaron al tablero.");
            router.refresh();
          }}
        >
          <Button
            variant="secundario"
            size="pequeno"
            disabled={!opcion.pedidos.length || ocupado || guardando}
            onClick={() => {
              confirmacion.current = estadoDePedidos(opcion.pedidos);
            }}
          >
            Cancelar
          </Button>
        </VentanaConfirmacion>
        <VentanaConfirmacion
          titulo="Enviar a Bodega"
          texto={
            <div className={`${estilos.resumen} ${estilos.resumenEnvio}`}>
              <div>
                Se crea {esRuta ? "la" : "el"} <b>{etiqueta}</b> de hoy en {sedeNombre} con {opcion.pedidos.length}{" "}
                pedido(s) facturado(s) de {clientes} cliente(s) y {formatoKg(kg(total))}, en este orden:{" "}
                {opcion.pedidos.map((p) => p.numero).join(", ")}.
              </div>
              <div>
                Programada para el{" "}
                <b>
                  {local.fecha ? formatoFecha(local.fecha) : ""} a las {local.hora}
                </b>
                . Pasa a <b>En Preparación</b> en Bodega.
              </div>
              {esRuta ? (
                <>
                  <div>
                    {camion?.nombre} · {piloto?.nombre}.
                  </div>
                  {exceso && camion && (
                    <div className="aviso aviso-a">
                      <Icono nombre="alerta" aria-hidden="true" />
                      <div>
                        El total excede la capacidad del camión ({formatoKg(camion.capacidadKg)}). Se puede enviar
                        igual.
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div>El cliente recoge en bodega: no pasa por Ruta.</div>
              )}
            </div>
          }
          textoConfirmar="Enviar a Bodega"
          alConfirmar={enviar}
        >
          <Button
            size="pequeno"
            onClick={() => {
              confirmacion.current = estadoDePedidos(opcion.pedidos);
            }}
            disabled={!listo}
            title={
              listo
                ? ""
                : esRuta
                  ? "Faltan pedidos facturados, camión, piloto, fecha u hora"
                  : "Faltan pedidos facturados, fecha u hora"
            }
          >
            <Icono nombre="flecha" aria-hidden="true" /> Enviar a Bodega
          </Button>
        </VentanaConfirmacion>
      </div>
      <Dialog open={!!enviado} onOpenChange={(abierto) => !abierto && mostrarEnviado(null)}>
        <DialogContent>
          <div className="modal-cab">
            <DialogTitle>
              {enviado?.envio.tipo === "ruta"
                ? `Ruta ${enviado.envio.numero} enviada`
                : `Pedido ${enviado?.envio.numero} enviado`}{" "}
              a Bodega
            </DialogTitle>
          </div>
          <div className="modal-cuerpo">
            <DialogDescription asChild>
              <div className={estilos.exito}>
                <span className={estilos.marcaExito}>
                  <Icono nombre="check" aria-hidden="true" />
                </span>
                <p>
                  {esRuta ? "La" : "El"}{" "}
                  <b>
                    {esRuta ? "Ruta" : "Pedido"} {enviado?.envio.numero}
                  </b>{" "}
                  del {enviado ? formatoFecha(enviado.envio.fecha) : ""} quedó <b>En Preparación</b> y ya aparece en
                  Bodega.
                </p>
                <p className="muted">
                  Programada: {enviado ? formatoFecha(enviado.fecha) : ""} · {enviado?.hora} ·{" "}
                  {esRuta ? `${enviado?.camion} · ${enviado?.piloto}` : "el cliente recoge en bodega"}
                </p>
              </div>
            </DialogDescription>
          </div>
          <div className="modal-pie">
            <Button variant="secundario" onClick={() => mostrarEnviado(null)}>
              Seguir en Facturación
            </Button>
            {puedeVerBodega && (
              <Button asChild>
                <Link href="/picking/bodega">Ver en Bodega</Link>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
