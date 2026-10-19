import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SesionActual } from "@/lib/sesion";
import { comprobarRechazosDeAccion } from "../../../pruebas/permisos";

const estado = vi.hoisted(() => ({ sesion: null as SesionActual | null }));

vi.mock("@/lib/sesion", () => ({
  obtenerSesion: async () => estado.sesion,
}));

import { eliminarCamionAccion, guardarCamionAccion, listarCamionesAccion } from "./acciones";

const sesion: SesionActual = {
  sistema: "picking",
  usuario: { id: "u-bodega", usuario: "ejemplo.05", nombre: "Usuario Bodega", rol: "Bodega" },
  permisos: ["pk.cfg.camiones"],
  sedes: [{ id: 1, nombre: "Quetzaltenango", prefijoOdoo: "XE" }],
};

describe("Camiones", () => {
  beforeEach(() => {
    estado.sesion = sesion;
  });

  comprobarRechazosDeAccion({
    accion: guardarCamionAccion,
    establecerSesion: (s) => {
      estado.sesion = s;
    },
    sesion,
    permiso: "pk.cfg.camiones",
    entrada: { identificacion: "Camión", capacidad: "1000", sedeId: 1 },
    entradaOtraSede: { identificacion: "Camión", capacidad: "1000", sedeId: 2 },
  });

  it.each(["sin sesión", "sin permiso"])("RNF-04: eliminar un camión rechaza %s", async (caso) => {
    estado.sesion = caso === "sin sesión" ? null : { ...sesion, permisos: [] };
    expect(await eliminarCamionAccion({ id: 1 })).toEqual({
      ok: false,
      error: "No tiene permisos para acceder a este módulo.",
    });
  });

  it("RNF-04: listar camiones sin permiso se rechaza", async () => {
    estado.sesion = { ...sesion, permisos: [] };
    expect(await listarCamionesAccion()).toEqual({
      ok: false,
      error: "No tiene permisos para acceder a este módulo.",
    });
  });
});
