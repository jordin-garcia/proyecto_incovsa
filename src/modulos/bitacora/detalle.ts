import type { Prisma } from "@/generated/prisma/client";
import { formatoKg } from "@/componentes/comunes/formato";

type Registro = {
  detalle: Prisma.JsonValue;
  operacion: string;
  sistema: string;
  usuarioEscrito: string | null;
  usuario: { name: string } | null;
  ip: string | null;
};

/** Presenta también los registros históricos: nunca expone el objeto JSON ni sus campos internos. */
export function detalleLegible(registro: Registro): string {
  const { detalle, operacion, sistema, usuarioEscrito, usuario, ip } = registro;
  if (typeof detalle === "string") return detalle;
  if (detalle && typeof detalle === "object" && !Array.isArray(detalle)) {
    if (typeof detalle.resumen === "string") return detalle.resumen;
    if (Array.isArray(detalle.resumen))
      return [detalle.sede, ...detalle.resumen]
        .filter((valor): valor is string => typeof valor === "string" && !!valor)
        .join(" · ");
    if (operacion === "Eliminación de pedidos facturados" && Array.isArray(detalle.pedidos)) {
      const pedidos = detalle.pedidos.flatMap((pedido) => {
        if (!pedido || typeof pedido !== "object" || Array.isArray(pedido)) return [];
        if (typeof pedido.numero !== "string" || typeof pedido.totalKg !== "string") return [];
        return [
          `${pedido.numero} (${typeof pedido.cliente === "string" && pedido.cliente ? pedido.cliente : "Sin nombre"}, ${formatoKg(pedido.totalKg)})`,
        ];
      });
      return `${typeof detalle.sede === "string" ? detalle.sede : "—"} · ${pedidos.length} pedido(s) facturado(s): ${pedidos.join(", ")}`;
    }
    for (const campo of ["bloque", "industria", "producto", "sede"]) {
      if (typeof detalle[campo] === "string") return detalle[campo];
    }
  }
  const nombreSistema = sistema === "picking" ? "Sistema de picking" : "Sitio web";
  if (operacion === "Inicio de sesión") return `${nombreSistema} · ${usuarioEscrito ?? usuario?.name ?? "—"}`;
  if (operacion === "Intento de acceso fallido") return "Acceso personal · el usuario no existe en ningún sistema";
  if (operacion === "Intento fallido de inicio de sesión") return `${nombreSistema} · contraseña incorrecta`;
  if (operacion === "Bloqueo de usuario") return `${nombreSistema} · Bloqueo de usuario · ${usuarioEscrito ?? "—"}`;
  if (operacion === "Bloqueo de IP") return `Acceso personal · Bloqueo de IP · ${ip ?? "—"}`;
  return "—";
}
