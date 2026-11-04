# Productos y catálogo operativo

## Manejo de productos en el sistema logístico

### Objetivo
Comprender el modelo operativo mediante el cual el sistema gestiona los productos químicos y materias primas de INCOVSA, eliminando la necesidad de alimentar manualmente un catálogo interno y garantizando la sincronización con el ERP institucional.

### Requisitos previos
- Permiso de Facturación o de Bodega en la sede de trabajo.

### Procedimiento y flujo de productos

A partir de los acuerdos operativos del 13 de octubre de 2026, el sistema de picking no almacena ni requiere la creación manual de un catálogo propio de productos:

1. **Origen de la información:** los nombres de los productos, sus descripciones y especificaciones provienen exclusivamente del archivo exportado del sistema Odoo.
2. **Lectura directa:** al cargar las salidas facturadas en el módulo de Facturación, el sistema lee cada fila y asocia automáticamente el nombre del producto indicado en la columna `Movimientos de stock/Producto`.
3. **Presentación en pantalla:** los productos aparecen identificados con su denominación oficial completa (por ejemplo, `SODA ASH (CHI-SAC/0040KG)` o `BICARBONATO DE SODIO USP (FRA-SAC/0025KG)`), tal como se ilustra en el tablero de pedidos facturados (véase la {{fig:productos-facturacion}}).

![Visualización de productos en el tablero de pedidos facturados](figuras/figura-06-tablero-pedidos-facturados.png){#fig:productos-facturacion}

4. **Identificación por lote:** cada línea de producto conserva de forma estricta el número de lote extraído de la columna `Movimientos de stock/Números de serie` del archivo de Odoo, permitiendo el control visual y la trazabilidad de salida en la bodega.

### Estructura de un producto en el sistema

Cada producto procesado en una orden de salida contiene los siguientes atributos operativos:

- **Nombre comercial:** denominación oficial registrada en la factura.
- **Lote de producción:** código alfanumérico que identifica la partida física del producto almacenado.
- **Peso de Conversión:** peso estándar en kilogramos asignado a cada saco, tambo, garrafa o caja.
- **Cantidad facturada:** peso total vendido al cliente expresado en kilogramos.

### Resultado esperado
El personal de facturación y bodega visualiza con exactitud los productos vendidos sin desfases ni discrepancias respecto a lo facturado en el ERP.

> **Advertencia:** Dado que el sistema logístico no modifica los nombres de los productos, cualquier ajuste en la descripción o en el código del artículo debe corregirse directamente en Odoo antes de exportar la planilla de salidas.

