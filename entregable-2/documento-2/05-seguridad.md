# Autenticación

La autenticación usa **Better Auth 1.7**, con inicio de sesión por **nombre de usuario** y contraseña (RF-SL-01, CU-11). No se programa un sistema de autenticación propio.

## Cuentas y sistemas

- Hay **dos inicios de sesión** separados, uno para la administración del sitio y otro para el sistema de picking, a los que se llega desde el apartado «Acceso personal» del sitio.
- Cada sistema tiene **sus propias cuentas** (RN-18). Las cuentas con rol Gerencia o Soporte sirven en los dos sistemas, porque tienen acceso total.
- El correo electrónico de la cuenta es opcional: los pilotos y los operarios no tienen correo.
- No hay selector de sede al iniciar sesión (RF-SL-02). Quien tiene acceso a más de una sede la elige después en la barra superior.

## Contraseñas

- Se guardan con **scrypt**, el algoritmo de Better Auth: un cifrado unidireccional que no permite recuperar la contraseña original (RNF-03). Nunca se guardan en texto plano.
- **No hay recuperación por correo.** El usuario solicita el cambio a Gerencia o a Soporte, que restablecen su contraseña desde la administración de usuarios de su sistema (RN-47, RF-SW-11, RF-SL-48).

## Sesiones

- Las sesiones se guardan en la base de datos. El navegador solo guarda una cookie con el identificador de la sesión, marcada como `HttpOnly`, `Secure` y `SameSite=Lax`, para que no la puedan leer otros scripts ni otros sitios.
- Cada inicio de sesión crea una sesión nueva.
- El tiempo de expiración de las sesiones lo define INCOVSA. La TV y la tableta del tablero de Bodega mantienen la sesión abierta con un usuario que tenga acceso al módulo de Bodega.
- Un usuario eliminado ya no puede iniciar sesión (eliminación lógica, RF-SL-57).

## Límite de intentos (RNF-15)

Tabla: Límite de intentos de inicio de sesión {#tab:intentos}

| Regla | Valor |
|---|---|
| Intentos fallidos seguidos de un mismo usuario | 5; después, el usuario queda bloqueado 15 minutos |
| Intentos fallidos desde una misma dirección IP | 20 en 15 minutos; después, la dirección queda bloqueada 15 minutos |
| Reinicio del conteo del usuario | Al iniciar sesión correctamente |

- Los intentos se cuentan en la base de datos, a partir de la bitácora, para que no se pierdan si se reinicia el servidor.
- El mensaje de error no dice si el usuario existe o si la contraseña es la incorrecta.
- La bitácora registra los inicios de sesión, los intentos fallidos y los bloqueos (RN-39). Como en un intento fallido el usuario puede no existir, se guarda el nombre de usuario que se escribió.

# Roles y permisos

El acceso **no se basa en el rol** del usuario sino en **permisos asignados a cada usuario**, por módulo y por acción, que Gerencia o Soporte marcan con casillas (RN-38, RF-SL-55, RF-SW-25).

## Roles

- El rol es un **texto libre** que escriben Gerencia o Soporte. Fuera de las excepciones de abajo, el rol no da ningún acceso.
- **Gerencia** y **Soporte** son los únicos roles predeterminados y tienen **acceso total** a los dos sistemas y a todas las sedes. La función `exigirPermiso` les concede todo por su rol, sin depender de sus casillas, así que los módulos y sedes nuevos les quedan incluidos solos.
- El rol **«Piloto»** identifica a los pilotos del picking: son los que se asignan a un camión en Facturación y los que ven solo sus rutas asignadas en Ruta (RN-46).
- Los roles se comparan sin distinguir mayúsculas, acentos ni espacios al inicio o al final, para que «piloto » y «Piloto» sean el mismo rol.

## Catálogo de permisos

Tabla: Catálogo de permisos {#tab:permisos}

| Sistema | Módulo | Permiso |
|---|---|---|
| Sitio | Contenido institucional | Editar historia, misión, visión, valores e imágenes |
| Sitio | Industrias | Editar la descripción y la imagen de cada industria |
| Sitio | Catálogo | Crear, editar y eliminar productos públicos |
| Sitio | Noticias | Crear, editar, publicar y ocultar noticias |
| Sitio | Información de contacto | Editar los datos de las sedes |
| Sitio | Solicitudes | Ver la bandeja de solicitudes |
| Sitio | Solicitudes | Gestionar solicitudes: responsable, comentario y estado |
| Sitio | Documentación interna | Ver documentos en el navegador |
| Sitio | Documentación interna | Descargar documentos |
| Sitio | Documentación interna | Subir, reemplazar y eliminar documentos |
| Picking | Facturación | Cargar el archivo de Odoo y enviar pedidos a bodega |
| Picking | Bodega | Preparar, priorizar y despachar pedidos, incluido el tablero |
| Picking | Ruta | Ejecutar las rutas asignadas |
| Picking | Ruta | Ver todas las rutas |
| Picking | Reportes | Consultar y exportar reportes, incluida la bitácora |
| Picking | Configuración | Administrar productos y su Peso de Conversión |
| Picking | Configuración | Administrar clientes y sectores |
| Picking | Configuración | Administrar camiones |

La administración de usuarios no es un permiso asignable: la hacen Gerencia y Soporte, en el panel del sitio y en Configuración del picking.

## Sedes (RN-17)

A cada usuario del picking se le marcan las sedes a las que tiene acceso: una, varias o todas (RF-SL-66). Solo ve y modifica los datos de esas sedes. Gerencia y Soporte tienen acceso a todas.

## Verificación en el servidor

- **Toda operación del servidor** (acciones del servidor, rutas de la API, carga del archivo de Odoo, descarga de PDF y exportación de reportes) llama a `exigirPermiso(usuario, permiso, sede)` antes de leer o cambiar datos. La función vive en el módulo `permisos` y la usan todas las operaciones, para que el control no se duplique ni se olvide.
- El servidor **nunca confía** en lo que manda el navegador sobre el usuario: el usuario, su rol, sus permisos y sus sedes salen de la sesión y de la base de datos.
- `proxy.ts` solo redirige a quien no tiene sesión. Ocultar un botón en la pantalla mejora la experiencia, pero no es un control de acceso.
- Las pruebas automatizadas de la verificación de permisos y sedes son obligatorias.
