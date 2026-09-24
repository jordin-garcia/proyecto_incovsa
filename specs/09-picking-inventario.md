# 09. Módulo de Inventario

## Propósito

Llevar la **existencia actual en kg de cada producto en cada sede**, sumando entradas y restando salidas. No controla lotes ni ubicaciones; eso lo hace Odoo. El sistema **no** se conecta con Odoo.

## Acceso

Solo **Gerencia y Soporte IT**, en todas las sedes (RF-SL-39). Por eso, en cada operación se elige la sede.

## Tipos de movimiento (RN-22)

| Tipo | Sentido | Dónde se origina |
|---|---|---|
| Compra | Entrada | Inventario, manual |
| Ajuste positivo | Entrada | Inventario, manual, con motivo |
| Traslado recibido | Entrada | Automático, al registrar un traslado |
| Devolución | Entrada | Inventario, manual, ligada a un pedido |
| Venta | Salida | Automático, al pulsar "Enviar Pedido a Bodega" en Facturación |
| Ajuste negativo | Salida | Inventario, manual, con motivo |
| Traslado enviado | Salida | Inventario, manual (el traslado) |

La carga inicial de existencias **no** es un movimiento de este módulo: se hace una sola vez desde el Excel maestro ([13-datos-maestros.md](13-datos-maestros.md)).

## Consulta de existencias (RF-SL-40)

- Existencia actual por producto (código completo) y sede, en kg.
- Se busca por nombre de producto.
- Las existencias **no** se consolidan entre sedes.

## Compra (RF-SL-41, RN-27)

| Campo | Regla |
|---|---|
| Producto | Producto existente, buscado por nombre |
| Sede | Sede que recibe |
| Cantidad | En kg, mayor que cero |

- **Solo se registran cantidades.** No se capturan lote, proveedor, orden de compra, póliza ni nota de ingreso.
- Si el producto (por ejemplo, un lote nuevo con código nuevo) no existe, **primero Gerencia o Soporte IT lo crean en Configuración** con su Peso2, y después se registra la compra.
- Efecto: suma la cantidad a la existencia del producto en esa sede.

## Ajuste (RF-SL-42, RN-26)

| Campo | Regla |
|---|---|
| Producto | Existente |
| Sede | Sede afectada |
| Sentido | Positivo (suma) o negativo (resta) |
| Cantidad | En kg, mayor que cero |
| Motivo | **Obligatorio** |

Un ajuste negativo no puede dejar la existencia por debajo de cero (RN-24).

## Traslado entre sedes (RF-SL-43, RN-25)

| Campo | Regla |
|---|---|
| Producto | Existente |
| Sede de origen | Distinta de la de destino |
| Sede de destino | Distinta de la de origen |
| Cantidad | En kg, mayor que cero |

- En **una sola transacción** se registran la salida en la sede de origen y la entrada en la de destino.
- No se puede trasladar más de la existencia de la sede de origen (RN-24).
- El traslado no tiene estado "en tránsito": se aplica de inmediato.

## Devolución (RF-SL-44, RF-SL-45, RN-23)

Aplica a **los dos tipos de pedido**: cliente recoge en bodega y envío en camión.

### Flujo

1. Gerencia o Soporte IT buscan el pedido por su **correlativo**.
2. Solo se aceptan pedidos en estado **Despachado** o **Entregado**.
3. El sistema muestra las líneas del pedido: cliente, producto, cantidad vendida en kg y cantidad ya devuelta en kg.
4. El usuario escribe los kg devueltos en una o varias líneas. En cada línea, lo devuelto no puede superar **lo vendido menos lo ya devuelto**.
5. El usuario escribe el **motivo**, que es obligatorio.
6. Al guardar:
   - se registra una entrada por devolución por cada línea con cantidad;
   - la cantidad vuelve a la existencia del **mismo código de producto** en la **sede del pedido**;
   - el pedido recibe la marca **"Con devolución"**, que no cambia su estado;
   - quedan visibles el usuario y la fecha y hora de la devolución.

### Reglas

- Un pedido puede tener **varias devoluciones**, siempre que no se devuelva más de lo vendido en ninguna línea.
- La ruta no se modifica.

## Registro de cada movimiento (RF-SL-47)

Cada movimiento guarda:

- tipo;
- producto;
- sede;
- cantidad en kg;
- fecha y hora;
- usuario;
- motivo, si es ajuste o devolución;
- pedido y línea, si es venta o devolución;
- traslado al que pertenece, si es traslado.

## Edición de movimientos (RF-SL-49, RN-34)

- Gerencia y Soporte IT pueden **editar** un movimiento ya registrado (confirmado el 24/09).
- Al editarlo, la existencia se recalcula y no puede quedar por debajo de cero (RN-24).
- La bitácora registra la edición: quién la hizo, cuándo, y los valores anteriores y nuevos.
- [PENDIENTE] P-50:
  - ¿Qué tipos se pueden editar? Hay tipos que nacen de otras operaciones: las ventas, del envío del pedido; los traslados, de dos movimientos ligados, y las devoluciones, de un pedido.
  - ¿Qué campos se pueden cambiar?
  - ¿La edición exige motivo?
  - ¿También se pueden eliminar movimientos?

## Transacciones (RNF-06)

Cada operación que cambia existencias es **transaccional**: se aplica completa o no se aplica. Eso incluye el envío de un pedido con varias líneas, un traslado y una devolución con varias líneas.
