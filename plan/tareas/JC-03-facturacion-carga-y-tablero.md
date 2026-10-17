---
id: JC-03
titulo: "Facturación: carga del archivo y tablero de pedidos facturados"
persona: jose-daniel
responsable: José Daniel Cifuentes
hito: E2
prioridad: P1
estado: pendiente
depende_de: [JC-02, JG-07]
programada: 2026-10-18
requisitos: [RF-SL-07, RF-SL-13, RF-SL-50, RF-SL-61, RF-SL-67, RF-SL-68, RF-SL-69, RN-48, CU-01]
pantallas: [picking.js › facturacion, tarjetaFact, accSel, montarFacturacion, cargarArchivo, preparar; base.js › opCargarArchivo, opEliminarFacturados]
---

# JC-03 · Facturación: carga del archivo y tablero de pedidos facturados

**Responsable:** José Daniel Cifuentes · **Hito:** E2 · **Prioridad:** P1 · **Programada:** dom 18/10 · **Depende de:** JC-02, JG-07

## Objetivo
La pantalla de Facturación con la **carga del archivo de Odoo** (guarda los pedidos facturados en la base) y el lado izquierdo: el **tablero de pedidos facturados**, persistente, con selección de uno, varios o todos, y la eliminación.

## Contexto que debes leer
- `specs/06-picking-facturacion.md` §"Propósito", §"Flujo", §"Pantalla de Facturación" y §"Lado izquierdo: tablero de pedidos facturados" **completos**
- `specs/04`: RF-SL-07, RF-SL-13, RF-SL-50, RF-SL-61, RF-SL-67 a RF-SL-69; `specs/12`: RN-48; `specs/02` (pedido facturado, tablero)
- `specs/14` (PEDIDO_FACTURADO y DETALLE_PEDIDO_FACTURADO y sus notas) y `specs/16`, decisiones 3 y 4
- `plan/convenciones.md` §4 y §7
- Prototipo: pantalla `#/picking/facturacion?cuenta=ejemplo.03`; `picking.js` › `facturacion()`, `tarjetaFact()`, `accSel()`, `montarFacturacion()` (selección y eliminación), `cargarArchivo()` y `preparar()` (ventana del resumen de la carga); `base.js` › `opCargarArchivo()` y `opEliminarFacturados()`
- `## Resultado` de JC-02, JG-05, JG-06 y JG-07

## Qué hacer
1. `src/modulos/envios/` (pedidos facturados): servicio y acciones para **cargar** (con `pk.facturacion` y la sede de trabajo; lee con `leerArchivoOdoo`; guarda en una transacción los pedidos facturados con sus líneas, el usuario que cargó y su posición al final del tablero; bitácora "Carga de archivo de Odoo" con el detalle del prototipo), **listar el tablero** de la sede (sin opción de envío ni envío, en su orden) y **eliminar** los seleccionados (los borra; bitácora "Eliminación de pedidos facturados" con número, cliente y total de cada uno; decisión 3).
2. Pantalla `src/app/picking/facturacion/` con el encabezado y la instrucción corta a la par del título (RF-SL-61) y el botón "Cargar archivo .xlsx"; al terminar la carga, la ventana del resumen de `preparar()` (cuántos se cargaron, cuáles no y por qué, otros estados).
3. Tablero de pedidos facturados (lado izquierdo, RF-SL-67): una **tarjeta de todo el ancho** por pedido facturado, sin asa ni "x", con número, cliente, sector, total en kg y sus productos con su cantidad (RF-SL-07, CAM-75); el total del tablero como en el prototipo.
4. Selección (RF-SL-69): un clic (o toque corto) selecciona o quita la selección; "Seleccionar todos"; la tarjeta seleccionada se **compacta** con solo su número y su peso total; seleccionar **no mueve el desplazamiento** del tablero (CAM-88). Con selección aparece "Eliminar", que pide confirmación (RF-SL-68).
5. El lado derecho (opciones de envío) queda con su estructura vacía del prototipo; lo completa JC-04.

## Archivos que creas o modificas
- `src/modulos/envios/**` (crear; la parte de pedidos facturados)
- `src/app/picking/facturacion/**`, `src/componentes/picking/facturacion/**` (crear)
- `pruebas-e2e/picking/facturacion-carga.spec.ts` (crear)

## Criterios de aceptación
1. **RF-SL-50 / CU-01:** con `ejemplo.03` y el archivo anonimizado, se guardan 33 pedidos facturados y la ventana del resumen dice cuáles no se cargaron y por qué, con los textos del prototipo.
2. **RF-SL-67 / RN-48:** el tablero sigue igual al recargar, al cerrar sesión o al entrar con `ejemplo.04` (otro facturador de la misma sede).
3. **RF-SL-07 / RF-SL-13:** cada tarjeta muestra número, cliente, sector, total en kg y productos con su cantidad.
4. **RF-SL-69 / CAM-88:** "Seleccionar todos" selecciona todo; la tarjeta seleccionada se compacta; seleccionar no mueve el desplazamiento.
5. **RF-SL-68:** "Eliminar" borra los seleccionados después de confirmar y la bitácora guarda sus datos.
6. **RN-17 / RNF-04:** sin `pk.facturacion` o con otra sede, cargar, listar y eliminar se rechazan en el servidor.
7. La pantalla coincide con el prototipo en 390, 768 y 1440 px (capturas en el PR) y no tiene violaciones serias de axe.

## Pruebas obligatorias
- Integración del servicio (criterios 1, 2, 5) y de permisos con el ayudante `pruebas/permisos.ts` (criterio 6)
- `pruebas-e2e/picking/facturacion-carga.spec.ts` (criterios 1, 3, 4, 7)

## Verificación
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/picking/facturacion-carga.spec.ts
```

## Fuera de alcance
- Arrastrar, opciones de envío y envío a Bodega (JC-04); tiempo real entre facturadores (JC-05).

## Notas
- La carga del archivo usa la acción del servidor con el límite de 3 MB (decisión 58).
