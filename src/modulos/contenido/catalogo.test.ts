import { beforeEach, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { esquemaIdProductoPublico, leerCatalogoSitio, recomendarProductos } from "./catalogo";

beforeEach(() => limpiarTablasDeNegocio());

const producto = (id: number, nombre: string, industrias: number[]) => ({
  id,
  nombre,
  industrias: industrias.map((id) => ({ id })),
});

it("RF-SW-17 / CP-55: sin coincidencias completa cuatro en orden alfabético y excluye el actual", () => {
  const actual = producto(1, "Actual", [1]);
  const otros = [
    producto(2, "Zinc", [2]),
    producto(3, "Cal", []),
    producto(4, "Ácido", []),
    producto(5, "Soda", [3]),
    producto(6, "Bórax", []),
  ];
  expect(recomendarProductos(actual, [actual, ...otros]).map((p) => p.nombre)).toEqual([
    "Ácido",
    "Bórax",
    "Cal",
    "Soda",
  ]);
});

it("RF-SW-17: prioriza coincidencias de cualquier industria, sin duplicar, y luego rellena", () => {
  const actual = producto(1, "Actual", [1, 2]);
  const otros = [
    producto(2, "Zinc", [1, 2]),
    producto(3, "Cal", [2]),
    producto(4, "Ácido", []),
    producto(5, "Soda", []),
    producto(6, "Bórax", []),
  ];
  expect(recomendarProductos(actual, [actual, ...otros]).map((p) => p.nombre)).toEqual([
    "Cal",
    "Zinc",
    "Ácido",
    "Bórax",
  ]);
  expect(recomendarProductos(actual, [actual])).toEqual([]);
  expect(recomendarProductos(actual, [actual, otros[0]!])).toEqual([otros[0]]);
});

it("RF-SW-17 / CP-55: un producto sin industrias recibe relleno y más de cuatro coincidencias se limitan a cuatro", () => {
  const otros = ["Zinc", "Cal", "Ácido", "Soda", "Bórax"].map((nombre, i) => producto(i + 2, nombre, [1]));
  expect(recomendarProductos(producto(1, "Actual", []), otros).map((p) => p.nombre)).toEqual([
    "Ácido",
    "Bórax",
    "Cal",
    "Soda",
  ]);
  expect(recomendarProductos(producto(1, "Actual", [1]), otros).map((p) => p.nombre)).toEqual([
    "Ácido",
    "Bórax",
    "Cal",
    "Soda",
  ]);
});

it("RF-SW-05: valida identificadores públicos antes de consultar la base", () => {
  expect(esquemaIdProductoPublico.parse("12")).toBe(12);
  for (const entrada of ["0", "-1", "1.5", "01", "2147483648", "1 OR 1=1"])
    expect(esquemaIdProductoPublico.safeParse(entrada).success).toBe(false);
});

it("RF-SW-03 / P-97 / RN-56: lee relaciones e imágenes públicas actuales y ordenadas sin exponer datos internos", async () => {
  const industria = await prisma.industria.findFirstOrThrow({ orderBy: { orden: "asc" } });
  await prisma.imagen.createMany({
    data: [2, 1].map((posicion) => ({
      area: "industria",
      industriaId: industria.id,
      posicion,
      url: `/marca/foto-reunion.webp?foto=${posicion}`,
    })),
  });
  await prisma.productoSitio.create({
    data: { nombre: "Ácido", industrias: { create: { industriaId: industria.id } } },
  });
  const creado = await prisma.productoSitio.create({
    data: {
      nombre: "Soda",
      paisesOrigen: "México",
      presentacion: "Saco",
      industrias: { create: { industriaId: industria.id } },
      imagenes: {
        create: [2, 1].map((posicion) => ({
          area: "producto",
          posicion,
          url: `/marca/foto-equipo.webp?foto=${posicion}`,
        })),
      },
    },
  });
  let datos = await leerCatalogoSitio();
  expect(datos.industrias[0]?.imagenes).toEqual(["/marca/foto-reunion.webp?foto=1", "/marca/foto-reunion.webp?foto=2"]);
  expect(datos.productos.map((p) => p.nombre)).toEqual(["Ácido", "Soda"]);
  expect(datos.productos[1]?.imagenes).toEqual(["/marca/foto-equipo.webp?foto=1", "/marca/foto-equipo.webp?foto=2"]);
  expect(datos.productos[1]?.industrias.map((i) => i.id)).toEqual([industria.id]);
  expect(JSON.stringify(datos)).not.toMatch(/creadoEn|actualizadoEn|lote|usuario|pedido/i);
  await prisma.productoIndustria.deleteMany({ where: { productoSitioId: creado.id } });
  datos = await leerCatalogoSitio();
  expect(datos.productos.find((p) => p.id === creado.id)?.industrias).toEqual([]);
});
