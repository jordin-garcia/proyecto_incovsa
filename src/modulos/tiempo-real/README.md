# Módulo `tiempo-real`

**Dueño:** Jordin García (`jordin`), según `plan/convenciones.md` §2.

Avisos de cambios por sede para Facturación, Bodega y Ruta: SSE o, sin conexión, consulta cada `TIEMPO_REAL_CONSULTA_MS`.

Especificación: `specs/16`, decisiones 10 y 40.

Archivos: `servidor.ts` (publicación y transporte), `cliente.ts` (suscripción y estado), `esquemas.ts` (Zod) y sus pruebas `*.test.ts`.

## Interfaces estables (JG-07 y JG-10)

- Servidor: `import { avisarCambio } from "@/modulos/tiempo-real/servidor"; avisarCambio(sedeId);`, solo después de confirmar la transacción. Publica en memoria a las conexiones de esa sede. El registro vive en `globalThis` para compartirlo entre los bundles de acciones y rutas de Next.js. Con varios procesos habría que sustituirlo por `LISTEN/NOTIFY` de PostgreSQL (decisión 10).
- Cliente: `import { useCambiosDeSede } from "@/modulos/tiempo-real/cliente"; useCambiosDeSede(sedeId);`. El módulo se obtiene de la ruta actual. `null` pausa la suscripción. Al desmontar o cambiar de sede o módulo se libera la conexión. Las llamadas repetidas comparten transporte y refresco.
- El armazón del picking ya llama al hook; los módulos contenidos en él no deben montar otra suscripción. Se retiró la llamada redundante de Bodega para que el cambio de sede pueda pausar toda su conexión.
- `useConexionEnVivo(sedeId | null)` observa el transporte existente, sin abrir conexiones; alimenta el indicador del armazón. Sin conexión conserva «En vivo» con colores grises del design system y sin animación; conectado recupera los colores del prototipo.

## Ruta y recuperación

`GET /api/tiempo-real?sede=1&modulo=bodega` valida con Zod la sede y el módulo. Exige una sesión del picking, el permiso del módulo y una sede asignada (todas las existentes para Gerencia y Soporte). Ruta admite `pk.ruta.propias` o `pk.ruta.todas`; Tablero exige `pk.bodega`. Nunca se autoriza con la cookie de sede.

El flujo manda solamente `data: {"sede":1}`, sin datos de negocio, y un comentario de latido cada 25 segundos. Antes de cada aviso o latido vuelve a obtener la sesión y exigir el permiso y la sede; una revocación cierra el flujo. El aborto de la petición, la cancelación del lector y un consumidor lento liberan la suscripción y el temporizador. Las ráfagas de cambios se agrupan mientras se valida la sesión.

El cliente usa `router.refresh()` al recibir el aviso y al conectar, recuperando así los cambios ocurridos durante un corte. Mientras SSE no esté disponible consulta cada `TIEMPO_REAL_CONSULTA_MS` (5000) e intenta reconectar. Las pestañas ocultas aplazan los refrescos hasta volver a mostrarse. Con SSE activo no hay consulta periódica.

La respuesta desactiva caché y búfer (`no-store`, `no-transform`, `X-Accel-Buffering: no`). El `Caddyfile` ya incluye `flush_interval -1`; no requiere cambios para JG-10.
