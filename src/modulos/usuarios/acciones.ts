"use server";

import { obtenerSesion, type SesionActual } from "@/lib/sesion";
import { ErrorNegocio, MENSAJE_ERROR_GENERAL, aResultadoDeError } from "@/lib/errores";
import { registrarEnServidor } from "@/lib/registro";
import { exigirAccesoTotal } from "@/modulos/permisos/servicio";
import { avisarCambio } from "@/modulos/tiempo-real/servidor";
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

// Solo Gerencia y Soporte administran usuarios (specs/03): cada acción exige el acceso total con
// `exigirAccesoTotal`, no un permiso de otro módulo. Semgrep lo comprueba (`.semgrep/README.md`).

function leer<T>(
  esquema: {
    safeParse: (
      entrada: unknown,
    ) => { success: true; data: T } | { success: false; error: { issues: { message: string; path: PropertyKey[] }[] } };
  },
  entrada: unknown,
): T {
  const resultado = esquema.safeParse(entrada);
  if (!resultado.success) {
    // V16.3.3 (JG-26): la pantalla ya valida lo mismo; un rechazo aquí queda en el registro del servidor.
    registrarEnServidor("aviso", "entrada_rechazada", {
      campos: resultado.error.issues.map((problema) => problema.path.map(String).join(".")),
    });
    throw new ErrorNegocio(resultado.error.issues[0]?.message ?? MENSAJE_ERROR_GENERAL);
  }
  return resultado.data;
}

function contexto(sesion: SesionActual, sistema: SistemaPestana): ContextoUsuario {
  return { actorId: sesion.usuario.id, actorRol: sesion.usuario.rol, sistema };
}

async function guardar<T>(sistema: SistemaPestana, trabajo: (sesion: SesionActual | null) => Promise<T>) {
  try {
    return { ok: true as const, datos: await trabajo(await obtenerSesion(sistema)) };
  } catch (error) {
    return aResultadoDeError(error);
  }
}

/** Facturación de cada sede donde el piloto estaba elegido se actualiza en tiempo real. */
async function eliminarYAvisar(entrada: unknown, contextoUsuario: ContextoUsuario) {
  const resultado = await eliminarUsuario(leer(esquemaEliminarUsuario, entrada), contextoUsuario);
  for (const sede of resultado.sedesConCambios) avisarCambio(sede);
  return { id: resultado.id };
}

export async function crearUsuarioAccion(entrada: unknown) {
  return guardar("picking", (sesion) => {
    exigirAccesoTotal(sesion, "picking");
    return crearUsuario(leer(esquemaCrearUsuarioPicking, entrada), contexto(sesion, "picking"));
  });
}

export async function editarUsuarioAccion(entrada: unknown) {
  return guardar("picking", (sesion) => {
    exigirAccesoTotal(sesion, "picking");
    return editarUsuario(leer(esquemaEditarUsuarioPicking, entrada), contexto(sesion, "picking"));
  });
}

export async function eliminarUsuarioAccion(entrada: unknown) {
  return guardar("picking", (sesion) => {
    exigirAccesoTotal(sesion, "picking");
    return eliminarYAvisar(entrada, contexto(sesion, "picking"));
  });
}

export async function restablecerClaveAccion(entrada: unknown) {
  return guardar("picking", (sesion) => {
    exigirAccesoTotal(sesion, "picking");
    return restablecerClave(leer(esquemaRestablecerClave, entrada), contexto(sesion, "picking"));
  });
}

export async function crearUsuarioSitioAccion(entrada: unknown) {
  return guardar("sitio", (sesion) => {
    exigirAccesoTotal(sesion, "sitio");
    return crearUsuario(leer(esquemaCrearUsuarioSitio, entrada), contexto(sesion, "sitio"));
  });
}

export async function editarUsuarioSitioAccion(entrada: unknown) {
  return guardar("sitio", (sesion) => {
    exigirAccesoTotal(sesion, "sitio");
    return editarUsuario(leer(esquemaEditarUsuarioSitio, entrada), contexto(sesion, "sitio"));
  });
}

export async function eliminarUsuarioSitioAccion(entrada: unknown) {
  return guardar("sitio", (sesion) => {
    exigirAccesoTotal(sesion, "sitio");
    return eliminarYAvisar(entrada, contexto(sesion, "sitio"));
  });
}

export async function restablecerClaveSitioAccion(entrada: unknown) {
  return guardar("sitio", (sesion) => {
    exigirAccesoTotal(sesion, "sitio");
    return restablecerClave(leer(esquemaRestablecerClave, entrada), contexto(sesion, "sitio"));
  });
}
