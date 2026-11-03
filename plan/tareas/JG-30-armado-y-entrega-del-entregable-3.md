---
id: JG-30
titulo: Armado y entrega de la documentación del Entregable 3 en el portal del curso
persona: jordin
responsable: Jordin García
hito: entrega
prioridad: P1
estado: pendiente
depende_de: [CE-09, JC-08, DM-13, JM-07, CE-11, CE-12, JG-18, JG-28]
programada: 2026-11-04
requisitos: []
pantallas: []
---

# JG-30 · Armado y entrega de la documentación del Entregable 3 en el portal del curso

**Responsable:** Jordin García · **Hito:** entrega · **Prioridad:** P1 · **Programada:** mié 04/11 · **Depende de:** CE-09, JC-08, DM-13, JM-07, CE-11, CE-12, JG-18, JG-28

> **Replanificación del 02/11 (JG-32, `specs/16` decisión 90):** la documentación se sube al portal del curso el **miércoles 04/11 antes de las 9:50**. Meta: antes de las **8:00**. El armado empieza el 03/11 a las 18:00, cuando todos los documentos estén integrados en `develop`. Nada de esta entrega depende de la reunión con el Ing. William.

## Objetivo
Juntar, revisar y entregar la **versión 1.0** de toda la documentación del Entregable 3: los 6 documentos, el README y los anexos A a J, con lo que el proyecto tiene hasta el 03/11.

## Contexto que debes leer
- `specs/17` (documentos, formato y anexos) y la imagen de evaluación del Ing. Manuel Rojas (resumen en `specs/17` §"Qué exige cada entregable")
- `entregable-2/LEEME.md` y `entregable-2/herramientas/armar_documento.py`
- `## Resultado` de CE-09, JC-08, DM-13, JM-07, CE-11, CE-12 y JG-18

## Qué hacer
1. **Anexo H, versión 1.0:** `entregable-3/anexos/anexo-h-capacitacion.md` con el plan de la capacitación: a quién va (por cargo, sin nombres), los temas por rol tomados de los Documentos 3 y 4, la duración y que la fecha se acuerda con INCOVSA antes del 12/11. La evidencia completa la agrega JG-21 en la versión 1.1.
2. `entregable-3/LEEME.md`: qué se entrega, la versión de cada documento y anexo, y qué se completa en la versión 1.1 del 12/11 (despliegue, accesos, transferencia del repositorio y capacitación).
3. Armar con `entregable-2/herramientas/armar_documento.py` el `.docx` de cada documento (o recibirlo de su responsable) y exportar el `.pdf` desde Word, porque el script no genera PDF, y revisar el formato de `specs/17`: carta, márgenes de 2.54 cm, Arial 11 o 12, interlineado 1.5, texto justificado, títulos numerados con estilos e índices automáticos, figuras y tablas identificadas, tabla de control de versiones y citas en APA 7.
4. Reunir los anexos A a J en el orden de `specs/17`.
5. Pedirle a cada responsable que revise el PDF de su documento la noche del 03/11.
6. **La subida al portal la hace Jordin**, no el agente: dejarle la lista de archivos y el orden. Guardar la constancia de la subida (captura) para el Anexo I de la versión 1.1 (CE-15).
7. Comprobar que `develop` tiene el README final y que el repositorio está al día.

## Archivos que creas o modificas
- `entregable-3/anexos/anexo-h-capacitacion.md` (crear), `entregable-3/LEEME.md` (crear)
- Los `.docx` y `.pdf` no se suben al repositorio (`.gitignore`): se guardan en la carpeta local y en el Drive del equipo.

## Criterios de aceptación
1. Los 6 documentos tienen su `.docx` y su `.pdf` con el formato de `specs/17` y la tabla de control de versiones.
2. Los anexos A a J están completos en su versión 1.0, y lo que depende de INCOVSA está marcado como pendiente para la versión 1.1.
3. Jordin subió la documentación al portal del curso antes de las 9:50 del 04/11 y hay constancia.

## Verificación
```
python entregable-2/herramientas/armar_documento.py entregable-3/documento-1
python entregable-2/herramientas/armar_documento.py entregable-3/documento-2
python entregable-2/herramientas/armar_documento.py entregable-3/documento-3
python entregable-2/herramientas/armar_documento.py entregable-3/documento-4
python entregable-2/herramientas/armar_documento.py entregable-3/documento-5
python entregable-2/herramientas/armar_documento.py entregable-3/documento-6
node scripts/tareas.mjs --validar
```

## Fuera de alcance
- La versión 1.1 con el despliegue, los accesos y la capacitación (CE-15 y JG-21).

## Notas
- Si un documento no está integrado a las 18:00 del 03/11, Jordin decide si lo termina como coordinador (protocolo §E4) o se entrega con lo que haya.
