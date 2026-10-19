import { beforeEach, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { leerEstructuraSitio, leerInicioSitio } from "./servicio";

beforeEach(() => limpiarTablasDeNegocio());

it("RF-SW-22 / RF-SW-24: expone solo oficinas y usa el logotipo público configurado", async () => {
  const escuintla = await prisma.sede.findUniqueOrThrow({ where: { nombre: "Escuintla" } });
  await prisma.informacionContacto.create({
    data: {
      sedeId: escuintla.id,
      direccion: "Bodega interna",
      telefono: "",
      correo: "",
      whatsapp: "",
      mapaUrl: "",
    },
  });
  const inicial = await leerEstructuraSitio();
  expect(inicial.logotipo).toBe("/marca/incovsa-quimicos.webp");
  expect(inicial.contactos.map((sede) => sede.nombre)).toEqual(["Quetzaltenango", "Guatemala"]);
  expect(JSON.stringify(inicial)).not.toContain("Bodega interna");
  await prisma.configuracionSitio.update({ where: { id: 1 }, data: { logotipoIncovsaUrl: "/marca/inquiserca.webp" } });
  expect((await leerEstructuraSitio()).logotipo).toBe("/marca/inquiserca.webp");
});

it("RF-SW-01 / RN-56: lee textos editados, galerías ordenadas y las nueve industrias desde la base", async () => {
  await prisma.contenidoInstitucional.update({ where: { seccion: "mision" }, data: { texto: "Misión editada" } });
  await prisma.imagen.createMany({
    data: [5, 3, 1, 4, 2].map((posicion) => ({
      area: "portada",
      posicion,
      url: `/marca/foto-equipo.webp?imagen=${posicion}`,
    })),
  });
  const datos = await leerInicioSitio();
  expect(datos.mision.texto).toBe("Misión editada");
  expect(datos.portada).toEqual([1, 2, 3, 4, 5].map((n) => `/marca/foto-equipo.webp?imagen=${n}`));
  expect(datos.mision.imagenes).toEqual([]);
  expect(datos.vision.imagenes).toEqual([]);
  expect(datos.industrias.map((industria) => industria.nombre)).toEqual([
    "Cuero",
    "Textil",
    "Cerería",
    "Hulera",
    "Medicamentos",
    "Limpieza",
    "Alimentación animal",
    "Tratamiento de agua",
    "Lavandería",
  ]);
});

it("RF-SW-01: usa foto-equipo solo cuando no se han subido imágenes de portada", async () => {
  expect((await leerInicioSitio()).portada).toEqual(["/marca/foto-equipo.webp"]);
});
