# -*- coding: utf-8 -*-
"""Figura 2. Casos de uso vigentes del picking.

Sin CU-06 ni CU-16 a CU-20. La nota dice que se eliminaron el 29/09/2026.
Actores por permiso. Gerencia y Soporte administran usuarios.
El rol Piloto es el texto de RN-46, no un rol predeterminado.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from uml import Canvas, actor, associate, note

W, H = 2460, 1880
cv = Canvas(W, H)

BX1, BY1, BX2, BY2 = 500, 36, 1760, 1680
cv.rect(BX1, BY1, BX2, BY2, w=2.4)
cv.text((BX1 + BX2) / 2, BY1 + 36, "Sistema de control logístico de bodega", size=34, anchor="mm")

E = {
    "CU11": (1120, 180, 280, 58),
    "CU01": (820, 400, 240, 70),
    "CU02": (820, 600, 240, 64),
    "CU03": (820, 800, 240, 64),
    "CU04": (820, 1000, 240, 64),
    "CU05": (820, 1220, 240, 70),
    "CU13": (1420, 480, 240, 70),
    "CU14": (1420, 760, 250, 76),
    "CU12": (1420, 1100, 240, 70),
}
TXT = {
    "CU11": "CU-11 Iniciar sesión\ny recuperar contraseña",
    "CU01": "CU-01 Registrar pedido\nfacturado y enviarlo",
    "CU02": "CU-02 Cancelar\nopción de envío",
    "CU03": "CU-03 Preparar\nruta o pedido",
    "CU04": "CU-04 Cerrar\npreparación",
    "CU05": "CU-05 Ejecutar\nruta de entrega",
    "CU13": "CU-13 Configurar\ncamiones",
    "CU14": "CU-14 Consultar\nreportes y bitácora",
    "CU12": "CU-12 Administrar\nusuarios",
}

A = {}
A["FAC"] = actor(cv, 210, 500, "Permiso de\nFacturación", label_size=26)
A["BOD"] = actor(cv, 210, 900, "Permiso de\nBodega", label_size=26)
A["PIL"] = actor(cv, 210, 1220, "Rol Piloto", label_size=28)
A["CAM"] = actor(cv, 2100, 480, "Permiso de\ncamiones", label_size=26)
A["REP"] = actor(cv, 2100, 760, "Permiso de\nReportes", label_size=26)
A["GER"] = actor(cv, 2100, 1040, "Gerencia", label_size=30)
A["SOP"] = actor(cv, 2100, 1280, "Soporte", label_size=30)

LINKS = [
    ("FAC", "right", "CU01", 0),
    ("FAC", "right", "CU02", 0),
    ("BOD", "right", "CU03", 0),
    ("BOD", "right", "CU04", 0),
    ("PIL", "right", "CU05", 0),
    ("CAM", "left", "CU13", 0),
    ("REP", "left", "CU14", 0),
    ("GER", "left", "CU12", 0),
    ("SOP", "left", "CU12", 0),
]
for act, side, uc, off in LINKS:
    associate(cv, A[act][side], uc, E, y_off=off, w=2.0)

BUS = 2340
cv.line((BUS, 180), (E["CU11"][0] + E["CU11"][2], 180), w=2.0)
for clave in ("CAM", "REP", "GER", "SOP"):
    p = A[clave]["right"]
    cv.line(p, (BUS, p[1]), w=2.0)
cv.line((BUS, A["CAM"]["right"][1]), (BUS, A["SOP"]["right"][1]), w=2.0)
cv.line((BUS, A["CAM"]["right"][1]), (BUS, 180), w=2.0)

BUS_I = 70
for clave in ("FAC", "BOD", "PIL"):
    p = A[clave]["left"]
    cv.line(p, (BUS_I, p[1]), w=2.0)
cv.line((BUS_I, A["FAC"]["left"][1]), (BUS_I, A["PIL"]["left"][1]), w=2.0)
cv.line((BUS_I, A["FAC"]["left"][1]), (BUS_I, 180), w=2.0)
cv.line((BUS_I, 180), (E["CU11"][0] - E["CU11"][2], 180), w=2.0)

for k, (cx, cy, rx, ry) in E.items():
    cv.ellipse(cx, cy, rx, ry, w=2.4)
    cv.text(cx, cy, TXT[k], size=26, anchor="mm")

note(
    cv, 560, 1420, 1680, 1620,
    "CU-06 y CU-16 a CU-20 se eliminaron el 29/09/2026.\n"
    "Gerencia y Soporte tienen acceso total y administran los usuarios.\n"
    "El rol Piloto es texto libre (RN-46), no un rol predeterminado.",
    size=26,
)

print(cv.save(sys.argv[1] if len(sys.argv) > 1 else "fig2.png"))
