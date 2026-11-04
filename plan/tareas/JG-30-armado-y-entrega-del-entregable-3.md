---
id: JG-30
titulo: Armado y entrega de la documentación del Entregable 3 en el portal del curso
persona: jordin
responsable: Jordin García
hito: entrega
prioridad: P1
estado: hecha
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

## Resultado

**Versión 1.0 de la documentación del Entregable 3, armada el 03/11/2026** desde `develop` (commit d63cbf6, con DM-13 integrada).

### Qué se hizo
- **Los 6 documentos** se armaron con `armar_documento.py` (y `armar_version_final.py` en el Documento 2), sin errores: Documento 1 (24 figuras y 43 tablas), 2 (16 y 56), 3 (19 y 0), 4 (27 y 4), 5 (0 y 5) y 6 (17 y 39). Se comprobó el formato de `specs/17` en los 6 `.docx`: carta, márgenes de 2.54 cm, Arial 11, interlineado 1.5, texto justificado, los tres índices automáticos y la tabla de control de versiones. Los Documentos 1, 4 y 5 no citan fuentes externas; los 2, 3 y 6 tienen sus referencias en APA 7.
- **Anexo H v1.0** (`entregable-3/anexos/anexo-h-capacitacion.md`): el plan de la capacitación, con a quién va por cargo (`specs/03`), los temas por rol con los apartados de los Documentos 3 y 4, la duración, la prueba del panel sin ayuda (Documento 6 §12) y la evidencia que agrega la versión 1.1.
- **Anexos H, I y J al final del Documento 5** (decisión de Jordin del 04/11): `entregable-3/documento-5/documento.json` los lee de `entregable-3/anexos/`, como hacen los Documentos 1 (A a E) y 6 (F y G) con los suyos. Sus títulos llevan `{-}` para no numerarse, y todas sus tablas tienen título para quedar identificadas en el índice de tablas.
- **`entregable-3/LEEME.md`:** qué se entrega, la versión de cada documento, dónde está cada anexo (A a E en el Documento 1, F y G en el Documento 6, H a J en el Documento 5, con sus fuentes en `anexos/`), los archivos que se suben al portal y su orden, y lo que se completa en la versión 1.1 del 12/11.
- El README de `develop` es el final: tiene las 16 secciones.
- Revisión en contexto limpio (subagente `revisor`): LISTO, sin hallazgos de corrección. Se aplicaron los opcionales 1, 2, 3 y 5.

### Decisiones
- **Duración de la capacitación: 2 horas, en una sesión para los dos sistemas** (decisión de Jordin del 03/11; `specs/` no la definía).
- Los PDF los exporta Jordin desde Word: el agente no pudo ejecutar `actualizar_indices.ps1`, porque el modo automático bloquea `-ExecutionPolicy Bypass`.
- Las fotografías con personas de la capacitación no van en el Anexo H (el repositorio es público): quedan en el Drive del equipo.

### Cómo usarlo
- Para volver a armar todo: los comandos de «Cómo se arma un documento» en `entregable-3/LEEME.md`.
- **Subida al portal:** la hace Jordin, con los 6 PDF y el enlace del repositorio, en el orden del LEEME. La captura de la constancia se guarda en el Drive del equipo para el Anexo I v1.1.
- **CE-15:** agregue la constancia de la subida al Anexo I y la fila 1.1 en `entregable-3/documento-5/documento.json`. Los anexos H, I y J se arman con el Documento 5.
- **JG-21:** reemplace el plan del Anexo H por la evidencia. Se arma con el Documento 5.
