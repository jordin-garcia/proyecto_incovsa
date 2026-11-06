import { cache } from "react";
import { prisma } from "@/lib/prisma";

/** Contenido público: no consulta usuarios, permisos ni datos internos. */
export const leerNosotrosSitio = cache(async () => {
  const [historia, imagenes] = await Promise.all([
    prisma.contenidoInstitucional.findUnique({ where: { seccion: "historia" }, select: { texto: true } }),
    prisma.imagen.findMany({
      where: { area: "historia", industriaId: null, productoSitioId: null, noticiaId: null },
      orderBy: { posicion: "asc" },
      take: 5,
      select: { url: true },
    }),
  ]);
  return {
    historia: { texto: historia?.texto ?? "", imagenes: imagenes.map((imagen) => imagen.url) },
  };
});
