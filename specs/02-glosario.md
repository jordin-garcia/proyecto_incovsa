# 02. Glosario

Significado exacto de los términos del proyecto. Si un término se usa de otra forma en otro documento, vale lo que dice aquí.

## Términos vigentes

| Término | Significado |
|---|---|
| **Producto** (picking) | Nombre del producto **tal como viene** en la columna `Movimientos de stock/Producto` del archivo de Odoo, con el formato `NOMBRE (ORIGEN-ENVASE/PRESENTACIÓN)`. Por ejemplo, `SODA ASH (CHI-SAC/0040KG)`. Desde el 14/10 el picking **no tiene catálogo de productos**: el producto es un dato de cada línea del pedido facturado |
| **Lote** | Concepto de Odoo. En el picking, el lote de cada línea viene en la columna `Movimientos de stock/Números de serie` del archivo de Odoo, se guarda y se muestra resaltado en Bodega (14/10). El sistema no controla lotes: solo los muestra. En la documentación interna del sitio, el lote es un dato **obligatorio** del producto documentado y admite números y letras (14/10) |
| **Peso de Conversión** | Peso en **kilogramos** de una unidad física del producto (saco, tonel, garrafa, caja, unidad). Es el divisor de la conversión. Desde el 13/10 se toma de la columna `Movimientos de stock/Producto/Peso` del archivo de Odoo, línea por línea, y se guarda con la línea (RN-37). Hasta el 11/10 se llamaba "Peso2", como la columna `Peso2` del Excel de la empresa |
| **Unidad** | Envase o pieza física que el operario saca de la bodega: saco, tonel, garrafa, caja, IBC, pieza, etc. |
| **Conversión** | Cálculo de cuántas unidades completas y cuántos kg sueltos corresponden a una cantidad en kg. Ver RN-01 en [12-reglas-de-negocio.md](12-reglas-de-negocio.md) |
| **Resto** | Kilogramos que sobran después de contar las unidades completas en una venta fraccionada. Ejemplo: 60 kg con Peso de Conversión 25 son "2 unidades + 10 kg" |
| **Venta fraccionada** | Venta cuya cantidad no es múltiplo del Peso de Conversión. Está permitida |
| **Sede** | Quetzaltenango, Guatemala o Escuintla. En las referencias de Odoo se identifican con los prefijos `XE` (Xela), `GT` y `ESC`. A cada usuario del picking se le marcan las sedes a las que tiene acceso. En el sitio solo se muestran Quetzaltenango y Guatemala, que tienen oficinas |
| **Archivo de Odoo** | Archivo .xlsx que el facturador exporta de Odoo y sube a Facturación. Tiene la estructura de `Data Odo Para Picking.xlsx` ([13-datos-maestros.md](13-datos-maestros.md)). Trae referencias de una sola bodega. Sus datos se usan **tal como vienen**, sin validarlos contra ningún catálogo (14/10) |
| **Referencia** | Columna del archivo de Odoo con el formato `BODEGA/SALIDA/NÚMERO`, por ejemplo `XE-IN/SALIDA/03539`. El primer segmento es la bodega, el segundo indica que es una salida y el tercero es el **número de pedido facturado** |
| **Pedido facturado** | Una referencia de Odoo, de **un solo cliente**, cargada en Facturación. Se identifica con su número de Odoo. Su cliente y su sector son los de las columnas `Contacto` y `Contacto/Ciudad` del archivo (14/10) |
| **Tablero de pedidos facturados** | Lado izquierdo de Facturación, con los pedidos facturados que no se han enviado. Se guarda en la base de datos |
| **Opción de envío** | Cada una de las **dos** columnas del lado derecho de Facturación a las que se arrastran los pedidos facturados: **"Envío por camión"** (con el camión y el piloto elegidos de listas de la sede) y **"Cliente recoge en bodega"** (14/10). Cada una tiene su fecha y hora programadas y sus botones "Enviar a Bodega" y "Cancelar" |
| **Envío a bodega** | Término general para lo que el facturador manda a Bodega desde una opción de envío: uno o varios pedidos facturados, de uno o varios clientes. Puede ser una **ruta** o un **pedido** (14/10). En el modelo de datos es la entidad ENVIO |
| **Ruta** | Envío a bodega que sale de la opción **"Envío por camión"** (14/10). Tiene número (correlativo diario por sede), fecha, fecha y hora programadas, camión y piloto, y después de Bodega pasa al módulo de Ruta |
| **Pedido** | Envío a bodega que sale de la opción **"Cliente recoge en bodega"** (14/10). Tiene número (correlativo diario por sede), fecha y fecha y hora programadas. Desde el 14/10 la palabra "pedido" se usa solo para estos envíos; los de camión se llaman rutas |
| **Correlativo diario** | Número de una ruta o de un pedido. Empieza en 1 cada día, en cada sede, y las rutas y los pedidos llevan su propia numeración (14/10). Una ruta o un pedido se identifica con su número y su fecha |
| **Fecha y hora programadas** | Fecha y hora en que el facturador tiene programado enviar (ruta) o despachar (pedido) un envío a bodega. Se escriben en la opción de envío, son obligatorias y se muestran en Bodega (14/10) |
| **Tipo de envío** | "Ruta" (envío por camión) o "Pedido" (cliente recoge en bodega) |
| **Línea del pedido facturado** | Una fila del archivo de Odoo: producto, lote, Peso de Conversión y cantidad en kg |
| **Línea de preparación** | Una fila de Bodega: un producto **con un lote y un Peso de Conversión**, con la suma de su cantidad entre todos los clientes del envío y su conversión a unidades (14/10) |
| **Recorrido** | Orden de los clientes de una ruta en el momento en que el piloto pulsa "Ruta Entregada" (antes "Pedido Entregado") |
| **Piloto** | Usuario del picking cuyo rol es "Piloto" |
| **Bitácora** | Registro de las acciones de los usuarios, incluidos los inicios de sesión. Se consulta en la pestaña "Bitácora" de Reportes (RN-39) |
| **Tablero** | El módulo de Bodega en pantalla completa, proyectado en una TV o usado en una tableta. Tiene modo claro y modo oscuro |
| **Modo claro** | Aspecto del tablero con fondo claro y acentos verdes. Es el que el prototipo llamaba "Tableta" |
| **Modo oscuro** | Aspecto del tablero en escala de negros y grises. Reemplaza al que el prototipo llamaba "TV", que era en escala de verdes |
| **Permiso** | Autorización de un usuario para entrar a un módulo y hacer una acción en él. Se marca con una casilla en el formulario del usuario ([03-roles-y-accesos.md](03-roles-y-accesos.md)) |
| **Rol** | Texto libre del usuario que escriben Gerencia o Soporte. **No** define los accesos, salvo en los roles predeterminados Gerencia y Soporte. El rol "Piloto" identifica a los pilotos |
| **Gerencia** y **Soporte** | Únicos roles predeterminados. Tienen acceso total a los dos sistemas y a todas las sedes |
| **Producto público** | Producto del catálogo informativo del sitio web: nombre, descripción, presentación, países de origen, imágenes e industrias. No tiene relación con los productos del picking |
| **Productos Recomendados** | Sección al final del detalle de un producto público, que siempre aparece |
| **Producto documentado** | Registro de la documentación interna del sitio (14/10): **nombre del producto, país de origen, lote** (obligatorio) y los **enlaces de Google Drive** de su ficha técnica, su hoja de seguridad y su certificado de análisis. Reemplaza al "documento interno" que se subía como PDF |
| **Documento técnico** | Cada uno de los tres documentos de un producto documentado: ficha técnica (FT/TDS), hoja de seguridad (HS/MSDS) y certificado de análisis (COA). Desde el 14/10 se guardan como **enlaces de Google Drive**; el sistema no guarda archivos PDF |
| **Solicitud de contacto** | Mensaje enviado desde el formulario de Contacto. Su motivo es solicitud, queja o reclamo. Se guarda en el sistema y **no se envía por correo** (14/10). Se le puede marcar el estado Asignado, En proceso o Solucionado; al llegar no tiene estado |
| **Galería de imágenes** | Conjunto de **hasta 5 imágenes** de un área del sitio público. Si tiene más de una, rotan cada 5 segundos; si tiene una, se muestra fija (14/10, RN-56) |
| **Imagen de portada** | Galería de la portada de Inicio. Sus imágenes son también las de los encabezados de las demás páginas públicas (14/10) |
| **Presentación dinámica** | Animación de aparición y desaparición de las imágenes y tarjetas al desplazarse en el sitio (RF-SW-16) |
| **Prototipo aprobado** | El prototipo de simulación presentado el 29/09 y el 13/10 ([20-prototipo-aprobado.md](20-prototipo-aprobado.md)) |
| **Sitio de Google** | Página actual de la empresa en Google Sites (<https://sites.google.com/view/incovsa>). Es una fuente de contenido, no un sistema a integrar |
| **Fecha de creación** | Fecha y hora exactas en que se guarda cada registro en la base de datos. La pone el sistema de forma automática (14/10) |

## Términos que ya no aplican

Se conservan solo para entender documentos anteriores.

| Término | Significado anterior | Ya no aplica desde |
|---|---|---|
| Catálogo de productos del picking | Productos con nombre y Peso de Conversión, administrados en Configuración | 14/10 |
| Clientes y sectores del picking | Base de clientes con su sector, administrada en Configuración y usada para validar el archivo de Odoo | 14/10 |
| Corrección del sector | Cambio del sector del cliente en la tarjeta del tablero, guardado en la base de clientes | 14/10 |
| Pedido (como envío por camión) | Hasta el 13/10, "pedido" era cualquier envío a bodega, y el de camión tenía además su ruta. Desde el 14/10 el envío por camión es la ruta | 14/10 |
| Correlativo por sede (continuo) | Numeración de pedidos y rutas que no se reiniciaba | 14/10 |
| Una opción por camión | Una columna en Facturación por cada camión de la sede | 14/10 |
| Documento interno (PDF) | Archivo PDF de la documentación interna, guardado en el servidor | 14/10 |
| Sufijo o "SKU" | Último segmento del código de `Picking II`, que corresponde al lote de Odoo | 11/10 |
| Código de producto o código completo | Clave del producto con el formato `NOMBRE-ORIGEN-ENVASE/PRESENTACIÓN[-CALIDAD]-SUFIJO` de `Picking II` | 11/10 |
| Unidad de Medida | Texto informativo de la presentación | 11/10 |
| Existencia | Cantidad actual, en kg, de un producto en una sede | 29/09 |
| Movimiento de inventario | Cualquier entrada o salida que cambiaba una existencia | 29/09 |
| Entrada | Compra, ajuste positivo, traslado recibido o devolución | 29/09 |
| Salida | Venta, ajuste negativo o traslado enviado | 29/09 |
| Compra | Entrada de producto a una sede | 29/09 |
| Ajuste | Corrección positiva o negativa de una existencia | 29/09 |
| Traslado | Movimiento de producto de una sede a otra | 29/09 |
| Venta | Salida automática al enviar el pedido a bodega | 29/09 |
| Devolución | Entrada ligada a un pedido Despachado o Entregado | 29/09 |
| Marca "Con devolución" | Indicador de un pedido con al menos una devolución | 29/09 |
