import { expect, it } from "vitest";
import type { SesionActual } from "../src/lib/sesion";

/** El adaptador establece la sesión que leerá la acción real (nunca simula Prisma). */
export function comprobarRechazosDeAccion<T>({
  accion,
  establecerSesion,
  sesion,
  permiso,
  entrada,
  entradaOtraSede,
}: {
  accion: (entrada: T) => Promise<unknown>;
  establecerSesion: (sesion: SesionActual | null) => void;
  sesion: SesionActual;
  permiso: string;
  entrada: T;
  /** Una función si la entrada depende de datos creados en `beforeEach` (por ejemplo, un envío real de otra sede). */
  entradaOtraSede: T | (() => T);
}) {
  it.each(["sin sesión", "sin permiso", "otra sede"])(`RNF-04 / RN-17: ${permiso} rechaza %s`, async (caso) => {
    establecerSesion(caso === "sin sesión" ? null : { ...sesion, permisos: caso === "sin permiso" ? [] : [permiso] });
    const otraSede = typeof entradaOtraSede === "function" ? (entradaOtraSede as () => T)() : entradaOtraSede;
    const resultado = await accion(caso === "otra sede" ? otraSede : entrada);
    expect(resultado).toEqual({ ok: false, error: "No tiene permisos para acceder a este módulo." });
  });
}
