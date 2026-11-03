# Módulo `documentos`

**Dueño:** Daniela Marín (`daniela`), según `plan/convenciones.md` §2.

Documentación interna: productos documentados con sus enlaces de Google Drive (FT, HS y COA), y la vista previa y la descarga según los permisos.

Especificación: `specs/05-sitio-web.md`, "Documentación interna"; `specs/16`, decisión 21.

Archivos: `servicio.ts` (reglas de negocio), `esquemas.ts` (Zod), `acciones.ts` (acciones del servidor) y sus pruebas `*.test.ts` (`plan/convenciones.md` §4.1).

## Uso (DM-10)

- `leerDocumentos(sesion, busqueda?)` exige cualquiera de los tres permisos de documentación. Devuelve metadatos del producto y documentos FT/HS/COA. Cada documento contiene `vistaPrevia` solamente con `sit.doc.ver` y `descarga` solamente con `sit.doc.descargar`. Los enlaces editables y la lista completa de países solo se devuelven con `sit.doc.gestionar`.
- `guardar(entrada)` y `eliminar({ id })` son acciones de servidor con sesión real, permiso de gestión y validación Zod. Revalidan el panel y su Resumen. La página es `/panel/documentos`.
- `guardarProducto` y `eliminarProducto` escriben el producto y la bitácora en una transacción. Las altas y ediciones se serializan con un bloqueo transaccional de PostgreSQL para evitar duplicados normalizados (acentos, mayúsculas y espacios extremos), como el prototipo, sin modificar el esquema.
- Los enlaces aceptados son HTTPS de `drive.google.com` o `docs.google.com`, con identificador de archivo válido. No se solicitan archivos a Google desde el servidor ni se guardan PDF. P-92 sigue correspondiendo a la configuración que haga INCOVSA en Drive.
- El sitio no restringe estos productos por sede: RN-17 corresponde al picking (`specs/03`). Las pruebas de acciones cubren sesión ausente, permiso ausente y sesión del sistema incorrecto.

Pruebas: `npm test -- src/modulos/documentos/servicio.test.ts` y `npm run e2e -- pruebas-e2e/panel/documentos.spec.ts`. La prueba del iframe intercepta solamente la respuesta externa de Drive; comprueba la CSP real, la dirección generada y el contenido efectivamente cargado dentro del marco. No necesita credenciales de Google ni documentos de la empresa.
