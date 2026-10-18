# Módulo `permisos`

**Dueño:** Jordin García (`jordin`), según `plan/convenciones.md` §2.

`exigirPermiso`: verifica la sesión, el permiso y la sede en cada operación del servidor. Gerencia y Soporte tienen acceso total por su rol.

Especificación: `specs/03-roles-y-accesos.md`; `specs/16`, "Autorización en el servidor" y decisiones 7 y 55.

Archivos: `servicio.ts` (reglas de negocio), `esquemas.ts` (Zod), `acciones.ts` (acciones del servidor) y sus pruebas `*.test.ts` (`plan/convenciones.md` §4.1).

## Uso desde los módulos

`obtenerSesion("sitio" | "picking")`, de `@/lib/sesion`, es la única fuente del usuario, los permisos y las sedes. Nunca se reconstruye la sesión con datos de la petición.

- `servicio.ts`: `exigirPermiso(sesion, codigo, sedeId?)` lanza `ErrorAcceso` (subclase de `ErrorNegocio`) con el mismo mensaje ante cualquier rechazo. También contiene `tienePermiso`, `accesoModulo`, `esPiloto` y `sedesDelUsuario` (asíncrona; consulta todas las sedes para acceso total).
- `sede.ts`: `obtenerSedeDeTrabajo(sesion)` devuelve `{ id, nombre, prefijoOdoo }` o `null`. Valida la cookie en cada petición; si falta o es ajena, devuelve la primera sede asignada. La cookie no concede acceso.
- `navegacion.ts`: reglas de las secciones del panel, módulos del picking y `exigirAccesoPantalla`. Ocultar enlaces no sustituye la autorización de las lecturas y acciones.
- `acciones.ts`: `cambiarSede({ sede: number, modulo })` valida sesión, permiso del módulo y sede antes de escribir una cookie HttpOnly. Solo admite Facturación, Bodega, Ruta y Reportes.
- `pruebas/permisos.ts`: `comprobarRechazosDeAccion` genera los tres casos obligatorios para cada acción. El adaptador del test establece la sesión leída por la acción real; Prisma no se simula. Véase `acciones.test.ts`.

Las consultas de negocio deben incluir la sede autorizada en su `where`, incluso al buscar por ID; todas las actualizaciones y eliminaciones usan esa misma sede. Autorizar la cookie no autoriza un recurso de otra sede.
