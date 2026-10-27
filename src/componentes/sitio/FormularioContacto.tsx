"use client";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getCountryCallingCode, type CountryCode } from "libphonenumber-js";
import { esquemaSolicitud, type Solicitud } from "@/modulos/solicitudes/esquemas";
import type { leerOpcionesContacto } from "@/modulos/solicitudes/servicio";
import { enviarSolicitud } from "@/modulos/solicitudes/recepcion-publica";
import { Icono } from "@/componentes/comunes/iconos";
import { SelectNativo } from "@/componentes/ui/select-nativo";
import { MENSAJE_ERROR_GENERAL } from "@/lib/errores";

export function FormularioContacto({ opciones }: { opciones: Awaited<ReturnType<typeof leerOpcionesContacto>> }) {
  const [recibida, recibir] = useState<{ folio: string; nombre: string; motivo: string; sede: string } | null>(null);
  const [error, cambiarError] = useState("");
  const caja = useRef<HTMLDivElement>(null);
  const bloqueo = useRef(false);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    trigger,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<Solicitud>({
    resolver: zodResolver(esquemaSolicitud),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      motivo: "solicitud",
      nombre: "",
      empresa: "",
      correo: "",
      telefonoPais: "GT",
      telefono: "",
      pais: "",
      departamentoId: "",
      municipioId: "",
      sedeId: "",
      mensaje: "",
    },
  });
  const [pais, departamento, motivo, telefonoPais, municipio, sede] = useWatch({
    control,
    name: ["pais", "departamentoId", "motivo", "telefonoPais", "municipioId", "sedeId"],
  });
  useEffect(() => {
    if (!recibida || !caja.current) return;
    const alto = document.querySelector(".sh")?.getBoundingClientRect().height ?? 0;
    window.scrollTo({ top: caja.current.getBoundingClientRect().top + window.scrollY - alto - 24, behavior: "smooth" });
    caja.current.focus({ preventScroll: true });
  }, [recibida]);
  const campo = (
    nombre: keyof Solicitud,
    etiqueta: string,
    placeholder: string,
    tipo = "text",
    opciones?: { maxLength?: number; alSalir?: boolean },
  ) => (
    <label className="campo">
      <span>{etiqueta}</span>
      <input
        className={`inp${errors[nombre] ? " error" : ""}`}
        type={tipo}
        aria-label={etiqueta}
        placeholder={placeholder}
        maxLength={opciones?.maxLength}
        {...register(nombre, opciones?.alSalir ? { onBlur: () => void trigger(nombre) } : undefined)}
        aria-invalid={!!errors[nombre]}
        aria-describedby={errors[nombre] ? `error-${nombre}` : undefined}
      />
      {nombre === "correo" && errors[nombre] && (
        <small className="msg-error" id={`error-${nombre}`}>
          {errors[nombre].message}
        </small>
      )}
    </label>
  );
  const seleccion = (
    nombre: "pais" | "departamentoId" | "municipioId" | "sedeId",
    etiqueta: string,
    primera: string,
    lista: { valor: string; texto: string }[],
  ) => (
    <label className="campo">
      <span>{etiqueta}</span>
      <span className="contacto-seleccion">
        <SelectNativo
          className={`sel${errors[nombre] ? " error" : ""}`}
          aria-label={etiqueta}
          {...register(nombre, {
            onChange: () => {
              if (nombre === "pais") {
                setValue("departamentoId", "");
                setValue("municipioId", "");
              }
              if (nombre === "departamentoId") setValue("municipioId", "");
            },
          })}
          aria-invalid={!!errors[nombre]}
          aria-describedby={errors[nombre] ? `error-${nombre}` : undefined}
        >
          <option value="">{primera}</option>
          {lista.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.texto}
            </option>
          ))}
        </SelectNativo>
        <span className="contacto-seleccion-texto" aria-hidden="true">
          {lista.find(
            (o) => o.valor === { pais, departamentoId: departamento, municipioId: municipio, sedeId: sede }[nombre],
          )?.texto ?? primera}
        </span>
      </span>
    </label>
  );
  return (
    <div className="tarjeta form-contacto" ref={caja} tabIndex={-1}>
      {recibida ? (
        <div className="contacto-exito" role="status">
          <div className="contacto-ok">
            <Icono nombre="check" />
          </div>
          <h2>Solicitud recibida</h2>
          <p className="muted">
            Gracias, {recibida.nombre}. Su {recibida.motivo} quedó registrada con el número{" "}
            <b className="mono">{recibida.folio}</b> para la sede de {recibida.sede}.
          </p>
          <button
            className="btn btn-s"
            type="button"
            onClick={() => {
              recibir(null);
              reset();
              cambiarError("");
            }}
          >
            Enviar otro mensaje
          </button>
        </div>
      ) : (
        <>
          <h2>Envíenos su mensaje</h2>
          <p className="muted contacto-intro">
            Los campos con asterisco son obligatorios. La solicitud queda registrada en el sistema y la atiende la sede
            seleccionada.
          </p>
          <form
            className="rejilla contacto-form"
            noValidate
            onSubmit={(evento) => {
              void handleSubmit(async (datos) => {
                if (bloqueo.current) return;
                bloqueo.current = true;
                cambiarError("");
                try {
                  const r = await enviarSolicitud(datos);
                  if (!r.ok) {
                    cambiarError(r.error);
                    return;
                  }
                  recibir({
                    folio: r.datos.folio,
                    nombre: datos.nombre,
                    motivo: datos.motivo,
                    sede: opciones.sedes.find((s) => String(s.id) === datos.sedeId)!.nombre,
                  });
                } catch {
                  cambiarError(MENSAJE_ERROR_GENERAL);
                } finally {
                  bloqueo.current = false;
                }
              })(evento);
            }}
          >
            <div className="campo">
              <span id="tipo-mensaje">Tipo de mensaje *</span>
              <div className="seg" role="group" aria-labelledby="tipo-mensaje">
                {(["solicitud", "queja", "reclamo"] as const).map((t) => (
                  <button
                    type="button"
                    key={t}
                    aria-pressed={motivo === t}
                    className={motivo === t ? "on" : ""}
                    onClick={() => setValue("motivo", t)}
                  >
                    {t[0].toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="rejilla r2">
              {campo("nombre", "Nombre completo *", "Su nombre", "text", { maxLength: 150 })}
              {campo("empresa", "Empresa", "Nombre de su empresa", "text", { maxLength: 150 })}
            </div>
            <div className="rejilla r2">
              {campo("correo", "Correo electrónico *", "correo@empresa.com", "email", {
                maxLength: 150,
                alSalir: true,
              })}
              <div className="campo">
                <span>Teléfono</span>
                <div className="tel-caja">
                  <div className="tel-cod">
                    <SelectNativo
                      className="sel"
                      aria-label="Código de país"
                      {...register("telefonoPais", {
                        onChange: () => {
                          void trigger("telefono");
                        },
                      })}
                    >
                      {opciones.paises.map((p) => (
                        <option key={p.codigo} value={p.codigo}>
                          {p.nombre} (+{getCountryCallingCode(p.codigo as CountryCode)})
                        </option>
                      ))}
                    </SelectNativo>
                    <span className="tel-cod-txt" aria-hidden="true">
                      +{getCountryCallingCode(telefonoPais as CountryCode)}
                    </span>
                  </div>
                  <input
                    className={`inp${errors.telefono ? " error" : ""}`}
                    aria-label="Número de teléfono"
                    inputMode="tel"
                    placeholder="5123 4567"
                    maxLength={20}
                    {...register("telefono", { onBlur: () => void trigger("telefono") })}
                    aria-invalid={!!errors.telefono}
                    aria-describedby={errors.telefono ? "error-telefono" : undefined}
                  />
                </div>
                {errors.telefono && (
                  <small className="msg-error" id="error-telefono">
                    {errors.telefono.message}
                  </small>
                )}
              </div>
            </div>
            <div className="rejilla">
              {seleccion(
                "pais",
                "País *",
                "Elija el país",
                opciones.paises.map((p) => ({ valor: p.codigo, texto: p.nombre })),
              )}
              {pais === "GT" && (
                <>
                  {seleccion(
                    "departamentoId",
                    "Departamento *",
                    "Elija el departamento",
                    opciones.departamentos.map((d) => ({ valor: String(d.id), texto: d.nombre })),
                  )}
                  {seleccion(
                    "municipioId",
                    "Municipio *",
                    departamento ? "Elija el municipio" : "Elija primero el departamento",
                    opciones.municipios
                      .filter((m) => String(m.departamentoId) === departamento)
                      .map((m) => ({ valor: String(m.id), texto: m.nombre })),
                  )}
                </>
              )}
            </div>
            {seleccion(
              "sedeId",
              "Sede a la que dirige su mensaje *",
              "Elija la sede",
              opciones.sedes.map((s) => ({ valor: String(s.id), texto: s.nombre })),
            )}
            <label className="campo">
              <span>Mensaje *</span>
              <textarea
                aria-label="Mensaje *"
                className={`txa${errors.mensaje ? " error" : ""}`}
                placeholder="Describa su solicitud, queja o reclamo"
                {...register("mensaje")}
                aria-invalid={!!errors.mensaje}
                aria-describedby={errors.mensaje ? "error-mensaje" : undefined}
              />
            </label>
            <div>
              {submitCount > 0 && Object.keys(errors).length > 0 && (
                <div className="aviso aviso-r" role="alert">
                  <Icono nombre="alerta" />
                  <div>
                    {(
                      [
                        "nombre",
                        "correo",
                        "telefono",
                        "pais",
                        "departamentoId",
                        "municipioId",
                        "sedeId",
                        "mensaje",
                        "empresa",
                        "telefonoPais",
                      ] as const
                    )
                      .filter((nombre) => errors[nombre])
                      .map((nombre) => (
                        <span key={nombre} id={["correo", "telefono"].includes(nombre) ? undefined : `error-${nombre}`}>
                          {errors[nombre]!.message}{" "}
                        </span>
                      ))}
                  </div>
                </div>
              )}
              {error && (
                <div className="aviso aviso-r" role="alert">
                  {error}
                </div>
              )}
            </div>
            <button className="btn btn-p btn-lg contacto-enviar" disabled={isSubmitting} type="submit">
              Enviar mensaje <Icono nombre="flecha" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
