# -*- coding: utf-8 -*-
"""Figura 3. Diagrama de actividades del flujo principal."""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from uml import Canvas

W, H = 1500, 2130
TS = 31          # texto de actividades
GS = 29          # texto de guardas
cv = Canvas(W, H)

SP = 600         # eje principal
BR = 1150        # columna de ramas


def act(cx, cy, w, h, text, size=TS):
    cv.rect(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2, w=2.4, radius=26)
    cv.text(cx, cy, text, size=size, anchor="mm")
    return {"c": (cx, cy), "t": (cx, cy - h / 2), "b": (cx, cy + h / 2),
            "l": (cx - w / 2, cy), "r": (cx + w / 2, cy)}


def rombo(cx, cy, hw=78, hh=52):
    cv.polygon([(cx, cy - hh), (cx + hw, cy), (cx, cy + hh), (cx - hw, cy)], w=2.4)
    return {"c": (cx, cy), "t": (cx, cy - hh), "b": (cx, cy + hh),
            "l": (cx - hw, cy), "r": (cx + hw, cy)}


def guard(x, y, text, anchor="mm"):
    cv.text(x, y, text, size=GS, anchor=anchor)


# ---------------- nodos ----------------
cv.disc(SP, 60, 27)                                   # nodo inicial
A = act(SP, 185, 700, 110, "Facturación registra el pedido\nya facturado en Odoo")
D1 = rombo(SP, 350)
B = act(BR, 350, 480, 100, "Asignar camión y piloto")
C = act(SP, 560, 700, 100, "Capturar cliente, producto y cantidad en kg")
D = act(SP, 730, 700, 120, "Validar la existencia sumando el mismo\nproducto y acumular el total en kg")
E = act(SP, 915, 800, 150, "Enviar a bodega: guardar el pedido con su\nPeso2, registrar la salida por venta y, si es\nenvío en camión, crear la ruta con número y fecha", size=29)
F = act(SP, 1095, 700, 120, "Agrupar por producto y convertir\na unidades más resto en kg")
G = act(SP, 1265, 700, 110, "Preparar, marcar cada línea\ny cerrar el pedido")
D2 = rombo(SP, 1430)
Hn = act(400, 1660, 420, 95, "Estado Despachado")
I = act(BR, 1600, 560, 120, "Ordenar las entregas y confirmar;\nse guarda el recorrido")
J = act(BR, 1790, 420, 95, "Estado Entregado")
K = act(750, 1970, 780, 100, "Bitácora, registro histórico de rutas y reportes")
cv.disc(750, 2085, 30, fill=(255, 255, 255), outline=(0, 0, 0), w=2.6)
cv.disc(750, 2085, 20)

# ---------------- flujos ----------------
cv.arrow((SP, 87), A["t"])
cv.arrow(A["b"], D1["t"])

# rama: envio en camion
cv.path([D1["r"], (BR - 240, 350)])
guard((D1["r"][0] + BR - 240) / 2, 350 - 26, "[envío en camión]")

# retorno de la rama al eje
cv.path([B["b"], (BR, 470), (SP, 470), (SP, C["t"][1])])

# rama: cliente recoge en bodega
cv.arrow(D1["b"], C["t"])
guard(SP - 22, 440, "[cliente recoge\nen bodega]", anchor="rm")

cv.arrow(C["b"], D["t"])
cv.arrow(D["b"], E["t"])
cv.arrow(E["b"], F["t"])
cv.arrow(F["b"], G["t"])
cv.arrow(G["b"], D2["t"])

# decision final
cv.path([D2["l"], (400, 1430), (400, Hn["t"][1])])
guard(400 - 22, 1500, "[cliente recoge\nen bodega]", anchor="rm")
cv.path([D2["r"], (BR, 1430), (BR, I["t"][1])])
guard(BR + 26, 1500, "[envío en camión]", anchor="lm")

cv.arrow(I["b"], J["t"])

# union de ambas ramas
cv.line(Hn["b"], (400, 1885))
cv.line(J["b"], (BR, 1885))
cv.line((400, 1885), (BR, 1885))
cv.arrow((750, 1885), K["t"])

cv.arrow(K["b"], (750, 2085 - 32))

print(cv.save(sys.argv[1] if len(sys.argv) > 1 else "fig3.png"))
