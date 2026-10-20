import { beforeEach, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import type { SesionActual } from "@/lib/sesion";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { consultarDespacho, consultarRutas, consultarOperaciones } from "./servicio";
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
          producto: "PRODUCTO",
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
it("RN-39: consulta las operaciones de ambos sistemas sin registrar el marcado de filas", async () => {
  for (const sistema of ["sitio", "picking"])
    await prisma.bitacora.create({
      data: {
        sistema,
        operacion: "Inicio de sesión",
        usuarioId: "reportes",
        detalle: "Ejemplo",
        creadoEn: new Date("2026-10-25T12:00:00-06:00"),
      },
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
  expect(r).toHaveLength(2);
  expect(r.map((x) => x.sistema).sort()).toEqual(["picking", "sitio"]);
  expect(r.every((x) => x.usuario === "Reportes")).toBe(true);
});
it("RNF-04 / RN-17: aísla la sede y rechaza sin sesión, sin permiso y otra sede", async () => {
  await envio({ sedeId: 2 });
  expect((await consultarDespacho(sesion, 1, dia)).totalKg).toBe("0.000");
  expect(await consultarRutas(sesion, 1, dia)).toEqual([]);
  for (const consulta of [consultarDespacho, consultarRutas, consultarOperaciones]) {
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
