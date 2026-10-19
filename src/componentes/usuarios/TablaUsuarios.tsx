"use client";

import { Button } from "@/componentes/ui/button";
import { Icono } from "@/componentes/comunes/iconos";
import { useMensajes } from "@/componentes/comunes/Mensajes";
import { Tabla } from "@/componentes/comunes/Tabla";
import { VentanaConfirmacion } from "@/componentes/comunes/VentanaConfirmacion";
import type { SistemaPestana, UsuarioVisible } from "@/modulos/usuarios/tipos";
import { ResumenPermisos } from "./ResumenPermisos";
import { TEXTOS_USUARIO } from "./textos";

function iniciales(nombre: string) {
  const partes = nombre.split(/\s+/).filter((parte) => /^[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(parte[0] ?? ""));
  return (
    partes
      .slice(0, 2)
      .map((parte) => parte[0]!.toUpperCase())
      .join("") || "U"
  );
}

export function TablaUsuarios({
  usuarios,
  usuarioActualId,
  sistema = "picking",
  alEditar,
  alRestablecer,
  alEliminar,
}: {
  usuarios: readonly UsuarioVisible[];
  usuarioActualId: string;
  sistema?: SistemaPestana;
  alEditar: (usuario: UsuarioVisible) => void;
  alRestablecer: (usuario: UsuarioVisible) => void;
  alEliminar: (id: string) => Promise<void>;
}) {
  const mensaje = useMensajes();
  const textos = TEXTOS_USUARIO[sistema];
  return (
    <Tabla>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Usuario</th>
          <th>Rol</th>
          {textos.muestraSedes && <th>Sedes</th>}
          <th>{textos.columnaPermisos}</th>
          {textos.muestraCorreo && <th>Correo</th>}
          <th>Estado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map((usuario) => {
          const total = usuario.accesoTotal || usuario.sistema === "ambos";
          return (
            <tr key={usuario.id}>
              <td>
                <div className="fila-usuario">
                  <span className="avatar" title={usuario.nombre}>
                    {iniciales(usuario.nombre)}
                  </span>
                  <b>{usuario.nombre}</b>
                </div>
              </td>
              <td className="mono">{usuario.usuario}</td>
              <td>
                {usuario.rol}
                {total ? " " : ""}
                {total && <span className="chip">{textos.chipOtro}</span>}
              </td>
              {textos.muestraSedes && <td>{usuario.accesoTotal ? "Todas" : usuario.sedesNombres.join(", ") || "—"}</td>}
              <td>
                <ResumenPermisos accesoTotal={usuario.accesoTotal} cantidad={usuario.permisosCodigos.length} />
              </td>
              {textos.muestraCorreo && <td className="muted">{usuario.correo || "Sin correo"}</td>}
              <td>
                <span className={usuario.activo ? "chip chip-v" : "chip"}>
                  {usuario.activo ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="der">
                <Button
                  variant="secundario"
                  size="pequeno"
                  aria-label="Editar"
                  title="Editar"
                  onClick={() => alEditar(usuario)}
                >
                  <Icono nombre="editar" className="ico-s" />
                </Button>{" "}
                <Button variant="secundario" size="pequeno" onClick={() => alRestablecer(usuario)}>
                  <Icono nombre="llave" className="ico-s" /> Contraseña
                </Button>{" "}
                {usuario.id === usuarioActualId ? (
                  <Button
                    variant="fantasma"
                    size="pequeno"
                    aria-label="Eliminar"
                    title="Eliminar"
                    onClick={() => mensaje("No puede eliminar su propia cuenta.", "error")}
                  >
                    <Icono nombre="borrar" className="ico-s" />
                  </Button>
                ) : (
                  <VentanaConfirmacion
                    titulo="Eliminar usuario"
                    texto={
                      <>
                        ¿Eliminar a <b>{usuario.nombre}</b> (<span className="mono">{usuario.usuario}</span>)?{" "}
                        {usuario.sistema === "ambos" || usuario.accesoTotal
                          ? "La cuenta se elimina de los dos sistemas. "
                          : ""}
                        Su nombre se conserva en la bitácora y en los registros donde aparece.
                      </>
                    }
                    textoConfirmar="Eliminar"
                    variante="peligro"
                    alConfirmar={() => alEliminar(usuario.id)}
                  >
                    <Button variant="fantasma" size="pequeno" aria-label="Eliminar" title="Eliminar">
                      <Icono nombre="borrar" className="ico-s" />
                    </Button>
                  </VentanaConfirmacion>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </Tabla>
  );
}
