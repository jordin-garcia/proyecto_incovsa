# 05. Sitio web corporativo e institucional

> **Cambios del 29/09/2026 (reunión 4) y respuestas del 11/10/2026.** El Ing. William revisó el prototipo de simulación y pidió los cambios que se describen en este archivo; el 11/10 el coordinador resolvió las dudas sobre cómo aplicarlos. Todo lo demás del prototipo (diseño visual, estructura y comportamiento) está aprobado ([20-prototipo-aprobado.md](20-prototipo-aprobado.md)).

## Identidad

| Elemento | Valor |
|---|---|
| Dominio | incovsa.com (reservado y disponible, según la contraparte) |
| Nombre a mostrar | Industria del Cuero Covadonga S. A. |
| Empresas | INCOVSA e Inquiserca en una sola presentación y una sola identidad visual |
| Logotipo del sitio | **"INCOVSA Químicos"**, el que aparece en la cabecera. Es el que se usa en todo el sitio público, incluido el pie de página |
| Logotipo "Transformamos INCOVSA" | **Solo para uso interno** de la empresa. **No** se usa en el sitio público (29/09) |
| Logotipo de Inquiserca | Pendiente de recibir (P-69). El sitio deja preparado dónde se sube y cómo se muestra (ver Quiénes somos) |
| Colores | Verde y gris, tomados de los logotipos. Faltan los códigos exactos (P-18). El design system del prototipo está aprobado |
| Tipografía | La del prototipo aprobado ([20-prototipo-aprobado.md](20-prototipo-aprobado.md)). La tipografía oficial de la empresa sigue pendiente (P-18) |
| Diseño visual e interacción | El del prototipo aprobado, con los cambios de este archivo |

Archivos recibidos (`docs_incovsa/PAGINA WEB/INFORMACION EMPRESA/`): dos logotipos en JPG ("INCOVSA Químicos" y "Transformamos INCOVSA") y las imágenes `MISION.jpg` y `VISION.jpg`.

## Estructura y navegación

- **Secciones aprobadas**, en este orden: **Inicio, Quiénes somos, Industrias, Productos, Noticias y Contacto**. Es la navegación del prototipo.
- **Diseño responsivo:** la arquitectura visual se adapta correctamente a teléfono y escritorio (RF-SW-08).
- **Datos validados por INCOVSA:** las industrias y las proporciones y tamaños de las imágenes de productos son correctos.

### Pie de página (RF-SW-15)

| Páginas | Pie de página |
|---|---|
| Inicio, Quiénes somos, Noticias y Contacto | **Sí.** El pie actual del prototipo, pero con el logotipo de la cabecera en lugar del de "Transformamos INCOVSA" |
| Industrias, Productos y el **detalle de cada producto** | **Sin pie de página** |

### Presentación dinámica de imágenes (RF-SW-16)

Las imágenes de Inicio y las de misión y visión de Quiénes somos tienen una **presentación dinámica**: una **animación de aparición y desaparición al desplazarse** (scroll). La imagen aparece cuando entra en la pantalla y desaparece cuando sale de ella.

## Sedes que se muestran en el sitio

Solo se muestran las sedes de **Quetzaltenango** y **Guatemala**, porque son las que tienen **oficinas** a las que pueden llegar los clientes. **Escuintla no se muestra** en el sitio: es solo una bodega, sin oficina (respuesta del 11/10). Esto aplica a Inicio, Contacto, el pie de página y el formulario de contacto.

| Sede | Mapa de Google Maps (dirección `src` del mapa insertado) |
|---|---|
| Quetzaltenango | `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3856.469689459672!2d-91.4743845!3d14.854992000000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x858ea30032a1ae3f%3A0xccc394a56fe6af75!2sIncovsa!5e0!3m2!1ses-419!2sgt!4v1791772265076!5m2!1ses-419!2sgt` |
| Guatemala | `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3859.898369446534!2d-90.56218562536918!3d14.661708575578558!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85899fe9da39aa29%3A0x5f1c10c1ff4a038a!2sIncovsa!5e0!3m2!1ses-419!2sus!4v1791772376935!5m2!1ses-419!2sus` |

El código que entregó el coordinador inserta cada mapa con un `iframe` con `allowfullscreen`, `loading="lazy"` y `referrerpolicy="strict-origin-when-cross-origin"`. El tamaño del mapa se adapta al diseño responsivo.

## Secciones públicas

### Inicio (RF-SW-01)

- **Debe ser informativa.**
- **Se elimina la sección "Catálogo informativo"** del prototipo (la rejilla de productos destacados con el botón "Ver los N productos"). **No se quita nada más** (respuesta del 11/10).
- **Misión y visión:** se muestran **las imágenes proporcionadas** por la empresa (`MISION.jpg` y `VISION.jpg`), **cada una centrada, una debajo de la otra**. Reemplazan a las dos tarjetas de texto del prototipo.
- **Todas las imágenes** de esta sección tienen presentación dinámica al desplazarse (RF-SW-16).
- **Presencia** (RF-SW-22): una tarjeta para Quetzaltenango y otra para Guatemala, cada una con sus **datos de dirección** (los del prototipo) y su **mapa de Google Maps** insertado. El mapa insertado trae el enlace de Google "Ampliar el mapa", que abre la ubicación en Google Maps: con eso se cumple el hipervínculo pedido el 29/09.
- Las demás secciones del prototipo se conservan: portada con cifras, industrias atendidas, presencia y llamado a enviar una solicitud.

Los títulos y textos que mencionaban cuántas sedes o bodegas tiene la empresa se reemplazan (ver "Textos que se reemplazan").

### Quiénes somos (RF-SW-02)

- **Banner principal** (RF-SW-23) con una **transición dinámica entre el logotipo de INCOVSA y el de Inquiserca**:
  - para INCOVSA se usa el logotipo de la cabecera;
  - el logotipo de Inquiserca se sube desde el panel, en "Contenido institucional" (P-69);
  - los dos logotipos se alternan en el mismo lugar del banner, con una transición;
  - mientras no se suba el logotipo de Inquiserca, el banner muestra solo el de INCOVSA.
- **Misión y visión:** las imágenes, con presentación dinámica al desplazarse, **a media pantalla**: **primero la misión y debajo la visión**, no lado a lado, **centradas** en la pantalla y con el tamaño en que se vean mejor (respuestas del 11/10).
- **Historia y valores:** su texto está pendiente de INCOVSA (P-19). Todavía no se sabe si llevarán imágenes, así que el panel deja **la opción de agregarles una imagen**, que no es obligatoria. Si no hay imagen, se muestra solo el texto.
- El bloque "INCOVSA e Inquiserca" del prototipo usa el logotipo "Transformamos INCOVSA": se cambia por el logotipo de la cabecera.

**Misión**, transcrita de `MISION.jpg`:

> Ser el aliado estratégico para nuestros clientes y proveedores en la distribución de productos químicos, atendiendo la región CA-4, marcando la diferencia en servicio, con una completa gama de productos para brindar soluciones a las necesidades del mercado, apoyando a cumplir los objetivos de nuestros grupos de interés.

**Visión**, transcrita de `VISION.jpg`:

> Ser referentes y acercar soluciones en la distribución de productos químicos satisfaciendo las necesidades de los mercados atendidos, creando valor integral a nuestros grupos de interés a través del crecimiento y mejora continua, con una administración responsable y transparente enfocada en la solidez y el largo plazo.

La imagen original dice "tranparente". Falta que la empresa confirme el texto correcto (P-20). Como ahora se muestran las imágenes, la transcripción sirve de texto alternativo (RNF-08).

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

- Se navega por industria con la lista lateral del prototipo. **No** se usa una barra superior horizontal.
- **No se muestran imágenes de productos** (se quita el mosaico de fotos del prototipo). Cada industria muestra **solo su descripción, una imagen propia y sus productos como texto**, como la lista actual del prototipo.
- En el panel se puede **subir la imagen de cada industria**.
- **Sin pie de página.**
- La descripción y los productos de cada industria vienen del sitio de Google de la empresa (<https://sites.google.com/view/incovsa>) y necesitan revisión de redacción y ortografía. Las descripciones definitivas y las imágenes están pendientes (P-21).

### Catálogo de productos (RF-SW-04)

- Es solo informativo: sin precios y sin comercio electrónico.
- Se filtra por industria. Un producto puede pertenecer a **varias** industrias.
- En las tarjetas se muestran nombre, países de origen y presentación. **Nunca** el lote.
- **La búsqueda de productos está aprobada** tal como está en el prototipo.
- **Sin pie de página.**
- **Productos de prueba:** las 28 imágenes de `docs_incovsa/PAGINA WEB/CATALOGO/`. Cada imagen es un producto público, y su nombre correcto es el que aparece **dentro de la imagen**; los nombres de los archivos tienen errores de escritura ("SODA ACUSTICA", "CASUTICA", "HIGROGENO", "HIPOCLARITO", "BLANQUEDADOR").
- Los productos públicos son una entidad **distinta** de los productos del picking y no tienen relación con ellos.

### Detalle de producto (RF-SW-05)

Muestra la **imagen**, el **nombre**, la **descripción**, la **presentación**, los **países de origen** y las industrias del producto (respuesta del 11/10 a P-71).

- Se eliminan los campos manejo, condiciones de almacenamiento, humedad, tipo de producto y restricciones de uso.
- **Sin pie de página.**
- **No** muestra los documentos técnicos del producto (respuesta del 11/10). Se quita el bloque "Documentación técnica" del prototipo.

#### Productos Recomendados (RF-SW-17)

- Al final del detalle va la sección **"Productos Recomendados"**. Es la del prototipo, que se llamaba "Otros productos de las mismas industrias" (respuesta del 11/10 a P-70).
- **Siempre debe aparecer.** En el prototipo a veces no aparece, porque solo busca productos que compartan industria, y un producto sin industrias, o con industrias que ningún otro producto tiene, se queda sin recomendados.
- Regla: se muestran hasta 4 productos. Primero los que comparten alguna industria con el producto que se está viendo; si no alcanzan, se completa con otros productos del catálogo. Nunca se recomienda el mismo producto que se está viendo ([DECISIÓN TÉCNICA] del criterio para completar).

### Noticias (RF-SW-18)

- Cada noticia tiene **fotografía, título y texto**.
- Se crean y editan desde el panel.
- Del prototipo se conservan la fecha de publicación y la opción de publicar u ocultar.
- El contenido inicial está pendiente (P-23).

### Contacto (RF-SW-06, RF-SW-19)

La página muestra el formulario y los datos de Quetzaltenango y Guatemala. Escuintla no aparece.

| Campo | Regla |
|---|---|
| Tipo de mensaje | Solicitud, queja o reclamo. Obligatorio |
| Nombre completo | Obligatorio |
| Empresa | Opcional |
| Correo electrónico | Obligatorio. Se valida que tenga una **estructura válida** |
| Teléfono | Opcional. Se captura con un **código de área por país**, para aceptar números de otros países. Si se escribe, se valida que tenga una **estructura válida** |
| País | **Lista** con todos los países. Opcional |
| Departamento | **Lista** de los departamentos de Guatemala. Opcional. **Solo aparece si el país es Guatemala** |
| Municipio | **Lista** de los municipios del departamento elegido. Opcional. **Solo aparece si el país es Guatemala** |
| Sede a la que dirige su mensaje | **Obligatorio.** Solo **Quetzaltenango** y **Guatemala** |
| Mensaje | Obligatorio |

- Los campos territoriales **no reemplazan** al campo de sede (respuesta del 11/10 a P-72).
- La solicitud se guarda en la base de datos y se envía por correo. Faltan el correo que recibe las solicitudes y los horarios de las dos sedes (P-22).

Si el usuario elige otro país, los campos de departamento y municipio **no aparecen** (respuesta del 11/10).

### Textos que se reemplazan (RF-SW-27)

Textos del prototipo que mencionan cuántas sedes o bodegas tiene la empresa, a Escuintla, el inventario o los roles anteriores. Se reemplazan por estos (respuesta del 11/10 a P-84: textos sin el número de sedes y bodegas, más creativos). Todos se basan en datos confirmados: más de 30 años, 9 industrias, presencia en todo el país y dos mercados, industrial y artesanal ([00-proyecto.md](00-proyecto.md)).

| Dónde | Texto del prototipo | Texto nuevo |
|---|---|---|
| Inicio, párrafo de la portada | "Compra, venta y distribución de productos químicos para nueve industrias del país. Más de treinta años abasteciendo al sector industrial y artesanal desde Quetzaltenango, Guatemala y Escuintla." | "Compra, venta y distribución de productos químicos para nueve industrias del país. Más de treinta años abasteciendo al sector industrial y artesanal, con presencia en todo el territorio." |
| Inicio, título de Presencia | "Tres sedes de distribución" | "Visítenos" |
| Inicio, texto de Presencia | "Cada sede tiene su propia bodega e inventario." | "Ubique nuestras oficinas en el mapa: será un gusto atenderle en persona." |
| Quiénes somos, encabezado | "… Atiende nueve industrias, tiene presencia en todo el país y opera tres bodegas de distribución." | "… Atiende nueve industrias y lleva sus productos a clientes de todo el país." |
| Contacto, título | "Estamos en tres sedes del país" | "Cuéntenos cómo podemos ayudarle" (el texto de abajo se mantiene) |
| Acceso personal, botón del picking | "Facturación, bodega, ruta, inventario, reportes y configuración." | "Facturación, bodega, ruta, reportes y configuración." |
| Acceso personal, texto lateral | "Lo que ve y hace cada persona depende de su rol, y la sede sale de su propia cuenta." / "Gerencia usa la misma cuenta en los dos sistemas. Las demás personas tienen una cuenta para cada sistema, con un solo rol en cada uno." | "Lo que ve y hace cada persona depende de sus permisos." / "Gerencia y Soporte usan la misma cuenta en los dos sistemas. Las demás personas tienen una cuenta para cada sistema." |
| Inicio de sesión del picking, texto lateral | "Control logístico de bodega: del pedido facturado a la entrega, con existencias por sede." | "Control logístico de bodega: del pedido facturado a la entrega." |
| Inicio de sesión (los dos sistemas), lista "Roles de este sistema" | Roles fijos (Facturador, Bodega, Piloto; Administrativo, Operativo, Vista general) | "Gerencia: acceso total a los dos sistemas. Soporte: el mismo acceso, para mantenimiento. Los demás usuarios entran según los permisos que les asignan Gerencia o Soporte." |
| Inicio de sesión, ayuda | "Use el usuario que le asignó Soporte IT" / "… Gerencia" | "Use el usuario que le asignaron Gerencia o Soporte." |
| Inicio de sesión, "¿Olvidó su contraseña?" | Por correo, o Gerencia / Soporte IT según el sistema | "Pídale a Gerencia o a Soporte que la restablezcan." |

"Productos disponibles en nuestras bodegas" desaparece con la sección "Catálogo informativo".

La cifra de la portada "**3** sedes con bodega de distribución" **se mantiene** como está en el prototipo (decisión del 11/10).

### Acceso personal (RF-SW-09)

Los tres botones descritos en [03-roles-y-accesos.md](03-roles-y-accesos.md).

## Panel administrativo (RF-SW-07, RF-SW-12, RF-SW-13)

Entran los usuarios del sitio según sus permisos ([03-roles-y-accesos.md](03-roles-y-accesos.md)). El **menú lateral izquierdo se puede reducir a íconos** para ampliar el área de trabajo, igual que en el picking (RF-SW-26). Desde el panel se administra:

| Sección | Qué se hace | Cambios del 29/09 y del 11/10 |
|---|---|---|
| Contenido institucional | Historia, misión, visión y valores | Imágenes de misión y visión; imagen **opcional** para historia y valores; **logotipo de Inquiserca** para el banner de Quiénes somos |
| Industrias | Descripción de cada industria | Se puede **subir una imagen por industria** |
| Catálogo | Productos públicos y sus industrias | Campos del producto (abajo). Se pueden **eliminar productos** |
| Noticias | Noticias del sitio | Cada noticia lleva **fotografía, título y texto** |
| Información de contacto | Datos de Quetzaltenango y Guatemala | Dirección, teléfono, correo, WhatsApp, horario y **mapa de Google Maps** de cada una |
| Solicitudes | Bandeja del formulario de contacto | Gestión de solicitudes (abajo) |
| Documentación interna | Documentos PDF | Producto, país de origen y lote (abajo) |
| Usuarios | Usuarios del sitio | Los administran Gerencia y Soporte, con rol y permisos ([03-roles-y-accesos.md](03-roles-y-accesos.md)) |

### Producto público en el panel (RF-SW-23)

| Campo | Tipo |
|---|---|
| Nombre | Texto |
| Descripción | Texto |
| Presentación | Texto |
| Países de origen | Texto |
| Imagen | Archivo de imagen que se **sube** o se **arrastra** desde la computadora |
| Industrias | Una o varias, como en el prototipo |

Todos los datos se agregan y se cambian desde el panel (respuesta del 11/10 a P-71).

### Gestión de solicitudes (RF-SW-12, RF-SW-20)

- Las solicitudes se **dividen por motivo**: **solicitud, queja y reclamo**, para encontrarlas con facilidad.
- **Responsable:** campo visible para designarlo. Se elige entre los **usuarios del sitio**. Su rol y sus permisos los asigna Gerencia según lo crea conveniente.
- **Comentario:** campo visible donde el responsable escribe **un solo comentario** sobre la solicitud que atiende.
- **Estados:** botones **Asignado**, **En proceso** y **Solucionado** (RN-42):
  - una solicitud recién llegada **no tiene estado**: los tres botones aparecen desmarcados;
  - se puede marcar **cualquier estado**, sin orden ni restricción;
  - los botones solo sirven para ver el avance de la solicitud.
- **No** se avisa por correo al responsable.
- Ver la bandeja y gestionarla dependen de los permisos del usuario.

## Documentación interna (RF-SW-10, RF-SW-14)

### Tipos de documento

Ficha técnica (FT / TDS), hoja de seguridad (HS / MSDS) y certificado de análisis (COA). Los tres tipos están en el prototipo aprobado.

### Subir documento

| Campo | Regla |
|---|---|
| Tipo de documento | FT, HS o COA |
| Nombre del producto | Se **escribe**. Un **solo** producto por documento. Ejemplo: "Soda Cáustica" |
| País de origen | Se elige de una **lista con todos los países**, la misma del formulario de contacto |
| Lote | Admite **números y letras** (RN-41). **Obligatorio solo en el certificado de análisis (COA)**; opcional en FT y HS |
| Archivo | PDF |

Ejemplo de la contraparte: hay varias sodas cáusticas con distintos países de origen y distintos lotes. Para todas se escribe el mismo nombre, "Soda Cáustica", y lo que las distingue es el país de origen y el lote.

Esto **reemplaza** la asociación anterior a uno o varios productos públicos, y el campo "código o lote" que solo llevaba el COA.

### Búsqueda (RF-SW-21)

Se puede buscar un documento por **lote**, por **nombre del producto** y por **país de origen**. El filtro por tipo de documento del prototipo se conserva.

Los documentos internos **no** se muestran en el detalle de los productos públicos (respuesta del 11/10).

### Reglas

- Todos los documentos son **PDF**. La empresa no fija un tamaño máximo.
- Lo que cada usuario puede hacer depende de **sus permisos** ([03-roles-y-accesos.md](03-roles-y-accesos.md)).
- Un usuario sin sesión no entra a esta área.
- Los PDF se guardan en el **sistema de archivos del servidor, fuera de la carpeta pública**, y se entregan por una ruta protegida que verifica los permisos. **No** se guardan en Cloudflare R2.
- Ejemplos entregados por la empresa, en `docs_incovsa/PAGINA WEB/DOCUMENTOS TECNICOS/`:
  - una ficha técnica de soda cáustica de México (4 páginas);
  - una hoja de seguridad del mismo producto (17 páginas);
  - un certificado de análisis del lote de proveedor CAB250526, identificado como "SKU 4139" (1 página).

## Imágenes del sitio

Todas las imágenes del sitio se guardan en **Cloudflare R2, plan gratuito**: las del contenido institucional (incluidas misión y visión), las de las industrias, las de los productos, las de las noticias y los logotipos, incluido el de Inquiserca cuando llegue.

## Confidencialidad

La contraparte autorizó mostrar la estructura de los documentos internos y de los productos en la documentación académica, pero no todos los datos. En desarrollo se trabaja con estructura y datos de prueba. Los datos finales se cargan en producción cuando la empresa lo indique.
