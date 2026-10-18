# 14. Modelo conceptual de datos

Este es el modelo **conceptual**. Los nombres físicos, los tipos, los índices y las restricciones se definen en el esquema de Prisma. El modelo ER y el diccionario de datos del Documento 2 corresponden con este modelo y, después, con la base de datos real.

> **Cambios del 13/10/2026 (reunión 5).** El picking ya no tiene catálogos de productos, clientes ni sectores: cada línea del pedido facturado guarda el producto, el lote y el Peso de Conversión que trae el archivo de Odoo, y cada pedido facturado guarda el cliente y el sector tal como vienen. Lo que se envía a Bodega (ENVIO) es una **ruta** o un **pedido**, con número diario y fecha y hora programadas, y la ruta ya no es una entidad aparte. Hay solo dos opciones de envío por sede. En el sitio, la documentación interna pasa a productos documentados con enlaces de Google Drive, las imágenes se guardan en galerías de hasta 5 y los valores son 5 imágenes. Todas las entidades guardan su fecha de creación.

## Convenciones del modelo (13/10 y 12/10)

- Cada entidad tiene un identificador (clave primaria) y una **fecha de creación** que el sistema pone sola al guardar el registro (RN-57). Las entidades que se modifican guardan también su fecha de última modificación.
- Las fechas se guardan en UTC; los días, semanas y numeraciones diarias se calculan en la hora de Guatemala.
- Las cantidades en kg y el Peso de Conversión son `Decimal(12,3)`.
- La eliminación de camiones y usuarios es lógica (fecha de eliminación).

## Acceso

| Entidad | Atributos principales | Relaciones |
|---|---|---|
| SEDE | nombre, prefijo de Odoo (`XE`, `GT`, `ESC`), tiene oficina (sí/no) | — |
| USUARIO | nombre completo, nombre de usuario, correo (opcional), contraseña cifrada, activo, **rol (texto libre)**, sistema (sitio, picking o ambos; "ambos" solo en las cuentas de Gerencia y Soporte, 15/10), fecha de eliminación | Permisos (N:M), sedes (N:M, solo picking) |
| PERMISO | código, sistema (sitio o picking), módulo, acción, descripción | — |
| USUARIO_PERMISO | — | Usuario y permiso (única por par) |
| USUARIO_SEDE | — | Usuario del picking y sede (única por par) |

- Cada sistema tiene **sus propios usuarios** y su propia administración (RN-18). El nombre de usuario es **único por sistema** (13/10, RN-54): el par (nombre de usuario, sistema) no se repite. Una cuenta del sitio y una del picking pueden tener el mismo nombre de usuario.
- Las cuentas con rol **Gerencia** o **Soporte** tienen acceso total a los dos sistemas y a todas las sedes, y sirven en los dos inicios de sesión (RN-38). Son **un solo registro** con el sistema "ambos" (15/10). Su nombre de usuario no se puede repetir en el otro sistema (RN-54).
- Los pilotos son los usuarios del picking con rol "Piloto" (RN-46). El rol se compara sin distinguir mayúsculas, acentos ni espacios al inicio o al final.
- Al eliminar un usuario se guarda su fecha de eliminación: no puede iniciar sesión, su nombre de usuario queda reservado en su sistema y se conservan la bitácora y los registros donde aparece.
- **Clave de acceso interna y correo interno (17/10, JG-03):** la clave es `<sistema>.<nombre de usuario>` en minúsculas (`sitio.`, `picking.` o `ambos.`) y el correo interno que exige Better Auth es `<clave>@incovsa.invalid`, un dominio reservado que no recibe correos (decisión 26).
- La "acción" de PERMISO es su descripción (por ejemplo, "Ver todas las rutas"), como en el catálogo de [03](03-roles-y-accesos.md).

## Sistema de picking

| Entidad | Atributos principales | Relaciones |
|---|---|---|
| CAMION | identificación, capacidad máxima en kg, fecha de eliminación | Sede |
| OPCION_ENVIO | tipo (camión o cliente recoge en bodega), fecha y hora programadas (vacías hasta que se escriben) | Sede, camión elegido (0..1, solo en la de camión), piloto elegido (usuario con rol "Piloto", 0..1). Hay **dos por sede**, una de cada tipo (13/10) |
| PEDIDO_FACTURADO | **número de Odoo** (tercer segmento de la Referencia), referencia completa, **nombre del cliente** (`Contacto`), **sector** (`Contacto/Ciudad`), fecha de carga, posición (orden en el tablero o en la opción de envío) | Sede, usuario que lo cargó, opción de envío (0..1; vacía = en el tablero), envío (0..1; se llena al enviar) |
| DETALLE_PEDIDO_FACTURADO | **producto** (texto del archivo), **lote** (texto; si viene vacío se guarda como texto vacío, 16/10), **Peso de Conversión** en kg, cantidad en kg, orden en el archivo | Pedido facturado |
| ENVIO | tipo (**ruta** o **pedido**), **número del día**, fecha de envío a bodega, **fecha y hora programadas**, posición actual en la cola de Bodega | Sede, estado actual (ESTADO_ENVIO), usuario que lo envió, camión y piloto (solo ruta), pedidos facturados (1:N) |
| LINEA_PREPARACION | producto, lote, Peso de Conversión en kg, cantidad total en kg, marcado, posición actual | Envío. Única por (envío, producto, lote, Peso de Conversión) (RN-51) |
| ESTADO_ENVIO | nombre: En Preparación, Despachado, En Ruta o Entregado | — |
| HISTORIAL_ESTADO | fecha y hora | Envío, estado, usuario |
| ENTREGA_RUTA | nombre del cliente, sector, total en kg, orden (antes de entregar, el orden actual; al entregar, el recorrido, RN-29) | Envío de tipo ruta. Una fila por cliente (mismo nombre y sector, RN-49) |
| BITACORA | sistema (sitio o picking), operación, entidad, identificador del registro, detalle (JSON), nombre de usuario escrito, dirección IP (en inicios de sesión y consultas de usuario), fecha y hora | Usuario (0..1) |

### Notas

- **Pedido facturado** = una referencia de Odoo de un solo cliente. **Envío** = lo que se manda a Bodega desde una opción de envío; si sale del camión es una **ruta** y si lo recoge el cliente es un **pedido** (13/10). Reúne uno o varios pedidos facturados y puede tener varios clientes.
- El número del envío es único por (sede, tipo, fecha de envío en la hora de Guatemala) y empieza en 1 cada día (RN-52).
- La fecha de la ruta y la entrega quedan en ENVIO (fecha de envío) y en su historial de estados (fecha de "Entregado"); el recorrido, en ENTREGA_RUTA.
- El tablero de pedidos facturados son los PEDIDO_FACTURADO de la sede sin opción de envío y sin envío. Se guardan en la base de datos, igual que la opción asignada y su posición (RN-48). Cancelar una opción les quita la opción de envío y regresan al tablero.
- Eliminar un pedido facturado del tablero lo **borra** de la base de datos; sus datos quedan en la bitácora.
- No se valida que el número de Odoo no se repita, porque viene de Odoo. La base de datos **no** lo declara único; solo tiene un índice para buscar.
- El orden de prioridad de Bodega y el orden de las filas de Ruta antes de la entrega **no** se guardan como historial ni en la bitácora (RN-28, RN-29). Se guarda **solo el orden actual**.
- El marcado de LINEA_PREPARACION no guarda quién marcó (RN-20).
- Las líneas guardan el Peso de Conversión con el que llegaron en el archivo (RN-33).
- **Lote vacío (16/10):** en DETALLE_PEDIDO_FACTURADO y LINEA_PREPARACION el lote **no** admite nulo. Un lote que no viene en el archivo se guarda como **texto vacío**, y Bodega lo muestra como "Sin lote". Así la regla de una línea de preparación por (envío, producto, lote, Peso de Conversión) se cumple también sin lote: en PostgreSQL dos valores nulos no se consideran iguales en una restricción de unicidad.
- PEDIDO_FACTURADO guarda su fecha de última modificación, porque cambian su opción de envío, su posición y su envío (17/10, JG-03).
- BITACORA registra también los inicios de sesión, los intentos fallidos y las consultas de usuarios inexistentes del acceso personal (RN-39). En esos casos el usuario puede no existir: el registro guarda el nombre de usuario escrito y la relación con USUARIO queda vacía.

### Entidades y atributos eliminados

| Entidad o atributo | Motivo | Desde |
|---|---|---|
| PRODUCTO (picking) | El producto y su Peso de Conversión vienen en cada línea del archivo de Odoo (RN-37) | 13/10 |
| CLIENTE y SECTOR | El cliente y el sector vienen en el archivo y no se guardan en ninguna base | 13/10 |
| PEDIDO | Se reemplaza por ENVIO (ruta o pedido) | 13/10 |
| RUTA (como entidad aparte, 1:1 con el pedido) | La ruta es un ENVIO de tipo ruta | 13/10 |
| DETALLE_PEDIDO | Las líneas son las de DETALLE_PEDIDO_FACTURADO, que ya guardan el Peso de Conversión | 13/10 |
| Correlativo continuo por sede | Numeración diaria (RN-52) | 13/10 |
| Una OPCION_ENVIO por camión | Dos opciones por sede; el camión se elige en la opción | 13/10 |
| EXISTENCIA, MOVIMIENTO_INVENTARIO, TRASLADO, DEVOLUCION y PEDIDO.con_devolucion | El sistema no lleva inventario (RN-40) | 29/09 |
| ROL con sistema y los dos roles opcionales de USUARIO | El acceso es por permisos y el rol es texto libre (RN-38) | 29/09 |
| USUARIO.sede (una sola) | Se reemplaza por USUARIO_SEDE | 11/10 |
| Nombre de usuario único en los dos sistemas | Único por sistema (RN-54) | 13/10 |

### Cambios respecto del ER del Documento 1 v0.1

| Cambio | Motivo |
|---|---|
| Se eliminó EDICION_ENTREGA | La ruta ya no se edita (24/09) |
| Se eliminaron INVENTARIO y las entidades de movimientos | El sistema no lleva inventario (29/09) |
| USUARIO se relaciona con permisos y sedes (N:M) en vez de con roles | Permisos y sedes por usuario (29/09 y 11/10) |
| Se agregan PEDIDO_FACTURADO, DETALLE_PEDIDO_FACTURADO y OPCION_ENVIO | Carga del archivo de Odoo y armado de envíos en Facturación (29/09, 11/10 y 13/10) |
| PEDIDO y RUTA se unen en ENVIO, con tipo, número diario y fecha y hora programadas | 13/10 |
| Se eliminan PRODUCTO, CLIENTE y SECTOR del picking | 13/10 |

## Sitio web

| Entidad | Atributos principales | Relaciones |
|---|---|---|
| CONTENIDO_INSTITUCIONAL | sección (misión, visión, historia), texto | Galería de imágenes |
| CONFIGURACION_SITIO | logotipo de INCOVSA (URL de R2), logotipo de Inquiserca (URL de R2) | Galería de la portada |
| VALOR | posición (1 a 5), imagen (URL de R2, vacía hasta que se sube) | — (13/10) |
| INDUSTRIA | nombre, descripción, orden | Galería de imágenes |
| PRODUCTO_SITIO | nombre, descripción, presentación, países de origen (texto) | Industrias (N:M), galería de imágenes |
| NOTICIA | título, texto, fecha de publicación | Usuario que la creó, galería de imágenes. Sin atributo "publicada": toda noticia guardada se publica, y se elimina en lugar de ocultarse (15/10) |
| IMAGEN | área (portada, misión, visión, historia, industria, producto, noticia), identificador del dueño, posición (1 a 5), URL de R2 | Pertenece a un contenido, una industria, un producto, una noticia o a la portada. Máximo 5 por dueño (RN-56) |
| PRODUCTO_DOCUMENTADO | nombre del producto, lote (obligatorio, números y letras), enlace de la ficha técnica, enlace de la hoja de seguridad, enlace del certificado de análisis (los tres de Google Drive, opcionales) | País de origen, usuario que lo creó (13/10) |
| SOLICITUD_CONTACTO | folio (número único que se le muestra a la persona al enviar, por ejemplo `SOL-2026-0001`; 15/10, del prototipo aprobado), motivo (solicitud, queja o reclamo), nombre, empresa, correo, código de país del teléfono, teléfono, mensaje, fecha, leída, estado (vacío, Asignado, En proceso o Solucionado), comentario del responsable (uno solo) | Sede destino (Quetzaltenango o Guatemala), país (obligatorio), departamento y municipio (obligatorios si el país es Guatemala), responsable (usuario del sitio, 0..1) |
| INFORMACION_CONTACTO | dirección, teléfono, correo, WhatsApp, horario, dirección del mapa insertado de Google Maps | Sede (solo las que tienen oficina) |
| PAIS | nombre | — |
| DEPARTAMENTO | nombre | — (los 22 departamentos de Guatemala) |
| MUNICIPIO | nombre | Departamento |

- La relación N:M entre productos públicos e industrias se implementa con **PRODUCTO_INDUSTRIA**.
- Una posición de IMAGEN no se repite en la misma galería (el área y su dueño). Como el dueño queda vacío en la portada, la misión, la visión y la historia, la base lo garantiza con índices únicos parciales (17/10, JG-03).
- PAIS es la lista de todos los países, que usan el formulario de contacto y la documentación interna.
- Las imágenes se guardan en Cloudflare R2; en la base de datos solo se guarda su dirección (URL).
- La solicitud de contacto solo se guarda en el sistema; no se envía por correo (13/10).

### Cambios respecto del ER del Documento 1 v0.1

| Cambio | Motivo |
|---|---|
| PRODUCTO_SITIO ↔ INDUSTRIA pasa de 1:N a N:M | Un producto puede pertenecer a varias industrias (23/09) |
| PRODUCTO_SITIO queda con nombre, descripción, presentación y países de origen; las imágenes pasan a IMAGEN | 11/10 y 13/10 |
| DOCUMENTO_INTERNO se reemplaza por PRODUCTO_DOCUMENTADO, con enlaces en lugar de archivos | 13/10 |
| Se agregan IMAGEN, VALOR y CONFIGURACION_SITIO | Galerías de hasta 5 imágenes, 5 valores con imagen, portada y logotipos (13/10) |
| SOLICITUD_CONTACTO agrega teléfono internacional, campos territoriales, estado, responsable, comentario y folio | 29/09, 11/10, 13/10 y 15/10 |
| NOTICIA lleva título, texto y galería de imágenes | 29/09 y 13/10 |
| NOTICIA sin el atributo "publicada"; las noticias se eliminan | 15/10 |
| INFORMACION_CONTACTO agrega el mapa de Google Maps y solo cubre las sedes con oficina | 29/09 y 11/10 |
