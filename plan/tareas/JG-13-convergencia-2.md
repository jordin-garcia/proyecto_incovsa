---
id: JG-13
titulo: Convergencia 2
persona: jordin
responsable: Jordin García
hito: E3
prioridad: P1
estado: hecha
depende_de: [JG-12]
programada: 2026-10-25
requisitos: []
pantallas: []
---

# JG-13 · Convergencia 2

**Responsable:** Jordin García · **Hito:** E3 · **Prioridad:** P1 · **Programada:** dom 25/10 · **Depende de:** JG-12

## Objetivo
Segunda convergencia, a mitad del hito E3: comprobar el avance de todos los módulos, detectar los atrasos a tiempo y reprogramar sin recortar el alcance.

## Contexto que debes leer
- `plan/prompts/convergencia.md` (es el procedimiento de esta tarea)
- `plan/protocolo.md` §E y §F; `plan/calendario.md`
- `specs/04`, `specs/12` y `specs/15` (requisitos, reglas y no funcionales)
- Las auditorías y convergencias anteriores de `plan/auditorias/` y `plan/convergencia/`

## Qué hacer
1. Seguir `plan/prompts/convergencia.md` sobre todo lo integrado hasta el 25/10.
2. Auditar las tareas integradas desde la última auditoría (protocolo §E2) y presentarle a Jordin los hallazgos antes de corregir.
3. Crear las tareas nuevas y reprogramar el calendario (`node scripts/tareas.mjs --calendario --escribir`).

## Archivos que creas o modificas
- `plan/convergencia/2026-10-25.md` (crear)
- `plan/auditorias/2026-10-25.md` (crear, si hay hallazgos)
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

**Hecha el 26/10/2026** sobre `develop` en `ec6b593`. Se hizo un día después de lo programado; por eso el informe y la auditoría llevan la fecha del 26/10, y no la de `2026-10-25.md` que indicaba la sección de archivos. El 26/10 también se integró #137, que devolvió DM-10 a Daniela.

### Qué se hizo
- **Informe de convergencia:** [`plan/convergencia/2026-10-26.md`](../convergencia/2026-10-26.md). Incluye:
  - la tabla ✅/⚠️/❌ de los 139 requisitos que corresponden a lo integrado (129 ✅ y 10 ⚠️) y de los 6 de tareas pendientes (❌, con tarea y fecha);
  - las diferencias con el prototipo, con las capturas de la galería del panel en `plan/convergencia/2026-10-26/`;
  - las tareas creadas y las fechas que cambiaron.
- **Auditoría §E2:** [`plan/auditorias/2026-10-26.md`](../auditorias/2026-10-26.md).
  - Cubre DM-07, DM-08, DM-09, JM-05, JM-06, JC-07, JG-23, JG-24, JG-08 y los PR de Dependabot.
  - Tiene 29 hallazgos (H-56 a H-84), ninguno Alto, 3 Medios y 26 Bajos, y 4 decisiones (D-07 a D-10), resueltas por Jordin.
  - Confirma que JG-23 y JG-24 corrigieron, con prueba, todos sus hallazgos del 22/10.
- **Verificación:**
  - `npm run verificar`: 418 de 418;
  - `npm run build`: sin errores;
  - batería de navegador: 390 de 390, por partes, con 1 worker y en la base nueva `incovsa_jg13`. `flujo` pasó al repetirla, por H-84.
- **Tareas nuevas:** CE-13 (Carlos), JM-09 (Josué) y JC-09 (José Daniel), las tres para el 27/10. JG-25 suma H-82 a H-84.
- **Reprogramación:**
  - DM-10 pasa al 27/10 y DM-11 al 28/10; DM-11 espera también a CE-13.
  - JG-14 pasa al 27/10.
  - JG-17 espera también a CE-13, JM-09 y JC-09.
  - Se regeneró el calendario.
- **Decisiones registradas:** D-07 en `specs/05`, `specs/18` y `specs/20` (y H-64 resuelto); D-08 en `plan/convenciones.md` §6; D-09 en `specs/08`; D-10 en `specs/10`; todas en `specs/18`, «Decisiones de la auditoría del 26/10».

### Decisiones tomadas
- Por decisión de Jordin, cada paso de la auditoría lo corrige el dueño de lo auditado. La excepción es el sitio y el panel, que pasan a Carlos (CE-13), porque Daniela tiene DM-10 y DM-11 atrasadas.
- Jordin aceptó las cuatro recomendaciones: ratificar la excepción de contraste de DM-09 (D-07), escribir la evidencia solo con `EVIDENCIA=1` (D-08), filtrar la Ruta del piloto por sede de trabajo (D-09) y dejar el logotipo fijo en el PDF (D-10).
- La numeración de los hallazgos y las decisiones sigue la de la auditoría del 22/10 (H-56 y D-07 en adelante), para que ningún H-xx o D-xx se repita entre auditorías (decisión mía).
- DM-11 espera a CE-13, para que la revisión integral de Daniela se haga sobre el sitio y el panel ya corregidos (decisión mía).
- En H-63, el tope del comentario de la bandeja es de 2000 caracteres, igual que el mensaje de Contacto (decisión mía, registrada en CE-13).
- La base de desarrollo no se reinició: la batería se corrió en una base nueva (`incovsa_jg13`), que queda en el PostgreSQL local de Jordin.
- El servidor MCP de Playwright y next-devtools no conectaron en esta sesión. Las capturas se hicieron con la librería Playwright del proyecto, como en JG-12.

### Cómo usarlo
- **CE-13, JM-09 y JC-09:** cada hallazgo tiene su ID, su archivo y línea y su corrección en la auditoría. En el `## Resultado` de cada tarea auditada se agrega `### Correcciones de la auditoría (2026-10-26)`.
- **JG-25:** suma H-82 a H-84 (paso 7 y criterio 10).
- **JG-17 (convergencia final, 30/10):** parte de este informe. Comprueba los 10 ⚠️ y vuelve a clasificar lo que se integre entre el 26 y el 30/10: DM-10, DM-11, JG-14, JG-15, JG-16, JG-25, CE-13, JM-09 y JC-09.
