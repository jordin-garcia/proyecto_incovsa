import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { claveAccesoInterna, correoInterno, type SistemaCuenta } from "@/lib/cuentas";
import { esAccesoTotal } from "@/lib/roles";
import { ErrorNegocio } from "@/lib/errores";
import { ErrorAcceso } from "@/modulos/permisos/servicio";
import { registrarBitacora } from "@/modulos/bitacora/servicio";
import { revocarSesiones } from "@/lib/sesion";
import {
  esquemaCrearUsuario,
  esquemaEditarUsuario,
  esquemaEliminarUsuario,
  esquemaRestablecer,
  type SistemaAdministrado,
} from "./esquemas";

export type ActorUsuarios = { id: string; rol: string; sistema: SistemaAdministrado };

export type UsuarioLista = {
  id: string;
  nombre: string;
  usuario: string;
  rol: string;
  correo: string | null;
  activo: boolean;
  sistema: SistemaCuenta;
  accesoTotal: boolean;
  sedes: { id: number; nombre: string; prefijoOdoo: string }[];
  permisos: string[];
};

type Tx = Prisma.TransactionClient;

const etiquetaSistema = (sistema: SistemaAdministrado) => (sistema === "picking" ? "Picking" : "Sitio web");

function leer<T>(
  esquema: {
    safeParse: (
      v: unknown,
    ) => { success: true; data: T } | { success: false; error: { issues: { message: string }[] } };
  },
  entrada: unknown,
): T {
  const resultado = esquema.safeParse(entrada);
  if (!resultado.success) throw new ErrorNegocio(resultado.error.issues[0]?.message ?? "Revise los datos.");
  return resultado.data;
}

function exigirAdministrador(actor: ActorUsuarios) {
  if (!actor?.id || !esAccesoTotal(actor.rol)) throw new ErrorAcceso();
}

function esGlobal(cuenta: { sistema: string; rol: string }) {
  return cuenta.sistema === "ambos" || esAccesoTotal(cuenta.rol);
}

function mensajeDeNombre(
  conflicto: { sistema: string; rol: string },
  destino: SistemaCuenta,
  alEditar: boolean,
): string | null {
  const mismo = conflicto.sistema === destino;
  const global = esGlobal(conflicto) || destino === "ambos";
  if (!mismo && !global) return null;
  if (alEditar && destino === "ambos" && conflicto.sistema !== "ambos")
    return "Ese nombre de usuario también tiene una cuenta en el otro sistema. Una cuenta de Gerencia o Soporte sirve en los dos, así que no puede compartir el nombre.";
  if (!mismo && global)
    return "Ese nombre de usuario es de una cuenta de Gerencia o Soporte, que ya sirve en los dos sistemas.";
  return `Ese nombre de usuario ya existe en ${destino === "picking" ? "el picking" : destino === "sitio" ? "el sitio" : "los dos sistemas"}.`;
}

async function exigirNombreLibre(
  tx: Tx,
  nombreUsuario: string,
  destino: SistemaCuenta,
  exceptoId: string | null,
  alEditar: boolean,
) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${"usuario:" + nombreUsuario}, 0))`;
  const otros = await tx.usuario.findMany({
    where: {
      displayUsername: { equals: nombreUsuario, mode: "insensitive" },
      ...(exceptoId ? { NOT: { id: exceptoId } } : {}),
    },
    select: { sistema: true, rol: true },
  });
  for (const otro of otros) {
    const mensaje = mensajeDeNombre(otro, destino, alEditar);
    if (mensaje) throw new ErrorNegocio(mensaje);
  }
}

function cambios(antes: string[], ahora: string[], etiqueta: string) {
  const mas = ahora.filter((x) => !antes.includes(x));
  const menos = antes.filter((x) => !ahora.includes(x));
  return [
    mas.length ? `${etiqueta} asignados: ${mas.join(", ")}` : "",
    menos.length ? `${etiqueta} revocados: ${menos.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

async function permisosValidos(tx: Tx, sistema: SistemaAdministrado, codigos: string[]) {
  const unicos = [...new Set(codigos)];
  const filas = await tx.permiso.findMany({
    where: { codigo: { in: unicos }, sistema },
    select: { id: true, codigo: true },
  });
  if (filas.length !== unicos.length) throw new ErrorNegocio("Hay un permiso que no corresponde a este sistema.");
  return filas;
}

async function sedesValidas(tx: Tx, ids: number[]) {
  const unicos = [...new Set(ids)];
  const filas = await tx.sede.findMany({
    where: { id: { in: unicos } },
    select: { id: true, nombre: true, prefijoOdoo: true },
    orderBy: { prefijoOdoo: "asc" },
  });
  if (filas.length !== unicos.length) throw new ErrorNegocio("Hay una sede que no existe.");
  return filas;
}

function destinoDe(rol: string, sistema: SistemaAdministrado): SistemaCuenta {
  return esAccesoTotal(rol) ? "ambos" : sistema;
}

async function accesoDe(tx: Tx, sistema: SistemaAdministrado, rol: string, codigos: string[], sedeIds: number[]) {
  if (esAccesoTotal(rol)) return { permisos: [], sedes: [] as { id: number; prefijoOdoo: string }[] };
  const permisos = await permisosValidos(tx, sistema, codigos);
  const sedes = sistema === "picking" ? await sedesValidas(tx, sedeIds) : [];
  if (sistema === "picking" && sedes.length === 0) throw new ErrorNegocio("Marque al menos una sede.");
  return { permisos, sedes };
}

const seleccion = {
  id: true,
  name: true,
  displayUsername: true,
  rol: true,
  correo: true,
  activo: true,
  sistema: true,
  permisos: { include: { permiso: true } },
  sedes: { include: { sede: true } },
} satisfies Prisma.UsuarioSelect;

function aLista(
  fila: Prisma.UsuarioGetPayload<{ select: typeof seleccion }>,
  sistema: SistemaAdministrado,
): UsuarioLista {
  const accesoTotal = esAccesoTotal(fila.rol);
  return {
    id: fila.id,
    nombre: fila.name,
    usuario: fila.displayUsername,
    rol: fila.rol,
    correo: fila.correo,
    activo: fila.activo,
    sistema: fila.sistema as SistemaCuenta,
    accesoTotal,
    sedes: accesoTotal
      ? []
      : fila.sedes
          .map((s) => s.sede)
          .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
          .map((s) => ({ id: s.id, nombre: s.nombre, prefijoOdoo: s.prefijoOdoo })),
    permisos: accesoTotal
      ? []
      : fila.permisos
          .filter((p) => p.permiso.sistema === sistema)
          .map((p) => p.permiso.codigo)
          .sort(),
  };
}

async function cuentaDelSistema(tx: Tx, id: string, sistema: SistemaAdministrado) {
  const fila = await tx.usuario.findFirst({
    where: { id, eliminadoEn: null, OR: [{ sistema }, { sistema: "ambos" }] },
    select: seleccion,
  });
  if (!fila || (!esGlobal(fila) && fila.sistema !== sistema)) throw new ErrorNegocio("Ese usuario no está disponible.");
  return fila;
}

export async function listarUsuarios(sistema: SistemaAdministrado, actor: ActorUsuarios): Promise<UsuarioLista[]> {
  exigirAdministrador(actor);
  if (actor.sistema !== sistema) throw new ErrorAcceso();
  const filas = await prisma.usuario.findMany({
    where: { eliminadoEn: null, OR: [{ sistema }, { sistema: "ambos" }] },
    select: seleccion,
    orderBy: { name: "asc" },
  });
  return filas.filter((f) => esGlobal(f) || f.sistema === sistema).map((f) => aLista(f, sistema));
}

export async function crearUsuario(entrada: unknown, actor: ActorUsuarios) {
  const datos = leer(esquemaCrearUsuario, entrada);
  exigirAdministrador(actor);
  if (actor.sistema !== datos.sistema) throw new ErrorAcceso();
  const destino = destinoDe(datos.rol, datos.sistema);
  const password = await hashPassword(datos.clave);
  return prisma.$transaction(async (tx) => {
    await exigirNombreLibre(tx, datos.usuario, destino, null, false);
    const acceso = await accesoDe(tx, datos.sistema, datos.rol, datos.permisos, datos.sedes);
    const id = randomUUID();
    const username = claveAccesoInterna(destino, datos.usuario);
    await tx.usuario.create({
      data: {
        id,
        name: datos.nombre,
        username,
        displayUsername: datos.usuario,
        email: correoInterno(username),
        sistema: destino,
        rol: datos.rol,
        correo: datos.correo || null,
        activo: true,
        cuentas: { create: { id: randomUUID(), accountId: id, providerId: "credential", password } },
        permisos: { create: acceso.permisos.map((p) => ({ permisoId: p.id })) },
        sedes: { create: acceso.sedes.map((s) => ({ sedeId: s.id })) },
      },
    });
    const resumen =
      destino === "ambos"
        ? `${datos.usuario} · rol ${datos.rol} · con contraseña · acceso total`
        : `${datos.usuario} · rol ${datos.rol} · con contraseña · permisos: ${acceso.permisos.map((p) => p.codigo).join(", ") || "ninguno"}${datos.sistema === "picking" ? ` · sedes: ${acceso.sedes.map((s) => s.prefijoOdoo).join(", ")}` : ""}`;
    await registrarBitacora(tx, {
      sistema: datos.sistema,
      operacion: "Creación de usuario",
      entidad: "usuario",
      registroId: id,
      usuarioId: actor.id,
      detalle: { resumen: `${etiquetaSistema(datos.sistema)} · ${resumen}` },
    });
    return { id };
  });
}

export async function editarUsuario(entrada: unknown, actor: ActorUsuarios) {
  const datos = leer(esquemaEditarUsuario, entrada);
  exigirAdministrador(actor);
  if (actor.sistema !== datos.sistema) throw new ErrorAcceso();
  return prisma.$transaction(async (tx) => {
    const actual = await cuentaDelSistema(tx, datos.id, datos.sistema);
    const destino = destinoDe(datos.rol, datos.sistema);
    await exigirNombreLibre(tx, actual.displayUsername, destino, actual.id, true);
    const acceso = await accesoDe(tx, datos.sistema, datos.rol, datos.permisos, datos.sedes);
    const username = claveAccesoInterna(destino, actual.displayUsername);
    const antesPermisos = actual.permisos
      .filter((p) => p.permiso.sistema === datos.sistema)
      .map((p) => p.permiso.codigo)
      .sort();
    const antesSedes = actual.sedes.map((s) => s.sede.prefijoOdoo).sort();
    const ahoraPermisos = acceso.permisos.map((p) => p.codigo).sort();
    const ahoraSedes = acceso.sedes.map((s) => s.prefijoOdoo).sort();
    await tx.usuarioPermiso.deleteMany({ where: { usuarioId: actual.id } });
    await tx.usuarioSede.deleteMany({ where: { usuarioId: actual.id } });
    await tx.usuario.update({
      where: { id: actual.id },
      data: {
        name: datos.nombre,
        rol: datos.rol,
        correo: datos.correo || null,
        activo: datos.activo,
        sistema: destino,
        username,
        email: correoInterno(username),
        permisos: { create: acceso.permisos.map((p) => ({ permisoId: p.id })) },
        sedes: { create: acceso.sedes.map((s) => ({ sedeId: s.id })) },
      },
    });
    if (!datos.activo && actual.activo) await revocarSesiones(actual.id, tx);
    const cambiosAcceso = [
      cambios(antesPermisos, ahoraPermisos, "Permisos"),
      datos.sistema === "picking" ? cambios(antesSedes, ahoraSedes, "Sedes") : "",
    ]
      .filter(Boolean)
      .join(" · ");
    await registrarBitacora(tx, {
      sistema: datos.sistema,
      operacion: "Edición de usuario",
      entidad: "usuario",
      registroId: actual.id,
      usuarioId: actor.id,
      detalle: {
        resumen: `${etiquetaSistema(datos.sistema)} · ${actual.displayUsername} · rol ${datos.rol}${cambiosAcceso ? ` · ${cambiosAcceso}` : ""}`,
      },
    });
    return { id: actual.id };
  });
}

export async function restablecerContrasena(entrada: unknown, actor: ActorUsuarios) {
  const datos = leer(esquemaRestablecer, entrada);
  exigirAdministrador(actor);
  if (actor.sistema !== datos.sistema) throw new ErrorAcceso();
  const password = await hashPassword(datos.clave);
  return prisma.$transaction(async (tx) => {
    const actual = await cuentaDelSistema(tx, datos.id, datos.sistema);
    const cuenta = await tx.cuenta.findFirst({ where: { userId: actual.id, providerId: "credential" } });
    if (!cuenta) throw new ErrorNegocio("Ese usuario no está disponible.");
    await tx.cuenta.update({ where: { id: cuenta.id }, data: { password } });
    await revocarSesiones(actual.id, tx);
    await registrarBitacora(tx, {
      sistema: datos.sistema,
      operacion: "Restablecimiento de contraseña",
      entidad: "usuario",
      registroId: actual.id,
      usuarioId: actor.id,
      detalle: { resumen: `${etiquetaSistema(datos.sistema)} · ${actual.displayUsername}` },
    });
    return { id: actual.id };
  });
}

export async function eliminarUsuario(entrada: unknown, actor: ActorUsuarios) {
  const datos = leer(esquemaEliminarUsuario, entrada);
  exigirAdministrador(actor);
  if (actor.sistema !== datos.sistema) throw new ErrorAcceso();
  if (datos.id === actor.id) throw new ErrorNegocio("No puede eliminar su propia cuenta.");
  return prisma.$transaction(async (tx) => {
    const actual = await cuentaDelSistema(tx, datos.id, datos.sistema);
    await tx.usuario.update({
      where: { id: actual.id },
      data: { activo: false, eliminadoEn: new Date() },
    });
    await revocarSesiones(actual.id, tx);
    await registrarBitacora(tx, {
      sistema: datos.sistema,
      operacion: "Eliminación de usuario",
      entidad: "usuario",
      registroId: actual.id,
      usuarioId: actor.id,
      detalle: { resumen: `${etiquetaSistema(datos.sistema)} · ${actual.displayUsername} · ${actual.name}` },
    });
    return { id: actual.id };
  });
}
