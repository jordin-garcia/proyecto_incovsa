/* ==========================================================================
   Núcleo de la simulación: utilidades, íconos, datos, reglas de negocio,
   sesiones, sincronización entre pantallas y componentes comunes.
   Las reglas siguen specs/ (RN-01 a RN-49). Lo que está pendiente se marca
   con su código P-xx en pantalla.
   ========================================================================== */
'use strict';
const A = window.RECURSOS || {};
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const r3 = (x) => Math.round((Number(x) || 0) * 1000) / 1000;
const pad = (n, w = 2) => String(n).padStart(w, '0');

/* ------------------------------------------------------------------ formato */
function fmt(n) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  const neg = n < 0;
  const [e, d] = Math.abs(r3(n)).toFixed(3).split('.');
  const dec = d.replace(/0+$/, '');
  return (neg ? '−' : '') + e.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (dec ? '.' + dec : '');
}
const kg = (n) => fmt(n) + ' kg';
const fFecha = (iso) => { const d = new Date(iso); return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear(); };
const fHora = (iso) => { const d = new Date(iso); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
const fFH = (iso) => fFecha(iso) + ' · ' + fHora(iso);
const hoyISO = () => new Date().toISOString();
const mismoDia = (a, b) => fFecha(a) === fFecha(b);
function leerNumero(txt) {
  const t = String(txt ?? '').replace(/,/g, '').replace(/\s/g, '').trim();
  if (t === '') return NaN;
  return /^\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}

/* RN-01 · conversión sin punto flotante: se trabaja en milésimas de kg */
function convertir(cantidadKg, peso2) {
  const q = Math.round(cantidadKg * 1000), p = Math.round(peso2 * 1000);
  if (!(p > 0)) return { u: 0, r: r3(cantidadKg) };
  const u = Math.floor(q / p);
  return { u, r: (q - u * p) / 1000 };
}
function textoUnidades(u) { return u === 1 ? '1 unidad' : fmt(u) + ' unidades'; }
function textoConversion(cantidadKg, peso2) {
  const { u, r } = convertir(cantidadKg, peso2);
  if (r > 0) return textoUnidades(u) + ' + ' + fmt(r) + ' kg';
  return UI.exacto === 'cero' ? textoUnidades(u) + ' + 0 kg' : textoUnidades(u);   // P-26
}
function htmlConversion(cantidadKg, peso2) {
  const { u, r } = convertir(cantidadKg, peso2);
  const resto = r > 0 ? r : (UI.exacto === 'cero' ? 0 : null);
  return `<span class="unid">${esc(textoUnidades(u))}${resto !== null ? `<span class="resto">+ ${fmt(resto)} kg</span>` : ''}</span>`;
}

/* ------------------------------------------------------------------ íconos */
const IC = {
  inicio: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
  factura: '<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  bodega: '<path d="M3 21V9l9-5 9 5v12"/><path d="M7 21v-8h10v8"/><path d="M7 17h10"/>',
  camion: '<path d="M2 6h11v10H2z"/><path d="M13 9h4l4 4v3h-8"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  caja: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/>',
  grafica: '<path d="M3 21h18"/><path d="M6 17v-5M11 17V6M16 17v-8M21 17v-3"/>',
  ajustes: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  salir: '<path d="M9 4H5v16h4"/><path d="M14 8l4 4-4 4M18 12H9"/>',
  buscar: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  mas: '<path d="M12 5v14M5 12h14"/>',
  asa: '<circle cx="9" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="18" r="1.3" fill="currentColor" stroke="none"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  alerta: '<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5M12 17.2h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.8h.01"/>',
  flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  atras: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  arriba: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  archivo: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/><path d="M9 13h6M9 17h4"/>',
  ojo: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  ojoNo: '<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.9M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7c1.6 0 3-.4 4.3-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  descargar: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
  subir: '<path d="M12 21V9M7 14l5-5 5 5M4 3h16"/>',
  usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  usuarios: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.5-5.5 6.5-5.5s5.5 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c2 .7 3.3 2.5 3.8 5.5"/>',
  tv: '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
  tableta: '<rect x="4" y="2" width="16" height="20" rx="2.5"/><path d="M11 18h2"/>',
  completa: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  candado: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  tel: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  correo: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  chat: '<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12z"/>',
  editar: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
  borrar: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  llave: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/>',
  reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  luna: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  colapsar: '<path d="M11 6l-6 6 6 6M19 6l-6 6 6 6"/>',
  expandir: '<path d="M13 6l6 6-6 6M5 6l6 6-6 6"/>',
  globo: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  externo: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v6H4V6h6"/>',
  bandeja: '<path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5 5h14l2 8v6H3v-6z"/>',
  noticia: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/>',
  imagen: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 17-5-5-9 8"/>',
  fabrica: '<path d="M3 21V11l6 3V11l6 3V7l6-3v17z"/><path d="M3 21h18"/>',
  ruta: '<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H16a3.5 3.5 0 0 0 0-7H8a3.5 3.5 0 0 1 0-7h7.5"/>',
  lista: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
  escudo: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>',
  tubo: '<path d="M8.5 3h7M10 3v14.5a2 2 0 0 0 4 0V3"/><path d="M10 12h4"/>',
  edificio: '<path d="M3 21h18M5 21V8l7-4 7 4v13"/><path d="M9 21v-6h6v6"/>',
  ciclo: '<path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5"/><path d="M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5"/>',
  calendario: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  estrella: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
  // industrias
  cuero: '<path d="M7 3c1 1.5 3 2 5 2s4-.5 5-2c1 1.5 3 2.5 4 2.5-.5 2-1 3.5-1 5.5 0 3 1 5 1 7-1.5 0-3 1-4 2.5-1-.8-3-1.5-5-1.5s-4 .7-5 1.5C6 19 4.5 18 3 18c0-2 1-4 1-7 0-2-.5-3.5-1-5.5C4 5.5 6 4.5 7 3z"/>',
  textil: '<path d="M6 3h12M6 21h12"/><path d="M8 3v18M16 3v18"/><path d="M8 7l8 3M8 11l8 3M8 15l8 3"/>',
  cereria: '<path d="M8 10h8v11H8z"/><path d="M12 10V7.5"/><path d="M12 7.5c-1.6-1-1.6-3 0-4.5 1.6 1.5 1.6 3.5 0 4.5z"/>',
  hulera: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
  medicamentos: '<rect x="2.5" y="8" width="19" height="8" rx="4" transform="rotate(-45 12 12)"/><path d="M8.5 8.5l7 7"/>',
  limpieza: '<path d="M9 8h6l1 3v10H8V11z"/><path d="M10 8V5h4l3-2"/><path d="M19.5 5h.01M20.5 8h.01M18.5 8.5h.01"/>',
  alimentacion: '<circle cx="6.5" cy="10" r="1.8"/><circle cx="10.5" cy="5.5" r="1.8"/><circle cx="15.5" cy="6" r="1.8"/><circle cx="18.5" cy="10.5" r="1.8"/><path d="M8 17.5c0-3 2-6 5-6s5 3 4.5 5.5c-.3 1.8-2 2.5-4 2-1-.3-1.5-.3-2.5 0-2 .5-3-.2-3-1.5z"/>',
  agua: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/><path d="M9 15a3 3 0 0 0 3 3"/>',
  lavanderia: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="13" r="4.5"/><path d="M7 6.5h.01M10 6.5h4"/>',
};
const ico = (n, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${IC[n] || ''}</svg>`;

/* Burbujas del tubo de ensayo del logotipo, como adorno */
const burbujas = (color = 'var(--lima-v)') => `<svg viewBox="0 0 40 60" aria-hidden="true"><circle cx="20" cy="46" r="9" fill="${color}"/><circle cx="8" cy="26" r="6" fill="${color}" opacity=".75"/><circle cx="24" cy="10" r="4" fill="${color}" opacity=".5"/></svg>`;

/* ------------------------------------------------------------------ catálogos fijos */
const SEDES = { XE: 'Quetzaltenango', GT: 'Guatemala', ES: 'Escuintla' };
const SEDES_SITIO = ['XE', 'GT'];                          // sedes con oficina: las únicas del sitio público (specs/05)
const PREFIJOS_ODOO = { XE: 'XE', GT: 'GT', ESC: 'ES' };   // primer segmento de la Referencia (RN-36)

/* Catálogo de permisos (specs/03-roles-y-accesos.md). Gerencia y Soporte los tienen todos. */
const PERMISOS = [
  { c: 'sit.contenido', s: 'sitio', m: 'Contenido institucional', n: 'Editar historia, misión, visión, valores e imágenes' },
  { c: 'sit.industrias', s: 'sitio', m: 'Industrias', n: 'Editar descripción e imagen de cada industria' },
  { c: 'sit.catalogo', s: 'sitio', m: 'Catálogo', n: 'Crear, editar y eliminar productos públicos' },
  { c: 'sit.noticias', s: 'sitio', m: 'Noticias', n: 'Crear, editar, publicar y ocultar noticias' },
  { c: 'sit.contacto', s: 'sitio', m: 'Información de contacto', n: 'Editar los datos de las sedes' },
  { c: 'sit.sol.ver', s: 'sitio', m: 'Solicitudes', n: 'Ver la bandeja de solicitudes' },
  { c: 'sit.sol.gestionar', s: 'sitio', m: 'Solicitudes', n: 'Gestionar solicitudes: responsable, comentario y estado' },
  { c: 'sit.doc.ver', s: 'sitio', m: 'Documentación interna', n: 'Ver documentos en el navegador' },
  { c: 'sit.doc.descargar', s: 'sitio', m: 'Documentación interna', n: 'Descargar documentos' },
  { c: 'sit.doc.gestionar', s: 'sitio', m: 'Documentación interna', n: 'Subir, reemplazar y eliminar documentos' },
  { c: 'pk.facturacion', s: 'picking', m: 'Facturación', n: 'Cargar el archivo de Odoo y enviar pedidos a bodega' },
  { c: 'pk.bodega', s: 'picking', m: 'Bodega', n: 'Preparar, priorizar y despachar pedidos (incluye el tablero)' },
  { c: 'pk.ruta.propias', s: 'picking', m: 'Ruta', n: 'Ejecutar las rutas asignadas' },
  { c: 'pk.ruta.todas', s: 'picking', m: 'Ruta', n: 'Ver todas las rutas' },
  { c: 'pk.reportes', s: 'picking', m: 'Reportes', n: 'Consultar y exportar reportes, incluida la bitácora' },
  { c: 'pk.cfg.productos', s: 'picking', m: 'Configuración', n: 'Administrar productos y su Peso de Conversión' },
  { c: 'pk.cfg.clientes', s: 'picking', m: 'Configuración', n: 'Administrar clientes y sectores' },
  { c: 'pk.cfg.camiones', s: 'picking', m: 'Configuración', n: 'Administrar camiones' },
];
const PERMISO = Object.fromEntries(PERMISOS.map((p) => [p.c, p]));
const MODULOS_P = [
  { id: 'facturacion', n: 'Facturación', i: 'factura' }, { id: 'bodega', n: 'Bodega', i: 'bodega' },
  { id: 'ruta', n: 'Ruta', i: 'ruta' }, { id: 'reportes', n: 'Reportes', i: 'grafica' },
  { id: 'configuracion', n: 'Configuración', i: 'ajustes' },
];
const ESTADOS = {
  PREP: { n: 'En Preparación', c: 'estado-prep' }, DESP: { n: 'Despachado', c: 'estado-desp' },
  RUTA: { n: 'En Ruta', c: 'estado-ruta' }, ENTR: { n: 'Entregado', c: 'estado-entr' },
};
const chipEstado = (p) => `<span class="chip ${ESTADOS[p.estado].c}"><span class="punto"></span>${ESTADOS[p.estado].n}</span>`;

/* Industrias y productos públicos. Descripciones y listas de productos de
   la página de Google Sites de la empresa (necesitan revisión, P-21). */
const INDUSTRIAS = [
  { id: 'cuero', n: 'Cuero', d: 'Actividad manufacturera que se encarga de procesar la piel de los animales mediante un proceso de curtido, las cuales posteriormente se encargan de usar las pieles como materia prima para la fabricación de zapatos, bolsas, vestimenta, accesorios, tapizados y otros.', p: ['Ácido Fórmico', 'Ácido Sulfúrico', 'Extracto de Quebracho', 'Extracto de Mimosa', 'Soda Ash (Carbonato de Sodio)', 'Sulfato de Cromo', 'Sulfuro de Sodio', 'Productos SILVATEAM', 'Colorante Cuero'] },
  { id: 'textil', n: 'Textil', d: 'Industria dedicada a la actividad y manufacturas de hilo, fibras naturales y sintéticas, telas y otros materiales para obtener productos derivados de ropa y vestimenta.', p: ['Ácido Acético', 'Negro Sulfuroso', 'Soda Cáustica', 'Soda Ash (Carbonato de Sodio)', 'Sulfato de Sodio', 'Sulfuro de Sodio', 'Colorantes Reactivos'] },
  { id: 'cereria', n: 'Cerería', d: 'Establecimiento comercial o persona individual donde se procesa y elabora objetos cuya materia prima principal es la parafina.', p: ['Parafina Full Refinada 56/58', 'Parafina Full Refinada 58/60', 'Parafina Semi-Refinada 56/58', 'Parafina Semi-Refinada 58/60'] },
  { id: 'hulera', n: 'Hulera', d: 'Establecimiento comercial o persona individual dedicada a la compra, venta, distribución y transformación de toda clase de productos relacionados con el hule, natural o sintético.', p: ['Ácido Acético', 'Ácido Fórmico', 'Ácido Sulfúrico', 'Soda Cáustica'] },
  { id: 'medicamentos', n: 'Medicamentos', d: 'Sector que se dedica a la fabricación, preparación y comercialización de productos químicos o medicamentos para el tratamiento o prevención de enfermedades.', p: ['Ácido Oxálico', 'Bicarbonato de Amonio', 'Bicarbonato de Sodio', 'Soda Cáustica', 'Sulfato de Magnesio', 'Parafina', 'Hipoclorito de Calcio'] },
  { id: 'limpieza', n: 'Limpieza', d: 'Sector que se dedica a la fabricación, preparación y comercialización de productos químicos como jabón, detergentes, cosméticos y otros.', p: ['Ácido Acético', 'Hipoclorito de Calcio', 'Soda Cáustica', 'Soda Ash (Carbonato de Sodio)'] },
  { id: 'alimentacion', n: 'Alimentación animal', d: 'Industria que se encarga de todos los procesos relacionados con la cadena alimentaria, desde almacenamiento, procesamiento, conservación y servicios de alimentos de consumo animal.', p: ['Ácido Acético', 'Bicarbonato', 'Hipoclorito de Calcio', 'Soda Ash (Carbonato de Sodio)', 'Soda Cáustica', 'Productos SILVAFEED'] },
  { id: 'agua', n: 'Tratamiento de agua', d: 'Establecimiento comercial o persona individual que se dedica a la distribución y comercialización de tratamiento de agua, que comprende el conjunto de operaciones físicas, químicas, fisicoquímicas o biológicas cuya finalidad es la eliminación o reducción de la contaminación no deseable en aguas naturales, de abastecimiento, de proceso o residuales.', p: ['Ácido Sulfúrico', 'Hipoclorito de Calcio', 'Soda Ash (Carbonato de Sodio)', 'Soda Cáustica', 'Sulfato de Aluminio', 'Tricloro'] },
  { id: 'lavanderia', n: 'Lavandería', d: 'Establecimiento comercial que se dedica a la limpieza y cuidado de área textil y prendas de vestir a través de procesos de lavado, secado, planchado y servicio de tintorería, atendiendo las necesidades de individuos, empresas, hospitales, hoteles y restaurantes, entre otros.', p: ['Ácido Acético Glacial', 'Hidrosulfito de Sodio', 'Hipoclorito de Calcio (Cloro)', 'Metabisulfito de Sodio', 'Soda Ash (Carbonato de Sodio)', 'Soda Cáustica', 'Colorantes Directos'] },
];
const INDN = Object.fromEntries(INDUSTRIAS.map((x) => [x.id, x.n]));

/* Las 28 imágenes de docs_incovsa/PAGINA WEB/CATALOGO. El nombre es el que
   aparece dentro de cada imagen (specs/05). Las industrias salen de las
   listas de Google Sites cuando el nombre coincide; si no, quedan por
   confirmar (P-17). */
const PRODUCTOS_PUB_BASE = [
  ['Ácido Acético', ['textil', 'hulera', 'limpieza', 'alimentacion']],
  ['Ácido Fórmico', ['cuero', 'hulera']],
  ['Ácido Oxálico', ['medicamentos']],
  ['Ácido Sulfúrico', ['cuero', 'hulera', 'agua']],
  ['Alguicida', []],
  ['Bicarbonato de Sodio', ['medicamentos', 'alimentacion']],
  ['Blanqueador', []],
  ['Clarificante', []],
  ['Enzima Ácida INCO-EAL', []],
  ['Enzima Ácida INCO-EAL', []],
  ['Enzima Neutra INCO-ENL', []],
  ['Afirmador / Fijador Textil', []],
  ['Hidrosulfito de Sodio', ['lavanderia']],
  ['Hidrosulfito de Sodio', ['lavanderia']],
  ['Hipoclorito de Calcio en Tableta', ['medicamentos', 'limpieza', 'alimentacion', 'agua', 'lavanderia']],
  ['Hipoclorito de Calcio Granular', ['medicamentos', 'limpieza', 'alimentacion', 'agua', 'lavanderia']],
  ['Metabisulfito', ['lavanderia']],
  ['Negro Sulfuroso High Quality', ['textil']],
  ['Peróxido de Hidrógeno', []],
  ['Soda Cáustica', ['textil', 'hulera', 'medicamentos', 'limpieza', 'alimentacion', 'agua', 'lavanderia']],
  ['Soda Ash', ['cuero', 'textil', 'limpieza', 'alimentacion', 'agua', 'lavanderia']],
  ['Soda Cáustica', ['textil', 'hulera', 'medicamentos', 'limpieza', 'alimentacion', 'agua', 'lavanderia']],
  ['Soda Cáustica', ['textil', 'hulera', 'medicamentos', 'limpieza', 'alimentacion', 'agua', 'lavanderia']],
  ['Soda Cáustica (POL)', ['textil', 'hulera', 'medicamentos', 'limpieza', 'alimentacion', 'agua', 'lavanderia']],
  ['Sulfato de Aluminio', ['agua']],
  ['Sulfato de Sodio', ['textil']],
  ['Sulfuro de Sodio', ['cuero', 'textil']],
  ['Tricloro Granular y Polvo', ['agua']],
];
const imgProd = (p) => p.foto || (A.catalogo || [])[p.img] || '';

/* Mapas de Google Maps de las dos sedes con oficina (specs/05) */
const MAPAS = {
  XE: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3856.469689459672!2d-91.4743845!3d14.854992000000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x858ea30032a1ae3f%3A0xccc394a56fe6af75!2sIncovsa!5e0!3m2!1ses-419!2sgt!4v1791772265076!5m2!1ses-419!2sgt',
  GT: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3859.898369446534!2d-90.56218562536918!3d14.661708575578558!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85899fe9da39aa29%3A0x5f1c10c1ff4a038a!2sIncovsa!5e0!3m2!1ses-419!2sus!4v1791772376935!5m2!1ses-419!2sus',
};

/* Países (libphonenumber + nombres en español del navegador) y territorio de Guatemala (INE) */
const nombrePais = (() => {
  let dn = null; try { dn = new Intl.DisplayNames(['es'], { type: 'region' }); } catch (e) {}
  return (c) => { if (!c) return ''; try { return (dn && dn.of(c)) || c; } catch (e) { return c; } };
})();
let _paises = null;
function paises() {
  if (_paises) return _paises;
  const lib = window.libphonenumber;
  if (!lib || !lib.getCountries) return [];
  _paises = lib.getCountries().map((c) => ({ c, n: nombrePais(c), tel: '+' + lib.getCountryCallingCode(c) }))
    .sort((a, b) => a.n.localeCompare(b.n, 'es'));
  return _paises;
}
const GUATEMALA = (window.DATOS && window.DATOS.guatemala) || [];

/* ------------------------------------------------------------------ preferencias de la demo */
const UI = (() => {
  let g = {};
  try { g = JSON.parse(localStorage.getItem('incovsa-sim-ui') || '{}'); } catch (e) {}
  return Object.assign({ pendientes: true, exacto: 'solo' }, g);
})();
function guardarUI() { try { localStorage.setItem('incovsa-sim-ui', JSON.stringify(UI)); } catch (e) {} document.body.classList.toggle('sin-pendientes', !UI.pendientes); }
const pend = (cod, texto) => `<div class="pend"><b class="cod">${esc(cod)}</b><div>${texto}</div></div>`;
const pendIn = (cod, texto = 'Por confirmar') => `<span class="pend-in" title="Pendiente con INCOVSA">${esc(cod)} · ${esc(texto)}</span>`;

/* ==========================================================================
   ESTADO COMPARTIDO
   Se guarda en localStorage. Todas las pestañas abiertas del mismo archivo
   ven los cambios al instante (así se simula el tiempo real de RNF-13).
   Aquí vive también lo que la aplicación real guarda en la base de datos
   antes de enviar a bodega: el tablero de pedidos facturados y las opciones
   de envío (RN-48).
   ========================================================================== */
const VER = 4;
const CLAVE = 'incovsa-simulacion';
let S = null;
let canal = null;
try { canal = new BroadcastChannel('incovsa-simulacion'); } catch (e) {}

function cargarEstado() {
  try {
    const t = localStorage.getItem(CLAVE);
    if (t) { const x = JSON.parse(t); if (x && x.v === VER) { S = x; return; } }
  } catch (e) {}
  S = semilla();
  guardar();
}
/* Devuelve false si el navegador no tiene espacio (las imágenes subidas ocupan mucho) */
function guardar() {
  S.rev = (S.rev || 0) + 1; S.ts = Date.now();
  const t = JSON.stringify(S);
  let ok = true;
  try { localStorage.setItem(CLAVE, t); } catch (e) {
    ok = false;
    if (typeof document !== 'undefined' && document.getElementById('avisos')) toast('El navegador no tiene espacio para guardar este cambio (la simulación guarda todo en el navegador). Pruebe con una imagen más pequeña.', 'error');
  }
  try { canal && canal.postMessage(t); } catch (e) {}
  return ok;
}
function recibir(t) {
  try {
    const x = JSON.parse(t);
    if (!x || x.v !== VER) return;
    if (S && x.ts === S.ts && x.rev === S.rev) return;
    S = x;
    if (typeof alCambiarRemoto === 'function') alCambiarRemoto();
  } catch (e) {}
}
window.addEventListener('storage', (e) => { if (e.key === CLAVE && e.newValue) recibir(e.newValue); });
if (canal) canal.onmessage = (e) => recibir(e.data);

/* ------------------------------------------------------------------ consultas */
const prod = (id) => S.productos.find((p) => p.id === id);
const cliente = (id) => S.clientes.find((c) => c.id === id);
const sector = (id) => (S.sectores.find((s) => s.id === id) || {}).n || '—';
const camion = (id) => S.camiones.find((c) => c.id === id);
const usuario = (id) => S.usuarios.find((u) => u.id === id);
const pedido = (id) => S.pedidos.find((p) => p.id === id);
const facturado = (id) => S.facturados.find((f) => f.id === id);
const rutaDe = (pedId) => S.rutas.find((r) => r.pedido === pedId);
const camionesDe = (sede) => S.camiones.filter((c) => c.sede === sede);
/* El nombre se conserva aunque el usuario se elimine, para el historial (P-42) */
const nombreUsuario = (id) => (usuario(id) || {}).nombre || (S.nombresEliminados || {})[id] || '—';
const totalPedido = (p) => r3(p.lineas.reduce((a, l) => a + l.kg, 0));

/* Comparaciones de la carga del archivo de Odoo (specs/06 y 13) */
const claveProducto = (s) => String(s || '').replace(/[\s.]/g, '').toUpperCase();
const claveCliente = (s) => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
const productoPorNombre = (n) => { const k = claveProducto(n); return S.productos.find((p) => claveProducto(p.n) === k); };

/* Pedidos facturados: el nombre y el sector salen de la base de clientes si el
   cliente está guardado; si no, de lo que trajo el archivo (RN-44) */
const nombreFact = (f) => (f.cli != null && cliente(f.cli) ? cliente(f.cli).n : f.nombre);
const sectorFact = (f) => (f.cli != null && cliente(f.cli) ? sector(cliente(f.cli).s) : f.sector);
const totalFact = (f) => r3(f.lineas.reduce((a, l) => a + l.kg, 0));
/* opcion: null = tablero, id de camión o 'recoge' */
const facturadosDe = (sede, opcion) => S.facturados.filter((f) => f.sede === sede && !f.pedido && f.opcion === opcion).sort((a, b) => a.pos - b.pos);
const pilotoOpcion = (sede, cid) => ((S.opciones[sede] || {})[cid] || {}).piloto || null;
const claveRuta = (f) => (f.cli != null && cliente(f.cli) ? 'c' + f.cli : 'n:' + nombreFact(f) + '|' + sectorFact(f));

/* ------------------------------------------------------------------ bitácora */
function bit(uid, op, detalle, fecha) {
  S.bitacora.unshift({ id: 'b' + (++S.corr.bit), fecha: fecha || hoyISO(), usuario: uid, nombre: nombreUsuario(uid), op, detalle });
}

/* ==========================================================================
   OPERACIONES (reglas de negocio)
   Cada operación valida todo antes de tocar el estado: se aplica completa o
   no se aplica (RNF-06).
   ========================================================================== */
const Err = (m) => { const e = new Error(m); e.negocio = true; return e; };

/* Productos y clientes que se agregan desde Facturación (RN-43, RN-44) */
function opAgregarProducto(nombre, p2, uid) {
  nombre = String(nombre || '').trim();
  if (!nombre) throw Err('El nombre del producto es obligatorio.');
  if (!(p2 > 0)) throw Err(`El Peso de Conversión de ${nombre} debe ser un número mayor que cero.`);
  if (productoPorNombre(nombre)) throw Err(`${nombre} ya está en el catálogo.`);
  const p = { id: S.productos.reduce((m, x) => Math.max(m, x.id), -1) + 1, n: nombre, p2: r3(p2) };
  S.productos.push(p);
  bit(uid, 'Producto agregado desde Facturación', `${nombre} · Peso de Conversión ${fmt(p.p2)} kg`);
  return p;
}
function opCrearSector(nombre, uid, op = 'Creación de sector') {
  nombre = String(nombre || '').trim();
  if (!nombre) throw Err('Escriba el nombre del sector.');
  const ya = S.sectores.find((s) => s.n === nombre);
  if (ya) return ya;
  const s = { id: S.sectores.reduce((m, x) => Math.max(m, x.id), -1) + 1, n: nombre };
  S.sectores.push(s);
  bit(uid, op, nombre);
  return s;
}
function opAgregarCliente(nombre, idSector, uid) {
  nombre = String(nombre || '').trim();
  if (!nombre) throw Err('El nombre del cliente es obligatorio.');
  const c = { id: S.clientes.reduce((m, x) => Math.max(m, x.id), -1) + 1, n: nombre, s: idSector };
  S.clientes.push(c);
  bit(uid, 'Cliente agregado desde Facturación', `${nombre} · ${sector(idSector)}`);
  return c;
}

/* RF-SL-50 · Carga del archivo de Odoo al tablero de pedidos facturados.
   items: [{ num, cli, nombre, sector, lineas: [{ prod, kg }] }] ya validados. */
function opCargarArchivo(sede, items, uid, detalle) {
  const fecha = hoyISO();
  items.forEach((x) => {
    S.facturados.push({ id: 'f' + (++S.corr.fid), sede, num: x.num, cli: x.cli, nombre: x.nombre, sector: x.sector,
      lineas: x.lineas.map((l) => ({ prod: l.prod, kg: r3(l.kg) })), opcion: null, pos: ++S.corr.asig, pedido: null, fecha, usuario: uid });
  });
  bit(uid, 'Carga de archivo de Odoo', `${SEDES[sede]} · ${detalle}`);
}
/* RF-SL-63 · Mover un pedido facturado al tablero (null) o a una opción de envío */
function opAsignar(idFact, opcion) {
  const f = facturado(idFact);
  if (!f || f.pedido) throw Err('Ese pedido facturado ya no está disponible.');
  if (f.opcion === opcion) return;
  f.opcion = opcion; f.pos = ++S.corr.asig;
}
function opEliminarFacturado(id, uid) {
  const f = facturado(id); if (!f || f.pedido) return;
  S.facturados = S.facturados.filter((x) => x !== f);
  bit(uid, 'Eliminación de pedido facturado', `${SEDES[f.sede]} · ${f.num} · ${nombreFact(f)} · ${kg(totalFact(f))}`);
}
function opVaciarTablero(sede, uid) {
  const fs = facturadosDe(sede, null); if (!fs.length) return 0;
  S.facturados = S.facturados.filter((x) => !fs.includes(x));
  bit(uid, 'Eliminación de pedidos facturados', `${SEDES[sede]} · se vació el tablero · ${fs.length} pedido(s) facturado(s): ${fs.map((f) => f.num).join(', ')}`);
  return fs.length;
}
/* RN-45 · El único dato que se corrige es el sector; si el cliente está en la base, se guarda ahí */
function opCorregirSector(idFact, idSector, uid) {
  const f = facturado(idFact), s = S.sectores.find((x) => x.id === idSector);
  if (!f || !s) throw Err('No se pudo corregir el sector.');
  const antes = sectorFact(f);
  if (antes === s.n) return;
  if (f.cli != null && cliente(f.cli)) cliente(f.cli).s = s.id;
  f.sector = s.n;
  bit(uid, 'Corrección de sector', `${f.num} · ${nombreFact(f)} · de «${antes}» a «${s.n}»${f.cli != null ? ' · guardado en la base de clientes' : ' · solo en este pedido facturado'}`);
}
function opElegirPiloto(sede, cid, piloto) {
  if (!S.opciones[sede]) S.opciones[sede] = {};
  S.opciones[sede][cid] = Object.assign(S.opciones[sede][cid] || {}, { piloto: piloto || null });
}
const nombreOpcion = (opcion) => (opcion === 'recoge' ? 'Cliente recoge en bodega' : (camion(opcion) || {}).n || 'Camión');
function opCancelarOpcion(sede, opcion, uid) {
  const fs = facturadosDe(sede, opcion); if (!fs.length) return 0;
  fs.forEach((f) => { f.opcion = null; f.pos = ++S.corr.asig; });
  bit(uid, 'Cancelación de opción de envío', `${SEDES[sede]} · ${nombreOpcion(opcion)} · ${fs.length} pedido(s) facturado(s) regresan al tablero: ${fs.map((f) => f.num).join(', ')}`);
  return fs.length;
}

/* RF-SL-16 · Enviar Pedido a Bodega desde una opción de envío: crea un pedido
   con todos sus pedidos facturados (puede tener varios clientes, RN-12) */
function opEnviarOpcion(sede, opcion, uid, fecha) {
  fecha = fecha || hoyISO();
  const fs = facturadosDe(sede, opcion);
  if (!fs.length) throw Err('Agregue al menos un pedido facturado a esta opción.');
  const tipo = opcion === 'recoge' ? 'recoge' : 'camion';
  const cam = tipo === 'camion' ? camion(opcion) : null;
  const piloto = tipo === 'camion' ? pilotoOpcion(sede, opcion) : null;
  if (tipo === 'camion' && !cam) throw Err('El camión ya no existe.');
  if (tipo === 'camion' && !(piloto && usuario(piloto))) throw Err(`Elija el piloto de ${cam.n}.`);
  for (const f of fs) for (const l of f.lineas) if (!prod(l.prod)) throw Err(`Un producto del pedido facturado ${f.num} ya no está en el catálogo.`);
  const corr = ++S.corr.ped[sede];
  const p = {
    id: 'p' + (++S.corr.pid), sede, corr, tipo, camion: cam ? cam.id : null, piloto, estado: 'PREP', fecha, facturador: uid,
    facturados: fs.map((f) => f.id), lineas: [], prep: [], hist: [{ estado: 'PREP', fecha, usuario: uid }],
  };
  fs.forEach((f) => {
    const ck = claveRuta(f), nombre = nombreFact(f), sec = sectorFact(f);
    f.lineas.forEach((l) => p.lineas.push({ i: p.lineas.length, fact: f.id, num: f.num, ck, cli: f.cli, nombre, sector: sec, prod: l.prod, kg: r3(l.kg), p2: prod(l.prod).p2 }));
  });
  // líneas de preparación: una por producto, sumando todos los clientes (RF-SL-21), con el Peso de Conversión vigente (RN-33)
  p.lineas.forEach((l) => {
    let x = p.prep.find((y) => y.prod === l.prod);
    if (!x) { x = { prod: l.prod, kg: 0, p2: l.p2, listo: false }; p.prep.push(x); }
    x.kg = r3(x.kg + l.kg);
  });
  fs.forEach((f) => { f.pedido = p.id; });
  S.pedidos.push(p);
  let r = null;
  if (tipo === 'camion') {
    const orden = [];
    p.lineas.forEach((l) => { if (!orden.includes(l.ck)) orden.push(l.ck); });
    r = { id: 'r' + (++S.corr.rid), sede, num: ++S.corr.ruta[sede], fecha, pedido: p.id, camion: cam.id, piloto, orden, recorrido: null, entrega: null };
    S.rutas.push(r);
  }
  S.orden[sede].push(p.id);
  bit(uid, 'Envío de pedido a bodega', `${SEDES[sede]} · pedido ${corr} · ${tipo === 'camion' ? `${cam.n}, ruta ${r.num}, ${nombreUsuario(piloto)}` : 'cliente recoge en bodega'} · pedidos facturados ${fs.map((f) => f.num).join(', ')} · ${kg(totalPedido(p))}`, fecha);
  return p;
}
function opMarcar(pid, prodId) {
  const p = pedido(pid); const x = p && p.prep.find((y) => y.prod === prodId);
  if (!x || p.estado !== 'PREP') return;
  x.listo = !x.listo;                 // no se registra quién marcó (RN-20)
}
function opOrdenPedidos(sede, ids) { S.orden[sede] = ids.filter((id) => (pedido(id) || {}).estado === 'PREP'); }
function opOrdenLineas(pid, prodIds) {
  const p = pedido(pid);
  p.prep = prodIds.map((id) => p.prep.find((x) => String(x.prod) === String(id))).filter(Boolean);
}
function opDespachar(pid, uid, fecha) {
  fecha = fecha || hoyISO();
  const p = pedido(pid);
  if (!p || p.estado !== 'PREP') throw Err('El pedido ya no está en preparación.');
  if (p.prep.some((x) => !x.listo)) throw Err('Faltan líneas por marcar.');
  p.estado = p.tipo === 'camion' ? 'RUTA' : 'DESP';
  p.hist.push({ estado: p.estado, fecha, usuario: uid });
  S.orden[p.sede] = S.orden[p.sede].filter((id) => id !== pid);
  bit(uid, 'Cambio de estado', `${SEDES[p.sede]} · pedido ${p.corr} pasa a ${ESTADOS[p.estado].n}`, fecha);
  return p;
}
/* Ruta: una fila por cliente, sumando sus pedidos facturados (RN-49) */
function clientesRuta(r) {
  const p = pedido(r.pedido), g = {};
  p.lineas.forEach((l) => { g[l.ck] = g[l.ck] || { ck: l.ck, nombre: l.nombre, sector: l.sector, total: 0 }; g[l.ck].total = r3(g[l.ck].total + l.kg); });
  return (r.recorrido || r.orden).map((k) => g[k]).filter(Boolean);
}
function opOrdenRuta(rid, claves) { const r = S.rutas.find((x) => x.id === rid); r.orden = claves.map(String); }
function opEntregar(rid, uid, fecha) {
  fecha = fecha || hoyISO();
  const r = S.rutas.find((x) => x.id === rid); const p = pedido(r.pedido);
  if (p.estado !== 'RUTA') throw Err('La ruta no está en curso.');
  r.recorrido = r.orden.slice(); r.entrega = fecha;          // RN-29
  p.estado = 'ENTR'; p.hist.push({ estado: 'ENTR', fecha, usuario: uid });
  bit(uid, 'Cierre de ruta', `${SEDES[p.sede]} · ruta ${r.num} · pedido ${p.corr} entregado`, fecha);
}

/* ------------------------------------------------------------------ datos iniciales */
function semilla() {
  const D = window.DATOS || { productos: [], sectores: [], clientes: [] };
  S = { v: VER, rev: 0, ts: 0 };
  S.productos = D.productos.map((p, i) => ({ id: i, n: p[0], p2: Number(p[1]) || 0 }));
  S.sectores = D.sectores.map((n, i) => ({ id: i, n }));
  S.clientes = D.clientes.map((c, i) => ({ id: i, n: c[0], s: c[1] }));
  S.camiones = [{ id: 'c1', n: 'Camión 1', cap: 3400, sede: 'XE' }, { id: 'c2', n: 'Camión 2', cap: 3400, sede: 'XE' }, { id: 'c3', n: 'Camión 3', cap: 6000, sede: 'XE' }];
  const sit = PERMISOS.filter((p) => p.s === 'sitio').map((p) => p.c);
  const u = (n, sistema, rol, permisos, sedes, extra = {}) => Object.assign({ id: 'u' + pad(n), nombre: 'Usuario de ejemplo ' + pad(n), usuario: 'ejemplo.' + pad(n), sistema, rol, permisos, sedes, activo: true, correo: '', clave: 'demo' }, extra);
  S.usuarios = [
    u(1, 'ambos', 'Gerencia', [], []),
    u(2, 'ambos', 'Soporte', [], []),
    u(3, 'picking', 'Facturador', ['pk.facturacion'], ['XE']),
    u(4, 'picking', 'Facturador', ['pk.facturacion'], ['XE']),
    u(5, 'picking', 'Bodega', ['pk.bodega'], ['XE']),
    u(6, 'picking', 'Piloto', ['pk.ruta.propias'], ['XE']),
    u(7, 'picking', 'Piloto', ['pk.ruta.propias'], ['XE']),
    u(8, 'sitio', 'Administrativo', sit, [], { correo: 'ejemplo08@correo.com' }),
    u(9, 'sitio', 'Operativo', ['sit.doc.ver', 'sit.doc.descargar'], []),
    u(10, 'sitio', 'Vista general', ['sit.doc.ver'], []),
  ];
  S.nombresEliminados = {};
  S.facturados = []; S.pedidos = []; S.rutas = []; S.bitacora = [];
  S.opciones = { XE: {}, GT: {}, ES: {} };
  S.orden = { XE: [], GT: [], ES: [] };
  S.corr = { ped: { XE: 0, GT: 0, ES: 0 }, ruta: { XE: 0, GT: 0, ES: 0 }, pid: 0, rid: 0, fid: 0, asig: 0, bit: 0, sol: 0, doc: 0, not: 0 };
  S.sitio = {
    // Transcripciones de MISION.jpg y VISION.jpg: texto alternativo de las imágenes (RNF-08)
    mision: 'Ser el aliado estratégico para nuestros clientes y proveedores en la distribución de productos químicos, atendiendo la región CA-4, marcando la diferencia en servicio, con una completa gama de productos para brindar soluciones a las necesidades del mercado, apoyando a cumplir los objetivos de nuestros grupos de interés.',
    vision: 'Ser referentes y acercar soluciones en la distribución de productos químicos satisfaciendo las necesidades de los mercados atendidos, creando valor integral a nuestros grupos de interés a través del crecimiento y mejora continua, con una administración responsable y transparente enfocada en la solidez y el largo plazo.',
    historia: '', valores: '',
    img: { mision: '', vision: '', historia: '', valores: '', inquiserca: '' },   // vacías = las de la empresa (misión y visión) o ninguna
    industrias: Object.fromEntries(INDUSTRIAS.map((x) => [x.id, x.d])),
    indImg: {},
    productos: PRODUCTOS_PUB_BASE.map((x, i) => ({ id: 'pp' + pad(i + 1), n: x[0], desc: '', pres: '', origen: '', ind: x[1], img: i, foto: '' })),
    contacto: {
      XE: { dir: '7a Avenida 1-29 Zona 1, Cantón Llanos de Urbina, Cantel, Quetzaltenango', tel: '7926-7951', correo: 'facturacion@incovsa.com', wa: '4073-0766', horario: '', mapa: MAPAS.XE },
      GT: { dir: '8a Calle "A" 27-70 zona 4, Mixco, Finca El Naranjo, Guatemala', tel: '2436-0936 · 2436-0937', correo: 'recepciongt@incovsa.com', wa: '4073-2260', horario: '', mapa: MAPAS.GT },
    },
    noticias: [], solicitudes: [],
    documentos: [
      { id: 'doc1', tipo: 'FT', nombre: 'FT SODA CAUSTICA MX.pdf', producto: 'Soda Cáustica', pais: 'MX', lote: '', fecha: '2026-09-21T15:50:00', usuario: 'u08', pdf: 'ft' },
      { id: 'doc2', tipo: 'HS', nombre: 'HOJA DE SEGURIDAD SODA CAUSTICA MX.pdf', producto: 'Soda Cáustica', pais: 'MX', lote: '', fecha: '2026-09-21T15:50:00', usuario: 'u08', pdf: 'hs' },
      { id: 'doc3', tipo: 'COA', nombre: 'CAUSTICA MX CAB250526 SKU 4139.pdf', producto: 'Soda Cáustica', pais: 'MX', lote: '4139', fecha: '2026-09-21T15:51:00', usuario: 'u08', pdf: 'coa' },
    ],
  };
  S.corr.doc = 3;

  /* Pedidos de ejemplo de hoy en Quetzaltenango, para que Bodega, Ruta y
     Reportes no arranquen vacíos. Cada cliente es un pedido facturado con un
     número de Odoo de ejemplo (9000N, no existe en el archivo real); los
     productos son del catálogo, con su Peso de Conversión real. */
  const hoy = new Date(); const a = (h, m) => { const d = new Date(hoy); d.setHours(h, m, 0, 0); return d.toISOString(); };
  const P = (nombre) => { const x = S.productos.find((p) => p.n === nombre); return x ? x.id : null; };
  const L = (cli, nombre, k) => ({ cli, prod: P(nombre), kg: k });
  const lote = [
    { t: a(7, 5), op: 'c1', piloto: 'u06', filas: [
      L(1, 'SODA CAUSTICA (CHI-SAC/0025KG)', 1000), L(1, 'SULFURO DE SODIO (TUR-SAC/0025KG)', 500),
      L(4, 'EXTRACTO DE MIMOSA (BRA-SAC/0025KG)', 750), L(14, 'HIDROSULFITO DE SODIO (IND-TON/0050KG)', 300),
      L(14, 'DESENGOMANTE (GUA-GAR/0030KG)', 90), L(27, 'NEGRO SULFUROSO EXTRA HIGH QUALITY (CHI-SAC/0025KG)', 260)] },
    { t: a(7, 40), op: 'recoge', filas: [L(33, 'SODA ASH (CHI-SAC/0025KG)', 150), L(33, 'SULFATO DE MAGNESIO (CHI-SAC/0025KG)', 100)] },
    { t: a(8, 15), op: 'c2', piloto: 'u07', filas: [
      L(40, 'SODA CAUSTICA (POL-SAC/0025KG)', 1250), L(52, 'SULFURO DE SODIO (TUR-SAC/0025KG)', 750),
      L(61, 'EXTRACTO DE MIMOSA ME (SUD-SAC/0020KG)', 400), L(61, 'CLARIFICANTE (CHI-GAR/0020KG)', 120)] },
    { t: a(9, 2), op: 'c3', piloto: 'u06', filas: [
      L(75, 'SULFURO DE SODIO (TUR-SAC/0025KG)', 1500), L(75, 'EXTRACTO DE MIMOSA (BRA-SAC/0025KG)', 1000),
      L(88, 'SODA CAUSTICA (POL-SAC/0025KG)', 800), L(88, 'SULFHIDRATO DE SODIO (CHI-SAC/0025KG)', 500),
      L(97, 'SODA CAUSTICA (CHI-SAC/0025KG)', 600), L(97, 'HIDROSULFITO DE SODIO (IND-TON/0050KG)', 250),
      L(105, 'EXTRACTO DE MIMOSA ME (SUD-SAC/0020KG)', 360), L(105, 'KEUSOL AB-2 (ITA-TON/0200KG)', 400),
      L(105, 'ACIDO FORMICO (CHI-GAR/0035KG)', 105)] },
    { t: a(9, 30), op: 'recoge', filas: [L(120, 'DESENGOMANTE (GUA-GAR/0030KG)', 60), L(120, 'ACIDO OXALICO (CHI-SAC/0025KG)', 55)] },
    { t: a(9, 48), op: 'c1', piloto: 'u07', filas: [
      L(133, 'SODA CAUSTICA (CHI-SAC/0025KG)', 1100), L(133, 'NEGRO SULFUROSO EXTRA HIGH QUALITY (CHI-SAC/0025KG)', 60),
      L(150, 'SODA CAUSTICA (CHI-SAC/0025KG)', 400), L(150, 'SODA ASH (CHI-SAC/0025KG)', 200),
      L(166, 'SULFHIDRATO DE SODIO (CHI-SAC/0025KG)', 1225)] },
  ];
  let num = 90000;
  const listos = [];
  lote.forEach((x) => {
    if (x.filas.some((f) => f.prod == null || !cliente(f.cli))) { console.warn('semilla: falta un producto o un cliente de ejemplo'); return; }
    const clis = []; x.filas.forEach((f) => { if (!clis.includes(f.cli)) clis.push(f.cli); });
    clis.forEach((cid) => {
      const c = cliente(cid);
      S.facturados.push({ id: 'f' + (++S.corr.fid), sede: 'XE', num: String(++num), cli: cid, nombre: c.n, sector: sector(c.s),
        lineas: x.filas.filter((f) => f.cli === cid).map((f) => ({ prod: f.prod, kg: f.kg })), opcion: x.op, pos: ++S.corr.asig, pedido: null, fecha: x.t, usuario: 'u03' });
    });
    if (x.piloto) opElegirPiloto('XE', x.op, x.piloto);
    try { listos.push(opEnviarOpcion('XE', x.op, 'u03', x.t)); } catch (e) { console.warn('semilla', e.message); }
  });
  S.opciones = { XE: {}, GT: {}, ES: {} };
  const [p1, p2, p3, p4] = listos;
  const marcarTodo = (p) => p && p.prep.forEach((l) => { l.listo = true; });
  if (p1) { marcarTodo(p1); opDespachar(p1.id, 'u05', a(8, 20)); opEntregar(rutaDe(p1.id).id, 'u06', a(11, 10)); }
  if (p2) { marcarTodo(p2); opDespachar(p2.id, 'u05', a(8, 5)); }
  if (p3) { marcarTodo(p3); opDespachar(p3.id, 'u05', a(9, 20)); }
  if (p4) p4.prep.slice(0, 3).forEach((l) => { l.listo = true; });
  return S;
}

/* ==========================================================================
   SESIONES Y PERMISOS (una sesión por sistema y por pestaña)
   ========================================================================== */
const claveRol = (r) => norm(r).replace(/\s+/g, '');
/* Gerencia y Soporte: acceso total a los dos sistemas y a todas las sedes (RN-38) */
const esTotal = (u) => !!u && ['gerencia', 'soporte'].includes(claveRol(u.rol));
const esPiloto = (u) => !!u && claveRol(u.rol) === 'piloto';          // RN-46
const tiene = (u, cod) => !!u && (esTotal(u) || (u.permisos || []).includes(cod));
const enSistema = (u, sis) => !!u && (esTotal(u) || u.sistema === sis || u.sistema === 'ambos');
const sedesDe = (u) => (esTotal(u) ? Object.keys(SEDES) : (u.sedes || []).filter((s) => SEDES[s]));
function accesoModulo(u, mod) {
  if (mod === 'facturacion') return tiene(u, 'pk.facturacion');
  if (mod === 'bodega') return tiene(u, 'pk.bodega');
  if (mod === 'ruta') return tiene(u, 'pk.ruta.propias') || tiene(u, 'pk.ruta.todas');
  if (mod === 'reportes') return tiene(u, 'pk.reportes');
  if (mod === 'configuracion') return esTotal(u) || ['pk.cfg.productos', 'pk.cfg.clientes', 'pk.cfg.camiones'].some((c) => tiene(u, c));
  return false;
}
const pilotosDe = (sede) => S.usuarios.filter((u) => u.activo && esPiloto(u) && enSistema(u, 'picking') && sedesDe(u).includes(sede));

function sesion(sis) {
  try { const id = sessionStorage.getItem('incovsa-ses-' + sis); const u = id && usuario(id); return u && u.activo && enSistema(u, sis) ? u : null; } catch (e) { return null; }
}
/* El inicio de sesión queda en la bitácora; el cierre no (RN-39) */
function iniciarSesion(sis, uid) {
  try { sessionStorage.setItem('incovsa-ses-' + sis, uid); } catch (e) {}
  const u = usuario(uid);
  if (u) { bit(uid, 'Inicio de sesión', `${sis === 'picking' ? 'Sistema de picking' : 'Sitio web'} · ${u.usuario}`); guardar(); }
}
function cerrarSesion(sis) { try { sessionStorage.removeItem('incovsa-ses-' + sis); } catch (e) {} }
const iniciales = (n) => String(n).split(/\s+/).filter((x) => /[A-Za-zÁÉÍÓÚÑ]/.test(x[0] || '')).slice(0, 2).map((x) => x[0]).join('').toUpperCase() || 'U';
/* Quien tiene más de una sede elige con el selector de la barra superior */
function sedeTrabajo(u) {
  const ss = sedesDe(u);
  if (ss.length <= 1) return ss[0] || null;
  let s = null; try { s = sessionStorage.getItem('incovsa-sede'); } catch (e) {}
  return ss.includes(s) ? s : ss[0];
}
function fijarSede(s) { try { sessionStorage.setItem('incovsa-sede', s); } catch (e) {} }

/* ==========================================================================
   COMPONENTES
   ========================================================================== */
function toast(msg, tipo = 'ok') {
  const t = document.createElement('div');
  t.className = 'toast t-' + tipo;
  t.innerHTML = ico(tipo === 'error' ? 'alerta' : tipo === 'aviso' ? 'info' : 'check') + `<div>${msg}</div>`;
  $('#avisos').appendChild(t);
  setTimeout(() => { t.style.transition = 'opacity .3s, transform .3s'; t.style.opacity = '0'; t.style.transform = 'translateY(8px)'; }, 3600);
  setTimeout(() => t.remove(), 4000);
}
function modal({ titulo, cuerpo, acciones = [], grande = false, alAbrir }) {
  const capa = $('#capa-modal');
  capa.innerHTML = `<div class="fondo"><div class="modal ${grande ? 'modal-g' : ''}" role="dialog" aria-modal="true">
    <div class="modal-cab"><h3>${titulo}</h3><button class="btn btn-g btn-ico" data-cerrar aria-label="Cerrar">${ico('x')}</button></div>
    <div class="modal-cuerpo">${cuerpo}</div>
    ${acciones.length ? `<div class="modal-pie">${acciones.map((a, i) => `<button class="btn ${a.cls || 'btn-s'}" data-acc="${i}">${a.txt}</button>`).join('')}</div>` : ''}
  </div></div>`;
  const cerrar = () => { capa.innerHTML = ''; document.removeEventListener('keydown', tecla); };
  const tecla = (e) => { if (e.key === 'Escape') cerrar(); };
  document.addEventListener('keydown', tecla);
  $('.fondo', capa).addEventListener('mousedown', (e) => { if (e.target.classList.contains('fondo')) cerrar(); });
  $$('[data-cerrar]', capa).forEach((b) => b.addEventListener('click', cerrar));
  $$('[data-acc]', capa).forEach((b) => b.addEventListener('click', () => {
    const a = acciones[+b.dataset.acc];
    if (!a.fn) return cerrar();
    try { if (a.fn($('.modal', capa)) !== false) cerrar(); } catch (e) { if (e.negocio) toast(e.message, 'error'); else throw e; }
  }));
  if (alAbrir) alAbrir($('.modal', capa), cerrar);
  const f = $('input:not([type=hidden]):not([type=file]), textarea, select', capa); if (f) setTimeout(() => f.focus(), 30);
  return cerrar;
}
function confirmar(titulo, texto, txtOk, fn, cls = 'btn-p') {
  modal({ titulo, cuerpo: `<p style="color:var(--g600);font-size:15.5px">${texto}</p>`, acciones: [{ txt: 'Volver' }, { txt: txtOk, cls, fn }] });
}
/* Ejecuta una operación y muestra el error de negocio si lo hay */
function intentar(fn) {
  try { fn(); return true; } catch (e) { if (e.negocio) { toast(e.message, 'error'); return false; } throw e; }
}

/* Reordenar arrastrando, con mouse o con el dedo (tableta). onFin recibe los data-id en el nuevo orden. */
function ordenable(cont, { item, asa, onFin }) {
  if (!cont) return;
  cont.addEventListener('pointerdown', (e) => {
    const h = e.target.closest(asa); if (!h || !cont.contains(h)) return;
    const it = h.closest(item); if (!it || it.parentElement !== cont) return;
    e.preventDefault();
    const inicial = $$(':scope > ' + item, cont).map((x) => x.dataset.id).join('|');
    it.classList.add('arrastrando'); document.body.classList.add('sin-seleccion');
    const mover = (ev) => {
      const bajo = document.elementFromPoint(ev.clientX, ev.clientY);
      const destino = bajo && bajo.closest(item);
      if (!destino || destino === it || destino.parentElement !== cont) return;
      const hs = $$(':scope > ' + item, cont);
      if (hs.indexOf(it) < hs.indexOf(destino)) destino.after(it); else destino.before(it);
    };
    const fin = () => {
      window.removeEventListener('pointermove', mover); window.removeEventListener('pointerup', fin); window.removeEventListener('pointercancel', fin);
      it.classList.remove('arrastrando'); document.body.classList.remove('sin-seleccion');
      const ids = $$(':scope > ' + item, cont).map((x) => x.dataset.id);
      if (ids.join('|') !== inicial) onFin(ids);
    };
    window.addEventListener('pointermove', mover); window.addEventListener('pointerup', fin); window.addEventListener('pointercancel', fin);
  });
}

/* Llevar un elemento de una zona a otra arrastrando, con la misma mecánica de
   pointer events que ordenable: con mouse desde cualquier parte de la tarjeta
   y con el dedo desde el asa (así la pantalla se sigue desplazando con el dedo).
   onSoltar(id, zona) recibe el data-id del elemento y el data-zona de destino. */
function arrastrable(root, { item, asa, zona, onSoltar }) {
  root.addEventListener('pointerdown', (e) => {
    const it = e.target.closest(item); if (!it || !root.contains(it)) return;
    if (e.target.closest('select, button, input, a, textarea')) return;
    const desdeAsa = !!e.target.closest(asa);
    if (e.pointerType !== 'mouse' && !desdeAsa) return;
    if (e.button !== undefined && e.button !== 0) return;
    const origen = it.closest(zona);
    const x0 = e.clientX, y0 = e.clientY;
    let fantasma = null, sobre = null, ultimo = { x: x0, y: y0 }, giro = null;
    if (desdeAsa) e.preventDefault();
    const empezar = () => {
      const r = it.getBoundingClientRect();
      fantasma = it.cloneNode(true);
      fantasma.classList.add('fantasma');
      Object.assign(fantasma.style, { width: r.width + 'px', left: r.left + 'px', top: r.top + 'px' });
      fantasma.dataset.dx = x0 - r.left; fantasma.dataset.dy = y0 - r.top;
      document.body.appendChild(fantasma);
      it.classList.add('arrastrando'); document.body.classList.add('sin-seleccion', 'moviendo');
      const desplazar = () => {                      // desplaza la página cerca de los bordes (teléfono)
        const m = 70;
        if (ultimo.y < m) window.scrollBy(0, -14); else if (ultimo.y > window.innerHeight - m) window.scrollBy(0, 14);
        giro = requestAnimationFrame(desplazar);
      };
      giro = requestAnimationFrame(desplazar);
    };
    const mover = (ev) => {
      ultimo = { x: ev.clientX, y: ev.clientY };
      if (!fantasma) { if (Math.hypot(ev.clientX - x0, ev.clientY - y0) < 6) return; empezar(); }
      ev.preventDefault();
      fantasma.style.left = (ev.clientX - fantasma.dataset.dx) + 'px';
      fantasma.style.top = (ev.clientY - fantasma.dataset.dy) + 'px';
      const bajo = document.elementFromPoint(ev.clientX, ev.clientY);
      const z = bajo && bajo.closest(zona);
      const nueva = z && root.contains(z) ? z : null;
      if (nueva !== sobre) { if (sobre) sobre.classList.remove('zona-sobre'); sobre = nueva; if (sobre && sobre !== origen) sobre.classList.add('zona-sobre'); }
    };
    const fin = () => {
      window.removeEventListener('pointermove', mover); window.removeEventListener('pointerup', fin); window.removeEventListener('pointercancel', fin);
      if (giro) cancelAnimationFrame(giro);
      if (!fantasma) return;
      fantasma.remove(); it.classList.remove('arrastrando'); document.body.classList.remove('sin-seleccion', 'moviendo');
      if (sobre) sobre.classList.remove('zona-sobre');
      if (sobre && sobre !== origen) onSoltar(it.dataset.id, sobre.dataset.zona);
    };
    window.addEventListener('pointermove', mover, { passive: false }); window.addEventListener('pointerup', fin); window.addEventListener('pointercancel', fin);
  });
}

/* Imágenes que se suben en el panel: se reducen en el navegador para que
   quepan en el almacenamiento de la simulación (la aplicación real las guarda
   en Cloudflare R2). Devuelve una promesa con la imagen como data URL. */
function leerImagen(archivo, max = 900) {
  return new Promise((ok, mal) => {
    if (!archivo || !/^image\//.test(archivo.type)) return mal(Err('El archivo debe ser una imagen.'));
    const lector = new FileReader();
    lector.onerror = () => mal(Err('No se pudo leer la imagen.'));
    lector.onload = () => {
      const img = new Image();
      img.onerror = () => mal(Err('No se pudo leer la imagen.'));
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        let url = c.toDataURL('image/webp', 0.8);
        if (!url.startsWith('data:image/webp')) url = c.toDataURL('image/jpeg', 0.8);
        ok(url);
      };
      img.src = lector.result;
    };
    lector.readAsDataURL(archivo);
  });
}
/* Campo para subir o arrastrar una imagen desde la computadora */
const campoImagen = (nombre, actual, texto = 'Arrastre una imagen aquí o haga clic para elegirla') => `<label class="subida subida-img ${actual ? 'con' : ''}" data-img="${nombre}">
    <span class="vista" ${actual ? `style="background-image:url(${actual})"` : ''}></span>
    <span class="txt">${ico('subir')}<span>${texto}</span></span>
    <input type="file" accept="image/*" hidden></label>`;
/* Conecta los campos de imagen de root; alCambiar(nombre, dataURL) */
function montarImagenes(root, alCambiar) {
  $$('[data-img]', root).forEach((caja) => {
    const tomar = (f) => leerImagen(f).then((url) => {
      caja.classList.add('con'); $('.vista', caja).style.backgroundImage = `url(${url})`;
      alCambiar(caja.dataset.img, url);
    }).catch((e) => toast(e.message || 'No se pudo leer la imagen.', 'error'));
    $('input', caja).addEventListener('change', (e) => { if (e.target.files[0]) tomar(e.target.files[0]); });
    caja.addEventListener('dragover', (e) => { e.preventDefault(); caja.classList.add('zona-sobre'); });
    caja.addEventListener('dragleave', () => caja.classList.remove('zona-sobre'));
    caja.addEventListener('drop', (e) => { e.preventDefault(); caja.classList.remove('zona-sobre'); const f = e.dataTransfer.files[0]; if (f) tomar(f); });
  });
}

/* Silueta del camión (vista lateral), en blanco como los de la flota de la fotografía.
   En el modo oscuro del tablero va en grises (specs/07). */
function siluetaCamion(cap, tema) {
  const grande = cap > 3400, claro = tema === 'claro';
  const L = grande ? 196 : 138;           // largo de la caja
  const x0 = 76, W = x0 + L + 14;
  const tinta = claro ? '#1C1D1C' : '#111113', linea = claro ? '#3C3C3C' : '#CFCFCF';
  const caja = claro ? '#FFFFFF' : '#EDEDED', verde = claro ? '#126C2A' : '#3A3A3D', lima = claro ? '#8DC63F' : '#9A9A9E';
  const rueda = (cx) => `<circle cx="${cx}" cy="92" r="13" fill="${tinta}" stroke="${linea}" stroke-width="1.5"/><circle cx="${cx}" cy="92" r="5.5" fill="${linea}"/>`;
  return `<svg class="silueta" viewBox="0 0 ${W + 6} 116" role="img" aria-label="Camión de ${fmt(cap)} kg">
    <ellipse cx="${W / 2 + 4}" cy="107" rx="${W / 2 - 6}" ry="4.5" fill="#000" opacity=".22"/>
    <rect x="${x0}" y="14" width="${L}" height="66" rx="4" fill="${caja}" stroke="${linea}" stroke-width="1.5"/>
    <rect x="${x0}" y="62" width="${L}" height="7" fill="${verde}"/><rect x="${x0}" y="69" width="${L}" height="2.5" fill="${lima}"/>
    <text x="${x0 + L / 2}" y="46" text-anchor="middle" font-family="Poppins, sans-serif" font-weight="800" font-size="${grande ? 21 : 17}" fill="${verde}" letter-spacing="1.5">INCOVSA</text>
    <path d="M16 82V46c0-6 3-10 9-12l16-7h28v55z" fill="${caja}" stroke="${linea}" stroke-width="1.5"/>
    <path d="M24 49l19-14h20v17H24z" fill="${claro ? '#CFE3F0' : '#BDBDBD'}" stroke="${linea}" stroke-width="1.2"/>
    <rect x="16" y="66" width="53" height="5" fill="${verde}"/>
    <rect x="10" y="80" width="${x0 + L - 4}" height="8" rx="2" fill="${tinta}"/>
    <rect x="12" y="60" width="7" height="5" rx="1" fill="${lima}"/>
    ${rueda(42)}${rueda(x0 + L - 34)}${grande ? rueda(x0 + L - 62) : ''}
  </svg>`;
}
