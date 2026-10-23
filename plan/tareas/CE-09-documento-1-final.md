---
id: CE-09
titulo: Documento 1 final, con las reuniones 4 y 5 y los anexos A a E
persona: carlos
responsable: Carlos Hugo Escobar
hito: entrega
prioridad: P1
estado: bloqueada
bloqueo: Faltan la convergencia de JG-17, que sigue pendiente, las actas en Markdown de las reuniones 4 y 5 (Drive, docs/Reuniones, la 5 fechada el 13/10/2026, P-77) y las evidencias del levantamiento sin fotografías de personas. Carlos aporta el docx v0.2 y esas notas. Si las evidencias no existen, el coordinador lo registra en specs/19. No se inventan actas ni fotos.
depende_de: [CE-01, JG-17]
programada: 2026-10-30
requisitos: []
pantallas: []
---

# CE-09 · Documento 1 final, con las reuniones 4 y 5 y los anexos A a E

**Responsable:** Carlos Hugo Escobar · **Hito:** entrega · **Prioridad:** P1 · **Programada:** vie 30/10 · **Depende de:** CE-01, JG-17

## Objetivo
La versión final del **Documento 1, Memoria general y especificación del sistema**, que todavía refleja el 24/09 (P-77): con los cambios de las reuniones 4 y 5, todo lo de la versión vigente de `specs/`, los diagramas definitivos y los anexos A a E.

## Contexto que debes leer
- `specs/17` (Documento 1: capítulos 1 a 8; anexos A a E) y los lineamientos del docente
- `specs/` **completo** (es la fuente: requisitos, reglas, alcance, exclusiones, actores, decisiones e historial)
- `specs/19`: P-77 (actas de las reuniones 4 y 5 en Markdown; la reunión 5 fue el 13/10, no el 14/10)
- `entregable-1/LEEME.md` (versiones y figuras), `entregable-1/diagramas/` (scripts de las figuras)
- `entregable-2/LEEME.md` y `entregable-2/herramientas/` (cómo se arma un documento desde Markdown)

## Qué hacer
1. Pídele a Carlos el `.docx` del Documento 1 v0.2 (está en la carpeta local y en el Drive del equipo, no en el repositorio) y las notas de las reuniones 4 y 5 (`docs/Reuniones/`, en el Drive).
2. Crear `entregable-3/documento-1/` con `documento.json` y un `.md` por capítulo, en el formato de `entregable-2/herramientas/armar_documento.py`, partiendo del texto de la v0.2 y actualizándolo con `specs/`: alcance y exclusiones (inventario excluido y aprobado por el docente), actores y permisos por usuario, requisitos con su estado, reglas de negocio, casos de uso, metodología, modelado, diseño y arquitectura (con el despliegue), base de datos, seguridad, interfaz, conclusiones y trabajo futuro.
3. Regenerar las figuras 1 a 8 con los scripts de `entregable-1/diagramas/` actualizados al sistema real (casos de uso, actividades, estados, arquitectura y modelos entidad-relación).
4. **Anexos:** A (actas, incluidas las de las reuniones 4 y 5 en Markdown, con la fecha corregida de la reunión 5; P-77), B (evidencias, sin fotografías de personas en el repositorio), C (prototipos aprobados: capturas del prototipo), D (matriz completa de requerimientos con su implementación y su prueba), E (reglas y los 15 casos de conversión validados por INCOVSA).
5. Armar el `.docx` (se guarda en la carpeta local y en el Drive, no en el repositorio).

## Archivos que creas o modificas
- `entregable-3/documento-1/**`, `entregable-1/diagramas/**` (crear y modificar)

## Criterios de aceptación
1. El documento dice lo mismo que la versión vigente de `specs/` y que el sistema implementado; nada de lo eliminado aparece como vigente.
2. Los ocho capítulos y los anexos A a E están completos, con el formato del curso.
3. Las actas de las reuniones 4 y 5 están en Markdown, con la fecha correcta de la reunión 5.

## Verificación
```
python entregable-2/herramientas/armar_documento.py entregable-3/documento-1
```

## Notas
- La portada del documento lee los nombres y carnés de `entregable-3/equipo.local.json`, que no se sube al repositorio (tiene datos personales). Si no existe en tu equipo, pídele a Jordin una copia de `entregable-2/equipo.local.json` y guárdala con ese nombre en `entregable-3/`.
- Los `.docx` y `.pdf` no se suben al repositorio (`.gitignore`): se guardan en la carpeta local y en el Drive del equipo.

## Resultado

La tarea queda `bloqueada`. No está hecha. JG-17 sigue `pendiente`, así que el anexo D no puede cerrar la columna de implementación. Las actas de las reuniones 4 y 5 no están en el repositorio. Las evidencias del anexo B tampoco.

Queda la fuente v0.3 en `entregable-3/documento-1/`, alineada con `specs/` 1.7 en lo que el repositorio sí contiene. El inventario queda fuera del alcance. Los roles vigentes son Gerencia y Soporte.

Las figuras 1 a 8 están en `entregable-3/documento-1/figuras/`. Las 6 a 8 salen de los `.mmd` de `entregable-1/diagramas/`, sin agregar `mermaid-cli` a `package.json`. El anexo C trae capturas del prototipo de simulación aprobado, servido con `node scripts/servir-prototipo.mjs`. No usa las imágenes de la v0.2 ni el módulo de Inventario.

`python entregable-2/herramientas/armar_documento.py entregable-3/documento-1` arma el `.docx` local. No se sube. `equipo.local.json` tampoco.

Siguen como `TODO(CE-09)` el texto de la v0.2, las actas (la reunión 5 es del 13/10/2026, P-77), las evidencias del Drive y la convergencia de JG-17.
