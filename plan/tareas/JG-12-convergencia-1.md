---
id: JG-12
titulo: Convergencia 1
persona: jordin
responsable: Jordin García
hito: E3
prioridad: P1
estado: pendiente
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
