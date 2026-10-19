"use server";

import { obtenerSesion, type SesionActual } from "@/lib/sesion";
import { esAccesoTotal } from "@/lib/roles";
import { ErrorNegocio, MENSAJE_ERROR_GENERAL, aResultadoDeError } from "@/lib/errores";
import { ErrorAcceso } from "@/modulos/permisos/servicio";
import {
  esquemaCrearUsuarioPicking,
  esquemaEditarUsuarioPicking,
  esquemaEliminarUsuario,
  esquemaRestablecerClave,
} from "./esquemas";
import { crearUsuario, editarUsuario, eliminarUsuario, restablecerClave, type ContextoUsuario } from "./servicio";

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

async function sesionAdmin() {
  const sesion = await obtenerSesion("picking");
  if (!sesion || !esAccesoTotal(sesion.usuario.rol)) throw new ErrorAcceso();
  return sesion;
}

function contexto(sesion: SesionActual): ContextoUsuario {
  return { actorId: sesion.usuario.id, actorRol: sesion.usuario.rol, sistema: "picking" };
}

export async function crearUsuarioAccion(entrada: unknown) {
  try {
    const sesion = await sesionAdmin();
    const datos = leer(esquemaCrearUsuarioPicking, entrada);
    return { ok: true as const, datos: await crearUsuario(datos, contexto(sesion)) };
  } catch (error) {
    return aResultadoDeError(error);
  }
}

export async function editarUsuarioAccion(entrada: unknown) {
  try {
    const sesion = await sesionAdmin();
    const datos = leer(esquemaEditarUsuarioPicking, entrada);
    return { ok: true as const, datos: await editarUsuario(datos, contexto(sesion)) };
  } catch (error) {
    return aResultadoDeError(error);
  }
}

export async function eliminarUsuarioAccion(entrada: unknown) {
  try {
    const sesion = await sesionAdmin();
    const datos = leer(esquemaEliminarUsuario, entrada);
    return { ok: true as const, datos: await eliminarUsuario(datos, contexto(sesion)) };
  } catch (error) {
    return aResultadoDeError(error);
  }
}

export async function restablecerClaveAccion(entrada: unknown) {
  try {
    const sesion = await sesionAdmin();
    const datos = leer(esquemaRestablecerClave, entrada);
    return { ok: true as const, datos: await restablecerClave(datos, contexto(sesion)) };
  } catch (error) {
    return aResultadoDeError(error);
  }
}
