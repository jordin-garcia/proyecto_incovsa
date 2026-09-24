# 12. Reglas de negocio

La columna **Estado** compara cada regla con el Documento 1 v0.1. Los códigos no se reutilizan.

## Catálogo de reglas

| Código | Regla | Estado |
|---|---|---|
| RN-01 | **Conversión.** `unidades = parte entera (cantidad_kg ÷ Peso2)` y `resto_kg = cantidad_kg − unidades × Peso2`. Se muestra como "N unidades + R kg" | Modificado |
| RN-02 | El Peso2 es un número guardado en cada producto, en kg. Su valor inicial se toma **tal cual** de la columna Peso2 del Excel de la empresa. Solo se cambia en Configuración. El sistema **nunca** lo calcula a partir del texto del código | Modificado |
| RN-03 | Solo se venden cantidades exactas | **Eliminado**, reemplazado por RN-21 |
| RN-04 | **Todas las cantidades del sistema de picking están en kg**: captura, existencias, movimientos, totales y capacidades | Modificado |
| RN-05 | La conversión no redondea. Lo que no completa una unidad se muestra como resto en kg | Modificado |
| RN-06 | La existencia se descuenta al pulsar "Enviar Pedido a Bodega", como una salida por venta | Vigente |
| RN-07 | La existencia se valida al agregar o editar cada fila, sumando todas las filas del mismo producto en el pedido. Si no alcanza, el sistema alerta y no deja enviar el pedido | Modificado |
| RN-08 | El sistema lleva sus **propias** existencias por producto y sede, sin conexión con Odoo. INCOVSA e Inquiserca comparten existencias. Las sedes no se consolidan | Modificado |
| RN-09 | La única entrada es la devolución | **Eliminado**, reemplazado por RN-22 |
| RN-10 | La existencia de cada producto se expresa en kg | Modificado |
| RN-11 | Estados del pedido y sus transiciones: ver la sección siguiente | Modificado |
| RN-12 | Un pedido de envío en camión equivale a una carga completa y puede tener varias facturas y varios clientes | Vigente |
| RN-13 | La alerta de capacidad solo informa. El pedido puede superar la capacidad y enviarse igual. INCOVSA acepta que sea aproximada | Vigente |
| RN-14 | Devolución editando el registro de ruta | **Eliminado**, reemplazado por RN-23 |
| RN-15 | La clave del producto es el **código completo**. El sufijo del código es el lote de Odoo, **no es único** y solo se muestra como "SKU" informativo | Modificado |
| RN-16 | No hay borradores. Un pedido enviado a bodega no se edita ni se cancela | Vigente |
| RN-17 | Los roles operativos solo ven los datos de su sede. Gerencia y Soporte IT ven todas | Vigente |
| RN-18 | Solo Gerencia usa la misma cuenta en el sitio y en el picking. Cualquier otra cuenta tiene **un solo rol en un solo sistema** | Vigente (reconfirmada el 24/09) |
| RN-19 | Lo que cada usuario puede hacer con los documentos internos depende de su **rol**, no del documento | Modificado |
| RN-20 | El marcado de filas en Bodega no registra quién marcó | Vigente |
| RN-21 | Se permiten **ventas fraccionadas**: la cantidad no tiene que ser múltiplo del Peso2 | Nuevo |
| RN-22 | **Entradas:** compras, ajustes positivos, traslados recibidos y devoluciones. **Salidas:** ventas, ajustes negativos y traslados enviados | Nuevo |
| RN-23 | La devolución se registra en Inventario ligada a un pedido Despachado o Entregado, de cualquier tipo. Se hace por línea, sin superar lo vendido menos lo ya devuelto, con motivo obligatorio. Puede haber varias por pedido. Devuelve la cantidad al mismo código y a la sede del pedido, y marca el pedido "Con devolución" | Nuevo |
| RN-24 | Ninguna salida (venta, ajuste negativo o traslado) puede dejar una existencia por debajo de cero | Nuevo |
| RN-25 | Un traslado genera, en la misma transacción, la salida en la sede de origen y la entrada en la de destino | Nuevo |
| RN-26 | Todo ajuste lleva motivo obligatorio | Nuevo |
| RN-27 | Una compra solo registra producto, sede y cantidad. Si el producto no existe, primero se crea en Configuración | Nuevo |
| RN-28 | La prioridad en Bodega (orden de pedidos y de filas) la puede cambiar cualquier usuario con acceso al módulo. Se comparte en tiempo real y no se guarda en el historial | Nuevo |
| RN-29 | El recorrido que se guarda es el orden de las filas al pulsar "Pedido Entregado" | Nuevo |
| RN-30 | El número de ruta es un correlativo por sede. El número y la fecha (la del envío a bodega) se asignan al pulsar "Enviar Pedido a Bodega". Un camión puede hacer varias rutas al día | Nuevo |
| RN-31 | Un pedido solo se guarda al pulsar "Enviar Pedido a Bodega" y se identifica con un **correlativo por sede**. No se registra el número de factura | Nuevo |
| RN-32 | El sistema no controla lotes ni ubicaciones dentro de la bodega | Nuevo |
| RN-33 | Al enviar un pedido se guarda el Peso2 vigente de cada producto. Si después cambia el Peso2 del producto, **el pedido conserva el Peso2 con el que se vendió** | Nuevo |
| RN-34 | Gerencia y Soporte IT pueden editar movimientos de inventario. La existencia se recalcula, no puede quedar negativa (RN-24) y la bitácora registra la edición con los valores anteriores y nuevos. El alcance exacto está pendiente (P-50) | Nuevo |

## Conversión (RN-01, RN-02, RN-05, RN-21)

```
unidades = parte entera (cantidad_kg ÷ Peso2)
resto_kg = cantidad_kg − (unidades × Peso2)
```

| Cantidad (kg) | Peso2 (kg) | Resultado |
|---|---|---|
| 50 | 25 | 2 unidades (cómo se muestra el resto 0, P-26) |
| 60 | 25 | 2 unidades + 10 kg |
| 10 | 25 | 0 unidades + 10 kg |
| 55 | 55 | 1 unidad (ejemplo de la contraparte) |
| 110 | 55 | 2 unidades (ejemplo de la contraparte) |

- La conversión se hace sobre la cantidad **agrupada por código** en Bodega (RF-SL-21), con el Peso2 guardado en el pedido (RN-33).
- Los cálculos usan números decimales exactos, no punto flotante ([DECISIÓN TÉCNICA] sobre el tipo y la precisión).
- **Casos de prueba obligatorios:** los 15 casos exactos que la empresa validó (respuesta del 23/09). Todos existen en el catálogo actual con el mismo Peso2. Hay que agregar casos fraccionados y casos con datos incorrectos (Documento 6, sección 9).

| # | Código | Cantidad | Peso2 | Unidades esperadas |
|---|---|---|---|---|
| 1 | SULFATO DE SODIO-USA-SAC/0025KG-7896 | 25 | 25 | 1 |
| 2 | SULFATO DE SODIO-USA-SAC/0025KG-2318 | 25 | 25 | 1 |
| 3 | HIDROSULFITO DE SODIO-IND-TON/0050KG-1104 | 50 | 50 | 1 |
| 4 | METANOL-GUA-TON/0055GL-9047 | 55 | 55 | 1 |
| 5 | NEGRO SULFUROSO HIGH QUALITY-CHI-SAC/0025KG-0163 | 50 | 25 | 2 |
| 6 | NEGRO SULFUROSO-CHI-SAC/0025KG-4346 | 50 | 25 | 2 |
| 7 | SULFURO DE SODIO-TUR-SAC/0025KG-7305 | 50 | 25 | 2 |
| 8 | SULFATO DE ALUMINIO TUR-SAC/0025KG-9232 | 50 | 25 | 2 |
| 9 | SODA ASH-TUR-SAC/0025KG-5275 | 50 | 25 | 2 |
| 10 | SODA CAUSTICA-MEX-SAC/0025KG-0249 | 75 | 25 | 3 |
| 11 | INCO-FITEX-CHI-GAR/0030KG-5672T | 90 | 30 | 3 |
| 12 | SODA CAUSTICA-CHI-SAC/0025KG-0150 | 500 | 25 | 20 |
| 13 | SULFURO DE SODIO-MEX-SAC/0025KG-1107 | 500 | 25 | 20 |
| 14 | SODA CAUSTICA-CHI-SAC/0025KG-0150 | 800 | 25 | 32 |
| 15 | SODA CAUSTICA-CHI-SAC/0025KG-0150 | 1,000 | 25 | 40 |

## Estados del pedido (RN-11)

| Estado | Cuándo | ¿Se guarda? |
|---|---|---|
| Pendiente | Mientras se captura en Facturación | No, solo se ve en pantalla |
| Cancelado | Al pulsar Cancelar en Facturación | No, pero la bitácora registra la cancelación |
| En Preparación | Al pulsar "Enviar Pedido a Bodega" | Sí |
| Despachado | Cliente recoge en bodega, al pulsar "Pedido Despachado" en Bodega | Sí |
| En Ruta | Envío en camión, al pulsar "Pedido Despachado" en Bodega (automático) | Sí |
| Entregado | Al pulsar "Pedido Entregado" en Ruta | Sí |

```
Cliente recoge en bodega:  Pendiente → En Preparación → Despachado
Envío en camión:           Pendiente → En Preparación → En Ruta → Entregado
Cancelación:               Pendiente → Cancelado (no se guarda el pedido)
```

- **"Con devolución"** es una marca, no un estado. Se agrega a un pedido Despachado o Entregado cuando se le registra al menos una devolución, y el estado sigue igual. **Reemplaza al estado "Editado"** del Documento 1.
- Cada cambio de estado que se guarda registra la fecha, la hora y el usuario.

## Bitácora

- Registra las operaciones de todos los usuarios del picking, entre ellas:
  - envío de pedidos;
  - cancelaciones (sin pedido guardado);
  - cambios de estado;
  - cierres de ruta;
  - compras, ajustes, traslados, devoluciones y ediciones de movimientos;
  - creación, edición y eliminación de productos, camiones, clientes, sectores y usuarios;
  - restablecimiento de contraseñas.
- Guarda el registro histórico de cada ruta, desde Facturación hasta el cierre.
- **No se registran:**
  - el marcado de filas en Bodega (RN-20);
  - el reordenamiento de prioridad en Bodega (RN-28);
  - el reordenamiento de filas en Ruta antes de la entrega (solo se guarda el recorrido final, RN-29).
- Si la bitácora también registra las operaciones del sitio web (contenido, documentos, usuarios del sitio) está pendiente (P-32).
