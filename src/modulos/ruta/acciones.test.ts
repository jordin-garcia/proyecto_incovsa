import { beforeEach, describe, vi } from "vitest";
import type { SesionActual } from "@/lib/sesion";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { comprobarRechazosDeAccion } from "../../../pruebas/permisos";

const estado = vi.hoisted(() => ({
  sesion: null as SesionActual | null,
  cookieSede: "1",
}));

vi.mock("@/lib/sesion", () => ({
  obtenerSesion: async () => estado.sesion,
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (nombre: string) => (nombre === "incovsa-sede" ? { value: estado.cookieSede } : undefined),
    set: vi.fn(),
  }),
}));

import { reordenarRecorridoRutaAccion, entregarRutaAccion } from "./acciones";

describe("Módulo de Ruta - Acciones del servidor (JM-06)", () => {
  const sesionPiloto: SesionActual = {
    sistema: "picking",
    usuario: { id: "u-piloto", usuario: "ejemplo.06", nombre: "Usuario Piloto", rol: "Piloto" },
    permisos: ["pk.ruta.propias"],
    sedes: [{ id: 1, nombre: "Quetzaltenango", prefijoOdoo: "XE" }],
  };

  beforeEach(async () => {
    await limpiarTablasDeNegocio();
    estado.sesion = sesionPiloto;
    estado.cookieSede = "1";
  });

  describe("reordenarRecorridoRutaAccion", () => {
    comprobarRechazosDeAccion({
      accion: reordenarRecorridoRutaAccion,
      establecerSesion: (s) => {
        estado.sesion = s;
      },
      sesion: sesionPiloto,
      permiso: "pk.ruta.propias",
      entrada: { envioId: 1, entregaIds: [10, 11] },
      entradaOtraSede: { envioId: 999999, entregaIds: [10, 11] },
    });
  });

  describe("entregarRutaAccion", () => {
    comprobarRechazosDeAccion({
      accion: entregarRutaAccion,
      establecerSesion: (s) => {
        estado.sesion = s;
      },
      sesion: sesionPiloto,
      permiso: "pk.ruta.propias",
      entrada: { envioId: 1 },
      entradaOtraSede: { envioId: 999999 },
    });
  });
});
