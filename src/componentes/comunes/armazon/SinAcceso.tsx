import Link from "next/link";
import { Icono } from "../iconos";
import { Button } from "@/componentes/ui/button";
export function SinAcceso({ texto, destino }: { texto: string; destino?: string }) {
  return (
    <div className="tarjeta sin-acceso">
      <Icono nombre="candado" className="ico-l" />
      <h2>Sin acceso a este módulo</h2>
      <p className="muted">{texto}</p>
      {destino && (
        <Button asChild>
          <Link href={destino}>Ir a mi módulo</Link>
        </Button>
      )}
    </div>
  );
}
