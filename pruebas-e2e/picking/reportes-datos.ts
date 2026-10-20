import { crearClientePrisma } from "../../src/lib/prisma";
const bd = crearClientePrisma(process.env.DATABASE_URL);
const ids: number[] = [];
const numeroBase = Number(process.argv[3]);
const producto = process.argv[4]!;
async function principal() {
  try {
    if (process.argv[2] === "limpiar") {
      const idsGuardados = JSON.parse(process.argv[3]!) as number[];
      await bd.historialEstado.deleteMany({ where: { envioId: { in: idsGuardados } } });
      await bd.envio.deleteMany({ where: { id: { in: idsGuardados } } });
    } else {
      const usuario = await bd.usuario.findUniqueOrThrow({ where: { username: "ambos.ejemplo.01" } });
      const camion = await bd.camion.findFirstOrThrow({ where: { sedeId: 1 } });
      const piloto = await bd.usuario.findFirstOrThrow({ where: { displayUsername: "ejemplo.06" } });
      const enRuta = await bd.estadoEnvio.findUniqueOrThrow({ where: { nombre: "En Ruta" } });
      const entregado = await bd.estadoEnvio.findUniqueOrThrow({ where: { nombre: "Entregado" } });
      for (let i = 0; i < 2; i++) {
        const envio = await bd.envio.create({
          data: {
            tipo: "ruta",
            sedeId: 1,
            numero: numeroBase + i,
            fechaEnvio: new Date("2026-10-24T00:00:00Z"),
            programadoPara: new Date("2026-10-24T13:30:00-06:00"),
            estadoId: i ? entregado.id : enRuta.id,
            enviadoPorId: usuario.id,
            camionId: camion.id,
            pilotoId: piloto.id,
            lineas: {
              create: [
                { producto, lote: "A", cantidadKg: "37.625", pesoConversionKg: "25", posicion: 1 },
                { producto, lote: "B", cantidadKg: "0.125", pesoConversionKg: "10", posicion: 2 },
              ],
            },
            historial: {
              create: [
                { estadoId: enRuta.id, usuarioId: usuario.id, creadoEn: new Date("2026-10-25T23:30:00-06:00") },
                ...(i
                  ? [{ estadoId: entregado.id, usuarioId: usuario.id, creadoEn: new Date("2026-10-25T23:45:00-06:00") }]
                  : []),
              ],
            },
            entregas: {
              create: [
                { cliente: "Cliente segundo", sector: "Zona 2", totalKg: "12.75", orden: 2 },
                { cliente: "Cliente primero", sector: "Zona 1", totalKg: "25", orden: 1 },
              ],
            },
          },
        });
        ids.push(envio.id);
      }
      console.log(JSON.stringify(ids));
    }
  } finally {
    await bd.$disconnect();
  }
}
principal().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
