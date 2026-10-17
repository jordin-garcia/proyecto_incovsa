# Módulo `bitacora`

**Dueño:** Jordin García (`jordin`), según `plan/convenciones.md` §2.

`registrarBitacora`: registro de las operaciones en la misma transacción que las hace (RN-39). No se edita ni se borra.

Especificación: `specs/12-reglas-de-negocio.md`, RN-39; `specs/16`, decisión 5.

Archivos: `servicio.ts` (reglas de negocio), `esquemas.ts` (Zod), `acciones.ts` (acciones del servidor) y sus pruebas `*.test.ts` (`plan/convenciones.md` §4.1).
