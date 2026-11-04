# Documento 2 versión 1.0

Documentación técnica de JC-08 para el Entregable 3, con corte de `develop` al 03/11/2026. La v0.4 de `entregable-2/` se conserva sin cambios.

Desde la raíz, con Python 3, python-docx y Pillow disponibles:

```sh
python entregable-3/diagramas/generar_figuras.py
python entregable-3/documento-2/verificar_documento.py
python entregable-2/herramientas/armar_documento.py entregable-3/documento-2
python entregable-3/documento-2/armar_version_final.py
```

El armador original es la verificación exigida por la tarea. El segundo armador lo reutiliza y ajusta el tamaño de las figuras a la orientación de página, los anchos del diccionario y los estilos; no modifica la herramienta compartida. El resultado es `entregable-3/Documento 2 - Documentacion tecnica del sistema v1.0.docx`.

La portada necesita `entregable-3/equipo.local.json`, un arreglo de pares nombre/carné. No se sube al repositorio. Tampoco se suben DOCX, PDF ni páginas de revisión visual. El documento generado se guarda localmente y se entrega en el Drive del equipo.

`diagramas/modelo.py` lee `prisma/schema.prisma`: genera las 32 tablas y 240 columnas del diccionario y alimenta las siete vistas del modelo entidad-relación. Reutiliza las descripciones de negocio de `entregable-2/diagramas/modelo.py`; los nombres, tipos, precisión, nulabilidad, claves, relaciones e índices provienen de Prisma. Las fuentes gráficas usan las utilidades UML del proyecto adaptadas a las fuentes de Windows, Linux y macOS.

La prueba coteja las 28 secciones, figuras/rutas/referencias, todas las filas del diccionario contra Prisma y las dependencias directas contra el lock. Incluye cambios deliberados de tipo y nulabilidad que deben ser rechazados y verifica el ejemplo real de extensión de JC-07.

Los índices son campos automáticos de Word. Antes de entregar, actualícelos y revise la paginación del DOCX exportado a PDF. En Windows se puede usar la herramienta de `entregable-2/herramientas/actualizar_indices.ps1`. La revisión de esta tarea también materializa sus resultados para que se puedan leer al abrir el archivo. Con un PDF de la misma maqueta y su texto extraído mediante pdftotext -layout, `materializar_indices.py <docx> <texto-del-pdf>` rellena el resultado visible sin quitar los campos TOC. Después se exporta otra vez y se repite hasta que las páginas citadas se estabilicen; no se reutiliza el texto de un PDF anterior a un cambio de contenido.

La documentación distingue el despliegue diseñado de la puesta en marcha pendiente de accesos; conserva los controles de seguridad pendientes de CE-14 y JG-27 y las incidencias de la matriz más reciente. No cambia el código de la aplicación, sus reglas ni sus dependencias.
