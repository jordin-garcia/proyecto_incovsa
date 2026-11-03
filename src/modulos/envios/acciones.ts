"use server";

import { aResultadoDeError, ErrorNegocio } from "@/lib/errores";
import { obtenerSesion } from "@/lib/sesion";
import { avisarCambio } from "@/modulos/tiempo-real/servidor";
import { ErrorAcceso, exigirPermiso } from "@/modulos/permisos/servicio";
import { obtenerSedeDeTrabajo } from "@/modulos/permisos/sede";
import { esquemaBodegaOdoo } from "@/modulos/odoo/esquemas";
import { leerArchivoOdoo } from "@/modulos/odoo/servicio";
import { esquemaFormularioCarga, esquemaFormularioEliminar } from "./esquemas";
import { eliminarDelTablero, guardarCargaDeOdoo } from "./servicio";
import { guardarCampoOpcion, moverPedidos, cancelarOpcion, enviarOpcion } from "./opciones";

export async function cargarArchivo(formData: FormData) {
  try {
    const sesion = await obtenerSesion("picking");
    exigirPermiso(sesion, "pk.facturacion");

    const entrada = esquemaFormularioCarga.parse({
      sedeId: formData.get("sedeId"),
      archivo: formData.get("archivo"),
    });
    const sede = await obtenerSedeDeTrabajo(sesion);
    if (!sede || sede.id !== entrada.sedeId) throw new ErrorAcceso();
    exigirPermiso(sesion, "pk.facturacion", sede.id);
    if (!/\.xlsx$/i.test(entrada.archivo.name)) throw new ErrorNegocio("El archivo debe ser .xlsx, exportado de Odoo.");
    if (entrada.archivo.size > 2 * 1024 * 1024) throw new ErrorNegocio("El archivo pesa más de 2 MB. No se cargó.");

    const bodega = esquemaBodegaOdoo.parse(sede.prefijoOdoo);
    const lectura = await leerArchivoOdoo(new Uint8Array(await entrada.archivo.arrayBuffer()), bodega);
    const resumen = await guardarCargaDeOdoo({
      lectura,
      sedeId: sede.id,
      usuarioId: sesion.usuario.id,
      nombreArchivo: entrada.archivo.name,
    });
    avisarCambio(sede.id);
    return { ok: true as const, datos: { ...resumen, noCargados: lectura.noCargados } };
  } catch (error) {
    return aResultadoDeError(error);
  }
}

export async function eliminarPedidosFacturados(entradaSinValidar: unknown) {
  try {
    const sesion = await obtenerSesion("picking");
    exigirPermiso(sesion, "pk.facturacion");

    const entrada = esquemaFormularioEliminar.parse(entradaSinValidar);
    const sede = await obtenerSedeDeTrabajo(sesion);
    if (!sede || sede.id !== entrada.sedeId) throw new ErrorAcceso();
    exigirPermiso(sesion, "pk.facturacion", sede.id);
    const eliminados = await eliminarDelTablero(entrada.ids, {
      sedeId: sede.id,
      usuarioId: sesion.usuario.id,
      estadoEsperado: entrada.estadoEsperado,
    });
    avisarCambio(sede.id);
    return { ok: true as const, datos: { eliminados } };
  } catch (error) {
    return aResultadoDeError(error);
  }
}

async function autorizarOpcion(entradaSinValidar: unknown) {
  const sesion = await obtenerSesion("picking");
  exigirPermiso(sesion, "pk.facturacion");
  const { sedeId } = esquemaFormularioEliminar.pick({ sedeId: true }).parse(entradaSinValidar);
  const sede = await obtenerSedeDeTrabajo(sesion);
  if (!sede || sede.id !== sedeId) throw new ErrorAcceso();
  exigirPermiso(sesion, "pk.facturacion", sede.id);
  return { sesion, sedeId };
}

export async function guardarCampoDeOpcion(entrada: unknown) {
  try {
    const { sesion, sedeId } = await autorizarOpcion(entrada);
    exigirPermiso(sesion, "pk.facturacion", sedeId);
    await guardarCampoOpcion(sesion, entrada);
    avisarCambio(sedeId);
    return { ok: true as const, datos: null };
  } catch (error) {
    return aResultadoDeError(error);
  }
}

export async function moverPedidosFacturados(entrada: unknown) {
  try {
    const { sesion, sedeId } = await autorizarOpcion(entrada);
    exigirPermiso(sesion, "pk.facturacion", sedeId);
    await moverPedidos(sesion, entrada);
    avisarCambio(sedeId);
    return { ok: true as const, datos: null };
  } catch (error) {
    return aResultadoDeError(error);
  }
}

export async function cancelarOpcionDeEnvio(entrada: unknown) {
  try {
    const { sesion, sedeId } = await autorizarOpcion(entrada);
    exigirPermiso(sesion, "pk.facturacion", sedeId);
    const cantidad = await cancelarOpcion(sesion, entrada);
    avisarCambio(sedeId);
    return { ok: true as const, datos: cantidad };
  } catch (error) {
    return aResultadoDeError(error);
  }
}

export async function enviarOpcionABodega(entrada: unknown) {
  try {
    const { sesion, sedeId } = await autorizarOpcion(entrada);
    exigirPermiso(sesion, "pk.facturacion", sedeId);
    const envio = await enviarOpcion(sesion, entrada);
    if (envio) avisarCambio(sedeId);
    return { ok: true as const, datos: envio };
  } catch (error) {
    return aResultadoDeError(error);
  }
}
