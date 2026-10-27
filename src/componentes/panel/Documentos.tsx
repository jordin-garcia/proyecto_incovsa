"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ProductoDocumentado } from "@/modulos/documentos/servicio";
import { esquemaProducto } from "@/modulos/documentos/esquemas";
import { guardar, eliminar } from "@/modulos/documentos/acciones";
import { formatoFecha } from "@/lib/fechas";
import { ErrorNegocio } from "@/lib/errores";
import { EncabezadoModulo } from "@/componentes/comunes/EncabezadoModulo";
import { Icono } from "@/componentes/comunes/iconos";
import { useMensajes } from "@/componentes/comunes/Mensajes";
import { VentanaConfirmacion } from "@/componentes/comunes/VentanaConfirmacion";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import { SelectNativo } from "@/componentes/ui/select-nativo";
import { Dialog, DialogContent, DialogTitle } from "@/componentes/ui/dialog";
import estilos from "./documentos.module.css";
const tipos = [
  ["enlaceFt", "FT", "Ficha técnica"],
  ["enlaceHs", "HS", "Hoja de seguridad"],
  ["enlaceCoa", "COA", "Certificado de análisis"],
] as const;
function Formulario({
  producto,
  paises,
  cerrar,
  bloquear,
}: {
  producto: ProductoDocumentado | null;
  paises: { id: number; nombre: string }[];
  cerrar: () => void;
  bloquear: (v: boolean) => void;
}) {
  const router = useRouter();
  const mensaje = useMensajes();
  const bloqueo = useRef(false);
  const [ocupado, ocupar] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(esquemaProducto),
    defaultValues: {
      id: producto?.id,
      producto: producto?.producto ?? "",
      paisId: producto?.paisId ?? 0,
      lote: producto?.lote ?? "",
      enlaceFt: producto?.enlaces?.enlaceFt ?? "",
      enlaceHs: producto?.enlaces?.enlaceHs ?? "",
      enlaceCoa: producto?.enlaces?.enlaceCoa ?? "",
    },
  });
  return (
    <form
      onSubmit={(evento) => {
        void handleSubmit(
          async (datos) => {
            if (bloqueo.current) return;
            bloqueo.current = true;
            ocupar(true);
            bloquear(true);
            try {
              const r = await guardar(datos);
              if (!r.ok) {
                mensaje(r.error, "error");
                return;
              }
              cerrar();
              router.refresh();
              mensaje("Documentación guardada.", "exito");
            } finally {
              bloqueo.current = false;
              ocupar(false);
              bloquear(false);
            }
          },
          (fallos) => mensaje(Object.values(fallos)[0]?.message ?? "Revise los datos del formulario.", "error"),
        )(evento);
      }}
    >
      <div className="modal-cuerpo">
        <fieldset className={`rejilla ${estilos.campos}`} disabled={ocupado}>
          <label className="campo">
            <span>Nombre del producto *</span>
            <Input
              {...register("producto")}
              maxLength={150}
              placeholder="Por ejemplo: Soda Cáustica"
              aria-invalid={!!errors.producto}
              autoFocus
            />
          </label>
          <div className="rejilla r2">
            <label className="campo" htmlFor="documento-pais">
              <span>País de origen *</span>
              <SelectNativo
                id="documento-pais"
                {...register("paisId", { valueAsNumber: true })}
                aria-invalid={!!errors.paisId}
              >
                <option value={0}>Elija el país</option>
                {paises.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </SelectNativo>
            </label>
            <label className="campo">
              <span>Lote *</span>
              <Input
                {...register("lote")}
                className="mono"
                maxLength={40}
                placeholder="Letras y números"
                aria-invalid={!!errors.lote}
              />
            </label>
          </div>
          {tipos.map(([campo, codigo, nombre]) => (
            <label className="campo" key={campo}>
              <span>
                Enlace de Google Drive · {nombre} ({codigo})
              </span>
              <Input
                {...register(campo)}
                className={`mono ${estilos.enlace}`}
                maxLength={2048}
                placeholder="https://drive.google.com/file/d/…"
                aria-invalid={!!errors[campo]}
              />
            </label>
          ))}
          <p className={estilos.nota}>Los tres enlaces son opcionales; el lote es obligatorio.</p>
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
const normalizar = (texto: string) => texto.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
export function Documentos({
  productos,
  paises,
  gestiona,
  ve,
  descarga,
}: {
  productos: ProductoDocumentado[];
  paises: { id: number; nombre: string }[];
  gestiona: boolean;
  ve: boolean;
  descarga: boolean;
}) {
  const [busqueda, buscar] = useState("");
  const [editor, editar] = useState<{ producto: ProductoDocumentado | null } | null>(null);
  const [abierto, abrir] = useState<ProductoDocumentado | null>(null);
  const [visor, ver] = useState<string | null>(null);
  const bloqueo = useRef(false);
  const router = useRouter();
  const mensaje = useMensajes();
  const filas = productos.filter((p) => normalizar(`${p.lote} ${p.producto} ${p.pais}`).includes(normalizar(busqueda)));
  const mostrar = (p: ProductoDocumentado) => {
    ver(null);
    abrir(p);
  };
  return (
    <>
      <EncabezadoModulo
        eyebrow="Área protegida"
        titulo="Documentación interna"
        instruccion="Enlaces de Google Drive de la FT, la HS y el COA. Haga clic en un producto para ver su documentación."
        acciones={
          gestiona ? (
            <Button onClick={() => editar({ producto: null })}>
              <Icono nombre="mas" />
              Nuevo producto documentado
            </Button>
          ) : undefined
        }
      />
      <div className="tarjeta">
        <div className={estilos.herramientas}>
          <label className={estilos.buscador}>
            <Icono nombre="buscar" />
            <Input
              aria-label="Buscar por lote, producto o país de origen"
              placeholder="Buscar por lote, producto o país de origen"
              value={busqueda}
              onChange={(e) => buscar(e.target.value)}
            />
          </label>
        </div>
        {filas.length ? (
          <div className="tabla-caja">
            <table className="tabla tabla-clic">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>País de origen</th>
                  <th>Lote</th>
                  <th>Creado</th>
                  {gestiona && <th className="der">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {filas.map((p) => (
                  <tr
                    key={p.id}
                    tabIndex={0}
                    title="Ver la documentación"
                    onClick={() => mostrar(p)}
                    onKeyDown={(e) => {
                      if (e.target === e.currentTarget && e.key === "Enter") mostrar(p);
                    }}
                  >
                    <td>
                      <div className={estilos.producto}>
                        <span className={estilos.icono}>
                          <Icono nombre="archivo" className="ico-s" />
                        </span>
                        <b>{p.producto}</b>
                      </div>
                    </td>
                    <td>{p.pais}</td>
                    <td className="mono">{p.lote}</td>
                    <td className={estilos.creado}>
                      {formatoFecha(p.creadoEn)}
                      <br />
                      {p.creadoPor}
                    </td>
                    {gestiona && (
                      <td className={`der ${estilos.acciones}`} onClick={(e) => e.stopPropagation()}>
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
                          titulo="Eliminar producto documentado"
                          texto={
                            <>
                              ¿Eliminar <b>{p.producto}</b> ({p.pais}, lote {p.lote}) y sus enlaces? Dejará de estar
                              disponible para todos los usuarios.
                            </>
                          }
                          textoConfirmar="Eliminar"
                          variante="peligro"
                          alConfirmar={async () => {
                            const r = await eliminar({ id: p.id });
                            if (!r.ok) throw new ErrorNegocio(r.error);
                            router.refresh();
                            mensaje("Producto documentado eliminado.", "exito");
                          }}
                        >
                          <Button variant="fantasma" size="pequeno" aria-label="Eliminar" title="Eliminar">
                            <Icono nombre="borrar" className="ico-s" />
                          </Button>
                        </VentanaConfirmacion>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="vacio">
            <Icono nombre="archivo" />
            <h4>Sin productos documentados</h4>
            <p>Pruebe con otro lote, producto o país.</p>
          </div>
        )}
      </div>
      <div className={`aviso aviso-v ${estilos.aviso}`}>
        <Icono nombre="escudo" />
        <div>
          El sistema guarda solo los enlaces y los muestra a quien tiene permiso. Que un enlace no se abra fuera de la
          empresa, o que no se pueda descargar desde Google Drive, depende de cómo se comparta cada archivo en Drive
          (P-92).
        </div>
      </div>
      <Dialog
        open={!!editor}
        onOpenChange={(v) => {
          if (!v && !bloqueo.current) editar(null);
        }}
      >
        <DialogContent
          grande
          aria-describedby={undefined}
          onEscapeKeyDown={(e) => {
            if (bloqueo.current) e.preventDefault();
          }}
          onPointerDownOutside={(e) => {
            if (bloqueo.current) e.preventDefault();
          }}
        >
          <div className="modal-cab">
            <DialogTitle>{editor?.producto ? "Editar producto documentado" : "Nuevo producto documentado"}</DialogTitle>
          </div>
          {editor && (
            <Formulario
              producto={editor.producto}
              paises={paises}
              cerrar={() => editar(null)}
              bloquear={(v) => {
                bloqueo.current = v;
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!abierto}
        onOpenChange={(v) => {
          if (!v) abrir(null);
        }}
      >
        <DialogContent grande aria-describedby={undefined}>
          <div className="modal-cab">
            <DialogTitle>{abierto && `${abierto.producto} · ${abierto.pais} · lote ${abierto.lote}`}</DialogTitle>
          </div>
          <div className="modal-cuerpo">
            <div className={estilos.documentos}>
              {abierto?.documentos.length ? (
                abierto.documentos.map((d) => (
                  <div className={estilos.documento} key={d.codigo}>
                    <span className={`chip ${d.codigo === "COA" ? "chip-z" : d.codigo === "HS" ? "chip-a" : "chip-v"}`}>
                      {d.codigo}
                    </span>
                    <b>{d.nombre}</b>
                    <span className={estilos.opciones}>
                      {d.vistaPrevia && (
                        <Button variant="secundario" size="pequeno" onClick={() => ver(d.vistaPrevia!)}>
                          <Icono nombre="ojo" className="ico-s" />
                          Ver
                        </Button>
                      )}
                      {d.descarga && (
                        <Button asChild variant="secundario" size="pequeno">
                          <a href={d.descarga} target="_blank" rel="noopener noreferrer">
                            <Icono nombre="descargar" className="ico-s" />
                            Descargar
                          </a>
                        </Button>
                      )}
                    </span>
                  </div>
                ))
              ) : (
                <p className="muted">Este producto todavía no tiene enlaces de documentos.</p>
              )}
            </div>
            {!ve && !descarga ? (
              <p className={estilos.notaPermiso}>Sus permisos no incluyen ver ni descargar documentos.</p>
            ) : !descarga ? (
              <p className={estilos.notaPermiso}>Solo visualización: sus permisos no incluyen la descarga.</p>
            ) : null}
            {visor && <iframe className={estilos.visor} src={visor} title={abierto?.producto} allow="autoplay" />}
          </div>
          <div className="modal-pie">
            <Button variant="secundario" onClick={() => abrir(null)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
