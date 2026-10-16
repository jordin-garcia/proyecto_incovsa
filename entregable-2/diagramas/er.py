# -*- coding: utf-8 -*-
"""Diagramas entidad-relación del Documento 2 (figuras 9, 10 y 11), dibujados a partir de modelo.py.

Notación: cada caja es una tabla con sus campos (PK = clave primaria, FK = clave foránea, ? = permite
nulo). Cada línea une una clave foránea con la tabla que referencia; en los extremos se indica la
cardinalidad: N (o 0..1 si la clave es única) del lado que referencia, y 1 (o 0..1 si la clave permite
nulo) del lado referenciado. Las claves foráneas hacia tablas que se dibujan en otra figura se marcan
con «→ tabla».
Uso: python er.py <acceso|picking|sitio> <salida.png>
"""
import os
import sys
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(AQUI, "..", "..", "entregable-1", "diagramas"))
sys.path.insert(0, AQUI)
from uml import Canvas
from modelo import TABLAS, UNICAS

BW, HH, RH, FS = 470, 52, 34, 23      # ancho de caja, alto de cabecera, alto de fila, tamaño de letra
GAP, X0, Y0 = 170, 150, 190           # separación entre columnas, margen izquierdo, inicio de las cajas
GRIS = (235, 238, 233)

def filas(tabla):
    return [c for c in TABLAS[tabla][2] if 'No se usa' not in c[6]]

def alto(tabla):
    return HH + RH * len(filas(tabla)) + 10

def unica(tabla, campo):
    return any(t == tabla and u == campo for t, u in UNICAS)

def dibujar(W, H, titulo, pos, salida):
    """pos: {tabla: (columna, y)}"""
    cv = Canvas(W, H)
    cv.text(40, 50, titulo, size=36, bold=True, anchor="la")
    col_x = lambda c: X0 + c * (BW + GAP)
    B = {}
    for t, (c, y) in pos.items():
        B[t] = {"c": c, "x1": col_x(c), "y1": y, "x2": col_x(c) + BW, "y2": y + alto(t), "f": [x[0] for x in filas(t)]}
    fila_y = lambda t, campo: B[t]["y1"] + HH + 8 + RH * B[t]["f"].index(campo) + RH / 2
    carriles = {}
    def carril(clave, paso, base, rango):
        n = carriles.get(clave, 0); carriles[clave] = n + 1
        return base + ((n % rango) - rango // 2) * paso
    def propio(col, x1):
        n = carriles.get(("m", col), 0) + 1; carriles[("m", col)] = n
        return x1 - 8 - 14 * n
    rel = []
    for t in pos:
        for c in filas(t):
            if c[4] and c[4] in B:
                rel.append((t, c, c[4]))
    # cajas
    for t in pos:
        b = B[t]
        cv.rect(b["x1"], b["y1"], b["x2"], b["y2"], w=2.4, fill=(255, 255, 255))
        cv.rect(b["x1"], b["y1"], b["x2"], b["y1"] + HH, w=2.4, fill=GRIS)
        cv.text((b["x1"] + b["x2"]) / 2, b["y1"] + HH / 2, t, size=FS + 3, bold=True, anchor="mm")
        for i, c in enumerate(filas(t)):
            cy = b["y1"] + HH + 8 + RH * i + RH / 2
            marca = "PK" if c[3] else ("FK" if c[4] else "")
            if marca:
                cv.text(b["x1"] + 14, cy, marca, size=FS - 3, bold=True, anchor="lm")
            nombre = c[0] + (" ?" if c[5] else "")
            if c[4] and c[4] not in B:
                nombre += f"  → {c[4]}"
            cv.text(b["x1"] + 62, cy, nombre, size=FS, anchor="lm")
            tipo = c[1] + (f"({c[2]})" if c[2] else "")
            cv.text(b["x2"] - 14, cy, tipo, size=FS - 4, anchor="rm", fill=(70, 70, 70))
    # relaciones: salen de la fila de la clave foránea y llegan a la fila de la clave primaria
    for t, c, ref in rel:
        a, b = B[t], B[ref]
        y1 = fila_y(t, c[0])
        y2 = b["y1"] + HH + 8 + RH / 2 + carril(("pk", ref), 6, 0, 3)
        if a["c"] == b["c"]:                                  # misma columna: por el pasillo izquierdo
            gx = propio(a["c"], a["x1"])
            puntos = [(a["x1"], y1), (gx, y1), (gx, y2), (b["x1"], y2)]
            lado_a, lado_b = "l", "l"
        elif abs(a["c"] - b["c"]) == 1:                       # columnas vecinas: por el pasillo de en medio
            der = b["c"] > a["c"]
            gx = carril(("g", min(a["c"], b["c"]) + 0.5), 14, (a["x2"] if der else a["x1"]) + (GAP / 2 if der else -GAP / 2), 5)
            puntos = [(a["x2"] if der else a["x1"], y1), (gx, y1), (gx, y2), (b["x1"] if der else b["x2"], y2)]
            lado_a, lado_b = ("r", "l") if der else ("l", "r")
        else:                                                  # lejos: por el canal superior
            der = b["c"] > a["c"]
            ga = carril(("g", a["c"] + (0.5 if der else -0.5)), 14, (a["x2"] if der else a["x1"]) + (GAP / 2 if der else -GAP / 2), 7)
            gb = carril(("g", b["c"] + (-0.5 if der else 0.5)), 14, (b["x1"] if der else b["x2"]) + (-GAP / 2 if der else GAP / 2), 7)
            cy = carril("canal", 14, Y0 - 50, 5)
            puntos = [(a["x2"] if der else a["x1"], y1), (ga, y1), (ga, cy), (gb, cy), (gb, y2), (b["x1"] if der else b["x2"], y2)]
            lado_a, lado_b = ("r", "l") if der else ("l", "r")
        for p, q in zip(puntos, puntos[1:]):
            cv.line(p, q, w=2)
        muchos = "0..1" if unica(t, c[0]) else "N"
        uno = "0..1" if c[5] else "1"
        pa, pb = puntos[0], puntos[-1]
        cv.text(pa[0] + (10 if lado_a == "r" else -10), pa[1] - 14, muchos, size=FS - 3, bold=True, anchor="lm" if lado_a == "r" else "rm")
        cv.text(pb[0] + (10 if lado_b == "r" else -10), pb[1] - 14, uno, size=FS - 3, bold=True, anchor="lm" if lado_b == "r" else "rm")
    cv.text(40, H - 40, "PK: clave primaria · FK: clave foránea · ?: permite nulo · N, 1 y 0..1: cardinalidad en cada extremo de la relación · → tabla: la tabla está en otra figura", size=24, anchor="lm")
    print(cv.save(salida))

FIGURAS = {
    "acceso": (2700, 1500, "Acceso: usuarios, credenciales, sesiones, permisos, sedes y bitácora", {
        "permiso": (0, Y0), "usuario_permiso": (0, 520),
        "usuario": (1, Y0), "bitacora": (1, 840),
        "usuario_sede": (2, Y0), "sede": (2, 420), "verificacion": (2, 760),
        "cuenta": (3, Y0), "sesion": (3, 560),
    }),
    "picking": (2700, 1500, "Sistema de picking", {
        "camion": (0, Y0), "opcion_envio": (0, 560),
        "pedido_facturado": (1, Y0), "detalle_pedido_facturado": (1, 680),
        "envio": (2, Y0), "estado_envio": (2, 760), "historial_estado": (2, 960),
        "linea_preparacion": (3, Y0), "entrega_ruta": (3, 640),
    }),
    "sitio": (2700, 1500, "Sitio web", {
        "pais": (0, Y0), "departamento": (0, 400), "municipio": (0, 590),
        "solicitud_contacto": (1, Y0), "producto_documentado": (0, 860), "informacion_contacto": (1, 930),
        "industria": (2, Y0), "producto_industria": (2, 500), "producto_sitio": (2, 720), "noticia": (2, 1100),
        "imagen": (3, Y0), "valor": (3, 640), "contenido_institucional": (3, 870), "configuracion_sitio": (3, 1120),
    }),
}

if __name__ == "__main__":
    W, H, titulo, pos = FIGURAS[sys.argv[1]]
    dibujar(W, H, titulo, pos, sys.argv[2])
