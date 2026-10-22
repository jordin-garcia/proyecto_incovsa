import type { Prisma } from "@/generated/prisma/client";
import { ErrorNegocio } from "@/lib/errores";
import type { EstadoPedidos } from "./esquemas";

export const AVISO_CONFLICTO =
  "Otro facturador modificó estos pedidos. La pantalla se actualizará; revisa los cambios e inténtalo de nuevo";

export async function bloquearSede(tx: Prisma.TransactionClient, sedeId: number) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`facturacion:sede:${sedeId}`}, 0))`;
}

/** Se ejecuta bajo el bloqueo de la sede, antes de escribir o registrar bitácora. */
export function exigirEstadoPedidos(
  actuales: { id: number; posicion: number; actualizadoEn: Date }[],
  esperado: EstadoPedidos,
) {
  if (
    actuales.length !== esperado.length ||
    actuales.some((p, i) => {
      const anterior = esperado[i];
      return (
        !anterior ||
        p.id !== anterior.id ||
        p.posicion !== anterior.posicion ||
        p.actualizadoEn.toISOString() !== anterior.actualizadoEn
      );
    })
  )
    throw new ErrorNegocio(AVISO_CONFLICTO);
}
