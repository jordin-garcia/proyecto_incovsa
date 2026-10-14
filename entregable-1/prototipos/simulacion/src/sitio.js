/* ==========================================================================
   SITIO PÚBLICO (specs/05-sitio-web.md)
   ========================================================================== */
const Sitio = (() => {
  const NAV = [['/', 'Inicio'], ['/nosotros', 'Quiénes somos'], ['/industrias', 'Industrias'], ['/productos', 'Productos'], ['/noticias', 'Noticias'], ['/contacto', 'Contacto']];
  const activo = (ruta, actual) => (ruta === '/' ? actual === '/' : actual.startsWith(ruta));

  function cabecera(actual) {
    const links = NAV.map(([r, n]) => `<a href="#${r}" class="${activo(r, actual) ? 'on' : ''}">${n}</a>`).join('');
    return `<header class="sh">
      <div class="wrap sh-in">
        <a href="#/" class="sh-logo" aria-label="INCOVSA Químicos, inicio"><img src="${A.logo}" alt="INCOVSA Químicos"></a>
        <nav class="sh-nav" aria-label="Menú principal">${links}</nav>
        <a href="#/acceso" class="btn btn-p btn-sm" style="min-height:40px">${ico('candado', 'ico-s')} Acceso personal</a>
        <button class="btn btn-g btn-ico sh-menu" data-menu aria-label="Abrir menú">${ico('menu')}</button>
      </div>
      <nav class="sh-movil" aria-label="Menú">${links}</nav>
    </header>`;
  }
  /* Pie solo en Inicio, Quiénes somos, Noticias y Contacto, con el logotipo de la cabecera (RF-SW-15) */
  function pie() {
    const c = S.sitio.contacto;
    return `<footer class="pie-sitio"><div class="wrap">
      <div class="pie-rej">
        <div>
          <img src="${A.logoBlanco}" alt="INCOVSA Químicos" style="height:54px;width:auto">
          <p style="margin-top:20px;max-width:320px">Industria del Cuero Covadonga S. A. Compra y venta de productos químicos en Guatemala. INCOVSA e Inquiserca, una sola identidad.</p>
        </div>
        <div><h4>Navegación</h4>${NAV.map(([r, n]) => `<a href="#${r}">${n}</a>`).join('')}</div>
        <div><h4>Industrias</h4>${INDUSTRIAS.slice(0, 5).map((i) => `<a href="#/industrias/${i.id}">${i.n}</a>`).join('')}<a href="#/industrias">Ver las nueve</a></div>
        <div><h4>Contacto</h4>
          <a href="#/contacto" class="mono" style="font-size:13.5px">${esc(c.XE.correo)}</a>
          <a href="#/contacto" class="mono" style="font-size:13.5px">${esc(c.GT.correo)}</a>
          <a href="#/contacto">WhatsApp Quetzaltenango · ${esc(c.XE.wa)}</a>
          <a href="#/contacto">WhatsApp Guatemala · ${esc(c.GT.wa)}</a>
        </div>
      </div>
      <div class="legal"><span>© ${new Date().getFullYear()} Industria del Cuero Covadonga S. A. · incovsa.com</span><span>Prototipo para validación · Universidad Rafael Landívar · Programación Web</span></div>
    </div></footer>`;
  }
  const pagina = (actual, cuerpo, conPie = true) => cabecera(actual) + `<main>${cuerpo}</main>` + (conPie ? pie() : '');
  /* Presentación dinámica: las imágenes aparecen al entrar en pantalla y desaparecen al salir (RF-SW-16).
     Igual que la misión y la visión, todas las imágenes y tarjetas del contenido de la página */
  const REVELAR = 'main img, main .tarjeta, main .ind-t, main .prod-t, main .det-foto, main .banner-logos';
  let observador = null;
  function revelar(root) {
    $$(REVELAR, root).forEach((x) => { if (!x.parentElement.closest(REVELAR)) x.classList.add('revelar'); });
    const els = $$('.revelar', root);
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach((x) => x.classList.add('visible')); return; }
    // Aparece cuando se ve el 15 % del elemento; los muy altos (como el formulario de contacto), cuando ocupan el 15 % de la pantalla
    const ver = (e) => e.isIntersecting && (e.intersectionRatio >= 0.15 || e.intersectionRect.height >= 0.15 * (e.rootBounds ? e.rootBounds.height : innerHeight));
    observador = observador || new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('visible', ver(e))), { threshold: Array.from({ length: 21 }, (x, i) => i / 20) });
    els.forEach((x) => observador.observe(x));
  }
  function montarBase(root) {
    const b = $('[data-menu]', root);
    if (b) b.addEventListener('click', () => $('.sh-movil', root).classList.toggle('abierto'));
    if (observador) { observador.disconnect(); observador = null; }
    revelar(root);
  }
  const cabPag = (eyebrow, titulo, texto, foto = A.fotoEquipo, miga = '') => `<section class="pag-cab">
      <div class="foto" style="background-image:url(${foto})"></div><div class="velo"></div>
      <div class="wrap">${miga}<p class="eyebrow" style="margin-top:${miga ? 18 : 0}px">${eyebrow}</p><h1>${titulo}</h1>${texto ? `<p>${texto}</p>` : ''}</div>
    </section>`;

  const tarjetaProducto = (p) => `<a class="prod-t" href="#/productos/${p.id}">
      <div class="foto">${imgProd(p) ? `<img src="${imgProd(p)}" alt="${esc(p.n)}">` : `<span class="sin-foto">${ico('imagen')}</span>`}</div>
      <div class="info"><h3>${esc(p.n)}</h3>
        ${p.origen || p.pres ? `<p class="prod-datos">${[p.origen, p.pres].filter(Boolean).map(esc).join(' · ')}</p>` : ''}
        <div class="etiquetas">${p.ind.length ? p.ind.slice(0, 2).map((i) => `<span class="chip chip-v">${INDN[i]}</span>`).join('') + (p.ind.length > 2 ? `<span class="chip">+${p.ind.length - 2}</span>` : '') : '<span class="chip chip-a">Industria por confirmar</span>'}</div>
      </div></a>`;
  const tarjetaIndustria = (x, i) => `<a class="ind-t" href="#/industrias/${x.id}">
      <span class="n">${pad(i + 1)}</span><span class="ind-ic">${ico(x.id)}</span>
      <h3>${x.n}</h3><p>${esc(S.sitio.industrias[x.id])}</p>
      <span class="pie">${x.p.length} productos ${ico('flecha', 'ico-s')}</span></a>`;
  const imgMision = () => S.sitio.img.mision || A.mision;
  const imgVision = () => S.sitio.img.vision || A.vision;
  /* Misión y visión: las imágenes de la empresa, centradas, una debajo de la otra */
  const misionVision = () => `<div class="mv-imgs">
      <img class="revelar" src="${imgMision()}" alt="Misión: ${esc(S.sitio.mision)}">
      <img class="revelar" src="${imgVision()}" alt="Visión: ${esc(S.sitio.vision)}">
    </div>`;

  /* ------------------------------------------------------------ inicio */
  function inicio() {
    const c = S.sitio.contacto;
    return { titulo: 'Inicio', mount: montarBase, html: pagina('/', `
      <section class="hero">
        <div class="hero-foto revelar revelar-f" style="background-image:url(${A.fotoEquipo})"></div><div class="hero-velo"></div><div class="hero-puntos"></div>
        <div class="wrap hero-in">
          <div>
            <p class="eyebrow">Industria del Cuero Covadonga S. A.</p>
            <h1 style="margin-top:20px">Química que sostiene a la industria <em>guatemalteca</em></h1>
            <p class="lead">Compra, venta y distribución de productos químicos para nueve industrias del país. Más de treinta años abasteciendo al sector industrial y artesanal, con presencia en todo el territorio.</p>
            <div class="hero-acc">
              <a href="#/productos" class="btn btn-lima btn-lg">Ver catálogo de productos ${ico('flecha')}</a>
              <a href="#/contacto" class="btn btn-s btn-lg">Hablar con un asesor</a>
            </div>
          </div>
          <div class="cifras">
            <div><b>30+</b><span>años en el mercado guatemalteco</span></div>
            <div><b>9</b><span>industrias atendidas</span></div>
            <div><b>3</b><span>sedes con bodega de distribución</span></div>
            <div><b>22</b><span>departamentos: presencia en todo el país</span></div>
          </div>
        </div>
      </section>

      <section class="sec">
        <div class="wrap">
          <div class="cab-sec">
            <div><p class="eyebrow">Industrias atendidas</p><h2>Cada industria tiene su propio conjunto de productos</h2></div>
            <a href="#/industrias" class="btn btn-s">Ver las nueve ${ico('flecha', 'ico-s')}</a>
          </div>
          <div class="ind-rejilla">${INDUSTRIAS.map(tarjetaIndustria).join('')}</div>
        </div>
      </section>

      <section class="banda-mv sec">
        <div class="foto" style="background-image:url(${A.fotoReunion})"></div><div class="velo"></div>
        <div class="wrap">
          <div class="cab-sec" style="position:relative"><div><p class="eyebrow" style="color:var(--lima-b)">Propósito</p><h2 style="color:#fff">Misión y visión</h2></div>
            <img src="${A.logoBlanco}" alt="INCOVSA Químicos" style="height:48px;width:auto;opacity:.95"></div>
          ${misionVision()}
        </div>
      </section>

      <section class="sec">
        <div class="wrap">
          <div class="cab-sec"><div><p class="eyebrow">Presencia</p><h2>Visítenos</h2></div><p>Ubique nuestras oficinas en el mapa: será un gusto atenderle en persona.</p></div>
          <div class="sede-rejilla">${sedes(c, true)}</div>
        </div>
      </section>

      <section class="sec" style="padding-top:0">
        <div class="wrap"><div class="llamado">
          <div><h2>¿Necesita un producto que no aparece en el catálogo?</h2><p>Escríbanos y un asesor le responde desde la sede que le corresponde.</p></div>
          <a href="#/contacto" class="btn btn-lima btn-lg" style="position:relative;z-index:1">Enviar una solicitud ${ico('flecha')}</a>
        </div></div>
      </section>`) };
  }
  /* Solo Quetzaltenango y Guatemala, las sedes con oficina (specs/05) */
  function sedes(c, conMapa) {
    const t = (k, etq) => {
      const s = c[k];
      return `<div class="tarjeta sede-t"><span class="chip chip-v" style="align-self:flex-start">${etq}</span><h3>${SEDES[k]}</h3>
        ${s.dir ? `<div class="dato">${ico('pin', 'ico-s')}<span>${esc(s.dir)}</span></div>` : ''}
        ${s.tel ? `<div class="dato">${ico('tel', 'ico-s')}<span class="mono" style="font-size:14px">${esc(s.tel)}</span></div>` : ''}
        ${s.correo ? `<div class="dato">${ico('correo', 'ico-s')}<span class="mono" style="font-size:14px">${esc(s.correo)}</span></div>` : ''}
        ${s.wa ? `<div class="dato">${ico('chat', 'ico-s')}<span>WhatsApp ${esc(s.wa)}</span></div>` : ''}
        ${s.horario ? `<div class="dato">${ico('reloj', 'ico-s')}<span>${esc(s.horario)}</span></div>` : ''}
        ${conMapa && s.mapa ? `<iframe class="mapa" src="${esc(s.mapa)}" title="Mapa de la sede de ${SEDES[k]}" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>` : ''}</div>`;
    };
    return t('XE', 'Oficina central y bodega') + t('GT', 'Oficina y bodega');
  }

  /* ------------------------------------------------------------ quiénes somos */
  function nosotros() {
    const st = S.sitio;
    const logos = [A.logoBlanco].concat(st.img.inquiserca ? [st.img.inquiserca] : []);
    return { titulo: 'Quiénes somos', mount: montarBase, html: pagina('/nosotros', `<section class="pag-cab pag-cab-logos">
        <div class="foto" style="background-image:url(${A.fotoReunion})"></div><div class="velo"></div>
        <div class="wrap banner-nos">
          <div><p class="eyebrow">Quiénes somos</p><h1>Más de treinta años abasteciendo de químicos a la industria del país</h1>
            <p>INCOVSA, Industria del Cuero Covadonga S. A., se dedica a la compra y venta de productos químicos en Guatemala. Atiende nueve industrias y lleva sus productos a clientes de todo el país.</p></div>
          <div class="banner-logos ${logos.length > 1 ? 'alterna' : ''}">${logos.map((src, i) => `<img src="${src}" alt="${i ? 'Inquiserca' : 'INCOVSA Químicos'}">`).join('')}</div>
        </div>
      </section>
      <section class="sec"><div class="wrap dos-col">
        <div>
          <p class="eyebrow">Nuestra historia</p>
          <h2 style="font-size:38px;margin-top:14px">De tenería a distribuidor de productos químicos</h2>
          ${st.historia ? `<p style="margin-top:18px;font-size:17px;color:var(--g600);line-height:1.7">${esc(st.historia)}</p>` : `<div style="margin-top:22px">${pend('P-19', 'La historia la redacta INCOVSA. Lo único registrado en las actas es que la operación inició como tenería, se consolidó como distribuidora de productos químicos y de ahí nace Inquiserca.')}</div>`}
        </div>
        ${st.img.historia ? `<img src="${st.img.historia}" alt="Historia de INCOVSA" style="border-radius:24px;box-shadow:var(--s2);width:100%">` : `<div class="revelar" style="border-radius:24px;overflow:hidden;box-shadow:var(--s2);aspect-ratio:16/10;background:url(${A.fotoEquipo}) 55% 30%/cover"></div>`}
      </div></section>
      <section class="banda-mv sec"><div class="foto" style="background-image:url(${A.fotoReunion})"></div><div class="velo"></div>
        <div class="wrap">${misionVision()}
        <div style="margin-top:22px;position:relative">${pend('P-20', 'La imagen original de la visión dice «tranparente». La empresa compartirá la imagen corregida; mientras tanto, el texto alternativo dice «transparente».')}</div></div>
      </section>
      <section class="sec"><div class="wrap">
        <div class="cab-sec"><div><p class="eyebrow">Valores</p><h2>Lo que nos guía</h2></div></div>
        ${st.valores ? `<p style="font-size:17px">${esc(st.valores)}</p>` : `<div class="rejilla r4">${[1, 2, 3, 4].map((n) => `<div class="tarjeta tarjeta-p" style="border-style:dashed;min-height:150px"><span class="mono" style="color:var(--g300);font-size:28px;font-weight:700">${pad(n)}</span><p class="muted" style="margin-top:12px">Valor pendiente de INCOVSA</p></div>`).join('')}</div>
        <div style="margin-top:16px">${pend('P-19', 'La cantidad de valores y su redacción los define la empresa. El diseño se ajusta a los que envíe.')}</div>`}
        ${imgsValores().map((src, i, l) => `<img src="${src}" alt="Valores de INCOVSA${l.length > 1 ? ' · imagen ' + (i + 1) : ''}" style="margin-top:24px;border-radius:24px;box-shadow:var(--s2);width:100%;max-width:900px">`).join('')}
      </div></section>
      <section class="sec sec-b"><div class="wrap">
        <div class="cab-sec"><div><p class="eyebrow">A quién servimos</p><h2>Dos mercados, la misma calidad de producto</h2></div></div>
        <div class="rejilla r2">
          <div class="tarjeta tarjeta-p" style="padding:32px"><span class="ind-ic" style="width:56px;height:56px;border-radius:16px;background:var(--v600);color:#fff;display:grid;place-items:center">${ico('fabrica', 'ico-l')}</span>
            <h3 style="font-size:24px;margin-top:18px">Mercado industrial</h3><p class="muted" style="margin-top:10px;font-size:16px">Empresas con maquinaria que transforman materia prima a escala: curtiembres, textileras, fábricas de medicamentos, plantas de tratamiento de agua y de alimento para consumo animal.</p></div>
          <div class="tarjeta tarjeta-p" style="padding:32px"><span class="ind-ic" style="width:56px;height:56px;border-radius:16px;background:var(--lima-v);color:var(--v950);display:grid;place-items:center">${ico('usuarios', 'ico-l')}</span>
            <h3 style="font-size:24px;margin-top:18px">Mercado artesanal</h3><p class="muted" style="margin-top:10px;font-size:16px">Productores que trabajan de forma manual, sin maquinaria industrial, con las mismas presentaciones y el mismo respaldo técnico.</p></div>
        </div>
      </div></section>
      <section class="sec"><div class="wrap" style="display:flex;gap:40px;align-items:center;flex-wrap:wrap">
        <img src="${A.logo}" alt="INCOVSA Químicos" style="height:90px;width:auto">
        <div style="flex:1;min-width:280px"><p class="eyebrow">INCOVSA e Inquiserca</p><h2 style="font-size:32px;margin-top:12px">Dos empresas del mismo grupo, una sola identidad</h2>
          <p class="muted" style="margin-top:12px;font-size:17px">Comparten productos y existencias según la logística de distribución, y se presentan en este sitio bajo una misma identidad visual.</p></div>
      </div></section>`) };
  }

  /* ------------------------------------------------------------ industrias */
  function industrias(id) {
    const sel = INDUSTRIAS.find((x) => x.id === id) || INDUSTRIAS[0];
    const img = S.sitio.indImg[sel.id];
    const mount = (root) => {
      montarBase(root);
      $('.ind-lista', root).addEventListener('click', (e) => { const b = e.target.closest('[data-ind]'); if (b && b.dataset.ind !== sel.id) { conservarDesplazamiento = true; location.hash = '#/industrias/' + b.dataset.ind; } });
    };
    return { titulo: 'Industrias', mount, html: pagina('/industrias', cabPag('Industrias atendidas', 'Nueve industrias, cada una con su propio conjunto de productos', 'Seleccione una industria para ver su descripción y los productos que INCOVSA distribuye para ese sector.') + `
      <section class="sec" style="padding-top:56px"><div class="wrap ind-lay">
        <nav class="ind-lista" aria-label="Industrias">${INDUSTRIAS.map((x, i) => `<button data-ind="${x.id}" class="${x.id === sel.id ? 'on' : ''}">${ico(x.id)}${x.n}<span class="n">${pad(i + 1)}</span></button>`).join('')}</nav>
        <article class="tarjeta ind-det">
          <div class="top"><span class="ind-ic">${ico(sel.id)}</span><div><p class="eyebrow">Industria ${pad(INDUSTRIAS.indexOf(sel) + 1)}</p><h2 style="margin-top:8px">${sel.n}</h2></div>
            <a href="#/productos?industria=${sel.id}" class="btn btn-s" style="margin-left:auto">Ver en el catálogo ${ico('flecha', 'ico-s')}</a></div>
          <p class="desc">${esc(S.sitio.industrias[sel.id])}</p>
          <div class="ind-img">${img ? `<img src="${img}" alt="Industria ${esc(sel.n)}">` : `<span class="ind-img-vacia">${ico(sel.id)}<small>Imagen de la industria</small></span>`}</div>
          <h4 style="margin-top:28px;font-size:16px">Productos para esta industria · ${sel.p.length}</h4>
          <div class="lista-prod">${sel.p.map((n) => `<span>${esc(n)}</span>`).join('')}</div>
          <div style="margin-top:24px">${pend('P-21', 'Las descripciones vienen literales de la página de Google Sites y necesitan revisión de redacción. Faltan las imágenes propias de cada industria en alta resolución.')}</div>
        </article>
      </div></section>`, false) };
  }

  /* ------------------------------------------------------------ catálogo */
  function catalogo(q) {
    let fInd = q.get('industria') || 'todas', fTxt = '';
    const lista = () => S.sitio.productos.filter((p) => (fInd === 'todas' || (fInd === 'sin' ? !p.ind.length : p.ind.includes(fInd))) && (!fTxt || norm(p.n).includes(norm(fTxt))));
    const filtros = () => [['todas', 'Todas las industrias', S.sitio.productos.length]].concat(INDUSTRIAS.map((x) => [x.id, x.n, S.sitio.productos.filter((p) => p.ind.includes(x.id)).length]))
      .concat([['sin', 'Industria por confirmar', S.sitio.productos.filter((p) => !p.ind.length).length]])
      .map(([id, n, c]) => `<button data-f="${id}" class="${fInd === id ? 'on' : ''}">${n}<small>${c}</small></button>`).join('');
    const rejilla = () => { const l = lista(); return l.length ? `<div class="prod-rejilla" style="grid-template-columns:repeat(3,minmax(0,1fr))">${l.map(tarjetaProducto).join('')}</div>` : `<div class="tarjeta vacio">${ico('buscar')}<h4>Ningún producto coincide</h4><p>Pruebe con otro término o quite el filtro de industria.</p></div>`; };
    return { titulo: 'Productos', html: pagina('/productos', cabPag('Catálogo informativo', 'Productos, presentación y origen', 'Filtre por industria o busque por nombre. El catálogo es informativo: no se publican precios ni número de lote.') + `
      <section class="sec" style="padding-top:48px"><div class="wrap cat-lay">
        <aside class="filtros" data-filtros>${filtros()}</aside>
        <div>
          <div style="display:flex;gap:14px;align-items:center;margin-bottom:22px;flex-wrap:wrap">
            <label class="buscador" style="flex:1;min-width:240px">${ico('buscar')}<input class="inp" data-q placeholder="Buscar producto" aria-label="Buscar producto"></label>
            <span class="muted" data-total></span>
          </div>
          <div data-rejilla>${rejilla()}</div>
          <div style="margin-top:26px">${pend('P-17', 'Faltan los datos de cada producto público: descripción, presentación, países de origen e industrias. Las industrias que se muestran salen de las listas de Google Sites cuando el nombre coincide.')}</div>
        </div>
      </div></section>`, false),
    mount(root) {
      montarBase(root);
      const upd = () => { $('[data-rejilla]', root).innerHTML = rejilla(); $('[data-filtros]', root).innerHTML = filtros(); $('[data-total]', root).textContent = lista().length + ' de ' + S.sitio.productos.length + ' productos'; revelar(root); };
      $('[data-filtros]', root).addEventListener('click', (e) => { const b = e.target.closest('[data-f]'); if (b) { fInd = b.dataset.f; upd(); } });
      $('[data-q]', root).addEventListener('input', (e) => { fTxt = e.target.value; upd(); });
      upd();
    } };
  }

  /* ------------------------------------------------------------ detalle */
  function producto(id) {
    const p = S.sitio.productos.find((x) => x.id === id);
    if (!p) return noEncontrada();
    // Productos Recomendados: siempre aparecen. Primero los que comparten industria; si faltan, otros del catálogo (RF-SW-17)
    const otros = S.sitio.productos.filter((x) => x.id !== p.id);
    const rel = otros.filter((x) => x.ind.some((i) => p.ind.includes(i))).concat(otros.filter((x) => !x.ind.some((i) => p.ind.includes(i)))).slice(0, 4);
    const dato = (t, v, ancho) => `<div ${ancho ? 'style="grid-column:1/-1"' : ''}><dt>${t}</dt><dd>${v ? esc(v) : pendIn('P-17')}</dd></div>`;
    return { titulo: p.n, mount: montarBase, html: pagina('/productos', `
      <section class="sec" style="padding-top:40px"><div class="wrap">
        <div class="miga" style="color:var(--g500);margin-bottom:26px"><a href="#/productos" style="color:var(--g600)">Productos</a> / ${p.ind[0] ? `<a href="#/productos?industria=${p.ind[0]}" style="color:var(--g600)">${INDN[p.ind[0]]}</a> /` : ''} <span style="color:var(--g900)">${esc(p.n)}</span></div>
        <div class="det-lay">
          <div class="det-foto">${imgProd(p) ? `<img src="${imgProd(p)}" alt="${esc(p.n)}" style="width:100%">` : `<span class="sin-foto" style="aspect-ratio:1">${ico('imagen')}</span>`}</div>
          <div>
            <p class="eyebrow">Catálogo público</p>
            <h1 style="font-size:clamp(32px,4vw,48px);margin-top:12px;font-weight:800">${esc(p.n)}</h1>
            <div class="etiquetas" style="margin-top:18px">${p.ind.length ? p.ind.map((i) => `<a class="chip chip-v" href="#/industrias/${i}">${INDN[i]}</a>`).join('') : '<span class="chip chip-a">Industria por confirmar</span>'}</div>
            <dl class="fichas" style="margin-top:28px">${dato('Descripción', p.desc, true)}${dato('Presentación', p.pres)}${dato('Países de origen', p.origen)}</dl>
            <div class="aviso aviso-v" style="margin-top:18px">${ico('info')}<div>El precio y el número de lote no se publican en el sitio. Para cotizaciones, comuníquese con la sede que le corresponde. Los productos químicos tienen restricciones de venta: un asesor verificará el uso previsto.</div></div>
            <div style="display:flex;gap:12px;margin-top:22px;flex-wrap:wrap"><a href="#/contacto" class="btn btn-p btn-lg">Solicitar información ${ico('flecha')}</a><a href="#/productos" class="btn btn-s btn-lg">Volver al catálogo</a></div>
          </div>
        </div>
        ${rel.length ? `<div style="margin-top:72px"><div class="cab-sec" style="margin-bottom:26px"><div><p class="eyebrow">Recomendados</p><h2 style="font-size:30px">Productos Recomendados</h2></div></div><div class="prod-rejilla">${rel.map(tarjetaProducto).join('')}</div></div>` : ''}
      </div></section>`, false) };
  }

  /* ------------------------------------------------------------ noticias */
  function noticias() {
    const ns = S.sitio.noticias.filter((n) => n.pub).sort((a, b) => b.fecha.localeCompare(a.fecha));
    const extracto = (t) => (t.length > 220 ? t.slice(0, 220).replace(/\s+\S*$/, '') + '…' : t);
    return { titulo: 'Noticias', mount: montarBase, html: pagina('/noticias', cabPag('Noticias', 'Novedades de la empresa', 'Nuevos productos, ampliación de bodegas, certificaciones y avisos a clientes.') + `
      <section class="sec"><div class="wrap">
        ${ns.length ? `<div class="rejilla r3">${ns.map((n) => `<article class="tarjeta" style="overflow:hidden">
            <div style="aspect-ratio:16/9;background:${n.foto ? `url(${n.foto}) center/cover` : 'linear-gradient(135deg,var(--v600),var(--v900))'};position:relative">${n.foto ? '' : `<div style="position:absolute;right:18px;bottom:10px;width:34px;opacity:.9">${burbujas()}</div>`}</div>
            <div class="tarjeta-p"><span class="chip">${fFecha(n.fecha)}</span><h3 style="font-size:21px;margin-top:12px">${esc(n.titulo)}</h3><p class="muted" style="margin-top:10px">${esc(extracto(n.texto || ''))}</p></div></article>`).join('')}</div>`
        : `<div class="tarjeta vacio" style="padding:70px 20px">${ico('noticia')}<h4>Todavía no hay noticias publicadas</h4><p>Las noticias se publican desde el panel del sitio, con fotografía, título y texto.</p></div>`}
        <div style="margin-top:20px">${pend('P-23', 'Falta el contenido inicial de las noticias.')}</div>
      </div></section>`) };
  }

  /* ------------------------------------------------------------ contacto */
  function contacto() {
    const c = S.sitio.contacto;
    return { titulo: 'Contacto', html: pagina('/contacto', cabPag('Contacto', 'Cuéntenos cómo podemos ayudarle', 'Escríbanos una solicitud, queja o reclamo y le responde un asesor de la sede que le corresponde.') + `
      <section class="sec"><div class="wrap contacto-lay">
        <div class="tarjeta form-contacto" data-form></div>
        <div style="display:flex;flex-direction:column;gap:16px"><div class="sede-rejilla">${sedes(c, false)}</div>
          <div class="aviso aviso-a">${ico('alerta')}<div>Los productos químicos que distribuye INCOVSA tienen restricciones de venta. Un asesor verificará el uso previsto antes de cotizar.</div></div>
        </div>
      </div></section>`),
    mount(root) {
      montarBase(root);
      const caja = $('[data-form]', root);
      let tipo = 'solicitud';
      const lib = window.libphonenumber, ps = paises();
      const form = () => {
        caja.innerHTML = `<h2 style="font-size:26px">Envíenos su mensaje</h2><p class="muted" style="margin-top:6px">Los campos con asterisco son obligatorios. La solicitud se guarda en el sistema y se envía por correo a la sede seleccionada.</p>
          <div style="margin-top:22px" class="rejilla">
            <div class="campo"><span>Tipo de mensaje *</span><div class="seg" data-tipo>${['solicitud', 'queja', 'reclamo'].map((t) => `<button type="button" data-t="${t}" class="${t === tipo ? 'on' : ''}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div></div>
            <div class="rejilla r2"><label class="campo"><span>Nombre completo *</span><input class="inp" name="nombre" placeholder="Su nombre"></label>
              <label class="campo"><span>Empresa</span><input class="inp" name="empresa" placeholder="Nombre de su empresa"></label></div>
            <div class="rejilla r2"><label class="campo"><span>Correo electrónico *</span><input class="inp" name="correo" type="email" placeholder="correo@empresa.com"><small class="msg-error" data-msg="correo" hidden></small></label>
              <div class="campo"><span>Teléfono</span><div class="tel-caja">${ps.length ? `<div class="tel-cod"><select class="sel" name="telcod" aria-label="Código de país">${ps.map((p) => `<option value="${p.c}" ${p.c === 'GT' ? 'selected' : ''}>${esc(p.n)} (${p.tel})</option>`).join('')}</select><span class="tel-cod-txt" data-telcod aria-hidden="true">${(ps.find((p) => p.c === 'GT') || ps[0]).tel}</span></div>` : ''}<input class="inp" name="tel" inputmode="tel" placeholder="5123 4567" aria-label="Número de teléfono"></div><small class="msg-error" data-msg="tel" hidden></small></div></div>
            <div class="rejilla"><label class="campo"><span>País *</span><span class="sel-ajuste"><select class="sel" name="pais"><option value="">Elija el país</option>${ps.map((p) => `<option value="${p.c}">${esc(p.n)}</option>`).join('')}</select><span class="sel-txt" aria-hidden="true"></span></span></label>
              <label class="campo" data-gt hidden><span>Departamento *</span><span class="sel-ajuste"><select class="sel" name="depto"><option value="">Elija el departamento</option>${GUATEMALA.map((d, i) => `<option value="${i}">${esc(d[0])}</option>`).join('')}</select><span class="sel-txt" aria-hidden="true"></span></span></label>
              <label class="campo" data-gt hidden><span>Municipio *</span><span class="sel-ajuste"><select class="sel" name="muni"><option value="">Elija primero el departamento</option></select><span class="sel-txt" aria-hidden="true"></span></span></label></div>
            <label class="campo"><span>Sede a la que dirige su mensaje *</span><select class="sel" name="sede"><option value="">Elija la sede</option>${SEDES_SITIO.map((k) => `<option value="${k}">${SEDES[k]}</option>`).join('')}</select></label>
            <label class="campo"><span>Mensaje *</span><textarea class="txa" name="mensaje" placeholder="Describa su solicitud, queja o reclamo"></textarea></label>
            <div data-err></div>
            <button class="btn btn-p btn-lg" data-enviar style="justify-self:start">Enviar mensaje ${ico('flecha')}</button>
            ${ps.length ? '' : '<p class="muted" style="font-size:13.5px">No se pudo cargar la lista de países y códigos telefónicos (se necesita conexión a internet).</p>'}
            ${pend('P-22', 'Faltan el correo que recibe las solicitudes y los horarios de las sedes.')}
          </div>`;
        const el = (n) => $(`[name=${n}]`, caja);
        /* Correo y teléfono se validan al salir del campo, antes de seguir con los demás */
        const errCorreo = (x) => (/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(x) ? '' : 'Indique un correo con una estructura válida (nombre@dominio.com).');
        const errTel = (x, cod) => (x && lib && lib.isValidPhoneNumber && !lib.isValidPhoneNumber(x, cod) ? `El teléfono no es válido para ${nombrePais(cod)}.` : '');
        const validar = (n) => {
          const x = el(n).value.trim(), t = n === 'correo' ? errCorreo(x) : errTel(x, el('telcod') ? el('telcod').value : '');
          el(n).classList.toggle('error', !!t);
          const m = $(`[data-msg=${n}]`, caja); m.textContent = t; m.hidden = !t;
          return t;
        };
        el('correo').addEventListener('blur', () => validar('correo'));
        el('tel').addEventListener('blur', () => validar('tel'));
        if (el('telcod')) el('telcod').addEventListener('change', () => {
          $('[data-telcod]', caja).textContent = '+' + lib.getCountryCallingCode(el('telcod').value);
          if (el('tel').value.trim()) validar('tel');
        });
        $('[data-tipo]', caja).addEventListener('click', (e) => { const b = e.target.closest('[data-t]'); if (!b) return; tipo = b.dataset.t; $$('[data-t]', caja).forEach((x) => x.classList.toggle('on', x === b)); });
        /* País, departamento y municipio: la opción elegida se muestra completa; si no cabe, pasa a otra línea */
        const verOpciones = () => $$('.sel-ajuste', caja).forEach((x) => { const s = $('select', x), o = s.options[s.selectedIndex]; $('.sel-txt', x).textContent = o ? o.text : ''; });
        el('pais').addEventListener('change', () => {
          const gt = el('pais').value === 'GT';
          $$('[data-gt]', caja).forEach((x) => { x.hidden = !gt; });
          if (!gt) { el('depto').value = ''; el('muni').innerHTML = '<option value="">Elija primero el departamento</option>'; }
          verOpciones();
        });
        el('depto').addEventListener('change', () => {
          const d = GUATEMALA[el('depto').value];
          el('muni').innerHTML = d ? `<option value="">Elija el municipio</option>${d[1].map((m) => `<option>${esc(m)}</option>`).join('')}` : '<option value="">Elija primero el departamento</option>';
          verOpciones();
        });
        el('muni').addEventListener('change', verOpciones);
        verOpciones();
        $('[data-enviar]', caja).addEventListener('click', () => {
          const v = (n) => (el(n) ? el(n).value.trim() : '');
          const errores = [];
          $$('.inp,.txa,.sel', caja).forEach((x) => x.classList.remove('error'));
          const mal = (n, t) => { errores.push(t); el(n).classList.add('error'); };
          if (v('nombre').length < 2) mal('nombre', 'Indique su nombre.');
          if (validar('correo')) mal('correo', errCorreo(v('correo')));
          if (validar('tel')) mal('tel', errTel(v('tel'), v('telcod')));
          if (!v('pais')) mal('pais', 'Elija el país.');
          else if (v('pais') === 'GT') {
            if (!v('depto')) mal('depto', 'Elija el departamento.');
            if (!v('muni')) mal('muni', 'Elija el municipio.');
          }
          if (!v('sede')) mal('sede', 'Elija la sede.');
          if (v('mensaje').length < 5) mal('mensaje', 'Escriba su mensaje.');
          if (errores.length) { $('[data-err]', caja).innerHTML = `<div class="aviso aviso-r">${ico('alerta')}<div>${errores.join(' ')}</div></div>`; return; }
          const gt = v('pais') === 'GT', d = gt ? GUATEMALA[v('depto')] : null;
          const folio = 'SOL-' + new Date().getFullYear() + '-' + pad(++S.corr.sol, 4);
          const s = { id: folio, tipo, nombre: v('nombre'), empresa: v('empresa'), correo: v('correo'), telCod: v('tel') && lib ? '+' + lib.getCountryCallingCode(v('telcod')) : '', tel: v('tel'),
            pais: v('pais'), depto: d ? d[0] : '', muni: d ? v('muni') : '', sede: v('sede'), mensaje: v('mensaje'), fecha: hoyISO(), leida: false, estado: '', resp: null, comentario: '' };
          S.sitio.solicitudes.unshift(s);
          guardar();
          caja.innerHTML = `<div class="exito"><div class="ok">${ico('check')}</div><h2 style="font-size:26px">Solicitud recibida</h2>
            <p class="muted" style="margin-top:10px;font-size:16.5px">Gracias, ${esc(s.nombre)}. Su ${tipo} quedó registrada con el número <b class="mono" style="color:var(--g900)">${folio}</b> y fue enviada a la sede de ${SEDES[s.sede]}.</p>
            <p class="muted" style="margin-top:8px;font-size:14px">En la simulación, la solicitud aparece en la bandeja del panel del sitio.</p>
            <button class="btn btn-s" style="margin-top:22px" data-otra>Enviar otro mensaje</button></div>`;
          $('[data-otra]', caja).addEventListener('click', form);
        });
      };
      form();
    } };
  }

  /* ------------------------------------------------------------ acceso */
  const CUENTAS = {
    sitio: [['ejemplo.01', 'Gerencia'], ['ejemplo.02', 'Soporte'], ['ejemplo.08', 'Administrativo'], ['ejemplo.09', 'Operativo'], ['ejemplo.10', 'Vista general']],
    picking: [['ejemplo.01', 'Gerencia'], ['ejemplo.02', 'Soporte'], ['ejemplo.03', 'Facturador · Xela'], ['ejemplo.05', 'Bodega · Xela'], ['ejemplo.06', 'Piloto · Xela'], ['ejemplo.07', 'Piloto · Xela']],
  };
  function destinoInicial(sis, u) {
    if (sis === 'sitio') { const s = Panel.primera(u); return s ? '#/panel' + (s.id ? '/' + s.id : '') : '#/panel/documentos'; }
    const m = MODULOS_P.find((x) => accesoModulo(u, x.id));
    return '#/picking/' + (m ? m.id : 'facturacion');
  }
  function acceso() {
    return { titulo: 'Acceso personal', html: `<div class="acc-lay">
      <aside class="acc-marca"><div class="foto" style="background-image:url(${A.fotoEquipo})"></div><div class="velo"></div>
        <a href="#/"><img src="${A.logoBlanco}" alt="INCOVSA Químicos" style="height:52px;width:auto"></a>
        <h1>Tres accesos, tres inicios de sesión</h1>
        <p>Cada sistema tiene su propio inicio de sesión. Lo que ve y hace cada persona depende de sus permisos.</p>
        <div class="nota"><b style="color:#fff">Gerencia y Soporte usan la misma cuenta en los dos sistemas.</b> Las demás personas tienen una cuenta para cada sistema.</div>
      </aside>
      <section class="acc-form">
        <a href="#/" class="enlace" style="display:inline-flex;gap:6px;align-items:center;margin-bottom:26px">${ico('atras', 'ico-s')} Volver al sitio</a>
        <p class="eyebrow">Acceso para personal</p><h2 style="font-size:32px;margin:10px 0 26px">¿A dónde desea ingresar?</h2>
        <div style="display:flex;flex-direction:column;gap:12px">
          <button class="acc-op" data-odoo><span class="ic">${ico('externo', 'ico-l')}</span><div><h3>Odoo</h3><p>El ERP con el que la empresa ya trabaja. Solo es un enlace; no hay intercambio de datos.</p></div>${ico('flecha')}</button>
          <a class="acc-op" href="#/acceso/sitio"><span class="ic">${ico('globo', 'ico-l')}</span><div><h3>Administración del sitio</h3><p>Contenido publicado y documentación interna de productos.</p></div>${ico('flecha')}</a>
          <a class="acc-op" href="#/acceso/picking"><span class="ic">${ico('bodega', 'ico-l')}</span><div><h3>Sistema de picking</h3><p>Facturación, bodega, ruta, reportes y configuración.</p></div>${ico('flecha')}</a>
        </div>
      </section></div>`,
    mount(root) {
      $('[data-odoo]', root).addEventListener('click', () => modal({ titulo: 'Iniciar sesión en Odoo', cuerpo: `<p class="muted" style="font-size:15.5px">Este botón abre el inicio de sesión de Odoo en otra pestaña, fuera del sitio. No hay intercambio de datos con Odoo.</p><div style="margin-top:16px">${pend('P-06', 'Falta la dirección exacta del inicio de sesión de Odoo para conectar este botón.')}</div>`, acciones: [{ txt: 'Entendido', cls: 'btn-p' }] }));
    } };
  }
  function login(sis, q) {
    const titulo = sis === 'picking' ? 'Sistema de picking' : 'Administración del sitio';
    return { titulo, html: `<div class="acc-lay">
      <aside class="acc-marca"><div class="foto" style="background-image:url(${sis === 'picking' ? A.fotoEquipo : A.fotoReunion})"></div><div class="velo"></div>
        <a href="#/"><img src="${A.logoBlanco}" alt="INCOVSA Químicos" style="height:52px;width:auto"></a>
        <h1>${titulo}</h1>
        <p>${sis === 'picking' ? 'Control logístico de bodega: del pedido facturado a la entrega.' : 'Contenido del sitio público y documentación interna de productos.'}</p>
        <div class="nota"><b style="color:#fff;display:block;margin-bottom:8px">Roles de este sistema</b>
          <div style="padding:4px 0"><b style="color:var(--lima-b)">Gerencia</b>: acceso total a los dos sistemas.</div>
          <div style="padding:4px 0"><b style="color:var(--lima-b)">Soporte</b>: el mismo acceso, para mantenimiento.</div>
          <div style="padding:4px 0">Los demás usuarios entran según los permisos que les asignan Gerencia o Soporte.</div></div>
      </aside>
      <section class="acc-form"><div style="max-width:440px;width:100%">
        <a href="#/acceso" class="enlace" style="display:inline-flex;gap:6px;align-items:center;margin-bottom:26px">${ico('atras', 'ico-s')} Elegir otro acceso</a>
        <p class="eyebrow">Inicio de sesión</p><h2 style="font-size:32px;margin:10px 0 8px">${titulo}</h2>
        <p class="muted">Use el usuario que le asignaron Gerencia o Soporte.${sis === 'picking' ? ' No hay selector de sede: sale de su cuenta.' : ''}</p>
        <form data-login style="margin-top:24px" class="rejilla" autocomplete="off">
          <label class="campo"><span>Usuario</span><input class="inp" name="u" placeholder="nombre.apellido" autocapitalize="off"></label>
          <label class="campo"><span>Contraseña</span><div style="position:relative"><input class="inp" name="c" type="password" placeholder="Su contraseña" style="padding-right:48px"><button type="button" class="btn btn-g btn-ico" data-ojo style="position:absolute;right:4px;top:4px" aria-label="Mostrar contraseña">${ico('ojo', 'ico-s')}</button></div></label>
          <div data-err></div>
          <button class="btn btn-p btn-lg" type="submit">Ingresar ${ico('flecha')}</button>
          <button type="button" class="enlace" data-olvido style="justify-self:start">¿Olvidó su contraseña?</button>
        </form>
        <div class="cuentas-demo"><span class="etq">Cuentas de la demostración · contraseña <span class="mono">demo</span></span>
          <div class="lista">${CUENTAS[sis].map(([u, r]) => `<button type="button" data-cuenta="${u}"><b>${u}</b>${r}</button>`).join('')}</div></div>
      </div></section></div>`,
    mount(root) {
      const f = $('[data-login]', root);
      $$('[data-cuenta]', root).forEach((b) => b.addEventListener('click', () => { f.u.value = b.dataset.cuenta; f.c.value = 'demo'; f.c.focus(); }));
      $('[data-ojo]', root).addEventListener('click', () => { f.c.type = f.c.type === 'password' ? 'text' : 'password'; });
      $('[data-olvido]', root).addEventListener('click', () => modal({ titulo: '¿Olvidó su contraseña?', cuerpo: '<p class="muted" style="font-size:15.5px">Pídale a Gerencia o a Soporte que la restablezcan.</p>', acciones: [{ txt: 'Entendido', cls: 'btn-p' }] }));
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = S.usuarios.find((x) => x.usuario.toLowerCase() === f.u.value.trim().toLowerCase());
        const delSistema = u && enSistema(u, sis);
        if (!u || !delSistema || !u.activo || u.clave !== f.c.value) {
          $('[data-err]', root).innerHTML = `<div class="aviso aviso-r">${ico('alerta')}<div>Usuario o contraseña incorrectos${u && !delSistema ? '. Esta cuenta no es de este sistema (RN-18)' : ''}.</div></div>`;
          return;
        }
        iniciarSesion(sis, u.id);
        location.hash = q.get('volver') || destinoInicial(sis, u);
      });
    } };
  }
  function noEncontrada() {
    return { titulo: 'No encontrada', mount: montarBase, html: pagina('', `<section class="sec"><div class="wrap tarjeta vacio" style="padding:80px 20px">${ico('buscar')}<h4>Esta página no existe</h4><p><a href="#/">Volver al inicio</a></p></div></section>`) };
  }
  return { inicio, nosotros, industrias, catalogo, producto, noticias, contacto, acceso, login, noEncontrada, destinoInicial, CUENTAS };
})();
