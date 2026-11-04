"""Proyección documental de schema.prisma; no mantiene una copia manual del esquema."""
import importlib.util
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
ESQUEMA = RAIZ / 'prisma/schema.prisma'
# Conserva las descripciones de negocio de la v0.4; estructura, tipos y relaciones salen de Prisma.
spec = importlib.util.spec_from_file_location('descripciones_v04', RAIZ / 'entregable-2/diagramas/modelo.py')
legado = importlib.util.module_from_spec(spec)
spec.loader.exec_module(legado)


def argumento(texto, nombre):
    inicio = texto.find(nombre + '(')
    if inicio < 0:
        return ''
    inicio += len(nombre) + 1
    profundidad, comillas, escape = 1, False, False
    for i in range(inicio, len(texto)):
        c = texto[i]
        if escape:
            escape = False
            continue
        if c == '\\' and comillas:
            escape = True
        elif c == '"':
            comillas = not comillas
        elif not comillas:
            profundidad += (c == '(') - (c == ')')
            if profundidad == 0:
                return texto[inicio:i]
    raise ValueError('Atributo sin cerrar: ' + texto)


def leer_modelo():
    bloques = re.findall(r'^model (\w+) \{\n(.*?)^\}', ESQUEMA.read_text(), re.M | re.S)
    nombres = {n: re.search(r'@@map\("([^"]+)"\)', b)[1] for n, b in bloques}
    resultado = {}
    for nombre, bloque in bloques:
        tabla = nombres[nombre]
        grupo, proposito, anteriores = legado.TABLAS[tabla]
        descripciones = {n.strip(): c[6] for c in anteriores for n in c[0].split(',')}
        relaciones = {}
        for linea in bloque.splitlines():
            if '@relation' not in linea or 'fields:' not in linea:
                continue
            destino = re.match(r'\s*\w+\s+(\w+)', linea)[1]
            campos = re.search(r'fields:\s*\[([^]]+)\]', linea)[1].split(',')
            referencias = re.search(r'references:\s*\[([^]]+)\]', linea)[1].split(',')
            borrado = re.search(r'onDelete:\s*(\w+)', linea)
            for campo, referencia in zip(campos, referencias):
                relaciones[campo.strip()] = (nombres[destino], referencia.strip(), borrado[1] if borrado else 'predeterminado')
        pk_compuesta = re.search(r'@@id\(\[([^]]+)\]', bloque)
        pks = pk_compuesta[1].replace(' ', '').split(',') if pk_compuesta else []
        campos, mapa = [], {}
        for linea in bloque.splitlines():
            m = re.match(r'\s+(\w+)\s+(String|Int|BigInt|Boolean|Decimal|DateTime|Json)(\?)?\s*(.*)', linea)
            if not m:
                continue
            campo, tipo, opcional, atributos = m.groups()
            fisico = re.search(r'(?<!@)@map\("([^"]+)"\)', atributos)
            fisico = fisico[1] if fisico else campo
            mapa[campo] = fisico
            nativo = re.search(r'@db\.(\w+)(?:\(([^)]*)\))?', atributos)
            tipos = {'String': 'text', 'Int': 'integer', 'BigInt': 'bigint', 'Boolean': 'boolean', 'Decimal': 'decimal', 'DateTime': 'timestamp', 'Json': 'jsonb'}
            tipo_sql = tipos[tipo]
            longitud = ''
            if nativo:
                tipo_sql = {'VarChar': 'varchar', 'Char': 'char', 'SmallInt': 'smallint', 'Decimal': 'decimal', 'Timestamptz': 'timestamptz', 'Date': 'date', 'Time': 'time'}[nativo[1]]
                longitud = (nativo[2] or '').replace(' ', '')
            defecto = argumento(atributos, '@default')
            descripcion = descripciones.get(fisico, 'Campo ' + nombre + '.' + campo + '.')
            if fisico == 'ip' and tabla == 'solicitud_contacto':
                descripcion = 'IP de confianza de Caddy; limita a cinco solicitudes en 60 minutos (DM-14).'
            if fisico in ('actualizado_en', 'updated_at'):
                descripcion = 'Fecha de modificación, actualizada por Prisma (@updatedAt).'
            if defecto:
                descripcion += ' Valor inicial: ' + defecto + '.'
            campos.append((fisico, tipo_sql, longitud, '@id' in atributos or campo in pks, relaciones.get(campo, ('', '', ''))[0], bool(opcional), descripcion))
        restricciones = []
        for linea in bloque.splitlines():
            linea = linea.strip()
            if linea.startswith(('@@id(', '@@unique(', '@@index(')):
                restricciones.append(linea)
        for linea in bloque.splitlines():
            m = re.match(r'\s+(\w+)\s+.*(?<!@)@unique(?:\s|$)', linea)
            if m:
                restricciones.append('@unique(' + mapa[m[1]] + ')')
        resultado[tabla] = {'grupo': grupo, 'proposito': proposito, 'campos': campos, 'restricciones': restricciones, 'relaciones': relaciones, 'mapa': mapa, 'modelo': nombre}
    return resultado


MODELO = leer_modelo()
TABLAS = {t: (d['grupo'], d['proposito'], d['campos']) for t, d in MODELO.items()}
UNICAS = [(t, m[1]) for t, d in MODELO.items() for m in [re.match(r'@unique\((\w+)\)', r) for r in d['restricciones']] if m]


def generar_diccionario():
    lineas = ['\\horizontal', '', '# Diccionario de datos', '',
        'Cada tabla, columna, tipo, nulabilidad, clave y relación de esta sección se obtiene de `prisma/schema.prisma`. Las descripciones de negocio conservan el glosario de la v0.4. Las relaciones de Prisma no crean columnas adicionales. La tabla técnica `_prisma_migrations` la administra Prisma Migrate y no forma parte del dominio.', '',
        'Los tipos son de PostgreSQL 18. `timestamptz(3)` representa instantes UTC; `date` y `time(0)` representan calendario y hora sin zona. `decimal(12,3)` conserva tres decimales exactos. PK identifica la clave primaria, FK la tabla referenciada y Nulo indica si se acepta NULL.', '']
    for grupo in ('Acceso', 'Picking', 'Sitio'):
        lineas += ['## Tablas de ' + grupo.lower(), '']
        for tabla, d in MODELO.items():
            if d['grupo'] != grupo:
                continue
            lineas += ['### Tabla ' + tabla, '', '**Propósito:** ' + d['proposito'], '', f'Tabla: Diccionario de {tabla} {{#tab:dic-{tabla.replace("_", "-")}}}', '', '| Campo | Tipo | Longitud o precisión | PK | FK | Nulo | Descripción |', '|---|---|---|---|---|---|---|']
            for n,t,l,pk,fk,nu,desc in d['campos']:
                lineas.append(f'| `{n}` | {t} | {l or "—"} | {"Sí" if pk else ""} | {fk} | {"Sí" if nu else "No"} | {desc.replace(chr(124), "/")} |')
            lineas.append('')
            for restriccion in d['restricciones']:
                lineas += ['- Restricción o índice Prisma: `' + restriccion + '` (nombres de atributos del modelo).']
            for campo, (destino, ref, borrado) in d['relaciones'].items():
                lineas += ['- FK `' + d['mapa'][campo] + '` → `' + destino + '`; referencia `' + ref + '`; eliminación: ' + borrado + '.']
            lineas.append('')
    lineas += ['Las restricciones CHECK y el disparador de inmutabilidad de Bitácora se conservan en la migración `20261017120100_restricciones`: cantidades positivas, dominio de estados/tipos, fechas y pertenencia de imágenes. Véase la sección de reglas de integridad.', '', '\\vertical', '']
    destino = RAIZ / 'entregable-3/documento-2/02b-diccionario-de-datos.md'
    destino.write_text('\n'.join(lineas))
    print(len(MODELO), 'tablas;', sum(len(d['campos']) for d in MODELO.values()), 'columnas →', destino)


if __name__ == '__main__':
    generar_diccionario()
