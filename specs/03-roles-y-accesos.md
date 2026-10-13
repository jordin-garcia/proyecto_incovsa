# 03. Roles, permisos y accesos

> **Cambio del 29/09/2026 (reunión 4), detallado el 11/10/2026.** El acceso **ya no se basa en el rol** del usuario sino en **permisos específicos asignados a cada usuario**, por módulo y por acción, que se marcan con casillas. El rol es un texto libre. Los únicos roles predeterminados son **Gerencia** y **Soporte**. Se mantienen dos administraciones de usuarios y dos inicios de sesión.

## Punto de entrada

El sitio web tiene un apartado **"Acceso personal"** con tres botones:

| Botón | Destino | Comportamiento |
|---|---|---|
| Iniciar sesión en Odoo | ERP de la empresa | Abre el enlace de inicio de sesión de Odoo. No hay intercambio de datos. La URL está pendiente (P-06) |
| Iniciar sesión en la página web | Panel administrativo y documentación interna | Autentica contra nuestro sistema y muestra lo que permiten los permisos del sitio del usuario |
| Iniciar sesión en el sistema de picking | Sistema de control logístico | Autentica contra nuestro sistema y muestra lo que permiten los permisos y las sedes del usuario |

Se mantienen **dos inicios de sesión separados** (respuesta del 11/10 a P-59).

## Cuentas

- El inicio de sesión se hace con **nombre de usuario** y contraseña, no con correo.
- El correo electrónico de la cuenta es **opcional**. Los pilotos y operarios no tienen correo.
- Las contraseñas se guardan cifradas con un algoritmo unidireccional.
- **No hay selector de sede** al iniciar sesión.
- Se pueden **eliminar usuarios** (RF-SL-57). Qué pasa con el historial de un usuario eliminado es una [DECISIÓN TÉCNICA] (P-42): hay que conservar la bitácora y los registros donde aparece.
- Cada sistema tiene **sus propias cuentas** (RN-18). Las cuentas de **Gerencia y Soporte** sirven en los dos sistemas, porque esos roles tienen acceso total a ambos.

## Administración de usuarios (RF-SW-13, RF-SL-03)

Cada sistema administra sus propios usuarios (respuesta del 11/10 a P-59):

| Sistema | Dónde se administra | Quién lo hace |
|---|---|---|
| Sitio web | Opción "Usuarios" del panel administrativo | Gerencia y Soporte |
| Picking | Pestaña "Usuarios" del módulo de Configuración | Gerencia y Soporte |

Gerencia y Soporte pueden:

- crear, editar y eliminar usuarios;
- escribir el **rol** del usuario;
- **agregar, editar o revocar** permisos puntuales con casillas;
- en el picking, marcar las **sedes** a las que el usuario tiene acceso;
- **restablecer la contraseña** de un usuario.

## Modelo de permisos (RN-38)

- Cada usuario tiene una lista de **permisos**. Cada permiso indica **a qué módulo** tiene acceso y **qué acción** puede hacer en él (respuesta del 11/10 a P-60).
- Los permisos se marcan con **casillas** en el formulario del usuario.
- El **rol** es un **texto libre** que escriben Gerencia o Soporte (respuesta del 11/10 a P-61). Fuera de Gerencia y Soporte, el rol **no** da accesos: lo que el usuario puede hacer sale de sus permisos.
- **Excepción:** el rol **"Piloto"** identifica a los pilotos del picking (RN-46). Ver "Pilotos" abajo.

### Roles predeterminados

Son los **únicos** roles que vienen definidos en el sistema:

| Rol | Acceso |
|---|---|
| **Gerencia** | Acceso **total y universal** al sistema: picking y administración del sitio, en todas las sedes |
| **Soporte** | El **mismo nivel de acceso global** que Gerencia, para tareas de mantenimiento |

El rol se llama **"Soporte"** (hasta el 24/09 se llamaba "Soporte IT").

Los roles anteriores (Administrativo, Operativo y Vista general en el sitio; Operativo Facturador, Operativo Bodega y Operativo Piloto en el picking) **dejan de ser roles predeterminados**. Lo que cada uno podía hacer se logra ahora asignando permisos.

### Catálogo de permisos

Aprobado el 11/10/2026. Los permisos del sitio se asignan en la administración del sitio y los del picking en Configuración.

| Sistema | Módulo | Permiso | Quién lo tenía hasta el 29/09 |
|---|---|---|---|
| Sitio | Contenido institucional | Editar historia, misión, visión, valores e imágenes | Gerencia, Administrativo |
| Sitio | Industrias | Editar descripción e imagen de cada industria | Gerencia, Administrativo |
| Sitio | Catálogo | Crear, editar y eliminar productos públicos | Gerencia, Administrativo |
| Sitio | Noticias | Crear, editar, publicar y ocultar noticias | Gerencia, Administrativo |
| Sitio | Información de contacto | Editar los datos de las sedes | Gerencia, Administrativo |
| Sitio | Solicitudes | Ver la bandeja de solicitudes | Gerencia (en el prototipo, también Administrativo; nunca se confirmó) |
| Sitio | Solicitudes | Gestionar solicitudes: responsable, comentario y estado | Nuevo (29/09) |
| Sitio | Documentación interna | Ver documentos en el navegador | Todos los roles del sitio |
| Sitio | Documentación interna | Descargar documentos | Gerencia, Administrativo, Operativo |
| Sitio | Documentación interna | Subir, reemplazar y eliminar documentos | Gerencia, Administrativo |
| Picking | Facturación | Cargar el archivo de Odoo y enviar pedidos a bodega | Gerencia, Soporte IT, Facturador |
| Picking | Bodega | Preparar, priorizar y despachar pedidos (incluye el tablero) | Gerencia, Soporte IT, Bodega |
| Picking | Ruta | Ejecutar las rutas asignadas | Piloto |
| Picking | Ruta | Ver todas las rutas | Gerencia, Soporte IT |
| Picking | Reportes | Consultar y exportar reportes, incluida la bitácora | Gerencia, Soporte IT |
| Picking | Configuración | Administrar productos y su Peso de Conversión | Gerencia, Soporte IT |
| Picking | Configuración | Administrar clientes y sectores | Gerencia, Soporte IT |
| Picking | Configuración | Administrar camiones | Gerencia, Soporte IT |

- La administración de usuarios **no** es un permiso asignable: la hacen Gerencia y Soporte.
- El módulo de Inventario ya no existe ([09-picking-inventario.md](09-picking-inventario.md)).

## Sedes (RN-17)

- Al crear o editar un usuario del picking, se marcan **las sedes a las que tiene acceso**, igual que los permisos (respuesta del 11/10 a P-62). Puede tener una, varias o todas.
- Cada usuario ve solo los datos de sus sedes.
- Gerencia y Soporte tienen acceso a todas las sedes.
- Quien tiene más de una sede elige con cuál trabaja con el selector de sede de la barra superior, como en el prototipo.

## Pilotos (RN-46)

- Un piloto es un usuario del picking cuyo rol es **"Piloto"**.
- En Facturación, la lista de pilotos de cada opción de camión muestra los usuarios con rol "Piloto" que tienen acceso a la sede.
- En Ruta, un usuario con rol "Piloto" ve **solo sus rutas asignadas**.

## Recuperación de contraseña (RN-47)

Para recuperar su contraseña, el usuario **la solicita a Gerencia o a Soporte**, que la restablecen desde la administración de usuarios del sistema que corresponda (respuesta del 11/10 a P-63). **No** hay recuperación por correo.

## Sesiones

- **TV y tableta del tablero:** la sesión queda abierta con **cualquier usuario que tenga acceso al módulo de Bodega**.
- Tiempo de expiración de las sesiones: [PENDIENTE] P-07.
- Usuario administrador inicial: [PENDIENTE] P-08.

## Bitácora (RN-39)

El sistema registra en la **bitácora** las acciones de cada usuario, incluidos los inicios de sesión. Se consulta en la pestaña "Bitácora" del módulo de Reportes. El detalle está en [12-reglas-de-negocio.md](12-reglas-de-negocio.md).

## Cantidad de usuarios

Según una nota del prototipo de Configuración que se atribuye a INCOVSA; la fuente original no está archivada (P-41). Las cantidades se refieren a los roles anteriores al 29/09.

| Rol anterior | Cantidad |
|---|---|
| Gerencia | 4 |
| Soporte IT | 1 |
| Operativo Facturador | 4 (2 en Quetzaltenango, 1 en Guatemala, 1 en Escuintla) |
| Operativo Bodega | 4 (mismo reparto) |
| Operativo Piloto | [PENDIENTE] P-02 |
