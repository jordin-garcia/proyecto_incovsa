# Entregable No. 2: contenido de esta carpeta

**Fecha de entrega:** miércoles 14 de octubre de 2026 · **Valor:** 10 puntos

La especificación vigente del proyecto está en [`../specs/`](../specs/README.md). Si algo de esta carpeta la contradice, vale lo que dice `specs/`.

## Documentos

| Fuente | Documento que genera |
|---|---|
| `documento-2/` | `Documento 2 - Documentacion tecnica del sistema v0.3.docx` (se conservan la v0.1 del 12/10 y la v0.2 del 14/10, la entregada) |
| `nota-inventario/` | `Nota - Exclusion del control de inventario.docx`, para el Ing. Manuel Rojas (P-58) |

Los `.docx` y `.pdf` no se suben al repositorio; se guardan en la carpeta local y en el Google Drive del equipo. Lo que se versiona es el Markdown de cada documento.

## Cómo se arma un documento

Requiere Python 3 con `python-docx` y Pillow, y Microsoft Word para actualizar los índices. Desde esta carpeta:

```
python herramientas/generar_diccionario.py
python herramientas/armar_documento.py documento-2
powershell -ExecutionPolicy Bypass -File herramientas/actualizar_indices.ps1 "Documento 2 - Documentacion tecnica del sistema v0.3.docx" "Documento 2 - Documentacion tecnica del sistema v0.3.pdf"
```

1. `generar_diccionario.py` escribe `documento-2/02b-diccionario-de-datos.md` a partir de `diagramas/modelo.py`, la misma fuente de los diagramas entidad-relación.
1. `armar_documento.py` lee `documento.json` y los `.md` de la carpeta, y escribe el `.docx` con el formato de los lineamientos: carta, márgenes de 2.54 cm, Arial 11, interlineado 1.5, texto justificado, títulos numerados, índices automáticos y número de página.
2. `actualizar_indices.ps1` abre el `.docx` en Word, actualiza el índice general y los de figuras y tablas, lo guarda y, si se indica, lo exporta a PDF.

La portada lee los nombres y carnés del archivo local `equipo.local.json` (`[["Nombre", "Carné"], ...]`), que no se sube al repositorio.

El formato de Markdown que entiende el generador está al inicio de `herramientas/armar_documento.py`.

## Figuras

| Figura | Fuente |
|---|---|
| `figuras/figura-1-arquitectura.png` | `diagramas/figura-1-arquitectura.py` |
| `figuras/figura-2-componentes.png` | `diagramas/figura-2-componentes.py` |
| `figuras/figura-3-clases.png` | `diagramas/figura-3-clases.py` |
| `figuras/figura-4-secuencia-picking.png` a `figura-8-secuencia-cms.png` | `diagramas/secuencia.py` (4 a 8) |
| `figuras/figura-9-er-acceso.png`, `figura-10-er-picking.png` y `figura-11-er-sitio.png` | `diagramas/er.py` (acceso, picking y sitio), con el modelo de `diagramas/modelo.py` |

Para volver a generarlas, desde `diagramas/`:

```
python figura-1-arquitectura.py ../figuras/figura-1-arquitectura.png
python figura-2-componentes.py ../figuras/figura-2-componentes.png
python figura-3-clases.py ../figuras/figura-3-clases.png
python secuencia.py 4 ../figuras/figura-4-secuencia-picking.png
python secuencia.py 5 ../figuras/figura-5-secuencia-conversion.png
python secuencia.py 6 ../figuras/figura-6-secuencia-preparacion.png
python secuencia.py 7 ../figuras/figura-7-secuencia-carga-despacho.png
python secuencia.py 8 ../figuras/figura-8-secuencia-cms.png
python er.py acceso ../figuras/figura-9-er-acceso.png
python er.py picking ../figuras/figura-10-er-picking.png
python er.py sitio ../figuras/figura-11-er-sitio.png
```

Usan las funciones de dibujo de `../entregable-1/diagramas/uml.py`, para que las figuras de los dos documentos tengan el mismo estilo.
