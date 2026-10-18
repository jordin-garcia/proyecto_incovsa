import type { ReactNode } from "react";
import { ArmazonServidor } from "@/componentes/comunes/armazon/ArmazonServidor";

export default function PickingLayout({ children }: { children: ReactNode }) {
  return <ArmazonServidor sistema="picking">{children}</ArmazonServidor>;
}
