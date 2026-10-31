import { expect, it, vi } from "vitest";
import type { SesionActual } from "@/lib/sesion";
const estado = vi.hoisted(() => ({ valor: "2" as string | undefined }));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => (estado.valor === undefined ? undefined : { value: estado.valor }) }),
}));
import { obtenerSedeDeTrabajo } from "./sede";

const sesionConDosSedes = (): SesionActual => ({
  sistema: "picking",
  usuario: { id: "p", nombre: "Prueba", usuario: "p", rol: "Facturador" },
  permisos: ["pk.facturacion"],
  sedes: [
    { id: 1, nombre: "Quetzaltenango", prefijoOdoo: "XE" },
    { id: 2, nombre: "Guatemala", prefijoOdoo: "GT" },
  ],
});

it("RN-17: obtenerSedeDeTrabajo revalida la cookie en cada petición y después de revocar una sede", async () => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
  estado.valor = "2";
  const sesion = sesionConDosSedes();
  expect((await obtenerSedeDeTrabajo(sesion))?.id).toBe(2);
  sesion.sedes.pop();
  expect((await obtenerSedeDeTrabajo(sesion))?.id).toBe(1);
  estado.valor = "no-valida";
  expect((await obtenerSedeDeTrabajo(sesion))?.id).toBe(1);
  expect(await obtenerSedeDeTrabajo(null)).toBeNull();
  vi.restoreAllMocks();
});

it("ASVS V16.3.3: una cookie con una sede ajena se ignora y queda en el registro del servidor", async () => {
  const registro = vi.spyOn(console, "warn").mockImplementation(() => {});
  const sesion = sesionConDosSedes();
  for (const valor of ["2", undefined]) {
    estado.valor = valor;
    await obtenerSedeDeTrabajo(sesion);
  }
  expect(registro).not.toHaveBeenCalled();
  estado.valor = "3";
  expect((await obtenerSedeDeTrabajo(sesion))?.id).toBe(1);
  expect(JSON.parse(registro.mock.calls[0]![0] as string)).toMatchObject({
    evento: "sede_ignorada",
    sistema: "picking",
    usuarioId: "p",
  });
  vi.restoreAllMocks();
});
