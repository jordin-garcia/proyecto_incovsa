# Bitácora de Josué Menéndez

Cada entrada la agrega el agente al cerrar una tarea (plan/protocolo.md B9), al **final** del archivo, con este formato:

```
## AAAA-MM-DD · <ID> · <título>
- Hecho: ...
- Decisiones: ...
- Pendiente o aviso para otros: ...
```

Los avisos para otra persona van en su propia línea y empiezan en negrita con a quién van dirigidos: `**JM-03:**`, `**Josué:**` o `**Todos:**`.

---

## 2026-10-17 · JM-01 · Herramientas obligatorias del agente (Codex)
- Hecho: Se verificó el entorno base en Windows (Node.js 24.21.0, npm 11.19.0, Git 2.55.0 con core.autocrlf false, GitHub CLI 2.102.0 autenticado con Josh-JM, PostgreSQL 18.6). Se instaló Codex CLI globalmente y se configuraron los servidores MCP obligatorios (Context7, Playwright, next-devtools y shadcn) en ~/.codex/config.toml y ~/.gemini/antigravity/mcp_config.json (con respaldo en ~/.gemini/config/mcp_config.json). Se comprobó la consulta a Context7 con Server Actions de Next.js 16 y la ejecución de Playwright abriendo el prototipo local en http://127.0.0.1:4173/ y capturando la página de inicio.
- Decisiones: Se mantiene la configuración para Codex en Windows y Antigravity en paralelo conforme a las decisiones 84 y 86 de specs/16. Context7 opera inicialmente con acceso sin token (nivel gratuito) hasta que se configure opcionalmente clave de API. Modo de trabajo con aislamiento activo (sandbox_mode = "workspace-write", approval_policy = "on-request") y proyecto marcado como confiable (trust_level = "trusted").
- Pendiente o aviso para otros: Ninguno (la tarea JM-02 de conversión queda desbloqueada para Josué).

## 2026-10-17 · JM-02 · Conversión de kilogramos a unidades
- Hecho: Se implementó el servicio de conversión en `src/modulos/conversion/servicio.ts` y el componente de interfaz `src/componentes/picking/bodega/Unidades.tsx`. El cálculo opera en gramos enteros (`BigInt`) sin usar aritmética de punto flotante para cumplir con exactitud RN-01, RN-05 y RN-21. Se agregaron 34 pruebas unitarias y de propiedades en `src/modulos/conversion/servicio.test.ts` que validan los 15 casos aprobados por INCOVSA (CP-01 a CP-15), casos con resto (CP-16 a CP-18), conversiones exactas, validación de Peso de Conversión inválido (RN-50 con `ErrorNegocio`), validación de cantidades negativas y más de 3 decimales, propiedades algebraicas con fast-check (1,000 iteraciones con cadenas y Decimal de Prisma) y renderizado del componente visual con unión discriminada y estilos fieles a `.unid` y `.unid .resto` de `estilos.css`.
- Decisiones: Se restringe la entrada a `string` y `Prisma.Decimal` excluyendo `number`; el Peso de Conversión menor o igual a cero y cantidades negativas o con más de 3 decimales lanzan `ErrorNegocio`; se exportan utilidades auxiliares `fmt`, `textoUnidades`, `textoConversion` y `htmlConversion` idénticas a `base.js` del prototipo; `<Unidades />` reproduce fielmente `#1C1D1C`, 15 px font-mono y pastilla verde de resto.
- Pendiente o aviso para otros:
**JM-03:** Puedes importar `convertir`, `textoConversion` desde `@/modulos/conversion/servicio` y usar el componente `<Unidades />` desde `@/componentes/picking/bodega/Unidades` para la tabla de preparación y el detalle.
**JC-06:** La lógica de conversión requerida para Reportes está disponible en `@/modulos/conversion/servicio` (`convertir`, `textoConversion`).
**JM-05:** El componente `<Unidades />` y el cálculo de conversión están listos para la proyección del tablero en pantalla completa.

## 2026-10-18 · JM-03 · Bodega: preparación, detalle y despacho de rutas y pedidos
- Hecho: Se implementó el módulo completo de Bodega (`src/modulos/bodega/`, `src/componentes/picking/bodega/`, `src/app/picking/bodega/`). Incluye la consulta de envíos En Preparación filtrados por sede y ordenados por cola, el marcado individual y masivo de líneas sin bitácora (RN-20), el ordenamiento persistente por peso (RN-28), la visualización de unidades con `<Unidades />` (JM-02), la fecha y hora programada, el modal de detalle con pedidos facturados (RF-SL-74) y el despacho con confirmación, cambio transaccional con bloqueo pesimista `SELECT ... FOR UPDATE` (decisión 41 de specs/16) a En Ruta / Despachado, registro de historial y bitácora ("Cambio de estado") y notificación reactiva mediante `avisarCambio`. Se corrigió el formateo de fecha `@db.Date` en UTC para el Detalle y la bitácora evitando el desfase de zona horaria UTC−6. Se verificó con 24 pruebas en Vitest y 15 pruebas E2E en Playwright en teléfono, tableta y escritorio con accesibilidad axe y capturas de evidencia.
- Decisiones: Se enmascara cualquier intento de consulta u operación sobre envíos de otra sede o inexistentes mediante `ErrorAcceso` para evitar revelación de datos según specs/16 y JG-07. Las Server Actions se ejecutan con `useTransition` para mantener la interfaz receptiva y validan su entrada con Zod.
- Pendiente o aviso para otros:
**JM-04:** La estructura de tarjetas de Bodega y las Server Actions están listas para integrar el arrastre dnd-kit y la suscripción en tiempo real por SSE.
**JM-05:** El servicio `listarEnviosEnPreparacion` está listo para ser consumido por el Tablero de pantalla completa.

## 2026-10-21 · JM-04 · Bodega: prioridad compartida y tiempo real
- Hecho: Se implementó la prioridad compartida y la sincronización en tiempo real para el módulo de Bodega (`src/modulos/bodega/`, `src/componentes/picking/bodega/`). Se crearon los esquemas Zod `esquemaReordenarCola` y `esquemaReordenarLineas`, las funciones de servicio `reordenarColaBodega` y `reordenarLineasPreparacion` que actualizan posiciones enteras (`posicionCola` y `posicion`, decisión 57 de specs/16) sin generar entradas en historial de estado ni en bitácora (RN-28 y RF-SL-20), y las Server Actions `reordenarColaAccion` y `reordenarLineasAccion` protegidas con `exigirPermiso(sesion, "pk.bodega", sede.id)` que notifican a la sede mediante `avisarCambio(sede.id)` (JG-10). En la interfaz se integró React 19 `useOptimistic` (decisión 40) para respuesta instantánea al marcar líneas y reordenar, y arrastre sortable con `@dnd-kit/sortable` para tarjetas y filas con sensores de mouse, dedo (pulsación larga con delay de 380 ms y tolerancia de 8 px) y teclado. Se estructuró el `DndContext` fuera de elementos `<table>` para cumplir la especificación HTML y evitar errores de anidación.
- Decisiones: Se ubicó el `DndContext` de filas envolviendo la tabla en `.tabla-caja` para que los nodos de accesibilidad de dnd-kit no violen la jerarquía de `<table>`; las acciones de ordenamiento de cola y líneas se ejecutan transaccionalmente con verificación estricta de pertenencia a la sede; `alMarcarTodo` y `alOrdenarPorPeso` completan la acción del servidor y refresco para mantener sincronía robusta de lote y estado.
- Pendiente o aviso para otros:
**JM-05:** El orden de cola (`posicionCola`) y la notificación de cambios en tiempo real por SSE están listos para reflejarse automáticamente en la vista de tablero en pantalla completa.


