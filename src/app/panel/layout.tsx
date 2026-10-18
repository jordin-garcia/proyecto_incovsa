import type { ReactNode } from "react";
import { ArmazonEjemplo } from "@/componentes/comunes/armazon/ArmazonEjemplo";

export default function PanelLayout({ children }: { children: ReactNode }) {
  return <ArmazonEjemplo sistema="sitio">{children}</ArmazonEjemplo>;
}
