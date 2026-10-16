# 07. Módulo de Bodega (tablero de preparación)

## Propósito

Muestra al personal de bodega las rutas y los pedidos que tiene que preparar y, de cada producto y lote, cuántas unidades físicas debe sacar. **Este mismo módulo es el tablero** que se proyecta en una TV o se usa en una tableta.

> **Cambios del 13/10/2026 (reunión 5).** Lo que llega de un camión se llama **ruta** y lo que recoge el cliente, **pedido**. Cada uno muestra su **fecha y hora programadas** (no la hora en que se envió de Facturación), tiene un botón **"Detalle de Ruta"** o **"Detalle de Pedido"**, una opción para **ordenar los productos de mayor a menor peso** y otra para **marcar todos los productos**. El **lote** de cada producto se resalta. La barra lateral ya no muestra cuántos hay en Bodega.

## Acceso

Usuarios del picking con permiso sobre Bodega, en las sedes que tengan asignadas ([03-roles-y-accesos.md](03-roles-y-accesos.md)). Gerencia y Soporte ven todas las sedes.

En la TV o la tableta, la sesión queda abierta con **cualquier usuario que tenga acceso a Bodega**.

En la barra lateral, el módulo de Bodega **no** muestra el contador de rutas y pedidos (13/10).

## Lista de rutas y pedidos

- Aparecen las rutas y los pedidos en estado **En Preparación** de la sede, en el orden en que llegaron de Facturación (RF-SL-19).
- Cada uno se identifica con su **tipo y su número del día**: "Ruta 3" o "Pedido 2" (RN-52).
- Cada uno muestra su **fecha y hora programadas** de envío (ruta) o de despacho (pedido), que se escribieron en Facturación (13/10). **No** se muestra la hora en que se envió desde Facturación, para que no se confunda con la programada.
- La ruta muestra además su camión y su piloto.
- **Cuadro del número (15/10):** el cuadro con "RUTA" y su número va en el **verde principal** (`--v600`), y el de "PEDIDO" en **verde lima** (`--lima`), para distinguirlos (antes el del pedido era gris).
- Una ruta o un pedido reúne los **pedidos facturados** de su opción de envío y puede tener **varios clientes** ([06-picking-facturacion.md](06-picking-facturacion.md)). Bodega muestra una tarjeta por ruta o pedido, como en el prototipo.

## Detalle de la ruta o del pedido (13/10)

- Cada ruta tiene un botón **"Detalle de Ruta"** y cada pedido un botón **"Detalle de Pedido"**.
- Al pulsarlo se abre una ventana que **solo muestra** (no permite cambiar nada) lo que se le agregó en Facturación, con todos los datos que se tomaron del archivo .xlsx, en el orden en que el facturador dejó los pedidos facturados:

| Nivel | Datos |
|---|---|
| Pedido facturado | Número de pedido facturado, cliente (`Contacto`), sector (`Contacto/Ciudad`) y total en kg |
| Cada línea | Producto, lote, Peso de Conversión, cantidad en kg y su conversión a unidades |

- **(15/10)** Todos los pedidos facturados se muestran **completos**, con todas sus líneas. Si no caben, se desplaza la ventana, no cada pedido facturado.
- El botón está en el módulo y en el tablero en pantalla completa.

## Prioridad (RF-SL-20, RN-28)

- Cualquier usuario con acceso a Bodega puede **reordenar las rutas y los pedidos** dentro del módulo y **las filas** dentro de cada uno.
- **Ordenar por peso (13/10):** cada ruta o pedido tiene una opción que ordena sus filas **de mayor a menor cantidad en kg**. El resultado es un orden más de las filas: se comparte y se puede volver a cambiar a mano (decisión del coordinador del 14/10).
- El nuevo orden se ve **al instante en todas las pantallas** de la sede.
- El orden **no queda en el historial** ni en la bitácora. Cuando llega una ruta o un pedido nuevo, se agrega al final.

## Tabla de cada ruta o pedido (RF-SL-21, RF-SL-22)

| Columna | Contenido |
|---|---|
| Producto | Nombre del producto, tal como viene del archivo de Odoo |
| Lote | Lote de la línea, **resaltado de forma prioritaria** (13/10) en una etiqueta **verde** (`--v100`, texto `--v700`; 15/10, antes ámbar). Si no viene en el archivo, "Sin lote" en gris |
| Cantidad | Suma en kg del mismo producto, con el mismo lote y el mismo Peso de Conversión, entre todos los clientes de la ruta o del pedido |
| Unidades | Conversión según RN-01, en el formato **"N unidades + R kg"**, con el Peso de Conversión de la línea (RN-37) |
| Listo | Casilla para marcar lo que ya se sacó de la bodega |

**Agrupación (RN-51, decisión del coordinador del 14/10):** hay **una fila por producto, lote y Peso de Conversión**. Si dos clientes piden el mismo producto con lotes distintos, van en filas separadas, cada una con su lote.

**Ejemplo de agrupación:** el cliente A pide 25 kg de un producto del lote 5287, el cliente B 15 kg del mismo lote y el cliente C 10 kg del lote 9221, todos con Peso de Conversión 25. En Bodega aparecen dos filas: lote 5287 con 40 kg ("1 unidad + 15 kg") y lote 9221 con 10 kg ("0 unidades + 10 kg").

**Ejemplo con resto:** 60 kg con Peso de Conversión 25 se muestran como "2 unidades + 10 kg". 10 kg con Peso de Conversión 25 se muestran como "0 unidades + 10 kg".

**Cantidad exacta:** 50 kg con Peso de Conversión 25 se muestran como "2 unidades", sin "+ 0 kg" (12/10).

## Marcado de preparación (RF-SL-23, RN-20)

- Cada fila tiene una casilla que se puede marcar y desmarcar.
- **Marcar todo (13/10):** cada ruta o pedido tiene una opción para marcar todas sus filas de una vez y otra para desmarcarlas.
- El cambio se ve **al instante en todas las pantallas** de la sede.
- **No se registra quién marcó.** Sirve solo para que los operarios vean qué se ha sacado y qué falta.
- El marcado tampoco se registra en la bitácora.

## Cierre (RF-SL-24)

- El botón **"Ruta Despachada"** o **"Pedido Despachado"** se habilita solo cuando todas las filas están marcadas.
- Al pulsarlo:
  - el pedido (cliente recoge en bodega) pasa a **Despachado** y el flujo termina;
  - la ruta (envío en camión) pasa a **En Ruta** y aparece en el módulo de Ruta del piloto asignado.
- **No** hay que confirmar la carga en el camión.
- La ruta o el pedido deja de aparecer en Bodega.

## Tablero en pantalla completa (RF-SL-25, RF-SL-58)

El módulo tiene un botón para abrir el tablero en pantalla completa, que es el que se proyecta en la TV o se usa en la tableta. Su diseño es el del prototipo aprobado (ruta o pedido en curso, líneas con unidades grandes, panel del camión con la ocupación por peso y cola; ver [20-prototipo-aprobado.md](20-prototipo-aprobado.md)). Tiene también el detalle, el orden por peso y el marcar todo.

> **Cambio del 29/09/2026 (reunión 4).** El tablero ya **no** tiene las opciones "TV" y "Tableta". En su lugar tiene **"Modo claro"** y **"Modo oscuro"**.

| Opción | Cómo se ve |
|---|---|
| **Modo claro** | Igual que el modo "Tableta" del prototipo: fondo claro, tarjetas blancas y acentos verdes |
| **Modo oscuro** | Fondo y superficies en **escala de negros y grises** |

- Las dos opciones se ofrecen en la barra superior del tablero.
- El modo elegido vale para esa pantalla y no se comparte con las demás.
- **Numeración de las filas (13/10):** cuando las filas se reparten en dos columnas, se numeran **de arriba hacia abajo**: primero toda la columna izquierda y después la derecha.
- **Lote en el tablero (15/10):** en el modo claro, la etiqueta del lote es **verde**, como en el módulo; en el modo oscuro, **gris** (fondo #3A3A3E, texto #EDEDED), acorde con la escala de grises de ese modo.
- **Cuadro del número en el tablero (15/10):** como en el módulo, el cuadro de "PEDIDO" va en **verde lima** (`--lima`), en el modo claro y en el modo oscuro, para distinguirlo del de "RUTA" (confirmado por el coordinador el 15/10).
- **Silueta del camión (15/10):** todas las rutas usan la **silueta del camión grande** (la que antes se usaba solo para el de 6,000 kg), cualquiera que sea la capacidad del camión, porque la empresa puede comprar camiones de otras capacidades. El nombre y la capacidad del camión se siguen mostrando arriba de la silueta.

## Legibilidad (RF-SL-25, RNF-02)

Se tiene que leer bien proyectado en una TV y ser fácil de usar en una tableta: cantidades grandes, producto, lote y unidades claramente separados, estados visibles y pocos pasos. El sistema es completamente responsivo y se adapta a cualquier tamaño de pantalla (12/10).
