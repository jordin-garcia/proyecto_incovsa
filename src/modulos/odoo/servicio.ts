import { fileTypeFromBuffer } from "file-type";
import { read, utils } from "xlsx";
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
}

function leerPrimeraHoja(bytes: Uint8Array): unknown[][] {
  try {
    const libro = read(Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes), { type: "buffer", sheets: 0 });
    const hoja = libro.Sheets[libro.SheetNames[0]];
    if (!hoja) throw new Error("Sin primera hoja");
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
    const fila = esquemaFilaOdoo.parse(
      Object.fromEntries(Object.entries(indices).map(([campo, indice]) => [campo, datos[indice]])),
    );
    if (fila.referencia && !fila.cliente && !fila.producto) {
      filasDeAgrupacion++;
      continue;
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
