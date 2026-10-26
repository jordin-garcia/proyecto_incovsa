---
id: JM-06
titulo: Ruta del piloto y registro de la entrega
persona: josue
responsable: Josué Menéndez
hito: E3
prioridad: P1
estado: hecha
depende_de: [JM-03, JC-04]
programada: 2026-10-24
requisitos: [RF-SL-26, RF-SL-27, RF-SL-28, RF-SL-29, RF-SL-30, RF-SL-78, RF-SL-79, RN-29, RN-30, RN-46, RN-49, RNF-14, CU-05]
pantallas: [picking.js › rutasVisibles, rutaMod, detalleRuta; base.js › clientesRuta, opOrdenRuta, opEntregar]
---

# JM-06 · Ruta del piloto y registro de la entrega

**Responsable:** Josué Menéndez · **Hito:** E3 · **Prioridad:** P1 · **Programada:** sáb 24/10 · **Depende de:** JM-03

## Objetivo
El módulo de Ruta: el piloto ve **sus** rutas En Ruta, con una fila por cliente, las reordena durante el recorrido y pulsa **"Ruta Entregada"**, que guarda el recorrido y pasa la ruta a Entregado.

## Contexto que debes leer
- `specs/08-picking-ruta.md` **completo**
- `specs/12`: RN-11, RN-29, RN-30, RN-46 y RN-49; `specs/03` §"Pilotos"; `specs/15`: RNF-14
- `specs/14` (ENTREGA_RUTA)
- Prototipo: `#/picking/ruta?cuenta=ejemplo.06`; `picking.js` › `rutasVisibles()`, `rutaMod()` y `detalleRuta()`; `base.js` › `clientesRuta()`, `opOrdenRuta()` y `opEntregar()`
- `## Resultado` de JC-04 (filas de entrega) y JM-03

## Qué hacer
1. `src/modulos/ruta/`: servicio y acciones con estas reglas de acceso: un usuario con rol "Piloto" ve **solo sus rutas asignadas** (RN-46, `pk.ruta.propias`); con `pk.ruta.todas`, Gerencia o Soporte, todas las de sus sedes.
2. Lista de rutas **En Ruta**, de la más reciente a la más antigua: por fecha y, en la misma fecha, por número de mayor a menor (RF-SL-78). Sin sección de registro histórico (RF-SL-79).
3. Tabla de la ruta con **Cliente, Sector y Total (kg)**, una fila por cliente (RN-49), en el orden en que llegó de Facturación (RN-29); sin dirección ni teléfono.
4. El piloto reordena las filas (dnd-kit, pensado para teléfono y tableta, RNF-14); se guarda solo el orden actual, sin bitácora (RN-28, RN-29).
5. **"Ruta Entregada"** al final, alineado a la derecha, sin texto de ayuda (CAM-95); la ventana de confirmación muestra el recorrido que se va a guardar. Al confirmar, en una transacción: el orden actual queda como **recorrido**, la ruta pasa a **Entregado** con su historial, y la bitácora registra "Cierre de ruta"; después, `avisarCambio(sede)`. La ruta deja de aparecer y se consulta en Reportes.
6. El piloto no puede cambiar clientes, productos ni cantidades.

## Archivos que creas o modificas
- `src/modulos/ruta/**` (crear)
- `src/app/picking/ruta/**`, `src/componentes/picking/ruta/**` (crear)
- `pruebas-e2e/picking/ruta.spec.ts` (crear)

## Criterios de aceptación
1. **RF-SL-26 / RN-46:** `ejemplo.06` solo ve sus rutas; `ejemplo.07` no ve las de `ejemplo.06`; `ejemplo.01` ve todas las de sus sedes.
2. **RF-SL-78:** con dos rutas En Ruta, aparecen de la más reciente a la más antigua.
3. **RF-SL-27 / RN-49:** un cliente con dos pedidos facturados en la ruta aparece en una sola fila con la suma de sus kg.
4. **RF-SL-28 / RN-29** (CP-41): el recorrido guardado es el orden de las filas al pulsar "Ruta Entregada".
5. **RF-SL-29 / RN-11:** la ruta pasa a Entregado, con historial y bitácora, y deja de aparecer en el módulo; una ruta que no está En Ruta no se puede entregar.
6. **RNF-14:** la pantalla se usa con comodidad en 390 px y en 768 px.
7. Coincide con el prototipo en 390, 768 y 1440 px (capturas en el PR) y no tiene violaciones serias de axe.

## Pruebas obligatorias
- Integración del servicio (criterios 1 a 5)
- `pruebas-e2e/picking/ruta.spec.ts` (criterios 2, 4, 6 y 7)

## Verificación
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/picking/ruta.spec.ts
```

## Fuera de alcance
- El registro histórico de rutas (está en Reportes, JC-06).

## Resultado

Se implementó de forma completa el módulo de Ruta del piloto y registro de la entrega (`/picking/ruta`) conforme a `specs/08-picking-ruta.md`, `specs/12`, `specs/14`, `specs/15` y el prototipo aprobado:

1. **Servicio y esquemas (`src/modulos/ruta/`):**
   - `esquemas.ts`: Esquemas Zod para reordenar recorrido y confirmar entrega de ruta.
   - `servicio.ts`: Lógica de negocio con verificación estricta de permisos (`pk.ruta.propias` solo ve sus rutas asignadas, `pk.ruta.todas` o Gerencia/Soporte ve todas las de la sede autorizada).
   - Ordenamiento de rutas en estado "En Ruta" de la más reciente a la más antigua (por fecha y número descendente, RF-SL-78).
   - Reordenamiento persistente de paradas mediante dnd-kit sin registro en bitácora (RN-28, RN-29).
   - Cierre y entrega de ruta en una sola transacción con bloqueo pesimista `FOR UPDATE` (RNF-06): transición de estado a "Entregado", registro en historial de estados, registro en bitácora de auditoría ("Cierre de ruta") y notificación reactiva vía `avisarCambio(sedeId)`.
   - `acciones.ts`: Server Actions seguras con sesión obligatoria, validación Zod y manejo estructurado de errores con rollback optimista (H-24).

2. **Interfaz de usuario (`src/app/picking/ruta/` y `src/componentes/picking/ruta/`):**
   - Estilos CSS idénticos al prototipo (`ruta.css` basado en `estilos.css`).
   - Encabezado con título e instrucciones (`EncabezadoModulo`, RF-SL-61): "Mis rutas" para pilotos y "Rutas en curso" para gerencia/administración.
   - Tabla de paradas con Cliente, Sector y Total (kg) agrupados por cliente (RN-49), sin dirección ni teléfono, con capacidad táctil drag-and-drop (`@dnd-kit/sortable`, RNF-14).
   - Botón "Ruta Entregada" alineado a la derecha sin texto de ayuda (CAM-95) que abre diálogo modal con el recorrido que se guardará.
   - Estado vacío ("No hay rutas en curso") cuando no existen rutas asignadas o disponibles.

3. **Verificación y pruebas:**
   - 11 pruebas unitarias y de integración en `src/modulos/ruta/servicio.test.ts` (criterios 1 a 5, cubriendo RN-46 con rol Bodega y agrupación real de pedidos facturados).
   - 6 pruebas de rechazos de permisos y sedes en `src/modulos/ruta/acciones.test.ts`.
   - 15 pruebas E2E en `pruebas-e2e/picking/ruta.spec.ts` ejecutadas en 3 resoluciones (390 px, 768 px y 1440 px), incluyendo reordenamiento con teclado y consulta a base de datos, con auditoría de accesibilidad axe (RNF-08, 0 violaciones).
   - Capturas de evidencia en `pruebas-e2e/picking/evidencias/JM-06/` en 390, 768 y 1440 px para prototipo y aplicación.
   - `npm run verificar` y `npm run build` ejecutados con 0 errores y 0 advertencias.
