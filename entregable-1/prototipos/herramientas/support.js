/* Runtime de los prototipos .dc.html del proyecto INCOVSA.
   Sustituye al support.js original, que no vino con los archivos.

   Siempre: resuelve las propiedades, los condicionales, los ciclos y las
   expresiones {{...}}, enlaza los manejadores de eventos y vuelve a dibujar
   la pantalla cuando el componente cambia su estado.

   Solo cuando la pantalla corre dentro del prototipo navegable (es decir,
   dentro de un marco): además conecta los enlaces con las demás pantallas,
   agrega Noticias al menú del sitio y el cierre de sesión en las pantallas
   internas. Abriendo el .dc.html por su cuenta, nada de eso se activa y la
   pantalla se ve tal como fue diseñada. */
(function () {
  const enApp = window.parent !== window;

  class DCLogic {
    constructor(props) { this.props = props || {}; this.state = {}; }
    setState(s) {
      Object.assign(this.state, s);
      if (typeof window.__dcDibujar === 'function') window.__dcDibujar();
    }
  }
  window.DCLogic = DCLogic;

  // ---------------------------------------------------------------- plantillas
  function resolver(expr, scope) {
    const t = String(expr).trim();
    if (t === 'true') return true;
    if (t === 'false') return false;
    if (t === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
    if (/^'[^']*'$/.test(t) || /^"[^"]*"$/.test(t)) return t.slice(1, -1);
    let cur = scope;
    for (const parte of t.split('.')) {
      if (cur === null || cur === undefined) return undefined;
      cur = cur[parte];
    }
    return cur;
  }

  function aTexto(v) {
    if (v === undefined || v === null || typeof v === 'function') return '';
    if (typeof v === 'boolean') return v ? 'true' : '';
    return String(v);
  }

  const interpolar = (texto, scope) =>
    texto.replace(/\{\{([^}]*)\}\}/g, (_, e) => aTexto(resolver(e, scope)));

  function procesarLista(nodos, scope) {
    const salida = [];
    for (const n of nodos) salida.push(...procesar(n, scope));
    return salida;
  }

  function procesar(n, scope) {
    if (n.nodeType === Node.TEXT_NODE) {
      if (n.nodeValue.includes('{{')) n.nodeValue = interpolar(n.nodeValue, scope);
      return [n];
    }
    if (n.nodeType !== Node.ELEMENT_NODE) return [n];

    const tag = n.tagName.toLowerCase();

    if (tag === 'template' && n.hasAttribute('data-sc-if')) {
      if (!resolver(n.getAttribute('data-sc-if'), scope)) return [];
      return procesarLista(Array.from(document.importNode(n.content, true).childNodes), scope);
    }

    if (tag === 'template' && n.hasAttribute('data-sc-for')) {
      const lista = resolver(n.getAttribute('data-sc-for'), scope);
      const alias = n.getAttribute('data-as') || 'item';
      if (!Array.isArray(lista)) return [];
      const salida = [];
      lista.forEach((item, idx) => {
        const s2 = Object.create(scope);
        s2[alias] = item;
        s2[alias + 'Index'] = idx;
        salida.push(...procesarLista(Array.from(document.importNode(n.content, true).childNodes), s2));
      });
      return salida;
    }

    for (const at of Array.from(n.attributes)) {
      if (!at.value.includes('{{')) continue;
      const solo = at.value.trim().match(/^\{\{([^}]*)\}\}$/);
      if (!solo) { n.setAttribute(at.name, interpolar(at.value, scope)); continue; }
      const v = resolver(solo[1], scope);
      if (typeof v === 'function') {
        n.removeAttribute(at.name);
        if (/^on/i.test(at.name)) n.addEventListener(at.name.slice(2).toLowerCase(), v);
        continue;
      }
      if (v === undefined || v === null) { n.removeAttribute(at.name); continue; }
      if (typeof v === 'boolean') { v ? n.setAttribute(at.name, '') : n.removeAttribute(at.name); continue; }
      n.setAttribute(at.name, String(v));
      if (at.name === 'value' && (tag === 'input' || tag === 'textarea')) n.value = String(v);
    }

    n.replaceChildren(...procesarLista(Array.from(n.childNodes), scope));
    // un <select> muestra la opción de su value="{{...}}"; si no lo tiene, la
    // marcada con selected o la primera, como en la aplicación real
    if (tag === 'select') {
      if (n.hasAttribute('value')) n.value = n.getAttribute('value');
      else {
        const i = Array.from(n.options).findIndex(o => o.hasAttribute('selected'));
        n.selectedIndex = i >= 0 ? i : 0;
      }
    }
    return [n];
  }

  // ------------------------------------------------------------------ el foco
  function rutaDelFoco(raiz) {
    const el = document.activeElement;
    if (!el || el === document.body || !raiz.contains(el)) return null;
    const ruta = [];
    let cur = el;
    while (cur && cur !== raiz) {
      ruta.unshift(Array.prototype.indexOf.call(cur.parentNode.childNodes, cur));
      cur = cur.parentNode;
    }
    const datos = { ruta };
    if ('selectionStart' in el) {
      try { datos.ini = el.selectionStart; datos.fin = el.selectionEnd; } catch (e) {}
    }
    return datos;
  }

  function restaurarFoco(raiz, datos) {
    if (!datos) return;
    let cur = raiz;
    for (const i of datos.ruta) {
      if (!cur || !cur.childNodes[i]) return;
      cur = cur.childNodes[i];
    }
    if (cur && cur.focus) {
      cur.focus();
      if (datos.ini !== undefined && 'setSelectionRange' in cur) {
        try { cur.setSelectionRange(datos.ini, datos.fin); } catch (e) {}
      }
    }
  }

  // ------------------------------------------------- navegación entre pantallas
  const DESTINOS = {
    'inicio': 'Main.dc.html',
    'incovsa quimicos': 'Main.dc.html',
    'volver al sitio': 'Main.dc.html',
    'quienes somos': 'QuienesSomos.dc.html',
    'industrias': 'Industrias.dc.html',
    'ver las nueve': 'Industrias.dc.html',
    'ver las nueve industrias': 'Industrias.dc.html',
    'cuero': 'Industrias.dc.html',
    'textil': 'Industrias.dc.html',
    'cereria': 'Industrias.dc.html',
    'hulera': 'Industrias.dc.html',
    'productos': 'Catalogo.dc.html',
    'ver catalogo': 'Catalogo.dc.html',
    'ver catalogo de productos': 'Catalogo.dc.html',
    'ver catalogo completo': 'Catalogo.dc.html',
    'ver productos relacionados': 'Catalogo.dc.html',
    'noticias': 'Noticias.dc.html',
    'contacto': 'Contacto.dc.html',
    'hablar con un asesor': 'Contacto.dc.html',
    'contactar a un asesor': 'Contacto.dc.html',
    'solicitar informacion': 'Contacto.dc.html',
    'enviar una solicitud': 'Contacto.dc.html',
    'quetzaltenango': 'Contacto.dc.html',
    'guatemala': 'Contacto.dc.html',
    'escuintla': 'Contacto.dc.html',
    'acceso personal': 'Ingreso.dc.html',
    'incovsa administracion del sitio': 'PanelAdmin.dc.html',
    'panel del sitio': 'PanelAdmin.dc.html',
    'documentacion': 'Documentacion.dc.html',
    'incovsa control logistico de bodega': 'Facturacion.dc.html',
    'facturacion': 'Facturacion.dc.html',
    'bodega': 'Bodega.dc.html',
    'ruta': 'Ruta.dc.html',
    'inventario': 'Inventario.dc.html',
    'reportes': 'Reportes.dc.html',
    'configuracion': 'Configuracion.dc.html'
  };

  const normalizar = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/\s+/g, ' ').trim();

  const irA = (archivo) => parent.postMessage({ dc: 'ir', archivo: archivo }, '*');

  function conectarEnlaces() {
    document.addEventListener('click', function (e) {
      const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      const href = a.getAttribute('href') || '';

      if (/\.dc\.html$/i.test(href)) {
        e.preventDefault();
        irA(href.split('/').pop());
        return;
      }
      if (href !== '#' && href !== '') return;
      e.preventDefault();

      if (a.classList.contains('card')) {      // tarjeta del catálogo
        irA('Producto.dc.html');
        return;
      }
      const texto = normalizar(a.textContent || '');
      if (texto.length <= 40 && DESTINOS[texto]) irA(DESTINOS[texto]);
    }, true);
  }

  // Noticias forma parte del sitio, pero solo su propia pantalla la trae en el menú
  function completarMenu() {
    const menu = document.querySelector('nav.menu');
    if (!menu) return;
    const enlaces = Array.from(menu.querySelectorAll('a'));
    if (enlaces.some(a => normalizar(a.textContent) === 'noticias')) return;
    const contacto = enlaces.find(a => normalizar(a.textContent) === 'contacto');
    if (!contacto) return;
    const nuevo = document.createElement('a');
    nuevo.href = '#';
    nuevo.textContent = 'Noticias';
    menu.insertBefore(nuevo, contacto);
  }

  // Las pantallas internas no traen forma de salir: se agrega en el bloque del usuario
  function montarCierreSesion() {
    const avatar = document.querySelector('.avatar');
    if (!avatar || !avatar.parentElement) return;
    const bloque = avatar.parentElement;
    if (bloque.dataset.dcSalida) return;
    bloque.dataset.dcSalida = '1';
    bloque.style.position = 'relative';
    bloque.style.cursor = 'pointer';
    bloque.setAttribute('title', 'Cerrar sesión');

    const menu = document.createElement('div');
    menu.style.cssText = 'position:absolute;top:calc(100% + 10px);right:0;display:none;' +
      'background:#fff;border:1px solid #DFDACE;border-radius:8px;padding:6px;' +
      'box-shadow:0 14px 30px -18px rgba(0,0,0,.5);z-index:50;min-width:170px';
    const salir = document.createElement('button');
    salir.textContent = 'Cerrar sesión';
    salir.style.cssText = 'width:100%;text-align:left;background:none;border:0;cursor:pointer;' +
      'font:500 14px/1 Archivo,Helvetica,sans-serif;color:#1A1A17;padding:9px 10px;border-radius:6px';
    salir.addEventListener('mouseenter', () => { salir.style.background = '#F6F4EF'; });
    salir.addEventListener('mouseleave', () => { salir.style.background = 'none'; });
    salir.addEventListener('click', (e) => { e.stopPropagation(); irA('Ingreso.dc.html'); });
    menu.appendChild(salir);
    bloque.appendChild(menu);

    bloque.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    });
    document.addEventListener('click', () => { menu.style.display = 'none'; });
  }

  // ------------------------------------------------------------------ arranque
  let raiz, plantilla, comp, props;

  function dibujar() {
    const foco = rutaDelFoco(raiz);
    const vals = typeof comp.renderVals === 'function' ? comp.renderVals() : {};
    const scope = Object.assign(Object.create(null), props, vals);
    const copia = plantilla.cloneNode(true);
    raiz.replaceChildren(...procesarLista(Array.from(copia.childNodes), scope));
    restaurarFoco(raiz, foco);
    if (enApp) { completarMenu(); montarCierreSesion(); }
  }

  function arrancar() {
    raiz = document.querySelector('x-dc');
    const sc = document.querySelector('script[data-dc-script]');
    if (!raiz || !sc) return;

    props = {};
    try {
      const def = JSON.parse(sc.dataset.props || '{}');
      for (const [k, v] of Object.entries(def)) {
        if (k === '$preview') continue;
        props[k] = v && typeof v === 'object' ? v.default : v;
      }
    } catch (e) { console.warn('propiedades no legibles', e); }

    try {
      const Componente = new Function(sc.textContent + '\nreturn Component;')();
      comp = new Componente(props);
    } catch (e) {
      console.error('no se pudo evaluar el componente', e);
      return;
    }

    if (enApp && typeof window.__dcAjuste === 'function') {
      try { window.__dcAjuste(comp, irA); } catch (e) { console.warn('ajuste no aplicado', e); }
    }

    plantilla = raiz.cloneNode(true);
    window.__dcDibujar = dibujar;
    dibujar();
    if (enApp) conectarEnlaces();
    document.documentElement.setAttribute('data-dc-listo', '1');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
