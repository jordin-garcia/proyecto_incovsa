import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SesionActual } from "@/lib/sesion";
import { prisma } from "@/lib/prisma";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { comprobarRechazosDeAccion } from "../../../pruebas/permisos";
import { MENSAJE_CAPACIDAD, MENSAJE_DECIMALES, MENSAJE_IDENTIFICACION } from "./esquemas";

const estado = vi.hoisted(() => ({
  sesion: null as SesionActual | null,
}));

vi.mock("@/lib/sesion", () => ({
  obtenerSesion: async () => estado.sesion,
}));

import { crearCamionAccion, editarCamionAccion, eliminarCamionAccion } from "./acciones";

const MENSAJE_PERMISO = "No tiene permisos para acceder a este módulo.";

describe("acciones de camiones", () => {
  const sesion: SesionActual = {
    sistema: "picking",
    usuario: { id: "u-camiones", usuario: "cfg", nombre: "Configuración", rol: "Facturador" },
    permisos: ["pk.cfg.camiones"],
    sedes: [{ id: 1, nombre: "Quetzaltenango", prefijoOdoo: "XE" }],
  };

  beforeEach(() => {
    estado.sesion = sesion;
  });

  describe("crearCamionAccion", () => {
    comprobarRechazosDeAccion({
      accion: crearCamionAccion,
      establecerSesion: (s) => {
        estado.sesion = s;
      },
      sesion,
      permiso: "pk.cfg.camiones",
      entrada: { identificacion: "Camión", capacidadKg: "1000", sedeId: 1 },
      entradaOtraSede: { identificacion: "Camión", capacidadKg: "1000", sedeId: 2 },
    });
  });

  describe("editarCamionAccion", () => {
    comprobarRechazosDeAccion({
      accion: editarCamionAccion,
      establecerSesion: (s) => {
        estado.sesion = s;
      },
      sesion,
      permiso: "pk.cfg.camiones",
      entrada: { id: 1, identificacion: "Camión", capacidadKg: "1000", sedeId: 1 },
      entradaOtraSede: { id: 1, identificacion: "Camión", capacidadKg: "1000", sedeId: 2 },
    });
  });

  describe("eliminarCamionAccion", () => {
    comprobarRechazosDeAccion({
      accion: eliminarCamionAccion,
      establecerSesion: (s) => {
        estado.sesion = s;
      },
      sesion,
      permiso: "pk.cfg.camiones",
      entrada: { id: 2147483646 },
      entradaOtraSede: { id: 2147483647 },
    });
  });

  it("RF-SL-04: rechaza capacidad 0, negativa, no numérica o con más de 3 decimales", async () => {
    for (const capacidadKg of ["0", "-4", "no-es-numero", ""]) {
      const resultado = await crearCamionAccion({ identificacion: "Camión", capacidadKg, sedeId: 1 });
      expect(resultado, capacidadKg).toEqual({ ok: false, error: MENSAJE_CAPACIDAD });
    }
    expect(await crearCamionAccion({ identificacion: "Camión", capacidadKg: "1.2345", sedeId: 1 })).toEqual({
      ok: false,
      error: MENSAJE_DECIMALES,
    });
    expect(await crearCamionAccion({ identificacion: "   ", capacidadKg: "10", sedeId: 1 })).toEqual({
      ok: false,
      error: MENSAJE_IDENTIFICACION,
    });
  });

  it("RN-17: una petición alterada no crea, edita ni elimina camiones de otra sede", async () => {
    await limpiarTablasDeNegocio();
    const xe = await prisma.sede.findUniqueOrThrow({ where: { prefijoOdoo: "XE" } });
    const gt = await prisma.sede.findUniqueOrThrow({ where: { prefijoOdoo: "GT" } });
    const usuario = await prisma.usuario.create({
      data: {
        id: "ce02-accion",
        name: "Usuario de camiones",
        email: "picking.ce02.accion@incovsa.invalid",
        username: "picking.ce02.accion",
        displayUsername: "ce02.accion",
        sistema: "picking",
        rol: "Facturador",
      },
    });
    estado.sesion = {
      sistema: "picking",
      usuario: { id: usuario.id, usuario: "ce02.accion", nombre: usuario.name, rol: "Facturador" },
      permisos: ["pk.cfg.camiones"],
      sedes: [{ id: xe.id, nombre: xe.nombre, prefijoOdoo: "XE" }],
    };
    const ajeno = await prisma.camion.create({
      data: { identificacion: "Camión GT", capacidadKg: "2000", sedeId: gt.id },
    });

    expect(await crearCamionAccion({ identificacion: "Intruso", capacidadKg: "1000", sedeId: gt.id })).toEqual({
      ok: false,
      error: MENSAJE_PERMISO,
    });
    expect(
      await editarCamionAccion({
        id: ajeno.id,
        identificacion: "Hack",
        capacidadKg: "1000",
        sedeId: xe.id,
      }),
    ).toEqual({ ok: false, error: MENSAJE_PERMISO });
    expect(await eliminarCamionAccion({ id: ajeno.id })).toEqual({ ok: false, error: MENSAJE_PERMISO });

    expect(await prisma.camion.count({ where: { identificacion: "Intruso" } })).toBe(0);
    const intacto = await prisma.camion.findUniqueOrThrow({ where: { id: ajeno.id } });
    expect(intacto.identificacion).toBe("Camión GT");
    expect(intacto.eliminadoEn).toBeNull();

    const creado = await crearCamionAccion({
      identificacion: "Camión propio",
      capacidadKg: "3,400",
      sedeId: xe.id,
    });
    expect(creado.ok).toBe(true);
    if (!creado.ok) return;
    expect(creado.datos).toMatchObject({ identificacion: "Camión propio", capacidadKg: "3400.000", sedeId: xe.id });
    expect(
      await prisma.bitacora.findFirst({
        where: { operacion: "Creación de camión", registroId: String(creado.datos.id) },
      }),
    ).toMatchObject({
      usuarioId: usuario.id,
    });
  });

  it("RF-SL-04: Gerencia crea un camión en cualquier sede aunque la sesión no traiga esa sede", async () => {
    await limpiarTablasDeNegocio();
    const gt = await prisma.sede.findUniqueOrThrow({ where: { prefijoOdoo: "GT" } });
    const usuario = await prisma.usuario.create({
      data: {
        id: "ce02-gerencia",
        name: "Gerencia de prueba",
        email: "ambos.ce02.gerencia@incovsa.invalid",
        username: "ambos.ce02.gerencia",
        displayUsername: "ce02.gerencia",
        sistema: "ambos",
        rol: "Gerencia",
      },
    });
    estado.sesion = {
      sistema: "picking",
      usuario: { id: usuario.id, usuario: "ce02.gerencia", nombre: usuario.name, rol: "Gerencia" },
      permisos: [],
      sedes: [],
    };
    const creado = await crearCamionAccion({ identificacion: "Camión GT", capacidadKg: "900", sedeId: gt.id });
    expect(creado.ok).toBe(true);
    if (!creado.ok) return;
    expect(creado.datos.sedeId).toBe(gt.id);
  });
});
