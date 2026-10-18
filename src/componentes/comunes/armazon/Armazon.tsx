"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Button } from "@/componentes/ui/button";
import { SelectNativo } from "@/componentes/ui/select-nativo";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/componentes/ui/tooltip";
import { cn } from "@/lib/utils";
import { Icono, type NombreIcono } from "../iconos";

export type OpcionNavegacion = { href: string; texto: string; icono: NombreIcono; activa?: boolean; contador?: number };
export type SedeArmazon = { id: string; nombre: string };
export type PropsArmazon = {
  sistema: "sitio" | "picking";
  modulo: string;
  nombreModulo: string;
  opciones: OpcionNavegacion[];
  usuario: { nombre: string; rol: string; sede: string };
  sedes?: SedeArmazon[];
  sede?: string;
  alCambiarSede?: (id: string) => void;
  cambiandoSede?: boolean;
  alSalir: () => void;
  children: ReactNode;
};

function suscribirPantalla(avisar: () => void) {
  const m = matchMedia("(max-width: 1024px)");
  m.addEventListener("change", avisar);
  return () => m.removeEventListener("change", avisar);
}
const suscribirHidratacion = () => () => {};
function suscribirPreferencia(avisar: () => void) {
  window.addEventListener("storage", avisar);
  window.addEventListener("incovsa-menu", avisar);
  return () => {
    window.removeEventListener("storage", avisar);
    window.removeEventListener("incovsa-menu", avisar);
  };
}
// Solo una preferencia visual. La sede y los permisos los entrega el consumidor (JG-07).
let preferenciaEnMemoria = false;
function leerPreferencia() {
  try {
    return localStorage.getItem("incovsa-menu-reducido") === "si";
  } catch {
    return preferenciaEnMemoria;
  }
}
function guardarPreferencia(valor: boolean) {
  preferenciaEnMemoria = valor;
  try {
    localStorage.setItem("incovsa-menu-reducido", valor ? "si" : "no");
  } catch {
    /* El menú sigue funcionando si el navegador impide guardar. */
  }
  window.dispatchEvent(new Event("incovsa-menu"));
}

export function Armazon({
  sistema,
  modulo,
  nombreModulo,
  opciones,
  usuario,
  sedes = [],
  sede,
  alCambiarSede,
  cambiandoSede = false,
  alSalir,
  children,
}: PropsArmazon) {
  const hidratado = useSyncExternalStore(
    suscribirHidratacion,
    () => true,
    () => false,
  );
  const movil = useSyncExternalStore(
    suscribirPantalla,
    () => matchMedia("(max-width: 1024px)").matches,
    () => false,
  );
  const reducido = useSyncExternalStore(suscribirPreferencia, leerPreferencia, () => false);
  const [abierto, abrir] = useState(false);
  const menu = useRef<HTMLButtonElement>(null);
  const lado = useRef<HTMLElement>(null);
  const usaSede = ["facturacion", "bodega", "ruta", "reportes"].includes(modulo);
  const sedeSeleccionada = sedes.find((s) => s.id === sede) ?? sedes[0];
  const cerrar = () => {
    abrir(false);
    requestAnimationFrame(() => menu.current?.focus());
  };
  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn("app", reducido && "reducido", abierto && "menu-abierto")} data-hidratado={hidratado}>
        <aside
          ref={lado}
          className="lado"
          aria-label={sistema === "sitio" ? "Administración del sitio" : "Sistema de picking"}
          inert={movil && !abierto}
          onKeyDown={(e) => {
            if (!movil || !abierto) return;
            if (e.key === "Escape") {
              e.preventDefault();
              cerrar();
            }
            if (e.key === "Tab") {
              const focos = [
                ...(lado.current?.querySelectorAll<HTMLElement>("a[href],button:not([disabled])") ?? []),
              ].filter((n) => n.getClientRects().length > 0);
              const primero = focos[0],
                ultimo = focos.at(-1);
              if (e.shiftKey && document.activeElement === primero) {
                e.preventDefault();
                ultimo?.focus();
              } else if (!e.shiftKey && document.activeElement === ultimo) {
                e.preventDefault();
                primero?.focus();
              }
            }
          }}
        >
          <div className="lado-arriba">
            <Link className="lado-logo" href="/" title="Ir al sitio público" aria-label="INCOVSA Químicos">
              <Image
                src="/marca/incovsa-quimicos-blanco.webp"
                alt="INCOVSA Químicos"
                width={453}
                height={172}
                priority
              />
              <span className="logo-mini">
                <svg viewBox="0 0 40 60" aria-hidden="true">
                  <circle cx="20" cy="46" r="9" />
                  <circle cx="8" cy="26" r="6" opacity=".75" />
                  <circle cx="24" cy="10" r="4" opacity=".5" />
                </svg>
              </span>
            </Link>
            <button
              className="lado-reducir"
              onClick={() => guardarPreferencia(!reducido)}
              aria-label={reducido ? "Expandir el menú" : "Reducir el menú a íconos"}
            >
              <Icono nombre={reducido ? "expandir" : "colapsar"} />
            </button>
          </div>
          <p className="lado-sis">
            {sistema === "picking" ? "Control logístico de bodega" : "Administración del sitio"}
          </p>
          <nav className="lado-nav" aria-label="Módulos">
            {opciones.map((o) => (
              <Tooltip key={o.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={o.href}
                    className={cn(o.activa && "on")}
                    aria-current={o.activa ? "page" : undefined}
                    aria-label={o.contador ? `${o.texto} ${o.contador}` : o.texto}
                    onClick={() => {
                      if (movil) abrir(false);
                    }}
                  >
                    <Icono nombre={o.icono} />
                    <span className="txt">
                      {o.texto}
                      {o.contador ? " " : ""}
                    </span>
                    {!!o.contador && (
                      <span className="cont" aria-hidden="true">
                        {o.contador}
                      </span>
                    )}
                  </Link>
                </TooltipTrigger>
                {reducido && !movil && <TooltipContent side="right">{o.texto}</TooltipContent>}
              </Tooltip>
            ))}
          </nav>
          <div className="lado-usuario">
            <span className="avatar" title={usuario.nombre}>
              {usuario.nombre
                .split(/\s+/)
                .slice(0, 2)
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </span>
            <div className="quien">
              <b>{usuario.nombre}</b>
              <small>
                {usuario.rol || "Sin rol"} · {usuario.sede}
              </small>
            </div>
            <button onClick={alSalir} aria-label="Cerrar sesión" title="Cerrar sesión">
              <Icono nombre="salir" />
            </button>
          </div>
        </aside>
        {movil && abierto && (
          <button className="menu-fondo" aria-label="Cerrar el menú" onClick={cerrar} tabIndex={-1} />
        )}
        <div className="principal" inert={movil && abierto}>
          <header className="barra-sup">
            <Button
              variant="secundario"
              size="icono"
              className="menu-movil"
              ref={menu}
              aria-label="Menú"
              aria-expanded={abierto}
              onClick={() => {
                abrir(true);
                requestAnimationFrame(() => lado.current?.querySelector<HTMLElement>("a[href]")?.focus());
              }}
            >
              <Icono nombre="menu" />
            </Button>
            <div className="ruta-txt">
              {sistema === "sitio" ? "Administración del sitio" : "Sistema de picking"}
              <Icono nombre="flecha" className="ico-s" />
              <b>{nombreModulo}</b>
            </div>
            <div className="der">
              {sistema === "sitio" ? (
                <Button asChild variant="secundario" size="pequeno">
                  <Link href="/">
                    <Icono nombre="globo" className="ico-s" />
                    Ver el sitio
                  </Link>
                </Button>
              ) : (
                <>
                  <span className="vivo">
                    <i aria-hidden="true" />
                    En vivo
                  </span>
                  {sedes.length > 1 && usaSede ? (
                    <label className="sede-sel">
                      <Icono nombre="pin" className="ico-s" />
                      <SelectNativo
                        aria-label="Sede"
                        value={sedeSeleccionada?.id ?? ""}
                        disabled={cambiandoSede}
                        onChange={(e) => alCambiarSede?.(e.target.value)}
                      >
                        {sedes.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nombre}
                          </option>
                        ))}
                      </SelectNativo>
                    </label>
                  ) : (
                    <span className="chip">
                      <Icono nombre="pin" className="ico-s" />
                      {sedes.length > 1 ? "Todas sus sedes" : (sedeSeleccionada?.nombre ?? "Sin sede")}
                    </span>
                  )}
                </>
              )}
            </div>
          </header>
          <main className="contenido" id="contenido-principal">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
