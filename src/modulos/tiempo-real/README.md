# Módulo `tiempo-real`

**Dueño:** Jordin García (`jordin`), según `plan/convenciones.md` §2.

Avisos de cambios por sede para Facturación, Bodega y Ruta: SSE o, sin conexión, consulta cada `TIEMPO_REAL_CONSULTA_MS`.

Especificación: `specs/16`, decisiones 10 y 40.

Archivos: `servicio.ts` (reglas de negocio), `esquemas.ts` (Zod), `acciones.ts` (acciones del servidor) y sus pruebas `*.test.ts` (`plan/convenciones.md` §4.1).

## Interfaz inicial (JG-07)

- Servidor: `import { avisarCambio } from "@/modulos/tiempo-real/servidor"; avisarCambio(sedeId);`, solo después de confirmar la transacción. Por ahora no hace nada.
- Cliente: `import { useCambiosDeSede } from "@/modulos/tiempo-real/cliente"; useCambiosDeSede(sedeId);`. Llama a `router.refresh()` cada `TIEMPO_REAL_CONSULTA_MS` (5000), solo con la pestaña visible. `null` desactiva la consulta. Limpia el intervalo al desmontar o cambiar de sede.
- El armazón del picking ya llama al hook; los módulos contenidos en él no deben montar otro intervalo.

JG-10 cambia el interior de estas dos funciones por SSE y conserva sus firmas.
