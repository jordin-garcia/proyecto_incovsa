# 06. Módulo de Facturación

## Propósito

Es la entrada de los pedidos al sistema. El facturador **sube un archivo .xlsx exportado de Odoo** con las salidas ya facturadas. Cada referencia del archivo es un **pedido facturado** de un cliente y aparece en el **tablero de pedidos facturados**. El facturador arma cada **pedido** para Bodega agregando pedidos facturados, de uno o de varios clientes, a una **opción de envío** (un camión o "Cliente recoge en bodega"), y envía cada opción a Bodega cuando la considera correcta.

> **Cambios del 29/09/2026 (reunión 4) y respuestas del 11/10/2026.** Los pedidos ya **no se capturan a mano**: se cargan desde el archivo de Odoo. El sistema ya no valida ni descuenta existencias ([09-picking-inventario.md](09-picking-inventario.md)). Un pedido sigue pudiendo tener **varios clientes**, como hasta ahora; lo que cambia es la forma de armarlo.

## Términos de este módulo

| Término | Significado |
|---|---|
| **Pedido facturado** | Una referencia de Odoo (por ejemplo, `XE-IN/SALIDA/03539`), de **un solo cliente**, con sus productos y cantidades. Se identifica con el **número de Odoo** |
| **Tablero de pedidos facturados** | Lado izquierdo de la pantalla, con los pedidos facturados que todavía no se enviaron a bodega |
| **Opción de envío** | Lado derecho: un camión de la sede o "Cliente recoge en bodega". Se le agregan pedidos facturados de uno o de varios clientes |
| **Pedido** | Lo que se envía a Bodega desde una opción de envío: el conjunto de sus pedidos facturados. Puede tener **varios clientes**. Se identifica con un **correlativo por sede** y es lo que ven Bodega, Ruta y Reportes |

## Acceso

Usuarios del picking con permiso sobre Facturación, en las sedes que tengan asignadas ([03-roles-y-accesos.md](03-roles-y-accesos.md)). Gerencia y Soporte tienen acceso a todas las sedes.

## Flujo

1. El facturador **carga el archivo .xlsx**.
2. Los pedidos facturados del archivo aparecen **resumidos** en el tablero, en el lado izquierdo.
3. El facturador agrega, **pedido facturado por pedido facturado**, cada uno a la opción de envío que considere adecuada: un camión o "Cliente recoge en bodega".
4. Cuando una opción de envío está correcta, el facturador la **envía a bodega**.
5. Cada pedido enviado aparece en Bodega como lo hace hoy en el prototipo.

## Archivo de Odoo (RF-SL-50, RN-35)

- Formato: **.xlsx** con la misma estructura que `docs_incovsa/PROYECTO PICKING/Data Odo Para Picking.xlsx`, que es un export de salidas de Odoo. La estructura y las cifras del archivo de ejemplo están en [13-datos-maestros.md](13-datos-maestros.md).
- Un archivo puede traer **una o varias referencias**.
- Cada archivo trae referencias de **una sola bodega**, porque el sistema está enfocado en el despacho por bodega.
- Las pruebas se hacen **solo con la bodega de Quetzaltenango** (Xela).

### Cómo se lee

1. El archivo se lee **de arriba hacia abajo**.
2. Cada pedido facturado viene separado por **referencia y cliente**.
3. Una fila que **no tiene Referencia ni Contacto** pertenece a la **última referencia y contacto que aparecen arriba**; es decir, es otra línea del mismo pedido facturado.
4. Solo se cargan las referencias en estado **"Hecho"** (columna `Estado`). Las demás, por ejemplo "Cancelado", se ignoran.
5. Las filas de agrupación que agrega Odoo (texto en Referencia sin Contacto ni Producto, por ejemplo "agosto 2026 (80)") no son pedidos y se ignoran (12/10).
6. Si una línea de una referencia "Hecho" trae una cantidad vacía, no numérica o menor o igual a 0, ese pedido facturado no se carga y se avisa en el resumen de la carga, igual que cuando falta un producto (12/10). En el archivo de ejemplo, las 3 líneas con 0 kg son de referencias "Cancelado".
7. El archivo se rechaza si pesa más de 2 MB (12/10). La librería y las medidas de seguridad están en [16](16-arquitectura-y-tecnologia.md).

### Columnas que se usan

| Columna del archivo | Uso | Ejemplo |
|---|---|---|
| `Referencia` | Tres segmentos separados por `/`. El **primero** indica la bodega de la que salió. El **segundo** indica que es una salida. El **tercero** es el **número del pedido facturado** (RN-36) | `XE-IN/SALIDA/03539` → `03539`, bodega de Quetzaltenango |
| `Contacto` | **Nombre del cliente**, si el cliente no está en la base | — |
| `Contacto/Ciudad` | **Sector del cliente**, si el cliente no está en la base | — |
| `Estado` | Solo se cargan las referencias "Hecho" | `Hecho` |
| `Movimientos de stock/Producto` | **Nombre del producto**, que se busca en el catálogo | `SODA ASH (CHI-SAC/0040KG)` |
| `Movimientos de stock/Cantidad hecha` | Cantidad facturada, **en kilogramos** (RN-37) | `120` |

**No se usa** la columna `Movimientos de stock/Producto/Peso`, porque en algunos productos viene en cero. La conversión usa el **Peso de Conversión** de cada producto del catálogo (RN-02, RN-37).

Prefijos de bodega en la Referencia:

| Prefijo | Bodega |
|---|---|
| `XE` | Quetzaltenango (Xela). "Xela" y "Quetzaltenango" son la misma bodega: el primero es el nombre popular y el segundo el oficial. El sistema muestra **Quetzaltenango** |
| `GT` | Guatemala |
| `ESC` | Escuintla |

No se valida si una referencia ya se cargó antes: no puede pasar, porque los datos vienen de Odoo.

### Validación de productos (RN-43)

Cada producto del archivo se busca en el catálogo para obtener su Peso de Conversión. El nombre del catálogo tiene el mismo formato que el de Odoo ([11-picking-configuracion.md](11-picking-configuracion.md)).

- Si un producto **no está** en el catálogo, el sistema lo **notifica** y **pregunta si se desea agregar**.
- Si se agrega, el sistema pide **únicamente el Peso de Conversión**. El nombre es el del archivo.
- Si **no** se agrega, el pedido facturado que lo contiene **no se carga**, porque no hay Peso de Conversión para convertirlo a unidades (respuesta del 11/10 a P-81). Los demás pedidos facturados del archivo sí se cargan.

### Validación de clientes (RN-44)

Cada cliente del archivo (columna `Contacto`) se busca en la base de clientes.

| Caso | Nombre y sector del pedido facturado |
|---|---|
| El cliente **existe** en la base | Se toman **de la base de datos** |
| El nombre está **dos veces** en la base, con sectores distintos | El nombre de la base y el sector de `Contacto/Ciudad` del archivo (11/10) |
| El cliente **no existe** y se decide **guardarlo** | El sistema pide su **nombre** y su **sector**. El sector se **elige de la lista de sectores existentes** o se **agrega uno nuevo** en ese momento. El cliente queda guardado en la base |
| El cliente **no existe** y **no** se guarda | Se usan el nombre y el sector **tal como vienen** en `Contacto` y `Contacto/Ciudad` |

## Pantalla de Facturación (RF-SL-61)

### Lado izquierdo: tablero de pedidos facturados (RF-SL-67)

- Muestra los pedidos facturados que **todavía no se enviaron a bodega** y no están en ninguna opción de envío.
- **Se guarda en la base de datos**: si el facturador cierra la sesión, o entra otro facturador de la misma sede, el tablero sigue igual (respuesta del 11/10). Así funcionará también cuando el sistema se conecte a Odoo y los pedidos facturados lleguen solos.
- Una tarjeta **resumida** por pedido facturado, con **solo** estos datos:

| Dato | Origen |
|---|---|
| Número de pedido | Tercer segmento de la Referencia |
| Nombre del cliente | Base de clientes, o `Contacto` si el cliente no se guardó |
| Sector del cliente | Base de clientes, o `Contacto/Ciudad` si el cliente no se guardó |
| Total en kg | Suma de la cantidad de todos los productos del pedido facturado |

- **El único dato que se puede corregir es el sector del cliente** (RF-SL-62). La corrección **se guarda en la base de clientes**. Si el cliente no está guardado en la base, la corrección queda en ese pedido facturado.
- Se puede **eliminar un pedido facturado** del tablero, o **eliminar todos** los pedidos facturados del tablero (RF-SL-68). La bitácora registra la eliminación.

### Lado derecho: opciones de envío

| Opción | Contenido |
|---|---|
| **Un camión por cada camión de la sede** | Identificación y capacidad máxima, **piloto**, pedidos facturados que contiene, **peso acumulado** frente a la capacidad, alerta de sobrepeso y sus botones |
| **Cliente recoge en bodega** | Pedidos facturados que contiene, total en kg y sus botones |

- A cada opción se le pueden agregar pedidos facturados de **varios clientes**.
- El **piloto** se elige en cada opción de camión, entre los usuarios con rol **"Piloto"** que tienen acceso a la sede ([03-roles-y-accesos.md](03-roles-y-accesos.md)).
- Lo que tiene cada opción **se guarda en la base de datos**: al volver a entrar, cada opción conserva los pedidos facturados que se le asignaron (respuesta del 11/10).
- Un camión puede hacer **varias rutas en el mismo día**: después de enviar una opción de camión, la opción queda vacía y se puede volver a usar.

### Arrastrar pedidos facturados (RF-SL-63)

- Del **tablero** a una **opción de envío**.
- De una **opción** a **otra opción**.
- De una **opción** de regreso al **tablero**.
- Funciona con mouse y con el dedo, como el reordenamiento del prototipo.

### Peso y alerta de sobrepeso (RF-SL-14, RN-13)

- Cada opción de camión **lleva el control del peso**: suma el total en kg de sus pedidos facturados y lo muestra frente a la capacidad máxima, con el medidor del prototipo.
- Si el total **excede el peso máximo** del camión, aparece la **alerta de sobrepeso**.
- La alerta **solo informa, no bloquea**. INCOVSA acepta que sea aproximada.
- Capacidades en Quetzaltenango: 3,400 kg (dos camiones) y 6,000 kg (uno).

### Botones de cada opción (RF-SL-16, RF-SL-17)

**Cada opción de envío tiene sus propios botones** "Enviar Pedido a Bodega" y "Cancelar".

| Botón | Efecto |
|---|---|
| **Enviar Pedido a Bodega** | En una sola transacción crea **un pedido** con todos los pedidos facturados de esa opción: le asigna el **correlativo de la sede**, guarda sus líneas (cliente, producto y cantidad) con el **Peso de Conversión vigente** de cada producto (RN-33), lo pone **En Preparación** y lo manda a Bodega. En una opción de camión, **en el mismo paso se crea la ruta**, con su número (correlativo por sede), la fecha del envío, el camión y el piloto (RF-SL-30). Requiere al menos un pedido facturado y, en los camiones, piloto asignado. Los pedidos facturados enviados salen de la pantalla |
| **Cancelar** | Los pedidos facturados de esa opción **regresan al tablero** (respuesta del 11/10 a P-79). No se pierde nada y no se crea ningún pedido. La bitácora registra la cancelación |

## Restricciones

- Un pedido ya enviado a bodega no se puede editar ni cancelar (RF-SL-18).
- **No** se registra el número de factura.
- Desde el 11/10 sí hay datos guardados antes del envío: el tablero y las opciones de envío. El **pedido** de Bodega se crea al enviar (RN-16).

## Estados

| Situación | Estado |
|---|---|
| Pedido facturado en el tablero o en una opción de envío | Todavía no es un pedido. Es el estado "Pendiente" de RN-11 y se guarda como pedido facturado |
| Pedido creado al pulsar "Enviar Pedido a Bodega" | **En Preparación**, el primer estado del pedido |

Ver RN-11 en [12-reglas-de-negocio.md](12-reglas-de-negocio.md).

## Diferencias con el prototipo aprobado

El prototipo tiene la captura manual (tabla vacía, botón "Agregar línea", búsqueda de cliente y producto), la validación de existencias y un solo pedido por pantalla con un camión y un piloto. Todo eso **se reemplaza** por la carga del archivo, el tablero de pedidos facturados y las opciones de envío. Del prototipo se conservan el estilo de las tarjetas, el medidor de capacidad con su alerta, el arrastre con mouse o dedo, la ventana de confirmación antes de enviar y, en Bodega, Ruta y Reportes, el pedido con varios clientes ([20-prototipo-aprobado.md](20-prototipo-aprobado.md)).
