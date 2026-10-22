"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SELECTOR =
  "main .hero-foto, main img:not(.gal img), main .gal:not(.gal-fondo), main .tarjeta, main .ind-t, main .prod-t, main .det-foto, main .banner-logos, main .valor-t";

/** Se comparte entre todas las rutas públicas y se desmonta al salir del sitio. */
export function PresentacionDinamica() {
  const ruta = usePathname();
  useEffect(() => {
    let elementos = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR)).filter(
      (elemento) => !elemento.parentElement?.closest(SELECTOR),
    );
    const preferencia = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observador: IntersectionObserver | undefined;
    const observar = () => {
      observador?.disconnect();
      if (preferencia.matches || !("IntersectionObserver" in window)) {
        elementos.forEach((elemento) => elemento.classList.add("revelar", "visible"));
        return;
      }
      observador = new IntersectionObserver(
        (entradas) => {
          entradas.forEach((entrada) => {
            const visible =
              entrada.isIntersecting &&
              (entrada.intersectionRatio >= 0.15 ||
                entrada.intersectionRect.height >= 0.15 * (entrada.rootBounds?.height ?? innerHeight));
            entrada.target.classList.toggle("visible", visible);
          });
        },
        { threshold: Array.from({ length: 21 }, (_, indice) => indice / 20) },
      );
      elementos.forEach((elemento) => {
        elemento.classList.add("revelar");
        observador!.observe(elemento);
      });
    };
    observar();
    // El catálogo sustituye tarjetas al filtrar sin cambiar la ruta.
    // Solo se observan inserciones y eliminaciones, nunca los cambios de clase del propio observador.
    const cambios = new MutationObserver(() => {
      const actuales = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR)).filter(
        (elemento) => !elemento.parentElement?.closest(SELECTOR),
      );
      if (actuales.length === elementos.length && actuales.every((elemento, indice) => elemento === elementos[indice]))
        return;
      elementos.filter((elemento) => !elemento.isConnected).forEach((elemento) => observador?.unobserve(elemento));
      elementos = actuales;
      observar();
    });
    cambios.observe(document.querySelector("main") ?? document.body, { childList: true, subtree: true });
    preferencia.addEventListener("change", observar);
    return () => {
      cambios.disconnect();
      observador?.disconnect();
      preferencia.removeEventListener("change", observar);
      elementos.forEach((elemento) => elemento.classList.remove("revelar", "visible"));
    };
  }, [ruta]);
  return null;
}
