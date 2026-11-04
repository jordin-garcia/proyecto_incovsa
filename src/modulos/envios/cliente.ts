/** RN-49: la misma identidad en Facturación, Bodega y las entregas de Ruta. */
export function claveCliente({ cliente, sector }: { cliente: string; sector: string }): string {
  const normalizar = (texto: string) =>
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  return `n:${normalizar(cliente || "Sin nombre")}|${normalizar(sector || "Sin sector")}`;
}
