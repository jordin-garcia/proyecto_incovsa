"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { esAccesoTotal } from "@/lib/roles";
import { Aviso } from "@/componentes/comunes/Aviso";
import { Icono } from "@/componentes/comunes/iconos";
import { useMensajes } from "@/componentes/comunes/Mensajes";
import { Tabla } from "@/componentes/comunes/Tabla";
import { Button } from "@/componentes/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/componentes/ui/dialog";
import { Input } from "@/componentes/ui/input";
import {
  crearUsuarioAccion,
  editarUsuarioAccion,
  eliminarUsuarioAccion,
  restablecerContrasenaAccion,
} from "@/modulos/usuarios/acciones";

export type FilaUsuario = {
  id: string;
  nombre: string;
  usuario: string;
  rol: string;
  correo: string | null;
  activo: boolean;
  sistema: "picking" | "sitio" | "ambos";
  accesoTotal: boolean;
  sedes: { id: number; nombre: string }[];
  permisos: string[];
};
export type GrupoPermiso = { modulo: string; permisos: { codigo: string; descripcion: string }[] };
export type SedeOpcion = { id: number; nombre: string };

type Dialogo = { tipo: "crear" } | { tipo: "editar" | "clave" | "eliminar"; usuario: FilaUsuario } | null;

const vacio = { nombre: "", usuario: "", rol: "", correo: "", clave: "", confirmarClave: "", activo: true };

export function AdministracionUsuarios({
  sistema,
  usuarios,
  grupos,
  sedes,
  actorId,
  abrirNuevo = 0,
}: {
  sistema: "picking" | "sitio";
  usuarios: FilaUsuario[];
  grupos: GrupoPermiso[];
  sedes: SedeOpcion[];
  actorId: string;
  abrirNuevo?: number;
}) {
  const router = useRouter();
  const mensaje = useMensajes();
  const [marca, setMarca] = useState(abrirNuevo);
  const [dialogo, setDialogo] = useState<Dialogo>(null);
  const [form, setForm] = useState(vacio);
  const [permisos, setPermisos] = useState<string[]>([]);
  const [sedesMarcadas, setSedes] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  if (abrirNuevo !== marca) {
    setMarca(abrirNuevo);
    if (abrirNuevo > 0) abrir({ tipo: "crear" });
  }

  function abrir(siguiente: Dialogo) {
    setError("");
    setDialogo(siguiente);
    if (siguiente?.tipo === "editar") {
      setForm({
        ...vacio,
        nombre: siguiente.usuario.nombre,
        rol: siguiente.usuario.rol,
        correo: siguiente.usuario.correo ?? "",
        activo: siguiente.usuario.activo,
      });
      setPermisos(siguiente.usuario.permisos);
      setSedes(siguiente.usuario.sedes.map((s) => s.id));
    } else {
      setForm(vacio);
      setPermisos([]);
      setSedes([]);
    }
  }

  const total = esAccesoTotal(form.rol);
  const otro = sistema === "picking" ? "sitio" : "picking";

  async function guardar() {
    setOcupado(true);
    setError("");
    const comun = {
      sistema,
      nombre: form.nombre,
      rol: form.rol,
      correo: form.correo,
      permisos: total ? [] : permisos,
      sedes: total || sistema === "sitio" ? [] : sedesMarcadas,
    };
    const resultado =
      dialogo?.tipo === "editar"
        ? await editarUsuarioAccion({ ...comun, id: dialogo.usuario.id, activo: form.activo })
        : await crearUsuarioAccion({
            ...comun,
            usuario: form.usuario,
            clave: form.clave,
            confirmarClave: form.confirmarClave,
          });
    setOcupado(false);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    setDialogo(null);
    mensaje("Usuario guardado.");
    router.refresh();
  }

  async function restablecer() {
    if (dialogo?.tipo !== "clave") return;
    setOcupado(true);
    setError("");
    const resultado = await restablecerContrasenaAccion({
      id: dialogo.usuario.id,
      sistema,
      clave: form.clave,
      confirmarClave: form.confirmarClave,
    });
    setOcupado(false);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    setDialogo(null);
    mensaje("Contraseña restablecida.");
    router.refresh();
  }

  async function eliminar() {
    if (dialogo?.tipo !== "eliminar") return;
    setOcupado(true);
    setError("");
    const resultado = await eliminarUsuarioAccion({ id: dialogo.usuario.id, sistema });
    setOcupado(false);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    setDialogo(null);
    mensaje("Usuario eliminado.");
    router.refresh();
  }

  function alternar(lista: string[], valor: string, poner: (v: string[]) => void) {
    poner(lista.includes(valor) ? lista.filter((x) => x !== valor) : [...lista, valor]);
  }

  return (
    <>
      <Tabla>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Usuario</th>
            <th>Rol</th>
            {sistema === "picking" ? <th>Sedes</th> : null}
            <th>{sistema === "picking" ? "Permisos del picking" : "Permisos del sitio"}</th>
            {sistema === "sitio" ? <th>Correo</th> : null}
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span className="avatar" style={{ width: 34, height: 34, fontSize: 12.5 }}>
                    {iniciales(u.nombre)}
                  </span>
                  <b>{u.nombre}</b>
                </div>
              </td>
              <td className="mono">{u.usuario}</td>
              <td>
                {u.rol}
                {u.sistema === "ambos" || u.accesoTotal ? <span className="chip"> + {otro}</span> : null}
              </td>
              {sistema === "picking" ? (
                <td>{u.accesoTotal ? "Todas" : u.sedes.map((s) => s.nombre).join(", ") || "—"}</td>
              ) : null}
              <td>
                {u.accesoTotal ? (
                  <span className="chip chip-o">Acceso total</span>
                ) : (
                  <span className={`chip${u.permisos.length ? " chip-v" : ""}`}>{u.permisos.length} permiso(s)</span>
                )}
              </td>
              {sistema === "sitio" ? <td className="muted">{u.correo || "Sin correo"}</td> : null}
              <td>
                <span className={`chip${u.activo ? " chip-v" : ""}`}>{u.activo ? "Activo" : "Inactivo"}</span>
              </td>
              <td className="der" style={{ whiteSpace: "nowrap" }}>
                <Button
                  variant="secundario"
                  size="pequeno"
                  title="Editar"
                  aria-label="Editar"
                  onClick={() => abrir({ tipo: "editar", usuario: u })}
                >
                  <Icono nombre="editar" className="ico-s" />
                </Button>{" "}
                <Button variant="secundario" size="pequeno" onClick={() => abrir({ tipo: "clave", usuario: u })}>
                  <Icono nombre="llave" className="ico-s" /> Contraseña
                </Button>{" "}
                <Button
                  variant="fantasma"
                  size="pequeno"
                  title="Eliminar"
                  aria-label="Eliminar"
                  onClick={() => {
                    if (u.id === actorId) {
                      mensaje("No puede eliminar su propia cuenta.", "error");
                      return;
                    }
                    abrir({ tipo: "eliminar", usuario: u });
                  }}
                >
                  <Icono nombre="borrar" className="ico-s" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Tabla>

      <Dialog
        open={dialogo?.tipo === "crear" || dialogo?.tipo === "editar"}
        onOpenChange={(abierto) => !ocupado && !abierto && setDialogo(null)}
      >
        <DialogContent grande>
          <div className="modal-cab">
            <DialogTitle>
              {dialogo?.tipo === "editar" ? "Editar usuario" : "Nuevo usuario"}{" "}
              {sistema === "picking" ? "del picking" : "del sitio"}
            </DialogTitle>
            <DialogDescription className="muted">
              Nombre, usuario, rol, permisos y, en el picking, sedes.
            </DialogDescription>
          </div>
          <div className="modal-cuerpo">
            <div className="rejilla">
              <div className="rejilla r2">
                <label className="campo">
                  <span>Nombre completo</span>
                  <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                </label>
                <label className="campo">
                  <span>Usuario</span>
                  <Input
                    className="mono"
                    value={dialogo?.tipo === "editar" ? dialogo.usuario.usuario : form.usuario}
                    readOnly={dialogo?.tipo === "editar"}
                    placeholder="nombre.apellido"
                    autoCapitalize="off"
                    onChange={(e) => setForm({ ...form, usuario: e.target.value })}
                  />
                </label>
              </div>
              {dialogo?.tipo === "crear" ? <Claves form={form} setForm={setForm} etiqueta="Contraseña" /> : null}
              <div className="rejilla r2">
                <label className="campo">
                  <span>Rol</span>
                  <Input
                    value={form.rol}
                    placeholder="Por ejemplo: Facturador"
                    onChange={(e) => setForm({ ...form, rol: e.target.value })}
                  />
                  <small>
                    Texto libre. Gerencia y Soporte tienen acceso total a los dos sistemas y a todas las sedes.
                  </small>
                </label>
                <label className="campo">
                  <span>Correo (opcional)</span>
                  <Input value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} />
                </label>
              </div>
              {total ? (
                <Aviso>
                  Con el rol <b>Gerencia</b> o <b>Soporte</b> la cuenta tiene todos los permisos de los dos sistemas y
                  todas las sedes, y sirve en los dos inicios de sesión.
                </Aviso>
              ) : null}
              {sistema === "picking" ? (
                <div className="campo" style={total ? { opacity: 0.55 } : undefined}>
                  <span>Sedes a las que tiene acceso</span>
                  <div className="sedes-chk">
                    {sedes.map((s) => (
                      <label className="chk" key={s.id}>
                        <input
                          type="checkbox"
                          disabled={total}
                          checked={sedesMarcadas.includes(s.id)}
                          onChange={() =>
                            setSedes(
                              sedesMarcadas.includes(s.id)
                                ? sedesMarcadas.filter((id) => id !== s.id)
                                : [...sedesMarcadas, s.id],
                            )
                          }
                        />
                        {s.nombre}
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="campo" style={total ? { opacity: 0.55 } : undefined}>
                <span>Permisos {sistema === "picking" ? "del sistema de picking" : "del sitio web"}</span>
                <div className="permisos">
                  {grupos.map((g) => (
                    <fieldset key={g.modulo}>
                      <legend>{g.modulo}</legend>
                      {g.permisos.map((p) => (
                        <label className="chk" key={p.codigo}>
                          <input
                            type="checkbox"
                            disabled={total}
                            checked={permisos.includes(p.codigo)}
                            onChange={() => alternar(permisos, p.codigo, setPermisos)}
                          />
                          {p.descripcion}
                        </label>
                      ))}
                    </fieldset>
                  ))}
                </div>
              </div>
              {sistema === "picking" ? (
                <p className="muted" style={{ fontSize: 13.5 }}>
                  Los usuarios con rol <b>Piloto</b> se eligen en «Envío por camión» de Facturación y ven solo sus
                  rutas.
                </p>
              ) : null}
              {dialogo?.tipo === "editar" ? (
                <>
                  <label className="chk">
                    <input
                      type="checkbox"
                      checked={form.activo}
                      onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                    />{" "}
                    Cuenta activa
                  </label>
                  <p className="muted" style={{ fontSize: 13.5 }}>
                    La contraseña se cambia con el botón «Contraseña» de la lista.
                  </p>
                </>
              ) : null}
              {error ? <Aviso tipo="rojo">{error}</Aviso> : null}
            </div>
          </div>
          <div className="modal-pie">
            <Button variant="secundario" onClick={() => setDialogo(null)} disabled={ocupado}>
              Cancelar
            </Button>
            <Button onClick={guardar} disabled={ocupado}>
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogo?.tipo === "clave"} onOpenChange={(abierto) => !ocupado && !abierto && setDialogo(null)}>
        <DialogContent>
          <div className="modal-cab">
            <DialogTitle>Restablecer contraseña</DialogTitle>
          </div>
          <div className="modal-cuerpo">
            {dialogo?.tipo === "clave" ? (
              <p style={{ color: "var(--g600)", fontSize: 15.5, marginBottom: 14 }}>
                Escriba la nueva contraseña de <b>{dialogo.usuario.nombre}</b> (
                <span className="mono">{dialogo.usuario.usuario}</span>) y entréguesela a la persona. No se envía nada
                por correo.
              </p>
            ) : null}
            <Claves form={form} setForm={setForm} etiqueta="Nueva contraseña" />
            {error ? <Aviso tipo="rojo">{error}</Aviso> : null}
          </div>
          <div className="modal-pie">
            <Button variant="secundario" onClick={() => setDialogo(null)} disabled={ocupado}>
              Cancelar
            </Button>
            <Button onClick={restablecer} disabled={ocupado}>
              Restablecer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogo?.tipo === "eliminar"} onOpenChange={(abierto) => !ocupado && !abierto && setDialogo(null)}>
        <DialogContent>
          <div className="modal-cab">
            <DialogTitle>Eliminar usuario</DialogTitle>
          </div>
          <div className="modal-cuerpo">
            {dialogo?.tipo === "eliminar" ? (
              <p>
                ¿Eliminar a <b>{dialogo.usuario.nombre}</b> (<span className="mono">{dialogo.usuario.usuario}</span>)?{" "}
                {dialogo.usuario.sistema === "ambos" || dialogo.usuario.accesoTotal
                  ? "La cuenta se elimina de los dos sistemas. "
                  : null}
                Su nombre se conserva en la bitácora y en los registros donde aparece.
              </p>
            ) : null}
            {error ? <Aviso tipo="rojo">{error}</Aviso> : null}
          </div>
          <div className="modal-pie">
            <Button variant="secundario" onClick={() => setDialogo(null)} disabled={ocupado}>
              Cancelar
            </Button>
            <Button variant="peligro" onClick={eliminar} disabled={ocupado}>
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Claves({
  form,
  setForm,
  etiqueta,
}: {
  form: typeof vacio;
  setForm: (f: typeof vacio) => void;
  etiqueta: string;
}) {
  return (
    <div className="rejilla r2">
      <label className="campo">
        <span>{etiqueta}</span>
        <Input
          type="password"
          autoComplete="new-password"
          placeholder="Al menos 8 caracteres"
          value={form.clave}
          onChange={(e) => setForm({ ...form, clave: e.target.value })}
        />
      </label>
      <label className="campo">
        <span>Repita la contraseña</span>
        <Input
          type="password"
          autoComplete="new-password"
          value={form.confirmarClave}
          onChange={(e) => setForm({ ...form, confirmarClave: e.target.value })}
        />
      </label>
    </div>
  );
}

function iniciales(nombre: string) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
