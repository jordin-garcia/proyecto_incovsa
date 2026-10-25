import { EncabezadoPagina } from "@/componentes/sitio/EncabezadoPagina";
import { Sedes } from "@/componentes/sitio/Sedes";
import { FormularioContacto } from "@/componentes/sitio/FormularioContacto";
import { Icono } from "@/componentes/comunes/iconos";
import { leerInicioSitio } from "@/modulos/contenido/servicio";
import { leerOpcionesContacto } from "@/modulos/solicitudes/servicio";
import "@/componentes/sitio/contacto.css";
export const metadata = { title: "Contacto" };
export default async function Contacto() {
  const [inicio, opciones] = await Promise.all([leerInicioSitio(), leerOpcionesContacto()]);
  return (
    <main>
      <EncabezadoPagina
        eyebrow="Contacto"
        titulo="Cuéntenos cómo podemos ayudarle"
        texto="Escríbanos una solicitud, queja o reclamo y le responde un asesor de la sede que le corresponde."
        imagenes={inicio.portada}
      />
      <section className="sec">
        <div className="wrap contacto-lay">
          <FormularioContacto opciones={opciones} />
          <div className="contacto-sedes">
            <Sedes contactos={inicio.contactos} conMapa={false} />
            <div className="aviso aviso-a">
              <Icono nombre="alerta" />
              <div>
                Los productos químicos que distribuye INCOVSA tienen restricciones de venta. Un asesor verificará el uso
                previsto antes de cotizar.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
