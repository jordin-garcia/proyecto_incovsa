import type { Metadata } from "next";
import { MuestraComponentes } from "@/componentes/comunes/MuestraComponentes";

export const metadata: Metadata = { title: "Facturación" };

// Página temporal: JG-07 conectará los módulos autorizados para la sesión.
export default function Picking() {
  return <MuestraComponentes sistema="picking" />;
}
