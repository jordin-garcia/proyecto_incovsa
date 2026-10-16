# Lógica de conversión de kilogramos a unidades

La empresa factura en kilogramos y la bodega saca unidades físicas: sacos, toneles, garrafas, cajas o piezas. La conversión vive en el módulo `src/modulos/conversion/` y la usan Bodega, el tablero y Reportes.

## Regla

```
unidades = parte entera (cantidad_kg ÷ Peso de Conversión)
resto_kg = cantidad_kg − unidades × Peso de Conversión
```

- **Peso de Conversión:** el peso en kg de una unidad física del producto. Desde el 13/10/2026 viene en la columna `Movimientos de stock/Producto/Peso` de cada línea del archivo de Odoo (RN-37) y se guarda con la línea, así que una ruta o un pedido enviado conserva el peso con el que llegó (RN-33).
- **Ventas fraccionadas:** la cantidad no tiene que ser múltiplo del Peso de Conversión (RN-21). Lo que no completa una unidad se muestra como resto en kg, sin redondear (RN-05).
- **Formato:** «N unidades + R kg». Si la conversión es exacta se muestra solo «N unidades», sin «+ 0 kg». Una sola unidad se escribe «1 unidad».
- **Agrupación:** Bodega suma las líneas del mismo producto, el mismo lote y el mismo Peso de Conversión entre todos los clientes de la ruta o del pedido, y convierte la suma (RN-51).

## Cálculo sin errores de redondeo

Las cantidades y el Peso de Conversión se guardan como `decimal(12,3)` en la base de datos. La conversión no usa números de punto flotante: pasa las dos cantidades a **gramos enteros** y opera con enteros (decisión técnica 1). Así, por ejemplo, 37.5 kg con un Peso de Conversión de 25 kg da exactamente «1 unidad + 12.5 kg».

Tabla: Ejemplos de conversión {#tab:conversion}

| Cantidad (kg) | Peso de Conversión (kg) | Resultado |
|---|---|---|
| 50 | 25 | 2 unidades |
| 60 | 25 | 2 unidades + 10 kg |
| 10 | 25 | 0 unidades + 10 kg |
| 55 | 55 | 1 unidad |
| 110 | 55 | 2 unidades |

Los 15 casos que INCOVSA validó, más los fraccionados y los datos incorrectos, están en el Anexo F y se automatizan con Vitest sobre el módulo `conversion`.

## Datos incorrectos

Un Peso de Conversión vacío, no numérico o menor o igual a 0 no llega nunca a la conversión: el pedido facturado que lo trae no se carga (RN-50, sección «Lectura del archivo de Odoo»).

# Lógica de inventario

El sistema **no lleva control de inventario** (RN-40): ni existencias, ni entradas, ni salidas. El 29/09/2026 INCOVSA decidió sacarlo del alcance porque el inventario de todas sus bodegas ya lo lleva su ERP, Odoo. Llevarlo también en este sistema duplicaría el registro y obligaría a conciliar dos fuentes.

Por eso no hay módulo, tablas ni pantallas de inventario. Los pedidos llegan al sistema en el archivo que el facturador exporta de Odoo, después de facturar, y el sistema se encarga de la preparación, la carga y el despacho.

# Lógica de picking y despacho

El flujo va del pedido facturado en Odoo a la entrega. Cada paso es una operación del servidor que verifica el permiso y la sede, y que guarda su registro de bitácora en la misma transacción.

## Carga de los pedidos facturados (módulo `odoo`)

El facturador sube el archivo .xlsx. El servidor lo lee con las reglas de la sección «Lectura del archivo de Odoo» y guarda cada referencia válida como **pedido facturado**, con su cliente, su sector y sus líneas tal como vienen. Los pedidos facturados aparecen en el tablero de Facturación.

## Armado de rutas y pedidos (módulo `envios`)

- Hay **dos opciones de envío** por sede: «Envío por camión» y «Cliente recoge en bodega».
- El facturador selecciona uno, varios o todos los pedidos facturados y los arrastra a una opción, entre opciones o de regreso al tablero; dentro de una opción los ordena. El orden se guarda en `pedido_facturado.posicion`.
- En la opción de camión elige el camión y el piloto (usuario con rol «Piloto» de la sede). El sistema suma los kg frente a la capacidad del camión y muestra la alerta de sobrepeso, que solo informa (RN-13).
- En las dos opciones escribe la fecha y la hora programadas, que son obligatorias (RN-53). Se escriben con el teclado, la fecha como dd/mm/aaaa y la hora como HH:MM de 24 horas, o se eligen en el calendario y el reloj del navegador. Una fecha que no existe o una hora inválida no se guarda.
- Todo lo anterior se guarda en la base de datos (RN-48): el tablero y las opciones siguen igual si el facturador cierra la sesión.

## Envío a Bodega

Al pulsar «Enviar a Bodega», en una sola transacción:

1. se calcula el **número del día**: el siguiente de las rutas (o de los pedidos) de la sede en la fecha de hoy, en la hora de Guatemala (RN-52);
2. se crea el `envio` de tipo ruta (camión) o pedido (recoge), En Preparación, con la fecha de envío y la fecha y hora programadas;
3. se crean las **líneas de preparación**: una por producto, lote y Peso de Conversión, sumando los clientes, en el orden de los pedidos facturados (RN-51);
4. en una ruta, se crean las filas de `entrega_ruta`: una por cliente (mismo nombre y sector), en el orden de los pedidos facturados (RN-29, RN-49);
5. se registran el historial de estado y la bitácora, y los pedidos facturados quedan ligados al envío;
6. se avisa por SSE a las pantallas de Bodega de la sede.

## Preparación (módulo `bodega`)

Bodega muestra las rutas y los pedidos En Preparación en el orden de la cola, con su fecha y hora programadas, su detalle, el lote resaltado de cada línea y su conversión. El personal marca las líneas una por una o todas a la vez, cambia la prioridad o las ordena de mayor a menor peso. El marcado y el orden se comparten en tiempo real y no van al historial ni a la bitácora (RN-20, RN-28).

## Despacho y entrega (módulos `bodega` y `ruta`)

- «Ruta despachada» o «Pedido despachado» se habilita cuando todas las líneas están marcadas. El pedido pasa a **Despachado** y termina; la ruta pasa a **En Ruta** y aparece en el módulo de Ruta del piloto.
- El piloto ve sus rutas en curso, de la más reciente a la más antigua, reordena los clientes y pulsa «Ruta entregada»: el orden de ese momento queda como **recorrido** y la ruta pasa a **Entregado**. Desde ahí se consulta en Reportes.

Tabla: Estados de las rutas y los pedidos {#tab:estados}

| Estado | Cuándo |
|---|---|
| En Preparación | Al enviar desde Facturación |
| Despachado | Pedido (cliente recoge), al pulsar «Pedido despachado» |
| En Ruta | Ruta (camión), al pulsar «Ruta despachada» |
| Entregado | Ruta, al pulsar «Ruta entregada» |

# Manejo de archivos

Tabla: Archivos que maneja el sistema {#tab:archivos}

| Archivo | Dónde se guarda | Controles |
|---|---|---|
| Archivo .xlsx de Odoo | No se guarda: se lee en el servidor y se descarta | Máximo 2 MB (el de ejemplo pesa 25 KB con 80 referencias). Se valida que el contenido sea realmente un .xlsx, se leen solo las columnas que se usan y todo se valida con Zod antes de guardar los pedidos facturados |
| Imágenes del sitio | Cloudflare R2; en la base de datos, su dirección | Se validan por su contenido (que sea una imagen de un formato admitido) y el servidor genera el nombre con que se guardan. Hasta 5 por área (RN-56) |
| Documentos técnicos (FT, HS y COA) | **No se guardan en el sistema.** Están en el Google Drive de la empresa; el sistema guarda sus enlaces | Se aceptan solo enlaces `https://` de `drive.google.com` o `docs.google.com`. Del enlace se obtiene el identificador del archivo para armar la vista previa y la descarga (decisión técnica 21) |

## Lectura del archivo de Odoo

El archivo se lee con SheetJS 0.20.3, solo en el servidor, con estas reglas (RN-35 a RN-37 y RN-50):

- Se lee de arriba hacia abajo. Una fila sin Referencia ni Contacto pertenece a la última referencia y contacto de arriba.
- Solo se cargan las referencias en estado «Hecho».
- Se ignoran las filas de agrupación que agrega Odoo (texto en Referencia sin Contacto ni Producto).
- Cada archivo trae referencias de una sola bodega, que debe ser la sede en la que trabaja el facturador.
- Los datos se usan **tal como vienen**: el cliente (`Contacto`), el sector (`Contacto/Ciudad`), el producto, el lote (`Movimientos de stock/Números de serie`), el Peso de Conversión (`Movimientos de stock/Producto/Peso`) y la cantidad (`Movimientos de stock/Cantidad hecha`). No se validan contra ningún catálogo.
- Si una línea de una referencia «Hecho» trae una cantidad o un Peso de Conversión vacío, no numérico o menor o igual a 0, ese pedido facturado no se carga y se avisa en el resumen de la carga. Con el archivo de ejemplo se cargan 33 de 79 pedidos facturados, porque 46 traen líneas con el peso en 0 (P-91).

# Manejo de errores

- **Errores de validación** (un dato que falta o está mal escrito): se muestran al usuario junto al campo, con un mensaje que dice cómo corregirlo. Los esquemas de Zod son los mismos en el navegador y en el servidor.
- **Errores de la carga del archivo de Odoo:** se muestran en un resumen de la carga, con los pedidos facturados que no se cargaron y por qué (peso o cantidad en 0, sin productos), y las referencias que no estaban en estado «Hecho». Si el archivo es de otra bodega o no tiene las columnas esperadas, no se carga nada.
- **Errores de envío a Bodega:** si falta el camión, el piloto, la fecha o la hora, el envío se rechaza y no se guarda nada.
- **Errores inesperados:** el usuario ve un mensaje general, sin detalles técnicos. El detalle (operación, usuario y error) queda solo en el registro del servidor.
- **Errores de permisos:** si alguien intenta una operación sin permiso, el servidor la rechaza y no revela qué datos existen.
- **Transacciones:** el envío a Bodega, el despacho y la entrega se guardan completos o no se guardan (RNF-06).

# Servicios externos

Tabla: Servicios externos {#tab:servicios}

| Servicio | Uso | Cómo se conecta |
|---|---|---|
| Cloudflare R2 (plan gratuito) | Imágenes del sitio y, en un bucket privado aparte, los respaldos | API compatible con S3, con credenciales en variables de entorno |
| Google Drive de la empresa | Documentos técnicos de la documentación interna | El sistema guarda los enlaces; el navegador muestra la vista previa de Drive y el enlace de descarga según los permisos. No hay credenciales de Drive en el sistema |
| Odoo | Enlace al inicio de sesión de Odoo y archivo .xlsx que el facturador exporta de Odoo y sube a Facturación | No hay conexión directa: el archivo se sube desde el navegador |

No hay más integraciones. **El sistema no envía correos**: desde el 13/10/2026 las solicitudes de contacto solo se guardan en el sistema, y las contraseñas las restablecen Gerencia o Soporte. La conexión directa con Odoo queda como trabajo futuro, fuera del alcance. La lógica de lectura del archivo vive en el módulo `odoo`, separada de las pantallas, para poder reutilizarla cuando exista esa conexión.
