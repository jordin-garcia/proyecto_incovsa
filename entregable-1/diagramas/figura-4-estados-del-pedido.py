# -*- coding: utf-8 -*-
"""Figura 4. Estados de la ruta y del pedido (RN-11).

Pedido: Pendiente, En Preparación, Despachado.
Ruta: Pendiente, En Preparación, En Ruta, Entregado.
Sin Cancelado y sin Editado. Cancelar devuelve las líneas al tablero.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from uml import Canvas, note

W, H = 1880, 1280
TS, LS = 30, 26
cv = Canvas(W, H)


def estado(cx, cy, w, h, text):
    cv.rect(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2, w=2.4, radius=24)
    cv.text(cx, cy, text, size=TS, anchor="mm")
    return {"t": (cx, cy - h / 2), "b": (cx, cy + h / 2),
            "l": (cx - w / 2, cy), "r": (cx + w / 2, cy)}


def final(cx, cy):
    cv.disc(cx, cy, 26, fill=(255, 255, 255), outline=(0, 0, 0), w=2.6)
    cv.disc(cx, cy, 16)


cv.text(460, 40, "Pedido (cliente recoge en bodega)", size=32, bold=True, anchor="mm")
cv.text(1360, 40, "Ruta (envío por camión)", size=32, bold=True, anchor="mm")

cv.disc(460, 100, 22)
P = estado(460, 230, 340, 90, "Pendiente")
EP = estado(460, 460, 380, 90, "En Preparación")
D = estado(460, 700, 340, 90, "Despachado")

cv.disc(1360, 100, 22)
PR = estado(1360, 230, 340, 90, "Pendiente")
EPR = estado(1360, 460, 380, 90, "En Preparación")
R = estado(1360, 700, 300, 90, "En Ruta")
EN = estado(1360, 940, 320, 90, "Entregado")

cv.arrow((460, 122), P["t"])
cv.arrow(P["b"], EP["t"])
cv.text(700, 345, "Enviar a Bodega", size=LS, anchor="lm")
cv.arrow(EP["b"], D["t"])
cv.text(700, 580, "Pedido Despachado", size=LS, anchor="lm")
final(460, 860)
cv.arrow(D["b"], (460, 834))

cv.arrow((1360, 122), PR["t"])
cv.arrow(PR["b"], EPR["t"])
cv.text(1600, 345, "Enviar a Bodega", size=LS, anchor="lm")
cv.arrow(EPR["b"], R["t"])
cv.text(1600, 580, "Ruta Despachada", size=LS, anchor="lm")
cv.arrow(R["b"], EN["t"])
cv.text(1600, 820, "Ruta Entregada", size=LS, anchor="lm")
final(1360, 1100)
cv.arrow(EN["b"], (1360, 1074))

note(
    cv, 80, 960, 900, 1220,
    "Cancelar una opción de envío devuelve\n"
    "sus pedidos facturados al tablero.\n"
    "No hay estado Cancelado.\n"
    "No hay estado Editado.\n"
    "Pendiente aún no es una ruta ni un pedido:\n"
    "son pedidos facturados en el tablero\n"
    "o en la opción de envío.",
    size=26,
)

print(cv.save(sys.argv[1] if len(sys.argv) > 1 else "fig4.png"))
