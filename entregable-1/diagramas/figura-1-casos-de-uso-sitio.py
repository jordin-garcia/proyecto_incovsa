# -*- coding: utf-8 -*-
"""Figura 1. Casos de uso vigentes del sitio web.

Actores por permiso. Gerencia y Soporte administran usuarios.
No dibuja Administrativo, Operativo ni Vista general.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from uml import Canvas, actor, associate, note

W, H = 2460, 1960
cv = Canvas(W, H)

BX1, BY1, BX2, BY2 = 500, 36, 1760, 1900
cv.rect(BX1, BY1, BX2, BY2, w=2.4)
cv.text((BX1 + BX2) / 2, BY1 + 36, "Sitio web institucional", size=34, anchor="mm")

E = {
    "CU08": (780, 340, 230, 78),
    "CU09": (780, 560, 230, 78),
    "CU11": (1320, 200, 270, 62),
    "CU07": (1320, 460, 250, 72),
    "CU21": (1320, 680, 250, 72),
    "CU10": (1320, 900, 250, 72),
    "CU15": (1320, 1120, 250, 78),
    "CU12": (1320, 1380, 250, 72),
}
TXT = {
    "CU08": "CU-08\nConsultar información\npública",
    "CU09": "CU-09\nEnviar solicitud\nde contacto",
    "CU11": "CU-11 Iniciar sesión\ny recuperar contraseña",
    "CU07": "CU-07 Administrar\ncontenido del sitio",
    "CU21": "CU-21 Gestionar\nsolicitud de contacto",
    "CU10": "CU-10 Consultar\ndocumentación interna",
    "CU15": "CU-15 Administrar\nproductos documentados",
    "CU12": "CU-12 Administrar\nusuarios",
}

A = {}
A["VIS"] = actor(cv, 210, 450, "Visitante", label_size=30)
A["CON"] = actor(cv, 2080, 460, "Permiso de\ncontenido", label_size=26)
A["SOL"] = actor(cv, 2080, 680, "Permiso de\nsolicitudes", label_size=26)
A["VER"] = actor(cv, 2080, 900, "Permiso de ver\ndocumentación", label_size=26)
A["DOC"] = actor(cv, 2080, 1120, "Permiso de administrar\ndocumentos", label_size=26)
A["GER"] = actor(cv, 2080, 1380, "Gerencia", label_size=30)
A["SOP"] = actor(cv, 2080, 1620, "Soporte", label_size=30)

LINKS = [
    ("VIS", "right", "CU08", 0),
    ("VIS", "right", "CU09", 0),
    ("CON", "left", "CU07", 0),
    ("SOL", "left", "CU21", 0),
    ("VER", "left", "CU10", 0),
    ("DOC", "left", "CU15", 0),
    ("GER", "left", "CU12", 0),
    ("SOP", "left", "CU12", 0),
]
for act, side, uc, off in LINKS:
    associate(cv, A[act][side], uc, E, y_off=off, w=2.0)

# CU-11: cualquier usuario que inicia sesión, por fuera del borde.
BUS = 2320
cv.line((BUS, 200), (E["CU11"][0] + E["CU11"][2], 200), w=2.0)
for clave in ("CON", "SOL", "VER", "DOC", "GER", "SOP"):
    p = A[clave]["right"]
    cv.line(p, (BUS, p[1]), w=2.0)
cv.line((BUS, A["CON"]["right"][1]), (BUS, A["SOP"]["right"][1]), w=2.0)
cv.line((BUS, A["CON"]["right"][1]), (BUS, 200), w=2.0)

for k, (cx, cy, rx, ry) in E.items():
    cv.ellipse(cx, cy, rx, ry, w=2.4)
    cv.text(cx, cy, TXT[k], size=28, anchor="mm")

note(
    cv, 560, 1560, 1100, 1820,
    "Gerencia y Soporte administran\n"
    "los usuarios. El resto entra\n"
    "según sus permisos.\n"
    "Administrativo, Operativo y\n"
    "Vista general no son roles vigentes.",
    size=26,
)

print(cv.save(sys.argv[1] if len(sys.argv) > 1 else "fig1.png"))
