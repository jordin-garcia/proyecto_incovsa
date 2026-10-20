import { beforeEach, vi } from "vitest";
import type { SesionActual } from "@/lib/sesion";
import { comprobarRechazosDeAccion } from "../../../pruebas/permisos";
const estado = vi.hoisted(() => ({ sesion: null as SesionActual | null }));
vi.mock("@/lib/sesion", () => ({ obtenerSesion: async () => estado.sesion }));
vi.mock("@/modulos/permisos/sede", () => ({
  obtenerSedeDeTrabajo: async () => ({ id: 1, nombre: "Quetzaltenango", prefijoOdoo: "XE" }),
}));
import { guardarCampoDeOpcion, moverPedidosFacturados, cancelarOpcionDeEnvio, enviarOpcionABodega } from "./acciones";
const sesion: SesionActual = {
  sistema: "picking",
  usuario: { id: "p", usuario: "p", nombre: "Prueba", rol: "Facturador" },
  permisos: ["pk.facturacion"],
  sedes: [{ id: 1, nombre: "Quetzaltenango", prefijoOdoo: "XE" }],
};
beforeEach(() => {
  estado.sesion = sesion;
});
for (const [accion, datos] of [
  [guardarCampoDeOpcion, { tipo: "camion", campo: "hora", valor: "13:30" }],
  [moverPedidosFacturados, { ids: [1], origen: null, destino: "camion", antesDe: null }],
  [cancelarOpcionDeEnvio, { tipo: "camion" }],
  [enviarOpcionABodega, { tipo: "camion" }],
] as const)
  comprobarRechazosDeAccion({
    accion,
    establecerSesion: (s) => {
      estado.sesion = s;
    },
    sesion,
    permiso: "pk.facturacion",
    entrada: { sedeId: 1, ...datos },
    entradaOtraSede: { sedeId: 2, ...datos },
  });
