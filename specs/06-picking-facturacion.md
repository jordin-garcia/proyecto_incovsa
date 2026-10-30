# 06. Módulo de Facturación

## Propósito

Es la entrada de los pedidos al sistema. El facturador **sube un archivo .xlsx exportado de Odoo** con las salidas ya facturadas. Cada referencia del archivo es un **pedido facturado** de un cliente y aparece en el **tablero de pedidos facturados**. El facturador arma cada **ruta** (envío por camión) o cada **pedido** (cliente recoge en bodega) agregando pedidos facturados, de uno o de varios clientes, a una **opción de envío**, y la envía a Bodega cuando la considera correcta.

> **Cambios del 13/10/2026 (reunión 5).** Los datos del archivo se usan **tal como vienen**: ya no se validan productos, clientes ni sectores, y no se guardan en ninguna base de productos o de clientes. El **Peso de Conversión** y el **lote** salen del archivo. Las opciones de envío son solo **dos**: "Envío por camión" (con el camión y el piloto elegidos de listas) y "Cliente recoge en bodega". Cada opción lleva **fecha y hora programadas**. Lo que sale de un camión se llama **ruta** y lo que recoge el cliente, **pedido**; los dos se numeran **cada día desde 1**. Se pueden seleccionar varios pedidos facturados para arrastrarlos o eliminarlos juntos.

## Términos de este módulo

| Término | Significado |
|---|---|
| **Pedido facturado** | Una referencia de Odoo (por ejemplo, `XE-IN/SALIDA/03539`), de **un solo cliente**, con sus productos, lotes, Pesos de Conversión y cantidades. Se identifica con el **número de Odoo** |
| **Tablero de pedidos facturados** | Lado izquierdo de la pantalla, con los pedidos facturados que todavía no están en ninguna opción de envío |
| **Opción de envío** | Lado derecho: "Envío por camión" o "Cliente recoge en bodega". Se le agregan pedidos facturados de uno o de varios clientes |
| **Ruta** | Lo que se envía a Bodega desde "Envío por camión". Se identifica con su **número del día** en la sede |
| **Pedido** | Lo que se envía a Bodega desde "Cliente recoge en bodega". Se identifica con su **número del día** en la sede |

## Acceso

Usuarios del picking con permiso sobre Facturación, en las sedes que tengan asignadas ([03-roles-y-accesos.md](03-roles-y-accesos.md)). Gerencia y Soporte tienen acceso a todas las sedes.

## Flujo

1. El facturador **carga el archivo .xlsx**.
2. Los pedidos facturados del archivo aparecen **resumidos** en el tablero, en el lado izquierdo.
3. El facturador selecciona uno, varios o todos los pedidos facturados y los arrastra a la opción de envío que corresponda: "Envío por camión" o "Cliente recoge en bodega".
4. Ordena los pedidos facturados dentro de la opción, elige el camión y el piloto (si es envío por camión) y escribe la fecha y la hora programadas.
5. Cuando la opción está correcta, la **envía a Bodega**: se crea la ruta o el pedido con su número del día.
6. Cada ruta o pedido aparece en Bodega como en el prototipo.

## Archivo de Odoo (RF-SL-50, RN-35)

- Formato: **.xlsx** con la misma estructura que `docs_incovsa/PROYECTO PICKING/Data Odo Para Picking.xlsx`, que es un export de salidas de Odoo. La estructura y las cifras del archivo de ejemplo están en [13-datos-maestros.md](13-datos-maestros.md).
- Un archivo puede traer **una o varias referencias**.
- Cada archivo trae referencias de **una sola bodega**, porque el sistema está enfocado en el despacho por bodega.
- Las pruebas se hacen **solo con la bodega de Quetzaltenango** (Xela).
- El Ing. William se comprometió a entregar el archivo con **todos los datos** de las columnas que usa el sistema (13/10).

### Cómo se lee

1. El archivo se lee **de arriba hacia abajo**.
2. Cada pedido facturado viene separado por **referencia y cliente**.
3. Una fila que **no tiene Referencia ni Contacto** pertenece a la **última referencia y contacto que aparecen arriba**; es decir, es otra línea del mismo pedido facturado.
4. Solo se cargan las referencias en estado **"Hecho"** (columna `Estado`). Las demás, por ejemplo "Cancelado", se ignoran.
5. Las filas de agrupación que agrega Odoo (texto en Referencia sin Contacto ni Producto, por ejemplo "agosto 2026 (80)") no son pedidos y se ignoran.
6. Si una línea de una referencia "Hecho" trae una **cantidad** vacía, no numérica o menor o igual a 0, ese pedido facturado **no se carga** y se avisa en el resumen de la carga (12/10).
7. Si una línea de una referencia "Hecho" trae un **Peso de Conversión** vacío, no numérico o menor o igual a 0, ese pedido facturado **no se carga** y se avisa en el resumen de la carga (decisión del coordinador del 14/10, RN-50). En el archivo de ejemplo, 82 de las 205 líneas de referencias "Hecho" traen el peso en 0, en 46 de los 79 pedidos facturados.
8. El archivo se rechaza si pesa más de 2 MB (12/10). La librería y las medidas de seguridad están en [16](16-arquitectura-y-tecnologia.md).
   - **(29/10, JG-15, ASVS V5.2.3)** Como el .xlsx es un ZIP, antes de leerlo con SheetJS también se rechaza si tiene más de **100 archivos internos** o si, descomprimido, pasa de **50 MB** en total. Si la primera hoja tiene más de **20 000 filas**, también se rechaza. Así, un archivo pequeño y muy comprimido no puede llenar la memoria del servidor. El archivo de ejemplo tiene 10 archivos internos y 80 KB descomprimido.
   - **(29/10, JG-15, RNF-05)** Los textos de cada columna se validan con el mismo largo máximo que tienen en la base de datos: referencia 40, número 20, cliente, sector y producto 200, y lote 40.
   - En los dos casos se muestra el mensaje que ya existe: «No se pudo leer el archivo. Verifique que sea el .xlsx exportado de Odoo.»
9. **No se valida nada más** (13/10): el producto, el lote, el cliente y el sector se toman tal como vienen. No hay ventanas para agregar productos o clientes que falten, porque el sistema ya no tiene esos catálogos.

### Columnas que se usan

| Columna del archivo | Uso | Ejemplo |
|---|---|---|
| `Referencia` | Tres segmentos separados por `/`. El **primero** indica la bodega de la que salió. El **segundo** indica que es una salida. El **tercero** es el **número del pedido facturado** (RN-36) | `XE-IN/SALIDA/03539` → `03539`, bodega de Quetzaltenango |
| `Contacto` | **Nombre del cliente**, tal como viene | — |
| `Contacto/Ciudad` | **Sector del cliente**, tal como viene | — |
| `Estado` | Solo se cargan las referencias "Hecho" | `Hecho` |
| `Movimientos de stock/Producto` | **Nombre del producto**, tal como viene | `SODA ASH (CHI-SAC/0040KG)` |
| `Movimientos de stock/Producto/Peso` | **Peso de Conversión** de la línea, en kg (13/10, RN-37) | `25` |
| `Movimientos de stock/Números de serie` | **Lote** de la línea. Se guarda y se muestra en Bodega (13/10) | `5287` |
| `Movimientos de stock/Cantidad hecha` | Cantidad facturada, **en kilogramos** (RN-04) | `120` |

> El archivo de ejemplo trae un caso que el sistema toma tal como viene: `SODA ASH (CHI-SAC/0040KG)` tiene peso 25 en sus 12 líneas, aunque su nombre dice 40 kg. La conversión usa 25, porque es el dato de la columna (P-90).

Prefijos de bodega en la Referencia:

| Prefijo | Bodega |
|---|---|
| `XE` | Quetzaltenango (Xela). "Xela" y "Quetzaltenango" son la misma bodega: el primero es el nombre popular y el segundo el oficial. El sistema muestra **Quetzaltenango** |
| `GT` | Guatemala |
| `ESC` | Escuintla |

**Bodega del archivo (15/10, comportamiento del prototipo aprobado).** Se revisa el primer segmento de las referencias "Hecho". **No se carga nada** del archivo, y se avisa el motivo, si:

- alguna referencia trae un prefijo que no es `XE`, `GT` ni `ESC`;
- el archivo trae referencias de más de una bodega;
- la bodega del archivo no es la sede en la que trabaja el facturador. En ese caso se le pide que cambie la sede con el selector de la barra superior o que cargue el archivo correcto.

No se valida si una referencia ya se cargó antes: no puede pasar, porque los datos vienen de Odoo.

## Pantalla de Facturación (RF-SL-61)

- El título y un texto de instrucciones **corto, a la par del título**, para dejar el mayor espacio posible al tablero y a las opciones de envío (13/10). Desde el 15/10 todos los módulos de los dos sistemas usan este mismo encabezado ([20-prototipo-aprobado.md](20-prototipo-aprobado.md)).
- A la izquierda, el tablero de pedidos facturados; a la derecha, las dos opciones de envío.

### Lado izquierdo: tablero de pedidos facturados (RF-SL-67)

- Muestra los pedidos facturados que **todavía no están en ninguna opción de envío**.
- **Se guarda en la base de datos**: si el facturador cierra la sesión, o entra otro facturador de la misma sede, el tablero sigue igual.
- **Dos facturadores en la misma sede (16/10):** el servidor valida cada movimiento contra el estado guardado; si otro facturador ya movió, envió o eliminó un pedido facturado, el cambio se rechaza con un aviso y la pantalla se actualiza. Además, Facturación recibe el mismo aviso en tiempo real que Bodega, para que cada facturador vea al instante los cambios del otro ([16](16-arquitectura-y-tecnologia.md)).
- **Aviso de conflicto (21/10/2026, JC-05; texto confirmado con Jordin):** «Otro facturador modificó estos pedidos. La pantalla se actualizará; revisa los cambios e inténtalo de nuevo». La comprobación incluye la ubicación, la posición y la fecha de modificación de los pedidos vistos por el facturador. Mientras arrastra o edita fecha u hora se conserva la vista; los cambios recibidos se aplican al soltar o salir del campo, después de terminar el guardado pendiente.
- Una tarjeta por pedido facturado, sin el asa de arrastre ni la "x" de eliminar (13/10). **(22/10)** Las tarjetas van en la rejilla de varias columnas del prototipo (`.fx-lista`), que manda en diseño (decisión 89). Cada tarjeta lleva:

| Dato | Origen |
|---|---|
| Número de pedido facturado | Tercer segmento de la Referencia |
| Nombre del cliente | `Contacto` |
| Sector del cliente | `Contacto/Ciudad` |
| Total en kg | Suma de la cantidad de todos los productos del pedido facturado |
| Productos con su cantidad en kg | Lista de los productos del pedido facturado (aprobado con el prototipo el 13/10) |

- Ningún dato de la tarjeta se puede corregir (13/10).
- **Selección (13/10):**
  - se puede seleccionar **uno o varios** pedidos facturados;
  - una opción **"Seleccionar todos"** selecciona todos los del tablero;
  - al arrastrar un pedido facturado seleccionado se llevan **todos los seleccionados** juntos a la opción de envío;
  - al haber pedidos facturados seleccionados aparece la opción **"Eliminar"**, que los elimina del tablero después de confirmar. La bitácora registra la eliminación (RF-SL-68);
  - **(15/10)** una tarjeta seleccionada se **compacta**: muestra **solo el número del pedido facturado y su peso total**, con la marca de seleccionada;
  - **(15/10)** seleccionar o quitar la selección **no mueve el desplazamiento** del tablero: la lista se queda donde estaba.

### Lado derecho: opciones de envío (13/10)

Solo hay **dos** opciones, sin importar cuántos camiones tenga la sede:

| Opción | Contenido |
|---|---|
| **Envío por camión** | **Camión** (lista desplegable con los camiones de la sede), **piloto** (lista desplegable), **fecha y hora programadas de envío**, pedidos facturados que contiene (cada uno con su total en kg), **peso acumulado** frente a la capacidad del camión elegido, alerta de sobrepeso y sus botones |
| **Cliente recoge en bodega** | **Fecha y hora programadas de despacho**, pedidos facturados que contiene (cada uno con su total en kg), total en kg y sus botones |

- A cada opción se le pueden agregar pedidos facturados de **varios clientes**.
- El **piloto** se elige entre los usuarios con rol **"Piloto"** que tienen acceso a la sede ([03-roles-y-accesos.md](03-roles-y-accesos.md)).
- Cada pedido facturado de una opción muestra su **número, su cliente y su total en kg** (13/10).
- **Orden (13/10):** el facturador puede reordenar los pedidos facturados dentro de cada opción arrastrándolos. El orden **se guarda** y es el orden con que se envían a Bodega: el del detalle de la ruta o del pedido, el de sus líneas de preparación (por primera aparición) y el orden inicial de los clientes de la ruta (RN-29).
- La **fecha y la hora programadas** son **obligatorias** para enviar (decisión del coordinador del 14/10). Se guardan y se muestran en Bodega (RN-53).
- **Campos de fecha y hora (15/10):**

| Campo | Cómo se llena |
|---|---|
| Fecha programada | Se **escribe con el teclado** en formato **dd/mm/aaaa** (las barras se agregan solas: "20102026" → "20/10/2026"; al salir del campo "5/1/2027" → "05/01/2027"), o se elige con el **botón del calendario** |
| Hora programada | Se **escribe con el teclado** en formato de **24 horas, HH:MM** ("1330" → "13:30"; "9:05" → "09:05"), o se elige con el **botón del reloj** |

- El calendario y el reloj se abren **debajo del campo**, alineados a la izquierda (el navegador los abre hacia arriba si no caben abajo).
- Una fecha que no existe (por ejemplo, 31/02/2026) o una hora inválida (por ejemplo, 25:90) **no se guarda**, y el campo se marca en rojo con un mensaje del formato esperado.
- Mientras están vacíos, los dos campos se muestran con un **fondo verde claro** (`--v50`, borde `--v300`), que combina con el sistema (antes ámbar). El cursor sobre ellos es una **mano**.
- Lo escrito se guarda mientras se escribe, sin volver a pintar la pantalla.
- Lo que tiene cada opción (pedidos facturados, orden, camión, piloto, fecha y hora) **se guarda en la base de datos**: al volver a entrar, cada opción conserva lo que se le asignó.
- Después de enviar, la opción queda vacía y se puede volver a usar, con el mismo camión o con otro. Un camión puede hacer **varias rutas en el mismo día**.

### Arrastrar pedidos facturados (RF-SL-63)

- Del **tablero** a una **opción de envío**, uno o varios a la vez (13/10).
- De una **opción** a la **otra opción**.
- De una **opción** de regreso al **tablero**.
- **Dentro de una opción**, para cambiar su orden (13/10).
- Funciona con mouse y con el dedo. Como la tarjeta ya no tiene asa, en pantallas táctiles el arrastre empieza con una **pulsación larga** sobre la tarjeta; un toque corto la selecciona (decisión de diseño del 14/10).

### Peso y alerta de sobrepeso (RF-SL-14, RN-13)

- La opción "Envío por camión" **lleva el control del peso**: suma el total en kg de sus pedidos facturados y lo muestra frente a la capacidad máxima del **camión elegido**, con el medidor del prototipo.
- Si el total **excede el peso máximo** del camión, aparece la **alerta de sobrepeso**.
- La alerta **solo informa, no bloquea**. INCOVSA acepta que sea aproximada.
- Capacidades en Quetzaltenango: 3,400 kg (dos camiones) y 6,000 kg (uno).

### Botones de cada opción (RF-SL-16, RF-SL-17)

| Botón | Efecto |
|---|---|
| **Enviar a Bodega** | En una sola transacción crea **una ruta** (envío por camión) o **un pedido** (cliente recoge) con todos los pedidos facturados de esa opción, en su orden: le asigna el **número del día** de la sede (RN-52), guarda la fecha y hora programadas, guarda la **fecha y hora exactas de creación** (RN-57), crea sus líneas de preparación (RN-51) y la pone **En Preparación**. En la ruta guarda también el camión y el piloto. Requiere al menos un pedido facturado y la fecha y hora programadas; en el envío por camión requiere además camión y piloto. Los pedidos facturados enviados salen de la pantalla |
| **Cancelar** | Los pedidos facturados de esa opción **regresan al tablero**. No se pierde nada y no se crea nada. La bitácora registra la cancelación |

Antes de enviar se muestra la ventana de confirmación del prototipo, con el número que va a recibir la ruta o el pedido.

**Envíos simultáneos y doble clic (16/10):** el envío bloquea su opción de envío mientras dura la transacción. Como hay una sola opción de cada tipo por sede, dos envíos que compiten por el mismo número del día esperan su turno, y un segundo clic encuentra la opción ya vacía y no crea nada ([16](16-arquitectura-y-tecnologia.md), decisión 41).

## Restricciones

- Una ruta o un pedido ya enviados a bodega no se pueden editar ni cancelar (RF-SL-18).
- **No** se registra el número de factura.
- Antes del envío se guardan el tablero y las opciones de envío. La ruta o el pedido se crean al enviar (RN-16).

## Estados

| Situación | Estado |
|---|---|
| Pedido facturado en el tablero o en una opción de envío | Todavía no es una ruta ni un pedido. Es el estado "Pendiente" de RN-11 y se guarda como pedido facturado |
| Ruta o pedido creado al pulsar "Enviar a Bodega" | **En Preparación**, el primer estado |

Ver RN-11 en [12-reglas-de-negocio.md](12-reglas-de-negocio.md).

## Diferencias con el prototipo aprobado

El prototipo de simulación implementa todo lo de este archivo desde el 14/10, y los ajustes del 15/10 desde ese día. Lo que se reemplazó del prototipo del 29/09 (captura manual, validación de existencias, un pedido por pantalla) y del prototipo del 13/10 (ventanas de productos y clientes que faltan, corrección del sector, una opción por camión, asa y "x" en las tarjetas) ya no se usa ([20-prototipo-aprobado.md](20-prototipo-aprobado.md)).
