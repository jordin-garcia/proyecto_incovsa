---
id: JG-10
titulo: Tiempo real con SSE para Bodega, Facturación y Ruta
persona: jordin
responsable: Jordin García
hito: E3
prioridad: P1
estado: hecha
depende_de: [JG-07]
programada: 2026-10-20
requisitos: [RNF-13, RF-SL-20, RF-SL-23]
pantallas: []
---

# JG-10 · Tiempo real con SSE para Bodega, Facturación y Ruta

**Responsable:** Jordin García · **Hito:** E3 · **Prioridad:** P1 · **Programada:** mar 20/10 · **Depende de:** JG-07

## Objetivo
Reemplazar el interior de `avisarCambio` y `useCambiosDeSede` (JG-07) por **avisos enviados por el servidor (SSE)**, para que el marcado, la prioridad y los cambios de Facturación se vean al instante en todas las pantallas de la sede, sin cambiar la interfaz que ya usan los módulos (specs/16, decisiones 10, 39 y 40).

## Contexto que debes leer
- `specs/15`: RNF-13; `specs/07` §"Prioridad" y §"Marcado de preparación"; `specs/06` §"Lado izquierdo" (dos facturadores)
- `specs/16`: decisiones 10, 27 (un solo proceso), 39 y 40
- `## Resultado` de JG-07
- Context7: Next.js 16 (rutas de la API con *streaming*, `runtime = "nodejs"`), `EventSource`

## Qué hacer
1. `src/app/api/tiempo-real/route.ts`: conexión SSE autenticada (sesión del picking y sede permitida, `exigirPermiso` con el permiso del módulo que la pide), que envía "cambió la sede X" cuando ocurre un cambio de esa sede y un latido cada 25 segundos.
2. `src/modulos/tiempo-real/servidor.ts` › `avisarCambio(sede)`: publica el aviso en memoria (un solo proceso, decisión 27) a las conexiones de esa sede. Si algún día hay varios procesos, se cambiará a `LISTEN/NOTIFY` (decisión 10): déjalo anotado en el código.
3. `src/modulos/tiempo-real/cliente.ts` › `useCambiosDeSede(sede)`: abre la conexión SSE y llama a `router.refresh()` con cada aviso; si la conexión se cae, consulta cada `TIEMPO_REAL_CONSULTA_MS` (5000) hasta reconectarse (decisión 40). La interfaz no cambia.
4. El indicador "En vivo" del armazón (JG-05) refleja si la conexión está activa.

## Archivos que creas o modificas
- `src/app/api/tiempo-real/route.ts` (crear)
- `src/modulos/tiempo-real/**` (modificar)
- `src/componentes/comunes/armazon/**` (indicador "En vivo") (modificar)
- `pruebas-e2e/flujo/tiempo-real.spec.ts` (crear)

## Criterios de aceptación
1. **RNF-13:** con la misma ruta abierta en dos navegadores, una acción que llama a `avisarCambio(sede)` actualiza la otra pantalla en menos de 2 segundos, sin recargar.
2. Un usuario sin acceso a la sede no recibe sus avisos; sin sesión, la conexión se rechaza.
3. Si se corta la conexión, la pantalla sigue actualizándose cada 5 segundos y se reconecta sola.
4. El indicador "En vivo" se apaga sin conexión y se enciende al reconectarse.

## Pruebas obligatorias
- Unitarias de la publicación por sede
- `pruebas-e2e/flujo/tiempo-real.spec.ts` (criterios 1 y 3, con dos contextos de navegador)

## Verificación
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/flujo/tiempo-real.spec.ts
```

## Fuera de alcance
- Llamar a `avisarCambio` desde cada acción: lo hacen las tareas de cada módulo (JM-04 y JC-05).

## Notas
- Caddy no debe almacenar en búfer la respuesta SSE (decisión 29): avisa a Carlos en tu bitácora (**CE-05:**) si hace falta alguna directiva en el `Caddyfile`.

## Resultado

Implementado y verificado el 21/10/2026. El servidor publica avisos mínimos por sede en un canal compartido entre los bundles de Next.js, dentro del único proceso previsto por las decisiones 10 y 27. La ruta `GET /api/tiempo-real?sede=1&modulo=bodega` valida con Zod y exige sesión del picking, permiso del módulo y sede autorizada. Revalida la autorización antes de cada aviso o latido de 25 segundos y libera los recursos al cerrar, abortar o detectar un consumidor lento. La respuesta desactiva caché y búfer; el Caddy existente ya incluye `flush_interval -1`.

### Cómo usarlo

- Las acciones conservan `avisarCambio(sedeId)` desde `@/modulos/tiempo-real/servidor`, después de confirmar la transacción. No se añadieron llamadas en acciones de otros módulos.
- El cliente conserva `useCambiosDeSede(sedeId | null)` desde `@/modulos/tiempo-real/cliente`; `null` pausa la suscripción al cambiar de sede. El armazón del picking ya lo llama: los módulos contenidos en él no necesitan otra suscripción. Se retiró la llamada redundante de Bodega.
- El transporte se comparte por sede y módulo y refresca al recibir avisos. Sin SSE consulta e intenta reconectar cada `TIEMPO_REAL_CONSULTA_MS` (5000); al reconectar recupera los cambios del corte. Las pestañas ocultas aplazan el refresco hasta mostrarse.
- `useConexionEnVivo(sedeId | null)` observa esa conexión sin abrir otra. El indicador conserva «En vivo» y los colores del prototipo al conectar; sin conexión usa grises existentes y detiene el latido.
- Para los E2E, ejecutar primero `npm run build` y luego `npm run e2e -- pruebas-e2e/flujo/tiempo-real.spec.ts`, con la base de demostración y `CLAVE_DEMO`. El fixture sirve el artefacto standalone en un puerto por trabajador y lo cierra al terminar. El README del módulo explica el transporte y la medición desde el instante real de publicación.

Archivos principales: `src/app/api/tiempo-real/route.ts`, `src/modulos/tiempo-real/`, `src/componentes/comunes/armazon/` y `pruebas-e2e/flujo/`. La verificación general también corrigió las referencias ARIA de dnd-kit en Facturación, dos precondiciones de hidratación en pruebas existentes y la distribución de las comprobaciones de carga de Facturación entre los tres proyectos. Se conservaron todas las aserciones, capturas y límites; las auditorías de carga aumentaron de siete a nueve. No se añadieron dependencias ni cambios de esquema, migraciones o decisiones de producto.

### Verificación

`npm run verificar`: formato, lint, tipos y 302 pruebas aprobados (33 archivos). `npm run build`: compilación aprobada. Los nueve E2E de tiempo real pasaron de forma dirigida y dentro de la batería completa: **204 pruebas aprobadas**, sin fallos ni omisiones, con axe. Los nueve avisos SSE medidos tardaron entre 515 y 1831 ms desde `avisarCambio` al DOM remoto; el respaldo tardó entre 4782 y 4951 ms. El plan contiene 63 tareas válidas y `git diff --check` no tiene errores.

El recorrido con Playwright y next-devtools no encontró errores de compilación ni ejecución en la navegación normal. Hay once capturas comparativas y de estados en los tres tamaños y revisión independiente sin hallazgos de corrección. Evidencia, mediciones, correcciones y revisión: [JG-10](../evidencias/JG-10/README.md).

### Correcciones de la auditoría (2026-10-26)

La corrigió el coordinador en JG-25.

- **H-84:** el primer arranque en frío del servidor de producción de `pruebas-e2e/flujo/servidor-produccion.ts` superaba a menudo los 20 s en Windows. Ahora espera el servidor en `127.0.0.1`, donde escucha (en Windows `localhost` puede resolver primero a `::1`), con 10 s por intento y hasta 90 s en total, y el arranque tiene su propio límite de 120 s, aparte del de cada prueba. Las direcciones que usan las pruebas no cambian. `pruebas-e2e/flujo` pasó dos veces seguidas, sin reintentos, después de `npm run build` (evidencia en `plan/evidencias/JG-25/README.md`).
