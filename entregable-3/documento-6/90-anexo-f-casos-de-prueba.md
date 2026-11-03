\horizontal

# Anexo F. Casos de prueba {-}

Este anexo reúne todos los casos de prueba del proyecto, con las columnas que piden los lineamientos.

- **CP-01 a CP-64** son los casos iniciales del Entregable No. 2 (Documento 2, Anexo F, 15/10/2026). Ahora tienen su resultado obtenido; cuando la especificación precisó el resultado esperado después del 15/10, se indica.
- **CP-65 a CP-111** se agregaron para el Entregable No. 3.

Cada caso dice en «Procedimiento» qué prueba automatizada lo comprueba (archivo y línea). El «Resultado obtenido» remite a la evidencia del Anexo G:

- **EV-01:** CI de `develop`, 509 de 509 pruebas de Vitest aprobadas.
- **EV-03:** la prueba integral diaria.
- **EV-04:** la matriz de navegadores sobre `develop`.

Estados:

- **Aprobado:** el resultado obtenido coincide con el esperado.
- **Aprobado en parte:** una parte del caso se comprueba de forma indirecta o en otra pantalla, como se explica.
- **Pendiente:** el resultado todavía no coincide con el esperado; se indica la tarea que lo corrige.

Tabla: Abreviaturas de los archivos de prueba {#tab:abreviaturas}

| Abreviatura | Archivo |
|---|---|
| CONV | `src/modulos/conversion/servicio.test.ts` |
| ODOO | `src/modulos/odoo/servicio.test.ts` |
| OPC | `src/modulos/envios/opciones.test.ts` |
| ENVS | `src/modulos/envios/servicio.test.ts` |
| BOD | `src/modulos/bodega/servicio.test.ts` |
| RUTA | `src/modulos/ruta/servicio.test.ts` |
| ACC | `src/app/acceso/servicio.test.ts` |
| USR | `src/modulos/usuarios/servicio.test.ts` |
| REP | `src/modulos/reportes/servicio.test.ts` |
| FLUJO | `pruebas-e2e/flujo/flujo-completo.spec.ts` |
| e2e/ | carpeta `pruebas-e2e/` (pruebas de extremo a extremo con Playwright) |
| m/ | carpeta `src/modulos/` |

## Conversión validada por INCOVSA {-}

Los casos CP-01 a CP-15 son los 15 casos de conversión que INCOVSA validó el 23/09/2026. Desde el 13/10/2026, el Peso de Conversión llega en el archivo de Odoo; el cálculo y el resultado esperado no cambian. La sección 9 los analiza.

Tabla: Casos de prueba de la conversión validados por INCOVSA {#tab:f-conversion}

| Id | Requerimiento | Entrada (producto, cantidad, Peso de Conversión) | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|
| CP-01 | RN-01, RF-SL-22 | SULFATO DE SODIO (USA-SAC/0025KG), 25 kg, 25 | Convertir con el módulo de conversión. Prueba: CONV:9 | 1 unidad | 1 unidad (EV-01) | Aprobado |
| CP-02 | RN-01, RF-SL-22 | SULFATO DE SODIO (USA-SAC/0025KG), otro lote, 25 kg, 25 | Igual. CONV:16 | 1 unidad | 1 unidad (EV-01) | Aprobado |
| CP-03 | RN-01, RF-SL-22 | HIDROSULFITO DE SODIO (IND-TON/0050KG), 50 kg, 50 | Igual. CONV:23 | 1 unidad | 1 unidad (EV-01) | Aprobado |
| CP-04 | RN-01, RF-SL-22 | METANOL (GUA-TON/0055GL), 55 kg, 55 | Igual. CONV:30 | 1 unidad | 1 unidad (EV-01) | Aprobado |
| CP-05 | RN-01, RF-SL-22 | NEGRO SULFUROSO HIGH QUALITY (CHI-SAC/0025KG), 50 kg, 25 | Igual. CONV:37 | 2 unidades | 2 unidades (EV-01) | Aprobado |
| CP-06 | RN-01, RF-SL-22 | NEGRO SULFUROSO (CHI-SAC/0025KG), 50 kg, 25 | Igual. CONV:44 | 2 unidades | 2 unidades (EV-01) | Aprobado |
| CP-07 | RN-01, RF-SL-22 | SULFURO DE SODIO (TUR-SAC/0025KG), 50 kg, 25 | Igual. CONV:51 | 2 unidades | 2 unidades (EV-01) | Aprobado |
| CP-08 | RN-01, RF-SL-22 | SULFATO DE ALUMINIO (TUR-SAC/0025KG), 50 kg, 25 | Igual. CONV:58 | 2 unidades | 2 unidades (EV-01) | Aprobado |
| CP-09 | RN-01, RF-SL-22 | SODA ASH (TUR-SAC/0025KG), 50 kg, 25 | Igual. CONV:65 | 2 unidades | 2 unidades (EV-01) | Aprobado |
| CP-10 | RN-01, RF-SL-22 | SODA CAUSTICA (MEX-SAC/0025KG), 75 kg, 25 | Igual. CONV:72 | 3 unidades | 3 unidades (EV-01) | Aprobado |
| CP-11 | RN-01, RF-SL-22 | INCO-FITEX (CHI-GAR/0030KG), 90 kg, 30 | Igual. CONV:79 | 3 unidades | 3 unidades (EV-01) | Aprobado |
| CP-12 | RN-01, RF-SL-22 | SODA CAUSTICA (CHI-SAC/0025KG), 500 kg, 25 | Igual. CONV:86 | 20 unidades | 20 unidades (EV-01) | Aprobado |
| CP-13 | RN-01, RF-SL-22 | SULFURO DE SODIO (MEX-SAC/0025KG), 500 kg, 25 | Igual. CONV:93 | 20 unidades | 20 unidades (EV-01) | Aprobado |
| CP-14 | RN-01, RF-SL-22 | SODA CAUSTICA (CHI-SAC/0025KG), 800 kg, 25 | Igual. CONV:100 | 32 unidades | 32 unidades (EV-01) | Aprobado |
| CP-15 | RN-01, RF-SL-22 | SODA CAUSTICA (CHI-SAC/0025KG), 1,000 kg, 25 | Igual. CONV:107 | 40 unidades | 40 unidades (EV-01) | Aprobado |

## Ventas fraccionadas, agrupación, equivalencias y datos incorrectos {-}

Tabla: Casos de prueba de ventas fraccionadas, agrupación, equivalencias y datos incorrectos {#tab:f-fraccionados}

| Id | Requerimiento | Entrada | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|
| CP-16 | RN-21, RN-05 | 60 kg, Peso de Conversión 25 | Convertir. CONV:116 | 2 unidades + 10 kg | 2 unidades + 10 kg (EV-01) | Aprobado |
| CP-17 | RN-21, RN-05 | 10 kg, Peso de Conversión 25 | Convertir. CONV:123 | 0 unidades + 10 kg | 0 unidades + 10 kg (EV-01) | Aprobado |
| CP-18 | RN-05 | 37.5 kg, Peso de Conversión 25 | Convertir. CONV:130 | 1 unidad + 12.5 kg, sin errores de redondeo | 1 unidad + 12.5 kg; el cálculo se hace en gramos enteros (EV-01) | Aprobado |
| CP-19 | RF-SL-21, RN-51 | Una ruta con el mismo producto y Peso de Conversión 25 para tres clientes: 25 kg y 15 kg del lote 5287, y 10 kg del lote 9221 | Enviar la ruta a Bodega y abrirla. BOD:166, OPC:127, `e2e/picking/bodega.spec.ts:169` | Dos filas: lote 5287 con 40 kg («1 unidad + 15 kg») y lote 9221 con 10 kg («0 unidades + 10 kg»), con el lote resaltado | Dos filas con esas cantidades y conversiones, con el lote resaltado (EV-01, EV-04) | Aprobado |
| CP-20 | RN-33 | Ruta enviada con un producto de Peso de Conversión 25 | Cargar después otro archivo con el mismo producto y Peso de Conversión 50, y volver a abrir la ruta | La ruta conserva el Peso de Conversión 25 y su conversión no cambia | Comprobado de forma indirecta: OPC:127 verifica que cada línea de preparación guarda su propio Peso de Conversión al enviarse a Bodega (25 y 40 del mismo producto y lote quedan en filas separadas), y Bodega convierte con ese valor guardado (BOD:166). Una carga posterior solo crea pedidos facturados nuevos y no modifica las líneas ya enviadas (EV-01) | Aprobado en parte (falta una prueba directa; se agrega en JG-17) |
| CP-21 | RN-50, RF-SL-73 | Pedido facturado con una línea de Peso de Conversión 0, vacío o con texto | Cargar el archivo. ODOO:68, ODOO:190, ODOO:215 | Ese pedido facturado no se carga y el resumen indica el motivo; los demás sí se cargan | Se rechaza el pedido completo con los valores nulo, vacío, «diez», 0 y −1, y los demás se cargan (EV-01) | Aprobado |
| CP-101 | RN-01, RN-05 | Miles de cantidades aleatorias de hasta 4,536 kg y Pesos de Conversión de hasta 2,500 kg con 3 decimales | Convertir con pruebas de propiedades (fast-check). CONV:153, CONV:182, CONV:291, BOD:520 | Siempre unidades × peso + resto = cantidad, con 0 ≤ resto < peso; nunca se usan números de punto flotante | Se cumple en todos los valores generados (EV-01) | Aprobado |
| CP-102 | RN-50, RN-01, RN-05 | Peso de Conversión 0 o negativo, cantidad negativa, más de 3 decimales, texto o comas mal puestas | Convertir. CONV:204, 210, 215, 220, 225 | Se rechaza con un error de negocio, sin convertir | Se rechazan todos (EV-01) | Aprobado |
| CP-103 | RN-51, RN-33 | El mismo producto y lote con Peso de Conversión 25 y 40 en un envío (modificación de la equivalencia) | Enviar a Bodega. OPC:127 | Van en filas separadas y cada fila conserva su Peso de Conversión y su conversión | Filas separadas: 40 kg con 25 y 5 kg con 40 (EV-01) | Aprobado |
| CP-104 | RF-SL-38, RN-01 | El mismo producto y Peso de Conversión en lotes distintos | Abrir el reporte de Despacho. REP:81, `m/reportes/exportacion.test.ts:187` | Se agrupan por producto y Peso de Conversión, con la suma de kg y la conversión exacta | Agrupados con la suma y la conversión correctas (EV-01) | Aprobado |

## Lectura del archivo de Odoo {-}

Las pruebas usan una copia anonimizada del archivo de ejemplo que entregó INCOVSA, `Data Odo Para Picking.xlsx` (sección 1). Tiene las mismas referencias, cantidades y pesos, con clientes ficticios.

Tabla: Casos de prueba de la lectura del archivo de Odoo {#tab:f-odoo}

| Id | Requerimiento | Entrada | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|
| CP-22 | RF-SL-50, RF-SL-51, RN-35 | Archivo de ejemplo anonimizado, sede Quetzaltenango | Cargarlo en Facturación. ODOO:58, 157, 168, 293; `e2e/picking/facturacion-carga.spec.ts:40` | Se leen 80 referencias: 79 en estado «Hecho» y 1 «Cancelado», que se ignora. La fila de agrupación de Odoo se ignora | 80 referencias, 79 «Hecho» y 1 «Cancelado» ignorada (EV-01, EV-04) | Aprobado |
| CP-23 | RN-50 | El mismo archivo | Cargarlo y revisar el resumen. ODOO:58, 68; FLUJO:242 | Se cargan 33 pedidos facturados; 46 no se cargan porque traen líneas con el Peso de Conversión en 0, y el resumen los lista | «33 pedido(s)» cargados y «46 pedido(s)» no cargados, con su lista (EV-01, EV-03) | Aprobado |
| CP-24 | RF-SL-53, RN-35 | El mismo archivo | Revisar las tarjetas del tablero. ODOO:89, 348, 362; `facturacion-carga.spec.ts:40` | Cliente, sector, productos, lotes y cantidades tal como vienen en el archivo. No aparece ninguna ventana para agregar productos o clientes | Los datos coinciden con el archivo y la tarjeta no ofrece agregar productos ni clientes (EV-01, EV-04) | Aprobado |
| CP-25 | RF-SL-52, RN-36 | Referencia `XE-IN/SALIDA/03543` | Cargarla. ODOO:80 | El número del pedido facturado es `03543` y la bodega es Quetzaltenango | `03543`, como texto, en Quetzaltenango (EV-01) | Aprobado |
| CP-26 | RN-37, RF-SL-54 | Líneas de `SODA ASH (CHI-SAC/0040KG)` con peso 25 en el archivo | Enviarlas a Bodega. ODOO:89, FLUJO:355 | La conversión usa 25 kg, el valor de la columna `Movimientos de stock/Producto/Peso` | Usa 25.000 kg, el del archivo, no el del nombre del producto (EV-01, EV-03) | Aprobado |
| CP-27 | RNF-05 | Línea de una referencia «Hecho» con cantidad vacía, con texto o en 0 | Cargar el archivo. ODOO:183, 190, 383 | Ese pedido facturado no se carga y el resumen lo indica | Con el archivo de cantidades inválidas: 30 aceptados y tres rechazos adicionales, con su motivo (EV-01) | Aprobado |
| CP-28 | RNF-05 | Un archivo que no es .xlsx aunque tenga esa extensión, y un .xlsx de más de 2 MB | Cargarlos. ODOO:228 a 285 | Ambos se rechazan sin leerlos | Ambos se rechazan antes de abrir el archivo (EV-01) | Aprobado |
| CP-29 | RN-35, RN-36 | Archivo de la bodega de Guatemala con la sede de trabajo Quetzaltenango (y, al revés, también un prefijo desconocido y un archivo con más de una bodega) | Cargarlo. ODOO:306, 323, 332 | No se carga nada y se indica que el archivo es de otra bodega | «…es de la bodega de Guatemala y usted está trabajando en Quetzaltenango… No se cargó nada.» (EV-01) | Aprobado |

## Flujo pedido facturado → conversión → picking → preparación → despacho {-}

Tabla: Casos de prueba del flujo de picking y despacho {#tab:f-flujo}

| Id | Requerimiento | Entrada | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|
| CP-30 | RF-SL-69, RF-SL-68 | Pedidos facturados en el tablero | Seleccionar varios y arrastrar uno de ellos a «Envío por camión»; luego seleccionar otros dos y pulsar «Eliminar». OPC:272, ENVS:113, `m/envios/acciones-integracion.test.ts:140`, `e2e/picking/facturacion-envio.spec.ts:51` | Los seleccionados pasan juntos a la opción; los eliminados salen del tablero y quedan en la bitácora | Pasan juntos; los eliminados salen del tablero y la bitácora registra número, cliente y total (EV-01, EV-04) | Aprobado |
| CP-31 | RF-SL-71, RF-SL-67 | Tres pedidos facturados en una opción | Cambiar su orden arrastrando y recargar la página. OPC:243, `facturacion-envio.spec.ts:51` | El orden y las asignaciones se conservan después de recargar | Se conservan (EV-01, EV-04) | Aprobado |
| CP-32 | RF-SL-70, RN-53 | Opción «Envío por camión» con pedidos facturados, sin piloto o sin fecha u hora programadas | Intentar enviar. OPC:210, `facturacion-envio.spec.ts:51`, `e2e/comunes/componentes.spec.ts:60` | No se puede enviar; se indica qué falta | El botón queda deshabilitado y el servidor rechaza el envío si falta cualquier dato. El aviso de qué falta se comprueba en la muestra de componentes, no en Facturación (EV-01, EV-04) | Aprobado en parte |
| CP-33 | RF-SL-16, RF-SL-72, RN-52 | Dos envíos por camión el mismo día y uno al día siguiente | Enviar las tres opciones. OPC:114, FLUJO:277 | Se crean la Ruta 1 y la Ruta 2 del primer día y la Ruta 1 del día siguiente, cada una con su fecha y su fecha y hora programadas | Ruta 1 y Ruta 2, y Ruta 1 al día siguiente, por sede y por día de Guatemala (EV-01, EV-03) | Aprobado |
| CP-34 | RF-SL-72, RN-52 | Opción «Cliente recoge en bodega» el mismo día de CP-33 | Enviarla. OPC:114, FLUJO:318 | Se crea el Pedido 1, con numeración aparte de las rutas | Pedido 1 (EV-01, EV-03) | Aprobado |
| CP-35 | RNF-06 | Envío a Bodega en el que falla la creación de las líneas (falla simulada en la prueba automatizada) | Ejecutar la prueba. OPC:180 | No se guarda nada: ni el envío, ni sus líneas, ni su estado, ni su número | Se revierten el envío, el número, el historial, los enlaces y la bitácora (EV-01) | Aprobado |
| CP-36 | RF-SL-75, RF-SL-74 | Ruta enviada con fecha y hora programadas | Abrirla en Bodega y pulsar «Detalle de Ruta». BOD:407, `e2e/picking/bodega.spec.ts:200` | Se ve la fecha y hora programadas, no la hora de envío; el detalle muestra completos cada pedido facturado y todas sus líneas, en el orden del facturador | Igual al esperado (EV-01, EV-04) | Aprobado |
| CP-37 | RF-SL-23, RNF-13 | Ruta en Bodega abierta en dos pantallas | Marcar una línea en una pantalla. `e2e/flujo/tiempo-real.spec.ts:86`, `e2e/picking/bodega-tiempo-real.spec.ts:98`, `e2e/picking/tablero.spec.ts:299` | La marca aparece en la otra pantalla sin recargar, en menos de 2 segundos | Aparece en la otra pantalla en menos de 2 s; en la CI, entre 320 y 666 ms (EV-04) | Aprobado |
| CP-38 | RF-SL-23, RF-SL-24, RN-11 | Ruta con todas sus líneas sin marcar | Pulsar «Marcar todo» y después «Ruta Despachada». BOD:300, `bodega.spec.ts:417`, FLUJO:385 | El botón se habilita con todas marcadas; la ruta pasa a En Ruta y deja de aparecer en Bodega. Un pedido pasaría a Despachado | Igual al esperado; el pedido pasa a Despachado (EV-01, EV-03, EV-04) | Aprobado |
| CP-39 | RF-SL-20, RN-28 | Ruta con líneas de distintos pesos | Pulsar «Ordenar por peso». BOD:272, `tablero.spec.ts:368`, `bodega-tiempo-real.spec.ts:203` | Las filas quedan de mayor a menor cantidad en kg en todas las pantallas; no queda en la bitácora | Igual al esperado (EV-01, EV-04) | Aprobado |
| CP-40 | RF-SL-77 | Ruta con más líneas de las que caben en una columna del tablero | Abrir el tablero en pantalla completa. `tablero.spec.ts:201`, `src/componentes/picking/bodega/tablero/disposicion.test.ts:18 a 40` | Las líneas se numeran de arriba hacia abajo: primero la columna izquierda y después la derecha. Precisión del 24/10 (JM-05): pasa a dos columnas solo con más de 900 px de ancho; en el teléfono usa una columna y la pantalla se desplaza | Igual al esperado, también en la TV de 1920 × 1080 (EV-01, EV-04) | Aprobado |
| CP-41 | RF-SL-78, RF-SL-79, RF-SL-28 | Piloto con dos rutas En Ruta | Abrir Ruta, reordenar los clientes y pulsar «Ruta Entregada». RUTA:277, 293, 472, 535; `e2e/picking/ruta.spec.ts:134, 186`; REP:127; FLUJO:410 | Las rutas aparecen de la más reciente a la más antigua; no hay registro histórico en el módulo; el recorrido queda guardado y la ruta aparece en «Rutas realizadas» de Reportes | Igual al esperado; el aviso dice «Ruta 1 entregada. Quedó en el registro histórico de Reportes.» (EV-01, EV-03, EV-04) | Aprobado |

## Seguridad y acceso {-}

Tabla: Casos de prueba de seguridad y acceso {#tab:f-seguridad}

| Id | Requerimiento | Entrada | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|
| CP-42 | RF-SL-55, RNF-04 | Usuario sin el permiso de Facturación | Abrir la dirección del módulo y llamar directamente a la acción de carga del archivo. `m/envios/acciones.test.ts:31`, `e2e/acceso/permisos.spec.ts:74`, `bodega.spec.ts:462` | Ambos se rechazan en el servidor | La acción se rechaza sin sesión, sin permiso y con otra sede. La apertura directa de la dirección se comprueba con Bodega, que usa la misma verificación (EV-01, EV-04) | Aprobado en parte |
| CP-43 | RF-SL-66, RN-17 | Usuario con acceso solo a Quetzaltenango | Pedir datos de Guatemala desde la pantalla y modificando la petición. `permisos.spec.ts:87`, `m/permisos/servicio.test.ts:115`, `m/permisos/sede.test.ts:19`, BOD:451, OPC:297, REP:327, `m/tiempo-real/ruta.test.ts:29` | No ve ni modifica datos de Guatemala | La sede ajena se ignora o se rechaza en todos los módulos y en el tiempo real (EV-01, EV-04) | Aprobado |
| CP-44 | RN-38 | Usuario con rol escrito « gerencia » y sin casillas marcadas | Entrar a todos los módulos y sedes. `m/permisos/servicio.test.ts:27`, `src/lib/roles.test.ts:5, 18` | Tiene acceso total, como Gerencia | Acceso total con « gerencia », «SOPORTE» y «Gérencia» (EV-01) | Aprobado |
| CP-45 | RF-SW-09 | Nombre de usuario que no existe en ningún sistema | Escribirlo en «Acceso personal». ACC:27, 122; `e2e/acceso/acceso-personal.spec.ts:60` | Se indica que no tiene permisos para acceder; la consulta queda en la bitácora y cuenta en el límite de intentos por dirección IP | Igual al esperado; 20 consultas de usuarios inexistentes bloquean la dirección IP (EV-01, EV-04) | Aprobado |
| CP-46 | RN-54, RF-SW-09 | Usuario con una cuenta en el sitio y otra en el picking, con el mismo nombre | Escribirlo en «Acceso personal» y entrar a cada sistema con su contraseña. ACC:50, `acceso-personal.spec.ts:84`, USR:157, 569 | Se habilitan los dos sistemas; cada uno pide la contraseña de su cuenta | Igual al esperado, con contraseñas y cookies independientes (EV-01, EV-04) | Aprobado |
| CP-47 | RNF-15, RN-39 | Usuario existente | Escribir mal la contraseña 5 veces seguidas y luego escribirla bien. ACC:95, 113, 230; `e2e/acceso/auditoria-jg24.spec.ts:118` | Queda bloqueado 15 minutos aunque la contraseña sea correcta. La bitácora registra los intentos y el bloqueo | Igual al esperado; el bloqueo vence a los 15 minutos (EV-01, EV-04) | Aprobado |
| CP-48 | RF-SW-13, RF-SL-48, RNF-03 | Gerencia crea un usuario y después le restablece la contraseña | Escribir una contraseña de menos de 8 caracteres y después una válida. `m/usuarios/esquemas.test.ts:25, 147`, USR:230, 584, `src/lib/contrasenas.test.ts:12`, `e2e/panel/usuarios.spec.ts:81` | La corta se rechaza; la válida se guarda cifrada con scrypt y el usuario entra con ella | Igual al esperado; scrypt con los parámetros mínimos de OWASP (EV-01, EV-04). Las contraseñas comunes se prueban en CP-111 | Aprobado |
| CP-49 | RF-SL-57 | Usuario eliminado | Iniciar sesión con su usuario. USR:269, 374; ACC:160 | No puede entrar. Su historial y la bitácora se conservan | La eliminación es lógica, cierra su sesión y conserva la bitácora (EV-01) | Aprobado |
| CP-50 | RF-SW-30 | Usuario con sesión abierta | Cerrar sesión. `e2e/acceso/auditoria-jg24.spec.ts:69`, `e2e/acceso/sesiones-jg26.spec.ts:56` | Vuelve a la página de inicio del sitio | Vuelve a Inicio con el aviso «Sesión cerrada.»; la sesión del otro sistema sigue y Atrás no muestra contenido (EV-04) | Aprobado |

## Sitio web y panel {-}

Tabla: Casos de prueba del sitio web y del panel {#tab:f-sitio}

| Id | Requerimiento | Entrada | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|
| CP-51 | RF-SW-07, RF-SW-01 | Usuario con permiso de Contenido institucional | Cambiar el texto de la misión y subir una imagen. `e2e/panel/contenido.spec.ts:197`, `m/contenido/acciones.test.ts:59` | Inicio y Quiénes somos muestran la misión con el texto a la izquierda y la imagen a la derecha | Inicio la muestra así con más de 900 px (en el teléfono, el texto va arriba). Quiénes somos lee el mismo contenido, pero la prueba no lo abre (EV-01, EV-04) | Aprobado en parte |
| CP-52 | RF-SW-28, RNF-17, RN-56 | Portada con una imagen y después con cinco | Abrir Inicio. `e2e/sitio/inicio.spec.ts:110`, `e2e/sitio/rendimiento-galerias.spec.ts:74`, `m/contenido/acciones.test.ts:41` | Con una imagen, queda fija; con cinco, rotan cada 5 s; la sexta se rechaza. La carga inicial con cinco imágenes no tarda más que con una | Igual al esperado: los mismos bytes en la carga inicial y una mediana no mayor (margen de medición de 10 ms) (EV-01, EV-04) | Aprobado |
| CP-53 | RF-SW-29 | Cinco imágenes de valores | Subirlas desde el panel. `e2e/sitio/nosotros.spec.ts:101, 120`, `m/contenido/nosotros.test.ts:8` | Quiénes somos muestra las cinco en una fila, sin texto | Igual al esperado; sin imagen, la tarjeta muestra solo el número del valor (JG-28) (EV-01, EV-04) | Aprobado |
| CP-54 | RF-SW-25 | Usuario del sitio sin el permiso de Catálogo | Intentar crear un producto público desde el panel y llamando directamente a la acción. `m/contenido/panel-catalogo.test.ts:75, 188` | Se rechaza en el servidor | Todas las acciones se rechazan sin sesión, sin permiso y desde el otro sistema (EV-01) | Aprobado |
| CP-55 | RF-SW-17 | Producto público sin industrias en común con otros productos | Abrir su detalle. `m/contenido/catalogo.test.ts:14, 50`, `e2e/sitio/industrias-y-productos.spec.ts:267` | «Productos Recomendados» aparece igual, completada con otros productos en orden alfabético, sin repetir el producto | Se completa hasta cuatro productos en orden alfabético, sin el actual (EV-01, EV-04) | Aprobado |
| CP-56 | RF-SW-14, RN-41 | Producto documentado sin lote, y otro con un enlace que no es de Google Drive | Guardarlos. `m/documentos/servicio.test.ts:42`, `e2e/panel/documentos.spec.ts:51` | Ambos se rechazan con el motivo | Igual al esperado (EV-01, EV-04) | Aprobado |
| CP-57 | RF-SW-21, RN-19 | Usuario con solo el permiso de ver documentos | Hacer clic en un producto documentado. `e2e/panel/documentos.spec.ts:102`, `m/documentos/servicio.test.ts:93` | La ventana muestra «Ver» y la vista previa de Google Drive, y ninguna opción de descargar | Igual al esperado (EV-01, EV-04) | Aprobado |
| CP-58 | RF-SW-19, RF-SW-06 | Formulario de contacto sin país, y con país Guatemala sin departamento | Enviarlo. `e2e/sitio/contacto.spec.ts:68, 118`, `m/solicitudes/servicio.test.ts:60, 74, 136`, `m/solicitudes/bandeja.test.ts:51` | Se pide el país, y con Guatemala el departamento y el municipio. Completo, la solicitud se guarda, no se envía por correo y aparece en la bandeja | Igual al esperado (EV-01, EV-04) | Aprobado |
| CP-59 | RF-SW-31 | Solicitud nueva y menú del panel reducido a íconos | Abrir el panel. `e2e/panel/solicitudes.spec.ts:128`, `bandeja.test.ts:62` | El ícono de Solicitudes muestra el indicador de solicitudes nuevas | Igual al esperado, con el menú normal y el reducido (EV-01, EV-04) | Aprobado |

## Ajustes del 15/10/2026 {-}

Tabla: Casos de prueba de los ajustes del 15/10/2026 {#tab:f-ajustes}

| Id | Requerimiento | Entrada | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|
| CP-60 | RF-SL-70, RN-53 | Opción «Envío por camión» vacía | Escribir «20102026» en la fecha y «1330» en la hora; después «31/02/2026» y «25:90». `e2e/comunes/campos-fecha-hora.spec.ts:8, 31`, `facturacion-envio.spec.ts:51`, OPC:210 | Las primeras quedan como «20/10/2026» y «13:30» y se guardan; las segundas no se guardan y el campo se marca en rojo | Igual al esperado; además, el servidor rechaza la fecha y la hora inexistentes (EV-01, EV-04) | Aprobado |
| CP-61 | RF-SL-61 | Tablero de pedidos facturados desplazado hacia abajo | Seleccionar una tarjeta. `facturacion-carga.spec.ts:40` | El tablero no se mueve; la tarjeta seleccionada muestra solo su número y su peso total | Igual al esperado en los tres navegadores, incluido Firefox en el teléfono desde JC-11 (EV-04) | Aprobado |
| CP-62 | RF-SW-18 | Noticia publicada | Pulsar el botón del basurero en el panel y confirmar. `e2e/sitio/noticias.spec.ts:92, 124`, `m/contenido/noticias.test.ts:50, 74` | La noticia deja de mostrarse en el sitio y la eliminación queda en la bitácora. No existe la opción de ocultar | Igual al esperado (EV-01, EV-04) | Aprobado |
| CP-63 | RF-SW-20 | Solicitud sin comentario | Escribir un comentario y pulsar «Guardar comentario»; después pulsar «Editar comentario». `e2e/panel/solicitudes.spec.ts:69`, `bandeja.test.ts:107` | Se guarda y el botón pasa a «Editar comentario» con el cuadro de solo lectura; al pulsarlo, el cuadro se habilita y el botón vuelve a «Guardar comentario» | Igual al esperado (EV-01, EV-04) | Aprobado |
| CP-64 | RF-SL-59 | Reportes con el periodo Rango | Escribir «01102026» en la fecha de inicio y pulsar Enter. `e2e/picking/reportes.spec.ts:25`, `src/lib/fechas.test.ts:131`, `campos-fecha-hora.spec.ts:8` | La fecha queda como «01/10/2026» y el periodo se actualiza | En Reportes se prueba la fecha escrita con barras y Enter; la conversión de «01102026» se prueba en el campo común de fecha que usa Reportes (EV-01, EV-04) | Aprobado en parte |

## Funciones agregadas al Entregable No. 3 {-}

Tabla: Casos de prueba funcionales del picking y del sitio {#tab:f-funcionales}

| Id | Requerimiento | Entrada | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|
| CP-65 | RF-SL-04, RN-39 | Camión nuevo | Crearlo, editarlo y eliminarlo en Configuración. `e2e/picking/camiones.spec.ts:28`, `m/camiones/servicio.test.ts:52, 154` | Se crea, se edita y se elimina de forma lógica; sale de las listas, la ruta lo conserva y cada cambio queda en la bitácora | Igual al esperado (EV-01, EV-04) | Aprobado |
| CP-66 | RF-SL-04 | Camión elegido en «Envío por camión» | Eliminarlo o cambiarlo de sede. `m/camiones/servicio.test.ts:192, 214, 232` | No se elimina ni cambia de sede mientras está elegido; un camión eliminado ya no se ofrece en Facturación | Igual al esperado (EV-01) | Aprobado |
| CP-67 | RN-46, RF-SL-57 | Usuario con rol « piloto »; piloto elegido que luego se elimina | Abrir Facturación y eliminar el piloto. USR:310, 345; OPC:285 | Aparece como piloto de su sede; al eliminarlo se limpia su selección; se rechazan camiones de otra sede y pilotos inactivos | Igual al esperado (EV-01) | Aprobado |
| CP-68 | RN-13 | 3,500 kg en el camión de 3,400 kg | Enviar. OPC:235, `facturacion-envio.spec.ts:51` | Aviso «Sobrepeso.»; se puede enviar y los kg se guardan exactos | Igual al esperado (EV-01, EV-04) | Aprobado |
| CP-69 | RF-SL-38 | Reportes con datos | Descargar Excel y PDF en las tres pestañas. `e2e/picking/reportes-exportacion.spec.ts:26`, `m/reportes/exportacion.test.ts:103, 227, 238` | Seis archivos: Excel de una hoja y PDF con la sede, el periodo y el logotipo; el nombre del archivo lleva las fechas del rango | Igual al esperado (EV-01, EV-04) | Aprobado |
| CP-70 | RNF-04, RF-SL-38 | Gerencia elige la segunda sede; después, la exportación responde con error | Exportar. `reportes-exportacion.spec.ts:69, 91` | Excel y PDF traen los datos y el nombre de la sede elegida; si falla, aparece el mensaje general | Igual al esperado (corrección de INC-29) (EV-04) | Aprobado |
| CP-71 | RF-SL-58 | Tablero en pantalla completa | Cambiar entre modo claro y oscuro y recargar. `tablero.spec.ts:100` | El modo se conserva en esa pantalla sin afectar a otras | Igual al esperado (EV-04) | Aprobado |
| CP-72 | RF-SL-24, RF-SL-25 | Pedido con todo marcado | Pulsar «Pedido Despachado» en el tablero. `tablero.spec.ts:432, 468` | Confirma, avisa y saca el pedido; la pantalla se queda en la ruta que muestra | Igual al esperado (EV-04) | Aprobado |
| CP-73 | RF-SL-25 | 5,515 kg en un camión de 6,000 kg | Abrir el tablero. `m/bodega/tablero.test.ts:9, 32` | Muestra 92 % y no lo marca como lleno | Igual al esperado (EV-01) | Aprobado |
| CP-74 | RF-SL-03, RF-SL-56 | Gerencia crea un usuario de Bodega de Quetzaltenango | Crearlo, editarlo y desactivarlo. `e2e/picking/usuarios.spec.ts:31`, USR:116, 424, 462, `m/usuarios/acciones.test.ts:102` | Solo ve esa sede; la respuesta no incluye la contraseña; desactivarlo cierra su sesión; Gerencia no puede desactivarse a sí misma | Igual al esperado (EV-01, EV-04) | Aprobado |
| CP-75 | RF-SW-18, RN-56 | Noticia con 5 imágenes | Crearla y editarla. `m/contenido/noticias.test.ts:50, 145`, `e2e/sitio/noticias.spec.ts:124` | Se publica al guardar, conserva la fecha al editarla y muestra el texto completo sin desbordar | Igual al esperado (EV-01, EV-04) | Aprobado |
| CP-76 | RF-SW-07, RN-56 | Industria | Guardar la descripción y la galería. `e2e/panel/industrias-y-catalogo.spec.ts:24`, `m/contenido/panel-catalogo.test.ts:108` | Se publica sin perder los datos anteriores y se elimina la imagen retirada | Igual al esperado (EV-01, EV-04) | Aprobado |
| CP-77 | RF-SW-03, RF-SW-04 | Página Productos | Abrirla, buscar sin acentos y filtrar por industria. `e2e/sitio/industrias-y-productos.spec.ts:107, 219` | Barra de solo íconos con «Todas las industrias» primero; recuentos, estado vacío y tarjetas sin lote | Igual al esperado (EV-04) | Aprobado |
| CP-78 | RF-SW-21, RN-55 | Producto documentado | Buscarlo por lote, nombre y país; crear un duplicado, también al mismo tiempo. `m/documentos/servicio.test.ts:70, 84, 110` | Lo encuentra; no se duplica | Igual al esperado (EV-01) | Aprobado |
| CP-79 | RF-SW-02 | Los 5 banners del sitio y las tres partes de la aplicación | Medir los banners y recorrer el sitio, el panel y el picking. `e2e/sitio/banners.spec.ts:10`, `e2e/flujo/sin-restos-del-prototipo.spec.ts:107, 120, 134` | Los banners tienen la misma altura, con el contenido centrado; no quedan textos de ejemplo del prototipo | Igual al esperado (EV-04) | Aprobado |

## Roles y permisos {-}

Tabla: Casos de prueba de roles y permisos {#tab:f-permisos}

| Id | Requerimiento | Entrada | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|
| CP-80 | RN-38 | Usuarios de demostración con distintos permisos, en cada sistema | Iniciar sesión y abrir el menú. `e2e/acceso/permisos.spec.ts:57` | Cada uno ve solo sus módulos | Igual al esperado (EV-04) | Aprobado |
| CP-81 | RNF-04 | Sin sesión, con la cookie del sitio y sin el permiso de Bodega | Abrir `/picking/bodega`. `permisos.spec.ts:74`, `src/proxy.test.ts:7`, `tablero.spec.ts:561` | Sin sesión o con la del sitio, redirige a `/acceso`; sin permiso, muestra «Sin acceso a este módulo» e «Ir a mi módulo» | Igual al esperado (EV-01, EV-04) | Aprobado |
| CP-82 | RF-SW-13 | Usuario del sitio con solo el permiso de ver documentos | Entrar al panel. `e2e/panel/usuarios.spec.ts:31`, USR:537 | Solo ve Documentación interna | Igual al esperado (EV-01, EV-04) | Aprobado |
| CP-83 | RF-SL-56 | Usuario con el permiso de camiones, sin acceso total | Abrir Usuarios y llamar a sus acciones. `e2e/picking/usuarios.spec.ts:77`, `m/usuarios/acciones.test.ts:44`, `m/permisos/servicio.test.ts:39` | No ve la pestaña; el servidor rechaza crear, editar, restablecer y eliminar | Igual al esperado (corrección H-44) (EV-01, EV-04) | Aprobado |
| CP-84 | RF-SL-26, RN-46 | Pilotos ejemplo.06 y ejemplo.07, y Gerencia | Abrir Ruta. RUTA:117, 227, 254; `e2e/picking/ruta.spec.ts:86`; `m/ruta/acciones.test.ts:116` | El piloto ve solo sus rutas de su sede de trabajo y no puede entregar una ruta ajena; Gerencia ve todas | Igual al esperado (EV-01, EV-04) | Aprobado |

## Validación {-}

Tabla: Casos de prueba de validación {#tab:f-validacion}

| Id | Requerimiento | Entrada | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|
| CP-85 | RF-SL-03, RF-SL-04 | Capacidad 0, negativa, con texto o con más de 3 decimales; identificación vacía o de más de 40 caracteres; usuario sin nombre, rol o sede | Guardar. `m/camiones/esquemas.test.ts:13, 20, 33`, `m/camiones/acciones.test.ts:71`, `m/usuarios/esquemas.test.ts:53` | Se rechaza; se aceptan los miles con coma | Igual al esperado (EV-01) | Aprobado |
| CP-86 | RF-SW-06 | Textos de Contacto más largos que sus topes | Escribir y enviar. `m/solicitudes/servicio.test.ts:38`, `e2e/sitio/auditoria-ce13.spec.ts:11` | Se recortan al tope; los avisos salen en español | Igual al esperado (corrección INC-21) (EV-01, EV-04) | Aprobado |
| CP-87 | RF-SW-06 | 6 envíos de Contacto desde la misma dirección IP en 60 minutos | Enviar. `e2e/sitio/contacto.spec.ts:152`, `m/solicitudes/servicio.test.ts:93, 115` | Se guardan 5; el sexto muestra «Recibimos varias solicitudes desde su conexión. Inténtelo de nuevo en una hora.»; los envíos simultáneos no pasan el límite | Igual al esperado; la IP se libera al vencer el plazo (EV-01, EV-04) | Aprobado |
| CP-88 | RF-SW-06 | Campo trampa lleno (envío de un robot) | Enviar. `m/solicitudes/servicio.test.ts:124`, `contacto.spec.ts:189` | Responde con un folio, pero no guarda la solicitud ni consume el consecutivo | Igual al esperado; el campo trampa no se alcanza con el teclado (EV-01, EV-04) | Aprobado |
| CP-89 | RNF-05 | Más de 10 000 caracteres en la misión, en la descripción de una industria o un producto y en el texto de una noticia | Salir del campo o guardar. `e2e/panel/contenido.spec.ts:85`, `industrias-y-catalogo.spec.ts:87, 101`, `e2e/panel/noticias.spec.ts:18`, `m/contenido/servicio.test.ts:9`, `m/contenido/noticias.test.ts:104` | Se rechaza sin publicar | Igual al esperado (EV-01, EV-04) | Aprobado |
| CP-90 | RNF-05 | Comentario de una solicitud con 2001 caracteres | Guardar. `bandeja.test.ts:87`, `e2e/panel/auditoria-ce13.spec.ts:212` | El servidor lo rechaza; acepta 2000 | Igual al esperado (EV-01, EV-04) | Aprobado |
| CP-91 | RNF-05 | Correo de la información de contacto mal formado o vacío; lista de reordenamiento de Bodega con una línea repetida | Guardar. `m/contenido/contacto.test.ts:79, 96`, `contacto.spec.ts:225`, BOD:620 | Rechaza el correo mal formado y acepta el vacío o válido; rechaza la lista repetida sin cambiar las posiciones | Igual al esperado (EV-01, EV-04) | Aprobado |

## Seguridad básica {-}

Tabla: Casos de prueba de seguridad básica {#tab:f-seguridad-basica}

| Id | Requerimiento | Entrada | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|
| CP-92 | RNF-16 | `/`, `/acceso`, `/panel`, una página inexistente, el tiempo real y un recurso estático, en producción | Pedirlos y revisar las cabeceras. `e2e/seguridad/cabeceras.spec.ts:11`, `src/lib/cabeceras.test.ts:5, 29, 36` | `nosniff`, `strict-origin-when-cross-origin`, HSTS de 1 año, CSP con `frame-ancestors 'none'`, `default-src 'self'`, `base-uri 'none'` y `object-src 'none'` sin `unsafe-eval`, `Permissions-Policy`, COOP `same-origin` y sin `X-Powered-By` | Igual al esperado (EV-01, EV-04) | Aprobado |
| CP-93 | RNF-16 | Un script en línea ajeno; otro sitio que inserta la aplicación en un marco | Cargar. `cabeceras.spec.ts:72, 80, 109, 126`, `src/proxy.test.ts:20` | El *nonce* es de 128 bits y distinto en cada respuesta; el script ajeno se bloquea; el marco ajeno se rechaza; Google Maps y Google Drive se admiten | Igual al esperado (EV-01, EV-04) | Aprobado |
| CP-94 | RNF-16 | Producción | Iniciar sesión. `cabeceras.spec.ts:34`, `src/lib/cookies.test.ts:9, 26` | Las cookies propias llevan `__Host-`, `Secure` y `path=/`, sin `Domain` | Igual al esperado (EV-01, EV-04) | Aprobado |
| CP-95 | RNF-03 | Sesión abierta | Dejarla sin uso; revocarla. ACC:160, 209 | Dura 7 días con renovación diaria y expira sin uso; al revocarla deja de valer en la petición siguiente | Igual al esperado (EV-01) | Aprobado |
| CP-96 | RF-SL-01 | Sesión abierta | Iniciar sesión de nuevo; cerrar sesión y pulsar Atrás. `e2e/acceso/sesiones-jg26.spec.ts:31, 56`, ACC:303, 360 | La sesión anterior queda invalidada; Atrás no muestra contenido | Igual al esperado; la respuesta lleva `Clear-Site-Data: "cache"` (EV-01, EV-04) | Aprobado |
| CP-97 | RNF-05 | SVG, GIF, texto renombrado como .jpg, archivo de más de 5 MB y una foto JPG con ubicación GPS | Subirlos en el panel. `m/almacenamiento/servicio.test.ts:11, 21` | Se rechazan los cuatro primeros; la foto se convierte a WebP de hasta 2000 px, sin metadatos | Igual al esperado (EV-01) | Aprobado |
| CP-98 | RNF-05 | Archivo .xlsx manipulado: ZIP con muchas entradas, bomba ZIP con tamaño falseado, más de 20 000 filas | Cargarlo en Facturación. ODOO:460, 480, 528, 572 | Se rechaza antes de leerlo; la memoria no crece más de 50 MB; 20 000 filas se leen y 20 001 se rechazan | Igual al esperado (corrección de INC-28) (EV-01) | Aprobado |
| CP-99 | RNF-05 | Petición con un origen ajeno o con el origen interno del proxy | Publicar imágenes o usar la operación de acceso. `m/contenido/noticias.test.ts:194, 222`, `m/contenido/panel-catalogo.test.ts:137`, ACC:265, `acceso-personal.spec.ts:124` | Se rechaza: exige el permiso y el origen propio | Igual al esperado (EV-01, EV-04) | Aprobado |
| CP-100 | RN-39 | Inicio de sesión; error inesperado en el servidor | Ejecutar. ACC:145, REP:145, `src/lib/errores.test.ts:29, 44` | La bitácora y la sesión se guardan juntas; el error inesperado muestra un mensaje general, sin detalle técnico | Igual al esperado (EV-01) | Aprobado |
| CP-111 | RF-SL-48, RNF-03 | Contraseña común («Password123»), con el nombre de la empresa o con el nombre de usuario; restablecer la contraseña de Gerencia | Guardarla | Se rechaza; restablecer la contraseña de una cuenta de acceso total pide la contraseña de quien lo hace (`specs/03`, 29/10/2026) | Todavía se aceptan, y no se pide la contraseña propia (INC-35 e INC-36) | Pendiente (CE-14, 05/11/2026) |

## Flujo completo, tiempo real y accesibilidad {-}

Tabla: Casos de prueba del flujo completo, el tiempo real y la accesibilidad {#tab:f-integral}

| Id | Requerimiento | Entrada | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|
| CP-105 | RF-SL-16, RF-SL-24, RN-52, RNF-06, RN-01 | Archivo de ejemplo anonimizado; Quetzaltenango sin envíos del día | Cargar, crear la ruta y el pedido, y verlos en Bodega. FLUJO:195 (pasos en 242, 277, 318 y 355) | 33 pedidos cargados y 46 no; Ruta 1 y Pedido 1 En Preparación; conversión igual al cálculo independiente | Igual al esperado en los tres tamaños (EV-03) | Aprobado |
| CP-106 | RN-11, RN-29, RF-SL-37, RF-SL-38, RN-39 | La misma corrida | Despachar, reordenar, entregar y abrir Reportes. FLUJO:385, 410, 458 | Estados En Ruta, Despachado y Entregado; recorrido guardado; indicadores, Rutas realizadas y 6 registros en la bitácora | Igual al esperado en los tres tamaños (EV-03) | Aprobado |
| CP-107 | RNF-13 | Conexión de tiempo real cortada | Esperar. `e2e/flujo/tiempo-real.spec.ts:117`, `m/tiempo-real/conexion.test.ts:62` | Consulta cada 5 s, apaga el indicador «En vivo» y se reconecta sola | Igual al esperado (EV-01, EV-04) | Aprobado |
| CP-108 | RNF-13, RN-17, RN-48 | Dos facturadores al mismo tiempo; sede ajena en el tiempo real; sesión revocada | Operar y conectarse. `e2e/picking/facturacion-dos-facturadores.spec.ts:38`, `m/envios/concurrencia.test.ts:77, 119`, `m/tiempo-real/ruta.test.ts:29, 66`, `tiempo-real.spec.ts:148` | Gana un solo movimiento, sin duplicar; se rechaza la sede ajena; se cierra la conexión al revocar la sesión | Igual al esperado (EV-01, EV-04) | Aprobado |
| CP-109 | RNF-08 | Inicio, acceso, Reportes, Facturación, Bodega y tablero | Revisar con axe. `e2e/comunes/aplicacion.spec.ts:13`, `e2e/comunes/accesibilidad.spec.ts:33, 49, 60`, `bodega.spec.ts:83`, `tablero.spec.ts:491` | Sin violaciones serias ni críticas | Sin violaciones serias ni críticas en ninguna página (EV-04) | Aprobado |
| CP-110 | RNF-08 | Sitio y ventanas de confirmación | Navegar solo con el teclado. `e2e/sitio/revision-integral.spec.ts:104`, `e2e/comunes/componentes.spec.ts:9, 38` | Se recorre todo con el teclado; Escape cierra las ventanas y el foco regresa | Igual al esperado (EV-04) | Aprobado |

## Resumen {-}

Tabla: Resumen de los casos de prueba {#tab:f-resumen}

| Grupo | Casos | Aprobados | Aprobados en parte | Pendientes |
|---|---|---|---|---|
| Conversión validada por INCOVSA | 15 | 15 | 0 | 0 |
| Fraccionados, agrupación, equivalencias y datos incorrectos | 10 | 9 | 1 (CP-20) | 0 |
| Archivo de Odoo | 8 | 8 | 0 | 0 |
| Flujo de picking y despacho | 12 | 11 | 1 (CP-32) | 0 |
| Seguridad y acceso | 9 | 8 | 1 (CP-42) | 0 |
| Sitio web y panel | 9 | 8 | 1 (CP-51) | 0 |
| Ajustes del 15/10/2026 | 5 | 4 | 1 (CP-64) | 0 |
| Funciones del Entregable No. 3 | 15 | 15 | 0 | 0 |
| Roles y permisos | 5 | 5 | 0 | 0 |
| Validación | 7 | 7 | 0 | 0 |
| Seguridad básica | 10 | 9 | 0 | 1 (CP-111) |
| Flujo completo, tiempo real y accesibilidad | 6 | 6 | 0 | 0 |
| **Total** | **111** | **105** | **5** | **1** |

\vertical
