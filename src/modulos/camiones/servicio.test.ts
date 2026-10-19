import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { ErrorAcceso } from "@/modulos/permisos/servicio";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { esquemaCamion, esquemaEditarCamion } from "./esquemas";
import {
  camionesActivosDeSede,
  crearCamion,
  editarCamion,
  eliminarCamion,
  listarCamionesDeSedes,
  type ContextoCamion,
} from "./servicio";

describe("camiones", () => {
  let usuarioId: string;
  let quetzaltenango: number;
  let guatemala: number;

  beforeEach(async () => {
    await limpiarTablasDeNegocio();
    const usuario = await prisma.usuario.create({
      data: {
        id: "ce02-usuario",
        name: "Usuario de configuración",
        email: "picking.ce02@incovsa.invalid",
        username: "picking.ce02",
        displayUsername: "ce02",
        sistema: "picking",
        rol: "Facturador",
      },
    });
    usuarioId = usuario.id;
    quetzaltenango = (await prisma.sede.findUniqueOrThrow({ where: { prefijoOdoo: "XE" } })).id;
    guatemala = (await prisma.sede.findUniqueOrThrow({ where: { prefijoOdoo: "GT" } })).id;
  });

  function contexto(...sedesIds: number[]): ContextoCamion {
    return { usuarioId, sedesIds };
  }

  async function bitacora(operacion: string) {
    return prisma.bitacora.findFirstOrThrow({
      where: { operacion, usuarioId },
      orderBy: { id: "desc" },
    });
  }

  it("RF-SL-04: crea, edita y elimina de forma lógica; el eliminado sale de las listas y la ruta se conserva", async () => {
    const creado = await crearCamion(
      esquemaCamion.parse({ identificacion: "Camión nuevo", capacidadKg: "1500", sedeId: quetzaltenango }),
      contexto(quetzaltenango, guatemala),
    );
    expect(creado).toMatchObject({
      identificacion: "Camión nuevo",
      capacidadKg: "1500.000",
      sedeId: quetzaltenango,
    });

    const estado = await prisma.estadoEnvio.findUniqueOrThrow({ where: { nombre: "En Ruta" } });
    const envio = await prisma.envio.create({
      data: {
        sedeId: quetzaltenango,
        tipo: "ruta",
        numero: 1,
        fechaEnvio: new Date("2026-10-18T00:00:00Z"),
        programadoPara: new Date("2026-10-18T13:30:00Z"),
        estadoId: estado.id,
        enviadoPorId: usuarioId,
        camionId: creado.id,
      },
    });

    const editado = await editarCamion(
      esquemaEditarCamion.parse({
        id: creado.id,
        identificacion: "Camión editado",
        capacidadKg: "1800.5",
        sedeId: guatemala,
      }),
      contexto(quetzaltenango, guatemala),
    );
    expect(editado).toMatchObject({
      id: creado.id,
      identificacion: "Camión editado",
      capacidadKg: "1800.500",
      sedeId: guatemala,
      sedeAnteriorId: quetzaltenango,
    });

    await eliminarCamion({ id: creado.id }, contexto(quetzaltenango, guatemala));

    const fila = await prisma.camion.findUniqueOrThrow({ where: { id: creado.id } });
    expect(fila.eliminadoEn).not.toBeNull();
    expect(fila.identificacion).toBe("Camión editado");
    expect(await prisma.envio.findUniqueOrThrow({ where: { id: envio.id } })).toMatchObject({ camionId: creado.id });
    expect(await listarCamionesDeSedes([quetzaltenango, guatemala])).toEqual([]);
    expect(await camionesActivosDeSede(guatemala)).toEqual([]);
    expect(await camionesActivosDeSede(quetzaltenango)).toEqual([]);
    expect(await prisma.bitacora.count({ where: { usuarioId, entidad: "camion" } })).toBe(3);
  });

  it("RN-17: quien solo tiene Quetzaltenango no ve ni modifica camiones de Guatemala", async () => {
    const propio = await crearCamion(
      esquemaCamion.parse({ identificacion: "Camión XE", capacidadKg: "3400", sedeId: quetzaltenango }),
      contexto(quetzaltenango),
    );
    const ajeno = await prisma.camion.create({
      data: { identificacion: "Camión GT", capacidadKg: "2000", sedeId: guatemala },
    });

    expect(await listarCamionesDeSedes([quetzaltenango])).toEqual([
      {
        id: propio.id,
        identificacion: "Camión XE",
        capacidadKg: "3400.000",
        sedeId: quetzaltenango,
        sedeNombre: "Quetzaltenango",
      },
    ]);
    expect(await camionesActivosDeSede(guatemala)).toMatchObject([{ id: ajeno.id, identificacion: "Camión GT" }]);

    await expect(
      crearCamion(
        esquemaCamion.parse({ identificacion: "Intruso", capacidadKg: "1000", sedeId: guatemala }),
        contexto(quetzaltenango),
      ),
    ).rejects.toBeInstanceOf(ErrorAcceso);
    expect(await prisma.camion.count({ where: { identificacion: "Intruso" } })).toBe(0);

    await expect(
      editarCamion(
        esquemaEditarCamion.parse({
          id: ajeno.id,
          identificacion: "Hack",
          capacidadKg: "1000",
          sedeId: quetzaltenango,
        }),
        contexto(quetzaltenango),
      ),
    ).rejects.toBeInstanceOf(ErrorAcceso);
    await expect(eliminarCamion({ id: ajeno.id }, contexto(quetzaltenango))).rejects.toBeInstanceOf(ErrorAcceso);

    const intacto = await prisma.camion.findUniqueOrThrow({ where: { id: ajeno.id } });
    expect(intacto.identificacion).toBe("Camión GT");
    expect(intacto.eliminadoEn).toBeNull();
    expect(await listarCamionesDeSedes([quetzaltenango])).toMatchObject([{ id: propio.id }]);
  });

  it("RN-39: cada cambio queda en la bitácora con el texto del prototipo", async () => {
    const creado = await crearCamion(
      esquemaCamion.parse({ identificacion: "Camión 9", capacidadKg: "1500", sedeId: quetzaltenango }),
      contexto(quetzaltenango),
    );
    expect(await bitacora("Creación de camión")).toMatchObject({
      sistema: "picking",
      entidad: "camion",
      registroId: String(creado.id),
      detalle: {
        identificacion: "Camión 9",
        capacidadKg: "1500.000",
        sede: "Quetzaltenango",
        resumen: "Camión 9 · 1,500 kg · Quetzaltenango",
      },
    });

    await editarCamion(
      esquemaEditarCamion.parse({
        id: creado.id,
        identificacion: "Camión 9",
        capacidadKg: "1600",
        sedeId: quetzaltenango,
      }),
      contexto(quetzaltenango),
    );
    expect((await bitacora("Edición de camión")).detalle).toMatchObject({
      resumen: "Camión 9 · 1,600 kg · Quetzaltenango",
    });

    await eliminarCamion({ id: creado.id }, contexto(quetzaltenango));
    expect((await bitacora("Eliminación de camión")).detalle).toMatchObject({
      resumen: "Camión 9",
      identificacion: "Camión 9",
    });
    expect(await prisma.bitacora.count({ where: { registroId: String(creado.id) } })).toBe(3);
  });
});
