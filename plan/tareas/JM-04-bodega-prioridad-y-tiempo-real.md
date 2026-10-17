---
id: JM-04
titulo: "Bodega: prioridad compartida y tiempo real"
persona: josue
responsable: Josué Menéndez
hito: E3
prioridad: P1
estado: pendiente
depende_de: [JM-03, JG-10]
programada: 2026-10-20
requisitos: [RF-SL-20, RF-SL-23, RN-28, RNF-13, CU-03]
pantallas: [picking.js › bodega (arrastre de tarjetas y filas); base.js › ordenable, opOrdenPedidos, opOrdenLineas]
---

# JM-04 · Bodega: prioridad compartida y tiempo real

**Responsable:** Josué Menéndez · **Hito:** E3 · **Prioridad:** P1 · **Programada:** mar 20/10 · **Depende de:** JM-03, JG-10

## Objetivo
Que cualquier usuario de Bodega pueda **reordenar** las rutas y los pedidos, y las filas de cada uno (la prioridad), y que el marcado y el orden se vean **al instante en todas las pantallas** de la sede (RNF-13), con respuesta inmediata en la pantalla de quien marca.

## Contexto que debes leer
- `specs/07` §"Prioridad" y §"Marcado de preparación"
- `specs/12`: RN-20 y RN-28; `specs/15`: RNF-13
- `specs/16`: decisiones 10, 11, 38, 40 y 57
- Prototipo: `#/picking/bodega?cuenta=ejemplo.05`; arrastre de tarjetas y filas en `picking.js` › `bodega()`; `base.js` › `ordenable()`, `opOrdenPedidos()` y `opOrdenLineas()`
- `## Resultado` de JM-03 y JG-10
- Context7: `@dnd-kit/sortable`, React 19 `useOptimistic`

## Qué hacer
1. Acciones para guardar el **orden actual** de la cola de la sede y el de las filas de un envío (posiciones enteras, decisión 57); sin historial ni bitácora (RN-28). Un envío nuevo se agrega al final.
2. Arrastre con dnd-kit de las tarjetas (rutas y pedidos) y de las filas, con mouse, dedo (pulsación larga) y teclado, como el prototipo.
3. El marcado se ve al instante en la pantalla de quien marca (`useOptimistic`, decisión 40) y se confirma con el servidor; si falla, vuelve atrás con un mensaje de error.
4. Todas las acciones de Bodega llaman a `avisarCambio(sede)`, y las otras pantallas de la sede se actualizan con el SSE de JG-10.

## Archivos que creas o modificas
- `src/modulos/bodega/**`, `src/app/picking/bodega/**`, `src/componentes/picking/bodega/**` (modificar)
- `pruebas-e2e/picking/bodega-tiempo-real.spec.ts` (crear)

## Criterios de aceptación
1. **RF-SL-20 / RN-28:** reordenar rutas, pedidos y filas guarda solo el orden actual; no va a la bitácora ni al historial.
2. **RNF-13** (CP-37): con Bodega abierta en dos pantallas, marcar una fila o cambiar el orden en una se ve en la otra en menos de 2 segundos, sin recargar.
3. El marcado aparece de inmediato en la pantalla de quien marca, antes de la respuesta del servidor.
4. El arrastre funciona con mouse, dedo y teclado.

## Pruebas obligatorias
- Integración de las acciones de orden (criterio 1)
- `pruebas-e2e/picking/bodega-tiempo-real.spec.ts` con dos contextos de navegador (criterios 2 a 4)

## Verificación
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/picking/bodega-tiempo-real.spec.ts
```

## Fuera de alcance
- El tablero en pantalla completa (JM-05).
