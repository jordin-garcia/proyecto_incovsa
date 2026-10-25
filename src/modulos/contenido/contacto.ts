import { prisma } from "@/lib/prisma";
import type { SesionActual } from "@/lib/sesion";
import { ErrorNegocio } from "@/lib/errores";
import { exigirPermiso } from "@/modulos/permisos/servicio";
import { registrarBitacora } from "@/modulos/bitacora/servicio";
import { esquemaContacto } from "./esquemas-contacto";
const oficinas = { tieneOficina: true, nombre: { in: ["Quetzaltenango", "Guatemala"] } };
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
  if (!r.success) throw new ErrorNegocio(r.error.issues[0].message);
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
