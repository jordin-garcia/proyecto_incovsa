# -*- coding: utf-8 -*-
"""Utilidades de dibujo UML clasico (trazo negro sobre blanco) con PIL."""
import math
from PIL import Image, ImageDraw, ImageFont

S = 3  # supermuestreo
FONT_R = "C:/Windows/Fonts/arial.ttf"
FONT_B = "C:/Windows/Fonts/arialbd.ttf"
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)


class Canvas:
    def __init__(self, w, h, bg=WHITE):
        self.w, self.h = w, h
        self.im = Image.new("RGB", (w * S, h * S), bg)
        self.d = ImageDraw.Draw(self.im)
        self._fonts = {}

    def font(self, size, bold=False):
        key = (size, bold)
        if key not in self._fonts:
            self._fonts[key] = ImageFont.truetype(FONT_B if bold else FONT_R, int(size * S))
        return self._fonts[key]

    # ---------- primitivas ----------
    def line(self, p1, p2, w=2.2, fill=BLACK):
        self.d.line([p1[0] * S, p1[1] * S, p2[0] * S, p2[1] * S], fill=fill, width=max(1, int(w * S)))

    def dashed(self, p1, p2, w=2.2, dash=12, gap=8, fill=BLACK):
        x1, y1 = p1
        x2, y2 = p2
        total = math.hypot(x2 - x1, y2 - y1)
        if total == 0:
            return
        ux, uy = (x2 - x1) / total, (y2 - y1) / total
        pos = 0.0
        while pos < total:
            end = min(pos + dash, total)
            self.line((x1 + ux * pos, y1 + uy * pos), (x1 + ux * end, y1 + uy * end), w=w, fill=fill)
            pos = end + gap

    def rect(self, x1, y1, x2, y2, w=2.2, outline=BLACK, fill=None, radius=0):
        box = [x1 * S, y1 * S, x2 * S, y2 * S]
        if radius:
            self.d.rounded_rectangle(box, radius=radius * S, outline=outline, fill=fill,
                                     width=max(1, int(w * S)))
        else:
            self.d.rectangle(box, outline=outline, fill=fill, width=max(1, int(w * S)))

    def ellipse(self, cx, cy, rx, ry, w=2.2, outline=BLACK, fill=WHITE):
        self.d.ellipse([(cx - rx) * S, (cy - ry) * S, (cx + rx) * S, (cy + ry) * S],
                       outline=outline, fill=fill, width=max(1, int(w * S)))

    def polygon(self, pts, w=2.2, outline=BLACK, fill=WHITE):
        p = [(x * S, y * S) for x, y in pts]
        self.d.polygon(p, fill=fill)
        self.d.line(p + [p[0]], fill=outline, width=max(1, int(w * S)), joint="curve")

    def disc(self, cx, cy, r, fill=BLACK, outline=None, w=2.2):
        self.d.ellipse([(cx - r) * S, (cy - r) * S, (cx + r) * S, (cy + r) * S],
                       fill=fill, outline=outline, width=max(1, int(w * S)))

    def arrowhead(self, p_from, p_to, size=13, fill=BLACK, open_head=False, w=2.2):
        x1, y1 = p_from
        x2, y2 = p_to
        ang = math.atan2(y2 - y1, x2 - x1)
        a = math.radians(22)
        p1 = (x2 - size * math.cos(ang - a), y2 - size * math.sin(ang - a))
        p2 = (x2 - size * math.cos(ang + a), y2 - size * math.sin(ang + a))
        if open_head:
            self.line(p1, (x2, y2), w=w)
            self.line(p2, (x2, y2), w=w)
        else:
            self.d.polygon([(p1[0] * S, p1[1] * S), (x2 * S, y2 * S), (p2[0] * S, p2[1] * S)], fill=fill)

    def arrow(self, p1, p2, w=2.2, size=13, open_head=False):
        self.line(p1, p2, w=w)
        self.arrowhead(p1, p2, size=size, open_head=open_head, w=w)

    def path(self, pts, w=2.2, size=13, arrow=True, open_head=False):
        for a, b in zip(pts, pts[1:]):
            self.line(a, b, w=w)
        if arrow:
            self.arrowhead(pts[-2], pts[-1], size=size, open_head=open_head, w=w)

    def dashed_path(self, pts, w=2.2, size=13, arrow=True, open_head=True):
        for a, b in zip(pts, pts[1:]):
            self.dashed(a, b, w=w)
        if arrow:
            self.arrowhead(pts[-2], pts[-1], size=size, open_head=open_head, w=w)

    # ---------- texto ----------
    def text(self, x, y, s, size=30, bold=False, anchor="mm", fill=BLACK, leading=1.22, bg=None):
        f = self.font(size, bold)
        lines = s.split("\n")
        lh = size * leading
        total = lh * len(lines)
        if anchor[1] == "m":
            top = y - total / 2
        elif anchor[1] == "a" or anchor[1] == "t":
            top = y
        else:  # bottom
            top = y - total
        for i, ln in enumerate(lines):
            cy = top + lh * i + lh / 2
            if bg is not None:
                tw = self.text_w(ln, size, bold)
                self.d.rectangle([(x - tw / 2 - 4) * S, (cy - lh / 2) * S,
                                  (x + tw / 2 + 4) * S, (cy + lh / 2) * S], fill=bg)
            self.d.text((x * S, cy * S), ln, font=f, fill=fill, anchor=(anchor[0] + "m"))

    def text_w(self, s, size=30, bold=False):
        f = self.font(size, bold)
        return max(self.d.textlength(ln, font=f) for ln in s.split("\n")) / S

    def save(self, path):
        out = self.im.resize((self.w, self.h), Image.LANCZOS)
        out.save(path, "PNG", optimize=True)
        return path


# ---------- geometria ----------
def ellipse_point(c, r, p):
    """Punto del borde de la elipse c=(cx,cy) r=(rx,ry) en direccion a p."""
    dx, dy = p[0] - c[0], p[1] - c[1]
    n = math.hypot(dx / r[0], dy / r[1])
    if n == 0:
        return c
    return (c[0] + dx / n, c[1] + dy / n)


def rect_point(c, half, p):
    """Punto del borde del rectangulo centrado en c con semiejes half hacia p."""
    dx, dy = p[0] - c[0], p[1] - c[1]
    if dx == 0 and dy == 0:
        return c
    tx = half[0] / abs(dx) if dx else float("inf")
    ty = half[1] / abs(dy) if dy else float("inf")
    t = min(tx, ty)
    return (c[0] + dx * t, c[1] + dy * t)


# ---------- actor ----------
def actor(cv, x, y, name, scale=1.0, label_size=30, label_below=True, label_gap=14):
    """Monigote UML. (x, y) es el centro de la cabeza. Devuelve anclas."""
    hr = 17 * scale          # radio cabeza
    body = 46 * scale        # largo del torso
    arm = 30 * scale         # medio ancho de brazos
    leg = 32 * scale
    top = y
    cv.ellipse(x, top, hr, hr, w=2.2)
    y0 = top + hr
    y1 = y0 + body
    cv.line((x, y0), (x, y1), w=2.2)
    ay = y0 + body * 0.30
    cv.line((x - arm, ay), (x + arm, ay), w=2.2)
    cv.line((x, y1), (x - leg, y1 + leg), w=2.2)
    cv.line((x, y1), (x + leg, y1 + leg), w=2.2)
    bottom = y1 + leg
    if label_below:
        cv.text(x, bottom + label_gap, name, size=label_size, anchor="ma")
    return {"head": (x, top - hr), "mid": (x, ay), "left": (x - arm, ay),
            "right": (x + arm, ay), "bottom": bottom}


# ---------- ruteo de asociaciones ----------
def _inside(pt, e, margin=1.06):
    cx, cy, rx, ry = e
    return ((pt[0] - cx) / (rx * margin)) ** 2 + ((pt[1] - cy) / (ry * margin)) ** 2 < 1.0


def segment_blocked(p, q, ellipses, skip=()):
    n = 160
    for i in range(1, n):
        t = i / n
        pt = (p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t)
        for k, e in ellipses.items():
            if k in skip:
                continue
            if _inside(pt, e):
                return True
    return False


def associate(cv, p, target_key, ellipses, w=2.0, gap=55, y_off=0.0, side=None):
    """Une el punto p (actor) con la elipse target_key.

    Traza una recta si no atraviesa otra elipse. Si la atraviesa, hace un solo
    quiebre: se aproxima al costado de la elipse destino y entra en horizontal.
    """
    cx, cy, rx, ry = ellipses[target_key]
    q = ellipse_point((cx, cy), (rx, ry), p)
    if not segment_blocked(p, q, ellipses, skip=(target_key,)):
        cv.line(p, q, w=w)
        return "recta"
    s = side if side else (1 if p[0] > cx else -1)
    for g in (gap, gap + 45, gap + 95, gap + 150):
        knee = (cx + s * (rx + g), cy + y_off)
        entry = ellipse_point((cx, cy), (rx, ry), knee)
        if not segment_blocked(p, knee, ellipses, skip=(target_key,)):
            cv.line(p, knee, w=w)
            cv.line(knee, entry, w=w)
            return "quiebre"
    knee = (cx + s * (rx + gap + 150), cy + y_off)
    entry = ellipse_point((cx, cy), (rx, ry), knee)
    cv.line(p, knee, w=w)
    cv.line(knee, entry, w=w)
    return "forzado"


def note(cv, x1, y1, x2, y2, text, size=28, fold=34, pad=22):
    """Nota UML: rectangulo con la esquina superior derecha doblada."""
    pts = [(x1, y1), (x2 - fold, y1), (x2, y1 + fold), (x2, y2), (x1, y2)]
    cv.polygon(pts, w=2.2)
    cv.line((x2 - fold, y1), (x2 - fold, y1 + fold), w=2.2)
    cv.line((x2 - fold, y1 + fold), (x2, y1 + fold), w=2.2)
    cv.text((x1 + x2) / 2, (y1 + y2) / 2, text, size=size, anchor="mm")


def cylinder(cv, cx, cy, w, h, text, size=30, w_line=2.4):
    """Cilindro (base de datos) con texto centrado."""
    rx, ry = w / 2, h * 0.13
    top, bot = cy - h / 2, cy + h / 2
    S_ = 1
    cv.d.ellipse([(cx - rx) * 3, (top) * 3, (cx + rx) * 3, (top + 2 * ry) * 3],
                 fill=WHITE, outline=BLACK, width=max(1, int(w_line * 3)))
    cv.d.rectangle([(cx - rx) * 3, (top + ry) * 3, (cx + rx) * 3, (bot - ry) * 3],
                   fill=WHITE, outline=None)
    cv.line((cx - rx, top + ry), (cx - rx, bot - ry), w=w_line)
    cv.line((cx + rx, top + ry), (cx + rx, bot - ry), w=w_line)
    cv.d.arc([(cx - rx) * 3, (bot - 2 * ry) * 3, (cx + rx) * 3, bot * 3], 0, 180,
             fill=BLACK, width=max(1, int(w_line * 3)))
    cv.d.ellipse([(cx - rx) * 3, (top) * 3, (cx + rx) * 3, (top + 2 * ry) * 3],
                 outline=BLACK, width=max(1, int(w_line * 3)))
    cv.text(cx, cy + ry * 0.4, text, size=size, anchor="mm")
