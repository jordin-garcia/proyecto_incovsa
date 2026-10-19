# Verificación de JM-03 · 18/10/2026

Implementación del módulo de Bodega para preparación, detalle y despacho de rutas y pedidos (Josué Menéndez, `josue`).

| Comprobación | Resultado |
|---|---|
| Herramientas obligatorias | `gh`, `Context7`, `Playwright`, `next-devtools`, `shadcn` disponibles y utilizados según protocolo |
| `npm ci` | Paquetes y dependencias limpias, sin agregar dependencias no autorizadas |
| `npm run db:aplicar` | Migraciones sincronizadas |
| `npm run verificar` | **Aprobado**: `formato` (Prettier), `lint` (ESLint), `tipos` (tsc --noEmit) y `test` (Vitest: 16 archivos, 149 pruebas aprobadas) |
| `npm run build` | **Aprobado**: compilación Next.js 16 con Turbopack exitosa, ruta `/picking/bodega` generada dinámicamente |
| Pruebas unitarias e integración de Bodega | **20 pruebas aprobadas** en `src/modulos/bodega/servicio.test.ts` (7) y `src/modulos/bodega/acciones.test.ts` (13) |
| Pruebas E2E de Bodega | **15 pruebas aprobadas** en `pruebas-e2e/picking/bodega.spec.ts` (5 en teléfono, 5 en tableta, 5 en escritorio), incluyendo accesibilidad sin violaciones graves con axe |
| Comparación visual | 12 capturas tomadas en teléfono (390 px), tableta (768 px) y escritorio (1440 px) para la aplicación y el prototipo |

## Criterios de aceptación verificados

- **Criterio 1 (RF-SL-19):** `listarEnviosEnPreparacion` lista solo envíos con estado "En Preparación" pertenecientes a la sede activa, ordenados por `posicionCola`.
- **Criterio 2 (RF-SL-21 / RN-51, CP-19):** Muestra el desglose de productos y lotes agrupados con el lote resaltado visualmente en monoespacio y el cálculo exacto de unidades y residuo en kg mediante `convertirKgAUnidades`.
- **Criterio 3 (RF-SL-74 / RF-SL-75, CP-36):** Encabezado con fecha y hora programada, camión, piloto y clientes. Modal de detalle que expone todos los pedidos facturados y sus líneas.
- **Criterio 4 (RF-SL-23 / RN-20):** Marcar o desmarcar una línea individual o todas en bloque persiste en base de datos sin registrar usuario ni registrarse en bitácora.
- **Criterio 5 (RF-SL-20 / RN-28, CP-39):** "Ordenar por peso" ordena de mayor a menor kg y actualiza la posición de las líneas persistentemente sin bitácora.
- **Criterio 6 (RF-SL-24 / RN-11, CP-38):** Botón de despacho solo habilitado cuando todas las líneas están marcadas. Confirmación mediante diálogo y transición a "En Ruta" (rutas) o "Despachado" (pedidos), registrando en la misma transacción el historial de estado y la bitácora (`Cambio de estado`).
- **Criterio 7 (RF-SL-22 / RF-SL-76):** Notificación de cambios de sede mediante `avisarCambio(sedeId)` y suscripción en tiempo real con `useCambiosDeSede(sedeId)`.
- **Criterio 8:** Accesibilidad (axe) validada en todos los viewports sin errores graves o críticos.
- **Seguridad multi-sede (RN-17 / RNF-04):** Validación obligatoria de `exigirPermiso(sesion, "pk.bodega", sede.id)`. Cualquier intento de operar sobre envíos de otra sede o inexistentes es enmascarado mediante `ErrorAcceso`.
