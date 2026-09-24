# -*- coding: utf-8 -*-
"""Figura 5. Diagrama de arquitectura propuesta."""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from uml import Canvas, cylinder

W, H = 2100, 1560
BS, CS = 36, 40          # texto de bloques y de contenedores
cv = Canvas(W, H)


def caja(x1, y1, x2, y2, text, size=BS):
    cv.rect(x1, y1, x2, y2, w=2.4, radius=10)
    cv.text((x1 + x2) / 2, (y1 + y2) / 2, text, size=size, anchor="mm")
    return {"t": ((x1 + x2) / 2, y1), "b": ((x1 + x2) / 2, y2),
            "l": (x1, (y1 + y2) / 2), "r": (x2, (y1 + y2) / 2),
            "x1": x1, "y1": y1, "x2": x2, "y2": y2}


def contenedor(x1, y1, x2, y2, titulo):
    cv.rect(x1, y1, x2, y2, w=2.6)
    cv.text(x1 + 26, y1 + 20, titulo, size=CS, anchor="la")


# ---------------- Cliente ----------------
contenedor(380, 40, 1400, 300, "Cliente")
NAV = caja(430, 120, 850, 260, "Navegador en escritorio,\ntableta o teléfono")
TV = caja(930, 120, 1350, 260, "Pantalla de proyección\ndel módulo de Bodega")

# ---------------- Servidor de aplicación ----------------
contenedor(300, 390, 1460, 1230, "Servidor de aplicación")
PRE = caja(370, 470, 1390, 630,
           "Capa de presentación\nsitio público, panel administrativo, documentación interna\n"
           "y los seis módulos del sistema logístico")
AUT = caja(370, 690, 1390, 810, "Autenticación y control de acceso\npor rol y por sede")
LOG = caja(370, 870, 1390, 1030,
           "Capa de lógica de negocio\nconversión, existencias y movimientos, pedidos,\n"
           "preparación, ruta, contenido y reportes")
ORM = caja(800, 1090, 1390, 1200, "Capa de acceso a datos\ny migraciones")

# ---------------- Servicios externos ----------------
contenedor(1560, 640, 2060, 1380, "Servicios externos")
SMTP = caja(1600, 720, 2020, 860, "Servidor de\ncorreo saliente")
ODOO = caja(1600, 920, 2020, 1080, "ERP Odoo\nsolo enlace de acceso")
R2 = caja(1600, 1140, 2020, 1340, "Cloudflare R2\nimágenes del sitio")

# ---------------- Infraestructura ----------------
contenedor(380, 1300, 1460, 1540, "Infraestructura")
FS = caja(430, 1380, 860, 1510, "Archivos del servidor\nPDF internos")
cylinder(cv, 1180, 1445, 430, 155, "Base de datos\nrelacional", size=BS)

# ---------------- flujos ----------------
cv.arrow(NAV["b"], (NAV["b"][0], PRE["y1"]))
cv.arrow(TV["b"], (TV["b"][0], PRE["y1"]))
cv.arrow((880, PRE["y2"]), (880, AUT["y1"]))
cv.arrow((880, AUT["y2"]), (880, LOG["y1"]))
cv.arrow((1095, LOG["y2"]), (1095, ORM["y1"]))

# acceso a datos -> base de datos
cv.arrow((1180, ORM["y2"]), (1180, 1377))

# logica -> almacenamiento de archivos
cv.arrow((745, LOG["y2"]), (745, 1390))

# logica -> correo saliente
cv.arrow(LOG["r"], SMTP["l"])

# logica -> Cloudflare R2 (imagenes del sitio)
cv.path([(1390, 1025), (1528, 1025), (1528, 1240), R2["l"]])

# presentacion -> Odoo (enlace externo, sin intercambio de datos)
cv.dashed_path([PRE["r"], (1500, 550), (1500, 1000), ODOO["l"]], open_head=True)
cv.text(1524, 598, "enlace externo", size=32, anchor="lm")

print(cv.save(sys.argv[1] if len(sys.argv) > 1 else "fig5.png"))
