---
id: JG-17
titulo: Convergencia final y cierre del desarrollo
persona: jordin
responsable: Jordin García
hito: E3
prioridad: P1
estado: pendiente
depende_de: [JG-13, JG-15, JG-16]
programada: 2026-10-30
requisitos: []
pantallas: []
---

# JG-17 · Convergencia final y cierre del desarrollo

**Responsable:** Jordin García · **Hito:** E3 · **Prioridad:** P1 · **Programada:** vie 30/10 · **Depende de:** JG-13, JG-15, JG-16

## Objetivo
Última convergencia antes de cerrar el desarrollo el 02/11: comprobar que **todo** `specs/` y el prototipo aprobado están en `develop`, que no queda ningún ⚠️ ni ❌, y dejar las correcciones restantes programadas para el 31/10 y el 01/11.

## Contexto que debes leer
- `plan/prompts/convergencia.md`; `plan/protocolo.md` §E y §F
- `specs/04`, `specs/05` a `specs/12` y `specs/15` completos
- Las convergencias, auditorías e informes de seguridad y de pruebas anteriores

## Qué hacer
1. Seguir `plan/prompts/convergencia.md` sobre **todos** los requisitos, reglas y no funcionales, y recorrer lado a lado con el prototipo **todas** las pantallas de los dos sistemas.
2. Auditar lo integrado desde la última auditoría (protocolo §E2).
3. Crear las tareas de corrección con fecha 31/10 o 01/11, con P1.
4. Confirmar que el recorrido diario (JG-14), la matriz de navegadores (JG-16) y la revisión de seguridad (JG-15) están en verde o con sus correcciones programadas.

## Archivos que creas o modificas
- `plan/convergencia/2026-10-30.md`, `plan/auditorias/2026-10-30.md` (crear)
- Tareas nuevas y fechas reprogramadas; `plan/calendario.md` (generado)

## Criterios de aceptación
1. Ningún requisito, regla o pantalla queda en ❌; cada ⚠️ tiene una tarea con fecha 31/10 o 01/11.
2. Los pendientes de INCOVSA (`specs/19`) que afectan la puesta en producción del 02/11 están en el informe, con lo que falta de cada uno.

## Pruebas obligatorias
- No aplica.

## Verificación
```
node scripts/tareas.mjs --validar
node scripts/tareas.mjs
```

## Fuera de alcance
- Funcionalidades nuevas: el alcance es el de `specs/` (decisión 68).
