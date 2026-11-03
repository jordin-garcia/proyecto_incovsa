import Link from "next/link";
import { z } from "zod";
import { notFound } from "next/navigation";
import { Icono } from "@/componentes/comunes/iconos";
import { Button } from "@/componentes/ui/button";
import { leerCatalogoSitio } from "@/modulos/contenido/catalogo";
import { leerInicioSitio } from "@/modulos/contenido/servicio";
import { ICONOS_INDUSTRIAS } from "./navegacion";
import { EncabezadoPagina } from "./EncabezadoPagina";
import { Galeria } from "./Galeria";

export async function Industrias({ seleccion = "cuero" }: { seleccion?: string }) {
  const validado = z.enum(ICONOS_INDUSTRIAS).safeParse(seleccion);
  if (!validado.success) notFound();
  const indice = ICONOS_INDUSTRIAS.findIndex((i) => i === validado.data);
  const [datos, inicio] = await Promise.all([leerCatalogoSitio(), leerInicioSitio()]);
  const industria = datos.industrias[indice];
  if (!industria) notFound();
  const productos = datos.productos
    .filter((p) => p.industrias.some((i) => i.id === industria.id))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  return (
    <main>
      <EncabezadoPagina
        eyebrow="Industrias atendidas"
        titulo="Nueve industrias, cada una con su propio conjunto de productos"
        texto="Seleccione una industria en la barra de la izquierda para ver su descripción y los productos que INCOVSA distribuye para ese sector."
        imagenes={inicio.portada}
      />
      <section className="sec sec-industrias">
        <div className="wrap ind-lay2">
          {/* JG-28: misma barra que los filtros de Productos (ícono, nombre y número de productos), sin «Todas». */}
          <nav className="filtros" aria-label="Industrias">
            {datos.industrias.map((i, n) => (
              <Link
                key={i.id}
                href={`/industrias/${ICONOS_INDUSTRIAS[n]}`}
                scroll={false}
                className={n === indice ? "on" : ""}
                aria-current={n === indice ? "page" : undefined}
              >
                <span className="filtro-nombre">
                  <Icono nombre={ICONOS_INDUSTRIAS[n]} />
                  {i.nombre}
                </span>
                <small>{datos.productos.filter((p) => p.industrias.some((j) => j.id === i.id)).length}</small>
              </Link>
            ))}
          </nav>
          <article className="tarjeta ind-det" key={industria.id}>
            <div className="top">
              <span className="ind-ic">
                <Icono nombre={ICONOS_INDUSTRIAS[indice]} />
              </span>
              <div>
                <p className="eyebrow">
                  Industria {String(indice + 1).padStart(2, "0")} de {datos.industrias.length}
                </p>
                <h2>{industria.nombre}</h2>
              </div>
              <Button asChild variant="secundario">
                <Link href={`/productos?industria=${ICONOS_INDUSTRIAS[indice]}`}>
                  Ver en el catálogo <Icono nombre="flecha" className="ico-s" />
                </Link>
              </Button>
            </div>
            <p className="desc">{industria.descripcion}</p>
            {!!industria.imagenes.length && (
              <div className="ind-img">
                <Galeria imagenes={industria.imagenes} alt={`Industria ${industria.nombre}`} />
              </div>
            )}
            <h3 className="titulo-lista-productos">Productos para esta industria · {productos.length}</h3>
            <div className="lista-prod">
              {productos.map((p) => (
                <span key={p.id}>{p.nombre}</span>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
