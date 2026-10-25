import { beforeEach, describe, expect, it } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { sembrarDemo } from "../../../prisma/semillas/demo";
import { calcularOcupacion, listarTableroBodega } from "./tablero";

describe("RF-SL-25: ocupación del camión por peso en el tablero", () => {
  it("RF-SL-25: con la carga del prototipo (5,515 de 6,000 kg) muestra 92 % y no está lleno", () => {
    const ocupacion = calcularOcupacion(
      [
        { id: 1, cantidadKg: "1500" },
        { id: 2, cantidadKg: "1000" },
        { id: 3, cantidadKg: "800" },
        { id: 4, cantidadKg: "500" },
        { id: 5, cantidadKg: "600" },
        { id: 6, cantidadKg: "250" },
        { id: 7, cantidadKg: "360" },
        { id: 8, cantidadKg: "400" },
        { id: 9, cantidadKg: "105" },
      ],
      "6000",
    );
    expect(ocupacion.totalKg).toBe("5515");
    expect(ocupacion.porcentaje).toBe(92);
    expect(ocupacion.porcentajeBarra).toBeCloseTo(91.917, 3);
    expect(ocupacion.lleno).toBe(false);
    expect(ocupacion.segmentos[1]).toEqual({ ancho: 25, numerado: true });
    expect(ocupacion.segmentos[9]!.ancho).toBeCloseTo(1.75, 6);
  });

  it("RF-SL-25: el porcentaje se redondea al entero más cercano, con los medios hacia arriba", () => {
    expect(calcularOcupacion([{ id: 1, cantidadKg: "25" }], "200").porcentaje).toBe(13);
    expect(calcularOcupacion([{ id: 1, cantidadKg: "24.9" }], "200").porcentaje).toBe(12);
    expect(calcularOcupacion([{ id: 1, cantidadKg: "0.004" }], "1000").porcentaje).toBe(0);
  });

  it("RF-SL-25: con exactamente la capacidad está lleno y la barra llega al 100 %", () => {
    const ocupacion = calcularOcupacion(
      [
        { id: 1, cantidadKg: "3000" },
        { id: 2, cantidadKg: "400" },
      ],
      "3400",
    );
    expect(ocupacion.porcentaje).toBe(100);
    expect(ocupacion.porcentajeBarra).toBe(100);
    expect(ocupacion.lleno).toBe(true);
  });

  it("RF-SL-25: si la carga supera la capacidad, la barra no pasa de 100 % y los segmentos se miden sobre la carga", () => {
    const ocupacion = calcularOcupacion(
      [
        { id: 7, cantidadKg: "3000" },
        { id: 8, cantidadKg: "1000" },
      ],
      "3400",
    );
    expect(ocupacion.totalKg).toBe("4000");
    expect(ocupacion.porcentaje).toBe(118);
    expect(ocupacion.porcentajeBarra).toBe(100);
    expect(ocupacion.lleno).toBe(true);
    expect(ocupacion.segmentos[7]!.ancho).toBe(75);
    expect(ocupacion.segmentos[8]!.ancho).toBe(25);
  });

  it("RF-SL-25: un segmento lleva su número solo si ocupa más del 3.5 % del camión, como el prototipo", () => {
    const ocupacion = calcularOcupacion(
      [
        { id: 1, cantidadKg: "35" },
        { id: 2, cantidadKg: "35.001" },
      ],
      "1000",
    );
    expect(ocupacion.segmentos[1]).toEqual({ ancho: 3.5, numerado: false });
    expect(ocupacion.segmentos[2]!.numerado).toBe(true);
  });

  it("RF-SL-25: suma los kg sin errores de punto flotante", () => {
    const ocupacion = calcularOcupacion(
      [
        { id: 1, cantidadKg: "0.1" },
        { id: 2, cantidadKg: "0.2" },
      ],
      "1",
    );
    expect(ocupacion.totalKg).toBe("0.3");
    expect(ocupacion.porcentaje).toBe(30);
    expect(ocupacion.segmentos[2]!.ancho).toBe(20);
  });

  it("RF-SL-25: sin líneas, la ocupación es cero", () => {
    const ocupacion = calcularOcupacion([], "3400");
    expect(ocupacion).toEqual({ totalKg: "0", porcentaje: 0, porcentajeBarra: 0, lleno: false, segmentos: {} });
  });

  it("RF-SL-25: una capacidad que no es mayor que cero no divide entre cero", () => {
    const ocupacion = calcularOcupacion([{ id: 1, cantidadKg: "10" }], "0");
    expect(ocupacion.porcentaje).toBe(0);
    expect(ocupacion.porcentajeBarra).toBe(0);
    expect(ocupacion.lleno).toBe(true);
    expect(ocupacion.segmentos[1]).toEqual({ ancho: 100, numerado: true });
    expect(calcularOcupacion([], "0").lleno).toBe(false);
  });
});

describe("RF-SL-25: datos del tablero en pantalla completa", () => {
  let bodegaId: string;
  let pilotoId: string;

  beforeEach(async () => {
    await limpiarTablasDeNegocio();
    await sembrarDemo(prisma, { claveDemo: "Demo-12345" });
    bodegaId = (await prisma.usuario.findFirstOrThrow({ where: { displayUsername: "ejemplo.05" } })).id;
    pilotoId = (await prisma.usuario.findFirstOrThrow({ where: { displayUsername: "ejemplo.06" } })).id;
  });

  async function crear(sedeId: number, tipo: "ruta" | "pedido", numero: number, posicionCola: number) {
    const estado = await prisma.estadoEnvio.findUniqueOrThrow({ where: { nombre: "En Preparación" } });
    const camion =
      tipo === "ruta" ? await prisma.camion.findFirstOrThrow({ where: { identificacion: "Camión 3" } }) : null;
    return prisma.envio.create({
      data: {
        sedeId,
        tipo,
        numero,
        fechaEnvio: new Date("2026-10-18T00:00:00Z"),
        programadoPara: new Date("2026-10-18T13:30:00-06:00"),
        estadoId: estado.id,
        enviadoPorId: bodegaId,
        camionId: camion?.id ?? null,
        pilotoId: tipo === "ruta" ? pilotoId : null,
        posicionCola,
        lineas: {
          create: [
            {
              producto: "SULFURO DE SODIO (TUR-SAC/0025KG)",
              lote: "9466",
              pesoConversionKg: 25,
              cantidadKg: 1500,
              posicion: 1,
            },
            {
              producto: "ACIDO FORMICO",
              lote: "",
              pesoConversionKg: 35,
              cantidadKg: "105.5",
              posicion: 2,
              marcado: true,
            },
          ],
        },
      },
    });
  }

  it("RF-SL-25: lista las rutas y los pedidos de la sede en el orden de la cola, con la capacidad del camión", async () => {
    const pedido = await crear(1, "pedido", 2, 1);
    const ruta = await crear(1, "ruta", 3, 2);
    await crear(2, "pedido", 9, 0);

    const tablero = await listarTableroBodega(1);

    expect(tablero.map((e) => e.id)).toEqual([pedido.id, ruta.id]);
    const [p, r] = tablero;
    expect(p!.camion).toBeNull();
    expect(p!.ocupacion).toBeNull();
    expect(r!.camion).toEqual({ id: expect.any(Number), identificacion: "Camión 3", capacidadKg: "6000" });
    expect(r!.ocupacion).toEqual(calcularOcupacion(r!.lineas, "6000"));
    expect(r!.ocupacion!.totalKg).toBe("1605.5");
    expect(r!.piloto?.id).toBe(pilotoId);
    expect(r!.lineasListas).toBe(1);
    expect(r!.lineasContador).toBe(2);
  });

  it("RF-SL-25: entrega las cantidades como texto exacto, sin valores Decimal que no se pueden enviar al navegador", async () => {
    await crear(1, "ruta", 4, 1);
    const [envio] = await listarTableroBodega(1);
    for (const linea of envio!.lineas) {
      expect(typeof linea.cantidadKg).toBe("string");
      expect(typeof linea.pesoConversionKg).toBe("string");
      expect(linea.cantidadKg).not.toBeInstanceOf(Prisma.Decimal);
    }
    expect(envio!.lineas.map((l) => l.cantidadKg)).toEqual(["1500", "105.5"]);
    expect(typeof envio!.camion!.capacidadKg).toBe("string");
  });
});
