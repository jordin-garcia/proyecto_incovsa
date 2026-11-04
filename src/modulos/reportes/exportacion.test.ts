import pdfmake from "pdfmake";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { beforeEach, expect, it, vi } from "vitest";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import type { SesionActual } from "@/lib/sesion";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { GET } from "@/app/api/reportes/exportar/route";

let sesion: SesionActual | null = null;
let sedeSeleccionada: SesionActual["sedes"][number] | null = null;
vi.mock("@/lib/sesion", () => ({ obtenerSesion: async () => sesion }));
vi.mock("@/modulos/permisos/sede", () => ({ obtenerSedeDeTrabajo: async () => sedeSeleccionada }));

const sede = { id: 1, nombre: "Quetzaltenango", prefijoOdoo: "XE" };
const parametros = {
  tipo: "dia",
  referencia: "2026-10-25",
};

function solicitud(pestana: string, formato: string, sobreescribir: Record<string, string> = {}) {
  const consulta = new URLSearchParams({ ...parametros, pestana, formato, ...sobreescribir });
  return new Request(`http://localhost/api/reportes/exportar?${consulta}`);
}

function tituloCodificadoPdf(titulo: string) {
  const littleEndian = Buffer.from(titulo, "utf16le");
  const bigEndian = Buffer.alloc(littleEndian.length + 2);
  bigEndian.set([0xfe, 0xff]);
  for (let indice = 0; indice < littleEndian.length; indice += 2) {
    bigEndian[indice + 2] = littleEndian[indice + 1]!;
    bigEndian[indice + 3] = littleEndian[indice]!;
  }
  return bigEndian;
}

async function crearDatos() {
  const usuario = await prisma.usuario.create({
    data: {
      id: "jc07-reportes",
      name: "Cuenta de reportes",
      username: "jc07-reportes",
      displayUsername: "jc07-reportes",
      email: "jc07-reportes@example.test",
      rol: "Consulta",
      sistema: "picking",
    },
  });
  sesion = {
    sistema: "picking",
    usuario: { id: usuario.id, usuario: usuario.displayUsername, nombre: usuario.name, rol: usuario.rol },
    permisos: ["pk.reportes"],
    sedes: [sede],
  };
  sedeSeleccionada = sede;

  const estado = await prisma.estadoEnvio.findUniqueOrThrow({ where: { nombre: "En Ruta" } });
  await prisma.envio.create({
    data: {
      sedeId: sede.id,
      tipo: "ruta",
      numero: 7,
      fechaEnvio: new Date("2026-10-25T00:00:00.000Z"),
      programadoPara: new Date("2026-10-25T19:30:00.000Z"),
      estadoId: estado.id,
      enviadoPorId: usuario.id,
      lineas: {
        create: {
          producto: "PRODUCTO DE PRUEBA",
          lote: "JC07",
          cantidadKg: "50.375",
          pesoConversionKg: "25",
          posicion: 1,
        },
      },
      historial: {
        create: {
          estadoId: estado.id,
          usuarioId: usuario.id,
          creadoEn: new Date("2026-10-25T15:00:00.000Z"),
        },
      },
    },
  });
  await prisma.bitacora.create({
    data: {
      sistema: "sitio",
      operacion: "Inicio de sesión",
      entidad: "usuario",
      usuarioEscrito: "persona-de-prueba",
      detalle: {},
      creadoEn: new Date("2026-10-25T15:00:00.000Z"),
    },
  });
}

beforeEach(async () => {
  await limpiarTablasDeNegocio();
  await crearDatos();
});

it("RF-SL-38 / CAM-96: descarga los seis archivos con una sola hoja o un PDF titulado y con su nombre", async () => {
  const fetchRemoto = vi.spyOn(globalThis, "fetch");
  const nombres = {
    despacho: "despacho-quetzaltenango-25-10-2026",
    rutas: "rutas-realizadas-quetzaltenango-25-10-2026",
    bitacora: "bitacora-25-10-2026",
  };
  const titulos = { despacho: "Despacho diario", rutas: "Rutas realizadas", bitacora: "Bitácora" };

  try {
    for (const pestana of ["despacho", "rutas", "bitacora"] as const) {
      for (const formato of ["xlsx", "pdf"] as const) {
        const respuesta = await GET(solicitud(pestana, formato));
        expect(respuesta.status).toBe(200);
        expect(respuesta.headers.get("Content-Disposition")).toContain(`${nombres[pestana]}.${formato}`);
        expect(respuesta.headers.get("Cache-Control")).toContain("no-store");
        const archivo = Buffer.from(await respuesta.arrayBuffer());

        if (formato === "pdf") {
          expect(respuesta.headers.get("Content-Type")).toContain("application/pdf");
          expect(archivo.subarray(0, 5).toString("ascii")).toBe("%PDF-");
          expect(
            archivo.includes(Buffer.from(titulos[pestana]!, "latin1")) ||
              archivo.includes(tituloCodificadoPdf(titulos[pestana]!)),
          ).toBe(true);
          continue;
        }

        expect(respuesta.headers.get("Content-Type")).toContain("spreadsheetml.sheet");
        const libro = XLSX.read(archivo, { type: "buffer" });
        expect(libro.SheetNames).toHaveLength(1);
        const hoja = libro.Sheets[libro.SheetNames[0]!]!;
        const filas = XLSX.utils.sheet_to_json<unknown[]>(hoja, { header: 1, raw: false, defval: "" });
        const encabezado = pestana === "bitacora" ? ["Periodo", "25/10/2026"] : ["Sede", "Quetzaltenango"];
        expect(filas[0]!.slice(0, encabezado.length)).toEqual(encabezado);
        expect(filas[0]!.slice(encabezado.length).every((celda) => celda === "")).toBe(true);

        if (pestana === "despacho") {
          expect(filas).toContainEqual(["Periodo", "25/10/2026", ""]);
          expect(filas).toContainEqual(["Kilogramos despachados", "50.375", "rutas y pedidos cerrados en Bodega"]);
          expect(filas).toContainEqual(["Unidades completas", "2", "más 0.375 kg sueltos"]);
          expect(filas).toContainEqual(["Rutas y pedidos cerrados", "1", "1 rutas · 0 pedidos"]);
          expect(filas).toContainEqual(["Rutas entregadas", "0", "en el periodo"]);
          expect(filas).toContainEqual(["Producto", "Cantidad (kg)", "Unidades"]);
          expect(filas).toContainEqual(["PRODUCTO DE PRUEBA", "50.375", "2 unidades + 0.375 kg ÷ 25"]);
          expect(filas).toContainEqual(["Total del periodo", "50.375", "2 unidades + 0.375 kg"]);
        } else if (pestana === "rutas") {
          expect(filas).toContainEqual([
            "Ruta",
            "Fecha",
            "Programada",
            "Camión",
            "Piloto",
            "Total (kg)",
            "Estado",
            "Recorrido",
          ]);
          expect(filas).toContainEqual([
            "7",
            "25/10/2026",
            "25/10/2026 · 13:30",
            "—",
            "—",
            "50.375",
            "En Ruta",
            "Se guarda al entregar",
          ]);
        } else {
          expect(filas).toContainEqual(["Fecha", "Usuario", "Operación", "Detalle"]);
          expect(filas).toContainEqual([
            "25/10/2026 · 09:00",
            "persona-de-prueba",
            "Inicio de sesión",
            "Sitio web · persona-de-prueba",
          ]);
        }
      }
    }
    expect(fetchRemoto).not.toHaveBeenCalled();
  } finally {
    fetchRemoto.mockRestore();
  }
});

it("RF-SL-38: el total del despacho conserva unidades y kilogramos cuando el resto es cero", async () => {
  const linea = await prisma.lineaPreparacion.findFirstOrThrow();
  await prisma.lineaPreparacion.update({ where: { id: linea.id }, data: { cantidadKg: "50.000" } });

  const respuesta = await GET(solicitud("despacho", "xlsx"));
  expect(respuesta.status).toBe(200);
  const libro = XLSX.read(Buffer.from(await respuesta.arrayBuffer()), { type: "buffer" });
  const filas = XLSX.utils.sheet_to_json<unknown[]>(libro.Sheets[libro.SheetNames[0]!]!, {
    header: 1,
    raw: false,
    defval: "",
  });
  expect(filas).toContainEqual(["Total del periodo", "50", "2 unidades + 0 kg"]);
});

it("RF-SL-38 / RNF-08: la ruta rechaza sesiones, permisos y sedes no autorizadas", async () => {
  sesion = null;
  const sinSesion = await GET(solicitud("despacho", "xlsx"));
  expect(sinSesion.status).toBe(403);
  expect(sinSesion.headers.get("Content-Disposition")).toBeNull();

  sesion = {
    sistema: "picking",
    usuario: { id: "jc07-reportes", usuario: "jc07-reportes", nombre: "Cuenta de reportes", rol: "Consulta" },
    permisos: [],
    sedes: [sede],
  };
  const sinPermiso = await GET(solicitud("despacho", "xlsx"));
  expect(sinPermiso.status).toBe(403);
  expect(sinPermiso.headers.get("Content-Disposition")).toBeNull();

  sesion.permisos = ["pk.reportes"];
  sedeSeleccionada = { id: 2, nombre: "Sede ajena", prefijoOdoo: "ZZ" };
  const deOtraSede = await GET(solicitud("despacho", "xlsx"));
  expect(deOtraSede.status).toBe(403);
  expect(deOtraSede.headers.get("Content-Disposition")).toBeNull();
  sedeSeleccionada = sede;
  expect((await GET(solicitud("despacho", "csv"))).status).toBe(400);
});

it("RF-SL-38 / H-75: el nombre conserva las fechas del rango", async () => {
  for (const formato of ["xlsx", "pdf"]) {
    const respuesta = await GET(
      solicitud("despacho", formato, { tipo: "rango", desde: "2026-10-01", hasta: "2026-10-31" }),
    );
    expect(respuesta.status).toBe(200);
    expect(respuesta.headers.get("Content-Disposition")).toContain(
      `despacho-quetzaltenango-del-01-10-2026-al-31-10-2026.${formato}`,
    );
  }
});
it("RF-SL-38 / H-75 / H-76 / D-10: PDF con sede, periodo, tabla, logotipo fijo y fuente negrita real", async () => {
  const crear = vi.spyOn(pdfmake, "createPdf");
  try {
    const respuesta = await GET(solicitud("despacho", "pdf"));
    expect(respuesta.status).toBe(200);
    const archivo = Buffer.from(await respuesta.arrayBuffer());
    expect(archivo.toString("latin1")).toContain("Figtree-Bold");
    expect(archivo.toString("latin1")).toContain("JetBrainsMono-Bold");
    const documento = crear.mock.calls[0]![0];
    const texto = JSON.stringify(documento);
    for (const valor of [
      "Quetzaltenango",
      "Periodo: 25/10/2026",
      "PRODUCTO DE PRUEBA",
      "Cantidad (kg)",
      "Total del periodo",
    ])
      expect(texto).toContain(valor);
    const logo = await sharp(await readFile("public/marca/incovsa-quimicos.webp"))
      .png()
      .toBuffer();
    expect(texto).toContain(`data:image/png;base64,${logo.toString("base64")}`);
    expect((documento as { styles: unknown }).styles).toMatchObject({
      titulo: { bold: true },
      cabeceraTabla: { bold: true },
      total: { bold: true },
      totalMono: { bold: true, font: "JetBrainsMono" },
    });
  } finally {
    crear.mockRestore();
  }
});
