# Autenticación

La autenticación usa **Better Auth 1.7**, con inicio de sesión por **nombre de usuario** y contraseña (RF-SL-01, CU-11) mediante su plugin `username`. No se programa un sistema de autenticación propio.

## Acceso personal

El botón «Acceso personal» del sitio sigue tres pasos (RF-SW-09, pedido por INCOVSA el 13/10/2026):

1. **Usuario.** La persona escribe su nombre de usuario. Una acción del servidor busca ese nombre entre las cuentas activas de los dos sistemas. Si no es usuario de ninguno, se muestra que no tiene permisos para acceder y no se avanza.
2. **Sistema.** Se le muestran Odoo (solo un enlace), la administración del sitio y el sistema de picking. Solo se habilitan los sistemas donde la persona tiene cuenta.
3. **Contraseña.** Al elegir el sitio o el picking, escribe la contraseña de la cuenta de ese sistema y entra con lo que permiten sus permisos y, en el picking, sus sedes.

Al **cerrar sesión**, la persona vuelve a la página de inicio del sitio (RF-SW-30).

El paso 1 revela si un nombre de usuario existe; lo pidió la contraparte y el coordinador lo aceptó el 14/10/2026. Para limitar el riesgo, cada consulta de un nombre que no existe cuenta en el límite de intentos por dirección IP y queda en la bitácora, y el mensaje de la contraseña incorrecta solo dice «Usuario o contraseña incorrectos».

## Cuentas y sistemas

- Hay **dos inicios de sesión**, uno por sistema. Cada sistema tiene **sus propias cuentas** (RN-18). Las cuentas con rol Gerencia o Soporte sirven en los dos sistemas, porque tienen acceso total.
- Una persona puede tener una cuenta en cada sistema con el **mismo nombre de usuario** (RN-54). El nombre de usuario es único dentro de cada sistema.
- Better Auth exige que su nombre de usuario y su correo sean únicos en toda la tabla de usuarios. Por eso cada cuenta guarda (decisión técnica 26):
  - el nombre de usuario que escribe la persona (`display_username`), único junto con el sistema;
  - una **clave de acceso interna** única, formada por el sistema y el nombre de usuario (por ejemplo, `picking.maria.argueta`), que es la que recibe Better Auth;
  - un correo interno único derivado de esa clave, que nunca se muestra ni se usa para enviar correos. El correo real de la persona, opcional, se guarda aparte.
- El correo electrónico de la cuenta es opcional: los pilotos y los operarios no tienen correo.
- No hay selector de sede al iniciar sesión (RF-SL-02). Quien tiene acceso a más de una sede la elige después en la barra superior.

## Contraseñas

- Se guardan con **scrypt**, el algoritmo de Better Auth: un cifrado unidireccional que no permite recuperar la contraseña original (RNF-03). Nunca se guardan en texto plano.
- Gerencia o Soporte **escriben la contraseña al crear** un usuario, dos veces para confirmarla, con un mínimo de 8 caracteres.
- **No hay recuperación por correo.** El usuario solicita el cambio a Gerencia o a Soporte, que escriben una contraseña nueva desde la administración de usuarios de su sistema (RN-47, RF-SW-11, RF-SL-48).

## Sesiones

- Las sesiones se guardan en la base de datos (tabla `sesion`). El navegador solo guarda una cookie con el identificador de la sesión, marcada como `HttpOnly`, `Secure` y `SameSite=Lax`, para que no la puedan leer otros scripts ni otros sitios.
- Cada inicio de sesión crea una sesión nueva.
- El tiempo de expiración de las sesiones lo define INCOVSA (P-07). La TV y la tableta del tablero de Bodega mantienen la sesión abierta con un usuario que tenga acceso al módulo de Bodega.
- Un usuario eliminado ya no puede iniciar sesión (eliminación lógica, RF-SL-57).

## Límite de intentos (RNF-15)

Tabla: Límite de intentos de inicio de sesión {#tab:intentos}

| Regla | Valor |
|---|---|
| Intentos fallidos seguidos de un mismo usuario | 5; después, el usuario queda bloqueado 15 minutos |
| Intentos fallidos desde una misma dirección IP, incluidas las consultas de nombres de usuario que no existen | 20 en 15 minutos; después, la dirección queda bloqueada 15 minutos |
| Reinicio del conteo del usuario | Al iniciar sesión correctamente |

- Los intentos se cuentan en la base de datos, a partir de la bitácora, para que no se pierdan si se reinicia el servidor.
- La bitácora registra los inicios de sesión, los intentos fallidos y los bloqueos (RN-39). Como en un intento fallido el usuario puede no existir, se guarda el nombre de usuario que se escribió.

# Roles y permisos

El acceso **no se basa en el rol** del usuario sino en **permisos asignados a cada usuario**, por módulo y por acción, que Gerencia o Soporte marcan con casillas (RN-38, RF-SL-55, RF-SW-25).

## Roles

- El rol es un **texto libre** que escriben Gerencia o Soporte. Fuera de las excepciones de abajo, el rol no da ningún acceso.
- **Gerencia** y **Soporte** son los únicos roles predeterminados y tienen **acceso total** a los dos sistemas y a todas las sedes. La función `exigirPermiso` les concede todo por su rol, sin depender de sus casillas, así que los módulos y sedes nuevos les quedan incluidos solos.
- El rol **«Piloto»** identifica a los pilotos del picking: son los que se eligen en la opción «Envío por camión» de Facturación y los que ven solo sus rutas en Ruta (RN-46).
- Los roles se comparan sin distinguir mayúsculas, acentos ni espacios al inicio o al final, para que «piloto » y «Piloto» sean el mismo rol.

## Catálogo de permisos

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

La administración de usuarios no es un permiso asignable: la hacen Gerencia y Soporte, en el panel del sitio y en Configuración del picking. Desde el 14/10/2026 ya no existen los permisos de productos y de clientes y sectores, porque el picking ya no tiene esos catálogos.

## Sedes (RN-17)

A cada usuario del picking se le marcan las sedes a las que tiene acceso: una, varias o todas (RF-SL-66). Solo ve y modifica los datos de esas sedes. Gerencia y Soporte tienen acceso a todas.

## Verificación en el servidor

- **Toda operación del servidor** (acciones del servidor, rutas de la API, carga del archivo de Odoo, consulta de los enlaces de la documentación interna y exportación de reportes) llama a `exigirPermiso(usuario, permiso, sede)` antes de leer o cambiar datos. La función vive en el módulo `permisos` y la usan todas las operaciones, para que el control no se duplique ni se olvide.
- El servidor **nunca confía** en lo que manda el navegador sobre el usuario: el usuario, su rol, sus permisos y sus sedes salen de la sesión y de la base de datos.
- `proxy.ts` solo redirige a quien no tiene sesión. Ocultar un botón en la pantalla mejora la experiencia, pero no es un control de acceso.
- Las pruebas automatizadas de la verificación de permisos y sedes son obligatorias.

## Protección de la información

Tabla: Protección de la información {#tab:proteccion}

| Información | Medida |
|---|---|
| Información interna, pedidos y rutas | Solo la ven los usuarios con el permiso del módulo y de la sede. Cada consulta se verifica en el servidor |
| Documentación técnica, hojas de seguridad y certificados | El sistema guarda los enlaces de Google Drive y los muestra solo a quien tiene permiso de ver; el botón de descarga, solo a quien tiene permiso de descargar. Que nadie fuera de la empresa abra un enlace, y que quien solo puede ver no descargue desde Drive, depende de cómo comparta INCOVSA cada archivo en Google Drive (P-92) |
| Sesiones | Cookies `HttpOnly`, `Secure` y `SameSite=Lax`; sesiones guardadas en el servidor |
| Archivos | El .xlsx de Odoo se lee en el servidor y no se guarda. Las imágenes se validan por su contenido y se guardan en Cloudflare R2 con un nombre que genera el servidor |
| Inventario | El sistema no guarda inventario (RN-40) |
