import { beforeEach, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import type { SesionActual } from "@/lib/sesion";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { consultarDespacho, consultarRutas, consultarOperaciones, consultarAnios } from "./servicio";
import { resolverPeriodo } from "./periodo";

let sesion: SesionActual | null;
vi.mock("@/lib/sesion", () => ({ obtenerSesion: async () => sesion }));
const dia = { tipo: "dia", referencia: "2026-10-25" };
beforeEach(async () => {
  await limpiarTablasDeNegocio();
  const usuario = await prisma.usuario.create({
    data: {
      id: "reportes",
      name: "Reportes",
      username: "reportes",
      displayUsername: "reportes",
      email: "reportes@example.test",
      rol: "Consulta",
      sistema: "picking",
    },
  });
  sesion = {
    sistema: "picking",
    usuario: { id: usuario.id, usuario: "reportes", nombre: usuario.name, rol: usuario.rol },
    permisos: ["pk.reportes"],
    sedes: [{ id: 1, nombre: "Quetzaltenango", prefijoOdoo: "XE" }],
  };
});
async function envio({
  sedeId = 1,
  numero = 1,
  tipo = "ruta",
  estado = "En Ruta",
  fecha = "2026-10-25",
  cierre = "2026-10-25T23:30:00-06:00",
  cantidades = ["25.125", "25.125", "15.001"],
  pesos = ["25", "25", "10"],
  productos = ["PRODUCTO", "PRODUCTO", "PRODUCTO"],
} = {}) {
  const estadoActual = await prisma.estadoEnvio.findUniqueOrThrow({ where: { nombre: estado } });
  const e = await prisma.envio.create({
    data: {
      sedeId,
      tipo,
      numero,
      fechaEnvio: new Date(`${fecha}T00:00:00Z`),
      programadoPara: new Date(`${fecha}T13:30:00-06:00`),
      enviadoPorId: "reportes",
      estadoId: estadoActual.id,
      lineas: {
        create: cantidades.map((cantidadKg, i) => ({
          producto: productos[i]!,
          lote: String(i),
          pesoConversionKg: pesos[i]!,
          cantidadKg,
          posicion: i + 1,
        })),
      },
      historial: {
        create: {
          estado: { connect: { nombre: tipo === "ruta" ? "En Ruta" : "Despachado" } },
          usuario: { connect: { id: "reportes" } },
          creadoEn: new Date(cierre),
        },
      },
      entregas:
        tipo === "ruta"
          ? {
              create: [
                { cliente: "Segundo", sector: "", totalKg: "10", orden: 2 },
                { cliente: "Primero", sector: "", totalKg: "10", orden: 1 },
              ],
            }
          : undefined,
    },
  });
  return e;
}
it("RF-SL-38 / RN-01: agrupa por producto y peso entre lotes; suma kg y conversiones exactas", async () => {
  await envio();
  await envio({ tipo: "pedido", estado: "Despachado", cantidades: ["0.125"], pesos: ["25"] });
  await envio({ numero: 2, estado: "En Preparación", cierre: "2026-10-26T00:00:00-06:00" });
  const r = await consultarDespacho(sesion, 1, dia);
  expect(r).toMatchObject({
    totalKg: "65.376",
    unidades: 3,
    restoKg: "5.376",
    rutasCerradas: 1,
    pedidosCerrados: 1,
    rutasEntregadas: 0,
  });
  expect(r.filas).toEqual([
    expect.objectContaining({
      producto: "PRODUCTO",
      pesoConversionKg: "25.000",
      cantidadKg: "50.375",
      unidades: 2,
      restoKg: "0.375",
    }),
    expect.objectContaining({
      producto: "PRODUCTO",
      pesoConversionKg: "10.000",
      cantidadKg: "15.001",
      unidades: 1,
      restoKg: "5.001",
    }),
  ]);
});
it("RF-SL-38: mantiene el orden de primera aparición cuando dos productos empatan", async () => {
  await envio({ cantidades: ["100"], pesos: ["25"], productos: ["SULFURO DE SODIO"] });
  await envio({ numero: 2, cantidades: ["100"], pesos: ["25"], productos: ["SODA CAUSTICA"] });
  const r = await consultarDespacho(sesion, 1, dia);
  expect(r.filas.map((fila) => fila.producto)).toEqual(["SULFURO DE SODIO", "SODA CAUSTICA"]);
});
it("RF-SL-59: domingo 23:30 pertenece a lunes-domingo y no a la siguiente semana; rango inclusivo", async () => {
  await envio();
  expect((await consultarDespacho(sesion, 1, { tipo: "semana", referencia: "2026-10-19" })).rutasCerradas).toBe(1);
  expect((await consultarDespacho(sesion, 1, { tipo: "semana", referencia: "2026-10-26" })).rutasCerradas).toBe(0);
  await envio({ numero: 2, cierre: "2026-10-19T00:00:00-06:00" });
  await envio({ numero: 3, cierre: "2026-10-26T00:00:00-06:00" });
  expect(
    (await consultarDespacho(sesion, 1, { tipo: "rango", desde: "2026-10-25", hasta: "2026-10-19" })).rutasCerradas,
  ).toBe(2);
});
it("RF-SL-37 / RN-29: solo En Ruta y Entregado, orden descendente y recorrido final solo al entregar", async () => {
  await envio();
  const entregada = await envio({ numero: 2, estado: "Entregado", fecha: "2026-10-24" });
  await prisma.historialEstado.create({
    data: {
      envio: { connect: { id: entregada.id } },
      usuario: { connect: { id: "reportes" } },
      estado: { connect: { nombre: "Entregado" } },
      creadoEn: new Date("2026-10-25T10:00:00-06:00"),
    },
  });
  await envio({ numero: 3, estado: "En Preparación" });
  const r = await consultarRutas(sesion, 1, { tipo: "rango", desde: "2026-10-24", hasta: "2026-10-25" });
  expect(r.map((x) => x.numero)).toEqual([1, 2]);
  expect(r[0]!.recorrido).toBeNull();
  expect(r[1]!.recorrido).toEqual(["Primero", "Segundo"]);
  expect((await consultarDespacho(sesion, 1, dia)).rutasEntregadas).toBe(1);
});
it("RN-17 / RN-39: conserva operaciones globales de ambos sistemas, aísla sedes y no registra el marcado", async () => {
  for (const sistema of ["sitio", "picking"])
    await prisma.bitacora.create({
      data: {
        sistema,
        operacion: "Inicio de sesión",
        usuarioId: "reportes",
        detalle: {},
        creadoEn: new Date("2026-10-25T12:00:00-06:00"),
      },
    });
  await prisma.bitacora.createMany({
    data: [
      {
        sistema: "picking",
        operacion: "Envío de ruta a bodega",
        entidad: "envio",
        detalle: { sede: "Guatemala" },
        creadoEn: new Date("2026-10-25T12:00:00-06:00"),
      },
      {
        sistema: "picking",
        operacion: "Envío de ruta a bodega",
        entidad: "envio",
        detalle: { sede: "Quetzaltenango" },
        creadoEn: new Date("2026-10-25T12:00:00-06:00"),
      },
      {
        sistema: "picking",
        operacion: "Cambio de estado",
        entidad: "envio",
        detalle: "Guatemala · Ruta 1 pasa a En Ruta",
        creadoEn: new Date("2026-10-25T12:00:00-06:00"),
      },
      {
        sistema: "picking",
        operacion: "Cambio de estado",
        entidad: "envio",
        detalle: "Quetzaltenango · Ruta 1 pasa a En Ruta",
        creadoEn: new Date("2026-10-25T12:00:00-06:00"),
      },
    ],
  });
  const usuariosConSedes = [
    { id: "usuario-xela", sedeIds: [1] },
    { id: "usuario-guatemala-a-xela", sedeIds: [1] },
    { id: "usuario-guatemala-a-gerencia", sedeIds: [] },
    { id: "usuario-multisede", sedeIds: [1, 2] },
    { id: "usuario-restablecer-xela", sedeIds: [1] },
    { id: "usuario-eliminar-guatemala", sedeIds: [2] },
    { id: "usuario-xela-a-gerencia", sedeIds: [] },
  ];
  for (const { id, sedeIds } of usuariosConSedes)
    await prisma.usuario.create({
      data: {
        id,
        name: id,
        username: id,
        displayUsername: id,
        email: `${id}@example.test`,
        rol: "Consulta",
        sistema: "picking",
        sedes: { create: sedeIds.map((sedeId) => ({ sede: { connect: { id: sedeId } } })) },
      },
    });
  await prisma.bitacora.createMany({
    data: [
      {
        sistema: "picking",
        operacion: "Creación de usuario",
        entidad: "usuario",
        registroId: "usuario-xela",
        usuarioId: "reportes",
        detalle: { resumen: "Picking · usuario-xela · Sedes asignados: Quetzaltenango", sedes: ["Quetzaltenango"] },
        creadoEn: new Date("2026-10-25T12:00:00-06:00"),
      },
      {
        sistema: "picking",
        operacion: "Edición de usuario",
        entidad: "usuario",
        registroId: "usuario-guatemala-a-xela",
        usuarioId: "reportes",
        detalle: {
          resumen: "Picking · usuario-guatemala-a-xela · Sedes asignados: Quetzaltenango · Sedes revocados: Guatemala",
          sedes: ["Quetzaltenango"],
        },
        creadoEn: new Date("2026-10-25T12:00:00-06:00"),
      },
      {
        sistema: "picking",
        operacion: "Edición de usuario",
        entidad: "usuario",
        registroId: "usuario-guatemala-a-gerencia",
        usuarioId: "reportes",
        detalle: { resumen: "Picking · cuenta total · Sedes revocados: Guatemala", sedes: [] },
        creadoEn: new Date("2026-10-25T12:00:00-06:00"),
      },
      {
        sistema: "picking",
        operacion: "Edición de usuario",
        entidad: "usuario",
        registroId: "usuario-multisede",
        usuarioId: "reportes",
        detalle: {
          resumen: "Picking · usuario-multisede",
          sedes: ["Quetzaltenango", "Guatemala"],
        },
        creadoEn: new Date("2026-10-25T12:00:00-06:00"),
      },
      {
        sistema: "picking",
        operacion: "Restablecimiento de contraseña",
        entidad: "usuario",
        registroId: "usuario-restablecer-xela",
        usuarioId: "reportes",
        detalle: { resumen: "Picking · usuario-restablecer-xela" },
        creadoEn: new Date("2026-10-25T12:00:00-06:00"),
      },
      {
        sistema: "picking",
        operacion: "Eliminación de usuario",
        entidad: "usuario",
        registroId: "usuario-eliminar-guatemala",
        usuarioId: "reportes",
        detalle: { resumen: "Picking · usuario-eliminar-guatemala" },
        creadoEn: new Date("2026-10-25T12:00:00-06:00"),
      },
      {
        sistema: "picking",
        operacion: "Edición de usuario",
        entidad: "usuario",
        registroId: "usuario-xela-a-gerencia",
        usuarioId: "reportes",
        detalle: { resumen: "Picking · cuenta total · Sedes revocados: Quetzaltenango", sedes: [] },
        creadoEn: new Date("2026-10-25T12:00:00-06:00"),
      },
      {
        sistema: "picking",
        operacion: "Edición de usuario",
        entidad: "usuario",
        registroId: "usuario-sin-sede",
        usuarioId: "reportes",
        detalle: { resumen: "Picking · cuenta sin sede · rol Consulta", sedes: [] },
        creadoEn: new Date("2026-10-25T12:00:00-06:00"),
      },
    ],
  });
  await prisma.bitacora.create({
    data: {
      sistema: "sitio",
      operacion: "Fuera del periodo",
      detalle: {},
      creadoEn: new Date("2026-10-26T00:00:00-06:00"),
    },
  });
  const e = await envio();
  await prisma.lineaPreparacion.updateMany({ where: { envioId: e.id }, data: { marcado: true } });
  const r = await consultarOperaciones(sesion, 1, dia);
  expect(r).toHaveLength(7);
  expect(r.map((x) => x.sistema).sort()).toEqual([
    "picking",
    "picking",
    "picking",
    "picking",
    "picking",
    "picking",
    "sitio",
  ]);
  expect(r.map((x) => x.detalle)).not.toContain('{"sede":"Guatemala"}');
  expect(r.map((x) => x.detalle)).not.toContain("Guatemala · Ruta 1 pasa a En Ruta");
  expect(r.every((x) => !x.detalle.includes("Guatemala"))).toBe(true);
  expect(r.map((x) => x.detalle)).toContain('{"sede":"Quetzaltenango"}');
  expect(r.map((x) => x.detalle)).toContain("Quetzaltenango · Ruta 1 pasa a En Ruta");
  expect(r.some((x) => x.detalle.includes("usuario-xela"))).toBe(true);
  expect(r.some((x) => x.detalle.includes("usuario-restablecer-xela"))).toBe(true);
  expect(r.some((x) => x.detalle.includes("Sedes revocados: Quetzaltenango"))).toBe(true);
  expect(r.filter((x) => x.operacion === "Inicio de sesión").every((x) => x.usuario === "Reportes")).toBe(true);
  expect(r.find((x) => x.operacion === "Inicio de sesión")?.detalle).toBe("Sistema de picking · Reportes");
  const gerencia = { ...sesion!, usuario: { ...sesion!.usuario, rol: "Gerencia" } };
  expect(await consultarOperaciones(gerencia, 1, dia)).toHaveLength(14);
});
it("RNF-04 / RN-17: aísla la sede y rechaza sin sesión, sin permiso y otra sede", async () => {
  await envio({ sedeId: 2 });
  expect((await consultarDespacho(sesion, 1, dia)).totalKg).toBe("0.000");
  expect(await consultarRutas(sesion, 1, dia)).toEqual([]);
  for (const consulta of [consultarDespacho, consultarRutas, consultarOperaciones, consultarAnios]) {
    await expect(consulta(null, 1, dia)).rejects.toThrow("No tiene permisos");
    await expect(consulta({ ...sesion!, permisos: [] }, 1, dia)).rejects.toThrow("No tiene permisos");
    await expect(consulta(sesion, 2, dia)).rejects.toThrow("No tiene permisos");
  }
});
it("RF-SL-59 / CAM-91: valida periodos y resuelve mes bisiesto, año y semana", () => {
  expect(resolverPeriodo({ tipo: "mes", mes: "2024-02" })).toMatchObject({
    inicio: "2024-02-01",
    fin: "2024-02-29",
    nombre: "Despacho mensual",
  });
  expect(resolverPeriodo({ tipo: "anio", anio: "2026" })).toMatchObject({ inicio: "2026-01-01", fin: "2026-12-31" });
  expect(resolverPeriodo({ tipo: "semana", referencia: "2026-10-25" })).toMatchObject({
    inicio: "2026-10-19",
    fin: "2026-10-25",
  });
  expect(() => resolverPeriodo({ ...dia, referencia: "2026-02-31" })).toThrow();
});
