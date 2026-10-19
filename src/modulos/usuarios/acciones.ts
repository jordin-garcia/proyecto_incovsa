"use server";

import { obtenerSesion } from "@/lib/sesion";
import { aResultadoDeError } from "@/lib/errores";
import { esAccesoTotal } from "@/lib/roles";
import { ErrorAcceso } from "@/modulos/permisos/servicio";
import type { SistemaAdministrado } from "./esquemas";
import { crearUsuario, editarUsuario, eliminarUsuario, listarUsuarios, restablecerContrasena } from "./servicio";

async function actor(sistema: SistemaAdministrado) {
  const sesion = await obtenerSesion(sistema);
  if (!sesion || !esAccesoTotal(sesion.usuario.rol)) throw new ErrorAcceso();
  return { id: sesion.usuario.id, rol: sesion.usuario.rol, sistema };
}

export async function listarUsuariosAccion(sistema: SistemaAdministrado) {
  try {
    return { ok: true as const, datos: await listarUsuarios(sistema, await actor(sistema)) };
  } catch (error) {
    return aResultadoDeError(error);
  }
}

export async function crearUsuarioAccion(entrada: unknown) {
  try {
    const sistema = sistemaDe(entrada);
    return { ok: true as const, datos: await crearUsuario(entrada, await actor(sistema)) };
  } catch (error) {
    return aResultadoDeError(error);
  }
}

export async function editarUsuarioAccion(entrada: unknown) {
  try {
    const sistema = sistemaDe(entrada);
    return { ok: true as const, datos: await editarUsuario(entrada, await actor(sistema)) };
  } catch (error) {
    return aResultadoDeError(error);
  }
}

export async function restablecerContrasenaAccion(entrada: unknown) {
  try {
    const sistema = sistemaDe(entrada);
    return { ok: true as const, datos: await restablecerContrasena(entrada, await actor(sistema)) };
  } catch (error) {
    return aResultadoDeError(error);
  }
}

export async function eliminarUsuarioAccion(entrada: unknown) {
  try {
    const sistema = sistemaDe(entrada);
    return { ok: true as const, datos: await eliminarUsuario(entrada, await actor(sistema)) };
  } catch (error) {
    return aResultadoDeError(error);
  }
}

function sistemaDe(entrada: unknown): SistemaAdministrado {
  const sistema = entrada && typeof entrada === "object" && "sistema" in entrada ? entrada.sistema : null;
  if (sistema !== "picking" && sistema !== "sitio") throw new ErrorAcceso();
  return sistema;
}
