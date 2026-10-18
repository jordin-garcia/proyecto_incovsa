# Verificación de JG-07 · 18/10/2026

Entorno local desechable: PostgreSQL 18.6, escuchando solo en `127.0.0.1:55437`, con dos bases distintas (`incovsa_jg07` e `incovsa_jg07_pruebas`). No se usaron datos ni credenciales de INCOVSA ni se modificaron bases existentes. Las variables se proporcionaron únicamente al proceso; no se leyó ni creó ningún archivo `.env`.

| Comprobación | Resultado |
|---|---|
| Identidad y herramientas | Git y GitHub CLI: `jordin-garcia`; Context7, Playwright, next-devtools y shadcn disponibles y usados |
| `npm ci` | 687 paquetes; 0 vulnerabilidades; cliente Prisma generado |
| `npm run db:aplicar` | Dos migraciones aplicadas desde cero a la base desechable de desarrollo |
| `npm run db:semilla` y `npm run semilla:demo` | Semilla base, 11 cuentas de ejemplo, 3 camiones y 28 productos de prueba |
| Fase roja | Las tres suites nuevas rechazaron la ausencia de `permisos/servicio`, `permisos/acciones` y `tiempo-real/cliente` |
| `npm run verificar` | Formato, lint y tipos aprobados; **14 archivos y 129 pruebas aprobadas**; Vitest: 85,72 s |
| `npm run build` | Compilación y TypeScript aprobados; rutas del panel y del picking dinámicas; proxy generado; no requirió secretos de producción |
| `node scripts/tareas.mjs --validar` | Plan válido: 62 tareas |
| `npm run e2e -- --workers=1` | **93 pruebas aprobadas**, ninguna omitida; teléfono, tableta y escritorio, con axe; 8,3 minutos |
| Comparación visual | 120 PNG en 390, 768 y 1440 px: ocho combinaciones de cuenta/sistema autorizadas y dos estados de acceso denegado; app y prototipo, menú normal y abierto/reducido |
| next-devtools `get_errors`, puerto 3000 | `configErrors: []`, `sessionErrors: []`, con una sesión real en Bodega denegada |

## Cobertura

- RN-38: Gerencia y Soporte sin casillas, normalización de rol, todos los módulos y las tres sedes; usuario facturador limitado a su permiso; separación de sesiones por sistema.
- RN-17/RF-SL-66: sede ajena rechazada, cookie manipulada ignorada, retirada de una sede aplicada en la siguiente petición, selector persistente y acción real retenida para comprobar su estado pendiente.
- RNF-04: error uniforme sin sesión, sin permiso, de otro sistema y de otra sede; primera barrera con la cookie del sistema correcto, sesión inválida y reenvío de cookies renovadas.
- RN-46: Piloto normalizado y ausencia de privilegios por un rol distinto.
- RF-SW-25/RF-SL-55: menús de las seis cuentas solicitadas; `ejemplo.03` y Gerencia en ambos sistemas; Usuarios solo para acceso total y Tablero con Bodega.
- RNF-13: intervalo de 5000 ms, pestaña oculta, desmontaje y pausa con sede `null` durante el cambio.
- Las pruebas existentes de componentes conservan sus aserciones y se ejecutan en las muestras disponibles únicamente en desarrollo.

## Correcciones durante la verificación

- `npm ci` encontró un archivo de SWC bloqueado por el servidor de desarrollo anterior. Se detuvo ese servidor, se completó la instalación y se volvió a abrir la aplicación.
- La primera pasada completa con varias cargas simultáneas agotó tiempos en tres pruebas existentes de autenticación. La verificación se repitió con el servidor de desarrollo detenido: las 129 pruebas pasaron sin cambiar tiempos, exclusiones ni aserciones.
- La prueba de sede detectó que el selector podía volver a la sede anterior. El cambio se ejecuta en una transición, pausa la consulta periódica, deshabilita temporalmente el selector y pide el estado actualizado al terminar. La prueba espera la hidratación y retiene la petición real para verificar el estado pendiente; conserva las aserciones de persistencia tras recarga y navegación.
- La comparación visual corrigió el centrado y color del candado y los márgenes de la pantalla `sinAcceso`. Las capturas desactivan las animaciones para mostrar el estado final de los menús.

No se agregó ninguna dependencia ni se redujeron pruebas o verificaciones.
