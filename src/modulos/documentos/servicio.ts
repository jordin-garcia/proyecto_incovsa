import { prisma } from "@/lib/prisma";
import { ErrorNegocio } from "@/lib/errores";
import type { SesionActual } from "@/lib/sesion";
import { exigirPermiso, tienePermiso } from "@/modulos/permisos/servicio";
import { registrarBitacora } from "@/modulos/bitacora/servicio";
import { esquemaProducto, esquemaId, esquemaBusqueda, idDrive } from "./esquemas";

const tipos = [
  ["enlaceFt", "FT", "Ficha técnica"],
  ["enlaceHs", "HS", "Hoja de seguridad"],
  ["enlaceCoa", "COA", "Certificado de análisis"],
] as const;
const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
export async function leerDocumentos(sesion: SesionActual | null, busqueda = "") {
  const permiso =
    ["sit.doc.ver", "sit.doc.descargar", "sit.doc.gestionar"].find((p) => tienePermiso(sesion, p)) ?? "sit.doc.ver";
  exigirPermiso(sesion, permiso);
  const q = esquemaBusqueda.safeParse(busqueda);
  if (!q.success) throw new ErrorNegocio("Revise los datos de búsqueda.");
  const [filas, paises] = await Promise.all([
    prisma.productoDocumentado.findMany({
      where: {
        OR: [
          { producto: { contains: q.data, mode: "insensitive" } },
          { lote: { contains: q.data, mode: "insensitive" } },
          { pais: { nombre: { contains: q.data, mode: "insensitive" } } },
        ],
      },
      include: { pais: { select: { nombre: true } }, creadoPor: { select: { name: true } } },
      orderBy: [{ creadoEn: "desc" }, { id: "desc" }],
    }),
    tienePermiso(sesion, "sit.doc.gestionar")
      ? prisma.pais.findMany({ select: { id: true, nombre: true }, orderBy: { nombre: "asc" } })
      : [],
  ]);
  return {
    paises,
    productos: filas.map((f) => ({
      id: f.id,
      producto: f.producto,
      paisId: f.paisId,
      pais: f.pais.nombre,
      lote: f.lote,
      creadoEn: f.creadoEn,
      creadoPor: f.creadoPor.name,
      documentos: tipos.flatMap(([campo, codigo, nombre]) => {
        const id = f[campo] && idDrive(f[campo]);
        return id
          ? [
              {
                codigo,
                nombre,
                ...(tienePermiso(sesion, "sit.doc.ver")
                  ? { vistaPrevia: `https://drive.google.com/file/d/${id}/preview` }
                  : {}),
                ...(tienePermiso(sesion, "sit.doc.descargar")
                  ? { descarga: `https://drive.google.com/uc?export=download&id=${id}` }
                  : {}),
              },
            ]
          : [];
      }),
      ...(tienePermiso(sesion, "sit.doc.gestionar")
        ? { enlaces: { enlaceFt: f.enlaceFt ?? "", enlaceHs: f.enlaceHs ?? "", enlaceCoa: f.enlaceCoa ?? "" } }
        : {}),
    })),
  };
}
export type ProductoDocumentado = Awaited<ReturnType<typeof leerDocumentos>>["productos"][number];

export async function guardarProducto(entrada: unknown, sesion: SesionActual | null) {
  exigirPermiso(sesion, "sit.doc.gestionar");
  const r = esquemaProducto.safeParse(entrada);
  if (!r.success) throw new ErrorNegocio(r.error.issues[0].message);
  const { id, ...d } = r.data;
  try {
    return await prisma.$transaction(async (tx) => {
      // Serializa las altas y ediciones: la clave normalizada del prototipo no existe como índice en el esquema.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(20261010)`;
      if (!(await tx.pais.findUnique({ where: { id: d.paisId } }))) throw new ErrorNegocio("Elija el país de origen.");
      if (id && !(await tx.productoDocumentado.findUnique({ where: { id } })))
        throw new ErrorNegocio("No se encontró el producto documentado.");
      const candidatos = await tx.productoDocumentado.findMany({
        where: { paisId: d.paisId, ...(id ? { id: { not: id } } : {}) },
        select: { producto: true, lote: true },
      });
      const duplicado = candidatos.some(
        (p) => normalizar(p.producto) === normalizar(d.producto) && normalizar(p.lote) === normalizar(d.lote),
      );
      if (duplicado) throw new ErrorNegocio("Ya existe ese producto con el mismo país de origen y el mismo lote.");
      const data = { ...d, enlaceFt: d.enlaceFt || null, enlaceHs: d.enlaceHs || null, enlaceCoa: d.enlaceCoa || null };
      const producto = id
        ? await tx.productoDocumentado.update({ where: { id }, data })
        : await tx.productoDocumentado.create({ data: { ...data, creadoPorId: sesion.usuario.id } });
      await registrarBitacora(tx, {
        sistema: "sitio",
        usuarioId: sesion.usuario.id,
        entidad: "producto_documentado",
        registroId: String(producto.id),
        operacion: id ? "Edición de producto documentado" : "Creación de producto documentado",
        detalle: { producto: d.producto, paisId: d.paisId, lote: d.lote },
      });
      return { id: producto.id };
    });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "P2002")
      throw new ErrorNegocio("Ya existe ese producto con el mismo país de origen y el mismo lote.");
    throw error;
  }
}
export async function eliminarProducto(entrada: unknown, sesion: SesionActual | null) {
  exigirPermiso(sesion, "sit.doc.gestionar");
  const r = esquemaId.safeParse(entrada);
  if (!r.success) throw new ErrorNegocio("Revise los datos del producto.");
  return prisma.$transaction(async (tx) => {
    const producto = await tx.productoDocumentado.findUnique({ where: r.data });
    if (!producto) throw new ErrorNegocio("No se encontró el producto documentado.");
    await tx.productoDocumentado.delete({ where: r.data });
    await registrarBitacora(tx, {
      sistema: "sitio",
      usuarioId: sesion.usuario.id,
      entidad: "producto_documentado",
      registroId: String(producto.id),
      operacion: "Eliminación de producto documentado",
      detalle: { producto: producto.producto, paisId: producto.paisId, lote: producto.lote },
    });
    return { id: producto.id };
  });
}
