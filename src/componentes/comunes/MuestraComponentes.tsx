"use client";

import { useState } from "react";
import { Button } from "@/componentes/ui/button";
import { Checkbox } from "@/componentes/ui/checkbox";
import { Input } from "@/componentes/ui/input";
import { Textarea } from "@/componentes/ui/textarea";
import { SelectNativo } from "@/componentes/ui/select-nativo";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/componentes/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/componentes/ui/tooltip";
import { MODULOS_PICKING, SEDES_EJEMPLO, useArmazonEjemplo } from "./armazon/ArmazonEjemplo";
import { EncabezadoModulo } from "./EncabezadoModulo";
import { Aviso } from "./Aviso";
import { ChipEstado } from "./ChipEstado";
import { CampoFecha } from "./CampoFecha";
import { CampoHora } from "./CampoHora";
import { VentanaConfirmacion } from "./VentanaConfirmacion";
import { Medidor } from "./Medidor";
import { Tabla } from "./Tabla";
import { Pestanas } from "./Pestanas";
import { BotonesSegmentados } from "./BotonesSegmentados";
import { Vacio } from "./Vacio";
import { formatoKg } from "./formato";
import { Icono } from "./iconos";
import { useMensajes } from "./Mensajes";

// Muestra temporal de las piezas compartidas; no implementa operaciones de negocio.
// Textos y datos de ejemplo tomados del prototipo, como pide JG-05.
export function MuestraComponentes({ sistema }: { sistema: "sitio" | "picking" }) {
  const [fecha, cambiarFecha] = useState("");
  const [hora, cambiarHora] = useState("");
  const [pestana, cambiarPestana] = useState("despacho");
  const [periodo, cambiarPeriodo] = useState("dia");
  const [opcion, cambiarOpcion] = useState("camion");
  const mensaje = useMensajes();
  const ejemplo = useArmazonEjemplo();
  return (
    <>
      <EncabezadoModulo
        eyebrow={sistema === "sitio" ? "Panel del sitio" : "Módulo de facturación"}
        titulo={sistema === "sitio" ? "Hola, Usuario de ejemplo 01" : "Pedidos facturados"}
        instruccion={
          sistema === "sitio"
            ? "Edite lo que se publica en el sitio; los cambios se ven de inmediato."
            : "Cargue el .xlsx de Odoo, seleccione los pedidos facturados, arrástrelos a una opción de envío y envíela a Bodega."
        }
      />
      <div className="muestra">
        {sistema === "picking" && (
          <section className="tarjeta tarjeta-p rejilla">
            <label className="campo">
              <span>Módulo</span>
              <SelectNativo value={ejemplo.modulo} onChange={(e) => ejemplo.cambiarModulo(e.target.value)}>
                {MODULOS_PICKING.map((m) => (
                  <option key={m.href} value={m.href.split("/").at(-1)}>
                    {m.texto}
                  </option>
                ))}
              </SelectNativo>
            </label>
            <fieldset className="muestra-sedes">
              <legend>Sedes a las que tiene acceso</legend>
              {SEDES_EJEMPLO.map((s) => (
                <label className="chk" key={s.id}>
                  <Checkbox
                    checked={ejemplo.sedes.includes(s.id)}
                    onCheckedChange={(marcada) =>
                      ejemplo.cambiarSedes(
                        marcada ? [...ejemplo.sedes, s.id] : ejemplo.sedes.filter((id) => id !== s.id),
                      )
                    }
                  />
                  {s.nombre}
                </label>
              ))}
            </fieldset>
          </section>
        )}
        <section className="tarjeta tarjeta-p rejilla">
          <h2>Opciones de envío</h2>
          <div className="rejilla r2">
            <CampoFecha etiqueta="Fecha programada" name="fechaProgramada" valor={fecha} alCambiar={cambiarFecha} />
            <CampoHora etiqueta="Hora programada" name="horaProgramada" valor={hora} alCambiar={cambiarHora} />
          </div>
          <div className="campo">
            <span id="opcion-etiqueta">Opción de envío</span>
            <Select value={opcion} onValueChange={cambiarOpcion}>
              <SelectTrigger aria-labelledby="opcion-etiqueta">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="camion">Envío por camión</SelectItem>
                <SelectItem value="recoge">Cliente recoge en bodega</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rejilla r2">
            <label className="campo">
              <span>Buscar</span>
              <Input type="search" />
            </label>
            <label className="campo">
              <span>Comentario</span>
              <Textarea />
            </label>
          </div>
        </section>
        <section className="tarjeta tarjeta-p rejilla">
          <h2>Reportes y bitácora</h2>
          <Pestanas
            etiqueta="Reportes"
            valor={pestana}
            alCambiar={cambiarPestana}
            opciones={[
              {
                valor: "despacho",
                texto: "Despacho",
                contenido: (
                  <Tabla>
                    <caption>Rutas y pedidos</caption>
                    <thead>
                      <tr>
                        <th>Estado</th>
                        <th className="der">Total kg</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(["PREP", "DESP", "RUTA", "ENTR"] as const).map((estado) => (
                        <tr key={estado}>
                          <td>
                            <ChipEstado estado={estado} />
                          </td>
                          <td className="kg der mono">{formatoKg(2500)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Tabla>
                ),
              },
              {
                valor: "rutas",
                texto: "Rutas realizadas",
                contenido: <Vacio titulo="No hay rutas en este periodo" icono="ruta" />,
              },
              { valor: "bitacora", texto: "Bitácora", contenido: <Vacio titulo="No hay registros en este periodo" /> },
            ]}
          />
          <BotonesSegmentados
            etiqueta="Periodo"
            valor={periodo}
            alCambiar={cambiarPeriodo}
            opciones={[
              { valor: "dia", texto: "Día" },
              { valor: "semana", texto: "Semana" },
              { valor: "rango", texto: "Rango" },
            ]}
          />
          <Medidor etiqueta="Peso total" valor={60} />
          <div className="muestra-fila">
            <Button onClick={() => mensaje("Usuario guardado.")}>Guardar</Button>
            <Button variant="secundario" onClick={() => mensaje("Faltan pedidos facturados, fecha u hora", "aviso")}>
              Enviar a Bodega
            </Button>
            <Button
              variant="fantasma"
              onClick={() => mensaje("No se pudo completar la operación. Inténtelo de nuevo.", "error")}
            >
              Volver
            </Button>
            <Button variant="lima" disabled>
              Ruta Despachada
            </Button>
            <VentanaConfirmacion
              titulo="Eliminar pedidos facturados"
              texto="La eliminación queda en la bitácora."
              textoConfirmar="Eliminar"
              variante="peligro"
              alConfirmar={() => mensaje("Pedidos facturados eliminados.")}
            >
              <Button variant="peligro">
                <Icono nombre="borrar" />
                Eliminar
              </Button>
            </VentanaConfirmacion>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secundario" size="icono" aria-label="Información">
                    <Icono nombre="info" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Seleccione uno o varios pedidos facturados.</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </section>
        <div className="rejilla">
          {(["verde", "ambar", "rojo", "azul"] as const).map((tipo) => (
            <Aviso key={tipo} tipo={tipo}>
              La fecha y la hora programadas son obligatorias.
            </Aviso>
          ))}
        </div>
      </div>
    </>
  );
}
