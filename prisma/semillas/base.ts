// Semilla base (JG-03): datos fijos y no personales que necesita cualquier instalación, incluida producción
// (specs/13 "Carga inicial", specs/16 decisiones 16 y 45, plan/convenciones.md §5). Es idempotente: crea solo lo que
// falta y nunca sobrescribe el contenido que INCOVSA edita desde el panel. Un cambio de un catálogo fijo ya cargado
// (por ejemplo, la descripción de un permiso) se hace con una migración.
import { getCountries } from "libphonenumber-js";
import type { PrismaClient } from "../../src/generated/prisma/client";
import guatemala from "../datos/guatemala.json";

export const SEDES = [
  { prefijoOdoo: "XE", nombre: "Quetzaltenango", tieneOficina: true },
  { prefijoOdoo: "GT", nombre: "Guatemala", tieneOficina: true },
  { prefijoOdoo: "ESC", nombre: "Escuintla", tieneOficina: false },
] as const;

/** Catálogo de permisos de specs/03, con los códigos del prototipo (`base.js` › `PERMISOS`). */
export const PERMISOS = [
  {
    codigo: "sit.contenido",
    sistema: "sitio",
    modulo: "Contenido institucional",
    descripcion: "Editar portada, logotipos, historia, misión, visión, valores e imágenes",
  },
  {
    codigo: "sit.industrias",
    sistema: "sitio",
    modulo: "Industrias",
    descripcion: "Editar descripción e imágenes de cada industria",
  },
  {
    codigo: "sit.catalogo",
    sistema: "sitio",
    modulo: "Catálogo",
    descripcion: "Crear, editar y eliminar productos públicos",
  },
  { codigo: "sit.noticias", sistema: "sitio", modulo: "Noticias", descripcion: "Crear, editar y eliminar noticias" },
  {
    codigo: "sit.contacto",
    sistema: "sitio",
    modulo: "Información de contacto",
    descripcion: "Editar los datos de las sedes",
  },
  { codigo: "sit.sol.ver", sistema: "sitio", modulo: "Solicitudes", descripcion: "Ver la bandeja de solicitudes" },
  {
    codigo: "sit.sol.gestionar",
    sistema: "sitio",
    modulo: "Solicitudes",
    descripcion: "Gestionar solicitudes: responsable, comentario y estado",
  },
  {
    codigo: "sit.doc.ver",
    sistema: "sitio",
    modulo: "Documentación interna",
    descripcion: "Ver documentos en el navegador",
  },
  {
    codigo: "sit.doc.descargar",
    sistema: "sitio",
    modulo: "Documentación interna",
    descripcion: "Descargar documentos",
  },
  {
    codigo: "sit.doc.gestionar",
    sistema: "sitio",
    modulo: "Documentación interna",
    descripcion: "Crear, editar y eliminar productos documentados",
  },
  {
    codigo: "pk.facturacion",
    sistema: "picking",
    modulo: "Facturación",
    descripcion: "Cargar el archivo de Odoo y enviar rutas y pedidos a bodega",
  },
  {
    codigo: "pk.bodega",
    sistema: "picking",
    modulo: "Bodega",
    descripcion: "Preparar, priorizar y despachar rutas y pedidos (incluye el tablero)",
  },
  { codigo: "pk.ruta.propias", sistema: "picking", modulo: "Ruta", descripcion: "Ejecutar las rutas asignadas" },
  { codigo: "pk.ruta.todas", sistema: "picking", modulo: "Ruta", descripcion: "Ver todas las rutas" },
  {
    codigo: "pk.reportes",
    sistema: "picking",
    modulo: "Reportes",
    descripcion: "Consultar y exportar reportes, incluida la bitácora",
  },
  { codigo: "pk.cfg.camiones", sistema: "picking", modulo: "Configuración", descripcion: "Administrar camiones" },
] as const;

export const ESTADOS_ENVIO = ["En Preparación", "Despachado", "En Ruta", "Entregado"] as const;

export const TIPOS_OPCION_ENVIO = ["camion", "recoge"] as const;

/** Las 9 industrias en el orden de specs/05, con la descripción de `base.js` › `INDUSTRIAS`. */
export const INDUSTRIAS = [
  {
    nombre: "Cuero",
    descripcion:
      "Actividad manufacturera que se encarga de procesar la piel de los animales mediante un proceso de curtido, las cuales posteriormente se encargan de usar las pieles como materia prima para la fabricación de zapatos, bolsas, vestimenta, accesorios, tapizados y otros.",
  },
  {
    nombre: "Textil",
    descripcion:
      "Industria dedicada a la actividad y manufacturas de hilo, fibras naturales y sintéticas, telas y otros materiales para obtener productos derivados de ropa y vestimenta.",
  },
  {
    nombre: "Cerería",
    descripcion:
      "Establecimiento comercial o persona individual donde se procesa y elabora objetos cuya materia prima principal es la parafina.",
  },
  {
    nombre: "Hulera",
    descripcion:
      "Establecimiento comercial o persona individual dedicada a la compra, venta, distribución y transformación de toda clase de productos relacionados con el hule, natural o sintético.",
  },
  {
    nombre: "Medicamentos",
    descripcion:
      "Sector que se dedica a la fabricación, preparación y comercialización de productos químicos o medicamentos para el tratamiento o prevención de enfermedades.",
  },
  {
    nombre: "Limpieza",
    descripcion:
      "Sector que se dedica a la fabricación, preparación y comercialización de productos químicos como jabón, detergentes, cosméticos y otros.",
  },
  {
    nombre: "Alimentación animal",
    descripcion:
      "Industria que se encarga de todos los procesos relacionados con la cadena alimentaria, desde almacenamiento, procesamiento, conservación y servicios de alimentos de consumo animal.",
  },
  {
    nombre: "Tratamiento de agua",
    descripcion:
      "Establecimiento comercial o persona individual que se dedica a la distribución y comercialización de tratamiento de agua, que comprende el conjunto de operaciones físicas, químicas, fisicoquímicas o biológicas cuya finalidad es la eliminación o reducción de la contaminación no deseable en aguas naturales, de abastecimiento, de proceso o residuales.",
  },
  {
    nombre: "Lavandería",
    descripcion:
      "Establecimiento comercial que se dedica a la limpieza y cuidado de área textil y prendas de vestir a través de procesos de lavado, secado, planchado y servicio de tintorería, atendiendo las necesidades de individuos, empresas, hospitales, hoteles y restaurantes, entre otros.",
  },
] as const;

/** Textos de specs/05, transcritos de MISION.jpg y VISION.jpg. La historia queda vacía (P-19). */
export const CONTENIDO_INSTITUCIONAL = {
  mision:
    "Ser el aliado estratégico para nuestros clientes y proveedores en la distribución de productos químicos, atendiendo la región CA-4, marcando la diferencia en servicio, con una completa gama de productos para brindar soluciones a las necesidades del mercado, apoyando a cumplir los objetivos de nuestros grupos de interés.",
  vision:
    "Ser referentes y acercar soluciones en la distribución de productos químicos satisfaciendo las necesidades de los mercados atendidos, creando valor integral a nuestros grupos de interés a través del crecimiento y mejora continua, con una administración responsable y transparente enfocada en la solidez y el largo plazo.",
  historia: "",
} as const;

/** Mapas de Google Maps de las sedes con oficina (specs/05). */
export const MAPAS = {
  XE: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3856.469689459672!2d-91.4743845!3d14.854992000000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x858ea30032a1ae3f%3A0xccc394a56fe6af75!2sIncovsa!5e0!3m2!1ses-419!2sgt!4v1791772265076!5m2!1ses-419!2sgt",
  GT: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3859.898369446534!2d-90.56218562536918!3d14.661708575578558!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85899fe9da39aa29%3A0x5f1c10c1ff4a038a!2sIncovsa!5e0!3m2!1ses-419!2sus!4v1791772376935!5m2!1ses-419!2sus",
} as const;

/** Logotipo de Inquiserca recibido el 13/10 (JG-04, `public/marca/`). */
export const LOGOTIPO_INQUISERCA = "/marca/inquiserca.webp";

/** Países de `libphonenumber-js` con su nombre en español, como el prototipo (decisión 45). */
export function listaPaises(): { codigo: string; nombre: string }[] {
  const nombres = new Intl.DisplayNames(["es"], { type: "region" });
  return getCountries()
    .map((codigo) => ({ codigo, nombre: nombres.of(codigo) ?? codigo }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

/**
 * Carga la semilla base. Cada tabla se llena con `createMany({ skipDuplicates })` (INSERT … ON CONFLICT DO NOTHING
 * sobre su clave única): crea solo lo que falta y nunca sobrescribe lo que INCOVSA editó desde el panel.
 */
export async function sembrarBase(prisma: PrismaClient): Promise<void> {
  await prisma.sede.createMany({ data: [...SEDES], skipDuplicates: true });
  await prisma.permiso.createMany({ data: [...PERMISOS], skipDuplicates: true });
  await prisma.estadoEnvio.createMany({ data: ESTADOS_ENVIO.map((nombre) => ({ nombre })), skipDuplicates: true });
  await prisma.pais.createMany({ data: listaPaises(), skipDuplicates: true });
  await sembrarTerritorio(prisma);
  await sembrarDatosEditables(prisma);
}

/**
 * La parte de la semilla base que la aplicación modifica: las opciones de envío de cada sede y el contenido inicial
 * del sitio. Necesita las sedes. La usa también `limpiarTablasDeNegocio` (pruebas/bd.ts).
 */
export async function sembrarDatosEditables(prisma: PrismaClient): Promise<void> {
  const sedes = await prisma.sede.findMany({ orderBy: { id: "asc" } });
  await prisma.opcionEnvio.createMany({
    data: sedes.flatMap((sede) => TIPOS_OPCION_ENVIO.map((tipo) => ({ sedeId: sede.id, tipo }))),
    skipDuplicates: true,
  });
  await prisma.industria.createMany({
    data: INDUSTRIAS.map((industria, i) => ({ ...industria, orden: i + 1 })),
    skipDuplicates: true,
  });
  await prisma.contenidoInstitucional.createMany({
    data: Object.entries(CONTENIDO_INSTITUCIONAL).map(([seccion, texto]) => ({ seccion, texto })),
    skipDuplicates: true,
  });
  // El logotipo de INCOVSA vacío es el recibido; el de Inquiserca viene cargado (specs/05) y vacío es "quitado".
  await prisma.configuracionSitio.createMany({
    data: [{ id: 1, logotipoInquisercaUrl: LOGOTIPO_INQUISERCA }],
    skipDuplicates: true,
  });
  await prisma.valor.createMany({ data: [1, 2, 3, 4, 5].map((posicion) => ({ posicion })), skipDuplicates: true });
  await prisma.informacionContacto.createMany({
    data: sedes
      .filter((sede) => sede.tieneOficina)
      .map((sede) => ({
        sedeId: sede.id,
        direccion: "",
        telefono: "",
        correo: "",
        whatsapp: "",
        mapaUrl: MAPAS[sede.prefijoOdoo as keyof typeof MAPAS],
      })),
    skipDuplicates: true,
  });
}

/** Los 22 departamentos y 340 municipios de Guatemala (INE, Censo 2018). Sin claves únicas: se comparan por nombre. */
async function sembrarTerritorio(prisma: PrismaClient): Promise<void> {
  const previos = new Set((await prisma.departamento.findMany()).map((d) => d.nombre));
  const nuevos = guatemala.departamentos.filter((d) => !previos.has(d.n)).map((d) => ({ nombre: d.n }));
  if (nuevos.length) await prisma.departamento.createMany({ data: nuevos });
  const existentes = new Map((await prisma.departamento.findMany()).map((d) => [d.nombre, d.id]));
  const municipios = new Set((await prisma.municipio.findMany()).map((m) => `${m.departamentoId}|${m.nombre}`));
  const faltantes = guatemala.departamentos.flatMap((departamento) => {
    const departamentoId = existentes.get(departamento.n)!;
    return departamento.municipios
      .filter((m) => !municipios.has(`${departamentoId}|${m.n}`))
      .map((m) => ({ departamentoId, nombre: m.n }));
  });
  if (faltantes.length) await prisma.municipio.createMany({ data: faltantes });
}
