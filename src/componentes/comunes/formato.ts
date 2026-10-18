/** Formato visual de fmt() del prototipo; nunca se usa para calcular cantidades. */
export function formatoNumero(n: number | string | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(Number(n))) return "—";
  const valor = Number(n);
  const [entero, decimales] = Math.abs(Math.round(valor * 1000) / 1000)
    .toFixed(3)
    .split(".");
  const fraccion = decimales.replace(/0+$/, "");
  return (valor < 0 ? "−" : "") + entero.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (fraccion ? "." + fraccion : "");
}

export function formatoKg(n: number | string | null | undefined): string {
  return formatoNumero(n) + " kg";
}
