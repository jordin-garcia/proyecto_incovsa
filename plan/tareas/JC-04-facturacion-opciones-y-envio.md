---
id: JC-04
titulo: "Facturación: opciones de envío y envío a Bodega"
persona: jose-daniel
responsable: José Daniel Cifuentes
hito: E2
prioridad: P1
estado: pendiente
depende_de: [JC-03]
programada: 2026-10-18
requisitos: [RF-SL-05, RF-SL-06, RF-SL-13, RF-SL-14, RF-SL-16, RF-SL-17, RF-SL-18, RF-SL-63, RF-SL-70, RF-SL-71, RF-SL-72, RN-12, RN-13, RN-16, RN-29, RN-30, RN-31, RN-33, RN-48, RN-49, RN-51, RN-52, RN-53, RN-57, RNF-06, CU-01, CU-02]
pantallas: [picking.js › filaOpcion, zonaVacia, camposProg, opcionCamion, opcionRecoge, montarFacturacion; base.js › arrastrable, ordenable, opMover, opCampoOpcion, opCancelarOpcion, opEnviarOpcion, siguienteNumero, claveRuta]
---

# JC-04 · Facturación: opciones de envío y envío a Bodega

**Responsable:** José Daniel Cifuentes · **Hito:** E2 · **Prioridad:** P1 · **Programada:** dom 18/10 · **Depende de:** JC-03

## Objetivo
El lado derecho de Facturación: las **dos opciones de envío** ("Envío por camión" y "Cliente recoge en bodega"), el arrastre de pedidos facturados, el control de peso, la fecha y hora programadas, **"Cancelar"** y **"Enviar a Bodega"**, que crea la **ruta** o el **pedido** con su número del día, sus líneas de preparación y sus clientes, en una sola transacción. Es la "generación del picking" de la demostración obligatoria.

## Contexto que debes leer
- `specs/06-picking-facturacion.md` §"Lado derecho: opciones de envío", §"Arrastrar pedidos facturados", §"Peso y alerta de sobrepeso", §"Botones de cada opción", §"Restricciones" y §"Estados" **completos**
- `specs/12`: RN-11 a RN-13, RN-16, RN-29 a RN-31, RN-33, RN-48, RN-49, RN-51 a RN-53, RN-57
- `specs/14` (OPCION_ENVIO, ENVIO, LINEA_PREPARACION, ENTREGA_RUTA, HISTORIAL_ESTADO y sus notas)
- `specs/16`: decisiones 1, 6, 18, 38, 41, 42 y 57; `specs/15`: RNF-06
- `specs/07` §"Agrupación" (RN-51, con el ejemplo de los tres clientes)
- Prototipo: `#/picking/facturacion?cuenta=ejemplo.03`; `picking.js` › `filaOpcion()`, `zonaVacia`, `camposProg()`, `opcionCamion()`, `opcionRecoge()` y `montarFacturacion()` (arrastre, campos, confirmación de envío); `base.js` › `arrastrable()`, `ordenable()`, `opMover()`, `opCampoOpcion()`, `opCancelarOpcion()`, `opEnviarOpcion()`, `siguienteNumero()` y `claveRuta()`
- `## Resultado` de JC-03, JG-05 (`CampoFecha`, `CampoHora`, `Medidor`, `VentanaConfirmacion`) y JG-07
- Context7: `@dnd-kit/core` y `@dnd-kit/sortable` (sensores de puntero, táctil con retraso y teclado; arrastre de varios elementos), Prisma 7 (transacciones interactivas, `$queryRaw` con plantilla)

## Qué hacer
1. **Opciones de envío** (`src/modulos/envios/`): leer y guardar lo de cada opción de la sede (pedidos facturados y su orden, camión, piloto, fecha y hora programadas; RN-48). Lo escrito en la fecha y la hora se guarda mientras se escribe, sin volver a pintar la pantalla (specs/06).
2. **Arrastre** con dnd-kit (decisión 38), igual que el prototipo: del tablero a una opción (uno o **todos los seleccionados** juntos), entre opciones, de una opción al tablero y **dentro de una opción** para ordenarlos (RF-SL-63, RF-SL-71). En pantallas táctiles el arrastre empieza con una **pulsación larga** y un toque corto selecciona (specs/06). También se puede usar con teclado.
3. **"Envío por camión"**: listas del **camión** (los camiones activos de la sede) y del **piloto** (usuarios activos con rol "Piloto" y acceso a la sede, RN-46), fecha y hora programadas (`CampoFecha` y `CampoHora`), los pedidos facturados con su número, cliente y total en kg, el **peso acumulado** frente a la capacidad del camión con el medidor, y la **alerta de sobrepeso**, que solo informa (RN-13).
4. **"Cliente recoge en bodega"**: fecha y hora programadas, pedidos facturados y total en kg.
5. **"Cancelar"** (RF-SL-17): los pedidos facturados de la opción regresan al tablero; bitácora "Cancelación de opción de envío".
6. **"Enviar a Bodega"** (RF-SL-16), habilitado solo con al menos un pedido facturado, fecha y hora (y, en la de camión, camión y piloto); antes, la ventana de confirmación del prototipo con el número que va a recibir. En **una sola transacción** (RNF-06):
   1. bloquear la fila de la opción de envío (`SELECT … FOR UPDATE`, decisión 41);
   2. número del día: el siguiente de la sede, el tipo y la fecha de envío **en la hora de Guatemala** (RN-52; `src/lib/fechas.ts`);
   3. crear el envío (ruta o pedido) **En Preparación**, con la fecha de envío, la fecha y hora programadas (RN-53), el usuario, y en la ruta el camión y el piloto; posición al final de la cola de Bodega;
   4. crear las **líneas de preparación**: una por producto, lote y Peso de Conversión, sumando entre todos los clientes, en el orden de primera aparición (RN-51; lote vacío como texto vacío);
   5. en la ruta, crear las filas de **entrega_ruta**: una por cliente (mismo nombre y sector, RN-49), en el orden de la opción (RN-29);
   6. historial de estado, ligar los pedidos facturados al envío y vaciar la opción;
   7. bitácora "Envío de ruta a bodega" o "Envío de pedido a bodega" con el detalle del prototipo;
   8. después de la transacción, `avisarCambio(sede)`.
   Un segundo clic encuentra la opción vacía y no crea nada.
7. La opción vacía se puede volver a usar, con el mismo camión u otro (un camión puede hacer varias rutas al día).

## Archivos que creas o modificas
- `src/modulos/envios/**` (modificar)
- `src/app/picking/facturacion/**`, `src/componentes/picking/facturacion/**` (modificar)
- `pruebas-e2e/picking/facturacion-envio.spec.ts` (crear)

## Criterios de aceptación
1. **RN-52** (CP-33, CP-34): dos envíos por camión el mismo día crean la Ruta 1 y la Ruta 2; uno de "Cliente recoge" ese día crea el Pedido 1; al día siguiente (en la hora de Guatemala) vuelve a empezar en 1.
2. **RN-51** (CP-19): tres clientes con el mismo producto y Peso de Conversión 25 — 25 kg y 15 kg del lote 5287 y 10 kg del lote 9221 — crean dos líneas: lote 5287 con 40 kg y lote 9221 con 10 kg. Dos líneas sin lote del mismo producto y peso se suman en una.
3. **RNF-06** (CP-35): si falla la creación de las líneas (falla simulada en la prueba), no se guarda nada: ni el envío, ni su número, ni sus líneas, ni su estado, ni la bitácora.
4. **Decisión 41:** dos envíos simultáneos de la misma opción no reciben el mismo número; un doble clic no crea dos envíos.
5. **RN-53 / RF-SL-70** (CP-32, CP-60): sin fecha u hora programadas (o sin camión o piloto en la de camión) no se puede enviar; la fecha y la hora se guardan y se conservan al recargar.
6. **RN-13 / RF-SL-14:** con 3,500 kg en el Camión 1 (3,400 kg) aparece la alerta de sobrepeso y se puede enviar igual.
7. **RF-SL-71 / RN-29 / RN-49** (CP-31): el orden de la opción se guarda; la ruta guarda una fila de entrega por cliente, en ese orden, y dos pedidos facturados del mismo cliente quedan en una sola fila con la suma de sus kg.
8. **RF-SL-17:** "Cancelar" regresa los pedidos facturados al tablero y queda en la bitácora.
9. **RF-SL-63:** el arrastre funciona con mouse, con el dedo (pulsación larga) y con teclado; llevar un seleccionado arrastra todos los seleccionados.
10. Sin `pk.facturacion` o con otra sede, todas las acciones se rechazan en el servidor.
11. La pantalla completa coincide con el prototipo en 390, 768 y 1440 px (capturas en el PR) y no tiene violaciones serias de axe.

## Pruebas obligatorias
- Integración del servicio de envío contra la base de pruebas (criterios 1 a 8, con sus RN y CP)
- Permisos con el ayudante `pruebas/permisos.ts` (criterio 10)
- `pruebas-e2e/picking/facturacion-envio.spec.ts` (criterios 5, 6, 9 y 11)

## Verificación
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/picking/facturacion-envio.spec.ts
```

## Fuera de alcance
- La pantalla de Bodega (JM-03) y la conversión a unidades (JM-02): aquí solo se guardan las líneas en kg con su Peso de Conversión.
- Tiempo real y dos facturadores a la vez (JC-05).

## Notas
- En el `## Resultado`, documenta la función que crea el envío y cómo leer las líneas de preparación y las filas de entrega de un envío: JM-03, JM-06 y JC-06 las usan.
