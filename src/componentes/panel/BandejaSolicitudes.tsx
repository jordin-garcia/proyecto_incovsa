"use client";
import { useEffect, useState, useTransition } from "react";
import { EncabezadoModulo } from "@/componentes/comunes/EncabezadoModulo";
import { Pestanas } from "@/componentes/comunes/Pestanas";
import { Vacio } from "@/componentes/comunes/Vacio";
import { Icono } from "@/componentes/comunes/iconos";
import { useMensajes } from "@/componentes/comunes/Mensajes";
import { Button } from "@/componentes/ui/button";
import { Textarea } from "@/componentes/ui/textarea";
import { SelectNativo } from "@/componentes/ui/select-nativo";
import { formatoFecha, formatoHora } from "@/lib/fechas";
import type { leerBandeja } from "@/modulos/solicitudes/bandeja";
import type { GestionSolicitud } from "@/modulos/solicitudes/esquemas-bandeja";
import { abrir, gestionar } from "@/modulos/solicitudes/acciones";
import estilos from "./solicitudes.module.css";
type Datos = Awaited<ReturnType<typeof leerBandeja>>;
type Solicitud = Datos["solicitudes"][number];
const motivos = [
  ["todas", "Todas"],
  ["solicitud", "Solicitudes"],
  ["queja", "Quejas"],
  ["reclamo", "Reclamos"],
] as const;
const tipos: Record<string, string> = { solicitud: "Solicitud", queja: "Queja", reclamo: "Reclamo" };
const estados = [
  ["asignado", "Asignado"],
  ["en_proceso", "En proceso"],
  ["solucionado", "Solucionado"],
] as const;
function fecha(s: Solicitud) {
  return `${formatoFecha(s.creadoEn)} · ${formatoHora(s.creadoEn)}`;
}
function Detalle({
  s,
  responsables,
  gestiona,
}: {
  s: Solicitud;
  responsables: Datos["responsables"];
  gestiona: boolean;
}) {
  const [comentario, escribir] = useState(s.comentario ?? "");
  const [editando, editar] = useState(!s.comentario);
  const [pendiente, iniciar] = useTransition();
  const mensaje = useMensajes();
  function guardar(datos: GestionSolicitud) {
    if (datos.tipo === "estado" && datos.estado === s.estado) return;
    iniciar(async () => {
      const r = await gestionar(datos);
      if (!r.ok) {
        mensaje(r.error, "error");
        return;
      }
      if (datos.tipo === "comentario") {
        editar(!datos.comentario.trim());
        mensaje("Comentario guardado.");
      }
      if (datos.tipo === "responsable") mensaje("Responsable asignado.");
    });
  }
  const lugar = [s.municipio?.nombre, s.departamento?.nombre, s.pais.nombre].filter(Boolean).join(", ");
  return (
    <div className="bloque-cuerpo">
      <div className={estilos.cabecera}>
        <div className={estilos.contacto}>
          <span className={`chip ${s.motivo === "solicitud" ? "chip-v" : s.motivo === "queja" ? "chip-a" : "chip-r"}`}>
            {tipos[s.motivo]}
          </span>
          <h2>{s.nombre}</h2>
          <p className="muted">
            {s.empresa || "Sin empresa"} · <span className="mono">{s.correo}</span>
            {s.telefono && (
              <>
                {" "}
                ·{" "}
                <span className="mono">
                  {s.telefonoCodigo} {s.telefono}
                </span>
              </>
            )}
          </p>
          <p className={`muted ${estilos.lugar}`}>
            <Icono nombre="pin" className="ico-s" /> {lugar}
          </p>
        </div>
        <div className={estilos.folio}>
          <b className="mono">{s.folio}</b>
          <p className="muted">
            {fecha(s)} · {s.sede.nombre}
          </p>
        </div>
      </div>
      <div className={estilos.mensaje}>{s.mensaje}</div>
      <div className={estilos.gestion} aria-busy={pendiente}>
        <div className="campo">
          <span>Estado</span>
          <div className={estilos.estados}>
            {estados.map(([valor, texto]) => (
              <button
                key={valor}
                type="button"
                aria-pressed={s.estado === valor}
                disabled={!gestiona || pendiente}
                onClick={() => guardar({ id: s.id, tipo: "estado", estado: valor })}
              >
                {texto}
              </button>
            ))}
          </div>
          {!s.estado && <small>Sin estado: la solicitud acaba de llegar.</small>}
        </div>
        <div className="campo">
          <label className="etq" htmlFor="responsable-solicitud">
            Responsable
          </label>
          <SelectNativo
            id="responsable-solicitud"
            disabled={!gestiona || pendiente}
            value={s.responsableId ?? ""}
            onChange={(e) => guardar({ id: s.id, tipo: "responsable", responsableId: e.target.value || null })}
          >
            <option value="">Sin responsable</option>
            {responsables.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} · {u.rol}
              </option>
            ))}
            {s.responsable && !responsables.some((u) => u.id === s.responsableId) && (
              <option value={s.responsable.id}>
                {s.responsable.name} · {s.responsable.rol}
              </option>
            )}
          </SelectNativo>
        </div>
        <div className={`campo ${estilos.comentario}`}>
          <label className="etq" htmlFor="comentario-solicitud">
            Comentario del responsable
          </label>
          <Textarea
            id="comentario-solicitud"
            rows={3}
            readOnly={!gestiona || !editando}
            disabled={pendiente}
            value={comentario}
            onChange={(e) => escribir(e.target.value)}
            placeholder={gestiona ? "Un solo comentario sobre la atención de la solicitud" : "Sin comentario"}
          />
          {gestiona && (
            <Button
              size="pequeno"
              variant="secundario"
              disabled={pendiente}
              onClick={() => {
                if (!editando) {
                  editar(true);
                  document.getElementById("comentario-solicitud")?.focus();
                } else guardar({ id: s.id, tipo: "comentario", comentario });
              }}
            >
              {editando ? "Guardar comentario" : "Editar comentario"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
export function BandejaSolicitudes({ solicitudes, responsables, gestiona }: Datos & { gestiona: boolean }) {
  const [motivo, cambiarMotivo] = useState("todas");
  const [seleccion, seleccionar] = useState<number | null>(null);
  const lista = solicitudes.filter((s) => motivo === "todas" || s.motivo === motivo);
  const actual = lista.find((s) => s.id === seleccion) ?? lista[0];
  const id = actual?.id;
  const mensaje = useMensajes();
  useEffect(() => {
    if (id !== undefined)
      void abrir({ id }).then((r) => {
        if (!r.ok) mensaje(r.error, "error");
      });
  }, [id, mensaje]);
  const bandeja = (
    <div className={`tarjeta ${estilos.bandeja}`}>
      <div className={estilos.lista}>
        {lista.length ? (
          lista.map((s) => (
            <button key={s.id} type="button" aria-pressed={s.id === id} onClick={() => seleccionar(s.id)}>
              <div className={estilos.nombre}>
                <b>{s.nombre}</b>
                {!s.leida && <span className={`punto ${estilos.nueva}`} aria-label="Sin leer" />}
              </div>
              <div className={`muted ${estilos.resumen}`}>
                {tipos[s.motivo]} · {s.sede.nombre} · {fecha(s)}
                {s.estado && ` · ${estados.find((e) => e[0] === s.estado)?.[1]}`}
              </div>
              <div className={estilos.extracto}>{s.mensaje}</div>
            </button>
          ))
        ) : (
          <div className={estilos.vacia}>Sin solicitudes de este motivo.</div>
        )}
      </div>
      <div>
        {actual ? (
          <Detalle key={actual.id} s={actual} responsables={responsables} gestiona={gestiona} />
        ) : (
          <Vacio icono="bandeja" titulo="Sin solicitudes">
            Envíe un mensaje desde la página de Contacto del sitio y aparecerá aquí.
          </Vacio>
        )}
      </div>
    </div>
  );
  return (
    <div className={estilos.contenedor}>
      <EncabezadoModulo
        eyebrow="Formulario de contacto"
        titulo="Solicitudes recibidas"
        instruccion={`Mensajes del formulario de contacto. No se envían a ningún correo.${gestiona ? "" : " Usted solo puede verlos."}`}
      />
      <Pestanas
        etiqueta="Motivo de las solicitudes"
        valor={motivo}
        alCambiar={(valor) => {
          cambiarMotivo(valor);
          seleccionar(null);
        }}
        opciones={motivos.map(([valor, texto]) => ({
          valor,
          texto,
          contador: solicitudes.filter((s) => valor === "todas" || s.motivo === valor).length,
          contenido: valor === motivo ? bandeja : null,
        }))}
      />
    </div>
  );
}
