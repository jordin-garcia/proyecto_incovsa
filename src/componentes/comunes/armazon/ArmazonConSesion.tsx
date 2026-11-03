"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useTransition, type ReactNode } from "react";
import { Armazon, type OpcionNavegacion, type SedeArmazon } from "./Armazon";
import { cerrarSesionDelSistema, recargarAlRestaurar } from "./cerrar-sesion";
import { cambiarSede } from "@/modulos/permisos/acciones";
import { useCambiosDeSede, useConexionEnVivo } from "@/modulos/tiempo-real/cliente";
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
  const sedeSuscrita = sistema === "picking" && !cambiandoSede ? sede : null;
  useCambiosDeSede(sedeSuscrita);
  const enVivo = useConexionEnVivo(sedeSuscrita);
  // V14.3.1: después de cerrar sesión, Atrás no muestra una copia guardada de una página autenticada.
  useEffect(() => {
    window.addEventListener("pageshow", recargarAlRestaurar);
    return () => window.removeEventListener("pageshow", recargarAlRestaurar);
  }, []);
  // El tablero de Bodega es de pantalla completa, sin el armazón (specs/07, JM-05); conserva la suscripción de arriba.
  if (sistema === "picking" && modulo === "tablero") return children;
  return (
    <Armazon
      sistema={sistema}
      modulo={modulo}
      nombreModulo={actual?.texto ?? ""}
      usuario={usuario}
      sedes={sedes}
      sede={sede === null ? undefined : String(sede)}
      cambiandoSede={cambiandoSede}
      enVivo={enVivo}
      opciones={opciones.map((o) => ({ ...o, activa: o.href === actual?.href }))}
      alSalir={async () => {
        await cerrarSesionDelSistema(sistema);
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
