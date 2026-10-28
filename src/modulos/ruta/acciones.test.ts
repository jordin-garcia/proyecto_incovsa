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

import { reordenarRecorridoRutaAccion, entregarRutaAccion } from "./acciones";

describe("Módulo de Ruta - Acciones del servidor (JM-06)", () => {
  const sesionPiloto: SesionActual = {
    sistema: "picking",
    usuario: { id: "u-piloto", usuario: "ejemplo.06", nombre: "Usuario Piloto", rol: "Piloto" },
    permisos: ["pk.ruta.propias"],
    sedes: [{ id: 1, nombre: "Quetzaltenango", prefijoOdoo: "XE" }],
  };

  /** Ruta En Ruta real de la sede 2, que la sesión (sede 1) no puede tocar (H-66). */
  let otraSede: { envioId: number; entregaIds: number[] };

  async function crearRutaSede2() {
    const [estadoEnRuta, usuario06, usuario05] = await Promise.all([
      prisma.estadoEnvio.findUniqueOrThrow({ where: { nombre: "En Ruta" } }),
      prisma.usuario.findFirstOrThrow({ where: { displayUsername: "ejemplo.06" } }),
      prisma.usuario.findFirstOrThrow({ where: { displayUsername: "ejemplo.05" } }),
    ]);

    const ruta = await prisma.envio.create({
      data: {
        sedeId: 2,
        tipo: "ruta",
        numero: 901,
        fechaEnvio: new Date("2026-10-26T00:00:00Z"),
        programadoPara: new Date("2026-10-26T15:00:00-06:00"),
        estadoId: estadoEnRuta.id,
        enviadoPorId: usuario05.id,
        pilotoId: usuario06.id,
        camionId: null,
        entregas: {
          create: [
            { cliente: "Cliente Sede 2 A", sector: "Zona 1", totalKg: 100, orden: 1 },
            { cliente: "Cliente Sede 2 B", sector: "Zona 2", totalKg: 200, orden: 2 },
          ],
        },
      },
      include: { entregas: { orderBy: { orden: "asc" } } },
    });
    return { envioId: ruta.id, entregaIds: ruta.entregas.map((e) => e.id) };
  }

  beforeEach(async () => {
    await limpiarTablasDeNegocio();
    await sembrarDemo(prisma, { claveDemo: "Demo-12345" });
    otraSede = await crearRutaSede2();
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
      entradaOtraSede: () => ({ envioId: otraSede.envioId, entregaIds: [...otraSede.entregaIds].reverse() }),
    });

    it("H-66 / RN-17: reordenarRecorridoRutaAccion rechaza una ruta real de otra sede y no altera su recorrido", async () => {
      estado.sesion = sesionPiloto;
      const res = await reordenarRecorridoRutaAccion({
        envioId: otraSede.envioId,
        entregaIds: [...otraSede.entregaIds].reverse(),
      });
      expect(res).toEqual({ ok: false, error: "No tiene permisos para acceder a este módulo." });

      const entregasDb = await prisma.entregaRuta.findMany({
        where: { envioId: otraSede.envioId },
        orderBy: { orden: "asc" },
      });
      expect(entregasDb.map((e) => e.id)).toEqual(otraSede.entregaIds);
      expect(entregasDb.map((e) => e.orden)).toEqual([1, 2]);
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
      entradaOtraSede: () => ({ envioId: otraSede.envioId }),
    });

    it("H-66 / RN-17: entregarRutaAccion rechaza una ruta real de otra sede y no cambia su estado ni crea bitácora", async () => {
      estado.sesion = sesionPiloto;
      const res = await entregarRutaAccion({ envioId: otraSede.envioId });
      expect(res).toEqual({ ok: false, error: "No tiene permisos para acceder a este módulo." });

      const rutaDb = await prisma.envio.findUniqueOrThrow({
        where: { id: otraSede.envioId },
        include: { estado: true },
      });
      expect(rutaDb.estado.nombre).toBe("En Ruta");

      const bitacora = await prisma.bitacora.findMany({
        where: { registroId: String(otraSede.envioId), operacion: "Cierre de ruta" },
      });
      expect(bitacora).toHaveLength(0);
    });
  });
});
