# -*- coding: utf-8 -*-
"""Figura 5. Despliegue de producción (specs/16).

Una aplicación. Caddy en los puertos 80 y 443.
PostgreSQL 18 sin puerto publicado. R2 para las imágenes.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from uml import Canvas, cylinder

W, H = 2100, 1560
cv = Canvas(W, H)


def caja(x1, y1, x2, y2, text, size=30):
    cv.rect(x1, y1, x2, y2, w=2.4, radius=10)
    cv.text((x1 + x2) / 2, (y1 + y2) / 2, text, size=size, anchor="mm")
    return {"t": ((x1 + x2) / 2, y1), "b": ((x1 + x2) / 2, y2),
            "l": (x1, (y1 + y2) / 2), "r": (x2, (y1 + y2) / 2)}


def marco(x1, y1, x2, y2, titulo):
    cv.rect(x1, y1, x2, y2, w=2.6)
    cv.text(x1 + 24, y1 + 18, titulo, size=32, anchor="la")


marco(40, 24, 980, 250, "Quien usa el sistema")
NAV = caja(80, 90, 480, 210, "Navegador\nescritorio, tableta o teléfono", size=26)
TV = caja(530, 90, 940, 210, "TV o tableta\ndel módulo de Bodega", size=26)

marco(40, 300, 1280, 1180, "VPS")
cv.text(620, 348, "Producción. Docker Compose. Un solo ambiente.", size=26, anchor="la")
CADDY = caja(80, 420, 460, 600, "Caddy\nPuertos 80 y 443\nHTTPS y HSTS", size=26)
APP = caja(560, 400, 1200, 620, "Una aplicación\nNext.js, un solo proceso\nSitio, panel y picking", size=26)
cylinder(cv, 880, 900, 480, 190, "PostgreSQL 18\nPuerto no publicado", size=26)

marco(1340, 300, 2040, 980, "Fuera del VPS")
R2 = caja(1400, 370, 1980, 500, "Cloudflare R2\nImágenes del sitio", size=26)
BAK = caja(1400, 540, 1980, 670, "Cloudflare R2\nBucket privado de respaldos", size=24)
DRIVE = caja(1400, 730, 1980, 900, "Google Drive\nEnlaces, no archivos PDF", size=26)

ODOO = caja(40, 1260, 700, 1480, "Odoo\nEnlace de acceso y archivo .xlsx\nSin conexión directa", size=26)
NOTA = caja(780, 1300, 1400, 1460, "El sistema no envía correos", size=28)

cv.arrow(NAV["b"], (280, CADDY["t"][1]))
cv.path([TV["b"], (735, 270), (360, 270), (360, CADDY["t"][1])])
cv.arrow(CADDY["r"], APP["l"])
cv.arrow((880, APP["b"][1]), (880, 805))
cv.arrow((1200, 450), R2["l"])
cv.arrow((1200, 530), BAK["l"])
cv.arrow((1200, 600), DRIVE["l"])
cv.dashed_path([(600, APP["b"][1]), (600, 1120), (370, 1120), ODOO["t"]], open_head=True)
cv.text(480, 1090, "enlace y archivo .xlsx", size=24, anchor="mm")

print(cv.save(sys.argv[1] if len(sys.argv) > 1 else "fig5.png"))
