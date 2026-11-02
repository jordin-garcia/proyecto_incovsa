"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { esquemaContacto } from "@/modulos/contenido/esquemas-contacto";
import type { leerContactoPanel } from "@/modulos/contenido/contacto";
import { publicarContacto } from "@/modulos/contenido/acciones-contacto";
import { EncabezadoModulo } from "@/componentes/comunes/EncabezadoModulo";
import { useMensajes } from "@/componentes/comunes/Mensajes";
import estilos from "./contacto.module.css";
type Fila = Awaited<ReturnType<typeof leerContactoPanel>>[number];
const mensajesValidacionContacto = new Set([
  "Elija la sede.",
  "La dirección admite hasta 250 caracteres.",
  "El teléfono admite hasta 60 caracteres.",
  "El correo admite hasta 120 caracteres.",
  "WhatsApp admite hasta 30 caracteres.",
  "El horario admite hasta 120 caracteres.",
  "Indique un correo válido.",
  "El mapa debe ser la dirección del mapa insertado de Google Maps (https://www.google.com/maps/embed?…).",
]);
function mensajeContacto(mensaje: string | undefined) {
  return mensaje && mensajesValidacionContacto.has(mensaje) ? mensaje : "Revise los datos del formulario.";
}
function FormularioSede({ sede }: { sede: Fila }) {
  const { nombre, ...datos } = sede;
  const [publicado, publicar] = useState(datos);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(esquemaContacto), defaultValues: datos, mode: "onBlur" });
  const mensaje = useMensajes();
  const router = useRouter();
  const campos = [
    ["direccion", "Dirección"],
    ["telefono", "Teléfono"],
    ["correo", "Correo"],
    ["whatsapp", "WhatsApp"],
    ["horario", "Horario"],
    ["mapaUrl", "Mapa (dirección del mapa insertado de Google Maps)"],
  ] as const;
  const maximos: Partial<Record<(typeof campos)[number][0], number>> = {
    direccion: 250,
    telefono: 60,
    correo: 120,
    whatsapp: 30,
    horario: 120,
  };
  return (
    <section className="tarjeta" aria-label={nombre}>
      <div className="bloque-cab">
        <h3>{nombre}</h3>
        <span className={`chip ${publicado.direccion ? "chip-v" : "chip-a"}`}>
          {publicado.direccion ? "Publicado" : "Faltan datos"}
        </span>
      </div>
      <form
        className="bloque-cuerpo rejilla"
        noValidate
        onSubmit={handleSubmit(
          async (entrada) => {
            try {
              const r = await publicarContacto(entrada);
              if (!r.ok) {
                mensaje(r.error, "error");
                return;
              }
              publicar(entrada);
              mensaje(`Datos de ${r.datos.nombre} publicados.`);
              router.refresh();
            } catch {
              mensaje("No se pudo completar la operación. Inténtelo de nuevo.", "error");
            }
          },
          (errores) => {
            if (typeof errores.mapaUrl?.message === "string") mensaje(errores.mapaUrl.message, "error");
          },
        )}
      >
        {campos.map(([campo, texto]) => (
          <label className="campo" key={campo}>
            <span>{texto}</span>
            <input
              {...register(campo)}
              aria-label={texto}
              className={`inp${campo === "mapaUrl" ? ` mono ${estilos.mapaDireccion}` : ""}${errors[campo] ? " error" : ""}`}
              placeholder={campo === "mapaUrl" ? "https://www.google.com/maps/embed?pb=…" : undefined}
              maxLength={maximos[campo]}
              aria-invalid={!!errors[campo]}
              aria-describedby={errors[campo] && campo !== "mapaUrl" ? `error-${datos.sedeId}-${campo}` : undefined}
            />
            {errors[campo] && campo !== "mapaUrl" && (
              <small className="msg-error" id={`error-${datos.sedeId}-${campo}`}>
                {mensajeContacto(errors[campo].message)}
              </small>
            )}
          </label>
        ))}
        {publicado.mapaUrl && (
          <iframe
            className={estilos.mapa}
            src={publicado.mapaUrl}
            title={`Mapa de ${nombre}`}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        )}
        <button className={`btn btn-p btn-sm ${estilos.guardar}`} disabled={isSubmitting} type="submit">
          Guardar
        </button>
      </form>
    </section>
  );
}
export function EditorContacto({ sedes }: { sedes: Fila[] }) {
  return (
    <>
      <EncabezadoModulo
        eyebrow="Contenido"
        titulo="Información de contacto"
        instruccion="Datos de Quetzaltenango y Guatemala que se muestran en el sitio."
      />
      <div className="rejilla r2">
        {sedes.map((s) => (
          <FormularioSede sede={s} key={s.sedeId} />
        ))}
      </div>
    </>
  );
}
