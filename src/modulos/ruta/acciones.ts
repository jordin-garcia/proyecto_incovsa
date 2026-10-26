"use server";

import { obtenerSesion } from "@/lib/sesion";
import { exigirPermiso, tienePermiso, ErrorAcceso } from "@/modulos/permisos/servicio";
import { obtenerSedeDeTrabajo } from "@/modulos/permisos/sede";
import { avisarCambio } from "@/modulos/tiempo-real/servidor";
import { aResultadoDeError } from "@/lib/errores";
import { esquemaReordenarRecorrido, esquemaEntregarRuta } from "./esquemas";
import { reordenarRecorridoRuta, entregarRuta, requiereSoloPropias } from "./servicio";

export async function reordenarRecorridoRutaAccion(entrada: unknown) {
  try {
    const sesion = await obtenerSesion("picking");
    const sede = await obtenerSedeDeTrabajo(sesion);
    const permiso = tienePermiso(sesion, "pk.ruta.todas") ? "pk.ruta.todas" : "pk.ruta.propias";
    exigirPermiso(sesion, permiso, sede?.id);
    if (!sede) throw new ErrorAcceso();

    const datos = esquemaReordenarRecorrido.parse(entrada);
    const resultado = await reordenarRecorridoRuta(datos, {
      usuarioId: sesion.usuario.id,
      rol: sesion.usuario.rol,
      sedeId: sede.id,
      soloPropias: requiereSoloPropias(sesion),
    });
    avisarCambio(sede.id);
    return { ok: true as const, datos: resultado };
  } catch (error) {
    return aResultadoDeError(error);
  }
}

export async function entregarRutaAccion(entrada: unknown) {
  try {
    const sesion = await obtenerSesion("picking");
    const sede = await obtenerSedeDeTrabajo(sesion);
    const permiso = tienePermiso(sesion, "pk.ruta.todas") ? "pk.ruta.todas" : "pk.ruta.propias";
    exigirPermiso(sesion, permiso, sede?.id);
    if (!sede) throw new ErrorAcceso();

    const datos = esquemaEntregarRuta.parse(entrada);
    const resultado = await entregarRuta(datos, {
      usuarioId: sesion.usuario.id,
      rol: sesion.usuario.rol,
      sedeId: sede.id,
      soloPropias: requiereSoloPropias(sesion),
    });
    avisarCambio(sede.id);
    return { ok: true as const, datos: resultado };
  } catch (error) {
    return aResultadoDeError(error);
  }
}
