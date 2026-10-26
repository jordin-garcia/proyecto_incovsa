import { beforeEach, describe, expect, it } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { SesionActual } from "@/lib/sesion";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { sembrarDemo } from "../../../prisma/semillas/demo";
import { ErrorNegocio } from "@/lib/errores";
import { ErrorAcceso } from "@/modulos/permisos/servicio";
import { listarRutasEnRuta, reordenarRecorridoRuta, entregarRuta, requiereSoloPropias } from "./servicio";
import { moverPedidos, guardarCampoOpcion, enviarOpcion } from "@/modulos/envios/opciones";

describe("Módulo de Ruta - Servicio (JM-06)", () => {
  const clave = "Demo-12345";
  let piloto06Id: string;
  let piloto07Id: string;
  let gerencia01Id: string;
  let camionId: number;
  let usuarioBodegaId: string;

  beforeEach(async () => {
    await limpiarTablasDeNegocio();
    await sembrarDemo(prisma, { claveDemo: clave });

    const u06 = await prisma.usuario.findFirstOrThrow({ where: { displayUsername: "ejemplo.06" } });
    const u07 = await prisma.usuario.findFirstOrThrow({ where: { displayUsername: "ejemplo.07" } });
    const u01 = await prisma.usuario.findFirstOrThrow({ where: { displayUsername: "ejemplo.01" } });
    const uBodega = await prisma.usuario.findFirstOrThrow({ where: { displayUsername: "ejemplo.05" } });
    const camion = await prisma.camion.findFirstOrThrow({ where: { sedeId: 1 } });

    piloto06Id = u06.id;
    piloto07Id = u07.id;
    gerencia01Id = u01.id;
    usuarioBodegaId = uBodega.id;
    camionId = camion.id;
  });

  function crearSesion(opciones: {
    usuarioId: string;
    usuario?: string;
    nombre?: string;
    rol: string;
    permisos: string[];
    sedeIds?: number[];
  }): SesionActual {
    return {
      sistema: "picking",
      usuario: {
        id: opciones.usuarioId,
        usuario: opciones.usuario ?? "usuario.prueba",
        nombre: opciones.nombre ?? "Usuario Prueba",
        rol: opciones.rol,
      },
      permisos: opciones.permisos,
      sedes: (opciones.sedeIds ?? [1]).map((id) => ({
        id,
        nombre: id === 1 ? "Quetzaltenango" : "Guatemala",
        prefijoOdoo: id === 1 ? "XE" : "GT",
      })),
    };
  }

  async function crearRutaDePrueba(opciones: {
    sedeId?: number;
    numero?: number;
    fechaEnvio?: string;
    estadoNombre?: "En Preparación" | "En Ruta" | "Entregado";
    pilotoId?: string | null;
    entregas?: Array<{
      cliente: string;
      sector: string;
      totalKg: number;
      orden: number;
    }>;
  }) {
    const estado = await prisma.estadoEnvio.findUniqueOrThrow({
      where: { nombre: opciones.estadoNombre ?? "En Ruta" },
    });

    const sedeId = opciones.sedeId ?? 1;
    const numero = opciones.numero ?? 1;
    const fecha = opciones.fechaEnvio ?? "2026-10-24";

    return prisma.envio.create({
      data: {
        sedeId,
        tipo: "ruta",
        numero,
        fechaEnvio: new Date(`${fecha}T00:00:00Z`),
        programadoPara: new Date(`${fecha}T10:00:00-06:00`),
        estadoId: estado.id,
        enviadoPorId: usuarioBodegaId,
        camionId,
        pilotoId: opciones.pilotoId !== undefined ? opciones.pilotoId : piloto06Id,
        entregas: {
          create: opciones.entregas?.map((e) => ({
            cliente: e.cliente,
            sector: e.sector,
            totalKg: new Prisma.Decimal(e.totalKg),
            orden: e.orden,
          })) ?? [
            {
              cliente: "Cliente Uno",
              sector: "Zona 1",
              totalKg: new Prisma.Decimal(150),
              orden: 1,
            },
          ],
        },
      },
      include: {
        entregas: { orderBy: { orden: "asc" } },
      },
    });
  }

  describe("Criterio 1: RF-SL-26 / RN-46 - Visibilidad de rutas por rol y permiso", () => {
    it("RF-SL-26 / RN-46: ejemplo.06 solo ve sus rutas; ejemplo.07 no ve las de ejemplo.06; ejemplo.01 ve todas", async () => {
      // Ruta asignada a ejemplo.06
      const r1 = await crearRutaDePrueba({ numero: 1, pilotoId: piloto06Id });
      // Ruta asignada a ejemplo.07
      const r2 = await crearRutaDePrueba({ numero: 2, pilotoId: piloto07Id });

      // Sesión de ejemplo.06 (Piloto)
      const sesionPiloto06 = crearSesion({
        usuarioId: piloto06Id,
        usuario: "ejemplo.06",
        rol: "Piloto",
        permisos: ["pk.ruta.propias"],
      });

      const rutasP06 = await listarRutasEnRuta(sesionPiloto06, 1);
      expect(rutasP06).toHaveLength(1);
      expect(rutasP06[0].id).toBe(r1.id);

      // Sesión de ejemplo.07 (Piloto)
      const sesionPiloto07 = crearSesion({
        usuarioId: piloto07Id,
        usuario: "ejemplo.07",
        rol: "Piloto",
        permisos: ["pk.ruta.propias"],
      });

      const rutasP07 = await listarRutasEnRuta(sesionPiloto07, 1);
      expect(rutasP07).toHaveLength(1);
      expect(rutasP07[0].id).toBe(r2.id);

      // Sesión de ejemplo.01 (Gerencia - acceso total)
      const sesionGerencia = crearSesion({
        usuarioId: gerencia01Id,
        usuario: "ejemplo.01",
        rol: "Gerencia",
        permisos: [],
      });

      const rutasGerencia = await listarRutasEnRuta(sesionGerencia, 1);
      expect(rutasGerencia).toHaveLength(2);
      expect(rutasGerencia.map((r) => r.id)).toContain(r1.id);
      expect(rutasGerencia.map((r) => r.id)).toContain(r2.id);
    });

    it("RF-SL-26 / RN-46: rechaza acceso si el usuario no tiene permisos para el módulo de ruta", async () => {
      const sesionSinPermiso = crearSesion({
        usuarioId: piloto06Id,
        rol: "Operativo",
        permisos: ["sit.doc.ver"],
      });

      await expect(listarRutasEnRuta(sesionSinPermiso, 1)).rejects.toThrow(ErrorAcceso);
    });

    it("RF-SL-26 / RN-46: rechaza acceso a una sede no asignada al usuario", async () => {
      const sesionSedeInvalida = crearSesion({
        usuarioId: piloto06Id,
        rol: "Piloto",
        permisos: ["pk.ruta.propias"],
        sedeIds: [2],
      });

      await expect(listarRutasEnRuta(sesionSedeInvalida, 1)).rejects.toThrow(ErrorAcceso);
    });

    it("RN-46: un usuario con rol Bodega y solo pk.ruta.propias es rechazado al reordenar o entregar una ruta ajena", async () => {
      const ruta = await crearRutaDePrueba({
        numero: 1,
        pilotoId: piloto06Id,
        entregas: [
          { cliente: "Cliente A", sector: "Zona 1", totalKg: 100, orden: 1 },
          { cliente: "Cliente B", sector: "Zona 2", totalKg: 200, orden: 2 },
        ],
      });

      const sesionBodega = crearSesion({
        usuarioId: usuarioBodegaId,
        rol: "Bodega",
        permisos: ["pk.ruta.propias"],
      });

      const entregaIds = ruta.entregas.map((e) => e.id).reverse();

      // Debe rechazar el reordenamiento de ruta asignada a piloto06
      await expect(
        reordenarRecorridoRuta(
          { envioId: ruta.id, entregaIds },
          {
            usuarioId: sesionBodega.usuario.id,
            rol: sesionBodega.usuario.rol,
            sedeId: 1,
            soloPropias: requiereSoloPropias(sesionBodega),
          },
        ),
      ).rejects.toThrow(ErrorAcceso);

      // Debe rechazar la entrega de ruta asignada a piloto06
      await expect(
        entregarRuta(
          { envioId: ruta.id },
          {
            usuarioId: sesionBodega.usuario.id,
            rol: sesionBodega.usuario.rol,
            sedeId: 1,
            soloPropias: requiereSoloPropias(sesionBodega),
          },
        ),
      ).rejects.toThrow(ErrorAcceso);
    });

    it("RN-46: un usuario con rol 'piloto' en minúsculas y permiso pk.ruta.todas solo ve sus rutas y no puede entregar una ajena", async () => {
      const ruta06 = await crearRutaDePrueba({ numero: 1, pilotoId: piloto06Id });
      const ruta07 = await crearRutaDePrueba({ numero: 2, pilotoId: piloto07Id });

      const sesionPilotoConTodas = crearSesion({
        usuarioId: piloto06Id,
        rol: "piloto",
        permisos: ["pk.ruta.todas", "pk.ruta.propias"],
      });

      const rutas = await listarRutasEnRuta(sesionPilotoConTodas, 1);
      expect(rutas.map((r) => r.id)).toContain(ruta06.id);
      expect(rutas.map((r) => r.id)).not.toContain(ruta07.id);

      await expect(
        entregarRuta(
          { envioId: ruta07.id },
          {
            usuarioId: sesionPilotoConTodas.usuario.id,
            rol: sesionPilotoConTodas.usuario.rol,
            sedeId: 1,
            soloPropias: requiereSoloPropias(sesionPilotoConTodas),
          },
        ),
      ).rejects.toThrow(ErrorAcceso);
    });
  });

  describe("Criterio 2: RF-SL-78 - Orden de rutas En Ruta de la más reciente a la más antigua", () => {
    it("RF-SL-78: con varias rutas En Ruta, aparecen de la más reciente a la más antigua por fecha y número descendente", async () => {
      const rAyer1 = await crearRutaDePrueba({ numero: 1, fechaEnvio: "2026-10-23", pilotoId: piloto06Id });
      const rAyer2 = await crearRutaDePrueba({ numero: 2, fechaEnvio: "2026-10-23", pilotoId: piloto06Id });
      const rHoy1 = await crearRutaDePrueba({ numero: 1, fechaEnvio: "2026-10-24", pilotoId: piloto06Id });
      const rHoy2 = await crearRutaDePrueba({ numero: 2, fechaEnvio: "2026-10-24", pilotoId: piloto06Id });

      const sesionPiloto06 = crearSesion({
        usuarioId: piloto06Id,
        rol: "Piloto",
        permisos: ["pk.ruta.propias"],
      });

      const rutas = await listarRutasEnRuta(sesionPiloto06, 1);
      expect(rutas.map((r) => r.id)).toEqual([rHoy2.id, rHoy1.id, rAyer2.id, rAyer1.id]);
    });

    it("RF-SL-79: solo aparecen rutas con estado En Ruta, no En Preparación ni Entregado", async () => {
      const rEnRuta = await crearRutaDePrueba({ numero: 1, estadoNombre: "En Ruta", pilotoId: piloto06Id });
      await crearRutaDePrueba({ numero: 2, estadoNombre: "En Preparación", pilotoId: piloto06Id });
      await crearRutaDePrueba({ numero: 3, estadoNombre: "Entregado", pilotoId: piloto06Id });

      const sesionPiloto06 = crearSesion({
        usuarioId: piloto06Id,
        rol: "Piloto",
        permisos: ["pk.ruta.propias"],
      });

      const rutas = await listarRutasEnRuta(sesionPiloto06, 1);
      expect(rutas).toHaveLength(1);
      expect(rutas[0].id).toBe(rEnRuta.id);
    });
  });

  describe("Criterio 3: RF-SL-27 / RN-49 - Una fila por cliente con la suma de sus kg", () => {
    it("RF-SL-27 / RN-49: la tabla de ruta contiene una sola fila por cliente con la suma de sus kg al agrupar pedidos facturados", async () => {
      const sesionFacturacion = crearSesion({
        usuarioId: usuarioBodegaId,
        rol: "Facturador",
        permisos: ["pk.facturacion"],
      });

      // Crear 2 pedidos facturados del mismo cliente y sector (José Álvarez, Zona 1)
      const p1 = await prisma.pedidoFacturado.create({
        data: {
          sedeId: 1,
          numeroOdoo: "801",
          referencia: "XE-IN/SALIDA/801",
          cliente: "José Álvarez",
          sector: "Zona 1",
          posicion: 1,
          cargadoPorId: usuarioBodegaId,
          detalles: {
            create: [
              {
                producto: "SULFATO DE SODIO",
                lote: "5287",
                pesoConversionKg: "25",
                cantidadKg: "25.000",
                orden: 1,
              },
            ],
          },
        },
      });

      const p2 = await prisma.pedidoFacturado.create({
        data: {
          sedeId: 1,
          numeroOdoo: "802",
          referencia: "XE-IN/SALIDA/802",
          cliente: "José Álvarez",
          sector: "Zona 1",
          posicion: 2,
          cargadoPorId: usuarioBodegaId,
          detalles: {
            create: [
              {
                producto: "SULFATO DE SODIO",
                lote: "5287",
                pesoConversionKg: "25",
                cantidadKg: "15.125",
                orden: 1,
              },
            ],
          },
        },
      });

      const estadoOrigen = (
        await prisma.pedidoFacturado.findMany({
          where: { sedeId: 1, opcionEnvioId: null, envioId: null },
          orderBy: [{ posicion: "asc" }, { id: "asc" }],
        })
      ).map((p) => ({ id: p.id, posicion: p.posicion, actualizadoEn: p.actualizadoEn.toISOString() }));

      // Mover a camión y configurar opción de envío
      await moverPedidos(sesionFacturacion, {
        sedeId: 1,
        ids: [p1.id, p2.id],
        origen: null,
        destino: "camion",
        antesDe: null,
        estadoOrigen,
        estadoDestino: [],
      });
      await guardarCampoOpcion(sesionFacturacion, { sedeId: 1, tipo: "camion", campo: "fecha", valor: "2026-10-25" });
      await guardarCampoOpcion(sesionFacturacion, { sedeId: 1, tipo: "camion", campo: "hora", valor: "14:00" });
      await guardarCampoOpcion(sesionFacturacion, {
        sedeId: 1,
        tipo: "camion",
        campo: "camion",
        valor: camionId,
      });
      await guardarCampoOpcion(sesionFacturacion, {
        sedeId: 1,
        tipo: "camion",
        campo: "piloto",
        valor: piloto06Id,
      });

      const opcionCamion = await prisma.opcionEnvio.findUniqueOrThrow({
        where: { sedeId_tipo: { sedeId: 1, tipo: "camion" } },
      });
      const pedidosCamion = await prisma.pedidoFacturado.findMany({
        where: { sedeId: 1, opcionEnvioId: opcionCamion.id, envioId: null },
        orderBy: [{ posicion: "asc" }, { id: "asc" }],
      });

      const envio = await enviarOpcion(sesionFacturacion, {
        sedeId: 1,
        tipo: "camion",
        estadoEsperado: pedidosCamion.map((p) => ({
          id: p.id,
          posicion: p.posicion,
          actualizadoEn: p.actualizadoEn.toISOString(),
        })),
      });

      expect(envio).toBeDefined();

      // Cambiar estado a En Ruta
      const estadoEnRuta = await prisma.estadoEnvio.findUniqueOrThrow({ where: { nombre: "En Ruta" } });
      await prisma.envio.update({
        where: { id: envio!.id },
        data: { estadoId: estadoEnRuta.id },
      });

      const sesionPiloto06 = crearSesion({
        usuarioId: piloto06Id,
        rol: "Piloto",
        permisos: ["pk.ruta.propias"],
      });

      const rutas = await listarRutasEnRuta(sesionPiloto06, 1);
      const r = rutas.find((item) => item.id === envio!.id);
      expect(r).toBeDefined();
      // Dos pedidos del mismo cliente/sector se agruparon en UNA sola fila de entrega
      expect(r?.entregas).toHaveLength(1);
      expect(r?.entregas[0].cliente).toBe("José Álvarez");
      expect(r?.entregas[0].sector).toBe("Zona 1");
      expect(r?.entregas[0].totalKg).toBe(40.125);
      expect(r?.totalKg).toBe(40.125);
      expect(r?.clientesContador).toBe(1);
    });
  });

  describe("Criterio 4: RF-SL-28 / RN-29 - Reordenar filas y guardar recorrido actual", () => {
    it("RF-SL-28 / RN-29: reordenarRecorridoRuta guarda el orden de las filas sin bitácora ni historial", async () => {
      const ruta = await crearRutaDePrueba({
        numero: 1,
        pilotoId: piloto06Id,
        entregas: [
          { cliente: "Cliente A", sector: "Zona 1", totalKg: 100, orden: 1 },
          { cliente: "Cliente B", sector: "Zona 2", totalKg: 200, orden: 2 },
          { cliente: "Cliente C", sector: "Zona 3", totalKg: 300, orden: 3 },
        ],
      });

      const e1 = ruta.entregas[0].id;
      const e2 = ruta.entregas[1].id;
      const e3 = ruta.entregas[2].id;

      const contexto = {
        usuarioId: piloto06Id,
        rol: "Piloto",
        sedeId: 1,
      };

      // Reordenar a: e3, e1, e2
      const resultado = await reordenarRecorridoRuta({ envioId: ruta.id, entregaIds: [e3, e1, e2] }, contexto);
      expect(resultado.orden).toEqual([e3, e1, e2]);

      const entregasDb = await prisma.entregaRuta.findMany({
        where: { envioId: ruta.id },
        orderBy: { orden: "asc" },
      });
      expect(entregasDb.map((e) => e.id)).toEqual([e3, e1, e2]);
      expect(entregasDb.map((e) => e.orden)).toEqual([1, 2, 3]);

      // RN-29: No debe haber registros en bitácora ni historial de este reordenamiento
      const bitacoras = await prisma.bitacora.findMany({
        where: { registroId: String(ruta.id) },
      });
      expect(bitacoras).toHaveLength(0);

      const historial = await prisma.historialEstado.findMany({
        where: { envioId: ruta.id },
      });
      expect(historial).toHaveLength(0);
    });

    it("RF-SL-28: un piloto no puede reordenar una ruta que no le pertenece", async () => {
      const ruta = await crearRutaDePrueba({
        numero: 1,
        pilotoId: piloto07Id, // Asignada a 07
      });

      const contextoPiloto06 = {
        usuarioId: piloto06Id,
        rol: "Piloto",
        sedeId: 1,
      };

      await expect(
        reordenarRecorridoRuta({ envioId: ruta.id, entregaIds: [ruta.entregas[0].id] }, contextoPiloto06),
      ).rejects.toThrow(ErrorAcceso);
    });
  });

  describe("Criterio 5: RF-SL-29 / RN-11 - Cierre de ruta y entrega", () => {
    it("RF-SL-29 / RN-11: la ruta pasa a Entregado con historial y bitácora, y deja de aparecer en listarRutasEnRuta", async () => {
      const ruta = await crearRutaDePrueba({
        numero: 1,
        pilotoId: piloto06Id,
        fechaEnvio: "2026-10-24",
        entregas: [
          { cliente: "Cliente 1", sector: "Zona 1", totalKg: 100, orden: 1 },
          { cliente: "Cliente 2", sector: "Zona 2", totalKg: 200, orden: 2 },
        ],
      });

      const contexto = {
        usuarioId: piloto06Id,
        rol: "Piloto",
        sedeId: 1,
      };

      const resultado = await entregarRuta({ envioId: ruta.id }, contexto);
      expect(resultado.nuevoEstado).toBe("Entregado");

      // Verificar en BD
      const envioDb = await prisma.envio.findUniqueOrThrow({
        where: { id: ruta.id },
        include: { estado: true },
      });
      expect(envioDb.estado.nombre).toBe("Entregado");

      // Historial
      const historial = await prisma.historialEstado.findMany({
        where: { envioId: ruta.id },
        include: { estado: true },
      });
      expect(historial).toHaveLength(1);
      expect(historial[0].estado.nombre).toBe("Entregado");
      expect(historial[0].usuarioId).toBe(piloto06Id);

      // Bitácora "Cierre de ruta" (RN-39)
      const bitacoras = await prisma.bitacora.findMany({
        where: {
          registroId: String(ruta.id),
          operacion: "Cierre de ruta",
        },
      });
      expect(bitacoras).toHaveLength(1);
      expect(bitacoras[0].sistema).toBe("picking");
      expect(bitacoras[0].detalle).toContain("Ruta 1 del 24/10/2026 entregada");

      // Deja de aparecer en el módulo
      const sesionPiloto06 = crearSesion({
        usuarioId: piloto06Id,
        rol: "Piloto",
        permisos: ["pk.ruta.propias"],
      });
      const rutasActivas = await listarRutasEnRuta(sesionPiloto06, 1);
      expect(rutasActivas.some((r) => r.id === ruta.id)).toBe(false);
    });

    it("RF-SL-29 / RN-11: una ruta que no está En Ruta no se puede entregar", async () => {
      const ruta = await crearRutaDePrueba({
        numero: 1,
        pilotoId: piloto06Id,
        estadoNombre: "En Preparación",
      });

      const contexto = {
        usuarioId: piloto06Id,
        rol: "Piloto",
        sedeId: 1,
      };

      await expect(entregarRuta({ envioId: ruta.id }, contexto)).rejects.toThrow(
        new ErrorNegocio("La ruta no está en curso."),
      );
    });
  });
});
