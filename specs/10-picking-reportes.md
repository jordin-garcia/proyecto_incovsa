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
- **Fechas del filtro (15/10):** las fechas de Diario, Semanal y Rango se **escriben con el teclado** en formato **dd/mm/aaaa** o se eligen con el **botón del calendario**, que se abre debajo del campo, igual que en Facturación ([06](06-picking-facturacion.md)). El periodo se actualiza al pulsar Enter, al salir del campo o al elegir en el calendario. Una fecha que no existe no cambia el periodo y el campo se marca en rojo.

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

- Botones **Excel** y **PDF** para exportar el reporte, como en el prototipo ("Exportación", abajo).
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

- **(16/10)** Botones **Excel** y **PDF**, como en Despacho ("Exportación", abajo).

## Pestaña "Bitácora" (RN-39)

| Columna | Contenido |
|---|---|
| Fecha | Fecha y hora |
| Usuario | Quién hizo la operación |
| Operación | Por ejemplo, "Inicio de sesión", "Envío de ruta a bodega", "Cancelación de opción de envío" |
| Detalle | Datos de la operación |

- Se ve con el permiso de Reportes.
- **Sedes (22/10, JC-06, confirmado por Jordin):** Gerencia y Soporte ven todos los registros. A los demás se les muestran, de la **sede que consultan** en el selector (RN-17):
  - todas las operaciones del sitio y las cinco de acceso: «Inicio de sesión», «Intento de acceso fallido», «Intento fallido de inicio de sesión», «Bloqueo de usuario» y «Bloqueo de IP»;
  - del picking, solo los registros cuya sede es la consultada (los envíos y lo que guarda una sola sede);
  - los cambios de un usuario del picking solo si todas las sedes relacionadas con ese usuario son la consultada; si mezclan esa sede con otra, se ocultan.
  - El resto de los registros del picking no se muestra.
- Se filtra con el mismo periodo que las otras pestañas.
- **Detalle y límite (23/10, JG-24):** muestra texto legible de la operación, también para los registros históricos; nunca el JSON almacenado ni `{}`. En los intentos fallidos y bloqueos de un usuario inexistente, el usuario escrito lleva «(no existe)». Se muestran como máximo las 250 operaciones más recientes del periodo **después** del filtro por sede; los empates de fecha se ordenan por id descendente, como el orden inverso de inserción del prototipo.
- **Bloqueos (23/10, JG-24, por decisión de Jordin):** el prototipo no tiene bloqueos (RNF-15). Su Detalle es «Sistema de picking · Bloqueo de usuario · *usuario*» (o «Sitio web · …») y «Acceso personal · Bloqueo de IP · *dirección IP*». La IP se muestra para que la fila diga qué se bloqueó; la Bitácora solo la ven quienes tienen `pk.reportes`.
- Qué registra está en [12-reglas-de-negocio.md](12-reglas-de-negocio.md).
- **(16/10)** Botones **Excel** y **PDF**, como en Despacho ("Exportación", abajo).

## Exportación (RF-SL-38, 16/10)

> **Cambio del 16/10/2026 (coordinador).** Hasta el 15/10 solo la pestaña "Despacho" se exportaba. Desde el 16/10 las **tres pestañas** tienen sus botones **Excel** y **PDF** (CAM-96).

| Pestaña | Contenido del archivo |
|---|---|
| Despacho | Sede, periodo, los cuatro indicadores, la tabla por producto (Producto, Cantidad (kg), Unidades) y el total del periodo en kg y en "N unidades + R kg". La barra proporcional solo se muestra en pantalla |
| Rutas realizadas | Sede, periodo y la tabla de la pestaña, con sus mismas columnas |
| Bitácora | Periodo y la tabla de la pestaña, con sus mismas columnas |

- Cada archivo lleva las filas de la pestaña con el periodo elegido.
- **Excel:** una sola hoja, sin colores ni formato, generada con SheetJS (la versión gratuita no permite formato).
- **PDF:** generado con **pdfmake**, con el logotipo de INCOVSA, el título de la pestaña, la sede (salvo en la Bitácora), el periodo y la tabla. **(26/10, D-10)** El logotipo es siempre el del sistema (`public/marca/incovsa-quimicos.webp`), no el que se configura en el panel del sitio ([18](18-historial-de-decisiones.md)).
- Los dos se generan **en el servidor**, que verifica el permiso de Reportes y la sede antes de entregar el archivo ([16](16-arquitectura-y-tecnologia.md)).
- **Nombre del archivo:** la pestaña, la sede (salvo en la Bitácora) y el periodo, con las fechas en dd-mm-aaaa. Por ejemplo, `despacho-quetzaltenango-16-10-2026.xlsx`, `rutas-realizadas-quetzaltenango-del-01-10-2026-al-31-10-2026.pdf` o `bitacora-16-10-2026.xlsx`.

- **Error de descarga (29/10, JC-09; texto autorizado por José Daniel):** si no se puede descargar el archivo, la pantalla muestra «No se pudo completar la operación. Inténtelo de nuevo.» con el aviso de error del sistema.

## Lo que se quitó

- Las referencias a devoluciones y a la marca "Con devolución" ([09-picking-inventario.md](09-picking-inventario.md)).
- Los reportes de movimientos de inventario, que ya no existen.
- La columna "Pedido" de "Rutas realizadas" (13/10).
