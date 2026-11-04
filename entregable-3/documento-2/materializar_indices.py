"""Rellena el resultado visible de los campos TOC a partir del PDF de la misma maqueta.

Uso: python materializar_indices.py <docx> <texto-del-pdf>
Obtenga el texto con pdftotext -layout. Repita exportación y materialización hasta estabilizar páginas.
Los campos TOC quedan editables y actualizables en Word; no se convierten a una lista sin campo.
"""
import re
import sys
import unicodedata
from pathlib import Path
from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn


def normalizar(texto):
    return ''.join(c for c in unicodedata.normalize('NFKD', texto).lower() if c.isalnum())


def materializar(docx, texto_pdf):
    doc = Document(docx)
    paginas = [normalizar(p) for p in Path(texto_pdf).read_text().split('\f')]
    inicio = next(i for i, p in enumerate(paginas) if normalizar('Este documento explica cómo está construida') in p)
    entradas = {'general': [], 'Figura': [], 'Tabla': []}
    for p in doc.paragraphs:
        texto = p.text.strip()
        estilo = p.style.name
        if estilo.startswith('Heading '):
            grupo = 'general'
            nivel = int(estilo.split()[-1])
        elif estilo == 'Caption' and texto.startswith(('Figura ', 'Tabla ')):
            grupo = texto.split()[0]
            nivel = 1
        else:
            continue
        buscado = normalizar(texto)
        coincidencias = [i + 1 for i, pagina in enumerate(paginas) if i >= inicio and buscado in pagina]
        if not coincidencias:
            raise ValueError('No se localizó en el PDF: ' + texto)
        entradas[grupo].append((texto, coincidencias[0], nivel))
    campos = []
    for p in doc.paragraphs:
        instrucciones = p._p.findall('.//' + qn('w:instrText'))
        instruccion = ''.join(x.text or '' for x in instrucciones)
        if instruccion.strip().startswith('TOC '):
            grupo = 'Figura' if '"Figura"' in instruccion else 'Tabla' if '"Tabla"' in instruccion else 'general'
            campos.append((p, instruccion, grupo))
    if len(campos) != 3:
        raise ValueError('Se requieren los tres campos TOC del armador original')
    # Quita los resultados anteriores de cada campo, incluyendo resultados en varios párrafos.
    for original, instruccion, grupo in campos:
        primero = original._p
        padre = primero.getparent()
        cursor = primero
        while True:
            siguiente = cursor.getnext()
            fin = any(e.get(qn('w:fldCharType')) == 'end' for e in cursor.findall('.//' + qn('w:fldChar')))
            if cursor is not primero:
                padre.remove(cursor)
            if fin:
                break
            if siguiente is None:
                raise ValueError('Campo TOC sin cierre')
            cursor = siguiente
        for hijo in list(primero):
            primero.remove(hijo)
        def run_elemento(p, tag, atributos=None, texto=None):
            r=OxmlElement('w:r'); el=OxmlElement(tag)
            for k,v in (atributos or {}).items():el.set(qn(k),v)
            if texto is not None:
                el.text=texto;el.set(qn('xml:space'),'preserve')
            r.append(el);p.append(r)
        run_elemento(primero,'w:fldChar',{'w:fldCharType':'begin','w:dirty':'false'})
        run_elemento(primero,'w:instrText',texto=instruccion)
        run_elemento(primero,'w:fldChar',{'w:fldCharType':'separate'})
        actual=primero
        for n,(texto,pagina,nivel) in enumerate(entradas[grupo]):
            if n:
                nuevo=OxmlElement('w:p');actual.addnext(nuevo);actual=nuevo
            pr=OxmlElement('w:pPr')
            estilo=OxmlElement('w:pStyle');estilo.set(qn('w:val'),f'toc{nivel}' if grupo=='general' else 'tableoffigures');pr.append(estilo)
            tabs=OxmlElement('w:tabs');tab=OxmlElement('w:tab');tab.set(qn('w:val'),'right');tab.set(qn('w:leader'),'dot');tab.set(qn('w:pos'),'9350');tabs.append(tab);pr.append(tabs)
            actual.insert(0,pr)
            run_elemento(actual,'w:t',texto=texto)
            run_elemento(actual,'w:tab')
            run_elemento(actual,'w:t',texto=str(pagina))
        run_elemento(actual,'w:fldChar',{'w:fldCharType':'end'})
    # Evita sustituir los resultados visibles por un aviso al abrir; Word puede actualizar los campos a petición.
    for e in doc.settings.element.findall(qn('w:updateFields')):
        e.set(qn('w:val'),'false')
    doc.save(docx)
    resultado={g:[p for _,p,_ in filas] for g,filas in entradas.items()}
    print('Índices materializados:', ', '.join(f'{g} {len(f)}' for g,f in entradas.items()))
    return resultado


if __name__=='__main__':
    if len(sys.argv)!=3:
        raise SystemExit(__doc__)
    materializar(sys.argv[1],sys.argv[2])
