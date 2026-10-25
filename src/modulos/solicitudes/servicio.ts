import { prisma } from "@/lib/prisma";
import { fechaGuatemala } from "@/lib/fechas";
import { ErrorNegocio } from "@/lib/errores";
import { getCountryCallingCode, type CountryCode } from "libphonenumber-js";
import { esquemaSolicitud } from "./esquemas";

const oficinas = { tieneOficina: true, nombre: { in: ["Quetzaltenango", "Guatemala"] } };
export async function leerOpcionesContacto() {
  const [paises, departamentos, municipios, sedes] = await Promise.all([
    prisma.pais.findMany({ select: { codigo: true, nombre: true }, orderBy: { nombre: "asc" } }),
    prisma.departamento.findMany({ select: { id: true, nombre: true }, orderBy: { nombre: "asc" } }),
    prisma.municipio.findMany({ select: { id: true, nombre: true, departamentoId: true }, orderBy: { nombre: "asc" } }),
    prisma.sede.findMany({ where: oficinas, select: { id: true, nombre: true } }),
  ]);
  sedes.sort((a, b) => Number(b.nombre === "Quetzaltenango") - Number(a.nombre === "Quetzaltenango"));
  return { paises, departamentos, municipios, sedes };
}
/** Acción pública: no requiere sesión ni envía correo; devuelve exclusivamente el folio. */
export async function crearSolicitud(entrada: unknown) {
  const validado = esquemaSolicitud.safeParse(entrada);
  if (!validado.success) throw new ErrorNegocio("Revise los datos del formulario.");
  const d = validado.data;
  return prisma.$transaction(async (tx) => {
    const pais = await tx.pais.findUnique({ where: { codigo: d.pais }, select: { id: true } });
    const sede = await tx.sede.findFirst({ where: { ...oficinas, id: Number(d.sedeId) }, select: { id: true } });
    if (!pais || !sede) throw new ErrorNegocio("Revise el país y la sede seleccionados.");
    if (
      d.pais === "GT" &&
      !(await tx.municipio.findFirst({
        where: { id: Number(d.municipioId), departamentoId: Number(d.departamentoId) },
        select: { id: true },
      }))
    )
      throw new ErrorNegocio("Revise el departamento y el municipio seleccionados.");
    // El bloqueo de la fila estable serializa el cálculo y la inserción, incluso entre procesos.
    await tx.$queryRaw`SELECT id FROM configuracion_sitio WHERE id = 1 FOR UPDATE`;
    const [contador] = await tx.$queryRaw<
      { ultimo: string }[]
    >`SELECT COALESCE(MAX(CAST(split_part(folio, '-', 3) AS bigint)),0)::text AS ultimo FROM solicitud_contacto WHERE folio ~ '^SOL-[0-9]{4}-[0-9]+$'`;
    const folio = `SOL-${fechaGuatemala(new Date()).slice(0, 4)}-${String(BigInt(contador.ultimo) + 1n).padStart(4, "0")}`;
    await tx.solicitudContacto.create({
      data: {
        folio,
        motivo: d.motivo,
        nombre: d.nombre,
        empresa: d.empresa || null,
        correo: d.correo,
        telefono: d.telefono || null,
        telefonoCodigo: d.telefono ? `+${getCountryCallingCode(d.telefonoPais as CountryCode)}` : null,
        paisId: pais.id,
        sedeId: sede.id,
        departamentoId: d.pais === "GT" ? Number(d.departamentoId) : null,
        municipioId: d.pais === "GT" ? Number(d.municipioId) : null,
        mensaje: d.mensaje,
      },
      select: { id: true },
    });
    return { folio };
  });
}
