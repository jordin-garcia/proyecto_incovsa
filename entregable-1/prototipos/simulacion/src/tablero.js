/* ==========================================================================
   TABLERO DE BODEGA · Pickit Visual (specs/07-picking-bodega.md)
   El mismo módulo de Bodega proyectado en una TV o usado en una tableta.
   Todo el pedido en curso cabe en una pantalla, sin desplazamiento: la altura
   de cada línea se calcula según las líneas que tenga el pedido.
   ========================================================================== */
const Tablero = (() => {
  let verPed = null;            // pedido que esta pantalla está viendo (local, no se comparte)
  let marcasPrevias = {};       // para resaltar lo que cambió en otra pantalla
  /* Modo claro (el antiguo «Tableta») y modo oscuro en negros y grises (specs/07). Se guarda por pantalla. */
  const tema = () => { let t = null; try { t = sessionStorage.getItem('incovsa-tb-tema'); } catch (e) {} return t === 'claro' ? 'claro' : 'oscuro'; };
  const fijarTema = (t) => { try { sessionStorage.setItem('incovsa-tb-tema', t); } catch (e) {} };
  const reloj = () => { const d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };

  function ruta(q) {
    const u = sesion('picking');
    if (q.get('tema')) {     // se aplica una vez y se quita de la dirección para que los botones sigan funcionando
      fijarTema(q.get('tema') === 'claro' ? 'claro' : 'oscuro');
      q.delete('tema'); history.replaceState(null, '', '#/picking/tablero' + (q.toString() ? '?' + q : ''));
    }
    if (!u) { location.hash = '#/acceso'; return null; }
    if (!tiene(u, 'pk.bodega') || !sedeTrabajo(u)) { location.hash = Sitio.destinoInicial('picking', u); return null; }
    return pagina(u);
  }

  function pagina(u) {
    const sede = sedeTrabajo(u), t = tema();
    const lista = Picking.pedidosBodega(sede);
    let p = lista.find((x) => x.id === verPed) || lista[0] || null;
    if (p) verPed = p.id;
    const pos = p ? lista.indexOf(p) : -1;
    const html = `<div class="tb" data-tema="${t}">
      <header class="tb-sup">
        <img src="${t === 'oscuro' ? A.logoBlanco : A.logo}" alt="INCOVSA Químicos">
        <div class="tb-tit"><small>Tablero de preparación</small><b>Bodega ${SEDES[sede]}</b></div>
        <div class="der">
          <span class="tb-pill" data-vivo><i></i>En vivo</span>
          <span class="tb-pill">${ico('lista', 'ico-s')} ${lista.length} en cola</span>
          <span class="tb-reloj" data-reloj>${reloj()}</span>
          <button class="tb-btn ${t === 'claro' ? 'on' : ''}" data-tema="claro">${ico('sol')} Modo claro</button>
          <button class="tb-btn ${t === 'oscuro' ? 'on' : ''}" data-tema="oscuro">${ico('luna')} Modo oscuro</button>
          <button class="tb-btn" data-completa title="Pantalla completa">${ico('completa')}</button>
          <a class="tb-btn" href="#/picking/bodega" title="Volver al módulo">${ico('salir')}</a>
        </div>
      </header>
      <div class="tb-cuerpo">${p ? actual(p, pos, lista.length) + lateral(p, lista, t) : `<div class="tb-vacio">${ico('check')}<h2>No hay rutas ni pedidos por preparar</h2><p>Cuando Facturación envíe una ruta o un pedido aparecerá aquí al instante.</p></div>`}</div>
      <div class="tb-nota">Simulación · la prioridad y las marcas se comparten con todas las pantallas abiertas de la sede y no quedan en el historial.</div>
    </div>`;
    return { titulo: 'Tablero de Bodega', vivo: true, tablero: true, html, mount: (root) => montar(root, u, p, lista, sede), alRedimensionar: () => ajustar($('.tb', document)) };
  }

  function actual(p, pos, total) {
    const listas = p.prep.filter((x) => x.listo).length, n = p.prep.length;
    const circ = 2 * Math.PI * 42, avance = n ? listas / n : 0;
    // Fecha y hora programadas, no la hora de envío desde Facturación (RF-SL-75)
    const meta = `<span class="tb-programada">${ico('calendario')} Programada <b>${fProg(p)}</b></span>` + (esRuta(p)
      ? `<span>${ico('camion')} <b>${esc((camion(p.camion) || {}).n || '—')}</b></span><span>${ico('usuario')} <b>${esc(nombreUsuario(p.piloto))}</b></span>`
      : `<span>${ico('edificio')} <b>El cliente recoge en bodega</b></span>`);
    return `<section class="tb-actual">
      <div class="tb-cab">
        <div class="tb-num ${esRuta(p) ? '' : 'recoge'}"><small>${esRuta(p) ? 'Ruta' : 'Pedido'}</small><b>${p.num}</b></div>
        <div style="min-width:0"><h2>Prioridad ${pos + 1} de ${total} <span class="tb-tipo">${esRuta(p) ? 'Envío en camión' : 'Recoge en bodega'}</span></h2>
          <div class="tb-meta">${meta}</div></div>
        <div class="tb-prog">
          <div class="tb-anillo"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" stroke-opacity=".15" stroke-width="9"/><circle cx="50" cy="50" r="42" fill="none" stroke="var(--tb-ok)" stroke-width="9" stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${circ * (1 - avance)}" style="transition:stroke-dashoffset .5s"/></svg><span>${listas}/${n}</span></div>
          <div class="tot"><b class="num">${fmt(totalPedido(p))}</b><small>kg en ${n} línea(s)</small></div>
        </div>
      </div>
      <div class="tb-herr">${Picking.herramientas(p, 'tb-btn tb-btn-s')}</div>
      <div class="tb-lineas" data-lineas>${p.prep.map((l, i) => linea(l, i, p)).join('')}</div>
      <div class="tb-pie">
        <div class="txt">${listas === n ? `<b>Todo listo.</b> Al despachar, ${esRuta(p) ? 'la ruta pasa a <b>En Ruta</b>' : 'el pedido pasa a <b>Despachado</b>'}.` : `Toque cada línea cuando el producto esté fuera de la bodega. Faltan <b>${n - listas}</b>.`}</div>
        <button class="tb-despachar" data-despachar ${listas === n ? '' : 'disabled'}>${ico('check')} ${esRuta(p) ? 'Ruta Despachada' : 'Pedido Despachado'}</button>
      </div>
    </section>`;
  }

  function linea(l, i, p) {
    const pr = { n: l.prod || '—' }, base = pr.n.replace(/\s*\(.*\)\s*$/, ''), { u, r } = convertir(l.kg, l.p2);
    const resto = r > 0 ? r : null;
    const clave = p.id + ':' + l.id;
    const cambio = clave in marcasPrevias && marcasPrevias[clave] !== l.listo;
    return `<div class="tb-linea ${l.listo ? 'lista' : ''} ${cambio ? 'recien' : ''}" data-id="${l.id}" role="button" aria-pressed="${l.listo}" tabindex="0">
      <span class="asa-tb" title="Arrastre para cambiar el orden">${ico('asa')}</span>
      <span class="ord">${i + 1}</span>
      <div class="prod"><b>${esc(base || pr.n)}</b><small class="cod-l"><span class="lote-tb ${l.lote ? '' : 'sin'}">${l.lote ? 'Lote ' + esc(l.lote) : 'Sin lote'}</span><span class="cod-n">${esc(pr.n)}</span></small></div>
      <div class="kg"><span class="num">${fmt(l.kg)} kg</span><small>÷ ${fmt(l.p2)} kg</small></div>
      <div class="un"><div class="un-n"><b class="num">${fmt(u)}</b><small>${u === 1 ? 'unidad' : 'unidades'}</small>${resto !== null ? `<span class="resto">+ ${fmt(resto)} kg</span>` : ''}</div>
        <span class="chk-tb">${ico('check')}</span></div>
    </div>`;
  }

  function lateral(p, lista, t) {
    let carga;
    if (esRuta(p)) {
      const c = camion(p.camion) || { n: '—', cap: 1 }, tot = totalPedido(p), pct = Math.min(100, (tot / c.cap) * 100);
      const segs = p.prep.map((l, i) => `<div class="seg ${l.listo ? 'lista' : ''}" style="width:${(l.kg / Math.max(c.cap, tot)) * 100}%" title="${esc(l.prod)} · lote ${esc(l.lote || '—')} · ${kg(l.kg)}">${(l.kg / Math.max(c.cap, tot)) > 0.035 ? i + 1 : ''}</div>`).join('');
      carga = `<div class="tb-camion">
        <div class="tt"><b>${esc(c.n)}</b><small>Capacidad ${fmt(c.cap)} kg</small></div>
        ${siluetaCamion(c.cap, t)}
        <div class="tb-carga"><b class="num">${fmt(tot)} kg</b><span>${Math.round((tot / c.cap) * 100)} % de la capacidad</span></div>
        <div class="tb-barra ${tot >= c.cap ? 'lleno' : ''}"><i style="width:${pct}%"></i></div>
        <div class="tb-plano"><div class="lbl"><span>Ocupación por peso, en el orden del tablero</span><span>Propuesta visual</span></div>
          <div class="cama"><div class="cabina">CABINA</div>${segs}</div></div>
      </div>`;
    } else {
      carga = `<div class="tb-camion"><div class="tb-recoge">${ico('edificio')}<b>El cliente recoge en bodega</b><span>No pasa por Ruta. Al despachar, el pedido termina como Despachado.</span></div>
        <div class="tb-carga"><b class="num">${fmt(totalPedido(p))} kg</b><span>${p.prep.length} producto(s)</span></div></div>`;
    }
    const cola = lista.map((x, i) => {
      const listas = x.prep.filter((y) => y.listo).length;
      return `<div class="tb-sig ${x.id === p.id ? 'on' : ''}" data-id="${x.id}" data-ver="${x.id}" role="button" tabindex="0">
        <span class="asa-tb" title="Arrastre para cambiar la prioridad">${ico('asa')}</span>
        <div class="d"><span class="pos">Prioridad ${i + 1}</span><b>${etiqueta(x)} · ${esRuta(x) ? esc((camion(x.camion) || {}).n || '—') : 'Recoge en bodega'}</b>
          <small>${x.prep.length} líneas · ${kg(totalPedido(x))} · programada ${x.prog.slice(11, 16)}</small>
          <div class="mini"><i style="width:${(listas / x.prep.length) * 100}%"></i></div></div>
        <span class="p">${listas}/${x.prep.length}</span></div>`;
    }).join('');
    return `<aside class="tb-lado">${carga}
      <div class="tb-cola"><div class="tt"><b>Cola de pedidos</b><small>Arrastre para priorizar</small></div><div class="tb-cola-lista" data-cola>${cola}</div></div></aside>`;
  }

  /* Altura de cada línea para que el pedido completo quepa en pantalla */
  function ajustar(tb) {
    if (!tb) return;
    const cont = $('[data-lineas]', tb); if (!cont) return;
    const ls = $$('.tb-linea', cont), n = ls.length; if (!n) return;
    if (window.innerWidth <= 720) { ls.forEach((l) => { l.style.removeProperty('--alto'); l.style.height = ''; l.style.fontSize = ''; }); cont.classList.remove('dos'); cont.style.gridTemplateRows = ''; return; }
    const cs = getComputedStyle(cont);
    const H = cont.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const gap = parseFloat(cs.rowGap) || 8;
    let cols = 1, filas = n;
    if ((H - gap * (n - 1)) / n < 50 && cont.clientWidth > 900) { cols = 2; filas = Math.ceil(n / 2); }
    cont.classList.toggle('dos', cols === 2);
    const alto = Math.max(44, Math.min(132, (H - gap * (filas - 1)) / filas));
    // En dos columnas se numera de arriba hacia abajo: la columna izquierda y después la derecha (RF-SL-77)
    cont.style.gridTemplateRows = cols === 2 ? `repeat(${filas}, ${alto}px)` : '';
    const ancho = (cont.clientWidth - (cols - 1) * gap) / cols;
    const letra = Math.min(alto * 0.2, ancho / (cols === 2 ? 29 : 44));
    ls.forEach((l) => { l.style.setProperty('--alto', alto + 'px'); l.style.height = alto + 'px'; l.style.fontSize = letra + 'px'; });
  }

  function montar(root, u, p, lista, sede) {
    const tb = $('.tb', root);
    requestAnimationFrame(() => ajustar(tb));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ajustar($('.tb', document)));
    marcasPrevias = {};
    lista.forEach((x) => x.prep.forEach((l) => { marcasPrevias[x.id + ':' + l.id] = l.listo; }));
    $$('[data-tema]', tb).forEach((b) => b.addEventListener('click', () => { if (b.tagName === 'BUTTON') { fijarTema(b.dataset.tema); repintar(); } }));
    $('[data-completa]', tb).addEventListener('click', () => { const d = document.documentElement; if (!document.fullscreenElement) (d.requestFullscreen || d.webkitRequestFullscreen || (() => {})).call(d); else document.exitFullscreen(); });
    if (!p) return;
    const lineas = $('[data-lineas]', tb);
    const alternar = (el) => { opMarcar(p.id, el.dataset.id); guardar(); repintar(); };
    $('.tb-herr', tb).addEventListener('click', (e) => {
      const t = e.target.closest('[data-todo]'); if (t) { opMarcarTodo(p.id, t.dataset.v === '1'); guardar(); repintar(); return; }
      const w = e.target.closest('[data-peso]'); if (w) { opOrdenPeso(p.id); guardar(); repintar(); return; }
      if (e.target.closest('[data-detalle]')) Picking.detalle(p);
    });
    lineas.addEventListener('click', (e) => { if (e.target.closest('.asa-tb')) return; const el = e.target.closest('.tb-linea'); if (el) alternar(el); });
    lineas.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('tb-linea')) { e.preventDefault(); alternar(e.target); } });
    ordenable(lineas, { item: '.tb-linea', asa: '.asa-tb', onFin: (ids) => { opOrdenLineas(p.id, ids); guardar(); repintar(); } });
    const cola = $('[data-cola]', tb);
    cola.addEventListener('click', (e) => { if (e.target.closest('.asa-tb')) return; const el = e.target.closest('[data-ver]'); if (el) { verPed = el.dataset.ver; repintar(); } });
    ordenable(cola, { item: '.tb-sig', asa: '.asa-tb', onFin: (ids) => { opOrdenPedidos(sede, ids); guardar(); repintar(); } });
    const d = $('[data-despachar]', tb);
    d.addEventListener('click', () => Picking.despachar(p, u, (x) => {
      verPed = null;
      const capa = document.createElement('div');
      capa.className = 'tb-hecho'; capa.dataset.tema = tema();
      capa.innerHTML = `<div><div class="ok">${ico('check')}</div><h2>${etiqueta(x)} ${esRuta(x) ? 'despachada' : 'despachado'}</h2><p>Pasa a ${esRuta(x) ? `En Ruta · ${esc(nombreUsuario(x.piloto))}` : 'Despachado'}</p></div>`;
      document.body.appendChild(capa);
      setTimeout(() => { capa.remove(); repintar(); }, 1900);
    }));
  }
  return { ruta, reloj };
})();
