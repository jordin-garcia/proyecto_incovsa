# 07. Módulo de Bodega (tablero de preparación)

## Propósito

Muestra al personal de bodega los pedidos que tiene que preparar y, de cada producto, cuántas unidades físicas debe sacar. **Este mismo módulo es el tablero** que se proyecta en una TV o se usa en una tableta.

## Acceso

Usuarios del picking con permiso sobre Bodega, en las sedes que tengan asignadas ([03-roles-y-accesos.md](03-roles-y-accesos.md)). Gerencia y Soporte ven todas las sedes.

En la TV o la tableta, la sesión queda abierta con **cualquier usuario que tenga acceso a Bodega**.

## Lista de pedidos

- Aparecen los pedidos en estado **En Preparación** de la sede, en el orden en que llegaron de Facturación (RF-SL-19).
- Cada pedido se identifica con su **correlativo por sede** y muestra su tipo y, si es de envío en camión, su ruta, su camión y su piloto.
- Un pedido es lo que el facturador envió desde una opción de envío: reúne los **pedidos facturados** de Odoo de esa opción y puede tener **varios clientes** ([06-picking-facturacion.md](06-picking-facturacion.md)). Bodega lo muestra **como en el prototipo**: una tarjeta por pedido (respuesta del 11/10 a P-78).

## Prioridad (RF-SL-20, RN-28)

- Cualquier usuario con acceso a Bodega puede **reordenar los pedidos** dentro del módulo y **las filas** dentro de cada pedido.
- El nuevo orden se ve **al instante en todas las pantallas** de la sede.
- El orden **no queda en el historial** ni en la bitácora. Cuando llega un pedido nuevo, se agrega al final.

## Tabla de cada pedido (RF-SL-21, RF-SL-22)

| Columna | Contenido |
|---|---|
| Producto | Nombre del producto |
| Cantidad | Suma en kg del mismo producto entre todos los clientes del pedido |
| Unidades | Conversión según RN-01, en el formato **"N unidades + R kg"**. Se usa el Peso de Conversión que quedó guardado en el pedido al enviarlo (RN-33) |
| Listo | Casilla para marcar lo que ya se sacó de la bodega |

**Ejemplo de agrupación:** el cliente A pide 25 kg de un producto, el cliente B 15 kg y el cliente C 10 kg. En Bodega ese producto aparece una vez, con 50 kg. Si el Peso de Conversión es 25, son 2 unidades sin resto.

La columna **SKU** del prototipo **se quita** (11/10).

**Ejemplo con resto:** 60 kg con Peso de Conversión 25 se muestran como "2 unidades + 10 kg". 10 kg con Peso de Conversión 25 se muestran como "0 unidades + 10 kg".

**Cantidad exacta:** 50 kg con Peso de Conversión 25 se muestran como "2 unidades", sin "+ 0 kg" (12/10, resuelve P-26).

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

## Tablero en pantalla completa (RF-SL-25, RF-SL-58)

El módulo tiene un botón para abrir el tablero en pantalla completa, que es el que se proyecta en la TV o se usa en la tableta. Su diseño es el del prototipo aprobado (pedido en curso, líneas con unidades grandes, panel del camión con la ocupación por peso y cola de pedidos; ver [20-prototipo-aprobado.md](20-prototipo-aprobado.md)).

> **Cambio del 29/09/2026 (reunión 4).** El tablero ya **no** tiene las opciones "TV" y "Tableta". En su lugar tiene **"Modo claro"** y **"Modo oscuro"**.

| Opción | Cómo se ve |
|---|---|
| **Modo claro** | Igual que el modo "Tableta" actual del prototipo: fondo claro, tarjetas blancas y acentos verdes |
| **Modo oscuro** | Fondo y superficies en **escala de negros y grises**, en lugar de la escala de verdes del modo "TV" actual del prototipo |

- Las dos opciones se ofrecen en la barra superior del tablero, donde hoy están los botones "TV" y "Tableta".
- En el prototipo, el modo elegido vale para esa pantalla y no se comparte con las demás. Se conserva así.

## Legibilidad (RF-SL-25, RNF-02)

Se tiene que leer bien proyectado en una TV y ser fácil de usar en una tableta: cantidades grandes, producto y unidades claramente separados, estados visibles y pocos pasos. El sistema es completamente responsivo y se adapta a cualquier tamaño de pantalla, así que no depende del tamaño de la TV o la tableta (12/10, resuelve P-27).
