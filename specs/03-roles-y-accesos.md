# 03. Roles y accesos

## Punto de entrada

El sitio web tiene un apartado **"Acceso personal"** con tres botones:

| Botón | Destino | Comportamiento |
|---|---|---|
| Iniciar sesión en Odoo | ERP de la empresa | Abre el enlace de inicio de sesión de Odoo. No hay intercambio de datos. La URL está pendiente (P-06) |
| Iniciar sesión en la página web | Panel administrativo y documentación interna | Autentica contra nuestro sistema y muestra lo que permite el rol del sitio |
| Iniciar sesión en el sistema de picking | Sistema de control logístico | Autentica contra nuestro sistema y muestra lo que permiten el rol y la sede |

## Cuentas

- El inicio de sesión se hace con **nombre de usuario** y contraseña, no con correo.
- **Una cuenta tiene un solo rol por sistema.**
- **Solo el rol Gerencia usa la misma cuenta en los dos sistemas.** Cualquier otra persona que necesite entrar al sitio y al picking tiene dos cuentas separadas.
- Una cuenta de Gerencia se puede crear y editar **desde cualquiera de las dos administraciones de usuarios**, y queda habilitada en ambos sistemas.
- **No hay selector de sede** al iniciar sesión. La sede sale de la cuenta del usuario.
- El correo electrónico de la cuenta es **opcional**. Los pilotos y operarios no tienen correo.
- Las contraseñas se guardan cifradas con un algoritmo unidireccional.

## Roles del sitio web

| Rol | Quién lo usa | Qué hace |
|---|---|---|
| **Gerencia** | Gerencia | Todos los accesos. Es el **único** rol que administra los usuarios del sitio |
| **Administrativo** | Personal administrativo | Sube y cambia documentos internos. Administra el contenido del sitio |
| **Operativo** | Jefe de bodega y jefes de área | Ve y descarga documentos internos |
| **Vista general** | Ventas y facturación | **Solo visualiza** los PDF en el navegador |

El acceso a los documentos **depende del rol, no del documento**: un documento no tiene una lista propia de roles permitidos.

### Permisos del sitio

| Acción | Gerencia | Administrativo | Operativo | Vista general |
|---|---|---|---|---|
| Administrar contenido del sitio (institucional, imágenes, industrias, catálogo, noticias, contacto) | Sí | Sí | No | No |
| Subir, reemplazar y eliminar documentos internos | Sí | Sí | No | No |
| Ver documentos internos en el navegador | Sí | Sí | Sí | Sí |
| Descargar documentos internos | Sí | Sí | Sí | No |
| Consultar la bandeja de solicitudes de contacto | Sí | [PENDIENTE] P-13 | No | No |
| Administrar usuarios del sitio | Sí | No | No | No |

## Roles del sistema de picking

| Rol | Alcance |
|---|---|
| **Gerencia** | Acceso a todo, en todas las sedes |
| **Soporte IT** | Configuración, ajustes y cambios en todas las sedes. También opera Facturación, Bodega y Ruta |
| **Operativo Facturador** | Módulo de Facturación de su sede |
| **Operativo Bodega** | Módulo de Bodega de su sede |
| **Operativo Piloto** | Módulo de Ruta, solo con las rutas que tiene asignadas |

### Permisos por módulo del picking

| Módulo | Gerencia | Soporte IT | Facturador | Bodega | Piloto |
|---|---|---|---|---|---|
| Facturación | Sí, todas las sedes | Sí, todas las sedes | Sí, su sede | No | No |
| Bodega | Sí, todas las sedes | Sí, todas las sedes | No | Sí, su sede | No |
| Ruta | Sí, todas las rutas | Sí, todas las rutas | No | No | Sí, solo sus rutas |
| Inventario | Sí | Sí | No | No | No |
| Reportes | Sí | Sí | No | No | No |
| Configuración | Sí | Sí | No | No | No |

> El acceso de Gerencia y Soporte IT a Reportes viene del Documento 1 (CU-14). Se confirma cuando se especifique ese módulo (P-05).

## Reglas de sede

- Los roles operativos (Facturador, Bodega, Piloto) solo ven la información de la sede de su cuenta.
- Gerencia y Soporte IT ven todas las sedes y son quienes asignan la sede de cada usuario del picking.
- En el formulario de un usuario, "Todas las sedes" solo se permite para Gerencia y Soporte IT.

## Administración de usuarios

Cada sistema tiene su propia administración de usuarios:

| Sistema | Dónde se administra | Quién lo hace |
|---|---|---|
| Sitio web | Opción "Usuarios" del panel administrativo. **Solo aparece para Gerencia** | Gerencia |
| Picking | Módulo de Configuración | Gerencia y Soporte IT, que pueden crear usuarios de cualquier rol del picking, sin límite de cantidad |

## Recuperación de contraseña

| Usuario | Cómo recupera su contraseña |
|---|---|
| Usuario del sitio **con** correo registrado | Por correo electrónico, con un enlace de restablecimiento |
| Usuario del sitio **sin** correo | La restablece **Gerencia** desde el panel |
| Usuario del picking | La solicita a Soporte IT, que la restablece desde Configuración. Gerencia también puede hacerlo, porque administra los usuarios del picking |

## Sesiones

- **TV y tableta del tablero:** la sesión queda abierta con **cualquier usuario que tenga acceso al módulo de Bodega**.
- Tiempo de expiración de las sesiones: [PENDIENTE] P-07.
- Usuario administrador inicial: [PENDIENTE] P-08.

## Cantidad de usuarios

Según una nota del prototipo de Configuración que se atribuye a INCOVSA; la fuente original no está archivada (P-41).

| Rol | Cantidad |
|---|---|
| Gerencia | 4 |
| Soporte IT | 1 |
| Operativo Facturador | 4 (2 en Quetzaltenango, 1 en Guatemala, 1 en Escuintla) |
| Operativo Bodega | 4 (mismo reparto) |
| Operativo Piloto | [PENDIENTE] P-02 |
