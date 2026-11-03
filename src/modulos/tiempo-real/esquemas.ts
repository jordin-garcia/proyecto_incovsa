import { z } from "zod";
import { esquemaSedeCookie } from "@/modulos/permisos/esquemas";

export const esquemaSuscripcion = z.object({
  sede: esquemaSedeCookie,
  modulo: z.enum(["facturacion", "bodega", "tablero", "ruta", "reportes", "configuracion"]),
});
