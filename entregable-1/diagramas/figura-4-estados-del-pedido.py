# -*- coding: utf-8 -*-
"""Figura 4. Diagrama de estados del pedido."""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from uml import Canvas, note

W, H = 1540, 1180
TS, LS = 33, 29
cv = Canvas(W, H)


def estado(cx, cy, w, h, text):
    cv.rect(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2, w=2.4, radius=24)
    cv.text(cx, cy, text, size=TS, anchor="mm")
    return {"c": (cx, cy), "t": (cx, cy - h / 2), "b": (cx, cy + h / 2),
            "l": (cx - w / 2, cy), "r": (cx + w / 2, cy),
            "w": w, "h": h}


def final(cx, cy):
    cv.disc(cx, cy, 30, fill=(255, 255, 255), outline=(0, 0, 0), w=2.6)
    cv.disc(cx, cy, 20)


# --- estados ---
cv.disc(250, 78, 27)
P = estado(250, 195, 320, 95, "Pendiente")
EP = estado(1000, 195, 400, 95, "En Preparación")
C = estado(250, 560, 300, 95, "Cancelado")
D = estado(620, 560, 340, 95, "Despachado")
R = estado(1000, 560, 300, 95, "En Ruta")
E = estado(1000, 830, 340, 95, "Entregado")

# --- transiciones ---
cv.arrow((250, 105), P["t"])
cv.text(292, 78, "El facturador abre el módulo de Facturación", size=LS, anchor="lm")

cv.arrow(P["r"], EP["l"])
cv.text(605, 152, "Pulsa Enviar\nPedido a Bodega", size=LS, anchor="mm")

cv.arrow(P["b"], C["t"])
cv.text(282, 330, "Pulsa Cancelar", size=LS, anchor="lm")

cv.arrow((900, 243), (665, 512))
cv.text(660, 428, "Pulsa Pedido Despachado y\nel cliente recoge en bodega", size=LS, anchor="rm")

cv.arrow(EP["b"], R["t"])
cv.text(1035, 350, "Pulsa Pedido Despachado y\nel pedido se envía en camión", size=LS, anchor="lm")

cv.arrow(R["b"], E["t"])
cv.text(1035, 695, "Pulsa Pedido Entregado", size=LS, anchor="lm")

cv.arrow(C["b"], (250, 705))
final(250, 735)
cv.arrow(D["b"], (620, 705))
final(620, 735)
cv.arrow(E["b"], (1000, 975))
final(1000, 1005)

# --- nota ---
note(cv, 60, 890, 800, 1150,
     "Pendiente y Cancelado solo se ven en pantalla:\n"
     "el pedido se guarda al pulsar Enviar Pedido a Bodega.\n"
     "«Con devolución» no es un estado: es una marca\n"
     "que se agrega al pedido Despachado o Entregado\n"
     "al registrar una devolución en Inventario", size=26)

print(cv.save(sys.argv[1] if len(sys.argv) > 1 else "fig4.png"))
