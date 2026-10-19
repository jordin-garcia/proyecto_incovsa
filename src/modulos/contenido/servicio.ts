import { cache } from "react";
import { prisma } from "@/lib/prisma";

// Lecturas exclusivamente públicas (DM-02). No consultan sesiones, usuarios ni datos del picking.
export const leerEstructuraSitio = cache(async () => {
  const [configuracion, contactos, industrias] = await Promise.all([
    prisma.configuracionSitio.findUnique({ where: { id: 1 }, select: { logotipoIncovsaUrl: true } }),
    prisma.informacionContacto.findMany({
      where: { sede: { tieneOficina: true, nombre: { in: ["Quetzaltenango", "Guatemala"] } } },
      select: {
        direccion: true,
        telefono: true,
        correo: true,
        whatsapp: true,
        horario: true,
        mapaUrl: true,
        sede: { select: { nombre: true, prefijoOdoo: true } },
      },
    }),
    prisma.industria.findMany({
      orderBy: [{ orden: "asc" }, { id: "asc" }],
      select: { id: true, nombre: true, descripcion: true, orden: true, _count: { select: { productos: true } } },
    }),
  ]);
  return {
    logotipo: configuracion?.logotipoIncovsaUrl || "/marca/incovsa-quimicos.webp",
    contactos: contactos
      .map(({ sede, ...contacto }) => ({ ...contacto, nombre: sede.nombre, prefijo: sede.prefijoOdoo }))
      .sort((a, b) => (a.prefijo === "XE" ? -1 : 1) - (b.prefijo === "XE" ? -1 : 1)),
    industrias: industrias.map(({ _count, ...industria }) => ({ ...industria, productos: _count.productos })),
  };
});

export const leerInicioSitio = cache(async () => {
  const [estructura, contenido, imagenes] = await Promise.all([
    leerEstructuraSitio(),
    prisma.contenidoInstitucional.findMany({
      where: { seccion: { in: ["mision", "vision"] } },
      select: { seccion: true, texto: true },
    }),
    prisma.imagen.findMany({
      where: {
        area: { in: ["portada", "mision", "vision"] },
        industriaId: null,
        productoSitioId: null,
        noticiaId: null,
      },
      orderBy: { posicion: "asc" },
      select: { area: true, url: true },
    }),
  ]);
  const galeria = (area: string) =>
    imagenes
      .filter((imagen) => imagen.area === area)
      .slice(0, 5)
      .map((imagen) => imagen.url);
  const portada = galeria("portada");
  return {
    ...estructura,
    portada: portada.length ? portada : ["/marca/foto-equipo.webp"],
    mision: {
      texto: contenido.find((seccion) => seccion.seccion === "mision")?.texto ?? "",
      imagenes: galeria("mision"),
    },
    vision: {
      texto: contenido.find((seccion) => seccion.seccion === "vision")?.texto ?? "",
      imagenes: galeria("vision"),
    },
  };
});

export type EstructuraSitio = Awaited<ReturnType<typeof leerEstructuraSitio>>;
