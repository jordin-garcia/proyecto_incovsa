import { crearClientePrisma } from "../../src/lib/prisma";

try {
  process.loadEnvFile();
} catch {
  // Ignorar si no existe
}

export const prisma = crearClientePrisma(process.env.DATABASE_URL);

export interface OpcionesEnvioPrueba {
  numero?: number;
  sedeId?: number;
  /** "pedido" es el envío que el cliente recoge en bodega: sin camión ni piloto. */
  tipo?: "ruta" | "pedido";
}

export async function limpiarEnvioPrueba(envioId: number): Promise<void> {
  const pedidos = await prisma.pedidoFacturado.findMany({
    where: { envioId },
    select: { id: true },
  });
  const pedidoIds = pedidos.map((p) => p.id);

  if (pedidoIds.length > 0) {
    await prisma.detallePedidoFacturado.deleteMany({
      where: { pedidoFacturadoId: { in: pedidoIds } },
    });
    await prisma.pedidoFacturado.deleteMany({
      where: { id: { in: pedidoIds } },
    });
  }

  await prisma.lineaPreparacion.deleteMany({ where: { envioId } });
  await prisma.historialEstado.deleteMany({ where: { envioId } });
  await prisma.envio.deleteMany({ where: { id: envioId } });
}

export async function crearEnvioPrueba(
  opciones: OpcionesEnvioPrueba = {},
): Promise<{ envioId: number; numero: number }> {
  const numero = opciones.numero ?? 1;
  const sedeId = opciones.sedeId ?? 1;
  const tipo = opciones.tipo ?? "ruta";
  const fechaEnvio = new Date("2026-10-18T00:00:00Z");

  // Si ya existía un envío con esta clave única (sede, tipo, fecha, numero), limpiar SOLO ese envío
  const previo = await prisma.envio.findUnique({
    where: {
      sedeId_tipo_fechaEnvio_numero: {
        sedeId,
        tipo,
        fechaEnvio,
        numero,
      },
    },
    select: { id: true },
  });

  if (previo) {
    await limpiarEnvioPrueba(previo.id);
  }

  // Asegurar que existe el estado y usuarios
  const estadoPrep = await prisma.estadoEnvio.findUniqueOrThrow({ where: { nombre: "En Preparación" } });
  const usuarioBodega = await prisma.usuario.findFirstOrThrow({ where: { displayUsername: "ejemplo.05" } });
  const usuarioPiloto = await prisma.usuario.findFirstOrThrow({ where: { displayUsername: "ejemplo.06" } });
  // Los camiones de demostración son de Quetzaltenango: solo la ruta los necesita.
  const camion =
    tipo === "ruta" ? await prisma.camion.findFirstOrThrow({ where: { sedeId }, orderBy: { id: "asc" } }) : null;
  // El pedido lleva además una línea y un detalle sin lote, que se muestran como «Sin lote» (decisión 42).
  const sinLote = tipo === "pedido";

  // Crear el envío del ejemplo de los tres clientes (specs/07, CP-19, CP-36, CP-38)
  const envio = await prisma.envio.create({
    data: {
      sedeId,
      tipo,
      numero,
      fechaEnvio,
      programadoPara: new Date("2026-10-18T13:30:00-06:00"),
      estadoId: estadoPrep.id,
      enviadoPorId: usuarioBodega.id,
      camionId: camion?.id ?? null,
      pilotoId: tipo === "ruta" ? usuarioPiloto.id : null,
      posicionCola: numero,
      lineas: {
        create: [
          {
            producto: "SULFATO DE SODIO",
            lote: "5287",
            pesoConversionKg: 25,
            cantidadKg: 40,
            marcado: false,
            posicion: 1,
          },
          {
            producto: "SULFATO DE SODIO",
            lote: "9221",
            pesoConversionKg: 25,
            cantidadKg: 10,
            marcado: false,
            posicion: 2,
          },
          ...(sinLote
            ? [
                {
                  producto: "SULFATO DE SODIO",
                  lote: "",
                  pesoConversionKg: 25,
                  cantidadKg: 5,
                  marcado: false,
                  posicion: 3,
                },
              ]
            : []),
        ],
      },
      pedidosFacturados: {
        create: [
          {
            sedeId,
            numeroOdoo: "90001",
            referencia: `XE-IN/SALIDA/90001-${numero}`,
            cliente: "Cliente A",
            sector: "Zona 1",
            posicion: 1,
            cargadoPorId: usuarioBodega.id,
            detalles: {
              create: [{ producto: "SULFATO DE SODIO", lote: "5287", pesoConversionKg: 25, cantidadKg: 25, orden: 1 }],
            },
          },
          {
            sedeId,
            numeroOdoo: "90002",
            referencia: `XE-IN/SALIDA/90002-${numero}`,
            cliente: "Cliente B",
            sector: "Zona 2",
            posicion: 2,
            cargadoPorId: usuarioBodega.id,
            detalles: {
              create: [{ producto: "SULFATO DE SODIO", lote: "5287", pesoConversionKg: 25, cantidadKg: 15, orden: 1 }],
            },
          },
          {
            sedeId,
            numeroOdoo: "90003",
            referencia: `XE-IN/SALIDA/90003-${numero}`,
            cliente: "Cliente C",
            sector: "Zona 3",
            posicion: 3,
            cargadoPorId: usuarioBodega.id,
            detalles: {
              create: [
                { producto: "SULFATO DE SODIO", lote: "9221", pesoConversionKg: 25, cantidadKg: 10, orden: 1 },
                ...(sinLote
                  ? [{ producto: "SULFATO DE SODIO", lote: "", pesoConversionKg: 25, cantidadKg: 5, orden: 2 }]
                  : []),
              ],
            },
          },
        ],
      },
    },
  });

  return { envioId: envio.id, numero };
}

async function principal() {
  const accion = process.argv[2] ?? "crear";

  if (accion === "limpiar") {
    const envioIds = process.argv.slice(3);
    if (envioIds.length) {
      for (const id of envioIds) await limpiarEnvioPrueba(Number(id));
    } else {
      // Limpiar únicamente envíos de prueba conocidos (1, 2, 3) de la fecha 2026-10-18
      const enviosPrueba = await prisma.envio.findMany({
        where: {
          sedeId: 1,
          tipo: "ruta",
          fechaEnvio: new Date("2026-10-18T00:00:00Z"),
          numero: { in: [1, 2, 3] },
        },
        select: { id: true },
      });
      for (const e of enviosPrueba) {
        await limpiarEnvioPrueba(e.id);
      }
    }
    return;
  }

  // JM-05: los envíos del tablero en un solo proceso, porque cada llamada tarda segundos (auditoría, H-26).
  if (accion === "crear-tablero") {
    const base = Number(process.argv[3]);
    const ruta = await crearEnvioPrueba({ numero: base + 1, tipo: "ruta" });
    const pedido = await crearEnvioPrueba({ numero: base + 2, tipo: "pedido" });
    const larga = await crearEnvioPrueba({ numero: base + 3, tipo: "ruta" });
    const despacho = await crearEnvioPrueba({ numero: base + 4, tipo: "pedido" });
    const muyLarga = await crearEnvioPrueba({ numero: base + 5, tipo: "ruta" });
    const grande = await prisma.camion.findFirstOrThrow({ where: { identificacion: "Camión 3" } });
    // Más líneas de las que caben en una columna (RF-SL-77, CP-40), en el camión de 6,000 kg (CAM-94); y una ruta
    // que no cabe en ninguna pantalla ni con el alto mínimo de las líneas (decisión de Jordin del 24/10).
    for (const [envio, cantidad] of [
      [larga, 25],
      [muyLarga, 60],
    ] as const) {
      await prisma.lineaPreparacion.deleteMany({ where: { envioId: envio.envioId } });
      await prisma.lineaPreparacion.createMany({
        data: Array.from({ length: cantidad }, (_, i) => ({
          envioId: envio.envioId,
          producto: `PRODUCTO DE PRUEBA ${String(i + 1).padStart(2, "0")}`,
          lote: String(1000 + i),
          pesoConversionKg: 25,
          cantidadKg: 25 * (i + 1),
          marcado: false,
          posicion: i + 1,
        })),
      });
      await prisma.envio.update({ where: { id: envio.envioId }, data: { camionId: grande.id } });
    }
    const sinCamion = await crearEnvioPrueba({ numero: base + 6, tipo: "ruta" });
    await prisma.envio.update({ where: { id: sinCamion.envioId }, data: { camionId: null } });
    console.log(JSON.stringify({ ruta, pedido, larga, despacho, muyLarga, sinCamion }));
    return;
  }

  if (accion === "cambiar-estado") {
    const envioId = Number(process.argv[3]);
    const estadoNombre = process.argv[4];
    const estado = await prisma.estadoEnvio.findUniqueOrThrow({ where: { nombre: estadoNombre } });
    await prisma.envio.update({
      where: { id: envioId },
      data: { estadoId: estado.id },
    });
    return;
  }

  const numero = process.argv[3] ? Number(process.argv[3]) : 1;
  const tipo = process.argv[4] === "pedido" ? "pedido" : "ruta";
  const sedeId = process.argv[5] ? Number(process.argv[5]) : undefined;
  const res = await crearEnvioPrueba({ numero, tipo, sedeId });
  console.log(JSON.stringify(res));
}

if (process.argv[1]?.includes("preparar-envio")) {
  principal()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
