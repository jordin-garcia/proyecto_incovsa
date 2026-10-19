import { beforeEach, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import type { SesionActual } from "@/lib/sesion";
import { ErrorAcceso } from "@/modulos/permisos/servicio";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { sembrarDemo } from "../../../prisma/semillas/demo";
import { camionesActivosDeSede, eliminarCamion, guardarCamion, listarCamiones } from "./servicio";

beforeEach(async () => {
  await limpiarTablasDeNegocio();
  await sembrarDemo(prisma, { claveDemo: "Clave-de-prueba-06" });
});

async function sesion(usuario: string, permisosExtra: string[] = []): Promise<SesionActual> {
  const cuenta = await prisma.usuario.findFirstOrThrow({
    where: { displayUsername: usuario, sistema: { in: ["picking", "ambos"] } },
    include: { sedes: { include: { sede: true } } },
  });
  return {
    sistema: "picking",
    usuario: { id: cuenta.id, nombre: cuenta.name, usuario: cuenta.displayUsername, rol: cuenta.rol },
    permisos: permisosExtra,
    sedes: cuenta.sedes.map((s) => ({ id: s.sede.id, nombre: s.sede.nombre, prefijoOdoo: s.sede.prefijoOdoo })),
  };
}

async function sede(nombre: string) {
  return prisma.sede.findFirstOrThrow({ where: { nombre } });
}

it("RF-SL-04: se crea, edita y elimina un camión; la baja es lógica y conserva la ruta y la bitácora", async () => {
  const gerencia = await sesion("ejemplo.01");
  const qx = await sede("Quetzaltenango");
  const creado = await guardarCamion({ identificacion: "Camión nuevo", capacidad: "1,500.5", sedeId: qx.id }, gerencia);
  expect(await listarCamiones(gerencia)).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: creado.id,
        identificacion: "Camión nuevo",
        capacidad: "1,500.5 kg",
        sede: "Quetzaltenango",
      }),
    ]),
  );

  await guardarCamion({ id: creado.id, identificacion: "Camión editado", capacidad: "1600", sedeId: qx.id }, gerencia);
  const estado = await prisma.estadoEnvio.findFirstOrThrow({ where: { nombre: "En Preparación" } });
  const envio = await prisma.envio.create({
    data: {
      sedeId: qx.id,
      tipo: "ruta",
      numero: 1,
      fechaEnvio: new Date("2026-10-19"),
      programadoPara: new Date("2026-10-19T18:00:00.000Z"),
      estadoId: estado.id,
      enviadoPorId: gerencia.usuario.id,
      camionId: creado.id,
    },
  });
  await prisma.opcionEnvio.update({
    where: { sedeId_tipo: { sedeId: qx.id, tipo: "camion" } },
    data: { camionId: creado.id },
  });

  await eliminarCamion({ id: creado.id }, gerencia);

  expect(await listarCamiones(gerencia)).not.toEqual(
    expect.arrayContaining([expect.objectContaining({ id: creado.id })]),
  );
  expect((await camionesActivosDeSede(qx.id)).map((c) => c.id)).not.toContain(creado.id);
  const fila = await prisma.camion.findUniqueOrThrow({ where: { id: creado.id } });
  expect(fila.eliminadoEn).toBeTruthy();
  expect(await prisma.envio.findUnique({ where: { id: envio.id } })).toMatchObject({ camionId: creado.id });
  expect(
    await prisma.opcionEnvio.findUnique({ where: { sedeId_tipo: { sedeId: qx.id, tipo: "camion" } } }),
  ).toMatchObject({
    camionId: creado.id,
  });
  const operaciones = await prisma.bitacora.findMany({
    where: { registroId: String(creado.id) },
    orderBy: { id: "asc" },
  });
  expect(operaciones.map((b) => b.operacion)).toEqual([
    "Creación de camión",
    "Edición de camión",
    "Eliminación de camión",
  ]);
  expect(operaciones[0]?.detalle).toMatchObject({ resumen: "Camión nuevo · 1,500.5 kg · Quetzaltenango" });
  expect(operaciones[2]?.detalle).toMatchObject({ resumen: "Camión editado" });
});

it("RN-17: quien solo tiene Quetzaltenango no ve ni crea camiones de otra sede", async () => {
  const bodega = await sesion("ejemplo.05", ["pk.cfg.camiones"]);
  const guatemala = await sede("Guatemala");
  const gerencia = await sesion("ejemplo.01");
  const ajeno = await guardarCamion(
    { identificacion: "Camión Guatemala", capacidad: "2000", sedeId: guatemala.id },
    gerencia,
  );

  const lista = await listarCamiones(bodega);
  expect(lista.map((c) => c.sede)).toEqual(["Quetzaltenango", "Quetzaltenango", "Quetzaltenango"]);
  expect(lista.map((c) => c.id)).not.toContain(ajeno.id);
  await expect(
    guardarCamion({ identificacion: "Intruso", capacidad: "1000", sedeId: guatemala.id }, bodega),
  ).rejects.toBeInstanceOf(ErrorAcceso);
  await expect(
    guardarCamion({ id: ajeno.id, identificacion: "Robado", capacidad: "1000", sedeId: bodega.sedes[0]!.id }, bodega),
  ).rejects.toBeInstanceOf(ErrorAcceso);
  await expect(eliminarCamion({ id: ajeno.id }, bodega)).rejects.toBeInstanceOf(ErrorAcceso);
  expect(await prisma.camion.findUnique({ where: { id: ajeno.id } })).toMatchObject({ eliminadoEn: null });
});

it.each(["0", "-1", "abc", "1.2345", ""])("RF-SL-04: la capacidad %j se rechaza", async (capacidad) => {
  const gerencia = await sesion("ejemplo.01");
  const qx = await sede("Quetzaltenango");
  await expect(guardarCamion({ identificacion: "Camión malo", capacidad, sedeId: qx.id }, gerencia)).rejects.toThrow(
    "La capacidad debe ser mayor que cero.",
  );
});

it("RF-SL-04: sin pk.cfg.camiones el servicio rechaza la operación", async () => {
  const bodega = await sesion("ejemplo.05");
  const qx = await sede("Quetzaltenango");
  await expect(listarCamiones(bodega)).rejects.toBeInstanceOf(ErrorAcceso);
  await expect(
    guardarCamion({ identificacion: "No", capacidad: "1000", sedeId: qx.id }, bodega),
  ).rejects.toBeInstanceOf(ErrorAcceso);
});
