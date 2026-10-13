# 02. Glosario

Significado exacto de los términos del proyecto. Si un término se usa de otra forma en otro documento, vale lo que dice aquí.

## Términos vigentes

| Término | Significado |
|---|---|
| **Producto** (picking) | Registro del catálogo del picking con **nombre** (único) y **Peso de Conversión**. El nombre tiene el formato de Odoo, sin lote: `SODA ASH (CHI-SAC/0040KG)` |
| **Sufijo** o **"SKU"** | Último segmento del código de `Picking II`, después del último guion. Corresponde al **número de lote de Odoo** (confirmado el 23/09) y **no es único**. Ya no se muestra en ninguna pantalla (11/10) |
| **Lote** | Concepto de Odoo. El sistema de picking no controla lotes. En la documentación interna del sitio, el lote es un dato del documento que admite números y letras y solo es obligatorio en el COA (11/10) |
| **Peso de Conversión** | Peso en **kilogramos** de una unidad física del producto (saco, tonel, garrafa, caja, unidad). Es el divisor de la conversión. Se guarda como número en cada producto y se cambia desde Configuración. Hasta el 11/10 se llamaba "Peso2", como la columna `Peso2` del Excel de la empresa. **No** es el peso que trae el archivo de Odoo |
| **Unidad** | Envase o pieza física que el operario saca de la bodega: saco, tonel, garrafa, caja, IBC, pieza, etc. |
| **Conversión** | Cálculo de cuántas unidades completas y cuántos kg sueltos corresponden a una cantidad en kg. Ver RN-01 en [12-reglas-de-negocio.md](12-reglas-de-negocio.md) |
| **Resto** | Kilogramos que sobran después de contar las unidades completas en una venta fraccionada. Ejemplo: 60 kg con Peso de Conversión 25 son "2 unidades + 10 kg" |
| **Venta fraccionada** | Venta cuya cantidad no es múltiplo del Peso de Conversión. Está permitida |
| **Sede** | Quetzaltenango, Guatemala o Escuintla. En las referencias de Odoo se identifican con los prefijos `XE` (Xela), `GT` y `ESC`. A cada usuario del picking se le marcan las sedes a las que tiene acceso. En el sitio solo se muestran Quetzaltenango y Guatemala, que tienen oficinas |
| **Archivo de Odoo** | Archivo .xlsx que el facturador exporta de Odoo y sube a Facturación. Tiene la estructura de `Data Odo Para Picking.xlsx` ([13-datos-maestros.md](13-datos-maestros.md)). Trae referencias de una sola bodega |
| **Referencia** | Columna del archivo de Odoo con el formato `BODEGA/SALIDA/NÚMERO`, por ejemplo `XE-IN/SALIDA/03539`. El primer segmento es la bodega, el segundo indica que es una salida y el tercero es el **número de pedido** |
| **Pedido facturado** | Una referencia de Odoo, de **un solo cliente**, cargada en Facturación. Se identifica con su número de Odoo |
| **Tablero de pedidos facturados** | Lado izquierdo de Facturación, con los pedidos facturados que no se han enviado. Se guarda en la base de datos |
| **Pedido** | Lo que el facturador envía a Bodega desde una opción de envío: uno o varios pedidos facturados, de uno o varios clientes. Se identifica con un **correlativo por sede** |
| **Opción de envío** | Columna del lado derecho de Facturación a la que se arrastran los pedidos: un camión de la sede o "Cliente recoge en bodega". Se le agregan pedidos facturados de varios clientes. Cada una tiene sus botones "Enviar Pedido a Bodega" y "Cancelar" |
| **Tipo de pedido** | "Cliente recoge en bodega" o "Envío en camión", según la opción de envío a la que se arrastró |
| **Línea del pedido** | Una fila del pedido: cliente, producto y cantidad en kg |
| **Línea de preparación** | Una fila de Bodega: un producto con la suma de su cantidad, más su conversión a unidades. Se suma entre todos los clientes del pedido |
| **Ruta** | Registro del recorrido de un pedido de envío en camión. Tiene número (correlativo por sede), fecha, camión y piloto |
| **Recorrido** | Orden de los clientes de una ruta en el momento en que el piloto pulsa "Pedido Entregado" |
| **Piloto** | Usuario del picking cuyo rol es "Piloto" |
| **Bitácora** | Registro de las acciones de los usuarios, incluidos los inicios de sesión. Se consulta en la pestaña "Bitácora" de Reportes (RN-39) |
| **Tablero** | El módulo de Bodega en pantalla completa, proyectado en una TV o usado en una tableta. Tiene modo claro y modo oscuro |
| **Modo claro** | Aspecto del tablero con fondo claro y acentos verdes. Es el que el prototipo llamaba "Tableta" |
| **Modo oscuro** | Aspecto del tablero en escala de negros y grises. Reemplaza al que el prototipo llamaba "TV", que era en escala de verdes |
| **Permiso** | Autorización de un usuario para entrar a un módulo y hacer una acción en él. Se marca con una casilla en el formulario del usuario ([03-roles-y-accesos.md](03-roles-y-accesos.md)) |
| **Rol** | Texto libre del usuario que escriben Gerencia o Soporte. **No** define los accesos, salvo en los roles predeterminados Gerencia y Soporte. El rol "Piloto" identifica a los pilotos |
| **Gerencia** y **Soporte** | Únicos roles predeterminados. Tienen acceso total a los dos sistemas y a todas las sedes |
| **Producto público** | Producto del catálogo informativo del sitio web: nombre, descripción, presentación, países de origen, imagen e industrias. **Es una entidad distinta** del producto del picking |
| **Productos Recomendados** | Sección al final del detalle de un producto público, que siempre aparece |
| **Documento interno** | Archivo PDF de la documentación interna del sitio. Hay tres tipos: ficha técnica (FT/TDS), hoja de seguridad (HS/MSDS) y certificado de análisis (COA). Se registra con el nombre de un producto, el país de origen y el lote |
| **Solicitud de contacto** | Mensaje enviado desde el formulario de Contacto. Su motivo es solicitud, queja o reclamo. Se le puede marcar el estado Asignado, En proceso o Solucionado; al llegar no tiene estado |
| **Presentación dinámica** | Animación de aparición y desaparición de imágenes al desplazarse en el sitio (RF-SW-16) |
| **Prototipo aprobado** | El prototipo de simulación presentado el 29/09 ([20-prototipo-aprobado.md](20-prototipo-aprobado.md)) |
| **Sitio de Google** | Página actual de la empresa en Google Sites (<https://sites.google.com/view/incovsa>). Es una fuente de contenido, no un sistema a integrar |

## Términos que ya no aplican

Se conservan solo para entender documentos anteriores.

| Término | Significado anterior | Ya no aplica desde |
|---|---|---|
| Código de producto o código completo | Clave del producto con el formato `NOMBRE-ORIGEN-ENVASE/PRESENTACIÓN[-CALIDAD]-SUFIJO` de `Picking II`. La clave ahora es el nombre en formato de Odoo | 11/10 |
| Unidad de Medida | Texto informativo de la presentación. No se usa en ninguna parte | 11/10 |
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
