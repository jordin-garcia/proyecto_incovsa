# 08. Módulo de Ruta

## Propósito

Muestra al piloto los clientes a los que debe ir en su ruta y registra que se entregó.

## Acceso

- Operativo Piloto: **solo sus rutas asignadas** (RF-SL-26).
- Gerencia y Soporte IT: todas las rutas.
- El piloto lo usa desde un **teléfono o una tableta**, así que la pantalla tiene que ser responsiva (RNF-14).

## Cuándo se crea y cuándo aparece una ruta

- La ruta **se crea** cuando el facturador pulsa "Enviar Pedido a Bodega" en un pedido de envío en camión. En ese momento recibe su número y su fecha.
- **Aparece en el módulo de Ruta** del piloto cuando Bodega pulsa "Pedido Despachado" y el pedido pasa a **En Ruta**.

## Registro de la ruta (RF-SL-30, RN-30)

| Dato | Regla |
|---|---|
| Número de ruta | Correlativo **por sede**, asignado al enviar el pedido a bodega. Una ruta no tiene nombre, solo número |
| Fecha | La fecha en que el pedido se envió de Facturación a Bodega |
| Camión | El que se asignó en Facturación |
| Piloto | El que se asignó en Facturación |

**No** se registran horas de salida ni de regreso.

## Tabla de la ruta (RF-SL-27)

| Columna | Contenido |
|---|---|
| Cliente | Nombre del cliente |
| Sector | Sector del cliente, tomado de la base de clientes |
| Total | Suma en kg de todos los productos de ese cliente en el pedido |

No se muestran la dirección ni el teléfono.

## Recorrido (RF-SL-28, RN-29)

- El piloto puede reordenar las filas en cualquier momento de la ruta.
- **El orden que tienen las filas al pulsar "Pedido Entregado" es el que se guarda como recorrido.**

## Cierre (RF-SL-29)

- Al final de la tabla está el botón **"Pedido Entregado"**.
- Al pulsarlo, el pedido pasa a **Entregado**, lo que significa que se entregó completo a todos los clientes de la ruta. La ruta queda en el registro histórico (RF-SL-37).
- El piloto **no** puede cambiar clientes, productos ni cantidades.

## Devoluciones

La ruta **ya no se edita.** Las devoluciones se registran en el módulo de Inventario, ligadas al pedido ([09-picking-inventario.md](09-picking-inventario.md)). Las correcciones las hacen Gerencia o Soporte IT después de la entrega; el piloto no reporta nada en el sistema.
