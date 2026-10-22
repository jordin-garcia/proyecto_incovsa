import { beforeEach, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import type { SesionActual } from "@/lib/sesion";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { sembrarDemo } from "../../../prisma/semillas/demo";
import { moverPedidos, cancelarOpcion, enviarOpcion, guardarCampoOpcion } from "./opciones";
import { eliminarDelTablero } from "./servicio";

const aviso =
  "Otro facturador modificó estos pedidos. La pantalla se actualizará; revisa los cambios e inténtalo de nuevo";
let sesion: SesionActual;
let segunda: SesionActual;
let ids: number[];
beforeEach(async () => {
  await limpiarTablasDeNegocio();
  await sembrarDemo(prisma, { claveDemo: "Demo-pruebas-JC05" });
  const sesiones = await Promise.all(
    ["03", "04"].map(async (numero) => {
      const u = await prisma.usuario.findUniqueOrThrow({ where: { username: `picking.ejemplo.${numero}` } });
      return {
        sistema: "picking" as const,
        usuario: { id: u.id, usuario: u.displayUsername, nombre: u.name, rol: u.rol },
        permisos: ["pk.facturacion"],
        sedes: [{ id: 1, nombre: "Quetzaltenango", prefijoOdoo: "XE" }],
      };
    }),
  );
  [sesion, segunda] = sesiones as [SesionActual, SesionActual];
  ids = [];
  for (let i = 1; i <= 3; i++) {
    const p = await prisma.pedidoFacturado.create({
      data: {
        sedeId: 1,
        numeroOdoo: `JC05-${i}`,
        referencia: `XE-IN/SALIDA/${i}`,
        cliente: `Cliente ${i}`,
        sector: "Zona 1",
        posicion: i,
        cargadoPorId: sesion.usuario.id,
        detalles: { create: { producto: "Producto", lote: "", cantidadKg: "25", pesoConversionKg: "25", orden: 1 } },
      },
    });
    ids.push(p.id);
  }
});
async function estado(tipo: "camion" | "recoge" | null) {
  const opcion =
    tipo === null ? null : await prisma.opcionEnvio.findUniqueOrThrow({ where: { sedeId_tipo: { sedeId: 1, tipo } } });
  const pedidos = await prisma.pedidoFacturado.findMany({
    where: { sedeId: 1, opcionEnvioId: opcion?.id ?? null, envioId: null },
    orderBy: [{ posicion: "asc" }, { id: "asc" }],
  });
  return pedidos.map((p) => ({ id: p.id, posicion: p.posicion, actualizadoEn: p.actualizadoEn.toISOString() }));
}
async function movimiento(
  origen: "camion" | "recoge" | null,
  destino: "camion" | "recoge" | null,
  seleccion = ids,
  antesDe: number | null = null,
) {
  return {
    sedeId: 1,
    ids: seleccion,
    origen,
    destino,
    antesDe,
    estadoOrigen: await estado(origen),
    estadoDestino: await estado(destino),
  };
}
async function preparar() {
  await moverPedidos(sesion, await movimiento(null, "recoge"));
  await guardarCampoOpcion(sesion, { sedeId: 1, tipo: "recoge", campo: "fecha", valor: "2026-10-21" });
  await guardarCampoOpcion(sesion, { sedeId: 1, tipo: "recoge", campo: "hora", valor: "13:30" });
  return { sedeId: 1, tipo: "recoge", estadoEsperado: await estado("recoge") };
}
it("RN-48 / decisión 39: dos movimientos simultáneos del mismo pedido solo guardan uno", async () => {
  const entrada = await movimiento(null, "camion", [ids[0]!]);
  const resultados = await Promise.allSettled([
    moverPedidos(sesion, entrada),
    moverPedidos(segunda, { ...entrada, destino: "recoge" }),
  ]);
  expect(resultados.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  expect(resultados.find((r) => r.status === "rejected")).toMatchObject({ reason: { message: aviso } });
});
it("RF-SL-67 / decisión 39: rechaza ordenar con posiciones anteriores aunque el pedido siga en la opción", async () => {
  await preparar();
  const obsoleto = await movimiento("recoge", "recoge", [ids[0]!]);
  await moverPedidos(sesion, await movimiento("recoge", "recoge", [ids[2]!], ids[0]!));
  await expect(moverPedidos(segunda, obsoleto)).rejects.toThrow(aviso);
  expect((await estado("recoge")).map((p) => p.id)).toEqual([ids[2], ids[0], ids[1]]);
});
it("RF-SL-68 / decisión 39: eliminar compite con mover sin borrar pedidos ni registrar eliminación obsoleta", async () => {
  const esperado = await estado(null);
  await moverPedidos(sesion, await movimiento(null, null, [ids[0]!], ids[2]!));
  await expect(
    eliminarDelTablero([ids[0]!], {
      sedeId: 1,
      usuarioId: segunda.usuario.id,
      estadoEsperado: esperado.filter((p) => p.id === ids[0]),
    }),
  ).rejects.toThrow(aviso);
  expect(await prisma.pedidoFacturado.count()).toBe(3);
  expect(await prisma.bitacora.count({ where: { operacion: "Eliminación de pedidos facturados" } })).toBe(0);
});
it("RN-48 / decisión 39: un pedido que salió y regresó a la misma posición sigue siendo obsoleto", async () => {
  const entrada = await movimiento(null, "camion", [ids[2]!]);
  await moverPedidos(sesion, entrada);
  await moverPedidos(sesion, await movimiento("camion", null, [ids[2]!]));
  await expect(moverPedidos(segunda, entrada)).rejects.toThrow(aviso);
});
it("RN-48 / decisión 39: cancelar no devuelve pedidos agregados después de abrir la confirmación", async () => {
  await moverPedidos(sesion, await movimiento(null, "recoge", [ids[0]!]));
  const obsoleto = { sedeId: 1, tipo: "recoge", estadoEsperado: await estado("recoge") };
  await moverPedidos(sesion, await movimiento(null, "recoge", [ids[1]!]));
  await expect(cancelarOpcion(segunda, obsoleto)).rejects.toThrow(aviso);
  expect(await estado("recoge")).toHaveLength(2);
});
it("RNF-06 / decisión 41: enviar mientras el otro ordena no duplica ni cambia el envío confirmado", async () => {
  const entrada = await preparar();
  const orden = await movimiento("recoge", "recoge", [ids[2]!], ids[0]!);
  await enviarOpcion(sesion, entrada);
  await expect(moverPedidos(segunda, orden)).rejects.toThrow(aviso);
  expect(await enviarOpcion(segunda, entrada)).toBeNull();
  expect(await prisma.envio.count()).toBe(1);
  expect(await prisma.pedidoFacturado.count({ where: { envioId: { not: null } } })).toBe(3);
});
it("RNF-06 / decisión 39: un envío obsoleto no envía nuevos pedidos tras reutilizar la opción", async () => {
  const entrada = await preparar();
  await cancelarOpcion(sesion, entrada);
  await moverPedidos(sesion, await movimiento(null, "recoge", [ids[2]!]));
  await expect(enviarOpcion(segunda, entrada)).rejects.toThrow(aviso);
  expect(await prisma.envio.count()).toBe(0);
});
it("RNF-04 / decisión 39: las mutaciones rechazan entradas sin el estado que vio el navegador", async () => {
  await expect(
    moverPedidos(sesion, { sedeId: 1, ids, origen: null, destino: "camion", antesDe: null }),
  ).rejects.toThrow();
  await expect(cancelarOpcion(sesion, { sedeId: 1, tipo: "camion" })).rejects.toThrow();
  await expect(enviarOpcion(sesion, { sedeId: 1, tipo: "camion" })).rejects.toThrow();
  await expect(eliminarDelTablero(ids, { sedeId: 1, usuarioId: sesion.usuario.id })).rejects.toThrow();
});
