import { crearClientePrisma } from "../../src/lib/prisma";

try {
  process.loadEnvFile();
} catch {
  // Ignorar si no existe
}

export const prisma = crearClientePrisma(process.env.DATABASE_URL);

export async function limpiarRutasPrueba(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  await prisma.historialEstado.deleteMany({ where: { envioId: { in: ids } } });
  await prisma.entregaRuta.deleteMany({ where: { envioId: { in: ids } } });
  await prisma.envio.deleteMany({ where: { id: { in: ids } } });
}

export async function prepararRutasPrueba(base = 9900) {
  const u06 = await prisma.usuario.findFirstOrThrow({ where: { displayUsername: "ejemplo.06" } });
  const u07 = await prisma.usuario.findFirstOrThrow({ where: { displayUsername: "ejemplo.07" } });
  const uBodega = await prisma.usuario.findFirstOrThrow({ where: { displayUsername: "ejemplo.05" } });
  const c1 = await prisma.camion.findFirstOrThrow({ where: { sedeId: 1 }, orderBy: { id: "asc" } });
  const estadoEnRuta = await prisma.estadoEnvio.findUniqueOrThrow({ where: { nombre: "En Ruta" } });

  const numeros = [base + 1, base + 2, base + 3];
  // Limpiar previas por si quedaron
  const previas = await prisma.envio.findMany({
    where: {
      sedeId: 1,
      tipo: "ruta",
      numero: { in: numeros },
      pilotoId: { in: [u06.id, u07.id] },
    },
    select: { id: true },
  });
  await limpiarRutasPrueba(previas.map((p) => p.id));

  const r1 = await prisma.envio.create({
    data: {
      sedeId: 1,
      tipo: "ruta",
      camionId: c1.id,
      pilotoId: u06.id,
      enviadoPorId: uBodega.id,
      numero: base + 1,
      estadoId: estadoEnRuta.id,
      fechaEnvio: new Date("2026-10-24T00:00:00Z"),
      programadoPara: new Date("2026-10-24T14:30:00-06:00"),
      entregas: {
        create: [
          {
            cliente: "Textiles Modernos S.A.",
            sector: "Zona 12",
            totalKg: 250,
            orden: 1,
          },
          {
            cliente: "Calzados El Águila",
            sector: "Zona 8",
            totalKg: 300,
            orden: 2,
          },
          {
            cliente: "Distribuidora La Central",
            sector: "Zona 4",
            totalKg: 150,
            orden: 3,
          },
        ],
      },
    },
  });

  const r2 = await prisma.envio.create({
    data: {
      sedeId: 1,
      tipo: "ruta",
      camionId: c1.id,
      pilotoId: u07.id,
      enviadoPorId: uBodega.id,
      numero: base + 2,
      estadoId: estadoEnRuta.id,
      fechaEnvio: new Date("2026-10-24T00:00:00Z"),
      programadoPara: new Date("2026-10-24T16:00:00-06:00"),
      entregas: {
        create: [
          {
            cliente: "Pinturas Unidas",
            sector: "Zona 11",
            totalKg: 200,
            orden: 1,
          },
        ],
      },
    },
  });

  const r3 = await prisma.envio.create({
    data: {
      sedeId: 1,
      tipo: "ruta",
      camionId: c1.id,
      pilotoId: u06.id,
      enviadoPorId: uBodega.id,
      numero: base + 3,
      estadoId: estadoEnRuta.id,
      fechaEnvio: new Date("2026-10-25T00:00:00Z"),
      programadoPara: new Date("2026-10-25T09:00:00-06:00"),
      entregas: {
        create: [
          {
            cliente: "Química Industrial",
            sector: "Zona 9",
            totalKg: 500,
            orden: 1,
          },
        ],
      },
    },
  });

  return {
    rutaPiloto06: { id: r1.id, numero: r1.numero },
    rutaPiloto07: { id: r2.id, numero: r2.numero },
    rutaSecundaria: { id: r3.id, numero: r3.numero },
  };
}

async function principal() {
  const comando = process.argv[2];
  if (comando === "crear") {
    const base = process.argv[3] ? Number(process.argv[3]) : 9900;
    const res = await prepararRutasPrueba(base);
    console.log(JSON.stringify(res));
  } else if (comando === "limpiar") {
    const ids = process.argv
      .slice(3)
      .map(Number)
      .filter((n) => !isNaN(n));
    await limpiarRutasPrueba(ids);
    console.log(JSON.stringify({ ok: true }));
  } else if (comando === "consultar") {
    const id = Number(process.argv[3]);
    const envio = await prisma.envio.findUniqueOrThrow({
      where: { id },
      include: { estado: true },
    });
    console.log(JSON.stringify({ estado: envio.estado.nombre }));
  } else if (comando === "consultar-entregas") {
    const id = Number(process.argv[3]);
    const entregas = await prisma.entregaRuta.findMany({
      where: { envioId: id },
      orderBy: { orden: "asc" },
      select: { id: true, cliente: true, orden: true },
    });
    console.log(JSON.stringify(entregas));
  }
}

if (process.argv[1]?.includes("preparar-ruta")) {
  principal()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
