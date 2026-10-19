"use server";

import { obtenerSesion } from "@/lib/sesion";
import { exigirPermiso, ErrorAcceso } from "@/modulos/permisos/servicio";
import { obtenerSedeDeTrabajo } from "@/modulos/permisos/sede";
import { avisarCambio } from "@/modulos/tiempo-real/servidor";
import { aResultadoDeError } from "@/lib/errores";
import {
  esquemaMarcarLinea,
  esquemaMarcarTodo,
  esquemaOrdenarPorPeso,
  esquemaDespachar,
  esquemaDetalleEnvio,
} from "./esquemas";
import { marcarLinea, marcarTodasLineas, ordenarLineasPorPeso, despacharEnvio, obtenerDetalleEnvio } from "./servicio";

export async function marcarLineaAccion(entrada: unknown) {
  try {
    const sesion = await obtenerSesion("picking");
    const sede = await obtenerSedeDeTrabajo(sesion);
    exigirPermiso(sesion, "pk.bodega", sede?.id);
    if (!sede) throw new ErrorAcceso();

    const datos = esquemaMarcarLinea.parse(entrada);
    const resultado = await marcarLinea(datos, { usuarioId: sesion.usuario.id, sedeId: sede.id });
    avisarCambio(sede.id);
    return { ok: true as const, datos: resultado };
  } catch (error) {
    return aResultadoDeError(error);
  }
}

export async function marcarTodoAccion(entrada: unknown) {
  try {
    const sesion = await obtenerSesion("picking");
    const sede = await obtenerSedeDeTrabajo(sesion);
    exigirPermiso(sesion, "pk.bodega", sede?.id);
    if (!sede) throw new ErrorAcceso();

    const datos = esquemaMarcarTodo.parse(entrada);
    const resultado = await marcarTodasLineas(datos, { usuarioId: sesion.usuario.id, sedeId: sede.id });
    avisarCambio(sede.id);
    return { ok: true as const, datos: resultado };
  } catch (error) {
    return aResultadoDeError(error);
  }
}

export async function ordenarPorPesoAccion(entrada: unknown) {
  try {
    const sesion = await obtenerSesion("picking");
    const sede = await obtenerSedeDeTrabajo(sesion);
    exigirPermiso(sesion, "pk.bodega", sede?.id);
    if (!sede) throw new ErrorAcceso();

    const datos = esquemaOrdenarPorPeso.parse(entrada);
    const resultado = await ordenarLineasPorPeso(datos, { usuarioId: sesion.usuario.id, sedeId: sede.id });
    avisarCambio(sede.id);
    return { ok: true as const, datos: resultado };
  } catch (error) {
    return aResultadoDeError(error);
  }
}

export async function despacharAccion(entrada: unknown) {
  try {
    const sesion = await obtenerSesion("picking");
    const sede = await obtenerSedeDeTrabajo(sesion);
    exigirPermiso(sesion, "pk.bodega", sede?.id);
    if (!sede) throw new ErrorAcceso();

    const datos = esquemaDespachar.parse(entrada);
    const resultado = await despacharEnvio(datos, { usuarioId: sesion.usuario.id, sedeId: sede.id });
    avisarCambio(sede.id);
    return { ok: true as const, datos: resultado };
  } catch (error) {
    return aResultadoDeError(error);
  }
}

export async function obtenerDetalleEnvioAccion(entrada: unknown) {
  try {
    const sesion = await obtenerSesion("picking");
    const sede = await obtenerSedeDeTrabajo(sesion);
    exigirPermiso(sesion, "pk.bodega", sede?.id);
    if (!sede) throw new ErrorAcceso();

    const datos = esquemaDetalleEnvio.parse(entrada);
    const resultado = await obtenerDetalleEnvio(datos.envioId, sede.id);
    return { ok: true as const, datos: resultado };
  } catch (error) {
    return aResultadoDeError(error);
  }
}
