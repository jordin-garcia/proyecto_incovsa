# Actores y permisos

El acceso vigente no se basa en el rol. Cada usuario tiene permisos por módulo y por acción, marcados con casillas. El rol es un texto libre. Los únicos roles predeterminados son Gerencia y Soporte. El detalle está en `specs/03-roles-y-accesos.md` y en la regla RN-38.

Hay dos administraciones de usuarios y dos inicios de sesión. Una persona puede tener una cuenta en cada sistema con el mismo nombre de usuario (RN-54). Las cuentas de Gerencia y Soporte sirven en los dos sistemas, porque tienen acceso total. El nombre de usuario de esas cuentas no se repite en el otro sistema.

## Roles predeterminados

Tabla: Roles predeterminados {#tab:roles}

| Rol | Acceso |
|---|---|
| Gerencia | Acceso total a picking y a la administración del sitio, en todas las sedes |
| Soporte | El mismo nivel de acceso global que Gerencia, para tareas de mantenimiento |

Fuera de Gerencia y Soporte, el rol no da accesos. La excepción es el texto Piloto (RN-46). Identifica a los pilotos del picking. En Facturación, la lista de pilotos de Envío por camión muestra a los usuarios con rol Piloto que tienen acceso a la sede. En Ruta, un usuario con rol Piloto ve solo sus rutas asignadas.

## Roles que ya no están vigentes

Los roles anteriores dejan de ser roles predeterminados (`specs/03-roles-y-accesos.md`). Se nombran aquí solo como historia del Documento 1 anterior.

En el sitio eran Administrativo, Operativo y Vista general. En el picking eran Operativo Facturador, Operativo Bodega y Operativo Piloto. Las figuras 1 y 2 de este documento no los dibujan como actores actuales. El actor de una función es el usuario que tiene el permiso, o Gerencia, o Soporte, o el rol Piloto cuando la regla lo dice.

## Quién administra a los usuarios

Gerencia y Soporte administran los usuarios. La administración de usuarios no es un permiso que se asigne a otras personas.

Tabla: Dónde se administran los usuarios {#tab:admin-usuarios}

| Sistema | Dónde | Quién |
|---|---|---|
| Sitio web | Opción Usuarios del panel administrativo | Gerencia y Soporte |
| Picking | Pestaña Usuarios del módulo de Configuración | Gerencia y Soporte |

Pueden crear, editar y eliminar usuarios. Al crear un usuario escriben la contraseña. Escriben el rol. Agregan, editan o revocan permisos con casillas. En el picking marcan las sedes. Restablecen la contraseña escribiendo una nueva, solo dentro de la administración de usuarios. No se envía nada por correo (RN-47).

La eliminación es lógica (RF-SL-57). El usuario ya no puede iniciar sesión. Su nombre de usuario queda reservado en su sistema. Se conservan la bitácora y los registros donde aparece.

## Acceso personal

El sitio tiene el botón Acceso personal (RF-SW-09, cambio del 13/10/2026). El orden es usuario, sistema y contraseña.

1. Se pide el nombre de usuario.
2. El sistema lo busca entre las cuentas activas de la administración del sitio y del picking. Si no es usuario de ninguno, muestra que no tiene permisos para acceder y no avanza. Ese paso revela si el nombre existe. Lo pidió la contraparte el 13/10/2026 y el coordinador lo aceptó el 14/10/2026. La consulta cuenta en el límite de intentos por dirección IP y queda en la bitácora.
3. Se elige el sistema. Iniciar sesión en Odoo abre el enlace del ERP, sin intercambio de datos. La URL está pendiente (P-06). Administración del sitio solo se habilita si hay cuenta en el sitio. Sistema de picking solo se habilita si hay cuenta en el picking.
4. Al elegir el sitio o el picking, se pide la contraseña de esa cuenta.

Cerrar sesión lleva a la página de inicio del sitio. El mensaje de una contraseña incorrecta dice usuario o contraseña incorrectos, sin indicar cuál falló.

El inicio de sesión usa nombre de usuario y contraseña, no correo. El correo de la cuenta es opcional. No hay selector de sede al iniciar sesión. Las contraseñas se guardan cifradas con un algoritmo unidireccional. En la aplicación, ese algoritmo es scrypt, el de Better Auth 1.7 (`specs/16-arquitectura-y-tecnologia.md`).

## Catálogo de permisos

Aprobado el 11/10/2026 y ajustado el 14/10/2026. Los permisos del sitio se asignan en la administración del sitio. Los del picking se asignan en Configuración.

Tabla: Permisos del sitio {#tab:permisos-sitio}

| Módulo | Permiso |
|---|---|
| Contenido institucional | Editar portada, logotipos, historia, misión, visión, valores e imágenes |
| Industrias | Editar descripción e imágenes de cada industria |
| Catálogo | Crear, editar y eliminar productos públicos |
| Noticias | Crear, editar y eliminar noticias |
| Información de contacto | Editar los datos de las sedes |
| Solicitudes | Ver la bandeja de solicitudes |
| Solicitudes | Gestionar solicitudes: responsable, comentario y estado |
| Documentación interna | Ver documentos en el navegador |
| Documentación interna | Descargar documentos |
| Documentación interna | Crear, editar y eliminar productos documentados |

El permiso de noticias decía antes Crear, editar, publicar y ocultar noticias. Desde el 15/10/2026 las noticias se eliminan y toda noticia guardada se publica. El permiso de documentos decía antes Subir, reemplazar y eliminar documentos. Desde el 13/10/2026 el sistema guarda enlaces, no archivos.

Tabla: Permisos del picking {#tab:permisos-picking}

| Módulo | Permiso |
|---|---|
| Facturación | Cargar el archivo de Odoo y enviar rutas y pedidos a bodega |
| Bodega | Preparar, priorizar y despachar rutas y pedidos, incluido el tablero |
| Ruta | Ejecutar las rutas asignadas |
| Ruta | Ver todas las rutas |
| Reportes | Consultar y exportar reportes, incluida la bitácora |
| Configuración | Administrar camiones |

El 14/10/2026 se eliminaron los permisos Administrar productos y su Peso de Conversión, y Administrar clientes y sectores. El picking ya no tiene esos catálogos.

## Sedes, sesiones y cantidad de usuarios

Al crear o editar un usuario del picking se marcan las sedes a las que tiene acceso. Puede tener una, varias o todas. Cada usuario ve solo los datos de sus sedes. Gerencia y Soporte tienen acceso a todas. Quien tiene más de una sede elige con cuál trabaja en el selector de la barra superior (RN-17).

La TV y la tableta del tablero quedan con la sesión abierta de cualquier usuario que tenga acceso a Bodega. Cada sistema tiene su propia sesión. Una persona puede estar en el sitio y en el picking a la vez, y cerrar uno no cierra el otro (16/10/2026).

La sesión vence por falta de uso y se renueva mientras se usa. Mientras INCOVSA no defina el tiempo (P-07), son 7 días, renovados con el uso una vez al día. Al eliminar o desactivar un usuario, o al restablecer su contraseña, se cierran al instante todas sus sesiones.

No hay un número fijo de usuarios. Los nombres de los pilotos siguen pendientes (P-02). Quién será el administrador inicial está pendiente (P-08). Se crea con el comando `npm run crear-admin`, que pide el nombre de usuario y la contraseña en la terminal. Ninguna credencial queda en el repositorio ni en la semilla.

## Bitácora de los accesos

La bitácora registra las acciones de cada usuario, incluidos los inicios de sesión y los intentos fallidos (RN-39). Se consulta en la pestaña Bitácora de Reportes. No registra el marcado ni la prioridad de Bodega, ni el orden de las filas de Ruta antes de entregar.
