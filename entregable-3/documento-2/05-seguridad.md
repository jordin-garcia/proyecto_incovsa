# Autenticación

Better Auth administra las credenciales y sesiones con dos configuraciones sobre las mismas tablas: una para sitio y otra para picking. El ingreso acepta nombre de usuario y contraseña; no hay autorregistro ni recuperación por correo. Los archivos principales son `src/lib/auth-configuracion.ts`, `src/app/acceso/servicio.ts` y `src/app/api/auth/[sistema]/[...ruta]/route.ts`.

## Acceso personal y vías de autenticación

El acceso personal tiene tres pasos: usuario, sistema y contraseña (RF-SW-09). La consulta explícita del usuario devuelve los sistemas donde tiene cuenta activa; Odoo es solo un enlace. La contraparte pidió revelar si el nombre existe. Cada nombre inexistente consultado explícitamente cuenta en el límite por IP y queda en Bitácora. Abrir o recargar las páginas GET de acceso usa consultarSistemasSoloLectura y no registra un intento fallido.

La acción ingresar y la vía HTTP POST /api/auth/{sistema}/sign-in/username pasan por iniciarSesion. La ruta controlada solo expone las operaciones admitidas de inicio, consulta de sesión y salida; no publica el handler completo de Better Auth ni sus vías de registro, cambio de contraseña o recuperación. Los parámetros, el origen y los límites se comprueban en el servidor. Las consultas get-session y la salida sign-out conservan el sistema correspondiente.

El nombre visible displayUsername es único junto con sistema. Better Auth recibe username como sistema.nombre y un correo interno derivado en incovsa.invalid; el correo real es opcional y separado. Gerencia y Soporte son un registro con sistema ambos; no se permite que su nombre colisione con otra cuenta del sitio o del picking (RN-54). Los usuarios eliminados conservan el nombre reservado.

## Contraseñas y sesiones

`src/lib/contrasenas.ts` centraliza el hash scrypt con N=2^14, r=8 y p=5, sal aleatoria de 16 bytes y parámetros dentro del hash. Lo usan Better Auth, administración, crear-admin y semillas. La verificación conserva compatibilidad con hashes anteriores. No se guarda la contraseña en claro ni se devuelve el hash al navegador.

Gerencia o Soporte escriben la contraseña inicial y la restablecida, dos veces; el mínimo implementado es ocho caracteres. No hay cambio propio por el usuario (RN-47). Desactivar, eliminar o restablecer una cuenta revoca todas sus sesiones. La función reautenticar de JG-26 ya existe con el bloqueo y límites de ingreso, pero al corte CE-14 aún debe conectarla al restablecimiento de cuentas de acceso total y agregar el rechazo de contraseñas comunes. Esta versión no atribuye esos controles al código actual.

Las sesiones se guardan en la tabla sesion, no en un token autónomo del navegador. obtenerSesion vuelve a leer la cuenta, activo, eliminación, permisos y sedes. No hay caché de permisos en la cookie. Cada sistema tiene su cookie; abrir o cerrar uno no cierra el otro. Volver a ingresar invalida la sesión anterior de ese sistema en ese navegador; no existe un máximo global de sesiones por cuenta.

La duración es SESION_DIAS, siete días por omisión, con renovación una vez al día mientras se usa (P-07). No hay límite absoluto separado. En producción las cookies propias llevan prefijo __Host-, Secure, HttpOnly, SameSite=Lax, path=/ y sin Domain; por HTTP local se omite __Host- y Secure. Las funciones de `src/lib/cookies.ts` generan nombres y atributos. La cookie incovsa-sede también tiene path=/ para que la exportación use la sede visible.

Al cerrar sesión se invalida el registro, se responde Clear-Site-Data para caché y se recarga la página. Atrás vuelve a consultar una página autenticada restaurada. Una respuesta de una sesión antigua inválida no borra la cookie de una sesión más reciente.

## Límites de ingreso

Tabla: Límites persistentes de autenticación {#tab:intentos}

| Origen de fallos | Límite | Efecto |
|---|---|---|
| Nombre de usuario | Cinco fallos seguidos | Bloqueo de 15 minutos aunque se escriba luego la contraseña correcta |
| Dirección IP | Veinte fallos en 15 minutos, incluidas consultas de usuarios inexistentes | Bloqueo de 15 minutos |
| Ingreso correcto | Cuenta de ese usuario | Reinicia su conteo; una reautenticación correcta no lo reinicia |

Los conteos y bloqueos se obtienen de Bitácora bajo bloqueo transaccional y sobreviven al reinicio del proceso. En producción solo se confía en X-Real-IP, que Caddy sobrescribe. La política puede permitir el bloqueo malicioso de una cuenta conocida; su justificación y controles compensatorios quedan en JG-27. No se afirma que exista MFA o una defensa adicional no implementada.

# Roles y permisos

Los permisos se asignan por usuario y acción (RN-38); el rol es texto libre. Gerencia y Soporte son las excepciones con acceso total a ambos sistemas y todas las sedes. Piloto identifica a quien puede ser asignado a una ruta y limita la consulta a sus rutas aunque tenga la casilla de ver todas. Los roles se normalizan sin mayúsculas, tildes ni espacios exteriores.

Tabla: Catálogo de permisos {#tab:permisos}

| Sistema | Módulo | Código | Permiso |
|---|---|---|---|
| Sitio | Contenido institucional | `sit.contenido` | Editar portada, logotipos, historia, misión, visión, valores e imágenes |
| Sitio | Industrias | `sit.industrias` | Editar descripción e imágenes de cada industria |
| Sitio | Catálogo | `sit.catalogo` | Crear, editar y eliminar productos públicos |
| Sitio | Noticias | `sit.noticias` | Crear, editar y eliminar noticias |
| Sitio | Información de contacto | `sit.contacto` | Editar los datos de las sedes |
| Sitio | Solicitudes | `sit.sol.ver` | Ver la bandeja de solicitudes |
| Sitio | Solicitudes | `sit.sol.gestionar` | Gestionar solicitudes: responsable, comentario y estado |
| Sitio | Documentación interna | `sit.doc.ver` | Ver documentos en el navegador |
| Sitio | Documentación interna | `sit.doc.descargar` | Descargar documentos |
| Sitio | Documentación interna | `sit.doc.gestionar` | Crear, editar y eliminar productos documentados |
| Picking | Facturación | `pk.facturacion` | Cargar el archivo de Odoo y enviar rutas y pedidos a bodega |
| Picking | Bodega | `pk.bodega` | Preparar, priorizar y despachar rutas y pedidos, incluido el tablero |
| Picking | Ruta | `pk.ruta.propias` | Ejecutar las rutas asignadas |
| Picking | Ruta | `pk.ruta.todas` | Ver todas las rutas |
| Picking | Reportes | `pk.reportes` | Consultar y exportar reportes, incluida la bitácora |
| Picking | Configuración | `pk.cfg.camiones` | Administrar camiones |


La administración de usuarios es exclusiva de Gerencia y Soporte; no se concede mediante una casilla. Sus acciones usan exigirAccesoTotal con sesión del sistema correspondiente. Cada usuario del picking tiene una o varias sedes; Gerencia y Soporte reciben todas. El sitio y su documentación no se restringen por las sedes del picking.

## Autorización de operaciones internas

La sesión se obtiene en el servidor, con obtenerSesion. exigirPermiso comprueba sistema, permiso y, cuando corresponde, sede antes de consultar o mutar información interna. Los servicios internos que reciben un contexto previamente validado deben ser llamados por esa barrera. Las consultas seleccionan columnas y filtran por sede; no se toman el rol ni el usuario de los parámetros del navegador. Ocultar controles y redirigir con proxy.ts solo complementa el control.

Las lecturas públicas del sitio, países y oficinas no exigen cuenta. La recepción pública de Contacto es la única acción de servidor pública: `src/modulos/solicitudes/recepcion-publica.ts` exporta solo enviarSolicitud. Valida Zod y la coherencia de país, territorio y sede; únicamente crea y devuelve el folio. Limita a cinco solicitudes por IP en 60 minutos y usa campo trampa; la comprobación se repite dentro de la transacción. La bandeja interna mantiene sus permisos de lectura y gestión.

Las imágenes de disco son públicas solo en desarrollo y CI y responden 404 en producción. La ruta HTTP de autenticación conserva su lista cerrada de operaciones y sus controles propios. La excepción de Usuarios exige exigirAccesoTotal. Las reglas de Semgrep limitan esas excepciones por ruta; no autorizan omitir controles en otros módulos.

## Entradas transporte y protección de información

Zod valida parámetros, formularios, consultas, archivos y conjuntos de identificadores. Las consultas usan Prisma o SQL parametrizado; no concatenan entradas. Los textos de Odoo y del panel se renderizan escapados. Las imágenes pasan por detección de contenido, límite y recodificación WebP. El PDF de Reportes bloquea recursos remotos y permite solo las fuentes locales aprobadas. El enlace de Drive se valida por origen HTTPS exacto y se reconstruye desde el identificador.

La CSP de `src/lib/cabeceras.ts` genera un nonce criptográfico de 128 bits por respuesta. No permite scripts inline sin nonce ni unsafe-eval en producción; limita imágenes a URL_IMAGENES, y los marcos a Google Maps y Drive. object-src y base-uri son none, y frame-ancestors es none. Los estilos inline siguen permitidos por las interacciones y el posicionamiento del diseño. Next envía HSTS en producción, nosniff, Referrer-Policy, Permissions-Policy y Cross-Origin-Opener-Policy, y no envía X-Powered-By. No se envía COEP porque impediría los marcos externos requeridos.

Las acciones de Next comprueban origen; las rutas de publicación usan esMismoOrigen con BETTER_AUTH_URL como origen canónico. Caddy permite 27 MB, Next 3 MB en acciones, Odoo 2 MB comprimidos y 50 MB descomprimidos reales. El almacenamiento acepta JPG, PNG y WebP hasta 5 MB por imagen; la publicación permite hasta cinco y limita el multipart. Estos topes reducen consumo, pero no hay un límite global de cargas, exportaciones o conexiones SSE concurrentes por usuario.

## Auditoría y errores de seguridad

Bitácora guarda las operaciones de RN-39 en la misma transacción que el cambio: usuario, sistema, operación, entidad, detalle e instante. Los intentos sin cuenta pueden guardar usuarioEscrito e IP sin relación a usuario. No registra quién marcó, prioridad ni orden temporal de filas. Un disparador rechaza UPDATE, DELETE y TRUNCATE; el rol de conexión diseñado conserva privilegios que un administrador podría usar para desactivar ese disparador. La aceptación de ese riesgo corresponde a JG-27.

`src/lib/registro.ts` produce líneas JSON en el servidor para rechazos de autorización, entrada u origen, cookie de sede ajena y errores inesperados. Registra fecha, evento, sistema, identificador de usuario, operación y tipo/código/ubicación del error; excluye entradas, contraseñas, secretos, datos personales y el mensaje técnico. Docker limita la salida a cinco archivos de 10 MB. La Bitácora no tiene depuración automática ni retención definida para IP y datos personales; el procedimiento de clasificación y retención sigue en JG-27.

## Estado de la revisión de seguridad

La revisión JG-15 del 29/10 evaluó 253 requisitos ASVS 5.0 de niveles 1 y 2: en su corte histórico, 112 cumplían, 86 no aplicaban y 55 no cumplían. No es una certificación ASVS completa. `plan/seguridad/asvs-nivel-2.md` conserva cada requisito y su evidencia, incluyendo las correcciones posteriores de JG-26, JC-10, JM-10 y DM-14. El detalle y las mediciones están en el Documento 6.

ZAP no detectó alertas altas en el escaneo de JG-15. El informe y la repetición posterior a JG-26 están en `plan/seguridad/zap-2026-10-29.md`. Un escaneo básico no sustituye las pruebas de permisos y sedes ni valida producción. Persisten CE-14 (reautenticación integrada, contraseñas comunes, mensajes de Zod de Usuarios/Camiones, charset y TRACE) y JG-27 (documentación y riesgos aceptados). La excepción de minimatch vence el 15/11/2026.

Los documentos FT, HS y COA se protegen en la aplicación por permisos, pero un enlace conocido depende de cómo INCOVSA configure la compartición en Google Drive (P-92). No hay proxy de descarga de documentos ni credenciales Google en la aplicación. Los secretos reales solo están en el VPS y GitHub; la recuperación de esas configuraciones se entrega por el medio seguro del Anexo J.
