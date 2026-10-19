export function ResumenPermisos({ accesoTotal, cantidad }: { accesoTotal: boolean; cantidad: number }) {
  if (accesoTotal) return <span className="chip chip-o">Acceso total</span>;
  return <span className={cantidad > 0 ? "chip chip-v" : "chip"}>{cantidad} permiso(s)</span>;
}
