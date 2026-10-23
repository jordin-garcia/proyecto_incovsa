---
id: JG-12
titulo: Convergencia 1
persona: jordin
responsable: Jordin García
hito: E3
prioridad: P1
estado: hecha
depende_de: [JG-09]
programada: 2026-10-21
requisitos: []
pantallas: []
---

# JG-12 · Convergencia 1

**Responsable:** Jordin García · **Hito:** E3 · **Prioridad:** P1 · **Programada:** mié 21/10 · **Depende de:** JG-09

## Objetivo
Primera convergencia después del avance del 19/10: medir cuánto de `specs/` y del prototipo ya está en `develop`, convertir cada brecha en una tarea y reprogramar para que todo esté listo el 02/11.

## Contexto que debes leer
- `plan/prompts/convergencia.md` (es el procedimiento de esta tarea)
- `plan/protocolo.md` §E y §F; `plan/calendario.md`
- `specs/04`, `specs/12` y `specs/15` (requisitos, reglas y no funcionales)
- Las auditorías y convergencias anteriores de `plan/auditorias/` y `plan/convergencia/`

## Qué hacer
1. Seguir `plan/prompts/convergencia.md` sobre las tareas del hito E2 y las integradas hasta el 21/10.
2. Auditar las tareas integradas desde la última auditoría (protocolo §E2) y presentarle a Jordin los hallazgos antes de corregir.
3. Crear las tareas nuevas y reprogramar el calendario (`node scripts/tareas.mjs --calendario --escribir`).

## Archivos que creas o modificas
- `plan/convergencia/2026-10-21.md` (crear)
- `plan/auditorias/2026-10-21.md` (crear, si hay hallazgos)
- `plan/tareas/*.md` nuevas y las fechas de las reprogramadas; `plan/calendario.md` (generado)

## Criterios de aceptación
1. El informe tiene la tabla de requisitos ✅/⚠️/❌ de lo que corresponde hasta hoy, las diferencias con el prototipo y las tareas creadas.
2. Cada ⚠️ y ❌ tiene una tarea pendiente con dueño y fecha antes del 02/11.
3. `node scripts/tareas.mjs --validar` pasa y ninguna tarea queda programada después del 02/11, salvo las del hito `entrega`.

## Pruebas obligatorias
- No aplica: es una tarea de evaluación.

## Verificación
```
node scripts/tareas.mjs --validar
node scripts/tareas.mjs --hoy
```

## Fuera de alcance
- Implementar correcciones dentro de esta tarea (van en sus propias tareas o en correcciones de auditoría, protocolo §E3).

## Notas
- Nada del alcance se recorta (specs/16, decisión 68). Si una persona no alcanza, se reparte su trabajo pendiente, con aviso en las bitácoras.

## Resultado

**Hecha el 22/10/2026** sobre `develop` en `9d2d001`. Se hizo un día después de lo programado porque esperó a JG-09. Por eso el informe y la auditoría llevan la fecha del 22/10, y no la de `2026-10-21.md` que indicaba la sección de archivos.

### Qué se hizo
- **Informe de convergencia:** [`plan/convergencia/2026-10-22.md`](../convergencia/2026-10-22.md). Incluye:
  - la tabla ✅/⚠️/❌ de los 120 requisitos que corresponden a lo integrado (111 ✅ y 9 ⚠️) y de los 25 de tareas pendientes (❌, todos con tarea y fecha);
  - las diferencias con el prototipo;
  - las tareas creadas y las fechas que cambiaron.
  - Las capturas de Bodega, la única pantalla con diferencias, están en `plan/convergencia/2026-10-22/`.
- **Auditoría §E2:** [`plan/auditorias/2026-10-22.md`](../auditorias/2026-10-22.md). Es la primera del proyecto y cubre todas las tareas integradas, salvo las `XX-01` y JG-09. Tiene 55 hallazgos, ninguno Alto, 16 Medios y 39 Bajos, y 6 ❓ decisiones pendientes (D-01 a D-06). Se hizo con cinco revisiones en contexto limpio, una por área. El coordinador comprobó los hallazgos Medios y recorrió con Playwright las 15 pantallas integradas frente al prototipo.
- **Tareas nuevas:** JG-23 (Bodega, 23/10), JG-24 (bitácora, acceso, sitio y Facturación, 24/10) y JG-25 (configuración, producción y CI, 27/10).
- **Reprogramación:**
  - DM-07 pasa al 22/10, DM-08 al 23/10, DM-09 al 24/10 y DM-11 al 25/10.
  - **DM-10 pasa a Carlos** con `reasignada: si`, el mismo día (23/10).
  - JG-17 ahora depende de JG-23, JG-24 y JG-25.
  - Se regeneró el calendario.

### Decisiones tomadas
- Por decisión de Jordin, todos los hallazgos se corrigen como correcciones del coordinador (§E3), agrupadas en JG-23 a JG-25. No se crean tareas de corrección para los demás.
- Por decisión de Jordin, el trabajo atrasado de Daniela se reparte: DM-10 pasa a Carlos, que tiene CE-08 bloqueada.
- Por decisión de Jordin, el protocolo B7 sigue exigiendo la batería de navegador completa en cada tarea con cambios visibles, aunque tarda unos 35 minutos con un worker.
- La base local se reinició con la autorización de Jordin. La batería de navegador no se volvió a correr, porque esta tarea no cambia código y JG-09 la corrió ese mismo día sobre el mismo commit.

### Cómo usarlo
- **JG-23, JG-24 y JG-25:** cada hallazgo tiene su ID (H-xx), su archivo y línea, y su corrección en la auditoría. Antes del paso que la use, se pregunta su ❓ D-xx. En el `## Resultado` de la tarea auditada se agrega `### Correcciones de la auditoría (2026-10-22)`.
- **JG-13 (Convergencia 2):** parte de este informe. Comprueba que los ⚠️ se hayan cerrado y vuelve a clasificar lo que se integre entre el 22 y el 25/10 (DM-07 a DM-10, JM-05, JM-06 y JC-07).
