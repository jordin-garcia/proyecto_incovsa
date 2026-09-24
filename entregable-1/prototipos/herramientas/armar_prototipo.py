# -*- coding: utf-8 -*-
"""Arma el prototipo navegable: un solo archivo HTML que se comporta como la
aplicación terminada.

No lleva menús ni barras propias. Abre en la pantalla de inicio del sitio y la
navegación ocurre dentro de las pantallas, igual que en la aplicación real: el
menú del sitio, el catálogo, el ingreso de personal, los módulos del sistema de
picking y el cierre de sesión.

Uso, desde esta carpeta:  python armar_prototipo.py
"""
import json, io, os, re

AQUI = os.path.dirname(os.path.abspath(__file__))
PROTO = os.path.dirname(AQUI)                  # entregable-1/prototipos
RUNTIME = os.path.join(AQUI, "support.js")
SALIDA = os.path.join(PROTO, "prototipo-completo-incovsa.html")

INICIAL = "Main.dc.html"
FUERA = {"InicioMovil.dc.html"}                # la versión de teléfono se muestra aparte

RE_IF = re.compile(r'<sc-if\s+value="\{\{([^}]*)\}\}"[^>]*>')
RE_FOR = re.compile(r'<sc-for\s+list="\{\{([^}]*)\}\}"\s+as="([^"]+)"[^>]*>')

# Conductas que los diseños no traen y que la aplicación real sí tendría.
AJUSTES = {
    "Ingreso.dc.html": """
    window.__dcAjuste = function (comp, irA) {
      // Odoo todavía no tiene enlace: esa opción no hace nada
      var ir = comp.ir.bind(comp);
      comp.ir = function (destino) { if (destino !== 'odoo') ir(destino); };

      // Ingresar entra al sistema que se eligió. El picking abre en Inventario,
      // la vista de Soporte IT, que tiene los seis módulos en su menú
      var original = comp.renderVals.bind(comp);
      comp.renderVals = function () {
        var vals = original();
        var destino = comp.state.destino;
        vals.entrar = function () {
          irA(destino === 'picking' ? 'Inventario.dc.html' : 'PanelAdmin.dc.html');
        };
        return vals;
      };
    };
    """
}


def preparar(nombre):
    """Devuelve el documento completo de una pantalla, listo para el marco."""
    s = io.open(os.path.join(PROTO, nombre), encoding="utf-8").read()
    s = RE_IF.sub(lambda m: f'<template data-sc-if="{m.group(1).strip()}">', s)
    s = RE_FOR.sub(lambda m: f'<template data-sc-for="{m.group(1).strip()}" data-as="{m.group(2)}">', s)
    s = s.replace("</sc-if>", "</template>").replace("</sc-for>", "</template>")

    helmet = re.search(r"<helmet>(.*?)</helmet>", s, re.S)
    cuerpo = re.search(r"<x-dc>(.*?)</x-dc>", s, re.S)
    guion = re.search(r"(<script[^>]*data-dc-script[^>]*>.*?</script>)", s, re.S)
    if not (helmet and cuerpo and guion):
        raise SystemExit(f"{nombre}: no se reconoce la estructura")

    marcado = cuerpo.group(1).replace("<helmet>" + helmet.group(1) + "</helmet>", "")
    ajuste = AJUSTES.get(nombre, "")
    return (
        '<!doctype html><html lang="es"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1">'
        + helmet.group(1) +
        # el runtime va primero: define DCLogic antes de que se evalúe el guion
        # del componente, igual que hacía el support.js original
        "<script>" + RUNTIME_JS + "</script></head><body><x-dc>"
        + marcado +
        "</x-dc>" + guion.group(1) +
        ("<script>" + ajuste + "</script>" if ajuste else "") +
        "</body></html>"
    )


RUNTIME_JS = io.open(RUNTIME, encoding="utf-8").read()

canvas = json.load(open(os.path.join(PROTO, "canvas.json"), encoding="utf-8"))
pantallas = {}
for a in canvas["artboards"]:
    if a["file"] in FUERA:
        continue
    pantallas[a["file"]] = {"titulo": a["title"], "html": preparar(a["file"])}
    print(f"  {a['title'][:38]:38s} {len(pantallas[a['file']]['html'])//1024:3d} KB")

datos = json.dumps(pantallas, ensure_ascii=False).replace("</", "<\\/")

SHELL = """<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>INCOVSA Químicos</title>
<style>
  html,body{margin:0;height:100%;background:#F6F4EF;overflow:hidden}
  iframe{border:0;display:block;width:100vw;height:100vh}
</style>
</head>
<body>
<iframe id="app" title="INCOVSA"></iframe>
<script>
const PANTALLAS = __DATOS__;
const INICIAL = "__INICIAL__";
const app = document.getElementById('app');

const claveDe = (archivo) => archivo.replace('.dc.html', '').toLowerCase();
const archivoDe = (clave) => Object.keys(PANTALLAS).find(a => claveDe(a) === clave);

function ir(archivo, empujar) {
  const pantalla = PANTALLAS[archivo];
  if (!pantalla) return;
  document.title = pantalla.titulo + ' · INCOVSA';
  app.srcdoc = pantalla.html;
  if (empujar !== false) history.pushState({ archivo }, '', '#' + claveDe(archivo));
}

window.addEventListener('message', e => {
  if (e.data && e.data.dc === 'ir') ir(e.data.archivo, true);
});

window.addEventListener('popstate', e => {
  const archivo = (e.state && e.state.archivo) || archivoDe((location.hash || '').replace('#', '')) || INICIAL;
  ir(archivo, false);
});

const inicial = archivoDe((location.hash || '').replace('#', '')) || INICIAL;
history.replaceState({ archivo: inicial }, '', '#' + claveDe(inicial));
ir(inicial, false);
</script>
</body>
</html>
"""

html = SHELL.replace("__DATOS__", datos).replace("__INICIAL__", INICIAL)
io.open(SALIDA, "w", encoding="utf-8").write(html)
print(f"\n{len(pantallas)} pantallas · {os.path.getsize(SALIDA)//1024} KB\n{SALIDA}")
