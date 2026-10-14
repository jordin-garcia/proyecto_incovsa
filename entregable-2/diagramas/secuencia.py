# -*- coding: utf-8 -*-
"""Diagramas de secuencia del Documento 2 (figuras 4 a 8), según specs/06, 07, 08, 05 y 16 (14/10/2026).

Notación UML: participantes arriba con su línea de vida; flecha llena = llamada; flecha discontinua =
respuesta; flecha que vuelve al mismo participante = proceso interno; recuadro «alt»/«opt»/«loop» =
fragmento combinado con su condición.
Uso: python secuencia.py <n> <salida.png>    (n = 4, 5, 6, 7 u 8)
"""
import os
import sys
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(AQUI, "..", "..", "entregable-1", "diagramas"))
from uml import Canvas

FS, PASO = 25, 64

def dibujar(titulo, part, pasos, salida, ancho=360):
    n = len(part)
    W = 120 + n * ancho
    alto_pasos = sum(PASO * (p[0] in ("msg", "ret", "self") and (1 + p[3].count("\n") * 0.45 + (0.6 if p[0] == "self" else 0)) or 0.9) for p in pasos)
    H = int(260 + alto_pasos + 120)
    cv = Canvas(W, H)
    cv.text(40, 44, titulo, size=34, bold=True, anchor="la")
    xs = [100 + ancho / 2 + i * ancho for i in range(n)]
    X = dict(zip([p[0] for p in part], xs))
    for (k, nombre), x in zip(part, xs):
        cv.rect(x - ancho / 2 + 20, 110, x + ancho / 2 - 20, 200, w=2.4, fill=(235, 238, 233))
        cv.text(x, 155, nombre, size=FS, bold=True, anchor="mm")
        cv.dashed((x, 200), (x, H - 110), w=1.6, dash=10, gap=8)
    y = 250
    marcos = []
    for p in pasos:
        t = p[0]
        if t in ("msg", "ret"):
            a, b, txt = X[p[1]], X[p[2]], p[3]
            lineas = txt.count("\n")
            yy = y + lineas * PASO * 0.45
            cv.text((a + b) / 2, yy - 18 - lineas * (FS - 3) * 1.22 / 2, txt, size=FS - 3, anchor="mm", bg=(255, 255, 255))
            if t == "msg":
                cv.arrow((a, yy), (b + (-4 if b > a else 4), yy), w=2.2)
            else:
                cv.dashed_path([(a, yy), (b + (-4 if b > a else 4), yy)], open_head=True, w=2)
            y = yy + PASO
        elif t == "self":
            a, txt = X[p[1]], p[3]
            lineas = txt.count("\n")
            cv.text(a + 26, y + 8, txt, size=FS - 3, anchor="la", bg=(255, 255, 255))
            h = 34 + lineas * (FS - 3) * 1.22
            cv.path([(a, y), (a + 18, y), (a + 18, y + h), (a + 4, y + h)], w=2.2)
            y = y + h + PASO * 0.75
        elif t == "ini":          # abre un fragmento: ("ini", tipo, condición)
            marcos.append((p[1], p[2], y))
            y += PASO * 0.9
        elif t == "sep":          # separador «else» dentro de alt
            tipo, cond, y0 = marcos[-1]
            cv.dashed((60, y - 20), (W - 40, y - 20), w=1.6)
            cv.text(80, y + 2, f"[{p[1]}]", size=FS - 4, anchor="la")
            y += PASO * 0.6
        elif t == "fin":
            tipo, cond, y0 = marcos.pop()
            x1, x2 = 60 + 12 * len(marcos), W - 40 - 12 * len(marcos)
            cv.rect(x1, y0 - 20, x2, y - 14, w=2)
            cv.polygon([(x1, y0 - 20), (x1 + 120, y0 - 20), (x1 + 120, y0 + 6), (x1 + 106, y0 + 20), (x1, y0 + 20)], w=2, fill=(255, 255, 255))
            cv.text(x1 + 12, y0, tipo, size=FS - 3, bold=True, anchor="lm")
            cv.text(x1 + 134, y0, f"[{cond}]", size=FS - 4, anchor="lm")
            y += PASO * 0.3
    fin = int(y + 60)                       # recorta el espacio que sobra al final
    cv.im = cv.im.crop((0, 0, cv.im.width, fin * 3)); cv.h = fin
    print(cv.save(salida))

U, I, S, M, D = "u", "i", "s", "m", "d"
FIG = {
    "4": ("Generación del picking a partir del pedido facturado", [
        ("u", "Facturador"), ("i", "Pantalla de Facturación"), ("s", "Acción del servidor\n(exigirPermiso)"), ("o", "Módulo odoo\n(SheetJS + Zod)"), ("e", "Módulo envios"), ("d", "PostgreSQL")], [
        ("msg", "u", "i", "Carga el archivo .xlsx de Odoo"),
        ("msg", "i", "s", "cargarArchivo(archivo)"),
        ("self", "s", None, "Verifica sesión, permiso\npk.facturacion y sede"),
        ("msg", "s", "o", "leer(archivo)"),
        ("self", "o", None, "≤ 2 MB y contenido .xlsx; agrupa por\nReferencia; solo «Hecho»; cantidad\ny Peso de Conversión > 0 (RN-50)"),
        ("ret", "o", "s", "pedidos facturados y rechazados"),
        ("msg", "s", "d", "INSERT pedido_facturado, detalle\ny bitácora (una transacción)"),
        ("ret", "s", "i", "Resumen de la carga"),
        ("msg", "u", "i", "Selecciona, arrastra y ordena; elige\ncamión, piloto, fecha y hora"),
        ("msg", "i", "s", "mover(ids, opción, antesDe) y\nguardarOpcion(campos)"),
        ("msg", "s", "d", "UPDATE opción y posición"),
        ("msg", "u", "i", "Pulsa «Enviar a Bodega»"),
        ("msg", "i", "s", "enviarOpcion(sede, opción)"),
        ("msg", "s", "e", "enviarOpcion(...)"),
        ("ini", "alt", "falta camión, piloto, fecha u hora"),
        ("ret", "e", "i", "Error de validación (no se guarda nada)"),
        ("sep", "datos completos"),
        ("msg", "e", "d", "Transacción: número del día; INSERT envio,\nlinea_preparacion (producto, lote y peso),\nentrega_ruta, historial y bitácora"),
        ("ret", "e", "s", "Ruta N o Pedido N"),
        ("msg", "s", "i", "Aviso «cambió la sede» (SSE) a Bodega"),
        ("fin",),
    ]),
    "5": ("Conversión de kilogramos a unidades", [
        ("u", "Personal de bodega"), ("i", "Pantalla de Bodega"), ("s", "Acción del servidor\n(exigirPermiso)"), ("b", "Módulo bodega"), ("c", "Módulo conversion"), ("d", "PostgreSQL")], [
        ("msg", "u", "i", "Abre Bodega o el tablero"),
        ("msg", "i", "s", "obtenerCola(sede)"),
        ("self", "s", None, "Verifica permiso pk.bodega y sede"),
        ("msg", "s", "b", "colaDeSede(sede)"),
        ("msg", "b", "d", "SELECT envio En Preparación y\nlinea_preparacion por posición"),
        ("ret", "d", "b", "filas: cantidad_kg y peso_conversion_kg"),
        ("ini", "loop", "por cada línea de preparación"),
        ("msg", "b", "c", "convertir(cantidadKg, pesoKg)"),
        ("self", "c", None, "En gramos enteros: unidades = ⌊g ÷ p⌋;\nresto = g − unidades × p (RN-01, RN-05)"),
        ("ret", "c", "b", "{ unidades, restoKg }"),
        ("fin",),
        ("ret", "b", "s", "líneas con «N unidades + R kg»"),
        ("ret", "s", "i", "Rutas y pedidos con su conversión"),
    ]),
    "6": ("Preparación y cambio de estado de una ruta o un pedido", [
        ("u", "Personal de bodega"), ("i", "Pantalla de Bodega\n(una de varias)"), ("s", "Acción del servidor\n(exigirPermiso)"), ("b", "Módulo bodega"), ("t", "Módulo tiempo-real\n(SSE)"), ("d", "PostgreSQL")], [
        ("msg", "u", "i", "Marca una fila, «Marcar todo»\no «Ordenar por peso»"),
        ("msg", "i", "s", "marcar(linea) / marcarTodo(envio)\n/ ordenarPorPeso(envio)"),
        ("self", "s", None, "Verifica permiso pk.bodega y sede"),
        ("msg", "s", "b", "operación"),
        ("msg", "b", "d", "UPDATE linea_preparacion\n(marcado o posición). Sin bitácora (RN-20, RN-28)"),
        ("msg", "b", "t", "avisar(sede)"),
        ("ret", "t", "i", "«cambió la sede»: todas las pantallas\nvuelven a pedir el estado"),
        ("msg", "u", "i", "Pulsa «Ruta despachada» o\n«Pedido despachado»"),
        ("msg", "i", "s", "despachar(envio)"),
        ("msg", "s", "b", "despachar(envio)"),
        ("ini", "alt", "falta alguna fila por marcar"),
        ("ret", "b", "i", "Error: faltan líneas por marcar"),
        ("sep", "todas las filas marcadas"),
        ("msg", "b", "d", "Transacción: estado En Ruta (ruta) o Despachado\n(pedido), historial_estado y bitácora"),
        ("msg", "b", "t", "avisar(sede)"),
        ("ret", "s", "i", "La ruta pasa a Ruta; el pedido termina"),
        ("fin",),
    ]),
    "7": ("Registro de carga y despacho", [
        ("f", "Facturador"), ("p", "Piloto"), ("i", "Pantallas de Facturación\ny de Ruta"), ("s", "Acción del servidor\n(exigirPermiso)"), ("r", "Módulos envios\ny ruta"), ("d", "PostgreSQL")], [
        ("msg", "f", "i", "Arrastra pedidos facturados a\n«Envío por camión» y elige el camión"),
        ("msg", "i", "s", "guardarOpcion(camión) y mover(...)"),
        ("msg", "s", "d", "UPDATE opcion_envio y pedido_facturado"),
        ("ret", "s", "i", "Peso acumulado frente a la capacidad"),
        ("ini", "opt", "el total excede la capacidad"),
        ("self", "i", None, "Alerta de sobrepeso: solo informa (RN-13)"),
        ("fin",),
        ("msg", "f", "i", "«Enviar a Bodega» (ver figura 4)"),
        ("ret", "i", "f", "Ruta N creada con camión, piloto y fecha"),
        ("msg", "p", "i", "Abre Ruta (después de «Ruta despachada»)"),
        ("msg", "i", "s", "misRutas()"),
        ("self", "s", None, "Rol «Piloto»: solo sus rutas (RN-46)"),
        ("msg", "s", "d", "SELECT envio En Ruta y entrega_ruta"),
        ("ret", "s", "i", "Clientes de la ruta, uno por fila"),
        ("msg", "p", "i", "Reordena y pulsa «Ruta entregada»"),
        ("msg", "i", "s", "entregar(ruta, orden)"),
        ("msg", "s", "r", "entregar(...)"),
        ("msg", "r", "d", "Transacción: recorrido en entrega_ruta,\nestado Entregado, historial y bitácora"),
        ("ret", "s", "i", "Ruta entregada; queda en Reportes"),
    ]),
    "8": ("Publicación o modificación de contenido mediante el panel (CMS)", [
        ("u", "Usuario del sitio"), ("i", "Panel del sitio"), ("s", "Acción del servidor\n(exigirPermiso)"), ("c", "Módulo contenido"), ("r", "Cloudflare R2"), ("d", "PostgreSQL")], [
        ("msg", "u", "i", "Cambia el texto y sube hasta 5 imágenes"),
        ("msg", "u", "i", "Pulsa «Guardar y publicar»"),
        ("msg", "i", "s", "guardarContenido(sección, texto, imágenes)"),
        ("self", "s", None, "Verifica sesión y permiso sit.contenido;\nvalida con Zod (texto y máximo 5 imágenes)"),
        ("msg", "s", "c", "guardar(...)"),
        ("ini", "loop", "por cada imagen nueva"),
        ("self", "c", None, "Valida que sea una imagen por su\ncontenido; el servidor genera el nombre"),
        ("msg", "c", "r", "PutObject(nombre, imagen)"),
        ("ret", "r", "c", "URL de la imagen"),
        ("fin",),
        ("msg", "c", "d", "Transacción: UPDATE contenido_institucional,\nimagen (posición 1 a 5) y bitácora"),
        ("ret", "c", "s", "Contenido publicado"),
        ("ret", "s", "i", "Mensaje «publicado en el sitio»"),
        ("self", "i", None, "El sitio público muestra el cambio en la\nsiguiente visita: galería que rota cada 5 s"),
    ]),
}

if __name__ == "__main__":
    titulo, part, pasos = FIG[sys.argv[1]]
    dibujar(titulo, part, pasos, sys.argv[2])
