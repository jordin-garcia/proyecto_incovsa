# 03. Roles, permisos y accesos

> **Cambio del 29/09/2026 (reunión 4), detallado el 11/10/2026.** El acceso **ya no se basa en el rol** del usuario sino en **permisos específicos asignados a cada usuario**, por módulo y por acción, que se marcan con casillas. El rol es un texto libre. Los únicos roles predeterminados son **Gerencia** y **Soporte**. Se mantienen dos administraciones de usuarios y dos inicios de sesión.
>
> **Cambio del 13/10/2026 (reunión 5).** El acceso personal **pide primero el nombre de usuario**, después el sistema y por último la contraseña. Una persona puede tener una cuenta en cada sistema con el **mismo nombre de usuario**. Gerencia y Soporte escriben la **contraseña** al crear un usuario y la restablecen escribiendo una nueva. Al cerrar sesión se vuelve al **inicio del sitio**.

## Acceso personal (RF-SW-09, 13/10)

El sitio web tiene el botón **"Acceso personal"**. El flujo es:

1. **Usuario.** Se pide el **nombre de usuario**.
2. **Validación.** El sistema busca ese nombre de usuario entre las cuentas activas de los **dos sistemas** (administración del sitio y picking).
   - Si **no** es usuario de ninguno, se muestra un mensaje que indica que **no tiene permisos para acceder**, y no se avanza.
   - Si existe, pasa a la pantalla de acceso.
3. **Sistema.** Se le pregunta a qué desea ingresar:

| Opción | Destino | Comportamiento |
|---|---|---|
| Iniciar sesión en Odoo | ERP de la empresa | Abre el enlace de inicio de sesión de Odoo. No hay intercambio de datos. La URL está pendiente (P-06) |
| Administración del sitio | Panel administrativo y documentación interna | Habilitada solo si el usuario tiene cuenta en el sitio (decisión del coordinador del 14/10) |
| Sistema de picking | Sistema de control logístico | Habilitada solo si el usuario tiene cuenta en el picking (decisión del coordinador del 14/10) |

4. **Contraseña.** Al elegir la administración del sitio o el picking, se pide la **contraseña** de la cuenta de ese sistema y se entra con lo que permiten sus permisos (y, en el picking, sus sedes).

- Se mantienen **dos inicios de sesión separados**: la contraseña se valida contra la cuenta del sistema elegido.
- **Cerrar sesión** lleva a la **página de inicio del sitio** (13/10).
- **Pantallas de acceso (15/10):** en los tres pasos, el panel izquierdo muestra el logotipo y **solo el título y su descripción breve, centrados vertical y horizontalmente**. Ya no muestra notas sobre los roles ("Roles de este sistema", "Gerencia y Soporte usan la misma cuenta…").

### Seguridad del paso del usuario (14/10)

El paso 2 revela si un nombre de usuario existe. Lo pidió la contraparte el 13/10 y el coordinador lo aceptó el 14/10, aunque contradice lo que RNF-15 decía hasta entonces. Para limitar el riesgo:

- las consultas del paso del usuario cuentan en el **límite de intentos** por dirección IP (RNF-15);
- la bitácora registra las consultas de nombres de usuario que no existen;
- el mensaje de la contraseña incorrecta sigue sin decir nada más que "usuario o contraseña incorrectos".

## Cuentas

- El inicio de sesión se hace con **nombre de usuario** y contraseña, no con correo.
- El correo electrónico de la cuenta es **opcional**. Los pilotos y operarios no tienen correo.
- Las contraseñas se guardan cifradas con un algoritmo unidireccional.
- **No hay selector de sede** al iniciar sesión.
- Cada sistema tiene **sus propias cuentas** (RN-18). Las cuentas de **Gerencia y Soporte** sirven en los dos sistemas, porque esos roles tienen acceso total a ambos.
- **Mismo nombre de usuario en los dos sistemas (13/10, RN-54):** el nombre de usuario es único **dentro de cada sistema**. Si ya existe "maria.argueta" en la administración del sitio, se puede crear "maria.argueta" en el picking, para que la persona entre a los dos con el mismo usuario. Son dos cuentas: si se quiere la misma contraseña, Gerencia o Soporte la escriben igual en las dos. El nombre de usuario de una cuenta de Gerencia o Soporte no se repite en el otro sistema, porque esa cuenta ya sirve en los dos. La regla se aplica al guardar; las ventanas de nuevo usuario y de editar usuario, en los dos sistemas, **no muestran una nota con ella** debajo del campo "Usuario" (15/10).
- Se pueden **eliminar usuarios** (RF-SL-57). La eliminación es lógica: el usuario ya no puede iniciar sesión, su nombre de usuario queda reservado en su sistema y se conservan la bitácora y los registros donde aparece.

## Administración de usuarios (RF-SW-13, RF-SL-03)

| Sistema | Dónde se administra | Quién lo hace |
|---|---|---|
| Sitio web | Opción "Usuarios" del panel administrativo | Gerencia y Soporte |
| Picking | Pestaña "Usuarios" del módulo de Configuración | Gerencia y Soporte |

Gerencia y Soporte pueden:

- crear, editar y eliminar usuarios;
- **escribir la contraseña** del usuario al crearlo (13/10);
- escribir el **rol** del usuario;
- **agregar, editar o revocar** permisos puntuales con casillas;
- en el picking, marcar las **sedes** a las que el usuario tiene acceso;
- **restablecer la contraseña** de un usuario que lo solicite, escribiendo una nueva (13/10). El restablecimiento es **solo interno**, en la administración de usuarios: no se envía nada por correo.
  - **(29/10, JG-15)** Para restablecer la contraseña de una cuenta de **Gerencia o Soporte**, incluida la propia, el diálogo «Restablecer contraseña» pide además **«Su contraseña»**, con la ayuda «Para restablecer la contraseña de una cuenta de acceso total, confirme la suya.». Si no es correcta, muestra «Su contraseña no es correcta.» y no cambia nada. Ese intento cuenta como fallido en el límite de intentos de quien lo hace (RNF-15) y queda en la bitácora.

**Contraseñas fáciles de adivinar (29/10, JG-15).** Al crear un usuario, al restablecer una contraseña y en `crear-admin`, además del mínimo de 8 caracteres, se rechazan:

- las de una **lista local de contraseñas comunes**: las 10 000 más usadas de la lista pública SecLists (licencia MIT) que tienen 8 o más caracteres. No se consulta ningún servicio externo;
- las que contienen una **palabra de la empresa**: incovsa, covadonga, inquiserca, quetzaltenango, guatemala o escuintla;
- las que contienen el **nombre de usuario** de la cuenta.

Se comparan sin distinguir mayúsculas ni acentos. El mensaje, bajo el campo de la contraseña, es «Esa contraseña es muy fácil de adivinar. Elija otra.».

## Modelo de permisos (RN-38)

- Cada usuario tiene una lista de **permisos**. Cada permiso indica **a qué módulo** tiene acceso y **qué acción** puede hacer en él.
- Los permisos se marcan con **casillas** en el formulario del usuario.
- El **rol** es un **texto libre** que escriben Gerencia o Soporte. Fuera de Gerencia y Soporte, el rol **no** da accesos.
- **Excepción:** el rol **"Piloto"** identifica a los pilotos del picking (RN-46).

### Roles predeterminados

| Rol | Acceso |
|---|---|
| **Gerencia** | Acceso **total y universal**: picking y administración del sitio, en todas las sedes |
| **Soporte** | El **mismo nivel de acceso global** que Gerencia, para tareas de mantenimiento |

Los roles anteriores (Administrativo, Operativo y Vista general en el sitio; Operativo Facturador, Operativo Bodega y Operativo Piloto en el picking) **dejan de ser roles predeterminados**.

### Catálogo de permisos

Aprobado el 11/10/2026 y ajustado el 14/10/2026. Los permisos del sitio se asignan en la administración del sitio y los del picking en Configuración.

| Sistema | Módulo | Permiso |
|---|---|---|
| Sitio | Contenido institucional | Editar portada, logotipos, historia, misión, visión, valores e imágenes |
| Sitio | Industrias | Editar descripción e imágenes de cada industria |
| Sitio | Catálogo | Crear, editar y eliminar productos públicos |
| Sitio | Noticias | Crear, editar y eliminar noticias (antes "Crear, editar, publicar y ocultar noticias", 15/10) |
| Sitio | Información de contacto | Editar los datos de las sedes |
| Sitio | Solicitudes | Ver la bandeja de solicitudes |
| Sitio | Solicitudes | Gestionar solicitudes: responsable, comentario y estado |
| Sitio | Documentación interna | Ver documentos en el navegador |
| Sitio | Documentación interna | Descargar documentos |
| Sitio | Documentación interna | Crear, editar y eliminar productos documentados (antes "Subir, reemplazar y eliminar documentos", 13/10) |
| Picking | Facturación | Cargar el archivo de Odoo y enviar rutas y pedidos a bodega |
| Picking | Bodega | Preparar, priorizar y despachar rutas y pedidos (incluye el tablero) |
| Picking | Ruta | Ejecutar las rutas asignadas |
| Picking | Ruta | Ver todas las rutas |
| Picking | Reportes | Consultar y exportar reportes, incluida la bitácora |
| Picking | Configuración | Administrar camiones |

- Se eliminaron el 14/10 los permisos "Administrar productos y su Peso de Conversión" y "Administrar clientes y sectores", porque el picking ya no tiene esos catálogos ([11-picking-configuracion.md](11-picking-configuracion.md)).
- La administración de usuarios **no** es un permiso asignable: la hacen Gerencia y Soporte.

## Sedes (RN-17)

- Al crear o editar un usuario del picking, se marcan **las sedes a las que tiene acceso**. Puede tener una, varias o todas.
- Cada usuario ve solo los datos de sus sedes.
- Gerencia y Soporte tienen acceso a todas las sedes.
- Quien tiene más de una sede elige con cuál trabaja con el selector de sede de la barra superior.

## Pilotos (RN-46)

- Un piloto es un usuario del picking cuyo rol es **"Piloto"**.
- En Facturación, la lista de pilotos de la opción "Envío por camión" muestra los usuarios con rol "Piloto" que tienen acceso a la sede.
- En Ruta, un usuario con rol "Piloto" ve **solo sus rutas asignadas**.

## Recuperación de contraseña (RN-47)

Para recuperar su contraseña, el usuario **la solicita a Gerencia o a Soporte**, que escriben una nueva desde la administración de usuarios del sistema que corresponda. **No** hay recuperación por correo.

## Sesiones

- **TV y tableta del tablero:** la sesión queda abierta con **cualquier usuario que tenga acceso al módulo de Bodega**.
- **Una sesión por sistema (16/10):** como en el prototipo, cada sistema tiene **su propia sesión**. Una persona puede estar conectada a la administración del sitio y al picking al mismo tiempo en el mismo navegador, y cerrar la sesión de uno no cierra la del otro. Las cuentas de Gerencia y Soporte inician sesión aparte en cada sistema.
- **Expiración (16/10):** la sesión vence después de un tiempo sin uso y se renueva mientras se usa. Mientras INCOVSA no defina el tiempo (P-07), son **7 días**, renovados con el uso una vez al día. Con eso la TV y la tableta del tablero no se desconectan. El tiempo se configura en el servidor, sin cambiar el código.
- **Cierre forzado (16/10):** al eliminar o desactivar un usuario, o al restablecer su contraseña, se cierran **al instante todas sus sesiones abiertas**.
- Usuario administrador inicial: quién es está [PENDIENTE] P-08. **Cómo se crea (16/10):** con un comando de la aplicación (`crear-admin`) que pide en la terminal el nombre de usuario y la contraseña. Ninguna credencial queda en el repositorio ni en la semilla.

## Bitácora (RN-39)

El sistema registra en la **bitácora** las acciones de cada usuario, incluidos los inicios de sesión. Se consulta en la pestaña "Bitácora" del módulo de Reportes. El detalle está en [12-reglas-de-negocio.md](12-reglas-de-negocio.md).

## Cantidad de usuarios

No hay un número fijo: se pueden crear todos los usuarios que se necesiten (12/10). Los nombres de los pilotos siguen pendientes (P-02).
