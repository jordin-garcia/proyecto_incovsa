import { prisma } from "@/lib/prisma";
import type { SesionActual } from "@/lib/sesion";
import { exigirPermiso } from "@/modulos/permisos/servicio";
import { registrarBitacora } from "@/modulos/bitacora/servicio";
import { guardarImagen, borrarImagen } from "@/modulos/almacenamiento/servicio";
import { ErrorNegocio } from "@/lib/errores";
import { leerCatalogoSitio } from "./catalogo";
import {
  esquemaIndustriaPanel,
  esquemaProductoPanel,
  esquemaIdCatalogo,
  type IndustriaPanelEntrada,
  type ProductoPanelEntrada,
} from "./esquemas-catalogo";

export async function leerIndustriasPanel(sesion: SesionActual | null) {
  exigirPermiso(sesion, "sit.industrias");
  return (await leerCatalogoSitio()).industrias;
}
export async function leerCatalogoPanel(sesion: SesionActual | null) {
  exigirPermiso(sesion, "sit.catalogo");
  return leerCatalogoSitio();
}
async function limpiarImagenes(urls: string[]) {
  for (const url of urls)
    try {
      await borrarImagen(url);
    } catch {
      console.error("No se pudo eliminar una imagen sustituida del almacenamiento.");
    }
}
async function subirImagenes(referencias: (string | number)[], archivos: File[], nuevas: string[]) {
  const indices = referencias.filter((v): v is number => typeof v === "number");
  if (indices.length !== archivos.length || indices.some((i) => !archivos[i]))
    throw new ErrorNegocio("Las imágenes enviadas no son válidas.");
  for (const archivo of archivos) nuevas.push(await guardarImagen(new Uint8Array(await archivo.arrayBuffer())));
}
function resolverImagenes(referencias: (string | number)[], actuales: string[], nuevas: string[]) {
  if (referencias.some((v) => typeof v === "string" && !actuales.includes(v)))
    throw new ErrorNegocio("El contenido cambió. Recargue la página antes de publicar.");
  return referencias.map((v) => (typeof v === "number" ? nuevas[v]! : v));
}
export async function guardarIndustriaPanel(
  entrada: IndustriaPanelEntrada,
  archivos: File[],
  sesion: SesionActual | null,
) {
  exigirPermiso(sesion, "sit.industrias");
  const datos = esquemaIndustriaPanel.parse(entrada);
  const nuevas: string[] = [];
  let antiguas: string[];
  try {
    await subirImagenes(datos.imagenes, archivos, nuevas);
    antiguas = await prisma.$transaction(async (tx) => {
      // La actualización bloquea el registro antes de leer su galería y serializa ediciones simultáneas.
      const industria = await tx.industria.update({
        where: { id: datos.id },
        data: { descripcion: datos.descripcion },
      });
      const actuales = (await tx.imagen.findMany({ where: { industriaId: datos.id } })).map((i) => i.url);
      const urls = resolverImagenes(datos.imagenes, actuales, nuevas);
      await tx.imagen.deleteMany({ where: { industriaId: datos.id } });
      if (urls.length)
        await tx.imagen.createMany({
          data: urls.map((url, i) => ({ area: "industria", industriaId: datos.id, posicion: i + 1, url })),
        });
      await registrarBitacora(tx, {
        sistema: "sitio",
        usuarioId: sesion!.usuario.id,
        operacion: "Cambio de contenido del sitio",
        entidad: "industria",
        detalle: { industria: industria.nombre },
      });
      return actuales.filter((url) => !urls.includes(url));
    });
  } catch (error) {
    await limpiarImagenes(nuevas);
    throw error;
  }
  await limpiarImagenes(antiguas);
  return { id: datos.id };
}
export async function guardarProductoPanel(
  entrada: ProductoPanelEntrada,
  archivos: File[],
  sesion: SesionActual | null,
) {
  exigirPermiso(sesion, "sit.catalogo");
  const datos = esquemaProductoPanel.parse(entrada);
  const nuevas: string[] = [];
  let resultado: { id: number; antiguas: string[] };
  try {
    await subirImagenes(datos.imagenes, archivos, nuevas);
    resultado = await prisma.$transaction(async (tx) => {
      if ((await tx.industria.count({ where: { id: { in: datos.industrias } } })) !== datos.industrias.length)
        throw new ErrorNegocio("Las industrias seleccionadas no son válidas.");
      const campos = {
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        presentacion: datos.presentacion,
        paisesOrigen: datos.paisesOrigen,
      };
      const producto = datos.id
        ? await tx.productoSitio.update({ where: { id: datos.id }, data: campos })
        : await tx.productoSitio.create({ data: campos });
      const actuales = (await tx.imagen.findMany({ where: { productoSitioId: producto.id } })).map((i) => i.url);
      const urls = resolverImagenes(datos.imagenes, actuales, nuevas);
      await tx.productoIndustria.deleteMany({ where: { productoSitioId: producto.id } });
      if (datos.industrias.length)
        await tx.productoIndustria.createMany({
          data: datos.industrias.map((industriaId) => ({ productoSitioId: producto.id, industriaId })),
        });
      await tx.imagen.deleteMany({ where: { productoSitioId: producto.id } });
      if (urls.length)
        await tx.imagen.createMany({
          data: urls.map((url, i) => ({ area: "producto", productoSitioId: producto.id, posicion: i + 1, url })),
        });
      await registrarBitacora(tx, {
        sistema: "sitio",
        usuarioId: sesion!.usuario.id,
        operacion: datos.id ? "Edición de producto público" : "Creación de producto público",
        entidad: "producto_sitio",
        detalle: { producto: datos.nombre },
      });
      return { id: producto.id, antiguas: actuales.filter((url) => !urls.includes(url)) };
    });
  } catch (error) {
    await limpiarImagenes(nuevas);
    throw error;
  }
  await limpiarImagenes(resultado.antiguas);
  return { id: resultado.id };
}
export async function borrarProductoPanel(entrada: number, sesion: SesionActual | null) {
  exigirPermiso(sesion, "sit.catalogo");
  const id = esquemaIdCatalogo.parse(entrada);
  const urls = await prisma.$transaction(async (tx) => {
    const producto = await tx.productoSitio.update({ where: { id }, data: { actualizadoEn: new Date() } });
    const imagenes = await tx.imagen.findMany({ where: { productoSitioId: id } });
    await tx.productoIndustria.deleteMany({ where: { productoSitioId: id } });
    await tx.productoSitio.delete({ where: { id } });
    await registrarBitacora(tx, {
      sistema: "sitio",
      usuarioId: sesion!.usuario.id,
      operacion: "Eliminación de producto público",
      entidad: "producto_sitio",
      detalle: { producto: producto.nombre },
    });
    return imagenes.map((i) => i.url);
  });
  await limpiarImagenes(urls);
  return { id };
}
