---
id: JG-18
titulo: Documento 6, plan y evidencias de pruebas (Anexos F y G)
persona: jordin
responsable: Jordin García
hito: entrega
prioridad: P1
estado: hecha
depende_de: [JG-15, JG-16]
programada: 2026-11-03
requisitos: []
pantallas: []
---

# JG-18 · Documento 6, plan y evidencias de pruebas (Anexos F y G)

**Responsable:** Jordin García · **Hito:** entrega · **Prioridad:** P1 · **Programada:** mar 03/11 · **Depende de:** JG-15, JG-16

> **Replanificación del 02/11 (JG-32, `specs/16` decisión 90):** esta tarea ya no espera a JG-17 ni al despliegue. Documenta el sistema tal como está en `develop` y se integra a más tardar el **martes 03/11 a las 18:00**, para que Jordin arme la entrega del 04/11 (JG-30). Nada de esta versión 1.0 depende de la reunión con el Ing. William: lo que salga de ella se agrega en la versión 1.1 del 12/11.

## Objetivo
Redactar el **Documento 6** con las 13 secciones de los lineamientos y sus anexos F (casos de prueba) y G (evidencias), a partir de las pruebas reales del proyecto.

## Contexto que debes leer
- Los lineamientos del docente, Documento 6 (resumen en `specs/17`; el PDF completo está en `docs/`, solo en el equipo del coordinador)
- `entregable-2/documento-2/90-anexo-f-casos-de-prueba.md` (casos iniciales CP-01 a CP-64) y `entregable-2/LEEME.md` (cómo se arma un documento con `entregable-2/herramientas/`)
- Los informes de `plan/pruebas/`, `plan/seguridad/`, `plan/convergencia/` y `plan/auditorias/`, y los reportes de GitHub Actions
- `specs/12` (los 15 casos de conversión validados por INCOVSA)

## Qué hacer
1. Crear `entregable-3/documento-6/` con `documento.json` y un `.md` por sección, en el formato de `entregable-2/herramientas/armar_documento.py`:
   1. estrategia de pruebas (Vitest con base real, Playwright, mutación, axe, Semgrep, ZAP, bot de revisión);
   2. casos de prueba (Id, Requerimiento, Entrada, Procedimiento, Resultado esperado, Resultado obtenido, Estado), partiendo de CP-01 a CP-64 y agregando los nuevos;
   3. a 9. funcionales, roles y permisos, validación, responsive, compatibilidad, seguridad básica y **conversión** (los 15 casos validados, los fraccionados y los datos incorrectos, con su resultado real);
   10. prueba integral del flujo completo (JG-14), aclarando que la actualización de inventario no aplica por la exclusión aprobada por el docente (P-58);
   11. prueba de inventario: no aplica, con la misma justificación;
   12. prueba del CMS por una persona de INCOVSA (en la versión 1.0 queda programada; se completa en la capacitación, JG-21, para la versión 1.1 del 12/11);
   13. registro de incidencias (Id, Error, Severidad, Estado, Solución), tomado de las auditorías y de los PR de corrección.
2. La sección de seguridad básica parte de la revisión de JG-15 (`plan/seguridad/`); JG-27 se hace después del 04/11.
3. Anexo F: todos los casos de prueba. Anexo G: las evidencias (capturas, reportes y salidas resumidas).
4. Armar el `.docx` con las herramientas de `entregable-2/herramientas/` (se guarda en la carpeta local y en el Drive del equipo, no en el repositorio).

## Archivos que creas o modificas
- `entregable-3/documento-6/**` (crear)

## Criterios de aceptación
1. El documento tiene las 13 secciones de los lineamientos y el formato del curso (carta, Arial, interlineado 1.5, índices, control de versiones).
2. Cada caso de prueba tiene su resultado obtenido real y su estado, con evidencia en el Anexo G.
3. La sección 12 queda lista para completar con la evidencia de la capacitación (JG-21).

## Verificación
```
python entregable-2/herramientas/armar_documento.py entregable-3/documento-6
```

## Fuera de alcance
- Los demás documentos.

## Notas
- La portada del documento lee los nombres y carnés de `entregable-3/equipo.local.json`, que no se sube al repositorio (tiene datos personales). Si no existe en tu equipo, pídele a Jordin una copia de `entregable-2/equipo.local.json` y guárdala con ese nombre en `entregable-3/`.
- Los `.docx` y `.pdf` no se suben al repositorio (`.gitignore`): se guardan en la carpeta local y en el Drive del equipo.

## Resultado

El Documento 6 v1.0 está en `entregable-3/documento-6/`:

- las 13 secciones de los lineamientos, con una introducción;
- el **Anexo F**, con **111 casos de prueba** (CP-01 a CP-64 del Entregable 2, ahora con su resultado obtenido, y CP-65 a CP-111 nuevos);
- el **Anexo G**, con las evidencias: las ejecuciones, los informes y 17 capturas;
- las referencias en APA 7.

Se arma con `python entregable-2/herramientas/armar_documento.py entregable-3/documento-6`: 17 figuras y 39 tablas. El `.docx` va al Drive del equipo, no al repositorio.

### Resultados que documenta (sobre `develop`, commit 37a5c44)

- **Casos de prueba:** 103 aprobados, 7 aprobados en parte y 1 pendiente.
    - Aprobados en parte: CP-20, CP-32, CP-42, CP-51, CP-61, CP-64 y CP-89.
    - Pendiente: CP-111, contraseñas comunes y reautenticación (CE-14).
- **Vitest:** 509 de 509 en la CI (41611123183) y en local.
- **Prueba integral:** 3 de 3 (41698054254).
- **Mutación:** 67.90 % (41317332051).
- **Matriz de navegadores:** 1 676 de 1 680 casos (41706509553). Los 4 que fallan son de WebKit (INC-47 e INC-48).
- **ZAP:** 0 alertas altas (41706521296).
- **ASVS:** 127 requisitos se cumplen, 40 no se cumplen y 86 no aplican.
- **Registro de incidencias:** 48 incidencias (INC-01 a INC-48), con las 84 de las auditorías agrupadas.

### Decisiones

- Se lanzaron la matriz de navegadores y ZAP sobre `develop` el 03/11, para que la evidencia sea del código que se entrega.
- **CP-20 (RN-33)** no tiene una prueba directa: queda «aprobado en parte», con la verificación indirecta explicada, en lugar de darse por aprobado. Lo mismo con CP-32, CP-42, CP-51 y CP-64, que se comprueban en otra pantalla o de forma indirecta.
- **INC-47 e INC-48** (fallas de WebKit en la matriz) quedan en análisis. No se tocó la prueba de DM-14, porque no se sabe si la causa es la prueba o la aplicación.
- **La alerta nueva de ZAP 10202** (falta el *token* anti-CSRF en Contacto) queda justificada: el formulario es público y no usa sesión. La decisión está registrada en `plan/seguridad/zap-2026-10-29.md`.
- **Sección 12 (prueba del CMS):** queda programada para la capacitación, con siete tareas (CMS-01 a CMS-07) y la tabla lista para el resultado.
- **Sección 11 (inventario):** no aplica, por P-58.

### Cómo usarlo

- **JG-30:** el `.docx` se genera con el comando de arriba. Los índices se actualizan con `entregable-2/herramientas/actualizar_indices.ps1`, que también exporta el PDF.
- **JG-21 (versión 1.1):** completar la sección 12 (tabla `tab:cms-tareas` y «Resultado») y el Anexo G con la evidencia de la capacitación. Agregar la fila 1.1 en `documento.json`.
- **JG-17:** programar lo que dejó pendiente este documento, que ya está en su «Qué hacer», paso 5.
- **JG-19:** repetir la matriz y ZAP en producción y actualizar las secciones 6 a 8 en la versión 1.1.
- **CE-14:** al terminar, CP-111 pasa a aprobado e INC-35 a INC-37 pasan a corregidas.

