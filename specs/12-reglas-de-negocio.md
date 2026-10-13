# 12. Reglas de negocio

La columna **Estado** compara cada regla con el Documento 1 v0.1. Los códigos no se reutilizan.

## Catálogo de reglas

| Código | Regla | Estado |
|---|---|---|
| RN-01 | **Conversión.** `unidades = parte entera (cantidad_kg ÷ Peso de Conversión)` y `resto_kg = cantidad_kg − unidades × Peso2`. Se muestra como "N unidades + R kg" | Modificado |
| RN-02 | El Peso de Conversión es un número guardado en cada producto, en kg. Su valor inicial se toma **tal cual** de la columna `Peso2` del Excel de la empresa. Solo se cambia en Configuración. El sistema **nunca** lo calcula a partir del texto del código | Modificado |
| RN-03 | Solo se venden cantidades exactas | **Eliminado**, reemplazado por RN-21 |
| RN-04 | **Todas las cantidades del sistema de picking están en kg**: las del archivo de Odoo, los totales y las capacidades | Modificado |
| RN-05 | La conversión no redondea. Lo que no completa una unidad se muestra como resto en kg | Modificado |
| RN-06 | Descuento de existencia al enviar el pedido a bodega | **Eliminado** (29/09, sin inventario) |
| RN-07 | Validación de existencias al registrar el pedido | **Eliminado** (29/09, sin inventario) |
| RN-08 | El sistema llevaba sus propias existencias por producto y sede | **Eliminado** (29/09). El inventario lo lleva Odoo (RN-40) |
| RN-09 | La única entrada es la devolución | **Eliminado**, reemplazado por RN-22 |
| RN-10 | La existencia de cada producto se expresa en kg | **Eliminado** (29/09, sin inventario) |
| RN-11 | Estados del pedido y sus transiciones: ver la sección siguiente | Modificado |
| RN-12 | Un pedido puede tener **varios clientes**. **(11/10)** Se arma en Facturación agregando **pedidos facturados** (cada uno es una referencia de Odoo de un solo cliente) a una opción de envío. Un pedido de envío en camión equivale a una carga completa de camión | Modificado |
| RN-13 | **(11/10)** Cada opción de camión de Facturación suma el peso de sus pedidos. Si **excede** la capacidad máxima, aparece la alerta de sobrepeso, que **solo informa**: se puede enviar igual. INCOVSA acepta que sea aproximada | Modificado |
| RN-14 | Devolución editando el registro de ruta | **Eliminado**, reemplazado por RN-23 |
| RN-15 | **(11/10)** La clave del producto es su **nombre**, con el formato del nombre de producto de Odoo y sin el lote (`SODA ASH (CHI-SAC/0040KG)`). El SKU (sufijo del código de `Picking II`) ya no se muestra en ninguna pantalla | Modificado |
| RN-16 | No hay borradores del **pedido**: se crea al pulsar "Enviar Pedido a Bodega". Un pedido enviado a bodega no se edita ni se cancela. **(11/10)** Antes del envío sí se guardan el tablero de pedidos facturados y lo asignado a cada opción de envío (RN-48) | Modificado |
| RN-17 | **(11/10)** Cada usuario del picking ve solo los datos de las **sedes que tiene asignadas**, que se marcan como los permisos. Gerencia y Soporte ven todas | Modificado |
| RN-18 | **(11/10)** Se mantienen dos administraciones de usuarios y dos inicios de sesión. Las cuentas de **Gerencia y Soporte** sirven en los dos sistemas, porque tienen acceso total; las demás cuentas son de un solo sistema | Modificado |
| RN-19 | Lo que cada usuario puede hacer con los documentos internos depende de **sus permisos** (29/09), no del documento | Modificado |
| RN-20 | El marcado de filas en Bodega no registra quién marcó, ni se guarda en la bitácora (reconfirmado el 11/10) | Vigente |
| RN-21 | Se permiten **ventas fraccionadas**: la cantidad no tiene que ser múltiplo del Peso de Conversión | Nuevo |
| RN-22 | Entradas y salidas de inventario | **Eliminado** (29/09, sin inventario) |
| RN-23 | Devoluciones ligadas al pedido y marca "Con devolución" | **Eliminado** (29/09, sin inventario) |
| RN-24 | Existencia nunca negativa | **Eliminado** (29/09, sin inventario) |
| RN-25 | Traslados entre sedes | **Eliminado** (29/09, sin inventario) |
| RN-26 | Motivo de los ajustes | **Eliminado** (29/09, sin inventario) |
| RN-27 | Registro de compras | **Eliminado** (29/09, sin inventario) |
| RN-28 | La prioridad en Bodega (orden de pedidos y de filas) la puede cambiar cualquier usuario con acceso al módulo. Se comparte en tiempo real y no se guarda en el historial ni en la bitácora (reconfirmado el 11/10) | Nuevo |
| RN-29 | El recorrido que se guarda es el orden de las filas al pulsar "Pedido Entregado" | Nuevo |
| RN-30 | El número de ruta es un correlativo por sede. El número y la fecha (la del envío a bodega) se asignan al pulsar "Enviar Pedido a Bodega" en una opción de camión. Cada ruta corresponde a un pedido. Un camión puede hacer varias rutas al día | Modificado |
| RN-31 | El pedido se crea al pulsar "Enviar Pedido a Bodega" en su opción de envío y se identifica con un **correlativo por sede** (reconfirmado el 11/10). Cada **pedido facturado** que contiene se identifica con su **número de Odoo**. No se valida si una referencia ya se cargó, porque los datos vienen de Odoo. No se registra el número de factura | Vigente |
| RN-32 | El sistema no controla lotes ni ubicaciones dentro de la bodega | Nuevo |
| RN-33 | Al enviar un pedido se guarda el Peso de Conversión vigente de cada producto. Si después cambia el Peso de Conversión del producto, **el pedido conserva el Peso de Conversión con el que se vendió** | Nuevo |
| RN-34 | Edición de movimientos de inventario | **Eliminado** (29/09, sin inventario) |
| RN-35 | **(29/09)** Los pedidos se registran **solo** cargando el archivo .xlsx exportado de Odoo. El archivo se lee de arriba hacia abajo, y una fila sin Referencia ni Contacto pertenece a la última referencia y contacto de arriba. **(11/10)** Solo se cargan las referencias en estado "Hecho". Cada archivo trae referencias de una sola bodega | Nuevo |
| RN-36 | **(29/09)** De la Referencia (`XE-IN/SALIDA/03539`) se toma el **tercer segmento como número del pedido facturado**. El primer segmento indica la bodega de salida y el segundo, que es una salida. **(11/10)** Prefijos: `XE` = Quetzaltenango (Xela), `GT` = Guatemala, `ESC` = Escuintla | Nuevo |
| RN-37 | **(29/09)** La cantidad es la columna `Movimientos de stock/Cantidad hecha`, en kg. La columna `Movimientos de stock/Producto/Peso` **no se usa**, porque en algunos productos viene en cero: la conversión usa el Peso de Conversión del catálogo (RN-02) | Nuevo |
| RN-38 | **(29/09)** El acceso se basa en **permisos asignados a cada usuario**, por módulo y por acción, no en su rol. El rol es texto libre. Los únicos roles predeterminados son Gerencia y Soporte, con acceso total a los dos sistemas | Nuevo |
| RN-39 | **(29/09)** La bitácora registra las acciones de cada usuario en los dos sistemas, incluidos los **inicios de sesión** (11/10) y los **intentos fallidos** (12/10). **(11/10)** Se consulta en la pestaña "Bitácora" de Reportes. No registra el marcado ni la prioridad de Bodega, ni el orden de Ruta antes de entregar | Nuevo |
| RN-40 | **(29/09)** El sistema **no lleva control de inventario**: ni existencias, ni entradas, ni salidas. Eso lo hace Odoo | Nuevo |
| RN-41 | **(11/10)** El lote de un documento interno admite **números y letras**, y solo es **obligatorio en el certificado de análisis (COA)**. Reemplaza al "solo números" del 29/09 | Nuevo |
| RN-42 | **(29/09)** Una solicitud de contacto tiene los estados **Asignado**, **En proceso** y **Solucionado**, que se marcan con botones. **(11/10)** Al llegar no tiene ningún estado (todos desmarcados). Se puede marcar cualquier estado, sin orden ni restricción: los botones solo sirven para ver el avance | Nuevo |
| RN-43 | **(11/10)** Al cargar el archivo de Odoo, cada producto se busca en el catálogo para obtener su Peso de Conversión. Si no existe, el sistema lo notifica y pregunta si se agrega; si se agrega, solo pide el Peso de Conversión. Si no se agrega, el pedido facturado que lo contiene **no se carga** | Nuevo |
| RN-44 | **(11/10)** Si el cliente del archivo existe en la base, su nombre y su sector se toman de la base. Si no existe, el sistema pregunta si se guarda: si se guarda, pide nombre y sector (sector de la lista existente o uno nuevo); si no, se usan `Contacto` y `Contacto/Ciudad` tal como vienen. Si el nombre está dos veces en la base con sectores distintos, se usa el sector de `Contacto/Ciudad` | Nuevo |
| RN-45 | **(11/10)** En el tablero de pedidos facturados, el único dato que se puede corregir es el **sector del cliente**, y la corrección se guarda en la base de clientes | Nuevo |
| RN-46 | **(11/10)** Los usuarios cuyo rol es **"Piloto"** son los que se asignan a un camión en Facturación y los que ven solo sus rutas en Ruta | Nuevo |
| RN-47 | **(11/10)** Para recuperar su contraseña, el usuario la solicita a Gerencia o a Soporte, que la restablecen. No hay recuperación por correo | Nuevo |
| RN-48 | **(11/10)** El **tablero de pedidos facturados** y lo asignado a cada opción de envío **se guardan en la base de datos** por sede. Un pedido facturado se puede eliminar del tablero, uno por uno o todos a la vez. "Cancelar" en una opción de envío regresa sus pedidos facturados al tablero | Nuevo |
| RN-49 | **(11/10)** En la tabla de Ruta hay una fila por cliente: si un cliente tiene varios pedidos facturados en la misma ruta, van en una sola fila con la suma de sus kg | Nuevo |

## Conversión (RN-01, RN-02, RN-05, RN-21)

```
unidades = parte entera (cantidad_kg ÷ Peso de Conversión)
resto_kg = cantidad_kg − (unidades × Peso de Conversión)
```

| Cantidad (kg) | Peso de Conversión (kg) | Resultado |
|---|---|---|
| 50 | 25 | 2 unidades (cómo se muestra el resto 0, P-26) |
| 60 | 25 | 2 unidades + 10 kg |
| 10 | 25 | 0 unidades + 10 kg |
| 55 | 55 | 1 unidad (ejemplo de la contraparte) |
| 110 | 55 | 2 unidades (ejemplo de la contraparte) |

- La conversión se hace sobre la cantidad **agrupada por producto** en Bodega (RF-SL-21), con el Peso de Conversión guardado en el pedido (RN-33). Se suman las cantidades del mismo producto entre todos los clientes del pedido.
- El Peso de Conversión es el del catálogo del sistema, **nunca** el peso que trae el archivo de Odoo (RN-37).
- Los cálculos usan números decimales exactos, no punto flotante ([DECISIÓN TÉCNICA] sobre el tipo y la precisión).
- **Casos de prueba obligatorios:** los 15 casos exactos que la empresa validó (respuesta del 23/09). Todos existen en el catálogo de `Picking II` con el mismo Peso de Conversión. La columna "Código" usa el formato de `Picking II`; en el catálogo cada caso queda con su nombre en formato de Odoo (por ejemplo, el caso 9 es `SODA ASH (TUR-SAC/0025KG)`), con el mismo Peso de Conversión. El caso 8 tiene en `Picking II` el error de escritura `SULFATO DE ALUMINIO TUR-SAC/0025KG-9232`; en el catálogo es `SULFATO DE ALUMINIO (TUR-SAC/0025KG)`. Hay que agregar casos fraccionados y casos con datos incorrectos (Documento 6, sección 9).

| # | Código | Cantidad | Peso de Conversión | Unidades esperadas |
|---|---|---|---|---|
| 1 | SULFATO DE SODIO-USA-SAC/0025KG-7896 | 25 | 25 | 1 |
| 2 | SULFATO DE SODIO-USA-SAC/0025KG-2318 | 25 | 25 | 1 |
| 3 | HIDROSULFITO DE SODIO-IND-TON/0050KG-1104 | 50 | 50 | 1 |
| 4 | METANOL-GUA-TON/0055GL-9047 | 55 | 55 | 1 |
| 5 | NEGRO SULFUROSO HIGH QUALITY-CHI-SAC/0025KG-0163 | 50 | 25 | 2 |
| 6 | NEGRO SULFUROSO-CHI-SAC/0025KG-4346 | 50 | 25 | 2 |
| 7 | SULFURO DE SODIO-TUR-SAC/0025KG-7305 | 50 | 25 | 2 |
| 8 | SULFATO DE ALUMINIO TUR-SAC/0025KG-9232 | 50 | 25 | 2 |
| 9 | SODA ASH-TUR-SAC/0025KG-5275 | 50 | 25 | 2 |
| 10 | SODA CAUSTICA-MEX-SAC/0025KG-0249 | 75 | 25 | 3 |
| 11 | INCO-FITEX-CHI-GAR/0030KG-5672T | 90 | 30 | 3 |
| 12 | SODA CAUSTICA-CHI-SAC/0025KG-0150 | 500 | 25 | 20 |
| 13 | SULFURO DE SODIO-MEX-SAC/0025KG-1107 | 500 | 25 | 20 |
| 14 | SODA CAUSTICA-CHI-SAC/0025KG-0150 | 800 | 25 | 32 |
| 15 | SODA CAUSTICA-CHI-SAC/0025KG-0150 | 1,000 | 25 | 40 |

## Estados del pedido (RN-11)

| Estado | Cuándo | ¿Se guarda? |
|---|---|---|
| Pendiente | Sus pedidos facturados están en el tablero o en una opción de envío, sin enviar | Se guardan los pedidos facturados (RN-48); el pedido todavía no existe |
| En Preparación | Al pulsar "Enviar Pedido a Bodega" en la opción de envío | Sí. Es el primer estado del pedido |
| Despachado | Cliente recoge en bodega, al pulsar "Pedido Despachado" en Bodega | Sí |
| En Ruta | Envío en camión, al pulsar "Pedido Despachado" en Bodega (automático) | Sí |
| Entregado | Al pulsar "Pedido Entregado" en Ruta | Sí |

```
Cliente recoge en bodega:  Pendiente → En Preparación → Despachado
Envío en camión:           Pendiente → En Preparación → En Ruta → Entregado
Cancelar una opción:       sus pedidos facturados regresan al tablero (no hay estado Cancelado)
```

- El estado "Editado" del Documento 1 y la marca "Con devolución" que lo reemplazó el 24/09 **ya no existen**: el sistema no registra devoluciones desde el 29/09.
- Cada cambio de estado que se guarda registra la fecha, la hora y el usuario.

## Bitácora (RN-39)

> **Cambio del 29/09/2026 (reunión 4), ajustado el 11/10/2026.** La bitácora registra las acciones de cada usuario en el sitio y en el picking. El 11/10 se decidió que **se consulta en la pestaña "Bitácora" de Reportes**, como en el prototipo, y que además registra los **inicios de sesión**.

- Registra las operaciones de todos los usuarios de los **dos sistemas** (resuelve P-32). Entre ellas:
  - **inicios de sesión** (11/10). Los cierres de sesión **no**;
  - **intentos fallidos de inicio de sesión** y los bloqueos que provocan (12/10, RNF-15). Como no siempre hay un usuario válido, se guarda el nombre de usuario que se escribió;
  - carga de archivos de Odoo, eliminación de pedidos facturados del tablero, envío de pedidos y cancelación de opciones de envío;
  - corrección del sector de un cliente;
  - productos y clientes agregados desde Facturación;
  - cambios de estado y cierres de ruta;
  - creación, edición y eliminación de productos, camiones, clientes, sectores y usuarios;
  - asignación y revocación de permisos y sedes;
  - restablecimiento de contraseñas;
  - cambios de contenido, documentos internos y solicitudes de contacto en el sitio.
- Guarda el registro histórico de cada ruta, desde Facturación hasta el cierre.
- Cada registro guarda el usuario, la fecha y la hora, la operación y su detalle.
- **No se registran:**
  - el marcado de filas en Bodega (RN-20);
  - el reordenamiento de prioridad en Bodega (RN-28);
  - el reordenamiento de filas en Ruta antes de la entrega; solo se guarda el recorrido final (RN-29).
