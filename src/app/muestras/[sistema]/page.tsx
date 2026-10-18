import { notFound } from "next/navigation";
import { ArmazonEjemplo } from "@/componentes/comunes/armazon/ArmazonEjemplo";
import { MuestraComponentes } from "@/componentes/comunes/MuestraComponentes";
export default async function Muestras({ params }: { params: Promise<{ sistema: string }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { sistema } = await params;
  if (sistema !== "panel" && sistema !== "picking") notFound();
  const nombre = sistema === "panel" ? "sitio" : "picking";
  return (
    <ArmazonEjemplo sistema={nombre}>
      <MuestraComponentes sistema={nombre} />
    </ArmazonEjemplo>
  );
}
