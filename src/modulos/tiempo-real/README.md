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

El cliente usa `router.refresh()` al recibir el aviso y al conectar, recuperando así los cambios ocurridos durante un corte. Mientras SSE no esté disponible consulta cada `TIEMPO_REAL_CONSULTA_MS` (5000) e intenta reconectar. El evento `offline` del navegador apaga el indicador y cierra el canal aunque todavía no haya llegado un error de SSE; `online` intenta conectar de inmediato. Las pestañas ocultas aplazan los refrescos hasta volver a mostrarse. Con SSE activo no hay consulta periódica.

La respuesta desactiva caché y búfer (`no-store`, `no-transform`, `X-Accel-Buffering: no`). El `Caddyfile` ya incluye `flush_interval -1`; no requiere cambios para JG-10.

## Pruebas de navegador

Ejecute `npm run build` y después `npm run e2e -- pruebas-e2e/flujo/tiempo-real.spec.ts` con la base local de demostración y `CLAVE_DEMO`. El fixture inicia y cierra un servidor standalone por trabajador en `3100 + workerIndex`, prepara sus activos y dirige a él ambos navegadores y las peticiones de seguridad. Simula únicamente la cabecera `X-Real-IP` que añadiría Caddy, sin desactivar seguridad. El servidor de desarrollo habitual queda disponible para las muestras del resto de los E2E.

RNF-13 se mide sobre la compilación de producción desde el instante real de publicación en `avisarCambio`, antes de autorizar y notificar a los consumidores. El canal nativo opcional `incovsa.tiempo-real.cambio` de `node:diagnostics_channel` registra únicamente sede e instante si hay un observador local. El fixture precarga un observador exclusivo de pruebas y recibe ese instante por IPC; no existe una ruta HTTP de diagnóstico y el mensaje SSE conserva solo la sede.

El listener se arma antes del clic y exige un aviso real de esa sede en el servidor del trabajador. Ambos procesos usan el reloj del mismo equipo. El plazo absoluto de 1999 ms no se reinicia al recibir IPC ni la respuesta POST: se observa el estado remoto con el presupuesto restante y se comprueba el total transcurrido. Cada medición queda adjunta al resultado de Playwright. El respaldo conserva su plazo de 10 segundos para observar el intervalo de 5 segundos.
