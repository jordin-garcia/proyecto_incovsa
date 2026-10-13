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
  if (s) s.addEventListener('click', () => { cerrarSesion(sistema); toast('Sesión cerrada.'); location.hash = '#/acceso/' + sistema; });
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
/* Formulario de usuario, igual en los dos sistemas: rol de texto libre, permisos
   con casillas y, en el picking, sedes con casillas (specs/03, specs/11) */
function formUsuario(sistema, x, admin, alGuardar) {
  const sedes = x ? (x.sedes || []) : [];
  const permisos = x ? (x.permisos || []) : [];
  modal({ titulo: (x ? 'Editar usuario' : 'Nuevo usuario') + (sistema === 'picking' ? ' del picking' : ' del sitio'), grande: true, cuerpo: `<div class="rejilla">
      <div class="rejilla r2"><label class="campo"><span>Nombre completo</span><input class="inp" name="n" value="${esc(x ? x.nombre : '')}"></label>
        <label class="campo"><span>Usuario</span><input class="inp mono" name="us" value="${esc(x ? x.usuario : '')}" ${x ? 'readonly' : ''} placeholder="nombre.apellido" autocapitalize="off"></label></div>
      <div class="rejilla r2"><label class="campo"><span>Rol</span><input class="inp" name="rol" value="${esc(x ? x.rol : '')}" placeholder="Por ejemplo: Facturador"><small>Texto libre. Gerencia y Soporte tienen acceso total a los dos sistemas y a todas las sedes.</small></label>
        <label class="campo"><span>Correo (opcional)</span><input class="inp" name="c" value="${esc(x ? x.correo : '')}"></label></div>
      <div class="aviso aviso-v" data-total-aviso hidden>${ico('info')}<div>Con el rol <b>Gerencia</b> o <b>Soporte</b> la cuenta tiene todos los permisos de los dos sistemas y todas las sedes, y sirve en los dos inicios de sesión.</div></div>
      ${sistema === 'picking' ? `<div class="campo" data-bloque><span>Sedes a las que tiene acceso</span><div class="sedes-chk" data-sedes>${Object.entries(SEDES).map(([k, n]) => `<label class="chk"><input type="checkbox" value="${k}" ${sedes.includes(k) ? 'checked' : ''}>${n}</label>`).join('')}</div></div>` : ''}
      <div class="campo" data-bloque><span>Permisos ${sistema === 'picking' ? 'del sistema de picking' : 'del sitio web'}</span>${casillasPermisos(sistema, permisos)}</div>
      ${sistema === 'picking' ? '<p class="muted" style="font-size:13.5px">Los usuarios con rol <b>Piloto</b> se asignan a los camiones en Facturación y ven solo sus rutas.</p>' : ''}
      ${x ? `<label class="chk"><input type="checkbox" name="a" ${x.activo ? 'checked' : ''}> Cuenta activa</label>` : ''}</div>`,
    acciones: [{ txt: 'Cancelar' }, { txt: 'Guardar', cls: 'btn-p', fn: (m) => {
      const n = $('[name=n]', m).value.trim(), us = $('[name=us]', m).value.trim().toLowerCase(), rol = $('[name=rol]', m).value.trim();
      if (!n || !us) throw Err('Nombre y usuario son obligatorios.');
      if (!rol) throw Err('Escriba el rol del usuario.');
      if (!x && S.usuarios.some((y) => y.usuario === us)) throw Err('Ese nombre de usuario ya existe.');
      const total = esTotal({ rol });
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
        S.usuarios.push(Object.assign({ id: 'u' + Date.now().toString(36), usuario: us, activo: true, clave: 'demo' }, d));
        det = `${us} · rol ${rol}${total ? ' · acceso total' : ` · permisos: ${d.permisos.join(', ') || 'ninguno'}${sistema === 'picking' ? ' · sedes: ' + d.sedes.join(', ') : ''}`}`;
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
    Object.values(S.opciones).forEach((o) => Object.values(o).forEach((v) => { if (v.piloto === x.id) v.piloto = null; }));
    bit(admin.id, 'Eliminación de usuario', `${sistema === 'picking' ? 'Picking' : 'Sitio web'} · ${x.usuario} · ${x.nombre}`);
    guardar(); toast('Usuario eliminado.'); alTerminar();
  }, 'btn-d');
}
function restablecerClave(x, admin, sistema) {
  confirmar('Restablecer contraseña', `Se asigna una contraseña temporal a <b>${esc(x.nombre)}</b> (<span class="mono">${esc(x.usuario)}</span>). Entréguesela a la persona.`, 'Restablecer', () => {
    x.clave = 'demo'; bit(admin.id, 'Restablecimiento de contraseña', `${sistema === 'picking' ? 'Picking' : 'Sitio web'} · ${x.usuario}`); guardar();
    setTimeout(() => modal({ titulo: 'Contraseña temporal', cuerpo: `<p>Entregue a <b>${esc(x.nombre)}</b> la contraseña temporal <b class="mono" style="font-size:18px">demo</b>.</p>`, acciones: [{ txt: 'Listo', cls: 'btn-p' }] }), 50);
  });
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
  const subidos = {};   // PDF elegidos en esta sesión (no se guardan en el almacenamiento del navegador)
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
  const cab = (eyebrow, titulo, texto, acc = '') => `<div class="cab-pag"><div><p class="eyebrow">${eyebrow}</p><h1>${titulo}</h1>${texto ? `<p>${texto}</p>` : ''}</div>${acc ? `<div class="acc">${acc}</div>` : ''}</div>`;

  function ruta(sec) {
    const u = sesion('sitio');
    if (!u) { location.hash = '#/acceso/sitio?volver=' + encodeURIComponent('#/panel' + (sec ? '/' + sec : '')); return null; }
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
    return vista('', u, cab('Panel del sitio', `Hola, ${esc(u.nombre)}`, 'Todo lo que se publica en el sitio se edita desde aquí, sin tocar el código. Los cambios se ven de inmediato en el sitio público.'),
      `<div class="resumen-mods">
        ${t('contenido', 'Contenido institucional', 'noticia', st.historia && st.valores ? 'Completo' : 'Faltan historia y valores', st.historia && st.valores ? 'chip-v' : 'chip-a', 'Historia, misión, visión, valores e imágenes')}
        ${t('industrias', 'Industrias', 'fabrica', 'Textos por revisar', 'chip-a', '9 industrias con descripción e imagen')}
        ${t('catalogo', 'Catálogo', 'caja', st.productos.length + ' productos', 'chip-v', 'Productos públicos y sus industrias')}
        ${t('noticias', 'Noticias', 'imagen', st.noticias.length ? st.noticias.filter((n) => n.pub).length + ' publicadas' : 'Sin publicar', st.noticias.length ? 'chip-v' : 'chip-a', 'Publicación y edición de noticias')}
        ${t('solicitudes', 'Solicitudes', 'bandeja', st.solicitudes.filter((s) => !s.leida).length + ' sin leer', 'chip-z', 'Mensajes del formulario de contacto')}
        ${t('documentos', 'Documentación interna', 'archivo', st.documentos.length + ' documentos', 'chip-v', 'Fichas técnicas, hojas de seguridad y certificados')}
      </div>
      <div style="margin-top:22px">${pend('P-18', 'Para completar el sitio faltan el logotipo en vectorial con los colores exactos y la tipografía, la historia y los valores (P-19), las imágenes de las industrias (P-21), los horarios de las sedes y el correo que recibe el formulario (P-22) y los datos de los productos públicos (P-17). Los colores de esta propuesta se tomaron de los dos logotipos recibidos.')}</div>`);
  }

  /* ------------------------------------------------------------ contenido */
  function contenido(u) {
    const st = S.sitio;
    const bloques = [
      ['mision', 'Misión', 'Imagen recibida de INCOVSA. Puede subir otra.', 'Texto alternativo (transcripción de la imagen)'],
      ['vision', 'Visión', 'Imagen recibida de INCOVSA · P-20', 'Texto alternativo (transcripción de la imagen)'],
      ['historia', 'Historia', 'Pendiente P-19 · imagen opcional', 'Texto'],
      ['valores', 'Valores', 'Pendiente P-19 · imagen opcional', 'Texto'],
    ];
    const imgDe = (k) => st.img[k] || (k === 'mision' ? A.mision : k === 'vision' ? A.vision : '');
    return vista('contenido', u, cab('Contenido institucional', 'Quiénes somos', 'Lo que se guarda aquí se publica en el inicio y en «Quiénes somos».'),
      `<div class="rejilla r2">${bloques.map(([k, n, e, et]) => `<div class="tarjeta">
        <div class="bloque-cab"><div><h3>${n}</h3><p>${e}</p></div><span class="chip ${st[k] || st.img[k] ? 'chip-v' : 'chip-a'}">${st[k] || st.img[k] ? 'Publicado' : 'Sin contenido'}</span></div>
        <div class="bloque-cuerpo rejilla">
          <div class="campo"><span>Imagen${k === 'historia' || k === 'valores' ? ' (opcional)' : ''}</span>${campoImagen(k, imgDe(k))}
            <div style="display:flex;gap:8px;flex-wrap:wrap">${st.img[k] ? `<button class="btn btn-g btn-sm" data-quitar="${k}">${k === 'mision' || k === 'vision' ? 'Volver a la imagen de la empresa' : 'Quitar imagen'}</button>` : ''}</div></div>
          <label class="campo"><span>${et}</span><textarea class="txa" data-k="${k}" rows="${k === 'mision' || k === 'vision' ? 4 : 6}" placeholder="Texto pendiente de INCOVSA">${esc(st[k])}</textarea></label>
          <div style="display:flex;gap:10px"><button class="btn btn-p btn-sm" data-guardar="${k}">Guardar y publicar</button><a class="btn btn-s btn-sm" href="#/nosotros">Ver en el sitio</a></div></div></div>`).join('')}</div>
      <div class="tarjeta bloque" style="margin-top:22px"><div class="bloque-cab"><div><h3>Logotipo de Inquiserca</h3><p>Se alterna con el de INCOVSA en el banner de «Quiénes somos». Mientras no se suba, el banner muestra solo el de INCOVSA.</p></div><span class="chip ${st.img.inquiserca ? 'chip-v' : 'chip-a'}">${st.img.inquiserca ? 'Publicado' : 'Sin logotipo'}</span></div>
        <div class="bloque-cuerpo rejilla" style="max-width:520px">${campoImagen('inquiserca', st.img.inquiserca, 'Arrastre el logotipo aquí o haga clic para elegirlo')}
          ${st.img.inquiserca ? `<button class="btn btn-g btn-sm" data-quitar="inquiserca" style="justify-self:start">Quitar logotipo</button>` : ''}
          ${pend('P-69', 'Falta recibir el logotipo de Inquiserca.')}</div></div>
      <div class="tarjeta bloque" style="margin-top:22px"><div class="bloque-cab"><div><h3>Imágenes del sitio</h3><p>Se guardan en Cloudflare R2 (plan gratuito).</p></div></div>
        <div class="bloque-cuerpo" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px">
          ${[['Portada', A.fotoEquipo], ['Encabezados', A.fotoReunion], ['Logotipo', A.logo]].map(([n, src]) => `<figure style="margin:0"><div style="aspect-ratio:16/9;border-radius:12px;border:1px solid var(--g150);background:#fff url(${src}) center/${n.startsWith('Logo') ? 'contain' : 'cover'} no-repeat"></div><figcaption style="font-size:13.5px;font-weight:600;margin-top:8px">${n}</figcaption></figure>`).join('')}
        </div></div>`,
      (root) => {
        const nuevas = {};
        montarImagenes(root, (k, url) => {
          if (k === 'inquiserca') {
            const antes = st.img.inquiserca; st.img.inquiserca = url;
            if (!guardar()) { st.img.inquiserca = antes; return; }
            bit(u.id, 'Cambio de contenido del sitio', 'Logotipo de Inquiserca'); guardar(); toast('Logotipo de Inquiserca publicado.'); repintar();
          } else { nuevas[k] = url; toast('Imagen lista. Pulse «Guardar y publicar».', 'aviso'); }
        });
        $$('[data-guardar]', root).forEach((b) => b.addEventListener('click', () => {
          const k = b.dataset.guardar, antes = { t: st[k], i: st.img[k] };
          st[k] = $(`[data-k=${k}]`, root).value.trim();
          if (nuevas[k]) st.img[k] = nuevas[k];
          if (!guardar()) { st[k] = antes.t; st.img[k] = antes.i; return; }
          bit(u.id, 'Cambio de contenido del sitio', bloques.find((x) => x[0] === k)[1]); guardar();
          toast(`${bloques.find((x) => x[0] === k)[1]} publicada en el sitio.`); repintar();
        }));
        $$('[data-quitar]', root).forEach((b) => b.addEventListener('click', () => {
          const k = b.dataset.quitar; st.img[k] = ''; bit(u.id, 'Cambio de contenido del sitio', `Imagen quitada · ${k}`); guardar(); toast('Imagen quitada.'); repintar();
        }));
      });
  }

  /* ------------------------------------------------------------ industrias */
  function industrias(u) {
    return vista('industrias', u, cab('Contenido', 'Industrias atendidas', 'Nombre, descripción e imagen de cada una de las 9 industrias. No se muestran en una barra horizontal (RF-SW-03).'),
      `<div class="rejilla r3">${INDUSTRIAS.map((x, i) => `<div class="tarjeta tarjeta-p" style="display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;gap:12px;align-items:center"><span class="ind-ic" style="width:44px;height:44px;border-radius:12px;background:var(--v50);color:var(--v600);display:grid;place-items:center">${ico(x.id)}</span><div><span class="mono muted" style="font-size:12px">${pad(i + 1)}</span><h3 style="font-size:18px">${x.n}</h3></div></div>
        ${campoImagen(x.id, S.sitio.indImg[x.id], 'Imagen de la industria: arrástrela o haga clic')}
        <textarea class="txa" rows="6" data-ind="${x.id}">${esc(S.sitio.industrias[x.id])}</textarea>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-s btn-sm" data-g="${x.id}">Guardar</button>${S.sitio.indImg[x.id] ? `<button class="btn btn-g btn-sm" data-quitar="${x.id}">Quitar imagen</button>` : ''}</div></div>`).join('')}</div>
      <div style="margin-top:20px">${pend('P-21', 'Las descripciones vienen de Google Sites y necesitan revisión. Faltan las imágenes propias de cada industria.')}</div>`,
      (root) => {
        const nuevas = {};
        montarImagenes(root, (id, url) => { nuevas[id] = url; toast('Imagen lista. Pulse «Guardar».', 'aviso'); });
        $$('[data-g]', root).forEach((b) => b.addEventListener('click', () => {
          const id = b.dataset.g, antes = { t: S.sitio.industrias[id], i: S.sitio.indImg[id] };
          S.sitio.industrias[id] = $(`[data-ind=${id}]`, root).value.trim();
          if (nuevas[id]) S.sitio.indImg[id] = nuevas[id];
          if (!guardar()) { S.sitio.industrias[id] = antes.t; S.sitio.indImg[id] = antes.i; return; }
          bit(u.id, 'Cambio de contenido del sitio', 'Industria ' + INDN[id]); guardar(); toast(INDN[id] + ' publicada.'); repintar();
        }));
        $$('[data-quitar]', root).forEach((b) => b.addEventListener('click', () => { delete S.sitio.indImg[b.dataset.quitar]; bit(u.id, 'Cambio de contenido del sitio', 'Imagen quitada · industria ' + INDN[b.dataset.quitar]); guardar(); repintar(); }));
      });
  }

  /* ------------------------------------------------------------ catálogo */
  function catalogo(u) {
    return vista('catalogo', u, cab('Contenido', 'Catálogo de productos públicos', 'Son una entidad distinta de los productos del picking: no tienen lote ni Peso de Conversión. Un producto puede pertenecer a varias industrias.', `<button class="btn btn-p" data-nuevo>${ico('mas')} Nuevo producto</button>`),
      `<div class="tarjeta"><div class="tabla-caja"><table class="tabla"><thead><tr><th style="width:72px"></th><th>Producto</th><th>Presentación</th><th>Países de origen</th><th>Industrias</th><th></th></tr></thead><tbody>
        ${S.sitio.productos.map((p) => `<tr><td>${imgProd(p) ? `<img src="${imgProd(p)}" alt="" style="width:52px;height:52px;border-radius:10px;object-fit:cover;border:1px solid var(--g150)">` : `<span class="sin-img">${ico('imagen', 'ico-s')}</span>`}</td>
          <td><b>${esc(p.n)}</b>${p.desc ? `<div class="muted" style="font-size:13px;max-width:320px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(p.desc)}</div>` : ''}</td>
          <td>${p.pres ? esc(p.pres) : pendIn('P-17')}</td><td>${p.origen ? esc(p.origen) : pendIn('P-17')}</td>
          <td><div class="etiquetas">${p.ind.length ? p.ind.map((i) => `<span class="chip chip-v">${INDN[i]}</span>`).join('') : '<span class="chip chip-a">Por confirmar</span>'}</div></td>
          <td class="der" style="white-space:nowrap"><button class="btn btn-s btn-sm" data-ed="${p.id}">${ico('editar', 'ico-s')} Editar</button> <button class="btn btn-g btn-sm" data-del="${p.id}" title="Eliminar">${ico('borrar', 'ico-s')}</button></td></tr>`).join('')}
      </tbody></table></div></div>
      <div style="margin-top:18px">${pend('P-17', 'Faltan los datos de los productos públicos: descripción, presentación, países de origen e industrias de cada uno.')}</div>`,
      (root) => {
        const editar = (p) => {
          let foto = null;
          modal({ titulo: p ? 'Editar producto público' : 'Nuevo producto público', grande: true, cuerpo: `<div class="rejilla">
            <div class="rejilla r2" style="align-items:start"><div class="rejilla">
              <label class="campo"><span>Nombre</span><input class="inp" name="n" value="${esc(p ? p.n : '')}"></label>
              <label class="campo"><span>Presentación</span><input class="inp" name="pres" value="${esc(p ? p.pres : '')}" placeholder="Por ejemplo: saco de 25 kg"></label>
              <label class="campo"><span>Países de origen</span><input class="inp" name="origen" value="${esc(p ? p.origen : '')}" placeholder="Por ejemplo: México, China"></label></div>
              <div class="campo"><span>Imagen</span>${campoImagen('foto', p ? imgProd(p) : '')}</div></div>
            <label class="campo"><span>Descripción</span><textarea class="txa" name="desc" rows="4">${esc(p ? p.desc : '')}</textarea></label>
            <div class="campo"><span>Industrias (una o varias)</span><div class="rejilla r3" style="gap:8px">${INDUSTRIAS.map((x) => `<label class="chk"><input type="checkbox" value="${x.id}" ${p && p.ind.includes(x.id) ? 'checked' : ''}>${x.n}</label>`).join('')}</div></div></div>`,
            acciones: [{ txt: 'Cancelar' }, { txt: 'Guardar', cls: 'btn-p', fn: (m) => {
              const n = $('[name=n]', m).value.trim(); if (!n) throw Err('Escriba el nombre.');
              const d = { n, pres: $('[name=pres]', m).value.trim(), origen: $('[name=origen]', m).value.trim(), desc: $('[name=desc]', m).value.trim(), ind: $$('input[type=checkbox]:checked', m).map((x) => x.value) };
              if (foto) d.foto = foto;
              const antes = p ? Object.assign({}, p) : null;
              let nuevo = null;
              if (p) Object.assign(p, d);
              else { nuevo = Object.assign({ id: 'pp' + Date.now().toString(36), img: -1, foto: '' }, d); S.sitio.productos.push(nuevo); }
              if (!guardar()) { if (p) Object.assign(p, antes); else S.sitio.productos = S.sitio.productos.filter((x) => x !== nuevo); return false; }
              bit(u.id, p ? 'Edición de producto público' : 'Creación de producto público', n); guardar();
              toast('Catálogo actualizado.'); repintar();
            } }],
            alAbrir: (m) => montarImagenes(m, (k, url) => { foto = url; }) });
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
    return vista('noticias', u, cab('Contenido', 'Noticias', 'Cada noticia lleva fotografía, título y texto. Lo que se publica aquí aparece en la página de Noticias del sitio.', `<button class="btn btn-p" data-nueva>${ico('mas')} Nueva noticia</button>`),
      `${pend('P-23', 'Falta el contenido inicial de las noticias.')}
      <div class="tarjeta" style="margin-top:18px">${ns.length ? `<div class="tabla-caja"><table class="tabla"><thead><tr><th style="width:84px"></th><th>Título</th><th>Fecha</th><th>Estado</th><th></th></tr></thead><tbody>${ns.map((n) => `<tr>
          <td>${n.foto ? `<img src="${n.foto}" alt="" style="width:68px;height:46px;border-radius:8px;object-fit:cover;border:1px solid var(--g150)">` : `<span class="sin-img">${ico('imagen', 'ico-s')}</span>`}</td>
          <td><b>${esc(n.titulo)}</b><div class="muted" style="font-size:13.5px;max-width:420px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(n.texto)}</div></td><td class="mono">${fFecha(n.fecha)}</td><td><span class="chip ${n.pub ? 'chip-v' : ''}">${n.pub ? 'Publicada' : 'Oculta'}</span></td>
          <td class="der" style="white-space:nowrap"><button class="btn btn-s btn-sm" data-ed="${n.id}">${ico('editar', 'ico-s')} Editar</button> <button class="btn btn-s btn-sm" data-alt="${n.id}">${n.pub ? 'Ocultar' : 'Publicar'}</button></td></tr>`).join('')}</tbody></table></div>`
        : `<div class="vacio">${ico('imagen')}<h4>No hay noticias</h4><p>Cree la primera y véala publicada en el sitio.</p></div>`}</div>`,
      (root) => {
        const editar = (n) => {
          let foto = null;
          modal({ titulo: n ? 'Editar noticia' : 'Nueva noticia', grande: true, cuerpo: `<div class="rejilla">
            <div class="campo"><span>Fotografía</span>${campoImagen('foto', n ? n.foto : '')}</div>
            <label class="campo"><span>Título</span><input class="inp" name="t" value="${esc(n ? n.titulo : '')}"></label>
            <label class="campo"><span>Texto</span><textarea class="txa" name="x" rows="7">${esc(n ? n.texto : '')}</textarea></label>
            ${n ? '' : '<label class="chk"><input type="checkbox" name="p" checked> Publicar de inmediato</label>'}</div>`,
            acciones: [{ txt: 'Cancelar' }, { txt: 'Guardar', cls: 'btn-p', fn: (m) => {
              const t = $('[name=t]', m).value.trim(), x = $('[name=x]', m).value.trim();
              if (!t) throw Err('Escriba el título.'); if (!x) throw Err('Escriba el texto.');
              if (!n && !foto) throw Err('Agregue la fotografía.');
              let nueva = null; const antes = n ? Object.assign({}, n) : null;
              if (n) Object.assign(n, { titulo: t, texto: x }, foto ? { foto } : {});
              else { nueva = { id: 'n' + (++S.corr.not), titulo: t, texto: x, foto, fecha: hoyISO(), pub: $('[name=p]', m).checked, autor: u.id }; S.sitio.noticias.unshift(nueva); }
              if (!guardar()) { if (n) Object.assign(n, antes); else S.sitio.noticias = S.sitio.noticias.filter((y) => y !== nueva); return false; }
              bit(u.id, n ? 'Edición de noticia' : 'Creación de noticia', t); guardar();
              toast('Noticia guardada. <a href="#/noticias" style="color:var(--lima-b)">Verla en el sitio</a>'); repintar();
            } }],
            alAbrir: (m) => montarImagenes(m, (k, url) => { foto = url; }) });
        };
        $('[data-nueva]', root).addEventListener('click', () => editar(null));
        $$('[data-ed]', root).forEach((b) => b.addEventListener('click', () => editar(ns.find((x) => x.id === b.dataset.ed))));
        $$('[data-alt]', root).forEach((b) => b.addEventListener('click', () => { const n = ns.find((x) => x.id === b.dataset.alt); n.pub = !n.pub; bit(u.id, n.pub ? 'Publicación de noticia' : 'Noticia ocultada', n.titulo); guardar(); repintar(); }));
      });
  }

  /* ------------------------------------------------------------ contacto */
  function contacto(u) {
    const c = S.sitio.contacto;
    return vista('contacto', u, cab('Contenido', 'Información de contacto', 'Datos de las sedes con oficina que se muestran en el sitio: Quetzaltenango y Guatemala.'),
      `<div class="rejilla r2">${SEDES_SITIO.map((k) => `<div class="tarjeta"><div class="bloque-cab"><h3>${SEDES[k]}</h3>${c[k].dir ? '<span class="chip chip-v">Publicado</span>' : '<span class="chip chip-a">Faltan datos</span>'}</div>
        <div class="bloque-cuerpo rejilla">${[['dir', 'Dirección'], ['tel', 'Teléfono'], ['correo', 'Correo'], ['wa', 'WhatsApp'], ['horario', 'Horario'], ['mapa', 'Mapa (dirección del mapa insertado de Google Maps)']].map(([f, n]) => `<label class="campo"><span>${n}</span><input class="inp ${f === 'mapa' ? 'mono' : ''}" ${f === 'mapa' ? 'style="font-size:12px"' : ''} data-s="${k}" data-f="${f}" value="${esc(c[k][f])}" placeholder="${f === 'horario' ? 'Pendiente P-22' : f === 'mapa' ? 'https://www.google.com/maps/embed?pb=…' : ''}"></label>`).join('')}
        ${c[k].mapa ? `<iframe class="mapa" src="${esc(c[k].mapa)}" title="Mapa de ${SEDES[k]}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>` : ''}
        <button class="btn btn-p btn-sm" data-g="${k}" style="justify-self:start">Guardar</button></div></div>`).join('')}</div>
      <div style="margin-top:20px">${pend('P-22', 'Faltan los horarios de las dos sedes y el correo que recibe el formulario.')}</div>`,
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
      return `<div class="bloque-cuerpo"><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap"><div><span class="chip ${s.tipo === 'solicitud' ? 'chip-v' : s.tipo === 'queja' ? 'chip-a' : 'chip-r'}">${s.tipo}</span><h2 style="font-size:22px;margin-top:10px">${esc(s.nombre)}</h2>
          <p class="muted">${esc(s.empresa || 'Sin empresa')} · <span class="mono">${esc(s.correo)}</span>${s.tel ? ` · <span class="mono">${esc(s.telCod || '')} ${esc(s.tel)}</span>` : ''}</p>
          ${lugar(s) ? `<p class="muted" style="font-size:14px;margin-top:4px">${ico('pin', 'ico-s')} ${esc(lugar(s))}</p>` : ''}</div>
          <div class="der"><b class="mono">${s.id}</b><p class="muted" style="font-size:13.5px">${fFH(s.fecha)} · ${SEDES[s.sede]}</p></div></div>
        <div style="margin-top:20px;padding:18px;border-radius:12px;background:var(--g50);font-size:16px;line-height:1.6;white-space:pre-wrap">${esc(s.mensaje)}</div>
        <div class="gestion">
          <div class="campo"><span>Estado</span><div class="estados-sol" data-estados>${ESTADOS_SOL.map(([k, n]) => `<button data-est="${k}" class="${s.estado === k ? 'on' : ''}" ${gestiona ? '' : 'disabled'}>${n}</button>`).join('')}</div>
            ${s.estado ? '' : '<small>Sin estado: la solicitud acaba de llegar.</small>'}</div>
          <label class="campo"><span>Responsable</span><select class="sel" data-resp ${gestiona ? '' : 'disabled'}><option value="">Sin responsable</option>${responsables.map((x) => `<option value="${x.id}" ${s.resp === x.id ? 'selected' : ''}>${esc(x.nombre)} · ${esc(x.rol)}</option>`).join('')}${s.resp && !usuario(s.resp) ? `<option value="${s.resp}" selected>${esc(nombreUsuario(s.resp))}</option>` : ''}</select></label>
          <label class="campo" style="grid-column:1/-1"><span>Comentario del responsable</span><textarea class="txa" data-coment rows="3" ${gestiona ? '' : 'readonly'} placeholder="${gestiona ? 'Un solo comentario sobre la atención de la solicitud' : 'Sin comentario'}">${esc(s.comentario || '')}</textarea>
            ${gestiona ? '<button class="btn btn-s btn-sm" data-g-coment style="justify-self:start;margin-top:6px">Guardar comentario</button>' : ''}</label>
        </div>
        <div class="aviso aviso-z" style="margin-top:16px">${ico('correo')}<div>La solicitud también se envió por correo a la sede seleccionada (en la simulación no se envía).</div></div></div>`; };
    const cuenta = (m) => todas.filter((s) => m === 'todas' || s.tipo === m).length;
    const listaH = () => ls.map((s) => `<button data-sol="${s.id}" class="${s.id === solSel ? 'on' : ''}"><div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(s.nombre)}</b>${s.leida ? '' : '<span class="punto" style="color:var(--v500);margin-top:6px"></span>'}</div><div class="muted" style="font-size:13px;margin-top:3px">${s.tipo} · ${SEDES[s.sede]} · ${fFH(s.fecha)}${s.estado ? ' · ' + ESTADOS_SOL.find((e) => e[0] === s.estado)[1] : ''}</div><div style="font-size:13.5px;margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--g600)">${esc(s.mensaje)}</div></button>`).join('') || '<div class="vacio" style="padding:30px">Sin solicitudes de este motivo.</div>';
    return vista('solicitudes', u, cab('Formulario de contacto', 'Solicitudes recibidas', `Lo que llega por el formulario se guarda aquí y además se envía por correo.${gestiona ? '' : ' Con sus permisos puede ver la bandeja, pero no gestionarla.'}`),
      `<div class="pestanas">${[['todas', 'Todas'], ['solicitud', 'Solicitudes'], ['queja', 'Quejas'], ['reclamo', 'Reclamos']].map(([k, n]) => `<button data-mot="${k}" class="${solMotivo === k ? 'on' : ''}">${n} <span class="cont">${cuenta(k)}</span></button>`).join('')}</div>
      <div class="tarjeta bandeja"><div class="bandeja-lista" data-lista>${listaH()}</div><div data-det>${detalle()}</div></div>`,
      (root) => {
        const marcar = () => { const s = ls.find((x) => x.id === solSel); if (s && !s.leida) { s.leida = true; guardar(); } };
        const conectar = () => {
          const s = ls.find((x) => x.id === solSel); if (!s || !gestiona) return;
          $('[data-estados]', root).addEventListener('click', (e) => { const b = e.target.closest('[data-est]'); if (!b || s.estado === b.dataset.est) return; s.estado = b.dataset.est; bit(u.id, 'Cambio de estado de solicitud', `${s.id} · ${b.textContent}`); guardar(); pintar(); });
          $('[data-resp]', root).addEventListener('change', (e) => { s.resp = e.target.value || null; bit(u.id, 'Responsable de solicitud', `${s.id} · ${s.resp ? nombreUsuario(s.resp) : 'sin responsable'}`); guardar(); toast('Responsable asignado.'); pintar(); });
          $('[data-g-coment]', root).addEventListener('click', () => { s.comentario = $('[data-coment]', root).value.trim(); bit(u.id, 'Comentario de solicitud', s.id); guardar(); toast('Comentario guardado.'); });
        };
        const pintar = () => { $('[data-lista]', root).innerHTML = listaH(); $('[data-det]', root).innerHTML = detalle(); conectar(); };
        marcar(); conectar();
        $$('[data-mot]', root).forEach((b) => b.addEventListener('click', () => { solMotivo = b.dataset.mot; solSel = null; repintar(); }));
        $('[data-lista]', root).addEventListener('click', (e) => { const b = e.target.closest('[data-sol]'); if (!b) return; solSel = b.dataset.sol; marcar(); pintar(); });
      });
  }

  /* ------------------------------------------------------------ documentación interna */
  function urlPdf(d) {
    if (d.pdf && A.pdf && A.pdf[d.pdf]) {
      if (!urlPdf.cache[d.pdf]) { const b = atob(A.pdf[d.pdf]); const a = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); urlPdf.cache[d.pdf] = URL.createObjectURL(new Blob([a], { type: 'application/pdf' })); }
      return urlPdf.cache[d.pdf];
    }
    return subidos[d.id] || null;
  }
  urlPdf.cache = {};
  const opcionesPais = (sel) => `<option value="">Elija el país</option>${paises().map((p) => `<option value="${p.c}" ${p.c === sel ? 'selected' : ''}>${esc(p.n)}</option>`).join('')}`;
  function documentos(u) {
    const ve = tiene(u, 'sit.doc.ver'), descarga = tiene(u, 'sit.doc.descargar'), gestiona = tiene(u, 'sit.doc.gestionar');
    let fTipo = 'todos', fTxt = '';
    const filas = () => S.sitio.documentos.filter((d) => (fTipo === 'todos' || d.tipo === fTipo) && (!fTxt || norm([d.lote, d.producto, nombrePais(d.pais)].join(' ')).includes(norm(fTxt))));
    const tabla = () => { const f = filas(); return f.length ? `<table class="tabla"><thead><tr><th>Documento</th><th>Tipo</th><th>Producto</th><th>País de origen</th><th>Lote</th><th>Cargado</th><th class="der">Acciones</th></tr></thead><tbody>${f.map((d) => `<tr>
        <td><div style="display:flex;gap:12px;align-items:center"><span class="doc-ic" style="width:38px;height:38px;border-radius:10px;display:grid;place-items:center;background:var(--rojo-f);color:var(--rojo);flex:none">${ico('archivo', 'ico-s')}</span><b style="font-size:14px">${esc(d.nombre)}</b></div></td>
        <td><span class="chip ${d.tipo === 'COA' ? 'chip-z' : d.tipo === 'HS' ? 'chip-a' : 'chip-v'}">${d.tipo} · ${TIPO_DOC[d.tipo]}</span></td>
        <td>${esc(d.producto)}</td><td>${esc(nombrePais(d.pais) || '—')}</td><td class="mono">${esc(d.lote || '—')}</td><td class="muted" style="font-size:13.5px">${fFecha(d.fecha)}<br>${esc(nombreUsuario(d.usuario))}</td>
        <td class="der" style="white-space:nowrap">${ve ? `<button class="btn btn-s btn-sm" data-ver="${d.id}">${ico('ojo', 'ico-s')} Ver</button>` : ''}
          ${descarga ? `<button class="btn btn-s btn-sm" data-bajar="${d.id}" title="Descargar">${ico('descargar', 'ico-s')}</button>` : ''}
          ${gestiona ? `<button class="btn btn-s btn-sm" data-reemp="${d.id}" title="Reemplazar">${ico('subir', 'ico-s')}</button><button class="btn btn-d btn-sm" data-borrar="${d.id}" title="Eliminar">${ico('borrar', 'ico-s')}</button>` : ''}</td></tr>`).join('')}</tbody></table>`
      : `<div class="vacio">${ico('archivo')}<h4>Sin documentos</h4><p>Pruebe con otro lote, producto, país o tipo.</p></div>`; };
    const puede = [ve && 'ver los PDF en el navegador', descarga && 'descargarlos', gestiona && 'subir, reemplazar y eliminar documentos'].filter(Boolean);
    return vista('documentos', u, cab('Área protegida', 'Documentación interna', `Fichas técnicas (FT), hojas de seguridad (HS) y certificados de análisis (COA), todos en PDF. Con sus permisos usted puede ${puede.join(', ').replace(/, ([^,]*)$/, ' y $1')}.`, gestiona ? `<button class="btn btn-p" data-subir>${ico('subir')} Subir documento</button>` : ''),
      `<div class="tarjeta"><div class="herr"><label class="buscador">${ico('buscar')}<input class="inp" data-q placeholder="Buscar por lote, producto o país de origen"></label>
        <div class="seg" data-tipos>${[['todos', 'Todos'], ['FT', 'Fichas técnicas'], ['HS', 'Hojas de seguridad'], ['COA', 'Certificados']].map(([k, n]) => `<button data-t="${k}" class="${k === fTipo ? 'on' : ''}">${n}</button>`).join('')}</div></div>
        <div class="tabla-caja" data-tabla>${tabla()}</div></div>
      <div style="margin-top:18px" class="aviso aviso-v">${ico('escudo')}<div>Los PDF se guardan en el servidor, fuera de la carpeta pública, y se entregan por una ruta que verifica los permisos. Los tres documentos de la tabla son los ejemplos reales que entregó INCOVSA (soda cáustica de México).</div></div>`,
      (root) => {
        const upd = () => { $('[data-tabla]', root).innerHTML = tabla(); };
        $('[data-q]', root).addEventListener('input', (e) => { fTxt = e.target.value; upd(); });
        $('[data-tipos]', root).addEventListener('click', (e) => { const b = e.target.closest('[data-t]'); if (!b) return; fTipo = b.dataset.t; $$('[data-t]', root).forEach((x) => x.classList.toggle('on', x === b)); upd(); });
        $('[data-tabla]', root).addEventListener('click', (e) => {
          const b = e.target.closest('button'); if (!b) return;
          const d = S.sitio.documentos.find((x) => x.id === (b.dataset.ver || b.dataset.bajar || b.dataset.reemp || b.dataset.borrar));
          if (b.dataset.ver) {
            const url = urlPdf(d);
            modal({ grande: true, titulo: `${TIPO_DOC[d.tipo]} · ${esc(d.nombre)}`, cuerpo: url ? `<iframe class="pdf-marco" src="${url}${descarga ? '' : '#toolbar=0'}" title="${esc(d.nombre)}"></iframe>${descarga ? '' : '<p class="muted" style="font-size:13.5px;margin-top:10px">Solo visualización: sus permisos no incluyen la descarga.</p>'}` : `<div class="vacio">${ico('archivo')}<h4>El archivo no está disponible en esta sesión</h4></div>`, acciones: [{ txt: 'Cerrar' }] });
          } else if (b.dataset.bajar) {
            const url = urlPdf(d); if (!url) return toast('El archivo no está disponible en esta sesión.', 'error');
            const a = document.createElement('a'); a.href = url; a.download = d.nombre; a.click();
          } else if (b.dataset.reemp) {
            subir(d);
          } else if (b.dataset.borrar) {
            confirmar('Eliminar documento', `¿Eliminar <b>${esc(d.nombre)}</b>? Dejará de estar disponible para todos los usuarios.`, 'Eliminar', () => { S.sitio.documentos = S.sitio.documentos.filter((x) => x !== d); bit(u.id, 'Eliminación de documento interno', d.nombre); guardar(); toast('Documento eliminado.'); repintar(); }, 'btn-d');
          }
        });
        const subir = (reemplazo) => modal({ titulo: reemplazo ? 'Reemplazar documento' : 'Subir documento', cuerpo: `<div class="rejilla">
            <label class="campo"><span>Tipo de documento</span><select class="sel" name="tipo">${Object.entries(TIPO_DOC).map(([k, n]) => `<option value="${k}" ${reemplazo && reemplazo.tipo === k ? 'selected' : ''}>${k} · ${n}</option>`).join('')}</select></label>
            <label class="campo"><span>Nombre del producto</span><input class="inp" name="prod" value="${esc(reemplazo ? reemplazo.producto : '')}" placeholder="Por ejemplo: Soda Cáustica"><small>Un solo producto por documento.</small></label>
            <div class="rejilla r2"><label class="campo"><span>País de origen</span><select class="sel" name="pais">${opcionesPais(reemplazo ? reemplazo.pais : '')}</select></label>
              <label class="campo"><span data-lote-etq>Lote</span><input class="inp mono" name="lote" placeholder="Letras y números" value="${esc(reemplazo ? reemplazo.lote : '')}"></label></div>
            <label class="subida">${ico('archivo')}<div style="margin-top:6px" data-arch>Seleccione un archivo PDF</div><input type="file" accept="application/pdf" hidden name="arch"></label></div>`,
          acciones: [{ txt: 'Cancelar' }, { txt: reemplazo ? 'Reemplazar' : 'Subir', cls: 'btn-p', fn: (m) => {
            const f = $('[name=arch]', m).files[0]; if (!f) throw Err('Seleccione el PDF.');
            if (f.type !== 'application/pdf' && !/\.pdf$/i.test(f.name)) throw Err('Solo se aceptan archivos PDF.');
            const tipo = $('[name=tipo]', m).value, producto = $('[name=prod]', m).value.trim(), pais = $('[name=pais]', m).value, lote = $('[name=lote]', m).value.trim();
            if (!producto) throw Err('Escriba el nombre del producto.');
            if (!pais) throw Err('Elija el país de origen.');
            if (tipo === 'COA' && !lote) throw Err('El certificado de análisis lleva el lote.');
            if (lote && !/^[\p{L}\p{N}]+$/u.test(lote)) throw Err('El lote solo admite letras y números.');
            const d = reemplazo || { id: 'doc' + (++S.corr.doc) };
            Object.assign(d, { tipo, nombre: f.name, producto, pais, lote, fecha: hoyISO(), usuario: u.id, pdf: null });
            subidos[d.id] = URL.createObjectURL(f);
            if (!reemplazo) S.sitio.documentos.unshift(d);
            bit(u.id, reemplazo ? 'Reemplazo de documento interno' : 'Carga de documento interno', `${tipo} · ${producto} · ${nombrePais(pais)}${lote ? ' · lote ' + lote : ''} · ${f.name}`);
            guardar(); toast(reemplazo ? 'Documento reemplazado.' : 'Documento cargado.'); repintar();
          } }],
          alAbrir: (m) => {
            const t = $('[name=tipo]', m);
            const ver = () => { $('[data-lote-etq]', m).textContent = t.value === 'COA' ? 'Lote (obligatorio en COA)' : 'Lote (opcional)'; };
            t.addEventListener('change', ver); ver();
            if (!paises().length) $('[name=pais]', m).closest('.campo').insertAdjacentHTML('beforeend', '<small style="color:var(--rojo)">No se pudo cargar la lista de países (se necesita conexión a internet).</small>');
            $('[name=arch]', m).addEventListener('change', (e) => { $('[data-arch]', m).textContent = e.target.files[0] ? e.target.files[0].name : 'Seleccione un archivo PDF'; });
          } });
        const bs = $('[data-subir]', root); if (bs) bs.addEventListener('click', () => subir(null));
      });
  }

  /* ------------------------------------------------------------ usuarios del sitio */
  function usuarios(u) {
    const ls = S.usuarios.filter((x) => enSistema(x, 'sitio'));
    return vista('usuarios', u, cab('Gerencia y Soporte', 'Usuarios del sitio', 'Cada usuario tiene un rol de texto libre y los permisos del sitio que se le marquen. Las cuentas de Gerencia y Soporte sirven también en el sistema de picking.', `<button class="btn btn-p" data-nuevo>${ico('mas')} Nuevo usuario</button>`),
      `<div class="tarjeta"><div class="tabla-caja"><table class="tabla"><thead><tr><th>Nombre</th><th>Usuario</th><th>Rol</th><th>Permisos del sitio</th><th>Correo</th><th>Estado</th><th></th></tr></thead><tbody>
        ${ls.map((x) => `<tr><td><div style="display:flex;gap:10px;align-items:center"><span class="avatar" style="width:34px;height:34px;font-size:12.5px">${iniciales(x.nombre)}</span><b>${esc(x.nombre)}</b></div></td><td class="mono">${esc(x.usuario)}</td>
          <td>${esc(x.rol)}${x.sistema === 'ambos' || esTotal(x) ? ' <span class="chip">+ picking</span>' : ''}</td><td>${resumenPermisos(x, 'sitio')}</td><td class="muted">${esc(x.correo || 'Sin correo')}</td>
          <td><span class="chip ${x.activo ? 'chip-v' : ''}">${x.activo ? 'Activo' : 'Inactivo'}</span></td>
          <td class="der" style="white-space:nowrap"><button class="btn btn-s btn-sm" data-ed="${x.id}">${ico('editar', 'ico-s')} Editar</button> <button class="btn btn-s btn-sm" data-clave="${x.id}">${ico('llave', 'ico-s')} Contraseña</button> <button class="btn btn-g btn-sm" data-del="${x.id}" title="Eliminar">${ico('borrar', 'ico-s')}</button></td></tr>`).join('')}
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
