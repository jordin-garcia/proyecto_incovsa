"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icono } from "@/componentes/comunes/iconos";
import { useMensajes } from "@/componentes/comunes/Mensajes";
import { useCambiosDeSede } from "@/modulos/tiempo-real/cliente";
import { TarjetaEnvio, type EnvioBodegaItem } from "./TarjetaEnvio";
import { ModalDetalle, type DetalleEnvioData } from "./ModalDetalle";
import { obtenerDetalleEnvioAccion } from "@/modulos/bodega/acciones";

interface BodegaClienteProps {
  sede: { id: number; nombre: string; prefijoOdoo: string };
  enviosIniciales: EnvioBodegaItem[];
}

export function BodegaCliente({ sede, enviosIniciales }: BodegaClienteProps) {
  const router = useRouter();
  const mostrarMensaje = useMensajes();
  const [detalleEnvio, setDetalleEnvio] = useState<DetalleEnvioData | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  // Mantiene la vista sincronizada con los cambios de la sede
  useCambiosDeSede(sede.id);

  const alVerDetalle = async (envioId: number) => {
    const res = await obtenerDetalleEnvioAccion(envioId);
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
        <span className="chip chip-o">{enviosIniciales.length} en cola</span>
        <span className="muted" style={{ fontSize: "14px" }}>
          {sede.nombre} · la prioridad y las marcas no quedan en el historial
        </span>
      </div>

      {enviosIniciales.length > 0 ? (
        <div className="ped-lista" data-pedidos>
          {enviosIniciales.map((envio, i) => (
            <TarjetaEnvio
              key={envio.id}
              envio={envio}
              prioridad={i + 1}
              alVerDetalle={alVerDetalle}
              alActualizar={alActualizar}
            />
          ))}
        </div>
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
