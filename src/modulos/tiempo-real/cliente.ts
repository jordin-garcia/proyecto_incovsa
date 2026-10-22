"use client";
import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";

export const TIEMPO_REAL_CONSULTA_MS = 5000;
type Conexion = {
  vivo: boolean;
  consumidores: Map<() => void, number>;
  cerrar: () => void;
};
const conexiones = new Map<string, Conexion>();
const observadores = new Set<() => void>();
function avisarEstado() {
  observadores.forEach((avisar) => avisar());
}
function suscribirEstado(avisar: () => void) {
  observadores.add(avisar);
  return () => {
    observadores.delete(avisar);
  };
}
function claveConexion(sede: number | null, ruta: string) {
  const modulo = ruta.startsWith("/picking/") ? ruta.split("/")[2] : undefined;
  return sede !== null && modulo ? `sede=${sede}&modulo=${encodeURIComponent(modulo)}` : null;
}
function suscribir(clave: string, refrescar: () => void) {
  let conexion = conexiones.get(clave);
  if (!conexion) {
    const nueva: Conexion = { vivo: false, consumidores: new Map(), cerrar: () => {} };
    conexiones.set(clave, nueva);
    let cerrada = false;
    let fuente: EventSource | null = null;
    let intervalo: ReturnType<typeof setInterval> | undefined;
    let pendiente = false;
    const actualizar = () => {
      if (cerrada) return;
      if (document.visibilityState !== "visible") {
        pendiente = true;
        return;
      }
      pendiente = false;
      nueva.consumidores.forEach((_cantidad, refrescar) => refrescar());
    };
    const alMostrar = () => {
      if (pendiente) actualizar();
    };
    const desconectar = () => {
      if (cerrada) return;
      fuente?.close();
      fuente = null;
      nueva.vivo = false;
      avisarEstado();
      consultar();
    };
    const conectar = () => {
      if (cerrada || fuente || typeof EventSource === "undefined") return;
      try {
        const actual = new EventSource(`/api/tiempo-real?${clave}`);
        fuente = actual;
        actual.onopen = () => {
          if (cerrada || fuente !== actual) return;
          nueva.vivo = true;
          clearInterval(intervalo);
          intervalo = undefined;
          avisarEstado();
          // Recupera los cambios ocurridos durante la desconexión, sin necesitar reproducir eventos anteriores.
          actualizar();
        };
        actual.onmessage = () => {
          if (!cerrada && fuente === actual) actualizar();
        };
        actual.onerror = () => {
          if (cerrada || fuente !== actual) return;
          desconectar();
        };
      } catch {
        fuente = null;
      }
    };
    const consultar = () => {
      intervalo ??= setInterval(() => {
        actualizar();
        conectar();
      }, TIEMPO_REAL_CONSULTA_MS);
    };
    nueva.cerrar = () => {
      if (cerrada) return;
      cerrada = true;
      fuente?.close();
      clearInterval(intervalo);
      document.removeEventListener?.("visibilitychange", alMostrar);
      if (typeof window !== "undefined") {
        window.removeEventListener("offline", desconectar);
        window.removeEventListener("online", conectar);
      }
      conexiones.delete(clave);
      avisarEstado();
    };
    document.addEventListener?.("visibilitychange", alMostrar);
    if (typeof window !== "undefined") {
      window.addEventListener("offline", desconectar);
      window.addEventListener("online", conectar);
    }
    consultar();
    conectar();
    conexion = nueva;
  }
  const activa = conexion;
  activa.consumidores.set(refrescar, (activa.consumidores.get(refrescar) ?? 0) + 1);
  let liberado = false;
  return () => {
    if (liberado) return;
    liberado = true;
    const cantidad = activa.consumidores.get(refrescar) ?? 0;
    if (cantidad > 1) activa.consumidores.set(refrescar, cantidad - 1);
    else activa.consumidores.delete(refrescar);
    if (activa.consumidores.size === 0) activa.cerrar();
  };
}

/** Conserva la interfaz de JG-07. Armazón y módulo comparten transporte y refresco, también en Strict Mode. */
export function useCambiosDeSede(sede: number | null) {
  const router = useRouter();
  const clave = claveConexion(sede, usePathname());
  useEffect(() => {
    if (clave === null) return;
    return suscribir(clave, router.refresh);
  }, [router, clave]);
}

/** El indicador observa la conexión existente; no abre otra ni crea otro intervalo. */
export function useConexionEnVivo(sede: number | null) {
  const clave = claveConexion(sede, usePathname());
  return useSyncExternalStore(
    suscribirEstado,
    () => clave !== null && (conexiones.get(clave)?.vivo ?? false),
    () => false,
  );
}
