"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { salir } from "@/app/acceso/acciones";
import { Armazon, type OpcionNavegacion } from "./Armazon";

export const SEDES_EJEMPLO = [
  { id: "XE", nombre: "Quetzaltenango" },
  { id: "GT", nombre: "Guatemala" },
  { id: "ES", nombre: "Escuintla" },
];
export const MODULOS_PICKING: OpcionNavegacion[] = [
  { href: "/picking/facturacion", texto: "Facturación", icono: "factura" },
  { href: "/picking/bodega", texto: "Bodega", icono: "bodega" },
  { href: "/picking/ruta", texto: "Ruta", icono: "ruta" },
  { href: "/picking/reportes", texto: "Reportes", icono: "grafica" },
  { href: "/picking/configuracion", texto: "Configuración", icono: "ajustes" },
  { href: "/picking/tablero", texto: "Tablero", icono: "tv" },
];
const MODULOS_PANEL: OpcionNavegacion[] = [
  { href: "/panel", texto: "Resumen", icono: "inicio" },
  { href: "/panel/contenido", texto: "Contenido institucional", icono: "noticia" },
  { href: "/panel/industrias", texto: "Industrias", icono: "fabrica" },
  { href: "/panel/catalogo", texto: "Catálogo", icono: "caja" },
  { href: "/panel/noticias", texto: "Noticias", icono: "imagen" },
  { href: "/panel/contacto", texto: "Información de contacto", icono: "pin" },
  { href: "/panel/solicitudes", texto: "Solicitudes", icono: "bandeja", contador: 3 },
  { href: "/panel/documentos", texto: "Documentación interna", icono: "archivo" },
  { href: "/panel/usuarios", texto: "Usuarios del sitio", icono: "usuarios" },
];
type ContextoEjemplo = {
  modulo: string;
  cambiarModulo: (m: string) => void;
  sedes: string[];
  cambiarSedes: (s: string[]) => void;
};
const Contexto = createContext<ContextoEjemplo | null>(null);

// Datos fijos y controles únicamente para las páginas temporales de JG-05.
// JG-07 reemplaza este adaptador: Armazon no obtiene sesiones ni concede permisos.
export function ArmazonEjemplo({ sistema, children }: { sistema: "sitio" | "picking"; children: ReactNode }) {
  const ruta = usePathname();
  const [modulo, cambiarModulo] = useState("facturacion");
  const [sedes, cambiarSedes] = useState(["XE", "GT", "ES"]);
  const [sede, cambiarSede] = useState("XE");
  const temporal = ruta === "/panel" || ruta === "/picking";
  const moduloActual = temporal ? modulo : (ruta.split("/")[2] ?? "");
  const opciones = sistema === "sitio" ? MODULOS_PANEL : MODULOS_PICKING;
  const seleccionada = opciones.find((o) => o.href === (sistema === "sitio" ? ruta : `/picking/${moduloActual}`));
  return (
    <Contexto.Provider value={{ modulo, cambiarModulo, sedes, cambiarSedes }}>
      <Armazon
        sistema={sistema}
        modulo={moduloActual}
        nombreModulo={seleccionada?.texto ?? ""}
        opciones={opciones.map((o) => ({ ...o, activa: seleccionada?.href === o.href }))}
        usuario={{
          nombre: "Usuario de ejemplo 01",
          rol: "Gerencia",
          sede: sistema === "sitio" ? "Sitio web" : "Todas las sedes",
        }}
        sedes={SEDES_EJEMPLO.filter((s) => sedes.includes(s.id))}
        sede={sede}
        alCambiarSede={cambiarSede}
        alSalir={async () => {
          await salir(sistema);
        }}
      >
        {children}
      </Armazon>
    </Contexto.Provider>
  );
}

export function useArmazonEjemplo() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("La muestra necesita ArmazonEjemplo");
  return contexto;
}
