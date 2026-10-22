"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { esquemaTexto } from "@/modulos/contenido/esquemas";
import type { CatalogoSitio } from "@/modulos/contenido/catalogo";
import { Icono } from "@/componentes/comunes/iconos";
import { ICONOS_INDUSTRIAS } from "@/componentes/sitio/navegacion";
import { EncabezadoModulo } from "@/componentes/comunes/EncabezadoModulo";
import { useMensajes } from "@/componentes/comunes/Mensajes";
import { Button } from "@/componentes/ui/button";
import { Textarea } from "@/componentes/ui/textarea";
import { CampoGaleria, type ImagenBorrador } from "./CampoGaleria";
import { publicarGaleria } from "./publicar-galeria";
import estilos from "./catalogo.module.css";
function TarjetaIndustria({ industria, indice }: { industria: CatalogoSitio["industrias"][number]; indice: number }) {
  const [imagenes, cambiar] = useState<ImagenBorrador[]>(industria.imagenes);
  const [ocupado, ocupar] = useState(false);
  const bloqueo = useRef(false);
  const mensaje = useMensajes();
  const router = useRouter();
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(esquemaTexto),
    defaultValues: { texto: industria.descripcion },
  });
  return (
    <section className={`tarjeta tarjeta-p ${estilos.industria}`} aria-label={industria.nombre}>
      <div className={estilos.cabIndustria}>
        <span className={estilos.iconoIndustria}>
          <Icono nombre={ICONOS_INDUSTRIAS[indice]} />
        </span>
        <div>
          <span className={`mono muted ${estilos.numeroIndustria}`}>{String(indice + 1).padStart(2, "0")}</span>
          <h3>{industria.nombre}</h3>
        </div>
      </div>
      <form
        className="rejilla"
        onSubmit={(evento) => {
          void handleSubmit(async ({ texto }) => {
            if (bloqueo.current) return;
            bloqueo.current = true;
            ocupar(true);
            try {
              const resultado = await publicarGaleria("industrias", { id: industria.id, descripcion: texto }, imagenes);
              if (!resultado.ok) {
                mensaje(resultado.error, "error");
                return;
              }
              mensaje(`${industria.nombre} publicada.`);
              router.refresh();
            } catch {
              mensaje("No se pudo completar la operación. Inténtelo de nuevo.", "error");
            } finally {
              bloqueo.current = false;
              ocupar(false);
            }
          })(evento);
        }}
      >
        <fieldset className={`rejilla ${estilos.camposIndustria}`} disabled={ocupado}>
          <CampoGaleria nombre={industria.nombre} imagenes={imagenes} alCambiar={cambiar} deshabilitado={ocupado} />
          <label className="sr-only" htmlFor={`industria-${industria.id}`}>
            Descripción de {industria.nombre}
          </label>
          <Textarea id={`industria-${industria.id}`} rows={6} {...register("texto")} />
          <div>
            <Button type="submit" variant="secundario" size="pequeno">
              Guardar
            </Button>
          </div>
        </fieldset>
      </form>
    </section>
  );
}
export function EditorIndustrias({ datos }: { datos: CatalogoSitio["industrias"] }) {
  return (
    <>
      <EncabezadoModulo
        eyebrow="Contenido"
        titulo="Industrias atendidas"
        instruccion="Descripción e imágenes (hasta 5) de cada una de las 9 industrias."
      />
      <div className="rejilla r3">
        {datos.map((industria, indice) => (
          <TarjetaIndustria
            key={`${industria.id}-${industria.descripcion}-${industria.imagenes.join()}`}
            industria={industria}
            indice={indice}
          />
        ))}
      </div>
    </>
  );
}
