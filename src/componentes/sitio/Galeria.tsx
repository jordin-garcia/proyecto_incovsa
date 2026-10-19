"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/** RN-56 / RNF-17: únicamente la primera imagen existe durante la carga inicial. */
export function Galeria({
  imagenes,
  alt = "",
  className = "",
}: {
  imagenes: string[];
  alt?: string;
  className?: string;
}) {
  const fotos = imagenes.filter(Boolean).slice(0, 5);
  const [cargada, marcarCargada] = useState(false);
  const [actual, cambiarActual] = useState(0);

  useEffect(() => {
    // Deferir incluso las imágenes cercanas a la pantalla hasta después de window.load.
    const cargar = () => marcarCargada(true);
    if (document.readyState === "complete") {
      const turno = window.setTimeout(cargar, 0);
      return () => window.clearTimeout(turno);
    }
    window.addEventListener("load", cargar, { once: true });
    return () => window.removeEventListener("load", cargar);
  }, []);

  useEffect(() => {
    if (!cargada || fotos.length < 2) return;
    const preferencia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const intervalo = window.setInterval(() => {
      if (!preferencia.matches && !document.hidden) cambiarActual((indice) => (indice + 1) % fotos.length);
    }, 5000);
    return () => window.clearInterval(intervalo);
  }, [cargada, fotos.length]);

  if (!fotos.length) return null;
  return (
    <div className={`gal ${fotos.length > 1 ? "rota" : ""} ${className}`} data-galeria data-actual={actual}>
      {fotos.map(
        (url, indice) =>
          (indice === 0 || cargada) && (
            <Image
              key={`${indice}-${url}`}
              src={url}
              alt={indice === actual ? alt : ""}
              aria-hidden={indice !== actual}
              width={1600}
              height={1000}
              unoptimized
              loading={indice === 0 ? "eager" : "lazy"}
              fetchPriority={indice === 0 ? "high" : "low"}
              className={indice === actual ? "on" : ""}
            />
          ),
      )}
    </div>
  );
}
