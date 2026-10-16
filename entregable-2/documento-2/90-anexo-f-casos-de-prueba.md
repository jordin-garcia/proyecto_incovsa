# Anexo F. Casos de prueba iniciales {-}

Estos son los casos de prueba iniciales del Entregable No. 2, en el formato del Documento 6 (Plan y evidencias de pruebas), alineados con la especificación del 15/10/2026. Cubren la conversión de kilogramos a unidades, la lectura del archivo de Odoo, el flujo pedido facturado → conversión → picking → preparación → despacho, la seguridad y el sitio web. Las columnas «Resultado obtenido» y «Estado» se llenan al ejecutar cada prueba sobre la aplicación; la evidencia se adjunta en el Documento 6.

Los casos CP-01 a CP-15 son los 15 casos de conversión que INCOVSA validó el 23/09/2026. Desde el 13/10/2026 el Peso de Conversión llega en el archivo de Odoo; el cálculo y el resultado esperado no cambian. Se automatizan con Vitest sobre el módulo `conversion`.

Tabla: Casos de prueba de la conversión validados por INCOVSA {#tab:cp-conversion}

| Id | Requerimiento | Entrada (producto, cantidad, Peso de Conversión) | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|
| CP-01 | RN-01, RF-SL-22 | SULFATO DE SODIO (USA-SAC/0025KG), 25 kg, 25 | Convertir con el módulo `conversion` | 1 unidad | — | Pendiente |
| CP-02 | RN-01, RF-SL-22 | SULFATO DE SODIO (USA-SAC/0025KG), otro lote, 25 kg, 25 | Igual | 1 unidad | — | Pendiente |
| CP-03 | RN-01, RF-SL-22 | HIDROSULFITO DE SODIO (IND-TON/0050KG), 50 kg, 50 | Igual | 1 unidad | — | Pendiente |
| CP-04 | RN-01, RF-SL-22 | METANOL (GUA-TON/0055GL), 55 kg, 55 | Igual | 1 unidad | — | Pendiente |
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

Tabla: Casos de prueba de ventas fraccionadas, agrupación y datos incorrectos {#tab:cp-fraccionados}

| Id | Requerimiento | Entrada | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|
| CP-16 | RN-21, RN-05 | 60 kg, Peso de Conversión 25 | Convertir con el módulo `conversion` | 2 unidades + 10 kg | — | Pendiente |
| CP-17 | RN-21, RN-05 | 10 kg, Peso de Conversión 25 | Igual | 0 unidades + 10 kg | — | Pendiente |
| CP-18 | RN-05 | 37.5 kg, Peso de Conversión 25 | Igual | 1 unidad + 12.5 kg, sin errores de redondeo | — | Pendiente |
| CP-19 | RF-SL-21, RN-51 | Una ruta con el mismo producto y Peso de Conversión 25 para tres clientes: 25 kg y 15 kg del lote 5287, y 10 kg del lote 9221 | Enviar la ruta a Bodega y abrirla | Dos filas: lote 5287 con 40 kg («1 unidad + 15 kg») y lote 9221 con 10 kg («0 unidades + 10 kg»), con el lote resaltado | — | Pendiente |
| CP-20 | RN-33 | Ruta enviada con un producto de Peso de Conversión 25 | Cargar después otro archivo con el mismo producto y Peso de Conversión 50, y volver a abrir la ruta | La ruta conserva el Peso de Conversión 25 y su conversión no cambia | — | Pendiente |
| CP-21 | RN-50, RF-SL-73 | Pedido facturado con una línea de Peso de Conversión 0, vacío o con texto | Cargar el archivo | Ese pedido facturado no se carga y el resumen indica el motivo; los demás sí se cargan | — | Pendiente |

Tabla: Casos de prueba de la lectura del archivo de Odoo {#tab:cp-odoo}

| Id | Requerimiento | Entrada | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|
| CP-22 | RF-SL-50, RF-SL-51, RN-35 | Archivo de ejemplo `Data Odo Para Picking.xlsx`, sede Quetzaltenango | Cargarlo en Facturación | Se leen 80 referencias: 79 en estado «Hecho» y 1 «Cancelado», que se ignora. La fila de agrupación de Odoo se ignora | — | Pendiente |
| CP-23 | RN-50 | El mismo archivo | Cargarlo y revisar el resumen | Se cargan 33 pedidos facturados; 46 no se cargan porque traen líneas con el Peso de Conversión en 0, y el resumen los lista | — | Pendiente |
| CP-24 | RF-SL-53, RN-35 | El mismo archivo | Revisar las tarjetas del tablero | Cliente, sector, productos, lotes y cantidades tal como vienen en el archivo. No aparece ninguna ventana para agregar productos o clientes | — | Pendiente |
| CP-25 | RF-SL-52, RN-36 | Referencia `XE-IN/SALIDA/03543` | Cargarla | El número del pedido facturado es `03543` y la bodega es Quetzaltenango | — | Pendiente |
| CP-26 | RN-37, RF-SL-54 | Líneas de `SODA ASH (CHI-SAC/0040KG)` con peso 25 en el archivo | Enviarlas a Bodega | La conversión usa 25 kg, el valor de la columna `Movimientos de stock/Producto/Peso` | — | Pendiente |
| CP-27 | RNF-05 | Línea de una referencia «Hecho» con cantidad vacía, con texto o en 0 | Cargar el archivo | Ese pedido facturado no se carga y el resumen lo indica | — | Pendiente |
| CP-28 | RNF-05 | Un archivo que no es .xlsx aunque tenga esa extensión, y un .xlsx de más de 2 MB | Cargarlos | Ambos se rechazan sin leerlos | — | Pendiente |
| CP-29 | RN-35 | Archivo de la bodega de Quetzaltenango con la sede de trabajo Guatemala | Cargarlo | No se carga nada y se indica que el archivo es de otra bodega | — | Pendiente |

Tabla: Casos de prueba del flujo pedido facturado → conversión → picking → preparación → despacho {#tab:cp-flujo}

| Id | Requerimiento | Entrada | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|
| CP-30 | RF-SL-69, RF-SL-68 | Pedidos facturados en el tablero | Seleccionar tres y arrastrar uno de ellos a «Envío por camión»; luego seleccionar otros dos y pulsar «Eliminar» | Los tres pasan juntos a la opción; los dos eliminados salen del tablero y quedan en la bitácora | — | Pendiente |
| CP-31 | RF-SL-71, RF-SL-67 | Tres pedidos facturados en una opción | Cambiar su orden arrastrando y recargar la página | El orden y las asignaciones se conservan después de recargar | — | Pendiente |
| CP-32 | RF-SL-70, RN-53 | Opción «Envío por camión» con pedidos facturados, sin piloto o sin fecha u hora programadas | Intentar enviar | No se puede enviar; se indica qué falta | — | Pendiente |
| CP-33 | RF-SL-16, RF-SL-72, RN-52 | Dos envíos por camión el mismo día y uno al día siguiente | Enviar las tres opciones | Se crean la Ruta 1 y la Ruta 2 del primer día y la Ruta 1 del día siguiente, cada una con su fecha y su fecha y hora programadas | — | Pendiente |
| CP-34 | RF-SL-72, RN-52 | Opción «Cliente recoge en bodega» el mismo día de CP-33 | Enviarla | Se crea el Pedido 1, con numeración aparte de las rutas | — | Pendiente |
| CP-35 | RNF-06 | Envío a Bodega en el que falla la creación de las líneas (falla simulada en la prueba automatizada) | Ejecutar la prueba | No se guarda nada: ni el envío, ni sus líneas, ni su estado, ni su número | — | Pendiente |
| CP-36 | RF-SL-75, RF-SL-74 | Ruta enviada con fecha y hora programadas | Abrirla en Bodega y pulsar «Detalle de Ruta» | Se ve la fecha y hora programadas, no la hora de envío; el detalle muestra completos cada pedido facturado y todas sus líneas, con sus datos del archivo, en el orden del facturador | — | Pendiente |
| CP-37 | RF-SL-23, RNF-13 | Ruta en Bodega abierta en dos pantallas | Marcar una línea en una pantalla | La marca aparece en la otra pantalla sin recargar | — | Pendiente |
| CP-38 | RF-SL-23, RF-SL-24, RN-11 | Ruta con todas sus líneas sin marcar | Pulsar «Marcar todo» y después «Ruta despachada» | El botón se habilita con todas marcadas; la ruta pasa a En Ruta y deja de aparecer en Bodega. Un pedido pasaría a Despachado | — | Pendiente |
| CP-39 | RF-SL-20 | Ruta con líneas de distintos pesos | Pulsar «Ordenar por peso» | Las filas quedan de mayor a menor cantidad en kg en todas las pantallas; no queda en la bitácora | — | Pendiente |
| CP-40 | RF-SL-77 | Ruta con más líneas de las que caben en una columna del tablero | Abrir el tablero en pantalla completa | Las líneas se numeran de arriba hacia abajo: primero la columna izquierda y después la derecha | — | Pendiente |
| CP-41 | RF-SL-78, RF-SL-79, RF-SL-28 | Piloto con dos rutas En Ruta | Abrir Ruta, reordenar los clientes y pulsar «Ruta entregada» | Las rutas aparecen de la más reciente a la más antigua; no hay registro histórico en el módulo; el recorrido queda guardado y la ruta aparece en «Rutas realizadas» de Reportes | — | Pendiente |

Tabla: Casos de prueba de seguridad y acceso {#tab:cp-seguridad}

| Id | Requerimiento | Entrada | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|
| CP-42 | RF-SL-55, RNF-04 | Usuario sin el permiso de Facturación | Abrir la dirección de Facturación y llamar directamente a la acción de carga del archivo | Ambos se rechazan en el servidor | — | Pendiente |
| CP-43 | RF-SL-66, RN-17 | Usuario con acceso solo a Quetzaltenango | Pedir datos de Guatemala desde la pantalla y modificando la petición | No ve ni modifica datos de Guatemala | — | Pendiente |
| CP-44 | RN-38 | Usuario con rol escrito « gerencia » y sin casillas marcadas | Entrar a todos los módulos y sedes | Tiene acceso total, como Gerencia | — | Pendiente |
| CP-45 | RF-SW-09 | Nombre de usuario que no existe en ningún sistema | Escribirlo en «Acceso personal» | Se indica que no tiene permisos para acceder; la consulta queda en la bitácora y cuenta en el límite de intentos por dirección IP | — | Pendiente |
| CP-46 | RN-54, RF-SW-09 | Usuario con una cuenta en el sitio y otra en el picking, con el mismo nombre | Escribirlo en «Acceso personal» y entrar a cada sistema con su contraseña | Se habilitan los dos sistemas; cada uno pide la contraseña de su cuenta | — | Pendiente |
| CP-47 | RNF-15, RN-39 | Usuario existente | Escribir mal la contraseña 5 veces seguidas y luego escribirla bien | Queda bloqueado 15 minutos aunque la contraseña sea correcta. La bitácora registra los intentos y el bloqueo | — | Pendiente |
| CP-48 | RF-SW-13, RF-SL-48 | Gerencia crea un usuario y después le restablece la contraseña | Escribir una contraseña de menos de 8 caracteres y después una válida | La corta se rechaza; la válida se guarda cifrada con scrypt y el usuario entra con ella | — | Pendiente |
| CP-49 | RF-SL-57 | Usuario eliminado | Iniciar sesión con su usuario | No puede entrar. Su historial y la bitácora se conservan | — | Pendiente |
| CP-50 | RF-SW-30 | Usuario con sesión abierta | Cerrar sesión | Vuelve a la página de inicio del sitio | — | Pendiente |

Tabla: Casos de prueba del sitio web y del panel {#tab:cp-sitio}

| Id | Requerimiento | Entrada | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|
| CP-51 | RF-SW-07, RF-SW-01 | Usuario con permiso de Contenido institucional | Cambiar el texto de la misión y subir una imagen | Inicio y Quiénes somos muestran la misión con el texto a la izquierda y la imagen a la derecha | — | Pendiente |
| CP-52 | RF-SW-28, RNF-17 | Portada con una imagen y después con cinco | Abrir Inicio | Con una imagen, queda fija; con cinco, rotan cada 5 s; la sexta se rechaza. La carga inicial con cinco imágenes no tarda más que con una | — | Pendiente |
| CP-53 | RF-SW-29 | Cinco imágenes de valores | Subirlas desde el panel | Quiénes somos muestra las cinco en una fila, sin texto | — | Pendiente |
| CP-54 | RF-SW-25 | Usuario del sitio sin el permiso de Catálogo | Intentar crear un producto público desde el panel y llamando directamente a la acción | Se rechaza en el servidor | — | Pendiente |
| CP-55 | RF-SW-17 | Producto público sin industrias en común con otros productos | Abrir su detalle | «Productos Recomendados» aparece igual, completada con otros productos en orden alfabético, sin repetir el producto | — | Pendiente |
| CP-56 | RF-SW-14, RN-41 | Producto documentado sin lote, y otro con un enlace que no es de Google Drive | Guardarlos | Ambos se rechazan con el motivo | — | Pendiente |
| CP-57 | RF-SW-21, RN-19 | Usuario con solo el permiso de ver documentos | Hacer clic en un producto documentado | La ventana muestra «Ver» y la vista previa de Google Drive, y ninguna opción de descargar | — | Pendiente |
| CP-58 | RF-SW-19, RF-SW-06 | Formulario de contacto sin país, y con país Guatemala sin departamento | Enviarlo | Se pide el país, y con Guatemala el departamento y el municipio. Completo, la solicitud se guarda, no se envía por correo y aparece en la bandeja | — | Pendiente |
| CP-59 | RF-SW-31 | Solicitud nueva y menú del panel reducido a íconos | Abrir el panel | El ícono de Solicitudes muestra el indicador de solicitudes nuevas | — | Pendiente |

Tabla: Casos de prueba de los ajustes del 15/10/2026 {#tab:cp-ajustes}

| Id | Requerimiento | Entrada | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|
| CP-60 | RF-SL-70, RN-53 | Opción «Envío por camión» vacía | Escribir «20102026» en la fecha y «1330» en la hora; después «31/02/2026» y «25:90» | Las primeras quedan como «20/10/2026» y «13:30» y se guardan; las segundas no se guardan y el campo se marca en rojo | — | Pendiente |
| CP-61 | RF-SL-61 | Tablero de pedidos facturados desplazado hacia abajo | Seleccionar una tarjeta | El tablero no se mueve; la tarjeta seleccionada muestra solo su número y su peso total | — | Pendiente |
| CP-62 | RF-SW-18 | Noticia publicada | Pulsar el botón del basurero en el panel y confirmar | La noticia deja de mostrarse en el sitio y la eliminación queda en la bitácora. No existe la opción de ocultar | — | Pendiente |
| CP-63 | RF-SW-20 | Solicitud sin comentario | Escribir un comentario y pulsar «Guardar comentario»; después pulsar «Editar comentario» | Se guarda y el botón pasa a «Editar comentario» con el cuadro de solo lectura; al pulsarlo, el cuadro se habilita y el botón vuelve a «Guardar comentario» | — | Pendiente |
| CP-64 | RF-SL-59 | Reportes con el periodo Rango | Escribir «01102026» en la fecha de inicio y pulsar Enter | La fecha queda como «01/10/2026» y el periodo se actualiza | — | Pendiente |
