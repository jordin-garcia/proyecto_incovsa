import { cache } from "react";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const esquemaIdProductoPublico = z
  .string()
  .regex(/^[1-9]\d*$/)
  .transform(Number)
  .pipe(z.int().positive().max(2147483647));

/** RF-SW-17: los dos grupos se ordenan por separado, como en sitio.js. */
export function recomendarProductos<T extends { id: number; nombre: string; industrias: { id: number }[] }>(
  actual: T,
  catalogo: T[],
): T[] {
  const industrias = new Set(actual.industrias.map((i) => i.id));
  const comparte = (p: T) => p.industrias.some((i) => industrias.has(i.id));
  const otros = catalogo.filter((p) => p.id !== actual.id);
  const alfa = (a: T, b: T) => a.nombre.localeCompare(b.nombre, "es") || a.id - b.id;
  return [...otros.filter(comparte).sort(alfa), ...otros.filter((p) => !comparte(p)).sort(alfa)].slice(0, 4);
}

/** Lectura pública: únicamente catálogo e industrias, sin datos internos ni sesión. */
export const leerCatalogoSitio = cache(async () => {
  const [industrias, productos] = await Promise.all([
    prisma.industria.findMany({
      orderBy: [{ orden: "asc" }, { id: "asc" }],
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        imagenes: { orderBy: { posicion: "asc" }, take: 5, select: { url: true } },
      },
    }),
    prisma.productoSitio.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        presentacion: true,
        paisesOrigen: true,
        industrias: {
          orderBy: { industria: { orden: "asc" } },
          select: { industria: { select: { id: true, nombre: true } } },
        },
        imagenes: { orderBy: { posicion: "asc" }, take: 5, select: { url: true } },
      },
    }),
  ]);
  return {
    industrias: industrias.map((i) => ({ ...i, imagenes: i.imagenes.map((f) => f.url) })),
    productos: productos.map((p) => ({
      ...p,
      industrias: p.industrias.map((i) => i.industria),
      imagenes: p.imagenes.map((f) => f.url),
    })),
  };
});

export type CatalogoSitio = Awaited<ReturnType<typeof leerCatalogoSitio>>;
export type ProductoPublico = CatalogoSitio["productos"][number];
