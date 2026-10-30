import { expect, it } from "vitest";
import { detalleLegible } from "./detalle";
const base = { sistema: "picking", usuarioEscrito: "ejemplo.03", usuario: null, ip: "192.0.2.9" };
it("RF-SL-36 / H-79: presenta resumen histórico como arreglo", () => {
  expect(
    detalleLegible({
      ...base,
      operacion: "Carga",
      detalle: { sede: "Quetzaltenango", resumen: ["Pedido 1", null, 3, "Pedido 2"] },
    }),
  ).toBe("Quetzaltenango · Pedido 1 · Pedido 2");
});
it("RF-SL-36 / H-79: presenta eliminación histórica sin resumen", () => {
  expect(
    detalleLegible({
      ...base,
      operacion: "Eliminación de pedidos facturados",
      detalle: {
        sede: "Quetzaltenango",
        pedidos: [{ numero: "001", cliente: "Cliente", totalKg: "25" }, { numero: "002", totalKg: "50" }, null, {}],
      },
    }),
  ).toBe("Quetzaltenango · 2 pedido(s) facturado(s): 001 (Cliente, 25 kg), 002 (Sin nombre, 50 kg)");
});
it("RN-39 / H-79: presenta bloqueos históricos con detalle vacío", () => {
  expect(detalleLegible({ ...base, operacion: "Bloqueo de usuario", detalle: {} })).toBe(
    "Sistema de picking · Bloqueo de usuario · ejemplo.03",
  );
  expect(detalleLegible({ ...base, operacion: "Bloqueo de IP", detalle: {} })).toBe(
    "Acceso personal · Bloqueo de IP · 192.0.2.9",
  );
});
