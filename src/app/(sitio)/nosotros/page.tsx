import Image from "next/image";
import { Icono } from "@/componentes/comunes/iconos";
import { Galeria } from "@/componentes/sitio/Galeria";
import { MisionVision } from "@/componentes/sitio/MisionVision";
import { LogotiposAlternados } from "@/componentes/sitio/LogotiposAlternados";
import { leerInicioSitio } from "@/modulos/contenido/servicio";
import { leerNosotrosSitio } from "@/modulos/contenido/nosotros";
import "@/componentes/sitio/nosotros.css";

export const metadata = { title: "Quiénes somos" };

export default async function Nosotros() {
  const [inicio, datos] = await Promise.all([leerInicioSitio(), leerNosotrosSitio()]);
  const logos = { logotipo: inicio.logotipo, inquiserca: inicio.logotipoInquiserca };
  return (
    <main className="nosotros">
      <section className="pag-cab pag-cab-logos">
        <div className="foto">
          <Galeria imagenes={inicio.portada} className="gal-fondo" />
        </div>
        <div className="velo" />
        <div className="wrap banner-nos">
          <div>
            <p className="eyebrow">Quiénes somos</p>
            <h1>Más de treinta años abasteciendo de químicos a la industria del país</h1>
            <p>
              INCOVSA, Industria del Cuero Covadonga S. A., se dedica a la compra y venta de productos químicos en
              Guatemala. Atiende nueve industrias y lleva sus productos a clientes de todo el país.
            </p>
          </div>
          <LogotiposAlternados {...logos} />
        </div>
      </section>
      <section className="sec">
        <div className={`wrap historia ${datos.historia.imagenes.length ? "" : "una-col"}`}>
          <div>
            <p className="eyebrow">Nuestra historia</p>
            <h2>De tenería a distribuidor de productos químicos</h2>
            {datos.historia.texto && <p className="historia-texto">{datos.historia.texto}</p>}
          </div>
          {!!datos.historia.imagenes.length && (
            <Galeria imagenes={datos.historia.imagenes} alt="Historia de INCOVSA" className="hist-gal" />
          )}
        </div>
      </section>
      <section className="sec sec-verde">
        <div className="wrap">
          <div className="cab-sec">
            <div>
              <p className="eyebrow">Propósito</p>
              <h2>Misión y visión</h2>
            </div>
          </div>
          <MisionVision mision={inicio.mision} vision={inicio.vision} />
        </div>
      </section>
      <section className="sec">
        <div className="wrap">
          <div className="cab-sec">
            <div>
              <p className="eyebrow">Valores</p>
              <h2>Lo que nos guía</h2>
            </div>
          </div>
          <div className="valores-fila" tabIndex={0} role="region" aria-label="Valores">
            {datos.valores.map((src, indice) =>
              src ? (
                <figure className="valor-t" key={indice}>
                  <Image src={src} alt={`Valor ${indice + 1} de INCOVSA`} width={300} height={400} unoptimized />
                </figure>
              ) : (
                <div className="valor-t vacio-v" key={indice}>
                  <span className="mono">{String(indice + 1).padStart(2, "0")}</span>
                  <p className="muted">Imagen del valor pendiente de INCOVSA</p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>
      <section className="sec sec-verde">
        <div className="wrap">
          <div className="cab-sec">
            <div>
              <p className="eyebrow">A quién servimos</p>
              <h2>Dos mercados, la misma calidad de producto</h2>
            </div>
          </div>
          <div className="mercados">
            <div className="tarjeta mercado">
              <span className="mercado-icono">
                <Icono nombre="fabrica" className="ico-l" />
              </span>
              <h3>Mercado industrial</h3>
              <p className="muted">
                Empresas con maquinaria que transforman materia prima a escala: curtiembres, textileras, fábricas de
                medicamentos, plantas de tratamiento de agua y de alimento para consumo animal.
              </p>
            </div>
            <div className="tarjeta mercado">
              <span className="mercado-icono artesanal">
                <Icono nombre="usuarios" className="ico-l" />
              </span>
              <h3>Mercado artesanal</h3>
              <p className="muted">
                Productores que trabajan de forma manual, sin maquinaria industrial, con las mismas presentaciones y el
                mismo respaldo técnico.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="sec">
        <div className="wrap grupo">
          <LogotiposAlternados {...logos} claro />
          <div>
            <p className="eyebrow">INCOVSA e Inquiserca</p>
            <h2>Dos empresas del mismo grupo, una sola identidad</h2>
            <p className="muted">
              Comparten productos según la logística de distribución, y se presentan en este sitio bajo una misma
              identidad visual.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
