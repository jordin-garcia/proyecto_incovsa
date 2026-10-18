import { PantallaModulo } from "@/componentes/comunes/armazon/PantallaModulo";
export default async function SeccionPanel({ params }: { params: Promise<{ seccion: string[] }> }) {
  return <PantallaModulo sistema="sitio" seccion={(await params).seccion} />;
}
