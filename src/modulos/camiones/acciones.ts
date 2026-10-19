"use server";

import { aResultadoDeError } from "@/lib/errores";
import { obtenerSesion } from "@/lib/sesion";
import { exigirPermiso } from "@/modulos/permisos/servicio";
import { eliminarCamion, guardarCamion, listarCamiones } from "./servicio";

async function sesionDeConfiguracion() {
  const sesion = await obtenerSesion("picking");
  exigirPermiso(sesion, "pk.cfg.camiones");
  return sesion;
}

export async function listarCamionesAccion() {
  try {
    return { ok: true as const, datos: await listarCamiones(await sesionDeConfiguracion()) };
  } catch (error) {
    return aResultadoDeError(error);
  }
}

export async function guardarCamionAccion(entrada: unknown) {
  try {
    return { ok: true as const, datos: await guardarCamion(entrada, await sesionDeConfiguracion()) };
  } catch (error) {
    return aResultadoDeError(error);
  }
}

export async function eliminarCamionAccion(entrada: unknown) {
  try {
    return { ok: true as const, datos: await eliminarCamion(entrada, await sesionDeConfiguracion()) };
  } catch (error) {
    return aResultadoDeError(error);
  }
}
