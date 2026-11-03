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

{{fig:casos-sitio}} y {{fig:casos-picking}}, en el capítulo de modelado, muestran esos casos con los actores por permiso. Gerencia y Soporte administran los usuarios.

## Precisiones posteriores

Después del 16/10/2026, `specs/` precisó cómo se comportan algunos casos. Ninguna precisión crea ni elimina un caso de uso, ni cambia su actor.

Tabla: Precisiones de los casos de uso del 16/10/2026 al 03/11/2026 {#tab:precisiones-cu}

| Caso | Precisión | Fuente |
| --- | --- | --- |
| CU-01 | Si dos facturadores de la misma sede trabajan a la vez, el servidor valida cada cambio contra lo guardado. Si el otro ya movió, envió o eliminó un pedido facturado, el cambio se rechaza con un aviso y la pantalla se actualiza en tiempo real (16/10 y 21/10). El archivo de Odoo se rechaza si, descomprimido, pasa de 50 MB o de 100 archivos internos, o si tiene más de 20 000 filas (29/10) | `specs/06` |
| CU-03 | Si un marcado, un orden o un despacho no se guarda, vuelve atrás y la pantalla sigue en uso. Si otra pantalla ya despachó la ruta o el pedido, se avisa «El pedido ya no está en preparación.» (25/10) | `specs/07` |
| CU-05 | El piloto ve solo las rutas de la sede de trabajo elegida en la barra superior (26/10). Dos pedidos facturados son del mismo cliente si su nombre y su sector coinciden sin distinguir mayúsculas, tildes ni espacios sobrantes (22/10, RN-49) | `specs/08`, `specs/12` |
| CU-08 | A pedido del Ing. Manuel Rojas: los banners de las secciones tienen la misma altura, Productos usa la misma barra lateral de solo íconos que Industrias, con «Todas las industrias» primero, y el dato que falta no se muestra (02/11 y 03/11) | `specs/05` |
| CU-09 | Se aceptan hasta 5 solicitudes por hora desde una misma dirección IP. Un campo oculto detecta a los robots: el envío responde como si fuera correcto, pero no se guarda (29/10). El mensaje admite hasta 2000 caracteres (24/10) | `specs/05` |
| CU-12 | Gerencia y Soporte no pueden eliminar ni desactivar su propia cuenta (22/10). Al eliminar un piloto, se quita de «Envío por camión» si estaba elegido | `specs/11` |
| CU-13 | No se puede eliminar ni cambiar de sede un camión elegido en «Envío por camión» (22/10) | `specs/11` |
| CU-14 | La Bitácora muestra a cada usuario los registros de la sede que consulta. Gerencia y Soporte ven todos (22/10). Si falla una descarga de Excel o PDF, se avisa «No se pudo completar la operación. Inténtelo de nuevo.» (29/10) | `specs/10` |
| CU-21 | El comentario del responsable admite hasta 2000 caracteres (27/10) | `specs/05` |

`specs/03-roles-y-accesos.md` agrega dos precisiones a CU-11 y CU-12 (29/10). La primera rechaza las contraseñas fáciles de adivinar. La segunda pide la contraseña de quien restablece la de una cuenta de Gerencia o Soporte. La aplicación todavía no las aplica: se implementan después de la entrega del 04/11/2026 (`specs/16`, decisión 90).
