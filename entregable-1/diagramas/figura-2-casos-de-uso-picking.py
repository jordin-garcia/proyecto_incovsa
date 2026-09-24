# -*- coding: utf-8 -*-
"""Figura 2. Casos de uso del sistema de control logistico de bodega."""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from uml import Canvas, actor, associate, note

W, H = 2080, 2010
TS, AS_ = 33, 35
cv = Canvas(W, H)

BX1, BY1, BX2, BY2 = 380, 40, 1580, 1970
cv.rect(BX1, BY1, BX2, BY2, w=2.4)
cv.text((BX1 + BX2) / 2, BY1 + 48, "Sistema de control logístico de bodega", size=36, anchor="mm")

RX, RY = 245, 80
E = {
    "CU11": (990, 200, 250, 66),
    "CU01": (740, 440, 250, 95),
    "CU02": (740, 660, 250, 95),
    "CU03": (740, 880, 250, 95),
    "CU04": (740, 1100, 250, 95),
    "CU05": (740, 1320, 250, 95),
}
DERECHA = ["CU12", "CU13", "CU16", "CU17", "CU18", "CU19", "CU06", "CU20", "CU14"]
for i, k in enumerate(DERECHA):
    E[k] = (1290, 380 + i * 185, RX, RY)

TXT = {
    "CU11": "CU-11\nIniciar sesión",
    "CU01": "CU-01 Registrar\npedido facturado",
    "CU02": "CU-02\nCancelar pedido",
    "CU03": "CU-03\nPreparar pedido",
    "CU04": "CU-04 Cerrar\npreparación",
    "CU05": "CU-05 Ejecutar\nruta de entrega",
    "CU12": "CU-12 Administrar\nusuarios del picking",
    "CU13": "CU-13 Configurar\ncatálogos",
    "CU16": "CU-16 Consultar\nexistencias",
    "CU17": "CU-17 Registrar\ncompra",
    "CU18": "CU-18 Registrar\najuste",
    "CU19": "CU-19 Registrar\ntraslado entre sedes",
    "CU06": "CU-06 Registrar\ndevolución",
    "CU20": "CU-20 Editar\nmovimiento",
    "CU14": "CU-14 Consultar\nreportes y bitácora",
}

A = {}
A["FAC"] = actor(cv, 165, 470, "Operativo\nFacturador", label_size=AS_)
A["BOD"] = actor(cv, 165, 920, "Operativo\nBodega", label_size=AS_)
A["PIL"] = actor(cv, 165, 1330, "Operativo\nPiloto", label_size=AS_)
A["SIT"] = actor(cv, 1780, 1000, "Soporte IT", label_size=AS_)
A["GER"] = actor(cv, 1960, 1560, "Gerencia", label_size=AS_)

LINKS = [
    ("FAC", "right", "CU01", 0), ("FAC", "right", "CU02", 0),
    ("BOD", "right", "CU03", 0), ("BOD", "right", "CU04", 0),
    ("PIL", "right", "CU05", 0),
] + [("SIT", "left", k, 0) for k in DERECHA]

for act, side, uc, off in LINKS:
    kind = associate(cv, A[act][side], uc, E, y_off=off, w=2.0)
    print(act, uc, kind)

# Operativos -> CU-11 por un carril a la izquierda, sin cruzar otros casos de uso
LANE = 425
for k in ("FAC", "BOD", "PIL"):
    p = A[k]["right"]
    cv.line(p, (LANE, p[1]), w=2.0)
cv.line((LANE, A["PIL"]["right"][1]), (LANE, 200), w=2.0)
cv.line((LANE, 200), (740, 200), w=2.0)

# Soporte IT -> CU-11 por encima, sin cruzar otros casos de uso
cv.line((1780, 1000 - 17), (1780, 200), w=2.0)
cv.line((1780, 200), (1240, 200), w=2.0)

# Generalizacion: Gerencia tiene todos los accesos de Soporte IT
gx = 1960
cv.line((gx, 1560 - 17), (gx, 1040))
cv.line((gx, 1040), (1835, 1040))
cv.polygon([(1812, 1040), (1835, 1026), (1835, 1054)], w=2.2)

for k, (cx, cy, rx, ry) in E.items():
    cv.ellipse(cx, cy, rx, ry, w=2.4)
    cv.text(cx, cy, TXT[k], size=TS, anchor="mm")

note(cv, 430, 1540, 960, 1760,
     "Gerencia y Soporte IT también\nejecutan CU-01 a CU-05\nen todas las sedes", size=29)

print(cv.save(sys.argv[1] if len(sys.argv) > 1 else "fig2.png"))
