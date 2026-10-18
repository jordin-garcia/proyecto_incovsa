"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Armazon, type OpcionNavegacion, type SedeArmazon } from "./Armazon";
import { salir } from "@/app/acceso/acciones";
import { cambiarSede } from "@/modulos/permisos/acciones";
import { useCambiosDeSede } from "@/modulos/tiempo-real/cliente";
import { useMensajes } from "../Mensajes";

export function ArmazonConSesion({
  sistema,
  usuario,
  sedes,
  sede,
  opciones,
  catalogo,
  children,
}: {
  sistema: "sitio" | "picking";
  usuario: { nombre: string; rol: string; sede: string };
  sedes: SedeArmazon[];
  sede: number | null;
  opciones: OpcionNavegacion[];
  catalogo: OpcionNavegacion[];
  children: ReactNode;
}) {
  const ruta = usePathname();
  const mensaje = useMensajes();
  const modulo = ruta.split("/")[2] ?? "";
  const actual = catalogo.find((o) => o.href === `/${sistema === "sitio" ? "panel" : "picking"}/${modulo}`);
  useCambiosDeSede(sistema === "picking" ? sede : null);
  return (
    <Armazon
      sistema={sistema}
      modulo={modulo}
      nombreModulo={actual?.texto ?? ""}
      usuario={usuario}
      sedes={sedes}
      sede={sede === null ? undefined : String(sede)}
      opciones={opciones.map((o) => ({ ...o, activa: o.href === actual?.href }))}
      alSalir={async () => {
        await salir(sistema);
      }}
      alCambiarSede={async (valor) => {
        const resultado = await cambiarSede({ sede: Number(valor), modulo });
        if (!resultado.ok) mensaje(resultado.error, "error");
      }}
    >
      {children}
    </Armazon>
  );
}
