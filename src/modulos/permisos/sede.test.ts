import { expect, it, vi } from "vitest";
import type { SesionActual } from "@/lib/sesion";
const estado = vi.hoisted(() => ({ valor: "2" }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => ({ value: estado.valor }) }) }));
import { obtenerSedeDeTrabajo } from "./sede";

it("RN-17: obtenerSedeDeTrabajo revalida la cookie en cada petición y después de revocar una sede", async () => {
  const sesion: SesionActual = {
    sistema: "picking",
    usuario: { id: "p", nombre: "Prueba", usuario: "p", rol: "Facturador" },
    permisos: ["pk.facturacion"],
    sedes: [
      { id: 1, nombre: "Quetzaltenango", prefijoOdoo: "XE" },
      { id: 2, nombre: "Guatemala", prefijoOdoo: "GT" },
    ],
  };
  expect((await obtenerSedeDeTrabajo(sesion))?.id).toBe(2);
  sesion.sedes.pop();
  expect((await obtenerSedeDeTrabajo(sesion))?.id).toBe(1);
  estado.valor = "no-valida";
  expect((await obtenerSedeDeTrabajo(sesion))?.id).toBe(1);
  expect(await obtenerSedeDeTrabajo(null)).toBeNull();
});
