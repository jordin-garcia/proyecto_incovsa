"use client";
import { usePathname, useRouter } from "next/navigation";
import { useTransition, type ReactNode } from "react";
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
  const router = useRouter();
  const [cambiandoSede, iniciarCambio] = useTransition();
  const mensaje = useMensajes();
  const modulo = ruta.split("/")[2] ?? "";
  const actual = catalogo.find((o) => o.href === `/${sistema === "sitio" ? "panel" : "picking"}/${modulo}`);
  useCambiosDeSede(sistema === "picking" && !cambiandoSede ? sede : null);
  return (
    <Armazon
      sistema={sistema}
      modulo={modulo}
      nombreModulo={actual?.texto ?? ""}
      usuario={usuario}
      sedes={sedes}
      sede={sede === null ? undefined : String(sede)}
      cambiandoSede={cambiandoSede}
      opciones={opciones.map((o) => ({ ...o, activa: o.href === actual?.href }))}
      alSalir={async () => {
        await salir(sistema);
      }}
      alCambiarSede={(valor) => {
        iniciarCambio(async () => {
          const resultado = await cambiarSede({ sede: Number(valor), modulo });
          if (!resultado.ok) mensaje(resultado.error, "error");
          iniciarCambio(() => router.refresh());
        });
      }}
    >
      {children}
    </Armazon>
  );
}
