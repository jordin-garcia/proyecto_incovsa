# -*- coding: utf-8 -*-
"""Figura 1 del Documento 2. Diagrama de arquitectura (12/10/2026, specs/16).

Usa las funciones de dibujo del Entregable 1 (entregable-1/diagramas/uml.py), para que
las figuras de los dos documentos tengan el mismo estilo.
Uso: python figura-1-arquitectura.py ../figuras/figura-1-arquitectura.png
"""
import os
import sys
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(AQUI, "..", "..", "entregable-1", "diagramas"))
from uml import Canvas, cylinder

W, H = 2200, 1820
BS, CS, NS = 33, 38, 29          # texto de bloques, de contenedores y de notas
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
contenedor(330, 40, 1450, 300, "Cliente")
NAV = caja(380, 120, 880, 260, "Navegador en escritorio,\ntableta o teléfono")
TV = caja(940, 120, 1400, 260, "TV y tableta del\ntablero de Bodega")

# ---------------- Servidor de aplicación ----------------
contenedor(250, 400, 1530, 1390, "Aplicación web (Next.js 16 sobre Node.js 24)")
PROXY = caja(320, 480, 1460, 570, "proxy.ts: primera barrera, redirige a quien no tiene sesión")
PRE = caja(320, 620, 1460, 800,
           "Capa de presentación\nsitio público · panel del sitio · documentación interna ·\n"
           "Facturación · Bodega · Ruta · Reportes · Configuración")
AUT = caja(320, 850, 1460, 980,
           "Autenticación (Better Auth) y verificación de\nsesión, permiso y sede en cada operación del servidor")
LOG = caja(320, 1030, 1460, 1210,
           "Capa de lógica de negocio\nconversión · archivo de Odoo · pedidos · preparación · ruta ·\n"
           "contenido · solicitudes · usuarios y permisos · bitácora · reportes")
ORM = caja(800, 1260, 1460, 1360, "Acceso a datos y migraciones (Prisma 7)")

# ---------------- Servicios externos ----------------
contenedor(1640, 560, 2160, 1460, "Servicios externos")
SMTP = caja(1680, 640, 2120, 800, "Correo SMTP de la\nempresa: solicitudes\nde contacto", size=31)
ODOO = caja(1680, 860, 2120, 1060, "ERP Odoo\nenlace de acceso y\narchivo .xlsx que\nexporta el facturador", size=31)
R2 = caja(1680, 1120, 2120, 1300, "Cloudflare R2\nimágenes del sitio y\nrespaldos (privado)", size=31)

# ---------------- Infraestructura (título abajo, para que no lo crucen las flechas) ----------------
cv.rect(330, 1460, 1530, 1790, w=2.6)
cv.text(356, 1745, "Servidor de la empresa (dominio de INCOVSA con HTTPS)", size=CS, anchor="lm")
FS = caja(380, 1530, 880, 1680, "Archivos del servidor\nPDF internos, fuera de\nla carpeta pública", size=30)
cylinder(cv, 1210, 1600, 470, 150, "PostgreSQL 18", size=BS)

# ---------------- flujos ----------------
# Las flechas del cliente entran a la derecha del título del contenedor de la aplicación
cv.path([NAV["b"], (NAV["b"][0], 320), (1170, 320), (1170, PROXY["y1"])])
cv.arrow((1260, PROXY["y1"]), (1260, TV["y2"]))                                # avisos SSE al tablero
cv.arrow((1360, TV["y2"]), (1360, PROXY["y1"]))
cv.text(1150, 365, "HTTPS · avisos SSE al tablero", size=NS, anchor="rm")
cv.arrow((890, PROXY["y2"]), (890, PRE["y1"]))
cv.arrow((890, PRE["y2"]), (890, AUT["y1"]))
cv.arrow((890, AUT["y2"]), (890, LOG["y1"]))
cv.arrow((1130, LOG["y2"]), (1130, ORM["y1"]))
cv.arrow((1210, ORM["y2"]), (1210, 1525))                                       # Prisma -> PostgreSQL
cv.arrow((630, LOG["y2"]), (630, FS["y1"]))                                     # lógica -> PDF internos
cv.path([(LOG["x2"], 1080), (1590, 1080), (1590, 720), SMTP["l"]])              # lógica -> SMTP
cv.path([(LOG["x2"], 1170), (1610, 1170), (1610, 1210), R2["l"]])               # lógica -> R2
cv.dashed_path([(1450, 170), (1620, 170), (1620, 960), ODOO["l"]], open_head=True)
cv.text(1650, 320, "enlace de acceso;\nel archivo .xlsx\nse sube desde\nel navegador", size=NS, anchor="lm")

print(cv.save(sys.argv[1] if len(sys.argv) > 1 else "figura-1.png"))
