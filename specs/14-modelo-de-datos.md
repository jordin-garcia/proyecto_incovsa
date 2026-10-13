# 14. Modelo conceptual de datos

Este es el modelo **conceptual**. Los nombres físicos, los tipos, los índices y las restricciones se definen en el esquema de Prisma. El modelo ER y el diccionario de datos del Documento 1 y del Documento 2 deben corresponder con este modelo y, después, con la base de datos real.

> **Cambios del 29/09/2026 (reunión 4) y del 11/10/2026.** Se quitan las entidades de inventario; los accesos pasan a permisos y sedes por usuario; aparecen el pedido facturado (una referencia de Odoo, de un cliente), el tablero y las opciones de envío, y el pedido de Bodega reúne varios pedidos facturados; el producto del picking solo tiene nombre y Peso de Conversión; cambian varias entidades del sitio. Lo que depende de un pendiente está marcado con su P-xx.

## Acceso

| Entidad | Atributos principales | Relaciones |
|---|---|---|
| SEDE | nombre, prefijo de Odoo (`XE`, `GT`, `ESC`), tiene oficina (sí/no) | — |
| USUARIO | nombre completo, nombre de usuario (único), correo (opcional), contraseña cifrada, activo, **rol (texto libre)**, sistema (sitio o picking) | Permisos (N:M), sedes (N:M, solo picking) |
| PERMISO | código, sistema (sitio o picking), módulo, acción, descripción | — |
| USUARIO_PERMISO | — | Usuario y permiso (única por par) |
| USUARIO_SEDE | — | Usuario del picking y sede (única por par) |

- Cada sistema tiene **sus propios usuarios** y su propia administración (RN-18). Las cuentas con rol **Gerencia** o **Soporte** tienen acceso total a los dos sistemas y a todas las sedes (RN-38). Cómo se representa eso (rol especial, o todos los permisos y sedes asignados) es una [DECISIÓN TÉCNICA].
- El catálogo de permisos está en [03-roles-y-accesos.md](03-roles-y-accesos.md).
- Los pilotos son los usuarios del picking con rol "Piloto" (RN-46). Cómo se compara el texto (por ejemplo, sin distinguir mayúsculas) es una [DECISIÓN TÉCNICA].
- Al eliminar un usuario se conservan la bitácora y los registros donde aparece ([DECISIÓN TÉCNICA] P-42).

## Sistema de picking

| Entidad | Atributos principales | Relaciones |
|---|---|---|
| PRODUCTO | **nombre (único)** con el formato de Odoo y sin lote, peso de conversión en kg | — |
| SECTOR | nombre | — |
| CLIENTE | nombre | Sector |
| CAMION | identificación, capacidad máxima en kg | Sede |
| OPCION_ENVIO | tipo (camión o cliente recoge en bodega) | Sede, camión (si es de camión), piloto asignado (usuario con rol "Piloto", 0..1) |
| PEDIDO_FACTURADO | **número de Odoo** (tercer segmento de la Referencia), nombre del cliente y sector del cliente (los de la base, o los del archivo si el cliente no se guardó), fecha de carga | Sede, cliente de la base (0..1), usuario que lo cargó, opción de envío (0..1; vacía = en el tablero), pedido (0..1; se llena al enviar) |
| DETALLE_PEDIDO_FACTURADO | cantidad en kg, orden en el archivo | Pedido facturado, producto |
| PEDIDO | **correlativo por sede**, tipo (recoge o camión), fecha de envío a bodega | Sede, estado actual (ESTADO_PEDIDO), usuario que lo envió, pedidos facturados (1:N) |
| DETALLE_PEDIDO | cantidad en kg, peso de conversión aplicado en kg | Pedido, pedido facturado (de ahí sale el cliente), producto |
| LINEA_PREPARACION | cantidad total en kg, peso de conversión aplicado en kg, marcado | Pedido y producto (única por par) |
| ESTADO_PEDIDO | nombre: En Preparación, Despachado, En Ruta o Entregado | — |
| HISTORIAL_ESTADO | fecha y hora | Pedido, estado, usuario |
| RUTA | número (correlativo por sede), fecha (la del envío a bodega) | Pedido (1:1), sede, camión, piloto. Se crea al enviar a bodega una opción de camión |
| ENTREGA_RUTA | cliente, total en kg, orden en el recorrido | Ruta. Una fila por cliente, aunque tenga varios pedidos facturados en la ruta (RN-49) |
| BITACORA | operación, entidad, identificador del registro, detalle, fecha y hora | Usuario |

### Notas

- **Pedido facturado** = una referencia de Odoo de un solo cliente. **Pedido** = lo que se envía a Bodega desde una opción de envío; reúne uno o varios pedidos facturados y puede tener varios clientes (11/10).
- El tablero de pedidos facturados son los PEDIDO_FACTURADO de la sede sin opción de envío y sin pedido. Se guardan en la base de datos, igual que la opción de envío asignada (RN-48). Cancelar una opción les quita la opción de envío y regresan al tablero.
- Eliminar un pedido facturado del tablero lo borra o lo marca como eliminado ([DECISIÓN TÉCNICA]); queda en la bitácora.
- No se valida que el número de Odoo no se repita, porque viene de Odoo. Si la base de datos lo declara único por sede es una [DECISIÓN TÉCNICA].
- Al corregir el sector en el tablero se actualiza CLIENTE.sector; si el cliente no está en la base, solo cambia el sector del pedido facturado (RN-45).
- El orden de prioridad de Bodega y el orden de las filas de Ruta antes de la entrega **no** se guardan como historial (RN-28, RN-29). Cómo se comparten en tiempo real es una [DECISIÓN TÉCNICA].
- El marcado de LINEA_PREPARACION no guarda quién marcó (RN-20).
- El pedido guarda el Peso de Conversión con el que se vendió. Si después se cambia en el producto, el pedido no cambia (RN-33).
- BITACORA registra también los inicios de sesión de los dos sistemas (RN-39) y, desde el 12/10, los intentos fallidos (RNF-15). En un intento fallido el usuario puede no existir: el registro guarda el nombre de usuario escrito y la relación con USUARIO queda vacía.

### Entidades y atributos eliminados

| Entidad o atributo | Motivo | Desde |
|---|---|---|
| EXISTENCIA | El sistema no lleva inventario (RN-40) | 29/09 |
| MOVIMIENTO_INVENTARIO y sus tipos (`COMPRA`, `AJUSTE_ENTRADA`, `AJUSTE_SALIDA`, `TRASLADO_ENTRADA`, `TRASLADO_SALIDA`, `VENTA`, `DEVOLUCION`) | Igual | 29/09 |
| TRASLADO | Igual | 29/09 |
| DEVOLUCION | Igual | 29/09 |
| PEDIDO.con_devolucion | Ya no hay devoluciones | 29/09 |
| ROL con sistema (sitio o picking) y los dos roles opcionales de USUARIO | El acceso es por permisos y el rol es texto libre (RN-38) | 29/09 |
| USUARIO.sede (una sola) | Se reemplaza por USUARIO_SEDE (varias sedes) | 11/10 |
| PEDIDO.camion y PEDIDO.piloto | Están en la RUTA (y en la OPCION_ENVIO antes de enviar) | 11/10 |
| DETALLE_PEDIDO.cliente | El cliente sale del pedido facturado de cada línea | 11/10 |
| PRODUCTO.codigo_completo, PRODUCTO.sku y PRODUCTO.unidad_medida | El producto solo tiene nombre y Peso de Conversión; el SKU no se muestra y "Unidad de Medida" no se usa | 11/10 |

### Cambios respecto del ER del Documento 1 v0.1

| Cambio | Motivo |
|---|---|
| Se eliminó EDICION_ENTREGA | La ruta ya no se edita (24/09) |
| El atributo PEDIDO.editado se eliminó | El estado "Editado" y la marca "Con devolución" ya no existen (29/09) |
| PEDIDO.id_estado_actual con ESTADO_PEDIDO: solo se guardan En Preparación, Despachado, En Ruta y Entregado | Pendiente y Cancelado no se guardan (24/09) |
| Se eliminó INVENTARIO | El sistema no lleva inventario (29/09) |
| LINEA_PREPARACION.orden y el campo de prioridad del pedido no se guardan | La prioridad no se guarda (24/09) |
| USUARIO se relaciona con permisos y sedes (N:M) en vez de con roles | Permisos y sedes por usuario (29/09 y 11/10) |
| DETALLE_PEDIDO y LINEA_PREPARACION guardan el peso de conversión aplicado | Los pedidos conservan el Peso de Conversión con el que se vendieron (24/09) |
| RUTA se crea al enviar el pedido a bodega | 24/09 |
| Se agregan PEDIDO_FACTURADO, DETALLE_PEDIDO_FACTURADO y OPCION_ENVIO | Carga del archivo de Odoo y armado de pedidos en Facturación (29/09 y 11/10) |

## Sitio web

| Entidad | Atributos principales | Relaciones |
|---|---|---|
| CONTENIDO_INSTITUCIONAL | sección (historia, misión, visión, valores, logotipo de Inquiserca), título, cuerpo, imagen (URL de R2; opcional en historia y valores) | — |
| INDUSTRIA | nombre, descripción, imagen (URL de R2), orden | — |
| PRODUCTO_SITIO | nombre, descripción, presentación, países de origen (texto), imagen (URL de R2) | Industrias (N:M) |
| NOTICIA | título, texto, fotografía (URL de R2), fecha de publicación, publicada | Usuario que la creó |
| DOCUMENTO_INTERNO | tipo (FT, HS o COA), nombre del archivo, archivo PDF (ruta en el servidor), nombre del producto (texto), lote (texto con números y letras; obligatorio en COA), fecha de carga | País de origen, usuario que lo cargó |
| SOLICITUD_CONTACTO | motivo (solicitud, queja o reclamo), nombre, empresa, correo, código de país del teléfono, teléfono, mensaje, fecha, estado (vacío, Asignado, En proceso o Solucionado), comentario del responsable (uno solo) | Sede destino (Quetzaltenango o Guatemala), país, departamento o estado, municipio (los tres opcionales; departamento y municipio solo si el país es Guatemala), responsable (usuario del sitio, 0..1) |
| INFORMACION_CONTACTO | dirección, teléfono, correo, WhatsApp, horario, dirección del mapa insertado de Google Maps | Sede (solo las que tienen oficina) |
| PAIS | nombre | — |
| DEPARTAMENTO | nombre | — (los 22 departamentos de Guatemala) |
| MUNICIPIO | nombre | Departamento |

- La relación N:M entre productos e industrias se implementa con **PRODUCTO_INDUSTRIA**.
- PAIS es la lista de todos los países, que usan el formulario de contacto y la documentación interna. DEPARTAMENTO y MUNICIPIO son solo de Guatemala (11/10).

### Cambios respecto del ER del Documento 1 v0.1

| Cambio | Motivo |
|---|---|
| PRODUCTO_SITIO ↔ INDUSTRIA pasa de 1:N a N:M | Un producto puede pertenecer a varias industrias (23/09) |
| PRODUCTO_SITIO queda con nombre, descripción, presentación, países de origen e imagen; se eliminan manejo, almacenamiento, humedad, tipo y restricciones | 11/10 |
| DOCUMENTO_INTERNO ya no se relaciona con el PRODUCTO del picking ni con PRODUCTO_SITIO: guarda nombre del producto, país de origen y lote | 29/09 y 11/10. Reemplaza la relación N:M con PRODUCTO_SITIO del 24/09 y su entidad DOCUMENTO_PRODUCTO |
| Se eliminó DOCUMENTO_INTERNO.id_rol_minimo | El acceso es por permisos, no por documento |
| DOCUMENTO_INTERNO.codigo_lote (solo COA) pasa a lote (números y letras, obligatorio en COA) | 29/09 y 11/10 |
| SOLICITUD_CONTACTO agrega teléfono internacional, campos territoriales, estado, responsable y comentario | 29/09 y 11/10 |
| NOTICIA lleva fotografía, título y texto | 29/09 |
| INFORMACION_CONTACTO agrega el mapa de Google Maps y solo cubre las sedes con oficina | 29/09 y 11/10 |
