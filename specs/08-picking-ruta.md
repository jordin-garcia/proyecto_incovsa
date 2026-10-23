# 08. Módulo de Ruta

## Propósito

Muestra al piloto los clientes a los que debe ir en su ruta y registra que se entregó.

> **Cambios del 13/10/2026 (reunión 5).** Las rutas se muestran siempre **de la más reciente a la más antigua**. El módulo ya **no** tiene la sección "Registro histórico": el registro de rutas realizadas se consulta en Reportes. Desde el 13/10, lo que sale de Facturación en un camión **es** la ruta, con su número del día.

## Acceso

- Los usuarios con rol **"Piloto"** ven **solo sus rutas asignadas** (RF-SL-26). El rol "Piloto" es el que identifica a los pilotos ([03-roles-y-accesos.md](03-roles-y-accesos.md)).
- Los usuarios con el permiso "Ver todas las rutas", y Gerencia y Soporte, ven todas las rutas de las sedes que tienen asignadas.
- El piloto lo usa desde un **teléfono o una tableta**, así que la pantalla tiene que ser responsiva (RNF-14).

## Cuándo se crea y cuándo aparece una ruta

- La ruta **se crea** cuando el facturador pulsa "Enviar a Bodega" en la opción **"Envío por camión"** de Facturación, con los pedidos facturados de esa opción. En ese momento recibe su número del día, su fecha, su fecha y hora programadas, su camión y su piloto.
- **Aparece en el módulo de Ruta** del piloto cuando Bodega pulsa "Ruta Despachada" y la ruta pasa a **En Ruta**.
- **Deja de aparecer** cuando el piloto pulsa "Ruta Entregada" (13/10). A partir de ahí se consulta en la pestaña "Rutas realizadas" de Reportes.

## Lista de rutas (13/10)

- Solo aparecen las rutas **En Ruta**.
- Se ordenan **de la más reciente a la más antigua**, de arriba hacia abajo: por fecha y, en la misma fecha, por número de mayor a menor.

## Registro de la ruta (RF-SL-30, RN-30)

| Dato | Regla |
|---|---|
| Número de ruta | Correlativo **diario por sede**: empieza en 1 cada día (RN-52). Una ruta no tiene nombre, solo número y fecha |
| Fecha | La fecha en que la ruta se envió de Facturación a Bodega |
| Fecha y hora programadas | Las que escribió el facturador (RN-53) |
| Camión | El que se eligió en Facturación |
| Piloto | El que se eligió en Facturación |
| Fecha de creación | Fecha y hora exactas en que se guardó (RN-57) |

**No** se registran horas reales de salida ni de regreso.

## Tabla de la ruta (RF-SL-27)

| Columna | Contenido |
|---|---|
| Cliente | Nombre del cliente, tal como viene en `Contacto` |
| Sector | Sector del cliente, tal como viene en `Contacto/Ciudad` |
| Total | Suma en kg de todos los productos de ese cliente en la ruta |

Hay **una fila por cliente**. Si un cliente tiene dos o más pedidos facturados en la misma ruta, van en **una sola fila**, con la suma de sus kg. Como ya no hay base de clientes, dos pedidos facturados son del mismo cliente cuando tienen el mismo nombre y el mismo sector (RN-49). **(22/10)** Se comparan sin distinguir mayúsculas ni tildes y sin espacios al inicio ni al final, como `norm()` y `claveRuta()` del prototipo (un nombre o un sector vacío cuenta como «Sin nombre» o «Sin sector»), y la fila muestra el nombre y el sector del primer pedido facturado.

No se muestran la dirección ni el teléfono.

## Recorrido (RF-SL-28, RN-29)

- Al llegar, las filas están en el orden en que el facturador dejó los pedidos facturados en la opción de envío (13/10).
- El piloto puede reordenar las filas en cualquier momento de la ruta.
- **El orden que tienen las filas al pulsar "Ruta Entregada" es el que se guarda como recorrido.**

## Cierre (RF-SL-29)

- Al final de la tabla está el botón **"Ruta Entregada"** (antes "Pedido Entregado"; se cambió el nombre por la terminología del 13/10), alineado a la derecha y **sin texto de ayuda** a su lado (15/10). La ventana de confirmación sigue mostrando el recorrido que se va a guardar.
- Al pulsarlo, la ruta pasa a **Entregado**, lo que significa que se entregó completa a todos sus clientes. Queda en el registro histórico de Reportes (RF-SL-37).
- El piloto **no** puede cambiar clientes, productos ni cantidades.

## Devoluciones

La ruta **no se edita** y el sistema **no registra devoluciones**: eran entradas de inventario, y el control de inventario salió del alcance el 29/09/2026 ([09-picking-inventario.md](09-picking-inventario.md)).
