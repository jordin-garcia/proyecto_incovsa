# Datos, seguridad e interfaz

## Datos

El modelo conceptual está en `specs/14-modelo-de-datos.md`. La aplicación lo materializa en `prisma/schema.prisma`. El comentario de ese esquema dice que, si difieren, manda `specs/14`. Los nombres de modelo que siguen son los de Prisma.

El acceso usa Sede, Usuario, Permiso, UsuarioPermiso y UsuarioSede. Usuario guarda el rol como texto libre y el sistema (sitio, picking o ambos). Ambos queda solo para Gerencia y Soporte. El nombre de usuario es único dentro de cada sistema (RN-54). Camion pertenece a una sede y guarda la capacidad máxima en kilogramos. La eliminación de usuarios y de camiones es lógica.

PedidoFacturado guarda el número de Odoo, la referencia, el nombre del cliente y el sector tal como vienen en el archivo. Si no tiene OpcionEnvio, está en el tablero. Si no tiene Envio, todavía no se envió a bodega. DetallePedidoFacturado guarda el producto, el lote, el Peso de Conversión y la cantidad en kilogramos. Un lote vacío se guarda como texto vacío (16/10/2026).

Hay dos OpcionEnvio por sede. Una es Envío por camión, con camión y piloto opcionales hasta que se eligen. La otra es Cliente recoge en bodega. Cada una tiene fecha y hora programadas, vacías hasta que se escriben.

Envio es la ruta o el pedido. Guarda el tipo, el número del día, la fecha de envío a bodega, la fecha y hora programadas, y la posición en la cola de Bodega. EstadoEnvio nombra En Preparación, Despachado, En Ruta o Entregado. No hay Cancelado ni Editado. HistorialEstado guarda la fecha, la hora, el envío, el estado y el usuario. LineaPreparacion es única por envío, producto, lote y Peso de Conversión (RN-51). EntregaRuta existe en el envío de tipo ruta, una fila por cliente con el mismo nombre y el mismo sector (RN-49).

Bitacora guarda el sistema, la operación, la entidad, el identificador, el detalle, el nombre de usuario escrito, la dirección IP cuando aplica, y la fecha y la hora. El usuario puede ir vacío.

El sitio usa ConfiguracionSitio, ContenidoInstitucional, Valor, Industria, ProductoSitio, ProductoIndustria, Noticia, Imagen, ProductoDocumentado, SolicitudContacto, InformacionContacto, Pais, Departamento y Municipio. Imagen admite hasta 5 por dueño (RN-56). Valor son 5 imágenes fijas, una por valor, y no usa la galería de Imagen. ProductoDocumentado guarda enlaces de Google Drive, no archivos. Noticia no tiene un atributo de publicada. Toda noticia guardada se publica, y se elimina en lugar de ocultarse (15/10/2026). InformacionContacto solo cubre las sedes con oficina. SolicitudContacto exige país. Departamento y municipio son obligatorios si el país es Guatemala. El estado de la solicitud puede ir vacío, o ser Asignado, En proceso o Solucionado. Desde el 30/10/2026, SolicitudContacto guarda también la dirección IP de quien la envía, con un índice por IP y fecha, para contar las solicitudes de la última hora.

Prisma también tiene Cuenta y Sesion, porque Better Auth guarda ahí el hash de la contraseña y la sesión. Verificacion es la tabla de Better Auth para verificación. El sistema no la usa, porque no hay recuperación por correo. ProductoIndustria es la relación de varias industrias por producto público, que `specs/14` describe como N:M.

Quedaron fuera Existencia, movimiento de inventario, traslado, devolución, el catálogo de productos del picking, Cliente, Sector, Pedido y Ruta como entidades distintas, y el documento interno en PDF. El detalle está en {{tab:entidades-fuera}}.

## Seguridad

Las medidas están en la sección Seguridad de `specs/16-arquitectura-y-tecnologia.md`. Complementan RNF-03, RNF-04, RNF-05, RNF-09, RNF-10, RNF-12, RNF-15 y RNF-16. La meta de verificación es OWASP ASVS 5.0, nivel 2 (decisión 66).

### Autorización

Toda operación del servidor verifica la sesión, el permiso y la sede antes de leer o cambiar datos. Eso incluye las acciones del servidor, las rutas de la API, la carga del archivo de Odoo, la consulta de los enlaces de documentación y la exportación de reportes. La verificación vive en una función de la capa de negocio, `exigirPermiso`. Las acciones de administración de usuarios exigen el acceso total de Gerencia o Soporte, con la función `exigirAccesoTotal` (28/10/2026). El archivo `proxy.ts` de Next.js 16 solo redirige a quien no tiene sesión. No es el único control. En 2025 se publicó CVE-2025-29927, que permitía saltarse el middleware. El servidor no confía en la sede, los permisos ni el rol que mande el navegador. Esos datos salen de la sesión y de la base. Ocultar un botón no es un control de acceso.

La única acción del servidor sin sesión es la recepción del formulario de Contacto, porque quien escribe no tiene cuenta (24/10/2026). Vive sola en un archivo. Valida la entrada con un esquema estricto de Zod, solo crea la solicitud y solo devuelve el folio. Desde una misma dirección IP acepta hasta 5 solicitudes por hora. A partir de la sexta, muestra «Recibimos varias solicitudes desde su conexión. Inténtelo de nuevo en una hora.» y no guarda nada. El formulario tiene además un campo que las personas no ven. Si llega con texto, el envío lo hizo un robot: la respuesta parece correcta, pero no se guarda nada (29/10/2026).

### Autenticación y sesiones

Better Auth 1.7 inicia sesión con nombre de usuario y contraseña. Las sesiones se guardan en la base. No se programa un sistema de autenticación propio. Hay una configuración de Better Auth por sistema, con su propia cookie. Cerrar un sistema no cierra el otro. Cada configuración acepta las cuentas de su sistema y las del sistema ambos.

Desde el 30/10/2026, las contraseñas usan scrypt con N=2^14, r=8 y p=5, el mínimo que recomienda OWASP, con una sal de 16 bytes. Cada hash lleva escritos sus parámetros, para poder subirlos más adelante sin perder las contraseñas guardadas. Una sola función cifra y verifica en los dos inicios de sesión, en la administración de usuarios, en `crear-admin` y en las semillas.

Las cookies son `HttpOnly`, `Secure` y `SameSite=Lax`. En producción, todas las cookies propias llevan el prefijo `__Host-`: las de sesión de los dos sistemas, la de la sede de trabajo y la del usuario escrito en el acceso personal (30/10/2026). El navegador solo las acepta por HTTPS, en todo el sitio y sin dominio. Así no se comparten con otros hosts ni las puede sobrescribir un subdominio.

El límite de intentos (RNF-15) es este. Cinco intentos fallidos seguidos del mismo usuario lo bloquean 15 minutos. Veinte intentos fallidos desde una misma dirección IP en 15 minutos la bloquean 15 minutos. Un inicio correcto reinicia el conteo del usuario. Los intentos se cuentan en la base, a partir de la bitácora, para que no se pierdan si se reinicia el servidor. La consulta de un nombre de usuario que no existe, en el acceso personal, cuenta como intento fallido de la dirección IP y queda en la bitácora. El mensaje de la contraseña incorrecta no dice si falló el usuario o la contraseña. La aplicación toma la dirección IP solo de la cabecera que agrega Caddy.

Mientras INCOVSA no defina la expiración (P-07), la sesión dura 7 días y se renueva con el uso una vez al día. El tiempo se configura con una variable de entorno. Al eliminar o desactivar un usuario, o al restablecer su contraseña, se borran todas sus sesiones. Al iniciar sesión en un sistema se cierra la sesión que ese navegador ya tenía en ese sistema. Al cerrar sesión, la página se recarga por completo y el servidor responde con `Clear-Site-Data: "cache"`. Una página con sesión que el navegador restaura con Atrás se vuelve a pedir al servidor (30/10/2026).

El primer administrador se crea con `npm run crear-admin`. Quién es está pendiente (P-08). Ninguna credencial queda en el repositorio ni en la semilla. En producción, la aplicación rechaza las claves de ejemplo de la plantilla: nadie puede iniciar sesión hasta cambiarlas (28/10/2026).

`specs/03-roles-y-accesos.md` agrega dos controles del 29/10/2026 que se implementan después de la entrega del 04/11/2026 (decisión 90). El primero rechaza las contraseñas fáciles de adivinar: las de una lista local de contraseñas comunes, las que contienen una palabra de la empresa y las que contienen el nombre de usuario. El segundo pide la contraseña de quien restablece la de una cuenta de Gerencia o Soporte. La función de reautenticación que usará ya existe, con el mismo bloqueo y el mismo límite de intentos que el inicio de sesión.

### Entradas y archivos

Todo lo que llega al servidor se valida con Zod. El archivo .xlsx y las imágenes se validan por su contenido, no solo por la extensión. El archivo de Odoo se rechaza si pesa más de 2 MB. Como el .xlsx es un archivo comprimido, también se rechaza si tiene más de 100 archivos internos, si descomprimido pasa de 50 MB o si su hoja tiene más de 20 000 filas (29/10/2026). Cada columna se valida con el largo máximo que tiene en la base.

El servidor genera el nombre con que guarda cada imagen. Se aceptan JPG, PNG y WebP. No se aceptan SVG ni GIF. El máximo es 5 MB por imagen. `sharp` quita los metadatos, reduce el ancho a un máximo de 2000 px y guarda WebP. La imagen pasa por el servidor antes de R2. El navegador no la sube directo. El límite de las acciones del servidor es 3 MB, para el archivo de Odoo de hasta 2 MB. Caddy acepta cuerpos de hasta 27 MB, el tope de la publicación de hasta 5 imágenes de 5 MB en una sola petición (28/10/2026). Los enlaces de documentación solo se aceptan si son `https://` de `drive.google.com` o de `docs.google.com`.

Los textos tienen topes (RNF-05). El mensaje de Contacto y el comentario del responsable admiten hasta 2000 caracteres. Los textos largos del panel admiten hasta 10 000 caracteres: noticias, historia, misión, visión y descripciones de industrias y productos (29/10/2026).

Las consultas a la base son las de Prisma, parametrizadas. No se usa `$queryRawUnsafe` con datos del usuario. El contenido que escriben los usuarios y el que trae el archivo de Odoo se muestra escapado. No se usa `dangerouslySetInnerHTML` con ese contenido. Las acciones del servidor verifican el origen. Las rutas de la API que cambian datos también lo verifican.

### Cabeceras y registros

El sitio va por HTTPS. Caddy obtiene y renueva el certificado. Desde el 28/10/2026, HSTS y las demás cabeceras de seguridad las envía la aplicación, y Caddy no las repite, para que no salgan dos cabeceras HSTS.

Tabla: Cabeceras de seguridad de la aplicación {#tab:cabeceras}

| Cabecera | Qué hace |
|---|---|
| `Strict-Transport-Security` | Obliga al navegador a usar HTTPS. Se envía en producción |
| `Content-Security-Policy` | Solo deja correr los scripts con el nonce de 128 bits de cada respuesta. Limita las imágenes al origen de R2 y los marcos a Google Maps y a la vista previa de Google Drive. Lleva `frame-ancestors 'none'`, `object-src 'none'` y `base-uri 'none'` |
| `X-Content-Type-Options: nosniff` | Impide que el navegador adivine el tipo de un archivo |
| `Referrer-Policy` | Limita la dirección de origen que se envía a otros sitios |
| `Permissions-Policy` | Desactiva la cámara, el micrófono, la ubicación y los pagos |
| `Cross-Origin-Opener-Policy: same-origin` | Aísla la ventana de la aplicación de las de otros sitios |

La aplicación no envía `X-Powered-By`. Tampoco envía `Cross-Origin-Embedder-Policy`, porque bloquearía los mapas de Google y la vista previa de Drive. Los estilos usan `'unsafe-inline'`, porque los componentes posicionados y el arrastre escriben estilos en línea. Los scripts no lo usan.

Ante un error inesperado, el mensaje es "No se pudo completar la operación. Inténtelo de nuevo." Los errores de las reglas de negocio muestran su propio mensaje. El detalle técnico queda en el registro del servidor. Desde el 30/10/2026, ese registro escribe una línea JSON por cada rechazo de autorización, cada cookie de sede ajena y cada error inesperado. Lleva la fecha, el evento, el sistema, el usuario y la operación. Nunca lleva datos personales, contraseñas, secretos ni el mensaje del error. Es distinto de la bitácora de Reportes.

### Secretos, dependencias y controles automáticos

Las claves, la contraseña de la base y las credenciales de R2 están solo en variables de entorno (RNF-10). El archivo de bloqueo está en el repositorio. Dependabot está activado y junta en un solo pull request por ecosistema las versiones menores y los parches. `npm audit` corre en cada pull request. La imagen de producción solo lleva las dependencias de producción, sin las herramientas de desarrollo ni la semilla de demostración (30/10/2026).

La integración continua corre, además de las pruebas, Semgrep con reglas propias, gitleaks, OSV-Scanner, lockfile-lint y actionlint. Una regla de Semgrep hace fallar la CI si una operación del servidor no verifica el permiso. Las excepciones de OSV-Scanner llevan vencimiento y razón. La primera es un aviso de minimatch, que solo usan las herramientas de desarrollo, hasta el 15/11/2026.

El 29/10/2026 el coordinador revisó la aplicación contra los requisitos de los niveles 1 y 2 de OWASP ASVS 5.0. También corrió el escaneo básico de OWASP ZAP sobre el sitio público, sin alertas de riesgo alto. Las brechas del código se corrigieron antes del 03/11/2026. Quedan para después de la entrega del 04/11/2026 (decisión 90) los dos controles de contraseñas descritos arriba, los mensajes de validación que todavía salen en inglés, el rechazo del método TRACE en Caddy y la documentación de los riesgos aceptados en `specs/16`. El 30/10/2026, la repetición de ZAP ya no mostró las alertas de `X-Powered-By`, `Permissions-Policy` ni `Cross-Origin-Opener-Policy`. El resultado y sus evidencias están en el Documento 6.

El coordinador aceptó como riesgo no implementar antes de la entrega estas funciones, que `specs/` no pide: MFA, el cambio de la contraseña propia, ver y cerrar las sesiones propias, que un administrador cierre sesiones sin desactivar la cuenta, una vida máxima absoluta de la sesión, un límite de sesiones simultáneas, la contraseña inicial que obliga a cambiarla y la consulta de contraseñas filtradas. También aceptó no cambiar ahora la infraestructura del VPS, la retención de las solicitudes y de las IP de la bitácora, ni los límites de conexiones de tiempo real y de exportaciones simultáneas (`specs/18-historial-de-decisiones.md`, 29/10/2026).

### Respaldos

Los respaldos de PostgreSQL serán automáticos (RNF-09). Una tarea de `cron` del VPS ejecuta `pg_dump` dentro del contenedor y sube el archivo al bucket privado de R2 con `rclone`. Se conservan 7 diarios y 4 semanales. No se agrega un cifrado propio, porque R2 cifra lo que guarda. Desde el 13/10/2026 no hay PDF en el servidor. La configuración sin secretos (`docker-compose.yml`, `Caddyfile` y la plantilla de variables) se respalda en el repositorio. La copia de los secretos del VPS se guarda solo en el medio seguro que se acuerde con INCOVSA para entregar las credenciales (22/10/2026). Mientras no haya VPS ni cuenta de R2, la CI prueba el respaldo y la restauración con un destino local.

## Interfaz

El diseño aprobado es el del prototipo de simulación (`specs/20-prototipo-aprobado.md`). La aplicación lo reproduce con Tailwind CSS y shadcn/ui. Desde el 22/10/2026, en cómo se ve la aplicación manda el prototipo: disposición, tamaños, colores, tipografía, espaciado y estilos (decisión 89). En los requisitos, las reglas, los textos, los datos y el comportamiento manda `specs/`. Lo que `specs/` no detalla de la interacción se toma también del prototipo. Este capítulo no agrega pantallas. Las capturas del prototipo aprobado están en el anexo C.

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

Los chips de estado del prototipo son En Preparación, Despachado, En Ruta y Entregado. No hay chip de Cancelado ni de Editado. El tablero de Bodega tiene modo claro y modo oscuro desde el 29/09/2026. Sin una elección previa abre en modo claro, y el modo elegido se guarda solo en esa pantalla (24/10/2026). En una ruta larga, todas las líneas se pueden ver y tocar en cualquier tamaño de pantalla. En el modo claro, el cuadro del pedido que recoge el cliente va en verde lima. En el modo oscuro va en gris (16/10/2026). Desde el 15/10/2026 el tablero usa solo la silueta del camión grande.

Para el contraste de RNF-08, la miga de navegación, el texto secundario del encabezado, los encabezados de tabla y los textos secundarios de las pantallas de acceso usan `--g600` sobre `--g50`. La combinación `--g500` sobre `--g50` del prototipo queda en 4.46 a 1, por debajo de 4.5 a 1. Bodega aplica el mismo ajuste en el pie de las tarjetas, las líneas marcadas, el texto Sin lote y el Detalle de Ruta. La etiqueta RUTA no lleva opacidad. La excepción, por decisión del coordinador, es el cuadro lima del pedido que recoge el cliente, que conserva los colores del prototipo (`specs/20-prototipo-aprobado.md`, 18/10/2026 y 19/10/2026). Con la decisión 89, el coordinador autorizó conservar esos colores accesibles como excepciones de contraste, sin bajar el mínimo de 4.5 a 1 de las pruebas (23/10/2026). La misma autorización cubre el texto de las zonas vacías de Facturación, que en el prototipo queda en 2.61 a 1. Se suman el texto del área de subida de las galerías del panel y las pestañas inactivas de la bandeja de Solicitudes, que usan `--g600` (23/10/2026 y 25/10/2026).

El 02/11/2026 y el 03/11/2026 se aplicaron los cambios que pidió el Ing. Manuel Rojas, que se apartan del prototipo (`specs/05-sitio-web.md`). Los banners de Quiénes somos, Industrias, Productos, Noticias y Contacto tienen la misma altura en cada tamaño de pantalla: 440 px en escritorio, 380 px en tableta, 480 px de 481 a 720 px y 560 px en teléfono. Productos usa la misma barra lateral de solo íconos que Industrias, con «Todas las industrias» primero y un ícono de cuadrícula. El nombre de cada industria aparece en un globo al pasar el cursor. No hay filtro «Industria por confirmar». En el sitio público, si falta un dato, el elemento no se muestra. En el panel, la celda sin dato queda vacía. Se conservan el recuadro vacío de misión y visión sin imagen y la tarjeta de cada valor sin imagen, que muestra solo su número.

Las áreas con nombre en `specs/` son estas. En el sitio público: Inicio, Quiénes somos, Industrias, Productos, el detalle de producto, Noticias, Contacto y Acceso personal. En el panel: contenido institucional, industrias, catálogo, noticias, información de contacto, solicitudes, usuarios y productos documentados. En el picking: Facturación, con el tablero y las dos opciones de envío, Bodega, el tablero en pantalla completa, Ruta, Reportes (Despacho, Rutas realizadas y Bitácora) y Configuración (camiones y usuarios).

El prototipo trae piezas que la aplicación real no usa. El botón Demostración, las cuentas de ejemplo, las notas amarillas de pendientes, la leyenda de prototipo, el estado guardado en el navegador, las imágenes guardadas en el navegador y los botones de Excel y PDF que en la simulación solo avisan. La aplicación real persiste en PostgreSQL, guarda las imágenes en R2 y genera Excel y PDF en el servidor. Desde el 02/11/2026, la aplicación tampoco muestra los avisos de datos pendientes del prototipo, como «pendiente de INCOVSA» o «Por confirmar», ni los códigos internos de los pendientes. El módulo de Inventario, la captura manual, la recuperación por correo, Escuintla en el sitio y los roles fijos ya no están en el prototipo.
