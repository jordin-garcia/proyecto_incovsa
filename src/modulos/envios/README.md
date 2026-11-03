# Módulo `envios`

**Dueño:** José Daniel Cifuentes (`jose-daniel`), según `plan/convenciones.md` §2.

Facturación: opciones de envío de cada sede, armado de rutas y pedidos, y envío a Bodega con su numeración diaria.

Especificación: `specs/06-picking-facturacion.md`; `specs/16`, decisiones 18 y 41.

Archivos: `servicio.ts` (reglas de negocio), `esquemas.ts` (Zod), `acciones.ts` (acciones del servidor) y sus pruebas `*.test.ts` (`plan/convenciones.md` §4.1).

## Opciones y envío a Bodega (JC-04)

`opciones.ts` exporta:

- `consultarOpciones(sesion, sedeId)`: las dos opciones ordenadas (camión, recoge), sus pedidos y campos persistidos, camiones activos de la sede y pilotos activos con acceso a ella. Los kg son textos decimales exactos.
- `guardarCampoOpcion(sesion, { sedeId, tipo, campo, valor })`: guarda un campo de fecha, hora, camión o piloto. Fecha como `AAAA-MM-DD`, hora como `HH:MM`; `null` vacía el campo. No crea bitácora.
- `moverPedidos(sesion, { sedeId, ids, origen, destino, antesDe, estadoOrigen, estadoDestino })`: mueve pedidos o conserva un nuevo orden; `origen` y `destino` son `camion`, `recoge` o `null` (tablero). `antesDe: null` los agrega al final. Rechaza pedidos de otra sede, ya enviados o que no estén en el origen indicado.
- `cancelarOpcion(sesion, { sedeId, tipo, estadoEsperado })`: devuelve los pedidos al final del tablero, conserva los campos y registra la cancelación.
- `enviarOpcion(sesion, { sedeId, tipo, estadoEsperado })`: crea el envío completo y devuelve `{ id, numero, tipo, fecha }`, con tipo `ruta` o `pedido` y fecha de Guatemala `AAAA-MM-DD`. Una opción ya vacía devuelve `null`. Bloquea la opción con `FOR UPDATE`, numera dentro de la transacción, crea las líneas, entregas, historial y bitácora, liga los pedidos y vacía todos los campos de la opción. Las cantidades se suman con `Prisma.Decimal`.

Todas validan sesión, permiso `pk.facturacion`, sede y entrada. Las acciones de `acciones.ts` comprueban además la sede de trabajo y llaman a `avisarCambio(sedeId)` después del cambio confirmado.

## Dos facturadores (JC-05)

Cada pedido leído incluye `posicion` y `actualizadoEn` (ISO). `estadoDePedidos(pedidos)`, desde `estado-pedidos.ts`, conserva únicamente `{ id, posicion, actualizadoEn }` para devolver al servidor el estado que vio la persona:

- Movimientos: `estadoOrigen` y `estadoDestino` incluyen todos los pedidos de las dos zonas, en su orden visible.
- Cancelar o enviar: `estadoEsperado` incluye todos los pedidos de la opción en el momento de abrir la confirmación.
- Eliminar: `eliminarDelTablero(ids, { sedeId, usuarioId, estadoEsperado })` recibe solo los pedidos seleccionados, en el orden del tablero.

El estado es obligatorio y se valida con Zod. Bajo el mismo bloqueo transaccional por sede que usan cargas, movimientos y envíos, se comprueban ubicación, posición y modificación antes de escribir o registrar bitácora. Un conflicto lanza el aviso confirmado de `specs/06`; el cliente muestra el error y actualiza la pantalla. En una opción vacía, enviar conserva el resultado `null` para el doble clic (decisión 41).

El armazón ya comparte la suscripción `useCambiosDeSede`; Facturación no abre otra. `FacturacionTablero` aplaza aplicar los datos entrantes durante el arrastre y la edición de fecha/hora o sus guardados pendientes. Al terminar aplica el contenido más reciente sin perder el borrador durante la interacción.

### Lecturas para Bodega, Ruta y Reportes

Con el permiso del módulo y la sede previamente autorizados, consultar `envio` por `{ id, sedeId }`:

- `lineas`, ordenadas por `posicion`: producto, lote (texto vacío si no vino), `pesoConversionKg`, `cantidadKg` y `marcado` inicialmente `false`.
- `entregas`, ordenadas por `orden`: una fila por cliente y sector exactos, con el total en kg; solo existen en rutas.
- `pedidosFacturados`, ordenados por `posicion`, incluyendo `detalles` por `orden`: conserva el detalle y el Peso de Conversión originales.
- `historial`, por `creadoEn`: incluye el primer estado `En Preparación`, su usuario y fecha de creación.

`programadoPara` es un instante UTC que representa la fecha y hora programadas en Guatemala. `fechaEnvio` es la fecha de calendario usada por el correlativo diario; no debe interpretarse como un instante de medianoche de Guatemala al mostrarla: extraer su día de columna `Date` y usar los ayudantes de `@/lib/fechas`.
