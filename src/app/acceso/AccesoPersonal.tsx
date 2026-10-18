"use client";

/* eslint-disable @next/next/no-img-element -- Los recursos aprobados ya son WebP; se conserva el logotipo original. */
import { useSyncExternalStore, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import { Icono, type NombreIcono } from "@/componentes/comunes/iconos";
import { Aviso } from "@/componentes/comunes/Aviso";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/componentes/ui/dialog";
import { esquemaIngreso, esquemaUsuario, type DatosIngreso, type Sistema } from "./esquemas";
import { consultarUsuario, ingresar } from "./acciones";

export function AccesoPersonal({
  sistema,
  usuarioInicial = "",
  urlOdoo,
  sistemasIniciales,
}: {
  sistema?: Sistema;
  usuarioInicial?: string;
  urlOdoo?: string;
  sistemasIniciales?: { sitio: boolean; picking: boolean };
}) {
  const hidratado = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [usuario, cambiarUsuario] = useState(usuarioInicial);
  const [sistemas, cambiarSistemas] = useState<{ sitio: boolean; picking: boolean } | null>(sistemasIniciales ?? null);
  const [error, cambiarError] = useState("");
  const [mostrar, cambiarMostrar] = useState(false);
  const [ventana, abrirVentana] = useState<"odoo" | "clave" | null>(null);
  const paso = sistema ? 3 : sistemas ? 2 : 1;
  const tituloSistema = sistema === "picking" ? "Sistema de picking" : "Administración del sitio";
  const titulo = sistema ? tituloSistema : "Acceso personal";
  const descripcion = sistema
    ? sistema === "picking"
      ? "Control logístico de bodega: del pedido facturado a la entrega."
      : "Contenido del sitio público y documentación interna de productos."
    : paso === 1
      ? "Escriba su nombre de usuario. Después elija a qué sistema desea ingresar y escriba su contraseña."
      : "Lo que ve y hace cada persona depende de sus permisos.";
  const formularioUsuario = useForm<{ usuario: string }>({
    resolver: zodResolver(esquemaUsuario),
    mode: "onBlur",
    defaultValues: { usuario: "" },
  });
  const formularioIngreso = useForm<DatosIngreso>({
    resolver: zodResolver(esquemaIngreso),
    mode: "onBlur",
    defaultValues: { sistema, usuario: usuarioInicial, clave: "" },
  });
  const ocupada = formularioUsuario.formState.isSubmitting || formularioIngreso.formState.isSubmitting;
  const errorVisible =
    error ||
    formularioUsuario.formState.errors.usuario?.message ||
    (formularioIngreso.formState.isSubmitted ? formularioIngreso.formState.errors.clave?.message : undefined);
  const volver = (texto: string, href: string) => (
    <Link className="enlace acc-volver" href={href}>
      <Icono nombre="atras" className="ico-s" />
      {texto}
    </Link>
  );
  const opcion = (clave: Sistema, icono: NombreIcono, nombre: string, texto: string) => {
    const cuerpo = (
      <>
        <span className="ic">
          <Icono nombre={icono} className="ico-l" />
        </span>
        <div>
          <h3>{nombre}</h3>
          <p>{sistemas?.[clave] ? texto : "Su usuario no tiene cuenta en este sistema."}</p>
        </div>
        <Icono nombre={sistemas?.[clave] ? "flecha" : "candado"} />
      </>
    );
    return sistemas?.[clave] ? (
      <Link className="acc-op" href={`/acceso/${clave}`}>
        {cuerpo}
      </Link>
    ) : (
      <div className="acc-op deshabilitada" aria-disabled="true">
        {cuerpo}
      </div>
    );
  };
  return (
    <div className="acc-lay" data-hidratado={hidratado}>
      <aside className="acc-marca">
        <div className={`foto ${sistema === "sitio" ? "reunion" : "equipo"}`} />
        <div className="velo" />
        <Link href="/" className="acc-logo">
          <img src="/marca/incovsa-quimicos-blanco.webp" alt="INCOVSA Químicos" />
        </Link>
        <div className="acc-centro">
          <h1>{titulo}</h1>
          <p>{descripcion}</p>
        </div>
      </aside>
      <section className="acc-form" aria-label="Acceso para personal">
        <div className={paso === 2 ? "acc-sistemas" : "acc-campos"}>
          {paso === 1 ? (
            volver("Volver al sitio", "/")
          ) : paso === 2 ? (
            <button
              className="enlace acc-volver"
              type="button"
              onClick={() => {
                cambiarSistemas(null);
                cambiarError("");
              }}
            >
              <Icono nombre="atras" className="ico-s" />
              Usar otro usuario
            </button>
          ) : (
            volver("Elegir otro sistema", "/acceso")
          )}
          <p className="eyebrow">Acceso para personal · paso {paso} de 3</p>
          <h2>{paso === 1 ? "¿Quién es usted?" : paso === 2 ? "¿A dónde desea ingresar?" : tituloSistema}</h2>
          <p className="muted">
            {paso === 1 ? (
              "Use el usuario que le asignaron Gerencia o Soporte."
            ) : (
              <>
                Usuario <b className="mono acc-usuario">{usuario}</b>
                {paso === 3 ? (
                  <>.{sistema === "picking" ? " No hay selector de sede: sale de su cuenta." : ""}</>
                ) : null}
              </>
            )}
          </p>
          {paso === 1 && (
            <form
              noValidate
              className="rejilla acc-formulario"
              onSubmit={formularioUsuario.handleSubmit(async (datos) => {
                cambiarError("");
                const r = await consultarUsuario(datos);
                if (!r.ok) cambiarError(r.error);
                else {
                  cambiarUsuario(datos.usuario);
                  cambiarSistemas(r.datos);
                }
              })}
            >
              <label className="campo">
                <span>Usuario</span>
                <Input
                  {...formularioUsuario.register("usuario")}
                  placeholder="nombre.apellido"
                  autoCapitalize="off"
                  maxLength={60}
                  autoComplete="username"
                  aria-invalid={!!formularioUsuario.formState.errors.usuario}
                  autoFocus
                />
              </label>
              <div>{errorVisible && <Aviso tipo="rojo">{errorVisible}</Aviso>}</div>
              <Button size="grande" disabled={ocupada} type="submit">
                Continuar <Icono nombre="flecha" />
              </Button>
            </form>
          )}
          {paso === 2 && (
            <div className="acc-opciones">
              {urlOdoo ? (
                <a className="acc-op" href={urlOdoo} target="_blank" rel="noopener noreferrer">
                  <span className="ic">
                    <Icono nombre="externo" className="ico-l" />
                  </span>
                  <div>
                    <h3>Odoo</h3>
                    <p>El ERP con el que la empresa ya trabaja. Solo es un enlace; no hay intercambio de datos.</p>
                  </div>
                  <Icono nombre="flecha" />
                </a>
              ) : (
                <button className="acc-op" type="button" onClick={() => abrirVentana("odoo")}>
                  <span className="ic">
                    <Icono nombre="externo" className="ico-l" />
                  </span>
                  <div>
                    <h3>Odoo</h3>
                    <p>El ERP con el que la empresa ya trabaja. Solo es un enlace; no hay intercambio de datos.</p>
                  </div>
                  <Icono nombre="flecha" />
                </button>
              )}
              {opcion(
                "sitio",
                "globo",
                "Administración del sitio",
                "Contenido publicado y documentación interna de productos.",
              )}
              {opcion(
                "picking",
                "bodega",
                "Sistema de picking",
                "Facturación, bodega, ruta, reportes y configuración.",
              )}
            </div>
          )}
          {paso === 3 && (
            <form
              noValidate
              className="rejilla acc-formulario"
              onSubmit={formularioIngreso.handleSubmit(async (datos) => {
                cambiarError("");
                const r = await ingresar(datos);
                if (r && !r.ok) cambiarError(r.error);
              })}
            >
              <label className="campo">
                <span>Contraseña</span>
                <div className="acc-clave">
                  <Input
                    {...formularioIngreso.register("clave")}
                    type={mostrar ? "text" : "password"}
                    placeholder="Su contraseña"
                    autoComplete="current-password"
                    autoFocus
                    aria-invalid={formularioIngreso.formState.isSubmitted && !!formularioIngreso.formState.errors.clave}
                  />
                  <Button
                    variant="fantasma"
                    size="icono"
                    type="button"
                    aria-label={mostrar ? "Ocultar contraseña" : "Mostrar contraseña"}
                    onClick={() => cambiarMostrar(!mostrar)}
                  >
                    <Icono nombre="ojo" className="ico-s" />
                  </Button>
                </div>
              </label>
              <div>{errorVisible && <Aviso tipo="rojo">{errorVisible}</Aviso>}</div>
              <Button size="grande" disabled={ocupada} type="submit">
                Ingresar <Icono nombre="flecha" />
              </Button>
              <button className="enlace acc-olvido" type="button" onClick={() => abrirVentana("clave")}>
                ¿Olvidó su contraseña?
              </button>
            </form>
          )}
        </div>
      </section>
      <Dialog
        open={!!ventana}
        onOpenChange={(abierta) => {
          if (!abierta) abrirVentana(null);
        }}
      >
        <DialogContent>
          <div className="modal-cab">
            <DialogTitle>{ventana === "odoo" ? "Iniciar sesión en Odoo" : "¿Olvidó su contraseña?"}</DialogTitle>
          </div>
          <div className="modal-cuerpo">
            <DialogDescription className="muted">
              {ventana === "odoo"
                ? "Este botón abre el inicio de sesión de Odoo en otra pestaña, fuera del sitio. No hay intercambio de datos con Odoo."
                : "Pídale a Gerencia o a Soporte que la restablezcan."}
            </DialogDescription>
          </div>
          <div className="modal-pie">
            <DialogClose asChild>
              <Button>Entendido</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
