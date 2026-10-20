import type { SesionActual } from "@/lib/sesion";
import { prisma } from "@/lib/prisma";
import { exigirAccesoPantalla } from "@/modulos/permisos/navegacion";
import { exigirPermiso, tienePermiso } from "@/modulos/permisos/servicio";
import type { NombreIcono } from "@/componentes/comunes/iconos";

type Tarjeta = {
  ruta: string;
  nombre: string;
  icono: NombreIcono;
  detalle: string;
  estado: string;
  color: "v" | "a" | "z";
};
export async function leerResumen(sesion: SesionActual) {
  exigirAccesoPantalla(sesion, "resumen");
  const tarjetas: Tarjeta[] = [];
  if (tienePermiso(sesion, "sit.contenido")) {
    exigirPermiso(sesion, "sit.contenido");
    const historia = await prisma.contenidoInstitucional.findUnique({ where: { seccion: "historia" } });
    const valores = await prisma.valor.findMany();
    const completo = !!historia?.texto && valores.filter((v) => v.imagenUrl).length === 5;
    tarjetas.push({
      ruta: "contenido",
      nombre: "Contenido institucional",
      icono: "noticia",
      detalle: "Portada, logotipos, historia, misión, visión y valores",
      estado: completo ? "Completo" : "Faltan historia y valores",
      color: completo ? "v" : "a",
    });
  }
  if (tienePermiso(sesion, "sit.industrias")) {
    exigirPermiso(sesion, "sit.industrias");
    tarjetas.push({
      ruta: "industrias",
      nombre: "Industrias",
      icono: "fabrica",
      detalle: "9 industrias con descripción e imágenes",
      estado: "Textos por revisar",
      color: "a",
    });
  }
  if (tienePermiso(sesion, "sit.catalogo")) {
    exigirPermiso(sesion, "sit.catalogo");
    tarjetas.push({
      ruta: "catalogo",
      nombre: "Catálogo",
      icono: "caja",
      detalle: "Productos públicos y sus industrias",
      estado: `${await prisma.productoSitio.count()} productos`,
      color: "v",
    });
  }
  if (tienePermiso(sesion, "sit.noticias")) {
    exigirPermiso(sesion, "sit.noticias");
    const cantidad = await prisma.noticia.count();
    tarjetas.push({
      ruta: "noticias",
      nombre: "Noticias",
      icono: "imagen",
      detalle: "Publicación y edición de noticias",
      estado: cantidad ? `${cantidad} publicadas` : "Sin publicar",
      color: cantidad ? "v" : "a",
    });
  }
  if (tienePermiso(sesion, "sit.sol.ver")) {
    exigirPermiso(sesion, "sit.sol.ver");
    tarjetas.push({
      ruta: "solicitudes",
      nombre: "Solicitudes",
      icono: "bandeja",
      detalle: "Mensajes del formulario de contacto",
      estado: `${await prisma.solicitudContacto.count({ where: { leida: false } })} sin leer`,
      color: "z",
    });
  }
  const permisoDocumentos = ["sit.doc.ver", "sit.doc.descargar", "sit.doc.gestionar"].find((p) =>
    tienePermiso(sesion, p),
  );
  if (permisoDocumentos) {
    exigirPermiso(sesion, permisoDocumentos);
    tarjetas.push({
      ruta: "documentos",
      nombre: "Documentación interna",
      icono: "archivo",
      detalle: "Enlaces de fichas técnicas, hojas de seguridad y certificados",
      estado: `${await prisma.productoDocumentado.count()} producto(s) documentado(s)`,
      color: "v",
    });
  }
  return tarjetas;
}
