# 18. Historial de decisiones

## Fuentes

| Fecha | Fuente | Dónde está |
|---|---|---|
| 27/08/2026 | Reunión 1, virtual (Ing. William Ambrossio e Ing. Luis Orozco) | `docs/Reuniones/Reunion1_270826/` |
| 01/09/2026 | Documento "INCOVSA Propuesta de proyectos" | `docs/` |
| 04/09/2026 | Reunión 2, virtual. Se aprueba la propuesta 1 junto con el sitio web | `docs/Reuniones/Reunion2_040926/` |
| 08/09/2026 | Lineamientos del docente | `docs/` |
| 09 al 11/09/2026 | Cuestionario respondido por escrito por la contraparte | **No archivado** (P-04) |
| 17/09/2026 | Reunión 3, presencial: visita a la bodega de Quetzaltenango | `docs/Reuniones/Reunion3_170926/` |
| 18/09/2026 | Reunión de especificación de módulos | **Sin acta** (P-04) |
| 19/09/2026 | Entrega de `Picking II.xlsm` y de las imágenes institucionales | `docs_incovsa/` |
| 19 y 20/09/2026 | Aclaraciones con la contraparte | **No archivadas** (P-04) |
| 20/09/2026 | Especificación del sistema v1.0 (`ESPECIFICACION_SISTEMA.md`) | Reemplazada por esta carpeta |
| 21/09/2026 | Documento 1 v0.1 (Entregable 1) | `entregable-1/` |
| 22/09/2026 | Entrega de `INVENTARIO INCOVSA.xlsx` y `Data Odo Para Picking.xlsx` | `docs_incovsa/PROYECTO PICKING/` |
| 23/09/2026 | Entrega del catálogo de prueba (28 imágenes) y de documentos técnicos de ejemplo | `docs_incovsa/PAGINA WEB/` |
| 23/09/2026 | Respuestas del equipo (coordinador Jordin García) a los 74 puntos por aclarar. Incluyen la confirmación del Ing. William sobre entradas y salidas | Esta carpeta |
| 24/09/2026 | Respuestas del equipo a las dudas D1–D30 y a 8 preguntas de cierre | Esta carpeta |
| 24/09/2026 | Respuestas del equipo a los pendientes P-12, P-14, P-15, P-24, P-28, P-29, P-36 y P-43 | Esta carpeta |
| 29/09/2026 | Reunión 4, virtual (Ing. William Ambrossio y el equipo completo). Se presentó el prototipo de simulación y se registraron los cambios solicitados. Notas de Daniela Marín | `docs/Reuniones/Reunion4_290926/` |
| 08/10/2026 | Copia local actualizada de `Data Odo Para Picking.xlsx` | `docs_incovsa/PROYECTO PICKING/` |
| 09/10/2026 | Confirmación del coordinador (Jordin García): el design system y la mayoría de las funcionalidades del prototipo de simulación están aprobados por el Ing. William Ambrossio y el Ing. Manuel Rojas, salvo los cambios de la reunión 4, que son obligatorios | Esta carpeta |
| 11/10/2026 | Respuestas del coordinador a las dudas P-45 y P-51 a P-76 sobre cómo aplicar los cambios de la reunión 4, con el código de los mapas de Google Maps de Quetzaltenango y Guatemala | Esta carpeta |
| 12/10/2026 | El coordinador aprueba usar los nombres reales de los clientes en el prototipo de simulación y las medidas de seguridad de [16-arquitectura-y-tecnologia.md](16-arquitectura-y-tecnologia.md) | Esta carpeta |
| 12/10/2026 | Respuestas del coordinador en el documento de preguntas para la reunión del 13/10 con el Ing. William: P-11, P-20, P-26, P-27, P-33, P-34 y P-41, formato del archivo de Odoo y presentación del Entregable 2 | Esta carpeta |
| 13/10/2026 | Reunión 5, virtual (Ing. William Ambrossio y el equipo completo), de 18:00 a 21:30. Se presentó el prototipo de simulación con los cambios de la reunión 4; el Ing. William lo aprobó y pidió nuevos cambios. Notas de Daniela Marín (dicen "14 de octubre" por error) | `docs/Reuniones/Reunion5_131026/` |
| 13/10/2026 | Entrega del logotipo de Inquiserca | `docs_incovsa/PAGINA WEB/INFORMACION EMPRESA/Inquiserca.jpeg` |
| 14/10/2026 | Respuestas del coordinador a las dudas sobre cómo aplicar los cambios de la reunión 5 | Esta carpeta |

## Decisiones reemplazadas

Si un documento anterior dice lo de la columna "Antes", ya no aplica.

| Tema | Antes | Ahora | Desde |
|---|---|---|---|
| Selector de sede al iniciar sesión | Sí había selector (acta 3, 17/09) | No hay selector; la sede sale de la cuenta | 20/09, reconfirmado el 23/09 |
| Módulos del picking | 3 (acta 3) y luego 4 (18/09) | 6: Facturación, Bodega, Ruta, Inventario, Reportes y Configuración | 24/09 |
| Estados del pedido | Validado, Preparado y Cancelado (notas de la reunión 3) | Pendiente, Cancelado, En Preparación, Despachado, En Ruta y Entregado | 20/09 |
| Pendiente y Cancelado | Se guardaban (el Documento 1 decía "el sistema registra el pedido en estado Pendiente") | No se guardan. La cancelación queda en la bitácora | 23/09 |
| Estado "Editado" | Se agregaba al editar la ruta por devolución | Se reemplaza por la marca "Con devolución" | 24/09 |
| Cantidades exactas (RN-03) | Solo se vendían cantidades exactas | Se permiten ventas fraccionadas, con resto en kg | 23/09 |
| Unidad de la cantidad (RN-04) | La misma unidad del Peso de Conversión: kg, galón, libra o litro | Todo en kg | 23/09 |
| Alerta de capacidad aproximada | Se debía a la mezcla de unidades | Todo es kg; INCOVSA acepta igual que sea aproximada | 23/09 |
| Unicidad del SKU (RN-15) | Los 4 dígitos finales diferenciaban cada registro | El sufijo es el lote de Odoo y no es único. La clave es el código completo | 23/09 |
| Cantidad de productos | "857 códigos distintos" | 856; hay uno duplicado | 23/09 |
| Catálogo maestro | Odoo (respuesta 7 del 23/09) | Productos y Peso de Conversión de `Picking II`; existencias de `INVENTARIO INCOVSA` (Xela) | 24/09 |
| Entradas de inventario | Fuera del alcance. Solo había devoluciones | Compras, ajustes, traslados y devoluciones | 23/09 |
| Traslados entre sedes | Fuera del alcance | Dentro, automáticos entre origen y destino | 23/09 |
| Creación de productos | Fuera del alcance | Gerencia y Soporte IT, en Configuración | 23/09 |
| Inventario "espejo de Odoo" | Se cargaba una vez y solo cambiaba por despachos y devoluciones | Existencias propias con entradas y salidas, sin conexión con Odoo | 23 y 24/09 |
| Devoluciones | Se editaba el registro de ruta, una sola vez, por producto y cliente | Módulo de Inventario, ligadas al pedido, por línea, varias veces sin superar lo vendido, para ambos tipos de pedido | 24/09 |
| Prioridad en Bodega | Se asignaba desde la tableta; no estaba claro si se guardaba | Compartida en tiempo real y no guardada en el historial | 24/09 |
| Recorrido de la ruta | "El orden que el piloto define" | El orden al pulsar "Pedido Entregado" | 24/09 |
| Número de ruta | Sin definir | Correlativo por sede | 24/09 |
| Cuentas compartidas | Solo Gerencia (20/09). El 23/09 se respondió que cualquiera podía usar la misma cuenta | Se mantiene: solo Gerencia, y un solo rol por sistema | 24/09 |
| Quién crea usuarios | Gerencia y Soporte IT creaban usuarios de cualquier rol | Sitio: solo Gerencia, desde el panel. Picking: Gerencia y Soporte IT, desde Configuración. La cuenta de Gerencia se crea en cualquiera de los dos | 24/09 |
| Recuperación de contraseña | Por correo para los usuarios del panel | Sitio: por correo si hay correo; si no, Gerencia. Picking: Soporte IT | 24/09 |
| Acceso a documentos internos | Por rol mínimo por documento (ER del Documento 1); "por documento" (respuesta del 23/09) | Por rol del usuario | 24/09 |
| Vista general | "Descargar PDF" | Solo visualizar el PDF | 24/09 |
| Asociación de documentos | Al producto operativo, pendiente de confirmar | A uno o varios productos públicos; el COA lleva además el código o lote como texto | 23 y 24/09 |
| Administración del contenido del sitio | Administrativo y Gerencia | Se mantiene: Gerencia y Administrativo | 24/09 |
| Almacenamiento de imágenes | Sistema de archivos del servidor | Cloudflare R2, plan gratuito. Los PDF siguen en el servidor | 23 y 24/09 |
| Industrias | 8 (propuesta de la empresa) | 9, con Lavandería | 23/09 |
| Producto e industria | Un producto, una industria (ER) | Un producto puede tener varias industrias | 23/09 |
| Presencia web | "La empresa no cuenta con sitio web" | Tiene una página básica en Google Sites. No tiene sitio corporativo | 24/09 |
| Separar INCOVSA e Inquiserca en el picking | El plan (SL-15) dividía el sistema por empresa | No se separan; comparten existencias | 23/09 |
| Ubicaciones | Se consideraba el recorrido dentro de la bodega (plan B7) | No se guardan ni se muestran | 24/09 |
| Control de inventario | Existencias propias por producto y sede, con compras, ajustes, traslados, devoluciones y ventas (23 y 24/09) | **Fuera del alcance.** Lo lleva Odoo. Se eliminan el módulo de Inventario y todas sus reglas | 29/09 |
| Módulos del picking | 6 | 5: Facturación, Bodega, Ruta, Reportes y Configuración | 29/09 |
| Ingreso de pedidos | Captura manual en una tabla, con búsqueda de cliente y producto | Carga de un .xlsx exportado de Odoo | 29/09 |
| Validación de existencias y salida por venta | Al registrar y al enviar el pedido | No existen | 29/09 |
| Devoluciones y marca "Con devolución" | En Inventario, ligadas al pedido (24/09) | No existen | 29/09 |
| Número del pedido | Correlativo interno por sede | El tercer segmento de la Referencia de Odoo. Si reemplaza al correlativo: P-53 | 29/09 |
| Peso de conversión | Peso de Conversión del catálogo | Se mantiene. La columna de peso del archivo de Odoo no se usa | 29/09 |
| Modelo de acceso | Un rol por sistema, con permisos fijos por rol | Permisos por usuario con casillas. El rol es un campo; solo Gerencia y Soporte son predeterminados | 29/09 |
| Acceso de Soporte | Soporte IT solo en el picking | Soporte con el mismo acceso global que Gerencia, incluida la administración del sitio | 29/09 |
| Roles del sitio y operativos del picking | Administrativo, Operativo, Vista general, Facturador, Bodega y Piloto | Dejan de ser predeterminados; se reemplazan con permisos | 29/09 |
| Eliminar usuarios | Solo se desactivaban (campo activo) | Se pueden eliminar | 29/09 |
| Bitácora | Solo operaciones del picking, consultable en Reportes (prototipo) | Todas las acciones de cada usuario, interna en el backend, sin pantalla | 29/09 |
| Reportes | Propuesta del equipo, no aprobada (P-05) | El contenido del prototipo, aprobado, con filtros por periodo y sin la pestaña Bitácora | 29/09 y 09/10 |
| Tablero de Bodega | Temas "TV" (verdes oscuros) y "Tableta" (claro) | "Modo claro" (el de Tableta) y "Modo oscuro" (negros y grises) | 29/09 |
| Inicio del sitio | Con la sección "Catálogo informativo" y misión y visión en tarjetas de texto | Sin "Catálogo informativo"; misión y visión como imágenes centradas | 29/09 |
| Logotipo "Transformamos INCOVSA" | Se usaba en el pie y en bloques del sitio (prototipo) | Solo de uso interno; el sitio usa el logotipo de la cabecera | 29/09 |
| Pie de página | En todas las páginas públicas | Solo en Inicio, Quiénes somos, Noticias y Contacto | 29/09 |
| Página de Industrias | Mosaico con fotografías de productos | Descripción, una imagen por industria y productos en texto | 29/09 |
| Campos del producto público | Presentación, origen, manejo, almacenamiento, humedad, tipo y restricciones | Al crear solo se agregan origen y presentación. Los demás: P-71 | 29/09 |
| Noticias | Campos sin definir (P-23); el prototipo usaba título y resumen | Fotografía, título y texto | 29/09 |
| Formulario de contacto | Tipo, nombre, empresa, correo, teléfono, sede y mensaje | Además, teléfono con código de país, validación y campos territoriales | 29/09 |
| Bandeja de solicitudes | Solo lectura | Motivo, responsable, comentario y estados Asignado, En proceso y Solucionado | 29/09 |
| Documentos internos | Asociados a uno o varios productos públicos; el COA con código o lote en texto (24/09) | Nombre del producto, país de origen y lote (solo números) | 29/09 |
| Prototipo de referencia | Prototipos `.dc.html` del Anexo C, sin aprobación (P-16) | Prototipo de simulación, aprobado salvo los cambios de la reunión 4 | 09/10 |

## Pendientes resueltos el 24/09/2026

| Pendiente | Decisión |
|---|---|
| P-12 | Administrativo **sí** descarga documentos internos |
| P-14 | Soporte IT **sí** opera Facturación, Bodega y Ruta, en todas las sedes |
| P-15 | Gerencia y Soporte IT **sí** crean, editan y eliminan clientes, sectores y camiones |
| P-24 | El correlativo del pedido es **por sede** |
| P-28 | La fecha de la ruta es la del envío de Facturación a Bodega, y el número se asigna en ese mismo paso |
| P-29 | Los movimientos de inventario **sí** se pueden editar (el detalle queda en P-50) |
| P-36 | Los clientes son **comunes** a las 3 sedes |
| P-43 | Si cambia el Peso de Conversión, los pedidos ya enviados **conservan** el Peso de Conversión con el que se vendieron |

## Decisiones reemplazadas el 11/10/2026

Ajustes a lo registrado el 29/09, según las respuestas del coordinador.

| Tema | Lo anotado el 29/09 | Ahora (11/10) |
|---|---|---|
| Pedido | Sin definir si tenía uno o varios clientes (P-51) | Cada referencia de Odoo es un **pedido facturado**, de un solo cliente. El **pedido** que va a Bodega reúne los pedidos facturados de una opción de envío y **puede tener varios clientes**, como hasta ahora (aclarado el 11/10 en la segunda ronda de respuestas) |
| Armado del pedido | Un pedido con un camión y un piloto, elegidos al capturar | Tablero de pedidos facturados a la izquierda, guardado en la base de datos. El facturador arrastra cada pedido facturado a un camión de la sede o a "Cliente recoge en bodega", entre opciones y de regreso al tablero. Cada opción tiene su piloto (camiones), su control de peso, sus botones "Enviar Pedido a Bodega" y "Cancelar" (que regresa los pedidos al tablero), y guarda lo asignado. Se pueden eliminar pedidos facturados del tablero, uno o todos |
| Número del pedido | Correlativo interno por sede, o número de Odoo (P-53) | El pedido facturado se identifica con su número de Odoo; el pedido que va a Bodega, con un **correlativo por sede**. No se valida si una referencia se repite |
| Nombre y sector del cliente | Desde la base de clientes | Si el cliente existe, de la base. Si no existe y no se guarda, de `Contacto` y `Contacto/Ciudad`. El sector es el único dato que el facturador puede corregir, y la corrección se guarda en la base |
| Productos o clientes que no existen | Sin definir (P-54, P-55, P-81, P-82) | Producto: el sistema pregunta si se agrega y pide solo el Peso de Conversión; si no se agrega, el pedido facturado no se carga. Cliente: pregunta si se guarda y pide nombre y sector (de la lista o uno nuevo) |
| Referencias que se cargan | Sin definir (P-57) | Solo las de estado "Hecho". Cada archivo es de una sola bodega. Prefijos: `XE`, `GT`, `ESC`. Pruebas solo con Quetzaltenango |
| Producto del picking | Código completo, Unidad Medida y Peso2 | **Nombre y Peso de Conversión.** El nombre tiene el formato de Odoo, sin lote; el catálogo de `Picking II` se convierte a ese formato y el METANOL de Guatemala queda con 164 kg. "Unidad de Medida" no se usa y la columna SKU se quita de todas las pantallas |
| Nombre "Peso2" | Peso2 | **Peso de Conversión**, en todo el sistema y en esta carpeta. Solo la columna del Excel de la empresa conserva su nombre literal, `Peso2` |
| Administración de usuarios | Posible administración única (P-59) | Se mantienen dos administraciones y dos inicios de sesión. Los usuarios del sitio en el panel; los del picking en Configuración. Las administran Gerencia y Soporte |
| Permisos | Detalle sin definir (P-60) | Por módulo y por acción. Se aprobó la lista propuesta |
| Rol | Sin definir (P-61) | Texto libre. El rol predeterminado se llama "Soporte" |
| Sede del usuario | Una sola sede o todas (P-62) | Se marcan las sedes a las que tiene acceso, como los permisos |
| Pilotos | Rol Operativo Piloto | Usuarios cuyo rol es "Piloto" |
| Recuperación de contraseña | Por correo para usuarios del sitio con correo | Siempre la restablecen Gerencia o Soporte, a solicitud del usuario |
| Bitácora | Todas las acciones, sin pantalla (29/09) | Se consulta en la pestaña "Bitácora" de Reportes. Agrega los inicios de sesión. Siguen sin registrarse el marcado y la prioridad de Bodega y el orden de Ruta antes de entregar |
| Presentación dinámica | Sin definir (P-65) | Animación de aparición y desaparición al desplazarse |
| Inicio | Posibles cambios adicionales (P-66) | No se quita nada más que "Catálogo informativo" |
| Sedes en el sitio | Las tres, con hipervínculo a Google Maps | Solo Quetzaltenango y Guatemala, que tienen oficinas, con sus datos y su mapa insertado. Escuintla no se muestra. Los textos que decían cuántas sedes o bodegas hay se reemplazan |
| Misión y visión en Quiénes somos | "A media pantalla", sin definir (P-68) | Misión arriba y visión abajo, no lado a lado, centradas. Historia y valores con imagen opcional |
| Productos recomendados | Bloque "Otros productos de las mismas industrias" que a veces no aparecía | Se llama "Productos Recomendados" y siempre aparece |
| Producto público | Origen y presentación, más cinco campos de detalle | Nombre, descripción, presentación, países de origen (texto) e imagen (subida o arrastrada). Se eliminan manejo, almacenamiento, humedad, tipo y restricciones. El detalle va sin pie de página |
| Formulario de contacto | Campos territoriales sin definir (P-72) | País en lista de todos los países; departamento y municipio en listas de Guatemala, que solo aparecen si el país es Guatemala. Los tres opcionales. La sede sigue obligatoria y solo ofrece Quetzaltenango y Guatemala |
| Gestión de solicitudes | Detalle sin definir (P-73) | Responsable: usuario del sitio. Un solo comentario. Sin estado inicial. Cualquier estado, sin restricción. Sin aviso por correo |
| Documentos internos | Lote solo números; detalle sin definir (P-74) | Producto escrito, uno solo. Lote con números y letras, obligatorio solo en el COA. País de una lista con todos los países |
| Filtros de Reportes | Sin definir (P-75) | Semana de lunes a domingo. El filtro aplica también a "Rutas realizadas" |
| Menú lateral | Colapsar u ocultar (P-76) | Se reduce a íconos, en el picking y en el panel del sitio |
| Detalle del producto público | Mostraba sus documentos técnicos con acceso restringido | Ya no muestra documentos técnicos |

## Pendientes resueltos el 29/09 y el 09/10/2026

| Pendiente | Decisión |
|---|---|
| P-05 | Reportes: el contenido del prototipo aprobado, con filtros por periodo. Los detalles de los filtros quedan en P-75 |
| P-13 | Ya no se decide por rol: ver y gestionar la bandeja dependen de los permisos de cada usuario |
| P-16 | El prototipo de simulación está aprobado por el Ing. William y el Ing. Manuel Rojas, salvo los cambios de la reunión 4 |
| P-32 | Sí: la bitácora registra todas las acciones de cada usuario, también en el sitio web |
| P-50 | Ya no aplica: el sistema no tiene movimientos de inventario |

Además, P-23 queda resuelto en cuanto a los campos (fotografía, título y texto); sigue pendiente el contenido inicial.

## Documentos alineados el 24/09/2026

- **Se eliminaron:**
  - `ESPECIFICACION_SISTEMA.md` y `PLAN_DE_PROYECTO.md`;
  - `entregable-1/ANEXO_E_REGLAS_DE_CONVERSION.md` y `entregable-1/DOCUMENTO_1.md`;
  - `entregable-1/diagramas/mermaid-anterior/` y los archivos temporales.
- **Diagramas:** se actualizaron las figuras 1 a 8.
- **Prototipos:**
  - Se agregó la pantalla de Inventario.
  - Cada pantalla operativa muestra solo el menú de su rol.
  - Se quitó el registro de devolución de Ruta y se corrigieron los textos.
  - Se regeneraron las capturas y el prototipo navegable.
- **Documento 1:**
  - Se generó la v0.2 alineada con esta carpeta.
  - La v0.1 entregada se conserva como `… v0.1.docx` y `… v0.1.pdf`.
  - Se corrigieron dos defectos de la v0.1: el nombre de la empresa en la portada y la numeración de los pasos de los casos de uso.

## Decisiones vigentes que no cambiaron

Siguen vigentes, sin cambios, las decisiones de la especificación del 20/09 que no aparecen en la tabla anterior. Todas están copiadas en esta carpeta.

## Pendientes resueltos el 11/10/2026

| Pendiente | Decisión |
|---|---|
| P-45 | La aprobación del prototipo por el Ing. Manuel Rojas lo resuelve |
| P-51 a P-57 | Importación y armado de pedidos en Facturación ([06-picking-facturacion.md](06-picking-facturacion.md)) |
| P-59 a P-64 | Usuarios, permisos, sedes, pilotos, contraseñas y bitácora ([03-roles-y-accesos.md](03-roles-y-accesos.md)) |
| P-65 a P-68, P-70 a P-74 | Sitio web ([05-sitio-web.md](05-sitio-web.md)) |
| P-75 y P-76 | Filtros de Reportes y menú lateral |
| P-30 | "Unidad Medida" no se captura ni se usa |
| P-44 | No hay catálogo de unidades de venta: el producto solo tiene nombre y Peso de Conversión |

P-67 queda resuelto con los mapas insertados de Quetzaltenango y Guatemala. P-69 (logotipo de Inquiserca) sigue abierto, pero el sitio deja preparado dónde se sube. P-22 se reduce al correo que recibe las solicitudes y a los horarios, porque Escuintla ya no se muestra. Las dudas que dejaron estas respuestas (P-78 a P-87) se resolvieron en una segunda ronda el mismo 11/10:

| Pendiente | Decisión |
|---|---|
| P-78 | El pedido que va a Bodega puede tener varios clientes, como hasta ahora; Bodega muestra un pedido por tarjeta, como el prototipo. En Ruta, un cliente con dos pedidos facturados va en una sola fila |
| P-79 | "Cancelar" regresa los pedidos al tablero. El tablero se puede vaciar o se pueden eliminar pedidos uno por uno, y se puede arrastrar de una opción al tablero. El tablero y las opciones se guardan en la base de datos, y el pedido de Bodega lleva correlativo por sede |
| P-80 | El catálogo se convierte a los nombres de Odoo, sin lote. METANOL: 164 kg. Sin columna SKU |
| P-81 | Si no se agrega el producto que falta, ese pedido facturado no se carga |
| P-82 | Cliente existente: datos de la base. Cliente nuevo: sector de la lista o uno nuevo. La corrección del sector se guarda en la base |
| P-83 | Departamento y municipio, solo de Guatemala; no aparecen con otro país |
| P-84 | Textos nuevos sin el número de sedes y bodegas |
| P-85 | Misión y visión centradas, como se vean mejor |
| P-86 | El detalle del producto público no muestra documentos técnicos |
| P-87 | El menú reducido a íconos aplica también al panel del sitio |

Después, el mismo 11/10:

| Tema | Decisión |
|---|---|
| 9 códigos de `Picking II` que no se convertían solos | Los 6 con errores de escritura se corrigen agregando el guion y se unen a productos que ya existían; `METABISULFITO DE SODIO II`, `SAL (INVENTARIO II)` y `TRICLORO GRANULAR-TON/0050KG-9127` no se cargan. Catálogo inicial: 339 productos |
| Textos de Presencia y cifra de la portada | Presencia se titula "Visítenos", con el texto "Ubique nuestras oficinas en el mapa: será un gusto atenderle en persona." La cifra "3 sedes con bodega de distribución" se mantiene |
| Título de Contacto | "Cuéntenos cómo podemos ayudarle". Los WhatsApp de Quetzaltenango y Guatemala son distintos y se quedan como están en el prototipo |
| P-25, nombres de cliente repetidos | Los 4 duplicados exactos quedan una sola vez; los 2 con sectores distintos se conservan y el sector del pedido sale de `Contacto/Ciudad`. Base inicial: 314 clientes |

P-58 sigue abierto con el docente, pero no impide avanzar: la exclusión del inventario se le explicará en el Entregable 2.

## Decisiones del 12/10/2026

| Tema | Antes | Ahora |
|---|---|---|
| Nombres de clientes en el prototipo de simulación | Anonimizados ("Cliente ejemplo NNN") | Nombres reales, porque la validación de clientes del archivo de Odoo los necesita. El HTML armado no se sube al repositorio (RNF-10) |
| Control de permisos | Middleware de Next.js en cada petición | Middleware solo como primera barrera; **cada operación del servidor** verifica sesión, permiso y sede, por la vulnerabilidad CVE-2025-29927 de Next.js ([16](16-arquitectura-y-tecnologia.md)) |
| Versión de Next.js | Next.js 15 | Next.js 15, como mínimo 15.2.3, con los parches de seguridad al día |
| Inicio de sesión | Sin límite de intentos | Bloqueo temporal tras varios intentos fallidos (RNF-15); los intentos fallidos van a la bitácora (RN-39) |
| Archivos subidos | Validación del formulario | Validación por contenido y nombre de archivo generado por el servidor (RNF-05) |
| Cabeceras y dependencias | Sin definir | Cabeceras de seguridad y dependencias revisadas en cada pull request (RNF-16) |
| Respaldos | Procedimiento documentado y probado | Además, automáticos (RNF-09) |
| Pruebas obligatorias | Conversión y lectura del archivo de Odoo | También la verificación de permisos y sedes |
| Repositorio (P-49, resuelto) | `specs/` v1.1 y el código fuente del prototipo de simulación sin commit; el HTML armado del prototipo no estaba en el `.gitignore` | Subidos a `develop` por pull request; el `.gitignore` excluye `entregable-1/prototipos/prototipo-simulacion-incovsa.html`. Las direcciones, teléfonos y correos de las sedes que trae el código del prototipo se suben, porque son datos de contacto institucionales |
| Rediseño "Planta" de Pickit Visual (PR #33 y #34) | Propuesta de verde `#006800` y tipografía Barlow para el tablero de Bodega | Se cierran sin integrar. El design system vigente es el del prototipo de simulación aprobado ([20](20-prototipo-aprobado.md)) |
| Prototipo navegable del Entregable 1 (`entregable-1/prototipos/prototipo-completo-incovsa.html`) | En el repositorio | Se quita: ya no se usa. El prototipo vigente es el de simulación |

## Pendientes resueltos el 12/10/2026

Respuestas del coordinador, escritas en el documento de preguntas para la reunión del 13/10 con el Ing. William.

| Pendiente | Decisión |
|---|---|
| P-11, entorno de pruebas | El Entregable 2 se prueba solo en las computadoras del equipo. No hay entorno en internet ni servicio de terceros ([16](16-arquitectura-y-tecnologia.md)) |
| P-20, texto de la visión | La empresa compartirá la imagen corregida. P-20 sigue abierto solo para recibirla ([05](05-sitio-web.md)) |
| P-26, conversión exacta | Se muestra "2 unidades", sin "+ 0 kg" ([07](07-picking-bodega.md), [12](12-reglas-de-negocio.md)) |
| P-27, TV, tableta y red de la bodega | No hace falta: el sistema es completamente responsivo y se adapta a cualquier pantalla ([07](07-picking-bodega.md)) |
| P-33, `CONTROL DE DOCUMENTOS TECNICOS POR INGRESO 2026.xlsx` | Solo sirvió para mostrar cómo se manejan los documentos técnicos. No se carga nada en la documentación interna ([13](13-datos-maestros.md)) |
| P-34, 2 videos de WhatsApp del 21/09 | No tienen uso; se ignoran ([13](13-datos-maestros.md)) |
| P-41, cantidad de usuarios por rol | No aplica: se pueden crear todos los usuarios que se necesiten ([03](03-roles-y-accesos.md)) |

Además, el mismo 12/10:

| Tema | Decisión |
|---|---|
| Formato del archivo de Odoo | Siempre se exporta con la misma estructura del archivo de ejemplo ([13](13-datos-maestros.md)) |
| Presentación del Entregable 2 | Se presenta solo al Ing. Manuel Rojas, no en clase ([00](00-proyecto.md)) |
| Notas del prototipo | Se quitan las notas de P-26, P-27 y P-41 y el selector de P-26 del panel Demostración; la nota de P-20 se actualiza |

## Decisiones técnicas del 12/10/2026

El coordinador aprobó las 17 decisiones técnicas propuestas, que resuelven **P-37**, **P-39** y **P-42** y todas las [DECISIÓN TÉCNICA] abiertas. El detalle está en [16-arquitectura-y-tecnologia.md](16-arquitectura-y-tecnologia.md), "Decisiones técnicas (12/10)".

| Tema | Antes | Ahora |
|---|---|---|
| Orden de prioridad de Bodega y orden de Ruta antes de entregar | "No se guarda" (24/09) | Se guarda **solo el orden actual**, sin historial ni bitácora, para compartirlo entre pantallas ([14](14-modelo-de-datos.md)). La decisión del 24/09 se refería a no guardar el historial |
| Librería de .xlsx | Sin definir; el prototipo usaba SheetJS 0.18.5 de npm, abandonada y vulnerable | SheetJS 0.20.3 desde el sitio oficial, con archivo de máximo 2 MB y revisión manual de avisos en cada entrega. Se eligió frente a ExcelJS 4.4.0, que tiene vulnerabilidades publicadas en agosto de 2026 sin versión corregida (entre ellas, una descompresión sin límite al leer archivos) |
| Eliminar registros con historial (P-42) | Sin definir; el prototipo no deja eliminar | Eliminación lógica |
| Pedidos facturados con cantidades vacías o en 0 | Sin definir | El pedido facturado no se carga y se avisa ([06](06-picking-facturacion.md)) |

Al aplicar la clave normalizada de productos (decisión 13) aparecieron 2 pares de productos que quedan iguales y un nombre con el envase repetido (P-88). El mismo 12/10 el coordinador lo resolvió:

| Pendiente | Decisión |
|---|---|
| P-88 | Se conservan `INCO BLACK VSF 600% (IND-CAJ/0025KG)` y `SODA ASH (SOL-SAC/0025KG)`. `INCOBLACK VSF 600%-IND-CAJ/0025KG-4034`, `SODa ASH-SOL-SAC/0025KG-5813` y `SODA ASH-SOL-SAC/SAC/0025KG-2479` se corrigen y se unen a ellos. Catálogo inicial: **336 productos** ([13](13-datos-maestros.md)) |

## Versiones del stack (12/10/2026)

Al preparar la documentación técnica del Entregable 2 se revisaron las versiones vigentes. El coordinador aprobó:

| Tema | Antes | Ahora |
|---|---|---|
| Node.js | 22 LTS | **24 LTS**: es la LTS activa y la que está instalada en los equipos del equipo; Node 22 deja de tener soporte en abril de 2027 |
| PostgreSQL | 16 | **18**, la instalada en los equipos del equipo |
| Next.js | 15 (como mínimo 15.2.3) | **16** (16.4.0 al 12/10). En Next.js 16 el middleware se llama `proxy.ts` |
| Autenticación | Auth.js; contraseñas con bcrypt | **Better Auth 1.7**, con inicio de sesión por nombre de usuario; contraseñas con scrypt. Auth.js está en modo mantenimiento desde septiembre de 2025 y sus mantenedores recomiendan Better Auth para proyectos nuevos |

## Reunión 5 (13/10/2026)

El Ing. William aprobó el prototipo de simulación que se le presentó (el armado el 13/10, que ya incluía los cambios del commit "Prototipo mejorado") y pidió los cambios que siguen. El detalle de cada uno está en el archivo del módulo y en el registro CAM-40 a CAM-77 de [20-prototipo-aprobado.md](20-prototipo-aprobado.md).

### Decisiones reemplazadas el 13/10/2026

| Tema | Antes | Ahora (13/10) |
|---|---|---|
| Datos del archivo de Odoo | Producto validado contra el catálogo; cliente y sector desde la base de clientes; ventanas para agregar productos y clientes que faltan (11/10) | Se usan **tal como vienen**, sin validar nada y sin guardarlos en catálogos |
| Peso de Conversión | Del catálogo del picking; la columna `Movimientos de stock/Producto/Peso` no se usaba porque a veces venía en 0 (29/09) | De la columna `Movimientos de stock/Producto/Peso` de cada línea. El Ing. William se comprometió a entregar el archivo con todos los datos |
| Lote en el picking | No se usaba; el catálogo no tenía lote | De la columna `Movimientos de stock/Números de serie`; se guarda y se muestra resaltado en Bodega |
| Catálogos del picking | Productos (336), clientes (314) y sectores en Configuración, cargados de `Picking II` | Ya no existen. Configuración queda con Camiones y Usuarios (14/10) |
| Corrección del sector en la tarjeta | Se guardaba en la base de clientes (11/10) | Se elimina |
| Opciones de envío | Una por cada camión de la sede, más "Cliente recoge en bodega" | Dos: "Envío por camión" (camión y piloto de listas desplegables) y "Cliente recoge en bodega" |
| Nombre de lo que se envía a Bodega | "Pedido", con correlativo por sede; el de camión tenía además una ruta | Lo de camión es una **ruta** y lo que recoge el cliente es un **pedido** |
| Numeración | Correlativo continuo por sede, para pedidos y rutas | Correlativo **diario** por sede, aparte para rutas y para pedidos |
| Fecha y hora | Bodega mostraba la hora de envío desde Facturación | Cada opción tiene fecha y hora programadas, obligatorias (14/10); Bodega muestra esas y no la hora de envío |
| Tarjetas del tablero | Con asa de arrastre y "x" para eliminar | Sin asa ni "x"; se seleccionan uno, varios o todos para arrastrarlos o eliminarlos |
| Orden dentro de la opción | No se ordenaba | El facturador los ordena; el orden pasa a Bodega y a Ruta |
| Bodega | Una fila por producto; contador en la barra lateral | Una fila por producto, lote y Peso de Conversión (14/10); lote resaltado; detalle de ruta o pedido; ordenar por peso; marcar todo; sin contador |
| Tablero en dos columnas | Numeración por filas | Numeración de arriba hacia abajo, primero la columna izquierda |
| Módulo de Ruta | Pestañas "En ruta" y "Registro histórico" | Solo rutas en curso, de la más reciente a la más antigua; el histórico está en Reportes. El botón "Pedido Entregado" pasa a llamarse "Ruta Entregada" |
| Misión y visión | Las imágenes de la empresa, centradas, una debajo de la otra (29/09) | Misión: texto a la izquierda e imagen a la derecha; visión: imagen a la izquierda y texto a la derecha. Sin imagen hasta que se suba (14/10) |
| Valores | Texto, con imagen opcional | 5 imágenes, una por valor, en una fila, sin texto |
| Imágenes del sitio | Una imagen por área | Galerías de hasta 5 imágenes que rotan cada 5 s; con una sola imagen, fija (14/10) |
| Menú de Industrias | Lista lateral con nombre de cada industria | Barra lateral solo con íconos; el nombre aparece al pasar el cursor |
| Solicitudes de contacto | Se guardaban y se enviaban por correo a la sede | Solo se guardan en el sistema. El sistema ya no envía correos |
| Acceso personal | Tres botones y un inicio de sesión por sistema | Usuario → validación → elección del sistema → contraseña. Revela si el usuario existe (aceptado el 14/10, con límite de intentos) |
| Nombre de usuario | Único en los dos sistemas | Único dentro de cada sistema; se puede repetir en el otro |
| Cierre de sesión | Volvía al inicio de sesión del sistema | Vuelve a la página de inicio del sitio |
| Contraseñas | Gerencia o Soporte asignaban una temporal | Gerencia o Soporte la escriben al crear el usuario y al restablecerla |
| Contenido institucional en el panel | Sección "Imágenes del sitio" (solo de consulta) | Campos para subir la portada y el logotipo de INCOVSA |
| Solicitudes en el panel | Contador oculto con el menú reducido | Indicador de solicitudes nuevas también con el menú reducido |
| Documentación interna | Un documento PDF por registro, con tipo, producto, país y lote (lote obligatorio solo en el COA) | Un producto documentado con nombre, país, lote obligatorio y los enlaces de Google Drive de FT, HS y COA; la tabla sin columnas Documento y Tipo; acciones solo editar y eliminar; clic en la fila para ver o descargar según los permisos |
| Fecha de creación de los registros | No se había pedido | Cada registro guarda la fecha y la hora exactas en que se guardó |

### Aprobado con el prototipo del 13/10

Cambios del commit "Prototipo mejorado" que el Ing. William vio y aprobó con el prototipo, y que el coordinador pidió registrar el 14/10:

| Tema | Antes | Ahora |
|---|---|---|
| País en el formulario de contacto | Opcional, igual que departamento y municipio (11/10) | Obligatorio; departamento y municipio son obligatorios cuando el país es Guatemala |
| Validación del correo y del teléfono | Al enviar el formulario | Además, al salir de cada campo |
| Tarjeta del pedido facturado | Número, cliente, sector y total en kg | Además, la lista de productos con su cantidad en kg |
| Presentación dinámica | Imágenes de Inicio y misión y visión de Quiénes somos | Imágenes y tarjetas de todas las páginas públicas |
| Filtro de periodo de Reportes | Despacho y Rutas realizadas | También la Bitácora |

### Respuestas del coordinador del 14/10/2026

| Duda | Decisión |
|---|---|
| ¿Qué pasa si el Peso de Conversión del archivo viene en 0 o vacío? | Ese pedido facturado no se carga y se avisa en el resumen de la carga (RN-50) |
| ¿Qué pasa con Productos, Clientes y Sectores de Configuración y con la corrección del sector? | Se eliminan, con sus permisos. Configuración queda con Camiones y Usuarios |
| ¿Dónde están los documentos técnicos y cómo se distingue ver de descargar? | En Google Drive. "Ver" abre la vista previa de Drive y "Descargar" el enlace de descarga. Que quien solo puede ver no descargue depende de cómo comparta INCOVSA el archivo en Drive (P-92) |
| El paso del usuario revela si existe, contra RNF-15 | Se acepta como lo pidió la contraparte. En la pantalla de sistemas solo se habilitan los sistemas donde el usuario tiene cuenta (Odoo siempre). El paso cuenta en el límite de intentos y en la bitácora |
| ¿Qué imagen de misión y visión se muestra mientras no suban otra? | Ninguna: el lugar queda vacío. `MISION.jpg` y `VISION.jpg` no se usan |
| ¿A qué áreas aplican las galerías de hasta 5 imágenes? | A todas las áreas con imágenes del sitio público, salvo los logotipos y los valores. Con una sola imagen, la imagen queda fija |
| ¿Qué ordena "de mayor a menor peso" en Bodega? | Las filas de cada ruta o pedido |
| ¿Cómo se muestra el mismo producto con lotes distintos? | Una fila por producto, lote y Peso de Conversión |
| ¿La fecha y la hora programadas son obligatorias? | Sí |
| ¿Cómo funciona el orden de los pedidos facturados en la opción? | Se reordenan dentro de la opción; el orden pasa al detalle y a las líneas de Bodega y al orden inicial de los clientes de la ruta |
| ¿Se registran los cambios del commit del 13/10? | Sí, todos (tabla anterior) |
| ¿Dónde va la matriz de trazabilidad del Entregable 2? | Dentro del contenido del Documento 2 |

### Decisiones del equipo del 14/10/2026

Decisiones de diseño y técnicas para aplicar los cambios ([DECISIÓN TÉCNICA], regla 4 de [README.md](README.md)). Las técnicas están en [16-arquitectura-y-tecnologia.md](16-arquitectura-y-tecnologia.md), "Decisiones técnicas del 14/10".

| Tema | Decisión |
|---|---|
| Arrastre táctil sin asa | En pantallas táctiles el arrastre empieza con una pulsación larga sobre la tarjeta; un toque corto la selecciona |
| Encabezados de las páginas públicas | Usan las imágenes de la galería de portada (opción aprobada por el coordinador el 14/10) |
| Botones con la nueva terminología | "Enviar a Bodega", "Ruta Despachada" / "Pedido Despachado" y "Ruta Entregada" |
| Enlaces de la documentación | Los tres son opcionales; el lote es el único obligatorio, como dice el acta. Se valida que sean de Google Drive. El par nombre, país y lote no se repite |
| Nombres de usuario de Gerencia y Soporte | No se repiten en el otro sistema, porque esas cuentas ya sirven en los dos |
| Contraseñas | Mínimo 8 caracteres y se escriben dos veces |
| Cuentas en Better Auth | Clave de acceso interna y correo interno por sistema, para que el mismo nombre de usuario exista en los dos sistemas (decisión técnica 26) |

### Pendientes resueltos el 13/10 y el 14/10/2026

| Pendiente | Decisión |
|---|---|
| P-09 | Ya no aplica: el sistema no envía correos |
| P-20 | Se cierra: la imagen de la visión ya no se muestra; el texto del sitio dice "transparente" |
| P-35 | Ya no aplica: no hay carga inicial de productos ni clientes |
| P-69 | Se recibió el logotipo de Inquiserca (13/10) |
| P-89 | Ya no aplica: el Peso de Conversión viene en el archivo de Odoo; el caso de prueba 4 (55 kg con peso 55 → 1 unidad) se conserva tal como lo validó la empresa |

Pendientes nuevos: P-90, P-91 y P-92 ([19-pendientes.md](19-pendientes.md)).

## Ajustes del coordinador (15/10/2026)

El 15/10/2026 el coordinador revisó el prototipo con los cambios de la reunión 5 y pidió los ajustes que siguen. El detalle está en el archivo de cada módulo y en el registro CAM-78 a CAM-95 de [20-prototipo-aprobado.md](20-prototipo-aprobado.md).

### Decisiones reemplazadas el 15/10/2026

| Tema | Antes | Ahora (15/10) |
|---|---|---|
| Noticias | Se publicaban u ocultaban; la noticia guardaba si estaba publicada | Se eliminan (botón con el basurero); toda noticia guardada se publica. El permiso pasa a "Crear, editar y eliminar noticias" y NOTICIA pierde el atributo "publicada" |
| Página de Noticias | Tarjetas en tres columnas con un extracto del texto | Cada noticia a todo el ancho, con título y texto completos |
| Fondos del sitio | Misión y visión y "A quién servimos" en blanco | Con el verde del pie de página |
| Bloque "INCOVSA e Inquiserca" | Logotipo de la cabecera | Los dos logotipos alternados, como el banner |
| Pantallas de acceso | Título, descripción y notas sobre los roles, alineados abajo a la izquierda | Solo título y descripción, centrados |
| Encabezado de los módulos | Instrucción debajo del título (salvo Facturación) | Instrucción breve a la par del título en todos los módulos de los dos sistemas |
| Comentario de una solicitud | Botón "Guardar comentario" siempre | "Editar comentario" cuando ya hay uno guardado |
| Tarjeta seleccionada en Facturación | Mostraba todos sus datos; seleccionar regresaba el tablero hasta arriba | Muestra solo número y peso total; el tablero no se mueve |
| Fecha y hora programadas | Campos del navegador, en ámbar mientras estaban vacíos | Se escriben como texto (dd/mm/aaaa y HH:MM de 24 horas) o se eligen con el calendario o el reloj, que se abren debajo del campo; en verde mientras están vacíos |
| Fechas del filtro de Reportes | Campo de fecha del navegador | Se escriben como texto (dd/mm/aaaa) o se eligen con el calendario |
| Lote en Bodega | Etiqueta ámbar | Verde; gris en el modo oscuro del tablero |
| Silueta del camión en el tablero | Pequeña para 3,400 kg y grande para 6,000 kg | La grande para todos, porque la empresa puede comprar camiones de otras capacidades |
| Cuadro del número del pedido en Bodega | Gris | Verde lima, distinto del verde de la ruta |
| Detalle de Ruta y de Pedido | Las tablas de los pedidos facturados quedaban recortadas | Todo completo; se desplaza la ventana |
| Nota del nombre de usuario en las ventanas de usuario | "Único en … Puede ser el mismo de una cuenta …" | Se quita; la regla RN-54 no cambia |
| Texto al pie del módulo de Ruta | "Al confirmar, la ruta pasa a Entregado y queda en el registro histórico de Reportes con su recorrido." | Se quita |

### Respuestas del coordinador del 15/10/2026

| Duda | Decisión |
|---|---|
| ¿Qué secciones de Quiénes somos pasan al verde del pie? | Solo las que eran blancas: "Misión y visión" y "A quién servimos". Historia, Valores e "INCOVSA e Inquiserca" conservan el fondo claro |
| Sin el botón "Ocultar", ¿qué pasa con la opción de publicar u ocultar? | Se quita: toda noticia se publica al guardarla |
| ¿Qué campos de fecha se escriben con el teclado? | Los de Facturación y los del filtro de periodo de Reportes |

### Decisiones de diseño del 15/10/2026

| Tema | Decisión |
|---|---|
| Formato de la fecha escrita | dd/mm/aaaa, el de esta carpeta; las barras se agregan solas y al salir se completan los ceros |
| Formato de la hora escrita | 24 horas, HH:MM; "1330" se convierte en "13:30" |
| Color del cuadro del pedido | Verde lima (`--lima`), el acento del logotipo, para distinguirlo del verde principal de la ruta |
| Noticia en la página pública | Galería a la izquierda y texto a la derecha; en teléfono, una debajo del otro |
| Pantallas de acceso | El logotipo se conserva arriba a la izquierda como enlace al sitio |
| Tarjeta seleccionada en Facturación | Queda compacta, con la altura de su contenido, sin estirarse a la de las demás |

## Documentos no alineados con las reuniones 4 y 5

Al 14/10/2026 todavía reflejan el estado del 24/09 y **no** incorporan los cambios del 29/09, del 11/10 ni del 13/10:

- el Documento 1 v0.2 y sus figuras (casos de uso, actividades, estados, arquitectura y modelos ER);
- las capturas de los prototipos `.dc.html` (los archivos `.dc.html` y `canvas.json` se borraron del repositorio el 14/10, en el commit "Prototipo mejorado").

El prototipo de simulación se actualizó el 14/10/2026 con los cambios de la reunión 5 y el 15/10/2026 con los ajustes del coordinador ([20-prototipo-aprobado.md](20-prototipo-aprobado.md)), y el Documento 2 pasó a la versión 0.2 (la entregada el 14/10) y el 15/10 a la versión 0.3, alineada con la especificación 1.3.
