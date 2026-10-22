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
          <nav className="ind-barra" aria-label="Industrias">
            {datos.industrias.map((i, n) => (
              <Link
                key={i.id}
                href={`/industrias/${ICONOS_INDUSTRIAS[n]}`}
                scroll={false}
                className={n === indice ? "on" : ""}
                aria-label={i.nombre}
                aria-current={n === indice ? "page" : undefined}
              >
                <Icono nombre={ICONOS_INDUSTRIAS[n]} />
                <span className="ind-nombre" role="tooltip">
                  {i.nombre}
                </span>
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
            <div className="ind-img">
              {industria.imagenes.length ? (
                <Galeria imagenes={industria.imagenes} alt={`Industria ${industria.nombre}`} />
              ) : (
                <span className="ind-img-vacia">
                  <Icono nombre={ICONOS_INDUSTRIAS[indice]} />
                  <small>Imagen de la industria</small>
                </span>
              )}
            </div>
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
