import type { ReactNode } from "react";
import { ArmazonEjemplo } from "@/componentes/comunes/armazon/ArmazonEjemplo";

export default function PickingLayout({ children }: { children: ReactNode }) {
  return <ArmazonEjemplo sistema="picking">{children}</ArmazonEjemplo>;
}
