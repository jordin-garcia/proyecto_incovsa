# Módulo `permisos`

**Dueño:** Jordin García (`jordin`), según `plan/convenciones.md` §2.

`exigirPermiso`: verifica la sesión, el permiso y la sede en cada operación del servidor. Gerencia y Soporte tienen acceso total por su rol.

Especificación: `specs/03-roles-y-accesos.md`; `specs/16`, "Autorización en el servidor" y decisiones 7 y 55.

Archivos: `servicio.ts` (reglas de negocio), `esquemas.ts` (Zod), `acciones.ts` (acciones del servidor) y sus pruebas `*.test.ts` (`plan/convenciones.md` §4.1).
