# Módulo `odoo`

**Dueño:** José Daniel Cifuentes (`jose-daniel`), según `plan/convenciones.md` §2.

Lectura del archivo .xlsx exportado de Odoo con SheetJS, solo en el servidor y validado con Zod.

Especificación: `specs/06-picking-facturacion.md`; `specs/16`, decisión 12.

Archivos: `servicio.ts` (reglas de negocio), `esquemas.ts` (Zod), `acciones.ts` (acciones del servidor) y sus pruebas `*.test.ts` (`plan/convenciones.md` §4.1).
