"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Aviso } from "@/componentes/comunes/Aviso";
import { Icono } from "@/componentes/comunes/iconos";
import { useMensajes } from "@/componentes/comunes/Mensajes";
import { Tabla } from "@/componentes/comunes/Tabla";
import { Button } from "@/componentes/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/componentes/ui/dialog";
import { Input } from "@/componentes/ui/input";
import { eliminarCamionAccion, guardarCamionAccion } from "@/modulos/camiones/acciones";

export type FilaCamion = {
  id: number;
  identificacion: string;
  capacidad: string;
  capacidadEditable: string;
  sedeId: number;
  sede: string;
};

export type SedeCamion = { id: number; nombre: string };

type Dialogo = { tipo: "guardar"; camion: FilaCamion | null } | { tipo: "eliminar"; camion: FilaCamion } | null;

export function Camiones({
  camiones,
  sedes,
  abrirNuevo = 0,
}: {
  camiones: FilaCamion[];
  sedes: SedeCamion[];
  abrirNuevo?: number;
}) {
  const router = useRouter();
  const mensaje = useMensajes();
  const [marca, setMarca] = useState(abrirNuevo);
  const [dialogo, setDialogo] = useState<Dialogo>(null);
  const [identificacion, setIdentificacion] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [sedeId, setSedeId] = useState(sedes[0]?.id ?? 0);
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);

  if (abrirNuevo !== marca) {
    setMarca(abrirNuevo);
    if (abrirNuevo > 0) abrir(null);
  }

  function abrir(camion: FilaCamion | null) {
    setError("");
    setIdentificacion(camion?.identificacion ?? "");
    setCapacidad(camion?.capacidadEditable ?? "");
    setSedeId(camion?.sedeId ?? sedes[0]?.id ?? 0);
    setDialogo({ tipo: "guardar", camion });
  }

  async function guardar() {
    if (dialogo?.tipo !== "guardar") return;
    setOcupado(true);
    const resultado = await guardarCamionAccion({
      ...(dialogo.camion ? { id: dialogo.camion.id } : {}),
      identificacion,
      capacidad,
      sedeId,
    });
    setOcupado(false);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    setDialogo(null);
    mensaje("Cambios guardados.");
    router.refresh();
  }

  async function eliminar() {
    if (dialogo?.tipo !== "eliminar") return;
    setOcupado(true);
    const resultado = await eliminarCamionAccion({ id: dialogo.camion.id });
    setOcupado(false);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    setDialogo(null);
    mensaje("Camión eliminado.");
    router.refresh();
  }

  return (
    <>
      <Tabla>
        <thead>
          <tr>
            <th>Identificación</th>
            <th className="der">Capacidad máxima</th>
            <th>Sede</th>
            <th />
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
              <td className="der" style={{ whiteSpace: "nowrap" }}>
                <Button variant="secundario" size="pequeno" aria-label="Editar" title="Editar" onClick={() => abrir(c)}>
                  <Icono nombre="editar" className="ico-s" />
                </Button>{" "}
                <Button
                  variant="fantasma"
                  size="pequeno"
                  aria-label="Eliminar"
                  title="Eliminar"
                  onClick={() => {
                    setError("");
                    setDialogo({ tipo: "eliminar", camion: c });
                  }}
                >
                  <Icono nombre="borrar" className="ico-s" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Tabla>

      <Dialog open={dialogo?.tipo === "guardar"} onOpenChange={(abierto) => !ocupado && !abierto && setDialogo(null)}>
        <DialogContent>
          <div className="modal-cab">
            <DialogTitle>
              {dialogo?.tipo === "guardar" && dialogo.camion ? "Editar camión" : "Nuevo camión"}
            </DialogTitle>
          </div>
          <div className="modal-cuerpo">
            <div className="rejilla">
              <label className="campo">
                <span>Identificación</span>
                <Input value={identificacion} onChange={(e) => setIdentificacion(e.target.value)} />
              </label>
              <div className="rejilla r2">
                <label className="campo">
                  <span>Capacidad máxima (kg)</span>
                  <Input className="mono" value={capacidad} onChange={(e) => setCapacidad(e.target.value)} />
                </label>
                <label className="campo">
                  <span>Sede</span>
                  <select className="sel" value={sedeId} onChange={(e) => setSedeId(Number(e.target.value))}>
                    {sedes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            {error && dialogo?.tipo === "guardar" ? <Aviso tipo="rojo">{error}</Aviso> : null}
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

      <Dialog open={dialogo?.tipo === "eliminar"} onOpenChange={(abierto) => !ocupado && !abierto && setDialogo(null)}>
        <DialogContent>
          <div className="modal-cab">
            <DialogTitle>Eliminar</DialogTitle>
          </div>
          <div className="modal-cuerpo">
            {dialogo?.tipo === "eliminar" ? (
              <p>
                ¿Eliminar <b>{dialogo.camion.identificacion}</b>?
              </p>
            ) : null}
            {error && dialogo?.tipo === "eliminar" ? <Aviso tipo="rojo">{error}</Aviso> : null}
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
