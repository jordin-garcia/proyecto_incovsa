# 08. Módulo de Ruta

## Propósito

Muestra al piloto los clientes a los que debe ir en su ruta y registra que se entregó.

## Acceso

- Los usuarios con rol **"Piloto"** ven **solo sus rutas asignadas** (RF-SL-26). El rol "Piloto" es el que identifica a los pilotos ([03-roles-y-accesos.md](03-roles-y-accesos.md)).
- Los usuarios con el permiso "Ver todas las rutas", y Gerencia y Soporte, ven todas las rutas de las sedes que tienen asignadas.
- El piloto lo usa desde un **teléfono o una tableta**, así que la pantalla tiene que ser responsiva (RNF-14).

## Cuándo se crea y cuándo aparece una ruta

- La ruta **se crea** cuando el facturador pulsa "Enviar Pedido a Bodega" en una **opción de camión** de Facturación. En ese momento se crea el pedido con los pedidos facturados de esa opción, y la ruta recibe su número y su fecha. Cada ruta corresponde a **un pedido**, que puede tener varios clientes.
- **Aparece en el módulo de Ruta** del piloto cuando Bodega pulsa "Pedido Despachado" y el pedido pasa a **En Ruta**.

## Registro de la ruta (RF-SL-30, RN-30)

| Dato | Regla |
|---|---|
| Número de ruta | Correlativo **por sede**, asignado al enviar a bodega. Una ruta no tiene nombre, solo número |
| Fecha | La fecha en que el pedido se envió de Facturación a Bodega |
| Pedido | El pedido (correlativo por sede) que se armó en la opción de camión |
| Camión | El que se asignó en Facturación |
| Piloto | El que se asignó en Facturación |

**No** se registran horas de salida ni de regreso.

## Tabla de la ruta (RF-SL-27)

| Columna | Contenido |
|---|---|
| Cliente | Nombre del cliente |
| Sector | Sector del cliente: el de la base de clientes, o el del archivo de Odoo si el cliente no se guardó ([06-picking-facturacion.md](06-picking-facturacion.md)) |
| Total | Suma en kg de todos los productos de ese cliente en el pedido |

Hay **una fila por cliente**. Si un cliente tiene dos o más pedidos facturados en la misma ruta, van en **una sola fila**, con la suma de sus kg (respuesta del 11/10).

No se muestran la dirección ni el teléfono.

## Recorrido (RF-SL-28, RN-29)

- El piloto puede reordenar las filas en cualquier momento de la ruta.
- **El orden que tienen las filas al pulsar "Pedido Entregado" es el que se guarda como recorrido.**

## Cierre (RF-SL-29)

- Al final de la tabla está el botón **"Pedido Entregado"**.
- Al pulsarlo, el pedido pasa a **Entregado**, lo que significa que se entregó completo a todos los clientes de la ruta. La ruta queda en el registro histórico (RF-SL-37).
- El piloto **no** puede cambiar clientes, productos ni cantidades.

## Devoluciones

La ruta **no se edita** y el sistema **ya no registra devoluciones**: eran entradas de inventario, y el control de inventario salió del alcance el 29/09/2026 ([09-picking-inventario.md](09-picking-inventario.md)). El piloto no reporta nada en el sistema.
