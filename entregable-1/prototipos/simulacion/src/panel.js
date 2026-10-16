/* ==========================================================================
   ARMAZÓN DE LAS APLICACIONES INTERNAS y PANEL DEL SITIO
   (specs/03-roles-y-accesos.md y specs/05-sitio-web.md)
   ========================================================================== */
let menuReducido = false;       // menú lateral reducido a íconos (RF-SL-60, RF-SW-26); no se guarda
function armazon({ sistema, u, nav, miga, cuerpo, derecha = '' }) {
  const sede = sistema === 'picking' ? (esTotal(u) ? 'Todas las sedes' : sedesDe(u).map((s) => SEDES[s]).join(', ') || 'Sin sede') : 'Sitio web';
  return `<div class="app ${menuReducido ? 'reducido' : ''}">
    <aside class="lado">
      <div class="lado-arriba">
        <a class="lado-logo" href="#/" title="Ir al sitio público"><img src="${A.logoBlanco}" alt="INCOVSA Químicos"><span class="logo-mini">${burbujas()}</span></a>
        <button class="lado-reducir" data-reducir title="${menuReducido ? 'Expandir el menú' : 'Reducir el menú a íconos'}" aria-label="${menuReducido ? 'Expandir el menú' : 'Reducir el menú a íconos'}">${ico(menuReducido ? 'expandir' : 'colapsar')}</button>
      </div>
      <p class="lado-sis">${sistema === 'picking' ? 'Control logístico de bodega' : 'Administración del sitio'}</p>
      <nav class="lado-nav">${nav.map((x) => x.grupo ? `<span class="grupo">${x.grupo}</span>` : `<a href="${x.href}" class="${x.on ? 'on' : ''}" title="${esc(x.n)}">${ico(x.i)}<span class="txt">${x.n}</span>${x.cont ? `<span class="cont">${x.cont}</span>` : ''}</a>`).join('')}</nav>
      <div class="lado-usuario"><span class="avatar" title="${esc(u.nombre)}">${iniciales(u.nombre)}</span>
        <div class="quien"><b>${esc(u.nombre)}</b><small>${esc(u.rol || 'Sin rol')} · ${esc(sede)}</small></div>
        <button data-salir title="Cerrar sesión" aria-label="Cerrar sesión">${ico('salir')}</button></div>
    </aside>
    <div class="principal">
      <header class="barra-sup">
        <button class="btn btn-s btn-ico menu-movil" data-menu-app aria-label="Menú">${ico('menu')}</button>
        <div class="ruta-txt">${miga}</div>
        <div class="der">${derecha}</div>
      </header>
      <main class="contenido">${cuerpo}</main>
    </div>
  </div>`;
}
function montarArmazon(root, sistema) {
  const b = $('[data-menu-app]', root);
  if (b) b.addEventListener('click', (e) => { e.stopPropagation(); $('.app', root).classList.toggle('menu-abierto'); });
  $('.principal', root) && $('.principal', root).addEventListener('click', () => $('.app', root).classList.remove('menu-abierto'));
  const r = $('[data-reducir]', root);
  if (r) r.addEventListener('click', () => {
    menuReducido = !menuReducido;
    $('.app', root).classList.toggle('reducido', menuReducido);
    r.innerHTML = ico(menuReducido ? 'expandir' : 'colapsar');
    r.title = r.ariaLabel = menuReducido ? 'Expandir el menú' : 'Reducir el menú a íconos';
    if (typeof pagina !== 'undefined' && pagina && pagina.alRedimensionar) pagina.alRedimensionar();
  });
  const s = $('[data-salir]', root);
  if (s) s.addEventListener('click', () => { cerrarSesion(sistema); toast('Sesión cerrada.'); location.hash = '#/'; });
}
function sinAcceso(sistema, u, texto) {
  const destino = Sitio.destinoInicial(sistema, u);
  return `<div class="tarjeta sin-acceso">${ico('candado', 'ico-l')}<h2 style="font-size:24px;margin-top:14px">Sin acceso a este módulo</h2>
    <p class="muted" style="margin-top:10px">${texto}</p>${destino ? `<a class="btn btn-p" style="margin-top:20px" href="${destino}">Ir a mi módulo</a>` : ''}</div>`;
}
/* Casillas de permisos agrupadas por módulo (specs/03) */
function casillasPermisos(sistema, marcados) {
  const grupos = [];
  PERMISOS.filter((p) => p.s === sistema).forEach((p) => { let g = grupos.find((x) => x.m === p.m); if (!g) grupos.push(g = { m: p.m, ps: [] }); g.ps.push(p); });
  return `<div class="permisos" data-permisos>${grupos.map((g) => `<fieldset><legend>${esc(g.m)}</legend>${g.ps.map((p) => `<label class="chk"><input type="checkbox" value="${p.c}" ${marcados.includes(p.c) ? 'checked' : ''}>${esc(p.n)}</label>`).join('')}</fieldset>`).join('')}</div>`;
}
/* Diferencia de permisos y sedes para la bitácora */
function cambiosAcceso(antes, ahora, etiqueta) {
  const mas = ahora.filter((x) => !antes.includes(x)), menos = antes.filter((x) => !ahora.includes(x));
  return [mas.length ? `${etiqueta} asignados: ${mas.join(', ')}` : '', menos.length ? `${etiqueta} revocados: ${menos.join(', ')}` : ''].filter(Boolean).join(' · ');
}
/* Formulario de usuario, igual en los dos sistemas: contraseña al crear (13/10), rol de texto libre,
   permisos con casillas y, en el picking, sedes con casillas (specs/03, specs/11) */
const MIN_CLAVE = 8;   // valor por omisión de Better Auth (specs/16, decisión 24)
const errClave = (a, b) => (a.length < MIN_CLAVE ? `La contraseña debe tener al menos ${MIN_CLAVE} caracteres.` : a !== b ? 'Las dos contraseñas no coinciden.' : '');
const camposClave = (etq = 'Contraseña') => `<div class="rejilla r2"><label class="campo"><span>${etq}</span><input class="inp" type="password" name="k1" autocomplete="new-password" placeholder="Al menos ${MIN_CLAVE} caracteres"></label>
    <label class="campo"><span>Repita la contraseña</span><input class="inp" type="password" name="k2" autocomplete="new-password"></label></div>`;
function formUsuario(sistema, x, admin, alGuardar) {
  const sedes = x ? (x.sedes || []) : [];
  const permisos = x ? (x.permisos || []) : [];
  const otro = sistema === 'picking' ? 'sitio' : 'picking';
  modal({ titulo: (x ? 'Editar usuario' : 'Nuevo usuario') + (sistema === 'picking' ? ' del picking' : ' del sitio'), grande: true, cuerpo: `<div class="rejilla">
      <div class="rejilla r2"><label class="campo"><span>Nombre completo</span><input class="inp" name="n" value="${esc(x ? x.nombre : '')}"></label>
        <label class="campo"><span>Usuario</span><input class="inp mono" name="us" value="${esc(x ? x.usuario : '')}" ${x ? 'readonly' : ''} placeholder="nombre.apellido" autocapitalize="off"></label></div>
      ${x ? '' : camposClave()}
      <div class="rejilla r2"><label class="campo"><span>Rol</span><input class="inp" name="rol" value="${esc(x ? x.rol : '')}" placeholder="Por ejemplo: Facturador"><small>Texto libre. Gerencia y Soporte tienen acceso total a los dos sistemas y a todas las sedes.</small></label>
        <label class="campo"><span>Correo (opcional)</span><input class="inp" name="c" value="${esc(x ? x.correo : '')}"></label></div>
      <div class="aviso aviso-v" data-total-aviso hidden>${ico('info')}<div>Con el rol <b>Gerencia</b> o <b>Soporte</b> la cuenta tiene todos los permisos de los dos sistemas y todas las sedes, y sirve en los dos inicios de sesión.</div></div>
      ${sistema === 'picking' ? `<div class="campo" data-bloque><span>Sedes a las que tiene acceso</span><div class="sedes-chk" data-sedes>${Object.entries(SEDES).map(([k, n]) => `<label class="chk"><input type="checkbox" value="${k}" ${sedes.includes(k) ? 'checked' : ''}>${n}</label>`).join('')}</div></div>` : ''}
      <div class="campo" data-bloque><span>Permisos ${sistema === 'picking' ? 'del sistema de picking' : 'del sitio web'}</span>${casillasPermisos(sistema, permisos)}</div>
      ${sistema === 'picking' ? '<p class="muted" style="font-size:13.5px">Los usuarios con rol <b>Piloto</b> se eligen en «Envío por camión» de Facturación y ven solo sus rutas.</p>' : ''}
      ${x ? `<label class="chk"><input type="checkbox" name="a" ${x.activo ? 'checked' : ''}> Cuenta activa</label><p class="muted" style="font-size:13.5px">La contraseña se cambia con el botón «Contraseña» de la lista.</p>` : ''}</div>`,
    acciones: [{ txt: 'Cancelar' }, { txt: 'Guardar', cls: 'btn-p', fn: (m) => {
      const n = $('[name=n]', m).value.trim(), us = $('[name=us]', m).value.trim().toLowerCase(), rol = $('[name=rol]', m).value.trim();
      if (!n || !us) throw Err('Nombre y usuario son obligatorios.');
      if (!rol) throw Err('Escriba el rol del usuario.');
      const total = esTotal({ rol });
      if (!x) {
        // El nombre de usuario es único dentro de cada sistema (RN-54)
        if (S.usuarios.some((y) => y.usuario === us && enSistema(y, sistema))) throw Err(`Ese nombre de usuario ya existe en ${sistema === 'picking' ? 'el picking' : 'el sitio'}.`);
        const delOtro = S.usuarios.find((y) => y.usuario === us && enSistema(y, otro));
        if (delOtro && (esTotal(delOtro) || total)) throw Err('Ese nombre de usuario es de una cuenta de Gerencia o Soporte, que ya sirve en los dos sistemas.');
        const e = errClave($('[name=k1]', m).value, $('[name=k2]', m).value); if (e) throw Err(e);
      } else if (total && S.usuarios.some((y) => y !== x && y.usuario === x.usuario)) throw Err('Ese nombre de usuario también tiene una cuenta en el otro sistema. Una cuenta de Gerencia o Soporte sirve en los dos, así que no puede compartir el nombre.');
      const pSis = $$('[data-permisos] input:checked', m).map((i) => i.value);
      const sds = sistema === 'picking' ? $$('[data-sedes] input:checked', m).map((i) => i.value) : (x ? x.sedes || [] : []);
      if (sistema === 'picking' && !total && !sds.length) throw Err('Marque al menos una sede.');
      const otros = (x ? x.permisos || [] : []).filter((c) => PERMISO[c] && PERMISO[c].s !== sistema);
      const d = { nombre: n, rol, correo: $('[name=c]', m).value.trim(), permisos: total ? [] : otros.concat(pSis), sedes: total ? [] : sds,
        sistema: total ? 'ambos' : (x && x.sistema === 'ambos' && !esTotal(x) ? 'ambos' : sistema) };
      let det;
      if (x) {
        const cambios = [cambiosAcceso(x.permisos || [], d.permisos, 'Permisos'), sistema === 'picking' ? cambiosAcceso(x.sedes || [], d.sedes, 'Sedes') : ''].filter(Boolean).join(' · ');
        det = `${x.usuario} · rol ${rol}${cambios ? ' · ' + cambios : ''}`;
        Object.assign(x, d, { activo: $('[name=a]', m).checked });
      } else {
        S.usuarios.push(Object.assign({ id: 'u' + Date.now().toString(36), usuario: us, activo: true, clave: $('[name=k1]', m).value, creado: hoyISO() }, d));
        det = `${us} · rol ${rol} · con contraseña${total ? ' · acceso total' : ` · permisos: ${d.permisos.join(', ') || 'ninguno'}${sistema === 'picking' ? ' · sedes: ' + d.sedes.join(', ') : ''}`}`;
      }
      bit(admin.id, x ? 'Edición de usuario' : 'Creación de usuario', `${sistema === 'picking' ? 'Picking' : 'Sitio web'} · ${det}`);
      guardar(); toast('Usuario guardado.'); alGuardar();
    } }],
    alAbrir: (m) => {
      const rol = $('[name=rol]', m);
      const ver = () => { const t = esTotal({ rol: rol.value }); $('[data-total-aviso]', m).hidden = !t; $$('[data-bloque] input', m).forEach((i) => { i.disabled = t; }); $$('[data-bloque]', m).forEach((b) => b.classList.toggle('apagado', t)); };
      rol.addEventListener('input', ver); ver();
    } });
}
/* Eliminar y restablecer contraseña: solo Gerencia y Soporte (specs/03) */
function eliminarUsuario(x, admin, sistema, alTerminar) {
  if (x.id === admin.id) return toast('No puede eliminar su propia cuenta.', 'error');
  confirmar('Eliminar usuario', `¿Eliminar a <b>${esc(x.nombre)}</b> (<span class="mono">${esc(x.usuario)}</span>)? ${x.sistema === 'ambos' || esTotal(x) ? 'La cuenta se elimina de los dos sistemas. ' : ''}Su nombre se conserva en la bitácora y en los registros donde aparece.`, 'Eliminar', () => {
    S.nombresEliminados = S.nombresEliminados || {};
    S.nombresEliminados[x.id] = x.nombre;
    S.usuarios = S.usuarios.filter((y) => y !== x);
    Object.values(S.opciones).forEach((o) => { if (o.camion && o.camion.piloto === x.id) o.camion.piloto = null; });
    bit(admin.id, 'Eliminación de usuario', `${sistema === 'picking' ? 'Picking' : 'Sitio web'} · ${x.usuario} · ${x.nombre}`);
    guardar(); toast('Usuario eliminado.'); alTerminar();
  }, 'btn-d');
}
/* Restablecer contraseña: Gerencia o Soporte escriben la nueva; no se envía nada por correo (RN-47, 13/10) */
function restablecerClave(x, admin, sistema) {
  modal({ titulo: 'Restablecer contraseña', cuerpo: `<p style="color:var(--g600);font-size:15.5px;margin-bottom:14px">Escriba la nueva contraseña de <b>${esc(x.nombre)}</b> (<span class="mono">${esc(x.usuario)}</span>) y entréguesela a la persona. No se envía nada por correo.</p>${camposClave('Nueva contraseña')}`,
    acciones: [{ txt: 'Cancelar' }, { txt: 'Restablecer', cls: 'btn-p', fn: (m) => {
      const k = $('[name=k1]', m).value, e = errClave(k, $('[name=k2]', m).value); if (e) throw Err(e);
      x.clave = k; bit(admin.id, 'Restablecimiento de contraseña', `${sistema === 'picking' ? 'Picking' : 'Sitio web'} · ${x.usuario}`); guardar();
      toast('Contraseña restablecida.');
    } }] });
}
const resumenPermisos = (x, sistema) => (esTotal(x) ? '<span class="chip chip-o">Acceso total</span>'
  : `<span class="chip ${(x.permisos || []).some((c) => PERMISO[c] && PERMISO[c].s === sistema) ? 'chip-v' : ''}">${(x.permisos || []).filter((c) => PERMISO[c] && PERMISO[c].s === sistema).length} permiso(s)</span>`);

const Panel = (() => {
  const CONTENIDO = ['sit.contenido', 'sit.industrias', 'sit.catalogo', 'sit.noticias', 'sit.contacto', 'sit.sol.ver'];
  const SECCIONES = [
    { id: '', n: 'Resumen', i: 'inicio', ok: (u) => CONTENIDO.some((c) => tiene(u, c)) },
    { id: 'contenido', n: 'Contenido institucional', i: 'noticia', ok: (u) => tiene(u, 'sit.contenido') },
    { id: 'industrias', n: 'Industrias', i: 'fabrica', ok: (u) => tiene(u, 'sit.industrias') },
    { id: 'catalogo', n: 'Catálogo', i: 'caja', ok: (u) => tiene(u, 'sit.catalogo') },
    { id: 'noticias', n: 'Noticias', i: 'imagen', ok: (u) => tiene(u, 'sit.noticias') },
    { id: 'contacto', n: 'Información de contacto', i: 'pin', ok: (u) => tiene(u, 'sit.contacto') },
    { id: 'solicitudes', n: 'Solicitudes', i: 'bandeja', ok: (u) => tiene(u, 'sit.sol.ver') },
    { id: 'documentos', n: 'Documentación interna', i: 'archivo', ok: (u) => ['sit.doc.ver', 'sit.doc.descargar', 'sit.doc.gestionar'].some((c) => tiene(u, c)) },
    { id: 'usuarios', n: 'Usuarios del sitio', i: 'usuarios', ok: (u) => esTotal(u) },
  ];
  const TIPO_DOC = { FT: 'Ficha técnica', HS: 'Hoja de seguridad', COA: 'Certificado de análisis' };
  const ESTADOS_SOL = [['asignado', 'Asignado'], ['proceso', 'En proceso'], ['solucionado', 'Solucionado']];
  const TIPO_SOL = { solicitud: 'Solicitud', queja: 'Queja', reclamo: 'Reclamo' };
  const primera = (u) => SECCIONES.find((s) => s.ok(u));

  function vista(sec, u, cab, cuerpo, mount) {
    const nuevas = S.sitio.solicitudes.filter((s) => !s.leida).length;
    const nav = SECCIONES.filter((s) => s.ok(u)).map((s) => ({ href: '#/panel' + (s.id ? '/' + s.id : ''), n: s.n, i: s.i, on: s.id === sec, cont: s.id === 'solicitudes' && nuevas ? nuevas : '' }));
    const nombre = (SECCIONES.find((s) => s.id === sec) || {}).n || '';
    return {
      titulo: nombre, vivo: false,
      html: armazon({ sistema: 'sitio', u, nav, miga: `Administración del sitio ${ico('flecha', 'ico-s')} <b>${nombre}</b>`, derecha: `<a class="btn btn-s btn-sm" href="#/">${ico('globo', 'ico-s')} Ver el sitio</a>`, cuerpo: cab + cuerpo }),
      mount(root) { montarArmazon(root, 'sitio'); mount && mount(root); },
    };
  }
  /* Encabezado de cada módulo: la instrucción, breve, a la par del título (como en Facturación) */
  const cab = (eyebrow, titulo, texto, acc = '') => `<div class="cab-pag cab-fx"><div class="cab-fx-t"><div><p class="eyebrow">${eyebrow}</p><h1>${titulo}</h1></div>${texto ? `<p class="cab-fx-txt">${texto}</p>` : ''}</div>${acc ? `<div class="acc">${acc}</div>` : ''}</div>`;

  function ruta(sec) {
    const u = sesion('sitio');
    if (!u) { location.hash = '#/acceso'; return null; }
    const def = SECCIONES.find((s) => s.id === sec);
    if (!def) return vista('', u, '', `<div class="tarjeta vacio">${ico('buscar')}<h4>Sección no encontrada</h4></div>`);
    if (!def.ok(u)) {
      if (sec === '' && primera(u)) { location.hash = '#/panel/' + primera(u).id; return null; }
      return vista(sec, u, '', sinAcceso('sitio', u, def.id === 'usuarios' ? 'Solo Gerencia y Soporte administran los usuarios del sitio.' : 'Sus permisos no incluyen esta sección. Los asignan Gerencia o Soporte.'));
    }
    return ({ '': resumen, contenido, industrias, catalogo, noticias, contacto, solicitudes, documentos, usuarios })[sec](u);
  }

  /* ------------------------------------------------------------ resumen */
  function resumen(u) {
    const st = S.sitio;
    const t = (id, n, i, estado, cls, det) => SECCIONES.find((s) => s.id === id).ok(u) ? `<a class="tarjeta mod-t" href="#/panel/${id}"><span class="ic">${ico(i)}</span><h3 style="font-size:17px">${n}</h3><p class="muted" style="font-size:14px">${det}</p><span class="chip ${cls}" style="align-self:flex-start">${estado}</span></a>` : '';
    return vista('', u, cab('Panel del sitio', `Hola, ${esc(u.nombre)}`, 'Edite lo que se publica en el sitio; los cambios se ven de inmediato.'),
      `<div class="resumen-mods">
        ${t('contenido', 'Contenido institucional', 'noticia', st.historia && st.valores.every(Boolean) ? 'Completo' : 'Faltan historia y valores', st.historia && st.valores.every(Boolean) ? 'chip-v' : 'chip-a', 'Portada, logotipos, historia, misión, visión y valores')}
        ${t('industrias', 'Industrias', 'fabrica', 'Textos por revisar', 'chip-a', '9 industrias con descripción e imágenes')}
        ${t('catalogo', 'Catálogo', 'caja', st.productos.length + ' productos', 'chip-v', 'Productos públicos y sus industrias')}
        ${t('noticias', 'Noticias', 'imagen', st.noticias.length ? st.noticias.length + ' publicadas' : 'Sin publicar', st.noticias.length ? 'chip-v' : 'chip-a', 'Publicación y edición de noticias')}
        ${t('solicitudes', 'Solicitudes', 'bandeja', st.solicitudes.filter((s) => !s.leida).length + ' sin leer', 'chip-z', 'Mensajes del formulario de contacto')}
        ${t('documentos', 'Documentación interna', 'archivo', st.docs.length + ' producto(s) documentado(s)', 'chip-v', 'Enlaces de fichas técnicas, hojas de seguridad y certificados')}
      </div>
      <div style="margin-top:22px">${pend('P-18', 'Para completar el sitio faltan el logotipo en vectorial con los colores exactos y la tipografía, la historia y las imágenes de los valores (P-19), las imágenes de las industrias (P-21), los horarios de las sedes (P-22) y los datos de los productos públicos (P-17). Los colores de esta propuesta se tomaron de los logotipos recibidos.')}</div>`);
  }

  /* ------------------------------------------------------------ contenido */
  /* specs/05 (13/10): portada y logotipo de INCOVSA, misión, visión e historia con galerías de hasta 5,
     5 imágenes de valores sin texto y logotipo de Inquiserca. Sin la sección "Imágenes del sitio" */
  function contenido(u) {
    const st = S.sitio;
    const bloques = [
      ['mision', 'Misión', 'Texto e imágenes (hasta 5, rotan cada 5 s)', true],
      ['vision', 'Visión', 'Texto e imágenes (hasta 5, rotan cada 5 s)', true],
      ['historia', 'Historia', 'Pendiente P-19 · imágenes opcionales (hasta 5)', true],
    ];
    const chip = (ok, si = 'Publicado', no = 'Sin contenido') => `<span class="chip ${ok ? 'chip-v' : 'chip-a'}">${ok ? si : no}</span>`;
    const pendientes = {};       // galerías cambiadas que esperan «Guardar y publicar»
    return vista('contenido', u, cab('Contenido institucional', 'Inicio y Quiénes somos', 'Se publica en Inicio, en los encabezados de las páginas y en «Quiénes somos».'),
      `<div class="rejilla r2">
        <div class="tarjeta"><div class="bloque-cab"><div><h3>Portada</h3><p>Imágenes de la portada de Inicio y del fondo de los encabezados de las páginas. Hasta 5; rotan cada 5 s.</p></div>${chip(st.gal.portada.length, 'Publicada', 'Fotografía de la empresa')}</div>
          <div class="bloque-cuerpo rejilla">${campoGaleria('portada', st.gal.portada)}<div><button class="btn btn-p btn-sm" data-guardar-gal="portada">Guardar y publicar</button></div></div></div>
        <div class="tarjeta"><div class="bloque-cab"><div><h3>Logotipo de INCOVSA</h3><p>El de la cabecera y el pie del sitio. Mientras no se suba otro, se usa el logotipo recibido.</p></div>${chip(st.logo, 'Cambiado', 'El recibido')}</div>
          <div class="bloque-cuerpo rejilla">${campoImagen('logo', st.logo || A.logo, 'Arrastre el logotipo aquí o haga clic para elegirlo')}
            ${st.logo ? `<button class="btn btn-g btn-sm" data-quitar="logo" style="justify-self:start">Volver al logotipo recibido</button>` : ''}</div></div>
      </div>
      <div class="rejilla r3" style="margin-top:22px">${bloques.map(([k, n, e]) => `<div class="tarjeta">
        <div class="bloque-cab"><div><h3>${n}</h3><p>${e}</p></div>${chip(st[k] || (st.gal[k] || []).length)}</div>
        <div class="bloque-cuerpo rejilla">
          <label class="campo"><span>Texto</span><textarea class="txa" data-k="${k}" rows="${k === 'historia' ? 6 : 5}" placeholder="Texto pendiente de INCOVSA">${esc(st[k])}</textarea></label>
          <div class="campo"><span>Imágenes${k === 'historia' ? ' (opcionales)' : ''}</span>${campoGaleria(k, st.gal[k])}</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-p btn-sm" data-guardar="${k}">Guardar y publicar</button><a class="btn btn-s btn-sm" href="#/nosotros">Ver en el sitio</a></div></div></div>`).join('')}</div>
      <div class="tarjeta bloque" style="margin-top:22px"><div class="bloque-cab"><div><h3>Valores</h3><p>Cinco imágenes, una por cada valor, que se muestran en una fila y sin texto en «Quiénes somos».</p></div>${chip(st.valores.every(Boolean), 'Completos', `${st.valores.filter(Boolean).length} de 5`)}</div>
        <div class="bloque-cuerpo"><div class="valores-panel">${st.valores.map((src, i) => `<div class="campo"><span>Valor ${i + 1}</span>${campoImagen('valor' + i, src, 'Imagen del valor')}${src ? `<button class="btn btn-g btn-sm" data-quitar="valor${i}" style="justify-self:start">Quitar</button>` : ''}</div>`).join('')}</div>
          <div style="margin-top:14px">${pend('P-19', 'Faltan las imágenes de los valores.')}</div></div></div>
      <div class="tarjeta bloque" style="margin-top:22px"><div class="bloque-cab"><div><h3>Logotipo de Inquiserca</h3><p>Se alterna con el de INCOVSA en el banner de «Quiénes somos». Viene cargado el que entregó la empresa el 13/10.</p></div>${chip(logoInquiserca(), st.inquiserca === 'empresa' ? 'El recibido' : 'Cambiado', 'Sin logotipo')}</div>
        <div class="bloque-cuerpo rejilla" style="max-width:520px">${campoImagen('inquiserca', logoInquiserca(), 'Arrastre el logotipo aquí o haga clic para elegirlo')}
          <div style="display:flex;gap:8px;flex-wrap:wrap">${st.inquiserca !== 'empresa' && A.inquiserca ? '<button class="btn btn-g btn-sm" data-quitar="inquiserca-empresa">Volver al logotipo recibido</button>' : ''}${logoInquiserca() ? '<button class="btn btn-g btn-sm" data-quitar="inquiserca">Quitar logotipo</button>' : ''}</div></div></div>`,
      (root) => {
        const publicar = (fn, det) => { const antes = JSON.stringify(st); fn(); if (!guardar()) { Object.assign(st, JSON.parse(antes)); return; } bit(u.id, 'Cambio de contenido del sitio', det); guardar(); toast(det + ' publicado en el sitio.'); repintar(); };
        // Imágenes sueltas: logotipos y valores se publican al elegirlas
        montarImagenes(root, (k, url) => {
          if (k === 'logo') publicar(() => { st.logo = url; }, 'Logotipo de INCOVSA');
          else if (k === 'inquiserca') publicar(() => { st.inquiserca = url; }, 'Logotipo de Inquiserca');
          else if (k.startsWith('valor')) publicar(() => { st.valores[Number(k.slice(5))] = url; }, `Imagen del valor ${Number(k.slice(5)) + 1}`);
        });
        montarGalerias(root, st.gal, (k, imgs) => { pendientes[k] = imgs; });
        $$('[data-guardar-gal]', root).forEach((b) => b.addEventListener('click', () => { const k = b.dataset.guardarGal; publicar(() => { if (pendientes[k]) st.gal[k] = pendientes[k]; }, 'Portada'); }));
        $$('[data-guardar]', root).forEach((b) => b.addEventListener('click', () => {
          const k = b.dataset.guardar, n = bloques.find((x) => x[0] === k)[1];
          publicar(() => { st[k] = $(`[data-k=${k}]`, root).value.trim(); if (pendientes[k]) st.gal[k] = pendientes[k]; }, n);
        }));
        $$('[data-quitar]', root).forEach((b) => b.addEventListener('click', () => {
          const k = b.dataset.quitar;
          if (k === 'logo') publicar(() => { st.logo = ''; }, 'Logotipo de INCOVSA');
          else if (k === 'inquiserca') publicar(() => { st.inquiserca = ''; }, 'Logotipo de Inquiserca');
          else if (k === 'inquiserca-empresa') publicar(() => { st.inquiserca = 'empresa'; }, 'Logotipo de Inquiserca');
          else publicar(() => { st.valores[Number(k.slice(5))] = ''; }, `Imagen del valor ${Number(k.slice(5)) + 1}`);
        }));
      });
  }

  /* ------------------------------------------------------------ industrias */
  function industrias(u) {
    const pendientes = {};
    return vista('industrias', u, cab('Contenido', 'Industrias atendidas', 'Descripción e imágenes (hasta 5) de cada una de las 9 industrias.'),
      `<div class="rejilla r3">${INDUSTRIAS.map((x, i) => `<div class="tarjeta tarjeta-p" style="display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;gap:12px;align-items:center"><span class="ind-ic" style="width:44px;height:44px;border-radius:12px;background:var(--v50);color:var(--v600);display:grid;place-items:center">${ico(x.id)}</span><div><span class="mono muted" style="font-size:12px">${pad(i + 1)}</span><h3 style="font-size:18px">${x.n}</h3></div></div>
        ${campoGaleria(x.id, S.sitio.indImg[x.id] || [])}
        <textarea class="txa" rows="6" data-ind="${x.id}">${esc(S.sitio.industrias[x.id])}</textarea>
        <div><button class="btn btn-s btn-sm" data-g="${x.id}">Guardar</button></div></div>`).join('')}</div>
      <div style="margin-top:20px">${pend('P-21', 'Las descripciones vienen de Google Sites y necesitan revisión. Faltan las imágenes propias de cada industria.')}</div>`,
      (root) => {
        montarGalerias(root, S.sitio.indImg, (id, imgs) => { pendientes[id] = imgs; });
        $$('[data-g]', root).forEach((b) => b.addEventListener('click', () => {
          const id = b.dataset.g, antes = { t: S.sitio.industrias[id], i: S.sitio.indImg[id] };
          S.sitio.industrias[id] = $(`[data-ind=${id}]`, root).value.trim();
          if (pendientes[id]) S.sitio.indImg[id] = pendientes[id];
          if (!guardar()) { S.sitio.industrias[id] = antes.t; S.sitio.indImg[id] = antes.i; return; }
          bit(u.id, 'Cambio de contenido del sitio', 'Industria ' + INDN[id]); guardar(); toast(INDN[id] + ' publicada.'); repintar();
        }));
      });
  }

  /* ------------------------------------------------------------ catálogo */
  function catalogo(u) {
    return vista('catalogo', u, cab('Contenido', 'Catálogo de productos públicos', 'Productos del sitio, sin lote ni Peso de Conversión. Cada uno puede tener varias industrias.', `<button class="btn btn-p" data-nuevo>${ico('mas')} Nuevo producto</button>`),
      `<div class="tarjeta"><div class="tabla-caja"><table class="tabla"><thead><tr><th style="width:72px"></th><th>Producto</th><th>Presentación</th><th>Países de origen</th><th>Industrias</th><th></th></tr></thead><tbody>
        ${S.sitio.productos.map((p) => `<tr><td>${imgProd(p) ? `<span class="mini-img"><img src="${imgProd(p)}" alt="">${imgsProd(p).length > 1 ? `<i>${imgsProd(p).length}</i>` : ''}</span>` : `<span class="sin-img">${ico('imagen', 'ico-s')}</span>`}</td>
          <td><b>${esc(p.n)}</b>${p.desc ? `<div class="muted" style="font-size:13px;max-width:320px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(p.desc)}</div>` : ''}</td>
          <td>${p.pres ? esc(p.pres) : pendIn('P-17')}</td><td>${p.origen ? esc(p.origen) : pendIn('P-17')}</td>
          <td><div class="etiquetas">${p.ind.length ? p.ind.map((i) => `<span class="chip chip-v">${INDN[i]}</span>`).join('') : '<span class="chip chip-a">Por confirmar</span>'}</div></td>
          <td class="der" style="white-space:nowrap"><button class="btn btn-s btn-sm" data-ed="${p.id}" title="Editar" aria-label="Editar">${ico('editar', 'ico-s')}</button> <button class="btn btn-g btn-sm" data-del="${p.id}" title="Eliminar">${ico('borrar', 'ico-s')}</button></td></tr>`).join('')}
      </tbody></table></div></div>
      <div style="margin-top:18px">${pend('P-17', 'Faltan los datos de los productos públicos: descripción, presentación, países de origen e industrias de cada uno.')}</div>`,
      (root) => {
        const editar = (p) => {
          let fotos = null;
          modal({ titulo: p ? 'Editar producto público' : 'Nuevo producto público', grande: true, cuerpo: `<div class="rejilla">
            <div class="rejilla r2" style="align-items:start"><div class="rejilla">
              <label class="campo"><span>Nombre</span><input class="inp" name="n" value="${esc(p ? p.n : '')}"></label>
              <label class="campo"><span>Presentación</span><input class="inp" name="pres" value="${esc(p ? p.pres : '')}" placeholder="Por ejemplo: saco de 25 kg"></label>
              <label class="campo"><span>Países de origen</span><input class="inp" name="origen" value="${esc(p ? p.origen : '')}" placeholder="Por ejemplo: México, China"></label></div>
              <div class="campo"><span>Imágenes (hasta 5; rotan cada 5 s)</span>${campoGaleria('fotos', p ? imgsProd(p) : [])}</div></div>
            <label class="campo"><span>Descripción</span><textarea class="txa" name="desc" rows="4">${esc(p ? p.desc : '')}</textarea></label>
            <div class="campo"><span>Industrias (una o varias)</span><div class="rejilla r3" style="gap:8px">${INDUSTRIAS.map((x) => `<label class="chk"><input type="checkbox" value="${x.id}" ${p && p.ind.includes(x.id) ? 'checked' : ''}>${x.n}</label>`).join('')}</div></div></div>`,
            acciones: [{ txt: 'Cancelar' }, { txt: 'Guardar', cls: 'btn-p', fn: (m) => {
              const n = $('[name=n]', m).value.trim(); if (!n) throw Err('Escriba el nombre.');
              const d = { n, pres: $('[name=pres]', m).value.trim(), origen: $('[name=origen]', m).value.trim(), desc: $('[name=desc]', m).value.trim(), ind: $$('input[type=checkbox]:checked', m).map((x) => x.value) };
              if (fotos) d.fotos = fotos;
              const antes = p ? Object.assign({}, p) : null;
              let nuevo = null;
              if (p) Object.assign(p, d);
              else { nuevo = Object.assign({ id: 'pp' + Date.now().toString(36), img: -1, fotos: [], creado: hoyISO() }, d); S.sitio.productos.push(nuevo); }
              if (!guardar()) { if (p) Object.assign(p, antes); else S.sitio.productos = S.sitio.productos.filter((x) => x !== nuevo); return false; }
              bit(u.id, p ? 'Edición de producto público' : 'Creación de producto público', n); guardar();
              toast('Catálogo actualizado.'); repintar();
            } }],
            alAbrir: (m) => montarGalerias(m, { fotos: p ? imgsProd(p) : [] }, (k, imgs) => { fotos = imgs; }) });
        };
        $$('[data-ed]', root).forEach((b) => b.addEventListener('click', () => editar(S.sitio.productos.find((x) => x.id === b.dataset.ed))));
        $$('[data-del]', root).forEach((b) => b.addEventListener('click', () => {
          const p = S.sitio.productos.find((x) => x.id === b.dataset.del);
          confirmar('Eliminar producto', `¿Eliminar <b>${esc(p.n)}</b> del catálogo público? Deja de mostrarse en el sitio.`, 'Eliminar', () => {
            S.sitio.productos = S.sitio.productos.filter((x) => x !== p); bit(u.id, 'Eliminación de producto público', p.n); guardar(); toast('Producto eliminado.'); repintar();
          }, 'btn-d');
        }));
        $('[data-nuevo]', root).addEventListener('click', () => editar(null));
      });
  }

  /* ------------------------------------------------------------ noticias */
  function noticias(u) {
    const ns = S.sitio.noticias;
    return vista('noticias', u, cab('Contenido', 'Noticias', 'Imágenes (de 1 a 5), título y texto. Al guardar se publica en la página de Noticias.', `<button class="btn btn-p" data-nueva>${ico('mas')} Nueva noticia</button>`),
      `${pend('P-23', 'Falta el contenido inicial de las noticias.')}
      <div class="tarjeta" style="margin-top:18px">${ns.length ? `<div class="tabla-caja"><table class="tabla"><thead><tr><th style="width:84px"></th><th>Título</th><th>Fecha</th><th></th></tr></thead><tbody>${ns.map((n) => `<tr>
          <td>${(n.fotos || []).length ? `<span class="mini-img ancha"><img src="${n.fotos[0]}" alt="">${n.fotos.length > 1 ? `<i>${n.fotos.length}</i>` : ''}</span>` : `<span class="sin-img">${ico('imagen', 'ico-s')}</span>`}</td>
          <td><b>${esc(n.titulo)}</b><div class="muted" style="font-size:13.5px;max-width:420px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(n.texto)}</div></td><td class="mono">${fFecha(n.fecha)}</td>
          <td class="der" style="white-space:nowrap"><button class="btn btn-s btn-sm" data-ed="${n.id}" title="Editar" aria-label="Editar">${ico('editar', 'ico-s')}</button> <button class="btn btn-g btn-sm" data-del="${n.id}" title="Eliminar" aria-label="Eliminar">${ico('borrar', 'ico-s')}</button></td></tr>`).join('')}</tbody></table></div>`
        : `<div class="vacio">${ico('imagen')}<h4>No hay noticias</h4><p>Cree la primera y véala publicada en el sitio.</p></div>`}</div>`,
      (root) => {
        const editar = (n) => {
          let fotos = n ? (n.fotos || []).slice() : [];
          modal({ titulo: n ? 'Editar noticia' : 'Nueva noticia', grande: true, cuerpo: `<div class="rejilla">
            <div class="campo"><span>Imágenes (al menos una, hasta 5)</span>${campoGaleria('fotos', fotos)}</div>
            <label class="campo"><span>Título</span><input class="inp" name="t" value="${esc(n ? n.titulo : '')}"></label>
            <label class="campo"><span>Texto</span><textarea class="txa" name="x" rows="7">${esc(n ? n.texto : '')}</textarea></label></div>`,
            acciones: [{ txt: 'Cancelar' }, { txt: 'Guardar', cls: 'btn-p', fn: (m) => {
              const t = $('[name=t]', m).value.trim(), x = $('[name=x]', m).value.trim();
              if (!t) throw Err('Escriba el título.'); if (!x) throw Err('Escriba el texto.');
              if (!fotos.length) throw Err('Agregue al menos una imagen.');
              let nueva = null; const antes = n ? Object.assign({}, n) : null;
              if (n) Object.assign(n, { titulo: t, texto: x, fotos });
              else { nueva = { id: 'n' + (++S.corr.not), titulo: t, texto: x, fotos, fecha: hoyISO(), creado: hoyISO(), autor: u.id }; S.sitio.noticias.unshift(nueva); }
              if (!guardar()) { if (n) Object.assign(n, antes); else S.sitio.noticias = S.sitio.noticias.filter((y) => y !== nueva); return false; }
              bit(u.id, n ? 'Edición de noticia' : 'Creación de noticia', t); guardar();
              toast('Noticia guardada. <a href="#/noticias" style="color:var(--lima-b)">Verla en el sitio</a>'); repintar();
            } }],
            alAbrir: (m) => montarGalerias(m, { fotos }, (k, imgs) => { fotos = imgs; }) });
        };
        $('[data-nueva]', root).addEventListener('click', () => editar(null));
        $$('[data-ed]', root).forEach((b) => b.addEventListener('click', () => editar(ns.find((x) => x.id === b.dataset.ed))));
        $$('[data-del]', root).forEach((b) => b.addEventListener('click', () => {
          const n = ns.find((x) => x.id === b.dataset.del);
          confirmar('Eliminar noticia', `¿Eliminar la noticia <b>${esc(n.titulo)}</b>? Deja de mostrarse en el sitio.`, 'Eliminar', () => {
            S.sitio.noticias = S.sitio.noticias.filter((x) => x !== n); bit(u.id, 'Eliminación de noticia', n.titulo); guardar(); toast('Noticia eliminada.'); repintar();
          }, 'btn-d');
        }));
      });
  }

  /* ------------------------------------------------------------ contacto */
  function contacto(u) {
    const c = S.sitio.contacto;
    return vista('contacto', u, cab('Contenido', 'Información de contacto', 'Datos de Quetzaltenango y Guatemala que se muestran en el sitio.'),
      `<div class="rejilla r2">${SEDES_SITIO.map((k) => `<div class="tarjeta"><div class="bloque-cab"><h3>${SEDES[k]}</h3>${c[k].dir ? '<span class="chip chip-v">Publicado</span>' : '<span class="chip chip-a">Faltan datos</span>'}</div>
        <div class="bloque-cuerpo rejilla">${[['dir', 'Dirección'], ['tel', 'Teléfono'], ['correo', 'Correo'], ['wa', 'WhatsApp'], ['horario', 'Horario'], ['mapa', 'Mapa (dirección del mapa insertado de Google Maps)']].map(([f, n]) => `<label class="campo"><span>${n}</span><input class="inp ${f === 'mapa' ? 'mono' : ''}" ${f === 'mapa' ? 'style="font-size:12px"' : ''} data-s="${k}" data-f="${f}" value="${esc(c[k][f])}" placeholder="${f === 'horario' ? 'Pendiente P-22' : f === 'mapa' ? 'https://www.google.com/maps/embed?pb=…' : ''}"></label>`).join('')}
        ${c[k].mapa ? `<iframe class="mapa" src="${esc(c[k].mapa)}" title="Mapa de ${SEDES[k]}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>` : ''}
        <button class="btn btn-p btn-sm" data-g="${k}" style="justify-self:start">Guardar</button></div></div>`).join('')}</div>
      <div style="margin-top:20px">${pend('P-22', 'Faltan los horarios de las dos sedes.')}</div>`,
      (root) => $$('[data-g]', root).forEach((b) => b.addEventListener('click', () => {
        const k = b.dataset.g, m = $(`[data-s=${k}][data-f=mapa]`, root).value.trim();
        if (m && !/^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/.test(m)) return toast('El mapa debe ser la dirección del mapa insertado de Google Maps (https://www.google.com/maps/embed?…).', 'error');
        $$(`[data-s=${k}]`, root).forEach((i) => { c[k][i.dataset.f] = i.value.trim(); });
        bit(u.id, 'Cambio de contenido del sitio', 'Información de contacto · ' + SEDES[k]); guardar(); toast('Datos de ' + SEDES[k] + ' publicados.'); repintar();
      })));
  }

  /* ------------------------------------------------------------ solicitudes */
  let solMotivo = 'todas', solSel = null;
  function solicitudes(u) {
    const gestiona = tiene(u, 'sit.sol.gestionar');
    const todas = S.sitio.solicitudes;
    const ls = todas.filter((s) => solMotivo === 'todas' || s.tipo === solMotivo);
    if (!ls.find((s) => s.id === solSel)) solSel = ls[0] ? ls[0].id : null;
    const responsables = S.usuarios.filter((x) => x.activo && enSistema(x, 'sitio'));
    const lugar = (s) => [s.muni, s.depto, s.pais ? nombrePais(s.pais) : ''].filter(Boolean).join(', ');
    const detalle = () => { const s = ls.find((x) => x.id === solSel); if (!s) return `<div class="vacio">${ico('bandeja')}<h4>Sin solicitudes</h4><p>Envíe un mensaje desde la página de Contacto del sitio y aparecerá aquí.</p></div>`;
      return `<div class="bloque-cuerpo"><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap"><div><span class="chip ${s.tipo === 'solicitud' ? 'chip-v' : s.tipo === 'queja' ? 'chip-a' : 'chip-r'}">${TIPO_SOL[s.tipo]}</span><h2 style="font-size:22px;margin-top:10px;overflow-wrap:anywhere">${esc(s.nombre)}</h2>
          <p class="muted">${esc(s.empresa || 'Sin empresa')} · <span class="mono">${esc(s.correo)}</span>${s.tel ? ` · <span class="mono">${esc(s.telCod || '')} ${esc(s.tel)}</span>` : ''}</p>
          ${lugar(s) ? `<p class="muted" style="font-size:14px;margin-top:4px">${ico('pin', 'ico-s')} ${esc(lugar(s))}</p>` : ''}</div>
          <div class="der"><b class="mono">${s.id}</b><p class="muted" style="font-size:13.5px">${fFH(s.fecha)} · ${SEDES[s.sede]}</p></div></div>
        <div style="margin-top:20px;padding:18px;border-radius:12px;background:var(--g50);font-size:16px;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere">${esc(s.mensaje)}</div>
        <div class="gestion">
          <div class="campo"><span>Estado</span><div class="estados-sol" data-estados>${ESTADOS_SOL.map(([k, n]) => `<button data-est="${k}" class="${s.estado === k ? 'on' : ''}" ${gestiona ? '' : 'disabled'}>${n}</button>`).join('')}</div>
            ${s.estado ? '' : '<small>Sin estado: la solicitud acaba de llegar.</small>'}</div>
          <label class="campo"><span>Responsable</span><select class="sel" data-resp ${gestiona ? '' : 'disabled'}><option value="">Sin responsable</option>${responsables.map((x) => `<option value="${x.id}" ${s.resp === x.id ? 'selected' : ''}>${esc(x.nombre)} · ${esc(x.rol)}</option>`).join('')}${s.resp && !usuario(s.resp) ? `<option value="${s.resp}" selected>${esc(nombreUsuario(s.resp))}</option>` : ''}</select></label>
          <label class="campo" style="grid-column:1/-1"><span>Comentario del responsable</span><textarea class="txa" data-coment rows="3" ${gestiona && !s.comentario ? '' : 'readonly'} placeholder="${gestiona ? 'Un solo comentario sobre la atención de la solicitud' : 'Sin comentario'}">${esc(s.comentario || '')}</textarea>
            ${gestiona ? `<button class="btn btn-s btn-sm" data-g-coment style="align-self:flex-start;margin-top:6px">${s.comentario ? 'Editar comentario' : 'Guardar comentario'}</button>` : ''}</label>
        </div>
      </div>`; };
    const cuenta = (m) => todas.filter((s) => m === 'todas' || s.tipo === m).length;
    const listaH = () => ls.map((s) => `<button data-sol="${s.id}" class="${s.id === solSel ? 'on' : ''}"><div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(s.nombre)}</b>${s.leida ? '' : '<span class="punto" style="color:var(--v500);margin-top:6px"></span>'}</div><div class="muted" style="font-size:13px;margin-top:3px">${TIPO_SOL[s.tipo]} · ${SEDES[s.sede]} · ${fFH(s.fecha)}${s.estado ? ' · ' + ESTADOS_SOL.find((e) => e[0] === s.estado)[1] : ''}</div><div style="font-size:13.5px;margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--g600)">${esc(s.mensaje)}</div></button>`).join('') || '<div class="vacio" style="padding:30px">Sin solicitudes de este motivo.</div>';
    return vista('solicitudes', u, cab('Formulario de contacto', 'Solicitudes recibidas', `Mensajes del formulario de contacto. No se envían a ningún correo.${gestiona ? '' : ' Usted solo puede verlos.'}`),
      `<div class="pestanas">${[['todas', 'Todas'], ['solicitud', 'Solicitudes'], ['queja', 'Quejas'], ['reclamo', 'Reclamos']].map(([k, n]) => `<button data-mot="${k}" class="${solMotivo === k ? 'on' : ''}">${n} <span class="cont">${cuenta(k)}</span></button>`).join('')}</div>
      <div class="tarjeta bandeja"><div class="bandeja-lista" data-lista>${listaH()}</div><div data-det>${detalle()}</div></div>`,
      (root) => {
        const marcar = () => { const s = ls.find((x) => x.id === solSel); if (s && !s.leida) { s.leida = true; guardar(); } };
        const conectar = () => {
          const s = ls.find((x) => x.id === solSel); if (!s || !gestiona) return;
          $('[data-estados]', root).addEventListener('click', (e) => { const b = e.target.closest('[data-est]'); if (!b || s.estado === b.dataset.est) return; s.estado = b.dataset.est; bit(u.id, 'Cambio de estado de solicitud', `${s.id} · ${b.textContent}`); guardar(); pintar(); });
          $('[data-resp]', root).addEventListener('change', (e) => { s.resp = e.target.value || null; bit(u.id, 'Responsable de solicitud', `${s.id} · ${s.resp ? nombreUsuario(s.resp) : 'sin responsable'}`); guardar(); toast('Responsable asignado.'); pintar(); });
          // Con un comentario guardado, el botón es «Editar comentario»: habilita el cuadro y vuelve a ser «Guardar comentario»
          const bc = $('[data-g-coment]', root), tx = $('[data-coment]', root);
          bc.addEventListener('click', (e) => {
            e.preventDefault();
            if (tx.readOnly) { tx.readOnly = false; tx.focus(); bc.textContent = 'Guardar comentario'; return; }
            s.comentario = tx.value.trim(); bit(u.id, 'Comentario de solicitud', s.id); guardar(); toast('Comentario guardado.'); pintar();
          });
        };
        const pintar = () => { $('[data-lista]', root).innerHTML = listaH(); $('[data-det]', root).innerHTML = detalle(); conectar(); };
        marcar(); conectar();
        $$('[data-mot]', root).forEach((b) => b.addEventListener('click', () => { solMotivo = b.dataset.mot; solSel = null; repintar(); }));
        $('[data-lista]', root).addEventListener('click', (e) => { const b = e.target.closest('[data-sol]'); if (!b) return; solSel = b.dataset.sol; marcar(); pintar(); });
      });
  }

  /* ------------------------------------------------------------ documentación interna */
  /* specs/05 (13/10): un producto documentado con nombre, país, lote obligatorio y los enlaces de Google Drive
     de su ficha técnica, su hoja de seguridad y su certificado de análisis. Clic en la fila: ventana con las
     opciones que permiten los permisos */
  const TIPOS_DOC = [['ft', 'FT', 'Ficha técnica'], ['hs', 'HS', 'Hoja de seguridad'], ['coa', 'COA', 'Certificado de análisis']];
  const opcionesPais = (sel) => `<option value="">Elija el país</option>${paises().map((p) => `<option value="${p.c}" ${p.c === sel ? 'selected' : ''}>${esc(p.n)}</option>`).join('')}`;
  const pdfEjemplo = {};
  /* Enlaces de ejemplo (simulación): el PDF de la empresa incluido en el archivo */
  function urlEjemplo(clave) {
    if (!A.pdf || !A.pdf[clave]) return null;
    if (!pdfEjemplo[clave]) { const b = atob(A.pdf[clave]); const a = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); pdfEjemplo[clave] = URL.createObjectURL(new Blob([a], { type: 'application/pdf' })); }
    return pdfEjemplo[clave];
  }
  /* Identificador del archivo de Google Drive (specs/16, decisión 21) */
  const idDrive = (url) => { const m = String(url || '').match(/^https:\/\/(?:drive|docs)\.google\.com\/(?:file\/d\/|document\/d\/|spreadsheets\/d\/|open\?id=|uc\?(?:export=download&)?id=)([\w-]{10,})/); return m ? m[1] : null; };
  const esDrive = (url) => !!idDrive(url);
  const vistaPrevia = (enlace) => (enlace.startsWith('ejemplo:') ? urlEjemplo(enlace.slice(8)) : `https://drive.google.com/file/d/${idDrive(enlace)}/preview`);
  const descarga = (enlace) => (enlace.startsWith('ejemplo:') ? urlEjemplo(enlace.slice(8)) : `https://drive.google.com/uc?export=download&id=${idDrive(enlace)}`);
  function documentos(u) {
    const ve = tiene(u, 'sit.doc.ver'), baja = tiene(u, 'sit.doc.descargar'), gestiona = tiene(u, 'sit.doc.gestionar');
    let fTxt = '';
    const filas = () => S.sitio.docs.filter((d) => !fTxt || norm([d.lote, d.producto, nombrePais(d.pais)].join(' ')).includes(norm(fTxt)));
    const tabla = () => { const f = filas(); return f.length ? `<table class="tabla tabla-clic"><thead><tr><th>Producto</th><th>País de origen</th><th>Lote</th><th>Creado</th>${gestiona ? '<th class="der">Acciones</th>' : ''}</tr></thead><tbody>${f.map((d) => `<tr data-abrir="${d.id}" tabindex="0" title="Ver la documentación">
        <td><div style="display:flex;gap:12px;align-items:center"><span class="doc-ic">${ico('archivo', 'ico-s')}</span><b>${esc(d.producto)}</b></div></td>
        <td>${esc(nombrePais(d.pais) || '—')}</td><td class="mono">${esc(d.lote)}</td><td class="muted" style="font-size:13.5px">${fFecha(d.fecha)}<br>${esc(nombreUsuario(d.usuario))}</td>
        ${gestiona ? `<td class="der" style="white-space:nowrap"><button class="btn btn-s btn-sm" data-editar="${d.id}" title="Editar" aria-label="Editar">${ico('editar', 'ico-s')}</button> <button class="btn btn-g btn-sm" data-borrar="${d.id}" title="Eliminar" aria-label="Eliminar">${ico('borrar', 'ico-s')}</button></td>` : ''}</tr>`).join('')}</tbody></table>`
      : `<div class="vacio">${ico('archivo')}<h4>Sin productos documentados</h4><p>Pruebe con otro lote, producto o país.</p></div>`; };
    return vista('documentos', u, cab('Área protegida', 'Documentación interna', 'Enlaces de Google Drive de la FT, la HS y el COA. Haga clic en un producto para ver su documentación.', gestiona ? `<button class="btn btn-p" data-nuevo>${ico('mas')} Nuevo producto documentado</button>` : ''),
      `<div class="tarjeta"><div class="herr"><label class="buscador">${ico('buscar')}<input class="inp" data-q placeholder="Buscar por lote, producto o país de origen"></label></div>
        <div class="tabla-caja" data-tabla>${tabla()}</div></div>
      <div style="margin-top:18px" class="aviso aviso-v">${ico('escudo')}<div>El sistema guarda solo los enlaces y los muestra a quien tiene permiso. Que un enlace no se abra fuera de la empresa, o que no se pueda descargar desde Google Drive, depende de cómo se comparta cada archivo en Drive (P-92). El producto de ejemplo usa los tres PDF que entregó INCOVSA (soda cáustica de México).</div></div>`,
      (root) => {
        const upd = () => { $('[data-tabla]', root).innerHTML = tabla(); };
        $('[data-q]', root).addEventListener('input', (e) => { fTxt = e.target.value; upd(); });
        const abrir = (d) => {
          const docs = TIPOS_DOC.filter(([k]) => d[k]);
          const lista = docs.length ? docs.map(([k, c, n]) => `<div class="doc-op"><span class="chip ${c === 'COA' ? 'chip-z' : c === 'HS' ? 'chip-a' : 'chip-v'}">${c}</span><b>${n}</b>
              <span class="doc-acc">${ve ? `<button class="btn btn-s btn-sm" data-ver="${k}">${ico('ojo', 'ico-s')} Ver</button>` : ''}${baja ? `<a class="btn btn-s btn-sm" data-bajar="${k}" href="${descarga(d[k])}" ${d[k].startsWith('ejemplo:') ? `download="${esc(d.producto)} ${c}.pdf"` : 'target="_blank" rel="noopener"'}>${ico('descargar', 'ico-s')} Descargar</a>` : ''}</span></div>`).join('')
            : '<p class="muted">Este producto todavía no tiene enlaces de documentos.</p>';
          modal({ titulo: `${esc(d.producto)} · ${esc(nombrePais(d.pais))} · lote ${esc(d.lote)}`, grande: true, cuerpo: `<div class="doc-ops">${lista}</div>
              ${!ve && !baja ? '<p class="muted" style="margin-top:12px">Sus permisos no incluyen ver ni descargar documentos.</p>' : !baja ? '<p class="muted" style="font-size:13.5px;margin-top:10px">Solo visualización: sus permisos no incluyen la descarga.</p>' : ''}
              <div data-visor></div>`, acciones: [{ txt: 'Cerrar' }],
            alAbrir: (m) => $$('[data-ver]', m).forEach((b) => b.addEventListener('click', () => {
              const k = b.dataset.ver;
              $('[data-visor]', m).innerHTML = `<iframe class="pdf-marco" src="${vistaPrevia(d[k])}${d[k].startsWith('ejemplo:') && !baja ? '#toolbar=0' : ''}" title="${esc(d.producto)}" allow="autoplay"></iframe>`;
            })) });
        };
        $('[data-tabla]', root).addEventListener('click', (e) => {
          const ed = e.target.closest('[data-editar]'); if (ed) return editar(S.sitio.docs.find((x) => x.id === ed.dataset.editar));
          const bo = e.target.closest('[data-borrar]');
          if (bo) { const d = S.sitio.docs.find((x) => x.id === bo.dataset.borrar); return confirmar('Eliminar producto documentado', `¿Eliminar <b>${esc(d.producto)}</b> (${esc(nombrePais(d.pais))}, lote ${esc(d.lote)}) y sus enlaces? Dejará de estar disponible para todos los usuarios.`, 'Eliminar', () => { S.sitio.docs = S.sitio.docs.filter((x) => x !== d); bit(u.id, 'Eliminación de producto documentado', `${d.producto} · ${nombrePais(d.pais)} · lote ${d.lote}`); guardar(); toast('Producto documentado eliminado.'); repintar(); }, 'btn-d'); }
          const tr = e.target.closest('[data-abrir]'); if (tr) abrir(S.sitio.docs.find((x) => x.id === tr.dataset.abrir));
        });
        $('[data-tabla]', root).addEventListener('keydown', (e) => { const tr = e.target.closest('[data-abrir]'); if (tr && e.key === 'Enter') abrir(S.sitio.docs.find((x) => x.id === tr.dataset.abrir)); });
        const editar = (d) => modal({ titulo: d ? 'Editar producto documentado' : 'Nuevo producto documentado', grande: true, cuerpo: `<div class="rejilla">
            <label class="campo"><span>Nombre del producto *</span><input class="inp" name="prod" value="${esc(d ? d.producto : '')}" placeholder="Por ejemplo: Soda Cáustica"></label>
            <div class="rejilla r2"><label class="campo"><span>País de origen *</span><select class="sel" name="pais">${opcionesPais(d ? d.pais : '')}</select></label>
              <label class="campo"><span>Lote *</span><input class="inp mono" name="lote" placeholder="Letras y números" value="${esc(d ? d.lote : '')}"></label></div>
            ${TIPOS_DOC.map(([k, c, n]) => `<label class="campo"><span>Enlace de Google Drive · ${n} (${c})</span><input class="inp mono" name="${k}" value="${esc(d && d[k] && !d[k].startsWith('ejemplo:') ? d[k] : '')}" placeholder="${d && d[k] && d[k].startsWith('ejemplo:') ? 'PDF de ejemplo de la simulación' : 'https://drive.google.com/file/d/…'}" style="font-size:13px"></label>`).join('')}
            <p class="muted" style="font-size:13.5px">Los tres enlaces son opcionales; el lote es obligatorio. ${d && TIPOS_DOC.some(([k]) => (d[k] || '').startsWith('ejemplo:')) ? 'Si deja vacío un campo con el PDF de ejemplo, el ejemplo se conserva.' : ''}</p></div>`,
          acciones: [{ txt: 'Cancelar' }, { txt: 'Guardar', cls: 'btn-p', fn: (m) => {
            const v = (n) => $(`[name=${n}]`, m).value.trim();
            const producto = v('prod'), pais = v('pais'), lote = v('lote');
            if (!producto) throw Err('Escriba el nombre del producto.');
            if (!pais) throw Err('Elija el país de origen.');
            if (!lote) throw Err('Escriba el lote: es obligatorio.');
            if (!/^[\p{L}\p{N}]+$/u.test(lote)) throw Err('El lote solo admite letras y números.');
            const enl = {};
            TIPOS_DOC.forEach(([k, c, n]) => { const x = v(k); if (x && !esDrive(x)) throw Err(`El enlace de la ${n.toLowerCase()} debe ser de Google Drive (https://drive.google.com/…).`); enl[k] = x || (d && (d[k] || '').startsWith('ejemplo:') ? d[k] : ''); });
            if (S.sitio.docs.some((x) => x !== d && norm(x.producto) === norm(producto) && x.pais === pais && norm(x.lote) === norm(lote))) throw Err('Ya existe ese producto con el mismo país de origen y el mismo lote.');
            const reg = d || { id: 'doc' + (++S.corr.doc), fecha: hoyISO(), creado: hoyISO(), usuario: u.id };
            Object.assign(reg, { producto, pais, lote }, enl);
            if (!d) S.sitio.docs.unshift(reg);
            bit(u.id, d ? 'Edición de producto documentado' : 'Creación de producto documentado', `${producto} · ${nombrePais(pais)} · lote ${lote} · ${TIPOS_DOC.filter(([k]) => reg[k]).map(([, c]) => c).join(', ') || 'sin enlaces'}`);
            guardar(); toast('Documentación guardada.'); repintar();
          } }],
          alAbrir: (m) => { if (!paises().length) $('[name=pais]', m).closest('.campo').insertAdjacentHTML('beforeend', '<small style="color:var(--rojo)">No se pudo cargar la lista de países (se necesita conexión a internet).</small>'); } });
        const bn = $('[data-nuevo]', root); if (bn) bn.addEventListener('click', () => editar(null));
      });
  }

  /* ------------------------------------------------------------ usuarios del sitio */
  function usuarios(u) {
    const ls = S.usuarios.filter((x) => enSistema(x, 'sitio'));
    return vista('usuarios', u, cab('Gerencia y Soporte', 'Usuarios del sitio', 'Rol de texto libre y permisos del sitio. Gerencia y Soporte entran también al picking.', `<button class="btn btn-p" data-nuevo>${ico('mas')} Nuevo usuario</button>`),
      `<div class="tarjeta"><div class="tabla-caja"><table class="tabla"><thead><tr><th>Nombre</th><th>Usuario</th><th>Rol</th><th>Permisos del sitio</th><th>Correo</th><th>Estado</th><th></th></tr></thead><tbody>
        ${ls.map((x) => `<tr><td><div style="display:flex;gap:10px;align-items:center"><span class="avatar" style="width:34px;height:34px;font-size:12.5px">${iniciales(x.nombre)}</span><b>${esc(x.nombre)}</b></div></td><td class="mono">${esc(x.usuario)}</td>
          <td>${esc(x.rol)}${x.sistema === 'ambos' || esTotal(x) ? ' <span class="chip">+ picking</span>' : ''}</td><td>${resumenPermisos(x, 'sitio')}</td><td class="muted">${esc(x.correo || 'Sin correo')}</td>
          <td><span class="chip ${x.activo ? 'chip-v' : ''}">${x.activo ? 'Activo' : 'Inactivo'}</span></td>
          <td class="der" style="white-space:nowrap"><button class="btn btn-s btn-sm" data-ed="${x.id}" title="Editar" aria-label="Editar">${ico('editar', 'ico-s')}</button> <button class="btn btn-s btn-sm" data-clave="${x.id}">${ico('llave', 'ico-s')} Contraseña</button> <button class="btn btn-g btn-sm" data-del="${x.id}" title="Eliminar">${ico('borrar', 'ico-s')}</button></td></tr>`).join('')}
      </tbody></table></div></div>`,
      (root) => {
        $('[data-nuevo]', root).addEventListener('click', () => formUsuario('sitio', null, u, repintar));
        $$('[data-ed]', root).forEach((b) => b.addEventListener('click', () => formUsuario('sitio', usuario(b.dataset.ed), u, repintar)));
        $$('[data-clave]', root).forEach((b) => b.addEventListener('click', () => restablecerClave(usuario(b.dataset.clave), u, 'sitio')));
        $$('[data-del]', root).forEach((b) => b.addEventListener('click', () => eliminarUsuario(usuario(b.dataset.del), u, 'sitio', repintar)));
      });
  }
  return { ruta, primera };
})();
