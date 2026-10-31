import { beforeEach, expect, it, vi } from "vitest";
import type { SesionActual } from "@/lib/sesion";
import { comprobarRechazosDeAccion } from "../../../pruebas/permisos";
const estado = vi.hoisted(() => ({ sesion: null as SesionActual | null, set: vi.fn() }));
vi.mock("@/lib/sesion", () => ({ obtenerSesion: async () => estado.sesion }));
vi.mock("next/headers", () => ({ cookies: async () => ({ set: estado.set, get: () => undefined }) }));
import { cambiarSede } from "./acciones";

const sesion: SesionActual = {
  sistema: "picking",
  usuario: { id: "p", usuario: "p", nombre: "Prueba", rol: "Facturador" },
  permisos: ["pk.facturacion"],
  sedes: [{ id: 1, nombre: "Quetzaltenango", prefijoOdoo: "XE" }],
};
beforeEach(() => {
  estado.sesion = sesion;
  estado.set.mockClear();
});
comprobarRechazosDeAccion({
  accion: cambiarSede,
  establecerSesion: (s) => {
    estado.sesion = s;
  },
  sesion,
  permiso: "pk.facturacion",
  entrada: { sede: 1, modulo: "facturacion" },
  entradaOtraSede: { sede: 2, modulo: "facturacion" },
});
it("RN-17 / RNF-04 (R-P01): guarda solo una sede autorizada, en todo el sitio, y valida toda entrada", async () => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
  expect(await cambiarSede({ sede: 1, modulo: "facturacion" })).toEqual({ ok: true, datos: { sede: 1 } });
  // path=/ para que /api/reportes/exportar reciba la sede elegida (R-P01, JG-26).
  expect(estado.set).toHaveBeenCalledWith(
    "incovsa-sede",
    "1",
    expect.objectContaining({ httpOnly: true, sameSite: "lax", path: "/" }),
  );
  estado.set.mockClear();
  for (const entrada of [
    { sede: -1, modulo: "facturacion" },
    { sede: "1", modulo: "facturacion" },
    { sede: 1, modulo: "inexistente" },
  ])
    expect((await cambiarSede(entrada)).ok).toBe(false);
  expect(estado.set).not.toHaveBeenCalled();
});
