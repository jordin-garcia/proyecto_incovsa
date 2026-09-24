# 02. Glosario

Significado exacto de los términos del proyecto. Si un término se usa de otra forma en otro documento, vale lo que dice aquí.

| Término | Significado |
|---|---|
| **Código de producto** o **código completo** | Identificador único de un producto en el sistema de picking. Se usa el formato del Excel de la empresa: `NOMBRE-ORIGEN-ENVASE/PRESENTACIÓN[-CALIDAD O USO]-SUFIJO`. Ejemplo: `SODA ASH-TUR-SAC/0025KG-5275`. **Es la clave única del producto**, y dos códigos distintos son dos productos distintos, cada uno con su propia existencia |
| **Sufijo** o **"SKU"** | Último segmento del código, después del último guion. Corresponde al **número de lote de Odoo** (confirmado el 23/09). **No es único:** en el catálogo de prueba hay 491 sufijos distintos entre 856 productos, y un mismo sufijo aparece en productos diferentes. Se muestra en las tablas como dato informativo y **nunca se usa como clave** |
| **Lote** | Concepto de Odoo. Este sistema no controla lotes; el lote solo aparece como sufijo del código |
| **Peso2** | Peso en **kilogramos** de una unidad física del producto (saco, tonel, garrafa, caja, unidad). Es el divisor de la conversión. Se guarda como número en cada producto y solo se cambia desde Configuración |
| **Unidad** | Envase o pieza física que el operario saca de la bodega: saco, tonel, garrafa, caja, IBC, pieza, etc. |
| **Conversión** | Cálculo de cuántas unidades completas y cuántos kg sueltos corresponden a una cantidad en kg. Ver RN-01 en [12-reglas-de-negocio.md](12-reglas-de-negocio.md) |
| **Resto** | Kilogramos que sobran después de contar las unidades completas en una venta fraccionada. Ejemplo: 60 kg con Peso2 25 son "2 unidades + 10 kg" |
| **Venta fraccionada** | Venta cuya cantidad no es múltiplo del Peso2. Está permitida |
| **Existencia** | Cantidad actual, en kg, de un producto en una sede |
| **Sede** | Quetzaltenango, Guatemala o Escuintla. Cada sede tiene su propio inventario. Cada usuario operativo tiene una sola sede, definida en su cuenta |
| **Pedido** | Registro que el facturador crea en Facturación a partir de facturas ya emitidas en Odoo. Puede contener varios clientes y varios productos. Se identifica con un **correlativo interno por sede** |
| **Tipo de pedido** | "Cliente recoge en bodega" o "Envío en camión". Un pedido de envío en camión equivale a **una carga completa de camión** |
| **Línea del pedido** | Una fila de Facturación: cliente, producto y cantidad en kg |
| **Línea de preparación** | Una fila de Bodega: un producto del pedido con la suma de su cantidad entre todos los clientes, más su conversión a unidades |
| **Ruta** | Registro del recorrido de un pedido de envío en camión. Tiene número (correlativo por sede), fecha, camión y piloto |
| **Recorrido** | Orden de los clientes de una ruta en el momento en que el piloto pulsa "Pedido Entregado" |
| **Movimiento de inventario** | Cualquier entrada o salida que cambia una existencia |
| **Entrada** | Movimiento que suma existencia: compra, ajuste positivo, traslado recibido o devolución |
| **Salida** | Movimiento que resta existencia: venta, ajuste negativo o traslado enviado |
| **Compra** | Entrada de producto a una sede. Solo registra producto, sede y cantidad |
| **Ajuste** | Corrección positiva o negativa de una existencia. Motivo obligatorio |
| **Traslado** | Movimiento de producto de una sede a otra. Genera, en una sola operación, una salida en la sede de origen y una entrada en la de destino |
| **Venta** | Salida automática que ocurre al pulsar "Enviar Pedido a Bodega" |
| **Devolución** | Entrada ligada a un pedido ya Despachado o Entregado, por las cantidades que el cliente devuelve |
| **Marca "Con devolución"** | Indicador que se agrega a un pedido que tiene al menos una devolución. **No es un estado** y no reemplaza al estado del pedido |
| **Bitácora** | Registro de las operaciones de los usuarios. Ver [12-reglas-de-negocio.md](12-reglas-de-negocio.md) |
| **Tablero** | El módulo de Bodega proyectado en una TV o usado en una tableta |
| **Producto público** | Producto del catálogo informativo del sitio web. **Es una entidad distinta** del producto del picking y no tiene lote ni Peso2 |
| **Documento interno** | Archivo PDF de la documentación interna del sitio. Hay tres tipos: ficha técnica (FT/TDS), hoja de seguridad (HS/MSDS) y certificado de análisis (COA) |
| **Sitio de Google** | Página actual de la empresa en Google Sites (<https://sites.google.com/view/incovsa>). Es una fuente de contenido, no un sistema a integrar |
