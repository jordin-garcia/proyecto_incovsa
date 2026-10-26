"use client";

import { useState, useTransition, useOptimistic } from "react";
import { useRouter } from "next/navigation";
import { EncabezadoModulo } from "@/componentes/comunes/EncabezadoModulo";
import { ChipEstado } from "@/componentes/comunes/ChipEstado";
import { Icono } from "@/componentes/comunes/iconos";
import { useMensajes } from "@/componentes/comunes/Mensajes";
import { formatoFecha, formatoHora } from "@/lib/fechas";
import { fmt } from "@/modulos/conversion/servicio";
import { MENSAJE_ERROR_GENERAL } from "@/lib/errores";
import type { RutaEnCursoItem, EntregaRutaItem } from "@/modulos/ruta/servicio";
import { reordenarRecorridoRutaAccion, entregarRutaAccion } from "@/modulos/ruta/acciones";
import { DetalleRuta } from "./DetalleRuta";

type AccionOptimistaRuta = {
  tipo: "reordenar";
  envioId: number;
  nuevosIds: number[];
};

function reducirRutasOptimistas(rutas: RutaEnCursoItem[], accion: AccionOptimistaRuta): RutaEnCursoItem[] {
  if (accion.tipo === "reordenar") {
    return rutas.map((r) => {
      if (r.id !== accion.envioId) return r;
      const mapa = new Map(r.entregas.map((e) => [e.id, e]));
      const reordenadas = accion.nuevosIds
        .map((id, i) => {
          const item = mapa.get(id);
          return item ? { ...item, orden: i + 1 } : null;
        })
        .filter(Boolean) as EntregaRutaItem[];
      return { ...r, entregas: reordenadas };
    });
  }
  return rutas;
}

export function RutaCliente({ rutasIniciales, propias }: { rutasIniciales: RutaEnCursoItem[]; propias: boolean }) {
  const router = useRouter();
  const mostrarMensaje = useMensajes();
  const [pendiente, startTransition] = useTransition();

  const [prevRutasIniciales, setPrevRutasIniciales] = useState(rutasIniciales);
  const [rutas, setRutas] = useState(rutasIniciales);

  if (rutasIniciales !== prevRutasIniciales) {
    setPrevRutasIniciales(rutasIniciales);
    setRutas(rutasIniciales);
  }

  const [rutasOptimistas, aplicarOptimista] = useOptimistic(rutas, reducirRutasOptimistas);

  const [rutaSelId, setRutaSelId] = useState<number | null>(rutasIniciales[0]?.id ?? null);

  const rutaExiste = rutasOptimistas.some((r) => r.id === rutaSelId);
  const idSeleccionada = rutaExiste ? rutaSelId : (rutasOptimistas[0]?.id ?? null);
  const rutaActiva = rutasOptimistas.find((r) => r.id === idSeleccionada) ?? null;

  const alReordenar = (nuevosIds: number[]) => {
    if (!rutaActiva) return;
    startTransition(async () => {
      aplicarOptimista({
        tipo: "reordenar",
        envioId: rutaActiva.id,
        nuevosIds,
      });

      // Si el servidor rechaza la acción o falla la red, el cambio optimista vuelve atrás con un mensaje (H-24).
      try {
        const res = await reordenarRecorridoRutaAccion({
          envioId: rutaActiva.id,
          entregaIds: nuevosIds,
        });
        if (!res.ok) {
          mostrarMensaje(res.error ?? MENSAJE_ERROR_GENERAL, "error");
        } else {
          setRutas((prev) =>
            prev.map((r) => {
              if (r.id !== rutaActiva.id) return r;
              const mapa = new Map(r.entregas.map((e) => [e.id, e]));
              const reordenadas = nuevosIds
                .map((id, i) => {
                  const item = mapa.get(id);
                  return item ? { ...item, orden: i + 1 } : null;
                })
                .filter(Boolean) as EntregaRutaItem[];
              return { ...r, entregas: reordenadas };
            }),
          );
        }
      } catch {
        mostrarMensaje(MENSAJE_ERROR_GENERAL, "error");
      }
      router.refresh();
    });
  };

  const alEntregar = async () => {
    if (!rutaActiva) return;
    try {
      const res = await entregarRutaAccion({ envioId: rutaActiva.id });
      if (!res.ok) {
        mostrarMensaje(res.error ?? MENSAJE_ERROR_GENERAL, "error");
        return;
      }
      mostrarMensaje(`Ruta ${rutaActiva.numero} entregada. Quedó en el registro histórico de Reportes.`, "exito");
      setRutas((prev) => prev.filter((r) => r.id !== rutaActiva.id));
      setRutaSelId(null);
      router.refresh();
    } catch {
      mostrarMensaje(MENSAJE_ERROR_GENERAL, "error");
    }
  };

  return (
    <>
      <EncabezadoModulo
        eyebrow="Módulo de ruta"
        titulo={propias ? "Mis rutas" : "Rutas en curso"}
        instruccion={`${propias ? "Sus rutas asignadas." : "Rutas en curso de la sede."} Arrastre los clientes para acomodar el recorrido y pulse «Ruta Entregada» al terminar.`}
      />

      {rutasOptimistas.length > 0 ? (
        <div className="ruta-lay">
          <div>
            {rutasOptimistas.map((r) => {
              const fechaDia =
                r.fechaEnvio instanceof Date
                  ? r.fechaEnvio.toISOString().slice(0, 10)
                  : String(r.fechaEnvio).slice(0, 10);
              const horaProg = r.programadoPara ? formatoHora(r.programadoPara) : "—";

              return (
                <button
                  key={r.id}
                  type="button"
                  className={`ruta-op ${r.id === idSeleccionada ? "on" : ""}`}
                  data-r={r.id}
                  onClick={() => setRutaSelId(r.id)}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <b>Ruta {r.numero}</b>
                    <ChipEstado estado="RUTA" />
                  </div>
                  <div className="muted" style={{ fontSize: "13.5px", marginTop: "8px" }}>
                    {formatoFecha(fechaDia)} · programada {horaProg} · {r.camion?.identificacion || "—"}
                  </div>
                  <div className="muted" style={{ fontSize: "13.5px" }}>
                    {r.piloto?.name || "—"} · {r.clientesContador} cliente(s) · {fmt(r.totalKg)} kg
                  </div>
                </button>
              );
            })}
          </div>

          <div>
            {rutaActiva && (
              <DetalleRuta
                ruta={rutaActiva}
                entregas={rutaActiva.entregas}
                pendiente={pendiente}
                alReordenar={alReordenar}
                alEntregar={alEntregar}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="tarjeta vacio" style={{ padding: "60px" }}>
          <Icono nombre="ruta" />
          <h4>No hay rutas en curso</h4>
          <p>Una ruta aparece aquí cuando Bodega pulsa «Ruta Despachada».</p>
        </div>
      )}
    </>
  );
}
