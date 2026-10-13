# 04. Requerimientos funcionales y casos de uso

Catálogo único de requerimientos funcionales. La columna **Estado** compara cada requerimiento con el Documento 1 v0.1 (21/09/2026); ver las convenciones en [README.md](README.md). Cuando un requerimiento cambió en la reunión 4 (29/09/2026) o con las respuestas del 11/10/2026, el texto lo indica con **(29/09)** u **(11/10)**. El comportamiento detallado está en el archivo de cada módulo.

## Sitio web (RF-SW)

| Código | Requerimiento | Estado |
|---|---|---|
| RF-SW-01 | El sitio presenta una página de inicio **informativa**, con información institucional y noticias. **(29/09)** Sin la sección "Catálogo informativo" (no se quita nada más), con las imágenes de misión y visión centradas una debajo de la otra, y con presentación dinámica de las imágenes al desplazarse | Modificado |
| RF-SW-02 | El sitio presenta el apartado "Quiénes somos" con historia, misión, visión y valores. **(29/09)** Banner con transición entre los logotipos de INCOVSA e Inquiserca; misión y visión como imágenes dinámicas a media pantalla, misión arriba y visión abajo, centradas; imagen opcional para historia y valores | Modificado |
| RF-SW-03 | El sitio presenta las **9 industrias** atendidas, con navegación por industria. Las industrias **no** van en una barra superior horizontal. **(29/09)** Cada industria muestra solo su descripción, una imagen propia y sus productos en texto; sin imágenes de productos | Modificado |
| RF-SW-04 | El sitio presenta un catálogo informativo de productos por industria, sin precios ni comercio electrónico. Se muestran nombre, países de origen y presentación, y nunca el lote. **Un producto puede pertenecer a varias industrias**. **(29/09)** La búsqueda del prototipo está aprobada | Modificado |
| RF-SW-05 | El sitio presenta el detalle de cada producto. **(11/10)** Imagen, nombre, descripción, presentación, países de origen e industrias. Se eliminan manejo, almacenamiento, humedad, tipo y restricciones | Modificado |
| RF-SW-06 | El sitio presenta un formulario de contacto para solicitudes, quejas o reclamos. El contenido se envía por correo, se guarda en la base de datos, y el correo de contacto queda visible | Vigente |
| RF-SW-07 | El panel permite actualizar sin tocar código la información institucional, las imágenes, las industrias, el catálogo, las noticias y la información de contacto. **(29/09)** Quién lo hace depende de sus permisos | Modificado |
| RF-SW-08 | El sitio y el panel son responsivos para escritorio, tableta y teléfono | Vigente (reconfirmado el 29/09) |
| RF-SW-09 | El sitio presenta los tres accesos: Odoo (enlace), administración del sitio y sistema de picking | Vigente |
| RF-SW-10 | El sitio tiene un área protegida de documentación interna (FT, HS, COA). **(29/09)** Lo que cada usuario puede hacer depende de sus permisos | Modificado |
| RF-SW-11 | **(11/10)** Para recuperar su contraseña, el usuario la solicita a Gerencia o a Soporte, que la restablecen desde el panel. No hay recuperación por correo | Modificado |
| RF-SW-12 | El panel tiene una bandeja con las solicitudes recibidas por el formulario de contacto | Vigente |
| RF-SW-13 | **(11/10)** Gerencia y Soporte administran los usuarios del sitio desde el panel: crear, editar, eliminar, rol (texto libre) y permisos por casillas. La administración es distinta de la del picking | Modificado |
| RF-SW-14 | Al cargar un documento interno se indica su tipo (FT, HS o COA). **(29/09 y 11/10)** Se escribe el nombre de un solo producto, se elige el país de origen de una lista con todos los países y se escribe el lote (números y letras), obligatorio solo en el COA | Modificado |
| RF-SW-15 | **(29/09)** Inicio, Quiénes somos, Noticias y Contacto llevan pie de página, con el logotipo de la cabecera. Industrias, Productos y el detalle de producto van sin pie de página | Nuevo |
| RF-SW-16 | **(29/09)** Las imágenes de Inicio y las de misión y visión de Quiénes somos tienen una animación de aparición y desaparición al desplazarse | Nuevo |
| RF-SW-17 | **(29/09)** El detalle de producto incluye, al final, la sección **"Productos Recomendados"**, que **siempre** aparece (11/10) | Nuevo |
| RF-SW-18 | **(29/09)** Cada noticia tiene fotografía, título y texto, y se administra desde el panel | Nuevo |
| RF-SW-19 | **(29/09)** El formulario de contacto captura el teléfono con código de área por país, valida la estructura del correo y del teléfono, y agrega País (lista de todos los países), Departamento y Municipio (listas de Guatemala, que solo aparecen si el país es Guatemala), todos opcionales. **(11/10)** La sede sigue siendo obligatoria y solo ofrece Quetzaltenango y Guatemala | Nuevo |
| RF-SW-20 | **(29/09)** La bandeja divide las solicitudes por motivo (solicitud, queja, reclamo); cada solicitud tiene un responsable (usuario del sitio), un comentario y botones de estado Asignado, En proceso y Solucionado, sin estado inicial y sin restricción de orden (11/10) | Nuevo |
| RF-SW-21 | **(29/09)** Los documentos internos se buscan por lote, nombre del producto y país de origen | Nuevo |
| RF-SW-22 | **(29/09 y 11/10)** En Inicio, Quetzaltenango y Guatemala muestran sus datos de dirección y su mapa de Google Maps insertado. Escuintla no se muestra en el sitio | Nuevo |
| RF-SW-23 | **(29/09 y 11/10)** El panel permite cargar las imágenes de misión y visión, una imagen opcional para historia y valores, el logotipo de Inquiserca, una imagen por industria y una por producto público (subida o arrastrada), y eliminar productos públicos. El producto público tiene nombre, descripción, presentación y países de origen, todos de texto | Nuevo |
| RF-SW-24 | **(29/09)** El logotipo "Transformamos INCOVSA" no se usa en el sitio público; se usa el logotipo de la cabecera | Nuevo |
| RF-SW-25 | **(29/09)** El acceso al panel y a la documentación interna depende de los permisos asignados a cada usuario ([03-roles-y-accesos.md](03-roles-y-accesos.md)) | Nuevo |
| RF-SW-26 | **(29/09)** El menú lateral izquierdo del panel del sitio se reduce a íconos para ampliar el área de trabajo (11/10) | Nuevo |

## Sistema de picking (RF-SL)

| Código | Requerimiento | Estado |
|---|---|---|
| RF-SL-01 | El sistema autentica con nombre de usuario y contraseña | Vigente |
| RF-SL-02 | No hay selector de sede al iniciar sesión | Vigente |
| RF-SL-03 | **(11/10)** Gerencia y Soporte administran los usuarios del picking desde Configuración: rol (texto libre), sedes y permisos por casillas | Modificado |
| RF-SL-04 | Se ven, crean, editan y eliminan productos, clientes, sectores y camiones, desde Configuración. **(11/10)** Un producto solo tiene nombre y Peso de Conversión | Modificado |
| RF-SL-05 | **(11/10)** El facturador decide si cada pedido facturado va en un camión o lo recoge el cliente en bodega, arrastrándolo a la opción de envío | Modificado |
| RF-SL-06 | **(11/10)** Cada opción de camión de Facturación tiene su piloto, elegido entre los usuarios con rol "Piloto" de la sede | Modificado |
| RF-SL-07 | **(11/10)** Facturación muestra cada pedido facturado del tablero en una tarjeta resumida: número de pedido, nombre del cliente, sector del cliente y total en kg | Modificado |
| RF-SL-08 | La tabla empieza vacía y cada clic en el botón "+" agrega una fila | **Eliminado** (29/09), reemplazado por RF-SL-50 |
| RF-SL-09 | Búsqueda de clientes en tiempo real al capturar | **Eliminado** (29/09), reemplazado por RF-SL-50 |
| RF-SL-10 | Búsqueda de productos en tiempo real al capturar | **Eliminado** (29/09), reemplazado por RF-SL-50 |
| RF-SL-11 | **(11/10)** Desde Facturación se pueden agregar los productos y clientes del archivo que no existen en la base (RF-SL-64, RF-SL-65) | Modificado |
| RF-SL-12 | **(11/10)** En el tablero, el único dato que se puede corregir es el sector del cliente, y la corrección se guarda en la base de clientes | Modificado |
| RF-SL-13 | **(11/10)** Cada tarjeta muestra el total en kg del pedido facturado, y cada opción de envío el total de sus pedidos facturados | Modificado |
| RF-SL-14 | **(11/10)** Cada opción de camión lleva el control del peso y muestra una alerta de sobrepeso, que **no bloquea**, si el total excede la capacidad | Modificado |
| RF-SL-15 | Validación de existencias al agregar cada fila | **Eliminado** (29/09, sin inventario) |
| RF-SL-16 | **(11/10)** Cada opción de envío tiene su botón "Enviar Pedido a Bodega", que crea un pedido (correlativo por sede) con sus pedidos facturados, de uno o varios clientes, guarda el Peso de Conversión vigente y lo manda a Bodega. En una opción de camión, en el mismo paso crea la ruta, con su número y la fecha | Modificado |
| RF-SL-17 | **(11/10)** Cada opción de envío tiene su botón "Cancelar", que regresa sus pedidos facturados al tablero. La bitácora registra la cancelación | Modificado |
| RF-SL-18 | No hay borradores. Un pedido enviado a bodega no se puede editar ni cancelar | Vigente |
| RF-SL-19 | Bodega muestra los pedidos por preparar en el orden en que llegan de Facturación | Vigente |
| RF-SL-20 | En Bodega se pueden reordenar los pedidos y las filas de cada pedido. El orden se comparte **en tiempo real** entre todas las pantallas de la sede y **no queda en el historial** | Modificado |
| RF-SL-21 | Cada pedido en Bodega tiene una tabla con Producto, Cantidad y Unidades. La cantidad es la suma en kg del mismo producto entre todos los clientes del pedido. **(11/10)** Sin la columna SKU | Modificado |
| RF-SL-22 | Las unidades se calculan con RN-01 y se muestran como "N unidades + R kg" | Modificado |
| RF-SL-23 | Cada fila tiene una casilla para marcar y desmarcar lo que ya se sacó. El cambio se ve **al instante en todas las pantallas** | Modificado |
| RF-SL-24 | El botón "Pedido Despachado" solo se habilita cuando todas las filas están marcadas | Vigente |
| RF-SL-25 | Bodega se lee bien proyectado en una TV y se puede usar en una tableta | Vigente |
| RF-SL-26 | **(11/10)** Los usuarios con rol "Piloto" solo ven las rutas que tienen asignadas | Modificado |
| RF-SL-27 | La tabla de Ruta tiene las columnas Cliente, Sector y Total (kg). **(11/10)** Una sola fila por cliente, aunque tenga varios pedidos facturados en la ruta | Modificado |
| RF-SL-28 | El piloto puede reordenar las filas durante la ruta. El orden que tienen al pulsar "Pedido Entregado" se guarda como recorrido | Modificado |
| RF-SL-29 | El botón "Pedido Entregado" registra la entrega completa a todos los clientes de la ruta | Vigente |
| RF-SL-30 | Cada ruta registra su número (correlativo por sede), su fecha (la del envío a bodega), camión, piloto y su pedido. El número y la fecha se asignan al pulsar "Enviar Pedido a Bodega" en la opción de camión | Modificado |
| RF-SL-31 | Editar la cantidad del registro de ruta | **Eliminado** |
| RF-SL-32 | Motivo obligatorio al editar la ruta | **Eliminado** |
| RF-SL-33 | Reingreso al inventario al editar la ruta | **Eliminado** |
| RF-SL-34 | Estado "Editado" al editar la ruta | **Eliminado** |
| RF-SL-35 | El sistema maneja los estados del pedido y sus transiciones según RN-11 | Vigente (RN-11 modificada) |
| RF-SL-36 | La bitácora registra las operaciones de los usuarios. **(11/10)** Incluye los inicios de sesión y se consulta en la pestaña "Bitácora" de Reportes (RN-39) | Modificado |
| RF-SL-37 | El sistema guarda el registro histórico de todas las rutas, desde Facturación hasta el cierre en Ruta, y lo muestra en Reportes | Vigente |
| RF-SL-38 | Módulo de Reportes. **(29/09)** Su contenido es el del prototipo aprobado: despacho por producto con indicadores y exportación a Excel y PDF, rutas realizadas y bitácora ([10-picking-reportes.md](10-picking-reportes.md)) | Modificado |
| RF-SL-39 | Acceso al módulo de Inventario | **Eliminado** (29/09, sin inventario) |
| RF-SL-40 | Consulta de existencias por sede | **Eliminado** (29/09, sin inventario) |
| RF-SL-41 | Registro de compras | **Eliminado** (29/09, sin inventario) |
| RF-SL-42 | Registro de ajustes | **Eliminado** (29/09, sin inventario) |
| RF-SL-43 | Registro de traslados entre sedes | **Eliminado** (29/09, sin inventario) |
| RF-SL-44 | Registro de devoluciones | **Eliminado** (29/09, sin inventario) |
| RF-SL-45 | Marca "Con devolución" | **Eliminado** (29/09, sin inventario) |
| RF-SL-46 | Existencia nunca negativa | **Eliminado** (29/09, sin inventario) |
| RF-SL-47 | Registro de cada movimiento de inventario | **Eliminado** (29/09, sin inventario) |
| RF-SL-48 | **(11/10)** Gerencia y Soporte restablecen la contraseña de los usuarios del picking que se lo soliciten, desde Configuración | Modificado |
| RF-SL-49 | Edición de movimientos de inventario | **Eliminado** (29/09, sin inventario) |
| RF-SL-50 | **(29/09)** Facturación registra los pedidos **cargando un archivo .xlsx** exportado de Odoo, con la estructura de `Data Odo Para Picking.xlsx`. Un archivo trae una o varias referencias, de una sola bodega | Nuevo |
| RF-SL-51 | **(29/09)** El archivo se lee de arriba hacia abajo. Una fila sin Referencia ni Contacto pertenece a la última referencia y contacto de arriba. **(11/10)** Solo se cargan las referencias en estado "Hecho" | Nuevo |
| RF-SL-52 | **(29/09)** El número de cada pedido facturado es el tercer segmento de la Referencia (`XE-IN/SALIDA/03539` → `03539`). El primer segmento indica la bodega (`XE`, `GT` o `ESC`). **(11/10)** El pedido que se envía a Bodega se identifica con un correlativo por sede | Nuevo |
| RF-SL-53 | **(29/09 y 11/10)** Cada referencia es un pedido facturado de un solo cliente. El producto sale de `Movimientos de stock/Producto` y la cantidad en kg de `Movimientos de stock/Cantidad hecha`. El cliente se busca en la base por `Contacto`; si no existe y no se guarda, se usan `Contacto` y `Contacto/Ciudad` | Nuevo |
| RF-SL-54 | **(29/09)** No se usa la columna `Movimientos de stock/Producto/Peso`. La conversión usa el Peso de Conversión del catálogo | Nuevo |
| RF-SL-55 | **(29/09)** El acceso a cada módulo del picking depende de los permisos asignados a cada usuario, por módulo y por acción ([03-roles-y-accesos.md](03-roles-y-accesos.md)) | Nuevo |
| RF-SL-56 | **(29/09)** Gerencia y Soporte asignan a cada usuario un rol (texto libre) y le agregan, editan o revocan permisos puntuales con casillas | Nuevo |
| RF-SL-57 | **(29/09)** Gerencia y Soporte pueden eliminar usuarios (historial: P-42) | Nuevo |
| RF-SL-58 | **(29/09)** El tablero en pantalla completa ofrece "Modo claro" (como el modo Tableta del prototipo) y "Modo oscuro" (escala de negros y grises), en lugar de "TV" y "Tableta" | Nuevo |
| RF-SL-59 | **(29/09)** Reportes filtra por periodo: diario, semanal (lunes a domingo), mensual, anual o rango de fechas, en las pestañas Despacho y Rutas realizadas | Nuevo |
| RF-SL-60 | **(29/09)** El menú lateral izquierdo del picking se reduce a íconos para ampliar el área de trabajo (11/10) | Nuevo |
| RF-SL-61 | **(11/10)** La pantalla de Facturación muestra a la izquierda el tablero de pedidos facturados y a la derecha las opciones de envío: un camión por cada camión de la sede y "Cliente recoge en bodega". A cada opción se le agregan pedidos facturados de varios clientes | Nuevo |
| RF-SL-62 | **(11/10)** En la tarjeta de un pedido facturado se puede corregir el sector del cliente | Nuevo |
| RF-SL-63 | **(11/10)** Los pedidos facturados se arrastran del tablero a una opción de envío, entre opciones y de una opción de regreso al tablero | Nuevo |
| RF-SL-64 | **(11/10)** Si un producto del archivo no existe en el catálogo, el sistema lo notifica y pregunta si se agrega; si se agrega, solo pide el Peso de Conversión; si no, el pedido facturado que lo contiene no se carga | Nuevo |
| RF-SL-65 | **(11/10)** Si el cliente existe, se usan su nombre y su sector de la base. Si no existe, el sistema pregunta si se guarda y pide nombre y sector (de la lista o uno nuevo); si no se guarda, usa los datos del archivo | Nuevo |
| RF-SL-66 | **(11/10)** A cada usuario del picking se le marcan las sedes a las que tiene acceso; solo ve los datos de esas sedes | Nuevo |
| RF-SL-67 | **(11/10)** El tablero de pedidos facturados y lo asignado a cada opción de envío se guardan en la base de datos | Nuevo |
| RF-SL-68 | **(11/10)** Se puede eliminar un pedido facturado del tablero, o todos a la vez | Nuevo |

## Casos de uso

| Código | Nombre | Actor principal | Estado respecto del Documento 1 |
|---|---|---|---|
| CU-01 | Registrar pedido facturado | Usuario con permiso de Facturación | Modificado: **(29/09 y 11/10)** se carga el archivo .xlsx de Odoo al tablero de pedidos facturados; el facturador arrastra cada pedido facturado a un camión o a "Cliente recoge en bodega" y envía cada opción por separado; cada envío crea un pedido que puede tener varios clientes |
| CU-02 | Cancelar pedido | Usuario con permiso de Facturación | Modificado: **(11/10)** se cancela por opción de envío y sus pedidos facturados regresan al tablero; se registra en la bitácora |
| CU-03 | Preparar pedido | Usuario con permiso de Bodega | Modificado: marcado y orden compartidos en tiempo real; unidades con resto |
| CU-04 | Cerrar preparación del pedido | Usuario con permiso de Bodega | Vigente |
| CU-05 | Ejecutar ruta de entrega | Usuario con rol "Piloto" | Modificado: el recorrido se guarda al entregar; número de ruta por sede; **(11/10)** una fila por cliente |
| CU-06 | Registrar devolución | — | **Eliminado** (29/09, sin inventario) |
| CU-07 | Administrar contenido del sitio | Usuario con permisos del sitio | Modificado: **(29/09 y 11/10)** imágenes por dato, por industria y por producto; logotipo de Inquiserca; noticias con fotografía; mapas de las sedes |
| CU-08 | Consultar información pública | Visitante | Modificado: **(29/09 y 11/10)** cambios de Inicio, Quiénes somos, Industrias, catálogo, Productos Recomendados, pie de página y sedes mostradas |
| CU-09 | Enviar solicitud de contacto | Visitante | Modificado: **(29/09 y 11/10)** teléfono internacional, validaciones, listas territoriales opcionales y solo dos sedes |
| CU-10 | Consultar documentación interna | Usuario con permisos de documentación | Modificado: **(29/09)** permisos por usuario; búsqueda por lote, nombre y país de origen |
| CU-11 | Iniciar sesión y recuperar contraseña | Todos los usuarios | Modificado: usuario, no correo; **(11/10)** la contraseña la restablecen Gerencia o Soporte a solicitud |
| CU-12 | Administrar usuarios | Gerencia o Soporte | Modificado: **(29/09 y 11/10)** dos administraciones; rol de texto libre, permisos y sedes por casillas, eliminación de usuarios |
| CU-13 | Configurar catálogos | Usuario con permiso de Configuración | Modificado: productos (nombre y Peso de Conversión), clientes, sectores y camiones con CRUD completo |
| CU-14 | Consultar reportes y bitácora | Usuario con permiso de Reportes | Modificado: **(29/09 y 11/10)** contenido del prototipo aprobado, filtros por periodo y bitácora con inicios de sesión |
| CU-15 | Administrar documentos internos | Usuario con permiso de documentación | Modificado: **(29/09 y 11/10)** nombre del producto, país de origen y lote |
| CU-16 | Consultar existencias | — | **Eliminado** (29/09, sin inventario) |
| CU-17 | Registrar compra | — | **Eliminado** (29/09, sin inventario) |
| CU-18 | Registrar ajuste | — | **Eliminado** (29/09, sin inventario) |
| CU-19 | Registrar traslado entre sedes | — | **Eliminado** (29/09, sin inventario) |
| CU-20 | Editar movimiento de inventario | — | **Eliminado** (29/09, sin inventario) |
| CU-21 | Gestionar solicitud de contacto | Usuario con permiso de gestionar solicitudes | Nuevo (29/09): designar responsable, comentar y marcar el estado |
