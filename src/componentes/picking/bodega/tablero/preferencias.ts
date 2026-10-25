"use client";
import { useSyncExternalStore } from "react";
import { formatoHora } from "@/lib/fechas";

export type TemaTablero = "claro" | "oscuro";

// Como el prototipo: el modo se guarda en la sesión del navegador de esa pantalla y no se comparte (decisión 56).
const CLAVE = "incovsa-tb-tema";
const EVENTO = "incovsa-tb-tema";
let temaEnMemoria: TemaTablero = "claro";

function leerTema(): TemaTablero {
  try {
    return sessionStorage.getItem(CLAVE) === "oscuro" ? "oscuro" : "claro";
  } catch {
    return temaEnMemoria;
  }
}

function suscribirTema(avisar: () => void) {
  window.addEventListener(EVENTO, avisar);
  return () => window.removeEventListener(EVENTO, avisar);
}

export function fijarTema(tema: TemaTablero) {
  temaEnMemoria = tema;
  try {
    sessionStorage.setItem(CLAVE, tema);
  } catch {
    /* Si el navegador impide guardar, el modo vale mientras la pantalla siga abierta. */
  }
  window.dispatchEvent(new Event(EVENTO));
}

/**
 * Modo del tablero. Sin elección previa, o al reiniciar el navegador, el claro: lo decidió Jordin el 24/10
 * (el prototipo abre en oscuro).
 */
export function useTemaTablero(): TemaTablero {
  return useSyncExternalStore(suscribirTema, leerTema, () => "claro");
}

function suscribirReloj(avisar: () => void) {
  const intervalo = setInterval(avisar, 1000);
  return () => clearInterval(intervalo);
}

/** Hora actual HH:MM; vacía mientras se hidrata, para que el servidor y el navegador coincidan. */
export function useReloj(): string {
  return useSyncExternalStore(
    suscribirReloj,
    () => formatoHora(new Date()),
    () => "",
  );
}

const suscribirHidratacion = () => () => {};
export function useHidratado(): boolean {
  return useSyncExternalStore(
    suscribirHidratacion,
    () => true,
    () => false,
  );
}
