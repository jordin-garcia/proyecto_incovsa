import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { esAccesoTotal } from "@/lib/roles";
import type { SesionActual } from "@/lib/sesion";
import { exigirPermiso } from "@/modulos/permisos/servicio";
import { consultarBitacora } from "@/modulos/bitacora/servicio";
import { convertir } from "@/modulos/conversion/servicio";
import { fechaGuatemala } from "@/lib/fechas";
import { resolverPeriodo } from "./periodo";

const operacionesGlobalesDeAcceso = new Set([
  "Inicio de sesión",
  "Intento de acceso fallido",
  "Intento fallido de inicio de sesión",
  "Bloqueo de usuario",
  "Bloqueo de IP",
]);

function autorizar(sesion: SesionActual | null, sedeId: number, entrada: unknown) {
  exigirPermiso(sesion, "pk.reportes", sedeId);
  z.number().int().positive().parse(sedeId);
  return resolverPeriodo(entrada);
}

export async function consultarDespacho(sesion: SesionActual | null, sedeId: number, entrada: unknown) {
  const p = autorizar(sesion, sedeId, entrada);
  const rango = { gte: p.desde, lte: p.hasta };
  const [cerrados, rutasEntregadas] = await Promise.all([
    prisma.envio.findMany({
      where: {
        sedeId,
        OR: [
          { tipo: "ruta", historial: { some: { estado: { nombre: "En Ruta" }, creadoEn: rango } } },
          { tipo: "pedido", historial: { some: { estado: { nombre: "Despachado" }, creadoEn: rango } } },
        ],
      },
      orderBy: [{ fechaEnvio: "asc" }, { id: "asc" }],
      select: {
        tipo: true,
        lineas: {
          orderBy: [{ posicion: "asc" }, { id: "asc" }],
          select: { producto: true, pesoConversionKg: true, cantidadKg: true },
        },
      },
    }),
    prisma.envio.count({
      where: { sedeId, tipo: "ruta", historial: { some: { estado: { nombre: "Entregado" }, creadoEn: rango } } },
    }),
  ]);
  const agrupadas = new Map<string, { producto: string; peso: Prisma.Decimal; cantidad: Prisma.Decimal }>();
  for (const envio of cerrados)
    for (const l of envio.lineas) {
      const clave = JSON.stringify([l.producto, l.pesoConversionKg.toFixed(3)]);
      const anterior = agrupadas.get(clave);
      agrupadas.set(clave, {
        producto: l.producto,
        peso: l.pesoConversionKg,
        cantidad: (anterior?.cantidad ?? new Prisma.Decimal(0)).plus(l.cantidadKg),
      });
    }
  let total = new Prisma.Decimal(0),
    resto = new Prisma.Decimal(0),
    unidades = 0;
  // El prototipo ordena de mayor a menor y conserva el orden de primera aparición en los empates.
  const filas = [...agrupadas.values()]
    .sort((a, b) => b.cantidad.comparedTo(a.cantidad))
    .map((l) => {
      const conversion = convertir(l.cantidad, l.peso);
      // Recupera el resto con Decimal: nunca suma los restos numéricos en punto flotante.
      const restoFila = l.cantidad.minus(l.peso.mul(conversion.unidades));
      total = total.plus(l.cantidad);
      resto = resto.plus(restoFila);
      unidades += conversion.unidades;
      return {
        producto: l.producto,
        pesoConversionKg: l.peso.toFixed(3),
        cantidadKg: l.cantidad.toFixed(3),
        unidades: conversion.unidades,
        restoKg: restoFila.toFixed(3),
      };
    });
  return {
    filas,
    totalKg: total.toFixed(3),
    unidades,
    restoKg: resto.toFixed(3),
    rutasCerradas: cerrados.filter((e) => e.tipo === "ruta").length,
    pedidosCerrados: cerrados.filter((e) => e.tipo === "pedido").length,
    rutasEntregadas,
  };
}

export async function consultarRutas(sesion: SesionActual | null, sedeId: number, entrada: unknown) {
  const p = autorizar(sesion, sedeId, entrada);
  // fechaEnvio es una fecha de calendario, no un instante: no desplazarla seis horas.
  const rutas = await prisma.envio.findMany({
    where: {
      sedeId,
      tipo: "ruta",
      estado: { nombre: { in: ["En Ruta", "Entregado"] } },
      fechaEnvio: { gte: new Date(`${p.inicio}T00:00:00Z`), lte: new Date(`${p.fin}T00:00:00Z`) },
    },
    orderBy: [{ fechaEnvio: "desc" }, { numero: "desc" }, { id: "desc" }],
    select: {
      id: true,
      numero: true,
      fechaEnvio: true,
      programadoPara: true,
      camion: { select: { identificacion: true } },
      piloto: { select: { name: true } },
      estado: { select: { nombre: true } },
      lineas: { select: { cantidadKg: true } },
      entregas: { orderBy: [{ orden: "asc" }, { id: "asc" }], select: { cliente: true } },
    },
  });
  return rutas.map((r) => ({
    id: r.id,
    numero: r.numero,
    fecha: r.fechaEnvio.toISOString().slice(0, 10),
    programada: r.programadoPara.toISOString(),
    camion: r.camion?.identificacion ?? "—",
    piloto: r.piloto?.name ?? "—",
    totalKg: r.lineas.reduce((s, l) => s.plus(l.cantidadKg), new Prisma.Decimal(0)).toFixed(3),
    estado: r.estado.nombre,
    recorrido: r.estado.nombre === "Entregado" ? r.entregas.map((e) => e.cliente) : null,
  }));
}

export async function consultarOperaciones(sesion: SesionActual | null, sedeId: number, entrada: unknown) {
  const p = autorizar(sesion, sedeId, entrada);
  const registros = await consultarBitacora({ desde: p.desde, hasta: p.hasta });
  const veTodasLasSedes = esAccesoTotal(sesion?.usuario.rol ?? "");
  const sede = veTodasLasSedes
    ? null
    : await prisma.sede.findUniqueOrThrow({ where: { id: sedeId }, select: { nombre: true } });
  const idsUsuarios = veTodasLasSedes
    ? []
    : [
        ...new Set(
          registros
            .filter(
              (r) =>
                r.sistema === "picking" && r.entidad === "usuario" && !operacionesGlobalesDeAcceso.has(r.operacion),
            )
            .map((r) => r.registroId)
            .filter((id): id is string => Boolean(id)),
        ),
      ];
  const usuariosConSedes = idsUsuarios.length
    ? await prisma.usuario.findMany({
        where: { id: { in: idsUsuarios } },
        select: { id: true, sedes: { select: { sede: { select: { nombre: true } } } } },
      })
    : [];
  const sedesPorUsuario = new Map(usuariosConSedes.map((u) => [u.id, u.sedes.map((relacion) => relacion.sede.nombre)]));
  const visibles = veTodasLasSedes
    ? registros
    : registros.filter((r) => {
        if (r.sistema === "sitio" || operacionesGlobalesDeAcceso.has(r.operacion)) return true;
        if (r.sistema !== "picking") return false;
        const detalle = r.detalle;
        if (detalle && typeof detalle === "object" && !Array.isArray(detalle)) {
          const datos = detalle as Record<string, unknown>;
          if (r.entidad === "usuario") {
            const sedesRelacionadas = new Set(sedesPorUsuario.get(r.registroId ?? "") ?? []);
            if (Array.isArray(datos.sedes))
              for (const nombre of datos.sedes) if (typeof nombre === "string") sedesRelacionadas.add(nombre);
            if (typeof datos.resumen === "string")
              for (const parte of datos.resumen.split(" · ")) {
                const cambio = /^Sedes (?:asignados|revocados): (.+)$/.exec(parte);
                if (cambio)
                  for (const nombre of cambio[1]!.split(",")) if (nombre.trim()) sedesRelacionadas.add(nombre.trim());
              }
            // Un cambio de acceso puede mencionar tanto la sede anterior como la actual. Solo se muestra
            // cuando toda la historia del registro pertenece a la sede activa.
            return sedesRelacionadas.size === 1 && sedesRelacionadas.has(sede!.nombre);
          }
          if (typeof datos.sede === "string") return datos.sede === sede!.nombre;
          if (Array.isArray(datos.sedes)) {
            const sedes = datos.sedes.filter((nombre): nombre is string => typeof nombre === "string");
            return sedes.length === 1 && sedes[0] === sede!.nombre;
          }
        }
        // Los cambios de estado de ruta/pedido usan el nombre de sede al inicio del detalle textual.
        if (r.entidad === "envio" && typeof detalle === "string") {
          const separador = detalle.indexOf(" · ");
          return separador > 0 && detalle.slice(0, separador) === sede!.nombre;
        }
        return false;
      });
  return visibles.map((r) => ({
    id: r.id.toString(),
    fecha: r.creadoEn.toISOString(),
    sistema: r.sistema,
    usuario: r.usuario?.name ?? r.usuarioEscrito ?? "—",
    operacion: r.operacion,
    detalle:
      typeof r.detalle === "string"
        ? r.detalle
        : r.detalle &&
            typeof r.detalle === "object" &&
            !Array.isArray(r.detalle) &&
            typeof r.detalle.resumen === "string"
          ? r.detalle.resumen
          : r.detalle &&
              typeof r.detalle === "object" &&
              !Array.isArray(r.detalle) &&
              Object.keys(r.detalle).length === 0 &&
              r.operacion === "Inicio de sesión"
            ? `${r.sistema === "picking" ? "Sistema de picking" : "Sitio web"} · ${r.usuarioEscrito ?? r.usuario?.name ?? "—"}`
            : JSON.stringify(r.detalle),
  }));
}

export async function consultarAnios(sesion: SesionActual | null, sedeId: number) {
  exigirPermiso(sesion, "pk.reportes", sedeId);
  z.number().int().positive().parse(sedeId);
  const primero = await prisma.envio.findFirst({
    where: { sedeId },
    orderBy: { fechaEnvio: "asc" },
    select: { fechaEnvio: true },
  });
  const actual = Number(fechaGuatemala(new Date()).slice(0, 4));
  const inicial = Math.min(actual, primero?.fechaEnvio.getUTCFullYear() ?? actual);
  return Array.from({ length: actual - inicial + 1 }, (_, i) => String(actual - i));
}
export type Despacho = Awaited<ReturnType<typeof consultarDespacho>>;
export type RutaReporte = Awaited<ReturnType<typeof consultarRutas>>[number];
export type OperacionReporte = Awaited<ReturnType<typeof consultarOperaciones>>[number];
