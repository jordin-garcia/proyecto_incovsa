# -*- coding: utf-8 -*-
"""Figura 3 del Documento 2. Diagrama de clases del dominio del sistema de picking y del acceso
(specs/14 y specs/16, 14/10/2026). Notación UML: clase con atributos y operaciones; asociaciones con
multiplicidad; rombo negro = composición; línea discontinua con punta abierta = dependencia.
Uso: python figura-3-clases.py ../figuras/figura-3-clases.png
"""
import os
import sys
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(AQUI, "..", "..", "entregable-1", "diagramas"))
from uml import Canvas, BLACK

W, H = 3060, 2000
CW, GAP, X0, Y0, RH, FS = 560, 170, 200, 130, 33, 24
cv = Canvas(W, H)
GRIS = (235, 238, 233)

CLASES = {   # nombre: (columna, y, estereotipo, atributos, operaciones)
    "Usuario": (0, Y0, "", ["nombreUsuario: texto", "sistema: sitio | picking | ambos", "rol: texto", "activo: booleano", "eliminadoEn: fecha?"],
                ["esTotal(): booleano", "esPiloto(): booleano", "tienePermiso(codigo): booleano", "tieneSede(sede): booleano"]),
    "Permiso": (0, 760, "", ["codigo: texto", "sistema: texto", "modulo: texto"], []),
    "Bitacora": (0, 1060, "", ["operacion: texto", "detalle: JSON", "usuarioEscrito: texto?", "creadoEn: fecha y hora"], ["registrar(usuario, operacion, detalle)"]),
    "Sede": (1, Y0, "", ["nombre: texto", "prefijoOdoo: XE | GT | ESC"], []),
    "Camion": (1, 420, "", ["identificacion: texto", "capacidadKg: decimal"], []),
    "OpcionEnvio": (1, 720, "", ["tipo: camion | recoge", "fechaProgramada: fecha?", "horaProgramada: hora?"],
                    ["mover(pedidos, antesDe)", "cancelar()", "enviar(): Envio"]),
    "PedidoFacturado": (2, Y0, "", ["numeroOdoo: texto", "referencia: texto", "cliente: texto", "sector: texto", "posicion: entero"], ["totalKg(): decimal"]),
    "DetallePedidoFacturado": (2, 640, "", ["producto: texto", "lote: texto?", "pesoConversionKg: decimal", "cantidadKg: decimal"], []),
    "LectorOdoo": (2, 1040, "servicio", [], ["leer(archivo): PedidoFacturado[]", "validar(linea): motivo?"]),
    "Envio": (3, Y0, "", ["tipo: ruta | pedido", "numero: entero (del día)", "fechaEnvio: fecha", "programadoPara: fecha y hora", "estado: EstadoEnvio"],
              ["etiqueta(): texto", "marcarTodo(valor)", "ordenarPorPeso()", "despachar()", "entregar(recorrido)"]),
    "LineaPreparacion": (3, 770, "", ["producto: texto", "lote: texto?", "pesoConversionKg: decimal", "cantidadKg: decimal", "marcado: booleano", "posicion: entero"], ["marcar()", "unidades(): Conversion"]),
    "EntregaRuta": (3, 1290, "", ["cliente: texto", "sector: texto", "totalKg: decimal", "orden: entero"], []),
    "HistorialEstado": (2, 1380, "", ["estado: EstadoEnvio", "creadoEn: fecha y hora"], []),
    "Conversion": (3, 1620, "servicio", [], ["convertir(cantidadKg, pesoKg): {unidades, restoKg}"]),
}
col_x = lambda c: X0 + c * (CW + GAP)
B = {}
for n, (c, y, est, at, op) in CLASES.items():
    x = col_x(c)
    hcab = 56 + (28 if est else 0)
    h = hcab + 12 + RH * max(1, len(at)) + 12 + RH * max(1, len(op)) + 8
    cv.rect(x, y, x + CW, y + h, w=2.4, fill=(255, 255, 255))
    cv.rect(x, y, x + CW, y + hcab, w=2.4, fill=GRIS)
    if est:
        cv.text(x + CW / 2, y + 24, f"«{est}»", size=FS - 2, anchor="mm")
    cv.text(x + CW / 2, y + hcab - 28, n, size=FS + 4, bold=True, anchor="mm")
    yy = y + hcab + 12
    for a in at:
        cv.text(x + 18, yy + RH / 2, "− " + a, size=FS, anchor="lm"); yy += RH
    if not at:
        yy += RH
    yy += 6
    cv.line((x, yy), (x + CW, yy), w=2)
    yy += 6
    for o in op:
        cv.text(x + 18, yy + RH / 2, "+ " + o, size=FS, anchor="lm"); yy += RH
    B[n] = {"c": c, "x1": x, "y1": y, "x2": x + CW, "y2": y + h}

carriles = {}
def carril(k, paso, base, rango=5):
    n = carriles.get(k, 0); carriles[k] = n + 1
    return base + ((n % rango) - rango // 2) * paso

def propio(col, x1):
    """Carril pegado a la columna, para las relaciones dentro de una misma columna."""
    n = carriles.get(("m", col), 0) + 1; carriles[("m", col)] = n
    return x1 - 8 - 14 * n

def rombo(p, hacia_derecha):
    x, y = p; s = 1 if hacia_derecha else -1
    cv.polygon([(x, y), (x + 14 * s, y - 9), (x + 28 * s, y), (x + 14 * s, y + 9)], w=2, fill=BLACK)

def relacion(a, b, ma, mb, tipo="asoc", ya=0.5, yb=0.5, etiqueta=""):
    """a y b: clases; ma y mb: multiplicidad en cada extremo; ya y yb: altura relativa de la conexión."""
    A, Bb = B[a], B[b]
    y1 = A["y1"] + 40 + (A["y2"] - A["y1"] - 40) * ya
    y2 = Bb["y1"] + 40 + (Bb["y2"] - Bb["y1"] - 40) * yb
    if A["c"] == Bb["c"]:
        gx = propio(A["c"], A["x1"])
        pts = [(A["x1"], y1), (gx, y1), (gx, y2), (Bb["x1"], y2)]; la, lb = "l", "l"
    elif abs(A["c"] - Bb["c"]) == 1:
        der = Bb["c"] > A["c"]
        gx = carril(("g", min(A["c"], Bb["c"]) + 0.5), 16, (A["x2"] + GAP / 2) if der else (A["x1"] - GAP / 2))
        pts = [(A["x2"] if der else A["x1"], y1), (gx, y1), (gx, y2), (Bb["x1"] if der else Bb["x2"], y2)]
        la, lb = ("r", "l") if der else ("l", "r")
    else:
        der = Bb["c"] > A["c"]
        ga = carril(("g", A["c"] + (0.5 if der else -0.5)), 16, (A["x2"] + GAP / 2) if der else (A["x1"] - GAP / 2))
        gb = carril(("g", Bb["c"] + (-0.5 if der else 0.5)), 16, (Bb["x1"] - GAP / 2) if der else (Bb["x2"] + GAP / 2))
        cy = carril("canal", 14, Y0 - 50, 5)
        pts = [(A["x2"] if der else A["x1"], y1), (ga, y1), (ga, cy), (gb, cy), (gb, y2), (Bb["x1"] if der else Bb["x2"], y2)]
        la, lb = ("r", "l") if der else ("l", "r")
    if tipo == "dep":
        cv.dashed_path(pts, open_head=True, w=2)
    else:
        for p, q in zip(pts, pts[1:]):
            cv.line(p, q, w=2)
        if tipo == "comp":
            rombo(pts[0], la == "r")
    if ma:
        cv.text(pts[0][0] + (34 if la == "r" else -34), pts[0][1] - 16, ma, size=FS - 2, bold=True, anchor="lm" if la == "r" else "rm")
    if mb:
        cv.text(pts[-1][0] + (12 if lb == "r" else -12), pts[-1][1] - 16, mb, size=FS - 2, bold=True, anchor="lm" if lb == "r" else "rm")
    if etiqueta:
        cv.text(pts[1][0] + 8, (pts[1][1] + pts[2][1]) / 2, etiqueta, size=FS - 3, anchor="lm", bg=(255, 255, 255))

relacion("Usuario", "Permiso", "*", "*", ya=0.9, yb=0.3)
relacion("Bitacora", "Usuario", "*", "0..1", ya=0.3, yb=0.95)
relacion("Usuario", "Sede", "*", "*", ya=0.2, yb=0.3, etiqueta="sedes")
relacion("Camion", "Sede", "*", "1", ya=0.4, yb=0.7)
relacion("OpcionEnvio", "Sede", "2", "1", ya=0.2, yb=0.9)
relacion("OpcionEnvio", "Camion", "*", "0..1", ya=0.5, yb=0.4)
relacion("OpcionEnvio", "Usuario", "*", "0..1", ya=0.75, yb=0.6, etiqueta="piloto")
relacion("PedidoFacturado", "OpcionEnvio", "*", "0..1", ya=0.75, yb=0.5)
relacion("PedidoFacturado", "DetallePedidoFacturado", "1", "1..*", "comp", ya=0.9, yb=0.3)
relacion("Envio", "PedidoFacturado", "0..1", "1..*", ya=0.3, yb=0.3)
relacion("Envio", "LineaPreparacion", "1", "1..*", "comp", ya=0.95, yb=0.2)
relacion("Envio", "EntregaRuta", "1", "0..*", "comp", ya=0.85, yb=0.3)
relacion("Envio", "HistorialEstado", "1", "1..*", ya=0.75, yb=0.4)
relacion("Envio", "Camion", "*", "0..1", ya=0.55, yb=0.8)
relacion("LineaPreparacion", "Conversion", "", "", "dep", ya=0.6, yb=0.6, etiqueta="usa")
relacion("LectorOdoo", "PedidoFacturado", "", "", "dep", ya=0.5, yb=0.85, etiqueta="crea")

cv.text(60, H - 40, "− atributo · + operación · ? opcional · rombo negro: composición · línea discontinua: dependencia · números: multiplicidad", size=24, anchor="lm")
print(cv.save(sys.argv[1] if len(sys.argv) > 1 else "figura-3.png"))
