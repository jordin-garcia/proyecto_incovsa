import type { ReactNode } from "react";
import { ArmazonServidor } from "@/componentes/comunes/armazon/ArmazonServidor";

export const dynamic = "force-dynamic";

export default function PanelLayout({ children }: { children: ReactNode }) {
  return <ArmazonServidor sistema="sitio">{children}</ArmazonServidor>;
}
