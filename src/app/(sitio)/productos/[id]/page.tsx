import Link from "next/link";
import { notFound } from "next/navigation";
import { Icono } from "@/componentes/comunes/iconos";
import { Button } from "@/componentes/ui/button";
import { Galeria } from "@/componentes/sitio/Galeria";
import { TarjetaProducto } from "@/componentes/sitio/TarjetaProducto";
import { ICONOS_INDUSTRIAS } from "@/componentes/sitio/navegacion";
import { esquemaIdProductoPublico, leerCatalogoSitio, recomendarProductos } from "@/modulos/contenido/catalogo";

async function leerProducto(id: string) {
  const validado = esquemaIdProductoPublico.safeParse(id);
  if (!validado.success) notFound();
  const datos = await leerCatalogoSitio();
  const producto = datos.productos.find((p) => p.id === validado.data);
  if (!producto) notFound();
  return { datos, producto };
}
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return { title: (await leerProducto((await params).id)).producto.nombre };
}
export default async function DetalleProducto({ params }: { params: Promise<{ id: string }> }) {
  const { datos, producto } = await leerProducto((await params).id);
  const rutaIndustria = (id: number) => ICONOS_INDUSTRIAS[datos.industrias.findIndex((i) => i.id === id)];
  const primera = producto.industrias[0];
  return (
    <main>
      <section className="sec sec-detalle">
        <div className="wrap">
          <div className="miga miga-producto">
            <Link href="/productos">Productos</Link> /{" "}
            {primera && (
              <>
                <Link href={`/productos?industria=${rutaIndustria(primera.id)}`}>{primera.nombre}</Link> /{" "}
              </>
            )}
            <span>{producto.nombre}</span>
          </div>
          <div className="det-lay">
            <div className="det-foto" key={producto.id}>
              {producto.imagenes.length ? (
                <Galeria imagenes={producto.imagenes} alt={producto.nombre} />
              ) : (
                <span className="sin-foto">
                  <Icono nombre="imagen" />
                </span>
              )}
            </div>
            <div>
              <p className="eyebrow">Catálogo público</p>
              <h1 className="titulo-producto">{producto.nombre}</h1>
              <div className="etiquetas industrias-producto">
                {producto.industrias.length ? (
                  producto.industrias.map((i) => (
                    <Link key={i.id} className="chip chip-v" href={`/industrias/${rutaIndustria(i.id)}`}>
                      {i.nombre}
                    </Link>
                  ))
                ) : (
                  <span className="chip chip-a">Industria por confirmar</span>
                )}
              </div>
              <dl className="fichas">
                {[
                  ["Descripción", producto.descripcion],
                  ["Presentación", producto.presentacion],
                  ["Países de origen", producto.paisesOrigen],
                ].map(([nombre, valor], indice) => (
                  <div key={nombre} className={indice === 0 ? "descripcion-producto" : ""}>
                    <dt>{nombre}</dt>
                    <dd>{valor || "Por confirmar"}</dd>
                  </div>
                ))}
              </dl>
              <div className="aviso aviso-v aviso-producto">
                <Icono nombre="info" />
                <div>
                  El precio y el número de lote no se publican en el sitio. Para cotizaciones, comuníquese con la sede
                  que le corresponde. Los productos químicos tienen restricciones de venta: un asesor verificará el uso
                  previsto.
                </div>
              </div>
              <div className="acciones-producto">
                <Button asChild size="grande">
                  <Link href="/contacto">
                    Solicitar información <Icono nombre="flecha" />
                  </Link>
                </Button>
                <Button asChild variant="secundario" size="grande">
                  <Link href="/productos">Volver al catálogo</Link>
                </Button>
              </div>
            </div>
          </div>
          <section className="recomendados" aria-labelledby="titulo-recomendados">
            <div className="cab-sec">
              <div>
                <p className="eyebrow">Recomendados</p>
                <h2 id="titulo-recomendados">Productos Recomendados</h2>
              </div>
            </div>
            <div className="prod-rejilla">
              {recomendarProductos(producto, datos.productos).map((p) => (
                <TarjetaProducto key={p.id} producto={p} />
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
