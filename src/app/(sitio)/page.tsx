import Link from "next/link";
import { Icono } from "@/componentes/comunes/iconos";
import { Button } from "@/componentes/ui/button";
import { Galeria } from "@/componentes/sitio/Galeria";
import { MisionVision } from "@/componentes/sitio/MisionVision";
import { Sedes } from "@/componentes/sitio/Sedes";
import { ICONOS_INDUSTRIAS } from "@/componentes/sitio/navegacion";
import { leerInicioSitio } from "@/modulos/contenido/servicio";

export const metadata = { title: "Inicio" };

export default async function Inicio() {
  const datos = await leerInicioSitio();
  return (
    <main>
      <section className="hero">
        <div className="hero-foto revelar-f">
          <Galeria imagenes={datos.portada} className="gal-fondo" />
        </div>
        <div className="hero-velo" />
        <div className="hero-puntos" />
        <div className="wrap hero-in">
          <div>
            <p className="eyebrow">Industria del Cuero Covadonga S. A.</p>
            <h1>
              Química que sostiene a la industria <em>guatemalteca</em>
            </h1>
            <p className="lead">
              Compra, venta y distribución de productos químicos para nueve industrias del país. Más de treinta años
              abasteciendo al sector industrial y artesanal, con presencia en todo el territorio.
            </p>
            <div className="hero-acc">
              <Button asChild variant="lima" size="grande">
                <Link href="/productos">
                  Ver catálogo de productos <Icono nombre="flecha" />
                </Link>
              </Button>
              <Button asChild variant="secundario" size="grande">
                <Link href="/contacto">Hablar con un asesor</Link>
              </Button>
            </div>
          </div>
          <div className="cifras">
            <div>
              <b>30+</b>
              <span>años en el mercado guatemalteco</span>
            </div>
            <div>
              <b>9</b>
              <span>industrias atendidas</span>
            </div>
            <div>
              <b>3</b>
              <span>sedes con bodega de distribución</span>
            </div>
            <div>
              <b>22</b>
              <span>departamentos: presencia en todo el país</span>
            </div>
          </div>
        </div>
      </section>
      <section className="sec">
        <div className="wrap">
          <div className="cab-sec">
            <div>
              <p className="eyebrow">Industrias atendidas</p>
              <h2>Cada industria tiene su propio conjunto de productos</h2>
            </div>
            <Button asChild variant="secundario">
              <Link href="/industrias">
                Ver las nueve <Icono nombre="flecha" className="ico-s" />
              </Link>
            </Button>
          </div>
          <div className="ind-rejilla">
            {datos.industrias.map((industria, indice) => (
              <Link className="ind-t" key={industria.id} href={`/industrias/${ICONOS_INDUSTRIAS[indice]}`}>
                <span className="n">{String(indice + 1).padStart(2, "0")}</span>
                <span className="ind-ic">
                  <Icono nombre={ICONOS_INDUSTRIAS[indice]} />
                </span>
                <h3>{industria.nombre}</h3>
                <p>{industria.descripcion}</p>
                <span className="pie">
                  {industria.productos} productos <Icono nombre="flecha" className="ico-s" />
                </span>
              </Link>
            ))}
          </div>
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
          <MisionVision mision={datos.mision} vision={datos.vision} />
        </div>
      </section>
      <section className="sec">
        <div className="wrap">
          <div className="cab-sec">
            <div>
              <p className="eyebrow">Presencia</p>
              <h2>Visítenos</h2>
            </div>
            <p>Ubique nuestras oficinas en el mapa: será un gusto atenderle en persona.</p>
          </div>
          <Sedes contactos={datos.contactos} />
        </div>
      </section>
      <section className="sec sec-llamado">
        <div className="wrap">
          <div className="llamado">
            <div>
              <h2>¿Necesita un producto que no aparece en el catálogo?</h2>
              <p>Escríbanos y un asesor le responde desde la sede que le corresponde.</p>
            </div>
            <Button asChild variant="lima" size="grande">
              <Link href="/contacto">
                Enviar una solicitud <Icono nombre="flecha" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
