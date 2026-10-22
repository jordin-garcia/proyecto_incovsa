"use client";

import { useState, useTransition, useSyncExternalStore, type ReactNode, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { CampoFecha } from "@/componentes/comunes/CampoFecha";
import { EncabezadoModulo } from "@/componentes/comunes/EncabezadoModulo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/componentes/ui/tabs";
import { BotonesSegmentados } from "@/componentes/comunes/BotonesSegmentados";
import { Tabla } from "@/componentes/comunes/Tabla";
import { Medidor } from "@/componentes/comunes/Medidor";
import { ChipEstado } from "@/componentes/comunes/ChipEstado";
import { Icono } from "@/componentes/comunes/iconos";
import { Button } from "@/componentes/ui/button";
import { SelectNativo } from "@/componentes/ui/select-nativo";
import { Unidades } from "@/componentes/picking/bodega/Unidades";
import { fmt } from "@/modulos/conversion/servicio";
import { formatoFecha, formatoHora, leerFecha } from "@/lib/fechas";
import { MESES, type Periodo, type FiltroPeriodo } from "@/modulos/reportes/periodo";
import type { Despacho, RutaReporte, OperacionReporte } from "@/modulos/reportes/servicio";

const suscribirHidratacion = () => () => {};

function FechaPeriodo({
  valor,
  etiqueta,
  confirmar,
}: {
  valor: string;
  etiqueta: string;
  confirmar: (v: string) => void;
}) {
  const [borrador, cambiar] = useState(valor);
  const [anterior, recordar] = useState(valor);
  if (valor !== anterior) {
    recordar(valor);
    cambiar(valor);
  }
  const calendario = (e: ChangeEvent<HTMLDivElement>) => {
    const campo = e.target as HTMLInputElement;
    if (campo.type === "date" && campo.value) confirmar(campo.value);
  };
  return (
    <div onChange={calendario}>
      <CampoFecha
        etiqueta={etiqueta}
        valor={borrador}
        alCambiar={cambiar}
        onBlur={(e) => {
          const v = leerFecha(e.currentTarget.value);
          if (v) confirmar(v);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
      />
    </div>
  );
}
function Exportar({ pestana, filtro }: { pestana: "despacho" | "rutas" | "bitacora"; filtro: FiltroPeriodo }) {
  function descargar(formato: "xlsx" | "pdf") {
    const parametros = new URLSearchParams({ pestana, formato });
    for (const [nombre, valor] of Object.entries(filtro)) if (typeof valor === "string") parametros.set(nombre, valor);
    const enlace = document.createElement("a");
    enlace.href = `/api/reportes/exportar?${parametros}`;
    enlace.download = "";
    document.body.append(enlace);
    enlace.click();
    enlace.remove();
  }

  return (
    <div className="reportes-exportar">
      {(["xlsx", "pdf"] as const).map((formato) => (
        <Button key={formato} variant="secundario" size="pequeno" onClick={() => descargar(formato)}>
          <Icono nombre="descargar" className="ico-s" />
          {formato === "xlsx" ? "Excel" : "PDF"}
        </Button>
      ))}
    </div>
  );
}
function Bloque({
  titulo,
  descripcion,
  pestana,
  filtro,
  children,
}: {
  titulo: string;
  descripcion: string;
  pestana: "despacho" | "rutas" | "bitacora";
  filtro: FiltroPeriodo;
  children: ReactNode;
}) {
  return (
    <section className="tarjeta">
      <div className="bloque-cab">
        <div>
          <h3>{titulo}</h3>
          <p>{descripcion}</p>
        </div>
        <Exportar pestana={pestana} filtro={filtro} />
      </div>
      {children}
    </section>
  );
}
function Vacio({ columnas, children }: { columnas: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={columnas}>
        <div className="vacio">{children}</div>
      </td>
    </tr>
  );
}

export function Reportes({
  periodo,
  despacho,
  rutas,
  operaciones,
  anios,
  sedeNombre,
}: {
  periodo: Omit<Periodo, "desde" | "hasta">;
  despacho: Despacho;
  rutas: RutaReporte[];
  operaciones: OperacionReporte[];
  anios: string[];
  sedeNombre: string;
}) {
  const router = useRouter();
  const hidratado = useSyncExternalStore(
    suscribirHidratacion,
    () => true,
    () => false,
  );
  const [pendiente, transicion] = useTransition();
  const [pestana, elegir] = useState("despacho");
  const [f, cambiarFiltro] = useState(periodo.filtro);
  const [filtroAnterior, recordarFiltro] = useState(periodo.filtro);
  if (filtroAnterior !== periodo.filtro) {
    recordarFiltro(periodo.filtro);
    cambiarFiltro(periodo.filtro);
  }
  function filtrar(cambio: Partial<FiltroPeriodo>) {
    const nuevo = { ...f, ...cambio };
    cambiarFiltro(nuevo);
    transicion(() => router.replace(`/picking/reportes?${new URLSearchParams(nuevo)}`, { scroll: false }));
  }
  const fecha = (campo: "referencia" | "desde" | "hasta", etiqueta: string) => (
    <FechaPeriodo
      valor={f[campo]}
      etiqueta={etiqueta}
      confirmar={(v) => {
        if (v !== f[campo]) filtrar({ [campo]: v });
      }}
    />
  );
  const anosDisponibles = [...new Set([...anios, f.anio, f.mes.slice(0, 4)])].sort((a, b) => Number(b) - Number(a));
  const selectorAnio = (valor: string, cambiar: (v: string) => void) => (
    <SelectNativo aria-label="Año" value={valor} onChange={(e) => cambiar(e.target.value)}>
      {anosDisponibles.map((y) => (
        <option key={y}>{y}</option>
      ))}
    </SelectNativo>
  );
  const controles = (
    <div className="periodo" aria-busy={pendiente}>
      <BotonesSegmentados
        etiqueta="Periodo"
        valor={f.tipo}
        alCambiar={(tipo) => filtrar({ tipo: tipo as FiltroPeriodo["tipo"] })}
        opciones={[
          { valor: "dia", texto: "Diario" },
          { valor: "semana", texto: "Semanal" },
          { valor: "mes", texto: "Mensual" },
          { valor: "anio", texto: "Anual" },
          { valor: "rango", texto: "Rango" },
        ]}
      />
      <div className="periodo-ctl">
        {f.tipo === "dia" || f.tipo === "semana" ? (
          fecha("referencia", "Fecha del periodo")
        ) : f.tipo === "mes" ? (
          <>
            <SelectNativo
              aria-label="Mes"
              value={f.mes.slice(5)}
              onChange={(e) => filtrar({ mes: `${f.mes.slice(0, 4)}-${e.target.value}` })}
            >
              {MESES.map((m, i) => (
                <option key={m} value={String(i + 1).padStart(2, "0")}>
                  {m}
                </option>
              ))}
            </SelectNativo>
            {selectorAnio(f.mes.slice(0, 4), (y) => filtrar({ mes: y + f.mes.slice(4) }))}
          </>
        ) : f.tipo === "anio" ? (
          selectorAnio(f.anio, (anio) => filtrar({ anio }))
        ) : (
          <>
            <span className="muted">De</span>
            {fecha("desde", "Fecha inicial")}
            <span className="muted">a</span>
            {fecha("hasta", "Fecha final")}
          </>
        )}
      </div>
    </div>
  );
  const d = despacho;
  const maximo = Math.max(1, ...d.filas.map((l) => Number(l.cantidadKg)));
  const contenidoDespacho = (
    <>
      <div className="kpis">
        {[
          ["Kilogramos despachados", fmt(d.totalKg), "rutas y pedidos cerrados en Bodega"],
          ["Unidades completas", fmt(d.unidades), `más ${fmt(d.restoKg)} kg sueltos`],
          [
            "Rutas y pedidos cerrados",
            fmt(d.rutasCerradas + d.pedidosCerrados),
            `${d.rutasCerradas} rutas · ${d.pedidosCerrados} pedidos`,
          ],
          ["Rutas entregadas", fmt(d.rutasEntregadas), "en el periodo"],
        ].map(([etiqueta, valor, detalle]) => (
          <div key={etiqueta} className="tarjeta kpi">
            <span className="etq">{etiqueta}</span>
            <b>{valor}</b>
            <small>{detalle}</small>
          </div>
        ))}
      </div>
      <Bloque
        titulo={`${periodo.nombre} por producto`}
        descripcion={`${sedeNombre} · ${periodo.texto}`}
        pestana="despacho"
        filtro={f}
      >
        <Tabla tabIndex={0}>
          <thead>
            <tr>
              <th>Producto</th>
              <th className="der">Cantidad (kg)</th>
              <th aria-label="Barra proporcional" className="reportes-barra" />
              <th>Unidades</th>
            </tr>
          </thead>
          <tbody>
            {d.filas.map((l) => (
              <tr key={JSON.stringify([l.producto, l.pesoConversionKg])}>
                <td className="cod">{l.producto}</td>
                <td className="der kg">{fmt(l.cantidadKg)}</td>
                <td>
                  <Medidor
                    etiqueta={`${l.producto}, Peso de Conversión ${fmt(l.pesoConversionKg)}`}
                    valor={Number(l.cantidadKg)}
                    maximo={maximo}
                  />
                </td>
                <td>
                  <Unidades cantidadKg={l.cantidadKg} pesoConversionKg={l.pesoConversionKg} />{" "}
                  <span className="muted mono reportes-peso">÷ {fmt(l.pesoConversionKg)}</span>
                </td>
              </tr>
            ))}
            {!d.filas.length && <Vacio columnas={4}>Sin despachos en el periodo.</Vacio>}
          </tbody>
          {!!d.filas.length && (
            <tfoot>
              <tr>
                <td>Total del periodo</td>
                <td className="der kg">{fmt(d.totalKg)}</td>
                <td />
                <td className="mono">
                  {fmt(d.unidades)} unidades + {fmt(d.restoKg)} kg
                </td>
              </tr>
            </tfoot>
          )}
        </Tabla>
      </Bloque>
    </>
  );
  const contenidoRutas = (
    <Bloque
      titulo="Registro histórico de rutas"
      descripcion={`${sedeNombre} · ${periodo.texto} · desde el envío a bodega hasta el cierre de la entrega.`}
      pestana="rutas"
      filtro={f}
    >
      <Tabla tabIndex={0}>
        <thead>
          <tr>
            {["Ruta", "Fecha", "Programada", "Camión", "Piloto", "Total (kg)", "Estado", "Recorrido"].map((t) => (
              <th key={t} className={t === "Total (kg)" ? "der" : undefined}>
                {t}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rutas.map((r) => (
            <tr key={r.id}>
              <td>
                <b>{r.numero}</b>
              </td>
              <td className="mono">{formatoFecha(r.fecha)}</td>
              <td className="mono">
                {formatoFecha(r.programada)} · {formatoHora(r.programada)}
              </td>
              <td>{r.camion}</td>
              <td>{r.piloto}</td>
              <td className="der kg">{fmt(r.totalKg)}</td>
              <td>
                <ChipEstado estado={r.estado === "Entregado" ? "ENTR" : "RUTA"} />
              </td>
              <td className="reportes-recorrido">
                {r.recorrido ? (
                  r.recorrido.map((c, i) => `${i + 1}. ${c}`).join(" → ")
                ) : (
                  <span className="muted">Se guarda al entregar</span>
                )}
              </td>
            </tr>
          ))}
          {!rutas.length && <Vacio columnas={8}>Sin rutas en el periodo.</Vacio>}
        </tbody>
      </Tabla>
    </Bloque>
  );
  const contenidoBitacora = (
    <Bloque
      titulo="Bitácora de operaciones"
      descripcion={`${periodo.texto} · Acciones de los dos sistemas, incluidos los inicios de sesión y los intentos fallidos. No se registran el marcado ni la prioridad de Bodega, ni el orden de Ruta antes de la entrega.`}
      pestana="bitacora"
      filtro={f}
    >
      <div className="reportes-bitacora">
        <Tabla tabIndex={0}>
          <thead>
            <tr>
              {["Fecha", "Usuario", "Operación", "Detalle"].map((t) => (
                <th key={t}>{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {operaciones.map((o) => (
              <tr key={o.id}>
                <td className="mono reportes-fecha">
                  {formatoFecha(o.fecha)} · {formatoHora(o.fecha)}
                </td>
                <td>{o.usuario}</td>
                <td>
                  <b>{o.operacion}</b>
                </td>
                <td className="reportes-detalle">{o.detalle}</td>
              </tr>
            ))}
            {!operaciones.length && <Vacio columnas={4}>Sin operaciones en el periodo.</Vacio>}
          </tbody>
        </Tabla>
      </div>
    </Bloque>
  );
  return (
    <div className="reportes" data-hidratado={hidratado}>
      <EncabezadoModulo
        eyebrow="Módulo de reportes"
        titulo="Reportes y bitácora"
        instruccion="Despacho, rutas realizadas y bitácora de los dos sistemas, por periodo."
      />
      <Tabs value={pestana} onValueChange={elegir}>
        <TabsList aria-label="Reportes">
          <TabsTrigger value="despacho">
            <Icono nombre="grafica" className="ico-s" /> {periodo.nombre}
          </TabsTrigger>
          <TabsTrigger value="rutas">
            <Icono nombre="ruta" className="ico-s" /> Rutas realizadas
          </TabsTrigger>
          <TabsTrigger value="bitacora">
            <Icono nombre="lista" className="ico-s" /> Bitácora
          </TabsTrigger>
        </TabsList>
        <TabsContent value="despacho">
          {controles}
          {contenidoDespacho}
        </TabsContent>
        <TabsContent value="rutas">
          {controles}
          {contenidoRutas}
        </TabsContent>
        <TabsContent value="bitacora">
          {controles}
          {contenidoBitacora}
        </TabsContent>
      </Tabs>
    </div>
  );
}
