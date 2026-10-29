import { beforeEach, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { MENSAJE_CLAVE_CORTA, MENSAJE_CLAVE_DISTINTA, MENSAJE_NOMBRE_USUARIO } from "@/modulos/usuarios/esquemas";
import { limpiarTablasDeNegocio } from "../pruebas/bd";
import {
  MENSAJE_ERROR_CREAR_ADMIN,
  MENSAJE_ROL_ADMIN,
  MENSAJE_USUARIO_RESERVADO,
  crearAdministrador,
  mensajeDeError,
} from "./administrador";

const clave = "Clave-admin-25";
const datos = (parcial: Record<string, string> = {}) => ({
  nombre: "Administración JG-25",
  usuario: "admin.jg25",
  rol: "Gerencia",
  clave,
  confirmarClave: clave,
  ...parcial,
});

async function error(entrada: unknown) {
  try {
    await crearAdministrador(entrada);
  } catch (e) {
    return mensajeDeError(e);
  }
  throw new Error("Se esperaba un error.");
}

beforeEach(async () => {
  await limpiarTablasDeNegocio();
});

it("decisión 8 (H-36): crear-admin compara el rol como normalizarRol y guarda Gerencia o Soporte", async () => {
  await crearAdministrador(datos({ usuario: "admin.gerencia", rol: " gerencia " }));
  await crearAdministrador(datos({ usuario: "admin.soporte", rol: "SOPORTE" }));
  const roles = await prisma.usuario.findMany({
    where: { displayUsername: { in: ["admin.gerencia", "admin.soporte"] } },
    orderBy: { displayUsername: "asc" },
    select: { rol: true, sistema: true },
  });
  expect(roles).toEqual([
    { rol: "Gerencia", sistema: "ambos" },
    { rol: "Soporte", sistema: "ambos" },
  ]);
  expect(await error(datos({ usuario: "admin.bodega", rol: "Bodega" }))).toBe(MENSAJE_ROL_ADMIN);
  expect(MENSAJE_ROL_ADMIN).toBe("El rol debe ser Gerencia o Soporte.");
});

it("H-36: crear-admin dice si la contraseña es corta, si no coincide o si el usuario ya existe", async () => {
  expect(await error(datos({ clave: "corta", confirmarClave: "corta" }))).toBe(MENSAJE_CLAVE_CORTA);
  expect(await error(datos({ confirmarClave: "Otra-clave-25" }))).toBe(MENSAJE_CLAVE_DISTINTA);
  expect(await error(datos({ nombre: "  " }))).toBe(MENSAJE_NOMBRE_USUARIO);
  expect(await error(datos({ usuario: "" }))).toBe(MENSAJE_NOMBRE_USUARIO);
  await crearAdministrador(datos());
  expect(await error(datos({ usuario: "ADMIN.JG25" }))).toBe(MENSAJE_USUARIO_RESERVADO);
  // Un error inesperado (por ejemplo, de conexión) nunca muestra su texto técnico.
  expect(mensajeDeError(new Error("connect ECONNREFUSED postgresql://usuario:clave@host"))).toBe(
    MENSAJE_ERROR_CREAR_ADMIN,
  );
  expect(MENSAJE_ERROR_CREAR_ADMIN).toBe(
    "No se pudo crear la cuenta. Revise los datos, la conexión y que el usuario no exista.",
  );
});
