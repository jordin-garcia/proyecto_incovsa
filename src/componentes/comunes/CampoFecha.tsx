"use client";

import { useEffect, useId, useRef, useState, type ComponentProps } from "react";
import { formatoFecha, leerFecha, leerHora } from "@/lib/fechas";
import { Input } from "@/componentes/ui/input";
import { Icono } from "./iconos";

export type PropsCampoTemporal = Omit<
  ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "type" | "size"
> & {
  etiqueta: string;
  valor: string;
  alCambiar: (iso: string) => void;
};

function mostrar(tipo: "fecha" | "hora", valor: string): string {
  if (!valor) return "";
  if (tipo === "hora") return leerHora(valor) ?? "";
  try {
    return formatoFecha(valor);
  } catch {
    return "";
  }
}

// El borrador conserva el texto inválido para que la persona pueda corregirlo.
// El consumidor recibe solo valores válidos en ISO o vacío; nunca un dato inválido.
export function CampoTemporal({
  tipo,
  etiqueta,
  valor,
  alCambiar,
  id,
  name,
  disabled,
  required,
  onBlur,
  className,
  ...props
}: PropsCampoTemporal & { tipo: "fecha" | "hora" }) {
  const automatico = useId();
  const identificador = id ?? automatico;
  const nativo = useRef<HTMLInputElement>(null);
  const textoRef = useRef<HTMLInputElement>(null);
  const [borrador, escribir] = useState({ texto: mostrar(tipo, valor), anterior: valor });
  const [tocado, tocar] = useState(false);
  // Sin efectos que sobrescriban una edición local: también admite reinicios externos del formulario.
  if (borrador.anterior !== valor) escribir({ texto: mostrar(tipo, valor), anterior: valor });
  const leer = tipo === "fecha" ? leerFecha : leerHora;
  const iso = leer(borrador.texto) ?? "";
  const invalido = tocado && !!borrador.texto.trim() && !iso;
  const mensaje =
    tipo === "fecha"
      ? "Escriba la fecha como dd/mm/aaaa, por ejemplo 15/10/2026"
      : "Escriba la hora en formato de 24 horas, por ejemplo 13:30";
  useEffect(() => {
    textoRef.current?.setCustomValidity(borrador.texto.trim() && !iso ? mensaje : "");
  }, [borrador.texto, iso, mensaje]);
  const cambiar = (texto: string) => {
    const nuevo = leer(texto) ?? "";
    escribir({ texto, anterior: nuevo });
    alCambiar(nuevo);
  };
  return (
    <div className="campo">
      <label htmlFor={identificador} className="etq">
        {etiqueta}
      </label>
      <span className="campo-caja">
        <Input
          {...props}
          id={identificador}
          ref={textoRef}
          disabled={disabled}
          required={required}
          className={[className, !iso && !invalido ? "falta" : "", invalido ? "error" : "", "campo-temporal"]
            .filter(Boolean)
            .join(" ")}
          type="text"
          value={borrador.texto}
          inputMode="numeric"
          autoComplete="off"
          maxLength={tipo === "fecha" ? 10 : 5}
          placeholder={tipo === "fecha" ? "dd/mm/aaaa" : "HH:MM"}
          aria-invalid={invalido}
          aria-describedby={invalido ? `${identificador}-error` : props["aria-describedby"]}
          onChange={(e) => {
            let texto = e.target.value.replace(tipo === "fecha" ? /[^\d/]/g : /[^\d:]/g, "");
            if (tipo === "fecha") {
              texto = texto.replace(/\/{2,}/g, "/");
              if (/^\d{8}$/.test(texto)) texto = `${texto.slice(0, 2)}/${texto.slice(2, 4)}/${texto.slice(4)}`;
              else if (
                (e.nativeEvent as InputEvent).inputType === "insertText" &&
                /^(\d{2}|\d{1,2}\/\d{2})$/.test(texto)
              )
                texto += "/";
            } else if (/^\d{4}$/.test(texto)) texto = `${texto.slice(0, 2)}:${texto.slice(2)}`;
            tocar(false);
            cambiar(texto);
          }}
          onBlur={(e) => {
            tocar(true);
            const valido = leer(e.currentTarget.value);
            if (valido) cambiar(mostrar(tipo, valido));
            onBlur?.(e);
          }}
        />
        <button
          type="button"
          disabled={disabled}
          className="campo-btn"
          aria-label={tipo === "fecha" ? "Elegir la fecha" : "Elegir la hora"}
          onClick={() => {
            if (!nativo.current) return;
            nativo.current.value = iso;
            try {
              nativo.current.showPicker();
            } catch {
              textoRef.current?.focus();
            }
          }}
        >
          <Icono nombre={tipo === "fecha" ? "calendario" : "reloj"} className="ico-s" />
        </button>
        <input
          type={tipo === "fecha" ? "date" : "time"}
          ref={nativo}
          className="campo-nativo"
          tabIndex={-1}
          aria-hidden="true"
          disabled={disabled}
          onChange={(e) => {
            const nuevo =
              tipo === "fecha"
                ? e.currentTarget.value
                  ? leerFecha(e.currentTarget.value.split("-").reverse().join("/"))
                  : null
                : leerHora(e.currentTarget.value);
            if (!nuevo) return;
            tocar(false);
            cambiar(mostrar(tipo, nuevo));
          }}
        />
        {name && <input type="hidden" name={name} value={iso} disabled={disabled} />}
      </span>
      {invalido && (
        <small id={`${identificador}-error`} className="msg-error" role="alert">
          {mensaje}
        </small>
      )}
    </div>
  );
}

export function CampoFecha(props: PropsCampoTemporal) {
  return <CampoTemporal {...props} tipo="fecha" />;
}
