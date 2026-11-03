---
id: JG-17
titulo: Convergencia final y cierre del desarrollo
persona: jordin
responsable: Jordin García
hito: E3
prioridad: P1
estado: pendiente
depende_de: [JG-13, JG-15, JG-16, JG-23, JG-24, JG-25, JM-09, JC-09, CE-13]
programada: 2026-11-05
requisitos: []
pantallas: []
---

# JG-17 · Convergencia final y cierre del desarrollo

**Responsable:** Jordin García · **Hito:** E3 · **Prioridad:** P1 · **Programada:** jue 05/11 · **Depende de:** JG-13, JG-15, JG-16, JG-23, JG-24, JG-25, JM-09, JC-09, CE-13

## Objetivo
Última convergencia antes del primer despliegue (JG-19), después de la entrega académica del 04/11 (replanificación del 02/11, JG-32): comprobar que **todo** `specs/` y el prototipo aprobado están en `develop`, que no queda ningún ⚠️ ni ❌, y dejar las correcciones restantes programadas antes de JG-19.

## Contexto que debes leer
- `plan/prompts/convergencia.md`; `plan/protocolo.md` §E y §F
- `specs/04`, `specs/05` a `specs/12` y `specs/15` completos
- Las convergencias, auditorías e informes de seguridad y de pruebas anteriores

## Qué hacer
1. Seguir `plan/prompts/convergencia.md` sobre **todos** los requisitos, reglas y no funcionales, y recorrer lado a lado con el prototipo **todas** las pantallas de los dos sistemas.
2. Auditar lo integrado desde la última auditoría (protocolo §E2).
3. Crear las tareas de corrección con fecha anterior a JG-19, con P1.
4. Confirmar que el recorrido diario (JG-14), la matriz de navegadores (JG-16) y la revisión de seguridad (JG-15) están en verde o con sus correcciones programadas.
5. Programar, con tareas antes de JG-19, lo que el Documento 6 (JG-18) dejó pendiente:
    - las pruebas directas de los casos aprobados en parte: CP-20 (RN-33, cargar otro archivo después del envío), CP-32 (aviso de qué falta, en Facturación), CP-42 (dirección de Facturación sin permiso), CP-51 (misión en Quiénes somos) y CP-64 («01102026» en Reportes);
    - la revisión de las fallas intermitentes INC-43 e INC-44.

## Archivos que creas o modificas
- `plan/convergencia/2026-11-05.md`, `plan/auditorias/2026-11-05.md` (crear)
- Tareas nuevas y fechas reprogramadas; `plan/calendario.md` (generado)

## Criterios de aceptación
1. Ningún requisito, regla o pantalla queda en ❌; cada ⚠️ tiene una tarea con fecha anterior a JG-19.
2. Los pendientes de INCOVSA (`specs/19`) que afectan la puesta en producción están en el informe, con lo que falta de cada uno.

## Pruebas obligatorias
- No aplica.

## Verificación
```
node scripts/tareas.mjs --validar
node scripts/tareas.mjs
```

## Fuera de alcance
- Funcionalidades nuevas: el alcance es el de `specs/` (decisión 68).
