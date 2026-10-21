# Casos de uso

Los casos de uso CU-01 a CU-21 están en `specs/04-requerimientos-funcionales.md`. El estado compara cada caso con el Documento 1 v0.1. El actor es el de esa tabla. Donde el archivo de especificación deja el actor vacío en un caso eliminado, esta tabla dice Sin actor.

CU-06 y CU-16 a CU-20 tienen estado Eliminado desde el 29/09/2026. Siguen en la tabla para conservar el código. No son casos vigentes. Las figuras de los casos de uso, en el capítulo de modelado, no los dibujan.

Tabla: Casos de uso CU-01 a CU-21 {#tab:casos-uso}

| Código | Nombre | Actor principal | Estado respecto del Documento 1 |
| --- | --- | --- | --- |
| CU-01 | Registrar pedido facturado y enviarlo a bodega | Usuario con permiso de Facturación | Modificado: **(29/09, 11/10 y 13/10)** se carga el archivo .xlsx de Odoo al tablero, tal como viene; el facturador selecciona y arrastra los pedidos facturados a "Envío por camión" o "Cliente recoge en bodega", los ordena, escribe la fecha y hora programadas y envía la opción; cada envío crea una ruta o un pedido con su número del día |
| CU-02 | Cancelar opción de envío | Usuario con permiso de Facturación | Modificado: sus pedidos facturados regresan al tablero; se registra en la bitácora |
| CU-03 | Preparar ruta o pedido | Usuario con permiso de Bodega | Modificado: marcado (también todo de una vez), orden y orden por peso compartidos en tiempo real; filas por producto y lote; detalle de ruta o de pedido |
| CU-04 | Cerrar preparación | Usuario con permiso de Bodega | Vigente ("Ruta Despachada" o "Pedido Despachado") |
| CU-05 | Ejecutar ruta de entrega | Usuario con rol "Piloto" | Modificado: el recorrido se guarda al entregar; una fila por cliente; rutas de la más reciente a la más antigua |
| CU-06 | Registrar devolución | Sin actor | **Eliminado** (29/09) |
| CU-07 | Administrar contenido del sitio | Usuario con permisos del sitio | Modificado: **(13/10)** galerías de hasta 5 imágenes, portada y logotipo de INCOVSA, 5 imágenes de valores, logotipo de Inquiserca |
| CU-08 | Consultar información pública | Visitante | Modificado: **(13/10)** misión y visión con texto e imagen, valores con imágenes, galerías que rotan, menú de industrias con íconos |
| CU-09 | Enviar solicitud de contacto | Visitante | Modificado: **(13/10)** país obligatorio; la solicitud solo se guarda en el sistema |
| CU-10 | Consultar documentación interna | Usuario con permisos de documentación | Modificado: **(13/10)** clic en el producto documentado y ventana con ver y descargar según permisos |
| CU-11 | Iniciar sesión y recuperar contraseña | Todos los usuarios | Modificado: **(13/10)** usuario, sistema y contraseña; cierre de sesión al inicio del sitio; la contraseña la restablecen Gerencia o Soporte |
| CU-12 | Administrar usuarios | Gerencia o Soporte | Modificado: **(13/10)** contraseña al crear; el mismo nombre de usuario en los dos sistemas |
| CU-13 | Configurar camiones | Usuario con permiso de administrar camiones | Modificado: **(13/10)** solo camiones; ya no hay productos, clientes ni sectores |
| CU-14 | Consultar reportes y bitácora | Usuario con permiso de Reportes | Modificado: filtros por periodo, también en la bitácora |
| CU-15 | Administrar productos documentados | Usuario con permiso de administrar documentos | Modificado: **(13/10)** nombre, país, lote obligatorio y enlaces de Google Drive |
| CU-16 | Consultar existencias | Sin actor | **Eliminado** (29/09) |
| CU-17 | Registrar compra | Sin actor | **Eliminado** (29/09) |
| CU-18 | Registrar ajuste | Sin actor | **Eliminado** (29/09) |
| CU-19 | Registrar traslado entre sedes | Sin actor | **Eliminado** (29/09) |
| CU-20 | Editar movimiento de inventario | Sin actor | **Eliminado** (29/09) |
| CU-21 | Gestionar solicitud de contacto | Usuario con permiso de gestionar solicitudes | Nuevo (29/09): designar responsable, comentar y marcar el estado. **(13/10)** Aviso de solicitudes nuevas en el menú |

Los casos vigentes del sitio son CU-07, CU-08, CU-09, CU-10, CU-11, CU-12, CU-15 y CU-21. Los del picking son CU-01, CU-02, CU-03, CU-04, CU-05, CU-11, CU-12, CU-13 y CU-14. CU-11 y CU-12 están en los dos componentes. CU-13 configura camiones. Ya no configura productos, clientes ni sectores.

{fig:casos-sitio} y {fig:casos-picking} muestran esos casos con los actores por permiso. Gerencia y Soporte administran los usuarios.
