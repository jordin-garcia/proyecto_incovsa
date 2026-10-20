"use client";

import type { PermisoCatalogo } from "@/modulos/usuarios/tipos";

export function agruparPermisos(permisos: readonly PermisoCatalogo[]) {
  const grupos: { modulo: string; permisos: PermisoCatalogo[] }[] = [];
  for (const permiso of permisos) {
    let grupo = grupos.find((item) => item.modulo === permiso.modulo);
    if (!grupo) {
      grupo = { modulo: permiso.modulo, permisos: [] };
      grupos.push(grupo);
    }
    grupo.permisos.push(permiso);
  }
  return grupos;
}

export function CasillasPermisos({
  permisos,
  marcados,
  deshabilitadas,
  alAlternar,
}: {
  permisos: readonly PermisoCatalogo[];
  marcados: readonly string[];
  deshabilitadas: boolean;
  alAlternar: (codigo: string, marcado: boolean) => void;
}) {
  return (
    <div className="permisos" data-permisos>
      {agruparPermisos(permisos).map((grupo) => (
        <fieldset key={grupo.modulo} disabled={deshabilitadas}>
          <legend>{grupo.modulo}</legend>
          {grupo.permisos.map((permiso) => (
            <label className="chk" key={permiso.codigo}>
              <input
                type="checkbox"
                value={permiso.codigo}
                checked={marcados.includes(permiso.codigo)}
                onChange={(evento) => alAlternar(permiso.codigo, evento.target.checked)}
              />
              {permiso.descripcion}
            </label>
          ))}
        </fieldset>
      ))}
    </div>
  );
}
