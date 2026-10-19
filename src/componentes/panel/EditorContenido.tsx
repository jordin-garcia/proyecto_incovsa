"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/componentes/ui/button";
import { Textarea } from "@/componentes/ui/textarea";
import { useMensajes } from "@/componentes/comunes/Mensajes";
import { CampoGaleria, type ImagenBorrador } from "./CampoGaleria";
import { esquemaPublicacion, esquemaTexto, nombresBloques, type Bloque } from "@/modulos/contenido/esquemas";
import type { leerContenidoPanel, guardarPublicacion } from "@/modulos/contenido/servicio";
import type { Resultado } from "@/lib/errores";
import estilos from "./contenido.module.css";

type Imagen = ImagenBorrador | null;

function BloqueEditor({
  bloque,
  textoInicial = "",
  iniciales,
  descripcion,
}: {
  bloque: Bloque;
  textoInicial?: string;
  iniciales: Imagen[];
  descripcion: string;
}) {
  const [imagenes, ponerImagenes] = useState<Imagen[]>(iniciales);
  const [ocupado, ponerOcupado] = useState(false);
  const bloqueo = useRef(false);
  const router = useRouter();
  const mensaje = useMensajes();
  const { register, handleSubmit, getValues } = useForm({
    resolver: zodResolver(esquemaTexto),
    defaultValues: { texto: textoInicial },
  });
  const esTexto = ["mision", "vision", "historia"].includes(bloque);
  const individual = bloque === "logo" || bloque === "inquiserca";
  async function publicar(siguientes: Imagen[] = imagenes, texto = getValues("texto")) {
    if (bloqueo.current) return;
    bloqueo.current = true;
    ponerOcupado(true);
    try {
      const formulario = new FormData();
      let indice = 0;
      const referencias = siguientes.map((imagen) => {
        if (!(imagen instanceof File)) return imagen;
        formulario.append("imagenes", imagen);
        return indice++;
      });
      const datos = esquemaPublicacion.parse({ bloque, texto, imagenes: referencias });
      formulario.set("datos", JSON.stringify(datos));
      const respuesta = await fetch("/api/imagenes/publicar", { method: "POST", body: formulario });
      const resultado: Resultado<Awaited<ReturnType<typeof guardarPublicacion>>> = await respuesta.json();
      if (!resultado.ok) {
        mensaje(resultado.error, "error");
        return;
      }
      ponerImagenes(resultado.datos.imagenes);
      mensaje(`${nombresBloques[bloque]} publicado en el sitio.`);
      router.refresh();
    } catch {
      mensaje("No se pudo completar la operación. Inténtelo de nuevo.", "error");
    } finally {
      bloqueo.current = false;
      ponerOcupado(false);
    }
  }
  const cargadas = imagenes.filter(Boolean).length;
  const estado =
    bloque === "valores"
      ? cargadas === 5
        ? "Completos"
        : `${cargadas} de 5`
      : bloque === "logo"
        ? cargadas
          ? "Cambiado"
          : "El recibido"
        : bloque === "inquiserca"
          ? cargadas
            ? imagenes[0] === "/marca/inquiserca.webp"
              ? "El recibido"
              : "Cambiado"
            : "Sin logotipo"
          : bloque === "portada"
            ? cargadas
              ? "Publicada"
              : "Fotografía de la empresa"
            : textoInicial || cargadas
              ? "Publicado"
              : "Sin contenido";
  return (
    <section className="tarjeta" aria-label={nombresBloques[bloque]} aria-busy={ocupado}>
      <div className="bloque-cab">
        <div>
          <h3>{nombresBloques[bloque]}</h3>
          <p>{descripcion}</p>
        </div>
        <span className={`chip ${cargadas || textoInicial ? "chip-v" : "chip-a"}`}>{estado}</span>
      </div>
      <form
        className={`${estilos.cuerpo} ${individual ? estilos.cuerpoIndividual : ""}`}
        onSubmit={(evento) => {
          void handleSubmit(({ texto }) => publicar(imagenes, texto))(evento);
        }}
      >
        <fieldset disabled={ocupado} className="rejilla">
          {esTexto && (
            <div className="campo">
              <label htmlFor={`texto-${bloque}`}>Texto</label>
              <Textarea
                id={`texto-${bloque}`}
                {...register("texto")}
                defaultValue={textoInicial}
                rows={bloque === "historia" ? 6 : 5}
                placeholder="Texto pendiente de INCOVSA"
              />
            </div>
          )}
          {bloque === "valores" ? (
            <div className={estilos.valores}>
              {Array.from({ length: 5 }, (_, i) => (
                <div className="campo" key={i}>
                  <span>Valor {i + 1}</span>
                  <CampoGaleria
                    nombre={`Valor ${i + 1}`}
                    individual
                    maximo={1}
                    texto="Imagen del valor"
                    imagenes={imagenes[i] ? [imagenes[i]!] : []}
                    deshabilitado={ocupado}
                    alCambiar={(nuevas) => {
                      const siguientes = [...imagenes];
                      siguientes[i] = nuevas[0] ?? null;
                      void publicar(siguientes);
                    }}
                  />
                  {imagenes[i] && (
                    <Button
                      variant="fantasma"
                      size="pequeno"
                      onClick={() => {
                        const siguientes = [...imagenes];
                        siguientes[i] = null;
                        void publicar(siguientes);
                      }}
                    >
                      Quitar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="campo">
              {esTexto && <span>Imágenes{bloque === "historia" ? " (opcionales)" : ""}</span>}
              <CampoGaleria
                nombre={nombresBloques[bloque]}
                imagenes={
                  individual
                    ? imagenes[0]
                      ? [imagenes[0]]
                      : bloque === "logo"
                        ? ["/marca/incovsa-quimicos.webp"]
                        : []
                    : imagenes.filter((i): i is ImagenBorrador => i !== null)
                }
                individual={individual}
                maximo={individual ? 1 : 5}
                texto={individual ? "Arrastre el logotipo aquí o haga clic para elegirlo" : undefined}
                deshabilitado={ocupado}
                alCambiar={(siguientes) => {
                  if (individual) void publicar(siguientes);
                  else ponerImagenes(siguientes);
                }}
              />
            </div>
          )}
          <div className={estilos.botones}>
            {!individual && bloque !== "valores" && (
              <Button type="submit" size="pequeno">
                Guardar y publicar
              </Button>
            )}
            {esTexto && (
              <Button asChild variant="secundario" size="pequeno">
                <a href="/nosotros">Ver en el sitio</a>
              </Button>
            )}
            {bloque === "logo" && imagenes[0] && (
              <Button variant="fantasma" size="pequeno" onClick={() => void publicar([])}>
                Volver al logotipo recibido
              </Button>
            )}
            {bloque === "inquiserca" && imagenes[0] !== "/marca/inquiserca.webp" && (
              <Button variant="fantasma" size="pequeno" onClick={() => void publicar(["/marca/inquiserca.webp"])}>
                Volver al logotipo recibido
              </Button>
            )}
            {bloque === "inquiserca" && imagenes[0] && (
              <Button variant="fantasma" size="pequeno" onClick={() => void publicar([])}>
                Quitar logotipo
              </Button>
            )}
          </div>
        </fieldset>
      </form>
    </section>
  );
}
export function EditorContenido({ datos }: { datos: Awaited<ReturnType<typeof leerContenidoPanel>> }) {
  const galeria = (area: string) => datos.imagenes.filter((i) => i.area === area).map((i) => i.url);
  return (
    <div className={estilos.bloques}>
      <div className={estilos.dos}>
        <BloqueEditor
          bloque="portada"
          iniciales={galeria("portada")}
          descripcion="Imágenes de la portada de Inicio y del fondo de los encabezados de las páginas. Hasta 5; rotan cada 5 s."
        />
        <BloqueEditor
          bloque="logo"
          iniciales={[datos.configuracion.logotipoIncovsaUrl]}
          descripcion="El de la cabecera y el pie del sitio. Mientras no se suba otro, se usa el logotipo recibido."
        />
      </div>
      <div className={estilos.tres}>
        {(["mision", "vision", "historia"] as const).map((bloque) => (
          <BloqueEditor
            key={bloque}
            bloque={bloque}
            iniciales={galeria(bloque)}
            textoInicial={datos.textos.find((t) => t.seccion === bloque)?.texto ?? ""}
            descripcion={
              bloque === "historia" ? "Imágenes opcionales (hasta 5)" : "Texto e imágenes (hasta 5, rotan cada 5 s)"
            }
          />
        ))}
      </div>
      <BloqueEditor
        bloque="valores"
        iniciales={Array.from(
          { length: 5 },
          (_, i) => datos.valores.find((v) => v.posicion === i + 1)?.imagenUrl ?? null,
        )}
        descripcion="Cinco imágenes, una por cada valor, que se muestran en una fila y sin texto en «Quiénes somos»."
      />
      <BloqueEditor
        bloque="inquiserca"
        iniciales={[datos.configuracion.logotipoInquisercaUrl]}
        descripcion="Se alterna con el de INCOVSA en el banner de «Quiénes somos». Viene cargado el que entregó la empresa el 13/10."
      />
    </div>
  );
}
