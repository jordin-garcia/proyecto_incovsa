import { Icono, type NombreIcono } from "@/componentes/comunes/iconos";
import type { EstructuraSitio } from "@/modulos/contenido/servicio";

export function Sedes({ contactos, conMapa = true }: { contactos: EstructuraSitio["contactos"]; conMapa?: boolean }) {
  return (
    <div className="sede-rejilla">
      {contactos.map((sede) => {
        // El tercer valor marca los datos en letra monoespaciada, como el prototipo (sitio.js › sedes()).
        const datos: [NombreIcono, string | null, boolean][] = [
          ["pin", sede.direccion, false],
          ["tel", sede.telefono, true],
          ["correo", sede.correo, true],
          ["chat", sede.whatsapp ? `WhatsApp ${sede.whatsapp}` : "", false],
          ["reloj", sede.horario, false],
        ];
        return (
          <div className="tarjeta sede-t" key={sede.nombre}>
            <span className="chip chip-v">
              {sede.nombre === "Quetzaltenango" ? "Oficina central y bodega" : "Oficina y bodega"}
            </span>
            <h3>{sede.nombre}</h3>
            {datos
              .filter(([, texto]) => texto)
              .map(([icono, texto, mono]) => (
                <div className="dato" key={icono}>
                  <Icono nombre={icono} className="ico-s" />
                  <span className={mono ? "mono" : undefined}>{texto}</span>
                </div>
              ))}
            {conMapa && sede.mapaUrl && (
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
