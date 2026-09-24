# -*- coding: utf-8 -*-
"""Genera las capturas de los prototipos que se incluyen en el Documento 1.

Qué hace, en orden:

1. Copia los .dc.html a una carpeta de trabajo (`_trabajo/`) y convierte las
   etiquetas <sc-if> y <sc-for> en <template>. Es necesario porque el
   analizador de HTML saca del <tbody> cualquier etiqueta que no conozca, y
   entonces las filas de las tablas se pierden.
2. Renderiza cada pantalla con Chrome en modo headless. La carpeta de trabajo
   incluye `support.js`, un sustituto mínimo del runtime original de los
   prototipos: aplica los valores por omisión de las propiedades, resuelve las
   condiciones y los ciclos, y sustituye las expresiones {{...}}.
3. Verifica que no queden marcadores de plantilla sin resolver, recorta el
   espacio sobrante al pie y guarda el PNG en `figuras/prototipos/`.

Uso, desde esta carpeta:  python capturar_prototipos.py
Requisitos: Python con Pillow y Google Chrome instalado.
"""
import json, os, re, shutil, subprocess, unicodedata
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
PROTO = os.path.dirname(AQUI)                                   # entregable-1/prototipos
SALIDA = os.path.join(os.path.dirname(PROTO), "figuras", "prototipos")
TRABAJO = os.path.join(AQUI, "_trabajo")
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
HOLGURA = 1200        # alto extra de ventana, para no cortar contenido
MARGEN_FINAL = 24     # pixeles de respiro bajo el último contenido

RE_IF = re.compile(r'<sc-if\s+value="\{\{([^}]*)\}\}"[^>]*>')
RE_FOR = re.compile(r'<sc-for\s+list="\{\{([^}]*)\}\}"\s+as="([^"]+)"[^>]*>')


def preparar():
    os.makedirs(TRABAJO, exist_ok=True)
    shutil.copy(os.path.join(AQUI, "support.js"), TRABAJO)
    shutil.copy(os.path.join(PROTO, "canvas.json"), TRABAJO)
    for nombre in os.listdir(PROTO):
        if not nombre.endswith(".dc.html"):
            continue
        s = open(os.path.join(PROTO, nombre), encoding="utf-8").read()
        s = RE_IF.sub(lambda m: f'<template data-sc-if="{m.group(1).strip()}">', s)
        s = RE_FOR.sub(lambda m: f'<template data-sc-for="{m.group(1).strip()}" data-as="{m.group(2)}">', s)
        s = s.replace("</sc-if>", "</template>").replace("</sc-for>", "</template>")
        open(os.path.join(TRABAJO, nombre), "w", encoding="utf-8").write(s)


def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()


def chrome(args, url):
    return subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                           "--no-sandbox", f"--user-data-dir={os.path.join(TRABAJO, 'perfil')}",
                           "--force-device-scale-factor=1", "--virtual-time-budget=9000"] + args + [url],
                          capture_output=True, text=True, encoding="utf-8", errors="replace")


def recortar(ruta):
    im = Image.open(ruta).convert("RGB")
    w, h = im.size
    px = im.load()

    def uniforme(y):
        c = px[0, y]
        return all(px[x, y] == c for x in range(0, w, 5))

    y = h - 1
    while y > 0 and uniforme(y):
        y -= 1
    corte = min(h, y + 1 + MARGEN_FINAL)
    im.crop((0, 0, w, corte)).save(ruta, "PNG", optimize=True)
    return corte, h - corte


def main():
    preparar()
    os.makedirs(SALIDA, exist_ok=True)
    canvas = json.load(open(os.path.join(TRABAJO, "canvas.json"), encoding="utf-8"))
    print(f"{'#':>3} {'pantalla':34s} {'tamaño':14s} {'sobrante':>8s}  revisión")
    for i, a in enumerate(canvas["artboards"], start=9):
        url = "file:///" + os.path.join(TRABAJO, a["file"]).replace("\\", "/")
        destino = os.path.join(SALIDA, f"figura-{i:02d}-{slug(a['title'])}.png")
        alto = a["h"] + HOLGURA

        dom = chrome(["--dump-dom", f"--window-size={a['w']},{alto}"], url).stdout or ""
        pendientes = len(re.findall(r"\{\{[^}]*\}\}", dom))
        etiquetas = len(re.findall(r"<sc-(?:if|for)|data-sc-(?:if|for)", dom))
        listo = "data-dc-listo" in dom

        chrome([f"--window-size={a['w']},{alto}", f"--screenshot={destino}"], url)
        if not os.path.exists(destino):
            print(f"{i:3d} {a['title'][:34]:34s} FALLÓ la captura")
            continue
        alto_final, sobrante = recortar(destino)

        avisos = []
        if not listo: avisos.append("no renderizó")
        if pendientes: avisos.append(f"{pendientes} marcadores sin resolver")
        if etiquetas: avisos.append(f"{etiquetas} etiquetas sin resolver")
        if sobrante < 200: avisos.append("pudo cortarse")
        print(f"{i:3d} {a['title'][:34]:34s} {a['w']}x{alto_final:<9d} {sobrante:>8d}  "
              f"{'; '.join(avisos) if avisos else 'ok'}")
    shutil.rmtree(TRABAJO, ignore_errors=True)


if __name__ == "__main__":
    main()
