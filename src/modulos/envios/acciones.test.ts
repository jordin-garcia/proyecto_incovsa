import { beforeEach, vi } from "vitest";
import type { SesionActual } from "@/lib/sesion";
import { comprobarRechazosDeAccion } from "../../../pruebas/permisos";

const estado = vi.hoisted(() => ({ sesion: null as SesionActual | null, sedeId: 1 }));
vi.mock("@/lib/sesion", () => ({ obtenerSesion: async () => estado.sesion }));
vi.mock("@/modulos/permisos/sede", () => ({
  obtenerSedeDeTrabajo: async () => ({ id: estado.sedeId, nombre: "Quetzaltenango", prefijoOdoo: "XE" }),
}));
import { cargarArchivo, eliminarPedidosFacturados } from "./acciones";

const sesion: SesionActual = {
  sistema: "picking",
  usuario: { id: "p", usuario: "p", nombre: "Prueba", rol: "Facturador" },
  permisos: ["pk.facturacion"],
  sedes: [{ id: 1, nombre: "Quetzaltenango", prefijoOdoo: "XE" }],
};

function entrada(sedeId: number): FormData {
  const formData = new FormData();
  formData.set("sedeId", String(sedeId));
  formData.set("archivo", new File([new Uint8Array([1])], "prueba.xlsx"));
  return formData;
}

beforeEach(() => {
  estado.sesion = sesion;
  estado.sedeId = 1;
});

comprobarRechazosDeAccion({
  accion: cargarArchivo,
  establecerSesion: (s) => {
    estado.sesion = s;
  },
  sesion,
  permiso: "pk.facturacion",
  entrada: entrada(1),
  entradaOtraSede: entrada(2),
});

comprobarRechazosDeAccion({
  accion: eliminarPedidosFacturados,
  establecerSesion: (s) => {
    estado.sesion = s;
  },
  sesion,
  permiso: "pk.facturacion",
  entrada: { sedeId: 1, ids: [1] },
  entradaOtraSede: { sedeId: 2, ids: [1] },
});
