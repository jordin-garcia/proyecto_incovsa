import { beforeEach, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import type { SesionActual } from "@/lib/sesion";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { leerEstructuraSitio } from "./servicio";
import { leerContactoPanel, guardarContacto } from "./contacto";
import { esquemaContacto } from "./esquemas-contacto";
const estado = vi.hoisted(() => ({ sesion: null as SesionActual | null }));
vi.mock("@/lib/sesion", () => ({ obtenerSesion: async () => estado.sesion }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
import { publicarContacto } from "./acciones-contacto";
const sesion: SesionActual = {
  sistema: "sitio",
  usuario: { id: "contacto-prueba", usuario: "contacto", nombre: "Prueba", rol: "Editor" },
  permisos: ["sit.contacto"],
  sedes: [],
};
beforeEach(async () => {
  await limpiarTablasDeNegocio();
  await prisma.usuario.create({
    data: {
      id: sesion.usuario.id,
      name: "Prueba",
      username: "contacto",
      displayUsername: "contacto",
      email: "contacto@prueba.invalid",
      sistema: "sitio",
      rol: "Editor",
    },
  });
  estado.sesion = sesion;
});
it("RF-SW-15: lectura y publicación rechazan sin sesión, sin permiso y otro sistema", async () => {
  for (const actual of [null, { ...sesion, permisos: [] }, { ...sesion, sistema: "picking" as const }]) {
    estado.sesion = actual;
    await expect(leerContactoPanel(actual)).rejects.toThrow();
    expect(await publicarContacto({})).toEqual({ ok: false, error: "No tiene permisos para acceder a este módulo." });
  }
});
it("RF-SW-22: publica datos visibles en el sitio y registra la bitácora en la misma transacción", async () => {
  const [actual] = await leerContactoPanel(sesion);
  const { sedeId, direccion, telefono, correo, whatsapp, horario, mapaUrl } = actual;
  await guardarContacto(
    { sedeId, direccion: direccion + " prueba", telefono, correo, whatsapp, horario: horario ?? "", mapaUrl },
    sesion,
  );
  expect((await leerEstructuraSitio()).contactos.find((c) => c.nombre === actual.nombre)?.direccion).toBe(
    (direccion + " prueba").trim(),
  );
  expect(await prisma.bitacora.findFirst()).toMatchObject({
    operacion: "Cambio de contenido del sitio",
    usuarioId: sesion.usuario.id,
  });
});
it("RF-SW-22: rechaza mapas externos, variantes engañosas y la bodega de Escuintla", async () => {
  const [actual] = await leerContactoPanel(sesion);
  const { sedeId, direccion, telefono, correo, whatsapp, horario, mapaUrl } = actual;
  const datos = { sedeId, direccion, telefono, correo, whatsapp, horario: horario ?? "", mapaUrl };
  for (const mapa of [
    "https://example.com/maps/embed?pb=x",
    "https://www.google.com.evil.test/maps/embed?pb=x",
    "https://www.google.com/maps/embed/otro?pb=x",
    "http://www.google.com/maps/embed?pb=x",
  ])
    await expect(guardarContacto({ ...datos, mapaUrl: mapa }, sesion)).rejects.toThrow();
  const sede = await prisma.sede.findUniqueOrThrow({ where: { nombre: "Escuintla" } });
  expect((await publicarContacto({ ...datos, sedeId: sede.id })).ok).toBe(false);
  expect(await prisma.bitacora.count()).toBe(0);
});
const MENSAJE_CORREO = "Indique un correo válido.";
const contactoBase = {
  sedeId: 1,
  direccion: "Calle",
  telefono: "",
  whatsapp: "",
  horario: "",
  mapaUrl: "",
};
it("H-62 / CE-13b: el correo vacío o válido pasa y el mal formado se rechaza", () => {
  for (const correo of ["", "oficina@ejemplo.com", "a.b@dominio.com.gt", "  oficina@ejemplo.com  "]) {
    expect(esquemaContacto.safeParse({ ...contactoBase, correo }).success, correo).toBe(true);
  }
  for (const correo of [
    "sin-arroba",
    "sin-dominio@",
    "con espacio@dominio.com",
    "correo@dominio.",
    "correo@dominio.com.",
  ]) {
    const resultado = esquemaContacto.safeParse({ ...contactoBase, correo });
    expect(resultado.success, correo).toBe(false);
    if (resultado.success) throw new Error("Se aceptó un correo mal formado");
    expect(resultado.error.issues).toEqual([expect.objectContaining({ message: MENSAJE_CORREO, path: ["correo"] })]);
  }
});
it("H-62 / CE-13b: el servidor no guarda un correo mal formado y sí guarda uno válido", async () => {
  const [actual] = await leerContactoPanel(sesion);
  const { sedeId, direccion, telefono, whatsapp, horario, mapaUrl } = actual;
  const datos = { sedeId, direccion, telefono, whatsapp, horario: horario ?? "", mapaUrl, correo: actual.correo };
  for (const correo of ["sin-arroba", "sin-dominio@", "con espacio@dominio.com", "correo@dominio."]) {
    await expect(guardarContacto({ ...datos, correo }, sesion)).rejects.toThrow(MENSAJE_CORREO);
    expect(await publicarContacto({ ...datos, correo })).toEqual({ ok: false, error: MENSAJE_CORREO });
  }
  expect((await leerContactoPanel(sesion)).find((s) => s.sedeId === sedeId)?.correo).toBe(actual.correo);
  expect(await prisma.bitacora.count()).toBe(0);
  await guardarContacto({ ...datos, correo: "oficina@ejemplo.com" }, sesion);
  expect((await leerContactoPanel(sesion)).find((s) => s.sedeId === sedeId)?.correo).toBe("oficina@ejemplo.com");
});
