import { cn } from "@/lib/utils";

export function Medidor({ valor, maximo = 100, etiqueta }: { valor: number; maximo?: number; etiqueta: string }) {
  const porcentaje = maximo > 0 && Number.isFinite(valor) ? Math.max(0, (valor / maximo) * 100) : 0;
  return (
    <div
      className={cn("medidor", porcentaje === 100 && "lleno", porcentaje > 100 && "exceso")}
      role="progressbar"
      aria-label={etiqueta}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.min(100, porcentaje)}
    >
      <i style={{ width: `${Math.min(100, porcentaje)}%` }} />
    </div>
  );
}
