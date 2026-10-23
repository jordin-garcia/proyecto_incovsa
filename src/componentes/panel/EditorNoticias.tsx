"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toast } from "radix-ui";
import { esquemaCamposNoticia } from "@/modulos/contenido/esquemas-noticias";
import { eliminarNoticia } from "@/modulos/contenido/acciones-noticias";
import type { NoticiaPublica } from "@/modulos/contenido/noticias";
import { formatoFecha } from "@/lib/fechas";
import { ErrorNegocio } from "@/lib/errores";
import { EncabezadoModulo } from "@/componentes/comunes/EncabezadoModulo";
import { Icono } from "@/componentes/comunes/iconos";
import { VentanaConfirmacion } from "@/componentes/comunes/VentanaConfirmacion";
import { useMensajes } from "@/componentes/comunes/Mensajes";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import { Textarea } from "@/componentes/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@/componentes/ui/dialog";
import { CampoGaleria, type ImagenBorrador } from "./CampoGaleria";
import { publicarGaleria } from "./publicar-galeria";
import estilos from "./catalogo.module.css";
import noticiasEstilos from "./noticias.module.css";

function FormularioNoticia({
  noticia,
  cerrar,
  alPublicar,
  alGuardar,
}: {
  noticia: NoticiaPublica | null;
  cerrar: () => void;
  alPublicar: (valor: boolean) => void;
  alGuardar: () => void;
}) {
  const [imagenes, cambiar] = useState<ImagenBorrador[]>(noticia?.imagenes ?? []);
  const [ocupado, ocupar] = useState(false);
  const bloqueo = useRef(false);
  const router = useRouter();
  const mensaje = useMensajes();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(esquemaCamposNoticia),
    defaultValues: { titulo: noticia?.titulo ?? "", texto: noticia?.texto ?? "" },
  });
  return (
    <form
      onSubmit={(evento) => {
        void handleSubmit(
          async (datos) => {
            if (bloqueo.current) return;
            if (!imagenes.length) {
              mensaje("Agregue al menos una imagen.", "error");
              return;
            }
            bloqueo.current = true;
            ocupar(true);
            alPublicar(true);
            try {
              const resultado = await publicarGaleria("noticias", { ...datos, id: noticia?.id }, imagenes);
              if (!resultado.ok) {
                mensaje(resultado.error, "error");
                return;
              }
              alGuardar();
              cerrar();
              router.refresh();
            } catch {
              mensaje("No se pudo completar la operación. Inténtelo de nuevo.", "error");
            } finally {
              bloqueo.current = false;
              ocupar(false);
              alPublicar(false);
            }
          },
          (errores) => {
            mensaje(
              errores.titulo?.message ??
                errores.texto?.message ??
                "No se pudo completar la operación. Inténtelo de nuevo.",
              "error",
            );
          },
        )(evento);
      }}
    >
      <div className="modal-cuerpo">
        <fieldset className={`rejilla ${noticiasEstilos.campos}`} disabled={ocupado}>
          <div className="campo">
            <span>Imágenes (al menos una, hasta 5)</span>
            <CampoGaleria nombre="Noticia" imagenes={imagenes} alCambiar={cambiar} deshabilitado={ocupado} />
          </div>
          <label className="campo">
            <span>Título</span>
            <Input {...register("titulo")} autoFocus maxLength={200} aria-invalid={!!errors.titulo} />
          </label>
          <label className="campo">
            <span>Texto</span>
            <Textarea {...register("texto")} rows={7} aria-invalid={!!errors.texto} />
          </label>
        </fieldset>
      </div>
      <div className="modal-pie">
        <Button variant="secundario" onClick={cerrar} disabled={ocupado}>
          Cancelar
        </Button>
        <Button type="submit" disabled={ocupado}>
          Guardar
        </Button>
      </div>
    </form>
  );
}
export function EditorNoticias({ noticias }: { noticias: NoticiaPublica[] }) {
  const publicando = useRef(false);
  const [editor, editar] = useState<{ noticia: NoticiaPublica | null } | null>(null);
  const [guardada, avisarGuardada] = useState(false);
  const mensaje = useMensajes();
  const router = useRouter();
  return (
    <>
      <EncabezadoModulo
        eyebrow="Contenido"
        titulo="Noticias"
        instruccion="Imágenes (de 1 a 5), título y texto. Al guardar se publica en la página de Noticias."
        acciones={
          <Button onClick={() => editar({ noticia: null })}>
            <Icono nombre="mas" />
            Nueva noticia
          </Button>
        }
      />
      <div className={`tarjeta ${noticiasEstilos.lista}`}>
        {noticias.length ? (
          <div className="tabla-caja">
            <table className="tabla">
              <thead>
                <tr>
                  <th className={noticiasEstilos.columnaImagen} aria-label="Imagen" />
                  <th>Título</th>
                  <th>Fecha</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {noticias.map((n) => (
                  <tr key={n.id}>
                    <td>
                      <span className={`${estilos.miniatura} ${noticiasEstilos.miniatura}`}>
                        {/* La dirección pertenece al almacenamiento validado. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={n.imagenes[0]} alt="" />
                        {n.imagenes.length > 1 && <i>{n.imagenes.length}</i>}
                      </span>
                    </td>
                    <td>
                      <b>{n.titulo}</b>
                      <div className={`${estilos.descripcion} ${noticiasEstilos.descripcion}`}>{n.texto}</div>
                    </td>
                    <td className="mono">{formatoFecha(n.fechaPublicacion)}</td>
                    <td className={`der ${estilos.acciones}`}>
                      <Button
                        variant="secundario"
                        size="pequeno"
                        aria-label="Editar"
                        title="Editar"
                        onClick={() => editar({ noticia: n })}
                      >
                        <Icono nombre="editar" className="ico-s" />
                      </Button>{" "}
                      <VentanaConfirmacion
                        titulo="Eliminar noticia"
                        texto={
                          <>
                            ¿Eliminar la noticia <b>{n.titulo}</b>? Deja de mostrarse en el sitio.
                          </>
                        }
                        textoConfirmar="Eliminar"
                        variante="peligro"
                        alConfirmar={async () => {
                          const resultado = await eliminarNoticia(n.id);
                          if (!resultado.ok) throw new ErrorNegocio(resultado.error);
                          mensaje("Noticia eliminada.");
                          router.refresh();
                        }}
                      >
                        <Button variant="fantasma" size="pequeno" aria-label="Eliminar" title="Eliminar">
                          <Icono nombre="borrar" className="ico-s" />
                        </Button>
                      </VentanaConfirmacion>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="vacio">
            <Icono nombre="imagen" />
            <h4>No hay noticias</h4>
            <p>Cree la primera y véala publicada en el sitio.</p>
          </div>
        )}
      </div>
      <Dialog
        open={editor !== null}
        onOpenChange={(abierta) => {
          if (!abierta && !publicando.current) editar(null);
        }}
      >
        <DialogContent
          grande
          aria-describedby={undefined}
          onEscapeKeyDown={(e) => {
            if (publicando.current) e.preventDefault();
          }}
          onPointerDownOutside={(e) => {
            if (publicando.current) e.preventDefault();
          }}
        >
          <div className="modal-cab">
            <DialogTitle>{editor?.noticia ? "Editar noticia" : "Nueva noticia"}</DialogTitle>
          </div>
          {editor && (
            <FormularioNoticia
              noticia={editor.noticia}
              cerrar={() => editar(null)}
              alGuardar={() => avisarGuardada(true)}
              alPublicar={(valor) => {
                publicando.current = valor;
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      <Toast.Root className="toast t-exito" open={guardada} onOpenChange={avisarGuardada}>
        <Icono nombre="check" />
        <Toast.Title>
          Noticia guardada.{" "}
          <a className={noticiasEstilos.enlace} href="/noticias">
            Verla en el sitio
          </a>
        </Toast.Title>
      </Toast.Root>
    </>
  );
}
