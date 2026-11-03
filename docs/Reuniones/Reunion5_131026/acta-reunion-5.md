# Acta de reunión No. 5

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

## Temas tratados

- Sitio web: Inicio, Quiénes somos, Industrias y Contacto.
- Acceso y autenticación.
- Administración del sitio: contenido institucional, solicitudes, usuarios y documentación interna.
- Sistema de picking: Facturación, Bodega y Ruta.

## Cambios solicitados

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
