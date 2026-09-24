# 06. Módulo de Facturación

## Propósito

Es la entrada de los pedidos al sistema. El facturador registra aquí los datos de facturas **ya emitidas en Odoo**, para que Bodega los prepare y se controlen las existencias.

## Acceso

Operativo Facturador (solo su sede), Gerencia y Soporte IT (todas las sedes).

## Datos del pedido

| Campo | Regla |
|---|---|
| Tipo de pedido | "Cliente recoge en bodega" o "Envío en camión" (RF-SL-05) |
| Camión | Solo si el tipo es envío en camión. Se elige entre los camiones de la sede (RF-SL-06) |
| Piloto | Solo si el tipo es envío en camión. Se elige entre los usuarios con rol Operativo Piloto de la sede (RF-SL-06) |
| Correlativo | Número interno, **correlativo por sede**, que el sistema asigna al **guardar** el pedido. **No** se registra el número de factura |

- Un pedido de tipo cliente recoge en bodega **no pasa por Ruta**.
- Un pedido de envío en camión equivale a **una carga completa de camión** y puede incluir varias facturas y varios clientes.
- Un camión puede hacer **varias rutas en el mismo día**.

## Tabla de captura

| Columna | Contenido |
|---|---|
| Cliente | Se elige de la base de clientes. Se busca por nombre en tiempo real y se muestra en una lista desplegable (RF-SL-09) |
| SKU | Sufijo del código del producto elegido, solo informativo (ver [02-glosario.md](02-glosario.md)) |
| Producto | Código completo del producto. Se busca por nombre en tiempo real y se muestra en una lista desplegable (RF-SL-10) |
| Cantidad | Cantidad facturada, **en kg** |

### Comportamiento

- La tabla empieza vacía. Cada clic en el botón "+" agrega una fila (RF-SL-08).
- No se crean clientes ni productos desde aquí; solo se usan los existentes (RF-SL-11).
- Las filas se pueden reordenar, editar y eliminar (RF-SL-12).
- La columna Cantidad se suma automáticamente y el total en kg aparece al pie (RF-SL-13).
- **Se aceptan cantidades que no son múltiplo del Peso2** (ventas fraccionadas, RN-21).
- En la base de clientes hay nombres repetidos. Cómo se distinguen en la búsqueda está pendiente (P-25).

## Alerta de capacidad del camión (RF-SL-14, RN-13)

- Solo aplica a pedidos de envío en camión.
- Aparece cuando el total alcanza o supera la capacidad del camión elegido, en kg: 3,400 kg o 6,000 kg en Quetzaltenango.
- **Solo informa, no bloquea.** El usuario puede seguir agregando filas y enviar el pedido aunque exceda la capacidad.
- INCOVSA acepta que la alerta sea aproximada.

## Validación de existencias (RF-SL-15, RN-07)

- Se valida al agregar o editar cada fila, contra la existencia de la sede del pedido.
- Se valida la **suma de todas las filas del mismo código de producto** en el pedido, no cada fila por separado.
- Si no alcanza, el sistema alerta y **no permite enviar** el pedido hasta que se corrija o se elimine la fila.

## Botones de cierre

| Botón | Efecto |
|---|---|
| **Enviar Pedido a Bodega** | En una sola transacción: guarda el pedido y sus líneas con el **Peso2 vigente** de cada producto (RN-33), asigna el correlativo de la sede, registra una **salida por venta** por cada producto, cambia el estado a **En Preparación** y lo pone a disposición de Bodega. Si es de envío en camión, **en este mismo paso se crea la ruta** con su número (correlativo por sede), la fecha del envío, el camión y el piloto (RF-SL-16, RF-SL-30) |
| **Cancelar** | Descarta la captura. **El pedido no se guarda**, pero la bitácora registra la cancelación (RF-SL-17) |

## Restricciones

- No hay borradores. Si la sesión se interrumpe antes de enviar, se pierde la captura (RF-SL-18, RN-16).
- Un pedido ya enviado a bodega no se puede editar ni cancelar (RF-SL-18).
- Solo un facturador trabaja a la vez. Así opera hoy la empresa; el sistema **no** tiene que imponerlo.

## Estados en este módulo

- **Pendiente:** mientras se captura. Solo se ve en pantalla y no se guarda.
- **Cancelado:** al pulsar Cancelar. Solo se ve en pantalla y no se guarda; queda en la bitácora.
- **En Preparación:** al enviar. Es el primer estado que se guarda.

Ver RN-11 en [12-reglas-de-negocio.md](12-reglas-de-negocio.md).
