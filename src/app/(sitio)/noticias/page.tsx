import { EncabezadoPagina } from "@/componentes/sitio/EncabezadoPagina";
import { Galeria } from "@/componentes/sitio/Galeria";
import { Icono } from "@/componentes/comunes/iconos";
import { leerInicioSitio } from "@/modulos/contenido/servicio";
import { leerNoticiasSitio } from "@/modulos/contenido/noticias";
import { formatoFecha } from "@/lib/fechas";
import "@/componentes/sitio/noticias.css";
export const metadata = { title: "Noticias" };
export default async function Noticias() {
  const [inicio, noticias] = await Promise.all([leerInicioSitio(), leerNoticiasSitio()]);
  return (
    <main>
      <EncabezadoPagina
        eyebrow="Noticias"
        titulo="Novedades de la empresa"
        texto="Nuevos productos, ampliación de bodegas, certificaciones y avisos a clientes."
        imagenes={inicio.portada}
      />
      <section className="sec">
        <div className="wrap">
          {noticias.length ? (
            <div className="not-lista">
              {noticias.map((n) => (
                <article className="tarjeta not-t" key={n.id}>
                  <div className="not-foto">
                    <Galeria imagenes={n.imagenes} alt={n.titulo} />
                  </div>
                  <div className="not-txt">
                    <span className="chip">{formatoFecha(n.fechaPublicacion)}</span>
                    <h3>{n.titulo}</h3>
                    <p className="muted">{n.texto}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="tarjeta vacio noticias-vacio">
              <Icono nombre="noticia" />
              <h4>Todavía no hay noticias publicadas</h4>
              <p>Las noticias se publican desde el panel del sitio, con imágenes, título y texto.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
