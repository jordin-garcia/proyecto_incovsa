/* ==========================================================================
   SISTEMA DE PICKING (specs/06 a 11, 12 y 14)
   ========================================================================== */
const Picking = (() => {
  const USA_SEDE = ['facturacion', 'bodega', 'ruta', 'reportes'];

  function vista(mod, u, cuerpo, mount, vivo = false) {
    const sede = sedeTrabajo(u);
    const nav = MODULOS_P.filter((m) => accesoModulo(u, m.id)).map((m) => ({ href: '#/picking/' + m.id, n: m.n, i: m.i, on: m.id === mod, cont: m.id === 'bodega' && sede ? (S.orden[sede] || []).length || '' : '' }));
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
        if (s) s.addEventListener('change', () => { fijarSede(s.value); rutaSel = null; repintar(); });
        mount && mount(root);
      },
    };
  }
  const cab = (eyebrow, titulo, texto, acc = '') => `<div class="cab-pag"><div><p class="eyebrow">${eyebrow}</p><h1>${titulo}</h1>${texto ? `<p>${texto}</p>` : ''}</div>${acc ? `<div class="acc">${acc}</div>` : ''}</div>`;

  function ruta(mod) {
    const u = sesion('picking');
    if (!u) { location.hash = '#/acceso/picking?volver=' + encodeURIComponent('#/picking/' + mod); return null; }
    const m = MODULOS_P.find((x) => x.id === mod);
    if (!m) return vista('', u, `<div class="tarjeta vacio">${ico('buscar')}<h4>Módulo no encontrado</h4></div>`);
    if (!accesoModulo(u, mod)) return vista(mod, u, sinAcceso('picking', u, `Sus permisos no incluyen ${m.n}. Los asignan Gerencia o Soporte.`));
    if (USA_SEDE.includes(mod) && !sedeTrabajo(u)) return vista(mod, u, sinAcceso('picking', u, 'Su cuenta no tiene sedes asignadas. Gerencia o Soporte las asignan en Configuración.'));
    return ({ facturacion, bodega, ruta: rutaMod, reportes, configuracion })[mod](u);
  }

  /* ======================================================================
     FACTURACIÓN (specs/06)
     El tablero de pedidos facturados y las opciones de envío se guardan en S,
     que hace de base de datos (RN-48): sobreviven a cerrar la sesión.
     ====================================================================== */
  function facturacion(u) {
    const sede = sedeTrabajo(u);
    const tab = facturadosDe(sede, null), cs = camionesDe(sede);
    const totTab = r3(tab.reduce((a, f) => a + totalFact(f), 0));
    return vista('facturacion', u, cab('Módulo de facturación', 'Pedidos facturados y envío a bodega',
      `Cargue el archivo .xlsx exportado de Odoo: cada referencia es un <b>pedido facturado</b> de un cliente y aparece en el tablero. Arrástrelo a un camión o a «Cliente recoge en bodega» y, cuando la opción esté correcta, envíela a bodega. Cada envío crea un <b>pedido</b> con el correlativo de ${SEDES[sede]}.`,
      `<label class="btn btn-p" tabindex="0">${ico('subir')} Cargar archivo .xlsx<input type="file" accept=".xlsx" hidden data-archivo></label>`) + `
      <div class="fx-lay" data-fx>
        <section class="tarjeta fx-tablero">
          <div class="bloque-cab"><div><h3>Tablero de pedidos facturados</h3><p>${tab.length} pedido(s) facturado(s) · ${kg(totTab)} · ${SEDES[sede]}</p></div>
            <button class="btn btn-g btn-sm" data-vaciar ${tab.length ? '' : 'disabled'}>${ico('borrar', 'ico-s')} Eliminar todos</button></div>
          <div class="fx-zona fx-lista" data-zona="tablero">${tab.length ? tab.map(tarjetaFact).join('') : `<div class="fx-vacio">${ico('archivo')}<h4>No hay pedidos facturados en el tablero</h4><p>Cargue el archivo de Odoo, o arrastre aquí un pedido facturado para regresarlo de una opción de envío.</p></div>`}</div>
        </section>
        <div class="fx-opciones">
          <p class="fx-tit">Opciones de envío</p>
          ${cs.map((c) => opcionCamion(c, sede)).join('')}
          ${cs.length ? '' : pend('P-01', `${SEDES[sede]} no tiene camiones registrados. Solo se conocen los 3 camiones de Quetzaltenango.`)}
          ${opcionRecoge(sede)}
        </div>
      </div>
      <p class="muted" style="font-size:13.5px;margin-top:16px">Arrastre con el mouse o con el dedo desde ${ico('asa', 'ico-s')}. Lo que está en el tablero y en cada opción se guarda: sigue igual al cerrar la sesión y lo ven los demás facturadores de la sede. Un pedido enviado a bodega ya no se puede editar ni cancelar.</p>`,
      (root) => montarFacturacion(root, u, sede), true);
  }
  function opcionesSector(f) {
    const actual = sectorFact(f);
    const idSel = f.cli != null && cliente(f.cli) ? cliente(f.cli).s : (S.sectores.find((s) => s.n === actual) || {}).id;
    return (idSel == null ? `<option value="" selected>${esc(actual || 'Sin sector')}</option>` : '') + S.sectores.map((s) => `<option value="${s.id}" ${s.id === idSel ? 'selected' : ''}>${esc(s.n)}</option>`).join('');
  }
  const tarjetaFact = (f) => `<article class="fx-t" data-id="${f.id}">
      <span class="asa" title="Arrastre a una opción de envío">${ico('asa', 'ico-s')}</span>
      <div class="fx-t-c">
        <div class="fx-t-1"><b class="mono">${esc(f.num)}</b><span class="mono fx-kg">${fmt(totalFact(f))} kg</span></div>
        <div class="fx-t-n">${esc(nombreFact(f))}</div>
        <select class="sel fx-sector" data-sector="${f.id}" aria-label="Sector del cliente" title="Corregir el sector del cliente">${opcionesSector(f)}</select>
      </div>
      <button class="btn btn-g btn-ico fx-quitar" data-borrar="${f.id}" title="Eliminar del tablero" aria-label="Eliminar del tablero">${ico('x', 'ico-s')}</button>
    </article>`;
  const filaOpcion = (f) => `<div class="fx-f" data-id="${f.id}"><span class="asa" title="Arrastre a otra opción o al tablero">${ico('asa', 'ico-s')}</span><b class="mono">${esc(f.num)}</b><span class="n">${esc(nombreFact(f))}</span></div>`;
  const zonaVacia = '<div class="fx-zona-vacia">Arrastre aquí pedidos facturados</div>';
  function opcionCamion(c, sede) {
    const fs = facturadosDe(sede, c.id), tot = r3(fs.reduce((a, f) => a + totalFact(f), 0));
    const ps = pilotosDe(sede), pil = pilotoOpcion(sede, c.id);
    const exceso = tot > c.cap, pct = Math.min(100, (tot / c.cap) * 100);
    return `<section class="tarjeta fx-op ${exceso ? 'exceso' : ''}">
      <div class="fx-op-cab"><span class="ic">${ico('camion')}</span><div><h3>${esc(c.n)}</h3><small>Capacidad ${fmt(c.cap)} kg</small></div><span class="chip">${fs.length} pedido(s) facturado(s)</span></div>
      <label class="campo"><span>Piloto</span><select class="sel" data-piloto="${c.id}">${ps.length ? `<option value="">Elija el piloto</option>${ps.map((p) => `<option value="${p.id}" ${p.id === pil ? 'selected' : ''}>${esc(p.nombre)}</option>`).join('')}` : '<option value="">Sin pilotos en la sede</option>'}</select></label>
      <div class="fx-zona fx-mini" data-zona="${c.id}">${fs.length ? fs.map(filaOpcion).join('') : zonaVacia}</div>
      <div><div class="fx-peso"><span>Peso acumulado</span><span class="mono">${fmt(tot)} / ${fmt(c.cap)} kg</span></div>
        <div class="medidor ${exceso ? 'exceso' : tot === c.cap ? 'lleno' : ''}"><i style="width:${pct}%"></i></div></div>
      ${exceso ? `<div class="aviso aviso-a">${ico('alerta')}<div><strong>Sobrepeso.</strong> El total (${kg(tot)}) excede la capacidad del camión en ${kg(r3(tot - c.cap))}. La alerta solo informa: se puede enviar igual (RN-13).</div></div>` : ''}
      <div class="fx-acc"><button class="btn btn-s btn-sm" data-cancelar="${c.id}" ${fs.length ? '' : 'disabled'}>Cancelar</button>
        <button class="btn btn-p btn-sm" data-enviar="${c.id}" ${fs.length && pil ? '' : 'disabled'} title="${!pil ? 'Elija el piloto' : ''}">${ico('flecha', 'ico-s')} Enviar Pedido a Bodega</button></div>
    </section>`;
  }
  function opcionRecoge(sede) {
    const fs = facturadosDe(sede, 'recoge'), tot = r3(fs.reduce((a, f) => a + totalFact(f), 0));
    return `<section class="tarjeta fx-op">
      <div class="fx-op-cab"><span class="ic">${ico('edificio')}</span><div><h3>Cliente recoge en bodega</h3><small>No pasa por Ruta</small></div><span class="chip">${fs.length} pedido(s) facturado(s)</span></div>
      <div class="fx-zona fx-mini" data-zona="recoge">${fs.length ? fs.map(filaOpcion).join('') : zonaVacia}</div>
      <div class="fx-peso"><span>Total</span><span class="mono">${fmt(tot)} kg</span></div>
      <div class="fx-acc"><button class="btn btn-s btn-sm" data-cancelar="recoge" ${fs.length ? '' : 'disabled'}>Cancelar</button>
        <button class="btn btn-p btn-sm" data-enviar="recoge" ${fs.length ? '' : 'disabled'}>${ico('flecha', 'ico-s')} Enviar Pedido a Bodega</button></div>
    </section>`;
  }
  function montarFacturacion(root, u, sede) {
    const lay = $('[data-fx]', root);
    arrastrable(lay, { item: '.fx-t, .fx-f', asa: '.asa', zona: '.fx-zona', onSoltar: (id, zona) => {
      if (intentar(() => opAsignar(id, zona === 'tablero' ? null : zona))) { guardar(); repintar(); }
    } });
    lay.addEventListener('change', (e) => {
      const s = e.target.closest('[data-sector]');
      if (s && s.value !== '') { if (intentar(() => opCorregirSector(s.dataset.sector, Number(s.value), u.id))) { guardar(); toast('Sector corregido.'); repintar(); } return; }
      const p = e.target.closest('[data-piloto]');
      if (p) { opElegirPiloto(sede, p.dataset.piloto, p.value); guardar(); repintar(); }
    });
    lay.addEventListener('click', (e) => {
      const b = e.target.closest('[data-borrar]');
      if (b) { const f = facturado(b.dataset.borrar); return confirmar('Eliminar pedido facturado', `¿Eliminar del tablero el pedido facturado <b>${esc(f.num)}</b> de ${esc(nombreFact(f))} (${kg(totalFact(f))})? La eliminación queda en la bitácora.`, 'Eliminar', () => { opEliminarFacturado(f.id, u.id); guardar(); toast('Pedido facturado eliminado.'); repintar(); }, 'btn-d'); }
      const v = e.target.closest('[data-vaciar]');
      if (v) { const n = facturadosDe(sede, null).length; return confirmar('Eliminar todos', `¿Eliminar los <b>${n}</b> pedidos facturados del tablero? Los que ya están en una opción de envío no se eliminan. La eliminación queda en la bitácora.`, 'Eliminar todos', () => { opVaciarTablero(sede, u.id); guardar(); toast('Tablero vacío.'); repintar(); }, 'btn-d'); }
      const c = e.target.closest('[data-cancelar]');
      if (c) { const op = c.dataset.cancelar, n = facturadosDe(sede, op).length; return confirmar(`Cancelar · ${esc(nombreOpcion(op))}`, `Los <b>${n}</b> pedidos facturados de esta opción regresan al tablero. No se crea ningún pedido y no se pierde nada. La cancelación queda en la bitácora.`, 'Regresar al tablero', () => { opCancelarOpcion(sede, op, u.id); guardar(); toast('Los pedidos facturados regresaron al tablero.'); repintar(); }); }
      const en = e.target.closest('[data-enviar]');
      if (en) enviar(en.dataset.enviar);
    });
    const arch = $('[data-archivo]', root);
    arch.addEventListener('change', () => { const f = arch.files[0]; arch.value = ''; if (f) cargarArchivo(f, u, sede); });

    const enviar = (op) => {
      const fs = facturadosDe(sede, op); if (!fs.length) return;
      const tot = r3(fs.reduce((a, f) => a + totalFact(f), 0)), clis = new Set(fs.map(claveRuta)).size;
      const cam = op === 'recoge' ? null : camion(op), pil = cam ? pilotoOpcion(sede, op) : null;
      if (cam && !pil) return toast(`Elija el piloto de ${esc(cam.n)}.`, 'error');
      confirmar('Enviar pedido a bodega', `<div class="rejilla" style="gap:10px">
          <div>Se crea el <b>pedido ${S.corr.ped[sede] + 1}</b> de ${SEDES[sede]} con ${fs.length} pedido(s) facturado(s) de ${clis} cliente(s) y ${kg(tot)}: ${fs.map((f) => esc(f.num)).join(', ')}.</div>
          <div>El pedido pasa a <b>En Preparación</b> en Bodega, con el Peso de Conversión vigente de cada producto.</div>
          ${cam ? `<div>Se crea la <b>ruta ${S.corr.ruta[sede] + 1}</b> con fecha de hoy, ${esc(cam.n)} y ${esc(nombreUsuario(pil))}.</div>${tot > cam.cap ? `<div class="aviso aviso-a">${ico('alerta')}<div>El total excede la capacidad del camión (${kg(cam.cap)}). Se puede enviar igual.</div></div>` : ''}` : '<div>El cliente recoge en bodega: no pasa por Ruta.</div>'}</div>`, 'Enviar a bodega', () => {
        const p = opEnviarOpcion(sede, op, u.id);
        guardar();
        const r = rutaDe(p.id);
        setTimeout(() => modal({ titulo: `Pedido ${p.corr} enviado a Bodega`, cuerpo: `<div class="exito" style="padding:6px 0 0"><div class="ok">${ico('check')}</div>
            <p style="font-size:16px">El pedido <b>${p.corr}</b> de ${SEDES[p.sede]} quedó <b>En Preparación</b> y ya aparece en Bodega.</p>
            ${r ? `<p class="muted" style="margin-top:8px">Ruta <b>${r.num}</b> · ${fFecha(r.fecha)} · ${esc(camion(r.camion).n)} · ${esc(nombreUsuario(r.piloto))}</p>` : '<p class="muted" style="margin-top:8px">El cliente recoge en bodega.</p>'}</div>`,
          acciones: [{ txt: 'Seguir en Facturación', cls: 'btn-s' }].concat(tiene(u, 'pk.bodega') ? [{ txt: 'Ver en Bodega', cls: 'btn-p', fn: () => { location.hash = '#/picking/bodega'; } }] : []) }), 60);
        repintar();
      });
    };
  }

  /* ---- Lectura del archivo de Odoo (RN-35, RN-36, RN-37) */
  function cargarArchivo(file, u, sede) {
    if (!/\.xlsx$/i.test(file.name)) return toast('El archivo debe ser .xlsx, exportado de Odoo.', 'error');
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
    const iR = col('Referencia'), iC = col('Contacto'), iCi = col('Contacto/Ciudad'), iE = col('Estado'), iP = col('Movimientos de stock/Producto'), iQ = col('Movimientos de stock/Cantidad hecha');
    const txt = (v) => String(v == null ? '' : v).trim();
    const refs = []; let cur = null;
    filas.slice(1).forEach((r) => {
      if (!r) return;
      const ref = txt(r[iR]), con = txt(r[iC]), pr = txt(r[iP]);
      if (ref && !con && !pr) return;                 // fila de agrupación de Odoo, por ejemplo «agosto 2026 (80)»
      if (ref) { cur = { ref, contacto: con, ciudad: txt(r[iCi]), estado: txt(r[iE]), lineas: [] }; refs.push(cur); }
      if (pr && cur) cur.lineas.push({ nombre: pr, kg: r3(Number(r[iQ]) || 0) });   // sin Referencia ni Contacto: otra línea del mismo pedido facturado
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
    const ctx = { sede, archivo, u, otras: refs.length - hechas.length,
      items: hechas.map((r) => ({ num: (r.ref.split('/')[2] || r.ref).trim(), contacto: r.contacto, ciudad: r.ciudad, lineas: r.lineas })),
      agregar: [], omitidos: new Set(), clientes: {} };
    // RN-43: productos que no están en el catálogo
    const faltan = {};
    ctx.items.forEach((it) => it.lineas.forEach((l) => {
      if (productoPorNombre(l.nombre)) return;
      const k = claveProducto(l.nombre);
      faltan[k] = faltan[k] || { k, nombre: l.nombre, lineas: 0, nums: [] };
      faltan[k].lineas++; if (!faltan[k].nums.includes(it.num)) faltan[k].nums.push(it.num);
    }));
    pasoProductos(Object.values(faltan), ctx);
  }
  const decision = (dec) => `<div class="seg seg-sm" data-dec>${dec.map(([v, n]) => `<button type="button" data-v="${v}">${n}</button>`).join('')}</div>`;
  function pasoProductos(faltan, ctx) {
    if (!faltan.length) return pasoClientes(ctx);
    const lineas = faltan.reduce((a, x) => a + x.lineas, 0);
    modal({ titulo: 'Productos que no están en el catálogo', grande: true, cuerpo: `
      <p style="color:var(--g600)">Estos productos no están en el catálogo. ¿Desea agregarlos? <b>${faltan.length} producto(s) en ${lineas} línea(s).</b> Para agregar uno solo escriba su <b>Peso de Conversión</b>: el nombre es el del archivo. Los pedidos facturados que tengan un producto que no se agregue <b>no se cargan</b>, porque no hay con qué convertirlo a unidades.</p>
      <div class="fx-faltan">${faltan.map((x) => `<div class="fx-falta" data-k="${esc(x.k)}">
        <div class="d"><b class="mono">${esc(x.nombre)}</b><small>${x.lineas} línea(s) · pedido(s) facturado(s) ${x.nums.map(esc).join(', ')}</small></div>
        ${decision([['si', 'Agregar'], ['no', 'No agregar']])}
        <input class="inp mono" name="p2" inputmode="decimal" placeholder="Peso de Conversión (kg)" hidden></div>`).join('')}</div>`,
      acciones: [{ txt: 'Cancelar la carga' }, { txt: 'Continuar', cls: 'btn-p', fn: (m) => {
        const filas = $$('.fx-falta', m), pendientes = filas.filter((f) => !f.dataset.v);
        if (pendientes.length) throw Err(`Indique si agrega o no ${pendientes.length === 1 ? 'el producto pendiente' : `los ${pendientes.length} productos pendientes`}.`);
        const agregar = [], omitidos = new Set();
        filas.forEach((f) => {
          const x = faltan.find((y) => y.k === f.dataset.k);
          if (f.dataset.v === 'si') { const p2 = leerNumero($('[name=p2]', f).value); if (!(p2 > 0)) throw Err(`Escriba el Peso de Conversión de ${x.nombre}: un número mayor que cero.`); agregar.push({ nombre: x.nombre, p2 }); }
          else omitidos.add(x.k);
        });
        ctx.agregar = agregar; ctx.omitidos = omitidos;
        setTimeout(() => pasoClientes(ctx), 30);
      } }],
      alAbrir: (m) => $$('.fx-falta', m).forEach((f) => $('[data-dec]', f).addEventListener('click', (e) => {
        const b = e.target.closest('[data-v]'); if (!b) return;
        f.dataset.v = b.dataset.v; $$('[data-v]', f).forEach((x) => x.classList.toggle('on', x === b));
        const inp = $('[name=p2]', f); inp.hidden = b.dataset.v !== 'si'; if (!inp.hidden) inp.focus();
      })) });
  }
  function pasoClientes(ctx) {
    const cargables = ctx.items.filter((it) => !it.lineas.some((l) => ctx.omitidos.has(claveProducto(l.nombre))));
    const nuevos = {};
    cargables.forEach((it) => {
      const k = claveCliente(it.contacto);
      if (S.clientes.some((c) => claveCliente(c.n) === k)) return;
      nuevos[k] = nuevos[k] || { k, contacto: it.contacto, ciudad: it.ciudad, nums: [] };
      nuevos[k].nums.push(it.num);
    });
    const lista = Object.values(nuevos);
    if (!lista.length) return terminarCarga(ctx);
    const opcionesS = (ciudad) => { const ya = S.sectores.find((s) => s.n === ciudad); return S.sectores.map((s) => `<option value="${s.id}" ${ya && ya.id === s.id ? 'selected' : ''}>${esc(s.n)}</option>`).join('') + `<option value="nuevo" ${ya ? '' : 'selected'}>Agregar sector nuevo…</option>`; };
    modal({ titulo: 'Clientes que no están en la base', grande: true, cuerpo: `
      <p style="color:var(--g600)"><b>${lista.length} cliente(s) del archivo no existen en la base.</b> ¿Desea guardarlos? Si guarda uno, confirme su nombre y su sector (de la lista o uno nuevo). Si no lo guarda, el pedido facturado usa el nombre y el sector tal como vienen en el archivo (columnas Contacto y Contacto/Ciudad).</p>
      <div class="fx-faltan">${lista.map((x) => `<div class="fx-falta fx-cli" data-k="${esc(x.k)}">
        <div class="d"><b>${esc(x.contacto || 'Sin nombre')}</b><small>Contacto/Ciudad: ${esc(x.ciudad || '—')} · pedido(s) facturado(s) ${x.nums.map(esc).join(', ')}</small></div>
        ${decision([['si', 'Guardar'], ['no', 'No guardar']])}
        <div class="fx-cli-datos" hidden><label class="campo"><span>Nombre</span><input class="inp" name="n" value="${esc(x.contacto)}"></label>
          <label class="campo"><span>Sector</span><select class="sel" name="s">${opcionesS(x.ciudad)}</select></label>
          <label class="campo" data-nuevo><span>Sector nuevo</span><input class="inp" name="sn" value="${esc(x.ciudad)}"></label></div></div>`).join('')}</div>`,
      acciones: [{ txt: 'Cancelar la carga' }, { txt: 'Cargar al tablero', cls: 'btn-p', fn: (m) => {
        const filas = $$('.fx-cli', m), pendientes = filas.filter((f) => !f.dataset.v);
        if (pendientes.length) throw Err(`Indique si guarda o no ${pendientes.length === 1 ? 'el cliente pendiente' : `los ${pendientes.length} clientes pendientes`}.`);
        const dec = {};
        filas.forEach((f) => {
          if (f.dataset.v !== 'si') return;
          const n = $('[name=n]', f).value.trim(), s = $('[name=s]', f).value, sn = $('[name=sn]', f).value.trim();
          if (!n) throw Err('Escriba el nombre de cada cliente que va a guardar.');
          if (s === 'nuevo' && !sn) throw Err(`Escriba el sector nuevo de ${n}.`);
          dec[f.dataset.k] = { nombre: n, sector: s === 'nuevo' ? null : Number(s), sectorNuevo: s === 'nuevo' ? sn : '' };
        });
        ctx.clientes = dec;
        setTimeout(() => terminarCarga(ctx), 30);
      } }],
      alAbrir: (m) => $$('.fx-cli', m).forEach((f) => {
        $('[data-dec]', f).addEventListener('click', (e) => {
          const b = e.target.closest('[data-v]'); if (!b) return;
          f.dataset.v = b.dataset.v; $$('[data-v]', f).forEach((x) => x.classList.toggle('on', x === b));
          $('.fx-cli-datos', f).hidden = b.dataset.v !== 'si';
        });
        const s = $('[name=s]', f), nv = () => { $('[data-nuevo]', f).hidden = s.value !== 'nuevo'; };
        s.addEventListener('change', nv); nv();
      }) });
  }
  function terminarCarga(ctx) {
    const { sede, u } = ctx;
    const cargar = ctx.items.filter((it) => !it.lineas.some((l) => ctx.omitidos.has(claveProducto(l.nombre))));
    const sinCargar = ctx.items.filter((it) => !cargar.includes(it));
    // Todo se aplica junto, al final (RNF-06)
    ctx.agregar.forEach((a) => opAgregarProducto(a.nombre, a.p2, u.id));
    const guardados = {};
    Object.entries(ctx.clientes).forEach(([k, d]) => {
      const sid = d.sector != null ? d.sector : opCrearSector(d.sectorNuevo, u.id, 'Sector agregado desde Facturación').id;
      guardados[k] = opAgregarCliente(d.nombre, sid, u.id).id;
    });
    const items = cargar.map((it) => {
      const k = claveCliente(it.contacto), base = S.clientes.filter((c) => claveCliente(c.n) === k);
      let cli = null, nombre = it.contacto, sec = it.ciudad;
      if (guardados[k] != null) cli = guardados[k];
      else if (base.length === 1) cli = base[0].id;
      else if (base.length > 1) nombre = base[0].n;            // nombre repetido con sectores distintos: el sector del archivo (RN-44)
      if (cli != null) { const c = cliente(cli); nombre = c.n; sec = sector(c.s); }
      return { num: it.num, cli, nombre, sector: sec, lineas: it.lineas.map((l) => ({ prod: productoPorNombre(l.nombre).id, kg: l.kg })) };
    });
    const det = [`${ctx.archivo}`, `${items.length} pedido(s) facturado(s) cargado(s)`,
      sinCargar.length ? `${sinCargar.length} sin cargar por productos no agregados (${sinCargar.map((x) => x.num).join(', ')})` : '',
      ctx.otras ? `${ctx.otras} referencia(s) que no están en estado Hecho` : ''].filter(Boolean).join(' · ');
    opCargarArchivo(sede, items, u.id, det);
    guardar();
    repintar();
    setTimeout(() => modal({ titulo: 'Archivo cargado', cuerpo: `<div class="rejilla" style="gap:10px;font-size:15.5px">
        <div class="aviso aviso-v">${ico('check')}<div><b>${items.length} pedido(s) facturado(s)</b> de ${SEDES[sede]} se agregaron al tablero.</div></div>
        ${sinCargar.length ? `<div class="aviso aviso-a">${ico('alerta')}<div><b>${sinCargar.length} pedido(s) facturado(s) no se cargaron</b> porque tienen productos que no se agregaron al catálogo: ${sinCargar.map((x) => esc(x.num)).join(', ')}.</div></div>` : ''}
        ${ctx.otras ? `<div class="muted">Se ignoraron ${ctx.otras} referencia(s) que no están en estado «Hecho».</div>` : ''}
        ${ctx.agregar.length ? `<div class="muted">Productos agregados al catálogo: ${ctx.agregar.length}.</div>` : ''}
        ${Object.keys(ctx.clientes).length ? `<div class="muted">Clientes guardados en la base: ${Object.keys(ctx.clientes).length}.</div>` : ''}</div>`, acciones: [{ txt: 'Listo', cls: 'btn-p' }] }), 60);
  }

  /* ======================================================================
     BODEGA · tablero de preparación en el módulo
     ====================================================================== */
  const pedidosBodega = (sede) => (S.orden[sede] || []).map(pedido).filter((p) => p && p.estado === 'PREP');
  const clientesPedido = (p) => new Set(p.lineas.map((l) => l.ck)).size;
  const metaPedido = (p) => {
    const r = rutaDe(p.id);
    return p.tipo === 'camion'
      ? [['ruta', `Ruta ${r ? r.num : '—'}`], ['camion', esc((camion(p.camion) || {}).n || '—')], ['usuario', esc(nombreUsuario(p.piloto))], ['usuarios', `${clientesPedido(p)} cliente(s)`], ['caja', kg(totalPedido(p))]]
      : [['edificio', 'Sin camión'], ['usuarios', `${clientesPedido(p)} cliente(s)`], ['caja', kg(totalPedido(p))]];
  };
  const nombreProd = (id) => (prod(id) || {}).n || '—';
  function bodega(u) {
    const sede = sedeTrabajo(u), ps = pedidosBodega(sede);
    return vista('bodega', u, cab('Módulo de bodega · tablero de preparación', 'Pedidos por preparar',
      'Llegan en el orden en que los envía Facturación. Arrastre un pedido o una fila para cambiar la prioridad: el orden y las marcas se ven al instante en todas las pantallas de la sede.',
      `<a class="btn btn-p" href="#/picking/tablero">${ico('tv')} Abrir tablero en pantalla completa</a>`) + `
      <div style="display:flex;gap:10px;align-items:center;margin-bottom:16px;flex-wrap:wrap"><span class="chip chip-o">${ps.length} pedido(s) en cola</span><span class="muted" style="font-size:14px">${SEDES[sede]} · la prioridad y las marcas no quedan en el historial</span></div>
      ${ps.length ? `<div class="ped-lista" data-pedidos>${ps.map((p, i) => tarjetaPedido(p, i)).join('')}</div>`
        : `<div class="tarjeta vacio" style="padding:60px">${ico('check')}<h4>No hay pedidos por preparar</h4><p>Cuando Facturación envíe un pedido aparecerá aquí al instante.</p></div>`}`, (root) => {
      ordenable($('[data-pedidos]', root), { item: '.ped', asa: '.asa-ped', onFin: (ids) => { opOrdenPedidos(sede, ids); guardar(); repintar(); } });
      $$('tbody[data-ped]', root).forEach((tb) => ordenable(tb, { item: 'tr', asa: '.asa', onFin: (ids) => { opOrdenLineas(tb.dataset.ped, ids.map(Number)); guardar(); repintar(); } }));
      $('.contenido', root).addEventListener('click', (e) => {
        const m = e.target.closest('[data-marcar]');
        if (m) { opMarcar(m.dataset.p, Number(m.dataset.marcar)); guardar(); repintar(); return; }
        const d = e.target.closest('[data-despachar]');
        if (d) despachar(pedido(d.dataset.despachar), u);
      });
    }, true);
  }
  function tarjetaPedido(p, i) {
    const listas = p.prep.filter((x) => x.listo).length, n = p.prep.length;
    return `<article class="tarjeta ped" data-id="${p.id}">
      <div class="ped-cab"><span class="asa asa-ped" title="Arrastre para cambiar la prioridad">${ico('asa')}</span>
        <div class="ped-num"><div style="text-align:center"><small>PEDIDO</small><br>${p.corr}</div></div>
        <div><h3>Prioridad ${i + 1} · ${p.tipo === 'camion' ? 'Envío en camión' : 'Cliente recoge en bodega'}</h3>
          <div class="ped-meta">${metaPedido(p).map(([ic, t]) => `<span>${ico(ic, 'ico-s')}${t}</span>`).join('')}<span>${ico('reloj', 'ico-s')}${fHora(p.fecha)}</span></div></div>
        <div class="ped-avance"><div style="display:flex;justify-content:space-between"><span>Preparadas</span><span class="mono">${listas} de ${n}</span></div><div class="medidor"><i style="width:${(listas / n) * 100}%"></i></div></div>
      </div>
      <div class="tabla-caja"><table class="tabla"><thead><tr><th style="width:34px"></th><th>Producto</th><th class="der">Cantidad (kg)</th><th>Unidades</th><th class="cen" style="width:70px">Listo</th></tr></thead>
        <tbody data-ped="${p.id}">${p.prep.map((l) => `<tr data-id="${l.prod}" class="${l.listo ? 'lista' : ''}"><td><span class="asa">${ico('asa', 'ico-s')}</span></td>
          <td class="cod">${esc(nombreProd(l.prod))}</td><td class="der kg">${fmt(l.kg)}</td>
          <td>${htmlConversion(l.kg, l.p2)} <span class="muted mono" style="font-size:11.5px;margin-left:4px">÷ ${fmt(l.p2)}</span></td>
          <td class="cen"><button class="marca ${l.listo ? 'on' : ''}" data-marcar="${l.prod}" data-p="${p.id}" aria-pressed="${l.listo}" aria-label="Marcar como listo">${ico('check')}</button></td></tr>`).join('')}</tbody></table></div>
      <div class="ped-pie"><span class="muted" style="font-size:14px">${listas === n ? `Todo listo. Al despachar pasa a <b>${p.tipo === 'camion' ? 'En Ruta' : 'Despachado'}</b>.` : `El botón se habilita cuando las ${n} líneas estén marcadas.`}</span>
        <button class="btn btn-p" data-despachar="${p.id}" ${listas === n ? '' : 'disabled'}>${ico('check')} Pedido despachado</button></div>
    </article>`;
  }
  function despachar(p, u, alTerminar) {
    const destino = p.tipo === 'camion' ? 'En Ruta' : 'Despachado';
    confirmar(`Despachar pedido ${p.corr}`, `El pedido pasa a <b>${destino}</b>${p.tipo === 'camion' ? ` y aparece en el módulo de Ruta de ${esc(nombreUsuario(p.piloto))}` : ''}. No se requiere confirmar la carga en el camión.`, 'Pedido despachado', () => {
      opDespachar(p.id, u.id); guardar();
      if (alTerminar) alTerminar(p); else { toast(`Pedido ${p.corr} → ${destino}.`); repintar(); }
    });
  }

  /* ======================================================================
     RUTA (specs/08): una fila por cliente (RN-49)
     ====================================================================== */
  let rutaSel = null, rutaTab = 'curso';
  function rutasVisibles(u) {
    const sede = sedeTrabajo(u), todas = !esPiloto(u) && tiene(u, 'pk.ruta.todas');
    return S.rutas.filter((r) => (todas ? r.sede === sede : r.piloto === u.id))
      .filter((r) => ['RUTA', 'ENTR'].includes(pedido(r.pedido).estado));
  }
  function rutaMod(u) {
    const todas = rutasVisibles(u);
    const curso = todas.filter((r) => pedido(r.pedido).estado === 'RUTA'), hist = todas.filter((r) => pedido(r.pedido).estado === 'ENTR').sort((a, b) => b.entrega.localeCompare(a.entrega));
    const lista = rutaTab === 'curso' ? curso : hist;
    if (!lista.find((r) => r.id === rutaSel)) rutaSel = lista[0] ? lista[0].id : null;
    const r = S.rutas.find((x) => x.id === rutaSel);
    const propias = esPiloto(u) || !tiene(u, 'pk.ruta.todas');
    return vista('ruta', u, cab('Módulo de ruta', propias ? 'Mis rutas' : 'Rutas', propias ? 'Solo ve las rutas que tiene asignadas. Acomode los clientes durante la ruta: el orden que tengan al pulsar «Pedido entregado» se guarda como el recorrido.' : 'Ve todas las rutas de la sede.') + `
      <div class="pestanas"><button data-tab="curso" class="${rutaTab === 'curso' ? 'on' : ''}">${ico('camion', 'ico-s')} En ruta <span class="cont">${curso.length}</span></button><button data-tab="hist" class="${rutaTab === 'hist' ? 'on' : ''}">${ico('lista', 'ico-s')} Registro histórico <span class="cont">${hist.length}</span></button></div>
      ${lista.length ? `<div class="ruta-lay">
        <div>${lista.map((x) => { const p = pedido(x.pedido); return `<button class="ruta-op ${x.id === rutaSel ? 'on' : ''}" data-r="${x.id}"><div style="display:flex;justify-content:space-between;align-items:center"><b>Ruta ${x.num}</b>${chipEstado(p)}</div>
          <div class="muted" style="font-size:13.5px;margin-top:8px">${fFecha(x.fecha)} · ${esc((camion(x.camion) || {}).n || '—')} · ${esc(nombreUsuario(x.piloto))}</div><div class="muted" style="font-size:13.5px">Pedido ${p.corr} · ${x.orden.length} clientes · ${kg(totalPedido(p))}</div></button>`; }).join('')}</div>
        <div>${r ? detalleRuta(r) : ''}</div></div>`
      : `<div class="tarjeta vacio" style="padding:60px">${ico('ruta')}<h4>${rutaTab === 'curso' ? 'No hay rutas en curso' : 'Todavía no hay rutas entregadas'}</h4><p>${rutaTab === 'curso' ? 'Una ruta aparece aquí cuando Bodega pulsa «Pedido despachado».' : ''}</p></div>`}`, (root) => {
      $$('[data-tab]', root).forEach((b) => b.addEventListener('click', () => { rutaTab = b.dataset.tab; rutaSel = null; repintar(); }));
      $$('[data-r]', root).forEach((b) => b.addEventListener('click', () => { rutaSel = b.dataset.r; repintar(); }));
      const tb = $('[data-paradas]', root);
      if (tb && r && pedido(r.pedido).estado === 'RUTA') ordenable(tb, { item: 'tr', asa: '.asa', onFin: (ids) => { opOrdenRuta(r.id, ids); guardar(); repintar(); } });
      const be = $('[data-entregar]', root);
      if (be) be.addEventListener('click', () => { const cl = clientesRuta(r); confirmar(`Entregar ruta ${r.num}`, `Se registra la entrega completa a los ${cl.length} clientes y el pedido pasa a <b>Entregado</b>. Se guarda este recorrido: ${cl.map((c, i) => `<b>${i + 1}.</b> ${esc(c.nombre)}`).join(' · ')}.`, 'Pedido entregado', () => {
        opEntregar(r.id, u.id); guardar(); toast(`Ruta ${r.num} entregada. Quedó en el registro histórico.`); rutaTab = 'hist'; repintar();
      }); });
    }, true);
  }
  function detalleRuta(r) {
    const p = pedido(r.pedido), enCurso = p.estado === 'RUTA', cl = clientesRuta(r);
    return `<section class="tarjeta" style="overflow:hidden">
      <div class="bloque-cab"><div><h3 style="font-size:20px">Ruta ${r.num} · pedido ${p.corr}</h3><p>${enCurso ? 'El número y la fecha se asignaron cuando Facturación envió el pedido a bodega.' : `Entregada el ${fFH(r.entrega)}.`}</p></div>${chipEstado(p)}</div>
      <div class="ruta-datos"><div><small>Número de ruta</small><b>${r.num}</b></div><div><small>Fecha</small><b>${fFecha(r.fecha)}</b></div><div><small>Camión</small><b>${esc((camion(r.camion) || {}).n || '—')}</b></div><div><small>Piloto</small><b>${esc(nombreUsuario(r.piloto))}</b></div></div>
      <div class="tabla-caja"><table class="tabla"><thead><tr>${enCurso ? '<th style="width:34px"></th>' : ''}<th style="width:70px">Orden</th><th>Cliente</th><th>Sector</th><th class="der">Total (kg)</th></tr></thead>
        <tbody data-paradas>${cl.map((c, i) => `<tr data-id="${esc(c.ck)}">${enCurso ? `<td><span class="asa">${ico('asa', 'ico-s')}</span></td>` : ''}<td><span class="parada-n">${i + 1}</span></td><td><b>${esc(c.nombre)}</b></td><td class="muted">${esc(c.sector)}</td><td class="der kg">${fmt(c.total)}</td></tr>`).join('')}</tbody>
        <tfoot><tr>${enCurso ? '<td></td>' : ''}<td colspan="3">Total de la ruta</td><td class="der kg">${fmt(totalPedido(p))}</td></tr></tfoot></table></div>
      ${enCurso ? `<div class="ped-pie"><span class="muted" style="font-size:14px">Al confirmar, el pedido pasa a Entregado y la ruta queda en el registro histórico con su recorrido.</span>
        <button class="btn btn-p btn-lg" data-entregar>${ico('check')} Pedido entregado</button></div>`
      : `<div class="ped-pie"><div class="recorrido"><b style="margin-right:4px">Recorrido guardado:</b>${cl.map((c, i) => `<span>${i + 1}. ${esc(c.nombre)}</span>`).join('')}</div></div>`}
    </section>`;
  }

  /* ======================================================================
     REPORTES (specs/10): filtro de periodo en Despacho y Rutas realizadas
     ====================================================================== */
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const isoLocal = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const diaDe = (iso) => isoLocal(new Date(iso));
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
    const fecha = (attr, v) => `<input type="date" class="inp" ${attr} value="${v}">`;
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
          <div class="tarjeta kpi"><span class="etq">Kilogramos despachados</span><b>${fmt(tot)}</b><small>pedidos cerrados en Bodega</small></div>
          <div class="tarjeta kpi"><span class="etq">Unidades completas</span><b>${fmt(uni)}</b><small>más ${kg(resto)} sueltos</small></div>
          <div class="tarjeta kpi"><span class="etq">Pedidos cerrados</span><b>${cerrados.length}</b><small>${cerrados.filter((p) => p.tipo === 'camion').length} en camión · ${cerrados.filter((p) => p.tipo === 'recoge').length} recogidos</small></div>
          <div class="tarjeta kpi"><span class="etq">Rutas entregadas</span><b>${entregadas}</b><small>en el periodo</small></div></div>
        <section class="tarjeta"><div class="bloque-cab"><div><h3>${P.nombre} por producto</h3><p>${SEDES[sede]} · ${P.txt}</p></div><div style="display:flex;gap:8px"><button class="btn btn-s btn-sm" data-exp>${ico('descargar', 'ico-s')} Excel</button><button class="btn btn-s btn-sm" data-exp>${ico('descargar', 'ico-s')} PDF</button></div></div>
          <div class="tabla-caja"><table class="tabla"><thead><tr><th>Producto</th><th class="der">Cantidad (kg)</th><th style="width:22%"></th><th>Unidades</th></tr></thead><tbody>
          ${filas.map((x) => `<tr><td class="cod">${esc(nombreProd(x.prod))}</td><td class="der kg">${fmt(x.kg)}</td><td><div class="medidor" style="height:8px"><i style="width:${(x.kg / max) * 100}%"></i></div></td><td>${htmlConversion(x.kg, x.p2)} <span class="muted mono" style="font-size:11.5px;margin-left:4px">÷ ${fmt(x.p2)}</span></td></tr>`).join('') || `<tr><td colspan="4"><div class="vacio">Sin despachos en el periodo.</div></td></tr>`}</tbody>
          ${filas.length ? `<tfoot><tr><td>Total del periodo</td><td class="der kg">${fmt(tot)}</td><td></td><td class="mono">${fmt(uni)} unidades + ${fmt(resto)} kg</td></tr></tfoot>` : ''}</table></div></section>`;
    } else if (repTab === 'rutas') {
      const rs = S.rutas.filter((r) => r.sede === sede && enP(r.fecha)).sort((a, b) => b.fecha.localeCompare(a.fecha));
      cuerpo = `<section class="tarjeta"><div class="bloque-cab"><div><h3>Registro histórico de rutas</h3><p>${SEDES[sede]} · ${P.txt} · desde el envío a bodega hasta el cierre de la entrega.</p></div></div><div class="tabla-caja"><table class="tabla"><thead><tr><th>Ruta</th><th>Fecha</th><th>Camión</th><th>Piloto</th><th>Pedido</th><th class="der">Total (kg)</th><th>Estado</th><th>Recorrido</th></tr></thead><tbody>
        ${rs.map((r) => { const p = pedido(r.pedido); return `<tr><td><b>${r.num}</b></td><td class="mono">${fFecha(r.fecha)}</td><td>${esc((camion(r.camion) || {}).n || '—')}</td><td>${esc(nombreUsuario(r.piloto))}</td><td>${p.corr}</td><td class="der kg">${fmt(totalPedido(p))}</td><td>${chipEstado(p)}</td>
          <td style="font-size:13px">${r.recorrido ? clientesRuta(r).map((c, i) => `${i + 1}. ${esc(c.nombre)}`).join(' → ') : '<span class="muted">Se guarda al entregar</span>'}</td></tr>`; }).join('') || '<tr><td colspan="8"><div class="vacio">Sin rutas en el periodo.</div></td></tr>'}</tbody></table></div></section>`;
    } else {
      const ls = S.bitacora.slice(0, 250);
      cuerpo = `<section class="tarjeta"><div class="bloque-cab"><div><h3>Bitácora de operaciones</h3><p>Acciones de los dos sistemas, incluidos los inicios de sesión. No se registran el marcado ni la prioridad de Bodega, ni el orden de Ruta antes de la entrega.</p></div></div><div class="tabla-caja tabla-alta"><table class="tabla"><thead><tr><th>Fecha</th><th>Usuario</th><th>Operación</th><th>Detalle</th></tr></thead><tbody>
        ${ls.map((b) => `<tr><td class="mono" style="font-size:13px;white-space:nowrap">${fFH(b.fecha)}</td><td>${esc(b.nombre)}</td><td><b>${esc(b.op)}</b></td><td style="font-size:13.5px">${esc(b.detalle)}</td></tr>`).join('')}</tbody></table></div></section>`;
    }
    return vista('reportes', u, cab('Módulo de reportes', 'Reportes y bitácora', 'Despacho y rutas realizadas por periodo, y la bitácora de operaciones de los dos sistemas.') + `
      <div class="pestanas">${[['despacho', P.nombre, 'grafica'], ['rutas', 'Rutas realizadas', 'ruta'], ['bitacora', 'Bitácora', 'lista']].map(([k, n, i]) => `<button data-tab="${k}" class="${repTab === k ? 'on' : ''}">${ico(i, 'ico-s')} ${n}</button>`).join('')}</div>
      ${repTab !== 'bitacora' ? controlPeriodo() : ''}${cuerpo}`, (root) => {
      $$('[data-tab]', root).forEach((b) => b.addEventListener('click', () => { repTab = b.dataset.tab; repintar(); }));
      const per = $('[data-per]', root);
      if (per) per.addEventListener('click', (e) => { const b = e.target.closest('[data-p]'); if (b) { repPer = b.dataset.p; repintar(); } });
      const al = (sel, fn) => { const x = $(sel, root); if (x) x.addEventListener('change', (e) => { if (e.target.value) { fn(e.target.value); repintar(); } }); };
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
     CONFIGURACIÓN (specs/11)
     ====================================================================== */
  let cfgTab = null, cfgTxt = '', cfgLim = 50;
  const selSedes = (nombre, valor) => `<select class="sel" name="${nombre}">${Object.entries(SEDES).map(([k, n]) => `<option value="${k}" ${k === valor ? 'selected' : ''}>${n}</option>`).join('')}</select>`;
  function configuracion(u) {
    const tabs = [['productos', 'Productos', S.productos.length, tiene(u, 'pk.cfg.productos')], ['clientes', 'Clientes', S.clientes.length, tiene(u, 'pk.cfg.clientes')], ['sectores', 'Sectores', S.sectores.length, tiene(u, 'pk.cfg.clientes')],
      ['camiones', 'Camiones', S.camiones.length, tiene(u, 'pk.cfg.camiones')], ['usuarios', 'Usuarios', S.usuarios.filter((x) => enSistema(x, 'picking')).length, esTotal(u)]].filter((t) => t[3]);
    if (!tabs.find((t) => t[0] === cfgTab)) cfgTab = tabs[0][0];
    const acc = { productos: 'Nuevo producto', clientes: 'Nuevo cliente', sectores: 'Nuevo sector', camiones: 'Nuevo camión', usuarios: 'Nuevo usuario' }[cfgTab];
    const usado = {
      prod: (id) => S.pedidos.some((p) => p.lineas.some((l) => l.prod === id)) || S.facturados.some((f) => f.lineas.some((l) => l.prod === id)),
      cli: (id) => S.pedidos.some((p) => p.lineas.some((l) => l.cli === id)) || S.facturados.some((f) => f.cli === id),
    };
    let tabla = () => '', notas = '';
    if (cfgTab === 'productos') {
      tabla = () => { const n = norm(cfgTxt); const l = S.productos.filter((p) => !n || n.split(/\s+/).every((x) => norm(p.n).includes(x)));
        return `<table class="tabla"><thead><tr><th>Nombre</th><th class="der">Peso de Conversión (kg)</th><th></th></tr></thead><tbody>
          ${l.slice(0, cfgLim).map((p) => `<tr><td class="cod">${esc(p.n)}</td><td class="der kg">${fmt(p.p2)}</td>
            <td class="der" style="white-space:nowrap"><button class="btn btn-s btn-sm" data-ed="${p.id}">${ico('editar', 'ico-s')} Editar</button> <button class="btn btn-g btn-sm" data-del="${p.id}" title="Eliminar">${ico('borrar', 'ico-s')}</button></td></tr>`).join('')}</tbody></table>
          <div class="paginador"><span>Mostrando ${Math.min(cfgLim, l.length)} de ${l.length}</span>${l.length > cfgLim ? '<button class="btn btn-s btn-sm" data-mas>Mostrar más</button>' : ''}</div>`; };
      notas = '<p class="muted" style="font-size:13.5px">El nombre tiene el formato del nombre de producto de Odoo, sin el lote: <span class="mono">NOMBRE (ORIGEN-ENVASE/PRESENTACIÓN)</span>. Los productos son comunes a las tres sedes. Si cambia el Peso de Conversión, los pedidos ya enviados conservan el que tenían (RN-33).</p>';
    } else if (cfgTab === 'clientes') {
      tabla = () => { const n = norm(cfgTxt); const l = S.clientes.filter((c) => !n || norm(c.n + ' ' + sector(c.s)).includes(n));
        return `<table class="tabla"><thead><tr><th>Nombre</th><th>Sector</th><th></th></tr></thead><tbody>${l.slice(0, cfgLim).map((c) => `<tr><td><b>${esc(c.n)}</b></td><td class="muted">${esc(sector(c.s))}</td><td class="der" style="white-space:nowrap"><button class="btn btn-s btn-sm" data-ed="${c.id}">${ico('editar', 'ico-s')} Editar</button> <button class="btn btn-g btn-sm" data-del="${c.id}" title="Eliminar">${ico('borrar', 'ico-s')}</button></td></tr>`).join('')}</tbody></table>
          <div class="paginador"><span>Mostrando ${Math.min(cfgLim, l.length)} de ${l.length}</span>${l.length > cfgLim ? '<button class="btn btn-s btn-sm" data-mas>Mostrar más</button>' : ''}</div>`; };
      notas = '<p class="muted" style="font-size:13.5px">Los clientes son comunes a las tres sedes. También se guardan desde Facturación, cuando el archivo de Odoo trae un cliente que no está en la base.</p>';
    } else if (cfgTab === 'sectores') {
      tabla = () => `<table class="tabla"><thead><tr><th>Sector (tal como viene en el archivo)</th><th class="der">Clientes</th><th></th></tr></thead><tbody>${S.sectores.filter((s) => !cfgTxt || norm(s.n).includes(norm(cfgTxt))).map((s) => `<tr><td>${esc(s.n)}</td><td class="der mono">${S.clientes.filter((c) => c.s === s.id).length}</td><td class="der" style="white-space:nowrap"><button class="btn btn-s btn-sm" data-ed="${s.id}">${ico('editar', 'ico-s')} Editar</button> <button class="btn btn-g btn-sm" data-del="${s.id}" title="Eliminar">${ico('borrar', 'ico-s')}</button></td></tr>`).join('')}</tbody></table>`;
      notas = '<p class="muted" style="font-size:13.5px">Los sectores se cargan tal como vienen en el archivo de la empresa, sin normalizar.</p>';
    } else if (cfgTab === 'camiones') {
      tabla = () => `<table class="tabla"><thead><tr><th>Identificación</th><th class="der">Capacidad máxima</th><th>Sede</th><th></th></tr></thead><tbody>${S.camiones.map((c) => `<tr><td><b>${esc(c.n)}</b></td><td class="der kg">${fmt(c.cap)} kg</td><td>${SEDES[c.sede]}</td><td class="der" style="white-space:nowrap"><button class="btn btn-s btn-sm" data-ed="${c.id}">${ico('editar', 'ico-s')} Editar</button> <button class="btn btn-g btn-sm" data-del="${c.id}" title="Eliminar">${ico('borrar', 'ico-s')}</button></td></tr>`).join('')}</tbody></table>`;
      notas = pend('P-01', 'Falta la identificación real de los 3 camiones de Quetzaltenango; aquí aparecen numerados. Cada camión de la sede es una opción de envío en Facturación y su capacidad alimenta la alerta de sobrepeso.');
    } else {
      tabla = () => `<table class="tabla"><thead><tr><th>Nombre</th><th>Usuario</th><th>Rol</th><th>Sedes</th><th>Permisos del picking</th><th>Estado</th><th></th></tr></thead><tbody>${S.usuarios.filter((x) => enSistema(x, 'picking')).map((x) => `<tr><td><div style="display:flex;gap:10px;align-items:center"><span class="avatar" style="width:34px;height:34px;font-size:12.5px">${iniciales(x.nombre)}</span><b>${esc(x.nombre)}</b></div></td><td class="mono">${esc(x.usuario)}</td>
          <td>${esc(x.rol)}${x.sistema === 'ambos' || esTotal(x) ? ' <span class="chip">+ sitio</span>' : ''}</td><td>${esTotal(x) ? 'Todas' : sedesDe(x).map((s) => SEDES[s]).join(', ') || '—'}</td><td>${resumenPermisos(x, 'picking')}</td><td><span class="chip ${x.activo ? 'chip-v' : ''}">${x.activo ? 'Activo' : 'Inactivo'}</span></td>
          <td class="der" style="white-space:nowrap"><button class="btn btn-s btn-sm" data-ed="${x.id}">${ico('editar', 'ico-s')} Editar</button> <button class="btn btn-s btn-sm" data-clave="${x.id}">${ico('llave', 'ico-s')} Contraseña</button> <button class="btn btn-g btn-sm" data-del="${x.id}" title="Eliminar">${ico('borrar', 'ico-s')}</button></td></tr>`).join('')}</tbody></table>`;
      notas = `<div class="aviso aviso-v">${ico('info')}<div>Las cuentas de Gerencia y Soporte sirven en los dos sistemas. Las demás cuentas son de un solo sistema (RN-18).</div></div>${pend('P-02', 'Faltan los nombres y la cantidad de pilotos; aquí hay dos de ejemplo.')}${pend('P-08', 'Falta el usuario administrador inicial con el que se crean los demás.')}`;
    }
    return vista('configuracion', u, cab('Módulo de configuración', 'Catálogos y usuarios', 'Productos (con su Peso de Conversión), clientes, sectores, camiones y usuarios del sistema de picking. Los productos y clientes que faltan también se agregan desde Facturación al cargar el archivo de Odoo.', `<button class="btn btn-p" data-nuevo>${ico('mas')} ${acc}</button>`) + `
      <div class="pestanas">${tabs.map(([k, n, c]) => `<button data-tab="${k}" class="${cfgTab === k ? 'on' : ''}">${n} <span class="cont">${fmt(c)}</span></button>`).join('')}</div>
      <section class="tarjeta">${['productos', 'clientes', 'sectores'].includes(cfgTab) ? `<div class="herr"><label class="buscador">${ico('buscar')}<input class="inp" data-q placeholder="Buscar" value="${esc(cfgTxt)}"></label></div>` : ''}
        <div class="tabla-caja tabla-alta" data-tabla>${tabla()}</div></section>
      <div style="margin-top:16px;display:flex;flex-direction:column;gap:10px">${notas}</div>`, (root) => {
      const upd = () => { $('[data-tabla]', root).innerHTML = tabla(); enlazar(); };
      const enlazar = () => {
        const m = $('[data-mas]', root); if (m) m.addEventListener('click', () => { cfgLim += 100; upd(); });
        $$('[data-ed]', root).forEach((b) => b.addEventListener('click', () => editar(b.dataset.ed)));
        $$('[data-del]', root).forEach((b) => b.addEventListener('click', () => eliminar(b.dataset.del)));
        $$('[data-clave]', root).forEach((b) => b.addEventListener('click', () => restablecerClave(usuario(b.dataset.clave), u, 'picking')));
      };
      $$('[data-tab]', root).forEach((b) => b.addEventListener('click', () => { cfgTab = b.dataset.tab; cfgTxt = ''; cfgLim = 50; repintar(); }));
      const q = $('[data-q]', root); if (q) q.addEventListener('input', (e) => { cfgTxt = e.target.value; cfgLim = 50; upd(); });
      $('[data-nuevo]', root).addEventListener('click', () => editar(null));
      enlazar();

      function eliminar(id) {
        const hecho = (txt, fn) => confirmar('Eliminar', txt, 'Eliminar', () => { fn(); guardar(); toast('Registro eliminado.'); repintar(); }, 'btn-d');
        const bloqueado = (t) => modal({ titulo: 'No se puede eliminar', cuerpo: `<p style="color:var(--g600)">${t}</p>`, acciones: [{ txt: 'Entendido', cls: 'btn-p' }] });
        if (cfgTab === 'productos') { const p = prod(+id); if (usado.prod(p.id)) return bloqueado(`<b class="mono">${esc(p.n)}</b> está en pedidos o en pedidos facturados.`); hecho(`¿Eliminar <b class="mono">${esc(p.n)}</b>?`, () => { S.productos = S.productos.filter((x) => x !== p); bit(u.id, 'Eliminación de producto', p.n); }); }
        else if (cfgTab === 'clientes') { const c = cliente(+id); if (usado.cli(c.id)) return bloqueado(`${esc(c.n)} aparece en pedidos o en pedidos facturados.`); hecho(`¿Eliminar a <b>${esc(c.n)}</b>?`, () => { S.clientes = S.clientes.filter((x) => x !== c); bit(u.id, 'Eliminación de cliente', c.n); }); }
        else if (cfgTab === 'sectores') { const s = S.sectores.find((x) => x.id === +id); const n = S.clientes.filter((c) => c.s === s.id).length; if (n) return bloqueado(`El sector tiene ${n} cliente(s).`); hecho(`¿Eliminar el sector <b>${esc(s.n)}</b>?`, () => { S.sectores = S.sectores.filter((x) => x !== s); bit(u.id, 'Eliminación de sector', s.n); }); }
        else if (cfgTab === 'camiones') { const c = camion(id); if (S.rutas.some((r) => r.camion === c.id)) return bloqueado(`${esc(c.n)} tiene rutas registradas.`); if (S.facturados.some((f) => !f.pedido && f.opcion === c.id)) return bloqueado(`${esc(c.n)} tiene pedidos facturados asignados en Facturación.`); hecho(`¿Eliminar <b>${esc(c.n)}</b>?`, () => { S.camiones = S.camiones.filter((x) => x !== c); bit(u.id, 'Eliminación de camión', c.n); }); }
        else eliminarUsuario(usuario(id), u, 'picking', repintar);
      }
      function editar(id) {
        const guardarCon = (fn, op, det) => (m) => { fn(m); bit(u.id, op, det(m)); guardar(); toast('Cambios guardados.'); repintar(); };
        if (cfgTab === 'productos') {
          const p = id != null ? prod(+id) : null;
          modal({ titulo: p ? 'Editar producto' : 'Nuevo producto', cuerpo: `<div class="rejilla">
              <label class="campo"><span>Nombre (único)</span><input class="inp mono" name="n" value="${esc(p ? p.n : '')}" ${p ? 'readonly' : ''} placeholder="SODA ASH (CHI-SAC/0040KG)"><small>Con el formato del nombre de producto de Odoo, sin el lote.</small></label>
              <label class="campo"><span>Peso de Conversión (kg)</span><input class="inp mono" name="p2" inputmode="decimal" value="${p ? fmt(p.p2) : ''}"></label>
              ${p ? `<div class="aviso aviso-a">${ico('info')}<div>Si cambia el Peso de Conversión, los pedidos ya enviados conservan el que tenían (RN-33).</div></div>` : ''}</div>`,
            acciones: [{ txt: 'Cancelar' }, { txt: 'Guardar', cls: 'btn-p', fn: guardarCon((m) => {
              const n = $('[name=n]', m).value.trim().replace(/\s+/g, ' '), p2 = leerNumero($('[name=p2]', m).value);
              if (!n) throw Err('El nombre es obligatorio.'); if (!(p2 > 0)) throw Err('El Peso de Conversión debe ser un número mayor que cero.');
              if (p) p.p2 = r3(p2);
              else { if (productoPorNombre(n)) throw Err('Ese producto ya existe: el nombre es único.'); S.productos.push({ id: S.productos.reduce((mx, x) => Math.max(mx, x.id), -1) + 1, n, p2: r3(p2) }); }
            }, p ? 'Edición de producto' : 'Creación de producto', (m) => `${$('[name=n]', m).value.trim()} · Peso de Conversión ${$('[name=p2]', m).value}`) }] });
        } else if (cfgTab === 'clientes') {
          const c = id != null ? cliente(+id) : null;
          modal({ titulo: c ? 'Editar cliente' : 'Nuevo cliente', cuerpo: `<div class="rejilla"><label class="campo"><span>Nombre</span><input class="inp" name="n" value="${esc(c ? c.n : '')}"></label><label class="campo"><span>Sector</span><select class="sel" name="s">${S.sectores.map((s) => `<option value="${s.id}" ${c && c.s === s.id ? 'selected' : ''}>${esc(s.n)}</option>`).join('')}</select></label></div>`,
            acciones: [{ txt: 'Cancelar' }, { txt: 'Guardar', cls: 'btn-p', fn: guardarCon((m) => { const n = $('[name=n]', m).value.trim(); if (!n) throw Err('El nombre es obligatorio.'); const s = +$('[name=s]', m).value; if (c) Object.assign(c, { n, s }); else S.clientes.push({ id: S.clientes.reduce((mx, x) => Math.max(mx, x.id), -1) + 1, n, s }); }, c ? 'Edición de cliente' : 'Creación de cliente', (m) => $('[name=n]', m).value.trim()) }] });
        } else if (cfgTab === 'sectores') {
          const s = id != null ? S.sectores.find((x) => x.id === +id) : null;
          modal({ titulo: s ? 'Editar sector' : 'Nuevo sector', cuerpo: `<label class="campo"><span>Nombre</span><input class="inp" name="n" value="${esc(s ? s.n : '')}"></label>`,
            acciones: [{ txt: 'Cancelar' }, { txt: 'Guardar', cls: 'btn-p', fn: guardarCon((m) => { const n = $('[name=n]', m).value.trim(); if (!n) throw Err('El nombre es obligatorio.'); if (s) s.n = n; else S.sectores.push({ id: S.sectores.reduce((mx, x) => Math.max(mx, x.id), -1) + 1, n }); }, s ? 'Edición de sector' : 'Creación de sector', (m) => $('[name=n]', m).value.trim()) }] });
        } else if (cfgTab === 'camiones') {
          const c = id != null ? camion(id) : null;
          modal({ titulo: c ? 'Editar camión' : 'Nuevo camión', cuerpo: `<div class="rejilla"><label class="campo"><span>Identificación ${pendIn('P-01')}</span><input class="inp" name="n" value="${esc(c ? c.n : '')}"></label>
              <div class="rejilla r2"><label class="campo"><span>Capacidad máxima (kg)</span><input class="inp mono" name="cap" value="${c ? fmt(c.cap) : ''}"></label><label class="campo"><span>Sede</span>${selSedes('sede', c ? c.sede : 'XE')}</label></div></div>`,
            acciones: [{ txt: 'Cancelar' }, { txt: 'Guardar', cls: 'btn-p', fn: guardarCon((m) => { const n = $('[name=n]', m).value.trim(), cap = leerNumero($('[name=cap]', m).value), sede = $('[name=sede]', m).value; if (!n) throw Err('La identificación es obligatoria.'); if (!(cap > 0)) throw Err('La capacidad debe ser mayor que cero.'); if (c) Object.assign(c, { n, cap, sede }); else S.camiones.push({ id: 'c' + Date.now().toString(36), n, cap, sede }); }, c ? 'Edición de camión' : 'Creación de camión', (m) => $('[name=n]', m).value.trim()) }] });
        } else {
          formUsuario('picking', id ? usuario(id) : null, u, repintar);
        }
      }
    });
  }

  return { ruta, despachar, pedidosBodega, metaPedido };
})();
