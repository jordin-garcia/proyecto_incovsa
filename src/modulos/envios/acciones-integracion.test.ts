import { readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";
import type { SesionActual } from "@/lib/sesion";
import { prisma } from "@/lib/prisma";
import { suscribirCambios } from "@/modulos/tiempo-real/servidor";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";

const contexto = vi.hoisted(() => ({ sesion: null as SesionActual | null }));
vi.mock("@/lib/sesion", () => ({ obtenerSesion: async () => contexto.sesion }));
vi.mock("@/modulos/permisos/sede", () => ({
  obtenerSedeDeTrabajo: async () => ({ id: 1, nombre: "Quetzaltenango", prefijoOdoo: "XE" }),
}));
import {
  cargarArchivo,
  eliminarPedidosFacturados,
  guardarCampoDeOpcion,
  moverPedidosFacturados,
  cancelarOpcionDeEnvio,
  enviarOpcionABodega,
} from "./acciones";

async function prepararUsuario() {
  await limpiarTablasDeNegocio();
  // Estas acciones necesitan un facturador real, su permiso y su sede; no la demo completa del sitio.
  const usuario = await prisma.usuario.create({
    data: {
      id: "jg11-facturador",
      name: "Facturador de prueba JG-11",
      email: "jg11-facturador@example.invalid",
      username: "picking.jg11.facturador",
      displayUsername: "jg11.facturador",
      sistema: "picking",
      rol: "Facturador",
      permisos: { create: { permiso: { connect: { codigo: "pk.facturacion" } } } },
      sedes: { create: { sedeId: 1 } },
    },
  });
  contexto.sesion = {
    sistema: "picking",
    usuario: { id: usuario.id, usuario: usuario.displayUsername, nombre: usuario.name, rol: usuario.rol },
    permisos: ["pk.facturacion"],
    sedes: [{ id: 1, nombre: "Quetzaltenango", prefijoOdoo: "XE" }],
  };
  return usuario;
}

it("RNF-04 / RNF-13 / RN-48: las acciones autorizadas persisten y avisan solo a su sede tras confirmar", async () => {
  const usuario = await prepararUsuario();
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

it("RF-SL-50 / RF-SL-68 / RNF-13: carga y elimina por las acciones reales y avisa solo tras persistir", async () => {
  const usuario = await prepararUsuario();
  const aviso = vi.fn();
  const otraSede = vi.fn();
  const liberar = suscribirCambios(1, aviso);
  const liberarOtra = suscribirCambios(2, otraSede);
  const entrada = (archivo: File) => {
    const formulario = new FormData();
    formulario.set("sedeId", "1");
    formulario.set("archivo", archivo);
    return formulario;
  };
  try {
    expect(await cargarArchivo(entrada(new File([new Uint8Array([1])], "prueba.csv")))).toEqual({
      ok: false,
      error: "El archivo debe ser .xlsx, exportado de Odoo.",
    });
    expect(await cargarArchivo(entrada(new File([new Uint8Array(2 * 1024 * 1024 + 1)], "grande.xlsx")))).toEqual({
      ok: false,
      error: "El archivo pesa más de 2 MB. No se cargó.",
    });
    expect(await prisma.pedidoFacturado.count()).toBe(0);
    expect(aviso).not.toHaveBeenCalled();

    const archivo = readFileSync(
      new URL("../../../pruebas/fixtures/odoo/odoo-ejemplo-anonimizado.xlsx", import.meta.url),
    );
    const carga = await cargarArchivo(entrada(new File([new Uint8Array(archivo)], "odoo-ejemplo-anonimizado.xlsx")));
    expect(carga).toMatchObject({ ok: true, datos: { pedidosCargados: 33, otrosEstados: 1 } });
    if (!carga.ok) throw new Error("No se cargó el archivo anonimizado.");
    expect(carga.datos.noCargados).toHaveLength(46);
    expect(carga.datos.noCargados[0]).toMatchObject({ numero: expect.any(String), motivo: expect.any(String) });
    const pedidos = await prisma.pedidoFacturado.findMany({ where: { sedeId: 1 }, orderBy: { posicion: "asc" } });
    expect(pedidos).toHaveLength(33);
    expect(pedidos.every((pedido) => pedido.cargadoPorId === usuario.id && pedido.sedeId === 1)).toBe(true);
    expect(await prisma.pedidoFacturado.count({ where: { sedeId: 2 } })).toBe(0);
    expect(aviso).toHaveBeenCalledTimes(1);
    const cargaRegistrada = await prisma.bitacora.findFirstOrThrow({
      where: { operacion: "Carga de archivo de Odoo" },
    });
    expect(cargaRegistrada.usuarioId).toBe(usuario.id);
    expect(cargaRegistrada.detalle).toMatchObject({
      nombreArchivo: "odoo-ejemplo-anonimizado.xlsx",
      pedidosCargados: 33,
    });

    const seleccionados = pedidos.slice(0, 2);
    expect(
      await eliminarPedidosFacturados({
        sedeId: 1,
        ids: seleccionados.map((pedido) => pedido.id),
        estadoEsperado: seleccionados.map((pedido) => ({
          id: pedido.id,
          posicion: pedido.posicion,
          actualizadoEn: pedido.actualizadoEn.toISOString(),
        })),
      }),
    ).toEqual({ ok: true, datos: { eliminados: 2 } });
    expect(await prisma.pedidoFacturado.count({ where: { sedeId: 1 } })).toBe(31);
    expect(
      await prisma.pedidoFacturado.count({ where: { id: { in: seleccionados.map((pedido) => pedido.id) } } }),
    ).toBe(0);
    const eliminacion = await prisma.bitacora.findFirstOrThrow({
      where: { operacion: "Eliminación de pedidos facturados" },
    });
    expect(eliminacion.usuarioId).toBe(usuario.id);
    expect((eliminacion.detalle as { pedidos: unknown[] }).pedidos).toHaveLength(2);
    expect(aviso).toHaveBeenCalledTimes(2);
    expect(otraSede).not.toHaveBeenCalled();
  } finally {
    liberar();
    liberarOtra();
    contexto.sesion = null;
  }
});
