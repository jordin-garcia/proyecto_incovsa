"use client";

import { useState } from "react";
import { Aviso } from "@/componentes/comunes/Aviso";
import { EncabezadoModulo } from "@/componentes/comunes/EncabezadoModulo";
import { Icono } from "@/componentes/comunes/iconos";
import { Tabla } from "@/componentes/comunes/Tabla";
import { Button } from "@/componentes/ui/button";
import {
  AdministracionUsuarios,
  type FilaUsuario,
  type GrupoPermiso,
  type SedeOpcion,
} from "@/componentes/usuarios/AdministracionUsuarios";

export type FilaCamion = { id: number; identificacion: string; capacidad: string; sede: string };

export function Configuracion({
  puedeUsuarios,
  puedeCamiones,
  pestanaInicial,
  usuarios,
  grupos,
  sedes,
  actorId,
  camiones,
}: {
  puedeUsuarios: boolean;
  puedeCamiones: boolean;
  pestanaInicial: "camiones" | "usuarios";
  usuarios: FilaUsuario[];
  grupos: GrupoPermiso[];
  sedes: SedeOpcion[];
  actorId: string;
  camiones: FilaCamion[];
}) {
  const opciones = [puedeCamiones ? ("camiones" as const) : null, puedeUsuarios ? ("usuarios" as const) : null].filter(
    (o) => o !== null,
  );
  const [pestana, setPestana] = useState<(typeof opciones)[number]>(
    opciones.includes(pestanaInicial) ? pestanaInicial : opciones[0]!,
  );
  const [abrirNuevo, setAbrirNuevo] = useState(0);

  return (
    <>
      <EncabezadoModulo
        eyebrow="Módulo de configuración"
        titulo="Camiones y usuarios"
        instruccion="Camiones de cada sede y usuarios del sistema de picking."
        acciones={
          pestana === "usuarios" ? (
            <Button onClick={() => setAbrirNuevo((n) => n + 1)}>
              <Icono nombre="mas" /> Nuevo usuario
            </Button>
          ) : null
        }
      />
      <div className="pestanas">
        {puedeCamiones ? (
          <button type="button" className={pestana === "camiones" ? "on" : ""} onClick={() => setPestana("camiones")}>
            Camiones <span className="cont">{camiones.length}</span>
          </button>
        ) : null}
        {puedeUsuarios ? (
          <button type="button" className={pestana === "usuarios" ? "on" : ""} onClick={() => setPestana("usuarios")}>
            Usuarios <span className="cont">{usuarios.length}</span>
          </button>
        ) : null}
      </div>
      <section className="tarjeta">
        {pestana === "camiones" ? (
          <Tabla>
            <thead>
              <tr>
                <th>Identificación</th>
                <th className="der">Capacidad máxima</th>
                <th>Sede</th>
              </tr>
            </thead>
            <tbody>
              {camiones.map((c) => (
                <tr key={c.id}>
                  <td>
                    <b>{c.identificacion}</b>
                  </td>
                  <td className="der kg">{c.capacidad}</td>
                  <td>{c.sede}</td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        ) : (
          <AdministracionUsuarios
            sistema="picking"
            usuarios={usuarios}
            grupos={grupos}
            sedes={sedes}
            actorId={actorId}
            abrirNuevo={abrirNuevo}
          />
        )}
      </section>
      {pestana === "usuarios" ? (
        <div style={{ marginTop: 16 }}>
          <Aviso>
            Las cuentas de Gerencia y Soporte sirven en los dos sistemas. Las demás son de un solo sistema, y una
            persona puede tener una cuenta en cada uno con el mismo nombre de usuario (RN-54).
          </Aviso>
        </div>
      ) : null}
    </>
  );
}
