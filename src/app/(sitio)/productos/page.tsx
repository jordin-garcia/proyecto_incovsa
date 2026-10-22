import { z } from "zod";
import { EncabezadoPagina } from "@/componentes/sitio/EncabezadoPagina";
import { CatalogoCliente } from "@/componentes/sitio/CatalogoCliente";
import { ICONOS_INDUSTRIAS } from "@/componentes/sitio/navegacion";
import { leerCatalogoSitio } from "@/modulos/contenido/catalogo";
import { leerInicioSitio } from "@/modulos/contenido/servicio";
export const metadata = { title: "Productos" };
export default async function Productos({
  searchParams,
}: {
  searchParams: Promise<{ industria?: string | string[] }>;
}) {
  const [datos, inicio, consulta] = await Promise.all([leerCatalogoSitio(), leerInicioSitio(), searchParams]);
  const filtro = z.enum(["todas", "sin", ...ICONOS_INDUSTRIAS]).safeParse(consulta.industria ?? "todas");
  const filtroInicial = filtro.success ? filtro.data : "todas";
  return (
    <main>
      <EncabezadoPagina
        eyebrow="Catálogo informativo"
        titulo="Productos, presentación y origen"
        texto="Filtre por industria o busque por nombre. El catálogo es informativo: no se publican precios ni número de lote."
        imagenes={inicio.portada}
      />
      <CatalogoCliente key={filtroInicial} datos={datos} filtroInicial={filtroInicial} />
    </main>
  );
}
