---
id: JG-32
titulo: Replanificación del Entregable 3
persona: jordin
responsable: Jordin García
hito: entrega
prioridad: P1
estado: hecha
depende_de: []
programada: 2026-11-02
requisitos: []
pantallas: []
---

# JG-32 · Replanificación del Entregable 3

**Responsable:** Jordin García · **Hito:** entrega · **Prioridad:** P1 · **Programada:** lun 02/11 · **Depende de:** —

## Objetivo
Reorganizar el plan para que la documentación del Entregable 3 se entregue el 04/11 antes de las 9:50 sin depender de lo que INCOVSA todavía no entrega (VPS, DNS, cuentas) ni de la reunión con el Ing. William del 03/11, con las fechas de evaluación que fijó el Ing. Manuel Rojas (04/11, 09/11 y 12/11).

## Contexto que debes leer
- La imagen de evaluación de la fase final del Ing. Manuel Rojas (resumen en `specs/17` y `specs/16`, decisión 90)
- `plan/calendario.md` y `node scripts/tareas.mjs`

## Qué hacer
1. Quitar de los documentos (CE-09, JC-08, DM-13, JM-07, JG-18, CE-11 y CE-12) las dependencias de JG-17, JG-27 y CE-10, y programarlos para el 03/11 a las 18:00.
2. Mover JG-17, JG-27, CE-14, el despliegue (CE-08, JG-19, CE-10, DM-12) y la capacitación (JG-20, JG-21) a después del 04/11 y antes del 12/11.
3. Crear JG-28 (cambios del docente), JG-29 (guía de estudio), JG-30 (armado y entrega), JG-31 (presentación a la empresa) y CE-15 (versión 1.1 del Documento 5 y de los anexos I y J), y convertir JG-22 en la presentación del 09/11.
4. Registrar las fechas en `specs/16` (decisión 90), `specs/17` y `specs/18`.
5. Subir `docs/Reuniones/` al repositorio para CE-09.

## Archivos que creas o modificas
- `plan/tareas/**`, `plan/calendario.md`, `plan/bitacora/jordin.md`
- `specs/16-arquitectura-y-tecnologia.md`, `specs/17-lineamientos-del-curso.md`, `specs/18-historial-de-decisiones.md`
- `.gitignore`, `docs/Reuniones/**`

## Criterios de aceptación
1. Ningún documento de la versión 1.0 depende de JG-17, JG-19, CE-08, CE-10 ni de la reunión del 03/11.
2. `node scripts/tareas.mjs --validar` pasa y el calendario está regenerado.
3. Las fechas del 04/11, 09/11 y 12/11 están en `specs/16`, `specs/17` y `plan/calendario.md`.

## Verificación
```
node scripts/tareas.mjs --validar
node scripts/tareas.mjs --calendario --escribir
node scripts/tareas.mjs --validar-cierre "[JG-32] Replanificación del Entregable 3"
```

## Resultado

**Estado: hecha** (02/11/2026). Pedido y aprobado por Jordin en la conversación del 02/11.

- **Documentos versión 1.0, el 03/11 a las 18:00:** CE-09, JC-08, DM-13, JM-07, JG-18, CE-11 y CE-12 ya no dependen de JG-17, JG-27 ni CE-10. Cada uno lleva una nota de la replanificación. DM-13 y JM-07 toman las capturas de las pantallas que cambia JG-28 cuando esté integrada. CE-11 y CE-12 dejan como pendiente para la versión 1.1 lo que solo existe en producción o depende de INCOVSA.
- **Tareas nuevas:** JG-28 (cambios del Ing. Manuel: banners de la misma altura, barra de Industrias igual a la de Productos con el ícono de cada industria en las dos, y sin restos del prototipo), JG-29 (guía de estudio), JG-30 (armado y subida al portal el 04/11, con el Anexo H versión 1.0), JG-31 (presentación a la empresa del 12/11) y CE-15 (versión 1.1 del Documento 5 y de los anexos I y J, transferencia del repositorio y quitar `docs/Reuniones/`).
- **Después del 04/11:** JG-17, JG-27 y CE-14 el 05/11; CE-08 el 06/11; JG-19 y CE-10 el 07/11; DM-12 el 08/11; JG-22 (ahora la presentación previa del 09/11) el 08/11; JG-20 el 09/11; JG-21 el 10/11; CE-15 y JG-31 el 11/11.
- **specs:** decisión 90 en `specs/16` (las decisiones 72 y 73 la referencian), fila del Entregable 3 en `specs/17` y sección nueva en `specs/18`.
- **`docs/Reuniones/`:** subida tal como está (21 archivos, con fotos y capturas de las reuniones), por decisión de Jordin, para que CE-09 tenga las actas. `.gitignore` ignora el resto de `docs/`. CE-15 la quita antes de transferir el repositorio; sigue en el historial de git, y Jordin lo aceptó.
- **Verificación:** `node scripts/tareas.mjs --validar` sin errores y calendario regenerado con `--calendario --escribir`.
