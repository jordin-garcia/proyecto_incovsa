import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SesionActual } from "@/lib/sesion";
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

import {
  marcarLineaAccion,
  marcarTodoAccion,
  ordenarPorPesoAccion,
  despacharAccion,
  obtenerDetalleEnvioAccion,
} from "./acciones";

describe("Módulo de Bodega - Acciones del servidor", () => {
  const sesion: SesionActual = {
    sistema: "picking",
    usuario: { id: "u-bodega", usuario: "ejemplo.05", nombre: "Usuario Bodega", rol: "Bodega" },
    permisos: ["pk.bodega"],
    sedes: [{ id: 1, nombre: "Quetzaltenango", prefijoOdoo: "XE" }],
  };

  beforeEach(() => {
    estado.sesion = sesion;
    estado.cookieSede = "1";
  });

  describe("marcarLineaAccion", () => {
    comprobarRechazosDeAccion({
      accion: marcarLineaAccion,
      establecerSesion: (s) => {
        estado.sesion = s;
      },
      sesion,
      permiso: "pk.bodega",
      entrada: { envioId: 1, lineaId: 10, marcado: true },
      entradaOtraSede: { envioId: 1, lineaId: 10, marcado: true },
    });
  });

  describe("marcarTodoAccion", () => {
    comprobarRechazosDeAccion({
      accion: marcarTodoAccion,
      establecerSesion: (s) => {
        estado.sesion = s;
      },
      sesion,
      permiso: "pk.bodega",
      entrada: { envioId: 1, marcado: true },
      entradaOtraSede: { envioId: 1, marcado: true },
    });
  });

  describe("ordenarPorPesoAccion", () => {
    comprobarRechazosDeAccion({
      accion: ordenarPorPesoAccion,
      establecerSesion: (s) => {
        estado.sesion = s;
      },
      sesion,
      permiso: "pk.bodega",
      entrada: { envioId: 1 },
      entradaOtraSede: { envioId: 1 },
    });
  });

  describe("despacharAccion", () => {
    comprobarRechazosDeAccion({
      accion: despacharAccion,
      establecerSesion: (s) => {
        estado.sesion = s;
      },
      sesion,
      permiso: "pk.bodega",
      entrada: { envioId: 1 },
      entradaOtraSede: { envioId: 1 },
    });
  });

  describe("obtenerDetalleEnvioAccion", () => {
    comprobarRechazosDeAccion({
      accion: obtenerDetalleEnvioAccion,
      establecerSesion: (s) => {
        estado.sesion = s;
      },
      sesion,
      permiso: "pk.bodega",
      entrada: { envioId: 1 },
      entradaOtraSede: { envioId: 1 },
    });
  });

  it("rechaza entradas con formato inválido", async () => {
    const res1 = await marcarLineaAccion({ envioId: -1, lineaId: 1 });
    expect(res1.ok).toBe(false);

    const res2 = await marcarTodoAccion({ envioId: "invalido", marcado: true });
    expect(res2.ok).toBe(false);

    const res3 = await ordenarPorPesoAccion({ envioId: 0 });
    expect(res3.ok).toBe(false);

    const res4 = await despacharAccion({ envioId: null });
    expect(res4.ok).toBe(false);

    const res5 = await obtenerDetalleEnvioAccion({ envioId: "invalido" });
    expect(res5.ok).toBe(false);
  });
});
