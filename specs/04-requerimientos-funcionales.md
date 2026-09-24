# 04. Requerimientos funcionales y casos de uso

Catálogo único de requerimientos funcionales. La columna **Estado** compara cada requerimiento con el Documento 1 v0.1 (21/09/2026); ver las convenciones en [README.md](README.md). El comportamiento detallado está en el archivo de cada módulo.

## Sitio web (RF-SW)

| Código | Requerimiento | Estado |
|---|---|---|
| RF-SW-01 | El sitio presenta una página de inicio con información institucional y noticias | Vigente |
| RF-SW-02 | El sitio presenta el apartado "Quiénes somos" con historia, misión, visión y valores | Vigente |
| RF-SW-03 | El sitio presenta las **9 industrias** atendidas, con navegación por industria. Las industrias **no** van en una barra superior horizontal | Modificado (9 industrias) |
| RF-SW-04 | El sitio presenta un catálogo informativo de productos por industria, sin precios ni comercio electrónico. Se muestran nombre, origen y presentación, y nunca el lote. **Un producto puede pertenecer a varias industrias** | Modificado |
| RF-SW-05 | El sitio presenta el detalle de cada producto: presentación, origen, manejo, condiciones de almacenamiento, humedad, tipo de producto y restricciones de uso | Vigente (datos pendientes, P-17) |
| RF-SW-06 | El sitio presenta un formulario de contacto para solicitudes, quejas o reclamos. El contenido se envía por correo, se guarda en la base de datos, y el correo de contacto queda visible | Vigente |
| RF-SW-07 | El panel permite a **Gerencia y Administrativo** actualizar sin tocar código la información institucional, las imágenes, las industrias, el catálogo, las noticias y la información de contacto | Modificado (roles) |
| RF-SW-08 | El sitio y el panel son responsivos para escritorio, tableta y teléfono | Vigente |
| RF-SW-09 | El sitio presenta los tres accesos: Odoo (enlace), administración del sitio y sistema de picking | Vigente |
| RF-SW-10 | El sitio tiene un área protegida de documentación interna (FT, HS, COA). Lo que cada usuario puede hacer depende de su rol, según la matriz de [03-roles-y-accesos.md](03-roles-y-accesos.md). Vista general solo visualiza | Modificado |
| RF-SW-11 | Recuperación de contraseña: por correo si el usuario tiene correo registrado; si no, la restablece Gerencia | Modificado |
| RF-SW-12 | El panel tiene una bandeja con las solicitudes recibidas por el formulario de contacto | Vigente (roles, P-13) |
| RF-SW-13 | Solo Gerencia administra los usuarios del sitio desde el panel: crear, editar y restablecer contraseña. Cada cuenta tiene un solo rol del sitio | Nuevo |
| RF-SW-14 | Al cargar un documento interno se indica su tipo (FT, HS o COA) y se asocia a **uno o varios productos públicos**. Si es un COA, se registra además el código o lote al que corresponde, como texto | Nuevo |

## Sistema de picking (RF-SL)

| Código | Requerimiento | Estado |
|---|---|---|
| RF-SL-01 | El sistema autentica con nombre de usuario y contraseña | Vigente |
| RF-SL-02 | La sede del usuario sale de su cuenta. No hay selector de sede al iniciar sesión | Vigente |
| RF-SL-03 | Gerencia y Soporte IT crean usuarios del picking de cualquier rol y asignan su sede, desde Configuración | Modificado |
| RF-SL-04 | Gerencia y Soporte IT ven, crean, editan y eliminan productos (**incluido su Peso2**), clientes, sectores y camiones, desde Configuración | Modificado |
| RF-SL-05 | Facturación permite elegir el tipo de pedido: cliente recoge en bodega o envío en camión | Vigente |
| RF-SL-06 | Si el pedido es de envío en camión, Facturación permite asignar camión y piloto | Vigente |
| RF-SL-07 | Facturación tiene una tabla de captura con las columnas Cliente, SKU, Producto y Cantidad **en kg** | Modificado (kg) |
| RF-SL-08 | La tabla empieza vacía y cada clic en el botón "+" agrega una fila | Vigente |
| RF-SL-09 | Al escribir el nombre del cliente, el sistema busca coincidencias en tiempo real y las muestra en una lista desplegable | Vigente |
| RF-SL-10 | Al escribir el nombre del producto, el sistema busca coincidencias en tiempo real y las muestra en una lista desplegable | Vigente |
| RF-SL-11 | Desde Facturación no se pueden crear clientes ni productos; solo se usan los que ya existen. Los productos se crean en Configuración | Modificado |
| RF-SL-12 | Las filas de la tabla se pueden reordenar, editar y eliminar | Vigente |
| RF-SL-13 | La columna Cantidad se suma automáticamente y el total en kg aparece al pie | Vigente |
| RF-SL-14 | En un pedido de envío en camión, si el total alcanza o supera la capacidad del camión, aparece una alerta que **no bloquea** | Vigente |
| RF-SL-15 | Al agregar cada fila se valida la existencia de la sede, **sumando todas las filas del mismo producto en el pedido**. Si no alcanza, el sistema alerta y no permite enviar el pedido a bodega | Modificado |
| RF-SL-16 | "Enviar Pedido a Bodega" guarda el pedido con su correlativo por sede y con el Peso2 vigente de cada producto, registra la salida por venta y lo manda a Bodega. Si es de envío en camión, en ese mismo paso crea la ruta, con su número y la fecha del envío | Modificado |
| RF-SL-17 | "Cancelar" descarta la captura **sin guardar el pedido**. La bitácora registra la cancelación | Modificado |
| RF-SL-18 | No hay borradores. Un pedido enviado a bodega no se puede editar ni cancelar | Vigente |
| RF-SL-19 | Bodega muestra los pedidos por preparar en el orden en que llegan de Facturación | Vigente |
| RF-SL-20 | En Bodega se pueden reordenar los pedidos y las filas de cada pedido. El orden se comparte **en tiempo real** entre todas las pantallas de la sede y **no queda en el historial** | Modificado |
| RF-SL-21 | Cada pedido en Bodega tiene una tabla con SKU, Producto, Cantidad y Unidades. La cantidad es la suma en kg del mismo **código completo** entre todos los clientes del pedido | Modificado |
| RF-SL-22 | Las unidades se calculan con RN-01 y se muestran como "N unidades + R kg" | Modificado |
| RF-SL-23 | Cada fila tiene una casilla para marcar y desmarcar lo que ya se sacó. El cambio se ve **al instante en todas las pantallas** | Modificado |
| RF-SL-24 | El botón "Pedido Despachado" solo se habilita cuando todas las filas están marcadas | Vigente |
| RF-SL-25 | Bodega se lee bien proyectado en una TV y se puede usar en una tableta | Vigente |
| RF-SL-26 | El piloto solo ve las rutas que tiene asignadas | Vigente |
| RF-SL-27 | La tabla de Ruta tiene las columnas Cliente, Sector y Total (kg) | Vigente |
| RF-SL-28 | El piloto puede reordenar las filas durante la ruta. El orden que tienen al pulsar "Pedido Entregado" se guarda como recorrido | Modificado |
| RF-SL-29 | El botón "Pedido Entregado" registra la entrega completa a todos los clientes de la ruta | Vigente |
| RF-SL-30 | Cada ruta registra su número (correlativo por sede), su fecha (la del envío a bodega), camión y piloto. El número y la fecha se asignan al pulsar "Enviar Pedido a Bodega" | Modificado |
| RF-SL-31 | Editar la cantidad del registro de ruta (Gerencia y Soporte IT) | **Eliminado**, reemplazado por RF-SL-44 |
| RF-SL-32 | Motivo obligatorio al editar la ruta | **Eliminado**, reemplazado por RF-SL-44 |
| RF-SL-33 | Reingreso al inventario al editar la ruta | **Eliminado**, reemplazado por RF-SL-44 |
| RF-SL-34 | Estado "Editado" al editar la ruta | **Eliminado**, reemplazado por RF-SL-45 |
| RF-SL-35 | El sistema maneja los estados del pedido y sus transiciones según RN-11 | Vigente (RN-11 modificada) |
| RF-SL-36 | La bitácora registra las operaciones de todos los usuarios, con las excepciones de [12-reglas-de-negocio.md](12-reglas-de-negocio.md) | Modificado |
| RF-SL-37 | El sistema guarda el registro histórico de todas las rutas, desde Facturación hasta el cierre en Ruta | Vigente |
| RF-SL-38 | Módulo de Reportes, según lo que especifique la empresa | **Pendiente** (P-05) |
| RF-SL-39 | El módulo de Inventario solo es accesible para Gerencia y Soporte IT | Nuevo |
| RF-SL-40 | Inventario muestra la existencia actual de cada producto por sede, en kg | Nuevo |
| RF-SL-41 | Inventario permite registrar una **compra**: producto existente, sede y cantidad en kg | Nuevo |
| RF-SL-42 | Inventario permite registrar un **ajuste** positivo o negativo, con motivo obligatorio | Nuevo |
| RF-SL-43 | Inventario permite registrar un **traslado** entre sedes. Genera automáticamente la salida en el origen y la entrada en el destino | Nuevo |
| RF-SL-44 | Inventario permite registrar una **devolución** de un pedido Despachado o Entregado: por línea, sin superar lo vendido menos lo ya devuelto, con motivo obligatorio. Un pedido puede tener varias devoluciones | Nuevo |
| RF-SL-45 | Un pedido con al menos una devolución muestra la marca **"Con devolución"**, con el usuario y la fecha de cada devolución | Nuevo |
| RF-SL-46 | Ningún ajuste negativo ni traslado puede dejar la existencia por debajo de cero. El sistema avisa y no guarda | Nuevo |
| RF-SL-47 | Cada movimiento de inventario guarda tipo, producto, sede, cantidad, fecha y hora, usuario, y además motivo o pedido cuando aplica | Nuevo |
| RF-SL-48 | Gerencia y Soporte IT restablecen contraseñas de usuarios del picking desde Configuración | Nuevo |
| RF-SL-49 | Gerencia y Soporte IT pueden **editar** un movimiento de inventario ya registrado. La existencia se recalcula, no puede quedar por debajo de cero y la bitácora registra la edición. Qué movimientos y qué campos se editan está pendiente (P-50) | Nuevo |

## Casos de uso

| Código | Nombre | Actor principal | Estado respecto del Documento 1 |
|---|---|---|---|
| CU-01 | Registrar pedido facturado | Operativo Facturador | Modificado: el pedido se guarda al enviarlo, la validación suma las filas del mismo producto y las cantidades son en kg |
| CU-02 | Cancelar pedido | Operativo Facturador | Modificado: no se guarda el pedido, pero se registra en la bitácora |
| CU-03 | Preparar pedido | Operativo Bodega | Modificado: marcado y orden compartidos en tiempo real; unidades con resto |
| CU-04 | Cerrar preparación del pedido | Operativo Bodega | Vigente |
| CU-05 | Ejecutar ruta de entrega | Operativo Piloto | Modificado: el recorrido se guarda al entregar; número de ruta por sede |
| CU-06 | Registrar devolución | Gerencia o Soporte IT | Modificado: pasa al módulo de Inventario y se liga al pedido, no a la ruta |
| CU-07 | Administrar contenido del sitio | Gerencia o Administrativo | Vigente |
| CU-08 | Consultar información pública | Visitante | Vigente |
| CU-09 | Enviar solicitud de contacto | Visitante | Vigente |
| CU-10 | Consultar documentación interna | Gerencia, Administrativo, Operativo, Vista general | Modificado: permisos por rol; Vista general solo visualiza |
| CU-11 | Iniciar sesión y recuperar contraseña | Todos los usuarios | Modificado: usuario, no correo; recuperación según [03-roles-y-accesos.md](03-roles-y-accesos.md) |
| CU-12 | Administrar usuarios | Sitio: Gerencia. Picking: Gerencia o Soporte IT | Modificado: dos administraciones separadas |
| CU-13 | Configurar catálogos | Gerencia o Soporte IT | Modificado: productos (incluido el Peso2), clientes, sectores y camiones con CRUD completo |
| CU-14 | Consultar reportes y bitácora | Gerencia o Soporte IT | Pendiente de especificación (P-05) |
| CU-15 | Administrar documentos internos | Gerencia o Administrativo | Modificado: asociación a varios productos públicos; COA con código o lote en texto |
| CU-16 | Consultar existencias | Gerencia o Soporte IT | Nuevo |
| CU-17 | Registrar compra | Gerencia o Soporte IT | Nuevo |
| CU-18 | Registrar ajuste | Gerencia o Soporte IT | Nuevo |
| CU-19 | Registrar traslado entre sedes | Gerencia o Soporte IT | Nuevo |
| CU-20 | Editar movimiento de inventario | Gerencia o Soporte IT | Nuevo (detalle pendiente, P-50) |
