---
id: JM-03
titulo: "Bodega: preparación, detalle y despacho de rutas y pedidos"
persona: josue
responsable: Josué Menéndez
hito: E2
prioridad: P1
estado: hecha
depende_de: [JM-02, JG-07]
programada: 2026-10-18
requisitos: [RF-SL-19, RF-SL-20, RF-SL-21, RF-SL-22, RF-SL-23, RF-SL-24, RF-SL-35, RF-SL-74, RF-SL-75, RF-SL-76, RN-11, RN-20, RN-51, CU-03, CU-04]
pantallas: [picking.js › pedidosBodega, metaPedido, loteHtml, bodega, herramientas, tarjetaPedido, detalle, despachar; base.js › opMarcar, opMarcarTodo, opOrdenPeso, opDespachar]
---

# JM-03 · Bodega: preparación, detalle y despacho de rutas y pedidos

**Responsable:** Josué Menéndez · **Hito:** E2 · **Prioridad:** P1 · **Programada:** dom 18/10 · **Depende de:** JM-02, JG-07

## Objetivo
El módulo de Bodega: la lista de rutas y pedidos **En Preparación** de la sede, la tabla de cada uno con el producto, el lote, la cantidad y las **unidades**, el marcado de lo que ya se sacó, marcar todo, ordenar por peso, el **Detalle de Ruta** o **de Pedido** y el **despacho**. Es la "preparación" de la demostración obligatoria.

## Contexto que debes leer
- `specs/07-picking-bodega.md` **completo** (salvo §"Tablero en pantalla completa", que es de JM-05)
- `specs/12`: RN-01, RN-11 (estados y transiciones), RN-20, RN-28 y RN-51
- `specs/14` (ENVIO, LINEA_PREPARACION, HISTORIAL_ESTADO)
- Prototipo: `#/picking/bodega?cuenta=ejemplo.05`; `picking.js` › `pedidosBodega()`, `metaPedido()`, `loteHtml()`, `bodega()`, `herramientas()`, `tarjetaPedido()`, `detalle()` y `despachar()`; `base.js` › `opMarcar()`, `opMarcarTodo()`, `opOrdenPeso()` y `opDespachar()`
- `## Resultado` de JM-02, JC-04 (cómo leer las líneas de un envío), JG-05 y JG-07

## Qué hacer
1. `src/modulos/bodega/`: servicio y acciones (permiso `pk.bodega` y sede de trabajo) para listar los envíos En Preparación de la sede en el orden de la cola, marcar y desmarcar una línea, marcar o desmarcar todas, ordenar las líneas de mayor a menor kg (RN-28: es un orden más, se puede volver a cambiar; no va a la bitácora) y **despachar**.
2. **Despachar** (RF-SL-24): solo si todas las líneas están marcadas; en una transacción, el **pedido** pasa a **Despachado** y la **ruta** a **En Ruta** (RN-11), con su historial (fecha, hora y usuario) y la bitácora "Cambio de estado" con el detalle del prototipo; después, `avisarCambio(sede)`. El envío sale de Bodega.
3. Pantalla `src/app/picking/bodega/` igual a `bodega()`:
   - una tarjeta por envío con el cuadro del tipo y su número ("RUTA" en `--v600`, "PEDIDO" en `--lima`, CAM-94), la **fecha y hora programadas** (no la hora de envío, RF-SL-75), y en la ruta el camión y el piloto;
   - tabla con Producto, **Lote** (etiqueta verde `--v100` con texto `--v700`; "Sin lote" en gris si está vacío), Cantidad en kg, **Unidades** (componente `Unidades` de JM-02) y la casilla **Listo**;
   - las herramientas del prototipo: marcar todo / desmarcar todo, ordenar por peso, **"Detalle de Ruta"** o **"Detalle de Pedido"**, y el botón **"Ruta Despachada"** o **"Pedido Despachado"**, habilitado solo con todo marcado;
   - el **Detalle** (RF-SL-74) es una ventana de solo lectura con todos los pedidos facturados del envío, completos, con número, cliente, sector, total y cada línea (producto, lote, Peso de Conversión, cantidad y conversión), en el orden del facturador; si no cabe, se desplaza la ventana;
   - sin contador en la barra lateral (RF-SL-76);
   - la pantalla usa `useCambiosDeSede(sede)` y cada acción llama a `avisarCambio(sede)`.
4. El marcado no registra quién marcó ni va a la bitácora (RN-20).

## Archivos que creas o modificas
- `src/modulos/bodega/**` (crear)
- `src/app/picking/bodega/**`, `src/componentes/picking/bodega/**` (crear)
- `pruebas-e2e/picking/bodega.spec.ts` (crear)

## Criterios de aceptación
1. **RF-SL-19:** Bodega muestra solo los envíos En Preparación de la sede de trabajo, en el orden en que llegaron de Facturación.
2. **RF-SL-21 / RN-51** (CP-19): el envío del ejemplo de los tres clientes de `specs/07` muestra dos filas: lote 5287 con 40 kg ("1 unidad + 15 kg") y lote 9221 con 10 kg ("0 unidades + 10 kg"), con el lote resaltado.
3. **RF-SL-23 / RN-20:** marcar una fila se guarda (sigue al recargar), no registra quién marcó y no va a la bitácora; "Marcar todo" marca todas.
4. **RF-SL-20 (orden por peso)** (CP-39): ordena las filas de mayor a menor kg y el orden se guarda; no va a la bitácora.
5. **RF-SL-24 / RN-11** (CP-38): el botón de despacho solo se habilita con todo marcado; el pedido pasa a Despachado y la ruta a En Ruta, con historial y bitácora, y salen de Bodega. Un despacho de un envío que no está En Preparación se rechaza.
6. **RF-SL-74 / RF-SL-75** (CP-36): se ve la fecha y hora programadas y no la hora de envío; el Detalle muestra completos todos los pedidos facturados y sus líneas.
7. Sin `pk.bodega` o con otra sede, todas las acciones se rechazan en el servidor.
8. La pantalla coincide con el prototipo en 390, 768 y 1440 px (capturas en el PR) y no tiene violaciones serias de axe.

## Pruebas obligatorias
- Integración del servicio (criterios 1 a 5 y 7) con envíos de prueba (ver Notas)
- `pruebas-e2e/picking/bodega.spec.ts` (criterios 2, 3, 5, 6 y 8)

## Verificación
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/picking/bodega.spec.ts
```

## Fuera de alcance
- Reordenar rutas, pedidos y filas a mano y el tiempo real por SSE (JM-04); el tablero en pantalla completa (JM-05).

## Notas
- JC-04 se hace el mismo día. Para no esperarla, las pruebas crean los envíos y sus líneas de preparación directamente con Prisma en la base de pruebas, con los mismos datos de `specs/07` (ejemplo de los tres clientes). Si JC-04 ya está integrada, usa su función de envío. Para ver la pantalla con datos en local antes de JC-04, crea los envíos con un script de prueba, nunca en la semilla.

## Resultado
- **Implementación**:
  - `src/modulos/bodega/esquemas.ts`: Esquemas Zod para marcado individual, marcado en bloque, ordenamiento por peso, despacho y detalle de envío (`esquemaDetalleEnvio`).
  - `src/modulos/bodega/servicio.ts`: Lógica de negocio completa (`listarEnviosEnPreparacion`, `obtenerDetalleEnvio`, `marcarLinea`, `marcarTodasLineas`, `ordenarLineasPorPeso`, `despacharEnvio`). Manejo transaccional en despacho con bloqueo pesimista `SELECT ... FOR UPDATE` (decisión 41 de specs/16) para prevenir carreras de concurrencia, conversión de `@db.Date` a día ISO (evitando desfase horario UTC−6), actualizando estado, creando `historialEstado` y registrando bitácora (`Cambio de estado`). Aislamiento multi-sede mediante enmascaramiento con `ErrorAcceso`.
  - `src/modulos/bodega/acciones.ts`: Server Actions (`marcarLineaAccion`, `marcarTodoAccion`, `ordenarPorPesoAccion`, `despacharAccion`, `obtenerDetalleEnvioAccion`) protegidas con `exigirPermiso(sesion, "pk.bodega", sede.id)`, validación Zod y notificación reactiva con `avisarCambio(sede.id)`.
  - `src/componentes/picking/bodega/`: Componentes modulares `TarjetaEnvio`, `ModalDetalle` y orquestador `BodegaCliente` con suscripción `useCambiosDeSede(sede.id)`.
  - `src/app/picking/bodega/`: Página de servidor con `exigirPermiso` y estilos de `bodega.css` apegados estrictamente al sistema de diseño y tokens CSS (`design-system.test.mjs`), idénticos al prototipo (`estilos.css`).
- **Verificación**:
  - `npm run verificar` aprobado: formato, lint, tipos y 153 pruebas en Vitest (24 pruebas específicas de Bodega en `servicio.test.ts` y `acciones.test.ts`).
  - `npm run build` aprobado: generación de ruta `/picking/bodega`.
  - `pruebas-e2e/picking/bodega.spec.ts`: 15 pruebas Playwright aprobadas en teléfono, tableta y escritorio, incluyendo análisis de accesibilidad con axe y verificación de fecha del detalle.
  - Evidencias visuales y dictamen de revisión en `plan/evidencias/JM-03/`.


### Correcciones de la auditoría (2026-10-22)

D-01, RN-49: el conteo de clientes usa claveCliente(), compartida con Facturación y las entregas, y agrupa correctamente tildes, mayúsculas y espacios exteriores. No se incluyen las correcciones de Bodega asignadas a JG-23.

H-17 (JG-23): el encabezado usa `EncabezadoModulo`, con la instrucción a la par del título y «Abrir tablero en pantalla completa» en `acciones`, como `cab()`; lo comprueba `pruebas-e2e/comunes/encabezado.ts`.

H-18, H-19, H-20 y H-21 (JG-23): `bodega.css` agrega `.ped-meta .prog` (verde `--v700`, negrita) y la regla de ≤720 px de `.ped-avance`, iguala `.ped-herr` (8 px, `12px 22px`, fondo blanco) y quita el `max-height` de `.det-grupos`: en el Detalle se desplaza la ventana. `.det-grupos` ya no lleva `role="region"` ni `tabIndex`; las tablas internas sí, porque se desplazan a lo ancho en el teléfono.

H-22 (JG-23): `exigirEnvioEnPreparacion()` de `src/modulos/bodega/servicio.ts` lanza `ErrorAcceso` para otra sede o un envío inexistente y `ErrorNegocio("El pedido ya no está en preparación.")` para un envío de la sede que ya salió de Bodega.

H-23 (JG-23): el caso «otra sede» de `acciones.test.ts` usa un envío real de la sede 2; `comprobarRechazosDeAccion()` (`pruebas/permisos.ts`) acepta una función para la entrada de otra sede.
