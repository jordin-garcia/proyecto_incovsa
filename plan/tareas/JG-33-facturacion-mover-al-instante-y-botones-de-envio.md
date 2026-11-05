---
id: JG-33
titulo: Facturación, mover al instante y botones de las opciones de envío
persona: jordin
responsable: Jordin García
hito: entrega
prioridad: P1
estado: hecha
depende_de: []
programada: 2026-11-04
requisitos: [RF-SL-63, RN-48]
pantallas: [picking.js › facturacion]
---

# JG-33 · Facturación, mover al instante y botones de las opciones de envío

**Responsable:** Jordin García · **Hito:** entrega · **Prioridad:** P1 · **Programada:** mié 04/11 · **Depende de:** —

> Pedido del coordinador del 04/11, al probar la aplicación antes de mostrársela al Ing. William.

## Objetivo
Que el pedido facturado que se arrastra en Facturación aparezca de inmediato en su destino, sin regresar antes a su lugar (como en el prototipo), y que con pedidos seleccionados el tablero ofrezca un botón por opción de envío para agregarlos sin arrastrar.

## Contexto que debes leer
- `specs/06-picking-facturacion.md` § «Selección» y § «Arrastrar pedidos facturados (RF-SL-63)»
- `specs/12-reglas-de-negocio.md` › RN-48 (conflictos entre facturadores)
- Prototipo: `entregable-1/prototipos/simulacion/src/picking.js` › `facturacion()`, pantalla `#/picking/facturacion`

## Qué hacer
1. Encontrar por qué el pedido regresa a su lugar antes de moverse y corregirlo en los cuatro casos: del tablero a una opción, entre opciones, de una opción al tablero y dentro de una opción.
2. Agregar, junto a «Eliminar», los botones «Envío por camión» y «Cliente recoge en bodega», que agregan los seleccionados al final de esa opción.
3. Registrar los dos comportamientos en `specs/06` y `specs/18`.

## Archivos que creas o modificas
- `src/componentes/picking/facturacion/FacturacionTablero.tsx` y `OpcionEnvio.tsx` (modificar)
- `src/modulos/envios/opciones.ts` y `acciones.ts` (modificar: `moverPedidos` devuelve cómo quedaron las dos zonas), con sus pruebas `concurrencia.test.ts` y `acciones-integracion.test.ts`
- `pruebas-e2e/picking/facturacion-mover-inmediato.spec.ts` (crear)
- `pruebas-e2e/comunes/navegacion.ts` y `pruebas-e2e/picking/facturacion-dos-facturadores.spec.ts` (modificar: esperar el guardado)
- `specs/06-picking-facturacion.md` y `specs/18-historial-de-decisiones.md` (modificar)

## Criterios de aceptación
1. **RF-SL-63:** Dado un pedido facturado, cuando el facturador lo suelta en otra zona (tablero, «Envío por camión» o «Cliente recoge en bodega»), entonces desde el primer cuadro después de soltarlo se ve en esa zona y no vuelve a verse en la de origen.
2. **RF-SL-63 (04/11):** Dado uno o varios pedidos facturados seleccionados, cuando el facturador pulsa «Envío por camión» o «Cliente recoge en bodega», entonces se agregan al final de esa opción, en el orden del tablero, la selección se limpia y queda guardado.
3. **RN-48:** Dos movimientos seguidos, hechos antes de que responda el servidor, se guardan sin el aviso de conflicto; un movimiento que el servidor rechaza devuelve la pantalla a lo guardado con el aviso.

## Pruebas obligatorias
- `pruebas-e2e/picking/facturacion-mover-inmediato.spec.ts` (criterios 1 y 2, en los tres proyectos).
- `facturacion-envio.spec.ts`, `facturacion-dos-facturadores.spec.ts` y `flujo/flujo-completo.spec.ts` siguen pasando (criterio 3).

## Verificación
Además de los comandos generales del protocolo (B6 y B7):
```
npm run verificar
npm run build
npm run e2e
```

## Fuera de alcance
- Cambiar el prototipo aprobado: los botones son un agregado del coordinador.

## Resultado

**Causa del regreso.** Había dos causas. `DragOverlay` de dnd-kit tiene por defecto una animación al soltar que lleva la copia arrastrada hasta el elemento original, que seguía en su lugar. Y la tarjeta solo cambiaba de zona cuando terminaban la acción del servidor y `router.refresh()`.

**Qué se hizo** (`src/componentes/picking/facturacion/FacturacionTablero.tsx`):
- `DragOverlay dropAnimation={null}`.
- Una **cola de movimientos**: `mover()` agrega el movimiento con lo que el facturador veía en las dos zonas al soltar (`vistos`), y la vista lo aplica en el acto (`aplicarMovimientos()`, con la misma regla que `moverPedidos()` del servidor: antes de `antesDe` o al final). Un efecto los guarda uno a la vez, en orden, sin esperar a que se refresque la pantalla: cada zona se compara (RN-48) con lo que se vio al soltar o, si un movimiento anterior de la cola ya la cambió, con lo que devolvió el servidor. Para eso `moverPedidos` ahora devuelve `{ estadoOrigen, estadoDestino }` (id, posición y fecha de modificación de cada pedido de las dos zonas), y `moverPedidosFacturados` lo entrega en `datos`. Si el servidor rechaza uno, se vacía la cola y la vista vuelve a lo guardado con el aviso.
- Un movimiento guardado se deja de aplicar cuando los datos del servidor lo incluyen, es decir, cuando cada pedido movido trae la fecha de modificación que dejó el servidor o una posterior (`incluido()`). Así, unos datos anteriores que retuvo la pausa de la vista no lo deshacen.
- Mientras los datos no incluyan todos los movimientos, la zona lleva `aria-busy` y esperan las acciones que comprueban conflictos con lo que se ve: «Eliminar», «Cancelar» y «Enviar a Bodega» (prop `esperandoMovimientos` de `OpcionEnvio`), además de «Seleccionar todos», «Cargar archivo .xlsx» y los botones nuevos. Los campos de las opciones solo se desactivan mientras dura cada guardado, como antes. Recargar o cerrar con movimientos sin guardar pide confirmación (`beforeunload`).
- Con pedidos seleccionados, junto a «Eliminar», un botón secundario pequeño por opción (íconos `camion` y `edificio`, como en los encabezados de las opciones), que llama a `mover()` con destino esa opción y `antesDe: null`.

**Pruebas.** `concurrencia.test.ts` comprueba que el estado devuelto sirve para el siguiente movimiento y que lo visto antes sigue siendo un conflicto. `facturacion-mover-inmediato.spec.ts` tiene cuatro pruebas por proyecto: graba en cada cuadro la zona de la tarjeta desde que se suelta hasta que el servidor confirma; con el componente anterior falla («tablero-pedidos» en vez de «zona-camion»); los botones; dos arrastres seguidos sin esperar, sin aviso; y el aviso cuando otro facturador agrega un pedido a la opción mientras el primero arrastra otro. `recargar()` ahora espera a que no quede ningún `aria-busy="true"`, y el `mover()` de la prueba de dos facturadores espera el guardado, para que el otro facturador actúe sobre lo ya guardado.

**Cómo usarlo.** Para otra pantalla que quiera mostrar un cambio antes de que responda el servidor, el patrón está en `TableroInteractivo`: estado `cola` con los datos del servidor de referencia y los `movimientos` (con `vistos` y `guardado`), `conocidos` con lo que devolvió el servidor y un efecto que envía uno a la vez. Las pruebas que recargan después de mover pedidos ya esperan solas, con `recargar()`.
