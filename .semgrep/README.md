# Controles de INCOVSA (JG-11)

`semgrep scan --error --strict --config .semgrep/seguridad.yml --config p/typescript --config p/nextjs src`

La regla de permisos se aplica a las operaciones exportadas de todos los módulos con la directiva inicial `"use server"` y a los manejadores `src/app/**/route.ts`, incluidos los endpoints multipart del panel; constantes como `runtime` no son operaciones. La acción pública del paso del usuario está fuera de `src/modulos` y conserva los controles de JG-06. Las únicas rutas excluidas son Better Auth y la ruta exacta de imágenes públicas de disco de la decisión 78 (404 en producción). No se excluye `api/imagenes/publicar`.

En `src/modulos` hay una sola excepción: `src/modulos/solicitudes/recepcion-publica.ts`, la recepción pública del formulario de Contacto (RF-SW-06, DM-08), que no puede exigir sesión. La regla de permisos excluye esa ruta exacta y la regla `incovsa-recepcion-publica` falla si el archivo exporta algo distinto de la función `enviarSolicitud` (otras funciones, constantes, clases, reexportaciones o una exportación por defecto) o si el cuerpo de `enviarSolicitud` deja de ser exactamente la llamada a `crearSolicitud` con su `try`/`catch`. La misma acción en cualquier otro archivo sigue exigiendo `exigirPermiso`.

Los casos positivos y negativos se ejercitan con el escáner real desde `scripts/probar-semgrep.mjs`: funciones, flechas, una acción protegida junto a otra desprotegida y las API prohibidas. El PR de prueba de JG-11 verifica además el rechazo por GitHub Actions.
