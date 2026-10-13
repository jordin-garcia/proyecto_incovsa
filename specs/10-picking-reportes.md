# 10. Módulo de Reportes

**Estado:** especificado a partir del **prototipo aprobado**, con los cambios de la reunión 4 (29/09/2026) y las respuestas del 11/10/2026.

> Antes, el prototipo de Reportes era solo una propuesta del equipo (P-05). El 09/10/2026 el coordinador confirmó que el Ing. William y el Ing. Manuel Rojas aprobaron las funcionalidades del prototipo de simulación, salvo los cambios de la reunión 4. Por eso el contenido de este módulo es el del prototipo.

## Acceso

Usuarios del picking con permiso sobre Reportes, en las sedes que tengan asignadas ([03-roles-y-accesos.md](03-roles-y-accesos.md)). Quien tiene más de una sede elige la que consulta con el selector de sede de la barra superior, como en el prototipo.

## Filtro de periodo (RF-SL-59)

Filtros de consulta para ver los **pedidos despachados** en distintos lapsos de tiempo. Aplican a las pestañas **"Despacho"** y **"Rutas realizadas"**.

| Periodo | Qué abarca |
|---|---|
| Diario | Un día |
| Semanal | Una semana, **de lunes a domingo** |
| Mensual | Un mes |
| Anual | Un año |
| Rango | De una fecha de inicio a una fecha final |

- Al abrir el módulo, el periodo es el día de hoy, como en el prototipo.
- Cómo se eligen en pantalla la semana, el mes y el año lo decide el equipo de diseño (acuerdo del 04/09: diseño e interacción libres).
- El rango incluye la fecha de inicio y la fecha final ([DECISIÓN TÉCNICA]).

## Pestaña "Despacho" (RF-SL-38)

En el prototipo se llama "Despacho diario"; con el filtro de periodo, el nombre se ajusta al periodo elegido.

**Indicadores:**

| Indicador | Cálculo |
|---|---|
| Kilogramos despachados | Suma en kg de los productos de los pedidos despachados en el periodo |
| Unidades completas | Suma de las unidades de cada producto según RN-01, más los kg sueltos (resto) |
| Pedidos cerrados | Pedidos que pasaron a **Despachado** o **En Ruta** en el periodo, separados en envío en camión y cliente recoge |
| Rutas entregadas | Rutas cuyo "Pedido Entregado" cae en el periodo |

**Tabla por producto:**

| Columna | Contenido |
|---|---|
| Producto | Nombre del producto |
| Cantidad (kg) | Suma del periodo |
| Barra | Barra proporcional a la cantidad |
| Unidades | Conversión según RN-01, con el Peso de Conversión guardado en el pedido (RN-33). Un mismo producto con distinto Peso de Conversión se muestra en filas separadas |

Sin la columna SKU del prototipo (11/10). Al pie, el total del periodo en kg y en "N unidades + R kg".

- Botones **Excel** y **PDF** para exportar el reporte, como en el prototipo.
- El reporte diario de "kilogramos y sacos despachados" de la propuesta de INCOVSA (01/09) queda cubierto por esta pestaña: los "sacos" se cuentan como **unidades** según RN-01, como en el prototipo aprobado.

## Pestaña "Rutas realizadas" (RF-SL-37)

Registro histórico de las rutas de la sede, filtrado por el periodo elegido.

| Columna | Contenido |
|---|---|
| Ruta | Número (correlativo por sede) |
| Fecha | Fecha de la ruta (la del envío a bodega) |
| Camión | — |
| Piloto | — |
| Pedido | Correlativo por sede del pedido de la ruta |
| Total (kg) | Suma de los pedidos de la ruta |
| Estado | En Ruta o Entregado |
| Recorrido | Orden de los clientes al entregar. Mientras no se entrega: "Se guarda al entregar" |

## Pestaña "Bitácora" (RN-39)

> **Cambio del 11/10/2026.** La bitácora **se consulta en esta pestaña**, como en el prototipo. Esto reemplaza lo anotado el 29/09, que decía que no se mostraba en la interfaz.

| Columna | Contenido |
|---|---|
| Fecha | Fecha y hora |
| Usuario | Quién hizo la operación |
| Operación | Por ejemplo, "Inicio de sesión", "Envío de pedido a bodega", "Cancelación de pedido" |
| Detalle | Datos de la operación |

- Se ve con el permiso de Reportes.
- Qué registra está en [12-reglas-de-negocio.md](12-reglas-de-negocio.md). Desde el 11/10 incluye los **inicios de sesión**.

## Lo que se quitó

- Las referencias a devoluciones y a la marca "Con devolución" ([09-picking-inventario.md](09-picking-inventario.md)).
- Los reportes de movimientos de inventario, que ya no existen.
