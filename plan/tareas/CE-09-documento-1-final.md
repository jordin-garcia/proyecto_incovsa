---
id: CE-09
titulo: Documento 1 final, con las reuniones 4 y 5 y los anexos A a E
persona: carlos
responsable: Carlos Hugo Escobar
hito: entrega
prioridad: P1
estado: hecha
depende_de: [CE-01]
programada: 2026-11-03
requisitos: []
pantallas: []
---

# CE-09 · Documento 1 final, con las reuniones 4 y 5 y los anexos A a E

**Responsable:** Carlos Hugo Escobar · **Hito:** entrega · **Prioridad:** P1 · **Programada:** mar 03/11 · **Depende de:** CE-01

> **Replanificación del 02/11 (JG-32, `specs/16` decisión 90):** esta tarea ya no espera a JG-17 ni al despliegue. Documenta el sistema tal como está en `develop` y se integra a más tardar el **martes 03/11 a las 18:00**, para que Jordin arme la entrega del 04/11 (JG-30). Nada de esta versión 1.0 depende de la reunión con el Ing. William: lo que salga de ella se agrega en la versión 1.1 del 12/11.

## Objetivo
La versión final del **Documento 1, Memoria general y especificación del sistema**, que todavía refleja el 24/09 (P-77): con los cambios de las reuniones 4 y 5, todo lo de la versión vigente de `specs/`, los diagramas definitivos y los anexos A a E.

## Contexto que debes leer
- `specs/17` (Documento 1: capítulos 1 a 8; anexos A a E) y los lineamientos del docente
- `specs/` **completo** (es la fuente: requisitos, reglas, alcance, exclusiones, actores, decisiones e historial)
- `specs/19`: P-77 (actas de las reuniones 4 y 5 en Markdown; la reunión 5 fue el 13/10, no el 14/10)
- `entregable-1/LEEME.md` (versiones y figuras), `entregable-1/diagramas/` (scripts de las figuras)
- `entregable-2/LEEME.md` y `entregable-2/herramientas/` (cómo se arma un documento desde Markdown)

## Qué hacer
1. Pídele a Carlos el `.docx` del Documento 1 v0.2 (está en la carpeta local y en el Drive del equipo, no en el repositorio). Las notas de las reuniones 1 a 5 ya están en el repositorio, en `docs/Reuniones/` (las subió Jordin el 02/11, JG-32). Esa carpeta se quita del repositorio antes de transferirlo a INCOVSA (CE-15): no la enlaces desde los documentos.
2. Crear `entregable-3/documento-1/` con `documento.json` y un `.md` por capítulo, en el formato de `entregable-2/herramientas/armar_documento.py`, partiendo del texto de la v0.2 y actualizándolo con `specs/`: alcance y exclusiones (inventario excluido y aprobado por el docente), actores y permisos por usuario, requisitos con su estado, reglas de negocio, casos de uso, metodología, modelado, diseño y arquitectura (con el despliegue), base de datos, seguridad, interfaz, conclusiones y trabajo futuro.
3. Regenerar las figuras 1 a 8 con los scripts de `entregable-1/diagramas/` actualizados al sistema real (casos de uso, actividades, estados, arquitectura y modelos entidad-relación).
4. **Anexos:** A (actas, incluidas las de las reuniones 4 y 5 en Markdown, con la fecha corregida de la reunión 5; P-77), B (evidencias; en `entregable-3/` no van fotografías de personas: las fotos y capturas de `docs/Reuniones/` están en el repositorio solo por la excepción temporal de la decisión 90 y no se copian a los anexos), C (prototipos aprobados: capturas del prototipo), D (matriz completa de requerimientos con su implementación y su prueba), E (reglas y los 15 casos de conversión validados por INCOVSA).
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

Lo terminó el coordinador (protocolo §E4) a partir de la rama de Carlos (PR #98, fuente v0.3 del 21-23/10), con `develop` integrada.

El **Documento 1 v1.0** está en `entregable-3/documento-1/`. Documenta el sistema tal como está en `develop` el 03/11/2026 (`specs/16`, decisión 90):

- **Capítulos 1 a 8**, al día con `specs/` hasta el 03/11: alcance y exclusiones, fuentes y metodología, permisos y contraseñas (JG-26), requisitos con su texto vigente (JG-28 y otros) y una tabla de precisiones posteriores al 16/10, reglas de negocio, casos de uso, arquitectura con el **despliegue previsto** (no hecho: CE-08 está bloqueada por P-10, P-93 y P-94), seguridad (JG-15 y JG-26), interfaz y conclusiones con el trabajo que sigue hasta el 12/11.
- **Anexo A:** las actas de las cinco reuniones. Las de las reuniones 4 y 5 se redactaron desde las notas de Daniela y quedaron en `docs/Reuniones/` (`acta-reunion-4.md` y `acta-reunion-5.md`). La 5 lleva la fecha correcta, 13/10/2026.
- **Anexo B:** la evidencia de cada reunión, sin fotografías ni capturas, porque muestran a personas. P-04 sigue pendiente.
- **Anexo C:** las capturas del prototipo aprobado, con una nota sobre los cambios del Ing. Manuel Rojas del 02-03/11.
- **Anexo D:** la matriz de 150 códigos (121 vigentes) con las tareas que los implementan y sus pruebas. 108 vigentes tienen todas sus tareas hechas; 12 esperan CE-10, CE-11, CE-12, CE-14, CE-15, DM-12, JG-19 o JG-27 (o la bloqueada CE-08). 35 vigentes no tienen una prueba con su código, entre ellos 13 de los casos de uso.
- **Anexo E:** la conversión y los 15 casos validados, que son las pruebas CP-01 a CP-15 de `src/modulos/conversion/servicio.test.ts`.
- **Figuras:** la 5 (arquitectura) y la 6 a 8 (modelos entidad-relación) se regeneraron con los nombres de `prisma/schema.prisma` y el despliegue previsto. Las 1 a 4 no cambiaron.

Decisiones: el texto sale de `specs/`, porque la v0.2 no está en el repositorio. Los documentos no nombran `docs/Reuniones/`. P-77 queda resuelto (`specs/18` y `specs/19`). Se corrigieron en `specs/16` las dos líneas que decían que Caddy envía HSTS (lo envía Next.js, decisión 29).

**Cómo usarlo:** `python entregable-2/herramientas/armar_documento.py entregable-3/documento-1` arma `entregable-3/Documento 1 - Memoria general y especificacion del sistema v1.0.docx` (24 figuras y 43 tablas). Necesita `entregable-3/equipo.local.json`. El `.docx` no se sube al repositorio: va al portal (JG-30) y al Drive del equipo. Lo que salga de la reunión con el Ing. William Ambrossio, CE-14 y el despliegue entra en la versión 1.1 del 12/11 (JG-17 puede actualizar el Anexo D).
