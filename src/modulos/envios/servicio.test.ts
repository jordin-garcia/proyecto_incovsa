import { readFileSync } from "node:fs";
import { beforeEach, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import type { SesionActual } from "@/lib/sesion";
import { leerArchivoOdoo } from "@/modulos/odoo/servicio";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { sembrarDemo } from "../../../prisma/semillas/demo";
import { consultarTableroFacturacion, eliminarDelTablero, guardarCargaDeOdoo } from "./servicio";

const claveDemo = "Clave-de-prueba-envios";
const archivo = readFileSync(new URL("../../../pruebas/fixtures/odoo/odoo-ejemplo-anonimizado.xlsx", import.meta.url));
const sesionFacturador: SesionActual = {
  sistema: "picking",
  usuario: { id: "facturador", usuario: "facturador", nombre: "Facturador de prueba", rol: "Facturador" },
  permisos: ["pk.facturacion"],
  sedes: [{ id: 1, nombre: "Quetzaltenango", prefijoOdoo: "XE" }],
};

beforeEach(async () => {
  await limpiarTablasDeNegocio();
  await sembrarDemo(prisma, { claveDemo });
});

async function datosCarga() {
  const usuario = await prisma.usuario.findUniqueOrThrow({ where: { username: "picking.ejemplo.03" } });
  return {
    lectura: await leerArchivoOdoo(archivo, "XE"),
    entrada: { sedeId: 1, usuarioId: usuario.id, nombreArchivo: "odoo-ejemplo-anonimizado.xlsx" },
    usuarioId: usuario.id,
  };
}

it("RN-17 / RNF-04: rechaza listar el tablero sin sesión, permiso o sede autorizada", async () => {
  await expect(consultarTableroFacturacion(null, 1)).rejects.toThrow("No tiene permisos para acceder a este módulo.");
  await expect(consultarTableroFacturacion({ ...sesionFacturador, permisos: [] }, 1)).rejects.toThrow(
    "No tiene permisos para acceder a este módulo.",
  );
  await expect(consultarTableroFacturacion(sesionFacturador, 2)).rejects.toThrow(
    "No tiene permisos para acceder a este módulo.",
  );
});

it("RF-SL-50 / CU-01: guarda los 33 pedidos válidos, sus líneas y el resumen del prototipo", async () => {
  const { lectura, entrada, usuarioId } = await datosCarga();
  const resumen = await guardarCargaDeOdoo({ ...entrada, lectura });
  const tablero = await consultarTableroFacturacion(sesionFacturador, 1);
  const bitacora = await prisma.bitacora.findFirstOrThrow({ where: { operacion: "Carga de archivo de Odoo" } });

  expect(resumen).toEqual({ pedidosCargados: 33, noCargados: 46, otrosEstados: 1 });
  expect(tablero).toHaveLength(33);
  expect(tablero[0]).toMatchObject({
    numero: "03543",
    cliente: "Cliente de ejemplo 003",
    sector: "San Fransisco el Alto, Totonicapan",
  });
  expect(tablero[0]?.lineas).toHaveLength(7);
  expect(tablero[0]?.lineas[0]).toMatchObject({
    producto: "SODA ASH (CHI-SAC/0040KG)",
    lote: "5287",
    cantidadKg: "120.000",
  });
  expect(bitacora.usuarioId).toBe(usuarioId);
  expect(bitacora.detalle).toMatchObject({
    nombreArchivo: "odoo-ejemplo-anonimizado.xlsx",
    pedidosCargados: 33,
    noCargados: expect.arrayContaining([
      expect.objectContaining({ motivo: expect.stringContaining("Peso de Conversión") }),
    ]),
    otrosEstados: 1,
  });
  expect((bitacora.detalle as { noCargados: unknown[] }).noCargados).toHaveLength(46);
});

it("RN-48: conserva el tablero por sede y no deduplica números de Odoo", async () => {
  const { lectura, entrada } = await datosCarga();
  await guardarCargaDeOdoo({ ...entrada, lectura });
  const primero = await consultarTableroFacturacion(sesionFacturador, 1);
  await guardarCargaDeOdoo({ ...entrada, lectura });
  const segundo = await consultarTableroFacturacion(sesionFacturador, 1);

  expect(primero).toHaveLength(33);
  expect(segundo).toHaveLength(66);
  expect(segundo.slice(0, 33).map((pedido) => pedido.id)).toEqual(primero.map((pedido) => pedido.id));
  expect(segundo[0]?.numero).toBe(segundo[33]?.numero);
});

it("RN-48: serializa las cargas simultáneas y asigna posiciones consecutivas", async () => {
  const { lectura, entrada } = await datosCarga();
  await Promise.all([guardarCargaDeOdoo({ ...entrada, lectura }), guardarCargaDeOdoo({ ...entrada, lectura })]);

  const pedidos = await prisma.pedidoFacturado.findMany({
    where: { sedeId: entrada.sedeId, opcionEnvioId: null, envioId: null },
    orderBy: { posicion: "asc" },
    select: { posicion: true },
  });
  expect(pedidos).toHaveLength(66);
  expect(pedidos.map((pedido) => pedido.posicion)).toEqual(Array.from({ length: 66 }, (_, indice) => indice + 1));
});

it("RF-SL-67: muestra el respaldo del prototipo cuando cliente o sector vienen vacíos", async () => {
  const { lectura, entrada } = await datosCarga();
  await guardarCargaDeOdoo({ ...entrada, lectura });
  const pedido = await prisma.pedidoFacturado.findFirstOrThrow({ where: { numeroOdoo: "03543" } });
  await prisma.pedidoFacturado.update({ where: { id: pedido.id }, data: { cliente: "", sector: "" } });

  const tablero = await consultarTableroFacturacion(sesionFacturador, 1);
  expect(tablero[0]).toMatchObject({ numero: "03543", cliente: "Sin nombre", sector: "Sin sector" });
});

it("RF-SL-68 / decisión 3: elimina pedidos del tablero y registra número, cliente y total en la bitácora", async () => {
  const { lectura, entrada, usuarioId } = await datosCarga();
  await guardarCargaDeOdoo({ ...entrada, lectura });
  const tablero = await consultarTableroFacturacion(sesionFacturador, 1);
  const seleccionados = tablero.slice(0, 2);

  const resultado = await eliminarDelTablero(
    seleccionados.map((pedido) => pedido.id),
    { sedeId: 1, usuarioId, estadoEsperado: seleccionados },
  );
  const eliminacion = await prisma.bitacora.findFirstOrThrow({
    where: { operacion: "Eliminación de pedidos facturados" },
  });

  expect(resultado).toBe(2);
  expect(await consultarTableroFacturacion(sesionFacturador, 1)).toHaveLength(31);
  expect(eliminacion.detalle).toMatchObject({
    pedidos: expect.arrayContaining([
      expect.objectContaining({
        numero: seleccionados[0]?.numero,
        cliente: seleccionados[0]?.cliente,
        totalKg: expect.any(String),
      }),
      expect.objectContaining({
        numero: seleccionados[1]?.numero,
        cliente: seleccionados[1]?.cliente,
        totalKg: expect.any(String),
      }),
    ]),
  });
});

it("RN-48 / RN-17: rechaza la eliminación completa si algún pedido ya no pertenece al tablero de esa sede", async () => {
  const { lectura, entrada, usuarioId } = await datosCarga();
  await guardarCargaDeOdoo({ ...entrada, lectura });
  const tablero = await consultarTableroFacturacion(sesionFacturador, 1);

  await expect(
    eliminarDelTablero([tablero[0]!.id, 999_999], { sedeId: 1, usuarioId, estadoEsperado: [tablero[0]!] }),
  ).rejects.toThrow(
    "Otro facturador modificó estos pedidos. La pantalla se actualizará; revisa los cambios e inténtalo de nuevo",
  );
  expect(await consultarTableroFacturacion(sesionFacturador, 1)).toHaveLength(33);
  expect(await prisma.bitacora.count({ where: { operacion: "Eliminación de pedidos facturados" } })).toBe(0);
});
