"use client";

import { useEffect, useRef } from "react";
import { useMensajes } from "./Mensajes";

export function AvisoDeSalida({ mostrar }: { mostrar: boolean }) {
  const mensaje = useMensajes();
  const mostrado = useRef(false);
  useEffect(() => {
    if (!mostrar || mostrado.current) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("sesion") !== "cerrada") return;
    mostrado.current = true;
    mensaje("Sesión cerrada.");
    url.searchParams.delete("sesion");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }, [mostrar, mensaje]);
  return null;
}
