"use server";

import { obtenerSesion, type SesionActual } from "@/lib/sesion";
import { exigirPermiso, sedesDelUsuario } from "@/modulos/permisos/servicio";
import { avisarCambio } from "@/modulos/tiempo-real/servidor";
import { ErrorNegocio, MENSAJE_ERROR_GENERAL, aResultadoDeError } from "@/lib/errores";
import { esquemaCamion, esquemaEditarCamion, esquemaEliminarCamion } from "./esquemas";
import { crearCamion, editarCamion, eliminarCamion } from "./servicio";

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

async function contexto(sesion: SesionActual) {
  const sedes = await sedesDelUsuario(sesion);
  return { usuarioId: sesion.usuario.id, sedesIds: sedes.map((sede) => sede.id) };
}

export async function crearCamionAccion(entrada: unknown) {
  try {
    const sesion = await obtenerSesion("picking");
    exigirPermiso(sesion, "pk.cfg.camiones");
    const datos = leer(esquemaCamion, entrada);
    exigirPermiso(sesion, "pk.cfg.camiones", datos.sedeId);
    const resultado = await crearCamion(datos, await contexto(sesion));
    avisarCambio(resultado.sedeId);
    return { ok: true as const, datos: resultado };
  } catch (error) {
    return aResultadoDeError(error);
  }
}

export async function editarCamionAccion(entrada: unknown) {
  try {
    const sesion = await obtenerSesion("picking");
    exigirPermiso(sesion, "pk.cfg.camiones");
    const datos = leer(esquemaEditarCamion, entrada);
    exigirPermiso(sesion, "pk.cfg.camiones", datos.sedeId);
    const resultado = await editarCamion(datos, await contexto(sesion));
    avisarCambio(resultado.sedeId);
    if (resultado.sedeAnteriorId !== resultado.sedeId) avisarCambio(resultado.sedeAnteriorId);
    return {
      ok: true as const,
      datos: {
        id: resultado.id,
        identificacion: resultado.identificacion,
        capacidadKg: resultado.capacidadKg,
        sedeId: resultado.sedeId,
      },
    };
  } catch (error) {
    return aResultadoDeError(error);
  }
}

export async function eliminarCamionAccion(entrada: unknown) {
  try {
    const sesion = await obtenerSesion("picking");
    exigirPermiso(sesion, "pk.cfg.camiones");
    const datos = leer(esquemaEliminarCamion, entrada);
    const resultado = await eliminarCamion(datos, await contexto(sesion));
    avisarCambio(resultado.sedeId);
    return { ok: true as const, datos: { id: resultado.id } };
  } catch (error) {
    return aResultadoDeError(error);
  }
}
