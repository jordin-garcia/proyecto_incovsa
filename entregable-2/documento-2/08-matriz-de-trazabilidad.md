\horizontal

# Matriz de trazabilidad

La matriz relaciona cada requerimiento funcional vigente (`specs/04-requerimientos-funcionales.md`, versión del 15/10/2026) con el módulo que lo implementa, su caso de uso y sus casos de prueba del Anexo F. Los requerimientos eliminados no se incluyen; conservan su código en la especificación.

La columna **Estado** indica el avance al Entregable No. 2:

- **Prototipo:** el comportamiento está implementado y funcionando en el prototipo de simulación aprobado el 13/10/2026 y ajustado el 15/10/2026, que es el avance que se presenta en este entregable. En la aplicación definitiva está diseñado en este documento y en desarrollo.
- **Diseñado:** está diseñado en este documento, pero el prototipo no lo ejecuta; se implementa en la aplicación definitiva.

Los casos de prueba se ejecutan sobre la aplicación definitiva y su resultado queda en el Documento 6. «Documento 6» indica que el caso de prueba se define allí.

## Sitio web

Tabla: Matriz de trazabilidad del sitio web {#tab:traza-sitio}

| Requerimiento | Descripción breve | Módulo | Caso de uso | Caso de prueba | Estado |
|---|---|---|---|---|---|
| RF-SW-01 | Inicio informativo; misión y visión con texto e imagen | Sitio público · contenido | CU-08 | CP-51 | Prototipo |
| RF-SW-02 | Quiénes somos: banner de logotipos, misión, visión, historia y valores | Sitio público · contenido | CU-08 | CP-51, CP-53 | Prototipo |
| RF-SW-03 | 9 industrias con barra lateral de íconos | Sitio público · contenido | CU-08 | Documento 6 | Prototipo |
| RF-SW-04 | Catálogo informativo con búsqueda y filtro por industria | Sitio público · contenido | CU-08 | Documento 6 | Prototipo |
| RF-SW-05 | Detalle de producto | Sitio público · contenido | CU-08 | CP-55 | Prototipo |
| RF-SW-06 | Formulario de contacto que solo guarda | Sitio público · solicitudes | CU-09 | CP-58 | Prototipo |
| RF-SW-07 | Panel para actualizar el contenido sin tocar código | Panel · contenido | CU-07 | CP-51 | Prototipo |
| RF-SW-08 | Sitio y panel responsivos | Interfaz | CU-08 | Documento 6 | Prototipo |
| RF-SW-09 | Acceso personal: usuario, sistema y contraseña | Sitio público · autenticacion | CU-11 | CP-45, CP-46 | Prototipo |
| RF-SW-10 | Área protegida de documentación interna con enlaces | Documentación interna · documentos | CU-10 | CP-57 | Prototipo |
| RF-SW-11 | Restablecimiento de contraseña por Gerencia o Soporte | Panel · usuarios | CU-11 | CP-48 | Prototipo |
| RF-SW-12 | Bandeja de solicitudes | Panel · solicitudes | CU-21 | CP-58 | Prototipo |
| RF-SW-13 | Usuarios del sitio con contraseña, rol y permisos | Panel · usuarios | CU-12 | CP-48 | Prototipo |
| RF-SW-14 | Producto documentado: nombre, país, lote y enlaces | Documentación interna · documentos | CU-15 | CP-56 | Prototipo |
| RF-SW-15 | Pie de página solo en cuatro páginas | Sitio público | CU-08 | Documento 6 | Prototipo |
| RF-SW-16 | Presentación dinámica al desplazarse | Sitio público | CU-08 | Documento 6 | Prototipo |
| RF-SW-17 | Productos Recomendados siempre visibles | Sitio público · contenido | CU-08 | CP-55 | Prototipo |
| RF-SW-18 | Noticias con imágenes, título y texto; se eliminan en lugar de ocultarse | Panel · contenido | CU-07 | CP-62 | Prototipo |
| RF-SW-19 | Teléfono internacional, validaciones y país obligatorio | Sitio público · solicitudes | CU-09 | CP-58 | Prototipo |
| RF-SW-20 | Solicitudes por motivo, responsable, comentario y estados | Panel · solicitudes | CU-21 | CP-63 | Prototipo |
| RF-SW-21 | Búsqueda de documentos y ventana según permisos | Documentación interna · documentos | CU-10 | CP-57 | Prototipo |
| RF-SW-22 | Sedes con mapa de Google Maps; sin Escuintla | Sitio público · contenido | CU-08 | Documento 6 | Prototipo |
| RF-SW-23 | Carga de imágenes desde el panel | Panel · contenido | CU-07 | CP-52, CP-53 | Prototipo |
| RF-SW-24 | Sin el logotipo «Transformamos INCOVSA» | Sitio público | CU-08 | Documento 6 | Prototipo |
| RF-SW-25 | Acceso al panel según permisos | permisos | CU-12 | CP-54 | Prototipo |
| RF-SW-26 | Menú lateral reducible a íconos | Panel | CU-07 | Documento 6 | Prototipo |
| RF-SW-27 | Textos sin número de sedes, Escuintla, inventario ni roles fijos | Sitio público | CU-08 | Documento 6 | Prototipo |
| RF-SW-28 | Galerías de hasta 5 imágenes que rotan cada 5 s | Sitio público · contenido | CU-08 | CP-52 | Prototipo |
| RF-SW-29 | Valores como 5 imágenes | Sitio público · contenido | CU-08 | CP-53 | Prototipo |
| RF-SW-30 | Cerrar sesión lleva al inicio | autenticacion | CU-11 | CP-50 | Prototipo |
| RF-SW-31 | Indicador de solicitudes nuevas en el menú | Panel · solicitudes | CU-21 | CP-59 | Prototipo |

## Sistema de picking

Tabla: Matriz de trazabilidad del sistema de picking {#tab:traza-picking}

| Requerimiento | Descripción breve | Módulo | Caso de uso | Caso de prueba | Estado |
|---|---|---|---|---|---|
| RF-SL-01 | Autenticación con usuario y contraseña | autenticacion | CU-11 | CP-46, CP-47 | Prototipo |
| RF-SL-02 | Sin selector de sede al iniciar sesión | autenticacion | CU-11 | Documento 6 | Prototipo |
| RF-SL-03 | Usuarios del picking con contraseña, rol, sedes y permisos | Configuración · usuarios | CU-12 | CP-48 | Prototipo |
| RF-SL-04 | Configuración de camiones | Configuración · camiones | CU-13 | Documento 6 | Prototipo |
| RF-SL-05 | Decidir camión o cliente recoge arrastrando | Facturación · envios | CU-01 | CP-30 | Prototipo |
| RF-SL-06 | Camión y piloto de listas desplegables | Facturación · envios | CU-01 | CP-32 | Prototipo |
| RF-SL-07 | Tarjeta de todo el ancho, sin asa ni «x» | Facturación | CU-01 | CP-24 | Prototipo |
| RF-SL-13 | Total en kg en las tarjetas y en las opciones | Facturación · envios | CU-01 | Documento 6 | Prototipo |
| RF-SL-14 | Control de peso y alerta de sobrepeso | Facturación · envios | CU-01 | Documento 6 | Prototipo |
| RF-SL-16 | «Enviar a Bodega» crea la ruta o el pedido | envios | CU-01 | CP-33, CP-34, CP-35 | Prototipo |
| RF-SL-17 | «Cancelar» regresa los pedidos facturados al tablero | envios | CU-02 | Documento 6 | Prototipo |
| RF-SL-18 | Sin borradores; lo enviado no se edita | envios | CU-01 | Documento 6 | Prototipo |
| RF-SL-19 | Bodega en el orden de llegada | bodega | CU-03 | Documento 6 | Prototipo |
| RF-SL-20 | Reordenar y ordenar por peso, en tiempo real | bodega · tiempo-real | CU-03 | CP-39 | Prototipo |
| RF-SL-21 | Tabla por producto, lote y Peso de Conversión | bodega | CU-03 | CP-19 | Prototipo |
| RF-SL-22 | Unidades con RN-01 | conversion | CU-03 | CP-01 a CP-18 | Prototipo |
| RF-SL-23 | Marcar filas y marcar todo, en tiempo real | bodega · tiempo-real | CU-03 | CP-37, CP-38 | Prototipo |
| RF-SL-24 | Despacho con todas las filas marcadas | bodega | CU-04 | CP-38 | Prototipo |
| RF-SL-25 | Legible en TV y tableta | Bodega y tablero | CU-03 | Documento 6 | Prototipo |
| RF-SL-26 | El piloto solo ve sus rutas | ruta · permisos | CU-05 | Documento 6 | Prototipo |
| RF-SL-27 | Ruta con una fila por cliente | ruta | CU-05 | Documento 6 | Prototipo |
| RF-SL-28 | El recorrido se guarda al entregar | ruta | CU-05 | CP-41 | Prototipo |
| RF-SL-29 | «Ruta Entregada» registra la entrega | ruta | CU-05 | CP-41 | Prototipo |
| RF-SL-30 | Número del día, fecha, programada, camión y piloto de la ruta | envios | CU-01 | CP-33 | Prototipo |
| RF-SL-35 | Estados y transiciones (RN-11) | envios · bodega · ruta | CU-04, CU-05 | CP-38, CP-41 | Prototipo |
| RF-SL-36 | Bitácora con inicios de sesión | bitacora | CU-14 | CP-45, CP-47 | Prototipo |
| RF-SL-37 | Registro histórico de rutas en Reportes | reportes | CU-14 | CP-41 | Prototipo |
| RF-SL-38 | Reportes de despacho, rutas y bitácora, con exportación | reportes | CU-14 | Documento 6 | Prototipo, salvo la exportación a Excel y PDF, que está diseñada |
| RF-SL-48 | Restablecer contraseña en Configuración | usuarios | CU-12 | CP-48 | Prototipo |
| RF-SL-50 | Carga del archivo .xlsx de Odoo | odoo | CU-01 | CP-22, CP-28 | Prototipo |
| RF-SL-51 | Lectura de arriba hacia abajo; solo «Hecho» | odoo | CU-01 | CP-22 | Prototipo |
| RF-SL-52 | Número del pedido facturado y bodega | odoo | CU-01 | CP-25 | Prototipo |
| RF-SL-53 | Datos del archivo tal como vienen | odoo | CU-01 | CP-24 | Prototipo |
| RF-SL-54 | Peso de Conversión de la columna del archivo | odoo · conversion | CU-01 | CP-26 | Prototipo |
| RF-SL-55 | Acceso por permisos | permisos | CU-11 | CP-42 | Prototipo |
| RF-SL-56 | Rol de texto libre y permisos por casillas | usuarios | CU-12 | CP-44 | Prototipo |
| RF-SL-57 | Eliminación lógica de usuarios | usuarios | CU-12 | CP-49 | Prototipo |
| RF-SL-58 | Modo claro y modo oscuro del tablero | Bodega y tablero | CU-03 | Documento 6 | Prototipo |
| RF-SL-59 | Filtros por periodo en Reportes | reportes | CU-14 | CP-64 | Prototipo |
| RF-SL-60 | Menú lateral reducible a íconos | Interfaz | CU-03 | Documento 6 | Prototipo |
| RF-SL-61 | Pantalla de Facturación con dos opciones | Facturación | CU-01 | CP-61 | Prototipo |
| RF-SL-63 | Arrastrar entre tablero y opciones, y dentro de una opción | Facturación · envios | CU-01 | CP-30, CP-31 | Prototipo |
| RF-SL-66 | Sedes por usuario | permisos | CU-12 | CP-43 | Prototipo |
| RF-SL-67 | Tablero y opciones guardados | envios | CU-01 | CP-31 | Prototipo |
| RF-SL-68 | Eliminar uno, varios o todos | envios | CU-01 | CP-30 | Prototipo |
| RF-SL-69 | Seleccionar y arrastrar varios | Facturación · envios | CU-01 | CP-30 | Prototipo |
| RF-SL-70 | Fecha y hora programadas obligatorias, escritas con el teclado o elegidas | envios | CU-01 | CP-32, CP-60 | Prototipo |
| RF-SL-71 | Orden de los pedidos facturados en la opción | envios | CU-01 | CP-31 | Prototipo |
| RF-SL-72 | Rutas y pedidos con numeración diaria aparte | envios | CU-01 | CP-33, CP-34 | Prototipo |
| RF-SL-73 | Peso de Conversión en 0: no se carga | odoo | CU-01 | CP-21, CP-23 | Prototipo |
| RF-SL-74 | Detalle de Ruta o de Pedido | bodega | CU-03 | CP-36 | Prototipo |
| RF-SL-75 | Fecha y hora programadas en Bodega | bodega | CU-03 | CP-36 | Prototipo |
| RF-SL-76 | Sin contador de Bodega en la barra lateral | Interfaz | CU-03 | Documento 6 | Prototipo |
| RF-SL-77 | Numeración por columnas en el tablero | Bodega y tablero | CU-03 | CP-40 | Prototipo |
| RF-SL-78 | Rutas de la más reciente a la más antigua | ruta | CU-05 | CP-41 | Prototipo |
| RF-SL-79 | Ruta sin registro histórico | ruta | CU-05 | CP-41 | Prototipo |
| RF-SL-80 | Fecha y hora de creación automáticas | Todos los módulos | — | Documento 6 | Diseñado |
