import Link from "next/link";
import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/sesion";
import { leerResumen } from "@/modulos/contenido/resumen";
import { ErrorAcceso } from "@/modulos/permisos/servicio";
import { opcionesPermitidas } from "@/modulos/permisos/navegacion";
import { SinAcceso } from "@/componentes/comunes/armazon/SinAcceso";
import { EncabezadoModulo } from "@/componentes/comunes/EncabezadoModulo";
import { Icono } from "@/componentes/comunes/iconos";
import estilos from "@/componentes/panel/contenido.module.css";

export default async function Resumen() {
  const sesion = await obtenerSesion("sitio");
  if (!sesion) redirect("/acceso");
  const tarjetas = await leerResumen(sesion).catch((error: unknown) => {
    if (!(error instanceof ErrorAcceso)) throw error;
    return null;
  });
  if (tarjetas) {
    return (
      <>
        <EncabezadoModulo
          eyebrow="Panel del sitio"
          titulo={`Hola, ${sesion.usuario.nombre}`}
          instruccion="Edite lo que se publica en el sitio; los cambios se ven de inmediato."
        />
        <div className={estilos.resumen}>
          {tarjetas.map((t) => (
            <Link className="tarjeta mod-t" href={`/panel/${t.ruta}`} key={t.ruta}>
              <span className="ic">
                <Icono nombre={t.icono} />
              </span>
              <h3>{t.nombre}</h3>
              <p className="muted">{t.detalle}</p>
              <span className={`chip chip-${t.color}`}>{t.estado}</span>
            </Link>
          ))}
        </div>
      </>
    );
  } else {
    return (
      <SinAcceso
        texto="Sus permisos no incluyen esta sección. Los asignan Gerencia o Soporte."
        destino={opcionesPermitidas(sesion)[0]?.href}
      />
    );
  }
}
