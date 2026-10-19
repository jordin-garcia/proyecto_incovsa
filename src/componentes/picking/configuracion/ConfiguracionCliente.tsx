"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import { SelectNativo } from "@/componentes/ui/select-nativo";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/componentes/ui/dialog";
import { EncabezadoModulo } from "@/componentes/comunes/EncabezadoModulo";
import { Icono } from "@/componentes/comunes/iconos";
import { useMensajes } from "@/componentes/comunes/Mensajes";
import { Pestanas } from "@/componentes/comunes/Pestanas";
import { Tabla } from "@/componentes/comunes/Tabla";
import { VentanaConfirmacion } from "@/componentes/comunes/VentanaConfirmacion";
import { formatoKg, formatoNumero } from "@/componentes/comunes/formato";
import { Aviso } from "@/componentes/comunes/Aviso";
import { DialogoClave } from "@/componentes/usuarios/DialogoClave";
import { FormularioUsuario } from "@/componentes/usuarios/FormularioUsuario";
import { TablaUsuarios } from "@/componentes/usuarios/TablaUsuarios";
import { ErrorNegocio } from "@/lib/errores";
import { esquemaCamion, type EntradaCamion } from "@/modulos/camiones/esquemas";
import { crearCamionAccion, editarCamionAccion, eliminarCamionAccion } from "@/modulos/camiones/acciones";
import { eliminarUsuarioAccion } from "@/modulos/usuarios/acciones";
import type { PermisoCatalogo, UsuarioVisible } from "@/modulos/usuarios/tipos";

export type CamionVisible = {
  id: number;
  identificacion: string;
  capacidadKg: string;
  sedeId: number;
  sedeNombre: string;
  elegidoEnFacturacion: boolean;
};

type SedeVisible = { id: number; nombre: string };
type ValoresFormulario = { identificacion: string; capacidadKg: string; sedeId: string | number };

export function ConfiguracionCliente({
  camiones,
  sedes,
  usuarios,
  permisos,
  usuarioActualId,
}: {
  camiones: CamionVisible[];
  sedes: SedeVisible[];
  usuarios: UsuarioVisible[] | null;
  permisos: PermisoCatalogo[];
  usuarioActualId: string;
}) {
  const router = useRouter();
  const mensaje = useMensajes();
  const [pestana, cambiarPestana] = useState("camiones");
  const [edicion, abrirEdicion] = useState<CamionVisible | null | false>(false);
  const [bloqueo, fijarBloqueo] = useState<string | null>(null);
  const [usuarioEdicion, abrirUsuario] = useState<UsuarioVisible | null | false>(false);
  const [claveDe, abrirClave] = useState<UsuarioVisible | null>(null);

  async function quitarCamion(id: number) {
    const resultado = await eliminarCamionAccion({ id });
    if (!resultado.ok) throw new ErrorNegocio(resultado.error);
    mensaje("Camión eliminado.");
    router.refresh();
  }

  async function quitarUsuario(id: string) {
    const resultado = await eliminarUsuarioAccion({ id });
    if (!resultado.ok) throw new ErrorNegocio(resultado.error);
    mensaje("Usuario eliminado.");
    router.refresh();
  }

  const opciones = [
    {
      valor: "camiones",
      texto: "Camiones",
      contador: camiones.length,
      contenido: (
        <section className="tarjeta">
          <div className="lista-configuracion">
            <Tabla>
              <thead>
                <tr>
                  <th>Identificación</th>
                  <th className="der">Capacidad máxima</th>
                  <th>Sede</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {camiones.map((camion) => (
                  <tr key={camion.id}>
                    <td>
                      <b>{camion.identificacion}</b>
                    </td>
                    <td className="der kg">{formatoKg(camion.capacidadKg)}</td>
                    <td>{camion.sedeNombre}</td>
                    <td className="der">
                      <Button
                        variant="secundario"
                        size="pequeno"
                        aria-label="Editar"
                        title="Editar"
                        onClick={() => abrirEdicion(camion)}
                      >
                        <Icono nombre="editar" className="ico-s" />
                      </Button>{" "}
                      {camion.elegidoEnFacturacion ? (
                        <Button
                          variant="fantasma"
                          size="pequeno"
                          aria-label="Eliminar"
                          title="Eliminar"
                          onClick={() => fijarBloqueo(camion.identificacion)}
                        >
                          <Icono nombre="borrar" className="ico-s" />
                        </Button>
                      ) : (
                        <VentanaConfirmacion
                          titulo="Eliminar"
                          texto={
                            <>
                              ¿Eliminar <b>{camion.identificacion}</b>?
                            </>
                          }
                          textoConfirmar="Eliminar"
                          variante="peligro"
                          alConfirmar={() => quitarCamion(camion.id)}
                        >
                          <Button variant="fantasma" size="pequeno" aria-label="Eliminar" title="Eliminar">
                            <Icono nombre="borrar" className="ico-s" />
                          </Button>
                        </VentanaConfirmacion>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tabla>
          </div>
        </section>
      ),
    },
  ];

  if (usuarios !== null) {
    opciones.push({
      valor: "usuarios",
      texto: "Usuarios",
      contador: usuarios.length,
      contenido: (
        <>
          <section className="tarjeta">
            <div className="lista-configuracion">
              <TablaUsuarios
                usuarios={usuarios}
                usuarioActualId={usuarioActualId}
                alEditar={abrirUsuario}
                alRestablecer={abrirClave}
                alEliminar={quitarUsuario}
              />
            </div>
          </section>
          <div style={{ marginTop: 16 }}>
            <Aviso>
              Las cuentas de Gerencia y Soporte sirven en los dos sistemas. Las demás son de un solo sistema, y una
              persona puede tener una cuenta en cada uno con el mismo nombre de usuario (RN-54).
            </Aviso>
          </div>
        </>
      ),
    });
  }

  return (
    <>
      <EncabezadoModulo
        eyebrow="Módulo de configuración"
        titulo="Camiones y usuarios"
        instruccion="Camiones de cada sede y usuarios del sistema de picking."
        acciones={
          pestana === "camiones" ? (
            <Button onClick={() => abrirEdicion(null)}>
              <Icono nombre="mas" /> Nuevo camión
            </Button>
          ) : usuarios !== null ? (
            <Button onClick={() => abrirUsuario(null)}>
              <Icono nombre="mas" /> Nuevo usuario
            </Button>
          ) : null
        }
      />
      <Pestanas opciones={opciones} valor={pestana} alCambiar={cambiarPestana} etiqueta="Camiones y usuarios" />
      <Dialog
        open={edicion !== false}
        onOpenChange={(abierta) => {
          if (!abierta) abrirEdicion(false);
        }}
      >
        <DialogContent aria-describedby={undefined}>
          {edicion !== false && (
            <FormularioCamion camion={edicion} sedes={sedes} alCerrar={() => abrirEdicion(false)} />
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={usuarioEdicion !== false}
        onOpenChange={(abierta) => {
          if (!abierta) abrirUsuario(false);
        }}
      >
        <DialogContent grande aria-describedby={undefined}>
          {usuarioEdicion !== false && (
            <FormularioUsuario
              usuario={usuarioEdicion}
              sedes={sedes}
              permisos={permisos}
              alCerrar={() => abrirUsuario(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={claveDe !== null}
        onOpenChange={(abierta) => {
          if (!abierta) abrirClave(null);
        }}
      >
        <DialogContent>{claveDe && <DialogoClave usuario={claveDe} alCerrar={() => abrirClave(null)} />}</DialogContent>
      </Dialog>
      <Dialog
        open={bloqueo !== null}
        onOpenChange={(abierta) => {
          if (!abierta) fijarBloqueo(null);
        }}
      >
        <DialogContent>
          {bloqueo !== null && (
            <>
              <div className="modal-cab">
                <DialogTitle>No se puede eliminar</DialogTitle>
              </div>
              <div className="modal-cuerpo">
                <DialogDescription className="confirmacion-texto">
                  {bloqueo} está elegido en «Envío por camión» de Facturación.
                </DialogDescription>
              </div>
              <div className="modal-pie">
                <DialogClose asChild>
                  <Button>Entendido</Button>
                </DialogClose>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function FormularioCamion({
  camion,
  sedes,
  alCerrar,
}: {
  camion: CamionVisible | null;
  sedes: SedeVisible[];
  alCerrar: () => void;
}) {
  const router = useRouter();
  const mensaje = useMensajes();
  const formulario = useForm<ValoresFormulario, unknown, EntradaCamion>({
    resolver: zodResolver(esquemaCamion),
    mode: "onBlur",
    defaultValues: {
      identificacion: camion?.identificacion ?? "",
      capacidadKg: camion ? formatoNumero(camion.capacidadKg) : "",
      sedeId: String(camion?.sedeId ?? sedes[0]?.id ?? ""),
    },
  });
  const errores = formulario.formState.errors;
  const ocupado = formulario.formState.isSubmitting;

  return (
    <form
      onSubmit={formulario.handleSubmit(async (valores) => {
        const resultado = camion
          ? await editarCamionAccion({ ...valores, id: camion.id })
          : await crearCamionAccion(valores);
        if (!resultado.ok) {
          mensaje(resultado.error, "error");
          return;
        }
        mensaje("Cambios guardados.");
        alCerrar();
        router.refresh();
      })}
    >
      <div className="modal-cab">
        <DialogTitle>{camion ? "Editar camión" : "Nuevo camión"}</DialogTitle>
      </div>
      <div className="modal-cuerpo">
        <div className="rejilla">
          <label className="campo">
            <span>Identificación</span>
            <Input
              autoComplete="off"
              aria-invalid={!!errores.identificacion}
              {...formulario.register("identificacion")}
            />
            {errores.identificacion && <small className="msg-error">{errores.identificacion.message}</small>}
          </label>
          <div className="rejilla r2">
            <label className="campo">
              <span>Capacidad máxima (kg)</span>
              <Input
                className="mono"
                inputMode="decimal"
                autoComplete="off"
                aria-invalid={!!errores.capacidadKg}
                {...formulario.register("capacidadKg")}
              />
              {errores.capacidadKg && <small className="msg-error">{errores.capacidadKg.message}</small>}
            </label>
            <label className="campo">
              <span>Sede</span>
              <SelectNativo aria-invalid={!!errores.sedeId} {...formulario.register("sedeId")}>
                {sedes.map((sede) => (
                  <option key={sede.id} value={sede.id}>
                    {sede.nombre}
                  </option>
                ))}
              </SelectNativo>
              {errores.sedeId && <small className="msg-error">{errores.sedeId.message}</small>}
            </label>
          </div>
        </div>
      </div>
      <div className="modal-pie">
        <DialogClose asChild>
          <Button variant="secundario" disabled={ocupado}>
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit" disabled={ocupado}>
          Guardar
        </Button>
      </div>
    </form>
  );
}
