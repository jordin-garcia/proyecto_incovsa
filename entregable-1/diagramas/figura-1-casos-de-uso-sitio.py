# -*- coding: utf-8 -*-
"""Figura 1. Casos de uso del sitio web corporativo e institucional."""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from uml import Canvas, actor, associate

W, H = 2000, 1440
TS, AS_ = 33, 35
cv = Canvas(W, H)

BX1, BY1, BX2, BY2 = 330, 40, 1470, 1410
cv.rect(BX1, BY1, BX2, BY2, w=2.4)
cv.text((BX1 + BX2) / 2, BY1 + 48, "Sitio web corporativo e institucional", size=36, anchor="mm")

E = {  # clave: (cx, cy, rx, ry)
    "CU08": (625, 520, 255, 115),
    "CU09": (625, 900, 255, 115),
    "CU11": (1120, 210, 230, 92),
    "CU07": (1120, 455, 230, 100),
    "CU15": (1120, 720, 230, 100),
    "CU10": (1120, 985, 230, 100),
    "CU12": (1120, 1250, 230, 100),
}
TXT = {
    "CU08": "CU-08\nConsultar información\npública del sitio",
    "CU09": "CU-09\nEnviar solicitud\nde contacto",
    "CU11": "CU-11 Iniciar sesión\ny recuperar contraseña",
    "CU07": "CU-07 Administrar\ncontenido del sitio",
    "CU15": "CU-15 Administrar\ndocumentos internos",
    "CU10": "CU-10 Consultar\ndocumentación interna",
    "CU12": "CU-12 Administrar\nusuarios del sitio",
}

A = {}
A["VIS"] = actor(cv, 155, 640, "Visitante", label_size=AS_)
A["ADM"] = actor(cv, 1690, 330, "Administrativo", label_size=AS_)
A["OPE"] = actor(cv, 1690, 640, "Operativo", label_size=AS_)
A["VGE"] = actor(cv, 1690, 920, "Vista general", label_size=AS_)
A["GER"] = actor(cv, 1850, 1180, "Gerencia", label_size=AS_)

LINKS = [
    ("VIS", "right", "CU08", 0), ("VIS", "right", "CU09", 0),
    ("ADM", "left", "CU11", 0), ("ADM", "left", "CU07", -40),
    ("ADM", "left", "CU15", -40), ("ADM", "left", "CU10", -40),
    ("OPE", "left", "CU11", 25), ("OPE", "left", "CU10", -15),
    ("VGE", "left", "CU11", 45), ("VGE", "left", "CU10", 15),
    ("GER", "left", "CU12", 0),
]

for act, side, uc, off in LINKS:
    kind = associate(cv, A[act][side], uc, E, y_off=off, w=2.0)
    print(act, uc, kind)

# Generalizacion: Gerencia tiene todos los accesos de Administrativo
gx, gtop = 1850, 1180 - 17
cv.line((gx, gtop), (gx, 370))
cv.line((gx, 370), (1745, 370))
cv.polygon([(1722, 370), (1745, 356), (1745, 384)], w=2.2)

for k, (cx, cy, rx, ry) in E.items():
    cv.ellipse(cx, cy, rx, ry, w=2.4)
    cv.text(cx, cy, TXT[k], size=TS, anchor="mm")

print(cv.save(sys.argv[1] if len(sys.argv) > 1 else "fig1.png"))
