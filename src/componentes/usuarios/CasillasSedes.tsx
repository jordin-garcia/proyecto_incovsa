"use client";

import type { SedeCatalogo } from "@/modulos/usuarios/tipos";

export function CasillasSedes({
  sedes,
  marcadas,
  deshabilitadas,
  alAlternar,
}: {
  sedes: readonly SedeCatalogo[];
  marcadas: readonly number[];
  deshabilitadas: boolean;
  alAlternar: (id: number, marcado: boolean) => void;
}) {
  return (
    <div className="sedes-chk" data-sedes>
      {sedes.map((sede) => (
        <label className="chk" key={sede.id}>
          <input
            type="checkbox"
            value={sede.id}
            checked={marcadas.includes(sede.id)}
            disabled={deshabilitadas}
            onChange={(evento) => alAlternar(sede.id, evento.target.checked)}
          />
          {sede.nombre}
        </label>
      ))}
    </div>
  );
}
