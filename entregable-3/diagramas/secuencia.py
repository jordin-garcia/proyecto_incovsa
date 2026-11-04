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
sys.path.insert(0, AQUI)
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
            ultimo = p[1] == part[-1][0]
            lado = -1 if ultimo else 1
            cv.text(a + 26 * lado, y + 8, txt, size=FS - 3, anchor="ra" if ultimo else "la", bg=(255, 255, 255))
            h = 34 + lineas * (FS - 3) * 1.22
            cv.path([(a, y), (a + 18 * lado, y), (a + 18 * lado, y + h), (a + 4 * lado, y + h)], w=2.2)
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

# Participantes resumidos: la columna servidor reúne la acción autorizada y el servicio indicado.
FIG = {
 "4": ("Carga y envío a Bodega", [("u","Facturador"),("i","Facturación"),("s","Servidor\nacciones y servicios"),("d","PostgreSQL")], [
 ("msg","u","i","Carga XLSX y confirma"),
 ("msg","i","s","cargarArchivo; sesión, pk.facturacion y sede"),
 ("self","s",None,"leerArchivoOdoo: ZIP, topes,\nprimera hoja y validación de pedidos"),
 ("msg","s","d","guardarCargaDeOdoo: pedidos, detalles\ny Bitácora en una transacción"),
 ("ret","s","i","Resumen de aceptados y rechazados"),
 ("msg","u","i","Arma opción y confirma Enviar a Bodega"),
 ("msg","i","s","enviarOpcionABodega(estadoEsperado)"),
 ("msg","s","d","Bloqueo sede + opción; validar estado;\ncrear envío, líneas, entregas, historial y Bitácora"),
 ("ret","d","s","Commit o rollback completo"),
 ("ret","s","i","Ruta/Pedido; avisarCambio después del commit")]),
 "5": ("Conversión exacta para presentación", [("u","Personal de Bodega"),("i","Bodega y tablero"),("s","Servidor\nautorización y lectura"),("c","conversion\nservicio puro")], [
 ("msg","u","i","Abre Bodega"),
 ("msg","i","s","Sesión, pk.bodega y sede"),
 ("self","s",None,"Consulta En Preparación, líneas\ny cantidades Decimal de PostgreSQL"),
 ("ret","s","i","Datos mínimos; cantidades como texto exacto"),
 ("msg","i","c","convertir(cantidadKg, pesoConversionKg)"),
 ("self","c",None,"BigInt en gramos; peso > 0;\ncociente entero y resto, sin redondear"),
 ("ret","c","i","Unidades y resto en kg"),
 ("ret","i","u","N unidades + R kg; omite resto cero")]),
 "6": ("Preparación compartida y despacho", [("u","Personal de Bodega"),("i","Bodega o tablero"),("s","Servidor\nacciones de Bodega"),("d","PostgreSQL")], [
 ("msg","u","i","Marca, reordena u ordena por peso"),
 ("msg","i","s","Acción: sesión, pk.bodega, sede y Zod"),
 ("msg","s","d","Verificar En Preparación; guardar\nmarcado/orden; sin Bitácora"),
 ("ret","s","i","avisarCambio; refresco autorizado por SSE"),
 ("msg","u","i","Confirma Ruta/Pedido Despachado"),
 ("msg","i","s","despacharAccion; validar contexto"),
 ("msg","s","d","Bloquear envío; exigir todas marcadas;\nestado, historial y Bitácora en transacción"),
 ("ret","d","s","Commit: En Ruta o Despachado"),
 ("ret","s","i","Aviso SSE posterior; actualizar cola")]),
 "7": ("Carga y entrega de ruta", [("u","Facturador o piloto"),("i","Facturación y Ruta"),("s","Servidor\nenvios y ruta"),("d","PostgreSQL")], [
 ("msg","u","i","Elige camión, piloto, fecha y hora"),
 ("msg","i","s","Guardar campos; permiso y sede"),
 ("msg","s","d","Guardar opción; sumar peso exacto"),
 ("ret","s","i","Ocupación; sobrepeso solo informativo"),
 ("msg","u","i","Envía a Bodega y se despacha (figuras previas)"),
 ("msg","i","s","listarRutasEnRuta: permiso, sede y asignación"),
 ("ret","s","i","Solo rutas propias del piloto en la sede activa"),
 ("msg","u","i","Reordena clientes y confirma Ruta Entregada"),
 ("msg","i","s","entregarRutaAccion"),
 ("msg","s","d","Bloquear ruta; guardar orden actual,\nEntregado, historial y Bitácora; commit"),
 ("ret","s","i","avisarCambio; recorrido disponible en Reportes")]),
 "8": ("Publicación de contenido e imágenes", [("u","Usuario del sitio"),("i","Panel"),("s","Servidor\ncontenido y almacenamiento"),("r","PostgreSQL y R2")], [
 ("msg","u","i","Edita texto/galería; Guardar y publicar"),
 ("msg","i","s","Publicación multipart: sesión y permiso"),
 ("self","s",None,"Validar origen y Zod; texto ≤10 000;\nmáximo 5 imágenes JPG/PNG/WebP ≤5 MB"),
 ("msg","s","r","Recodificar con sharp; subir WebP a R2\n(disco en desarrollo/CI)"),
 ("msg","s","r","Transacción SQL: contenido, posiciones,\nURL de imágenes y Bitácora"),
 ("ret","r","s","Commit; si falla SQL, compensar objetos nuevos"),
 ("msg","s","r","Tras commit, eliminar imágenes reemplazadas"),
 ("ret","s","i","Revalidar sitio y panel; confirmar publicación")])
}

if __name__ == "__main__":
    titulo, part, pasos = FIG[sys.argv[1]]
    dibujar(titulo, part, pasos, sys.argv[2], ancho=430)
