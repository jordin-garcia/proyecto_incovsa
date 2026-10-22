import { Industrias } from "@/componentes/sitio/Industrias";
export const metadata = { title: "Industrias" };
export default async function PaginaIndustria({ params }: { params: Promise<{ id: string }> }) {
  return <Industrias seleccion={(await params).id} />;
}
