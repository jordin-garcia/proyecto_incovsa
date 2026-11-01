import { posix } from "node:path";
import { createInflateRaw } from "node:zlib";
import { fileTypeFromBuffer } from "file-type";
import { read, utils, type WorkBook } from "xlsx";
import { ErrorNegocio } from "@/lib/errores";
import {
  esquemaBodegaOdoo,
  esquemaEntradaLecturaOdoo,
  esquemaFilaOdoo,
  esquemaLineaPedidoFacturadoLeido,
  esquemaResultadoLecturaOdoo,
  motivosNoCargados,
  type BodegaOdoo,
  type FilaOdoo,
  type ResultadoLecturaOdoo,
} from "./esquemas";

const nombresBodega: Record<BodegaOdoo, string> = {
  XE: "Quetzaltenango",
  GT: "Guatemala",
  ESC: "Escuintla",
};

const columnasOdoo = {
  referencia: "Referencia",
  cliente: "Contacto",
  sector: "Contacto/Ciudad",
  estado: "Estado",
  producto: "Movimientos de stock/Producto",
  pesoConversionKg: "Movimientos de stock/Producto/Peso",
  lote: "Movimientos de stock/Números de serie",
  cantidadKg: "Movimientos de stock/Cantidad hecha",
} as const satisfies Record<keyof FilaOdoo, string>;

type ReferenciaLeida = Pick<FilaOdoo, "referencia" | "cliente" | "sector" | "estado"> & {
  lineas: Pick<FilaOdoo, "producto" | "lote" | "pesoConversionKg" | "cantidadKg">[];
};

const mensajeArchivoIlegible = "No se pudo leer el archivo. Verifique que sea el .xlsx exportado de Odoo.";
const maximoDescomprimido = 50 * 1024 * 1024;

/** Valida el mismo directorio y los encabezados locales que consumirá SheetJS. */
async function comprobarZip(bytes: Uint8Array): Promise<void> {
  try {
    const zip = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const fin = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
    if (fin < 0 || fin + 22 > zip.length) throw new Error("Sin directorio");
    const cantidad = zip.readUInt16LE(fin + 10);
    const inicio = zip.readUInt32LE(fin + 16);
    const limite = inicio + zip.readUInt32LE(fin + 12);
    if (zip.readUInt32LE(fin + 4) !== 0 || cantidad !== zip.readUInt16LE(fin + 8) || cantidad > 100 || limite !== fin) {
      throw new Error("Directorio inválido");
    }
    let cursor = inicio;
    let total = 0;
    for (let i = 0; i < cantidad; i++) {
      if (cursor + 46 > limite || zip.readUInt32LE(cursor) !== 0x02014b50) throw new Error("Entrada inválida");
      const comprimido = zip.readUInt32LE(cursor + 20);
      const declarado = zip.readUInt32LE(cursor + 24);
      const nombre = zip.readUInt16LE(cursor + 28);
      const extra = zip.readUInt16LE(cursor + 30);
      const siguiente = cursor + 46 + nombre + extra + zip.readUInt16LE(cursor + 32);
      const local = zip.readUInt32LE(cursor + 42);
      const metodo = zip.readUInt16LE(cursor + 10);
      const banderas = zip.readUInt16LE(cursor + 8);
      if (
        siguiente > limite ||
        local + 30 > inicio ||
        zip.readUInt32LE(local) !== 0x04034b50 ||
        zip.readUInt16LE(cursor + 34) !== 0 ||
        banderas & 0x2041 ||
        zip.readUInt16LE(local + 6) !== banderas ||
        zip.readUInt16LE(local + 8) !== metodo ||
        zip.readUInt16LE(local + 26) !== nombre
      )
        throw new Error("Encabezado inválido");
      const extraLocal = zip.readUInt16LE(local + 28);
      const datos = local + 30 + nombre + extraLocal;
      if (
        datos + comprimido > inicio ||
        declarado > maximoDescomprimido - total ||
        !zip.subarray(cursor + 46, cursor + 46 + nombre).equals(zip.subarray(local + 30, local + 30 + nombre))
      ) {
        throw new Error("Tamaño inválido");
      }
      // ZIP64 no es necesario para archivos de 2 MB; impedir que sobrescriba los tamaños comprobados.
      for (const [desde, longitud] of [
        [cursor + 46 + nombre, extra],
        [local + 30 + nombre, extraLocal],
      ]) {
        const hasta = desde + longitud;
        if (hasta > (desde >= inicio ? limite : inicio)) throw new Error("Extra inválido");
        let posicion = desde;
        while (posicion < hasta) {
          if (posicion + 4 > hasta || zip.readUInt16LE(posicion) === 1) throw new Error("Extra inválido");
          posicion += 4 + zip.readUInt16LE(posicion + 2);
        }
        if (posicion !== hasta) throw new Error("Extra truncado");
      }
      if (
        !(banderas & 8) &&
        (zip.readUInt32LE(local + 18) !== comprimido || zip.readUInt32LE(local + 22) !== declarado)
      ) {
        throw new Error("Tamaños inconsistentes");
      }
      if (banderas & 8) {
        const localComprimido = zip.readUInt32LE(local + 18);
        const localReal = zip.readUInt32LE(local + 22);
        if ((localComprimido !== 0 && localComprimido !== comprimido) || (localReal !== 0 && localReal !== declarado)) {
          throw new Error("Tamaños locales inconsistentes");
        }
        let descriptor = datos + comprimido;
        if (descriptor + 4 <= inicio && zip.readUInt32LE(descriptor) === 0x08074b50) descriptor += 4;
        if (
          descriptor + 12 > inicio ||
          zip.readUInt32LE(descriptor + 4) !== comprimido ||
          zip.readUInt32LE(descriptor + 8) !== declarado
        ) {
          throw new Error("Descriptor inválido");
        }
      }
      const entrada = zip.subarray(datos, datos + comprimido);
      let real = 0;
      if (metodo === 0) real = entrada.length;
      else if (metodo === 8) {
        // Contar y descartar bloques evita reunir hasta 50 MB en un búfer de salida.
        const flujo = createInflateRaw({ chunkSize: 16 * 1024 });
        flujo.end(entrada);
        for await (const bloque of flujo) {
          real += (bloque as Buffer).length;
          if (real > declarado || real > maximoDescomprimido - total) {
            flujo.destroy();
            throw new Error("Tamaño real excesivo");
          }
        }
      } else throw new Error("Compresión no admitida");
      if (real !== declarado || total + real > maximoDescomprimido) throw new Error("Tamaño real inválido");
      total += real;
      cursor = siguiente;
    }
    if (cursor !== limite) throw new Error("Directorio incompleto");
  } catch {
    throw new ErrorNegocio(mensajeArchivoIlegible);
  }
}

async function comprobarArchivo(bytes: Uint8Array): Promise<void> {
  if (bytes.byteLength > 2 * 1024 * 1024) {
    throw new ErrorNegocio("El archivo pesa más de 2 MB. No se cargó.");
  }
  let esXlsx = false;
  try {
    const formato = await fileTypeFromBuffer(bytes);
    esXlsx = formato?.ext === "xlsx";
  } catch {
    // Un ZIP incompleto tampoco es un .xlsx válido; no se llega a SheetJS.
  }
  if (!esXlsx) throw new ErrorNegocio("El archivo debe ser .xlsx, exportado de Odoo.");
  await comprobarZip(bytes);
}

/** bookFiles conserva el XML completo aunque sheetRows omita celdas alejadas. */
function comprobarFilasReales(libro: WorkBook): void {
  const crudo = libro as WorkBook & {
    Directory: { workbooks: string[] };
    files: Record<string, { content: Uint8Array }>;
    Workbook: { Sheets: { id?: string; strRelID?: string }[] };
  };
  const texto = (ruta: string) => Buffer.from(crudo.files[ruta.replace(/^\//, "")].content).toString("utf8");
  const atributo = (etiqueta: string, nombre: string) => {
    const valor = new RegExp(`(?:^|\\s)${nombre}\\s*=\\s*["']([^"']*)["']`).exec(etiqueta)?.[1];
    return valor?.replace(/&(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);/gi, (entidad) => {
      const conocidas: Record<string, string> = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&apos;": "'",
      };
      return (
        conocidas[entidad] ??
        String.fromCodePoint(entidad[2] === "x" ? parseInt(entidad.slice(3), 16) : parseInt(entidad.slice(2), 10))
      );
    });
  };
  const libroRuta = crudo.Directory.workbooks[0].replace(/^\//, "");
  const relaciones = texto(posix.join(posix.dirname(libroRuta), "_rels", posix.basename(libroRuta) + ".rels")).replace(
    /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>/g,
    "",
  );
  const primera = crudo.Workbook.Sheets[0];
  const coincidencias = [...relaciones.matchAll(/<(?:[\w]+:)?Relationship\b[^>]*>/g)].filter(
    ([etiqueta]) => atributo(etiqueta, "Id") === (primera.id ?? primera.strRelID),
  );
  if (coincidencias.length !== 1) throw new Error("Relación de hoja ambigua");
  const destino = atributo(coincidencias[0][0], "Target");
  if (!destino) throw new Error("Sin primera hoja");
  const ruta = destino.startsWith("/") ? destino : posix.join(posix.dirname(libroRuta), destino);
  const xml = texto(ruta).replace(/<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>/g, "");
  let fila = 0;
  for (const [etiqueta, tipo] of xml.matchAll(/<(?:[\w]+:)?(row|c)\b[^>]*>/g)) {
    const referencia = atributo(etiqueta, "r");
    if (tipo === "row") fila = referencia ? parseInt(referencia, 10) : fila + 1;
    const numero = tipo === "row" ? fila : parseInt(referencia?.replace(/^[A-Z]+/i, "") ?? String(fila), 10);
    if (numero > 20000) throw new Error("Demasiadas filas reales");
  }
}

function leerPrimeraHoja(bytes: Uint8Array): unknown[][] {
  try {
    const libro = read(Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes), {
      type: "buffer",
      sheets: 0,
      sheetRows: 20001,
      bookFiles: true,
      nodim: true,
    });
    comprobarFilasReales(libro);
    const hoja = libro.Sheets[libro.SheetNames[0]];
    if (!hoja) throw new Error("Sin primera hoja");
    if (utils.decode_range(hoja["!fullref"] ?? hoja["!ref"] ?? "A1").e.r >= 20000) throw new Error("Demasiadas filas");
    return utils.sheet_to_json<unknown[]>(hoja, { header: 1, defval: null, raw: true });
  } catch {
    throw new ErrorNegocio("No se pudo leer el archivo. Verifique que sea el .xlsx exportado de Odoo.");
  }
}

function reconstruirReferencias(filas: unknown[][]): { referencias: ReferenciaLeida[]; filasDeAgrupacion: number } {
  const encabezado = (filas[0] ?? []).map((valor) => String(valor ?? "").trim());
  const indices = Object.fromEntries(
    Object.entries(columnasOdoo).map(([campo, nombre]) => {
      const indice = encabezado.indexOf(nombre);
      if (indice < 0) {
        throw new ErrorNegocio(`El archivo no tiene la columna «${nombre}». ¿Es el export de salidas de Odoo?`);
      }
      return [campo, indice];
    }),
  );

  const referencias: ReferenciaLeida[] = [];
  let actual: ReferenciaLeida | undefined;
  let filasDeAgrupacion = 0;
  for (const datos of filas.slice(1)) {
    const validacion = esquemaFilaOdoo.safeParse(
      Object.fromEntries(Object.entries(indices).map(([campo, indice]) => [campo, datos[indice]])),
    );
    if (!validacion.success) throw new ErrorNegocio(mensajeArchivoIlegible);
    const fila = validacion.data;
    if (fila.referencia && !fila.cliente && !fila.producto) {
      filasDeAgrupacion++;
      continue;
    }
    if (fila.referencia && (fila.referencia.split("/")[2] || fila.referencia).trim().length > 20) {
      throw new ErrorNegocio(mensajeArchivoIlegible);
    }
    if (fila.referencia) {
      actual = {
        referencia: fila.referencia,
        cliente: fila.cliente,
        sector: fila.sector,
        estado: fila.estado,
        lineas: [],
      };
      referencias.push(actual);
    }
    if (fila.producto && actual) {
      actual.lineas.push({
        producto: fila.producto,
        lote: fila.lote,
        pesoConversionKg: fila.pesoConversionKg,
        cantidadKg: fila.cantidadKg,
      });
    }
  }
  return { referencias, filasDeAgrupacion };
}

/** RN-36: se comprueba toda referencia Hecho antes de rechazar pedidos por sus líneas. */
function comprobarBodega(hechas: ReferenciaLeida[], sedeDeTrabajo: BodegaOdoo): void {
  const bodegas = new Set<BodegaOdoo>();
  for (const { referencia } of hechas) {
    const prefijo = referencia.split("/")[0].split("-")[0].trim().toUpperCase();
    const bodega = esquemaBodegaOdoo.safeParse(prefijo);
    if (!bodega.success) {
      throw new ErrorNegocio("Hay referencias de una bodega que no se reconoce. Se esperan los prefijos XE, GT o ESC.");
    }
    bodegas.add(bodega.data);
  }
  if (bodegas.size > 1) {
    throw new ErrorNegocio(
      "El archivo trae referencias de más de una bodega. Cada archivo debe ser de una sola bodega.",
    );
  }
  const [bodega] = bodegas;
  if (bodega !== sedeDeTrabajo) {
    throw new ErrorNegocio(
      `El archivo es de la bodega de ${nombresBodega[bodega]} y usted está trabajando en ${nombresBodega[sedeDeTrabajo]}. Cambie la sede o cargue el archivo correcto. No se cargó nada.`,
    );
  }
}

/**
 * Lee el export de Odoo exclusivamente en el servidor, sin persistencia ni consultas (JC-02).
 * La acción de JC-03 obtiene y autoriza la sede antes de pasar su prefijoOdoo a esta función pura.
 * Cantidades y pesos se devuelven como textos decimales exactos de tres posiciones.
 * Los errores del archivo son ErrorNegocio; los defectos de un pedido aparecen en noCargados.
 */
export async function leerArchivoOdoo(bytes: Uint8Array, sedeDeTrabajo: BodegaOdoo): Promise<ResultadoLecturaOdoo> {
  esquemaEntradaLecturaOdoo.parse({ bytes, sedeDeTrabajo });
  await comprobarArchivo(bytes);
  const { referencias, filasDeAgrupacion } = reconstruirReferencias(leerPrimeraHoja(bytes));
  if (!referencias.length) throw new ErrorNegocio("El archivo no trae referencias.");

  const hechas = referencias.filter(
    (r) =>
      r.estado
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase() === "hecho",
  );
  if (!hechas.length) throw new ErrorNegocio("El archivo no trae referencias en estado «Hecho».");
  comprobarBodega(hechas, sedeDeTrabajo);

  const resultado: ResultadoLecturaOdoo = {
    pedidos: [],
    noCargados: [],
    otrosEstados: referencias.length - hechas.length,
    filasDeAgrupacion,
  };
  for (const referencia of hechas) {
    const numero = (referencia.referencia.split("/")[2] || referencia.referencia).trim();
    const motivo = !referencia.lineas.length
      ? motivosNoCargados.sinProductos
      : referencia.lineas.some((l) => l.cantidadKg === null)
        ? motivosNoCargados.cantidad
        : referencia.lineas.some((l) => l.pesoConversionKg === null)
          ? motivosNoCargados.peso
          : null;
    if (motivo) {
      resultado.noCargados.push({ numero, cliente: referencia.cliente, motivo });
      continue;
    }
    resultado.pedidos.push({
      numero,
      referencia: referencia.referencia,
      bodega: sedeDeTrabajo,
      cliente: referencia.cliente,
      sector: referencia.sector,
      lineas: referencia.lineas.map((linea) => esquemaLineaPedidoFacturadoLeido.parse(linea)),
    });
  }
  return esquemaResultadoLecturaOdoo.parse(resultado);
}
