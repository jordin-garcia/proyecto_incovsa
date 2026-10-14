# -*- coding: utf-8 -*-
"""Genera el diccionario de datos del Documento 2 a partir de diagramas/modelo.py.

Escribe documento-2/02b-diccionario-de-datos.md. Así el diccionario y los diagramas entidad-relación
salen de la misma fuente y no se contradicen.
Uso, desde entregable-2/:  python herramientas/generar_diccionario.py
"""
import io
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(AQUI, "..", "diagramas"))
from modelo import TABLAS, UNICAS

SALIDA = os.path.join(AQUI, "..", "documento-2", "02b-diccionario-de-datos.md")

def celda(t):
    return str(t).replace("|", "\\|")

partes = ["""\\horizontal

# Diccionario de datos

El diccionario documenta cada tabla del esquema de base de datos diseñado para PostgreSQL 18, que se crea con las migraciones de Prisma 7. Las tablas `usuario`, `cuenta`, `sesion` y `verificacion` son las que exige Better Auth, con los campos propios del proyecto agregados a `usuario`. Los tipos son los de PostgreSQL: `varchar(n)` es texto de hasta *n* caracteres, `decimal(12,3)` guarda cantidades con tres decimales exactos y `timestamptz` guarda fecha y hora en UTC.

En cada tabla, la columna PK marca la clave primaria; la columna FK, la tabla a la que apunta la clave foránea, y «Nulo», si el campo puede quedar vacío. Todas las tablas que el equipo diseñó guardan la fecha y hora exactas de creación de cada registro (RN-57).
"""]
grupos = {"Acceso": "Tablas de acceso", "Picking": "Tablas del sistema de picking", "Sitio": "Tablas del sitio web"}
n = 0
for g, titulo in grupos.items():
    partes.append(f"## {titulo}\n")
    for t, (grupo, proposito, campos) in TABLAS.items():
        if grupo != g:
            continue
        n += 1
        partes.append(f"### Tabla {t}\n\n**Propósito:** {proposito}\n")
        partes.append(f"Tabla: Diccionario de la tabla {t} {{#tab:dic-{t.replace('_', '-')}}}\n")
        partes.append("| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |\n|---|---|---|---|---|---|---|")
        for c in campos:
            nombre, tipo, lon, pk, fk, nulo, desc = c
            partes.append(f"| `{celda(nombre)}` | {tipo} | {lon or '—'} | {'Sí' if pk else ''} | {fk or ''} | {'Sí' if nulo else 'No'} | {celda(desc)} |")
        un = [u for tt, u in UNICAS if tt == t]
        if un:
            partes.append("\nRestricciones de unicidad: " + "; ".join(f"`{u}`" for u in un) + ".")
        partes.append("")
partes.append("\\vertical")
io.open(SALIDA, "w", encoding="utf-8").write("\n".join(partes) + "\n")
print(f"{n} tablas · {os.path.abspath(SALIDA)}")
