"use client";

import { Dialog, DialogContent, DialogTitle } from "@/componentes/ui/dialog";
import { Button } from "@/componentes/ui/button";
import { formatoFecha, formatoHora } from "@/lib/fechas";
import { fmt } from "@/modulos/conversion/servicio";
import { Unidades } from "./Unidades";

export interface DetalleEnvioData {
  id: number;
  tipo: string;
  numero: number;
  etiqueta: string;
  fechaEnvio: Date | string;
  programadoPara: Date | string;
  sede: { id: number; nombre: string };
  camion: { id: number; identificacion: string } | null;
  piloto: { id: string; name: string } | null;
  totalKg: number;
  pedidosFacturados: Array<{
    id: number;
    numeroOdoo: string;
    referencia: string;
    cliente: string;
    sector: string;
    posicion: number;
    totalKg: number;
    lineas: Array<{
      id: number;
      producto: string;
      lote: string;
      pesoConversionKg: string;
      cantidadKg: string;
      orden: number;
    }>;
  }>;
}

interface ModalDetalleProps {
  abierto: boolean;
  alCerrar: () => void;
  datos: DetalleEnvioData | null;
}

export function ModalDetalle({ abierto, alCerrar, datos }: ModalDetalleProps) {
  if (!datos) return null;

  const esRuta = datos.tipo === "ruta" || datos.tipo === "camion";

  return (
    <Dialog open={abierto} onOpenChange={(v) => !v && alCerrar()}>
      <DialogContent grande className="p-0">
        <div className="modal-cab">
          <DialogTitle>Detalle de {datos.etiqueta}</DialogTitle>
        </div>

        <div className="modal-cuerpo" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="det-env">
            <div>
              <small>Fecha</small>
              <b>
                {formatoFecha(
                  typeof datos.fechaEnvio === "string" ? datos.fechaEnvio : datos.fechaEnvio.toISOString().slice(0, 10),
                )}
              </b>
            </div>
            <div>
              <small>Programada</small>
              <b>
                {formatoFecha(datos.programadoPara)} · {formatoHora(datos.programadoPara)}
              </b>
            </div>
            {esRuta ? (
              <>
                <div>
                  <small>Camión</small>
                  <b>{datos.camion?.identificacion ?? "—"}</b>
                </div>
                <div>
                  <small>Piloto</small>
                  <b>{datos.piloto?.name ?? "—"}</b>
                </div>
              </>
            ) : (
              <div>
                <small>Tipo</small>
                <b>Cliente recoge en bodega</b>
              </div>
            )}
            <div>
              <small>Total</small>
              <b>{fmt(datos.totalKg)} kg</b>
            </div>
          </div>

          <p className="muted" style={{ fontSize: "13.5px", margin: "4px 0" }}>
            {datos.pedidosFacturados.length} pedido(s) facturado(s), en el orden en que los dejó el facturador. Datos
            tal como vinieron en el archivo de Odoo.
          </p>

          {/* Se desplaza la ventana, no esta zona (specs/07, 15/10; auditoría H-21). Las tablas sí pueden desplazarse
              a lo ancho en el teléfono y por eso siguen pudiendo enfocarse con el teclado (RNF-08). */}
          <div className="det-grupos">
            {datos.pedidosFacturados.map((g, i) => (
              <section key={g.id} className="det-g">
                <div className="det-g-cab">
                  <span className="parada-n">{i + 1}</span>
                  <div>
                    <b className="mono">{g.numeroOdoo}</b> · <b>{g.cliente}</b>
                    <div className="muted" style={{ fontSize: "13px" }}>
                      {g.sector}
                    </div>
                  </div>
                  <span className="mono kg">{fmt(g.totalKg)} kg</span>
                </div>
                <div
                  className="tabla-caja"
                  tabIndex={0}
                  role="region"
                  aria-label={`Productos del pedido ${g.numeroOdoo}`}
                >
                  <table className="tabla">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Lote</th>
                        <th className="der">Peso de Conversión (kg)</th>
                        <th className="der">Cantidad (kg)</th>
                        <th>Unidades</th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.lineas.map((l) => (
                        <tr key={l.id}>
                          <td className="cod">{l.producto}</td>
                          <td>
                            <span className={`lote ${l.lote ? "" : "sin"}`}>
                              {l.lote ? `Lote ${l.lote}` : "Sin lote"}
                            </span>
                          </td>
                          <td className="der mono">{fmt(l.pesoConversionKg)}</td>
                          <td className="der kg">{fmt(l.cantidadKg)}</td>
                          <td>
                            <Unidades cantidadKg={l.cantidadKg} pesoConversionKg={l.pesoConversionKg} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="modal-pie">
          <Button variant="primario" onClick={alCerrar}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
