import { crearClientePrisma } from "../../src/lib/prisma";

try {
  process.loadEnvFile();
} catch {
  // Ignorar si no existe
}

const prisma = crearClientePrisma(process.env.DATABASE_URL);

async function principal() {
  const accion = process.argv[2] ?? "crear";

  if (accion === "limpiar") {
    await prisma.lineaPreparacion.deleteMany({ where: { envio: { sedeId: 1 } } });
    await prisma.historialEstado.deleteMany({ where: { envio: { sedeId: 1 } } });
    await prisma.detallePedidoFacturado.deleteMany({ where: { pedidoFacturado: { sedeId: 1 } } });
    await prisma.pedidoFacturado.deleteMany({ where: { sedeId: 1 } });
    await prisma.envio.deleteMany({ where: { sedeId: 1 } });
    return;
  }

  // Asegurar que existe el estado y usuarios
  const estadoPrep = await prisma.estadoEnvio.findUniqueOrThrow({ where: { nombre: "En Preparación" } });
  const usuarioBodega = await prisma.usuario.findFirstOrThrow({ where: { displayUsername: "ejemplo.05" } });
  const usuarioPiloto = await prisma.usuario.findFirstOrThrow({ where: { displayUsername: "ejemplo.06" } });
  const camion = await prisma.camion.findFirstOrThrow({ where: { sedeId: 1 } });

  // Limpiar previos
  await prisma.lineaPreparacion.deleteMany({ where: { envio: { sedeId: 1 } } });
  await prisma.historialEstado.deleteMany({ where: { envio: { sedeId: 1 } } });
  await prisma.detallePedidoFacturado.deleteMany({ where: { pedidoFacturado: { sedeId: 1 } } });
  await prisma.pedidoFacturado.deleteMany({ where: { sedeId: 1 } });
  await prisma.envio.deleteMany({ where: { sedeId: 1 } });

  // Crear el envío del ejemplo de los tres clientes (specs/07, CP-19, CP-36, CP-38)
  const envio = await prisma.envio.create({
    data: {
      sedeId: 1,
      tipo: "ruta",
      numero: 1,
      fechaEnvio: new Date("2026-10-18T00:00:00Z"),
      programadoPara: new Date("2026-10-18T13:30:00-06:00"),
      estadoId: estadoPrep.id,
      enviadoPorId: usuarioBodega.id,
      camionId: camion.id,
      pilotoId: usuarioPiloto.id,
      posicionCola: 1,
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
        ],
      },
      pedidosFacturados: {
        create: [
          {
            sedeId: 1,
            numeroOdoo: "90001",
            referencia: "XE-IN/SALIDA/90001",
            cliente: "Cliente A",
            sector: "Zona 1",
            posicion: 1,
            cargadoPorId: usuarioBodega.id,
            detalles: {
              create: [{ producto: "SULFATO DE SODIO", lote: "5287", pesoConversionKg: 25, cantidadKg: 25, orden: 1 }],
            },
          },
          {
            sedeId: 1,
            numeroOdoo: "90002",
            referencia: "XE-IN/SALIDA/90002",
            cliente: "Cliente B",
            sector: "Zona 2",
            posicion: 2,
            cargadoPorId: usuarioBodega.id,
            detalles: {
              create: [{ producto: "SULFATO DE SODIO", lote: "5287", pesoConversionKg: 25, cantidadKg: 15, orden: 1 }],
            },
          },
          {
            sedeId: 1,
            numeroOdoo: "90003",
            referencia: "XE-IN/SALIDA/90003",
            cliente: "Cliente C",
            sector: "Zona 3",
            posicion: 3,
            cargadoPorId: usuarioBodega.id,
            detalles: {
              create: [{ producto: "SULFATO DE SODIO", lote: "9221", pesoConversionKg: 25, cantidadKg: 10, orden: 1 }],
            },
          },
        ],
      },
    },
  });

  console.log(JSON.stringify({ envioId: envio.id }));
}

principal()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
