---
id: JM-04
titulo: "Bodega: prioridad compartida y tiempo real"
persona: josue
responsable: Josué Menéndez
hito: E3
prioridad: P1
estado: hecha
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

## Resultado
- **Implementación**:
  - `src/modulos/bodega/esquemas.ts`: Esquemas Zod `esquemaReordenarCola` y `esquemaReordenarLineas` para validar listas de IDs de envíos y filas.
  - `src/modulos/bodega/servicio.ts`: Funciones `reordenarColaBodega` y `reordenarLineasPreparacion` que actualizan posiciones enteras (`posicionCola` y `posicion`, decisión 57) mediante transacciones de Prisma con verificación estricta de pertenencia a la sede y estado "En Preparación". Cumple RN-28: no registra historial ni entradas en la bitácora.
  - `src/modulos/bodega/acciones.ts`: Server Actions `reordenarColaAccion` y `reordenarLineasAccion` protegidas con `exigirPermiso(sesion, "pk.bodega", sede.id)`, parseo Zod y notificación reactiva con `avisarCambio(sede.id)` para actualizar otras pantallas en tiempo real por SSE.
  - `src/componentes/picking/bodega/BodegaCliente.tsx`: Integración de `useOptimistic` (React 19, decisión 40) para respuesta inmediata en la pantalla del operador al marcar líneas y reordenar cola/líneas. Implementación de `DndContext` y `SortableContext` para la lista de tarjetas con sensores de Mouse, Touch (`delay: 380, tolerance: 8`) y Keyboard (`sortableKeyboardCoordinates`).
  - `src/componentes/picking/bodega/TarjetaEnvio.tsx`: Tarjeta sortable mediante `useSortable` con handle de arrastre accesible en `.asa-ped`. Tabla interna de preparación con sortable para filas (`FilaPreparacion`) y handle en `.asa`, con `DndContext` colocado externamente a la tabla para evitar anidación inválida en el DOM y garantizar accesibilidad.
- **Verificación**:
  - `npm run verificar` aprobado: formato con Prettier, lint con ESLint, tipos con TypeScript (`tsc --noEmit`) y 33 suites (310 pruebas) en Vitest con 100% de éxito.
  - `npm run build` aprobado: generación estática y bundles optimizados de producción con Turbopack.
  - `npm run e2e -- pruebas-e2e/picking/bodega-tiempo-real.spec.ts` aprobado: 9 pruebas en Playwright en teléfono, tableta y escritorio utilizando dos contextos de navegador independientes, validando actualización en tiempo real mediante SSE sin recarga, respuesta inmediata optimista, arrastre con mouse, dedo y teclado, y cero violaciones graves de accesibilidad con axe.

### Correcciones de la auditoría (2026-10-22)

H-24 (JG-23): las acciones de `BodegaCliente.tsx` pasan por `operar()`, que captura el rechazo del servidor y la falla de red, deja que `useOptimistic` vuelva atrás y muestra el mensaje; el Detalle y el despacho también capturan la falla de red. Lo prueba `bodega.spec.ts` con `route.abort()`.

H-25 y H-26 (JG-23): CP-37 mide RNF-13 desde la publicación del aviso (`esperarPublicacion`), como JG-10; cambia el estado del envío con `pg.Client` en el mismo proceso, lo restaura solo si cambió, llama a tsx sin npx y ya no tiene el desfase fijo. Mismos escenarios y límite de 2 s. En el teléfono, la prueba de la cola reordena con el teclado porque la primera tarjeta mide más que la pantalla y el mouse no alcanza las dos asas.
