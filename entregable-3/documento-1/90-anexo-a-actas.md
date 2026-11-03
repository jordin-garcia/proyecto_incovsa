# Anexo A. Actas de reuniones {-}

Este anexo reúne las actas de las cinco reuniones con la contraparte de INCOVSA. Las redactó el equipo a partir de las notas que tomó Daniela Marín en cada reunión. Las notas originales y las capturas se guardan en la carpeta del equipo en Drive.

## Reunión 1, 27 de agosto de 2026 {-}

Tabla: Datos de la reunión 1 {#tab:reunion-1}

| Dato | Detalle |
|---|---|
| Fecha | Jueves 27 de agosto de 2026 |
| Horario previsto | 3:00 a 4:00 p. m. |
| Hora de inicio y de cierre | 3:10 p. m. a 4:15 p. m. |
| Modalidad | Virtual, por Google Meet |
| Participantes por el equipo | Jordin García, Carlos Hugo Escobar, Daniela Marín, José Daniel Cifuentes y Josué Menéndez |
| Participantes por INCOVSA | Ing. William Ambrossio, encargado del área de tecnología, e Ing. Luis Orozco, representante de la gerencia |
| Responsable de las notas | Daniela Marín |

### Temas tratados {-}

- Presentación del equipo de trabajo, sus expectativas sobre el proyecto y las herramientas utilizadas hasta la fecha.
- Presentación de la contraparte de INCOVSA y exposición de la actividad de la empresa.
- Evaluación preliminar de las posibles propuestas de proyecto, entre ellas un sitio web corporativo y un sistema de control logístico de bodega.

### Acuerdos {-}

- El Ing. William Ambrossio redactará las propuestas posibles de implementar y las enviará al equipo en los días siguientes.
- El equipo evaluará las propuestas recibidas y, con el visto bueno del docente del curso, definirá cuál es la más viable.

## Reunión 2, 4 de septiembre de 2026 {-}

Tabla: Datos de la reunión 2 {#tab:reunion-2}

| Dato | Detalle |
|---|---|
| Fecha | Viernes 4 de septiembre de 2026 |
| Horario previsto | 6:00 a 7:30 p. m. |
| Hora de inicio y de cierre | 6:22 a 8:12 p. m. |
| Modalidad | Virtual, por Google Meet |
| Participantes por el equipo | Jordin García, Carlos Hugo Escobar, Daniela Marín, José Daniel Cifuentes y Josué Menéndez |
| Participantes por INCOVSA | Ing. William Ambrossio |
| Responsable de las notas | Daniela Marín |

### Temas tratados {-}

- Aprobación de la propuesta de proyecto.
- Actividad de la empresa, sus mercados industrial y artesanal, y las empresas del grupo con las que se trabajará.
- Sitio web corporativo: textos e imágenes, diseño e interacción, catálogo informativo de productos y criterios de mantenimiento.
- Documentación de productos: ficha técnica, hoja de seguridad y certificado de análisis, con acceso según el rol del usuario.
- Acceso al sistema desde el propio sitio, con apartados restringidos por rol.
- Roles, sedes y empresas: cada sede consulta únicamente la información que le corresponde.
- Productos: medidas, presentaciones, lote, SKU y manejo de existencias con lógica FIFO.
- Picking: proceso actual en hoja de cálculo, requisitos mínimos, capacidad de los vehículos y armado de rutas.
- ERP Odoo e información que la empresa proporcionará.
- Dominio y hosting de la empresa.

### Acuerdos {-}

- Se aprueba la primera propuesta, el sistema de control logístico de bodega junto con el sitio web corporativo, y se descarta la segunda.
- La empresa redactará los textos de historia, misión, visión y valores, y los enviará a más tardar la semana siguiente, junto con las imágenes.
- La empresa proporcionará la información de clientes, productos y vehículos.
- La empresa cubre el pago del hosting y del dominio.
- El equipo queda con libertad para definir el diseño visual y la interacción del sitio.
- El sistema debe ser escalable y fácil de mantener a código.

## Reunión 3, 17 de septiembre de 2026 {-}

Tabla: Datos de la reunión 3 {#tab:reunion-3}

| Dato | Detalle |
|---|---|
| Fecha | Jueves 17 de septiembre de 2026 |
| Horario previsto | 4:00 a 5:30 p. m. |
| Hora de inicio y de cierre | 4:30 a 7:00 p. m. |
| Modalidad | Presencial, en las instalaciones de la empresa |
| Participantes por el equipo | Jordin García, Carlos Hugo Escobar, Daniela Marín, José Daniel Cifuentes y Josué Menéndez |
| Participantes por INCOVSA | Ing. William Ambrossio |
| Responsable de las notas | Daniela Marín |

### Temas tratados {-}

- Accesos del sitio: tres botones de inicio de sesión, uno hacia Odoo, uno hacia la administración del sitio y uno hacia el sistema de picking, este último con selección de la sede.
- Roles de la administración del sitio: Gerencia, Administrativo, Operativo y Vista general.
- Roles del sistema de picking: Gerencia, Soporte IT, Operativo Facturador, Operativo Bodega y Operativo Piloto.
- Módulo de Facturación: registro de las facturas ya emitidas, tipo de pedido, tabla de cliente, SKU, producto y cantidad, suma automática del total, alerta al alcanzar la capacidad del camión, edición y reordenamiento de las filas, envío del pedido a bodega o cancelación, y registro de los estados del pedido.
- Módulo de Bodega: pedidos ordenados según se reciben, agrupación de las cantidades por producto y conversión de kilogramos a unidades de despacho.
- Módulo de Ruta: tabla de cliente, sector y total, con reordenamiento de las entregas y cierre del pedido entregado.
- Bitácora de operaciones, registro histórico de las rutas y manejo de devoluciones.

### Acuerdos {-}

- El sistema de picking se desarrollará con tres módulos: Facturación, Bodega y Ruta.
- La empresa proporcionará las unidades de venta de cada producto para realizar la conversión, y el sector al que pertenece cada cliente.
- La capacidad de los camiones de la sede de Quetzaltenango es de 3.4 toneladas en dos de ellos y de 6 toneladas en el tercero.
- Se guardarán registros de todas las operaciones de los usuarios y de todas las rutas realizadas.
- Las devoluciones se registran editando el registro de la ruta, únicamente con el rol de Gerencia o de Soporte IT.

## Reunión 4, 29 de septiembre de 2026 {-}

Tabla: Datos de la reunión 4 {#tab:reunion-4}

| Dato | Detalle |
|---|---|
| Fecha | Martes 29 de septiembre de 2026 |
| Horario previsto | 6:00 a 7:30 p. m. |
| Hora de inicio y de cierre | 6:00 a 8:00 p. m. |
| Modalidad | Virtual, por Google Meet |
| Participantes por el equipo | Jordin García, Carlos Hugo Escobar, Daniela Marín, José Daniel Cifuentes y Josué Menéndez |
| Participantes por INCOVSA | Ing. William Ambrossio |
| Responsable de las notas | Daniela Marín |

### Temas tratados {-}

- Revisión del sitio web: estructura general, secciones y navegación.
- Panel de control y gestión de usuarios: roles, accesos y permisos.
- Administración del sitio: catálogo y documentación interna.
- Sistema de picking: alcance del inventario, Facturación, Bodega, Reportes e interfaz.

### Cambios solicitados {-}

**Sitio web.**

- El diseño se adapta a teléfono y escritorio.
- Se validan las industrias y las proporciones y tamaños de las imágenes de los productos.
- Se aprueban las secciones Inicio, Quiénes somos, Industrias, Productos, Noticias y Contacto.
- Inicio es informativo. Se elimina la sección «Catálogo informativo». La sección de presencia incluye el enlace a la ubicación de cada bodega en Google Maps. La misión y la visión son las imágenes proporcionadas, centradas, una debajo de la otra. Las imágenes tienen una animación de aparición y desaparición.
- El pie de página va solo en Inicio, Quiénes somos, Noticias y Contacto, con el mismo logotipo de la cabecera. El logotipo «Transformamos INCOVSA» es solo de uso interno. Industrias y Productos no llevan pie de página.
- Quiénes somos: imágenes de misión y visión con animación, a media pantalla. Cada dato del bloque admite una imagen desde la administración del sitio. Banner principal con transición entre los logotipos de INCOVSA e Inquiserca. El logotipo de Inquiserca está pendiente de recibirse.
- Industrias: no se muestran imágenes de productos. Cada industria muestra su descripción, una imagen, que se sube desde la administración del sitio, y sus productos en texto.
- Productos: la búsqueda actual queda aprobada. Se agrega abajo una sección de productos recomendados, relacionados con el producto que se está viendo.
- Noticias: cada noticia tiene fotografía, título y texto, y se administra desde la administración del sitio.
- Contacto: teléfono con código de área por país, validación de la estructura del correo y del teléfono, y campos de país, departamento o estado y municipio o ciudad.
- Solicitudes: se dividen por motivo (solicitud, queja y reclamo). Cada solicitud tiene un responsable, un comentario del responsable y los botones de estado Asignado, En proceso y Solucionado.

**Panel de control y gestión de usuarios.**

- El acceso depende de los permisos asignados a cada usuario, no de su rol. Los permisos y los módulos se marcan con casillas. Se pueden agregar, editar o revocar permisos puntuales y eliminar usuarios.
- El rol es un campo del usuario que deciden Gerencia o Soporte. Los únicos roles predeterminados son Gerencia y Soporte, los dos con acceso total al picking y a la administración del sitio.
- La bitácora registra todas las acciones de cada usuario para la auditoría. No se muestra en la interfaz.

**Administración del sitio.**

- Catálogo: cada producto admite una imagen y se puede eliminar. Al crear un producto, los únicos campos adicionales son el origen y la presentación.
- Documentación interna: se busca por lote, nombre y país de origen del producto. Al subir un documento se ingresan el nombre del producto, el país de origen y el lote, que solo admite números.

**Sistema de picking.**

- El control de inventario (existencias, entradas y salidas) queda fuera del alcance. El sistema está pensado para integrarse en el futuro con el ERP Odoo de la empresa, que es el que lleva el inventario de todas las bodegas.
- Facturación: los pedidos ya no se ingresan a mano. Se carga un archivo .xlsx con la estructura del archivo de ejemplo «Data Odoo para Picking». Las filas sin referencia ni contacto pertenecen al pedido de arriba. De la columna Referencia (por ejemplo, XE-IN/SALIDA/03539) solo se toma el número de pedido. Contacto es el cliente, «Movimientos de stock/Producto» es el producto y «Movimientos de stock/Cantidad hecha» es la cantidad en kilogramos. La columna del peso no se usa, porque en algunos productos viene en cero: se siguen usando los pesos de conversión actuales.
- Bodega: el tablero en pantalla completa ofrece «Modo claro» y «Modo oscuro» en lugar de TV y Tableta. El modo claro se ve como el modo Tableta actual y el modo oscuro usa negros y grises.
- Reportes: filtros de los pedidos despachados por día, semana, mes, año y rango de fechas.
- Interfaz: el menú lateral izquierdo se puede contraer para ampliar el área de trabajo.

## Reunión 5, 13 de octubre de 2026 {-}

Tabla: Datos de la reunión 5 {#tab:reunion-5}

| Dato | Detalle |
|---|---|
| Fecha | Martes 13 de octubre de 2026 |
| Horario previsto | 6:00 a 7:30 p. m. |
| Hora de inicio y de cierre | 6:00 a 9:30 p. m. |
| Modalidad | Virtual |
| Participantes por el equipo | Jordin García, Carlos Hugo Escobar, Daniela Marín, José Daniel Cifuentes y Josué Menéndez |
| Participantes por INCOVSA | Ing. William Ambrossio |
| Responsable de las notas | Daniela Marín |

Las notas originales dicen «14 de octubre de 2026». La reunión fue el 13 de octubre de 2026: lo confirman la captura de la reunión y el coordinador (P-77).

### Temas tratados {-}

- Sitio web: Inicio, Quiénes somos, Industrias y Contacto.
- Acceso y autenticación.
- Administración del sitio: contenido institucional, solicitudes, usuarios y documentación interna.
- Sistema de picking: Facturación, Bodega y Ruta.

### Cambios solicitados {-}

**Sitio web.**

- Inicio y Quiénes somos: primero la misión, con el texto a la izquierda y una imagen a la derecha; abajo la visión, con una imagen a la izquierda y el texto a la derecha.
- Valores: solo 5 imágenes, una por valor, en una sola fila y sin texto. Se suben desde la administración del sitio.
- Cada área de imágenes del sitio público admite hasta 5 imágenes, que rotan cada 5 segundos. Se hacen pruebas de rendimiento para que no se haga más lenta la carga.
- Industrias: barra lateral izquierda solo con los íconos de cada industria, como las barras de la administración del sitio y del picking. Al pasar el cursor por un ícono se muestra el nombre de la industria.
- Contacto: las solicitudes solo se guardan en el sitio. No se envían a ningún correo.

**Acceso y autenticación.**

- «Acceso Personal» pide primero el nombre de usuario y valida que exista en alguno de los dos sistemas (administración del sitio y picking). Si existe, el usuario elige a qué sistema entrar: Odoo, administración del sitio o picking. Para los dos últimos se pide la contraseña. Si no existe, se muestra un mensaje de que no tiene permisos para acceder.
- Se puede crear el mismo nombre de usuario en los dos sistemas, para entrar a ambos con el mismo usuario y contraseña.
- Al cerrar sesión, el usuario vuelve a la página de inicio.

**Administración del sitio.**

- Contenido institucional: se elimina la sección de imágenes del sitio y en su lugar se suben la imagen de portada y el logotipo de INCOVSA. El logotipo de Inquiserca ya fue entregado al equipo.
- Solicitudes: con la barra lateral contraída, el ícono del módulo muestra un aviso cuando hay solicitudes nuevas.
- Usuarios: la contraseña se crea al crear el usuario, y Gerencia y Soporte la pueden restablecer desde la administración. El restablecimiento no se hace por correo.
- Documentación interna: se crea un solo producto documentado con nombre, país de origen, lote (obligatorio) y los enlaces de la ficha técnica, la hoja de seguridad y el certificado de análisis. Ya no se suben archivos PDF. La tabla ya no muestra las columnas Documento y Tipo ni el filtro por tipo. En Acciones solo quedan editar (lápiz) y eliminar (basurero). Al hacer clic en la fila se abre una ventana con las opciones que permiten los permisos del usuario: si solo puede ver, no aparece la opción de descargar.

**Facturación.**

- Se usan los datos del archivo de Excel tal como vienen, sin validar productos, clientes ni sectores, y sin guardarlos en la base de datos. El Ing. William Ambrossio se comprometió a entregar toda la información en el archivo.
- Se agregan dos columnas: «Movimientos de stock/Producto/Peso», que pasa a ser el peso de conversión a unidades, y «Movimientos de stock/Números de serie», el lote del producto, que se muestra por producto en Bodega.
- Las instrucciones van junto al título, lo más cortas posible, para ampliar el tablero y las opciones de envío.
- Se pueden seleccionar uno, varios o todos los pedidos del tablero y arrastrarlos juntos a una opción de envío. Los seleccionados se pueden eliminar. Se quitan los puntos de arrastre y la «x» de las tarjetas.
- Solo hay dos opciones de envío: por camión, con el camión y el piloto elegidos de listas de la sede, y cliente recoge en bodega.
- Cada pedido en una opción de envío muestra su total en kg. Cada opción de envío tiene fecha y hora programadas, que se guardan y se muestran en Bodega.
- Los pedidos se pueden mover entre opciones de envío. Ese orden se guarda y se envía a Bodega.
- Lo que va en un camión se llama ruta; lo que el cliente recoge en bodega se llama pedido.
- La numeración de rutas y pedidos se reinicia cada día.
- El sistema guarda automáticamente la fecha y la hora exactas en que se guarda cada registro.

**Bodega.**

- La barra lateral no muestra el número de pedidos en Bodega.
- Cada ruta o pedido tiene el botón «Detalle de Ruta» o «Detalle de Pedido», que abre una ventana con todos los datos cargados del archivo .xlsx.
- Se agrega el orden de mayor a menor peso.
- El lote del producto se resalta.
- Cada ruta o pedido muestra la fecha y la hora programadas, no la hora en que se envió desde Facturación.
- Se puede marcar todo de una vez.
- En el tablero, la numeración va de arriba hacia abajo: primero la columna izquierda y después la derecha.

**Ruta.**

- Las rutas se muestran siempre de la más reciente a la más antigua.
- Se elimina la sección de registro histórico, porque ya está en Reportes.

## Fuentes sin acta {-}

`specs/18` registra otras fuentes del levantamiento que no son reuniones con acta: el cuestionario del 9 al 11 de septiembre de 2026, la reunión de especificación de módulos del 18 de septiembre de 2026 y las aclaraciones del 19 y 20 de septiembre de 2026. Su evidencia (correos o mensajes) todavía no está archivada. Queda como pendiente P-04 de `specs/19`.
