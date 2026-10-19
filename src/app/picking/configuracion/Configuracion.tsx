"use client";

import { useState } from "react";
import { Aviso } from "@/componentes/comunes/Aviso";
import { EncabezadoModulo } from "@/componentes/comunes/EncabezadoModulo";
import { Icono } from "@/componentes/comunes/iconos";
import { Button } from "@/componentes/ui/button";
import { Camiones, type FilaCamion, type SedeCamion } from "@/componentes/picking/configuracion/Camiones";

export function Configuracion({
  puedeUsuarios,
  pestanaInicial,
  totalUsuarios,
  sedes,
  camiones,
}: {
  puedeUsuarios: boolean;
  pestanaInicial: "camiones" | "usuarios";
  totalUsuarios: number;
  sedes: SedeCamion[];
  camiones: FilaCamion[];
}) {
  const opciones = ["camiones" as const, puedeUsuarios ? ("usuarios" as const) : null].filter((o) => o !== null);
  const [pestana, setPestana] = useState<(typeof opciones)[number]>(
    opciones.includes(pestanaInicial) ? pestanaInicial : "camiones",
  );
  const [abrirNuevo, setAbrirNuevo] = useState(0);

  return (
    <>
      <EncabezadoModulo
        eyebrow="Módulo de configuración"
        titulo="Camiones y usuarios"
        instruccion="Camiones de cada sede y usuarios del sistema de picking."
        acciones={
          pestana === "camiones" ? (
            <Button onClick={() => setAbrirNuevo((n) => n + 1)}>
              <Icono nombre="mas" /> Nuevo camión
            </Button>
          ) : null
        }
      />
      <div className="pestanas">
        <button type="button" className={pestana === "camiones" ? "on" : ""} onClick={() => setPestana("camiones")}>
          Camiones <span className="cont">{camiones.length}</span>
        </button>
        {puedeUsuarios ? (
          <button type="button" className={pestana === "usuarios" ? "on" : ""} onClick={() => setPestana("usuarios")}>
            Usuarios <span className="cont">{totalUsuarios}</span>
          </button>
        ) : null}
      </div>
      <section className="tarjeta">
        {pestana === "camiones" ? <Camiones camiones={camiones} sedes={sedes} abrirNuevo={abrirNuevo} /> : null}
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
