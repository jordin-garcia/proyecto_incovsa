import { describe, expect, it } from "vitest";
import type { SesionActual } from "@/lib/sesion";
import { prisma } from "@/lib/prisma";
import { accesoModulo, esPiloto, exigirPermiso, sedesDelUsuario, tienePermiso } from "./servicio";
import { seleccionarSedeDeTrabajo } from "./sede";
import { opcionesPermitidas } from "./navegacion";

export function sesionDePrueba(cambios: Partial<SesionActual> = {}): SesionActual {
  return {
    sistema: "picking",
    usuario: { id: "prueba", usuario: "prueba", nombre: "Usuario de prueba", rol: "Facturador" },
    permisos: ["pk.facturacion"],
    sedes: [{ id: 1, nombre: "Quetzaltenango", prefijoOdoo: "XE" }],
    ...cambios,
  };
}

describe("Autorización central", () => {
  it.each([" gerencia ", "SOPORTE", "Gérencia"])("RN-38: %s tiene acceso total sin casillas", async (rol) => {
    const s = sesionDePrueba({ usuario: { ...sesionDePrueba().usuario, rol }, permisos: [], sedes: [] });
    for (const modulo of ["facturacion", "bodega", "ruta", "reportes", "configuracion", "tablero"])
      expect(accesoModulo(s, modulo)).toBe(true);
    expect(await sedesDelUsuario(s)).toEqual(await prisma.sede.findMany({ orderBy: { id: "asc" } }));
    expect(() => exigirPermiso(s, "pk.bodega", 2)).not.toThrow();
    expect(tienePermiso({ ...s, sistema: "sitio" }, "sit.contenido")).toBe(true);
  });
  it("RN-38: las casillas y el sistema limitan los módulos", () => {
    const s = sesionDePrueba();
    expect(opcionesPermitidas(s).map((o) => o.texto)).toEqual(["Facturación"]);
    for (const m of ["bodega", "ruta", "reportes", "configuracion", "tablero", "desconocido"])
      expect(accesoModulo(s, m)).toBe(false);
    expect(tienePermiso({ ...s, sistema: "sitio" }, "pk.facturacion")).toBe(false);
    expect(accesoModulo(sesionDePrueba({ permisos: ["pk.ruta.todas"] }), "ruta")).toBe(true);
    expect(accesoModulo(sesionDePrueba({ permisos: ["pk.cfg.camiones"] }), "configuracion")).toBe(true);
  });
  it("RNF-04 / RN-17: el mismo error rechaza sin sesión, permiso, sistema o sede", () => {
    for (const [s, sede] of [
      [null, 1],
      [sesionDePrueba({ permisos: [] }), 1],
      [sesionDePrueba(), 2],
      [sesionDePrueba({ sistema: "sitio" }), 1],
    ] as const)
      expect(() => exigirPermiso(s, "pk.facturacion", sede)).toThrow("No tiene permisos para acceder a este módulo.");
    expect(() => exigirPermiso(sesionDePrueba(), "pk.facturacion", 1)).not.toThrow();
    expect(tienePermiso(null, "pk.facturacion")).toBe(false);
  });
  it.each(["Piloto", " piloto ", "PILOTO", "Píloto"])("RN-46: reconoce %s", (rol) => {
    expect(esPiloto(sesionDePrueba({ usuario: { ...sesionDePrueba().usuario, rol } }))).toBe(true);
  });
  it("RN-46: no confunde permiso de Ruta con rol Piloto", () => {
    expect(esPiloto(sesionDePrueba({ permisos: ["pk.ruta.propias"] }))).toBe(false);
    expect(esPiloto(null)).toBe(false);
  });
  it("RN-17 / RF-SL-66: una cookie manipulada nunca amplía las sedes", () => {
    const sedes = sesionDePrueba().sedes;
    for (const cookie of [undefined, "2", "GT", "", "1.0", "-1", "1basura"])
      expect(seleccionarSedeDeTrabajo(sedes, cookie)).toEqual(sedes[0]);
    expect(seleccionarSedeDeTrabajo([], "1")).toBeNull();
    expect(seleccionarSedeDeTrabajo([...sedes, { id: 2, nombre: "Guatemala", prefijoOdoo: "GT" }], "2")?.id).toBe(2);
  });
  it("RF-SW-25: documentos admite cualquiera de sus permisos; Usuarios solo acceso total", () => {
    for (const permiso of ["sit.doc.ver", "sit.doc.descargar", "sit.doc.gestionar"])
      expect(opcionesPermitidas(sesionDePrueba({ sistema: "sitio", permisos: [permiso] })).map((o) => o.texto)).toEqual(
        ["Documentación interna"],
      );
    expect(
      opcionesPermitidas(sesionDePrueba({ sistema: "sitio", permisos: ["sit.contenido"] })).map((o) => o.texto),
    ).toEqual(["Resumen", "Contenido institucional"]);
  });
});
