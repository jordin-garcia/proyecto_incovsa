"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { esquemaCamposProducto } from "@/modulos/contenido/esquemas-catalogo";
import { eliminarProducto } from "@/modulos/contenido/acciones-catalogo";
import type { CatalogoSitio, ProductoPublico } from "@/modulos/contenido/catalogo";
import { ErrorNegocio } from "@/lib/errores";
import { EncabezadoModulo } from "@/componentes/comunes/EncabezadoModulo";
import { Icono } from "@/componentes/comunes/iconos";
import { VentanaConfirmacion } from "@/componentes/comunes/VentanaConfirmacion";
import { useMensajes } from "@/componentes/comunes/Mensajes";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import { Textarea } from "@/componentes/ui/textarea";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/componentes/ui/dialog";
import { CampoGaleria, type ImagenBorrador } from "./CampoGaleria";
import { publicarGaleria } from "./publicar-galeria";
import estilos from "./catalogo.module.css";
function FormularioProducto({
  producto,
  industrias,
  cerrar,
  alPublicar,
}: {
  producto: ProductoPublico | null;
  industrias: CatalogoSitio["industrias"];
  cerrar: () => void;
  alPublicar: (valor: boolean) => void;
}) {
  const [imagenes, cambiar] = useState<ImagenBorrador[]>(producto?.imagenes ?? []);
  const [seleccion, seleccionar] = useState(producto?.industrias.map((i) => i.id) ?? []);
  const [ocupado, ocupar] = useState(false);
  const bloqueo = useRef(false);
  const router = useRouter();
  const mensaje = useMensajes();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(esquemaCamposProducto),
    defaultValues: {
      nombre: producto?.nombre ?? "",
      descripcion: producto?.descripcion ?? "",
      presentacion: producto?.presentacion ?? "",
      paisesOrigen: producto?.paisesOrigen ?? "",
    },
  });
  return (
    <form
      onSubmit={(evento) => {
        void handleSubmit(async (datos) => {
          if (bloqueo.current) return;
          bloqueo.current = true;
          ocupar(true);
          alPublicar(true);
          try {
            const resultado = await publicarGaleria(
              "catalogo",
              { ...datos, id: producto?.id, industrias: seleccion },
              imagenes,
            );
            if (!resultado.ok) {
              mensaje(resultado.error, "error");
              return;
            }
            mensaje("Catálogo actualizado.");
            cerrar();
            router.refresh();
          } catch {
            mensaje("No se pudo completar la operación. Inténtelo de nuevo.", "error");
          } finally {
            bloqueo.current = false;
            ocupar(false);
            alPublicar(false);
          }
        })(evento);
      }}
    >
      <div className="modal-cuerpo">
        <fieldset className="rejilla" disabled={ocupado}>
          <div className={`rejilla r2 ${estilos.campos}`}>
            <div className="rejilla">
              <label className="campo">
                <span>Nombre</span>
                <Input {...register("nombre")} maxLength={150} aria-invalid={!!errors.nombre} />
                {errors.nombre && <span role="alert">{errors.nombre.message}</span>}
              </label>
              <label className="campo">
                <span>Presentación</span>
                <Input {...register("presentacion")} maxLength={150} placeholder="Por ejemplo: saco de 25 kg" />
              </label>
              <label className="campo">
                <span>Países de origen</span>
                <Input {...register("paisesOrigen")} maxLength={200} placeholder="Por ejemplo: México, China" />
              </label>
            </div>
            <div className="campo">
              <span>Imágenes (hasta 5; rotan cada 5 s)</span>
              <CampoGaleria nombre="Producto" imagenes={imagenes} alCambiar={cambiar} deshabilitado={ocupado} />
            </div>
          </div>
          <label className="campo">
            <span>Descripción</span>
            <Textarea {...register("descripcion")} rows={4} />
          </label>
          <div className="campo">
            <span>Industrias (una o varias)</span>
            <div className={`rejilla r3 ${estilos.casillas}`}>
              {industrias.map((i) => (
                <label className="chk" key={i.id}>
                  <input
                    type="checkbox"
                    checked={seleccion.includes(i.id)}
                    onChange={(e) =>
                      seleccionar(e.target.checked ? [...seleccion, i.id] : seleccion.filter((id) => id !== i.id))
                    }
                  />
                  {i.nombre}
                </label>
              ))}
            </div>
          </div>
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
export function EditorCatalogo({ datos }: { datos: CatalogoSitio }) {
  const publicando = useRef(false);
  const [editor, editar] = useState<{ producto: ProductoPublico | null } | null>(null);
  const mensaje = useMensajes();
  const router = useRouter();
  return (
    <>
      <EncabezadoModulo
        eyebrow="Contenido"
        titulo="Catálogo de productos públicos"
        instruccion="Productos del sitio, sin lote ni Peso de Conversión. Cada uno puede tener varias industrias."
        acciones={
          <Button onClick={() => editar({ producto: null })}>
            <Icono nombre="mas" />
            Nuevo producto
          </Button>
        }
      />
      <div className="tarjeta">
        <div className="tabla-caja">
          <table className="tabla">
            <thead>
              <tr>
                <th aria-label="Imagen" />
                <th>Producto</th>
                <th>Presentación</th>
                <th>Países de origen</th>
                <th>Industrias</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {datos.productos.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.imagenes.length ? (
                      <span className={estilos.miniatura}>
                        {/* Las direcciones ya fueron normalizadas por el almacenamiento. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.imagenes[0]} alt="" />
                        {p.imagenes.length > 1 && <i>{p.imagenes.length}</i>}
                      </span>
                    ) : (
                      <span className={estilos.sinImagen}>
                        <Icono nombre="imagen" className="ico-s" />
                      </span>
                    )}
                  </td>
                  <td>
                    <b>{p.nombre}</b>
                    {p.descripcion && <div className={estilos.descripcion}>{p.descripcion}</div>}
                  </td>
                  <td>{p.presentacion || "Por confirmar"}</td>
                  <td>{p.paisesOrigen || "Por confirmar"}</td>
                  <td>
                    <div className="etiquetas">
                      {p.industrias.length ? (
                        p.industrias.map((i) => (
                          <span key={i.id} className="chip chip-v">
                            {i.nombre}
                          </span>
                        ))
                      ) : (
                        <span className="chip chip-a">Por confirmar</span>
                      )}
                    </div>
                  </td>
                  <td className={`der ${estilos.acciones}`}>
                    <Button
                      variant="secundario"
                      size="pequeno"
                      aria-label="Editar"
                      title="Editar"
                      onClick={() => editar({ producto: p })}
                    >
                      <Icono nombre="editar" className="ico-s" />
                    </Button>{" "}
                    <VentanaConfirmacion
                      titulo="Eliminar producto"
                      texto={
                        <>
                          ¿Eliminar <b>{p.nombre}</b> del catálogo público? Deja de mostrarse en el sitio.
                        </>
                      }
                      textoConfirmar="Eliminar"
                      variante="peligro"
                      alConfirmar={async () => {
                        const resultado = await eliminarProducto(p.id);
                        if (!resultado.ok) throw new ErrorNegocio(resultado.error);
                        mensaje("Producto eliminado.");
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
            <DialogTitle>{editor?.producto ? "Editar producto público" : "Nuevo producto público"}</DialogTitle>
            <DialogDescription className="sr-only">
              Productos del sitio, sin lote ni Peso de Conversión.
            </DialogDescription>
          </div>
          {editor && (
            <FormularioProducto
              producto={editor.producto}
              industrias={datos.industrias}
              cerrar={() => editar(null)}
              alPublicar={(valor) => {
                publicando.current = valor;
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
