"use server";

import { obtenerSesion, type SesionActual } from "@/lib/sesion";
import { esAccesoTotal } from "@/lib/roles";
import { ErrorNegocio, MENSAJE_ERROR_GENERAL, aResultadoDeError } from "@/lib/errores";
import { ErrorAcceso, exigirPermiso } from "@/modulos/permisos/servicio";
import {
  esquemaCrearUsuarioPicking,
  esquemaCrearUsuarioSitio,
  esquemaEditarUsuarioPicking,
  esquemaEditarUsuarioSitio,
  esquemaEliminarUsuario,
  esquemaRestablecerClave,
} from "./esquemas";
import { crearUsuario, editarUsuario, eliminarUsuario, restablecerClave, type ContextoUsuario } from "./servicio";
import type { SistemaPestana } from "./tipos";

function leer<T>(
  esquema: {
    safeParse: (
      entrada: unknown,
    ) => { success: true; data: T } | { success: false; error: { issues: { message: string }[] } };
  },
  entrada: unknown,
): T {
  const resultado = esquema.safeParse(entrada);
  if (!resultado.success) throw new ErrorNegocio(resultado.error.issues[0]?.message ?? MENSAJE_ERROR_GENERAL);
  return resultado.data;
}

async function sesionAdmin(sistema: SistemaPestana) {
  const sesion = await obtenerSesion(sistema);
  if (!sesion || sesion.sistema !== sistema || !esAccesoTotal(sesion.usuario.rol)) throw new ErrorAcceso();
  return sesion;
}

function contexto(sesion: SesionActual, sistema: SistemaPestana): ContextoUsuario {
  return { actorId: sesion.usuario.id, actorRol: sesion.usuario.rol, sistema };
}

async function guardar<T>(sistema: SistemaPestana, trabajo: (sesion: SesionActual) => Promise<T>) {
  try {
    const sesion = await sesionAdmin(sistema);
    return { ok: true as const, datos: await trabajo(sesion) };
  } catch (error) {
    return aResultadoDeError(error);
  }
}

export async function crearUsuarioAccion(entrada: unknown) {
  return guardar("picking", (sesion) => {
    exigirPermiso(sesion, "pk.cfg.camiones");
    return crearUsuario(leer(esquemaCrearUsuarioPicking, entrada), contexto(sesion, "picking"));
  });
}

export async function editarUsuarioAccion(entrada: unknown) {
  return guardar("picking", (sesion) => {
    exigirPermiso(sesion, "pk.cfg.camiones");
    return editarUsuario(leer(esquemaEditarUsuarioPicking, entrada), contexto(sesion, "picking"));
  });
}

export async function eliminarUsuarioAccion(entrada: unknown) {
  return guardar("picking", (sesion) => {
    exigirPermiso(sesion, "pk.cfg.camiones");
    return eliminarUsuario(leer(esquemaEliminarUsuario, entrada), contexto(sesion, "picking"));
  });
}

export async function restablecerClaveAccion(entrada: unknown) {
  return guardar("picking", (sesion) => {
    exigirPermiso(sesion, "pk.cfg.camiones");
    return restablecerClave(leer(esquemaRestablecerClave, entrada), contexto(sesion, "picking"));
  });
}

export async function crearUsuarioSitioAccion(entrada: unknown) {
  return guardar("sitio", (sesion) => {
    exigirPermiso(sesion, "sit.contenido");
    return crearUsuario(leer(esquemaCrearUsuarioSitio, entrada), contexto(sesion, "sitio"));
  });
}

export async function editarUsuarioSitioAccion(entrada: unknown) {
  return guardar("sitio", (sesion) => {
    exigirPermiso(sesion, "sit.contenido");
    return editarUsuario(leer(esquemaEditarUsuarioSitio, entrada), contexto(sesion, "sitio"));
  });
}

export async function eliminarUsuarioSitioAccion(entrada: unknown) {
  return guardar("sitio", (sesion) => {
    exigirPermiso(sesion, "sit.contenido");
    return eliminarUsuario(leer(esquemaEliminarUsuario, entrada), contexto(sesion, "sitio"));
  });
}

export async function restablecerClaveSitioAccion(entrada: unknown) {
  return guardar("sitio", (sesion) => {
    exigirPermiso(sesion, "sit.contenido");
    return restablecerClave(leer(esquemaRestablecerClave, entrada), contexto(sesion, "sitio"));
  });
}
