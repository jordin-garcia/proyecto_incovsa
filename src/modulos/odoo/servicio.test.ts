import { spawnSync } from "node:child_process";
import { deflateRawSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as XLSX from "xlsx";
import * as tiposArchivo from "file-type";
import { ErrorNegocio } from "@/lib/errores";
import { convertir } from "@/modulos/conversion/servicio";
import { esquemaFilaOdoo, esquemaResultadoLecturaOdoo } from "./esquemas";
import { leerArchivoOdoo } from "./servicio";

// Conservan las implementaciones reales y permiten observar módulos ESM sin modificar sus exports.
vi.mock("xlsx", { spy: true });
vi.mock("file-type", { spy: true });

const carpeta = new URL("../../../pruebas/fixtures/odoo/", import.meta.url);
const archivo = (nombre: string) => readFileSync(new URL(nombre, carpeta));
const original = archivo("odoo-ejemplo-anonimizado.xlsx");
const libro = XLSX.read(original, { type: "buffer" });
const filas = XLSX.utils.sheet_to_json<unknown[]>(libro.Sheets[libro.SheetNames[0]], {
  header: 1,
  raw: true,
  defval: null,
});
const encabezado = filas[0] as string[];
const columnas = {
  referencia: "Referencia",
  cliente: "Contacto",
  sector: "Contacto/Ciudad",
  estado: "Estado",
  producto: "Movimientos de stock/Producto",
  pesoConversionKg: "Movimientos de stock/Producto/Peso",
  lote: "Movimientos de stock/Números de serie",
  cantidadKg: "Movimientos de stock/Cantidad hecha",
} as const;
type Campo = keyof typeof columnas;
const indice = (campo: Campo) => encabezado.indexOf(columnas[campo]);
const modelo = filas.find((f) => f[indice("referencia")] === "XE-IN/SALIDA/03543")!;
const motivoCantidad = "tienen líneas con la cantidad en 0 o vacía";
const motivoPeso = "tienen líneas con el Peso de Conversión en 0 o vacío (RN-50)";

function fila(cambios: Partial<Record<Campo, unknown>> = {}): unknown[] {
  const copia = [...modelo];
  for (const [campo, valor] of Object.entries(cambios)) copia[indice(campo as Campo)] = valor;
  return copia;
}

function escribir(datos: unknown[][], segundaHoja?: unknown[][]): Buffer {
  const nuevo = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(nuevo, XLSX.utils.aoa_to_sheet(datos), "Sheet1");
  if (segundaHoja) XLSX.utils.book_append_sheet(nuevo, XLSX.utils.aoa_to_sheet(segundaHoja), "Sheet2");
  return XLSX.write(nuevo, { type: "buffer", bookType: "xlsx", compression: true });
}

afterEach(() => vi.clearAllMocks());

describe("Lectura del archivo de Odoo (JC-02)", () => {
  it("RF-SL-51 / RN-35 CP-22: clasifica las 80 referencias y cuenta la agrupación", async () => {
    const resultado = await leerArchivoOdoo(original, "XE");
    expect(resultado.pedidos).toHaveLength(33);
    expect(resultado.noCargados).toHaveLength(46);
    expect(resultado.otrosEstados).toBe(1);
    expect(resultado.filasDeAgrupacion).toBe(1);
    expect(resultado.pedidos.length + resultado.noCargados.length + resultado.otrosEstados).toBe(80);
    expect(esquemaResultadoLecturaOdoo.safeParse(resultado).success).toBe(true);
  });

  it("RN-50 / RF-SL-73 CP-21 CP-23: rechaza los 46 pedidos con peso cero e identifica al cliente", async () => {
    const resultado = await leerArchivoOdoo(original, "XE");
    expect(resultado.noCargados.every((p) => p.motivo === motivoPeso && p.cliente.length > 0)).toBe(true);
    expect(new Set(resultado.noCargados.map((p) => p.numero)).size).toBe(46);
    expect(resultado.pedidos.every((p) => p.lineas.every((l) => l.pesoConversionKg !== "0.000"))).toBe(true);
    expect(resultado.noCargados).toContainEqual({
      numero: "03595",
      cliente: "Cliente de ejemplo 018",
      motivo: motivoPeso,
    });
  });

  it("RN-36 CP-25: conserva 03543 como texto y obtiene Quetzaltenango de XE-IN", async () => {
    const resultado = await leerArchivoOdoo(original, "XE");
    expect(resultado.pedidos.find((p) => p.numero === "03543")).toMatchObject({
      numero: "03543",
      referencia: "XE-IN/SALIDA/03543",
      bodega: "XE",
    });
  });

  it("RN-37 CP-24 CP-26: conserva los datos y las siete líneas de 03543 en su orden", async () => {
    const resultado = await leerArchivoOdoo(original, "XE");
    const pedido = resultado.pedidos.find((p) => p.numero === "03543")!;
    expect(pedido.cliente).toBe("Cliente de ejemplo 003");
    expect(pedido.sector).toBe("San Fransisco el Alto, Totonicapan");
    expect(pedido.lineas).toEqual([
      { producto: "SODA ASH (CHI-SAC/0040KG)", lote: "5287", pesoConversionKg: "25.000", cantidadKg: "120.000" },
      {
        producto: "METABISULFITO DE SODIO (CHI-SAC/0025KG)",
        lote: "1233",
        pesoConversionKg: "25.000",
        cantidadKg: "50.000",
      },
      {
        producto: "SULFATO DE SODIO (CHI-SAC/0050KG)",
        lote: "5283",
        pesoConversionKg: "50.000",
        cantidadKg: "150.000",
      },
      { producto: "SODA CAUSTICA (CHI-SAC/0025KG)", lote: "2239", pesoConversionKg: "25.000", cantidadKg: "50.000" },
      {
        producto: "ACIDO ACETICO (CHI-GAR/0030KG-GLACI)",
        lote: "1234",
        pesoConversionKg: "30.000",
        cantidadKg: "30.000",
      },
      {
        producto: "HIDROSULFITO DE SODIO (CHI-TON/0050KG)",
        lote: "5910",
        pesoConversionKg: "50.000",
        cantidadKg: "50.000",
      },
      {
        producto: "HIPOCLORITO DE CALCIO GRANULAR (CHI-TON/0045KG)",
        lote: "0825",
        pesoConversionKg: "45.000",
        cantidadKg: "45.000",
      },
    ]);
  });

  it("RN-35 / RN-37 CP-22 CP-26: hereda referencia y cliente y solo recorta espacios exteriores", async () => {
    const datos = [
      encabezado,
      fila({ cliente: "  Cliente de ejemplo 003  ", sector: "  San Fransisco el Alto, Totonicapan  ", lote: " 0169 " }),
      fila({
        referencia: null,
        cliente: null,
        sector: null,
        estado: null,
        producto: " SODA ASH (CHI-SAC/0040KG) ",
        lote: null,
      }),
    ];
    const { pedidos } = await leerArchivoOdoo(escribir(datos), "XE");
    expect(pedidos).toHaveLength(1);
    expect(pedidos[0].cliente).toBe("Cliente de ejemplo 003");
    expect(pedidos[0].sector).toBe("San Fransisco el Alto, Totonicapan");
    expect(pedidos[0].lineas.map((l) => l.lote)).toEqual(["0169", ""]);
    expect(pedidos[0].lineas[1].producto).toBe("SODA ASH (CHI-SAC/0040KG)");
  });

  it("RN-35 CP-22: mantiene separados los pedidos del mismo cliente y no deduplica referencias", async () => {
    const { pedidos } = await leerArchivoOdoo(escribir([encabezado, fila(), fila()]), "XE");
    expect(pedidos).toHaveLength(2);
    expect(pedidos.map((p) => p.numero)).toEqual(["03543", "03543"]);
  });

  it("RN-35 CP-22: ignora agrupaciones y filas vacías sin crear pedidos", async () => {
    const agrupacion = fila({ referencia: "agosto 2026 (80)", cliente: null, producto: null });
    const { pedidos, filasDeAgrupacion } = await leerArchivoOdoo(
      escribir([encabezado, agrupacion, [], fila(), []]),
      "XE",
    );
    expect(filasDeAgrupacion).toBe(1);
    expect(pedidos).toHaveLength(1);
    expect(pedidos[0].lineas).toHaveLength(1);
  });

  it("RN-35 CP-22: cuenta otros estados por referencia y no valida su bodega ni sus cantidades", async () => {
    const { pedidos, otrosEstados, noCargados } = await leerArchivoOdoo(
      escribir([
        encabezado,
        fila({ estado: " HeChO " }),
        fila({ referencia: "ZZ-IN/SALIDA/03543", estado: "Cancelado", cantidadKg: null, pesoConversionKg: 0 }),
        fila({ referencia: null, cliente: null, cantidadKg: null }),
      ]),
      "XE",
    );
    expect(pedidos).toHaveLength(1);
    expect(otrosEstados).toBe(1);
    expect(noCargados).toEqual([]);
  });

  it("RNF-05 CP-27: cantidad-invalida.xlsx deja 30 aceptados y tres rechazos adicionales", async () => {
    const resultado = await leerArchivoOdoo(archivo("cantidad-invalida.xlsx"), "XE");
    expect(resultado.pedidos).toHaveLength(30);
    expect(resultado.noCargados.filter((p) => p.motivo === motivoCantidad)).toHaveLength(3);
    expect(resultado.noCargados.filter((p) => p.motivo === motivoPeso)).toHaveLength(46);
  });

  it.each(["cantidadKg", "pesoConversionKg"] as const)(
    "RN-50 / RNF-05 CP-23 CP-27: %s inválido rechaza el pedido completo",
    async (campo) => {
      for (const valor of [null, "", "   ", "diez", 0, -1, "0", "-1", true]) {
        const { pedidos, noCargados } = await leerArchivoOdoo(
          escribir([
            encabezado,
            fila(),
            fila({ referencia: null, cliente: null, [campo]: valor }),
            fila({ referencia: "XE-IN/SALIDA/03544" }),
          ]),
          "XE",
        );
        expect(pedidos.map((p) => p.numero)).toEqual(["03544"]);
        expect(noCargados).toEqual([
          {
            numero: "03543",
            cliente: "Cliente de ejemplo 003",
            motivo: campo === "cantidadKg" ? motivoCantidad : motivoPeso,
          },
        ]);
      }
    },
  );

  it("RN-50 CP-23: sin productos prevalece sobre cantidad y cantidad sobre peso", async () => {
    const resultado = await leerArchivoOdoo(
      escribir([
        encabezado,
        fila({ producto: null, cantidadKg: null, pesoConversionKg: null }),
        fila({ referencia: "XE-IN/SALIDA/03544", cantidadKg: 0, pesoConversionKg: 0 }),
      ]),
      "XE",
    );
    expect(resultado.pedidos).toEqual([]);
    expect(resultado.noCargados.map((p) => p.motivo)).toEqual(["no traen productos", motivoCantidad]);
  });

  it("RNF-05 CP-28: rechaza más de 2 MB antes de detectar el formato o interpretar el libro", async () => {
    const detectar = vi.mocked(tiposArchivo.fileTypeFromBuffer);
    const leer = vi.mocked(XLSX.read);
    await expect(leerArchivoOdoo(Buffer.alloc(2 * 1024 * 1024 + 1), "XE")).rejects.toThrow(
      new ErrorNegocio("El archivo pesa más de 2 MB. No se cargó."),
    );
    expect(detectar).not.toHaveBeenCalled();
    expect(leer).not.toHaveBeenCalled();
  });

  it("RNF-05 CP-28: acepta el límite exacto de 2 MB", async () => {
    const bytes = Buffer.alloc(2 * 1024 * 1024);
    original.copy(bytes);
    expect((await leerArchivoOdoo(bytes, "XE")).pedidos).toHaveLength(33);
  });

  it.each(["no-es-xlsx.xlsx", "vacio", "zip-truncado"])(
    "RNF-05 CP-28: rechaza %s por contenido antes de SheetJS",
    async (nombre) => {
      const bytes =
        nombre === "vacio"
          ? Buffer.alloc(0)
          : nombre === "zip-truncado"
            ? Buffer.from([80, 75, 3, 4])
            : archivo(nombre);
      const leer = vi.mocked(XLSX.read);
      await expect(leerArchivoOdoo(bytes, "XE")).rejects.toThrow(
        new ErrorNegocio("El archivo debe ser .xlsx, exportado de Odoo."),
      );
      expect(leer).not.toHaveBeenCalled();
    },
  );

  it("RNF-05 CP-28: comunica un libro ilegible con el mensaje del prototipo", async () => {
    vi.mocked(XLSX.read).mockImplementationOnce(() => {
      throw new Error("detalle técnico");
    });
    await expect(leerArchivoOdoo(original, "XE")).rejects.toThrow(
      new ErrorNegocio("No se pudo leer el archivo. Verifique que sea el .xlsx exportado de Odoo."),
    );
  });

  it("RNF-05 CP-28: rechaza un Excel binario .xls aunque SheetJS pueda leerlo", async () => {
    const nuevo = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(nuevo, XLSX.utils.aoa_to_sheet([encabezado, fila()]), "Sheet1");
    const bytes = XLSX.write(nuevo, { type: "buffer", bookType: "xls" });
    const leer = vi.mocked(XLSX.read);
    await expect(leerArchivoOdoo(bytes, "XE")).rejects.toThrow("El archivo debe ser .xlsx, exportado de Odoo.");
    expect(leer).not.toHaveBeenCalled();
  });

  it("RNF-05 CP-28: sin-columna-peso.xlsx indica la columna que falta", async () => {
    await expect(leerArchivoOdoo(archivo("sin-columna-peso.xlsx"), "XE")).rejects.toThrow(
      "El archivo no tiene la columna «Movimientos de stock/Producto/Peso». ¿Es el export de salidas de Odoo?",
    );
  });

  it.each(Object.entries(columnas))("RNF-05 CP-28: exige la columna %s", async (_, nombre) => {
    const i = encabezado.indexOf(nombre);
    const datos = [encabezado, fila()].map((f) => f.filter((_, columna) => columna !== i));
    await expect(leerArchivoOdoo(escribir(datos), "XE")).rejects.toThrow(
      `El archivo no tiene la columna «${nombre}». ¿Es el export de salidas de Odoo?`,
    );
  });

  it("RF-SL-50 CP-22: usa los encabezados aunque cambie su orden y solo lee la primera hoja", async () => {
    const seleccion = Object.values(columnas)
      .map((nombre) => encabezado.indexOf(nombre))
      .reverse();
    const datos = [encabezado, fila()].map((f) => seleccion.map((i) => f[i]));
    const bytes = escribir(datos, [encabezado, fila({ referencia: "GT-IN/SALIDA/03543" })]);
    const leer = vi.mocked(XLSX.read);
    const resultado = await leerArchivoOdoo(bytes, "XE");
    expect(resultado.pedidos).toHaveLength(1);
    expect(resultado.pedidos[0].numero).toBe("03543");
    expect(leer).toHaveBeenCalledWith(bytes, expect.objectContaining({ type: "buffer", sheets: 0 }));
  });

  it.each([
    [
      "otra-bodega-gt.xlsx",
      "El archivo es de la bodega de Guatemala y usted está trabajando en Quetzaltenango. Cambie la sede o cargue el archivo correcto. No se cargó nada.",
    ],
    [
      "bodegas-mezcladas.xlsx",
      "El archivo trae referencias de más de una bodega. Cada archivo debe ser de una sola bodega.",
    ],
    [
      "prefijo-desconocido.xlsx",
      "Hay referencias de una bodega que no se reconoce. Se esperan los prefijos XE, GT o ESC.",
    ],
  ])("RN-36 CP-29: %s rechaza el archivo completo con el mensaje aprobado", async (nombre, mensaje) => {
    await expect(leerArchivoOdoo(archivo(nombre), "XE")).rejects.toThrow(new ErrorNegocio(mensaje));
  });

  it("RN-36 CP-29: revisa también la bodega de un pedido Hecho con líneas inválidas", async () => {
    await expect(
      leerArchivoOdoo(
        escribir([encabezado, fila(), fila({ referencia: "ZZ-IN/SALIDA/03544", pesoConversionKg: 0 })]),
        "XE",
      ),
    ).rejects.toThrow("Hay referencias de una bodega que no se reconoce.");
  });

  it("RN-36 CP-29: reconoce el prefijo ESC de Escuintla", async () => {
    const { pedidos } = await leerArchivoOdoo(
      escribir([encabezado, fila({ referencia: "ESC-IN/SALIDA/03543" })]),
      "ESC",
    );
    expect(pedidos[0].bodega).toBe("ESC");
    expect(pedidos[0].numero).toBe("03543");
  });

  it.each([
    [[], "El archivo no trae referencias."],
    [[fila({ estado: "Cancelado" })], "El archivo no trae referencias en estado «Hecho»."],
  ])("RN-35 CP-22: informa cuando no hay referencias utilizables (%#)", async (datos, mensaje) => {
    await expect(leerArchivoOdoo(escribir([encabezado, ...datos]), "XE")).rejects.toThrow(mensaje);
  });

  it("RN-37 CP-24: conserva las cuatro cantidades decimales del archivo en una copia con pesos válidos", async () => {
    // Las cuatro líneas pertenecen a pedidos rechazados por RN-50; solo se cambian los pesos en memoria.
    const copia = filas.map((f, i) => {
      const nueva = [...f];
      if (i > 0 && nueva[indice("producto")]) nueva[indice("pesoConversionKg")] = 25;
      return nueva;
    });
    const { pedidos, noCargados } = await leerArchivoOdoo(escribir(copia), "XE");
    expect(pedidos).toHaveLength(79);
    expect(noCargados).toEqual([]);
    const decimales = pedidos.flatMap((p) => p.lineas).filter((l) => !l.cantidadKg.endsWith(".000"));
    expect(decimales.map((l) => l.cantidadKg)).toEqual(["45.360", "45.360", "204.120", "44.850"]);
  });

  it("RN-37 CP-24: conserva milésimas, admite los separadores del prototipo y entrega decimales a conversión", async () => {
    const { pedidos } = await leerArchivoOdoo(
      escribir([encabezado, fila({ cantidadKg: " 1,234.567 ", pesoConversionKg: "25.125" })]),
      "XE",
    );
    const linea = pedidos[0].lineas[0];
    expect(linea.cantidadKg).toBe("1234.567");
    expect(linea.pesoConversionKg).toBe("25.125");
    expect(convertir(linea.cantidadKg, linea.pesoConversionKg)).toEqual({ unidades: 49, restoKg: 3.442 });
  });

  it("RN-35 CP-22: acepta bytes Uint8Array y repetir la lectura no modifica el archivo ni el resultado", async () => {
    const bytes = new Uint8Array(original);
    const copia = bytes.slice();
    const primera = await leerArchivoOdoo(bytes, "XE");
    const segunda = await leerArchivoOdoo(bytes, "XE");
    expect(bytes).toEqual(copia);
    expect(segunda).toEqual(primera);
    expect(segunda.pedidos).toHaveLength(33);
  });

  it("RNF-05 CP-27: los esquemas distinguen una fila inválida del resultado final aceptado", () => {
    const datos = {
      referencia: "XE-IN/SALIDA/03543",
      cliente: "Cliente de ejemplo 003",
      sector: "",
      estado: "Hecho",
      producto: "SODA ASH (CHI-SAC/0040KG)",
      lote: null,
      cantidadKg: "diez",
      pesoConversionKg: 25,
    };
    const leida = esquemaFilaOdoo.parse(datos);
    expect(leida.cantidadKg).toBeNull();
    expect(leida.pesoConversionKg).toBe("25.000");
    expect(leida.lote).toBe("");
    expect(
      esquemaResultadoLecturaOdoo.safeParse({ pedidos: [], noCargados: [], otrosEstados: -1, filasDeAgrupacion: 0 })
        .success,
    ).toBe(false);
    expect(
      esquemaResultadoLecturaOdoo.safeParse({
        pedidos: [
          {
            numero: "03543",
            referencia: datos.referencia,
            bodega: "XE",
            cliente: datos.cliente,
            sector: "",
            lineas: [{ producto: datos.producto, lote: "", cantidadKg: "0.000", pesoConversionKg: "25.000" }],
          },
        ],
        noCargados: [],
        otrosEstados: 0,
        filasDeAgrupacion: 0,
      }).success,
    ).toBe(false);
  });
});

describe("Límites de Odoo (JC-10)", () => {
  const mensaje = "No se pudo leer el archivo. Verifique que sea el .xlsx exportado de Odoo.";

  // ZIP mínimo generado en memoria: permite falsear tamaños sin archivos peligrosos en disco.
  function zip(tamanos: number[], declarado?: number): Buffer {
    const locales: Buffer[] = [];
    const centrales: Buffer[] = [];
    let offset = 0;
    for (const tamano of tamanos) {
      const nombre = Buffer.from(`xl/entrada-${offset}`);
      const datos = deflateRawSync(Buffer.alloc(tamano));
      const local = Buffer.alloc(30);
      local.writeUInt32LE(0x04034b50);
      local.writeUInt16LE(8, 8);
      local.writeUInt32LE(datos.length, 18);
      local.writeUInt32LE(declarado ?? tamano, 22);
      local.writeUInt16LE(nombre.length, 26);
      const central = Buffer.alloc(46);
      central.writeUInt32LE(0x02014b50);
      central.writeUInt16LE(8, 10);
      central.writeUInt32LE(datos.length, 20);
      central.writeUInt32LE(declarado ?? tamano, 24);
      central.writeUInt16LE(nombre.length, 28);
      central.writeUInt32LE(offset, 42);
      locales.push(local, nombre, datos);
      centrales.push(central, nombre);
      offset += local.length + nombre.length + datos.length;
    }
    const directorio = Buffer.concat(centrales);
    const fin = Buffer.alloc(22);
    fin.writeUInt32LE(0x06054b50);
    fin.writeUInt16LE(tamanos.length, 8);
    fin.writeUInt16LE(tamanos.length, 10);
    fin.writeUInt32LE(directorio.length, 12);
    fin.writeUInt32LE(offset, 16);
    return Buffer.concat([...locales, directorio, fin]);
  }

  it.each([
    [[50 * 1024 * 1024 + 1], undefined],
    [[26 * 1024 * 1024, 26 * 1024 * 1024], undefined],
    [Array(101).fill(1), undefined],
    [[1000], 1],
    [[50 * 1024 * 1024 + 1], 1],
  ] as [number[], number | undefined][])(
    "ASVS V5.2.3: rechaza ZIP peligroso antes de SheetJS (%#)",
    async (tamanos, declarado) => {
      const bytes = zip(tamanos, declarado);
      expect(bytes.length).toBeLessThan(2 * 1024 * 1024);
      vi.mocked(tiposArchivo.fileTypeFromBuffer).mockResolvedValueOnce({
        ext: "xlsx",
        mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      await expect(leerArchivoOdoo(bytes, "XE")).rejects.toThrow(new ErrorNegocio(mensaje));
      expect(XLSX.read).not.toHaveBeenCalled();
    },
  );

  it("ASVS V5.2.3: la bomba con tamaño falseado no aumenta la memoria en más de 50 MB", async () => {
    const bomba = zip([50 * 1024 * 1024 + 1], 1);
    const finOriginal = original.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
    const inicioOriginal = original.readUInt32LE(finOriginal + 16);
    const finBomba = bomba.length - 22;
    const inicioBomba = bomba.readUInt32LE(finBomba + 16);
    const centralBomba = Buffer.from(bomba.subarray(inicioBomba, finBomba));
    centralBomba.writeUInt32LE(inicioOriginal, 42);
    const fin = Buffer.from(original.subarray(finOriginal, finOriginal + 22));
    const cantidad = original.readUInt16LE(finOriginal + 10) + 1;
    fin.writeUInt16LE(cantidad, 8);
    fin.writeUInt16LE(cantidad, 10);
    fin.writeUInt32LE(finOriginal - inicioOriginal + centralBomba.length, 12);
    fin.writeUInt32LE(inicioOriginal + inicioBomba, 16);
    const bytes = Buffer.concat([
      original.subarray(0, inicioOriginal),
      bomba.subarray(0, inicioBomba),
      original.subarray(inicioOriginal, finOriginal),
      centralBomba,
      fin,
    ]);
    expect((await tiposArchivo.fileTypeFromBuffer(bytes))?.ext).toBe("xlsx");
    const codigo = `
      import { leerArchivoOdoo } from ${JSON.stringify(new URL("./servicio.ts", import.meta.url).href)};
      const partes = [];
      for await (const bloque of process.stdin) partes.push(bloque);
      const bytes = Buffer.concat(partes);
      global.gc();
      const inicial = process.memoryUsage().rss;
      let pico = inicial;
      const medir = () => { pico = Math.max(pico, process.memoryUsage().rss); };
      const intervalo = setInterval(medir, 1);
      let mensaje;
      try { await leerArchivoOdoo(bytes, "XE"); } catch (error) { mensaje = error.message; }
      medir(); clearInterval(intervalo);
      console.log(JSON.stringify({ incremento: pico - inicial, mensaje }));
    `;
    const proceso = spawnSync(
      process.execPath,
      ["--expose-gc", "--import", "tsx", "--input-type=module", "-e", codigo],
      { input: bytes, encoding: "utf8", timeout: 30000 },
    );
    expect(proceso.status, proceso.stderr).toBe(0);
    const resultado = JSON.parse(proceso.stdout);
    expect(resultado.mensaje).toBe(mensaje);
    expect(resultado.incremento).toBeLessThanOrEqual(50 * 1024 * 1024);
  }, 30000);

  it("RNF-05: lee completas 20 000 filas y rechaza 20 001", async () => {
    const datos = [
      encabezado,
      fila(),
      ...Array.from({ length: 19998 }, () =>
        fila({
          referencia: null,
          cliente: null,
          sector: null,
          estado: null,
          producto: "P",
          lote: "",
          cantidadKg: 1,
          pesoConversionKg: 1,
        }),
      ),
    ];
    expect((await leerArchivoOdoo(escribir(datos), "XE")).pedidos[0].lineas).toHaveLength(19999);
    await expect(leerArchivoOdoo(escribir([...datos, fila()]), "XE")).rejects.toThrow(new ErrorNegocio(mensaje));
  }, 30000);

  it.each([
    ["referencia", "XE-IN/SALIDA/" + "1".repeat(29)],
    ["referencia", "XE-IN/SALIDA/" + "1".repeat(21)],
    ["cliente", "a".repeat(201)],
    ["sector", "a".repeat(201)],
    ["producto", "a".repeat(201)],
    ["lote", "a".repeat(41)],
  ] as [Campo, string][])("RNF-05: rechaza largo excesivo en %s (%#)", async (campo, valor) => {
    await expect(leerArchivoOdoo(escribir([encabezado, fila({ [campo]: valor })]), "XE")).rejects.toThrow(
      new ErrorNegocio(mensaje),
    );
  });
});

it("RNF-05: ignora agrupaciones de hasta 40 caracteres sin tratarlas como número", async () => {
  const resultado = await leerArchivoOdoo(
    escribir([encabezado, fila({ referencia: "a".repeat(40), cliente: null, producto: null }), fila()]),
    "XE",
  );
  expect(resultado.filasDeAgrupacion).toBe(1);
  expect(resultado.pedidos).toHaveLength(1);
});

it("RNF-05: rechaza filas excesivas aunque la dimensión declarada sea menor", async () => {
  const datos = [encabezado, fila(), ...Array.from({ length: 19999 }, () => ["x"])];
  const zip = XLSX.CFB.read(escribir(datos), { type: "buffer" });
  const hoja = zip.FileIndex.find(
    (entrada: { name: string; content: Uint8Array; size: number }) => entrada.name === "sheet1.xml",
  )!;
  const xml = Buffer.from(hoja.content as Uint8Array)
    .toString()
    .replace(/<dimension ref="[^"]*"\/>/, '<dimension ref="A1:A2"/>');
  hoja.content = Buffer.from(xml);
  hoja.size = hoja.content.length;
  const bytes = XLSX.CFB.write(zip, { type: "buffer", fileType: "zip", compression: true });
  await expect(leerArchivoOdoo(bytes, "XE")).rejects.toThrow(
    new ErrorNegocio("No se pudo leer el archivo. Verifique que sea el .xlsx exportado de Odoo."),
  );
}, 30000);

it("RNF-05: rechaza una celda aislada después del límite con dimensión falseada", async () => {
  const datos = [encabezado, fila()];
  const zip = XLSX.CFB.read(escribir(datos), { type: "buffer" });
  const hoja = zip.FileIndex.find(
    (entrada: { name: string; content: Uint8Array; size: number }) => entrada.name === "sheet1.xml",
  )!;
  const xml = Buffer.from(hoja.content as Uint8Array)
    .toString()
    .replace(/<dimension ref="[^"]*"\/>/, '<dimension ref="A1:A2"/>')
    .replace("</sheetData>", '<row r="20002"><c r="A20002" t="str"><v>producto</v></c></row></sheetData>');
  hoja.content = Buffer.from(xml);
  hoja.size = hoja.content.length;
  const bytes = XLSX.CFB.write(zip, { type: "buffer", fileType: "zip", compression: true });
  await expect(leerArchivoOdoo(bytes, "XE")).rejects.toThrow(
    new ErrorNegocio("No se pudo leer el archivo. Verifique que sea el .xlsx exportado de Odoo."),
  );
});

it("RNF-05: no cuenta etiquetas de filas dentro de comentarios XML", async () => {
  const zip = XLSX.CFB.read(escribir([encabezado, fila()]), { type: "buffer" });
  const hoja = zip.FileIndex.find(
    (entrada: { name: string; content: Uint8Array; size: number }) => entrada.name === "sheet1.xml",
  )!;
  const xml = Buffer.from(hoja.content as Uint8Array)
    .toString()
    .replace("</sheetData>", '<!-- <row r="99999"><c r="A99999"/></row> --></sheetData>');
  hoja.content = Buffer.from(xml);
  hoja.size = hoja.content.length;
  const bytes = XLSX.CFB.write(zip, { type: "buffer", fileType: "zip", compression: true });
  expect((await leerArchivoOdoo(bytes, "XE")).pedidos).toHaveLength(1);
});
