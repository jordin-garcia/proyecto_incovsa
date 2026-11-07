# Entregable No. 3: contenido de esta carpeta

**Entrega académica:** miércoles 4 de noviembre de 2026, antes de las 9:50, en el portal del curso · **Entrega final a INCOVSA:** jueves 12 de noviembre de 2026 (`specs/16`, decisión 90)

La especificación vigente del proyecto está en [`../specs/`](../specs/README.md). Si algo de esta carpeta la contradice, vale lo que dice `specs/`.

## Qué se entrega el 04/11 (versión 1.0)

La versión 1.0 documenta el sistema tal como está en `develop` el 03/11/2026. INCOVSA todavía no entrega el acceso al VPS, el DNS de incovsa.com ni las cuentas de Cloudflare (P-10, P-93 y P-94), así que el sistema no está desplegado: lo que depende de eso queda marcado como pendiente para la versión 1.1.

| Fuente | Documento que genera | Versión | Responsable |
|---|---|---|---|
| `documento-1/` | `Documento 1 - Memoria general y especificacion del sistema v1.0.docx`, con los anexos A a E | 1.0 | Carlos Hugo Escobar |
| `documento-2/` | `Documento 2 - Documentacion tecnica del sistema v1.0.docx` | 1.0 | José Daniel Cifuentes |
| `documento-3/` | `Documento 3 - Manual de usuario de la administracion del sitio v1.0.docx` | 1.0 | Daniela Marín |
| `documento-4/` | `Documento 4 - Manual de usuario del sistema logistico v1.0.docx` | 1.0 | Josué Menéndez |
| `documento-5/` | `Documento 5 - Manual tecnico de instalacion despliegue y mantenimiento v1.0.docx`, con los anexos H, I y J | 1.0 | Carlos Hugo Escobar |
| `documento-6/` | `Documento 6 - Plan y evidencias de pruebas v1.0.docx`, con los anexos F y G | 1.0 | Jordin García |
| [`../README.md`](../README.md) | El README del repositorio, con sus 16 secciones | Final | Carlos Hugo Escobar |

## Dónde está cada anexo

Los anexos van en el orden de `specs/17`, al final del documento con el que se relacionan. Los anexos H, I y J son de la entrega a INCOVSA y van al final del Documento 5; sus fuentes están en `anexos/`, porque las completan otras tareas en la versión 1.1:

| Anexo | Contenido | Dónde está | Versión 1.0 |
|---|---|---|---|
| A | Actas de reuniones | Documento 1 (`documento-1/90-anexo-a-actas.md`) | Las actas de las cinco reuniones |
| B | Evidencias del levantamiento de requerimientos | Documento 1 (`documento-1/91-anexo-b-evidencias.md`) | La evidencia de cada reunión; la de las fuentes sin acta sigue pendiente (P-04) |
| C | Prototipos aprobados | Documento 1 (`documento-1/92-anexo-c-prototipos.md`) | Las capturas del prototipo aprobado |
| D | Matriz completa de requerimientos | Documento 1 (`documento-1/93-anexo-d-matriz.md`) | La matriz con las tareas y las pruebas de cada código |
| E | Reglas y tablas de conversión | Documento 1 (`documento-1/94-anexo-e-conversion.md`) | La conversión y los 15 casos validados |
| F | Casos de prueba | Documento 6 (`documento-6/90-anexo-f-casos-de-prueba.md`) | 111 casos con su resultado |
| G | Evidencias de pruebas | Documento 6 (`documento-6/91-anexo-g-evidencias.md`) | Las ejecuciones, los informes y las capturas |
| H | Evidencia de capacitación | Documento 5 (`anexos/anexo-h-capacitacion.md`) | El plan de la capacitación |
| I | Evidencia de entrega | Documento 5 (`anexos/anexo-i-evidencia-de-entrega.md`) | El acta de la entrega a INCOVSA, lista para firmarse |
| J | Inventario de servicios y accesos | Documento 5 (`anexos/anexo-j-servicios-y-accesos.md`) | Los servicios, con lo que INCOVSA no ha entregado marcado como pendiente |

## Qué se sube al portal del curso

La subida la hace Jordin. Se suben los 6 PDF, en este orden:

1. `Documento 1 - Memoria general y especificacion del sistema v1.0.pdf` (incluye los anexos A a E)
2. `Documento 2 - Documentacion tecnica del sistema v1.0.pdf`
3. `Documento 3 - Manual de usuario de la administracion del sitio v1.0.pdf`
4. `Documento 4 - Manual de usuario del sistema logistico v1.0.pdf`
5. `Documento 5 - Manual tecnico de instalacion despliegue y mantenimiento v1.0.pdf` (incluye los anexos H, I y J)
6. `Documento 6 - Plan y evidencias de pruebas v1.0.pdf` (incluye los anexos F y G)
7. El enlace del repositorio, con el README final: https://github.com/jordin-garcia/proyecto_incovsa

Se guarda una captura de la constancia de la subida. Va a la versión 1.1 del Anexo I (CE-15).

## Qué se completa en la versión 1.1 (12/11)

| Qué | Dónde | Tarea |
|---|---|---|
| Primer despliegue a producción, y la matriz de navegadores y ZAP repetidos en producción | Documento 6, secciones 6 a 8 | JG-19 |
| Datos de producción (servidor, dominio, almacenamiento y respaldos) | Documento 5 y anexos I y J | CE-15 |
| Entrega de los accesos y transferencia del repositorio a INCOVSA | Anexos I y J | CE-15 |
| Constancia de la entrega académica del 04/11 | Anexo I | CE-15 |
| Capacitación al personal de INCOVSA y prueba del panel sin ayuda | Anexo H y Documento 6, sección 12 | JG-20 y JG-21 |
| Reautenticación y contraseñas fáciles de adivinar (CP-111) | Documentos 2 y 6 | CE-14 |
| Convergencia final, documentación de seguridad e incidencias pendientes | Documento 1 (Anexo D), Documento 2 y Documento 6 (secciones 7 y 13) | JG-17 y JG-27 |
| Lo que salga de la reunión con el Ing. William Ambrossio | Los documentos que correspondan | JG-17 |
| Cambios de `specs/` de JG-33 y JG-34, como RF-SW-29 eliminado y RF-SW-02 sin valores | Documento 1 (capítulos 1, 2, 3 y 5 y Anexo D) y Documento 2 (§1) | JG-35 |
| Sin el bloque Valores (JG-34) y con los ajustes de la capacitación | Documento 3 | JG-35 |
| Botones para mover los pedidos seleccionados (JG-33) y ajustes de la capacitación | Documento 4 | JG-35 |
| Revisión de los pendientes, tabla de control de versiones y armado de los `.docx` | Los 6 documentos | JG-35 |

## Qué se entrega el 12/11 (versión 1.1)

**(06/11, decisión de Jordin)** La versión 1.1 se entrega **solo a INCOVSA**, en archivos de Word (`.docx`), en la presentación del jueves 12/11 (JG-31). No se sube al portal del curso, que se queda con la versión 1.0 del 04/11, ni se generan sus PDF. La arma JG-35 el 11/11 y la entrega Jordin. Si un documento no cambió, se entrega en su versión 1.0.

| Archivo | Versión |
|---|---|
| `Documento 1 - Memoria general y especificacion del sistema v1.1.docx`, con los anexos A a E | 1.1 |
| `Documento 2 - Documentacion tecnica del sistema v1.1.docx` | 1.1 |
| `Documento 3 - Manual de usuario de la administracion del sitio v1.1.docx` | 1.1 |
| `Documento 4 - Manual de usuario del sistema logistico v1.1.docx` | 1.1 |
| `Documento 5 - Manual tecnico de instalacion despliegue y mantenimiento v1.1.docx`, con los anexos H, I y J | 1.1 |
| `Documento 6 - Plan y evidencias de pruebas v1.1.docx`, con los anexos F y G | 1.1 |

Además, ese día: el Anexo I impreso para firmarse, los accesos del Anexo J en persona y la transferencia del repositorio (CE-15).

## Cómo se arma un documento

Requiere Python 3 con `python-docx` y Pillow, y Microsoft Word para actualizar los índices y exportar el PDF. Desde la raíz del repositorio:

```
python entregable-2/herramientas/armar_documento.py entregable-3/documento-1
python entregable-2/herramientas/armar_documento.py entregable-3/documento-2
python entregable-3/documento-2/armar_version_final.py
python entregable-2/herramientas/armar_documento.py entregable-3/documento-3
python entregable-2/herramientas/armar_documento.py entregable-3/documento-4
python entregable-2/herramientas/armar_documento.py entregable-3/documento-5
python entregable-2/herramientas/armar_documento.py entregable-3/documento-6
```

- El Documento 2 tiene un segundo paso, `armar_version_final.py`, que ajusta las figuras, las tablas y los estilos. Para regenerar también sus figuras y comprobar el diccionario de datos, se sigue el procedimiento completo de `documento-2/README.md`.
- Los `.docx` quedan en esta carpeta. Para el PDF, se abre cada uno en Word, se selecciona todo y se actualizan los campos con F9 y se guarda como PDF, o se usa `entregable-2/herramientas/actualizar_indices.ps1`.
- La portada lee los nombres y carnés de `equipo.local.json`, que no se sube al repositorio.
- Los `.docx` y los `.pdf` no se suben al repositorio (`.gitignore`): se guardan en la carpeta local y en el Drive del equipo.
