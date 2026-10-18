import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

// Trazos originales de base.js, incluidos los nueve íconos de industrias.
const ICONOS = {
  inicio: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </>
  ),
  factura: (
    <>
      <path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </>
  ),
  bodega: (
    <>
      <path d="M3 21V9l9-5 9 5v12" />
      <path d="M7 21v-8h10v8" />
      <path d="M7 17h10" />
    </>
  ),
  camion: (
    <>
      <path d="M2 6h11v10H2z" />
      <path d="M13 9h4l4 4v3h-8" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </>
  ),
  caja: (
    <>
      <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
      <path d="M3 8l9 5 9-5" />
      <path d="M12 13v8" />
    </>
  ),
  grafica: (
    <>
      <path d="M3 21h18" />
      <path d="M6 17v-5M11 17V6M16 17v-8M21 17v-3" />
    </>
  ),
  ajustes: (
    <>
      <path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1" />
      <circle cx="15" cy="6" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="17" cy="18" r="2" />
    </>
  ),
  salir: (
    <>
      <path d="M9 4H5v16h4" />
      <path d="M14 8l4 4-4 4M18 12H9" />
    </>
  ),
  buscar: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  mas: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  asa: (
    <>
      <circle cx="9" cy="6" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="15" cy="6" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="9" cy="18" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="15" cy="18" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  check: (
    <>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </>
  ),
  x: (
    <>
      <path d="M6 6l12 12M18 6 6 18" />
    </>
  ),
  alerta: (
    <>
      <path d="M12 3.5 2.5 20h19z" />
      <path d="M12 10v4.5M12 17.2h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.8h.01" />
    </>
  ),
  flecha: (
    <>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </>
  ),
  atras: (
    <>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </>
  ),
  arriba: (
    <>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </>
  ),
  archivo: (
    <>
      <path d="M14 3H6v18h12V7z" />
      <path d="M14 3v4h4" />
      <path d="M9 13h6M9 17h4" />
    </>
  ),
  ojo: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  ojoNo: (
    <>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.9M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7c1.6 0 3-.4 4.3-1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </>
  ),
  descargar: (
    <>
      <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />
    </>
  ),
  subir: (
    <>
      <path d="M12 21V9M7 14l5-5 5 5M4 3h16" />
    </>
  ),
  usuario: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </>
  ),
  usuarios: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c1-3.5 3.5-5.5 6.5-5.5s5.5 2 6.5 5.5" />
      <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c2 .7 3.3 2.5 3.8 5.5" />
    </>
  ),
  tv: (
    <>
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </>
  ),
  tableta: (
    <>
      <rect x="4" y="2" width="16" height="20" rx="2.5" />
      <path d="M11 18h2" />
    </>
  ),
  completa: (
    <>
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </>
  ),
  candado: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  tel: (
    <>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
    </>
  ),
  correo: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  chat: (
    <>
      <path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12z" />
    </>
  ),
  editar: (
    <>
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="M13 7l4 4" />
    </>
  ),
  borrar: (
    <>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
    </>
  ),
  llave: (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12l9-9M16 7l3 3" />
    </>
  ),
  reloj: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  menu: (
    <>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </>
  ),
  sol: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  luna: (
    <>
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
    </>
  ),
  colapsar: (
    <>
      <path d="M11 6l-6 6 6 6M19 6l-6 6 6 6" />
    </>
  ),
  expandir: (
    <>
      <path d="M13 6l6 6-6 6M5 6l6 6-6 6" />
    </>
  ),
  globo: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </>
  ),
  externo: (
    <>
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M18 14v6H4V6h6" />
    </>
  ),
  bandeja: (
    <>
      <path d="M3 13h5l1.5 3h5L16 13h5" />
      <path d="M5 5h14l2 8v6H3v-6z" />
    </>
  ),
  noticia: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 8h10M7 12h10M7 16h6" />
    </>
  ),
  imagen: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="m21 17-5-5-9 8" />
    </>
  ),
  fabrica: (
    <>
      <path d="M3 21V11l6 3V11l6 3V7l6-3v17z" />
      <path d="M3 21h18" />
    </>
  ),
  ruta: (
    <>
      <circle cx="6" cy="19" r="2.5" />
      <circle cx="18" cy="5" r="2.5" />
      <path d="M8.5 19H16a3.5 3.5 0 0 0 0-7H8a3.5 3.5 0 0 1 0-7h7.5" />
    </>
  ),
  lista: (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="M4 6h.01M4 12h.01M4 18h.01" />
    </>
  ),
  escudo: (
    <>
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
    </>
  ),
  tubo: (
    <>
      <path d="M8.5 3h7M10 3v14.5a2 2 0 0 0 4 0V3" />
      <path d="M10 12h4" />
    </>
  ),
  edificio: (
    <>
      <path d="M3 21h18M5 21V8l7-4 7 4v13" />
      <path d="M9 21v-6h6v6" />
    </>
  ),
  ciclo: (
    <>
      <path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5" />
      <path d="M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5" />
    </>
  ),
  calendario: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  estrella: (
    <>
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z" />
    </>
  ),
  cuero: (
    <>
      <path d="M7 3c1 1.5 3 2 5 2s4-.5 5-2c1 1.5 3 2.5 4 2.5-.5 2-1 3.5-1 5.5 0 3 1 5 1 7-1.5 0-3 1-4 2.5-1-.8-3-1.5-5-1.5s-4 .7-5 1.5C6 19 4.5 18 3 18c0-2 1-4 1-7 0-2-.5-3.5-1-5.5C4 5.5 6 4.5 7 3z" />
    </>
  ),
  textil: (
    <>
      <path d="M6 3h12M6 21h12" />
      <path d="M8 3v18M16 3v18" />
      <path d="M8 7l8 3M8 11l8 3M8 15l8 3" />
    </>
  ),
  cereria: (
    <>
      <path d="M8 10h8v11H8z" />
      <path d="M12 10V7.5" />
      <path d="M12 7.5c-1.6-1-1.6-3 0-4.5 1.6 1.5 1.6 3.5 0 4.5z" />
    </>
  ),
  hulera: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </>
  ),
  medicamentos: (
    <>
      <rect x="2.5" y="8" width="19" height="8" rx="4" transform="rotate(-45 12 12)" />
      <path d="M8.5 8.5l7 7" />
    </>
  ),
  limpieza: (
    <>
      <path d="M9 8h6l1 3v10H8V11z" />
      <path d="M10 8V5h4l3-2" />
      <path d="M19.5 5h.01M20.5 8h.01M18.5 8.5h.01" />
    </>
  ),
  alimentacion: (
    <>
      <circle cx="6.5" cy="10" r="1.8" />
      <circle cx="10.5" cy="5.5" r="1.8" />
      <circle cx="15.5" cy="6" r="1.8" />
      <circle cx="18.5" cy="10.5" r="1.8" />
      <path d="M8 17.5c0-3 2-6 5-6s5 3 4.5 5.5c-.3 1.8-2 2.5-4 2-1-.3-1.5-.3-2.5 0-2 .5-3-.2-3-1.5z" />
    </>
  ),
  agua: (
    <>
      <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />
      <path d="M9 15a3 3 0 0 0 3 3" />
    </>
  ),
  lavanderia: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <circle cx="12" cy="13" r="4.5" />
      <path d="M7 6.5h.01M10 6.5h4" />
    </>
  ),
};

export type NombreIcono = keyof typeof ICONOS;
/** Flecha original de .sel en estilos.css; comparte el mismo trazo en ambos tipos de selector. */
export function FlechaSeleccion() {
  return (
    <svg
      className="sel-flecha"
      viewBox="0 0 12 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M1 1.5l5 5 5-5" />
    </svg>
  );
}
export function Icono({ nombre, className, ...props }: SVGProps<SVGSVGElement> & { nombre: NombreIcono }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("ico", className)} {...props} aria-hidden="true" focusable="false">
      {ICONOS[nombre]}
    </svg>
  );
}
