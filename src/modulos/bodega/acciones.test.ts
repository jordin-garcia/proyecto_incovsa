import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SesionActual } from "@/lib/sesion";
import { prisma } from "@/lib/prisma";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { sembrarDemo } from "../../../prisma/semillas/demo";
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
  reordenarColaAccion,
  reordenarLineasAccion,
} from "./acciones";

describe("Módulo de Bodega - Acciones del servidor", () => {
  const sesion: SesionActual = {
    sistema: "picking",
    usuario: { id: "u-bodega", usuario: "ejemplo.05", nombre: "Usuario Bodega", rol: "Bodega" },
    permisos: ["pk.bodega"],
    sedes: [{ id: 1, nombre: "Quetzaltenango", prefijoOdoo: "XE" }],
  };

  /** Envío En Preparación real de la sede 2, que la sesión (sede 1) no puede tocar (auditoría H-23). */
  let otraSede: { envioId: number; lineaId: number; lineaIds: number[] };

  async function crearPedido(sedeId: number, estadoNombre: string, numero: number) {
    const [estadoEnvio, usuario] = await Promise.all([
      prisma.estadoEnvio.findUniqueOrThrow({ where: { nombre: estadoNombre } }),
      prisma.usuario.findFirstOrThrow({ where: { displayUsername: "ejemplo.05" } }),
    ]);
    const envio = await prisma.envio.create({
      data: {
        sedeId,
        tipo: "pedido",
        numero,
        fechaEnvio: new Date("2026-10-18T00:00:00Z"),
        programadoPara: new Date("2026-10-18T13:30:00-06:00"),
        estadoId: estadoEnvio.id,
        enviadoPorId: usuario.id,
        posicionCola: 1,
        lineas: {
          create: [
            { producto: "P1", lote: "L1", pesoConversionKg: 25, cantidadKg: 50, posicion: 1 },
            { producto: "P2", lote: "L2", pesoConversionKg: 25, cantidadKg: 10, posicion: 2 },
          ],
        },
      },
      include: { lineas: { orderBy: { posicion: "asc" } } },
    });
    return { envioId: envio.id, lineaIds: envio.lineas.map((l) => l.id) };
  }

  beforeEach(async () => {
    await limpiarTablasDeNegocio();
    await sembrarDemo(prisma, { claveDemo: "Demo-12345" });
    const pedidoSede2 = await crearPedido(2, "En Preparación", 1);
    otraSede = { envioId: pedidoSede2.envioId, lineaId: pedidoSede2.lineaIds[0], lineaIds: pedidoSede2.lineaIds };
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
      entradaOtraSede: () => ({ envioId: otraSede.envioId, lineaId: otraSede.lineaId, marcado: true }),
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
      entradaOtraSede: () => ({ envioId: otraSede.envioId, marcado: true }),
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
      entradaOtraSede: () => ({ envioId: otraSede.envioId }),
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
      entradaOtraSede: () => ({ envioId: otraSede.envioId }),
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
      entradaOtraSede: () => ({ envioId: otraSede.envioId }),
    });
  });

  describe("reordenarColaAccion", () => {
    comprobarRechazosDeAccion({
      accion: reordenarColaAccion,
      establecerSesion: (s) => {
        estado.sesion = s;
      },
      sesion,
      permiso: "pk.bodega",
      entrada: { envioIds: [1, 2] },
      entradaOtraSede: () => ({ envioIds: [otraSede.envioId] }),
    });
  });

  describe("reordenarLineasAccion", () => {
    comprobarRechazosDeAccion({
      accion: reordenarLineasAccion,
      establecerSesion: (s) => {
        estado.sesion = s;
      },
      sesion,
      permiso: "pk.bodega",
      entrada: { envioId: 1, lineaIds: [10, 20] },
      // Todas las líneas del envío: así solo el filtro por sede puede rechazarlo (revisión de JG-23).
      entradaOtraSede: () => ({ envioId: otraSede.envioId, lineaIds: otraSede.lineaIds }),
    });
  });

  it("RN-17 (auditoría H-23): el envío de la sede 2 existe y sigue sin cambios tras los rechazos", async () => {
    const res = await marcarLineaAccion({ envioId: otraSede.envioId, lineaId: otraSede.lineaId, marcado: true });
    expect(res).toEqual({ ok: false, error: "No tiene permisos para acceder a este módulo." });
    const linea = await prisma.lineaPreparacion.findUniqueOrThrow({ where: { id: otraSede.lineaId } });
    expect(linea.marcado).toBe(false);
  });

  it("RF-SL-23 (auditoría H-22): marcar en un pedido de la sede que otra pantalla despachó muestra un mensaje de negocio", async () => {
    const despachado = await crearPedido(1, "Despachado", 2);
    const res = await marcarLineaAccion({
      envioId: despachado.envioId,
      lineaId: despachado.lineaIds[0],
      marcado: true,
    });
    expect(res).toEqual({ ok: false, error: "El pedido ya no está en preparación." });
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

    const res6 = await reordenarColaAccion({ envioIds: [] });
    expect(res6.ok).toBe(false);

    const res7 = await reordenarLineasAccion({ envioId: 1, lineaIds: [] });
    expect(res7.ok).toBe(false);

    const res8 = await reordenarLineasAccion({ envioId: 1, lineaIds: [10, 10] });
    expect(res8.ok).toBe(false);

    const res9 = await reordenarColaAccion({ envioIds: [1, 1] });
    expect(res9.ok).toBe(false);
  });

  it("RNF-05: reordenarLineasAccion rechaza una lista con identificadores repetidos", async () => {
    const res = await reordenarLineasAccion({ envioId: 1, lineaIds: [10, 10] });
    expect(res.ok).toBe(false);
  });

  it("RNF-05: reordenarColaAccion rechaza una lista con identificadores repetidos", async () => {
    const res = await reordenarColaAccion({ envioIds: [1, 1] });
    expect(res.ok).toBe(false);
  });
});
