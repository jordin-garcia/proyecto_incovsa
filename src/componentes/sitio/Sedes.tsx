import { Icono, type NombreIcono } from "@/componentes/comunes/iconos";
import type { EstructuraSitio } from "@/modulos/contenido/servicio";

export function Sedes({ contactos }: { contactos: EstructuraSitio["contactos"] }) {
  return (
    <div className="sede-rejilla">
      {contactos.map((sede) => {
        const datos: [NombreIcono, string | null][] = [
          ["pin", sede.direccion],
          ["tel", sede.telefono],
          ["correo", sede.correo],
          ["chat", sede.whatsapp ? `WhatsApp ${sede.whatsapp}` : ""],
          ["reloj", sede.horario],
        ];
        return (
          <div className="tarjeta sede-t" key={sede.prefijo}>
            <span className="chip chip-v">
              {sede.prefijo === "XE" ? "Oficina central y bodega" : "Oficina y bodega"}
            </span>
            <h3>{sede.nombre}</h3>
            {datos
              .filter(([, texto]) => texto)
              .map(([icono, texto]) => (
                <div className="dato" key={icono}>
                  <Icono nombre={icono} className="ico-s" />
                  <span>{texto}</span>
                </div>
              ))}
            {sede.mapaUrl && (
              <iframe
                className="mapa"
                src={sede.mapaUrl}
                title={`Mapa de la sede de ${sede.nombre}`}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
