import { z } from "zod";
import { obtenerSesion } from "@/lib/sesion";
import { aResultadoDeError, MENSAJE_ERROR_GENERAL } from "@/lib/errores";
import { registrarEnServidor } from "@/lib/registro";
import { ErrorAcceso, exigirPermiso } from "@/modulos/permisos/servicio";
import { obtenerSedeDeTrabajo } from "@/modulos/permisos/sede";
import { consultarDespacho, consultarOperaciones, consultarRutas } from "@/modulos/reportes/servicio";
import { esquemaFiltro, resolverPeriodo } from "@/modulos/reportes/periodo";
import {
  crearExcel,
  crearPdf,
  nombreArchivo,
  type DatosExportacion,
  type PestanaReporte,
} from "@/modulos/reportes/exportacion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const esquemaExportacion = esquemaFiltro.extend({
  pestana: z.enum(["despacho", "rutas", "bitacora"]),
  formato: z.enum(["xlsx", "pdf"]),
});

function cabecerasDeArchivo(archivo: Buffer, nombre: string, tipo: "xlsx" | "pdf") {
  return {
    "Content-Type":
      tipo === "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "application/pdf",
    "Content-Disposition": `attachment; filename="${nombre}"`,
    "Content-Length": String(archivo.byteLength),
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  };
}

export async function GET(request: Request) {
  try {
    const consulta = new URL(request.url).searchParams;
    const entrada = esquemaExportacion.parse(Object.fromEntries(consulta));
    const sesion = await obtenerSesion("picking", request.headers);
    exigirPermiso(sesion, "pk.reportes");
    const sede = await obtenerSedeDeTrabajo(sesion);
    if (!sede) throw new ErrorAcceso();
    exigirPermiso(sesion, "pk.reportes", sede.id);

    const periodo = resolverPeriodo(entrada);
    const datos: DatosExportacion = {
      pestana: entrada.pestana as PestanaReporte,
      sedeNombre: sede.nombre,
      periodo,
    };
    if (entrada.pestana === "despacho") datos.despacho = await consultarDespacho(sesion, sede.id, periodo.filtro);
    if (entrada.pestana === "rutas") datos.rutas = await consultarRutas(sesion, sede.id, periodo.filtro);
    if (entrada.pestana === "bitacora") datos.operaciones = await consultarOperaciones(sesion, sede.id, periodo.filtro);

    const archivo = entrada.formato === "xlsx" ? crearExcel(datos) : await crearPdf(datos);
    return new Response(new Uint8Array(archivo), {
      headers: cabecerasDeArchivo(archivo, nombreArchivo(datos, entrada.formato), entrada.formato),
    });
  } catch (error) {
    const estado = error instanceof ErrorAcceso ? 403 : error instanceof z.ZodError ? 400 : 500;
    // V16.3.3 (JG-26): la pantalla nunca arma una consulta inválida; se registra la operación, no lo recibido.
    if (error instanceof z.ZodError)
      registrarEnServidor("aviso", "entrada_rechazada", { operacion: "reportes.exportar" });
    const resultado =
      error instanceof z.ZodError ? { ok: false, error: MENSAJE_ERROR_GENERAL } : aResultadoDeError(error);
    return Response.json(resultado, {
      status: estado,
      headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
    });
  }
}
