---
id: JG-10
titulo: Tiempo real con SSE para Bodega, Facturación y Ruta
persona: jordin
responsable: Jordin García
hito: E3
prioridad: P1
estado: pendiente
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

## Avance del 20/10/2026 · verificación pendiente

Implementación en la rama `jordin/JG-10-tiempo-real-sse`: publicación por sede, ruta SSE autenticada y validada con Zod, latidos de 25 segundos, revalidación de sesión/permiso/sede, recuperación por consulta cada 5 segundos e indicador de conexión. Se conservan las interfaces de JG-07. Bodega usa la suscripción del armazón para poder pausarla al cambiar de sede.

Las 16 pruebas del módulo pasaron y la revisión independiente de código no encontró hallazgos. La batería general y los navegadores no han pasado: el equipo está bajo presión de memoria y varias pruebas existentes agotan sus tiempos. **El estado permanece pendiente; no hay PR integrado ni `## Resultado` de cierre.**

La evidencia, los comandos pendientes y los pasos para retomar están en [plan/evidencias/JG-10/verificacion.md](../evidencias/JG-10/verificacion.md).
