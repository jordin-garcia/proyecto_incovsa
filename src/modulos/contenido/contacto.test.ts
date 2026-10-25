import { beforeEach, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import type { SesionActual } from "@/lib/sesion";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { leerEstructuraSitio } from "./servicio";
import { leerContactoPanel, guardarContacto } from "./contacto";
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
