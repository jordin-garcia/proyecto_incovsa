"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { EstructuraSitio } from "@/modulos/contenido/servicio";
import { ICONOS_INDUSTRIAS, NAVEGACION } from "./navegacion";

export function Pie({ datos, anio }: { datos: EstructuraSitio; anio: string }) {
  const ruta = usePathname();
  if (
    !["/", "/nosotros", "/noticias", "/contacto"].some((pagina) =>
      pagina === "/" ? ruta === "/" : ruta === pagina || ruta.startsWith(`${pagina}/`),
    )
  )
    return null;
  return (
    <footer className="pie-sitio">
      <div className="wrap">
        <div className="pie-rej">
          <div>
            <span className="logo-placa">
              <Image src={datos.logotipo} alt="INCOVSA Químicos" width={180} height={60} unoptimized />
            </span>
            <p className="pie-descripcion">
              Industria del Cuero Covadonga S. A. Compra y venta de productos químicos en Guatemala. INCOVSA e
              Inquiserca, una sola identidad.
            </p>
          </div>
          <div>
            <h4>Navegación</h4>
            {NAVEGACION.map(([href, texto]) => (
              <Link key={href} href={href}>
                {texto}
              </Link>
            ))}
          </div>
          <div>
            <h4>Industrias</h4>
            {datos.industrias.slice(0, 5).map((industria, indice) => (
              <Link key={industria.id} href={`/industrias/${ICONOS_INDUSTRIAS[indice]}`}>
                {industria.nombre}
              </Link>
            ))}
            <Link href="/industrias">Ver las nueve</Link>
          </div>
          <div>
            <h4>Contacto</h4>
            {datos.contactos
              .filter((sede) => sede.correo)
              .map((sede) => (
                <Link key={sede.prefijo} href="/contacto" className="mono">
                  {sede.correo}
                </Link>
              ))}
            {datos.contactos
              .filter((sede) => sede.whatsapp)
              .map((sede) => (
                <Link key={sede.prefijo} href="/contacto">
                  WhatsApp {sede.nombre} · {sede.whatsapp}
                </Link>
              ))}
          </div>
        </div>
        <div className="legal">© {anio} Industria del Cuero Covadonga S. A. · incovsa.com</div>
      </div>
    </footer>
  );
}
