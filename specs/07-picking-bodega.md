# 07. Módulo de Bodega (tablero de preparación)

## Propósito

Muestra al personal de bodega los pedidos que tiene que preparar y, de cada producto, cuántas unidades físicas debe sacar. **Este mismo módulo es el tablero** que se proyecta en una TV o se usa en una tableta.

## Acceso

Operativo Bodega (solo su sede), Gerencia y Soporte IT (todas las sedes).

En la TV o la tableta, la sesión queda abierta con **cualquier usuario que tenga acceso a Bodega**.

## Lista de pedidos

- Aparecen los pedidos en estado **En Preparación** de la sede, en el orden en que llegaron de Facturación (RF-SL-19).
- Cada pedido muestra su tipo y, si es de envío en camión, su camión y su piloto.

## Prioridad (RF-SL-20, RN-28)

- Cualquier usuario con acceso a Bodega puede **reordenar los pedidos** dentro del módulo y **las filas** dentro de cada pedido.
- El nuevo orden se ve **al instante en todas las pantallas** de la sede.
- El orden **no queda en el historial** ni en la bitácora. Cuando llega un pedido nuevo, se agrega al final.

## Tabla de cada pedido (RF-SL-21, RF-SL-22)

| Columna | Contenido |
|---|---|
| SKU | Sufijo del código, solo informativo |
| Producto | Código completo |
| Cantidad | Suma en kg del mismo **código completo** entre todos los clientes del pedido |
| Unidades | Conversión según RN-01, en el formato **"N unidades + R kg"**. Se usa el Peso2 que quedó guardado en el pedido al enviarlo (RN-33) |
| Listo | Casilla para marcar lo que ya se sacó de la bodega |

**Ejemplo de agrupación:** el cliente A pide 25 kg de un producto, el cliente B 15 kg y el cliente C 10 kg. En Bodega ese producto aparece una vez, con 50 kg. Si el Peso2 es 25, son 2 unidades sin resto.

**Ejemplo con resto:** 60 kg con Peso2 25 se muestran como "2 unidades + 10 kg". 10 kg con Peso2 25 se muestran como "0 unidades + 10 kg".

> Cómo se muestra una cantidad exacta, "2 unidades" o "2 unidades + 0 kg", está pendiente (P-26).

## Marcado de preparación (RF-SL-23, RN-20)

- Cada fila tiene una casilla que se puede marcar y desmarcar.
- El cambio se ve **al instante en todas las pantallas** de la sede.
- **No se registra quién marcó.** Sirve solo para que los operarios vean qué se ha sacado y qué falta.
- El marcado tampoco se registra en la bitácora.

## Cierre del pedido (RF-SL-24)

- El botón **"Pedido Despachado"** se habilita solo cuando todas las filas del pedido están marcadas.
- Al pulsarlo:
  - si el pedido es de tipo cliente recoge en bodega, pasa a **Despachado** y el flujo termina;
  - si es de envío en camión, pasa a **En Ruta** y aparece en el módulo de Ruta del piloto asignado.
- **No** hay que confirmar la carga en el camión.
- El pedido deja de aparecer en Bodega.

## Legibilidad (RF-SL-25, RNF-02)

Se tiene que leer bien proyectado en una TV y ser fácil de usar en una tableta: cantidades grandes, producto y unidades claramente separados, estados visibles y pocos pasos. Todavía no se sabe el tamaño de la TV o la tableta ni cómo es la red de la bodega (P-27).
