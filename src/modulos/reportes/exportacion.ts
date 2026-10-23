import { readFile } from "node:fs/promises";
import path from "node:path";
import * as XLSX from "xlsx";
import pdfmake from "pdfmake";
import sharp from "sharp";
import { formatoFecha, formatoHora } from "@/lib/fechas";
import { fmt, textoUnidades } from "@/modulos/conversion/servicio";
import type { Periodo } from "./periodo";
import type { Despacho, OperacionReporte, RutaReporte } from "./servicio";

export type PestanaReporte = "despacho" | "rutas" | "bitacora";

export type DatosExportacion = {
  pestana: PestanaReporte;
  sedeNombre: string;
  periodo: Pick<Periodo, "inicio" | "fin" | "texto" | "nombre" | "filtro">;
  despacho?: Despacho;
  rutas?: RutaReporte[];
  operaciones?: OperacionReporte[];
};

type TablaReporte = { encabezados: string[]; filas: string[][]; columnasMono: number[] };

const directorioFuentes = path.resolve(process.cwd(), "src/modulos/reportes/fuentes");
const fuenteFigtree = path.join(directorioFuentes, "figtree-latin.ttf");
const fuenteMono = path.join(directorioFuentes, "jetbrains-mono-regular.ttf");
const fuentesPermitidas = new Set([fuenteFigtree, fuenteMono]);

pdfmake.setUrlAccessPolicy(() => false);
pdfmake.setLocalAccessPolicy((ruta) => fuentesPermitidas.has(path.resolve(ruta)));
pdfmake.addFonts({
  Figtree: { normal: fuenteFigtree, bold: fuenteFigtree, italics: fuenteFigtree, bolditalics: fuenteFigtree },
  JetBrainsMono: { normal: fuenteMono, bold: fuenteMono, italics: fuenteMono, bolditalics: fuenteMono },
});

function textoFechaHora(fecha: string) {
  return `${formatoFecha(fecha)} · ${formatoHora(fecha)}`;
}

function textoUnidadesDespacho(fila: Despacho["filas"][number], incluirPesoConversion: boolean) {
  const resto = Number(fila.restoKg) > 0 ? ` + ${fmt(fila.restoKg)} kg` : "";
  const conversion = `${textoUnidades(fila.unidades)}${resto}`;
  return incluirPesoConversion ? `${conversion} ÷ ${fmt(fila.pesoConversionKg)}` : conversion;
}

function textoTotalDespacho(despacho: Despacho) {
  return `${fmt(despacho.unidades)} unidades + ${fmt(despacho.restoKg)} kg`;
}

function indicadoresDespacho(despacho: Despacho) {
  return [
    ["Indicador", "Valor", "Detalle"],
    ["Kilogramos despachados", fmt(despacho.totalKg), "rutas y pedidos cerrados en Bodega"],
    ["Unidades completas", fmt(despacho.unidades), `más ${fmt(despacho.restoKg)} kg sueltos`],
    [
      "Rutas y pedidos cerrados",
      fmt(despacho.rutasCerradas + despacho.pedidosCerrados),
      `${fmt(despacho.rutasCerradas)} rutas · ${fmt(despacho.pedidosCerrados)} pedidos`,
    ],
    ["Rutas entregadas", fmt(despacho.rutasEntregadas), "en el periodo"],
  ];
}

function totalDespacho(despacho: Despacho) {
  return ["Total del periodo", fmt(despacho.totalKg), textoTotalDespacho(despacho)];
}

function tablaDespacho(datos: DatosExportacion): TablaReporte {
  const despacho = datos.despacho!;
  return {
    encabezados: ["Producto", "Cantidad (kg)", "Unidades"],
    filas: despacho.filas.map((fila) => [fila.producto, fmt(fila.cantidadKg), textoUnidadesDespacho(fila, true)]),
    columnasMono: [1, 2],
  };
}

function tablaRutas(datos: DatosExportacion): TablaReporte {
  return {
    encabezados: ["Ruta", "Fecha", "Programada", "Camión", "Piloto", "Total (kg)", "Estado", "Recorrido"],
    filas: (datos.rutas ?? []).map((ruta) => [
      String(ruta.numero),
      formatoFecha(ruta.fecha),
      textoFechaHora(ruta.programada),
      ruta.camion,
      ruta.piloto,
      fmt(ruta.totalKg),
      ruta.estado,
      ruta.recorrido
        ? ruta.recorrido.map((cliente, indice) => `${indice + 1}. ${cliente}`).join(" → ")
        : "Se guarda al entregar",
    ]),
    columnasMono: [0, 1, 2, 5],
  };
}

function tablaBitacora(datos: DatosExportacion): TablaReporte {
  return {
    encabezados: ["Fecha", "Usuario", "Operación", "Detalle"],
    filas: (datos.operaciones ?? []).map((operacion) => [
      textoFechaHora(operacion.fecha),
      operacion.usuario,
      operacion.operacion,
      operacion.detalle,
    ]),
    columnasMono: [0],
  };
}

function tablaDe(datos: DatosExportacion): TablaReporte {
  if (datos.pestana === "despacho") return tablaDespacho(datos);
  if (datos.pestana === "rutas") return tablaRutas(datos);
  return tablaBitacora(datos);
}

function tituloDe(datos: DatosExportacion) {
  if (datos.pestana === "despacho") return datos.periodo.nombre;
  return datos.pestana === "rutas" ? "Rutas realizadas" : "Bitácora";
}

function filasExcel(datos: DatosExportacion, tabla: TablaReporte): (string | number)[][] {
  const encabezado =
    datos.pestana === "bitacora"
      ? [["Periodo", datos.periodo.texto]]
      : [
          ["Sede", datos.sedeNombre],
          ["Periodo", datos.periodo.texto],
        ];
  if (datos.pestana !== "despacho") return [...encabezado, [], tabla.encabezados, ...tabla.filas];

  const despacho = datos.despacho!;
  const total = despacho.filas.length ? [totalDespacho(despacho)] : [];
  return [...encabezado, [], ...indicadoresDespacho(despacho), [], tabla.encabezados, ...tabla.filas, ...total];
}

export function crearExcel(datos: DatosExportacion): Buffer {
  const tabla = tablaDe(datos);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, XLSX.utils.aoa_to_sheet(filasExcel(datos, tabla)), datos.pestana);
  return XLSX.write(libro, { type: "buffer", bookType: "xlsx" });
}

function nombreSede(sede: string) {
  return sede
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function fechaDeArchivo(fecha: string) {
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}-${mes}-${anio}`;
}

export function nombreArchivo(datos: DatosExportacion, formato: "xlsx" | "pdf") {
  const prefijo = datos.pestana === "rutas" ? "rutas-realizadas" : datos.pestana;
  const periodo =
    datos.periodo.filtro.tipo === "dia"
      ? fechaDeArchivo(datos.periodo.inicio)
      : `del-${fechaDeArchivo(datos.periodo.inicio)}-al-${fechaDeArchivo(datos.periodo.fin)}`;
  const sede = datos.pestana === "bitacora" ? "" : `${nombreSede(datos.sedeNombre)}-`;
  return `${prefijo}-${sede}${periodo}.${formato}`;
}

let logoEnBase64: Promise<string> | undefined;
function cargarLogo() {
  logoEnBase64 ??= readFile(path.join(process.cwd(), "public/marca/incovsa-quimicos.webp"))
    .then((webp) => sharp(webp).png().toBuffer())
    .then((png) => `data:image/png;base64,${png.toString("base64")}`);
  return logoEnBase64;
}

let colorTextoPdf: Promise<string> | undefined;
function cargarColorTextoPdf() {
  colorTextoPdf ??= readFile(path.join(process.cwd(), "src/app/globals.css"), "utf8").then((css) => {
    const color = css.match(/--color-g900:\s*([^;\s]+)/)?.[1];
    if (!color) throw new Error("No se encontró el token --color-g900 del tema.");
    return color;
  });
  return colorTextoPdf;
}

function tituloPdf(datos: DatosExportacion) {
  return tituloDe(datos);
}

function anchosDe(datos: DatosExportacion): (number | string)[] {
  if (datos.pestana === "despacho") return ["*", 90, 150];
  if (datos.pestana === "rutas") return [42, 60, 92, 78, 78, 66, 62, "*"];
  return [94, 90, 112, "*"];
}

export async function crearPdf(datos: DatosExportacion): Promise<Buffer> {
  const tabla = tablaDe(datos);
  const titulo = tituloPdf(datos);
  const logo = await cargarLogo();
  const colorTexto = await cargarColorTextoPdf();
  const filas = [
    tabla.encabezados.map((texto) => ({ text: texto, style: "cabeceraTabla" })),
    ...tabla.filas.map((fila) =>
      fila.map((texto, indice) => ({ text: texto, style: tabla.columnasMono.includes(indice) ? "mono" : "celda" })),
    ),
  ];
  if (datos.pestana === "despacho" && datos.despacho!.filas.length) {
    filas.push(
      totalDespacho(datos.despacho!).map((texto, indice) => ({
        text: texto,
        style: indice > 0 ? "totalMono" : "total",
      })),
    );
  }
  const contenido: Record<string, unknown>[] = [
    { image: logo, width: 138, margin: [0, 0, 0, 14] },
    { text: titulo, style: "titulo" },
  ];
  if (datos.pestana !== "bitacora") contenido.push({ text: datos.sedeNombre, style: "metadato" });
  contenido.push({ text: `Periodo: ${datos.periodo.texto}`, style: "metadato" });
  if (datos.pestana === "despacho") {
    const indicadores = indicadoresDespacho(datos.despacho!).map((fila, indice) =>
      fila.map((texto, columna) => ({
        text: texto,
        style: indice === 0 ? "cabeceraTabla" : columna === 1 ? "mono" : "celda",
      })),
    );
    contenido.push({
      table: { headerRows: 1, widths: ["*", 86, "*"], body: indicadores },
      layout: "lightHorizontalLines",
      margin: [0, 10, 0, 0],
    });
  }
  contenido.push({
    table: { headerRows: 1, widths: anchosDe(datos), body: filas, dontBreakRows: true },
    layout: "lightHorizontalLines",
    margin: [0, 14, 0, 0],
  });
  const pdf = pdfmake.createPdf({
    info: { title: titulo, author: "INCOVSA" },
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [32, 32, 32, 36],
    defaultStyle: { font: "Figtree", fontSize: 8, color: colorTexto },
    content: contenido,
    styles: {
      titulo: { font: "Figtree", fontSize: 18, bold: true, margin: [0, 0, 0, 5] },
      metadato: { font: "Figtree", fontSize: 9, margin: [0, 0, 0, 3] },
      cabeceraTabla: { font: "Figtree", bold: true, fontSize: 8, margin: [0, 3, 0, 3] },
      celda: { font: "Figtree", fontSize: 8, margin: [0, 2, 0, 2] },
      mono: { font: "JetBrainsMono", fontSize: 7, margin: [0, 2, 0, 2] },
      total: { font: "Figtree", bold: true, fontSize: 8, margin: [0, 3, 0, 3] },
      totalMono: { font: "JetBrainsMono", bold: true, fontSize: 7, margin: [0, 3, 0, 3] },
    },
  });
  return pdf.getBuffer();
}
