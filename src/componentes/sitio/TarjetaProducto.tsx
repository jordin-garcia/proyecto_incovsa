import Link from "next/link";
import { Icono } from "@/componentes/comunes/iconos";
import type { ProductoPublico } from "@/modulos/contenido/catalogo";
import { Galeria } from "./Galeria";

export function TarjetaProducto({ producto }: { producto: ProductoPublico }) {
  return (
    <Link className="prod-t" href={`/productos/${producto.id}`}>
      <div className="foto">
        {producto.imagenes.length ? (
          <Galeria imagenes={producto.imagenes} alt={producto.nombre} />
        ) : (
          <span className="sin-foto">
            <Icono nombre="imagen" />
          </span>
        )}
      </div>
      <div className="info">
        <h3>{producto.nombre}</h3>
        {(producto.paisesOrigen || producto.presentacion) && (
          <p className="prod-datos">{[producto.paisesOrigen, producto.presentacion].filter(Boolean).join(" · ")}</p>
        )}
        <div className="etiquetas">
          {producto.industrias.length ? (
            <>
              {producto.industrias.slice(0, 2).map((i) => (
                <span key={i.id} className="chip chip-v">
                  {i.nombre}
                </span>
              ))}
              {producto.industrias.length > 2 && <span className="chip">+{producto.industrias.length - 2}</span>}
            </>
          ) : (
            <span className="chip chip-a">Industria por confirmar</span>
          )}
        </div>
      </div>
    </Link>
  );
}
