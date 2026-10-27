# 20. Prototipo aprobado y cambios de las reuniones 4 y 5, del 15/10 y del 16/10

## El prototipo

| Dato | Valor |
|---|---|
| Nombre | Prototipo de simulación de INCOVSA |
| Código fuente | `entregable-1/prototipos/simulacion/src/` (`base.js`, `sitio.js`, `panel.js`, `picking.js`, `tablero.js`, `inicio.js`, `estilos.css`, `plantilla.html`) |
| Cómo se arma | `python construir.py` desde `entregable-1/prototipos/simulacion/`. Genera `entregable-1/prototipos/prototipo-simulacion-incovsa.html`, que se abre con doble clic |
| Datos | Toma imágenes, logotipos (incluido el de Inquiserca), documentos de ejemplo y, de `Picking II.xlsm`, nombres reales de productos con su Peso de Conversión y sus lotes, y de clientes con su sector, **solo para armar las rutas y los pedidos de ejemplo** con que arranca la simulación (desde el 13/10 el sistema no tiene esos catálogos). Los usuarios siguen anonimizados. Los departamentos y municipios de Guatemala salen del INE (Censo 2018), en `simulacion/datos/guatemala.json` |
| Repositorio | Se suben el código fuente y, desde el 16/10, también el **HTML armado**, aunque contiene datos reales de la empresa, porque el repositorio es privado ([16](16-arquitectura-y-tecnologia.md), decisión 63). Así lo usan los agentes de IA y GitHub Actions como referencia. Cada cambio del código fuente se sube junto con el HTML vuelto a armar con `construir.py` |
| Presentado | 29/09/2026 (reunión 4) y 13/10/2026 (reunión 5), al Ing. William Ambrossio. El 14/10/2026 se presenta al Ing. Manuel Rojas como avance del Entregable 2 |
| Aprobación | El 09/10/2026 el coordinador confirmó que el **design system** y la **mayoría de las funcionalidades** están aprobados por el Ing. William Ambrossio y por el Ing. Manuel Rojas, salvo los cambios de la reunión 4. El **13/10/2026** el Ing. William **aprobó** el prototipo con esos cambios y pidió los de la reunión 5 (CAM-40 a CAM-77), que se aplicaron el 14/10. El **15/10/2026** el coordinador revisó el prototipo y pidió los ajustes CAM-78 a CAM-95, que se aplicaron ese día. El mismo 15/10 se corrigieron las diferencias que quedaban entre el prototipo y esta carpeta (versión 1.4). El **16/10/2026** el coordinador pidió la exportación a Excel y PDF en "Rutas realizadas" y "Bitácora" (CAM-96), que se aplicó ese día |

## Cómo se usa para desarrollar

1. La aplicación real se construye **a partir de este prototipo**, que desde el 14/10/2026 incluye los cambios de las reuniones 4 y 5, y desde el 15/10/2026 los ajustes del coordinador.
2. Si el prototipo y esta carpeta dicen cosas distintas, **vale esta carpeta** en los requisitos, las reglas, los textos, los datos y el comportamiento (regla 1 de [README.md](README.md)); **en el diseño vale el prototipo** (decisión 89 de [16](16-arquitectura-y-tecnologia.md), 22/10). Los cambios de la reunión 4 ya están escritos en los archivos de cada módulo.
3. Lo que esta carpeta no detalla (distribución de la pantalla, textos de ayuda, orden de los elementos, interacción) se toma del prototipo.
4. Mientras un cambio esté pendiente (P-xx), no se implementa como decidido. Donde el cambio está pendiente pero el prototipo ya resuelve algo, el archivo del módulo dice qué parte del prototipo se conserva.

### Lo que el prototipo tiene y la aplicación real no

| Elemento del prototipo | Motivo |
|---|---|
| Botón "Demostración" (entrar como, abrir pantallas, reiniciar datos) | Herramienta de presentación |
| Cuentas de ejemplo y contraseña `demo` en el inicio de sesión | Herramienta de presentación |
| Notas amarillas de pendientes (P-xx) | Herramienta de validación |
| Leyenda "Prototipo para validación" del pie y nota "Simulación" del tablero | Herramienta de validación |
| Estado guardado en el navegador (`localStorage`) y sincronizado entre pestañas (`BroadcastChannel`) | Simula la base de datos y el tiempo real. La aplicación real usa PostgreSQL y avisos por SSE ([16](16-arquitectura-y-tecnologia.md)) |
| Imágenes que se suben, guardadas en el navegador y reducidas a 900 px | La aplicación real las guarda en Cloudflare R2. Si el navegador se queda sin espacio, la simulación avisa |
| Rutas y pedidos de ejemplo armados con productos y clientes de `Picking II` | Datos de arranque de la demostración. En la aplicación real todo llega en el archivo de Odoo |
| Producto documentado de ejemplo (soda cáustica de México) con los 3 PDF de la empresa incluidos en el archivo | En la simulación no hay enlaces reales de Google Drive. La aplicación real solo guarda enlaces |
| Contraseña `demo` de las cuentas de ejemplo (menos de 8 caracteres) | Herramienta de presentación. Las contraseñas que se crean en la simulación sí piden 8 caracteres |
| Nombres "Usuario de ejemplo NN" | Anonimización. La aplicación real usa los datos que cargue la empresa |
| Eliminación física de usuarios y camiones: el usuario eliminado desaparece y su nombre de usuario queda libre; un camión que ya tiene rutas no se puede eliminar | Simplificación de la simulación. La aplicación real usa eliminación lógica: el nombre de usuario queda reservado, el camión desaparece de las listas y el historial se conserva ([16](16-arquitectura-y-tecnologia.md), decisión 2) (15/10) |
| Sin bloqueo después de varios intentos fallidos de inicio de sesión: la simulación solo los registra en la bitácora | Simplificación de la simulación. La aplicación real bloquea 15 minutos después de 5 intentos fallidos del mismo usuario o de 20 desde la misma dirección IP (RNF-15, [16](16-arquitectura-y-tecnologia.md)) (15/10) |
| Botones Excel y PDF de Reportes que solo muestran un aviso | La simulación no genera archivos. La aplicación real genera el Excel con SheetJS y el PDF con pdfmake, en el servidor ([10](10-picking-reportes.md), [16](16-arquitectura-y-tecnologia.md)) (16/10) |

El módulo de Inventario, la captura manual de pedidos, la unidad de medida, el nombre "Peso2", la recuperación por correo, Escuintla en el sitio, los roles fijos y, desde el 14/10, la validación de productos y clientes, la corrección del sector y una opción por camión ya **no** están en el prototipo.

## Design system aprobado

Definido en `entregable-1/prototipos/simulacion/src/estilos.css`. La aplicación real lo reproduce con Tailwind CSS y shadcn/ui ([16-arquitectura-y-tecnologia.md](16-arquitectura-y-tecnologia.md)).

### Tipografía

| Uso | Fuente |
|---|---|
| Títulos | Poppins (500 a 800) |
| Interfaz y texto | Figtree (400 a 800) |
| Nombres de producto, cantidades y cifras | JetBrains Mono (400 a 700), con cifras tabulares |

Se cargan desde Google Fonts. La tipografía oficial de la empresa sigue pendiente (P-18).

### Colores

| Grupo | Tokens |
|---|---|
| Verdes | `--v950` #031F0B, `--v900` #062D12, `--v850` #083817, `--v800` #0A461F, `--v700` #0D5A24, `--v600` #126C2A (principal), `--v500` #1B8238, `--v400` #37A052, `--v300` #7CC48E, `--v200` #BFE3C8, `--v100` #E3F2E7, `--v50` #F1F8F2 |
| Lima (acento del logotipo) | `--lima` #64932A, `--lima-v` #8DC63F, `--lima-b` #B5E07A |
| Grises | `--g900` #1C1D1C, `--g800` #2B2C2B, `--g700` #3C3C3C, `--g600` #545554, `--g500` #727372, `--g400` #9A9B99, `--g300` #C3C5C1, `--g200` #DCDED9, `--g150` #E7E9E4, `--g100` #EFF1EC, `--g50` #F7F8F5 |
| Estados | Ámbar `--ambar` #9A5B00 / `--ambar-f` #FFF1D6; rojo `--rojo` #B42318 / `--rojo-f` #FDECEA; azul `--azul` #0A6780 / `--azul-f` #E1F2F6 |

Los colores se tomaron de los dos logotipos recibidos. Los códigos exactos de la empresa siguen pendientes (P-18).

### Formas y componentes

- Radios: 8, 12, 18 y 26 px. Sombras suaves en tono verde oscuro.
- **Accesibilidad de los textos secundarios (18/10, JG-05 y JG-06; desde el 22/10 sujeta a la decisión 89, que JG-24 aplica preguntándole a Jordin si falla axe):** para cumplir RNF-08, la miga de navegación, el eyebrow y la instrucción del encabezado de módulo, los encabezados de tabla y los textos secundarios de las pantallas de acceso usan `--g600` sobre `--g50`. La combinación `--g500`/`--g50` del prototipo tiene contraste 4.46:1, inferior al mínimo 4.5:1. Se conserva la paleta aprobada y no se reduce el umbral de axe. **(19/10, JM-08)** Bodega aplica lo mismo en el pie de las tarjetas, las líneas marcadas, «Sin lote» y el Detalle de Ruta, y la etiqueta «RUTA» no lleva opacidad. Única excepción, por decisión del coordinador: el cuadro lima del pedido que recoge el cliente conserva los colores del prototipo ([18](18-historial-de-decisiones.md)). **(23/10, DM-07, excepción a la decisión 89 por decisión del coordinador)** El texto del área de subida de `CampoGaleria` (galerías y campos de una sola imagen del panel) usa `--g600` en reposo (`--g50`) y al pasar el cursor (`--v50`), porque con el `--g500` del prototipo queda en 4.46:1 y 4.41:1. Solo cambia el color del texto; lo demás sigue el prototipo. **(25/10, DM-09; ratificada por Jordin el 26/10, D-07)** En la bandeja de Solicitudes del panel, las pestañas inactivas y el texto secundario de la fila seleccionada usan `--g600`, porque con el `--g500` del prototipo quedan en 4.46:1 y 4.40:1 ([05](05-sitio-web.md)).
- Íconos de trazo, dibujados en SVG dentro del código.
- **Encabezado de los módulos (15/10):** en todos los módulos de la administración del sitio y del picking, el título va con su instrucción, lo más breve posible, a la par (como en Facturación, CAM-55).
- **Secciones verdes del sitio (15/10):** misión y visión (Inicio y Quiénes somos) y "A quién servimos" usan el verde del pie (`--v950`), con títulos en blanco y el acento `--lima-b`.
- **Campos de fecha y hora (15/10):** se escriben como texto (fecha dd/mm/aaaa, hora HH:MM de 24 horas) y tienen un botón de calendario o de reloj que abre el selector del navegador debajo del campo. Un valor inválido se marca en rojo. Están en `base.js` (`campoFecha`) y en `picking.js`.
- Componentes: tarjetas, chips de estado (En Preparación, Despachado, En Ruta, Entregado), avisos verde, ámbar, rojo y azul, mensajes emergentes, ventanas modales de confirmación, tablas con filas que se arrastran, botones segmentados, búsqueda con lista desplegable, medidores y barra lateral de navegación.
- Tablero de Bodega: diseño "Pickit Visual" (pedido en curso con anillo de avance, líneas con unidades grandes, silueta del camión con la ocupación por peso y cola de pedidos). Las siluetas de los camiones también están en `entregable-1/prototipos/pickit-visual/`. Desde el 15/10 el tablero usa **solo la silueta del camión grande** para todos los camiones.
- El tablero tenía dos temas: "TV" (verdes oscuros) y "Tableta" (claro). Desde el 29/09 son **modo claro** (el de "Tableta") y **modo oscuro** (negros y grises) ([07-picking-bodega.md](07-picking-bodega.md)).

## Registro de cambios de la reunión 4

Cada cambio que pidió el Ing. William el 29/09/2026, con su estado después de las respuestas del 11/10/2026. La reunión 5 (13/10) reemplazó parte de CAM-02, CAM-09, CAM-23, CAM-24, CAM-30 y CAM-37 (ver "Registro de cambios de la reunión 5"); lo que dice ese registro y los archivos de cada módulo es lo vigente. "Definido" significa que se puede implementar; "Pendiente" significa que falta resolver lo que indica el P-xx antes de implementarlo.

### Sitio público

| Id | Cambio | Estado | Dónde |
|---|---|---|---|
| CAM-01 | Inicio: quitar la sección "Catálogo informativo", y nada más | Definido | [05](05-sitio-web.md) |
| CAM-02 | Inicio: misión y visión como las imágenes de la empresa, centradas, una debajo de la otra | Definido | [05](05-sitio-web.md) |
| CAM-03 | Inicio: todas las imágenes con animación de aparición y desaparición al desplazarse | Definido | [05](05-sitio-web.md) |
| CAM-04 | Inicio: Quetzaltenango y Guatemala con sus datos y su mapa de Google Maps insertado; Escuintla no se muestra en el sitio | Definido (textos nuevos sin el número de sedes) | [05](05-sitio-web.md) |
| CAM-05 | Inicio: debe ser informativa | Definido (solo se quita "Catálogo informativo") | [05](05-sitio-web.md) |
| CAM-06 | Pie de página solo en Inicio, Quiénes somos, Noticias y Contacto, con el logotipo de la cabecera; Industrias, Productos y detalle de producto sin pie | Definido | [05](05-sitio-web.md) |
| CAM-07 | El logotipo "Transformamos INCOVSA" es de uso interno y no va en el sitio público | Definido | [05](05-sitio-web.md) |
| CAM-08 | Quiénes somos: banner con transición entre los logotipos de INCOVSA e Inquiserca | Definido (falta recibir el logotipo, P-69) | [05](05-sitio-web.md) |
| CAM-09 | Quiénes somos: misión arriba y visión abajo, con animación al desplazarse, a media pantalla | Definido (centradas) | [05](05-sitio-web.md) |
| CAM-10 | Industrias: sin imágenes de productos; descripción, una imagen por industria y productos en texto | Definido | [05](05-sitio-web.md) |
| CAM-11 | Catálogo: búsqueda aprobada; "Productos Recomendados" en el detalle, siempre visible | Definido | [05](05-sitio-web.md) |
| CAM-12 | Noticias con fotografía, título y texto | Definido | [05](05-sitio-web.md) |
| CAM-13 | Contacto: teléfono con código de área por país | Definido | [05](05-sitio-web.md) |
| CAM-14 | Contacto: validación de la estructura del correo y del teléfono | Definido | [05](05-sitio-web.md) |
| CAM-15 | Contacto: listas opcionales País, Departamento y Municipio (estos dos solo de Guatemala, y solo si el país es Guatemala); sede obligatoria con solo Quetzaltenango y Guatemala | Definido | [05](05-sitio-web.md) |
| CAM-16 | Responsivo en teléfono y escritorio | Definido (ya estaba) | [05](05-sitio-web.md) |
| CAM-34 | Detalle de producto: imagen, nombre, descripción, presentación, países de origen e industrias; sin manejo, almacenamiento, humedad, tipo ni restricciones | Definido (sin documentos técnicos) | [05](05-sitio-web.md) |

### Panel del sitio

| Id | Cambio | Estado | Dónde |
|---|---|---|---|
| CAM-17 | Imágenes de misión y visión, imagen opcional para historia y valores, y logotipo de Inquiserca | Definido | [05](05-sitio-web.md) |
| CAM-18 | Imagen por industria | Definido | [05](05-sitio-web.md) |
| CAM-19 | Catálogo: producto con nombre, descripción, presentación, países de origen (texto) e imagen subida o arrastrada; eliminar producto | Definido | [05](05-sitio-web.md) |
| CAM-20 | Noticias: crear con fotografía, título y texto | Definido | [05](05-sitio-web.md) |
| CAM-21 | Solicitudes: división por motivo (solicitud, queja, reclamo) | Definido | [05](05-sitio-web.md) |
| CAM-22 | Solicitudes: responsable (usuario del sitio), un comentario y botones Asignado, En proceso y Solucionado, sin estado inicial ni restricción | Definido | [05](05-sitio-web.md) |
| CAM-23 | Documentación interna: producto escrito (uno), país de una lista y lote con letras y números, obligatorio solo en COA | Definido | [05](05-sitio-web.md) |
| CAM-24 | Documentación interna: buscar por lote, nombre y país de origen | Definido | [05](05-sitio-web.md) |
| CAM-35 | Información de contacto: solo Quetzaltenango y Guatemala, con su mapa | Definido | [05](05-sitio-web.md) |

### Usuarios y permisos

| Id | Cambio | Estado | Dónde |
|---|---|---|---|
| CAM-25 | Permisos por usuario, por módulo y por acción, con casillas; dos administraciones de usuarios y dos inicios de sesión | Definido | [03](03-roles-y-accesos.md) |
| CAM-26 | Rol de texto libre; únicos roles predeterminados Gerencia y Soporte; sedes por usuario con casillas; pilotos = rol "Piloto" | Definido | [03](03-roles-y-accesos.md) |
| CAM-27 | Eliminar usuarios | Definido (eliminación lógica, 12/10) | [03](03-roles-y-accesos.md) |
| CAM-28 | Bitácora con inicios de sesión, consultable en la pestaña "Bitácora" de Reportes | Definido | [12](12-reglas-de-negocio.md) |
| CAM-36 | La contraseña la restablecen Gerencia o Soporte, a solicitud; sin recuperación por correo | Definido | [03](03-roles-y-accesos.md) |

### Sistema de picking

| Id | Cambio | Estado | Dónde |
|---|---|---|---|
| CAM-29 | Sin control de inventario: se quitan el módulo de Inventario, la validación de existencias, las columnas de existencia y las devoluciones | Definido (aprobado por el docente el 16/10) | [09](09-picking-inventario.md) |
| CAM-30 | Facturación: carga del .xlsx de Odoo al tablero de pedidos facturados (guardado en la base); opciones de envío a la derecha; arrastrar pedidos facturados de varios clientes a camiones o a "Cliente recoge en bodega" y de regreso; control de peso; botones por opción; cada envío crea un pedido con correlativo | Definido | [06](06-picking-facturacion.md) |
| CAM-31 | Tablero: "Modo claro" y "Modo oscuro" en lugar de "TV" y "Tableta" | Definido | [07](07-picking-bodega.md) |
| CAM-32 | Reportes: filtros diario, semanal (lunes a domingo), mensual, anual y por rango, también en "Rutas realizadas" | Definido | [10](10-picking-reportes.md) |
| CAM-33 | Menú lateral izquierdo reducido a íconos | Definido en el picking y en el panel del sitio | [04](04-requerimientos-funcionales.md) |
| CAM-37 | Producto del picking con solo nombre y Peso de Conversión; "Peso2" pasa a llamarse "Peso de Conversión"; "Unidad de Medida" no se usa | Definido (nombre en formato de Odoo; sin SKU) | [11](11-picking-configuracion.md) |
| CAM-38 | Bodega sin columna SKU; Ruta con una fila por cliente aunque tenga varios pedidos facturados | Definido | [07](07-picking-bodega.md), [08](08-picking-ruta.md) |
| CAM-39 | Textos del sitio sin el número de sedes y bodegas, sin Escuintla, sin inventario y sin roles fijos | Definido | [05](05-sitio-web.md) |

## Registro de cambios de la reunión 5

Cada cambio que pidió el Ing. William el 13/10/2026, con las respuestas del coordinador del 14/10/2026. Todos están **definidos** e **implementados en el prototipo** el 14/10.

### Sitio público

| Id | Cambio | Dónde |
|---|---|---|
| CAM-40 | Inicio: misión con el texto a la izquierda y la imagen a la derecha; debajo, visión con la imagen a la izquierda y el texto a la derecha. Sin imagen hasta que se suba | [05](05-sitio-web.md) |
| CAM-41 | Quiénes somos: misión y visión igual que en Inicio | [05](05-sitio-web.md) |
| CAM-42 | Valores: 5 imágenes, una por valor, en una fila, sin texto, que se suben desde el panel | [05](05-sitio-web.md) |
| CAM-43 | Galerías de hasta 5 imágenes que rotan cada 5 s en todas las áreas con imágenes (menos logotipos y valores); con una sola imagen, fija; sin hacer más lenta la carga | [05](05-sitio-web.md), RNF-17 |
| CAM-44 | Industrias: barra lateral izquierda solo con íconos; el nombre aparece al pasar el cursor | [05](05-sitio-web.md) |
| CAM-45 | Contacto: la solicitud solo se guarda en el sistema; no se envía por correo | [05](05-sitio-web.md) |

### Acceso y autenticación

| Id | Cambio | Dónde |
|---|---|---|
| CAM-46 | Acceso personal: usuario → validación en los dos sistemas → elección de Odoo, sitio o picking → contraseña. Si no existe, mensaje de que no tiene permisos | [03](03-roles-y-accesos.md) |
| CAM-47 | El mismo nombre de usuario puede existir en los dos sistemas | [03](03-roles-y-accesos.md) |
| CAM-48 | Al cerrar sesión se vuelve a la página de inicio | [03](03-roles-y-accesos.md) |

### Administración del sitio

| Id | Cambio | Dónde |
|---|---|---|
| CAM-49 | Contenido institucional: sin la sección "Imágenes del sitio"; campos para la portada y el logotipo de INCOVSA; el logotipo de Inquiserca viene cargado | [05](05-sitio-web.md) |
| CAM-50 | Solicitudes: indicador de solicitudes nuevas sobre el ícono, también con el menú reducido | [05](05-sitio-web.md) |
| CAM-51 | Usuarios: contraseña al crear el usuario; Gerencia y Soporte la restablecen escribiendo una nueva; sin correo | [03](03-roles-y-accesos.md) |
| CAM-52 | Documentación interna: un producto documentado con nombre, país, lote obligatorio y enlaces de Google Drive de FT, HS y COA | [05](05-sitio-web.md) |
| CAM-53 | Documentación interna: tabla sin columnas Documento y Tipo ni filtro por tipo; acciones solo editar y eliminar; clic en la fila para ver o descargar según los permisos | [05](05-sitio-web.md) |

### Sistema de picking

| Id | Cambio | Dónde |
|---|---|---|
| CAM-54 | Facturación: datos del archivo tal como vienen, sin validar ni guardar productos, clientes ni sectores; Peso de Conversión y lote del archivo. Configuración queda con Camiones y Usuarios | [06](06-picking-facturacion.md), [11](11-picking-configuracion.md) |
| CAM-55 | Facturación: instrucciones cortas a la par del título | [06](06-picking-facturacion.md) |
| CAM-56 | Facturación: seleccionar uno, varios o todos los pedidos facturados y arrastrarlos juntos | [06](06-picking-facturacion.md) |
| CAM-57 | Facturación: solo dos opciones de envío; en la de camión, camión y piloto de listas desplegables | [06](06-picking-facturacion.md) |
| CAM-58 | Facturación: cada pedido facturado de una opción muestra su total en kg | [06](06-picking-facturacion.md) |
| CAM-59 | Facturación: fecha y hora programadas en cada opción, obligatorias, que pasan a Bodega | [06](06-picking-facturacion.md) |
| CAM-60 | Facturación: ordenar los pedidos facturados dentro de la opción; el orden pasa a Bodega y a Ruta | [06](06-picking-facturacion.md) |
| CAM-61 | Facturación: tarjetas sin asa ni "x"; eliminar uno o varios seleccionándolos | [06](06-picking-facturacion.md) |
| CAM-62 | Lo de camión se llama **ruta**; lo que recoge el cliente, **pedido** | [02](02-glosario.md) |
| CAM-63 | Rutas y pedidos se numeran cada día desde 1 | [12](12-reglas-de-negocio.md) |
| CAM-64 | Cada registro guarda la fecha y hora exactas en que se guardó | [12](12-reglas-de-negocio.md) |
| CAM-65 | Bodega: sin contador en la barra lateral | [07](07-picking-bodega.md) |
| CAM-66 | Bodega: botón "Detalle de Ruta" o "Detalle de Pedido" con todos los datos del archivo | [07](07-picking-bodega.md) |
| CAM-67 | Bodega: ordenar las filas de mayor a menor peso | [07](07-picking-bodega.md) |
| CAM-68 | Bodega: lote resaltado; una fila por producto, lote y Peso de Conversión | [07](07-picking-bodega.md) |
| CAM-69 | Bodega: fecha y hora programadas, sin la hora de envío desde Facturación | [07](07-picking-bodega.md) |
| CAM-70 | Bodega: marcar todos los productos de una vez | [07](07-picking-bodega.md) |
| CAM-71 | Tablero: numeración de arriba hacia abajo, columna izquierda y después la derecha | [07](07-picking-bodega.md) |
| CAM-72 | Ruta: rutas de la más reciente a la más antigua | [08](08-picking-ruta.md) |
| CAM-73 | Ruta: sin sección de registro histórico | [08](08-picking-ruta.md) |

### Aprobados con el prototipo del 13/10

| Id | Cambio | Dónde |
|---|---|---|
| CAM-74 | Contacto: país obligatorio; departamento y municipio obligatorios si el país es Guatemala | [05](05-sitio-web.md) |
| CAM-75 | Facturación: la tarjeta del pedido facturado lista sus productos con su cantidad | [06](06-picking-facturacion.md) |
| CAM-76 | Presentación dinámica en todas las páginas públicas | [05](05-sitio-web.md) |
| CAM-77 | Reportes: filtro de periodo también en la Bitácora | [10](10-picking-reportes.md) |

## Ajustes del coordinador del 15/10/2026

El 15/10/2026 el coordinador revisó el prototipo con los cambios de la reunión 5 y pidió estos ajustes. Todos están **definidos** e **implementados en el prototipo** ese día (PR #43 a #46). Las decisiones de diseño que se tomaron para aplicarlos están en [18-historial-de-decisiones.md](18-historial-de-decisiones.md).

### Sitio público

| Id | Cambio | Dónde |
|---|---|---|
| CAM-78 | Inicio: la sección de misión y visión con el verde del pie de página | [05](05-sitio-web.md) |
| CAM-79 | Quiénes somos: las secciones blancas ("Misión y visión" y "A quién servimos") con el verde del pie de página | [05](05-sitio-web.md) |
| CAM-80 | Quiénes somos: el bloque "INCOVSA e Inquiserca" alterna los dos logotipos, como el banner | [05](05-sitio-web.md) |
| CAM-81 | Noticias: cada noticia ocupa todo el ancho y muestra completos su título y su texto | [05](05-sitio-web.md) |
| CAM-82 | Contacto: al enviar, la página se desplaza hasta el aviso "Solicitud recibida" | [05](05-sitio-web.md) |
| CAM-83 | Pantallas de acceso: el panel izquierdo solo con el título y su descripción, centrados; sin notas de roles | [03](03-roles-y-accesos.md), [05](05-sitio-web.md) |

### Administración del sitio

| Id | Cambio | Dónde |
|---|---|---|
| CAM-84 | Noticias: botón "Eliminar" con el ícono del basurero, como en el Catálogo, en lugar de "Ocultar"; ya no se ocultan (sin columna de estado ni casilla "Publicar de inmediato") | [05](05-sitio-web.md), [03](03-roles-y-accesos.md), [14](14-modelo-de-datos.md) |
| CAM-85 | Solicitudes: motivo con inicial mayúscula; mensaje completo dentro de su cuadro; "Guardar comentario" pasa a "Editar comentario" cuando ya hay uno guardado | [05](05-sitio-web.md) |
| CAM-86 | Usuarios del sitio y del picking: sin la nota "Único en … Puede ser el mismo de una cuenta …" en las ventanas de nuevo usuario y editar usuario | [03](03-roles-y-accesos.md), [11](11-picking-configuracion.md) |

### Los dos sistemas

| Id | Cambio | Dónde |
|---|---|---|
| CAM-87 | Todos los módulos: la instrucción, lo más breve posible, a la par del título, como en Facturación | [05](05-sitio-web.md), [06](06-picking-facturacion.md) |

### Sistema de picking

| Id | Cambio | Dónde |
|---|---|---|
| CAM-88 | Facturación: la tarjeta seleccionada muestra solo su número y su peso total, y seleccionar no mueve el desplazamiento del tablero | [06](06-picking-facturacion.md) |
| CAM-89 | Facturación: fecha y hora programadas en verde (antes ámbar) y con cursor de mano | [06](06-picking-facturacion.md) |
| CAM-90 | Facturación: la hora programada se escribe con el teclado (HH:MM) o se elige con el reloj | [06](06-picking-facturacion.md) |
| CAM-91 | Facturación y Reportes: las fechas se escriben con el teclado (dd/mm/aaaa) o se eligen con el calendario | [06](06-picking-facturacion.md), [10](10-picking-reportes.md) |
| CAM-92 | Calendario y reloj se abren debajo del campo, no a la derecha | [06](06-picking-facturacion.md), [10](10-picking-reportes.md) |
| CAM-93 | Bodega: lote en verde; en el modo oscuro del tablero, en gris | [07](07-picking-bodega.md) |
| CAM-94 | Tablero: la silueta del camión grande para todos los camiones; cuadro del pedido en verde lima, distinto del verde de la ruta (antes gris), en el módulo y en el modo claro del tablero en pantalla completa; en el modo oscuro del tablero, gris (16/10) | [07](07-picking-bodega.md) |
| CAM-95 | Bodega: el "Detalle de Ruta" y el "Detalle de Pedido" muestran completos todos los pedidos facturados. Ruta: sin el texto al pie junto a "Ruta Entregada" | [07](07-picking-bodega.md), [08](08-picking-ruta.md) |

## Ajustes del coordinador del 16/10/2026

Definidos e implementados en el prototipo el 16/10/2026.

| Id | Cambio | Dónde |
|---|---|---|
| CAM-96 | Reportes: botones **Excel** y **PDF** también en "Rutas realizadas" y "Bitácora", como en Despacho | [10](10-picking-reportes.md) |

## Contraste aprobado del 23/10/2026 (JG-24)

Como excepciones de contraste a la decisión 89, Jordin autorizó conservar los colores accesibles actuales de los textos secundarios medidos con axe (4.46:1 en el prototipo), «RUTA» sin opacidad (4.44:1 con la opacidad del prototipo) y las zonas vacías de Facturación (2.61:1 en el prototipo). Las pruebas mantienen RNF-08 y su mínimo de 4.5:1. Se suma a la excepción del área de subida de `CampoGaleria`; los demás estilos siguen el prototipo. Evidencia en `plan/evidencias/JG-24/contraste-prototipo.json` y precisión en `specs/18`.
