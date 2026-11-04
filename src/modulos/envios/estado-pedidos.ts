import type { EstadoPedidos } from "./esquemas";

export function estadoDePedidos(pedidos: EstadoPedidos): EstadoPedidos {
  return pedidos.map(({ id, posicion, actualizadoEn }) => ({ id, posicion, actualizadoEn }));
}
