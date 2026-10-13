/* ==========================================================================
   ENRUTADOR, HERRAMIENTAS DE DEMOSTRACIÓN Y ARRANQUE
   ========================================================================== */
const RUTAS = [
  [/^\/$/, () => Sitio.inicio()],
  [/^\/nosotros$/, () => Sitio.nosotros()],
  [/^\/industrias(?:\/([a-z]+))?$/, (m) => Sitio.industrias(m[1])],
  [/^\/productos$/, (m, q) => Sitio.catalogo(q)],
  [/^\/productos\/([\w-]+)$/, (m) => Sitio.producto(m[1])],
  [/^\/noticias$/, () => Sitio.noticias()],
  [/^\/contacto$/, () => Sitio.contacto()],
  [/^\/acceso$/, () => Sitio.acceso()],
  [/^\/acceso\/(sitio|picking)$/, (m, q) => Sitio.login(m[1], q)],
  [/^\/panel(?:\/([a-z]+))?$/, (m) => Panel.ruta(m[1] || '')],
  [/^\/picking\/tablero$/, (m, q) => Tablero.ruta(q)],
  [/^\/picking\/([a-z]+)$/, (m) => Picking.ruta(m[1])],
  [/^\/picking$/, () => { const u = sesion('picking'); location.hash = u ? Sitio.destinoInicial('picking', u) : '#/acceso/picking'; return null; }],
];
let pagina = null, rutaActual = null;

function render(mantener) {
  const h = location.hash.replace(/^#/, '') || '/';
  const [path, qs] = h.split('?');
  const q = new URLSearchParams(qs || '');
  // Atajo de la demostración: ?cuenta=ejemplo.05 abre la pantalla con esa cuenta
  if (q.get('cuenta')) {
    const u = S.usuarios.find((x) => x.usuario === q.get('cuenta'));
    if (u) iniciarSesion(path.startsWith('/panel') ? 'sitio' : 'picking', u.id);
    q.delete('cuenta');
    history.replaceState(null, '', '#' + path + (q.toString() ? '?' + q : ''));
  }
  const y = window.scrollY, cambio = path !== rutaActual;
  let p;
  for (const [re, fn] of RUTAS) { const m = path.match(re); if (m) { p = fn(m, q); if (p === undefined) p = Sitio.noEncontrada(); break; } }
  if (p === null) return;                      // la ruta redirigió
  pagina = p || Sitio.noEncontrada();
  if (cambio) $('#capa-modal').innerHTML = '';
  rutaActual = path;
  document.body.classList.toggle('en-tablero', !!pagina.tablero);
  const app = $('#app');
  app.innerHTML = pagina.html;
  pagina.mount && pagina.mount(app);
  document.title = (pagina.titulo ? pagina.titulo + ' · ' : '') + 'INCOVSA';
  if (mantener && !cambio) window.scrollTo(0, y); else if (cambio) window.scrollTo(0, 0);
  Demo.pintar();
}
const repintar = () => render(true);

/* Cambios hechos en otra pantalla (otra pestaña o ventana del mismo archivo) */
function alCambiarRemoto() {
  if (pagina && pagina.vivo && !$('#capa-modal').children.length && !document.body.classList.contains('sin-seleccion')) render(true);
  $$('[data-vivo]').forEach((el) => { el.classList.remove('pulso'); void el.offsetWidth; el.classList.add('pulso'); });
  Demo.pintar();
}

/* ------------------------------------------------------------------ demostración */
const Demo = (() => {
  let abierto = false;
  const CUENTAS = [
    ['ejemplo.03', 'Facturador', 'picking', 'Quetzaltenango'], ['ejemplo.05', 'Bodega', 'picking', 'Quetzaltenango'],
    ['ejemplo.06', 'Piloto', 'picking', 'ejemplo.06 · Quetzaltenango'], ['ejemplo.07', 'Piloto', 'picking', 'ejemplo.07 · Quetzaltenango'],
    ['ejemplo.02', 'Soporte', 'picking', 'Picking y sitio · todas las sedes'], ['ejemplo.01', 'Gerencia', 'picking', 'Picking y sitio · todas las sedes'],
    ['ejemplo.08', 'Administrativo', 'sitio', 'Panel del sitio'], ['ejemplo.09', 'Operativo', 'sitio', 'Documentación: ver y descargar'],
    ['ejemplo.10', 'Vista general', 'sitio', 'Documentación: solo ver'],
  ];
  function entrar(usr, sis) {
    const u = S.usuarios.find((x) => x.usuario === usr); if (!u) return;
    iniciarSesion(sis, u.id); abierto = false;
    location.hash = Sitio.destinoInicial(sis, u);
    toast(`Sesión de ${esc(u.nombre)} · ${esc(u.rol)}.`);
  }
  function pintar() {
    const cont = $('#demo');
    const actP = sesion('picking'), actS = sesion('sitio');
    cont.innerHTML = `<button class="demo-btn" data-demo>${ico('estrella', 'ico-s')} Demostración <i></i></button>` + (abierto ? `<div class="demo-panel">
      <div class="cab"><h3>Herramientas de la demostración</h3><p>Sirven para presentar la simulación. No forman parte del sistema.</p></div>
      <div class="sec-d"><h4>Entrar como</h4><div class="demo-cuentas">${CUENTAS.map(([usr, r, sis, d]) => { const on = (sis === 'picking' ? actP : actS); return `<button data-cuenta="${usr}" data-sis="${sis}" class="${on && on.usuario === usr ? 'on' : ''}"><b>${r}</b>${d}</button>`; }).join('')}</div></div>
      <div class="sec-d"><h4>Tiempo real entre pantallas</h4>
        <p style="font-size:13.5px;color:var(--g600);margin-bottom:10px">Abra el tablero en otra pestaña o ventana. Lo que se marque, reordene o despache en una se ve al instante en la otra.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-p btn-sm" data-abrir="#/picking/tablero?cuenta=ejemplo.05&tema=oscuro">${ico('luna', 'ico-s')} Tablero oscuro</button>
          <button class="btn btn-s btn-sm" data-abrir="#/picking/tablero?cuenta=ejemplo.05&tema=claro">${ico('sol', 'ico-s')} Tablero claro</button>
          <button class="btn btn-s btn-sm" data-abrir="#/picking/facturacion?cuenta=ejemplo.03">${ico('factura', 'ico-s')} Facturación</button></div></div>
      <div class="sec-d"><h4>Pendientes con INCOVSA</h4>
        <label class="chk" style="font-size:14px"><input type="checkbox" data-pend ${UI.pendientes ? 'checked' : ''}> Mostrar las notas de pendientes (P-xx)</label></div>
      <div class="sec-d"><h4>Recorrido sugerido</h4><ol class="guia">
        <li>Sitio público: Inicio con los mapas, catálogo y formulario de contacto.</li>
        <li><b>Facturador</b>: cargar <span class="mono">Data Odo Para Picking.xlsx</span>, agregar los productos y clientes que faltan, arrastrar pedidos facturados a los camiones y a «Cliente recoge en bodega», y enviar.</li>
        <li><b>Bodega</b> en el tablero: marcar líneas, cambiar la prioridad y despachar.</li>
        <li><b>Piloto</b>: reordenar clientes y entregar la ruta.</li>
        <li><b>Gerencia o Soporte</b>: reportes por periodo, bitácora, configuración y usuarios con permisos.</li>
        <li><b>Administrativo</b>: solicitudes y documentos internos.</li></ol></div>
      <div class="sec-d" style="border:0;display:flex;justify-content:space-between;align-items:center;gap:10px"><span style="font-size:12.5px;color:var(--g500)">${S.pedidos.length} pedidos · ${S.facturados.filter((f) => !f.pedido && f.opcion === null).length} pedidos facturados en el tablero · ${S.bitacora.length} registros de bitácora</span>
        <button class="btn btn-d btn-sm" data-reiniciar>${ico('ciclo', 'ico-s')} Reiniciar datos</button></div>
    </div>` : '');
    $('[data-demo]', cont).addEventListener('click', () => { abierto = !abierto; pintar(); });
    if (!abierto) return;
    $$('[data-cuenta]', cont).forEach((b) => b.addEventListener('click', () => entrar(b.dataset.cuenta, b.dataset.sis)));
    $$('[data-abrir]', cont).forEach((b) => b.addEventListener('click', () => window.open(location.href.split('#')[0] + b.dataset.abrir, '_blank')));
    $('[data-pend]', cont).addEventListener('change', (e) => { UI.pendientes = e.target.checked; guardarUI(); });
    $('[data-reiniciar]', cont).addEventListener('click', () => confirmar('Reiniciar la simulación', 'Se borran los pedidos, los pedidos facturados del tablero y los cambios hechos durante la demostración, y se vuelve a los datos iniciales. Afecta a todas las pestañas abiertas.', 'Reiniciar', () => {
      S = semilla(); guardar(); abierto = false; toast('Datos de la simulación reiniciados.'); repintar();
    }, 'btn-d'));
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && abierto) { abierto = false; pintar(); } });
  return { pintar };
})();

/* ------------------------------------------------------------------ arranque */
cargarEstado();
guardarUI();
window.addEventListener('hashchange', () => render(false));
let esperaTam = null;
window.addEventListener('resize', () => { clearTimeout(esperaTam); esperaTam = setTimeout(() => pagina && pagina.alRedimensionar && pagina.alRedimensionar(), 120); });
setInterval(() => $$('[data-reloj]').forEach((el) => { el.textContent = Tablero.reloj(); }), 10000);
render(false);
