import { cache } from "react";
import { prisma } from "@/lib/prisma";

/** Contenido público: no consulta usuarios, permisos ni datos internos. */
export const leerNosotrosSitio = cache(async () => {
  const [historia, imagenes, valores] = await Promise.all([
    prisma.contenidoInstitucional.findUnique({ where: { seccion: "historia" }, select: { texto: true } }),
    prisma.imagen.findMany({
      where: { area: "historia", industriaId: null, productoSitioId: null, noticiaId: null },
      orderBy: { posicion: "asc" },
      take: 5,
      select: { url: true },
    }),
    prisma.valor.findMany({ orderBy: { posicion: "asc" }, select: { posicion: true, imagenUrl: true } }),
  ]);
  return {
    historia: { texto: historia?.texto ?? "", imagenes: imagenes.map((imagen) => imagen.url) },
    valores: Array.from(
      { length: 5 },
      (_, indice) => valores.find((valor) => valor.posicion === indice + 1)?.imagenUrl ?? null,
    ),
  };
});
