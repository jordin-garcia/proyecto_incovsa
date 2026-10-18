import type { SesionActual } from "@/lib/sesion";
import type { OpcionNavegacion } from "@/componentes/comunes/armazon/Armazon";
import { esAccesoTotal } from "@/lib/roles";
import { accesoModulo, tienePermiso, exigirPermiso, permisoDelModulo, ErrorAcceso } from "./servicio";

const CONTENIDO = ["sit.contenido", "sit.industrias", "sit.catalogo", "sit.noticias", "sit.contacto", "sit.sol.ver"];
export const SECCIONES_PANEL = [
  { href: "/panel/resumen", texto: "Resumen", icono: "inicio", permisos: CONTENIDO },
  { href: "/panel/contenido", texto: "Contenido institucional", icono: "noticia", permisos: ["sit.contenido"] },
  { href: "/panel/industrias", texto: "Industrias", icono: "fabrica", permisos: ["sit.industrias"] },
  { href: "/panel/catalogo", texto: "Catálogo", icono: "caja", permisos: ["sit.catalogo"] },
  { href: "/panel/noticias", texto: "Noticias", icono: "imagen", permisos: ["sit.noticias"] },
  { href: "/panel/contacto", texto: "Información de contacto", icono: "pin", permisos: ["sit.contacto"] },
  { href: "/panel/solicitudes", texto: "Solicitudes", icono: "bandeja", permisos: ["sit.sol.ver"] },
  {
    href: "/panel/documentos",
    texto: "Documentación interna",
    icono: "archivo",
    permisos: ["sit.doc.ver", "sit.doc.descargar", "sit.doc.gestionar"],
  },
  { href: "/panel/usuarios", texto: "Usuarios del sitio", icono: "usuarios", permisos: [] },
] satisfies (OpcionNavegacion & { permisos: string[] })[];
export const MODULOS_PICKING: OpcionNavegacion[] = [
  { href: "/picking/facturacion", texto: "Facturación", icono: "factura" },
  { href: "/picking/bodega", texto: "Bodega", icono: "bodega" },
  { href: "/picking/ruta", texto: "Ruta", icono: "ruta" },
  { href: "/picking/reportes", texto: "Reportes", icono: "grafica" },
  { href: "/picking/configuracion", texto: "Configuración", icono: "ajustes" },
  { href: "/picking/tablero", texto: "Tablero", icono: "tv" },
];
export function opcionesPermitidas(sesion: SesionActual): OpcionNavegacion[] {
  return sesion.sistema === "picking"
    ? MODULOS_PICKING.filter((o) => accesoModulo(sesion, o.href.split("/")[2]!))
    : SECCIONES_PANEL.filter((o) =>
        o.permisos.length ? o.permisos.some((p) => tienePermiso(sesion, p)) : esAccesoTotal(sesion.usuario.rol),
      ).map(({ href, texto, icono }) => ({ href, texto, icono }));
}
export function exigirAccesoPantalla(sesion: SesionActual, modulo: string, sede?: number) {
  if (sesion.sistema === "picking") return exigirPermiso(sesion, permisoDelModulo(sesion, modulo), sede);
  const seccion = SECCIONES_PANEL.find((o) => o.href === `/panel/${modulo}`);
  if (!seccion) throw new ErrorAcceso();
  if (!seccion.permisos.length && !esAccesoTotal(sesion.usuario.rol)) throw new ErrorAcceso();
  exigirPermiso(
    sesion,
    seccion.permisos.find((p) => tienePermiso(sesion, p)) ??
      (seccion.permisos.length ? seccion.permisos[0]! : "sit.contenido"),
  );
}
