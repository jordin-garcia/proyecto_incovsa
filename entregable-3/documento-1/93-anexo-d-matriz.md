\horizontal

# Anexo D. Matriz de trazabilidad {-}

La matriz cruza cada requerimiento de `specs/04-requerimientos-funcionales.md` y de `specs/15-requerimientos-no-funcionales.md` con su estado y con las tareas de `plan/tareas/` de esta rama que lo nombran en `requisitos`.

Una celda que dice Hecha cita tareas cuyo archivo dice `estado: hecha`. Eso no cierra la convergencia final. JG-17, Convergencia final y cierre del desarrollo, sigue en `estado: pendiente`. Si alguna tarea del código no está hecha, o si ninguna tarea nombra el código, la celda termina en TODO(CE-09): JG-17. Un código con estado Eliminado no se implementa.

Los casos de uso están en el capítulo 5 y en la última tabla de este anexo. Las reglas de negocio están en el capítulo 4 y en el anexo E. Las pruebas de cada requerimiento quedan en el Documento 6, que esta rama todavía no cierra (JG-18, estado pendiente). Esta matriz no inventa un caso de prueba.

## Sitio web

Tabla: Trazabilidad de los requerimientos del sitio {#tab:traza-sw}

| Código | Requerimiento | Estado | Implementación en esta rama |
| --- | --- | --- | --- |
| RF-SW-01 | El sitio presenta una página de inicio **informativa**, con información institucional y noticias. **(29/09)** Sin la sección "Catálogo informativo". **(13/10)** Misión con su texto a la izquierda y su imagen a la derecha; debajo, visión con su imagen a la izquierda y su texto a la derecha. **(15/10)** La sección de misión y visión va con el verde del pie de página | Modificado | Hecha: DM-02 |
| RF-SW-02 | El sitio presenta el apartado "Quiénes somos" con historia, misión, visión y valores. **(29/09)** Banner con transición entre los logotipos de INCOVSA e Inquiserca. **(13/10)** Misión y visión como en Inicio; valores como 5 imágenes, una por valor, sin texto (RF-SW-29). **(15/10)** "Misión y visión" y "A quién servimos" con el verde del pie de página; el bloque "INCOVSA e Inquiserca" alterna los dos logotipos como el banner | Modificado | Sin cerrar: DM-06 (pendiente). TODO(CE-09): JG-17 |
| RF-SW-03 | El sitio presenta las **9 industrias** atendidas, con navegación por industria. Cada industria muestra su descripción, sus imágenes y sus productos en texto. **(13/10)** La navegación es una barra lateral izquierda solo con íconos, que muestra el nombre de la industria al pasar el cursor | Modificado | Sin cerrar: DM-03 (pendiente), JG-09 (pendiente). TODO(CE-09): JG-17 |
| RF-SW-04 | El sitio presenta un catálogo informativo de productos por industria, sin precios ni comercio electrónico. Se muestran nombre, países de origen y presentación, y nunca el lote. Un producto puede pertenecer a varias industrias. La búsqueda del prototipo está aprobada | Modificado | Sin cerrar: DM-03 (pendiente), JG-09 (pendiente). TODO(CE-09): JG-17 |
| RF-SW-05 | El sitio presenta el detalle de cada producto: imágenes, nombre, descripción, presentación, países de origen e industrias | Modificado | Sin cerrar: DM-03 (pendiente). TODO(CE-09): JG-17 |
| RF-SW-06 | El sitio presenta un formulario de contacto para solicitudes, quejas o reclamos. **(13/10)** El contenido **solo se guarda en el sistema**; no se envía a ningún correo. **(15/10)** Al enviar, la página se desplaza hasta el aviso "Solicitud recibida" | Modificado | Sin cerrar: DM-08 (pendiente). TODO(CE-09): JG-17 |
| RF-SW-07 | El panel permite actualizar sin tocar código la información institucional, las imágenes, las industrias, el catálogo, las noticias y la información de contacto. Quién lo hace depende de sus permisos | Modificado | Hecha: DM-04. Sin cerrar: DM-05 (pendiente), DM-12 (pendiente), JG-09 (pendiente). TODO(CE-09): JG-17 |
| RF-SW-08 | El sitio y el panel son responsivos para escritorio, tableta y teléfono | Vigente | Hecha: DM-02, JG-05. Sin cerrar: DM-11 (pendiente), JG-16 (pendiente). TODO(CE-09): JG-17 |
| RF-SW-09 | El sitio presenta el acceso a Odoo (enlace), a la administración del sitio y al sistema de picking. **(13/10)** "Acceso personal" pide primero el usuario, valida que exista en alguno de los dos sistemas, deja elegir el sistema y pide la contraseña al final ([03](03-roles-y-accesos.md)). **(15/10)** El panel izquierdo de las pantallas de acceso muestra solo el título y su descripción, centrados, sin notas de roles | Modificado | Hecha: JG-06 |
| RF-SW-10 | El sitio tiene un área protegida de documentación interna (FT, HS, COA). Lo que cada usuario puede hacer depende de sus permisos. **(13/10)** Los documentos son enlaces de Google Drive | Modificado | Sin cerrar: DM-10 (pendiente). TODO(CE-09): JG-17 |
| RF-SW-11 | Para recuperar su contraseña, el usuario la solicita a Gerencia o a Soporte. **(13/10)** La restablecen escribiendo una nueva en el panel. No hay recuperación por correo | Modificado | Hecha: CE-04, JG-06 |
| RF-SW-12 | El panel tiene una bandeja con las solicitudes recibidas por el formulario de contacto | Vigente | Sin cerrar: DM-09 (pendiente). TODO(CE-09): JG-17 |
| RF-SW-13 | Gerencia y Soporte administran los usuarios del sitio desde el panel: crear, editar, eliminar, rol (texto libre) y permisos por casillas. **(13/10)** Al crear un usuario escriben su contraseña. El nombre de usuario puede ser el mismo que el de una cuenta del picking | Modificado | Hecha: CE-04 |
| RF-SW-14 | **(13/10)** La documentación interna se registra por producto documentado: nombre, país de origen (lista de países), lote (obligatorio, números y letras) y los enlaces de su ficha técnica, su hoja de seguridad y su certificado de análisis | Modificado | Sin cerrar: DM-10 (pendiente). TODO(CE-09): JG-17 |
| RF-SW-15 | Inicio, Quiénes somos, Noticias y Contacto llevan pie de página, con el logotipo de la cabecera. Industrias, Productos y el detalle de producto van sin pie de página | Nuevo | Hecha: DM-02. Sin cerrar: DM-03 (pendiente), DM-06 (pendiente), DM-07 (pendiente), DM-08 (pendiente). TODO(CE-09): JG-17 |
| RF-SW-16 | Las imágenes y tarjetas tienen una animación de aparición y desaparición al desplazarse. **(13/10)** En todas las páginas públicas (prototipo aprobado) | Nuevo | Hecha: DM-02. Sin cerrar: DM-06 (pendiente), DM-11 (pendiente). TODO(CE-09): JG-17 |
| RF-SW-17 | El detalle de producto incluye, al final, la sección **"Productos Recomendados"**, que siempre aparece | Nuevo | Sin cerrar: DM-03 (pendiente). TODO(CE-09): JG-17 |
| RF-SW-18 | Cada noticia tiene imágenes, título y texto, y se administra desde el panel. **(15/10)** Las noticias se eliminan en lugar de ocultarse; toda noticia guardada se publica. En la página de Noticias cada una ocupa todo el ancho y se muestra completa | Nuevo | Sin cerrar: DM-07 (pendiente). TODO(CE-09): JG-17 |
| RF-SW-19 | El formulario de contacto captura el teléfono con código de área por país y valida la estructura del correo y del teléfono. Tiene País (lista de todos los países) y, si el país es Guatemala, Departamento y Municipio (listas de Guatemala). La sede es obligatoria y solo ofrece Quetzaltenango y Guatemala. **(13/10)** País es obligatorio, y Departamento y Municipio lo son cuando el país es Guatemala | Nuevo | Sin cerrar: DM-08 (pendiente). TODO(CE-09): JG-17 |
| RF-SW-20 | La bandeja divide las solicitudes por motivo; cada solicitud tiene responsable, comentario y botones de estado Asignado, En proceso y Solucionado, sin estado inicial y sin restricción de orden. **(15/10)** El motivo se muestra con inicial mayúscula, el mensaje completo dentro de su cuadro, y el botón "Guardar comentario" pasa a "Editar comentario" cuando ya hay un comentario guardado | Nuevo | Sin cerrar: DM-09 (pendiente). TODO(CE-09): JG-17 |
| RF-SW-21 | Los productos documentados se buscan por lote, nombre del producto y país de origen. **(13/10)** Al hacer clic en la fila se abre una ventana con los documentos y solo las opciones que permiten los permisos; la tabla no tiene columnas Documento ni Tipo ni filtro por tipo, y sus acciones son solo editar y eliminar | Nuevo | Sin cerrar: DM-10 (pendiente). TODO(CE-09): JG-17 |
| RF-SW-22 | En Inicio, Quetzaltenango y Guatemala muestran sus datos y su mapa de Google Maps. Escuintla no se muestra en el sitio | Nuevo | Hecha: DM-02. Sin cerrar: DM-08 (pendiente). TODO(CE-09): JG-17 |
| RF-SW-23 | El panel permite cargar las imágenes del sitio. **(13/10)** En "Contenido institucional": la portada (hasta 5), el logotipo de INCOVSA, las imágenes de misión, visión e historia (hasta 5 cada una), las de los 5 valores y el logotipo de Inquiserca; sin la sección "Imágenes del sitio". También las imágenes de cada industria, producto público y noticia (hasta 5) | Modificado | Hecha: DM-04. Sin cerrar: DM-05 (pendiente). TODO(CE-09): JG-17 |
| RF-SW-24 | El logotipo "Transformamos INCOVSA" no se usa en el sitio público | Nuevo | Hecha: DM-02 |
| RF-SW-25 | El acceso al panel y a la documentación interna depende de los permisos asignados a cada usuario | Nuevo | Hecha: CE-04, JG-07. Sin cerrar: DM-05 (pendiente), DM-10 (pendiente). TODO(CE-09): JG-17 |
| RF-SW-26 | El menú lateral izquierdo del panel del sitio se reduce a íconos para ampliar el área de trabajo | Nuevo | Hecha: JG-05. Sin cerrar: DM-11 (pendiente). TODO(CE-09): JG-17 |
| RF-SW-27 | **(11/10)** Los textos del sitio no mencionan el número de sedes y bodegas, ni Escuintla, ni el inventario, ni los roles fijos ([05](05-sitio-web.md)) | Nuevo | Hecha: DM-02 |
| RF-SW-28 | **(13/10)** Cada área de imágenes del sitio público admite hasta 5 imágenes que rotan cada 5 segundos; con una sola imagen, queda fija. La rotación no debe hacer más lenta la carga (RNF-17) | Nuevo | Hecha: DM-02, DM-04. Sin cerrar: DM-11 (pendiente). TODO(CE-09): JG-17 |
| RF-SW-29 | **(13/10)** La sección de valores muestra solo 5 imágenes, una por valor, en una sola fila y sin texto, que se suben desde el panel | Nuevo | Hecha: DM-04. Sin cerrar: DM-06 (pendiente). TODO(CE-09): JG-17 |
| RF-SW-30 | **(13/10)** Al cerrar sesión en cualquiera de los dos sistemas, el usuario vuelve a la página de inicio del sitio | Nuevo | Hecha: JG-06 |
| RF-SW-31 | **(13/10)** El ícono de Solicitudes del menú lateral del panel muestra un indicador cuando hay solicitudes nuevas, también con el menú reducido | Nuevo | Sin cerrar: DM-09 (pendiente). TODO(CE-09): JG-17 |

## Sistema de picking

Tabla: Trazabilidad de los requerimientos del picking {#tab:traza-sl}

| Código | Requerimiento | Estado | Implementación en esta rama |
| --- | --- | --- | --- |
| RF-SL-01 | El sistema autentica con nombre de usuario y contraseña | Vigente | Hecha: JG-06 |
| RF-SL-02 | No hay selector de sede al iniciar sesión | Vigente | Hecha: JG-06 |
| RF-SL-03 | Gerencia y Soporte administran los usuarios del picking desde Configuración: contraseña (13/10), rol (texto libre), sedes y permisos por casillas | Modificado | Hecha: CE-03 |
| RF-SL-04 | **(13/10)** Desde Configuración se ven, crean, editan y eliminan los **camiones**. Ya no hay productos, clientes ni sectores | Modificado | Hecha: CE-02 |
| RF-SL-05 | **(13/10)** El facturador decide si cada pedido facturado va en un camión o lo recoge el cliente, arrastrándolo a una de las dos opciones de envío | Modificado | Hecha: JC-04 |
| RF-SL-06 | **(13/10)** La opción "Envío por camión" tiene listas desplegables para elegir el camión y el piloto de la sede | Modificado | Hecha: JC-04 |
| RF-SL-07 | **(13/10)** Facturación muestra cada pedido facturado del tablero en una tarjeta de todo el ancho: número, cliente, sector, total en kg y productos con su cantidad, sin asa de arrastre ni "x" | Modificado | Hecha: JC-03 |
| RF-SL-08 | La tabla empieza vacía y cada clic en el botón "+" agrega una fila | **Eliminado** (29/09) | No aplica. El código se conserva con estado Eliminado. |
| RF-SL-09 | Búsqueda de clientes en tiempo real al capturar | **Eliminado** (29/09) | No aplica. El código se conserva con estado Eliminado. |
| RF-SL-10 | Búsqueda de productos en tiempo real al capturar | **Eliminado** (29/09) | No aplica. El código se conserva con estado Eliminado. |
| RF-SL-11 | Agregar desde Facturación los productos y clientes del archivo que no existen en la base | **Eliminado** (13/10): ya no hay catálogos | No aplica. El código se conserva con estado Eliminado. |
| RF-SL-12 | Corregir el sector del cliente en el tablero | **Eliminado** (13/10) | No aplica. El código se conserva con estado Eliminado. |
| RF-SL-13 | Cada tarjeta muestra el total en kg del pedido facturado. **(13/10)** Cada pedido facturado dentro de una opción de envío también muestra su total en kg, y cada opción el total de sus pedidos facturados | Modificado | Hecha: JC-03, JC-04 |
| RF-SL-14 | La opción "Envío por camión" lleva el control del peso frente a la capacidad del camión elegido y muestra una alerta de sobrepeso que **no bloquea** | Modificado | Hecha: JC-04 |
| RF-SL-15 | Validación de existencias al agregar cada fila | **Eliminado** (29/09) | No aplica. El código se conserva con estado Eliminado. |
| RF-SL-16 | **(13/10)** Cada opción de envío tiene su botón "Enviar a Bodega", que crea una **ruta** (camión) o un **pedido** (cliente recoge) con sus pedidos facturados, en su orden, con su número del día, su fecha y hora programadas y su fecha de creación, y lo manda a Bodega En Preparación | Modificado | Hecha: JC-04. Sin cerrar: JG-09 (pendiente), JG-14 (pendiente). TODO(CE-09): JG-17 |
| RF-SL-17 | Cada opción de envío tiene su botón "Cancelar", que regresa sus pedidos facturados al tablero. La bitácora registra la cancelación | Modificado | Hecha: JC-04 |
| RF-SL-18 | No hay borradores. Una ruta o un pedido enviado a bodega no se puede editar ni cancelar | Vigente | Hecha: JC-04 |
| RF-SL-19 | Bodega muestra las rutas y los pedidos por preparar en el orden en que llegan de Facturación | Vigente | Hecha: JM-03 |
| RF-SL-20 | En Bodega se pueden reordenar las rutas, los pedidos y sus filas. El orden se comparte **en tiempo real** y **no queda en el historial**. **(13/10)** Cada ruta o pedido tiene una opción para ordenar sus filas de mayor a menor peso | Modificado | Hecha: JM-03. Sin cerrar: JG-10 (pendiente), JM-04 (pendiente). TODO(CE-09): JG-17 |
| RF-SL-21 | Cada ruta o pedido en Bodega tiene una tabla con Producto, Lote, Cantidad y Unidades. **(13/10)** Una fila por producto, lote y Peso de Conversión, con la suma de los clientes; el lote se resalta. **(15/10)** Lote en verde (en gris en el modo oscuro del tablero) | Modificado | Hecha: JM-03. Sin cerrar: JG-09 (pendiente). TODO(CE-09): JG-17 |
| RF-SL-22 | Las unidades se calculan con RN-01, con el Peso de Conversión de la línea, y se muestran como "N unidades + R kg" | Modificado | Hecha: JM-02, JM-03. Sin cerrar: JG-09 (pendiente). TODO(CE-09): JG-17 |
| RF-SL-23 | Cada fila tiene una casilla para marcar y desmarcar lo que ya se sacó; el cambio se ve **al instante en todas las pantallas**. **(13/10)** Hay una opción para marcar o desmarcar todas las filas | Modificado | Hecha: JM-03. Sin cerrar: JG-09 (pendiente), JG-10 (pendiente), JM-04 (pendiente). TODO(CE-09): JG-17 |
| RF-SL-24 | El botón "Ruta Despachada" o "Pedido Despachado" solo se habilita cuando todas las filas están marcadas | Modificado | Hecha: JM-03. Sin cerrar: JG-09 (pendiente), JG-14 (pendiente). TODO(CE-09): JG-17 |
| RF-SL-25 | Bodega se lee bien proyectado en una TV y se puede usar en una tableta | Vigente | Sin cerrar: JM-05 (pendiente). TODO(CE-09): JG-17 |
| RF-SL-26 | Los usuarios con rol "Piloto" solo ven las rutas que tienen asignadas | Modificado | Sin cerrar: JM-06 (pendiente). TODO(CE-09): JG-17 |
| RF-SL-27 | La tabla de Ruta tiene las columnas Cliente, Sector y Total (kg), con una sola fila por cliente | Modificado | Sin cerrar: JM-06 (pendiente). TODO(CE-09): JG-17 |
| RF-SL-28 | El piloto puede reordenar las filas durante la ruta. El orden que tienen al pulsar "Ruta Entregada" se guarda como recorrido | Modificado | Sin cerrar: JM-06 (pendiente). TODO(CE-09): JG-17 |
| RF-SL-29 | El botón "Ruta Entregada" registra la entrega completa a todos los clientes de la ruta | Modificado | Sin cerrar: JG-14 (pendiente), JM-06 (pendiente). TODO(CE-09): JG-17 |
| RF-SL-30 | **(13/10)** Cada ruta registra su número (correlativo diario por sede), su fecha (la del envío a bodega), su fecha y hora programadas, su camión y su piloto | Modificado | Sin cerrar: JM-06 (pendiente). TODO(CE-09): JG-17 |
| RF-SL-31 | Editar la cantidad del registro de ruta | **Eliminado** | No aplica. El código se conserva con estado Eliminado. |
| RF-SL-32 | Motivo obligatorio al editar la ruta | **Eliminado** | No aplica. El código se conserva con estado Eliminado. |
| RF-SL-33 | Reingreso al inventario al editar la ruta | **Eliminado** | No aplica. El código se conserva con estado Eliminado. |
| RF-SL-34 | Estado "Editado" al editar la ruta | **Eliminado** | No aplica. El código se conserva con estado Eliminado. |
| RF-SL-35 | El sistema maneja los estados de la ruta y del pedido y sus transiciones según RN-11 | Vigente (RN-11 modificada) | Hecha: JM-03 |
| RF-SL-36 | La bitácora registra las operaciones de los usuarios, incluidos los inicios de sesión, y se consulta en la pestaña "Bitácora" de Reportes | Modificado | Hecha: JG-06. Sin cerrar: JC-06 (pendiente). TODO(CE-09): JG-17 |
| RF-SL-37 | El sistema guarda el registro histórico de las rutas y lo muestra en Reportes. **(13/10)** Es el único lugar donde se consulta | Modificado | Sin cerrar: JC-06 (pendiente), JG-14 (pendiente). TODO(CE-09): JG-17 |
| RF-SL-38 | Módulo de Reportes: despacho por producto con indicadores y exportación a Excel y PDF, rutas realizadas y bitácora. **(16/10)** "Rutas realizadas" y "Bitácora" también se exportan a Excel y PDF | Modificado | Sin cerrar: JC-06 (pendiente), JC-07 (pendiente), JG-14 (pendiente). TODO(CE-09): JG-17 |
| RF-SL-39 | Acceso al módulo de Inventario | **Eliminado** (29/09) | No aplica. El código se conserva con estado Eliminado. |
| RF-SL-40 | Consulta de existencias por sede | **Eliminado** (29/09) | No aplica. El código se conserva con estado Eliminado. |
| RF-SL-41 | Registro de compras | **Eliminado** (29/09) | No aplica. El código se conserva con estado Eliminado. |
| RF-SL-42 | Registro de ajustes | **Eliminado** (29/09) | No aplica. El código se conserva con estado Eliminado. |
| RF-SL-43 | Registro de traslados entre sedes | **Eliminado** (29/09) | No aplica. El código se conserva con estado Eliminado. |
| RF-SL-44 | Registro de devoluciones | **Eliminado** (29/09) | No aplica. El código se conserva con estado Eliminado. |
| RF-SL-45 | Marca "Con devolución" | **Eliminado** (29/09) | No aplica. El código se conserva con estado Eliminado. |
| RF-SL-46 | Existencia nunca negativa | **Eliminado** (29/09) | No aplica. El código se conserva con estado Eliminado. |
| RF-SL-47 | Registro de cada movimiento de inventario | **Eliminado** (29/09) | No aplica. El código se conserva con estado Eliminado. |
| RF-SL-48 | Gerencia y Soporte restablecen la contraseña de los usuarios del picking que lo soliciten, desde Configuración. **(13/10)** Escribiendo una nueva | Modificado | Hecha: CE-03 |
| RF-SL-49 | Edición de movimientos de inventario | **Eliminado** (29/09) | No aplica. El código se conserva con estado Eliminado. |
| RF-SL-50 | Facturación registra los pedidos **cargando un archivo .xlsx** exportado de Odoo, con la estructura de `Data Odo Para Picking.xlsx`. Un archivo trae una o varias referencias, de una sola bodega | Nuevo | Hecha: JC-02, JC-03, JG-04. Sin cerrar: JG-09 (pendiente). TODO(CE-09): JG-17 |
| RF-SL-51 | El archivo se lee de arriba hacia abajo. Una fila sin Referencia ni Contacto pertenece a la última referencia y contacto de arriba. Solo se cargan las referencias en estado "Hecho" | Nuevo | Hecha: JC-02, JG-04 |
| RF-SL-52 | El número de cada pedido facturado es el tercer segmento de la Referencia. El primer segmento indica la bodega (`XE`, `GT` o `ESC`). **(13/10)** La ruta o el pedido que se envía a Bodega se identifica con su número del día | Nuevo | Hecha: JC-02 |
| RF-SL-53 | Cada referencia es un pedido facturado de un solo cliente. **(13/10)** Se toman tal como vienen el cliente (`Contacto`), el sector (`Contacto/Ciudad`), el producto (`Movimientos de stock/Producto`), el Peso de Conversión (`Movimientos de stock/Producto/Peso`), el lote (`Movimientos de stock/Números de serie`) y la cantidad en kg (`Movimientos de stock/Cantidad hecha`), sin validarlos contra ningún catálogo | Nuevo | Hecha: JC-02, JG-04 |
| RF-SL-54 | **(13/10)** La conversión usa el Peso de Conversión de la columna `Movimientos de stock/Producto/Peso` de cada línea. Reemplaza a "no se usa la columna de peso" (29/09) | Modificado | Hecha: JC-02 |
| RF-SL-55 | El acceso a cada módulo del picking depende de los permisos asignados a cada usuario, por módulo y por acción | Nuevo | Hecha: JG-07 |
| RF-SL-56 | Gerencia y Soporte asignan a cada usuario un rol (texto libre) y le agregan, editan o revocan permisos puntuales con casillas | Nuevo | Hecha: CE-03 |
| RF-SL-57 | Gerencia y Soporte pueden eliminar usuarios. La eliminación es lógica y conserva su historial | Nuevo | Hecha: CE-03 |
| RF-SL-58 | El tablero en pantalla completa ofrece "Modo claro" y "Modo oscuro" | Nuevo | Sin cerrar: JM-05 (pendiente). TODO(CE-09): JG-17 |
| RF-SL-59 | Reportes filtra por periodo: diario, semanal (lunes a domingo), mensual, anual o rango de fechas, en las pestañas Despacho, Rutas realizadas y **(13/10)** Bitácora. **(15/10)** Las fechas del filtro se escriben con el teclado (dd/mm/aaaa) o se eligen en el calendario | Nuevo | Sin cerrar: JC-06 (pendiente). TODO(CE-09): JG-17 |
| RF-SL-60 | El menú lateral izquierdo del picking se reduce a íconos | Nuevo | Hecha: JG-05 |
| RF-SL-61 | La pantalla de Facturación muestra a la izquierda el tablero de pedidos facturados y a la derecha las opciones de envío. **(13/10)** Solo dos opciones ("Envío por camión" y "Cliente recoge en bodega"), y el texto de instrucciones es corto y va a la par del título. **(15/10)** Seleccionar no mueve el tablero, y la tarjeta seleccionada muestra solo su número y su peso total. Todos los módulos de los dos sistemas llevan la instrucción breve a la par del título | Nuevo | Hecha: JC-03, JG-05 |
| RF-SL-62 | En la tarjeta de un pedido facturado se puede corregir el sector del cliente | **Eliminado** (13/10) | No aplica. El código se conserva con estado Eliminado. |
| RF-SL-63 | Los pedidos facturados se arrastran del tablero a una opción de envío, entre opciones y de una opción al tablero. **(13/10)** También dentro de una opción, para ordenarlos | Nuevo | Hecha: JC-04 |
| RF-SL-64 | Si un producto del archivo no existe en el catálogo, el sistema pregunta si se agrega | **Eliminado** (13/10) | No aplica. El código se conserva con estado Eliminado. |
| RF-SL-65 | Si el cliente del archivo no existe, el sistema pregunta si se guarda | **Eliminado** (13/10) | No aplica. El código se conserva con estado Eliminado. |
| RF-SL-66 | A cada usuario del picking se le marcan las sedes a las que tiene acceso; solo ve los datos de esas sedes | Nuevo | Hecha: CE-03, JG-07 |
| RF-SL-67 | El tablero de pedidos facturados y lo asignado a cada opción de envío se guardan en la base de datos | Nuevo | Hecha: JC-03. Sin cerrar: JC-05 (pendiente). TODO(CE-09): JG-17 |
| RF-SL-68 | Se pueden eliminar del tablero uno, **(13/10)** varios o todos los pedidos facturados, seleccionándolos | Nuevo | Hecha: JC-03 |
| RF-SL-69 | **(13/10)** En el tablero se pueden seleccionar uno, varios o todos los pedidos facturados ("Seleccionar todos") y arrastrarlos juntos a una opción de envío | Nuevo | Hecha: JC-03 |
| RF-SL-70 | **(13/10)** Cada opción de envío tiene la fecha y la hora programadas de envío o despacho, obligatorias (14/10), que se guardan y se muestran en Bodega. **(15/10)** La fecha (dd/mm/aaaa) y la hora (HH:MM, 24 horas) se escriben con el teclado o se eligen con el calendario o el reloj, que se abren debajo del campo | Nuevo | Hecha: JC-04, JG-05 |
| RF-SL-71 | **(13/10)** El facturador ordena los pedidos facturados dentro de cada opción de envío; el orden se guarda y con ese orden pasan a Bodega y a Ruta | Nuevo | Hecha: JC-04 |
| RF-SL-72 | **(13/10)** Lo que sale de "Envío por camión" se llama **ruta** y lo que sale de "Cliente recoge en bodega" se llama **pedido**. Rutas y pedidos se numeran por separado, cada día desde 1, en cada sede | Nuevo | Hecha: JC-04 |
| RF-SL-73 | **(14/10)** Si una línea trae el Peso de Conversión vacío, no numérico o menor o igual a 0, su pedido facturado no se carga y se avisa en el resumen de la carga | Nuevo | Hecha: JC-02 |
| RF-SL-74 | **(13/10)** Cada ruta y cada pedido de Bodega tiene un botón "Detalle de Ruta" o "Detalle de Pedido" que muestra en una ventana todos los datos del archivo de sus pedidos facturados. **(15/10)** La ventana muestra completos todos los pedidos facturados y sus líneas | Nuevo | Hecha: JM-03 |
| RF-SL-75 | **(13/10)** Bodega muestra la fecha y la hora programadas de cada ruta o pedido, y no la hora en que se envió de Facturación | Nuevo | Hecha: JM-03 |
| RF-SL-76 | **(13/10)** El módulo de Bodega no muestra en la barra lateral el contador de rutas y pedidos | Nuevo | Hecha: JM-03 |
| RF-SL-77 | **(13/10)** Cuando el tablero reparte las filas en dos columnas, las numera de arriba hacia abajo, primero la columna izquierda y después la derecha | Nuevo | Sin cerrar: JM-05 (pendiente). TODO(CE-09): JG-17 |
| RF-SL-78 | **(13/10)** El módulo de Ruta muestra siempre las rutas de la más reciente a la más antigua | Nuevo | Sin cerrar: JM-06 (pendiente). TODO(CE-09): JG-17 |
| RF-SL-79 | **(13/10)** El módulo de Ruta no tiene sección de registro histórico; las rutas entregadas se consultan en Reportes | Nuevo | Sin cerrar: JM-06 (pendiente). TODO(CE-09): JG-17 |
| RF-SL-80 | **(13/10)** El sistema guarda automáticamente la fecha y la hora exactas en que se guarda cada registro (RN-57) | Nuevo | TODO(CE-09): JG-17 |

## Requerimientos no funcionales

Tabla: Trazabilidad de los requerimientos no funcionales {#tab:traza-rnf}

| Código | Requerimiento | Estado | Implementación en esta rama |
| --- | --- | --- | --- |
| RNF-01 | Interfaz responsiva en escritorio, tableta y teléfono. La contraparte lo reiteró el 29/09 para el sitio | Vigente | Hecha: DM-02, JG-05. Sin cerrar: DM-11 (pendiente), JG-16 (pendiente). TODO(CE-09): JG-17 |
| RNF-02 | Bodega se lee bien proyectado en una TV y se usa con facilidad en tableta: cantidades y productos bien visibles, estados claros, pocos pasos. Debe cumplirse en modo claro y en modo oscuro (29/09) | Vigente | Sin cerrar: JG-16 (pendiente), JM-05 (pendiente). TODO(CE-09): JG-17 |
| RNF-03 | Contraseñas guardadas con un algoritmo de cifrado unidireccional, nunca en texto plano | Vigente | Hecha: JG-06. Sin cerrar: JG-15 (pendiente). TODO(CE-09): JG-17 |
| RNF-04 | Todas las rutas del panel, de la documentación interna y del picking están protegidas. Cada usuario solo entra a los módulos y hace las acciones que permiten **sus permisos** (29/09), y ve los datos de las sedes que tiene asignadas (11/10). **(12/10)** Los permisos y la sede se verifican **en el servidor en cada operación**, no solo al entrar a una página ([16-arquitectura-y-tecnologia.md](16-arquitectura-y-tecnologia.md), "Seguridad") | Modificado | Hecha: JG-07. Sin cerrar: JG-15 (pendiente). TODO(CE-09): JG-17 |
| RNF-05 | Toda entrada de formulario se valida en el navegador y en el servidor. Incluye el archivo .xlsx de Odoo, que se valida en el servidor antes de mostrar sus líneas (29/09). **(12/10)** Los archivos subidos (.xlsx e imágenes) se validan por su contenido, no solo por la extensión. **(13/10)** Los enlaces de la documentación interna se validan como direcciones de Google Drive; el sistema ya no recibe PDF | Modificado | Hecha: DM-04, JC-02. Sin cerrar: DM-08 (pendiente), JG-11 (pendiente), JG-15 (pendiente). TODO(CE-09): JG-17 |
| RNF-06 | El envío de una ruta o un pedido a bodega es transaccional: la ruta o el pedido, su número del día, sus líneas de preparación, sus clientes (en una ruta), su estado y su registro de bitácora se guardan completos o no se guardan. Desde el 29/09 ya no hay operaciones de existencias. **(15/10)** Texto ajustado a la terminología del 13/10: la ruta ya no es una entidad aparte del pedido | Modificado | Hecha: JC-04, JG-03. Sin cerrar: JG-14 (pendiente). TODO(CE-09): JG-17 |
| RNF-07 | Escalable y modificable por un desarrollador externo, con estructura y convenciones documentadas | Vigente | Hecha: JG-02. Sin cerrar: CE-11 (pendiente). TODO(CE-09): JG-17 |
| RNF-08 | Contraste, etiquetas en formularios y textos alternativos en imágenes | Vigente | Hecha: DM-02, JG-05, JM-08. Sin cerrar: DM-11 (pendiente), JG-16 (pendiente). TODO(CE-09): JG-17 |
| RNF-09 | Procedimiento documentado y probado de respaldo y restauración de la base de datos y la configuración. Las imágenes están en R2. **(12/10)** Los respaldos son automáticos. **(13/10)** Ya no hay PDF en el servidor: los documentos técnicos están en el Google Drive de la empresa, que los respalda | Modificado | Hecha: CE-05, CE-07. Sin cerrar: CE-08 (bloqueada), CE-10 (pendiente), CE-11 (pendiente). TODO(CE-09): JG-17 |
| RNF-10 | El repositorio no contiene credenciales, claves, datos reales de producción ni datos personales. **(16/10)** Única excepción: el prototipo de simulación armado, que contiene nombres reales de productos y de clientes de la empresa y se sube porque el repositorio es privado ([16](16-arquitectura-y-tecnologia.md), decisión 63) | Modificado | Hecha: CE-05, JG-02, JG-04. Sin cerrar: CE-08 (bloqueada), CE-12 (pendiente), JG-11 (pendiente). TODO(CE-09): JG-17 |
| RNF-11 | Funciona en los navegadores de uso corriente en los equipos de la empresa. Cuáles son, está pendiente (P-38) | Vigente | Sin cerrar: JG-16 (pendiente). TODO(CE-09): JG-17 |
| RNF-12 | Se despliega bajo el dominio de la empresa con HTTPS | Vigente | Hecha: CE-05, CE-06. Sin cerrar: CE-08 (bloqueada), CE-10 (pendiente), JG-11 (pendiente), JG-19 (pendiente). TODO(CE-09): JG-17 |
| RNF-13 | En Bodega, el marcado de filas y el orden de prioridad se ven **al instante** en todas las pantallas de la sede, sin recargar | Nuevo | Hecha: JG-07. Sin cerrar: JC-05 (pendiente), JG-10 (pendiente), JM-04 (pendiente). TODO(CE-09): JG-17 |
| RNF-14 | Ruta se usa con comodidad en teléfono y tableta | Nuevo | Sin cerrar: JG-16 (pendiente), JM-06 (pendiente). TODO(CE-09): JG-17 |
| RNF-15 | **(12/10)** Los intentos de inicio de sesión se limitan: después de varios intentos fallidos seguidos, se bloquea temporalmente el acceso. El mensaje de la contraseña incorrecta no dice si lo que falló es el usuario o la contraseña. **(13/10 y 14/10)** El paso del usuario del acceso personal sí dice si el usuario existe, por pedido de la contraparte; esas consultas cuentan en el límite de intentos por dirección IP y quedan en la bitácora ([03](03-roles-y-accesos.md)) | Modificado | Hecha: JG-06. Sin cerrar: JG-15 (pendiente). TODO(CE-09): JG-17 |
| RNF-16 | **(12/10)** La aplicación envía cabeceras de seguridad (Content-Security-Policy, HSTS, nosniff, Referrer-Policy y protección contra inserción en marcos) y mantiene sus dependencias al día con los parches de seguridad, revisadas en cada pull request | Nuevo | Hecha: CE-05, JG-02, JG-08. Sin cerrar: CE-10 (pendiente), JG-11 (pendiente), JG-15 (pendiente). TODO(CE-09): JG-17 |
| RNF-17 | **(13/10)** Las galerías de imágenes que rotan no hacen más lenta la carga de las páginas: al abrir una página solo se descarga la primera imagen de cada galería y las demás después. Se comprueba con pruebas de rendimiento (Documento 6) que la carga inicial con galerías de 5 imágenes no tarda más que con galerías de una | Nuevo | Hecha: DM-02. Sin cerrar: DM-11 (pendiente), JG-16 (pendiente). TODO(CE-09): JG-17 |
| RNF-18 | **(13/10)** Cada registro guarda automáticamente la fecha y la hora exactas en que se guardó en la base de datos (RN-57) | Nuevo | Hecha: JG-03 |

## Casos de uso

Tabla: Trazabilidad de los casos de uso {#tab:traza-cu}

| Código | Caso de uso | Estado | Implementación en esta rama |
| --- | --- | --- | --- |
| CU-01 | Registrar pedido facturado y enviarlo a bodega | Modificado: **(29/09, 11/10 y 13/10)** se carga el archivo .xlsx de Odoo al tablero, tal como viene; el facturador selecciona y arrastra los pedidos facturados a "Envío por camión" o "Cliente recoge en bodega", los ordena, escribe la fecha y hora programadas y envía la opción; cada envío crea una ruta o un pedido con su número del día | Hecha: JC-03, JC-04 |
| CU-02 | Cancelar opción de envío | Modificado: sus pedidos facturados regresan al tablero; se registra en la bitácora | Hecha: JC-04 |
| CU-03 | Preparar ruta o pedido | Modificado: marcado (también todo de una vez), orden y orden por peso compartidos en tiempo real; filas por producto y lote; detalle de ruta o de pedido | Hecha: JM-03. Sin cerrar: JM-04 (pendiente). TODO(CE-09): JG-17 |
| CU-04 | Cerrar preparación | Vigente ("Ruta Despachada" o "Pedido Despachado") | Hecha: JM-03 |
| CU-05 | Ejecutar ruta de entrega | Modificado: el recorrido se guarda al entregar; una fila por cliente; rutas de la más reciente a la más antigua | Sin cerrar: JM-06 (pendiente). TODO(CE-09): JG-17 |
| CU-06 | Registrar devolución | **Eliminado** (29/09) | No aplica. El código se conserva con estado Eliminado. |
| CU-07 | Administrar contenido del sitio | Modificado: **(13/10)** galerías de hasta 5 imágenes, portada y logotipo de INCOVSA, 5 imágenes de valores, logotipo de Inquiserca | Hecha: DM-04. Sin cerrar: DM-05 (pendiente), DM-07 (pendiente). TODO(CE-09): JG-17 |
| CU-08 | Consultar información pública | Modificado: **(13/10)** misión y visión con texto e imagen, valores con imágenes, galerías que rotan, menú de industrias con íconos | Hecha: DM-02. Sin cerrar: DM-03 (pendiente), DM-06 (pendiente), DM-07 (pendiente). TODO(CE-09): JG-17 |
| CU-09 | Enviar solicitud de contacto | Modificado: **(13/10)** país obligatorio; la solicitud solo se guarda en el sistema | Sin cerrar: DM-08 (pendiente). TODO(CE-09): JG-17 |
| CU-10 | Consultar documentación interna | Modificado: **(13/10)** clic en el producto documentado y ventana con ver y descargar según permisos | Sin cerrar: DM-10 (pendiente). TODO(CE-09): JG-17 |
| CU-11 | Iniciar sesión y recuperar contraseña | Modificado: **(13/10)** usuario, sistema y contraseña; cierre de sesión al inicio del sitio; la contraseña la restablecen Gerencia o Soporte | Hecha: JG-06 |
| CU-12 | Administrar usuarios | Modificado: **(13/10)** contraseña al crear; el mismo nombre de usuario en los dos sistemas | Hecha: CE-03, CE-04 |
| CU-13 | Configurar camiones | Modificado: **(13/10)** solo camiones; ya no hay productos, clientes ni sectores | Hecha: CE-02 |
| CU-14 | Consultar reportes y bitácora | Modificado: filtros por periodo, también en la bitácora | Sin cerrar: JC-06 (pendiente), JC-07 (pendiente). TODO(CE-09): JG-17 |
| CU-15 | Administrar productos documentados | Modificado: **(13/10)** nombre, país, lote obligatorio y enlaces de Google Drive | Sin cerrar: DM-10 (pendiente). TODO(CE-09): JG-17 |
| CU-16 | Consultar existencias | **Eliminado** (29/09) | No aplica. El código se conserva con estado Eliminado. |
| CU-17 | Registrar compra | **Eliminado** (29/09) | No aplica. El código se conserva con estado Eliminado. |
| CU-18 | Registrar ajuste | **Eliminado** (29/09) | No aplica. El código se conserva con estado Eliminado. |
| CU-19 | Registrar traslado entre sedes | **Eliminado** (29/09) | No aplica. El código se conserva con estado Eliminado. |
| CU-20 | Editar movimiento de inventario | **Eliminado** (29/09) | No aplica. El código se conserva con estado Eliminado. |
| CU-21 | Gestionar solicitud de contacto | Nuevo (29/09): designar responsable, comentar y marcar el estado. **(13/10)** Aviso de solicitudes nuevas en el menú | Sin cerrar: DM-09 (pendiente). TODO(CE-09): JG-17 |
