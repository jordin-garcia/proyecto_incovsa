# 12. Reglas de negocio

La columna **Estado** compara cada regla con el Documento 1 v0.1. Los códigos no se reutilizan. Los cambios de la reunión 5 (13/10/2026) y las respuestas del coordinador del 14/10/2026 se marcan con **(13/10)** y **(14/10)**.

## Catálogo de reglas

| Código | Regla | Estado |
|---|---|---|
| RN-01 | **Conversión.** `unidades = parte entera (cantidad_kg ÷ Peso de Conversión)` y `resto_kg = cantidad_kg − unidades × Peso de Conversión`. Se muestra como "N unidades + R kg" | Modificado |
| RN-02 | El Peso de Conversión es un número en kg. **(13/10)** Se toma de la columna `Movimientos de stock/Producto/Peso` del archivo de Odoo, línea por línea (RN-37). El sistema **nunca** lo calcula a partir del texto del nombre del producto | Modificado |
| RN-03 | Solo se venden cantidades exactas | **Eliminado**, reemplazado por RN-21 |
| RN-04 | **Todas las cantidades del sistema de picking están en kg**: las del archivo de Odoo, los totales y las capacidades | Modificado |
| RN-05 | La conversión no redondea. Lo que no completa una unidad se muestra como resto en kg | Modificado |
| RN-06 | Descuento de existencia al enviar el pedido a bodega | **Eliminado** (29/09, sin inventario) |
| RN-07 | Validación de existencias al registrar el pedido | **Eliminado** (29/09, sin inventario) |
| RN-08 | El sistema llevaba sus propias existencias por producto y sede | **Eliminado** (29/09). El inventario lo lleva Odoo (RN-40) |
| RN-09 | La única entrada es la devolución | **Eliminado**, reemplazado por RN-22 |
| RN-10 | La existencia de cada producto se expresa en kg | **Eliminado** (29/09, sin inventario) |
| RN-11 | Estados de la ruta y del pedido y sus transiciones: ver la sección siguiente | Modificado |
| RN-12 | Una ruta o un pedido puede tener **varios clientes**. Se arma en Facturación agregando **pedidos facturados** (cada uno es una referencia de Odoo de un solo cliente) a una opción de envío. **(13/10)** Lo que sale de "Envío por camión" es una **ruta** y equivale a una carga de camión; lo que sale de "Cliente recoge en bodega" es un **pedido** | Modificado |
| RN-13 | La opción "Envío por camión" suma el peso de sus pedidos facturados. Si **excede** la capacidad del camión elegido, aparece la alerta de sobrepeso, que **solo informa**: se puede enviar igual. INCOVSA acepta que sea aproximada | Modificado |
| RN-14 | Devolución editando el registro de ruta | **Eliminado**, reemplazado por RN-23 |
| RN-15 | La clave del producto era su nombre en el catálogo del picking | **Eliminado** (13/10): el picking ya no tiene catálogo de productos. El producto es el nombre que trae cada línea del archivo |
| RN-16 | No hay borradores de rutas ni de pedidos: se crean al pulsar "Enviar a Bodega". Una ruta o un pedido enviado no se edita ni se cancela. Antes del envío sí se guardan el tablero de pedidos facturados y lo asignado a cada opción de envío (RN-48) | Modificado |
| RN-17 | Cada usuario del picking ve solo los datos de las **sedes que tiene asignadas**, que se marcan como los permisos. Gerencia y Soporte ven todas | Modificado |
| RN-18 | Se mantienen dos administraciones de usuarios y dos inicios de sesión. Las cuentas de **Gerencia y Soporte** sirven en los dos sistemas, porque tienen acceso total; las demás cuentas son de un solo sistema. **(13/10)** Una persona puede tener una cuenta en cada sistema con el mismo nombre de usuario (RN-54) | Modificado |
| RN-19 | Lo que cada usuario puede hacer con la documentación interna depende de **sus permisos** | Modificado |
| RN-20 | El marcado de filas en Bodega no registra quién marcó, ni se guarda en la bitácora | Vigente |
| RN-21 | Se permiten **ventas fraccionadas**: la cantidad no tiene que ser múltiplo del Peso de Conversión | Nuevo |
| RN-22 | Entradas y salidas de inventario | **Eliminado** (29/09, sin inventario) |
| RN-23 | Devoluciones ligadas al pedido y marca "Con devolución" | **Eliminado** (29/09, sin inventario) |
| RN-24 | Existencia nunca negativa | **Eliminado** (29/09, sin inventario) |
| RN-25 | Traslados entre sedes | **Eliminado** (29/09, sin inventario) |
| RN-26 | Motivo de los ajustes | **Eliminado** (29/09, sin inventario) |
| RN-27 | Registro de compras | **Eliminado** (29/09, sin inventario) |
| RN-28 | La prioridad en Bodega (orden de rutas y pedidos, y de sus filas, incluido el orden por peso) la puede cambiar cualquier usuario con acceso al módulo. Se comparte en tiempo real y no se guarda en el historial ni en la bitácora | Nuevo |
| RN-29 | Las filas de la ruta llegan en el orden en que el facturador dejó los pedidos facturados (13/10). El recorrido que se guarda es el orden de las filas al pulsar "Ruta Entregada" | Nuevo |
| RN-30 | **(13/10)** La ruta es lo que se envía a Bodega desde "Envío por camión". Su número (correlativo diario por sede, RN-52) y su fecha (la del envío a bodega) se asignan al pulsar "Enviar a Bodega". Un camión puede hacer varias rutas al día | Modificado |
| RN-31 | La ruta o el pedido se crea al pulsar "Enviar a Bodega" en su opción de envío y se identifica con su **número del día** y su fecha (RN-52). Cada **pedido facturado** que contiene se identifica con su **número de Odoo**. No se valida si una referencia ya se cargó, porque los datos vienen de Odoo. No se registra el número de factura | Modificado |
| RN-32 | El sistema no controla lotes ni ubicaciones dentro de la bodega. **(13/10)** El lote de cada línea solo se guarda y se muestra (RN-51) | Modificado |
| RN-33 | Cada línea guarda el Peso de Conversión con el que llegó en el archivo de Odoo. Una ruta o un pedido enviado **conserva** ese Peso de Conversión aunque después llegue otro archivo con un peso distinto para el mismo producto | Modificado |
| RN-34 | Edición de movimientos de inventario | **Eliminado** (29/09, sin inventario) |
| RN-35 | Los pedidos se registran **solo** cargando el archivo .xlsx exportado de Odoo. El archivo se lee de arriba hacia abajo, y una fila sin Referencia ni Contacto pertenece a la última referencia y contacto de arriba. Solo se cargan las referencias en estado "Hecho". Cada archivo trae referencias de una sola bodega. **(13/10)** Los datos se usan tal como vienen, sin validarlos contra ningún catálogo | Modificado |
| RN-36 | De la Referencia (`XE-IN/SALIDA/03539`) se toma el **tercer segmento como número del pedido facturado**. El primer segmento indica la bodega de salida y el segundo, que es una salida. Prefijos: `XE` = Quetzaltenango (Xela), `GT` = Guatemala, `ESC` = Escuintla | Nuevo |
| RN-37 | La cantidad es la columna `Movimientos de stock/Cantidad hecha`, en kg. **(13/10)** El Peso de Conversión es la columna `Movimientos de stock/Producto/Peso` y el lote, la columna `Movimientos de stock/Números de serie`. Reemplaza a lo decidido el 29/09, cuando la columna de peso no se usaba | Modificado |
| RN-38 | El acceso se basa en **permisos asignados a cada usuario**, por módulo y por acción, no en su rol. El rol es texto libre. Los únicos roles predeterminados son Gerencia y Soporte, con acceso total a los dos sistemas | Nuevo |
| RN-39 | La bitácora registra las acciones de cada usuario en los dos sistemas, incluidos los **inicios de sesión** y los **intentos fallidos**. Se consulta en la pestaña "Bitácora" de Reportes. No registra el marcado ni la prioridad de Bodega, ni el orden de Ruta antes de entregar | Nuevo |
| RN-40 | El sistema **no lleva control de inventario**: ni existencias, ni entradas, ni salidas. Eso lo hace Odoo | Nuevo |
| RN-41 | El lote de un producto documentado admite **números y letras**. **(13/10)** Es **obligatorio** en todos los productos documentados | Modificado |
| RN-42 | Una solicitud de contacto tiene los estados **Asignado**, **En proceso** y **Solucionado**, que se marcan con botones. Al llegar no tiene ningún estado. Se puede marcar cualquier estado, sin orden ni restricción | Nuevo |
| RN-43 | Validación de productos del archivo contra el catálogo | **Eliminado** (13/10): no hay catálogo de productos |
| RN-44 | Validación de clientes del archivo contra la base de clientes | **Eliminado** (13/10): el cliente y el sector se toman tal como vienen en `Contacto` y `Contacto/Ciudad` |
| RN-45 | Corrección del sector del cliente en el tablero | **Eliminado** (13/10 y 14/10): los datos del archivo no se corrigen |
| RN-46 | Los usuarios cuyo rol es **"Piloto"** son los que se eligen en la opción "Envío por camión" y los que ven solo sus rutas en Ruta | Nuevo |
| RN-47 | Para recuperar su contraseña, el usuario la solicita a Gerencia o a Soporte, que escriben una nueva desde la administración de usuarios de su sistema. No hay recuperación por correo | Nuevo |
| RN-48 | El **tablero de pedidos facturados** y lo asignado a cada opción de envío (pedidos facturados y su orden, camión, piloto, fecha y hora programadas) **se guardan en la base de datos** por sede. Se pueden eliminar del tablero uno, varios o todos los pedidos facturados. "Cancelar" en una opción de envío regresa sus pedidos facturados al tablero | Nuevo |
| RN-49 | En la tabla de Ruta hay una fila por cliente: si un cliente tiene varios pedidos facturados en la misma ruta, van en una sola fila con la suma de sus kg. **(13/10)** Dos pedidos facturados son del mismo cliente cuando tienen el mismo nombre y el mismo sector en el archivo. **(22/10)** El nombre y el sector se comparan sin distinguir mayúsculas ni tildes y sin espacios sobrantes, como `claveRuta()` del prototipo; la fila muestra el nombre y el sector del primer pedido facturado | Nuevo |
| RN-50 | **(14/10)** Si una línea de una referencia "Hecho" trae el Peso de Conversión vacío, no numérico o menor o igual a 0, ese pedido facturado **no se carga** y se avisa en el resumen de la carga, igual que con una cantidad inválida | Nuevo |
| RN-51 | **(13/10 y 14/10)** Bodega agrupa las líneas por **producto, lote y Peso de Conversión**: suma la cantidad de las líneas iguales entre todos los clientes de la ruta o del pedido y muestra el lote resaltado. Lotes distintos van en filas distintas | Nuevo |
| RN-52 | **(13/10)** Las rutas y los pedidos llevan cada uno su **correlativo diario por sede**: empiezan en 1 cada día, según la fecha de envío a bodega en la hora de Guatemala | Nuevo |
| RN-53 | **(13/10 y 14/10)** Cada opción de envío lleva la **fecha y la hora programadas** de envío (ruta) o de despacho (pedido). Son **obligatorias** para enviar, se guardan con la ruta o el pedido y se muestran en Bodega en lugar de la hora de envío desde Facturación | Nuevo |
| RN-54 | **(13/10)** El nombre de usuario es único **dentro de cada sistema**. Se puede crear una cuenta del picking con el mismo nombre de usuario que una del sitio, y al revés. Las cuentas de Gerencia y Soporte, que ya sirven en los dos sistemas, no se pueden repetir en el otro | Nuevo |
| RN-55 | **(13/10)** La documentación interna se registra por **producto documentado**: nombre, país de origen, lote (obligatorio) y los enlaces de Google Drive de su ficha técnica, su hoja de seguridad y su certificado de análisis. El sistema no guarda archivos PDF | Nuevo |
| RN-56 | **(13/10)** Cada área de imágenes del sitio público admite **hasta 5 imágenes**. Si tiene más de una, rotan cada 5 segundos; si tiene una, se muestra fija, sin movimiento. Los valores son la excepción: 5 imágenes fijas, una por valor | Nuevo |
| RN-57 | **(13/10)** Cada registro guarda automáticamente la **fecha y la hora exactas** en que se guardó en la base de datos | Nuevo |

## Conversión (RN-01, RN-02, RN-05, RN-21)

```
unidades = parte entera (cantidad_kg ÷ Peso de Conversión)
resto_kg = cantidad_kg − (unidades × Peso de Conversión)
```

| Cantidad (kg) | Peso de Conversión (kg) | Resultado |
|---|---|---|
| 50 | 25 | 2 unidades (sin "+ 0 kg", 12/10) |
| 60 | 25 | 2 unidades + 10 kg |
| 10 | 25 | 0 unidades + 10 kg |
| 55 | 55 | 1 unidad (ejemplo de la contraparte) |
| 110 | 55 | 2 unidades (ejemplo de la contraparte) |

- La conversión se hace sobre la cantidad **agrupada por producto, lote y Peso de Conversión** en Bodega (RN-51).
- El Peso de Conversión es el de la columna `Movimientos de stock/Producto/Peso` de cada línea del archivo de Odoo (RN-37, 13/10).
- Los cálculos usan números decimales exactos, no punto flotante: las cantidades se guardan como `Decimal(12,3)` y la conversión se calcula en gramos enteros (12/10).
- **Casos de prueba obligatorios:** los 15 casos exactos que la empresa validó (respuesta del 23/09). Cada caso es una cantidad y un Peso de Conversión, que ahora llegan en el archivo de Odoo; el resultado esperado no cambia. La columna "Código" conserva el formato de `Picking II` con que se validaron. Hay que agregar casos fraccionados y casos con datos incorrectos, entre ellos un Peso de Conversión en 0 (RN-50) (Documento 6, sección 9).

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

## Estados de la ruta y del pedido (RN-11)

| Estado | Cuándo | ¿Se guarda? |
|---|---|---|
| Pendiente | Sus pedidos facturados están en el tablero o en una opción de envío, sin enviar | Se guardan los pedidos facturados (RN-48); la ruta o el pedido todavía no existe |
| En Preparación | Al pulsar "Enviar a Bodega" en la opción de envío | Sí. Es el primer estado |
| Despachado | Pedido (cliente recoge en bodega), al pulsar "Pedido Despachado" en Bodega | Sí |
| En Ruta | Ruta (envío por camión), al pulsar "Ruta Despachada" en Bodega | Sí |
| Entregado | Ruta, al pulsar "Ruta Entregada" en Ruta | Sí |

```
Pedido (cliente recoge en bodega):  Pendiente → En Preparación → Despachado
Ruta (envío por camión):            Pendiente → En Preparación → En Ruta → Entregado
Cancelar una opción:                sus pedidos facturados regresan al tablero (no hay estado Cancelado)
```

- El estado "Editado" del Documento 1 y la marca "Con devolución" que lo reemplazó el 24/09 **ya no existen**.
- Cada cambio de estado que se guarda registra la fecha, la hora y el usuario.

## Bitácora (RN-39)

- Registra las operaciones de todos los usuarios de los **dos sistemas**. Entre ellas:
  - **inicios de sesión**. Los cierres de sesión **no**;
  - **intentos fallidos de inicio de sesión** y los bloqueos que provocan (RNF-15). Incluye las consultas de un nombre de usuario que no existe en el paso de usuario del acceso personal (14/10). Como no siempre hay un usuario válido, se guarda el nombre de usuario que se escribió;
  - carga de archivos de Odoo, eliminación de pedidos facturados del tablero, envío de rutas y pedidos y cancelación de opciones de envío;
  - cambios de estado y cierres de ruta;
  - creación, edición y eliminación de camiones y usuarios;
  - asignación y revocación de permisos y sedes;
  - creación y restablecimiento de contraseñas;
  - cambios de contenido, productos documentados y solicitudes de contacto en el sitio.
- Guarda el registro histórico de cada ruta, desde Facturación hasta el cierre.
- Cada registro guarda el usuario, la fecha y la hora, la operación y su detalle.
- **No se registran:**
  - el marcado de filas en Bodega (RN-20);
  - el reordenamiento de prioridad en Bodega, incluido el orden por peso (RN-28);
  - el reordenamiento de filas en Ruta antes de la entrega; solo se guarda el recorrido final (RN-29).
