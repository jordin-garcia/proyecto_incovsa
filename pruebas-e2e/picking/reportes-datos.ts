import { crearClientePrisma } from "../../src/lib/prisma";
import { formatoFecha } from "../../src/lib/fechas";

const bd = crearClientePrisma(process.env.DATABASE_URL);
const partesFecha = new Intl.DateTimeFormat("en", {
  timeZone: "America/Guatemala",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).formatToParts(new Date());
const fechaActual = [
  partesFecha.find((parte) => parte.type === "year")!.value,
  partesFecha.find((parte) => parte.type === "month")!.value,
  partesFecha.find((parte) => parte.type === "day")!.value,
].join("-");
const fecha = process.argv[3] ?? fechaActual;
const instante = (hora: string) => new Date(`${fecha}T${hora}:00-06:00`);

const envios = [
  {
    tipo: "ruta",
    numero: 1,
    estado: "Entregado",
    programada: "08:00",
    camion: "Camión 1",
    piloto: "ejemplo.06",
    lineas: [
      ["SODA CAUSTICA (CHI-SAC/0025KG)", "1000", "25"],
      ["SULFURO DE SODIO (TUR-SAC/0025KG)", "500", "25"],
      ["EXTRACTO DE MIMOSA (BRA-SAC/0025KG)", "750", "25"],
      ["HIDROSULFITO DE SODIO (IND-TON/0050KG)", "300", "50"],
      ["DESENGOMANTE (GUA-GAR/0030KG)", "90", "30"],
      ["NEGRO SULFUROSO EXTRA HIGH QUALITY (CHI-SAC/0025KG)", "260", "25"],
    ],
    historial: [
      { estado: "En Ruta", hora: "08:20" },
      { estado: "Entregado", hora: "11:10" },
    ],
    entregas: [
      { cliente: "Cliente uno", sector: "", totalKg: "1500", orden: 1 },
      { cliente: "Cliente dos", sector: "", totalKg: "750", orden: 2 },
      { cliente: "Cliente tres", sector: "", totalKg: "390", orden: 3 },
      { cliente: "Cliente cuatro", sector: "", totalKg: "260", orden: 4 },
    ],
  },
  {
    tipo: "pedido",
    numero: 1,
    estado: "Despachado",
    programada: "09:00",
    lineas: [
      ["SODA ASH (CHI-SAC/0025KG)", "150", "25"],
      ["SULFATO DE MAGNESIO (CHI-SAC/0025KG)", "100", "25"],
    ],
    historial: [{ estado: "Despachado", hora: "08:05" }],
  },
  {
    tipo: "ruta",
    numero: 2,
    estado: "En Ruta",
    programada: "10:00",
    camion: "Camión 2",
    piloto: "ejemplo.07",
    lineas: [
      ["SODA CAUSTICA (POL-SAC/0025KG)", "1250", "25"],
      ["SULFURO DE SODIO (TUR-SAC/0025KG)", "750", "25"],
      ["EXTRACTO DE MIMOSA ME (SUD-SAC/0020KG)", "400", "20"],
      ["CLARIFICANTE (CHI-GAR/0020KG)", "120", "20"],
    ],
    historial: [{ estado: "En Ruta", hora: "09:20" }],
  },
] as const;

async function principal() {
  try {
    if (process.argv[2] === "limpiar") {
      const ids = JSON.parse(process.argv[3]!) as number[];
      await bd.historialEstado.deleteMany({ where: { envioId: { in: ids } } });
      await bd.entregaRuta.deleteMany({ where: { envioId: { in: ids } } });
      await bd.envio.deleteMany({ where: { id: { in: ids } } });
      return;
    }

    const usuario = await bd.usuario.findUniqueOrThrow({ where: { username: "ambos.ejemplo.01" } });
    const camiones = await bd.camion.findMany({
      where: { sedeId: 1, identificacion: { in: ["Camión 1", "Camión 2"] } },
    });
    const camionPorNombre = new Map(camiones.map((camion) => [camion.identificacion, camion.id]));
    const pilotos = await bd.usuario.findMany({
      where: { displayUsername: { in: ["ejemplo.06", "ejemplo.07"] }, sistema: "picking" },
    });
    const pilotoPorUsuario = new Map(pilotos.map((piloto) => [piloto.displayUsername, piloto.id]));
    const estados = await bd.estadoEnvio.findMany({
      where: { nombre: { in: ["En Ruta", "Entregado", "Despachado"] } },
    });
    const estadoPorNombre = new Map(estados.map((estado) => [estado.nombre, estado.id]));
    const ids: number[] = [];

    for (const envio of envios) {
      const creado = await bd.envio.create({
        data: {
          tipo: envio.tipo,
          sedeId: 1,
          numero: envio.numero,
          fechaEnvio: new Date(`${fecha}T00:00:00Z`),
          programadoPara: instante(envio.programada),
          estadoId: estadoPorNombre.get(envio.estado)!,
          enviadoPorId: usuario.id,
          camionId: envio.tipo === "ruta" ? camionPorNombre.get(envio.camion!) : null,
          pilotoId: envio.tipo === "ruta" ? pilotoPorUsuario.get(envio.piloto!) : null,
          lineas: {
            create: envio.lineas.map(([producto, cantidadKg, pesoConversionKg], i) => ({
              producto,
              lote: "",
              cantidadKg,
              pesoConversionKg,
              posicion: i + 1,
            })),
          },
          historial: {
            create: envio.historial.map(({ estado, hora }) => ({
              estadoId: estadoPorNombre.get(estado)!,
              usuarioId: usuario.id,
              creadoEn: instante(hora),
            })),
          },
          entregas: "entregas" in envio ? { create: [...envio.entregas] } : undefined,
        },
      });
      ids.push(creado.id);
    }
    const registrosBitacora = [
      {
        sistema: "picking",
        operacion: "Cambio de estado",
        entidad: "envio",
        registroId: `JC06-${fecha}-picking`,
        usuarioId: usuario.id,
        detalle: `Quetzaltenango · Ruta 2 del ${formatoFecha(fecha)} pasa a En Ruta`,
        creadoEn: instante("09:20"),
      },
      {
        sistema: "sitio",
        operacion: "Inicio de sesión",
        entidad: "usuario",
        registroId: `JC06-${fecha}-sitio`,
        usuarioId: usuario.id,
        usuarioEscrito: "ejemplo.01",
        detalle: {},
        creadoEn: instante("11:10"),
      },
    ] as const;
    for (const registro of registrosBitacora)
      if (!(await bd.bitacora.findFirst({ where: { registroId: registro.registroId } })))
        await bd.bitacora.create({ data: registro });
    console.log(JSON.stringify(ids));
  } finally {
    await bd.$disconnect();
  }
}

principal().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
