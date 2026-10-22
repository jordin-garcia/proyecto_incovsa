import { beforeEach, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { leerNosotrosSitio } from "./nosotros";

beforeEach(() => limpiarTablasDeNegocio());

it("RF-SW-02 / RF-SW-29: publica historia y conserva las cinco posiciones de valores", async () => {
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
  expect(datos.valores).toEqual([null, null, "/marca/foto-equipo.webp", null, null]);
  expect(Object.keys(datos)).toEqual(["historia", "valores"]);
});

it("RF-SW-02: historia vacía y sin galería no inventa contenido", async () => {
  await prisma.contenidoInstitucional.deleteMany({ where: { seccion: "historia" } });
  expect((await leerNosotrosSitio()).historia).toEqual({ texto: "", imagenes: [] });
});
