# 10. Módulo de Reportes

**Estado:** especificado a partir del **prototipo aprobado**, con los cambios de la reunión 4 (29/09/2026), las respuestas del 11/10/2026 y lo aprobado el 13/10/2026 (reunión 5).

## Acceso

Usuarios del picking con permiso sobre Reportes, en las sedes que tengan asignadas ([03-roles-y-accesos.md](03-roles-y-accesos.md)). Quien tiene más de una sede elige la que consulta con el selector de sede de la barra superior, como en el prototipo.

## Filtro de periodo (RF-SL-59)

Filtros de consulta para ver lo despachado en distintos lapsos de tiempo. Aplican a las tres pestañas: **"Despacho"**, **"Rutas realizadas"** y **"Bitácora"** (la Bitácora se agregó con el prototipo aprobado el 13/10).

| Periodo | Qué abarca |
|---|---|
| Diario | Un día |
| Semanal | Una semana, **de lunes a domingo** |
| Mensual | Un mes |
| Anual | Un año |
| Rango | De una fecha de inicio a una fecha final |

- Al abrir el módulo, el periodo es el día de hoy, como en el prototipo.
- Cómo se eligen en pantalla la semana, el mes y el año lo decide el equipo de diseño (acuerdo del 04/09: diseño e interacción libres).
- El rango incluye la fecha de inicio y la fecha final, calculadas en la hora de Guatemala (12/10).

## Pestaña "Despacho" (RF-SL-38)

En el prototipo se llama "Despacho diario"; con el filtro de periodo, el nombre se ajusta al periodo elegido.

**Indicadores:**

| Indicador | Cálculo |
|---|---|
| Kilogramos despachados | Suma en kg de los productos de las rutas y los pedidos despachados en el periodo |
| Unidades completas | Suma de las unidades de cada fila según RN-01, más los kg sueltos (resto) |
| Rutas y pedidos cerrados | Rutas que pasaron a **En Ruta** y pedidos que pasaron a **Despachado** en el periodo, separados |
| Rutas entregadas | Rutas cuyo "Ruta Entregada" cae en el periodo |

**Tabla por producto:**

| Columna | Contenido |
|---|---|
| Producto | Nombre del producto, tal como vino del archivo de Odoo |
| Cantidad (kg) | Suma del periodo |
| Barra | Barra proporcional a la cantidad |
| Unidades | Conversión según RN-01, con el Peso de Conversión de cada línea (RN-37). Un mismo producto con distinto Peso de Conversión se muestra en filas separadas |

Al pie, el total del periodo en kg y en "N unidades + R kg".

- Botones **Excel** y **PDF** para exportar el reporte, como en el prototipo.
- El reporte diario de "kilogramos y sacos despachados" de la propuesta de INCOVSA (01/09) queda cubierto por esta pestaña: los "sacos" se cuentan como **unidades** según RN-01.

## Pestaña "Rutas realizadas" (RF-SL-37)

Registro histórico de las rutas de la sede, filtrado por el periodo elegido. Desde el 13/10 es el **único** lugar donde se consultan las rutas entregadas: el módulo de Ruta ya no tiene registro histórico.

| Columna | Contenido |
|---|---|
| Ruta | Número del día |
| Fecha | Fecha de la ruta (la del envío a bodega) |
| Programada | Fecha y hora programadas de envío |
| Camión | — |
| Piloto | — |
| Total (kg) | Suma de la ruta |
| Estado | En Ruta o Entregado |
| Recorrido | Orden de los clientes al entregar. Mientras no se entrega: "Se guarda al entregar" |

La columna "Pedido" se quitó el 13/10: la ruta ya no tiene un pedido aparte.

## Pestaña "Bitácora" (RN-39)

| Columna | Contenido |
|---|---|
| Fecha | Fecha y hora |
| Usuario | Quién hizo la operación |
| Operación | Por ejemplo, "Inicio de sesión", "Envío de ruta a bodega", "Cancelación de opción de envío" |
| Detalle | Datos de la operación |

- Se ve con el permiso de Reportes.
- Se filtra con el mismo periodo que las otras pestañas.
- Qué registra está en [12-reglas-de-negocio.md](12-reglas-de-negocio.md).

## Lo que se quitó

- Las referencias a devoluciones y a la marca "Con devolución" ([09-picking-inventario.md](09-picking-inventario.md)).
- Los reportes de movimientos de inventario, que ya no existen.
- La columna "Pedido" de "Rutas realizadas" (13/10).
