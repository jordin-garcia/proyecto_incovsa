\horizontal

# Anexo F. Casos de prueba iniciales {-}

Estos son los casos de prueba iniciales del Entregable No. 2, en el formato del Documento 6 (Plan y evidencias de pruebas). Cubren la conversión de kilogramos a unidades, la lectura del archivo de Odoo, el flujo pedido facturado → conversión → picking → preparación, la seguridad y el panel del sitio. Las columnas «Resultado obtenido» y «Estado» se llenan al ejecutar cada prueba; la evidencia se adjunta en el Documento 6.

Los casos CP-01 a CP-15 son los 15 casos de conversión que INCOVSA validó el 23/09/2026. Se automatizan con Vitest sobre el módulo `conversion`.

Tabla: Casos de prueba de la conversión validados por INCOVSA {#tab:cp-conversion}

| Id | Requerimiento | Entrada (producto, cantidad, Peso de Conversión) | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|
| CP-01 | RN-01, RF-SL-22 | SULFATO DE SODIO (USA-SAC/0025KG), 25 kg, 25 | Convertir con el módulo `conversion` | 1 unidad | — | Pendiente |
| CP-02 | RN-01, RF-SL-22 | SULFATO DE SODIO (USA-SAC/0025KG), lote 2318 en Picking II, 25 kg, 25 | Igual | 1 unidad | — | Pendiente |
| CP-03 | RN-01, RF-SL-22 | HIDROSULFITO DE SODIO (IND-TON/0050KG), 50 kg, 50 | Igual | 1 unidad | — | Pendiente |
| CP-04 | RN-01, RF-SL-22 | METANOL (GUA-TON/0055GL), lote 9047, 55 kg, 55 | Igual | 1 unidad, según el caso validado. Pendiente de confirmar con INCOVSA: el catálogo usa 164 kg y con ese valor el resultado es 0 unidades + 55 kg | — | Pendiente |
| CP-05 | RN-01, RF-SL-22 | NEGRO SULFUROSO HIGH QUALITY (CHI-SAC/0025KG), 50 kg, 25 | Igual | 2 unidades | — | Pendiente |
| CP-06 | RN-01, RF-SL-22 | NEGRO SULFUROSO (CHI-SAC/0025KG), 50 kg, 25 | Igual | 2 unidades | — | Pendiente |
| CP-07 | RN-01, RF-SL-22 | SULFURO DE SODIO (TUR-SAC/0025KG), 50 kg, 25 | Igual | 2 unidades | — | Pendiente |
| CP-08 | RN-01, RF-SL-22 | SULFATO DE ALUMINIO (TUR-SAC/0025KG), 50 kg, 25 | Igual | 2 unidades | — | Pendiente |
| CP-09 | RN-01, RF-SL-22 | SODA ASH (TUR-SAC/0025KG), 50 kg, 25 | Igual | 2 unidades | — | Pendiente |
| CP-10 | RN-01, RF-SL-22 | SODA CAUSTICA (MEX-SAC/0025KG), 75 kg, 25 | Igual | 3 unidades | — | Pendiente |
| CP-11 | RN-01, RF-SL-22 | INCO-FITEX (CHI-GAR/0030KG), 90 kg, 30 | Igual | 3 unidades | — | Pendiente |
| CP-12 | RN-01, RF-SL-22 | SODA CAUSTICA (CHI-SAC/0025KG), 500 kg, 25 | Igual | 20 unidades | — | Pendiente |
| CP-13 | RN-01, RF-SL-22 | SULFURO DE SODIO (MEX-SAC/0025KG), 500 kg, 25 | Igual | 20 unidades | — | Pendiente |
| CP-14 | RN-01, RF-SL-22 | SODA CAUSTICA (CHI-SAC/0025KG), 800 kg, 25 | Igual | 32 unidades | — | Pendiente |
| CP-15 | RN-01, RF-SL-22 | SODA CAUSTICA (CHI-SAC/0025KG), 1,000 kg, 25 | Igual | 40 unidades | — | Pendiente |

Tabla: Casos de prueba de ventas fraccionadas y datos incorrectos {#tab:cp-fraccionados}

| Id | Requerimiento | Entrada | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|
| CP-16 | RN-21, RN-05 | 60 kg, Peso de Conversión 25 | Convertir con el módulo `conversion` | 2 unidades + 10 kg | — | Pendiente |
| CP-17 | RN-21, RN-05 | 10 kg, Peso de Conversión 25 | Igual | 0 unidades + 10 kg | — | Pendiente |
| CP-18 | RN-05 | 37.5 kg, Peso de Conversión 25 | Igual | 1 unidad + 12.5 kg, sin errores de redondeo | — | Pendiente |
| CP-19 | RF-SL-21, RN-01 | Un pedido con el mismo producto para tres clientes: 25 kg, 15 kg y 10 kg; Peso de Conversión 25 | Enviar el pedido a bodega y abrirlo en Bodega | Una sola fila con 50 kg y «2 unidades» | — | Pendiente |
| CP-20 | RN-33 | Pedido enviado con un producto de Peso de Conversión 25 | Cambiar después el Peso de Conversión del producto a 50 en Configuración y volver a abrir el pedido en Bodega | El pedido conserva el Peso de Conversión 25 y su conversión no cambia | — | Pendiente |
| CP-21 | RF-SL-04, RNF-05 | Producto nuevo con Peso de Conversión 0, negativo o con texto | Guardarlo en Configuración | Se rechaza con el mensaje «El Peso de Conversión debe ser un número mayor que cero» | — | Pendiente |

Tabla: Casos de prueba de la lectura del archivo de Odoo {#tab:cp-odoo}

| Id | Requerimiento | Entrada | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|
| CP-22 | RF-SL-50, RF-SL-51, RN-35 | Archivo de ejemplo `Data Odo Para Picking.xlsx`, sede Quetzaltenango | Cargarlo en Facturación | Se leen 80 referencias; 79 en estado «Hecho» y 1 «Cancelado», que no se carga. La fila de agrupación de Odoo se ignora | — | Pendiente |
| CP-23 | RF-SL-64, RN-43 | El mismo archivo, con el catálogo inicial | Cargarlo y revisar el aviso de productos | Avisa 7 productos que no están en el catálogo, en 11 líneas. Si un producto no se agrega, los pedidos facturados que lo contienen no se cargan | — | Pendiente |
| CP-24 | RF-SL-65, RN-44 | El mismo archivo, con la base inicial de clientes | Cargarlo y revisar el aviso de clientes | Avisa 23 de 52 clientes que no están en la base y pregunta si se guardan | — | Pendiente |
| CP-25 | RF-SL-52, RN-36 | Referencia `XE-IN/SALIDA/03539` | Cargarla | El número del pedido facturado es `03539` y la bodega es Quetzaltenango | — | Pendiente |
| CP-26 | RN-37, RF-SL-54 | Línea cuya columna `Movimientos de stock/Producto/Peso` viene en 0 | Cargarla y ver su conversión en Bodega | La conversión usa el Peso de Conversión del catálogo | — | Pendiente |
| CP-27 | RNF-05 | Línea de una referencia «Hecho» con cantidad vacía, con texto o en 0 | Cargar el archivo | Ese pedido facturado no se carga y el resumen de la carga lo indica | — | Pendiente |
| CP-28 | RNF-05 | Un archivo que no es .xlsx aunque tenga esa extensión, y un .xlsx de más de 2 MB | Cargarlos | Ambos se rechazan sin leerlos | — | Pendiente |

Tabla: Casos de prueba del flujo pedido facturado → conversión → picking → preparación {#tab:cp-flujo}

| Id | Requerimiento | Entrada | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|
| CP-29 | RF-SL-63, RF-SL-67 | Pedidos facturados en el tablero de Facturación | Arrastrar uno a un camión, otro a «Cliente recoge en bodega» y recargar la página | Las asignaciones se conservan después de recargar | — | Pendiente |
| CP-30 | RF-SL-16, RN-11, RN-31 | Opción «Cliente recoge en bodega» con dos pedidos facturados de clientes distintos | Pulsar «Enviar Pedido a Bodega» | Se crea un pedido con el siguiente correlativo de la sede, en estado En Preparación, y aparece en Bodega | — | Pendiente |
| CP-31 | RF-SL-16, RN-30 | Opción de camión con piloto asignado | Pulsar «Enviar Pedido a Bodega» | Además del pedido, se crea la ruta con su número correlativo por sede y la fecha del envío | — | Pendiente |
| CP-32 | RNF-06 | Envío a bodega en el que falla la creación de la ruta (falla simulada en la prueba automatizada) | Ejecutar la prueba | No se guarda nada: ni el pedido, ni sus líneas, ni su estado | — | Pendiente |
| CP-33 | RF-SL-23, RNF-13 | Pedido en Bodega abierto en dos pantallas | Marcar una línea en una pantalla | La marca aparece en la otra pantalla sin recargar | — | Pendiente |
| CP-34 | RF-SL-24, RN-11 | Pedido con todas sus líneas sin marcar | Marcar las líneas una por una y pulsar «Pedido Despachado» | El botón se habilita solo con todas marcadas. El pedido pasa a Despachado si es de recoge en bodega, o a En Ruta si es de camión, y deja de aparecer en Bodega | — | Pendiente |

Tabla: Casos de prueba de seguridad y del panel del sitio {#tab:cp-seguridad}

| Id | Requerimiento | Entrada | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|
| CP-35 | RF-SL-55, RNF-04 | Usuario sin el permiso de Facturación | Abrir la dirección de Facturación y llamar directamente a la acción de carga del archivo | Ambos se rechazan en el servidor | — | Pendiente |
| CP-36 | RF-SL-66, RN-17 | Usuario con acceso solo a Quetzaltenango | Pedir datos de Guatemala desde la pantalla y modificando la petición | No ve ni modifica datos de Guatemala | — | Pendiente |
| CP-37 | RN-38 | Usuario con rol escrito « gerencia » y sin casillas marcadas | Entrar a todos los módulos y sedes | Tiene acceso total, como Gerencia | — | Pendiente |
| CP-38 | RNF-15, RN-39 | Usuario existente | Escribir mal la contraseña 5 veces seguidas y luego escribirla bien | Queda bloqueado 15 minutos aunque la contraseña sea correcta. El mensaje no dice si el usuario existe. La bitácora registra los intentos y el bloqueo | — | Pendiente |
| CP-39 | RF-SL-57 | Usuario eliminado | Iniciar sesión con su usuario y contraseña | No puede entrar. Su historial y la bitácora se conservan | — | Pendiente |
| CP-40 | RF-SW-07 | Usuario con permiso de Contenido institucional | Cambiar el texto de la misión en el panel | El cambio se ve en «Quiénes somos» sin modificar el código | — | Pendiente |
| CP-41 | RF-SW-25 | Usuario del sitio sin el permiso de Catálogo | Intentar crear un producto público desde el panel y llamando directamente a la acción | Se rechaza en el servidor | — | Pendiente |
| CP-42 | RF-SW-17 | Producto público sin industrias en común con otros productos | Abrir su detalle | La sección «Productos Recomendados» aparece igual, completada con otros productos en orden alfabético, sin repetir el producto que se está viendo | — | Pendiente |
