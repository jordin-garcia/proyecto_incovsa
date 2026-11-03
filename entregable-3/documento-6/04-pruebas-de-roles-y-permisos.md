# Pruebas de roles y permisos

El objetivo es comprobar que **un usuario no pueda acceder a funciones que no le corresponden**.

## Modelo de permisos

- Los permisos se asignan **por usuario**, módulo por módulo y acción por acción, con casillas (RN-38).
- Los roles predeterminados **Gerencia** y **Soporte** tienen acceso total. El rol se compara sin importar mayúsculas, espacios ni tildes.
- En el picking, además, cada usuario tiene una o más **sedes** (Quetzaltenango y Guatemala) y solo ve y modifica los datos de esas sedes (RN-17).
- El sitio y el picking tienen **cuentas separadas** (RN-18): una sesión de un sistema no abre el otro.

Cada permiso se verifica **en el servidor**, en cada operación, antes de leer o cambiar datos. Ocultar un botón en la pantalla no basta, porque una persona podría llamar a la operación directamente. Una regla de Semgrep hace fallar la CI si alguna operación del servidor no verifica el permiso.

## Casos probados

Tabla: Pruebas de roles y permisos {#tab:pruebas-permisos}

| Perfil o situación | Qué se intentó | Resultado esperado | Casos | Resultado |
|---|---|---|---|---|
| Sin sesión | Abrir el panel o un módulo del picking por su dirección | Redirige a `/acceso` | CP-81 | Aprobado |
| Sesión del sitio | Abrir el picking | Redirige a `/acceso`; la cookie de un sistema no sirve en el otro | CP-81 | Aprobado |
| Usuario sin el permiso del módulo | Abrir el módulo por su dirección | «Sin acceso a este módulo» y el botón «Ir a mi módulo» | CP-81, CP-42 | Aprobado; CP-42 en parte |
| Usuario sin el permiso del módulo | Llamar directamente a la operación del servidor (carga del archivo de Odoo, crear un producto público) | Se rechaza en el servidor | CP-42, CP-54 | Aprobado |
| Usuarios con permisos parciales | Abrir el menú | Solo ve sus módulos | CP-80, CP-82 | Aprobado |
| Usuario de una sola sede | Pedir o modificar datos de la otra sede, desde la pantalla y alterando la petición | No ve ni modifica nada de la otra sede, tampoco en el tiempo real ni en las exportaciones | CP-43, CP-70, CP-108 | Aprobado |
| Rol « gerencia » sin casillas marcadas | Entrar a todos los módulos y sedes | Acceso total | CP-44 | Aprobado |
| Usuario con el permiso de camiones, sin acceso total | Administrar usuarios | No ve la pestaña y el servidor rechaza sus operaciones | CP-83 | Aprobado |
| Piloto | Ver y entregar rutas | Solo ve sus rutas de su sede y no puede entregar una ruta ajena | CP-84 | Aprobado |
| Usuario con solo el permiso de ver documentos | Descargar un documento interno | Solo ve la vista previa, sin opción de descargar | CP-57, CP-82 | Aprobado |
| Usuario desactivado o eliminado | Iniciar sesión | No puede entrar y su sesión abierta se cierra | CP-49, CP-74 | Aprobado |

Todos los perfiles se prueban con los usuarios de demostración, cuyos permisos y sedes son los del prototipo aprobado. Las capturas de pantalla «Sin acceso» y de los usuarios con permisos están en el Anexo G.

## Revisión manual

Además de las pruebas automatizadas, la revisión de seguridad de JG-15 leyó las **82 operaciones del servidor**, 44 del picking y 38 del sitio y el panel. Comprobó que todas verifican la sesión, el permiso y la sede antes de leer o cambiar datos. Encontró un solo error de permisos o de sede: la exportación de reportes usaba la primera sede del usuario y no la elegida (R-P01, INC-29). Se corrigió en JG-26 y ahora lo comprueba el caso CP-70. Los otros cuatro hallazgos de esa revisión no son de permisos; están en la sección 13.

## Resultado

**Aprobado.** Ningún perfil pudo acceder a una función ni a datos que no le corresponden. Queda una mejora pendiente: pedir la contraseña propia antes de restablecer la de Gerencia o Soporte (CP-111, tarea CE-14).
