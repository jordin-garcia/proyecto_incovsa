"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Aviso } from "@/componentes/comunes/Aviso";
import { useMensajes } from "@/componentes/comunes/Mensajes";
import { Button } from "@/componentes/ui/button";
import { DialogClose, DialogTitle } from "@/componentes/ui/dialog";
import { Input } from "@/componentes/ui/input";
import { esAccesoTotal } from "@/lib/roles";
import { crearUsuarioAccion, editarUsuarioAccion } from "@/modulos/usuarios/acciones";
import {
  esquemaCrearUsuarioPicking,
  esquemaEditarUsuarioPicking,
  type EntradaCrearUsuario,
  type EntradaEditarUsuario,
} from "@/modulos/usuarios/esquemas";
import type { PermisoCatalogo, SedeCatalogo, UsuarioVisible } from "@/modulos/usuarios/tipos";
import { CasillasPermisos } from "./CasillasPermisos";
import { CasillasSedes } from "./CasillasSedes";

type Errores = {
  nombre?: string;
  usuario?: string;
  rol?: string;
  correo?: string;
  clave?: string;
  confirmarClave?: string;
  sedesIds?: string;
};

function comoNumeros(valores: readonly (string | number)[] | undefined) {
  return (valores ?? []).map((valor) => (typeof valor === "number" ? valor : Number(valor)));
}

function alternarNumero(actual: readonly (string | number)[] | undefined, id: number, marcado: boolean) {
  const numeros = comoNumeros(actual);
  return marcado ? [...new Set([...numeros, id])] : numeros.filter((item) => item !== id);
}

function conCambio(registro: UseFormRegisterReturn, alCambiar: (valor: string) => void): UseFormRegisterReturn {
  return {
    ...registro,
    onChange: (evento) => {
      alCambiar(evento.target.value);
      return registro.onChange(evento);
    },
  };
}

function alternarTexto(actual: readonly string[] | undefined, codigo: string, marcado: boolean) {
  const lista = actual ?? [];
  return marcado ? [...new Set([...lista, codigo])] : lista.filter((item) => item !== codigo);
}

function Campos({
  registros,
  errores,
  rol,
  usuarioLectura,
  mostrarClave,
  mostrarActivo,
  activo,
  sedes,
  permisos,
  sedesMarcadas,
  permisosMarcados,
  alAlternarSede,
  alAlternarPermiso,
  alCambiarActivo,
}: {
  registros: {
    nombre: UseFormRegisterReturn;
    rol: UseFormRegisterReturn;
    correo: UseFormRegisterReturn;
    usuario?: UseFormRegisterReturn;
    clave?: UseFormRegisterReturn;
    confirmarClave?: UseFormRegisterReturn;
  };
  errores: Errores;
  rol: string;
  usuarioLectura?: string;
  mostrarClave: boolean;
  mostrarActivo: boolean;
  activo?: boolean;
  sedes: readonly SedeCatalogo[];
  permisos: readonly PermisoCatalogo[];
  sedesMarcadas: readonly (string | number)[];
  permisosMarcados: readonly string[];
  alAlternarSede: (id: number, marcado: boolean) => void;
  alAlternarPermiso: (codigo: string, marcado: boolean) => void;
  alCambiarActivo?: (activo: boolean) => void;
}) {
  const total = esAccesoTotal(rol);
  return (
    <div className="rejilla">
      <div className="rejilla r2">
        <label className="campo">
          <span>Nombre completo</span>
          <Input autoComplete="name" aria-invalid={!!errores.nombre} {...registros.nombre} />
          {errores.nombre && <small className="msg-error">{errores.nombre}</small>}
        </label>
        <label className="campo">
          <span>Usuario</span>
          {usuarioLectura !== undefined ? (
            <Input className="mono" value={usuarioLectura} readOnly autoComplete="off" />
          ) : (
            <Input
              className="mono"
              autoComplete="off"
              autoCapitalize="off"
              placeholder="nombre.apellido"
              aria-invalid={!!errores.usuario}
              {...registros.usuario}
            />
          )}
          {errores.usuario && <small className="msg-error">{errores.usuario}</small>}
        </label>
      </div>
      {mostrarClave && registros.clave && registros.confirmarClave && (
        <div className="rejilla r2">
          <label className="campo">
            <span>Contraseña</span>
            <Input
              type="password"
              autoComplete="new-password"
              placeholder="Al menos 8 caracteres"
              aria-invalid={!!errores.clave}
              {...registros.clave}
            />
            {errores.clave && <small className="msg-error">{errores.clave}</small>}
          </label>
          <label className="campo">
            <span>Repita la contraseña</span>
            <Input
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errores.confirmarClave}
              {...registros.confirmarClave}
            />
            {errores.confirmarClave && <small className="msg-error">{errores.confirmarClave}</small>}
          </label>
        </div>
      )}
      <div className="rejilla r2">
        <label className="campo">
          <span>Rol</span>
          <Input
            autoComplete="off"
            aria-invalid={!!errores.rol}
            {...registros.rol}
            placeholder="Por ejemplo: Facturador"
          />
          <small>Texto libre. Gerencia y Soporte tienen acceso total a los dos sistemas y a todas las sedes.</small>
          {errores.rol && <small className="msg-error">{errores.rol}</small>}
        </label>
        <label className="campo">
          <span>Correo (opcional)</span>
          <Input autoComplete="off" aria-invalid={!!errores.correo} {...registros.correo} />
          {errores.correo && <small className="msg-error">{errores.correo}</small>}
        </label>
      </div>
      {total && (
        <Aviso>
          Con el rol <b>Gerencia</b> o <b>Soporte</b> la cuenta tiene todos los permisos de los dos sistemas y todas las
          sedes, y sirve en los dos inicios de sesión.
        </Aviso>
      )}
      <div className={total ? "campo apagado" : "campo"}>
        <span>Sedes a las que tiene acceso</span>
        <CasillasSedes
          sedes={sedes}
          marcadas={comoNumeros(sedesMarcadas)}
          deshabilitadas={total}
          alAlternar={alAlternarSede}
        />
        {errores.sedesIds && <small className="msg-error">{errores.sedesIds}</small>}
      </div>
      <div className={total ? "campo apagado" : "campo"}>
        <span>Permisos del sistema de picking</span>
        <CasillasPermisos
          permisos={permisos}
          marcados={permisosMarcados}
          deshabilitadas={total}
          alAlternar={alAlternarPermiso}
        />
      </div>
      <p className="muted" style={{ fontSize: "13.5px" }}>
        Los usuarios con rol <b>Piloto</b> se eligen en «Envío por camión» de Facturación y ven solo sus rutas.
      </p>
      {mostrarActivo && (
        <>
          <label className="chk">
            <input type="checkbox" checked={!!activo} onChange={(evento) => alCambiarActivo?.(evento.target.checked)} />{" "}
            Cuenta activa
          </label>
          <p className="muted" style={{ fontSize: "13.5px" }}>
            La contraseña se cambia con el botón «Contraseña» de la lista.
          </p>
        </>
      )}
    </div>
  );
}

function Pie({ ocupado }: { ocupado: boolean }) {
  return (
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
  );
}

export function FormularioUsuario({
  usuario,
  sedes,
  permisos,
  alCerrar,
}: {
  usuario: UsuarioVisible | null;
  sedes: readonly SedeCatalogo[];
  permisos: readonly PermisoCatalogo[];
  alCerrar: () => void;
}) {
  if (usuario) return <FormularioEditar usuario={usuario} sedes={sedes} permisos={permisos} alCerrar={alCerrar} />;
  return <FormularioCrear sedes={sedes} permisos={permisos} alCerrar={alCerrar} />;
}

function FormularioCrear({
  sedes,
  permisos,
  alCerrar,
}: {
  sedes: readonly SedeCatalogo[];
  permisos: readonly PermisoCatalogo[];
  alCerrar: () => void;
}) {
  const router = useRouter();
  const mensaje = useMensajes();
  const formulario = useForm<z.input<typeof esquemaCrearUsuarioPicking>, unknown, EntradaCrearUsuario>({
    resolver: zodResolver(esquemaCrearUsuarioPicking),
    mode: "onBlur",
    defaultValues: {
      nombre: "",
      usuario: "",
      clave: "",
      confirmarClave: "",
      rol: "",
      correo: "",
      sedesIds: [],
      permisosCodigos: [],
    },
  });
  const errores = formulario.formState.errors;
  const [rol, setRol] = useState("");
  const [sedesMarcadas, setSedesMarcadas] = useState<number[]>([]);
  const [permisosMarcados, setPermisosMarcados] = useState<string[]>([]);

  return (
    <form
      onSubmit={formulario.handleSubmit(async (valores) => {
        const resultado = await crearUsuarioAccion(valores);
        if (!resultado.ok) {
          mensaje(resultado.error, "error");
          return;
        }
        mensaje("Usuario guardado.");
        alCerrar();
        router.refresh();
      })}
    >
      <div className="modal-cab">
        <DialogTitle>Nuevo usuario del picking</DialogTitle>
      </div>
      <div className="modal-cuerpo">
        <Campos
          registros={{
            nombre: formulario.register("nombre"),
            usuario: formulario.register("usuario"),
            rol: conCambio(formulario.register("rol"), setRol),
            correo: formulario.register("correo"),
            clave: formulario.register("clave"),
            confirmarClave: formulario.register("confirmarClave"),
          }}
          errores={{
            nombre: errores.nombre?.message,
            usuario: errores.usuario?.message,
            rol: errores.rol?.message,
            correo: errores.correo?.message,
            clave: errores.clave?.message,
            confirmarClave: errores.confirmarClave?.message,
            sedesIds: errores.sedesIds?.message,
          }}
          rol={rol}
          mostrarClave
          mostrarActivo={false}
          sedes={sedes}
          permisos={permisos}
          sedesMarcadas={sedesMarcadas}
          permisosMarcados={permisosMarcados}
          alAlternarSede={(id, marcado) => {
            const siguiente = alternarNumero(sedesMarcadas, id, marcado);
            setSedesMarcadas(siguiente);
            formulario.setValue("sedesIds", siguiente, { shouldValidate: true });
          }}
          alAlternarPermiso={(codigo, marcado) => {
            const siguiente = alternarTexto(permisosMarcados, codigo, marcado);
            setPermisosMarcados(siguiente);
            formulario.setValue("permisosCodigos", siguiente, { shouldValidate: true });
          }}
        />
      </div>
      <Pie ocupado={formulario.formState.isSubmitting} />
    </form>
  );
}

function FormularioEditar({
  usuario,
  sedes,
  permisos,
  alCerrar,
}: {
  usuario: UsuarioVisible;
  sedes: readonly SedeCatalogo[];
  permisos: readonly PermisoCatalogo[];
  alCerrar: () => void;
}) {
  const router = useRouter();
  const mensaje = useMensajes();
  const formulario = useForm<z.input<typeof esquemaEditarUsuarioPicking>, unknown, EntradaEditarUsuario>({
    resolver: zodResolver(esquemaEditarUsuarioPicking),
    mode: "onBlur",
    defaultValues: {
      id: usuario.id,
      nombre: usuario.nombre,
      rol: usuario.rol,
      correo: usuario.correo ?? "",
      sedesIds: usuario.sedesIds,
      permisosCodigos: usuario.permisosCodigos,
      activo: usuario.activo,
    },
  });
  const errores = formulario.formState.errors;
  const [rol, setRol] = useState(usuario.rol);
  const [activo, setActivo] = useState(usuario.activo);
  const [sedesMarcadas, setSedesMarcadas] = useState<number[]>(usuario.sedesIds);
  const [permisosMarcados, setPermisosMarcados] = useState<string[]>(usuario.permisosCodigos);

  return (
    <form
      onSubmit={formulario.handleSubmit(async (valores) => {
        const resultado = await editarUsuarioAccion(valores);
        if (!resultado.ok) {
          mensaje(resultado.error, "error");
          return;
        }
        mensaje("Usuario guardado.");
        alCerrar();
        router.refresh();
      })}
    >
      <div className="modal-cab">
        <DialogTitle>Editar usuario del picking</DialogTitle>
      </div>
      <div className="modal-cuerpo">
        <Campos
          registros={{
            nombre: formulario.register("nombre"),
            rol: conCambio(formulario.register("rol"), setRol),
            correo: formulario.register("correo"),
          }}
          errores={{
            nombre: errores.nombre?.message,
            rol: errores.rol?.message,
            correo: errores.correo?.message,
            sedesIds: errores.sedesIds?.message,
          }}
          rol={rol}
          usuarioLectura={usuario.usuario}
          mostrarClave={false}
          mostrarActivo
          activo={activo}
          sedes={sedes}
          permisos={permisos}
          sedesMarcadas={sedesMarcadas}
          permisosMarcados={permisosMarcados}
          alAlternarSede={(id, marcado) => {
            const siguiente = alternarNumero(sedesMarcadas, id, marcado);
            setSedesMarcadas(siguiente);
            formulario.setValue("sedesIds", siguiente, { shouldValidate: true });
          }}
          alAlternarPermiso={(codigo, marcado) => {
            const siguiente = alternarTexto(permisosMarcados, codigo, marcado);
            setPermisosMarcados(siguiente);
            formulario.setValue("permisosCodigos", siguiente, { shouldValidate: true });
          }}
          alCambiarActivo={(valor) => {
            setActivo(valor);
            formulario.setValue("activo", valor);
          }}
        />
      </div>
      <Pie ocupado={formulario.formState.isSubmitting} />
    </form>
  );
}
