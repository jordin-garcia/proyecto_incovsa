# 05. Sitio web corporativo e institucional

> **Cambios del 29/09/2026 (reunión 4), respuestas del 11/10/2026 y cambios del 13/10/2026 (reunión 5).** El Ing. William revisó el prototipo de simulación en las reuniones 4 y 5 y pidió los cambios que se describen en este archivo; el 11/10 y el 14/10 el coordinador resolvió las dudas sobre cómo aplicarlos. Todo lo demás del prototipo (diseño visual, estructura y comportamiento) está aprobado ([20-prototipo-aprobado.md](20-prototipo-aprobado.md)).
>
> **Ajustes del coordinador del 15/10/2026** (CAM-78 a CAM-87): fondo verde en misión y visión y en las secciones blancas de Quiénes somos, logotipos alternados en "INCOVSA e Inquiserca", noticias a todo el ancho y completas, desplazamiento al aviso de Contacto, pantallas de acceso sin notas de roles, noticias que se eliminan en lugar de ocultarse y ajustes en la bandeja de solicitudes.

## Identidad

| Elemento | Valor |
|---|---|
| Dominio | incovsa.com (reservado y disponible, según la contraparte) |
| Nombre a mostrar | Industria del Cuero Covadonga S. A. |
| Empresas | INCOVSA e Inquiserca en una sola presentación y una sola identidad visual |
| Logotipo del sitio | **"INCOVSA Químicos"**, el que aparece en la cabecera. Es el que se usa en todo el sitio público, incluido el pie de página. **(13/10)** Se puede cambiar desde el panel, en "Contenido institucional" |
| Logotipo "Transformamos INCOVSA" | **Solo para uso interno** de la empresa. **No** se usa en el sitio público (29/09) |
| Logotipo de Inquiserca | **Recibido el 13/10** (`docs_incovsa/PAGINA WEB/INFORMACION EMPRESA/Inquiserca.jpeg`). Viene cargado en el sitio y se puede cambiar desde el panel |
| Colores | Verde y gris, tomados de los logotipos. Faltan los códigos exactos (P-18). El design system del prototipo está aprobado |
| Tipografía | La del prototipo aprobado ([20-prototipo-aprobado.md](20-prototipo-aprobado.md)). La tipografía oficial de la empresa sigue pendiente (P-18) |
| Diseño visual e interacción | El del prototipo aprobado, con los cambios de este archivo |

Archivos recibidos (`docs_incovsa/PAGINA WEB/INFORMACION EMPRESA/`): los logotipos "INCOVSA Químicos", "Transformamos INCOVSA" e Inquiserca, y las imágenes `MISION.jpg` y `VISION.jpg`.

## Estructura y navegación

**Rutas internas del panel (18/10/2026, JG-07):** `/panel` redirige a la primera sección permitida. El Resumen conserva las reglas de `Panel.SECCIONES` del prototipo y usa `/panel/resumen`, para que la entrada no se redirija a sí misma. Los nombres, el orden y los permisos de las secciones no cambian.

- **Secciones aprobadas**, en este orden: **Inicio, Quiénes somos, Industrias, Productos, Noticias y Contacto**. Es la navegación del prototipo.
- **Diseño responsivo:** la arquitectura visual se adapta correctamente a teléfono y escritorio (RF-SW-08).
- **Datos validados por INCOVSA:** las industrias y las proporciones y tamaños de las imágenes de productos son correctos.

### Pie de página (RF-SW-15)

| Páginas | Pie de página |
|---|---|
| Inicio, Quiénes somos, Noticias y Contacto | **Sí**, con el logotipo de la cabecera |
| Industrias, Productos y el **detalle de cada producto** | **Sin pie de página** |

### Presentación dinámica (RF-SW-16)

Las imágenes y las tarjetas del contenido de las páginas públicas tienen una **animación de aparición y desaparición al desplazarse**: aparecen cuando entran en la pantalla y desaparecen cuando salen. Hasta el 13/10 se aplicaba solo a Inicio y a misión y visión; el prototipo aprobado el 13/10 la extendió a todas las páginas. Se respeta la preferencia del navegador de reducir el movimiento.

### Galerías de imágenes que rotan (RF-SW-28, RN-56)

> **Cambio del 13/10/2026 (reunión 5).** Todas las áreas que llevan imágenes en el sitio público admiten **hasta 5 imágenes**, que se suben desde el panel y **rotan cada 5 segundos**. Si un área tiene **una sola imagen**, se muestra **fija, sin movimiento** (decisión del coordinador del 14/10).

| Área | Galería |
|---|---|
| Portada de Inicio | Hasta 5 imágenes. Las mismas imágenes son el fondo de los encabezados de las demás páginas públicas (Quiénes somos, Industrias, Productos, Noticias y Contacto) |
| Misión (Inicio y Quiénes somos) | Hasta 5 imágenes |
| Visión (Inicio y Quiénes somos) | Hasta 5 imágenes |
| Historia (Quiénes somos) | Hasta 5 imágenes, opcionales |
| Cada industria | Hasta 5 imágenes |
| Cada producto público | Hasta 5 imágenes (en la tarjeta del catálogo y en el detalle) |
| Cada noticia | Hasta 5 imágenes; al menos una |

- **No rotan:** los logotipos, que son una sola imagen cada uno, y los **valores**, que son 5 imágenes fijas, una por valor (RF-SW-29).
- En el banner de Quiénes somos se alternan los logotipos de INCOVSA e Inquiserca (RF-SW-02).
- **Rendimiento (RNF-17):** la galería no puede hacer más lenta la carga de la página. Al abrir la página solo se descarga la primera imagen de cada galería; las demás se descargan después, mientras se ve la primera. Se comprueba con pruebas de rendimiento (Documento 6) que la carga inicial de una página con galerías de 5 imágenes no tarda más que con galerías de una.

## Sedes que se muestran en el sitio

Solo se muestran las sedes de **Quetzaltenango** y **Guatemala**, porque son las que tienen **oficinas** a las que pueden llegar los clientes. **Escuintla no se muestra** en el sitio: es solo una bodega (11/10). Esto aplica a Inicio, Contacto, el pie de página y el formulario de contacto.

| Sede | Mapa de Google Maps (dirección `src` del mapa insertado) |
|---|---|
| Quetzaltenango | `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3856.469689459672!2d-91.4743845!3d14.854992000000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x858ea30032a1ae3f%3A0xccc394a56fe6af75!2sIncovsa!5e0!3m2!1ses-419!2sgt!4v1791772265076!5m2!1ses-419!2sgt` |
| Guatemala | `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3859.898369446534!2d-90.56218562536918!3d14.661708575578558!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85899fe9da39aa29%3A0x5f1c10c1ff4a038a!2sIncovsa!5e0!3m2!1ses-419!2sus!4v1791772376935!5m2!1ses-419!2sus` |

Cada mapa se inserta con un `iframe` con `allowfullscreen`, `loading="lazy"` y `referrerpolicy="strict-origin-when-cross-origin"`. El tamaño del mapa se adapta al diseño responsivo.

## Secciones públicas

### Misión y visión (Inicio y Quiénes somos) (RF-SW-01, RF-SW-02)

> **Cambio del 13/10/2026 (reunión 5).** Reemplaza a "misión y visión como las imágenes de la empresa, centradas, una debajo de la otra" del 29/09.

- Primero la **misión**: el **texto de la misión a la izquierda** y su **imagen a la derecha**.
- Debajo, la **visión**: su **imagen a la izquierda** y el **texto de la visión a la derecha**.
- Igual en Inicio y en Quiénes somos.
- El texto es el de misión y visión del panel (abajo las transcripciones de `MISION.jpg` y `VISION.jpg`).
- Las imágenes son galerías de hasta 5 que se suben desde el panel. **Mientras no se suba ninguna, el lugar de la imagen queda vacío** (decisión del coordinador del 14/10): `MISION.jpg` y `VISION.jpg` no se usan, porque ya traen el texto escrito y el logotipo "Transformamos INCOVSA".
- En teléfono, el texto y la imagen van uno debajo del otro.
- **Fondo (15/10):** la sección de misión y visión va con el **verde del pie de página** (`--v950`), con los títulos en blanco, igual en Inicio y en Quiénes somos.

**Misión**, transcrita de `MISION.jpg`:

> Ser el aliado estratégico para nuestros clientes y proveedores en la distribución de productos químicos, atendiendo la región CA-4, marcando la diferencia en servicio, con una completa gama de productos para brindar soluciones a las necesidades del mercado, apoyando a cumplir los objetivos de nuestros grupos de interés.

**Visión**, transcrita de `VISION.jpg`:

> Ser referentes y acercar soluciones en la distribución de productos químicos satisfaciendo las necesidades de los mercados atendidos, creando valor integral a nuestros grupos de interés a través del crecimiento y mejora continua, con una administración responsable y transparente enfocada en la solidez y el largo plazo.

La imagen original de la visión dice "tranparente"; el texto del sitio dice "transparente". Como la imagen ya no se muestra (13/10), P-20 se cierra.

### Inicio (RF-SW-01)

- **Debe ser informativa.**
- Sin la sección "Catálogo informativo" del prototipo (29/09). **No se quita nada más** (11/10).
- **Portada** con la galería de portada (RF-SW-28) y las cifras.
- **Misión y visión** como se describe arriba (13/10).
- **Presencia** (RF-SW-22): una tarjeta para Quetzaltenango y otra para Guatemala, cada una con sus **datos de dirección** y su **mapa de Google Maps** insertado.
- Las demás secciones del prototipo se conservan: industrias atendidas, presencia y llamado a enviar una solicitud.

### Quiénes somos (RF-SW-02)

- **Banner principal** con una **transición dinámica entre el logotipo de INCOVSA y el de Inquiserca**, que se alternan en el mismo lugar. Si se quita el logotipo de Inquiserca desde el panel, el banner muestra solo el de INCOVSA.
- **Historia:** texto pendiente de INCOVSA (P-19) y galería opcional de hasta 5 imágenes.
- **Misión y visión** como se describe arriba (13/10).
- **Valores (RF-SW-29, 13/10):** **solo 5 imágenes, una por cada valor**, en **una sola fila**, como las tarjetas de valores del prototipo. **Sin texto.** Se suben desde el panel. Mientras falte la imagen de un valor, su lugar muestra la tarjeta de pendiente del prototipo. En teléfono, la fila se acomoda al ancho de la pantalla.
- **A quién servimos:** mercado industrial y mercado artesanal, como en el prototipo.
- **INCOVSA e Inquiserca (15/10):** el bloque muestra los **logotipos de INCOVSA e Inquiserca alternándose**, de la misma manera que el banner principal. Si no hay logotipo de Inquiserca, muestra solo el de INCOVSA.
- **Fondos (15/10):** las secciones que eran blancas, **"Misión y visión"** y **"A quién servimos"**, van con el **verde del pie de página** (`--v950`). Historia, Valores e "INCOVSA e Inquiserca" conservan el fondo claro, de modo que se alternan claro y verde.

### Industrias (RF-SW-03)

Son 9 industrias, en este orden:

1. Cuero
2. Textil
3. Cerería
4. Hulera
5. Medicamentos
6. Limpieza
7. Alimentación animal
8. Tratamiento de agua
9. Lavandería

- **Menú (13/10):** una **barra lateral alineada a la izquierda** que muestra **solo el ícono** de cada industria, parecida a la barra lateral reducida del panel y del picking. Al pasar el cursor (o el foco del teclado) sobre un ícono, se muestra el **nombre de la industria**. Así se amplía el espacio para la imagen y el contenido de la industria elegida. **No** se usa una barra superior horizontal.
- Cada industria muestra **solo su descripción, su galería de imágenes y sus productos como texto**. No se muestran imágenes de productos.
- **Sin pie de página.**
- La descripción y los productos de cada industria vienen del sitio de Google de la empresa y necesitan revisión. Las descripciones definitivas y las imágenes están pendientes (P-21).
- **Productos de cada industria (17/10, P-97):** son los **productos públicos del catálogo que tienen esa industria** (la relación N:M de PRODUCTO_INDUSTRIA), en orden alfabético por nombre, como los Productos Recomendados. Se administran desde el Catálogo del panel, al asignarle industrias a cada producto. La lista fija del prototipo (`base.js` › `INDUSTRIAS`, tomada de Google Sites) no se usa.

### Catálogo de productos (RF-SW-04)

- Es solo informativo: sin precios y sin comercio electrónico.
- Se filtra por industria. Un producto puede pertenecer a **varias** industrias.
- En las tarjetas se muestran la galería de imágenes, el nombre, los países de origen y la presentación. **Nunca** el lote.
- **La búsqueda de productos está aprobada** tal como está en el prototipo.
- **Sin pie de página.**
- **Productos de prueba:** las 28 imágenes de `docs_incovsa/PAGINA WEB/CATALOGO/`. Cada imagen es un producto público, y su nombre correcto es el que aparece **dentro de la imagen**.
- Los productos públicos no tienen relación con el picking.

### Detalle de producto (RF-SW-05)

Muestra la **galería de imágenes**, el **nombre**, la **descripción**, la **presentación**, los **países de origen** y las industrias del producto.

- **Sin pie de página.**
- **No** muestra documentos técnicos.

#### Productos Recomendados (RF-SW-17)

- Al final del detalle va la sección **"Productos Recomendados"**, que **siempre** aparece.
- Regla: se muestran hasta 4 productos. Primero los que comparten alguna industria con el producto que se está viendo; si no alcanzan, se completa con otros productos del catálogo. Nunca se recomienda el mismo producto que se está viendo. Cada grupo va en orden alfabético por nombre (12/10).

### Noticias (RF-SW-18)

- Cada noticia tiene **galería de imágenes (al menos una), título y texto**.
- Se crean, editan y **eliminan** desde el panel. Se conserva la fecha de publicación.
- **(15/10)** Ya **no** hay opción de publicar u ocultar: toda noticia se publica al guardarla, y la que no debe mostrarse se elimina.
- **Presentación (15/10):** cada noticia ocupa **todo el ancho** de la página, con su galería a la izquierda y la fecha, el título y el **texto completo** a la derecha (en teléfono, uno debajo del otro). El texto respeta sus saltos de línea y las palabras muy largas se parten para que nada quede oculto. Se ordenan de la más reciente a la más antigua.
- El contenido inicial está pendiente (P-23).

### Contacto (RF-SW-06, RF-SW-19)

La página muestra el formulario y los datos de Quetzaltenango y Guatemala. Escuintla no aparece.

| Campo | Regla |
|---|---|
| Tipo de mensaje | Solicitud, queja o reclamo. Obligatorio |
| Nombre completo | Obligatorio |
| Empresa | Opcional |
| Correo electrónico | Obligatorio. Se valida que tenga una **estructura válida** al salir del campo y al enviar |
| Teléfono | Opcional. Se captura con un **código de área por país**. Si se escribe, se valida que tenga una **estructura válida** para ese país |
| País | **Lista** con todos los países. **Obligatorio** (prototipo aprobado el 13/10) |
| Departamento | **Lista** de los departamentos de Guatemala. **Solo aparece si el país es Guatemala**, y entonces es **obligatorio** (13/10) |
| Municipio | **Lista** de los municipios del departamento elegido. **Solo aparece si el país es Guatemala**, y entonces es **obligatorio** (13/10) |
| Sede a la que dirige su mensaje | **Obligatorio.** Solo **Quetzaltenango** y **Guatemala** |
| Mensaje | Obligatorio. **(24/10)** Hasta **2000 caracteres** |

- **(13/10)** La solicitud **solo se guarda en el sistema** y se consulta en la bandeja del panel. **No se envía a ningún correo.** Por eso el sistema no necesita una cuenta de correo (P-09 se cierra) y de P-22 queda solo el horario de las sedes.
- **(15/10)** Al enviar el mensaje, la página **se desplaza hasta el aviso "Solicitud recibida"**, para que se vea sin buscarlo.
- **(24/10, DM-08)** El aviso muestra el **folio** de la solicitud con el formato del prototipo: `SOL-` + año (hora de Guatemala) + `-` + consecutivo de al menos 4 dígitos, por ejemplo `SOL-2026-0001`. Como el contador del prototipo, el consecutivo es uno solo y **no se reinicia al cambiar de año**; se calcula en la misma transacción que guarda la solicitud, así que dos envíos simultáneos nunca reciben el mismo folio. El envío es público, sin sesión, y la respuesta no revela nada más que el folio ([16](16-arquitectura-y-tecnologia.md), "Seguridad").

### Textos que se reemplazan (RF-SW-27)

Textos del prototipo del 29/09 que mencionaban cuántas sedes o bodegas tiene la empresa, a Escuintla, el inventario o los roles anteriores. Se reemplazaron por estos (11/10):

| Dónde | Texto nuevo |
|---|---|
| Inicio, párrafo de la portada | "Compra, venta y distribución de productos químicos para nueve industrias del país. Más de treinta años abasteciendo al sector industrial y artesanal, con presencia en todo el territorio." |
| Inicio, título de Presencia | "Visítenos" |
| Inicio, texto de Presencia | "Ubique nuestras oficinas en el mapa: será un gusto atenderle en persona." |
| Quiénes somos, encabezado | "… Atiende nueve industrias y lleva sus productos a clientes de todo el país." |
| Contacto, título | "Cuéntenos cómo podemos ayudarle" |
| Acceso personal, opción del picking | "Facturación, bodega, ruta, reportes y configuración." |
| Inicio de sesión del picking, texto lateral | "Control logístico de bodega: del pedido facturado a la entrega." |
| Inicio de sesión, lista "Roles de este sistema" | **Se quitó el 15/10**, igual que la nota "Gerencia y Soporte usan la misma cuenta…" del acceso personal: el panel izquierdo de las pantallas de acceso solo lleva el título y su descripción ([03](03-roles-y-accesos.md)) |
| Inicio de sesión, "¿Olvidó su contraseña?" | "Pídale a Gerencia o a Soporte que la restablezcan." |

La cifra de la portada "**3** sedes con bodega de distribución" **se mantiene** (11/10). Los textos de la formulación de contacto que decían que la solicitud se envía por correo se quitan (13/10).

### Acceso personal (RF-SW-09)

El flujo de acceso con el botón "Acceso personal" está en [03-roles-y-accesos.md](03-roles-y-accesos.md) (13/10).

## Panel administrativo (RF-SW-07, RF-SW-12, RF-SW-13)

Entran los usuarios del sitio según sus permisos ([03-roles-y-accesos.md](03-roles-y-accesos.md)). El **menú lateral izquierdo se puede reducir a íconos** (RF-SW-26). Desde el panel se administra:

| Sección | Qué se hace |
|---|---|
| Contenido institucional | **Portada** (galería de hasta 5), **logotipo de INCOVSA**, **misión** y **visión** (texto y galería de hasta 5), **historia** (texto y galería opcional de hasta 5), **valores** (5 imágenes, una por valor, sin texto) y **logotipo de Inquiserca**. La sección "Imágenes del sitio" del prototipo se elimina (13/10) |
| Industrias | Descripción y galería de hasta 5 imágenes de cada industria |
| Catálogo | Productos públicos y sus industrias, con galería de hasta 5 imágenes. Se pueden eliminar |
| Noticias | Título, texto y galería de hasta 5 imágenes de cada noticia. La lista muestra imagen, título, fecha y los botones **editar** (lápiz) y **eliminar** (basurero, con confirmación), como en el Catálogo. Sin columna de estado ni botón "Ocultar" (15/10) |
| Información de contacto | Dirección, teléfono, correo, WhatsApp, horario y mapa de Google Maps de Quetzaltenango y Guatemala |
| Solicitudes | Bandeja del formulario de contacto (abajo) |
| Documentación interna | Productos documentados (abajo) |
| Usuarios | Usuarios del sitio. Los administran Gerencia y Soporte, con contraseña, rol y permisos ([03-roles-y-accesos.md](03-roles-y-accesos.md)) |

Las imágenes se suben desde la computadora, eligiéndolas o arrastrándolas. En cada galería se pueden agregar, quitar y reordenar imágenes, hasta 5.

Cada sección muestra su **instrucción, lo más breve posible, a la par del título**, como en Facturación, para aprovechar el espacio de la pantalla (15/10).

### Producto público en el panel (RF-SW-23)

| Campo | Tipo |
|---|---|
| Nombre | Texto |
| Descripción | Texto |
| Presentación | Texto |
| Países de origen | Texto |
| Imágenes | Galería de hasta 5 imágenes |
| Industrias | Una o varias |

### Gestión de solicitudes (RF-SW-12, RF-SW-20)

- Las solicitudes se **dividen por motivo**: **solicitud, queja y reclamo**. En la bandeja el motivo se muestra con **inicial mayúscula** ("Solicitud", "Queja", "Reclamo"), en verde, ámbar y rojo (15/10).
- El **mensaje** se muestra **completo dentro de su cuadro**, con sus saltos de línea; las palabras muy largas se parten (15/10).
- **Responsable:** se elige entre los **usuarios del sitio**.
- **Comentario:** un solo comentario del responsable. **(15/10)** Mientras no hay comentario, el botón dice **"Guardar comentario"**. Una vez guardado, el cuadro queda de solo lectura y el botón pasa a **"Editar comentario"**; al pulsarlo, el cuadro se habilita y el botón vuelve a "Guardar comentario".
- **Estados:** botones **Asignado**, **En proceso** y **Solucionado** (RN-42), sin estado inicial y sin restricción de orden.
- **No** se avisa por correo al responsable.
- **Aviso de solicitudes nuevas (13/10):** el ícono de Solicitudes del menú lateral muestra un **indicador de notificaciones** cuando hay solicitudes nuevas (sin leer), también cuando el menú está reducido a íconos.
- Ver la bandeja y gestionarla dependen de los permisos del usuario.
- **Accesibilidad (25/10, DM-09; autorizado por Daniela y ratificado por Jordin el 26/10, D-07):** las pestañas inactivas y el texto secundario de la fila seleccionada usan `--g600`. Con el `--g500` del prototipo producen 4.46:1 y 4.40:1, respectivamente, por debajo de RNF-08. La excepción solo cambia el color de esos textos; las pruebas de axe se conservan.

## Documentación interna (RF-SW-10, RF-SW-14, RF-SW-21)

> **Cambio del 13/10/2026 (reunión 5).** Ya no se sube un documento por cada archivo. Se crea **un producto documentado** con su nombre, su país de origen, su lote y los **enlaces** de sus tres documentos. **El sistema ya no guarda archivos PDF.** Los enlaces son de **Google Drive** (decisión del coordinador del 14/10).

### Crear o editar un producto documentado (RF-SW-14)

| Campo | Regla |
|---|---|
| Nombre del producto | Se **escribe**. Ejemplo: "Soda Cáustica" |
| País de origen | Se elige de una **lista con todos los países**, la misma del formulario de contacto. Obligatorio |
| Lote | Admite **números y letras**. **Obligatorio** (13/10, RN-41) |
| Enlace de la ficha técnica (FT / TDS) | Enlace de Google Drive. Opcional |
| Enlace de la hoja de seguridad (HS / MSDS) | Enlace de Google Drive. Opcional |
| Enlace del certificado de análisis (COA) | Enlace de Google Drive. Opcional |

- Se valida que cada enlace escrito sea una dirección de Google Drive (`https://drive.google.com/…` o `https://docs.google.com/…`).
- Lo que distingue a dos productos documentados con el mismo nombre es su país de origen y su lote. El par (nombre, país, lote) no se repite.
- Crear, editar y eliminar requieren el permiso "Crear, editar y eliminar productos documentados" (antes "Subir, reemplazar y eliminar documentos", 13/10).

### Tabla de la documentación (RF-SW-21)

| Columna | Contenido |
|---|---|
| Producto | Nombre |
| País de origen | — |
| Lote | — |
| Creado | Fecha y usuario (la columna "Cargado" del prototipo) |
| Acciones | Solo **editar** (ícono del lápiz) y **eliminar** (ícono del basurero), y solo para quien tiene el permiso de administrar documentos |

- Ya **no** hay columnas "Documento" y "Tipo", ni el filtro por tipo de documento (13/10).
- Se puede **buscar** por lote, nombre del producto y país de origen.
- **Al hacer clic en la fila** se abre una ventana con los documentos del producto y **solo las opciones que permiten los permisos** del usuario (13/10):

| Permiso | Opción en la ventana |
|---|---|
| Ver documentos en el navegador | **Ver**: abre la vista previa de Google Drive dentro de la ventana |
| Descargar documentos | **Descargar**: usa el enlace de descarga de Google Drive. Si el usuario solo puede ver, **no aparece ninguna opción de descargar** |

### Reglas

- Un usuario sin sesión no entra a esta área.
- Lo que cada usuario puede hacer depende de **sus permisos** ([03-roles-y-accesos.md](03-roles-y-accesos.md)).
- **Protección de los documentos:** el sistema muestra los enlaces solo a quien tiene permiso, pero quien abre el archivo en Google Drive es Google. Que un usuario con solo permiso de ver no pueda descargar desde Drive, y que nadie fuera de la empresa pueda abrir el enlace, depende de **cómo comparta INCOVSA cada archivo en Google Drive** (por ejemplo, compartirlo solo con cuentas de la empresa y deshabilitar la descarga para lectores). Esto se explica en el Documento 3.
- Ejemplos entregados por la empresa, en `docs_incovsa/PAGINA WEB/DOCUMENTOS TECNICOS/`: una ficha técnica, una hoja de seguridad y un certificado de análisis de soda cáustica de México.

## Imágenes del sitio

Todas las imágenes del sitio se guardan en **Cloudflare R2, plan gratuito**: las de la portada, misión, visión, historia, valores, industrias, productos y noticias, y los logotipos.

**(16/10)** Se aceptan imágenes **JPG, PNG o WebP** de hasta **5 MB**. El servidor las reduce a un máximo de 2000 px de ancho, les quita los metadatos (incluida la ubicación GPS de las fotos) y las guarda en WebP. Se sirven desde `imagenes.incovsa.com` ([16](16-arquitectura-y-tecnologia.md), decisiones 32 y 44).

## Confidencialidad

La contraparte autorizó mostrar la estructura de los documentos internos y de los productos en la documentación académica, pero no todos los datos. En desarrollo se trabaja con estructura y datos de prueba. Los datos finales se cargan en producción cuando la empresa lo indique.
