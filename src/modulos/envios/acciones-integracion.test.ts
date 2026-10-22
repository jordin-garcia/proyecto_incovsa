import { expect, it, vi } from "vitest";
import type { SesionActual } from "@/lib/sesion";
import { prisma } from "@/lib/prisma";
import { suscribirCambios } from "@/modulos/tiempo-real/servidor";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { sembrarDemo } from "../../../prisma/semillas/demo";

const contexto = vi.hoisted(() => ({ sesion: null as SesionActual | null }));
vi.mock("@/lib/sesion", () => ({ obtenerSesion: async () => contexto.sesion }));
vi.mock("@/modulos/permisos/sede", () => ({
  obtenerSedeDeTrabajo: async () => ({ id: 1, nombre: "Quetzaltenango", prefijoOdoo: "XE" }),
}));
import { guardarCampoDeOpcion, moverPedidosFacturados, cancelarOpcionDeEnvio, enviarOpcionABodega } from "./acciones";

it("RNF-04 / RNF-13 / RN-48: las acciones autorizadas persisten y avisan solo a su sede tras confirmar", async () => {
  await limpiarTablasDeNegocio();
  await sembrarDemo(prisma, { claveDemo: "Clave-pruebas-integracion-JG11" });
  const usuario = await prisma.usuario.findUniqueOrThrow({ where: { username: "picking.ejemplo.03" } });
  contexto.sesion = {
    sistema: "picking",
    usuario: { id: usuario.id, usuario: usuario.displayUsername, nombre: usuario.name, rol: usuario.rol },
    permisos: ["pk.facturacion"],
    sedes: [{ id: 1, nombre: "Quetzaltenango", prefijoOdoo: "XE" }],
  };
  const pedido = await prisma.pedidoFacturado.create({
    data: {
      sedeId: 1,
      numeroOdoo: "JG11-1",
      referencia: "XE-IN/SALIDA/JG11-1",
      cliente: "Cliente de prueba",
      sector: "Zona 1",
      posicion: 1,
      cargadoPorId: usuario.id,
      detalles: {
        create: { producto: "Producto de prueba", lote: "", pesoConversionKg: "25", cantidadKg: "25", orden: 1 },
      },
    },
  });
  const opcion = await prisma.opcionEnvio.findUniqueOrThrow({ where: { sedeId_tipo: { sedeId: 1, tipo: "recoge" } } });
  const aviso = vi.fn();
  const otraSede = vi.fn();
  const liberar = suscribirCambios(1, aviso);
  const liberarOtra = suscribirCambios(2, otraSede);
  const estado = async () => {
    const actual = await prisma.pedidoFacturado.findUniqueOrThrow({ where: { id: pedido.id } });
    return [{ id: actual.id, posicion: actual.posicion, actualizadoEn: actual.actualizadoEn.toISOString() }];
  };
  const mover = async () =>
    moverPedidosFacturados({
      sedeId: 1,
      ids: [pedido.id],
      origen: null,
      destino: "recoge",
      antesDe: null,
      estadoOrigen: await estado(),
      estadoDestino: [],
    });
  try {
    expect(await guardarCampoDeOpcion({ sedeId: 1, tipo: "recoge", campo: "fecha", valor: "2026-10-22" })).toEqual({
      ok: true,
      datos: null,
    });
    expect(await guardarCampoDeOpcion({ sedeId: 1, tipo: "recoge", campo: "hora", valor: "13:30" })).toEqual({
      ok: true,
      datos: null,
    });
    const programada = await prisma.opcionEnvio.findUniqueOrThrow({ where: { id: opcion.id } });
    expect(programada.fechaProgramada?.toISOString().slice(0, 10)).toBe("2026-10-22");
    expect(programada.horaProgramada?.toISOString().slice(11, 16)).toBe("13:30");
    expect(aviso).toHaveBeenCalledTimes(2);

    expect(await mover()).toEqual({ ok: true, datos: null });
    expect(await prisma.pedidoFacturado.findUniqueOrThrow({ where: { id: pedido.id } })).toMatchObject({
      opcionEnvioId: opcion.id,
      envioId: null,
    });
    expect(aviso).toHaveBeenCalledTimes(3);
    expect(await cancelarOpcionDeEnvio({ sedeId: 1, tipo: "recoge", estadoEsperado: await estado() })).toEqual({
      ok: true,
      datos: 1,
    });
    expect(await prisma.pedidoFacturado.findUniqueOrThrow({ where: { id: pedido.id } })).toMatchObject({
      opcionEnvioId: null,
      envioId: null,
    });
    expect(aviso).toHaveBeenCalledTimes(4);

    expect(await mover()).toEqual({ ok: true, datos: null });
    await guardarCampoDeOpcion({ sedeId: 1, tipo: "recoge", campo: "fecha", valor: "2026-10-22" });
    await guardarCampoDeOpcion({ sedeId: 1, tipo: "recoge", campo: "hora", valor: "13:30" });
    const resultado = await enviarOpcionABodega({ sedeId: 1, tipo: "recoge", estadoEsperado: await estado() });
    expect(resultado).toMatchObject({ ok: true, datos: { id: expect.any(Number), numero: 1, tipo: "pedido" } });
    if (!resultado.ok || !resultado.datos) throw new Error("No se creó el pedido de bodega.");
    expect(await prisma.pedidoFacturado.findUniqueOrThrow({ where: { id: pedido.id } })).toMatchObject({
      envioId: resultado.datos.id,
      opcionEnvioId: null,
    });
    expect(await prisma.envio.findUniqueOrThrow({ where: { id: resultado.datos.id } })).toMatchObject({
      sedeId: 1,
      enviadoPorId: usuario.id,
    });
    expect(aviso).toHaveBeenCalledTimes(8);
    expect(await enviarOpcionABodega({ sedeId: 1, tipo: "recoge", estadoEsperado: [] })).toEqual({
      ok: true,
      datos: null,
    });
    expect(aviso).toHaveBeenCalledTimes(8);
    expect(otraSede).not.toHaveBeenCalled();
  } finally {
    liberar();
    liberarOtra();
    contexto.sesion = null;
  }
});
