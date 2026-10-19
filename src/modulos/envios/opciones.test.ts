import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import type { SesionActual } from "@/lib/sesion";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { sembrarDemo } from "../../../prisma/semillas/demo";
import { consultarOpciones, guardarCampoOpcion, moverPedidos, cancelarOpcion, enviarOpcion } from "./opciones";

let sesion: SesionActual;
const opcion = { sedeId: 1, tipo: "camion" as const };
beforeEach(async () => {
  await limpiarTablasDeNegocio();
  await sembrarDemo(prisma, { claveDemo: "Clave-pruebas-jc04" });
  const usuario = await prisma.usuario.findUniqueOrThrow({ where: { username: "picking.ejemplo.03" } });
  sesion = {
    sistema: "picking",
    usuario: { id: usuario.id, usuario: usuario.displayUsername, nombre: usuario.name, rol: usuario.rol },
    permisos: ["pk.facturacion"],
    sedes: [{ id: 1, nombre: "Quetzaltenango", prefijoOdoo: "XE" }],
  };
});
afterEach(() => vi.useRealTimers());

async function preparar(
  tipo: "camion" | "recoge" = "camion",
  clientes = ["Cliente A", "Cliente B", "Cliente C"],
  cantidades = ["25", "15", "10"],
) {
  const ids: number[] = [];
  for (const [i, cliente] of clientes.entries()) {
    const p = await prisma.pedidoFacturado.create({
      data: {
        sedeId: 1,
        numeroOdoo: String(i + 1),
        referencia: `XE-IN/SALIDA/${i + 1}`,
        cliente,
        sector: "Zona 1",
        posicion: i + 1,
        cargadoPorId: sesion.usuario.id,
        detalles: {
          create: [
            {
              producto: "SULFATO DE SODIO",
              lote: i === 2 ? "9221" : "5287",
              pesoConversionKg: "25",
              cantidadKg: cantidades[i]!,
              orden: 1,
            },
          ],
        },
      },
    });
    ids.push(p.id);
  }
  await moverPedidos(sesion, { sedeId: 1, ids, origen: null, destino: tipo, antesDe: null });
  await guardarCampoOpcion(sesion, { sedeId: 1, tipo, campo: "fecha", valor: "2026-10-20" });
  await guardarCampoOpcion(sesion, { sedeId: 1, tipo, campo: "hora", valor: "13:30" });
  if (tipo === "camion") {
    const camion = await prisma.camion.findFirstOrThrow({ where: { sedeId: 1 }, orderBy: { id: "asc" } });
    const piloto = await prisma.usuario.findUniqueOrThrow({ where: { username: "picking.ejemplo.06" } });
    await guardarCampoOpcion(sesion, { ...opcion, campo: "camion", valor: camion.id });
    await guardarCampoOpcion(sesion, { ...opcion, campo: "piloto", valor: piloto.id });
  }
  return ids;
}

it("RN-52 / CP-33 / CP-34: numera por sede, tipo y día de Guatemala incluso en medianoche UTC", async () => {
  vi.setSystemTime(new Date("2026-10-20T05:59:59Z"));
  await preparar();
  expect(await enviarOpcion(sesion, opcion)).toMatchObject({ numero: 1, tipo: "ruta", fecha: "2026-10-19" });
  await preparar();
  expect(await enviarOpcion(sesion, opcion)).toMatchObject({ numero: 2 });
  await preparar("recoge");
  expect(await enviarOpcion(sesion, { sedeId: 1, tipo: "recoge" })).toMatchObject({ numero: 1, tipo: "pedido" });
  vi.setSystemTime(new Date("2026-10-20T06:00:00Z"));
  await preparar();
  expect(await enviarOpcion(sesion, opcion)).toMatchObject({ numero: 1, fecha: "2026-10-20" });
});

it("RN-51 / RN-33 / CP-19: agrupa por producto, lote y peso conservando primera aparición y lotes vacíos", async () => {
  const ids = await preparar();
  for (const id of ids.slice(0, 2))
    await prisma.detallePedidoFacturado.create({
      data: {
        pedidoFacturadoId: id,
        producto: "Sin lote",
        lote: "",
        pesoConversionKg: "25",
        cantidadKg: "0.125",
        orden: 2,
      },
    });
  await prisma.detallePedidoFacturado.create({
    data: {
      pedidoFacturadoId: ids[0]!,
      producto: "SULFATO DE SODIO",
      lote: "5287",
      pesoConversionKg: "40",
      cantidadKg: "5",
      orden: 3,
    },
  });
  const envio = await enviarOpcion(sesion, opcion);
  const lineas = await prisma.lineaPreparacion.findMany({
    where: { envioId: envio!.id },
    orderBy: { posicion: "asc" },
  });
  expect(
    lineas.map((l) => [l.producto, l.lote, l.pesoConversionKg.toFixed(3), l.cantidadKg.toFixed(3), l.marcado]),
  ).toEqual([
    ["SULFATO DE SODIO", "5287", "25.000", "40.000", false],
    ["Sin lote", "", "25.000", "0.250", false],
    ["SULFATO DE SODIO", "5287", "40.000", "5.000", false],
    ["SULFATO DE SODIO", "9221", "25.000", "10.000", false],
  ]);
  expect(
    await prisma.historialEstado.count({
      where: { envioId: envio!.id, estado: { nombre: "En Preparación" }, usuarioId: sesion.usuario.id },
    }),
  ).toBe(1);
  expect(
    await prisma.pedidoFacturado.count({ where: { id: { in: ids }, envioId: envio!.id, opcionEnvioId: null } }),
  ).toBe(3);
  expect((await consultarOpciones(sesion, 1)).opciones.find((o) => o.tipo === "camion")).toMatchObject({
    pedidos: [],
    camionId: null,
    pilotoId: null,
    fecha: "",
    hora: "",
  });
});

it("RNF-06 / CP-35: un fallo real al crear líneas revierte envío, número, historial, enlaces y bitácora", async () => {
  const ids = await preparar();
  await prisma.$executeRaw`CREATE OR REPLACE FUNCTION jc04_fallo_linea() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Fallo simulado de líneas JC-04'; END $$`;
  await prisma.$executeRaw`CREATE TRIGGER jc04_fallo BEFORE INSERT ON linea_preparacion FOR EACH ROW EXECUTE FUNCTION jc04_fallo_linea()`;
  try {
    await expect(enviarOpcion(sesion, opcion)).rejects.toThrow();
    expect(await prisma.envio.count()).toBe(0);
    expect(await prisma.lineaPreparacion.count()).toBe(0);
    expect(await prisma.entregaRuta.count()).toBe(0);
    expect(await prisma.historialEstado.count()).toBe(0);
    expect(await prisma.bitacora.count({ where: { operacion: "Envío de ruta a bodega" } })).toBe(0);
    expect(
      await prisma.pedidoFacturado.count({ where: { id: { in: ids }, envioId: null, opcionEnvioId: { not: null } } }),
    ).toBe(3);
  } finally {
    await prisma.$executeRaw`DROP TRIGGER jc04_fallo ON linea_preparacion`;
    await prisma.$executeRaw`DROP FUNCTION jc04_fallo_linea()`;
  }
  expect(await enviarOpcion(sesion, opcion)).toMatchObject({ numero: 1 });
});

it("RN-52 / decisión 41: envíos simultáneos y doble clic crean un solo envío; la opción puede reutilizarse", async () => {
  await preparar();
  const resultados = await Promise.all([enviarOpcion(sesion, opcion), enviarOpcion(sesion, opcion)]);
  expect(resultados.filter(Boolean)).toHaveLength(1);
  expect(await prisma.envio.count()).toBe(1);
  await preparar();
  expect(await enviarOpcion(sesion, opcion)).toMatchObject({ numero: 2 });
});

it("RN-53 / RF-SL-70 / CP-32 / CP-60: conserva los campos y rechaza enviar si falta cualquiera", async () => {
  await preparar();
  for (const campo of ["fecha", "hora", "camion", "piloto"] as const) {
    const datos = (await consultarOpciones(sesion, 1)).opciones.find((o) => o.tipo === "camion")!;
    const valor =
      campo === "fecha"
        ? datos.fecha
        : campo === "hora"
          ? datos.hora
          : campo === "camion"
            ? datos.camionId
            : datos.pilotoId;
    await guardarCampoOpcion(sesion, { ...opcion, campo, valor: null });
    await expect(enviarOpcion(sesion, opcion)).rejects.toThrow();
    await guardarCampoOpcion(sesion, { ...opcion, campo, valor });
  }
  expect((await consultarOpciones(sesion, 1)).opciones[0]).toMatchObject({ fecha: "2026-10-20", hora: "13:30" });
  await expect(guardarCampoOpcion(sesion, { ...opcion, campo: "fecha", valor: "2026-02-31" })).rejects.toThrow();
  await expect(guardarCampoOpcion(sesion, { ...opcion, campo: "hora", valor: "25:90" })).rejects.toThrow();
  const envio = await enviarOpcion(sesion, opcion);
  expect((await prisma.envio.findUniqueOrThrow({ where: { id: envio!.id } })).programadoPara.toISOString()).toBe(
    "2026-10-20T19:30:00.000Z",
  );
});

it("RN-13 / RF-SL-14: permite enviar 3500 kg en el camión de 3400 kg y los guarda exactos", async () => {
  await preparar("camion", ["Cliente A"], ["3500"]);
  const envio = await enviarOpcion(sesion, opcion);
  expect(
    (await prisma.lineaPreparacion.findFirstOrThrow({ where: { envioId: envio!.id } })).cantidadKg.toFixed(3),
  ).toBe("3500.000");
});

it("RF-SL-71 / RN-29 / RN-49 / CP-31: conserva el orden y reúne el mismo cliente y sector en una entrega", async () => {
  const ids = await preparar("camion", ["Cliente A", "Cliente B", "Cliente A"]);
  await moverPedidos(sesion, { sedeId: 1, ids: [ids[1]], origen: "camion", destino: "camion", antesDe: ids[0] });
  expect((await consultarOpciones(sesion, 1)).opciones[0]!.pedidos.map((p) => p.id)).toEqual([ids[1], ids[0], ids[2]]);
  const envio = await enviarOpcion(sesion, opcion);
  const entregas = await prisma.entregaRuta.findMany({ where: { envioId: envio!.id }, orderBy: { orden: "asc" } });
  expect(entregas.map((e) => [e.cliente, e.totalKg.toFixed(3)])).toEqual([
    ["Cliente B", "15.000"],
    ["Cliente A", "35.000"],
  ]);
  expect(
    (await prisma.pedidoFacturado.findMany({ where: { envioId: envio!.id }, orderBy: { posicion: "asc" } })).map(
      (p) => p.id,
    ),
  ).toEqual([ids[1], ids[0], ids[2]]);
});

it("RF-SL-17 / RN-48: cancelar regresa los pedidos al tablero y registra la cancelación", async () => {
  const ids = await preparar();
  expect(await cancelarOpcion(sesion, opcion)).toBe(3);
  expect(await prisma.pedidoFacturado.count({ where: { id: { in: ids }, envioId: null, opcionEnvioId: null } })).toBe(
    3,
  );
  expect(
    (await prisma.bitacora.findFirstOrThrow({ where: { operacion: "Cancelación de opción de envío" } })).detalle,
  ).toMatchObject({ numeros: ["1", "2", "3"] });
  expect(await prisma.envio.count()).toBe(0);
});

it("RF-SL-63 / RN-48: mueve varios juntos entre tablero y opciones, conservando el orden", async () => {
  const ids = await preparar();
  await moverPedidos(sesion, { sedeId: 1, ids: [ids[0], ids[2]], origen: "camion", destino: "recoge", antesDe: null });
  expect((await consultarOpciones(sesion, 1)).opciones[1]!.pedidos.map((p) => p.id)).toEqual([ids[0], ids[2]]);
  await moverPedidos(sesion, { sedeId: 1, ids: [ids[2]], origen: "recoge", destino: null, antesDe: null });
  await expect(
    moverPedidos(sesion, { sedeId: 2, ids: [ids[0]], origen: "recoge", destino: null, antesDe: null }),
  ).rejects.toThrow();
  await expect(
    moverPedidos(sesion, { sedeId: 1, ids: [ids[0]], origen: "camion", destino: null, antesDe: null }),
  ).rejects.toThrow();
});

it("RN-46 / RNF-04: rechaza camiones ajenos, pilotos no activos, sin sede y usuarios de otro rol", async () => {
  await preparar();
  const camion = await prisma.camion.create({
    data: { identificacion: "Camión ajeno", capacidadKg: "3400", sedeId: 2 },
  });
  await expect(guardarCampoOpcion(sesion, { ...opcion, campo: "camion", valor: camion.id })).rejects.toThrow();
  await expect(guardarCampoOpcion(sesion, { ...opcion, campo: "piloto", valor: sesion.usuario.id })).rejects.toThrow();
  const piloto = await prisma.usuario.findUniqueOrThrow({ where: { username: "picking.ejemplo.06" } });
  await prisma.usuario.update({ where: { id: piloto.id }, data: { activo: false } });
  await expect(enviarOpcion(sesion, opcion)).rejects.toThrow();
});

it("RNF-04 / RN-17: todas las lecturas y operaciones rechazan sesión, permiso o sede ajena", async () => {
  const acciones = [
    (s: SesionActual | null, sedeId: number) => consultarOpciones(s, sedeId),
    (s: SesionActual | null, sedeId: number) =>
      guardarCampoOpcion(s, { ...opcion, sedeId, campo: "hora", valor: "13:30" }),
    (s: SesionActual | null, sedeId: number) =>
      moverPedidos(s, { sedeId, ids: [1], origen: null, destino: "camion", antesDe: null }),
    (s: SesionActual | null, sedeId: number) => cancelarOpcion(s, { ...opcion, sedeId }),
    (s: SesionActual | null, sedeId: number) => enviarOpcion(s, { ...opcion, sedeId }),
  ];
  for (const accion of acciones) {
    await expect(accion(null, 1)).rejects.toThrow("No tiene permisos");
    await expect(accion({ ...sesion, permisos: [] }, 1)).rejects.toThrow("No tiene permisos");
    await expect(accion(sesion, 2)).rejects.toThrow("No tiene permisos");
  }
});

it("RN-52 / RN-49: separa sedes, nombres y sectores exactos, y agrega la cola de Bodega al final", async () => {
  const ids = await preparar("camion", ["Cliente A", "Cliente A", "cliente a"]);
  await prisma.pedidoFacturado.update({ where: { id: ids[1] }, data: { sector: "Zona 2" } });
  const primero = await enviarOpcion(sesion, opcion);
  expect(await prisma.entregaRuta.count({ where: { envioId: primero!.id } })).toBe(3);
  const otraSede = { ...sesion, sedes: [...sesion.sedes, { id: 2, nombre: "Guatemala", prefijoOdoo: "GT" }] };
  const opcionOtraSede = await prisma.opcionEnvio.findUniqueOrThrow({
    where: { sedeId_tipo: { sedeId: 2, tipo: "recoge" } },
  });
  await prisma.pedidoFacturado.create({
    data: {
      sedeId: 2,
      numeroOdoo: "1",
      referencia: "GT-IN/SALIDA/1",
      cliente: "Cliente A",
      sector: "Zona 1",
      posicion: 1,
      cargadoPorId: sesion.usuario.id,
      opcionEnvioId: opcionOtraSede.id,
      detalles: {
        create: [{ producto: "SULFATO DE SODIO", lote: "", pesoConversionKg: "25", cantidadKg: "10", orden: 1 }],
      },
    },
  });
  await guardarCampoOpcion(otraSede, { sedeId: 2, tipo: "recoge", campo: "fecha", valor: "2026-10-20" });
  await guardarCampoOpcion(otraSede, { sedeId: 2, tipo: "recoge", campo: "hora", valor: "13:30" });
  const segundo = await enviarOpcion(otraSede, { sedeId: 2, tipo: "recoge" });
  expect(segundo).toMatchObject({ numero: 1 });
  await preparar("recoge");
  const tercero = await enviarOpcion(sesion, { sedeId: 1, tipo: "recoge" });
  expect((await prisma.envio.findUniqueOrThrow({ where: { id: tercero!.id } })).posicionCola).toBe(2);
});
