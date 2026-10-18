import type { Metadata } from "next";
import { MuestraComponentes } from "@/componentes/comunes/MuestraComponentes";

export const metadata: Metadata = { title: "Resumen" };

// Página temporal: DM-03 la sustituye por el resumen del panel.
export default function Panel() {
  return <MuestraComponentes sistema="sitio" />;
}
