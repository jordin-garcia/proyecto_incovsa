---
id: JG-35
titulo: Armado y entrega de la versión 1.1 de la documentación a INCOVSA
persona: jordin
responsable: Jordin García
hito: entrega
prioridad: P1
estado: pendiente
depende_de: [JG-17, JG-27, CE-14, JG-19, JG-21, CE-15]
programada: 2026-11-11
requisitos: []
pantallas: []
---

# JG-35 · Armado y entrega de la versión 1.1 de la documentación a INCOVSA

**Responsable:** Jordin García · **Hito:** entrega · **Prioridad:** P1 · **Programada:** mié 11/11 · **Depende de:** JG-17, JG-27, CE-14, JG-19, JG-21, CE-15

## Objetivo
Juntar, revisar y dejar lista la **versión 1.1** de toda la documentación del Entregable 3 para la entrega final a INCOVSA del jueves 12/11 (`specs/16`, decisión 90). Es el equivalente de JG-30 para la versión 1.0. La versión 1.1 se entrega **solo a INCOVSA, en archivos de Word (`.docx`)**, y no se sube al portal del curso, que se queda con la versión 1.0 del 04/11 (decisión de Jordin del 06/11).

## Contexto que debes leer
- `entregable-3/LEEME.md` › "Qué se completa en la versión 1.1 (12/11)" y "Qué se entrega el 12/11 (versión 1.1)"
- `specs/17` (formato y anexos) y `specs/16`, decisión 90
- `## Resultado` de JG-30 (cómo se armó la versión 1.0) y de JG-17, JG-27, CE-14, JG-19, JG-21 y CE-15
- `## Resultado` de JG-33 y JG-34 y su entrada en `plan/bitacora/jordin.md`: lo que cambiaron en la aplicación después del corte de la versión 1.0 (03/11)

## Qué hacer
1. **Comprobar que cada tarea dejó su parte en las fuentes**, según la tabla de "Qué se completa en la versión 1.1" de `entregable-3/LEEME.md`. Lo que falte se completa aquí como coordinador (protocolo §E1):
   - Documento 1, Anexo D: las filas de los códigos que cerraron JG-17, JG-27, CE-14, JG-19 y JG-21;
   - Documento 2: la seguridad de CE-14 y JG-27, y el corte de la versión (`01-introduccion-y-arquitectura.md` dice «`develop` al 03/11/2026»);
   - Documento 5 y anexos H, I y J: CE-15 y JG-21;
   - Documento 6: secciones 6 a 8 (JG-19), 12 (JG-21) y 13 (JG-17 y JG-27), y los anexos F y G.
   - Documentos 1 y 2: los cambios de `specs/` que hicieron JG-33 y JG-34 después del corte. Por ejemplo, RF-SW-29 quedó eliminado y RF-SW-02 ya no incluye los valores (`specs/04`). Eso cambia el Documento 1 (capítulos 1, 2, 3 y 5 y Anexo D, cuyo texto y estado de cada código son los de `specs/`) y el §1 del Documento 2.
2. **Documento 3** (autorizado por Jordin el 06/11): quitar el bloque Valores, que JG-34 quitó del sitio y del panel (`04-informacion-institucional.md` y `05-historia-mision-vision-valores.md`, con sus capturas), y aplicar los ajustes que dejó la capacitación (JG-21).
3. **Documento 4:** describir los botones para mover los pedidos seleccionados a una opción de envío, que agregó JG-33 (`08-pedidos-pendientes.md`), y aplicar los ajustes que dejó la capacitación (JG-21). Reemplazar las capturas que ya no coincidan con la aplicación.
4. **Buscar lo que quedó como pendiente** en las fuentes de los 6 documentos y del README, por ejemplo con `grep -rn -i "pendiente\|versión 1.1" entregable-3/`. Si ya está hecho, se actualiza. Si sigue pendiente, se deja con el motivo.
5. **Tabla de control de versiones:** en el `documento.json` de los Documentos 1, 2, 3 y 4, si cambiaron, agregar la fila `1.1` con la fecha y el resumen de los cambios, y cambiar `archivo_salida` y `lugar_fecha` a la versión 1.1. En los Documentos 5 y 6 esa fila es de CE-15 y de JG-21: solo comprobarla y agregarla si falta. Si un documento no cambió, se entrega en su versión 1.0.
6. **Armar los `.docx`** con `entregable-2/herramientas/armar_documento.py` (y `armar_version_final.py` en el Documento 2, como en JG-30). Jordin los abre en Word para actualizar los índices. Comprobar el formato de `specs/17`, como en JG-30, paso 3.
7. **Entrega:** dejarle a Jordin la lista de los `.docx` que se entregan, con su versión, y el Anexo I listo para imprimirse, con esas versiones escritas en «Qué se entrega». **La entrega la hace Jordin** el 12/11, en la presentación (JG-31). No se genera PDF ni se sube nada al portal.

## Archivos que creas o modificas
- `entregable-3/documento-1/**`, `documento-2/**`, `documento-3/**`, `documento-4/**`, `documento-6/**` (modificar; los Documentos 3 y 4 son de Daniela y de Josué: autorizado)
- `entregable-3/anexos/anexo-i-evidencia-de-entrega.md` (modificar: las versiones de los documentos)
- `entregable-3/anexos/**` y `entregable-3/documento-5/**`: lo demás, solo si CE-15 o JG-21 dejaron algo sin terminar
- `entregable-3/LEEME.md` (modificar)
- Los `.docx` no se suben al repositorio (`.gitignore`): se guardan en la carpeta local y en el Drive del equipo.

## Criterios de aceptación
1. Cada fila de "Qué se completa en la versión 1.1" de `entregable-3/LEEME.md` está en las fuentes de su documento, o queda anotada como pendiente con su motivo.
2. Los Documentos 1 y 2 coinciden con `specs/`, y los Documentos 3 y 4 con la aplicación de `develop`: ninguno describe el bloque Valores, y el Documento 4 tiene los botones de JG-33.
3. Cada documento que cambió tiene su `.docx` v1.1, con la fila 1.1 en su tabla de control de versiones y el formato de `specs/17`.
4. Jordin tiene la lista de los `.docx` que se entregan y el Anexo I listo para imprimirse.

## Verificación
```
python entregable-2/herramientas/armar_documento.py entregable-3/documento-1
python entregable-2/herramientas/armar_documento.py entregable-3/documento-2
python entregable-2/herramientas/armar_documento.py entregable-3/documento-3
python entregable-2/herramientas/armar_documento.py entregable-3/documento-4
python entregable-2/herramientas/armar_documento.py entregable-3/documento-5
python entregable-2/herramientas/armar_documento.py entregable-3/documento-6
node scripts/tareas.mjs --validar
npm run formato
```

## Fuera de alcance
- Subir la versión 1.1 al portal del curso o generar sus PDF.
- La transferencia del repositorio y la entrega de los accesos (CE-15 deja los pasos y Jordin los hace el 12/11).

## Notas
- Si una tarea de la que depende no está hecha el 11/11, Jordin decide si se entrega el documento con esa parte como pendiente.
