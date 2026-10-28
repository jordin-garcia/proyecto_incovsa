# Datos, seguridad e interfaz

## Datos

El modelo conceptual está en `specs/14-modelo-de-datos.md`. La aplicación lo materializa en `prisma/schema.prisma`. El comentario de ese esquema dice que, si difieren, manda `specs/14`. Los nombres de modelo que siguen son los de Prisma.

El acceso usa Sede, Usuario, Permiso, UsuarioPermiso y UsuarioSede. Usuario guarda el rol como texto libre y el sistema (sitio, picking o ambos). Ambos queda solo para Gerencia y Soporte. El nombre de usuario es único dentro de cada sistema (RN-54). Camion pertenece a una sede y guarda la capacidad máxima en kilogramos. La eliminación de usuarios y de camiones es lógica.

PedidoFacturado guarda el número de Odoo, la referencia, el nombre del cliente y el sector tal como vienen en el archivo. Si no tiene OpcionEnvio, está en el tablero. Si no tiene Envio, todavía no se envió a bodega. DetallePedidoFacturado guarda el producto, el lote, el Peso de Conversión y la cantidad en kilogramos. Un lote vacío se guarda como texto vacío (16/10/2026).

Hay dos OpcionEnvio por sede. Una es Envío por camión, con camión y piloto opcionales hasta que se eligen. La otra es Cliente recoge en bodega. Cada una tiene fecha y hora programadas, vacías hasta que se escriben.

Envio es la ruta o el pedido. Guarda el tipo, el número del día, la fecha de envío a bodega, la fecha y hora programadas, y la posición en la cola de Bodega. EstadoEnvio nombra En Preparación, Despachado, En Ruta o Entregado. No hay Cancelado ni Editado. HistorialEstado guarda la fecha, la hora, el envío, el estado y el usuario. LineaPreparacion es única por envío, producto, lote y Peso de Conversión (RN-51). EntregaRuta existe en el envío de tipo ruta, una fila por cliente con el mismo nombre y el mismo sector (RN-49).

Bitacora guarda el sistema, la operación, la entidad, el identificador, el detalle, el nombre de usuario escrito, la dirección IP cuando aplica, y la fecha y la hora. El usuario puede ir vacío.

El sitio usa ConfiguracionSitio, ContenidoInstitucional, Valor, Industria, ProductoSitio, ProductoIndustria, Noticia, Imagen, ProductoDocumentado, SolicitudContacto, InformacionContacto, Pais, Departamento y Municipio. Imagen admite hasta 5 por dueño (RN-56). Valor son 5 imágenes fijas, una por valor, y no usa la galería de Imagen. ProductoDocumentado guarda enlaces de Google Drive, no archivos. Noticia no tiene un atributo de publicada. Toda noticia guardada se publica, y se elimina en lugar de ocultarse (15/10/2026). InformacionContacto solo cubre las sedes con oficina. SolicitudContacto exige país. Departamento y municipio son obligatorios si el país es Guatemala. El estado de la solicitud puede ir vacío, o ser Asignado, En proceso o Solucionado.

Prisma también tiene Cuenta y Sesion, porque Better Auth guarda ahí el hash de la contraseña y la sesión. Verificacion es la tabla de Better Auth para verificación. El sistema no la usa, porque no hay recuperación por correo. ProductoIndustria es la relación de varias industrias por producto público, que `specs/14` describe como N:M.

Quedaron fuera Existencia, movimiento de inventario, traslado, devolución, el catálogo de productos del picking, Cliente, Sector, Pedido y Ruta como entidades distintas, y el documento interno en PDF. El detalle está en {{tab:entidades-fuera}}.

## Seguridad

Las medidas están en la sección Seguridad de `specs/16-arquitectura-y-tecnologia.md`. Complementan RNF-03, RNF-04, RNF-05, RNF-09, RNF-10, RNF-12, RNF-15 y RNF-16.

Toda operación del servidor verifica la sesión, el permiso y la sede antes de leer o cambiar datos. Eso incluye las acciones del servidor, las rutas de la API, la carga del archivo de Odoo, la consulta de los enlaces de documentación y la exportación de reportes. La verificación vive en una función de la capa de negocio, `exigirPermiso`. El archivo `proxy.ts` de Next.js 16 solo redirige a quien no tiene sesión. No es el único control. En 2025 se publicó CVE-2025-29927, que permitía saltarse el middleware. El servidor no confía en la sede, los permisos ni el rol que mande el navegador. Esos datos salen de la sesión y de la base. Ocultar un botón no es un control de acceso.

Better Auth 1.7 inicia sesión con nombre de usuario y contraseña. Las sesiones se guardan en la base. Las contraseñas usan scrypt. No se programa un sistema de autenticación propio. La cookie de sesión es `HttpOnly`, `Secure` y `SameSite=Lax`. Hay una configuración de Better Auth por sistema, con su propia cookie. Cerrar un sistema no cierra el otro. Cada configuración acepta las cuentas de su sistema y las del sistema ambos.

El límite de intentos (RNF-15) es este. Cinco intentos fallidos seguidos del mismo usuario lo bloquean 15 minutos. Veinte intentos fallidos desde una misma dirección IP en 15 minutos la bloquean 15 minutos. Un inicio correcto reinicia el conteo del usuario. Los intentos se cuentan en la base, a partir de la bitácora, para que no se pierdan si se reinicia el servidor. La consulta de un nombre de usuario que no existe, en el acceso personal, cuenta como intento fallido de la dirección IP y queda en la bitácora. El mensaje de la contraseña incorrecta no dice si falló el usuario o la contraseña.

Mientras INCOVSA no defina la expiración (P-07), la sesión dura 7 días y se renueva con el uso una vez al día. El tiempo se configura con una variable de entorno. Al eliminar o desactivar un usuario, o al restablecer su contraseña, se borran todas sus sesiones. La aplicación toma la dirección IP solo de la cabecera que agrega Caddy. El primer administrador se crea con `npm run crear-admin`. Quién es está pendiente (P-08). Ninguna credencial queda en el repositorio ni en la semilla.

Todo lo que llega al servidor se valida con Zod. El archivo .xlsx y las imágenes se validan por su contenido, no solo por la extensión. El servidor genera el nombre con que guarda cada imagen en R2. Se aceptan JPG, PNG y WebP. No se aceptan SVG ni GIF. El máximo es 5 MB por imagen. `sharp` quita los metadatos, reduce el ancho a un máximo de 2000 px y guarda WebP. La imagen pasa por el servidor antes de R2. El navegador no la sube directo. El límite de las acciones del servidor es 3 MB, para el archivo de Odoo de hasta 2 MB. Los enlaces de documentación solo se aceptan si son `https://` de `drive.google.com` o de `docs.google.com`.

Las consultas a la base son las de Prisma, parametrizadas. No se usa `$queryRawUnsafe` con datos del usuario. El contenido que escriben los usuarios y el que trae el archivo de Odoo se muestra escapado. No se usa `dangerouslySetInnerHTML` con ese contenido. Las acciones del servidor verifican el origen. Las rutas de la API que cambian datos también lo verifican.

El sitio va por HTTPS, con HSTS. Caddy obtiene y renueva el certificado y agrega HSTS. Las cabeceras de RNF-16 son `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` y `frame-ancestors`. La política de contenido debe permitir las imágenes de R2, los mapas insertados de Google Maps y la vista previa de Google Drive. Ante un error inesperado, el mensaje es "No se pudo completar la operación. Inténtelo de nuevo." Los errores de las reglas de negocio muestran su propio mensaje. El detalle técnico queda en el registro del servidor.

Las claves, la contraseña de la base y las credenciales de R2 están solo en variables de entorno (RNF-10). Dependabot está activado. `npm audit` corre en cada pull request. El archivo de bloqueo está en el repositorio.

Los respaldos de PostgreSQL son automáticos (RNF-09). Una tarea de `cron` del VPS ejecuta `pg_dump` dentro del contenedor y sube el archivo al bucket privado de R2 con `rclone`. Se conservan 7 diarios y 4 semanales. No se agrega un cifrado propio, porque R2 cifra lo que guarda. Desde el 13/10/2026 no hay PDF en el servidor.

## Interfaz

El diseño aprobado es el del prototipo de simulación (`specs/20-prototipo-aprobado.md`). La aplicación lo reproduce con Tailwind CSS y shadcn/ui. Lo que `specs/` no detalla de la distribución, los textos de ayuda, el orden y la interacción se toma de ese prototipo. Este capítulo no agrega pantallas. No se tomaron capturas nuevas para esta versión. Las capturas viejas están en el anexo C, y una de ellas es el módulo de Inventario, que ya no existe.

El código fuente del prototipo está en `entregable-1/prototipos/simulacion/src/`. El HTML armado está en `entregable-1/prototipos/prototipo-simulacion-incovsa.html`. Los archivos son `base.js`, `sitio.js`, `panel.js`, `picking.js`, `tablero.js`, `inicio.js`, `estilos.css` y `plantilla.html`.

Tabla: Tipografía del prototipo aprobado {#tab:tipografia}

| Uso | Fuente |
|---|---|
| Títulos | Poppins (500 a 800) |
| Interfaz y texto | Figtree (400 a 800) |
| Nombres de producto, cantidades y cifras | JetBrains Mono (400 a 700), con cifras tabulares |

Se cargan desde Google Fonts. La tipografía oficial de la empresa sigue pendiente (P-18).

Tabla: Colores del prototipo aprobado {#tab:colores}

| Grupo | Tokens |
|---|---|
| Verdes | `--v950` #031F0B, `--v900` #062D12, `--v850` #083817, `--v800` #0A461F, `--v700` #0D5A24, `--v600` #126C2A (principal), `--v500` #1B8238, `--v400` #37A052, `--v300` #7CC48E, `--v200` #BFE3C8, `--v100` #E3F2E7, `--v50` #F1F8F2 |
| Lima, acento del logotipo | `--lima` #64932A, `--lima-v` #8DC63F, `--lima-b` #B5E07A |
| Grises | `--g900` #1C1D1C, `--g800` #2B2C2B, `--g700` #3C3C3C, `--g600` #545554, `--g500` #727372, `--g400` #9A9B99, `--g300` #C3C5C1, `--g200` #DCDED9, `--g150` #E7E9E4, `--g100` #EFF1EC, `--g50` #F7F8F5 |
| Estados | Ámbar `--ambar` #9A5B00 y `--ambar-f` #FFF1D6. Rojo `--rojo` #B42318 y `--rojo-f` #FDECEA. Azul `--azul` #0A6780 y `--azul-f` #E1F2F6 |

Los colores se tomaron de los dos logotipos recibidos. Los códigos exactos de la empresa siguen pendientes (P-18).

Los radios son 8, 12, 18 y 26 px. Los íconos son de trazo, en SVG. En todos los módulos de la administración del sitio y del picking, el título va con una instrucción breve a la par (15/10/2026). Misión y visión, y la sección A quién servimos, usan el verde del pie (`--v950`), con títulos en blanco y el acento `--lima-b`. La fecha se escribe dd/mm/aaaa y la hora HH:MM de 24 horas, con el teclado o con el selector del navegador.

Los chips de estado del prototipo son En Preparación, Despachado, En Ruta y Entregado. No hay chip de Cancelado ni de Editado. El tablero de Bodega tiene modo claro y modo oscuro desde el 29/09/2026. En el modo claro, el cuadro del pedido que recoge el cliente va en verde lima. En el modo oscuro va en gris (16/10/2026). Desde el 15/10/2026 el tablero usa solo la silueta del camión grande.

Para el contraste de RNF-08, la miga de navegación, el texto secundario del encabezado, los encabezados de tabla y los textos secundarios de las pantallas de acceso usan `--g600` sobre `--g50`. La combinación `--g500` sobre `--g50` del prototipo queda en 4.46 a 1, por debajo de 4.5 a 1. Bodega aplica el mismo ajuste en el pie de las tarjetas, las líneas marcadas, el texto Sin lote y el Detalle de Ruta. La etiqueta RUTA no lleva opacidad. La excepción, por decisión del coordinador, es el cuadro lima del pedido que recoge el cliente, que conserva los colores del prototipo (`specs/20-prototipo-aprobado.md`, 18/10/2026 y 19/10/2026).

Las áreas con nombre en `specs/` son estas. En el sitio público: Inicio, Quiénes somos, Industrias, Productos, el detalle de producto, Noticias, Contacto y Acceso personal. En el panel: contenido institucional, industrias, catálogo, noticias, información de contacto, solicitudes, usuarios y productos documentados. En el picking: Facturación, con el tablero y las dos opciones de envío, Bodega, el tablero en pantalla completa, Ruta, Reportes (Despacho, Rutas realizadas y Bitácora) y Configuración (camiones y usuarios).

El prototipo trae piezas que la aplicación real no usa. El botón Demostración, las cuentas de ejemplo, las notas amarillas de pendientes, la leyenda de prototipo, el estado guardado en el navegador, las imágenes guardadas en el navegador y los botones de Excel y PDF que en la simulación solo avisan. La aplicación real persiste en PostgreSQL, guarda las imágenes en R2 y genera Excel y PDF en el servidor. El módulo de Inventario, la captura manual, la recuperación por correo, Escuintla en el sitio y los roles fijos ya no están en el prototipo.
