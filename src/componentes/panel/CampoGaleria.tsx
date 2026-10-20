"use client";
import { useEffect, useRef } from "react";
import { Button } from "@/componentes/ui/button";
import { Icono } from "@/componentes/comunes/iconos";
import { useMensajes } from "@/componentes/comunes/Mensajes";
import estilos from "./contenido.module.css";

export type ImagenBorrador = string | File;
function Miniatura({ imagen, etiqueta }: { imagen: ImagenBorrador; etiqueta: string }) {
  const elemento = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (typeof imagen === "string") return;
    const temporal = URL.createObjectURL(imagen);
    if (elemento.current) elemento.current.src = temporal;
    return () => URL.revokeObjectURL(temporal);
  }, [imagen]);
  // Imágenes seleccionadas localmente: next/image no procesa direcciones blob.
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={elemento} src={typeof imagen === "string" ? imagen : undefined} alt={etiqueta} />;
}
export function CampoGaleria({
  nombre,
  imagenes,
  alCambiar,
  maximo = 5,
  individual = false,
  texto,
  deshabilitado = false,
}: {
  nombre: string;
  imagenes: ImagenBorrador[];
  alCambiar: (imagenes: ImagenBorrador[]) => void;
  maximo?: number;
  individual?: boolean;
  texto?: string;
  deshabilitado?: boolean;
}) {
  const mensaje = useMensajes();
  const input = useRef<HTMLInputElement>(null);
  function agregar(archivos: File[]) {
    if (deshabilitado || archivos.length === 0) return;
    if (archivos.some((f) => !["image/jpeg", "image/png", "image/webp"].includes(f.type) || f.size > 5 * 1024 * 1024)) {
      mensaje("Seleccione una imagen JPG, PNG o WebP de hasta 5 MB.", "error");
      return;
    }
    const cabe = individual ? 1 : maximo - imagenes.length;
    if (archivos.length > cabe) mensaje(`Solo caben ${cabe} imagen(es) más: el máximo es ${maximo}.`, "aviso");
    alCambiar(individual ? archivos.slice(0, 1) : [...imagenes, ...archivos.slice(0, cabe)]);
  }
  const elegir =
    texto ??
    `Arrastre aquí ${maximo - imagenes.length === 1 ? "una imagen" : `hasta ${maximo - imagenes.length} imágenes`} o haga clic para elegirlas`;
  return (
    <div
      className={`${estilos.galeria} ${individual ? estilos.individual : ""}`}
      data-galeria={nombre}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        agregar(Array.from(e.dataTransfer.files));
      }}
    >
      <div className={estilos.lista}>
        {imagenes.map((imagen, i) => (
          <figure
            className={individual ? estilos.suelta : estilos.miniatura}
            key={typeof imagen === "string" ? imagen : `${imagen.name}-${imagen.lastModified}-${i}`}
          >
            <Miniatura imagen={imagen} etiqueta={`${nombre}: imagen ${i + 1}`} />
            {!individual && (
              <>
                <span className={estilos.numero}>{i + 1}</span>
                <span className={estilos.acciones}>
                  <Button
                    variant="secundario"
                    size="icono"
                    disabled={deshabilitado || i === 0}
                    aria-label={`Mover la imagen ${i + 1} antes`}
                    onClick={() => {
                      const siguiente = [...imagenes];
                      [siguiente[i - 1], siguiente[i]] = [siguiente[i]!, siguiente[i - 1]!];
                      alCambiar(siguiente);
                    }}
                  >
                    <Icono nombre="atras" />
                  </Button>
                  <Button
                    variant="secundario"
                    size="icono"
                    disabled={deshabilitado}
                    aria-label={`Quitar la imagen ${i + 1}`}
                    onClick={() => alCambiar(imagenes.filter((_, n) => n !== i))}
                  >
                    <Icono nombre="borrar" />
                  </Button>
                </span>
              </>
            )}
          </figure>
        ))}
      </div>
      {individual || imagenes.length < maximo ? (
        <>
          <Button
            variant="fantasma"
            className={estilos.subida}
            disabled={deshabilitado}
            onClick={() => input.current?.click()}
          >
            <span data-aviso>
              <Icono nombre="subir" />
              <span>{elegir}</span>
            </span>
          </Button>
          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple={!individual}
            aria-label={`${nombre}: elegir imágenes`}
            className="sr-only"
            disabled={deshabilitado}
            onChange={(e) => {
              agregar(Array.from(e.target.files ?? []));
              e.target.value = "";
            }}
          />
        </>
      ) : (
        <p>Tiene {maximo} imágenes, el máximo. Quite una para agregar otra.</p>
      )}
      {!individual && (
        <small className="muted">
          {imagenes.length > 1
            ? "Rotan cada 5 segundos, en este orden."
            : imagenes.length
              ? "Con una sola imagen, se muestra fija."
              : "Sin imágenes."}
        </small>
      )}
    </div>
  );
}
