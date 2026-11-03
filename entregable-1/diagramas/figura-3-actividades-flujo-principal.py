# -*- coding: utf-8 -*-
"""Figura 3. Actividades del flujo pedido facturado, conversión, preparación y despacho.

Sin paso de inventario, sin existencias y sin captura manual.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from uml import Canvas

W, H = 1680, 2280
TS = 28
GS = 26
cv = Canvas(W, H)
SP = 640
BR = 1280


def act(cx, cy, w, h, text, size=TS):
    cv.rect(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2, w=2.4, radius=26)
    cv.text(cx, cy, text, size=size, anchor="mm")
    return {"c": (cx, cy), "t": (cx, cy - h / 2), "b": (cx, cy + h / 2),
            "l": (cx - w / 2, cy), "r": (cx + w / 2, cy)}


def rombo(cx, cy, hw=90, hh=56):
    cv.polygon([(cx, cy - hh), (cx + hw, cy), (cx, cy + hh), (cx - hw, cy)], w=2.4)
    return {"c": (cx, cy), "t": (cx, cy - hh), "b": (cx, cy + hh),
            "l": (cx - hw, cy), "r": (cx + hw, cy)}


def final(cx, cy):
    cv.disc(cx, cy, 26, fill=(255, 255, 255), outline=(0, 0, 0), w=2.6)
    cv.disc(cx, cy, 16)


cv.disc(SP, 48, 24)
A = act(SP, 170, 760, 110, "Cargar el archivo .xlsx de Odoo.\nPedidos facturados en el tablero")
B = act(SP, 360, 760, 110, "Arrastrar a una opción de envío\ny ordenar los pedidos facturados")
D1 = rombo(SP, 540)
C = act(BR, 540, 520, 110, "Elegir camión y piloto\nde la sede")
E = act(SP, 760, 760, 110, "Escribir la fecha y la hora\nprogramadas")
D2 = rombo(SP, 960)
F = act(280, 960, 420, 120, "Cancelar.\nLos pedidos facturados\nvuelven al tablero", size=26)
G = act(SP, 1160, 780, 120, "Enviar a Bodega.\nCrea la ruta o el pedido\nen estado En Preparación")
H = act(SP, 1380, 820, 130, "Convertir kilogramos a unidades (RN-01),\nagrupado por producto, lote\ny Peso de Conversión")
I = act(SP, 1600, 700, 110, "Preparar.\nMarcar las líneas")
D3 = rombo(SP, 1780)
J = act(280, 1980, 460, 120, "Pedido Despachado.\nEstado Despachado", size=26)
K = act(BR, 1980, 460, 110, "Ruta Despachada.\nEstado En Ruta")
L = act(BR, 2160, 420, 100, "Ruta Entregada.\nEstado Entregado")

cv.arrow((SP, 72), A["t"])
cv.arrow(A["b"], B["t"])
cv.arrow(B["b"], D1["t"])
cv.path([D1["r"], C["l"]])
cv.text((D1["r"][0] + C["l"][0]) / 2, 500, "[envío por camión]", size=GS, anchor="mm")
cv.path([C["b"], (BR, 660), (SP, 660), E["t"]])
cv.arrow(D1["b"], E["t"])
cv.text(SP - 16, 640, "[cliente recoge]", size=GS, anchor="rm")
cv.arrow(E["b"], D2["t"])
cv.path([D2["l"], F["r"]])
cv.text(400, 880, "[Cancelar]", size=GS, anchor="mm")
final(280, 1100)
cv.arrow(F["b"], (280, 1074))
cv.arrow(D2["b"], G["t"])
cv.text(SP + 18, 1040, "[Enviar a Bodega]", size=GS, anchor="lm")
cv.arrow(G["b"], H["t"])
cv.arrow(H["b"], I["t"])
cv.arrow(I["b"], D3["t"])
cv.path([D3["l"], (280, 1780), J["t"]])
cv.text(300, 1860, "[pedido]", size=GS, anchor="lm")
cv.path([D3["r"], (BR, 1780), K["t"]])
cv.text(BR - 16, 1860, "[ruta]", size=GS, anchor="rm")
final(280, 2140)
cv.arrow(J["b"], (280, 2114))
cv.arrow(K["b"], L["t"])
final(BR, 2248)
cv.arrow(L["b"], (BR, 2222))

print(cv.save(sys.argv[1] if len(sys.argv) > 1 else "fig3.png"))
