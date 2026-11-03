"use client";

import { useState, useSyncExternalStore } from "react";
import { Icono } from "@/componentes/comunes/iconos";
import type { CatalogoSitio } from "@/modulos/contenido/catalogo";
import { ICONOS_INDUSTRIAS } from "./navegacion";
import { TarjetaProducto } from "./TarjetaProducto";

const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
const suscribirHidratacion = () => () => {};

export function CatalogoCliente({ datos, filtroInicial }: { datos: CatalogoSitio; filtroInicial: string }) {
  const hidratado = useSyncExternalStore(
    suscribirHidratacion,
    () => true,
    () => false,
  );
  const [filtro, cambiarFiltro] = useState(filtroInicial);
  const [busqueda, cambiarBusqueda] = useState("");
  // JG-28: la misma barra de solo íconos que Industrias, con «Todas las industrias» primero.
  // Un producto sin industria solo aparece en «Todas las industrias».
  const filtros = [
    { clave: "todas", nombre: "Todas las industrias", icono: "cuadricula" as const },
    ...datos.industrias.map((i, indice) => ({
      clave: ICONOS_INDUSTRIAS[indice]!,
      nombre: i.nombre,
      icono: ICONOS_INDUSTRIAS[indice]!,
    })),
  ];
  const industriaId = datos.industrias[ICONOS_INDUSTRIAS.findIndex((i) => i === filtro)]?.id;
  const productos = datos.productos.filter(
    (p) =>
      (filtro === "todas" || p.industrias.some((i) => i.id === industriaId)) &&
      normalizar(p.nombre).includes(normalizar(busqueda)),
  );
  return (
    <section className="sec sec-catalogo">
      <div className="wrap ind-lay2" data-hidratado={hidratado}>
        <aside className="ind-barra" aria-label="Filtrar por industria">
          {filtros.map((f) => (
            <button
              key={f.clave}
              type="button"
              className={filtro === f.clave ? "on" : ""}
              aria-label={f.nombre}
              aria-pressed={filtro === f.clave}
              onClick={() => cambiarFiltro(f.clave)}
            >
              <Icono nombre={f.icono} />
              <span className="ind-nombre" role="tooltip">
                {f.nombre}
              </span>
            </button>
          ))}
        </aside>
        <div>
          <div className="catalogo-busqueda">
            <label className="buscador">
              <Icono nombre="buscar" />
              <input
                className="inp"
                placeholder="Buscar producto"
                aria-label="Buscar producto"
                value={busqueda}
                onChange={(e) => cambiarBusqueda(e.target.value)}
              />
            </label>
            <span className="muted" role="status">
              {productos.length} de {datos.productos.length} productos
            </span>
          </div>
          {productos.length ? (
            <div className="prod-rejilla catalogo-rejilla">
              {productos.map((p) => (
                <TarjetaProducto key={p.id} producto={p} />
              ))}
            </div>
          ) : (
            <div className="tarjeta vacio">
              <Icono nombre="buscar" />
              <h4>Ningún producto coincide</h4>
              <p>Pruebe con otro término o quite el filtro de industria.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
