---
id: JG-23
titulo: Correcciones de la auditoría del 22/10 en Bodega
persona: jordin
responsable: Jordin García
hito: E3
prioridad: P1
estado: pendiente
depende_de: [JG-12, JM-05]
programada: 2026-10-23
requisitos: [RF-SL-61, RF-SL-23, RF-SL-74, RF-SL-75, RNF-13, RN-01]
pantallas: [picking.js › cab, bodega, herramientas, tarjetaPedido, detalle]
---

# JG-23 · Correcciones de la auditoría del 22/10 en Bodega

**Responsable:** Jordin García · **Hito:** E3 · **Prioridad:** P1 · **Programada:** vie 23/10 · **Depende de:** JG-12, JM-05

## Objetivo
Corregir los hallazgos del paso 3 de la auditoría del 22/10, que tocan Bodega, la conversión y la prueba CP-37, más H-29. Así Bodega coincide con el prototipo (RF-SL-61), resiste una falla de red y su prueba de tiempo real es estable en el equipo de Jordin. Son correcciones del coordinador sobre tareas ya integradas (`plan/protocolo.md` §E3).

## Contexto que debes leer
- `plan/auditorias/2026-10-22.md`, paso 3 (H-16 a H-26) y H-29
- `plan/protocolo.md` §E3
- `specs/07-picking-bodega.md` completo; `specs/04`: RF-SL-61 (15/10); `specs/15`: RNF-13
- Prototipo: `#/picking/bodega?cuenta=ejemplo.05`; `picking.js` › `cab()`, `bodega()`, `herramientas()`, `tarjetaPedido()` y `detalle()`; `estilos.css:157, 659, 959, 960, 967`
- `## Resultado` de JM-02, JM-03, JM-04, JM-05, JM-08 y JG-10

## Qué hacer
1. **H-17 y H-29:** el encabezado de Bodega con `EncabezadoModulo` (eyebrow, título, instrucción a la par y «Abrir tablero en pantalla completa» en `acciones`), y una aserción en `pruebas-e2e/comunes/armazon.spec.ts` que compruebe la instrucción a la par del título.
2. **H-18, H-19, H-20 y H-21:** en `bodega.css`, agregar `.ped-meta .prog` (verde `--v700`, negrita) y la regla de ≤720 px de `.ped-avance`, e igualar `.ped-herr`. Quitar el `max-height` de `.det-grupos` para que se desplace la ventana, como dice `specs/07`.
3. **H-24:** capturar las fallas de red de las acciones de Bodega: revertir lo optimista, mostrar el mensaje de error y que la pantalla no se pierda.
4. **H-22:** un envío de la misma sede que ya no está En Preparación lanza `ErrorNegocio` con un mensaje claro; `ErrorAcceso` queda solo para otra sede.
5. **H-16:** pasar texto, no `Number`, a la conversión, y excluir `number` del tipo `DecimalExacto`.
6. **H-23:** el caso «otra sede» de `acciones.test.ts` usa un envío real de la sede 2.
7. **H-25 y H-26:** en `bodega-tiempo-real.spec.ts`, medir RNF-13 como JG-10 y cambiar el estado del envío en el mismo proceso, sin `npx tsx`. Se mantienen los escenarios y el límite de 2 s.
8. En el `## Resultado` de JM-02, JM-03 y JM-04 (y de JG-05 por H-29), agregar `### Correcciones de la auditoría (2026-10-22)`. Su estado no cambia.

## Archivos que creas o modificas
- `src/componentes/picking/bodega/**`, `src/app/picking/bodega/**`, `src/modulos/bodega/**`, `src/modulos/conversion/**`
- `pruebas-e2e/picking/bodega.spec.ts`, `pruebas-e2e/picking/bodega-tiempo-real.spec.ts`, `pruebas-e2e/comunes/armazon.spec.ts`
- `plan/tareas/JM-02-*.md`, `JM-03-*.md`, `JM-04-*.md`, `JG-05-*.md` (solo la sección de correcciones)
- `plan/bitacora/jordin.md` (con el aviso para Josué)

## Criterios de aceptación
1. **RF-SL-61 (H-17, H-29):** el encabezado de Bodega tiene la misma estructura que `cab()` (eyebrow, título, instrucción a la par y botón a la derecha) en 390, 768 y 1440 px, y la prueba falla si la instrucción no va a la par del título.
2. **RF-SL-75 (H-18):** «Programada …» se ve en verde y en negrita, como en el prototipo.
3. **RF-SL-74 (H-21):** en el Detalle se desplaza la ventana, no una zona interna.
4. **RF-SL-23 (H-24):** con la red cortada (`route.abort()`), marcar una fila revierte la marca y muestra el mensaje de error, y la pantalla sigue en uso.
5. **H-22:** con un envío despachado desde otra pantalla, marcar una fila muestra un mensaje de negocio, no «No tiene permisos».
6. **RNF-13 (H-26):** CP-37 pasa en los tres tamaños en el equipo de Jordin, con un solo worker, sin reintentos y con el mismo límite de 2 s.
7. **RN-01 (H-16):** la conversión no acepta `number` en sus tipos, y las pruebas de CP-01 a CP-18 siguen pasando.

## Pruebas obligatorias
- Una prueba por hallazgo que lo habría detectado (criterios 1 a 7)
- La batería completa de navegador (protocolo B7)

## Verificación
Además de los comandos generales del protocolo (B6 y B7):
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/picking/bodega.spec.ts pruebas-e2e/picking/bodega-tiempo-real.spec.ts pruebas-e2e/comunes/armazon.spec.ts
```

## Fuera de alcance
- Los pasos 1, 2, 4 y 5 de la auditoría (JG-24 y JG-25).
- El tablero en pantalla completa (JM-05) y la Ruta (JM-06).

## Notas
- Rama `jordin/JG-23-auditoria-bodega`. Se hace después de integrar JM-05, que toca los mismos archivos.
