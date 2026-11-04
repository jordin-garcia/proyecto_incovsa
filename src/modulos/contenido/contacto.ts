import { prisma } from "@/lib/prisma";
import type { SesionActual } from "@/lib/sesion";
import { ErrorNegocio } from "@/lib/errores";
import { exigirPermiso } from "@/modulos/permisos/servicio";
import { registrarBitacora } from "@/modulos/bitacora/servicio";
import { esquemaContacto } from "./esquemas-contacto";
const oficinas = { tieneOficina: true, nombre: { in: ["Quetzaltenango", "Guatemala"] } };
const mensajesValidacionContacto = new Set([
  "Elija la sede.",
  "La dirección admite hasta 250 caracteres.",
  "El teléfono admite hasta 60 caracteres.",
  "El correo admite hasta 120 caracteres.",
  "WhatsApp admite hasta 30 caracteres.",
  "El horario admite hasta 120 caracteres.",
  "Indique un correo válido.",
  "El mapa debe ser la dirección del mapa insertado de Google Maps (https://www.google.com/maps/embed?…).",
]);
export async function leerContactoPanel(sesion: SesionActual | null) {
  exigirPermiso(sesion, "sit.contacto");
  const sedes = await prisma.sede.findMany({
    where: oficinas,
    select: { id: true, nombre: true, informacionContacto: true },
  });
  return sedes
    .map((s) => ({
      sedeId: s.id,
      nombre: s.nombre,
      direccion: s.informacionContacto?.direccion ?? "",
      telefono: s.informacionContacto?.telefono ?? "",
      correo: s.informacionContacto?.correo ?? "",
      whatsapp: s.informacionContacto?.whatsapp ?? "",
      horario: s.informacionContacto?.horario ?? "",
      mapaUrl: s.informacionContacto?.mapaUrl ?? "",
    }))
    .sort((a, b) => Number(b.nombre === "Quetzaltenango") - Number(a.nombre === "Quetzaltenango"));
}
export async function guardarContacto(entrada: unknown, sesion: SesionActual | null) {
  exigirPermiso(sesion, "sit.contacto");
  const r = esquemaContacto.safeParse(entrada);
  if (!r.success) {
    const mensaje = r.error.issues.find((issue) => mensajesValidacionContacto.has(issue.message))?.message;
    throw new ErrorNegocio(mensaje ?? "Revise los datos del formulario.");
  }
  const { sedeId, ...datos } = r.data;
  return prisma.$transaction(async (tx) => {
    const sede = await tx.sede.findFirst({ where: { ...oficinas, id: sedeId }, select: { nombre: true } });
    if (!sede) throw new ErrorNegocio("La sede no tiene información de contacto pública.");
    await tx.informacionContacto.upsert({
      where: { sedeId },
      create: { sedeId, ...datos, horario: datos.horario || null },
      update: { ...datos, horario: datos.horario || null },
    });
    await registrarBitacora(tx, {
      sistema: "sitio",
      operacion: "Cambio de contenido del sitio",
      entidad: "contenido",
      usuarioId: sesion.usuario.id,
      detalle: { bloque: `Información de contacto · ${sede.nombre}` },
    });
    return { nombre: sede.nombre };
  });
}
