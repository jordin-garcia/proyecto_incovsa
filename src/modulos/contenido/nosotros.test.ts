import { beforeEach, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { leerNosotrosSitio } from "./nosotros";

beforeEach(() => limpiarTablasDeNegocio());

it("RF-SW-02 (06/11): publica la historia y ya no lee los valores", async () => {
  await prisma.contenidoInstitucional.upsert({
    where: { seccion: "historia" },
    create: { seccion: "historia", texto: "Historia de prueba" },
    update: { texto: "Historia de prueba" },
  });
  await prisma.valor.update({ where: { posicion: 3 }, data: { imagenUrl: "/marca/foto-equipo.webp" } });
  await prisma.imagen.createMany({
    data: [2, 1].map((posicion) => ({
      area: "historia",
      posicion,
      url: `/marca/foto-equipo.webp?imagen=${posicion}`,
    })),
  });
  const datos = await leerNosotrosSitio();
  expect(datos.historia).toEqual({
    texto: "Historia de prueba",
    imagenes: ["/marca/foto-equipo.webp?imagen=1", "/marca/foto-equipo.webp?imagen=2"],
  });
  // JG-34: aunque la tabla valor conserve imágenes, «Quiénes somos» ya no las lee.
  expect(Object.keys(datos)).toEqual(["historia"]);
});

it("RF-SW-02: historia vacía y sin galería no inventa contenido", async () => {
  await prisma.contenidoInstitucional.deleteMany({ where: { seccion: "historia" } });
  expect((await leerNosotrosSitio()).historia).toEqual({ texto: "", imagenes: [] });
});
