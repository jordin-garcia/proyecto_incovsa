# Módulo `almacenamiento`

**Dueño:** Daniela Marín (`daniela`), según `plan/convenciones.md` §2.

Guardado de las imágenes del sitio: valida el formato por su contenido, las vuelve a codificar con sharp y las guarda en disco (desarrollo) o en Cloudflare R2 (producción).

Especificación: `plan/convenciones.md` §4.3; `specs/16`, decisiones 44 y 78.

Archivos: `servicio.ts` (reglas de negocio), `esquemas.ts` (Zod), `acciones.ts` (acciones del servidor) y sus pruebas `*.test.ts` (`plan/convenciones.md` §4.1).
