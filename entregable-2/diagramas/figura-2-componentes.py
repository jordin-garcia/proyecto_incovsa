# -*- coding: utf-8 -*-
"""Figura 2 del Documento 2. Diagrama de componentes (12/10/2026, specs/16).

Componentes de software y sus dependencias principales (línea discontinua con punta
abierta = «depende de», notación UML). La tabla de componentes del Documento 2 lista
todas las dependencias.
Uso: python figura-2-componentes.py ../figuras/figura-2-componentes.png
"""
import os
import sys
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(AQUI, "..", "..", "entregable-1", "diagramas"))
from uml import Canvas, cylinder

W, H = 2420, 1660
BS, CS, NS = 29, 34, 26
cv = Canvas(W, H)
BW, GAP, X0 = 262, 26, 80          # ancho de cada componente, separación, margen


def comp(x1, y1, x2, y2, nombre, detalle="", size=BS):
    """Componente UML: caja con el icono de componente en la esquina."""
    cv.rect(x1, y1, x2, y2, w=2.4, radius=6)
    ix, iy = x2 - 34, y1 + 12
    cv.rect(ix, iy, ix + 22, iy + 28, w=1.8)
    cv.rect(ix - 6, iy + 6, ix + 6, iy + 11, w=1.6, fill=(255, 255, 255))
    cv.rect(ix - 6, iy + 17, ix + 6, iy + 22, w=1.6, fill=(255, 255, 255))
    texto = nombre if not detalle else nombre + "\n" + detalle
    cv.text((x1 + x2) / 2, (y1 + y2) / 2 + 6, texto, size=size, anchor="mm")
    return {"t": ((x1 + x2) / 2, y1), "b": ((x1 + x2) / 2, y2), "l": (x1, (y1 + y2) / 2),
            "r": (x2, (y1 + y2) / 2), "x1": x1, "x2": x2, "y1": y1, "y2": y2, "cx": (x1 + x2) / 2,
            "cy": (y1 + y2) / 2}


def col(i):
    x = X0 + i * (BW + GAP)
    return x, x + BW


def contenedor(x1, y1, x2, y2, titulo, abajo=False):
    cv.rect(x1, y1, x2, y2, w=2.6)
    if abajo:
        cv.text(x1 + 22, y2 - 30, titulo, size=CS, anchor="lm")
    else:
        cv.text(x1 + 22, y1 + 16, titulo, size=CS, anchor="la")


def dep(*pts):
    cv.dashed_path(list(pts), open_head=True)


# ---------------- Interfaz (src/app) ----------------
contenedor(40, 30, W - 40, 290, "Interfaz: rutas y pantallas (src/app)")
UI = {}
for i, (k, n, d) in enumerate([("sitio", "Sitio", "público"), ("panel", "Panel del", "sitio (CMS)"),
                               ("doc", "Documentación", "interna"), ("conf", "Configuración", ""),
                               ("fact", "Facturación", ""), ("ruta", "Ruta", ""),
                               ("bod", "Bodega y", "tablero"), ("rep", "Reportes", "")]):
    x1, x2 = col(i)
    UI[k] = comp(x1, 100, x2, 250, n, d)

# ---------------- Módulos de dominio (src/modulos) ----------------
contenedor(40, 360, W - 40, 960, "Módulos de dominio: lógica de negocio (src/modulos)", abajo=True)
M = {}
for i, (k, d) in enumerate([("contenido", "institucional,\nindustrias, catálogo\ny noticias"),
                            ("solicitudes", "de contacto"), ("documentos", "FT, HS y COA"),
                            ("catalogos", "productos, clientes,\nsectores, camiones"),
                            ("odoo", "lectura del\narchivo .xlsx"), ("ruta", "rutas y\nentregas"),
                            ("bodega", "preparación\ny despacho"), ("reportes", "despacho, rutas\ny bitácora")]):
    x1, x2 = col(i)
    M[k] = comp(x1, 440, x2, 620, k, d, size=26)
x1, _ = col(4)
_, x2 = col(6)
M["pedidos"] = comp(x1 + 30, 740, x2 - 30, 880, "pedidos", "tablero de pedidos facturados, opciones de envío\ny envío a bodega", size=27)
x1, x2 = col(7)
M["conversion"] = comp(x1, 740, x2, 880, "conversion", "RN-01, en\ngramos enteros", size=27)

# ---------------- Servicios transversales ----------------
contenedor(40, 1060, 1500, 1330, "Servicios transversales")
T = {}
for i, (k, d) in enumerate([("autenticacion", "Better Auth"), ("permisos", "exigirPermiso()"),
                            ("usuarios", "cuentas, permisos\ny sedes"), ("bitacora", "RN-39"),
                            ("tiempo real", "avisos SSE")]):
    x1 = 70 + i * 284
    T[k] = comp(x1, 1130, x1 + 262, 1290, k, d, size=26)

# ---------------- Librerías y servicios externos ----------------
contenedor(1560, 1060, W - 40, 1620, "Librerías y servicios externos")
LIB = comp(1600, 1130, 2340, 1240, "SheetJS 0.20.3", "lee el archivo .xlsx de Odoo", size=27)
ALM = comp(1600, 1270, 2340, 1400, "Almacenamiento", "Cloudflare R2 y PDF del servidor", size=27)
COR = comp(1600, 1430, 2340, 1580, "Correo", "SMTP de la empresa", size=27)

# ---------------- Datos ----------------
DAT = comp(80, 1440, 900, 1580, "Acceso a datos", "Prisma 7 y migraciones")
cylinder(cv, 1220, 1510, 380, 140, "PostgreSQL 18", size=BS)

# ---------------- dependencias: interfaz -> dominio ----------------
dep(UI["sitio"]["b"], M["contenido"]["t"])
dep((UI["sitio"]["cx"] + 80, 250), (UI["sitio"]["cx"] + 80, 330), (M["solicitudes"]["cx"] - 80, 330), (M["solicitudes"]["cx"] - 80, 440))
dep((UI["panel"]["cx"] - 80, 250), (UI["panel"]["cx"] - 80, 310), (M["contenido"]["cx"] + 80, 310), (M["contenido"]["cx"] + 80, 440))
dep(UI["panel"]["b"], M["solicitudes"]["t"])
dep(UI["doc"]["b"], M["documentos"]["t"])
dep(UI["conf"]["b"], M["catalogos"]["t"])
dep(UI["fact"]["b"], M["odoo"]["t"])
dep(UI["bod"]["b"], M["bodega"]["t"])
dep(UI["ruta"]["b"], M["ruta"]["t"])
dep(UI["rep"]["b"], M["reportes"]["t"])

# ---------------- dependencias entre módulos de dominio ----------------
dep(M["odoo"]["l"], M["catalogos"]["r"])                                                   # odoo -> catalogos
dep((M["odoo"]["cx"], 620), (M["odoo"]["cx"], 740))                                         # odoo -> pedidos
dep((M["ruta"]["cx"], 620), (M["ruta"]["cx"], 740))                                         # ruta -> pedidos
dep((M["bodega"]["cx"] - 40, 620), (M["bodega"]["cx"] - 40, 740))                           # bodega -> pedidos
dep((M["bodega"]["x2"] - 40, 620), (M["bodega"]["x2"] - 40, 690), (M["conversion"]["x1"] + 50, 690),
    (M["conversion"]["x1"] + 50, 740))                                                      # bodega -> conversion
dep((M["reportes"]["cx"] + 40, 620), (M["reportes"]["cx"] + 40, 740))                       # reportes -> conversion
dep((M["pedidos"]["x1"], 840), (M["catalogos"]["cx"], 840), (M["catalogos"]["cx"], 620))    # pedidos -> catalogos

# ---------------- dependencias hacia abajo ----------------
dep((750, 960), (750, 1060))
cv.text(770, 1010, "todos los módulos de dominio", size=NS, anchor="lm")
dep((1960, 960), (1960, 1060))
cv.text(1940, 1010, "odoo, contenido, documentos y solicitudes", size=NS, anchor="rm")
dep((490, 1330), (490, 1440))
cv.text(510, 1385, "módulos de dominio y transversales", size=NS, anchor="lm")
dep(DAT["r"], (1030, 1510))
cv.text(W - 70, 920, "Sin módulo de inventario: lo lleva Odoo (RN-40)", size=NS, anchor="rm")

print(cv.save(sys.argv[1] if len(sys.argv) > 1 else "figura-2.png"))
