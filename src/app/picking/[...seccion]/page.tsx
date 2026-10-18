import { PantallaModulo } from "@/componentes/comunes/armazon/PantallaModulo";
export default async function ModuloPicking({ params }: { params: Promise<{ seccion: string[] }> }) {
  return <PantallaModulo sistema="picking" seccion={(await params).seccion} />;
}
