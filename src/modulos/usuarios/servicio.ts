import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { claveAccesoInterna, correoInterno, type SistemaCuenta } from "@/lib/cuentas";
import { esAccesoTotal } from "@/lib/roles";
import { ErrorNegocio } from "@/lib/errores";
import { revocarSesiones } from "@/lib/sesion";
import { ErrorAcceso } from "@/modulos/permisos/servicio";
import { registrarBitacora } from "@/modulos/bitacora/servicio";
import {
  MENSAJE_SEDE,
  mensajeClave,
  type EntradaCrearUsuario,
  type EntradaEditarUsuario,
  type EntradaEliminarUsuario,
  type EntradaRestablecerClave,
} from "./esquemas";
import type { PermisoCatalogo, SistemaPestana, UsuarioVisible } from "./tipos";

export const MENSAJE_CUENTA_TOTAL =
  "Ese nombre de usuario es de una cuenta de Gerencia o Soporte, que ya sirve en los dos sistemas.";
export const MENSAJE_NOMBRE_COMPARTIDO =
  "Ese nombre de usuario también tiene una cuenta en el otro sistema. Una cuenta de Gerencia o Soporte sirve en los dos, así que no puede compartir el nombre.";
export const MENSAJE_PROPIA_CUENTA = "No puede eliminar su propia cuenta.";

export type ContextoUsuario = {
  actorId: string;
  actorRol: string;
  sistema: SistemaPestana;
};

const inclusion = {
  permisos: { include: { permiso: { select: { codigo: true, sistema: true } } } },
  sedes: { include: { sede: { select: { id: true, nombre: true } } } },
} as const;

type FilaUsuario = Prisma.UsuarioGetPayload<{ include: typeof inclusion }>;
type FilaNombre = { id: string; sistema: string; rol: string };

export function mensajeYaExiste(sistema: SistemaPestana): string {
  return `Ese nombre de usuario ya existe en ${sistema === "picking" ? "el picking" : "el sitio"}.`;
}

/** Texto de la bitácora del prototipo (`cambiosAcceso`). */
export function cambiosAcceso(antes: readonly string[], ahora: readonly string[], etiqueta: string): string {
  const mas = ahora.filter((item) => !antes.includes(item));
  const menos = antes.filter((item) => !ahora.includes(item));
  return [
    mas.length ? `${etiqueta} asignados: ${mas.join(", ")}` : "",
    menos.length ? `${etiqueta} revocados: ${menos.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

function exigirAdmin(contexto: ContextoUsuario) {
  if (!esAccesoTotal(contexto.actorRol)) throw new ErrorAcceso();
}

function exigirClave(clave: string, confirmar: string) {
  const mensaje = mensajeClave(clave, confirmar);
  if (mensaje) throw new ErrorNegocio(mensaje);
}

function sistemaDe(valor: string): SistemaCuenta {
  if (valor === "sitio" || valor === "picking" || valor === "ambos") return valor;
  throw new Error(`Sistema de cuenta desconocido: ${valor}`);
}

function apareceEn(fila: { sistema: string; rol: string }, sistema: SistemaPestana) {
  return esAccesoTotal(fila.rol) || fila.sistema === sistema || fila.sistema === "ambos";
}

function presentar(fila: FilaUsuario, sistema: SistemaPestana): UsuarioVisible {
  const sedes = [...fila.sedes].sort((a, b) => a.sede.id - b.sede.id);
  return {
    id: fila.id,
    nombre: fila.name,
    usuario: fila.displayUsername,
    rol: fila.rol,
    correo: fila.correo,
    sistema: sistemaDe(fila.sistema),
    activo: fila.activo,
    accesoTotal: esAccesoTotal(fila.rol),
    sedesIds: sedes.map((sede) => sede.sede.id),
    sedesNombres: sedes.map((sede) => sede.sede.nombre),
    permisosCodigos: fila.permisos
      .filter((permiso) => permiso.permiso.sistema === sistema)
      .map((permiso) => permiso.permiso.codigo)
      .sort((a, b) => a.localeCompare(b, "es")),
  };
}

function prefijo(sistema: SistemaPestana) {
  return sistema === "picking" ? "Picking" : "Sitio web";
}

function ordenar(valores: readonly string[]) {
  return [...valores].sort((a, b) => a.localeCompare(b, "es"));
}

async function bloquearNombre(tx: Prisma.TransactionClient, usuario: string) {
  const clave = `usuario:${usuario}`;
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${clave}, 0))`;
}

async function nombresOcupados(tx: Prisma.TransactionClient, usuario: string) {
  return tx.usuario.findMany({
    where: { displayUsername: { equals: usuario, mode: "insensitive" } },
    select: { id: true, sistema: true, rol: true },
  });
}

function exigirNombreLibre(filas: FilaNombre[], sistema: SistemaPestana, rol: string) {
  // El prototipo (`formUsuario`) mira primero si el nombre ya está en este sistema, incluidos `ambos` y eliminados.
  if (filas.some((fila) => apareceEn(fila, sistema))) throw new ErrorNegocio(mensajeYaExiste(sistema));
  const otro: SistemaPestana = sistema === "picking" ? "sitio" : "picking";
  const delOtro = filas.find((fila) => apareceEn(fila, otro));
  if (delOtro && (esAccesoTotal(delOtro.rol) || esAccesoTotal(rol))) throw new ErrorNegocio(MENSAJE_CUENTA_TOTAL);
}

async function permisosDe(tx: Prisma.TransactionClient, sistema: SistemaPestana, codigos: readonly string[]) {
  const unicos = [...new Set(codigos)];
  if (unicos.length === 0) return [];
  const filas = await tx.permiso.findMany({
    where: { sistema, codigo: { in: unicos } },
    select: { id: true, codigo: true },
  });
  const porCodigo = new Map(filas.map((fila) => [fila.codigo, fila.id]));
  return unicos.filter((codigo) => porCodigo.has(codigo)).map((codigo) => ({ id: porCodigo.get(codigo)!, codigo }));
}

async function sedesDe(tx: Prisma.TransactionClient, ids: readonly number[]) {
  const unicos = [...new Set(ids)];
  if (unicos.length === 0) return [];
  const filas = await tx.sede.findMany({
    where: { id: { in: unicos } },
    select: { id: true, nombre: true },
    orderBy: { id: "asc" },
  });
  if (filas.length !== unicos.length) throw new ErrorAcceso();
  const porId = new Map(filas.map((fila) => [fila.id, fila]));
  return unicos.map((id) => porId.get(id)!);
}

async function leerVisible(tx: Prisma.TransactionClient, id: string, sistema: SistemaPestana) {
  const fila = await tx.usuario.findUniqueOrThrow({ where: { id }, include: inclusion });
  return presentar(fila, sistema);
}

function esDuplicado(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function listarPermisos(sistema: SistemaPestana): Promise<PermisoCatalogo[]> {
  return prisma.permiso.findMany({
    where: { sistema },
    orderBy: { id: "asc" },
    select: { codigo: true, modulo: true, descripcion: true },
  });
}

export async function listarUsuarios(sistema: SistemaPestana): Promise<UsuarioVisible[]> {
  const filas = await prisma.usuario.findMany({
    where: { eliminadoEn: null, sistema: { in: [sistema, "ambos"] } },
    orderBy: [{ name: "asc" }, { id: "asc" }],
    include: inclusion,
  });
  return filas.map((fila) => presentar(fila, sistema));
}

export function listarUsuariosDelPicking() {
  return listarUsuarios("picking");
}

export async function crearUsuario(entrada: EntradaCrearUsuario, contexto: ContextoUsuario): Promise<UsuarioVisible> {
  exigirAdmin(contexto);
  exigirClave(entrada.clave, entrada.confirmarClave);
  const total = esAccesoTotal(entrada.rol);
  if (!total && contexto.sistema === "picking" && entrada.sedesIds.length === 0) throw new ErrorNegocio(MENSAJE_SEDE);
  const hash = await hashPassword(entrada.clave);
  try {
    return await prisma.$transaction(async (tx) => {
      await bloquearNombre(tx, entrada.usuario);
      exigirNombreLibre(await nombresOcupados(tx, entrada.usuario), contexto.sistema, entrada.rol);
      const sistemaCuenta: SistemaCuenta = total ? "ambos" : contexto.sistema;
      const permisos = total ? [] : await permisosDe(tx, contexto.sistema, entrada.permisosCodigos);
      const sedes = total || contexto.sistema !== "picking" ? [] : await sedesDe(tx, entrada.sedesIds);
      const id = randomUUID();
      const username = claveAccesoInterna(sistemaCuenta, entrada.usuario);
      await tx.usuario.create({
        data: {
          id,
          name: entrada.nombre,
          email: correoInterno(username),
          username,
          displayUsername: entrada.usuario,
          sistema: sistemaCuenta,
          rol: entrada.rol,
          correo: entrada.correo,
          activo: true,
          cuentas: { create: { id: randomUUID(), accountId: id, providerId: "credential", password: hash } },
          ...(permisos.length ? { permisos: { create: permisos.map((permiso) => ({ permisoId: permiso.id })) } } : {}),
          ...(sedes.length ? { sedes: { create: sedes.map((sede) => ({ sedeId: sede.id })) } } : {}),
        },
      });
      const codigos = ordenar(permisos.map((permiso) => permiso.codigo));
      const nombres = sedes.map((sede) => sede.nombre);
      const acceso = total
        ? "acceso total"
        : `permisos: ${codigos.join(", ") || "ninguno"}${contexto.sistema === "picking" ? ` · sedes: ${nombres.join(", ")}` : ""}`;
      await registrarBitacora(tx, {
        sistema: contexto.sistema,
        operacion: "Creación de usuario",
        entidad: "usuario",
        registroId: id,
        usuarioId: contexto.actorId,
        detalle: {
          resumen: `${prefijo(contexto.sistema)} · ${entrada.usuario} · rol ${entrada.rol} · con contraseña · ${acceso}`,
          usuario: entrada.usuario,
          nombre: entrada.nombre,
          rol: entrada.rol,
          permisos: codigos,
          sedes: nombres,
        },
      });
      return leerVisible(tx, id, contexto.sistema);
    });
  } catch (error) {
    if (esDuplicado(error)) throw new ErrorNegocio(mensajeYaExiste(contexto.sistema));
    throw error;
  }
}

export async function editarUsuario(entrada: EntradaEditarUsuario, contexto: ContextoUsuario): Promise<UsuarioVisible> {
  exigirAdmin(contexto);
  const total = esAccesoTotal(entrada.rol);
  if (!total && contexto.sistema === "picking" && entrada.sedesIds.length === 0) throw new ErrorNegocio(MENSAJE_SEDE);
  try {
    return await prisma.$transaction(async (tx) => {
      const actual = await tx.usuario.findFirst({
        where: { id: entrada.id, eliminadoEn: null, sistema: { in: [contexto.sistema, "ambos"] } },
        include: inclusion,
      });
      if (!actual) throw new ErrorAcceso();
      await bloquearNombre(tx, actual.displayUsername);
      const ocupados = (await nombresOcupados(tx, actual.displayUsername)).filter((fila) => fila.id !== actual.id);
      if (total && ocupados.length > 0) throw new ErrorNegocio(MENSAJE_NOMBRE_COMPARTIDO);
      if (!total && ocupados.some((fila) => apareceEn(fila, contexto.sistema))) {
        throw new ErrorNegocio(mensajeYaExiste(contexto.sistema));
      }
      const sistemaCuenta: SistemaCuenta = total ? "ambos" : contexto.sistema;
      const permisos = total ? [] : await permisosDe(tx, contexto.sistema, entrada.permisosCodigos);
      const sedes = total || contexto.sistema !== "picking" ? [] : await sedesDe(tx, entrada.sedesIds);
      const username = claveAccesoInterna(sistemaCuenta, actual.displayUsername);
      await tx.usuario.update({
        where: { id: actual.id },
        data: {
          name: entrada.nombre,
          rol: entrada.rol,
          correo: entrada.correo,
          activo: entrada.activo,
          sistema: sistemaCuenta,
          username,
          email: correoInterno(username),
        },
      });
      // Esta pestaña solo reemplaza los permisos de su sistema. El acceso total vacía los dos.
      await tx.usuarioPermiso.deleteMany({
        where: total ? { usuarioId: actual.id } : { usuarioId: actual.id, permiso: { sistema: contexto.sistema } },
      });
      if (permisos.length) {
        await tx.usuarioPermiso.createMany({
          data: permisos.map((permiso) => ({ usuarioId: actual.id, permisoId: permiso.id })),
        });
      }
      if (total || contexto.sistema === "picking") {
        await tx.usuarioSede.deleteMany({ where: { usuarioId: actual.id } });
        if (sedes.length) {
          await tx.usuarioSede.createMany({ data: sedes.map((sede) => ({ usuarioId: actual.id, sedeId: sede.id })) });
        }
      } else {
        // El sitio no guarda sedes. Al degradar una cuenta `ambos` desde esta pestaña, se vacían.
        await tx.usuarioSede.deleteMany({ where: { usuarioId: actual.id } });
      }
      if (actual.activo && !entrada.activo) await revocarSesiones(actual.id, tx);
      const permisosAntes = ordenar(
        actual.permisos
          .filter((permiso) => permiso.permiso.sistema === contexto.sistema)
          .map((permiso) => permiso.permiso.codigo),
      );
      const sedesAntes = ordenar(actual.sedes.map((sede) => sede.sede.nombre));
      const permisosAhora = ordenar(permisos.map((permiso) => permiso.codigo));
      const sedesAhora = ordenar(sedes.map((sede) => sede.nombre));
      const cambios = [
        cambiosAcceso(permisosAntes, permisosAhora, "Permisos"),
        contexto.sistema === "picking" ? cambiosAcceso(sedesAntes, sedesAhora, "Sedes") : "",
      ]
        .filter(Boolean)
        .join(" · ");
      const base = `${prefijo(contexto.sistema)} · ${actual.displayUsername} · rol ${entrada.rol}`;
      await registrarBitacora(tx, {
        sistema: contexto.sistema,
        operacion: "Edición de usuario",
        entidad: "usuario",
        registroId: actual.id,
        usuarioId: contexto.actorId,
        detalle: {
          resumen: cambios ? `${base} · ${cambios}` : base,
          usuario: actual.displayUsername,
          nombre: entrada.nombre,
          rol: entrada.rol,
          permisos: permisosAhora,
          sedes: sedesAhora,
          activo: entrada.activo,
        },
      });
      return leerVisible(tx, actual.id, contexto.sistema);
    });
  } catch (error) {
    if (esDuplicado(error)) throw new ErrorNegocio(mensajeYaExiste(contexto.sistema));
    throw error;
  }
}

async function cuentaActiva(tx: Prisma.TransactionClient, id: string, sistema: SistemaPestana) {
  const actual = await tx.usuario.findFirst({
    where: { id, eliminadoEn: null, sistema: { in: [sistema, "ambos"] } },
    select: { id: true, name: true, displayUsername: true, rol: true },
  });
  if (!actual) throw new ErrorAcceso();
  return actual;
}

export async function restablecerClave(
  entrada: EntradaRestablecerClave,
  contexto: ContextoUsuario,
): Promise<{ id: string }> {
  exigirAdmin(contexto);
  exigirClave(entrada.clave, entrada.confirmarClave);
  const hash = await hashPassword(entrada.clave);
  return prisma.$transaction(async (tx) => {
    const actual = await cuentaActiva(tx, entrada.id, contexto.sistema);
    const cambio = await tx.cuenta.updateMany({
      where: { userId: actual.id, providerId: "credential" },
      data: { password: hash },
    });
    if (cambio.count === 0) {
      await tx.cuenta.create({
        data: { id: randomUUID(), accountId: actual.id, providerId: "credential", userId: actual.id, password: hash },
      });
    }
    await revocarSesiones(actual.id, tx);
    await registrarBitacora(tx, {
      sistema: contexto.sistema,
      operacion: "Restablecimiento de contraseña",
      entidad: "usuario",
      registroId: actual.id,
      usuarioId: contexto.actorId,
      detalle: {
        resumen: `${prefijo(contexto.sistema)} · ${actual.displayUsername}`,
        usuario: actual.displayUsername,
        nombre: actual.name,
      },
    });
    return { id: actual.id };
  });
}

export async function eliminarUsuario(
  entrada: EntradaEliminarUsuario,
  contexto: ContextoUsuario,
): Promise<{ id: string }> {
  exigirAdmin(contexto);
  if (entrada.id === contexto.actorId) throw new ErrorNegocio(MENSAJE_PROPIA_CUENTA);
  return prisma.$transaction(async (tx) => {
    const actual = await cuentaActiva(tx, entrada.id, contexto.sistema);
    const cambio = await tx.usuario.updateMany({
      where: { id: actual.id, eliminadoEn: null },
      data: { eliminadoEn: new Date(), activo: false },
    });
    if (cambio.count !== 1) throw new ErrorAcceso();
    await revocarSesiones(actual.id, tx);
    await registrarBitacora(tx, {
      sistema: contexto.sistema,
      operacion: "Eliminación de usuario",
      entidad: "usuario",
      registroId: actual.id,
      usuarioId: contexto.actorId,
      detalle: {
        resumen: `${prefijo(contexto.sistema)} · ${actual.displayUsername} · ${actual.name}`,
        usuario: actual.displayUsername,
        nombre: actual.name,
        rol: actual.rol,
      },
    });
    return { id: actual.id };
  });
}
