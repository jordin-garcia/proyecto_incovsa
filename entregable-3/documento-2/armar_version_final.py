"""Usa el armador del proyecto y ajusta la maquetación de la versión 1.0 sin modificar la v0.4.

Uso: python entregable-3/documento-2/armar_version_final.py
Los índices siguen siendo campos automáticos de Word; actualizar con Word o LibreOffice antes de exportar.
"""
import importlib.util
import json
from pathlib import Path
from PIL import Image
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

CARPETA = Path(__file__).resolve().parent
RAIZ = CARPETA.parents[1]
spec = importlib.util.spec_from_file_location('armador_inc', RAIZ / 'entregable-2/herramientas/armar_documento.py')
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)


class ArmadorFinal(base.Armador):
    def __init__(self, carpeta, config):
        super().__init__(carpeta, config)
        for nombre in ('Title', 'Subtitle', 'Heading 1', 'Heading 2', 'Heading 3'):
            self.doc.styles[nombre].font.color.rgb = RGBColor(0, 0, 0)
        self.doc.styles['Normal'].paragraph_format.widow_control = True
        self.doc.styles['Texto tabla'].paragraph_format.line_spacing = 1.08
        self.doc.styles['Texto tabla'].paragraph_format.space_after = Pt(3)
        self.doc.styles['Texto tabla'].paragraph_format.space_before = Pt(3)

    def centrado(self, texto, *args, **kwargs):
        p = super().centrado(texto, *args, **kwargs)
        if texto == self.config['titulo_documento']:
            p.style = self.doc.styles['Title']
        return p

    def figura(self, titulo, ruta):
        ruta_abs = Path(self.carpeta) / ruta
        with Image.open(ruta_abs) as im:
            proporcion = im.height / im.width
        ancho = min(self.ancho_util, 22.8)
        # Reserva espacio para el pie de figura dentro de la página horizontal.
        alto_max = 14.7 if self.ancho_util > 20 else 18.0
        ancho = min(ancho, alto_max / proporcion)
        p = self.doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.keep_with_next = True
        p.paragraph_format.line_spacing = 1.0
        p.add_run().add_picture(str(ruta_abs), width=Cm(ancho))
        self.num_fig += 1
        self.leyenda('Figura', titulo)

    def tabla(self, titulo, filas):
        super().tabla(titulo, filas)
        tabla = self.doc.tables[-1]
        cabecera = [c.text for c in tabla.rows[0].cells]
        if cabecera[:2] == ['Campo', 'Tipo']:
            base.fijar_anchos(tabla, [3.6, 2.7, 2.0, 0.8, 3.0, 1.2, self.ancho_util-13.3])
        for fila in tabla.rows:
            for i, celda in enumerate(fila.cells):
                celda.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
                if cabecera[:2] == ['Campo', 'Tipo'] and i in (2, 3, 5):
                    for parrafo in celda.paragraphs:
                        parrafo.alignment = WD_ALIGN_PARAGRAPH.CENTER

    def armar(self):
        salida, nf, nt = super().armar()
        # Bordes y márgenes explícitos para las tablas de portada, versiones y contenido.
        for tabla in self.doc.tables:
            base.repetir_cabecera(tabla.rows[0])
            pr = tabla._tbl.tblPr
            bordes = OxmlElement('w:tblBorders')
            for lado in ('top','left','bottom','right','insideH','insideV'):
                el = OxmlElement('w:'+lado)
                for k,v in (('val','single'),('sz','4'),('color','D9D9D9')):
                    el.set(qn('w:'+k),v)
                bordes.append(el)
            pr.append(bordes)
            margen = OxmlElement('w:tblCellMar')
            for lado,valor in (('top','65'),('bottom','65'),('left','85'),('right','85')):
                el=OxmlElement('w:'+lado);el.set(qn('w:w'),valor);el.set(qn('w:type'),'dxa');margen.append(el)
            pr.append(margen)
        # Word incluye un borde azul en Title en algunas plantillas; la portada no lleva reglas decorativas.
        for raiz in (self.doc.styles.element, self.doc.element):
            for borde in raiz.xpath('.//w:pBdr'):
                borde.getparent().remove(borde)
        self.doc.save(salida)
        return salida, nf, nt


if __name__ == '__main__':
    config = json.loads((CARPETA/'documento.json').read_text())
    salida,nf,nt = ArmadorFinal(str(CARPETA),config).armar()
    print(f'Listo: {salida} · {nf} figuras · {nt} tablas')
