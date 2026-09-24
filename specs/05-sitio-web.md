# 05. Sitio web corporativo e institucional

## Identidad

| Elemento | Valor |
|---|---|
| Dominio | incovsa.com (reservado y disponible, según la contraparte) |
| Nombre a mostrar | Industria del Cuero Covadonga S. A. |
| Empresas | INCOVSA e Inquiserca en una sola presentación y una sola identidad visual |
| Logotipos recibidos | Dos JPG: "INCOVSA Químicos" y "Transformamos INCOVSA" (`docs_incovsa/PAGINA WEB/INFORMACION EMPRESA/`) |
| Colores | Verde y gris, tomados de los logotipos. Faltan los códigos exactos (P-18) |
| Tipografía | [PENDIENTE] P-18 |
| Diseño visual e interacción | Libres para el equipo (acuerdo del 04/09) |

## Secciones públicas

### Inicio (RF-SW-01)

Información institucional y noticias. La contraparte quiere un inicio intuitivo.

### Quiénes somos (RF-SW-02)

Historia, misión, visión y valores.

**Misión**, transcrita de `MISION.jpg`:

> Ser el aliado estratégico para nuestros clientes y proveedores en la distribución de productos químicos, atendiendo la región CA-4, marcando la diferencia en servicio, con una completa gama de productos para brindar soluciones a las necesidades del mercado, apoyando a cumplir los objetivos de nuestros grupos de interés.

**Visión**, transcrita de `VISION.jpg`:

> Ser referentes y acercar soluciones en la distribución de productos químicos satisfaciendo las necesidades de los mercados atendidos, creando valor integral a nuestros grupos de interés a través del crecimiento y mejora continua, con una administración responsable y transparente enfocada en la solidez y el largo plazo.

La imagen original dice "tranparente". Falta que la empresa confirme el texto correcto (P-20).

La historia y los valores están pendientes (P-19).

### Industrias (RF-SW-03)

Son 9 industrias, en este orden, tomadas del prototipo:

1. Cuero
2. Textil
3. Cerería
4. Hulera
5. Medicamentos
6. Limpieza
7. Alimentación animal
8. Tratamiento de agua
9. Lavandería

- Se navega por industria. **No** se usa una barra superior horizontal.
- La descripción y los productos de cada industria que muestra el prototipo vienen del sitio de Google de la empresa (<https://sites.google.com/view/incovsa>). Ese texto necesita revisión de redacción y ortografía antes de publicarse.
- Las descripciones definitivas y las imágenes de cada industria están pendientes (P-21). Las imágenes del sitio de Google miden 275 × 183 px, lo cual no alcanza para este diseño.

### Catálogo de productos (RF-SW-04)

- Es solo informativo: sin precios y sin comercio electrónico.
- Se filtra por industria. Un producto puede pertenecer a **varias** industrias.
- Se muestran nombre, origen y presentación. **Nunca** el lote.
- **Productos de prueba:** son las 28 imágenes de `docs_incovsa/PAGINA WEB/CATALOGO/`, y cada imagen es un producto público. El nombre correcto es el que aparece **dentro de la imagen**; los nombres de los archivos tienen errores de escritura ("SODA ACUSTICA", "CASUTICA", "HIGROGENO", "HIPOCLARITO", "BLANQUEDADOR").
- Para cada producto faltan los datos (origen, presentación, industrias y campos del detalle) (P-17).
- Los productos públicos son una entidad **distinta** de los productos del picking y no tienen relación con ellos.

### Detalle de producto (RF-SW-05)

Campos: presentación, origen, manejo, condiciones de almacenamiento, humedad, tipo de producto y restricciones de uso ("qué no se puede hacer"). Los datos están pendientes (P-17).

### Noticias (RF-SW-01)

Quién las publica, qué campos llevan y si hay contenido inicial está pendiente (P-23). Las publican los roles con acceso al panel: Gerencia y Administrativo.

### Contacto (RF-SW-06)

- Formulario para solicitudes, quejas o reclamos. Cada solicitud se **envía por correo y se guarda** en la base de datos.
- El correo de contacto se muestra en la página.
- Faltan los campos del formulario, el correo que recibe las solicitudes y la información de contacto de las tres sedes (P-22).

### Acceso personal (RF-SW-09)

Los tres botones descritos en [03-roles-y-accesos.md](03-roles-y-accesos.md).

## Panel administrativo (RF-SW-07, RF-SW-12, RF-SW-13)

Pueden entrar **Gerencia y Administrativo**. Desde el panel se administra:

- Información institucional: historia, misión, visión y valores.
- Imágenes del sitio.
- Industrias.
- Catálogo de productos públicos, con su asociación a una o varias industrias.
- Noticias.
- Información de contacto.
- Bandeja de solicitudes de contacto. Qué roles la ven está pendiente (P-13).
- Documentos internos (ver abajo).
- **Usuarios del sitio: solo Gerencia ve esta opción.**

## Documentación interna (RF-SW-10, RF-SW-14)

### Tipos de documento

| Tipo | Siglas en los archivos de la empresa | Se asocia a |
|---|---|---|
| Ficha técnica | FT / TDS | Uno o varios productos públicos |
| Hoja de seguridad | HS / MSDS | Uno o varios productos públicos |
| Certificado de análisis | COA | Uno o varios productos públicos, **más el código o lote al que corresponde, escrito como texto** (por ejemplo, "SKU 4139"). No se enlaza con los productos del picking |

### Reglas

- Todos los documentos son **PDF**. La empresa no fija un tamaño máximo.
- Lo que cada usuario puede hacer depende de su rol; la matriz está en [03-roles-y-accesos.md](03-roles-y-accesos.md). Vista general solo visualiza.
- Un usuario sin sesión no entra a esta área.
- Los PDF se guardan en el **sistema de archivos del servidor, fuera de la carpeta pública**, y se entregan por una ruta protegida que verifica el rol. **No** se guardan en Cloudflare R2.
- Ejemplos entregados por la empresa, en `docs_incovsa/PAGINA WEB/DOCUMENTOS TECNICOS/`:
  - una ficha técnica de soda cáustica de México (4 páginas);
  - una hoja de seguridad del mismo producto (17 páginas);
  - un certificado de análisis del lote de proveedor CAB250526, identificado como "SKU 4139" (1 página).

## Imágenes del sitio

Todas las imágenes del sitio (institucionales, industrias, productos, noticias) se guardan en **Cloudflare R2, plan gratuito**.

## Confidencialidad

La contraparte autorizó mostrar la estructura de los documentos internos y de los productos en la documentación académica, pero no todos los datos. En desarrollo se trabaja con estructura y datos de prueba. Los datos finales se cargan en producción cuando la empresa lo indique.
