/* ==========================================================================
   SISTEMA DE PICKING (specs/06 a 11, 12 y 14)
   Desde el 13/10/2026 (reunión 5): los datos del archivo de Odoo se usan tal como
   vienen; lo que sale del camión es una ruta y lo que recoge el cliente, un pedido.
   ========================================================================== */
const Picking = (() => {
  const USA_SEDE = ['facturacion', 'bodega', 'ruta', 'reportes'];

  function vista(mod, u, cuerpo, mount, vivo = false) {
    const sede = sedeTrabajo(u);
    // Bodega ya no muestra el contador en la barra lateral (RF-SL-76)
    const nav = MODULOS_P.filter((m) => accesoModulo(u, m.id)).map((m) => ({ href: '#/picking/' + m.id, n: m.n, i: m.i, on: m.id === mod }));
    if (tiene(u, 'pk.bodega')) nav.push({ href: '#/picking/tablero', n: 'Tablero', i: 'tv' });
    const ss = sedesDe(u);
    const selSede = ss.length > 1 && USA_SEDE.includes(mod)
      ? `<label class="sede-sel">${ico('pin', 'ico-s')}<select class="sel" data-sede aria-label="Sede">${ss.map((k) => `<option value="${k}" ${k === sede ? 'selected' : ''}>${SEDES[k]}</option>`).join('')}</select></label>`
      : `<span class="chip">${ico('pin', 'ico-s')} ${esTotal(u) || ss.length > 1 ? (USA_SEDE.includes(mod) && sede ? SEDES[sede] : 'Todas sus sedes') : (sede ? SEDES[sede] : 'Sin sede')}</span>`;
    const m = MODULOS_P.find((x) => x.id === mod);
    return {
      titulo: m ? m.n : '', vivo,
      html: armazon({ sistema: 'picking', u, nav, miga: `Sistema de picking ${ico('flecha', 'ico-s')} <b>${m ? m.n : ''}</b>`, derecha: `<span class="vivo" data-vivo><i></i>En vivo</span>${selSede}`, cuerpo }),
      mount(root) {
        montarArmazon(root, 'picking');
        const s = $('[data-sede]', root);
        if (s) s.addEventListener('change', () => { fijarSede(s.value); rutaSel = null; selFact.clear(); scrollTab = 0; repintar(); });
        mount && mount(root);
      },
    };
  }
  /* Encabezado de cada módulo: la instrucción, breve, a la par del título */
  const cab = (eyebrow, titulo, texto, acc = '') => `<div class="cab-pag cab-fx"><div class="cab-fx-t"><div><p class="eyebrow">${eyebrow}</p><h1>${titulo}</h1></div>${texto ? `<p class="cab-fx-txt">${texto}</p>` : ''}</div>${acc ? `<div class="acc">${acc}</div>` : ''}</div>`;

  function ruta(mod) {
    const u = sesion('picking');
    if (!u) { location.hash = '#/acceso'; return null; }
    const m = MODULOS_P.find((x) => x.id === mod);
    if (!m) return vista('', u, `<div class="tarjeta vacio">${ico('buscar')}<h4>Módulo no encontrado</h4></div>`);
    if (!accesoModulo(u, mod)) return vista(mod, u, sinAcceso('picking', u, `Sus permisos no incluyen ${m.n}. Los asignan Gerencia o Soporte.`));
    if (USA_SEDE.includes(mod) && !sedeTrabajo(u)) return vista(mod, u, sinAcceso('picking', u, 'Su cuenta no tiene sedes asignadas. Gerencia o Soporte las asignan en Configuración.'));
    return ({ facturacion, bodega, ruta: rutaMod, reportes, configuracion })[mod](u);
  }

  /* ======================================================================
     FACTURACIÓN (specs/06)
     El tablero de pedidos facturados y las dos opciones de envío se guardan en S,
     que hace de base de datos (RN-48): sobreviven a cerrar la sesión.
     ====================================================================== */
  const selFact = new Set();        // pedidos facturados seleccionados en el tablero (solo en esta pantalla)
  let scrollTab = 0;                // desplazamiento del tablero, que se conserva al volver a pintar
  const accSel = (n) => (n ? `<span class="chip chip-v">${n} seleccionado(s)</span><button class="btn btn-d btn-sm" data-eliminar>${ico('borrar', 'ico-s')} Eliminar</button>` : '');
  function facturacion(u) {
    const sede = sedeTrabajo(u);
    const tab = facturadosDe(sede, null);
    [...selFact].forEach((id) => { if (!tab.some((f) => f.id === id)) selFact.delete(id); });
    const totTab = r3(tab.reduce((a, f) => a + totalFact(f), 0)), nSel = selFact.size;
    return vista('facturacion', u, cab('Módulo de facturación', 'Pedidos facturados', 'Cargue el .xlsx de Odoo, seleccione los pedidos facturados, arrástrelos a una opción de envío y envíela a Bodega.',
        `<label class="btn btn-p" tabindex="0">${ico('subir')} Cargar archivo .xlsx<input type="file" accept=".xlsx" hidden data-archivo></label>`) + `
      <div class="fx-lay" data-fx>
        <section class="tarjeta fx-tablero">
          <div class="bloque-cab fx-tab-cab"><div><h3>Tablero de pedidos facturados</h3><p>${tab.length} pedido(s) facturado(s) · ${kg(totTab)} · ${SEDES[sede]}</p></div>
            <div class="fx-tab-acc"><label class="chk"><input type="checkbox" data-todos ${tab.length && nSel === tab.length ? 'checked' : ''} ${tab.length ? '' : 'disabled'}> Seleccionar todos</label>
              <span class="fx-sel-acc" data-sel-acc>${accSel(nSel)}</span></div></div>
          <div class="fx-zona fx-lista" data-zona="tablero">${tab.length ? tab.map(tarjetaFact).join('') : `<div class="fx-vacio">${ico('archivo')}<h4>No hay pedidos facturados en el tablero</h4><p>Cargue el archivo de Odoo, o arrastre aquí un pedido facturado para regresarlo de una opción de envío.</p></div>`}</div>
        </section>
        <div class="fx-opciones">
          <p class="fx-tit">Opciones de envío</p>
          ${opcionCamion(sede)}
          ${opcionRecoge(sede)}
        </div>
      </div>
      <p class="muted fx-ayuda">Clic o toque en una tarjeta para seleccionarla. Arrastre con el mouse, o con el dedo después de mantenerlo presionado sobre la tarjeta. Dentro de una opción, arrastre para cambiar el orden: con ese orden se envía a Bodega. Lo que está en el tablero y en cada opción se guarda.</p>`,
      (root) => montarFacturacion(root, u, sede), true);
  }
  /* Seleccionada, la tarjeta muestra solo el número y el peso total */
  const tarjetaFact = (f) => `<article class="fx-t ${selFact.has(f.id) ? 'elegida' : ''}" data-id="${f.id}" role="button" tabindex="0" aria-pressed="${selFact.has(f.id)}" title="Clic para seleccionar; arrastre para llevarlo a una opción de envío">
      <span class="fx-check" aria-hidden="true">${ico('check', 'ico-s')}</span>
      <div class="fx-t-1"><b class="mono">${esc(f.num)}</b><span class="mono fx-kg">${fmt(totalFact(f))} kg</span></div>
      <div class="fx-t-n">${esc(nombreFact(f))}</div>
      <div class="fx-t-s">${esc(sectorFact(f))}</div>
      <ul class="fx-prods" aria-label="Productos del pedido facturado">${f.lineas.map((l) => `<li><span class="p">${esc(l.prod)}</span><span class="k mono">${fmt(l.kg)} kg</span></li>`).join('')}</ul>
    </article>`;
  const filaOpcion = (f, i) => `<div class="fx-f" data-id="${f.id}" title="Arrastre para cambiar el orden, llevarlo a la otra opción o regresarlo al tablero"><span class="fx-ord">${i + 1}</span><b class="mono">${esc(f.num)}</b><span class="n">${esc(nombreFact(f))}</span><span class="mono fx-kg">${fmt(totalFact(f))} kg</span></div>`;
  const zonaVacia = '<div class="fx-zona-vacia">Arrastre aquí pedidos facturados</div>';
  const camposProg = (sede, op, que) => { const o = opcionDe(sede, op); return `<div class="rejilla r2 fx-prog">
      <label class="campo"><span>Fecha programada de ${que} *</span>${campoFecha(`data-prog-fecha="${op}"`, o.fecha, o.fecha ? '' : 'falta')}</label>
      <label class="campo"><span>Hora programada *</span><span class="campo-caja">
        <input type="text" class="inp ${o.hora ? '' : 'falta'}" data-prog-hora="${op}" value="${o.hora || ''}" placeholder="HH:MM" inputmode="numeric" maxlength="5" autocomplete="off">
        <button type="button" class="campo-btn" data-reloj-hora="${op}" title="Elegir la hora" aria-label="Elegir la hora">${ico('reloj', 'ico-s')}</button>
        <input type="time" class="campo-nativo" data-hora-nativa="${op}" tabindex="-1" aria-hidden="true"></span></label></div>`; };
  /* Hora en formato de 24 horas: «1330», «13:30» o «9:05» → «13:30», «09:05»; vacía si no es válida */
  const horaValida = (x) => { const m = String(x).trim().match(/^(\d{1,2}):?(\d{2})$/); return m && +m[1] < 24 && +m[2] < 60 ? pad(+m[1]) + ':' + m[2] : ''; };
  function opcionCamion(sede) {
    const fs = facturadosDe(sede, 'camion'), tot = r3(fs.reduce((a, f) => a + totalFact(f), 0));
    const o = opcionDe(sede, 'camion'), cs = camionesDe(sede), c = camion(o.camion), ps = pilotosDe(sede);
    const exceso = c && tot > c.cap, pct = c ? Math.min(100, (tot / c.cap) * 100) : 0;
    const listo = fs.length && c && o.piloto && o.fecha && o.hora;
    return `<section class="tarjeta fx-op ${exceso ? 'exceso' : ''}">
      <div class="fx-op-cab"><span class="ic">${ico('camion')}</span><div><h3>Envío por camión</h3><small>Al enviarse se crea una <b>ruta</b></small></div><span class="chip">${fs.length} pedido(s) facturado(s)</span></div>
      <div class="rejilla r2">
        <label class="campo"><span>Camión *</span><select class="sel" data-op-camion>${cs.length ? `<option value="">Elija el camión</option>${cs.map((x) => `<option value="${x.id}" ${x.id === o.camion ? 'selected' : ''}>${esc(x.n)} · ${fmt(x.cap)} kg</option>`).join('')}` : '<option value="">Sin camiones en la sede</option>'}</select></label>
        <label class="campo"><span>Piloto *</span><select class="sel" data-op-piloto>${ps.length ? `<option value="">Elija el piloto</option>${ps.map((p) => `<option value="${p.id}" ${p.id === o.piloto ? 'selected' : ''}>${esc(p.nombre)}</option>`).join('')}` : '<option value="">Sin pilotos en la sede</option>'}</select></label>
      </div>
      ${cs.length ? '' : pend('P-01', `${SEDES[sede]} no tiene camiones registrados. Solo se conocen los 3 camiones de Quetzaltenango.`)}
      ${camposProg(sede, 'camion', 'envío')}
      <div class="fx-zona fx-mini" data-zona="camion">${fs.length ? fs.map(filaOpcion).join('') : zonaVacia}</div>
      ${c ? `<div><div class="fx-peso"><span>Peso acumulado</span><span class="mono">${fmt(tot)} / ${fmt(c.cap)} kg</span></div>
        <div class="medidor ${exceso ? 'exceso' : tot === c.cap ? 'lleno' : ''}"><i style="width:${pct}%"></i></div></div>`
      : `<div class="fx-peso"><span class="muted">Elija el camión para comparar con su capacidad</span><span class="mono">${fmt(tot)} kg</span></div>`}
      ${exceso ? `<div class="aviso aviso-a">${ico('alerta')}<div><strong>Sobrepeso.</strong> El total (${kg(tot)}) excede la capacidad de ${esc(c.n)} en ${kg(r3(tot - c.cap))}. La alerta solo informa: se puede enviar igual (RN-13).</div></div>` : ''}
      <div class="fx-acc"><button class="btn btn-s btn-sm" data-cancelar="camion" ${fs.length ? '' : 'disabled'}>Cancelar</button>
        <button class="btn btn-p btn-sm" data-enviar="camion" ${listo ? '' : 'disabled'} title="${listo ? '' : 'Faltan pedidos facturados, camión, piloto, fecha u hora'}">${ico('flecha', 'ico-s')} Enviar a Bodega</button></div>
    </section>`;
  }
  function opcionRecoge(sede) {
    const fs = facturadosDe(sede, 'recoge'), tot = r3(fs.reduce((a, f) => a + totalFact(f), 0)), o = opcionDe(sede, 'recoge');
    const listo = fs.length && o.fecha && o.hora;
    return `<section class="tarjeta fx-op">
      <div class="fx-op-cab"><span class="ic">${ico('edificio')}</span><div><h3>Cliente recoge en bodega</h3><small>Al enviarse se crea un <b>pedido</b>; no pasa por Ruta</small></div><span class="chip">${fs.length} pedido(s) facturado(s)</span></div>
      ${camposProg(sede, 'recoge', 'despacho')}
      <div class="fx-zona fx-mini" data-zona="recoge">${fs.length ? fs.map(filaOpcion).join('') : zonaVacia}</div>
      <div class="fx-peso"><span>Total</span><span class="mono">${fmt(tot)} kg</span></div>
      <div class="fx-acc"><button class="btn btn-s btn-sm" data-cancelar="recoge" ${fs.length ? '' : 'disabled'}>Cancelar</button>
        <button class="btn btn-p btn-sm" data-enviar="recoge" ${listo ? '' : 'disabled'} title="${listo ? '' : 'Faltan pedidos facturados, fecha u hora'}">${ico('flecha', 'ico-s')} Enviar a Bodega</button></div>
    </section>`;
  }
  function montarFacturacion(root, u, sede) {
    const lay = $('[data-fx]', root);
    // El tablero conserva su desplazamiento al seleccionar y al volver a pintar
    const tablero = $('[data-zona=tablero]', lay);
    tablero.scrollTop = scrollTab;
    tablero.addEventListener('scroll', () => { scrollTab = tablero.scrollTop; });
    // Seleccionar no vuelve a pintar la pantalla: solo cambia las tarjetas y los botones del tablero
    const pintarSel = () => {
      $$('.fx-t', tablero).forEach((t) => { const on = selFact.has(t.dataset.id); t.classList.toggle('elegida', on); t.setAttribute('aria-pressed', on); });
      const n = facturadosDe(sede, null).length, todos = $('[data-todos]', lay);
      todos.checked = n > 0 && selFact.size === n;
      $('[data-sel-acc]', lay).innerHTML = accSel(selFact.size);
    };
    const alternar = (id) => { if (selFact.has(id)) selFact.delete(id); else selFact.add(id); pintarSel(); };
    // Fecha y hora programadas: se escriben como texto y se guardan sin volver a pintar
    const listo = (op) => { const o = opcionDe(sede, op); return !!(facturadosDe(sede, op).length && o.fecha && o.hora && (op === 'recoge' || (camion(o.camion) && o.piloto))); };
    const prog = (t, op, campo, valor = t.value) => {
      opCampoOpcion(sede, op, campo, valor); guardar();
      t.classList.toggle('falta', !valor);
      const b = $(`[data-enviar="${op}"]`, lay), ok = listo(op);
      b.disabled = !ok; b.title = ok ? '' : (op === 'recoge' ? 'Faltan pedidos facturados, fecha u hora' : 'Faltan pedidos facturados, camión, piloto, fecha u hora');
    };
    arrastrable(lay, { item: '.fx-t, .fx-f', zona: '.fx-zona',
      // Si la tarjeta está seleccionada, se llevan todas las seleccionadas, en el orden del tablero
      seleccionados: (it) => (it.classList.contains('fx-t') && selFact.has(it.dataset.id) ? facturadosDe(sede, null).filter((f) => selFact.has(f.id)).map((f) => f.id) : [it.dataset.id]),
      onSoltar: (ids, zona, antes) => {
        if (intentar(() => opMover(ids, zona === 'tablero' ? null : zona, antes))) { ids.forEach((id) => selFact.delete(id)); guardar(); repintar(); }
      },
      onToque: (it) => { if (it.classList.contains('fx-t')) alternar(it.dataset.id); } });
    lay.addEventListener('keydown', (e) => { const t = e.target.closest('.fx-t'); if (t && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); alternar(t.dataset.id); } });
    lay.addEventListener('input', (e) => {
      const t = e.target;
      if (t.matches('[data-prog-fecha]')) prog(t, t.dataset.progFecha, 'fecha', t.dataset.iso);
      else if (t.matches('[data-prog-hora]')) {
        // La hora se escribe como texto: solo números y «:»; con cuatro cifras se agregan los dos puntos
        let x = t.value.replace(/[^\d:]/g, '');
        if (/^\d{4}$/.test(x)) x = x.slice(0, 2) + ':' + x.slice(2);
        if (x !== t.value) t.value = x;
        t.classList.remove('error');
        prog(t, t.dataset.progHora, 'hora', horaValida(x));
      } else if (t.matches('[data-hora-nativa]')) elegirHora(t);
    });
    // Al salir del campo, la hora queda completa («9:05» → «09:05») o se marca si no es válida
    lay.addEventListener('focusout', (e) => {
      const t = e.target; if (!t.matches('[data-prog-hora]')) return;
      const v = horaValida(t.value);
      if (v) t.value = v;
      t.classList.toggle('error', !!t.value.trim() && !v);
      t.title = t.value.trim() && !v ? 'Escriba la hora en formato de 24 horas, por ejemplo 13:30' : '';
    });
    // El botón del reloj abre el selector de hora del navegador
    const elegirHora = (n) => { const t = $(`[data-prog-hora="${n.dataset.horaNativa}"]`, lay); if (!n.value) return; t.value = n.value; t.classList.remove('error'); t.title = ''; prog(t, n.dataset.horaNativa, 'hora', n.value); };
    lay.addEventListener('change', (e) => { if (e.target.matches('[data-hora-nativa]')) elegirHora(e.target); });
    lay.addEventListener('change', (e) => {
      const t = e.target;
      if (t.matches('[data-todos]')) { selFact.clear(); if (t.checked) facturadosDe(sede, null).forEach((f) => selFact.add(f.id)); return pintarSel(); }
      if (t.matches('[data-op-camion]')) { opCampoOpcion(sede, 'camion', 'camion', t.value); guardar(); return repintar(); }
      if (t.matches('[data-op-piloto]')) { opCampoOpcion(sede, 'camion', 'piloto', t.value); guardar(); return repintar(); }
    });
    lay.addEventListener('click', (e) => {
      const rh = e.target.closest('[data-reloj-hora]');
      if (rh) {
        e.preventDefault();
        const op = rh.dataset.relojHora, n = $(`[data-hora-nativa="${op}"]`, lay);
        n.value = horaValida($(`[data-prog-hora="${op}"]`, lay).value);
        try { n.showPicker(); } catch (er) { $(`[data-prog-hora="${op}"]`, lay).focus(); }
        return;
      }
      if (e.target.closest('[data-eliminar]')) {
        const ids = [...selFact], fs = ids.map(facturado).filter(Boolean);
        return confirmar('Eliminar pedidos facturados', `¿Eliminar del tablero ${fs.length === 1 ? `el pedido facturado <b>${esc(fs[0].num)}</b> de ${esc(nombreFact(fs[0]))}` : `los <b>${fs.length}</b> pedidos facturados seleccionados`} (${kg(r3(fs.reduce((a, f) => a + totalFact(f), 0)))})? La eliminación queda en la bitácora.`, 'Eliminar', () => { opEliminarFacturados(ids, u.id); selFact.clear(); guardar(); toast('Pedidos facturados eliminados.'); repintar(); }, 'btn-d');
      }
      const c = e.target.closest('[data-cancelar]');
      if (c) { const op = c.dataset.cancelar, n = facturadosDe(sede, op).length; return confirmar(`Cancelar · ${esc(nombreOpcion(op))}`, `Los <b>${n}</b> pedidos facturados de esta opción regresan al tablero. No se crea nada y no se pierde nada. La cancelación queda en la bitácora.`, 'Regresar al tablero', () => { opCancelarOpcion(sede, op, u.id); guardar(); toast('Los pedidos facturados regresaron al tablero.'); repintar(); }); }
      const en = e.target.closest('[data-enviar]');
      if (en) enviar(en.dataset.enviar);
    });
    const arch = $('[data-archivo]', root);
    arch.addEventListener('change', () => { const f = arch.files[0]; arch.value = ''; if (f) cargarArchivo(f, u, sede); });

    const enviar = (op) => {
      const fs = facturadosDe(sede, op); if (!fs.length) return;
      const o = opcionDe(sede, op), tipo = op === 'recoge' ? 'recoge' : 'camion';
      const tot = r3(fs.reduce((a, f) => a + totalFact(f), 0)), clis = new Set(fs.map(claveRuta)).size;
      const cam = tipo === 'camion' ? camion(o.camion) : null;
      if (tipo === 'camion' && (!cam || !o.piloto)) return toast('Elija el camión y el piloto.', 'error');
      if (!o.fecha || !o.hora) return toast('Escriba la fecha y la hora programadas.', 'error');
      const n = siguienteNumero(sede, tipo), nombre = (tipo === 'camion' ? 'Ruta ' : 'Pedido ') + n;
      confirmar(`Enviar a Bodega`, `<div class="rejilla" style="gap:10px">
          <div>Se crea la <b>${nombre}</b> de hoy en ${SEDES[sede]} con ${fs.length} pedido(s) facturado(s) de ${clis} cliente(s) y ${kg(tot)}, en este orden: ${fs.map((f) => esc(f.num)).join(', ')}.</div>
          <div>Programada para el <b>${fFecha(o.fecha + 'T' + o.hora)} a las ${o.hora}</b>. Pasa a <b>En Preparación</b> en Bodega.</div>
          ${cam ? `<div>${esc(cam.n)} · ${esc(nombreUsuario(o.piloto))}.</div>${tot > cam.cap ? `<div class="aviso aviso-a">${ico('alerta')}<div>El total excede la capacidad del camión (${kg(cam.cap)}). Se puede enviar igual.</div></div>` : ''}` : '<div>El cliente recoge en bodega: no pasa por Ruta.</div>'}</div>`, 'Enviar a Bodega', () => {
        const p = opEnviarOpcion(sede, op, u.id);
        guardar();
        setTimeout(() => modal({ titulo: `${etiqueta(p)} enviada a Bodega`.replace('Pedido ' + p.num + ' enviada', 'Pedido ' + p.num + ' enviado'), cuerpo: `<div class="exito" style="padding:6px 0 0"><div class="ok">${ico('check')}</div>
            <p style="font-size:16px">La <b>${etiqueta(p)}</b> del ${fFecha(p.fecha)} quedó <b>En Preparación</b> y ya aparece en Bodega.</p>
            <p class="muted" style="margin-top:8px">Programada: ${fProg(p)}${esRuta(p) ? ` · ${esc(camion(p.camion).n)} · ${esc(nombreUsuario(p.piloto))}` : ' · el cliente recoge en bodega'}</p></div>`.replace('La <b>Pedido', 'El <b>Pedido'),
          acciones: [{ txt: 'Seguir en Facturación', cls: 'btn-s' }].concat(tiene(u, 'pk.bodega') ? [{ txt: 'Ver en Bodega', cls: 'btn-p', fn: () => { location.hash = '#/picking/bodega'; } }] : []) }), 60);
        repintar();
      });
    };
  }

  /* ---- Lectura del archivo de Odoo (RN-35, RN-36, RN-37, RN-50): los datos se usan tal como vienen */
  function cargarArchivo(file, u, sede) {
    if (!/\.xlsx$/i.test(file.name)) return toast('El archivo debe ser .xlsx, exportado de Odoo.', 'error');
    if (file.size > 2 * 1024 * 1024) return toast('El archivo pesa más de 2 MB. No se cargó.', 'error');
    if (!window.XLSX) return toast('No se pudo cargar la librería que lee archivos .xlsx (se necesita conexión a internet).', 'error');
    const lector = new FileReader();
    lector.onload = () => {
      let filas;
      try { const wb = XLSX.read(new Uint8Array(lector.result), { type: 'array' }); filas = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: null, raw: true }); }
      catch (e) { return toast('No se pudo leer el archivo. Verifique que sea el .xlsx exportado de Odoo.', 'error'); }
      intentar(() => preparar(leerOdoo(filas), file.name, u, sede));
    };
    lector.readAsArrayBuffer(file);
  }
  function leerOdoo(filas) {
    const H = (filas[0] || []).map((x) => String(x == null ? '' : x).trim());
    const col = (n) => { const i = H.indexOf(n); if (i < 0) throw Err(`El archivo no tiene la columna «${n}». ¿Es el export de salidas de Odoo?`); return i; };
    const iR = col('Referencia'), iC = col('Contacto'), iCi = col('Contacto/Ciudad'), iE = col('Estado'), iP = col('Movimientos de stock/Producto'),
      iW = col('Movimientos de stock/Producto/Peso'), iS = col('Movimientos de stock/Números de serie'), iQ = col('Movimientos de stock/Cantidad hecha');
    const txt = (v) => String(v == null ? '' : v).trim();
    const num = (v) => (v == null || v === '' ? NaN : typeof v === 'number' ? v : leerNumero(v));
    const refs = []; let cur = null;
    filas.slice(1).forEach((r) => {
      if (!r) return;
      const ref = txt(r[iR]), con = txt(r[iC]), pr = txt(r[iP]);
      if (ref && !con && !pr) return;                 // fila de agrupación de Odoo, por ejemplo «agosto 2026 (80)»
      if (ref) { cur = { ref, contacto: con, ciudad: txt(r[iCi]), estado: txt(r[iE]), lineas: [] }; refs.push(cur); }
      // sin Referencia ni Contacto: otra línea del mismo pedido facturado
      if (pr && cur) cur.lineas.push({ prod: pr, kg: num(r[iQ]), p2: num(r[iW]), lote: txt(r[iS]) });
    });
    return refs;
  }
  function preparar(refs, archivo, u, sede) {
    if (!refs.length) throw Err('El archivo no trae referencias.');
    const hechas = refs.filter((r) => norm(r.estado) === 'hecho');
    if (!hechas.length) throw Err('El archivo no trae referencias en estado «Hecho».');
    const prefijo = (r) => r.ref.split('/')[0].split('-')[0].trim().toUpperCase();
    const sedes = new Set(hechas.map((r) => PREFIJOS_ODOO[prefijo(r)] || '?'));
    if (sedes.has('?')) throw Err('Hay referencias de una bodega que no se reconoce. Se esperan los prefijos XE, GT o ESC.');
    if (sedes.size > 1) throw Err('El archivo trae referencias de más de una bodega. Cada archivo debe ser de una sola bodega.');
    const sa = [...sedes][0];
    if (sa !== sede) throw Err(`El archivo es de la bodega de ${SEDES[sa]} y usted está trabajando en ${SEDES[sede]}. Cambie la sede o cargue el archivo correcto. No se cargó nada.`);
    const items = [], malos = { kg: [], p2: [], vacio: [] };
    hechas.forEach((r) => {
      const n = (r.ref.split('/')[2] || r.ref).trim();
      if (!r.lineas.length) return malos.vacio.push(n);
      if (r.lineas.some((l) => !(l.kg > 0))) return malos.kg.push(n);         // cantidad vacía, no numérica o ≤ 0 (12/10)
      if (r.lineas.some((l) => !(l.p2 > 0))) return malos.p2.push(n);         // Peso de Conversión vacío, no numérico o ≤ 0 (RN-50)
      items.push({ num: n, ref: r.ref, nombre: r.contacto, sector: r.ciudad, lineas: r.lineas.map((l) => ({ prod: l.prod, lote: l.lote, p2: r3(l.p2), kg: r3(l.kg) })) });
    });
    const sinCargar = malos.kg.length + malos.p2.length + malos.vacio.length, otras = refs.length - hechas.length;
    const det = [archivo, `${items.length} pedido(s) facturado(s) cargado(s)`,
      malos.p2.length ? `${malos.p2.length} sin cargar por Peso de Conversión en 0 o vacío (${malos.p2.join(', ')})` : '',
      malos.kg.length ? `${malos.kg.length} sin cargar por cantidad en 0 o vacía (${malos.kg.join(', ')})` : '',
      malos.vacio.length ? `${malos.vacio.length} sin productos (${malos.vacio.join(', ')})` : '',
      otras ? `${otras} referencia(s) que no están en estado Hecho` : ''].filter(Boolean).join(' · ');
    if (items.length) opCargarArchivo(sede, items, u.id, det); else bit(u.id, 'Carga de archivo de Odoo', `${SEDES[sede]} · ${det}`);
    guardar();
    repintar();
    const lista = (t, l) => (l.length ? `<div class="aviso aviso-a">${ico('alerta')}<div><b>${l.length} pedido(s) facturado(s) no se cargaron</b> porque ${t}: <span class="mono">${l.map(esc).join(', ')}</span>.</div></div>` : '');
    setTimeout(() => modal({ titulo: 'Resumen de la carga', cuerpo: `<div class="rejilla" style="gap:10px;font-size:15.5px">
        <div class="aviso ${items.length ? 'aviso-v' : 'aviso-r'}">${ico(items.length ? 'check' : 'alerta')}<div><b>${items.length} pedido(s) facturado(s)</b> de ${SEDES[sede]} se agregaron al tablero, con los datos tal como vienen en el archivo.</div></div>
        ${lista('tienen líneas con el Peso de Conversión en 0 o vacío (RN-50)', malos.p2)}
        ${lista('tienen líneas con la cantidad en 0 o vacía', malos.kg)}
        ${lista('no traen productos', malos.vacio)}
        ${otras ? `<div class="muted">Se ignoraron ${otras} referencia(s) que no están en estado «Hecho».</div>` : ''}
        ${sinCargar ? `<div class="muted" style="font-size:13.5px">Los datos de esos pedidos facturados deben corregirse en Odoo y volver a exportarse (P-91).</div>` : ''}</div>`, acciones: [{ txt: 'Listo', cls: 'btn-p' }] }), 60);
  }

  /* ======================================================================
     BODEGA · tablero de preparación en el módulo (specs/07)
     ====================================================================== */
  const pedidosBodega = (sede) => (S.orden[sede] || []).map(pedido).filter((p) => p && p.estado === 'PREP');
  const clientesPedido = (p) => new Set(p.lineas.map((l) => l.ck)).size;
  const metaPedido = (p) => (esRuta(p)
    ? [['camion', esc((camion(p.camion) || {}).n || '—')], ['usuario', esc(nombreUsuario(p.piloto))], ['usuarios', `${clientesPedido(p)} cliente(s)`], ['caja', kg(totalPedido(p))]]
    : [['edificio', 'El cliente recoge'], ['usuarios', `${clientesPedido(p)} cliente(s)`], ['caja', kg(totalPedido(p))]]);
  const loteHtml = (l) => `<span class="lote ${l.lote ? '' : 'sin'}">${l.lote ? 'Lote ' + esc(l.lote) : 'Sin lote'}</span>`;
  function bodega(u) {
    const sede = sedeTrabajo(u), ps = pedidosBodega(sede);
    return vista('bodega', u, cab('Módulo de bodega · tablero de preparación', 'Rutas y pedidos por preparar',
      'Arrastre una ruta, un pedido o una fila para cambiar la prioridad; se ve al instante en todas las pantallas de la sede.',
      `<a class="btn btn-p" href="#/picking/tablero">${ico('tv')} Abrir tablero en pantalla completa</a>`) + `
      <div style="display:flex;gap:10px;align-items:center;margin-bottom:16px;flex-wrap:wrap"><span class="chip chip-o">${ps.length} en cola</span><span class="muted" style="font-size:14px">${SEDES[sede]} · la prioridad y las marcas no quedan en el historial</span></div>
      ${ps.length ? `<div class="ped-lista" data-pedidos>${ps.map((p, i) => tarjetaPedido(p, i)).join('')}</div>`
        : `<div class="tarjeta vacio" style="padding:60px">${ico('check')}<h4>No hay rutas ni pedidos por preparar</h4><p>Cuando Facturación envíe una ruta o un pedido aparecerá aquí al instante.</p></div>`}`, (root) => {
      ordenable($('[data-pedidos]', root), { item: '.ped', asa: '.asa-ped', onFin: (ids) => { opOrdenPedidos(sede, ids); guardar(); repintar(); } });
      $$('tbody[data-ped]', root).forEach((tb) => ordenable(tb, { item: 'tr', asa: '.asa', onFin: (ids) => { opOrdenLineas(tb.dataset.ped, ids); guardar(); repintar(); } }));
      $('.contenido', root).addEventListener('click', (e) => {
        const m = e.target.closest('[data-marcar]');
        if (m) { opMarcar(m.dataset.p, m.dataset.marcar); guardar(); repintar(); return; }
        const t = e.target.closest('[data-todo]');
        if (t) { opMarcarTodo(t.dataset.todo, t.dataset.v === '1'); guardar(); repintar(); return; }
        const w = e.target.closest('[data-peso]');
        if (w) { opOrdenPeso(w.dataset.peso); guardar(); toast('Filas ordenadas de mayor a menor peso.'); repintar(); return; }
        const dt = e.target.closest('[data-detalle]');
        if (dt) return detalle(pedido(dt.dataset.detalle));
        const d = e.target.closest('[data-despachar]');
        if (d) despachar(pedido(d.dataset.despachar), u);
      });
    }, true);
  }
  /* Botones comunes del módulo y del tablero (RF-SL-20, RF-SL-23, RF-SL-74) */
  const herramientas = (p, cls = 'btn btn-s btn-sm') => {
    const todas = p.prep.every((x) => x.listo);
    return `<button class="${cls}" data-detalle="${p.id}">${ico('lista', 'ico-s')} Detalle de ${esRuta(p) ? 'Ruta' : 'Pedido'}</button>
      <button class="${cls}" data-peso="${p.id}" title="Ordenar las filas de mayor a menor peso">${ico('grafica', 'ico-s')} Ordenar por peso</button>
      <button class="${cls}" data-todo="${p.id}" data-v="${todas ? 0 : 1}">${ico(todas ? 'x' : 'check', 'ico-s')} ${todas ? 'Desmarcar todo' : 'Marcar todo'}</button>`;
  };
  function tarjetaPedido(p, i) {
    const listas = p.prep.filter((x) => x.listo).length, n = p.prep.length;
    return `<article class="tarjeta ped" data-id="${p.id}">
      <div class="ped-cab"><span class="asa asa-ped" title="Arrastre para cambiar la prioridad">${ico('asa')}</span>
        <div class="ped-num ${esRuta(p) ? '' : 'recoge'}"><div style="text-align:center"><small>${esRuta(p) ? 'RUTA' : 'PEDIDO'}</small><br>${p.num}</div></div>
        <div><h3>Prioridad ${i + 1} · ${esRuta(p) ? 'Envío en camión' : 'Cliente recoge en bodega'}</h3>
          <div class="ped-meta"><span class="prog">${ico('calendario', 'ico-s')}Programada ${fProg(p)}</span>${metaPedido(p).map(([ic, t]) => `<span>${ico(ic, 'ico-s')}${t}</span>`).join('')}</div></div>
        <div class="ped-avance"><div style="display:flex;justify-content:space-between"><span>Preparadas</span><span class="mono">${listas} de ${n}</span></div><div class="medidor"><i style="width:${(listas / n) * 100}%"></i></div></div>
      </div>
      <div class="ped-herr">${herramientas(p)}</div>
      <div class="tabla-caja"><table class="tabla"><thead><tr><th style="width:34px"></th><th>Producto</th><th>Lote</th><th class="der">Cantidad (kg)</th><th>Unidades</th><th class="cen" style="width:70px">Listo</th></tr></thead>
        <tbody data-ped="${p.id}">${p.prep.map((l) => `<tr data-id="${l.id}" class="${l.listo ? 'lista' : ''}"><td><span class="asa">${ico('asa', 'ico-s')}</span></td>
          <td class="cod">${esc(l.prod)}</td><td>${loteHtml(l)}</td><td class="der kg">${fmt(l.kg)}</td>
          <td>${htmlConversion(l.kg, l.p2)} <span class="muted mono" style="font-size:11.5px;margin-left:4px">÷ ${fmt(l.p2)}</span></td>
          <td class="cen"><button class="marca ${l.listo ? 'on' : ''}" data-marcar="${l.id}" data-p="${p.id}" aria-pressed="${l.listo}" aria-label="Marcar como listo">${ico('check')}</button></td></tr>`).join('')}</tbody></table></div>
      <div class="ped-pie"><span class="muted" style="font-size:14px">${listas === n ? `Todo listo. Al despachar pasa a <b>${esRuta(p) ? 'En Ruta' : 'Despachado'}</b>.` : `El botón se habilita cuando las ${n} líneas estén marcadas.`}</span>
        <button class="btn btn-p" data-despachar="${p.id}" ${listas === n ? '' : 'disabled'}>${ico('check')} ${esRuta(p) ? 'Ruta despachada' : 'Pedido despachado'}</button></div>
    </article>`;
  }
  /* Detalle de Ruta o de Pedido: solo muestra lo que se armó en Facturación, con los datos del archivo (RF-SL-74) */
  function detalle(p) {
    if (!p) return;
    const grupos = [];
    p.lineas.forEach((l) => { let g = grupos.find((x) => x.fact === l.fact); if (!g) grupos.push(g = { fact: l.fact, num: l.num, nombre: l.nombre, sector: l.sector, lineas: [] }); g.lineas.push(l); });
    const f = (l) => `<tr><td class="cod">${esc(l.prod)}</td><td>${loteHtml(l)}</td><td class="der mono">${fmt(l.p2)}</td><td class="der kg">${fmt(l.kg)}</td><td>${htmlConversion(l.kg, l.p2)}</td></tr>`;
    modal({ titulo: `Detalle de ${etiqueta(p)}`, grande: true, cuerpo: `
      <div class="det-env"><div><small>Fecha</small><b>${fFecha(p.fecha)}</b></div><div><small>Programada</small><b>${fProg(p)}</b></div>
        ${esRuta(p) ? `<div><small>Camión</small><b>${esc((camion(p.camion) || {}).n || '—')}</b></div><div><small>Piloto</small><b>${esc(nombreUsuario(p.piloto))}</b></div>` : '<div><small>Tipo</small><b>Cliente recoge en bodega</b></div>'}
        <div><small>Total</small><b>${kg(totalPedido(p))}</b></div></div>
      <p class="muted" style="font-size:13.5px;margin:14px 0 10px">${grupos.length} pedido(s) facturado(s), en el orden en que los dejó el facturador. Datos tal como vinieron en el archivo de Odoo.</p>
      <div class="det-grupos">${grupos.map((g, i) => `<section class="det-g"><div class="det-g-cab"><span class="parada-n">${i + 1}</span><div><b class="mono">${esc(g.num)}</b> · <b>${esc(g.nombre)}</b><div class="muted" style="font-size:13px">${esc(g.sector)}</div></div><span class="mono kg">${fmt(r3(g.lineas.reduce((a, l) => a + l.kg, 0)))} kg</span></div>
        <div class="tabla-caja"><table class="tabla"><thead><tr><th>Producto</th><th>Lote</th><th class="der">Peso de Conversión (kg)</th><th class="der">Cantidad (kg)</th><th>Unidades</th></tr></thead><tbody>${g.lineas.map(f).join('')}</tbody></table></div></section>`).join('')}</div>`,
      acciones: [{ txt: 'Cerrar', cls: 'btn-p' }] });
  }
  function despachar(p, u, alTerminar) {
    const destino = esRuta(p) ? 'En Ruta' : 'Despachado';
    confirmar(`Despachar ${etiqueta(p)}`, `${esRuta(p) ? 'La ruta' : 'El pedido'} pasa a <b>${destino}</b>${esRuta(p) ? ` y aparece en el módulo de Ruta de ${esc(nombreUsuario(p.piloto))}` : ''}. No se requiere confirmar la carga en el camión.`, esRuta(p) ? 'Ruta despachada' : 'Pedido despachado', () => {
      opDespachar(p.id, u.id); guardar();
      if (alTerminar) alTerminar(p); else { toast(`${etiqueta(p)} → ${destino}.`); repintar(); }
    });
  }

  /* ======================================================================
     RUTA (specs/08): solo rutas en curso, de la más reciente a la más antigua,
     y una fila por cliente (RN-49). El histórico está en Reportes.
     ====================================================================== */
  let rutaSel = null;
  function rutasVisibles(u) {
    const sede = sedeTrabajo(u), todas = !esPiloto(u) && tiene(u, 'pk.ruta.todas');
    return S.rutas.filter((r) => (todas ? r.sede === sede : r.piloto === u.id) && pedido(r.pedido).estado === 'RUTA')
      .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.num - a.num);
  }
  function rutaMod(u) {
    const lista = rutasVisibles(u);
    if (!lista.find((r) => r.id === rutaSel)) rutaSel = lista[0] ? lista[0].id : null;
    const r = S.rutas.find((x) => x.id === rutaSel);
    const propias = esPiloto(u) || !tiene(u, 'pk.ruta.todas');
    return vista('ruta', u, cab('Módulo de ruta', propias ? 'Mis rutas' : 'Rutas en curso', `${propias ? 'Sus rutas asignadas.' : 'Rutas en curso de la sede.'} Arrastre los clientes para acomodar el recorrido y pulse «Ruta entregada» al terminar.`) + `
      ${lista.length ? `<div class="ruta-lay">
        <div>${lista.map((x) => { const p = pedido(x.pedido); return `<button class="ruta-op ${x.id === rutaSel ? 'on' : ''}" data-r="${x.id}"><div style="display:flex;justify-content:space-between;align-items:center"><b>${etiqueta(p)}</b>${chipEstado(p)}</div>
          <div class="muted" style="font-size:13.5px;margin-top:8px">${fFecha(x.fecha)} · programada ${p.prog.slice(11, 16)} · ${esc((camion(x.camion) || {}).n || '—')}</div><div class="muted" style="font-size:13.5px">${esc(nombreUsuario(x.piloto))} · ${x.orden.length} cliente(s) · ${kg(totalPedido(p))}</div></button>`; }).join('')}</div>
        <div>${r ? detalleRuta(r) : ''}</div></div>`
      : `<div class="tarjeta vacio" style="padding:60px">${ico('ruta')}<h4>No hay rutas en curso</h4><p>Una ruta aparece aquí cuando Bodega pulsa «Ruta despachada».</p></div>`}`, (root) => {
      $$('[data-r]', root).forEach((b) => b.addEventListener('click', () => { rutaSel = b.dataset.r; repintar(); }));
      const tb = $('[data-paradas]', root);
      if (tb && r) ordenable(tb, { item: 'tr', asa: '.asa', onFin: (ids) => { opOrdenRuta(r.id, ids); guardar(); repintar(); } });
      const be = $('[data-entregar]', root);
      if (be) be.addEventListener('click', () => { const cl = clientesRuta(r); confirmar(`Entregar ${etiqueta(pedido(r.pedido))}`, `Se registra la entrega completa a los ${cl.length} clientes y la ruta pasa a <b>Entregado</b>. Se guarda este recorrido: ${cl.map((c, i) => `<b>${i + 1}.</b> ${esc(c.nombre)}`).join(' · ')}.`, 'Ruta entregada', () => {
        opEntregar(r.id, u.id); guardar(); toast(`Ruta ${r.num} entregada. Quedó en el registro histórico de Reportes.`); rutaSel = null; repintar();
      }); });
    }, true);
  }
  function detalleRuta(r) {
    const p = pedido(r.pedido), cl = clientesRuta(r);
    return `<section class="tarjeta" style="overflow:hidden">
      <div class="bloque-cab"><div><h3 style="font-size:20px">${etiqueta(p)} · ${fFecha(r.fecha)}</h3><p>El número y la fecha se asignaron cuando Facturación la envió a Bodega.</p></div>${chipEstado(p)}</div>
      <div class="ruta-datos"><div><small>Ruta</small><b>${r.num}</b></div><div><small>Programada</small><b>${fProg(p)}</b></div><div><small>Camión</small><b>${esc((camion(r.camion) || {}).n || '—')}</b></div><div><small>Piloto</small><b>${esc(nombreUsuario(r.piloto))}</b></div></div>
      <div class="tabla-caja"><table class="tabla"><thead><tr><th style="width:34px"></th><th style="width:70px">Orden</th><th>Cliente</th><th>Sector</th><th class="der">Total (kg)</th></tr></thead>
        <tbody data-paradas>${cl.map((c, i) => `<tr data-id="${esc(c.ck)}"><td><span class="asa">${ico('asa', 'ico-s')}</span></td><td><span class="parada-n">${i + 1}</span></td><td><b>${esc(c.nombre)}</b></td><td class="muted">${esc(c.sector)}</td><td class="der kg">${fmt(c.total)}</td></tr>`).join('')}</tbody>
        <tfoot><tr><td></td><td colspan="3">Total de la ruta</td><td class="der kg">${fmt(totalPedido(p))}</td></tr></tfoot></table></div>
      <div class="ped-pie" style="justify-content:flex-end"><button class="btn btn-p btn-lg" data-entregar>${ico('check')} Ruta entregada</button></div>
    </section>`;
  }

  /* ======================================================================
     REPORTES (specs/10): filtro de periodo en Despacho, Rutas realizadas y Bitácora
     ====================================================================== */
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const fIso = (s) => s.split('-').reverse().join('/');
  let repTab = 'despacho', repPer = 'dia', repRef = null, repMes = null, repAnio = null, repDesde = null, repHasta = null;
  function periodo() {
    const hoy = isoLocal(new Date());
    repRef = repRef || hoy; repMes = repMes || hoy.slice(0, 7); repAnio = repAnio || hoy.slice(0, 4); repDesde = repDesde || hoy; repHasta = repHasta || hoy;
    if (repPer === 'semana') {   // de lunes a domingo
      const d = new Date(repRef + 'T12:00:00'), lun = new Date(d); lun.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      const dom = new Date(lun); dom.setDate(lun.getDate() + 6);
      return { ini: isoLocal(lun), fin: isoLocal(dom), txt: `Semana del ${fIso(isoLocal(lun))} al ${fIso(isoLocal(dom))}`, nombre: 'Despacho semanal' };
    }
    if (repPer === 'mes') { const [y, m] = repMes.split('-').map(Number); return { ini: `${repMes}-01`, fin: `${repMes}-${pad(new Date(y, m, 0).getDate())}`, txt: `${MESES[m - 1][0].toUpperCase() + MESES[m - 1].slice(1)} de ${y}`, nombre: 'Despacho mensual' }; }
    if (repPer === 'anio') return { ini: `${repAnio}-01-01`, fin: `${repAnio}-12-31`, txt: `Año ${repAnio}`, nombre: 'Despacho anual' };
    if (repPer === 'rango') { const [a, b] = repDesde <= repHasta ? [repDesde, repHasta] : [repHasta, repDesde]; return { ini: a, fin: b, txt: `Del ${fIso(a)} al ${fIso(b)}`, nombre: 'Despacho del periodo' }; }
    return { ini: repRef, fin: repRef, txt: fIso(repRef), nombre: 'Despacho diario' };
  }
  function controlPeriodo() {
    const anios = []; const y0 = Math.min(new Date().getFullYear(), ...S.pedidos.map((p) => new Date(p.fecha).getFullYear()));
    for (let y = new Date().getFullYear(); y >= y0; y--) anios.push(y);
    const [my, mm] = repMes.split('-');
    const fecha = (attr, v) => campoFecha(attr, v);
    const ctl = repPer === 'dia' || repPer === 'semana' ? fecha('data-ref', repRef)
      : repPer === 'mes' ? `<select class="sel" data-mes-m>${MESES.map((n, i) => `<option value="${pad(i + 1)}" ${pad(i + 1) === mm ? 'selected' : ''}>${n[0].toUpperCase() + n.slice(1)}</option>`).join('')}</select><select class="sel" data-mes-y>${anios.map((y) => `<option ${String(y) === my ? 'selected' : ''}>${y}</option>`).join('')}</select>`
      : repPer === 'anio' ? `<select class="sel" data-anio>${anios.map((y) => `<option ${String(y) === repAnio ? 'selected' : ''}>${y}</option>`).join('')}</select>`
      : `<span class="muted">De</span>${fecha('data-desde', repDesde)}<span class="muted">a</span>${fecha('data-hasta', repHasta)}`;
    return `<div class="periodo"><div class="seg" data-per>${[['dia', 'Diario'], ['semana', 'Semanal'], ['mes', 'Mensual'], ['anio', 'Anual'], ['rango', 'Rango']].map(([k, n]) => `<button data-p="${k}" class="${repPer === k ? 'on' : ''}">${n}</button>`).join('')}</div><div class="periodo-ctl">${ctl}</div></div>`;
  }
  function reportes(u) {
    const sede = sedeTrabajo(u);
    const P = periodo();
    const enP = (iso) => { const d = diaDe(iso); return d >= P.ini && d <= P.fin; };
    const cerrados = S.pedidos.filter((p) => p.sede === sede && p.hist.some((h) => ['DESP', 'RUTA'].includes(h.estado) && enP(h.fecha)));
    let cuerpo = '';
    if (repTab === 'despacho') {
      const ag = {};
      cerrados.forEach((p) => p.prep.forEach((l) => { const k = l.prod + '|' + l.p2; ag[k] = ag[k] || { prod: l.prod, p2: l.p2, kg: 0 }; ag[k].kg = r3(ag[k].kg + l.kg); }));
      const filas = Object.values(ag).sort((a, b) => b.kg - a.kg);
      const tot = r3(filas.reduce((a, x) => a + x.kg, 0)), uni = filas.reduce((a, x) => a + convertir(x.kg, x.p2).u, 0), resto = r3(filas.reduce((a, x) => a + convertir(x.kg, x.p2).r, 0));
      const max = Math.max(1, ...filas.map((x) => x.kg));
      const entregadas = S.rutas.filter((r) => r.sede === sede && r.entrega && enP(r.entrega)).length;
      cuerpo = `<div class="kpis">
          <div class="tarjeta kpi"><span class="etq">Kilogramos despachados</span><b>${fmt(tot)}</b><small>rutas y pedidos cerrados en Bodega</small></div>
          <div class="tarjeta kpi"><span class="etq">Unidades completas</span><b>${fmt(uni)}</b><small>más ${kg(resto)} sueltos</small></div>
          <div class="tarjeta kpi"><span class="etq">Rutas y pedidos cerrados</span><b>${cerrados.length}</b><small>${cerrados.filter(esRuta).length} rutas · ${cerrados.filter((p) => !esRuta(p)).length} pedidos</small></div>
          <div class="tarjeta kpi"><span class="etq">Rutas entregadas</span><b>${entregadas}</b><small>en el periodo</small></div></div>
        <section class="tarjeta"><div class="bloque-cab"><div><h3>${P.nombre} por producto</h3><p>${SEDES[sede]} · ${P.txt}</p></div><div style="display:flex;gap:8px"><button class="btn btn-s btn-sm" data-exp>${ico('descargar', 'ico-s')} Excel</button><button class="btn btn-s btn-sm" data-exp>${ico('descargar', 'ico-s')} PDF</button></div></div>
          <div class="tabla-caja"><table class="tabla"><thead><tr><th>Producto</th><th class="der">Cantidad (kg)</th><th style="width:22%"></th><th>Unidades</th></tr></thead><tbody>
          ${filas.map((x) => `<tr><td class="cod">${esc(x.prod)}</td><td class="der kg">${fmt(x.kg)}</td><td><div class="medidor" style="height:8px"><i style="width:${(x.kg / max) * 100}%"></i></div></td><td>${htmlConversion(x.kg, x.p2)} <span class="muted mono" style="font-size:11.5px;margin-left:4px">÷ ${fmt(x.p2)}</span></td></tr>`).join('') || `<tr><td colspan="4"><div class="vacio">Sin despachos en el periodo.</div></td></tr>`}</tbody>
          ${filas.length ? `<tfoot><tr><td>Total del periodo</td><td class="der kg">${fmt(tot)}</td><td></td><td class="mono">${fmt(uni)} unidades + ${fmt(resto)} kg</td></tr></tfoot>` : ''}</table></div></section>`;
    } else if (repTab === 'rutas') {
      const rs = S.rutas.filter((r) => r.sede === sede && enP(r.fecha)).sort((a, b) => b.fecha.localeCompare(a.fecha) || b.num - a.num);
      cuerpo = `<section class="tarjeta"><div class="bloque-cab"><div><h3>Registro histórico de rutas</h3><p>${SEDES[sede]} · ${P.txt} · desde el envío a bodega hasta el cierre de la entrega.</p></div></div><div class="tabla-caja"><table class="tabla"><thead><tr><th>Ruta</th><th>Fecha</th><th>Programada</th><th>Camión</th><th>Piloto</th><th class="der">Total (kg)</th><th>Estado</th><th>Recorrido</th></tr></thead><tbody>
        ${rs.map((r) => { const p = pedido(r.pedido); return `<tr><td><b>${r.num}</b></td><td class="mono">${fFecha(r.fecha)}</td><td class="mono">${fProg(p)}</td><td>${esc((camion(r.camion) || {}).n || '—')}</td><td>${esc(nombreUsuario(r.piloto))}</td><td class="der kg">${fmt(totalPedido(p))}</td><td>${chipEstado(p)}</td>
          <td style="font-size:13px">${r.recorrido ? clientesRuta(r).map((c, i) => `${i + 1}. ${esc(c.nombre)}`).join(' → ') : '<span class="muted">Se guarda al entregar</span>'}</td></tr>`; }).join('') || '<tr><td colspan="8"><div class="vacio">Sin rutas en el periodo.</div></td></tr>'}</tbody></table></div></section>`;
    } else {
      const ls = S.bitacora.filter((b) => enP(b.fecha)).slice(0, 250);
      cuerpo = `<section class="tarjeta"><div class="bloque-cab"><div><h3>Bitácora de operaciones</h3><p>${P.txt} · Acciones de los dos sistemas, incluidos los inicios de sesión y los intentos fallidos. No se registran el marcado ni la prioridad de Bodega, ni el orden de Ruta antes de la entrega.</p></div></div><div class="tabla-caja tabla-alta"><table class="tabla"><thead><tr><th>Fecha</th><th>Usuario</th><th>Operación</th><th>Detalle</th></tr></thead><tbody>
        ${ls.map((b) => `<tr><td class="mono" style="font-size:13px;white-space:nowrap">${fFH(b.fecha)}</td><td>${esc(b.nombre)}</td><td><b>${esc(b.op)}</b></td><td style="font-size:13.5px">${esc(b.detalle)}</td></tr>`).join('') || '<tr><td colspan="4"><div class="vacio">Sin operaciones en el periodo.</div></td></tr>'}</tbody></table></div></section>`;
    }
    return vista('reportes', u, cab('Módulo de reportes', 'Reportes y bitácora', 'Despacho, rutas realizadas y bitácora de los dos sistemas, por periodo.') + `
      <div class="pestanas">${[['despacho', P.nombre, 'grafica'], ['rutas', 'Rutas realizadas', 'ruta'], ['bitacora', 'Bitácora', 'lista']].map(([k, n, i]) => `<button data-tab="${k}" class="${repTab === k ? 'on' : ''}">${ico(i, 'ico-s')} ${n}</button>`).join('')}</div>
      ${controlPeriodo()}${cuerpo}`, (root) => {
      $$('[data-tab]', root).forEach((b) => b.addEventListener('click', () => { repTab = b.dataset.tab; repintar(); }));
      const per = $('[data-per]', root);
      if (per) per.addEventListener('click', (e) => { const b = e.target.closest('[data-p]'); if (b) { repPer = b.dataset.p; repintar(); } });
      // Las fechas se escriben como texto: su valor ISO está en data-iso
      const al = (sel, fn) => { const x = $(sel, root); if (x) x.addEventListener('change', (e) => { const v = e.target.dataset.iso !== undefined ? e.target.dataset.iso : e.target.value; if (v) { fn(v); repintar(); } }); };
      al('[data-ref]', (v) => { repRef = v; });
      al('[data-desde]', (v) => { repDesde = v; });
      al('[data-hasta]', (v) => { repHasta = v; });
      al('[data-anio]', (v) => { repAnio = v; });
      al('[data-mes-m]', (v) => { repMes = repMes.slice(0, 4) + '-' + v; });
      al('[data-mes-y]', (v) => { repMes = v + repMes.slice(4); });
      $$('[data-exp]', root).forEach((b) => b.addEventListener('click', () => toast('En la simulación no se genera el archivo: la exportación a Excel y PDF es de la aplicación real.', 'aviso')));
    }, true);
  }

  /* ======================================================================
     CONFIGURACIÓN (specs/11): desde el 13/10 solo camiones y usuarios
     ====================================================================== */
  let cfgTab = null;
  const selSedes = (nombre, valor) => `<select class="sel" name="${nombre}">${Object.entries(SEDES).map(([k, n]) => `<option value="${k}" ${k === valor ? 'selected' : ''}>${n}</option>`).join('')}</select>`;
  function configuracion(u) {
    const tabs = [['camiones', 'Camiones', S.camiones.length, tiene(u, 'pk.cfg.camiones')], ['usuarios', 'Usuarios', S.usuarios.filter((x) => enSistema(x, 'picking')).length, esTotal(u)]].filter((t) => t[3]);
    if (!tabs.find((t) => t[0] === cfgTab)) cfgTab = tabs[0][0];
    const acc = { camiones: 'Nuevo camión', usuarios: 'Nuevo usuario' }[cfgTab];
    let tabla = '', notas = '';
    if (cfgTab === 'camiones') {
      tabla = `<table class="tabla"><thead><tr><th>Identificación</th><th class="der">Capacidad máxima</th><th>Sede</th><th></th></tr></thead><tbody>${S.camiones.map((c) => `<tr><td><b>${esc(c.n)}</b></td><td class="der kg">${fmt(c.cap)} kg</td><td>${SEDES[c.sede]}</td><td class="der" style="white-space:nowrap"><button class="btn btn-s btn-sm" data-ed="${c.id}" title="Editar" aria-label="Editar">${ico('editar', 'ico-s')}</button> <button class="btn btn-g btn-sm" data-del="${c.id}" title="Eliminar">${ico('borrar', 'ico-s')}</button></td></tr>`).join('')}</tbody></table>`;
      notas = pend('P-01', 'Falta la identificación real de los 3 camiones de Quetzaltenango; aquí aparecen numerados. Los camiones de la sede son la lista desplegable de «Envío por camión» en Facturación, y su capacidad alimenta la alerta de sobrepeso.');
    } else {
      tabla = `<table class="tabla"><thead><tr><th>Nombre</th><th>Usuario</th><th>Rol</th><th>Sedes</th><th>Permisos del picking</th><th>Estado</th><th></th></tr></thead><tbody>${S.usuarios.filter((x) => enSistema(x, 'picking')).map((x) => `<tr><td><div style="display:flex;gap:10px;align-items:center"><span class="avatar" style="width:34px;height:34px;font-size:12.5px">${iniciales(x.nombre)}</span><b>${esc(x.nombre)}</b></div></td><td class="mono">${esc(x.usuario)}</td>
          <td>${esc(x.rol)}${x.sistema === 'ambos' || esTotal(x) ? ' <span class="chip">+ sitio</span>' : ''}</td><td>${esTotal(x) ? 'Todas' : sedesDe(x).map((s) => SEDES[s]).join(', ') || '—'}</td><td>${resumenPermisos(x, 'picking')}</td><td><span class="chip ${x.activo ? 'chip-v' : ''}">${x.activo ? 'Activo' : 'Inactivo'}</span></td>
          <td class="der" style="white-space:nowrap"><button class="btn btn-s btn-sm" data-ed="${x.id}" title="Editar" aria-label="Editar">${ico('editar', 'ico-s')}</button> <button class="btn btn-s btn-sm" data-clave="${x.id}">${ico('llave', 'ico-s')} Contraseña</button> <button class="btn btn-g btn-sm" data-del="${x.id}" title="Eliminar">${ico('borrar', 'ico-s')}</button></td></tr>`).join('')}</tbody></table>`;
      notas = `<div class="aviso aviso-v">${ico('info')}<div>Las cuentas de Gerencia y Soporte sirven en los dos sistemas. Las demás son de un solo sistema, y una persona puede tener una cuenta en cada uno con el mismo nombre de usuario (RN-54).</div></div>${pend('P-02', 'Faltan los nombres y la cantidad de pilotos; aquí hay dos de ejemplo.')}${pend('P-08', 'Falta el usuario administrador inicial con el que se crean los demás.')}`;
    }
    return vista('configuracion', u, cab('Módulo de configuración', 'Camiones y usuarios', 'Camiones de cada sede y usuarios del sistema de picking.', `<button class="btn btn-p" data-nuevo>${ico('mas')} ${acc}</button>`) + `
      <div class="pestanas">${tabs.map(([k, n, c]) => `<button data-tab="${k}" class="${cfgTab === k ? 'on' : ''}">${n} <span class="cont">${fmt(c)}</span></button>`).join('')}</div>
      <section class="tarjeta"><div class="tabla-caja tabla-alta">${tabla}</div></section>
      <div style="margin-top:16px;display:flex;flex-direction:column;gap:10px">${notas}</div>`, (root) => {
      $$('[data-tab]', root).forEach((b) => b.addEventListener('click', () => { cfgTab = b.dataset.tab; repintar(); }));
      $('[data-nuevo]', root).addEventListener('click', () => editar(null));
      $$('[data-ed]', root).forEach((b) => b.addEventListener('click', () => editar(b.dataset.ed)));
      $$('[data-del]', root).forEach((b) => b.addEventListener('click', () => eliminar(b.dataset.del)));
      $$('[data-clave]', root).forEach((b) => b.addEventListener('click', () => restablecerClave(usuario(b.dataset.clave), u, 'picking')));

      function eliminar(id) {
        if (cfgTab === 'camiones') {
          const c = camion(id);
          const bloqueado = (t) => modal({ titulo: 'No se puede eliminar', cuerpo: `<p style="color:var(--g600)">${t}</p>`, acciones: [{ txt: 'Entendido', cls: 'btn-p' }] });
          if (S.rutas.some((r) => r.camion === c.id)) return bloqueado(`${esc(c.n)} tiene rutas registradas. En la aplicación real la eliminación es lógica y el historial se conserva (P-42).`);
          if (Object.values(S.opciones).some((o) => (o.camion || {}).camion === c.id)) return bloqueado(`${esc(c.n)} está elegido en «Envío por camión» de Facturación.`);
          confirmar('Eliminar', `¿Eliminar <b>${esc(c.n)}</b>?`, 'Eliminar', () => { S.camiones = S.camiones.filter((x) => x !== c); bit(u.id, 'Eliminación de camión', c.n); guardar(); toast('Camión eliminado.'); repintar(); }, 'btn-d');
        } else eliminarUsuario(usuario(id), u, 'picking', repintar);
      }
      function editar(id) {
        if (cfgTab === 'camiones') {
          const c = id != null ? camion(id) : null;
          modal({ titulo: c ? 'Editar camión' : 'Nuevo camión', cuerpo: `<div class="rejilla"><label class="campo"><span>Identificación ${pendIn('P-01')}</span><input class="inp" name="n" value="${esc(c ? c.n : '')}"></label>
              <div class="rejilla r2"><label class="campo"><span>Capacidad máxima (kg)</span><input class="inp mono" name="cap" value="${c ? fmt(c.cap) : ''}"></label><label class="campo"><span>Sede</span>${selSedes('sede', c ? c.sede : 'XE')}</label></div></div>`,
            acciones: [{ txt: 'Cancelar' }, { txt: 'Guardar', cls: 'btn-p', fn: (m) => {
              const n = $('[name=n]', m).value.trim(), cap = leerNumero($('[name=cap]', m).value), sede = $('[name=sede]', m).value;
              if (!n) throw Err('La identificación es obligatoria.'); if (!(cap > 0)) throw Err('La capacidad debe ser mayor que cero.');
              if (c) Object.assign(c, { n, cap, sede }); else S.camiones.push({ id: 'c' + Date.now().toString(36), n, cap, sede, creado: hoyISO() });
              bit(u.id, c ? 'Edición de camión' : 'Creación de camión', `${n} · ${fmt(cap)} kg · ${SEDES[sede]}`); guardar(); toast('Cambios guardados.'); repintar();
            } }] });
        } else formUsuario('picking', id ? usuario(id) : null, u, repintar);
      }
    });
  }

  return { ruta, despachar, detalle, herramientas, pedidosBodega, metaPedido, loteHtml };
})();
