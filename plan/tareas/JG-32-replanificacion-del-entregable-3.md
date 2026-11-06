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
- **Revisión en contexto limpio (subagente `revisor`):** 7 hallazgos de corrección, todos corregidos: fechas viejas en `specs/16` (decisiones 75 y 79 y "Despliegue"), `specs/00`, el calendario y CE-08; nombres de informes con fecha en CE-10, JG-17 y JG-19; CE-15 ya no depende de CE-10, para que quitar `docs/Reuniones/` no dependa de INCOVSA; y JG-21 completa el mismo Anexo H que crea JG-30. También se aplicaron 6 de las 7 mejoras opcionales. Queda abierta una: JG-20 y JG-21 siguen dependiendo de JG-19 (capacitación en producción).
- **Revisión del bot (`revision-claude`):** pidió registrar la subida de `docs/Reuniones/` como excepción a RNF-10, porque Jordin mantuvo la decisión. Quedó en `specs/15` (RNF-10), `specs/16` ("Qué va al repositorio", lista del `.gitignore` y decisión 90) y CE-09. También se agregó la nota de la decisión 90 a la decisión 82 y la demostración en local a `specs/17`.

### Ampliación (2026-11-06): VPS de Hostinger

- **Acuerdo del 05/11 con el Ing. William:** el coordinador contrata un VPS de Hostinger (plan KVM 2) por un mes, con un correo de soporte que crea para INCOVSA, y con ese correo las cuentas de Cloudflare (R2) y Google Drive. Es el entorno de pruebas de INCOVSA y el que se le entrega el 12/11. Queda en `specs/16`, decisión 91 (cambia las 28, 32, 33 y 73), y en `specs/18`.
- **Dirección e imágenes:** el sistema se publica con el nombre que Hostinger le da al VPS, sin tocar el DNS de incovsa.com, y las imágenes se guardan en R2 y se sirven desde la dirección `r2.dev` del bucket. No cambia el código de la aplicación: solo `DOMINIO`, `BETTER_AUTH_URL` y `URL_IMAGENES` del `.env`. Sí cambia la comprobación final de `despliegue.yml`, que consultaba `https://incovsa.com` con la dirección fija (lo hace CE-08).
- **Pendientes:** se resolvieron P-10 y P-93, se precisaron P-92 (la cuenta de Drive) y P-94 (queda la organización de GitHub de INCOVSA) y se agregó P-99 (si INCOVSA renueva el VPS, se cambia a otro o publica el sistema en incovsa.com).
- **Tareas:** CE-08 pasa de bloqueada a pendiente y se replanteó para Hostinger y `r2.dev`; JG-19, CE-10, DM-12 y el calendario usan la dirección de Hostinger; CE-15 agrega al Documento 5 los pasos para cambiarse de VPS, publicar en incovsa.com y pasar las imágenes a un dominio propio.
