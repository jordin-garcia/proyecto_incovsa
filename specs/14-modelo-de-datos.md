# 14. Modelo conceptual de datos

Este es el modelo **conceptual**. Los nombres físicos, los tipos, los índices y las restricciones se definen en el esquema de Prisma. El modelo ER y el diccionario de datos del Documento 1 y del Documento 2 deben corresponder con este modelo y, después, con la base de datos real.

## Acceso

| Entidad | Atributos principales | Relaciones |
|---|---|---|
| SEDE | nombre | — |
| ROL | nombre, sistema (sitio o picking) | — |
| USUARIO | nombre completo, nombre de usuario (único), correo (opcional), contraseña cifrada, activo | Rol del sitio (0..1), rol del picking (0..1), sede (0..1; vacía = todas, solo Gerencia y Soporte IT) |

Restricción: una cuenta que no sea de Gerencia tiene rol en **un solo** sistema (RN-18). Una cuenta de Gerencia tiene el rol Gerencia en los dos.

## Sistema de picking

| Entidad | Atributos principales | Relaciones |
|---|---|---|
| PRODUCTO | código completo (único), SKU mostrado (derivado del código), unidad de medida (texto), peso2 en kg | — |
| EXISTENCIA | cantidad en kg | Producto y sede (única por par) |
| SECTOR | nombre | — |
| CLIENTE | nombre | Sector |
| CAMION | identificación, capacidad máxima en kg | Sede |
| PEDIDO | correlativo (único por sede), tipo (recoge o camión), con devolución (sí/no), fecha de envío a bodega | Sede, estado actual (ESTADO_PEDIDO), facturador (usuario), camión (0..1), piloto (usuario, 0..1) |
| DETALLE_PEDIDO | cantidad en kg, orden de captura, peso2 aplicado en kg | Pedido, cliente, producto |
| LINEA_PREPARACION | cantidad total en kg, peso2 aplicado en kg, marcado | Pedido y producto (única por par) |
| ESTADO_PEDIDO | nombre: En Preparación, Despachado, En Ruta o Entregado | — |
| HISTORIAL_ESTADO | fecha y hora | Pedido, estado, usuario |
| RUTA | número (correlativo por sede), fecha (la del envío a bodega) | Pedido (1:1), sede, camión, piloto. Se crea al enviar el pedido a bodega |
| ENTREGA_RUTA | total en kg, orden en el recorrido | Ruta, cliente |
| MOVIMIENTO_INVENTARIO | tipo, cantidad en kg, fecha y hora, motivo (si aplica) | Producto, sede, usuario, detalle de pedido (venta o devolución, 0..1), traslado (0..1), devolución (0..1) |
| TRASLADO | cantidad en kg, fecha y hora | Producto, sede de origen, sede de destino, usuario, 2 movimientos |
| DEVOLUCION | motivo, fecha y hora | Pedido, usuario, movimientos de devolución por línea |
| BITACORA | operación, entidad, identificador del registro, detalle, fecha y hora | Usuario |

Tipos de movimiento: `COMPRA`, `AJUSTE_ENTRADA`, `AJUSTE_SALIDA`, `TRASLADO_ENTRADA`, `TRASLADO_SALIDA`, `VENTA`, `DEVOLUCION`.

### Notas

- La existencia de EXISTENCIA siempre es igual a la suma de la carga inicial más las entradas menos las salidas de ese producto en esa sede. Nunca puede ser negativa (RN-24).
- Lo ya devuelto de una línea es la suma de sus movimientos de devolución y no puede superar la cantidad de la línea (RN-23).
- El orden de prioridad de Bodega y el orden de las filas de Ruta antes de la entrega **no** se guardan como historial (RN-28, RN-29). Cómo se comparten en tiempo real es una [DECISIÓN TÉCNICA].
- El marcado de LINEA_PREPARACION no guarda quién marcó (RN-20).
- El pedido guarda el Peso2 con el que se vendió (peso2 aplicado). Si después se cambia el Peso2 del producto, el pedido no cambia (RN-33).
- La edición de un movimiento (RN-34) queda en la bitácora con los valores anteriores y los nuevos.

### Cambios respecto del ER del Documento 1 v0.1

| Cambio | Motivo |
|---|---|
| Se eliminó EDICION_ENTREGA | La ruta ya no se edita (24/09) |
| Se agregaron MOVIMIENTO_INVENTARIO, TRASLADO y DEVOLUCION | Entradas y salidas (23/09) y devoluciones en Inventario (24/09) |
| El atributo PEDIDO.editado pasa a PEDIDO.con_devolucion | La marca "Con devolución" reemplaza al estado "Editado" |
| PEDIDO.id_estado_actual con ESTADO_PEDIDO: solo se guardan En Preparación, Despachado, En Ruta y Entregado | Pendiente y Cancelado no se guardan (24/09) |
| INVENTARIO pasa a llamarse EXISTENCIA | Se distingue de los movimientos |
| LINEA_PREPARACION.orden y el campo de prioridad del pedido no se guardan | La prioridad no se guarda (24/09) |
| USUARIO tiene dos roles opcionales (sitio y picking) en vez de uno | Solo la cuenta de Gerencia se usa en los dos sistemas |
| DETALLE_PEDIDO y LINEA_PREPARACION guardan el peso2 aplicado | Los pedidos conservan el Peso2 con el que se vendieron (24/09) |
| RUTA se crea al enviar el pedido a bodega | Número y fecha se asignan en ese paso (24/09) |

## Sitio web

| Entidad | Atributos principales | Relaciones |
|---|---|---|
| CONTENIDO_INSTITUCIONAL | sección, título, cuerpo, imagen (URL de R2) | — |
| INDUSTRIA | nombre, descripción, imagen (URL de R2), orden | — |
| PRODUCTO_SITIO | nombre, origen, presentación, manejo, almacenamiento, humedad, tipo, restricciones, imagen (URL de R2) | Industrias (N:M) |
| NOTICIA | título, cuerpo, imagen (URL de R2), fecha de publicación, publicada | — |
| DOCUMENTO_INTERNO | tipo (FT, HS o COA), nombre, archivo PDF (ruta en el servidor), código o lote (texto, solo en COA), fecha de carga | Productos del sitio (N:M), usuario que lo cargó |
| SOLICITUD_CONTACTO | nombre, correo, teléfono, tipo (solicitud, queja o reclamo), mensaje, fecha | — |
| INFORMACION_CONTACTO | dirección, teléfono, correo, horario | Sede |

- Las relaciones N:M se implementan con dos entidades intermedias: **PRODUCTO_INDUSTRIA** (producto del sitio e industria) y **DOCUMENTO_PRODUCTO** (documento interno y producto del sitio).
- Los campos del formulario de contacto, de las noticias y del detalle de producto se confirman con la empresa (P-17, P-22, P-23).

### Cambios respecto del ER del Documento 1 v0.1

| Cambio | Motivo |
|---|---|
| PRODUCTO_SITIO ↔ INDUSTRIA pasa de 1:N a N:M | Un producto puede pertenecer a varias industrias (23/09) |
| DOCUMENTO_INTERNO se relaciona N:M con PRODUCTO_SITIO, ya no con el PRODUCTO del picking | Los documentos se asocian a productos públicos, uno o varios (23 y 24/09) |
| Se eliminó DOCUMENTO_INTERNO.id_rol_minimo | El acceso es por rol, no por documento (24/09) |
| Se agregó DOCUMENTO_INTERNO.codigo_lote (texto) | El COA corresponde a un código con lote (24/09) |
