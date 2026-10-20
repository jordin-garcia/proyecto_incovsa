import { connection } from "next/server";
import { Cabecera } from "@/componentes/sitio/Cabecera";
import { Pie } from "@/componentes/sitio/Pie";
import { PresentacionDinamica } from "@/componentes/sitio/PresentacionDinamica";
import { leerEstructuraSitio } from "@/modulos/contenido/servicio";
import { fechaGuatemala } from "@/lib/fechas";
import "@/componentes/sitio/sitio.css";

export default async function LayoutSitio({ children }: { children: React.ReactNode }) {
  await connection();
  const datos = await leerEstructuraSitio();
  return (
    <div className="sitio">
      <Cabecera logotipo={datos.logotipo} />
      {children}
      <Pie datos={datos} anio={fechaGuatemala(new Date()).slice(0, 4)} />
      <PresentacionDinamica />
    </div>
  );
}
