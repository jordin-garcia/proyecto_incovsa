import { beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import type { SesionActual } from "@/lib/sesion";
import { prisma } from "@/lib/prisma";
import { claveAccesoInterna, correoInterno } from "@/lib/cuentas";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { MENSAJE_CLAVE_CORTA, MENSAJE_CLAVE_DISTINTA, MENSAJE_SEDE } from "./esquemas";

const estado = vi.hoisted(() => ({
  sesion: null as SesionActual | null,
}));

vi.mock("@/lib/sesion", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/sesion")>();
  return { ...real, obtenerSesion: async () => estado.sesion };
});

import {
  crearUsuarioAccion,
  crearUsuarioSitioAccion,
  editarUsuarioAccion,
  editarUsuarioSitioAccion,
  eliminarUsuarioAccion,
  eliminarUsuarioSitioAccion,
  restablecerClaveAccion,
  restablecerClaveSitioAccion,
} from "./acciones";

const MENSAJE_PERMISO = "No tiene permisos para acceder a este módulo.";
const CLAVE = "Clave-accion-1";

describe("acciones de usuarios del picking", () => {
  const facturador: SesionActual = {
    sistema: "picking",
    usuario: { id: "u-facturador", usuario: "facturador", nombre: "Facturador", rol: "Bodega" },
    permisos: ["pk.bodega"],
    sedes: [{ id: 1, nombre: "Quetzaltenango", prefijoOdoo: "XE" }],
  };

  beforeEach(() => {
    estado.sesion = facturador;
  });

  it("criterio 6: sin acceso total el servidor rechaza crear, editar, restablecer y eliminar", async () => {
    const entrada = {
      nombre: "Ana",
      usuario: "ana.accion",
      clave: CLAVE,
      confirmarClave: CLAVE,
      rol: "Bodega",
      correo: "",
      sedesIds: [1],
      permisosCodigos: ["pk.bodega"],
    };
    expect(await crearUsuarioAccion(entrada)).toEqual({ ok: false, error: MENSAJE_PERMISO });
    expect(await editarUsuarioAccion({ ...entrada, id: "x", activo: true })).toEqual({
      ok: false,
      error: MENSAJE_PERMISO,
    });
    expect(await restablecerClaveAccion({ id: "x", clave: CLAVE, confirmarClave: CLAVE })).toEqual({
      ok: false,
      error: MENSAJE_PERMISO,
    });
    expect(await eliminarUsuarioAccion({ id: "x" })).toEqual({ ok: false, error: MENSAJE_PERMISO });
    estado.sesion = null;
    expect(await crearUsuarioAccion(entrada)).toEqual({ ok: false, error: MENSAJE_PERMISO });
  });

  it("RF-SL-48: la acción rechaza la contraseña corta, la distinta y la sede vacía sin escribir la cuenta", async () => {
    estado.sesion = {
      sistema: "picking",
      usuario: { id: "u-gerencia", usuario: "gerencia", nombre: "Gerencia", rol: "Gerencia" },
      permisos: [],
      sedes: [],
    };
    const base = {
      nombre: "Ana",
      usuario: "ana.accion",
      rol: "Bodega",
      correo: "",
      sedesIds: [1],
      permisosCodigos: ["pk.bodega"],
    };
    expect(await crearUsuarioAccion({ ...base, clave: "abc", confirmarClave: "abc" })).toEqual({
      ok: false,
      error: MENSAJE_CLAVE_CORTA,
    });
    expect(await crearUsuarioAccion({ ...base, clave: CLAVE, confirmarClave: "Otra-clave-1" })).toEqual({
      ok: false,
      error: MENSAJE_CLAVE_DISTINTA,
    });
    expect(await crearUsuarioAccion({ ...base, clave: CLAVE, confirmarClave: CLAVE, sedesIds: [] })).toEqual({
      ok: false,
      error: MENSAJE_SEDE,
    });
    expect(await restablecerClaveAccion({ id: "x", clave: "1234567", confirmarClave: "1234567" })).toEqual({
      ok: false,
      error: MENSAJE_CLAVE_CORTA,
    });
  });

  it("RF-SL-03: Gerencia crea por la acción y la respuesta no lleva la contraseña", async () => {
    await limpiarTablasDeNegocio();
    const id = randomUUID();
    const username = claveAccesoInterna("ambos", "gerencia.accion");
    await prisma.usuario.create({
      data: {
        id,
        name: "Gerencia acción",
        email: correoInterno(username),
        username,
        displayUsername: "gerencia.accion",
        sistema: "ambos",
        rol: "Gerencia",
      },
    });
    const xe = await prisma.sede.findUniqueOrThrow({ where: { prefijoOdoo: "XE" } });
    estado.sesion = {
      sistema: "picking",
      usuario: { id, usuario: "gerencia.accion", nombre: "Gerencia acción", rol: " Gérencia " },
      permisos: [],
      sedes: [],
    };
    const resultado = await crearUsuarioAccion({
      nombre: "Bodega Acción",
      usuario: "Bodega.Accion",
      clave: CLAVE,
      confirmarClave: CLAVE,
      rol: "Bodega",
      correo: "",
      sedesIds: [xe.id],
      permisosCodigos: ["pk.bodega"],
    });
    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;
    expect(resultado.datos).toMatchObject({
      usuario: "bodega.accion",
      sistema: "picking",
      sedesNombres: ["Quetzaltenango"],
      permisosCodigos: ["pk.bodega"],
    });
    expect(JSON.stringify(resultado)).not.toContain(CLAVE);
    expect(
      await prisma.bitacora.findFirst({ where: { operacion: "Creación de usuario", registroId: resultado.datos.id } }),
    ).toMatchObject({
      usuarioId: id,
    });
  });

  it("criterio 4: sin sesión del sitio no se crean, editan, restablecen ni eliminan usuarios del sitio", async () => {
    const entrada = {
      nombre: "Ana",
      usuario: "ana.sitio",
      clave: CLAVE,
      confirmarClave: CLAVE,
      rol: "Operativo",
      correo: "",
      sedesIds: [],
      permisosCodigos: ["sit.doc.ver"],
    };
    estado.sesion = { ...facturador, sistema: "sitio" };
    expect(await crearUsuarioSitioAccion(entrada)).toEqual({ ok: false, error: MENSAJE_PERMISO });
    expect(await editarUsuarioSitioAccion({ ...entrada, id: "x", activo: true })).toEqual({
      ok: false,
      error: MENSAJE_PERMISO,
    });
    expect(await restablecerClaveSitioAccion({ id: "x", clave: CLAVE, confirmarClave: CLAVE })).toEqual({
      ok: false,
      error: MENSAJE_PERMISO,
    });
    expect(await eliminarUsuarioSitioAccion({ id: "x" })).toEqual({ ok: false, error: MENSAJE_PERMISO });

    estado.sesion = {
      sistema: "picking",
      usuario: { id: "u-gerencia", usuario: "gerencia", nombre: "Gerencia", rol: "Gerencia" },
      permisos: [],
      sedes: [],
    };
    expect(await crearUsuarioSitioAccion(entrada)).toEqual({ ok: false, error: MENSAJE_PERMISO });
  });

  it("RF-SW-13: Gerencia crea por la acción del sitio y la respuesta no lleva la contraseña", async () => {
    await limpiarTablasDeNegocio();
    const id = randomUUID();
    const username = claveAccesoInterna("ambos", "gerencia.sitio");
    await prisma.usuario.create({
      data: {
        id,
        name: "Gerencia sitio",
        email: correoInterno(username),
        username,
        displayUsername: "gerencia.sitio",
        sistema: "ambos",
        rol: "Gerencia",
      },
    });
    estado.sesion = {
      sistema: "sitio",
      usuario: { id, usuario: "gerencia.sitio", nombre: "Gerencia sitio", rol: "Gerencia" },
      permisos: [],
      sedes: [],
    };
    const resultado = await crearUsuarioSitioAccion({
      nombre: "Lector Acción",
      usuario: "Lector.Accion",
      clave: CLAVE,
      confirmarClave: CLAVE,
      rol: "Operativo",
      correo: "",
      sedesIds: [],
      permisosCodigos: ["sit.doc.ver"],
    });
    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;
    expect(resultado.datos).toMatchObject({
      usuario: "lector.accion",
      sistema: "sitio",
      sedesIds: [],
      permisosCodigos: ["sit.doc.ver"],
    });
    expect(JSON.stringify(resultado)).not.toContain(CLAVE);
  });
});
